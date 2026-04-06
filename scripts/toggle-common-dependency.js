/**
 * Switches a package manifest between workspace and packed-tgz common dependencies.
 *
 * Process:
 * 1) Resolve the repo root, target package.json path, and requested dependency mode.
 * 2) Read the common package metadata and derive the workspace and tgz dependency references.
 * 3) Rewrite the matching dependency entry in the target manifest.
 * 4) Save the updated manifest and print the selected dependency mode.
 *
 * Usage:
 *   node scripts/toggle-common-dependency.js <package-json-path> --to=tgz [--debug]
 *   node scripts/toggle-common-dependency.js <package-json-path> --to=workspace [--debug]
 *
 * Notes:
 * - `<package-json-path>` defaults to repo root package.json.
 * - `--to` is required for deterministic behavior.
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

function printUsage() {
  console.log('Usage:');
  console.log(
    '  node scripts/toggle-common-dependency.js <package-json-path> --to=tgz [--debug]'
  );
  console.log(
    '  node scripts/toggle-common-dependency.js <package-json-path> --to=workspace [--debug]'
  );
}

function parseCliArgs(args) {
  let targetArg;
  let mode;
  let debug = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--debug') {
      debug = true;
      continue;
    }

    if (arg.startsWith('--to=')) {
      mode = arg.split('=')[1];
      continue;
    }

    if (arg === '--to') {
      mode = args[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (targetArg) {
      throw new Error('Only one package.json path argument is allowed');
    }

    targetArg = arg;
  }

  if (!mode) {
    throw new Error('Missing required option: --to=tgz|workspace');
  }

  if (mode !== 'tgz' && mode !== 'workspace') {
    throw new Error(
      `Invalid --to value: ${mode}. Expected "tgz" or "workspace"`
    );
  }

  return { debug, mode, targetArg };
}

function normalizeRelativePath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized.startsWith('../') || normalized.startsWith('./')) {
    return normalized;
  }

  return `./${normalized}`;
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function resolveDependencyContainer(packageJson, dependencyName) {
  const dependencySections = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ];

  for (const sectionName of dependencySections) {
    const section = packageJson[sectionName];
    if (section && typeof section === 'object' && section[dependencyName]) {
      return { section, sectionName };
    }
  }

  return null;
}

function main() {
  console.log('Starting dependency mode switch...\n');

  let parsedArgs;
  try {
    parsedArgs = parseCliArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${String(error.message ?? error)}`);
    printUsage();
    process.exit(1);
  }

  const { debug, mode, targetArg } = parsedArgs;
  logDebug(
    debug,
    `Resolved repo root to ${repoRoot} from argv ${JSON.stringify(process.argv.slice(2))}.`
  );

  const commonPackageJsonPath = path.join(
    repoRoot,
    'packages',
    'common',
    'package.json'
  );
  const commonDir = path.dirname(commonPackageJsonPath);
  logDebug(
    debug,
    `Reading common package metadata from ${commonPackageJsonPath}.`
  );

  if (!fs.existsSync(commonPackageJsonPath)) {
    throw new Error(`Common package.json not found: ${commonPackageJsonPath}`);
  }

  const commonPackageJson = readJsonFile(commonPackageJsonPath);
  const commonPackageName = commonPackageJson.name;
  const scopeMatch = String(commonPackageName).match(/^@([^/]+)\//);

  if (!scopeMatch) {
    throw new Error(
      `Unable to extract scope from package name: ${commonPackageName}`
    );
  }

  const scopeName = scopeMatch[1];
  const tgzFilename = `${scopeName}-common.tgz`;
  const tgzAbsolutePath = path.join(commonDir, tgzFilename);
  logDebug(
    debug,
    `Derived common package ${commonPackageName}, scope ${scopeName}, and tgz path ${tgzAbsolutePath}.`
  );

  const packageJsonPath = targetArg
    ? path.resolve(targetArg)
    : path.join(repoRoot, 'package.json');
  logDebug(debug, `Target package manifest resolved to ${packageJsonPath}.`);

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`Target package.json not found: ${packageJsonPath}`);
  }

  const packageJson = readJsonFile(packageJsonPath);
  const dependencyContainer = resolveDependencyContainer(
    packageJson,
    commonPackageName
  );

  if (!dependencyContainer) {
    throw new Error(
      `${commonPackageName} dependency not found in ${packageJsonPath}`
    );
  }

  const packageDir = path.dirname(packageJsonPath);
  const workspaceRelativePath = normalizeRelativePath(
    path.relative(packageDir, commonDir)
  );
  const tgzRelativePath = normalizeRelativePath(
    path.relative(packageDir, tgzAbsolutePath)
  );

  const workspaceRef = `link:${workspaceRelativePath}`;
  const tgzRef = `file:${tgzRelativePath}`;
  logDebug(
    debug,
    `Computed references workspace=${workspaceRef} tgz=${tgzRef}.`
  );

  if (mode === 'tgz' && !fs.existsSync(tgzAbsolutePath)) {
    throw new Error(
      [
        `Missing packed common artifact: ${tgzAbsolutePath}`,
        'Run `pnpm --dir packages/common run pack` first.',
      ].join(' ')
    );
  }

  const currentRef = dependencyContainer.section[commonPackageName];
  const nextRef = mode === 'tgz' ? tgzRef : workspaceRef;
  logDebug(
    debug,
    `Dependency currently uses ${currentRef}; requested mode ${mode} will use ${nextRef}.`
  );

  if (currentRef === nextRef) {
    console.log(
      `${commonPackageName} already set to ${mode} in ${dependencyContainer.sectionName}.`
    );
    return;
  }

  dependencyContainer.section[commonPackageName] = nextRef;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  logDebug(debug, `Wrote updated dependency reference to ${packageJsonPath}.`);

  console.log('Dependency mode switch completed.');
  console.log(`Target package.json: ${packageJsonPath}`);
  console.log(`Dependency section: ${dependencyContainer.sectionName}`);
  console.log(`Old reference: ${currentRef}`);
  console.log(`New reference: ${nextRef}`);
}

main();
