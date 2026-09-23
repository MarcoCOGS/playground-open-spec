import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARCHIVE_DIR = path.join(ROOT, 'openspec', 'changes', 'archive');

function git(args, { allowFailure = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    if (allowFailure) {
      return '';
    }

    throw error;
  }
}

function gitLines(args) {
  const output = git(args, { allowFailure: true });

  if (!output) {
    return [];
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function gitRefExists(ref) {
  return Boolean(
    git(['rev-parse', '--verify', '--quiet', ref], {
      allowFailure: true,
    }),
  );
}

function normalizePath(value) {
  return value
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .trim();
}

function toRepoRelativePath(absolutePath) {
  return normalizePath(path.relative(ROOT, absolutePath));
}

function findProposalFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const results = [];

  for (const entry of readdirSync(directory)) {
    const absolutePath = path.join(directory, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      results.push(...findProposalFiles(absolutePath));
      continue;
    }

    if (entry === 'proposal.md') {
      results.push(absolutePath);
    }
  }

  return results;
}

function looksLikeFilePath(value) {
  return (
    value.includes('/') ||
    /\.(ts|tsx|js|jsx|mjs|cjs|json|yaml|yml|md)$/i.test(value)
  );
}

function parseAffectedCode(proposalPath) {
  const content = readFileSync(proposalPath, 'utf8');
  const lines = content.split(/\r?\n/);

  const affectedCode = [];

  let insideSection = false;
  let currentEntry;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^###\s+Affected code\s*$/i.test(trimmed)) {
      insideSection = true;
      currentEntry = undefined;
      continue;
    }

    if (insideSection && /^#{1,3}\s+/.test(trimmed)) {
      break;
    }

    if (!insideSection) {
      continue;
    }

    const bulletMatch = line.match(/^(\s*)-\s+(.+)$/);

    if (!bulletMatch) {
      continue;
    }

    const indentation = bulletMatch[1].length;
    const body = bulletMatch[2];

    const values = [...body.matchAll(/`([^`]+)`/g)].map((match) =>
      match[1].trim(),
    );

    if (values.length === 0) {
      continue;
    }

    if (indentation === 0 && looksLikeFilePath(values[0])) {
      currentEntry = {
        path: normalizePath(values[0]),
        symbols: values.slice(1),
      };

      affectedCode.push(currentEntry);
      continue;
    }

    if (indentation > 0 && currentEntry) {
      currentEntry.symbols.push(...values);
    }
  }

  return affectedCode;
}

function getRequirementInfo(proposalPath) {
  const changeDirectory = path.basename(path.dirname(proposalPath));
  const reqMatch = changeDirectory.match(/req-\d+/i);

  return {
    requirementId: reqMatch
      ? reqMatch[0].toUpperCase()
      : changeDirectory,
    changeDirectory,
  };
}

/**
 * Obtiene el commit de la rama actual donde apareció por primera vez
 * el proposal dentro de openspec/changes/archive/.
 *
 * Ese commit se considera el checkpoint inicial del REQ.
 */
function getArchiveCheckpoint(proposalPath) {
  const relativePath = toRepoRelativePath(proposalPath);

  const commits = gitLines([
    'rev-list',
    '--reverse',
    'HEAD',
    '--',
    relativePath,
  ]);

  for (const commit of commits) {
    const existsAtCommit = git(
      ['cat-file', '-e', `${commit}:${relativePath}`],
      { allowFailure: true },
    );

    // cat-file -e no imprime nada cuando funciona,
    // por eso verificamos directamente el exit code de otra forma.
    try {
      execFileSync(
        'git',
        ['cat-file', '-e', `${commit}:${relativePath}`],
        {
          cwd: ROOT,
          stdio: 'ignore',
        },
      );

      return commit;
    } catch {
      // Continuar buscando.
    }
  }

  return undefined;
}

function addNameStatusFiles(target, lines) {
  for (const line of lines) {
    const parts = line.split('\t');

    if (parts.length < 2) {
      continue;
    }

    const status = parts[0];

    // Rename / Copy:
    // R100 old-path new-path
    if (
      (status.startsWith('R') || status.startsWith('C')) &&
      parts.length >= 3
    ) {
      target.add(normalizePath(parts[1]));
      target.add(normalizePath(parts[2]));
      continue;
    }

    target.add(normalizePath(parts[1]));
  }
}

/**
 * Obtiene todo lo modificado DESPUÉS del checkpoint hasta el estado actual
 * de la rama.
 *
 * Incluye:
 * - commits posteriores al checkpoint;
 * - cambios staged;
 * - cambios unstaged;
 * - archivos untracked.
 */
function getChangedFilesSince(checkpoint) {
  const changed = new Set();

  // Historial confirmado después del checkpoint.
  addNameStatusFiles(
    changed,
    gitLines([
      'diff',
      '--name-status',
      '--find-renames',
      `${checkpoint}..HEAD`,
    ]),
  );

  // Cambios locales todavía no committeados.
  addNameStatusFiles(
    changed,
    gitLines([
      'diff',
      '--name-status',
      '--find-renames',
      'HEAD',
    ]),
  );

  // Archivos nuevos todavía no trackeados.
  for (const file of gitLines([
    'ls-files',
    '--others',
    '--exclude-standard',
  ])) {
    changed.add(normalizePath(file));
  }

  return changed;
}

function shortCommit(commit) {
  return git(['rev-parse', '--short', commit]);
}

function main() {
  if (!gitRefExists('HEAD')) {
    console.error('✗ No se encontró un repositorio Git con commits.');
    process.exitCode = 1;
    return;
  }

  const branch = git(['branch', '--show-current'], {
    allowFailure: true,
  });

  const head = git(['rev-parse', 'HEAD']);
  const proposalFiles = findProposalFiles(ARCHIVE_DIR);

  console.log('');
  console.log('OpenSpec drift check');
  console.log('--------------------');
  console.log(`Rama: ${branch || '(detached HEAD)'}`);
  console.log(`HEAD: ${shortCommit(head)}`);
  console.log('');

  if (proposalFiles.length === 0) {
    console.log('✓ No existen requirements archivados para analizar.');
    return;
  }

  const findings = [];
  const withoutAffectedCode = [];
  const withoutCheckpoint = [];
  let checkedRequirements = 0;

  for (const proposalPath of proposalFiles) {
    const requirement = getRequirementInfo(proposalPath);
    const affectedCode = parseAffectedCode(proposalPath);

    if (affectedCode.length === 0) {
      withoutAffectedCode.push(requirement);
      continue;
    }

    const checkpoint = getArchiveCheckpoint(proposalPath);

    if (!checkpoint) {
      withoutCheckpoint.push(requirement);
      continue;
    }

    checkedRequirements += 1;

    const changedFiles = getChangedFilesSince(checkpoint);

    if (changedFiles.size === 0) {
      continue;
    }

    const matches = affectedCode.filter((entry) =>
      changedFiles.has(entry.path),
    );

    if (matches.length === 0) {
      continue;
    }

    findings.push({
      ...requirement,
      checkpoint,
      matches,
    });
  }

  console.log(`Requirements analizados: ${checkedRequirements}`);

  if (withoutAffectedCode.length > 0) {
    console.log(
      `Sin "Affected code": ${withoutAffectedCode.length}`,
    );
  }

  if (withoutCheckpoint.length > 0) {
    console.log(
      `Sin checkpoint Git: ${withoutCheckpoint.length}`,
    );
  }

  console.log('');

  if (findings.length === 0) {
    console.log(
      '✓ No se detectó posible drift en los requirements archivados.',
    );

    if (withoutAffectedCode.length > 0) {
      console.log('');
      console.log(
        '⚠ Existen requirements archivados sin "Affected code"; no pueden analizarse automáticamente.',
      );
    }

    if (withoutCheckpoint.length > 0) {
      console.log('');
      console.log(
        '⚠ Existen requirements cuyo archive todavía no está registrado en el historial Git de esta rama.',
      );
    }

    return;
  }

  console.log('⚠ Posible drift detectado');
  console.log('');

  for (const finding of findings) {
    console.log(
      `${finding.requirementId} (${finding.changeDirectory})`,
    );
    console.log(
      `  Checkpoint: ${shortCommit(finding.checkpoint)}`,
    );

    for (const match of finding.matches) {
      console.log(`  ${match.path}`);

      for (const symbol of match.symbols) {
        console.log(`    ↳ ${symbol}`);
      }
    }

    console.log('');
  }

  console.log(
    'Los resultados son candidatos. Usa el skill check-drift + Serena para determinar si existe impacto semántico real.',
  );
}

main();