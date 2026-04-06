/**
 * Renames project and package identifiers across repository source and config files.
 *
 * Process:
 * 1) Resolve the repo root and determine the old and new project names.
 * 2) Walk the repository for tracked text files that can contain project identifiers.
 * 3) Replace matching identifiers in each eligible file, with optional dry-run reporting.
 * 4) Summarize the files that changed and any validation failures.
 *
 * Usage:
 *   node scripts/rename-project.js <new-name> [--dry-run] [--debug]
 *   node scripts/rename-project.js <old-name> <new-name> [--dry-run] [--debug]
 *
 * Notes:
 * - When only <new-name> is provided, <old-name> is inferred from root package.json.
 * - `REPO_ROOT` can be set for fixture-based integration tests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = process.env.REPO_ROOT
  ? path.resolve(process.env.REPO_ROOT)
  : path.join(__dirname, '..');

function logDebug(enabled, message) {
  if (!enabled) {
    return;
  }

  console.log(`[debug] ${message}`);
}

const validProjectNamePattern = /^[a-z0-9-]+$/;

const includedExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.md',
]);

const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  '.turbo',
  '.next',
  '.output',
  'dist',
  'lib',
  'coverage',
  'build',
  'out',
]);

const ignoredFileNames = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
]);

function printUsage() {
  console.log('Usage:');
  console.log(
    '  node scripts/rename-project.js <new-name> [--dry-run] [--debug]'
  );
  console.log(
    '  node scripts/rename-project.js <old-name> <new-name> [--dry-run] [--debug]'
  );
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function inferOldProjectName() {
  const rootPackageJsonPath = path.join(repoRoot, 'package.json');
  if (!fs.existsSync(rootPackageJsonPath)) {
    throw new Error(`Root package.json not found: ${rootPackageJsonPath}`);
  }

  const rootPackageJson = readJsonFile(rootPackageJsonPath);
  const inferredName = String(rootPackageJson.name ?? '');

  if (!validProjectNamePattern.test(inferredName)) {
    throw new Error(
      [
        `Unable to infer old project name from package.json name: ${inferredName}`,
        'Pass <old-name> explicitly.',
      ].join(' ')
    );
  }

  return inferredName;
}

function parseCliArgs(args) {
  let dryRun = false;
  let debug = false;
  const positionalArgs = [];

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--debug') {
      debug = true;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positionalArgs.push(arg);
  }

  if (positionalArgs.length < 1 || positionalArgs.length > 2) {
    throw new Error('Expected <new-name> or <old-name> <new-name>');
  }

  const newName =
    positionalArgs.length === 1 ? positionalArgs[0] : positionalArgs[1];
  const oldName =
    positionalArgs.length === 1 ? inferOldProjectName() : positionalArgs[0];

  return { debug, dryRun, newName, oldName };
}

function shouldIncludeFile(fileName) {
  if (ignoredFileNames.has(fileName)) {
    return false;
  }

  if (fileName.endsWith('.gen.ts') || fileName.endsWith('.gen.js')) {
    return false;
  }

  return includedExtensions.has(path.extname(fileName));
}

function walkRepositoryFiles(rootDir, debug) {
  const files = [];

  function walk(currentDir) {
    logDebug(
      debug,
      `Scanning directory ${path.relative(rootDir, currentDir) || '.'}.`
    );
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredDirectories.has(entry.name)) {
        logDebug(
          debug,
          `Skipping ignored directory ${path.relative(rootDir, path.join(currentDir, entry.name))}.`
        );
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        logDebug(
          debug,
          `Skipping non-file entry ${path.relative(rootDir, absolutePath)}.`
        );
        continue;
      }

      if (!shouldIncludeFile(entry.name)) {
        logDebug(
          debug,
          `Skipping ignored file ${path.relative(rootDir, absolutePath)}.`
        );
        continue;
      }

      files.push(absolutePath);
      logDebug(
        debug,
        `Queued candidate file ${path.relative(rootDir, absolutePath)}.`
      );
    }
  }

  walk(rootDir);
  return files;
}

function validateProjectNames(oldName, newName) {
  if (!validProjectNamePattern.test(oldName)) {
    throw new Error(
      'Old project name must contain only lowercase letters, numbers, and hyphens'
    );
  }

  if (!validProjectNamePattern.test(newName)) {
    throw new Error(
      'New project name must contain only lowercase letters, numbers, and hyphens'
    );
  }

  if (oldName === newName) {
    throw new Error('Old and new project names are the same');
  }
}

function countMatches(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function main() {
  console.log('Starting project rename script...\n');

  let parsedArgs;
  try {
    parsedArgs = parseCliArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${String(error.message ?? error)}`);
    printUsage();
    process.exit(1);
  }

  const { oldName, newName, dryRun, debug } = parsedArgs;
  logDebug(
    debug,
    `Resolved repo root to ${repoRoot} from argv ${JSON.stringify(process.argv.slice(2))}.`
  );

  try {
    validateProjectNames(oldName, newName);
  } catch (error) {
    console.error(`Error: ${String(error.message ?? error)}`);
    process.exit(1);
  }

  console.log(`Renaming project from "${oldName}" to "${newName}"`);
  console.log(`Mode: ${dryRun ? 'dry-run' : 'apply'}\n`);
  logDebug(
    debug,
    `Scanning for ${oldName} replacements across extensions ${Array.from(
      includedExtensions
    ).join(', ')}.`
  );

  console.log('Step 1: Scanning repository files...');
  const filesToUpdate = walkRepositoryFiles(repoRoot, debug);
  console.log(`Found ${filesToUpdate.length} files to check\n`);

  const oldNameRegex = new RegExp(
    oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'g'
  );

  console.log('Step 2: Replacing occurrences...');
  let totalReplacements = 0;
  let filesModified = 0;

  for (const filePath of filesToUpdate) {
    const content = fs.readFileSync(filePath, 'utf8');
    const replacementCount = countMatches(content, oldNameRegex);
    const relativePath = path.relative(repoRoot, filePath);

    if (replacementCount === 0) {
      logDebug(debug, `No matches in ${relativePath}; leaving file unchanged.`);
      continue;
    }

    const updatedContent = content.replace(oldNameRegex, newName);

    totalReplacements += replacementCount;
    filesModified += 1;
    logDebug(
      debug,
      `Prepared ${replacementCount} replacement${replacementCount === 1 ? '' : 's'} in ${relativePath}.`
    );

    if (!dryRun) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      logDebug(debug, `Wrote updated file ${relativePath}.`);
    }

    console.log(
      `- ${dryRun ? 'Would update' : 'Updated'} ${relativePath} (${replacementCount} replacement${replacementCount !== 1 ? 's' : ''})`
    );
  }

  if (totalReplacements === 0) {
    console.error(
      `No replacements were made for "${oldName}". Aborting to avoid false-success.`
    );
    process.exit(1);
  }

  console.log('\nRename summary:');
  console.log(
    `- ${dryRun ? 'Would modify' : 'Modified'} ${filesModified} file${filesModified !== 1 ? 's' : ''}`
  );
  console.log(`- Total replacements: ${totalReplacements}`);

  if (dryRun) {
    console.log(
      '\nDry run completed. Re-run without --dry-run to apply changes.'
    );
    return;
  }

  console.log('\nRename completed successfully.');
  console.log('Next steps:');
  console.log('1. Review the changes: git diff');
  console.log('2. Install dependencies: pnpm install');
  console.log('3. Build the project: pnpm build');
}

main();
