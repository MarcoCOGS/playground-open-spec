import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'skills');

const TARGETS = [
  '.agents/skills',
  '.claude/skills',
  '.kiro/skills',
  '.opencode/skills',
];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!existsSync(SOURCE_DIR)) {
  fail('No existe la carpeta skills/.');
}

const skills = readdirSync(SOURCE_DIR).filter((name) => {
  const skillPath = path.join(SOURCE_DIR, name);

  return (
    statSync(skillPath).isDirectory() &&
    existsSync(path.join(skillPath, 'SKILL.md'))
  );
});

if (skills.length === 0) {
  console.log('No se encontraron skills propios para sincronizar.');
  process.exit(0);
}

console.log('Sincronizando skills...\n');

for (const target of TARGETS) {
  const targetRoot = path.join(ROOT, target);

  mkdirSync(targetRoot, { recursive: true });

  for (const skill of skills) {
    const source = path.join(SOURCE_DIR, skill);
    const destination = path.join(targetRoot, skill);

    // Solo reemplaza skills que existen en skills/.
    // No toca openspec-* ni otros skills administrados externamente.
    if (existsSync(destination)) {
      rmSync(destination, {
        recursive: true,
        force: true,
      });
    }

    cpSync(source, destination, {
      recursive: true,
    });

    console.log(`✓ ${skill} → ${target}/${skill}`);
  }
}

console.log('\n✓ Skills sincronizados correctamente.');