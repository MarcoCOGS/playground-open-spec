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

const DEFAULT_BASE_BRANCH = process.env.DRIFT_BASE_BRANCH ?? 'main';

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

function getArgument(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function resolveBaseCommit() {
  const explicitBase = getArgument('--base');

  if (explicitBase) {
    if (!gitRefExists(explicitBase)) {
      throw new Error(`El ref Git "${explicitBase}" no existe.`);
    }

    return explicitBase;
  }

  const currentBranch = git(['branch', '--show-current'], {
    allowFailure: true,
  });

  if (
    currentBranch &&
    currentBranch !== DEFAULT_BASE_BRANCH &&
    gitRefExists(DEFAULT_BASE_BRANCH)
  ) {
    return git([
      'merge-base',
      DEFAULT_BASE_BRANCH,
      'HEAD',
    ]);
  }

  if (gitRefExists('HEAD~1')) {
    return 'HEAD~1';
  }

  return undefined;
}

function getChangedFiles(baseCommit) {
  const changed = new Set();

  for (const file of gitLines([
    'diff',
    '--name-only',
    baseCommit,
  ])) {
    changed.add(normalizePath(file));
  }

  // git diff no incluye archivos nuevos aún no trackeados.
  for (const file of gitLines([
    'ls-files',
    '--others',
    '--exclude-standard',
  ])) {
    changed.add(normalizePath(file));
  }

  return changed;
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
  let currentEntry = undefined;

  for (const line of lines) {
    if (/^###\s+Affected code\s*$/i.test(line.trim())) {
      insideSection = true;
      currentEntry = undefined;
      continue;
    }

    if (
      insideSection &&
      /^#{1,3}\s+/.test(line.trim())
    ) {
      break;
    }

    if (!insideSection) {
      continue;
    }

    const bulletMatch = line.match(
      /^(\s*)-\s+(.+)$/,
    );

    if (!bulletMatch) {
      continue;
    }

    const indentation = bulletMatch[1].length;
    const body = bulletMatch[2];

    const values = [
      ...body.matchAll(/`([^`]+)`/g),
    ].map((match) => match[1].trim());

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
  const changeDirectory = path.basename(
    path.dirname(proposalPath),
  );

  const reqMatch = changeDirectory.match(/req-\d+/i);

  return {
    requirementId: reqMatch
      ? reqMatch[0].toUpperCase()
      : changeDirectory,
    changeDirectory,
  };
}

function main() {
  if (!gitRefExists('HEAD')) {
    console.error(
      'No se encontró un repositorio Git con commits.',
    );
    process.exitCode = 1;
    return;
  }

  const baseCommit = resolveBaseCommit();

  if (!baseCommit) {
    console.log(
      'No existe suficiente historial Git para comprobar drift.',
    );
    return;
  }

  const changedFiles = getChangedFiles(baseCommit);

  console.log('');
  console.log('OpenSpec drift check');
  console.log('--------------------');
  console.log(`Base Git: ${baseCommit}`);
  console.log(`HEAD:     ${git(['rev-parse', '--short', 'HEAD'])}`);
  console.log(
    `Archivos modificados: ${changedFiles.size}`,
  );
  console.log('');

  if (changedFiles.size === 0) {
    console.log('✓ No hay cambios para analizar.');
    return;
  }

  const proposalFiles = findProposalFiles(ARCHIVE_DIR);

  if (proposalFiles.length === 0) {
    console.log(
      '✓ No existen changes archivados con los que comparar.',
    );
    return;
  }

  const findings = [];

  for (const proposalPath of proposalFiles) {
    const affectedCode = parseAffectedCode(proposalPath);

    const matches = affectedCode.filter((entry) =>
      changedFiles.has(entry.path),
    );

    if (matches.length === 0) {
      continue;
    }

    findings.push({
      ...getRequirementInfo(proposalPath),
      matches,
    });
  }

  if (findings.length === 0) {
    console.log(
      '✓ Ningún archivo modificado coincide con Affected code de requirements archivados.',
    );
    return;
  }

  console.log('⚠ Posible drift detectado');
  console.log('');

  for (const finding of findings) {
    console.log(
      `${finding.requirementId} (${finding.changeDirectory})`,
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
    'Estos requirements requieren análisis semántico antes de concluir que existe drift real.',
  );
}

main();