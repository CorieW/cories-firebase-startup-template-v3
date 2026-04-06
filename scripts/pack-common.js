/**
 * Produces a stable `*-common.tgz` package artifact for local linking.
 *
 * Process:
 * 1) Reads `packages/common/package.json` to get scope and version.
 * 2) Builds the versioned tarball filename created by `pnpm pack`.
 * 3) Verifies the versioned tarball exists.
 * 4) Copies it to a stable filename (`<scope>-common.tgz`).
 * 5) Removes the versioned tarball and updates mtime on the stable file so
 *    downstream tooling can detect it as fresh.
 *
 * Flags:
 * - `--debug`: print resolved paths and file operation details.
 *
 * Environment overrides:
 * - `REPO_ROOT`: override the repository root for fixture-based tests.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function parseCliArgs(args) {
  let debug = false;

  for (const arg of args) {
    if (arg === '--debug') {
      debug = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return { debug };
}

function readCliArgsOrExit() {
  try {
    return parseCliArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${String(error.message ?? error)}`);
    process.exit(1);
  }
}

const { debug: DEBUG_ENABLED } = readCliArgsOrExit();

function logDebug(message) {
  if (!DEBUG_ENABLED) {
    return;
  }

  console.log(`[debug] ${message}`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = process.env.REPO_ROOT
  ? path.resolve(process.env.REPO_ROOT)
  : path.join(__dirname, '..');

console.log('📦 Starting pack script...\n');
logDebug(`Resolved repo root to ${repoRoot}.`);

// Step 1: Read the common package.json to get the package info
console.log('Step 1: Reading common package.json...');
const commonPackageJsonPath = path.join(
  repoRoot,
  'packages',
  'common',
  'package.json'
);
console.log(`   📁 Path: ${commonPackageJsonPath}`);
logDebug(`Reading package metadata from ${commonPackageJsonPath}.`);

const commonPackageJson = JSON.parse(
  fs.readFileSync(commonPackageJsonPath, 'utf8')
);
const commonPackageName = commonPackageJson.name;
const version = commonPackageJson.version;
console.log(`   ✓ Package name: ${commonPackageName}`);
console.log(`   ✓ Version: ${version}\n`);

// Step 2: Extract the scope name from the package name
console.log('Step 2: Extracting scope name from package...');
const scopeMatch = commonPackageName.match(/^@([^/]+)\//);
if (!scopeMatch) {
  console.log(
    `   ❌ Unable to extract scope from package name: ${commonPackageName}`
  );
  console.log(`   Expected format: @scope/package-name`);
  process.exit(1);
}
const scopeName = scopeMatch[1];
console.log(`   ✓ Scope: ${scopeName}\n`);

// Step 3: Construct the filenames
console.log('Step 3: Constructing filenames...');
const versionedFilename = `${scopeName}-common-${version}.tgz`;
const targetFilename = `${scopeName}-common.tgz`;
console.log(`   ✓ Versioned file: ${versionedFilename}`);
console.log(`   ✓ Target file: ${targetFilename}\n`);
logDebug(
  `Versioned artifact ${versionedFilename} will be normalized to ${targetFilename}.`
);

// Step 4: Verify the versioned file exists
console.log('Step 4: Verifying packed file...');
const commonDir = path.join(repoRoot, 'packages', 'common');
const versionedFilePath = path.join(commonDir, versionedFilename);
const targetFilePath = path.join(commonDir, targetFilename);
logDebug(`Checking for ${versionedFilePath}.`);

if (!fs.existsSync(versionedFilePath)) {
  console.log(`   ❌ Expected file not found: ${versionedFilename}`);
  console.log(`   Make sure 'pnpm pack' ran successfully`);
  process.exit(1);
}
console.log(`   ✓ Found ${versionedFilename}\n`);

// Step 5: Copy to target filename
console.log('Step 5: Copying to target filename...');
const timestamp = Date.now() / 1000;
fs.copyFileSync(versionedFilePath, targetFilePath);
console.log(`   ✓ Copied to ${targetFilename}\n`);
logDebug(`Copied ${versionedFilePath} to ${targetFilePath}.`);

// Step 6: Delete versioned file
console.log('Step 6: Cleaning up versioned file...');
fs.unlinkSync(versionedFilePath);
console.log(`   ✓ Deleted ${versionedFilename}\n`);
logDebug(`Removed temporary artifact ${versionedFilePath}.`);

// Step 7: Set timestamp on target file
console.log('Step 7: Setting timestamp...');
fs.utimesSync(targetFilePath, timestamp, timestamp);
console.log(`   ✓ Timestamp set\n`);
logDebug(`Updated mtime on ${targetFilePath} to ${timestamp}.`);

// Final summary
console.log('✅ Pack completed successfully!');
console.log(`   Package: ${commonPackageName}`);
console.log(`   Output: ${targetFilename}`);
