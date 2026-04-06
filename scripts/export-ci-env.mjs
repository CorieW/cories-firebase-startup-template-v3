/**
 * Exports shared workflow environment variables to `GITHUB_ENV`.
 *
 * Process:
 * 1) Validates the script is running in GitHub Actions (`GITHUB_ENV` exists).
 * 2) Parses repo/environment variables passed through `GITHUB_VARS_JSON`.
 * 3) Resolves each required key and appends it to `GITHUB_ENV`.
 * 4) Resolves optional keys and appends only when present.
 *
 * Value precedence:
 * 1) explicit workflow secret overrides
 * 2) GitHub repository/environment variables (`vars` context)
 * 3) CI-safe defaults that match local `.env.example` expectations
 *
 * Flags:
 * - `--debug`: print step-by-step environment resolution details without
 *   echoing secret values.
 */
import { appendFileSync } from 'node:fs';

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

/**
 * Parses an object-like JSON string.
 */
function parseObjectJson(rawValue, envName) {
  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }

    throw new Error('expected a JSON object');
  } catch (error) {
    throw new Error(
      `Unable to parse ${envName} as JSON object: ${String(error)}`
    );
  }
}

/**
 * Normalizes env-like values while preserving empty strings as unset.
 */
function normalizeEnvValue(candidate) {
  if (candidate === null || typeof candidate === 'undefined') {
    return undefined;
  }

  const normalized = String(candidate);
  return normalized.length > 0 ? normalized : undefined;
}

/**
 * Resolves an env value while retaining the winning source label.
 */
function resolveEnvValue(envName, workflowVars, secretOverrides, defaultValue) {
  const candidates = [
    {
      source: 'workflow secret override',
      value: secretOverrides[envName],
    },
    {
      source: 'workflow vars json',
      value: workflowVars[envName],
    },
  ];

  if (typeof defaultValue !== 'undefined') {
    candidates.push({
      source: 'default',
      value: defaultValue,
    });
  }

  for (const candidate of candidates) {
    const normalizedValue = normalizeEnvValue(candidate.value);

    if (typeof normalizedValue !== 'undefined') {
      return {
        source: candidate.source,
        value: normalizedValue,
      };
    }
  }

  return {
    source: 'unset',
    value: undefined,
  };
}

/**
 * Summarizes a value without printing the underlying secret.
 */
function summarizeValue(value) {
  const length = String(value).length;
  return `${length} character${length === 1 ? '' : 's'}`;
}

/**
 * Appends a value to GITHUB_ENV using multiline-safe syntax.
 */
function appendGithubEnv(name, value) {
  const delimiter = `EOF_${name}_${Math.random().toString(36).slice(2)}`;
  appendFileSync(
    githubEnvPath,
    `${name}<<${delimiter}\n${value}\n${delimiter}\n`
  );
  logDebug(`Appended ${name} to ${githubEnvPath}.`);
}

const githubEnvPath = process.env.GITHUB_ENV;
if (!githubEnvPath) {
  throw new Error('GITHUB_ENV is not available in this workflow context');
}
logDebug(`Writing workflow environment exports to ${githubEnvPath}.`);

const workflowVars = parseObjectJson(
  process.env.GITHUB_VARS_JSON ?? '{}',
  'GITHUB_VARS_JSON'
);
logDebug(
  [
    'Parsed workflow vars JSON keys:',
    Object.keys(workflowVars).sort().join(', ') || '<none>',
  ].join(' ')
);

const secretOverrides = {
  PRIVATE_KEY: process.env.WORKFLOW_PRIVATE_KEY,
  FIREBASE_PRIVATE_KEY: process.env.WORKFLOW_PRIVATE_KEY,
  BETTER_AUTH_SECRET: process.env.WORKFLOW_BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_SECRET: process.env.WORKFLOW_GOOGLE_CLIENT_SECRET,
  AUTUMN_SECRET_KEY: process.env.WORKFLOW_AUTUMN_SECRET_KEY,
  RESEND_API_KEY: process.env.WORKFLOW_RESEND_API_KEY,
};

const sharedDefaults = {
  NODE_ENV: 'development',
  APP_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'better-auth-ci-default-secret-12345678901234567890',
  PROJECT_ID: 'demo-startup-template',
  FIREBASE_PROJECT_ID: 'demo-startup-template',
  PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\\nCI_TEST_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n',
  FIREBASE_PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\\nCI_TEST_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n',
  CLIENT_EMAIL:
    'firebase-adminsdk-ci@demo-startup-template.iam.gserviceaccount.com',
  FIREBASE_CLIENT_EMAIL:
    'firebase-adminsdk-ci@demo-startup-template.iam.gserviceaccount.com',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  MY_FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  AUTUMN_SEAT_FEATURE_ID: 'seats',
  SOCIAL_LINKS:
    '[{"label":"X","url":"https://x.com/your-handle","icon":"x"},{"label":"GitHub","url":"https://github.com/your-org","icon":"github"}]',
};

const optionalEnvKeys = [
  'BETTER_AUTH_URL',
  'AUTUMN_SECRET_KEY',
  'AUTUMN_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
];

for (const [envName, defaultValue] of Object.entries(sharedDefaults)) {
  const resolvedEnv = resolveEnvValue(
    envName,
    workflowVars,
    secretOverrides,
    defaultValue
  );
  const resolvedValue = resolvedEnv.value;

  if (typeof resolvedValue === 'undefined') {
    throw new Error(
      `Unable to resolve required workflow environment variable: ${envName}`
    );
  }

  logDebug(
    `Resolved required ${envName} from ${resolvedEnv.source} (${summarizeValue(resolvedValue)}).`
  );
  appendGithubEnv(envName, resolvedValue);
}

for (const envName of optionalEnvKeys) {
  const resolvedEnv = resolveEnvValue(envName, workflowVars, secretOverrides);
  const resolvedValue = resolvedEnv.value;

  if (typeof resolvedValue !== 'undefined') {
    logDebug(
      `Resolved optional ${envName} from ${resolvedEnv.source} (${summarizeValue(resolvedValue)}).`
    );
    appendGithubEnv(envName, resolvedValue);
    continue;
  }

  logDebug(`Skipped optional ${envName}; no value was provided.`);
}
