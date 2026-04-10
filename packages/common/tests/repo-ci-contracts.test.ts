/**
 * Tests repo CI and workspace contract assumptions.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type RootPackageJson = {
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

type WorkspacePackageJson = {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe('repository CI contracts', () => {
  function getRootPath(...segments: string[]) {
    return path.resolve(process.cwd(), '..', '..', ...segments);
  }

  function getRootScripts() {
    const rootPackageJsonPath = getRootPath('package.json');
    const rootPackageJson = JSON.parse(
      readFileSync(rootPackageJsonPath, 'utf8')
    ) as RootPackageJson;

    return rootPackageJson.scripts ?? {};
  }

  function getRootPackageJson() {
    const rootPackageJsonPath = getRootPath('package.json');
    return JSON.parse(
      readFileSync(rootPackageJsonPath, 'utf8')
    ) as RootPackageJson;
  }

  function getDashboardPackageJson() {
    const dashboardPackageJsonPath = getRootPath(
      'packages',
      'dashboard',
      'package.json'
    );
    return JSON.parse(
      readFileSync(dashboardPackageJsonPath, 'utf8')
    ) as WorkspacePackageJson;
  }

  function getBackPackageJson() {
    const backPackageJsonPath = getRootPath('packages', 'back', 'package.json');
    return JSON.parse(
      readFileSync(backPackageJsonPath, 'utf8')
    ) as WorkspacePackageJson;
  }

  function getDashboardPlaywrightConfig() {
    const dashboardPlaywrightConfigPath = getRootPath(
      'packages',
      'dashboard',
      'playwright.config.ts'
    );
    return readFileSync(dashboardPlaywrightConfigPath, 'utf8');
  }

  function expectUsesSharedWorkflowEnv(workflowContents: string) {
    expect(workflowContents).toContain(
      'uses: ./.github/actions/setup-workflow-env'
    );
    expect(workflowContents).toContain('github-vars-json: ${{ toJSON(vars) }}');
    expect(workflowContents).toContain(
      'private-key: ${{ secrets.PRIVATE_KEY }}'
    );
    expect(workflowContents).toContain(
      'better-auth-secret: ${{ secrets.BETTER_AUTH_SECRET }}'
    );
    expect(workflowContents).toContain(
      'google-client-secret: ${{ secrets.GOOGLE_CLIENT_SECRET }}'
    );
    expect(workflowContents).toContain(
      'autumn-secret-key: ${{ secrets.AUTUMN_SECRET_KEY }}'
    );
    expect(workflowContents).toContain(
      'resend-api-key: ${{ secrets.RESEND_API_KEY }}'
    );
  }

  it('defines a root typecheck script that validates all workspace packages', () => {
    const typecheckScript = getRootScripts().typecheck;

    expect(typecheckScript).toBeTypeOf('string');
    expect(typecheckScript).toContain(
      '--filter @cories-firebase-startup-template-v3/common build'
    );
    expect(typecheckScript).toContain(
      '--filter @cories-firebase-startup-template-v3/back'
    );
    expect(typecheckScript).toContain(
      '--filter @cories-firebase-startup-template-v3/dashboard'
    );

    const commonBuildIndex = typecheckScript!.indexOf(
      '@cories-firebase-startup-template-v3/common build'
    );
    const backTypecheckIndex = typecheckScript!.indexOf(
      '@cories-firebase-startup-template-v3/back exec tsc --noEmit'
    );

    expect(commonBuildIndex).toBeLessThan(backTypecheckIndex);
  });

  it('defines a root build script that builds shared package before dependents', () => {
    const buildScript = getRootScripts().build;

    expect(buildScript).toBeTypeOf('string');
    expect(buildScript).toContain(
      '--filter @cories-firebase-startup-template-v3/common build'
    );
    expect(buildScript).toContain(
      '--filter @cories-firebase-startup-template-v3/back build'
    );
    expect(buildScript).toContain(
      '--filter @cories-firebase-startup-template-v3/dashboard build'
    );

    const commonBuildIndex = buildScript!.indexOf(
      '@cories-firebase-startup-template-v3/common build'
    );
    const backBuildIndex = buildScript!.indexOf(
      '@cories-firebase-startup-template-v3/back build'
    );
    const dashboardBuildIndex = buildScript!.indexOf(
      '@cories-firebase-startup-template-v3/dashboard build'
    );

    expect(commonBuildIndex).toBeLessThan(backBuildIndex);
    expect(backBuildIndex).toBeLessThan(dashboardBuildIndex);
  });

  it('does not ignore source files under packages/dashboard/src/lib', () => {
    const gitIgnorePath = getRootPath('.gitignore');
    const gitIgnoreContents = readFileSync(gitIgnorePath, 'utf8');

    expect(gitIgnoreContents).not.toContain('\nlib/\n');
    expect(gitIgnoreContents).toContain('packages/back/lib/');
    expect(gitIgnoreContents).toContain('packages/common/lib/');
  });

  it('defines a root coverage script that builds common before running back coverage', () => {
    const coverageScript = getRootScripts()['test:coverage'];

    expect(coverageScript).toBeTypeOf('string');
    expect(coverageScript).toContain(
      '--filter @cories-firebase-startup-template-v3/common build'
    );
    expect(coverageScript).toContain(
      '--filter @cories-firebase-startup-template-v3/back exec vitest run --coverage'
    );

    const commonBuildIndex = coverageScript!.indexOf(
      '@cories-firebase-startup-template-v3/common build'
    );
    const backCoverageIndex = coverageScript!.indexOf(
      '@cories-firebase-startup-template-v3/back exec vitest run --coverage'
    );

    expect(commonBuildIndex).toBeLessThan(backCoverageIndex);
  });

  it('defines root e2e scripts for smoke and core dashboard journeys', () => {
    const scripts = getRootScripts();

    expect(scripts['test:e2e:smoke']).toBeTypeOf('string');
    expect(scripts['test:e2e:smoke']).toContain(
      '--filter @cories-firebase-startup-template-v3/dashboard test:e2e:smoke'
    );

    expect(scripts['test:e2e:core']).toBeTypeOf('string');
    expect(scripts['test:e2e:core']).toContain(
      '--filter @cories-firebase-startup-template-v3/dashboard test:e2e:core'
    );

    expect(scripts['test:prod-smoke:dashboard']).toBe(
      'node scripts/verify-dashboard-preview.mjs'
    );
  });

  it('defines root changeset scripts and installs the changesets cli', () => {
    const rootPackageJson = getRootPackageJson();
    const scripts = rootPackageJson.scripts ?? {};
    const devDependencies = rootPackageJson.devDependencies ?? {};

    expect(scripts.changeset).toBe('changeset');
    expect(scripts['changeset:status']).toBe('changeset status');
    expect(scripts['changeset:version']).toBe('changeset version');
    expect(devDependencies['@changesets/cli']).toBeTypeOf('string');
  });

  it('defines deterministic tgz dependency scripts for backend deploy packaging', () => {
    const rootScripts = getRootScripts();
    const backPackageJson = getBackPackageJson();
    const backScripts = backPackageJson.scripts ?? {};

    expect(backScripts['toggle-tgz-dependency']).toContain(
      'pnpm --dir ../common run pack'
    );
    expect(backScripts['toggle-tgz-dependency']).toContain(
      'toggle-common-dependency.js ./package.json --to=tgz'
    );

    expect(rootScripts.deploy).toContain(
      'toggle-common-dependency.js ./package.json --to=tgz'
    );
    expect(rootScripts.deploy).toContain(
      'toggle-common-dependency.js ./package.json --to=workspace'
    );
    expect(rootScripts.deploy).toContain('trap cleanup EXIT');
  });

  it('defines dashboard e2e scripts that run Playwright smoke and core suites', () => {
    const dashboardPackageJson = getDashboardPackageJson();
    const scripts = dashboardPackageJson.scripts ?? {};
    const devDependencies = dashboardPackageJson.devDependencies ?? {};

    expect(scripts['test:e2e:smoke']).toContain('playwright test');
    expect(scripts['test:e2e:smoke']).toContain('--grep @smoke');
    expect(scripts['test:e2e:core']).toContain('playwright test');
    expect(scripts['test:e2e:core']).toContain('--grep @core');
    expect(scripts['test:e2e:smoke']).not.toContain('vitest');
    expect(scripts['test:e2e:core']).not.toContain('vitest');

    expect(devDependencies['@playwright/test']).toBeTypeOf('string');
  });

  it('defines dashboard Playwright projects for edge and mobile browsers', () => {
    const playwrightConfigContents = getDashboardPlaywrightConfig();

    expect(playwrightConfigContents).toContain("name: 'msedge'");
    expect(playwrightConfigContents).toContain("channel: 'msedge'");
    expect(playwrightConfigContents).toContain("name: 'mobile-chrome'");
    expect(playwrightConfigContents).toContain("devices['Pixel 7']");
    expect(playwrightConfigContents).toContain("name: 'mobile-safari'");
    expect(playwrightConfigContents).toContain("devices['iPhone 14']");
  });

  it('installs Java 21 before running emulator-backed integration tests in CI', () => {
    const ciWorkflowPath = getRootPath('.github', 'workflows', 'ci.yml');
    const ciWorkflowContents = readFileSync(ciWorkflowPath, 'utf8');

    const testJobMatch = ciWorkflowContents.match(
      /\n {2}test:\n[\s\S]*?\n {2}coverage:\n/
    );

    expect(testJobMatch).not.toBeNull();

    const testJobContents = testJobMatch![0];

    expect(testJobContents).toContain('name: Setup Java (JDK 21)');
    expect(testJobContents).toContain('uses: actions/setup-java@v4');
    expect(testJobContents).toMatch(/java-version:\s*["']21["']/);
    expect(testJobContents).toContain(
      'Run integration tests (emulator-backed)'
    );

    const setupJavaIndex = testJobContents.indexOf('name: Setup Java (JDK 21)');
    const integrationTestsIndex = testJobContents.indexOf(
      'Run integration tests (emulator-backed)'
    );

    expect(setupJavaIndex).toBeGreaterThan(-1);
    expect(integrationTestsIndex).toBeGreaterThan(-1);
    expect(setupJavaIndex).toBeLessThan(integrationTestsIndex);
  });

  it('uses shared workflow env configuration in CI workflow', () => {
    const ciWorkflowPath = getRootPath('.github', 'workflows', 'ci.yml');
    const ciWorkflowContents = readFileSync(ciWorkflowPath, 'utf8');

    expectUsesSharedWorkflowEnv(ciWorkflowContents);
    expect(ciWorkflowContents).toMatch(
      /RUN_BACK_INTEGRATION_TESTS:\s*["']true["']/
    );
  });

  it('runs CI workflow on push events', () => {
    const ciWorkflowPath = getRootPath('.github', 'workflows', 'ci.yml');
    const ciWorkflowContents = readFileSync(ciWorkflowPath, 'utf8');

    expect(ciWorkflowContents).toContain('on:\n  push:');
    expect(ciWorkflowContents).not.toContain('branches:\n      - main');
  });

  it('does not duplicate PR e2e smoke gates inside CI workflow', () => {
    const ciWorkflowPath = getRootPath('.github', 'workflows', 'ci.yml');
    const ciWorkflowContents = readFileSync(ciWorkflowPath, 'utf8');

    expect(ciWorkflowContents).not.toContain('\n  e2e-smoke:\n');
    expect(ciWorkflowContents).not.toContain('name: Run E2E smoke tests');
    expect(ciWorkflowContents).not.toContain('pnpm run test:e2e:smoke');
    expect(ciWorkflowContents).not.toContain(
      'pnpm run test:prod-smoke:dashboard'
    );
  });

  it('defines an e2e full workflow that runs on schedule, mainline pushes, and develop -> master PRs', () => {
    const e2eFullWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'e2e-full.yml'
    );
    const e2eFullWorkflowContents = readFileSync(e2eFullWorkflowPath, 'utf8');

    expect(e2eFullWorkflowContents).toContain('name: E2E Full');
    expect(e2eFullWorkflowContents).toContain('push:');
    expect(e2eFullWorkflowContents).toContain('- master');
    expect(e2eFullWorkflowContents).toContain('- develop');
    expect(e2eFullWorkflowContents).toContain('pull_request:');
    expect(e2eFullWorkflowContents).toContain('cron:');
    expect(e2eFullWorkflowContents).toContain('0 3 * * *');
    expect(e2eFullWorkflowContents).toContain('workflow_dispatch:');
    expect(e2eFullWorkflowContents).toContain('\n  emulator-gate:\n');
    expect(e2eFullWorkflowContents).toContain(
      "if: github.event_name != 'pull_request' || github.head_ref == 'develop'"
    );
    expect(e2eFullWorkflowContents).toContain('name: Run All E2E');
    expect(e2eFullWorkflowContents).toContain('run: pnpm run test:e2e');
    expect(e2eFullWorkflowContents).toContain(
      'name: Install Playwright browsers'
    );
    expect(e2eFullWorkflowContents).toContain(
      'playwright install --with-deps chromium firefox webkit'
    );
    expect(e2eFullWorkflowContents).toContain('msedge');
    expect(e2eFullWorkflowContents).toContain('name: Production Build Smoke');
    expect(e2eFullWorkflowContents).toContain(
      'name: Run production build smoke checks (dashboard server)'
    );
    expect(e2eFullWorkflowContents).toContain(
      'pnpm run test:prod-smoke:dashboard'
    );
    expect(e2eFullWorkflowContents).toContain(
      'pnpm --filter @cories-firebase-startup-template-v3/dashboard start'
    );
  });

  it('uses shared workflow env configuration in e2e full workflow', () => {
    const e2eFullWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'e2e-full.yml'
    );
    const e2eFullWorkflowContents = readFileSync(e2eFullWorkflowPath, 'utf8');

    expectUsesSharedWorkflowEnv(e2eFullWorkflowContents);
  });

  it('uses shared workflow env configuration in PR smoke workflow', () => {
    const prSmokeWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'e2e-smoke-pr.yml'
    );
    const prSmokeWorkflowContents = readFileSync(prSmokeWorkflowPath, 'utf8');

    expectUsesSharedWorkflowEnv(prSmokeWorkflowContents);
  });

  it('defines a pull-request workflow that runs e2e smoke tests', () => {
    const prSmokeWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'e2e-smoke-pr.yml'
    );
    const prSmokeWorkflowContents = readFileSync(prSmokeWorkflowPath, 'utf8');

    expect(prSmokeWorkflowContents).toContain('on:\n  pull_request:');
    expect(prSmokeWorkflowContents).toContain('\n  emulator-gate:\n');
    expect(prSmokeWorkflowContents).toContain('name: Emulator Gate');
    expect(prSmokeWorkflowContents).toContain(
      'Run emulator-backed integration tests'
    );
    expect(prSmokeWorkflowContents).toContain('name: Production Build Smoke');
    expect(prSmokeWorkflowContents).toContain('needs: [emulator-gate]');
    expect(prSmokeWorkflowContents).toContain('name: Run E2E smoke tests');
    expect(prSmokeWorkflowContents).toContain('run: pnpm run test:e2e:smoke');
    expect(prSmokeWorkflowContents).toContain(
      'name: Install Playwright browsers'
    );
    expect(prSmokeWorkflowContents).toContain(
      'playwright install --with-deps chromium firefox webkit'
    );
    expect(prSmokeWorkflowContents).toContain('msedge');
    expect(prSmokeWorkflowContents).toContain(
      'name: Run production build smoke checks (dashboard server)'
    );
    expect(prSmokeWorkflowContents).toContain(
      'pnpm run test:prod-smoke:dashboard'
    );
    expect(prSmokeWorkflowContents).toContain(
      'pnpm --filter @cories-firebase-startup-template-v3/dashboard start'
    );
  });

  it('uses Codecov in the PR coverage workflow with dynamic LCOV discovery', () => {
    const prCoverageWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'pr-coverage.yml'
    );
    const prCoverageWorkflowContents = readFileSync(
      prCoverageWorkflowPath,
      'utf8'
    );

    expect(prCoverageWorkflowContents).toContain('on:\n  pull_request:');
    expect(prCoverageWorkflowContents).toContain(
      'uses: codecov/codecov-action@v4'
    );
    expect(prCoverageWorkflowContents).toContain(
      'token: ${{ secrets.CODECOV_TOKEN }}'
    );
    expect(prCoverageWorkflowContents).toContain('id: coverage-metadata');
    expect(prCoverageWorkflowContents).toContain(
      'readdirSync(coverageRoot, { withFileTypes: true })'
    );
    expect(prCoverageWorkflowContents).toContain(
      'files: ${{ steps.coverage-metadata.outputs.codecov_files }}'
    );
    expect(prCoverageWorkflowContents).toContain('disable_search: true');
    expect(prCoverageWorkflowContents).toContain('fail_ci_if_error: true');
    expect(prCoverageWorkflowContents).not.toContain(
      "const packageNames = ['common', 'back', 'dashboard'];"
    );
  });

  it('defines a pull-request changesets workflow for package changes', () => {
    const changesetsWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'changesets.yml'
    );
    const changesetsWorkflowContents = readFileSync(
      changesetsWorkflowPath,
      'utf8'
    );

    expect(changesetsWorkflowContents).toContain('name: Changesets');
    expect(changesetsWorkflowContents).toContain('on:\n  pull_request:');
    expect(changesetsWorkflowContents).toContain('"packages/**"');
    expect(changesetsWorkflowContents).toContain(
      'Package changes were detected, but no changeset markdown files were added.'
    );
    expect(changesetsWorkflowContents).toContain(
      "Run 'pnpm changeset' and commit the generated .changeset/*.md file."
    );
    expect(changesetsWorkflowContents).toContain(
      'pnpm exec changeset status --since="origin/${{ github.base_ref }}"'
    );
  });

  it('defines a release workflow that uses the official changesets action', () => {
    const releaseWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'release.yml'
    );
    const releaseWorkflowContents = readFileSync(releaseWorkflowPath, 'utf8');

    expect(releaseWorkflowContents).toContain('name: Release');
    expect(releaseWorkflowContents).toContain('push:');
    expect(releaseWorkflowContents).toContain('- main');
    expect(releaseWorkflowContents).toContain('workflow_dispatch:');
    expect(releaseWorkflowContents).toContain(
      'concurrency: ${{ github.workflow }}-${{ github.ref }}'
    );
    expect(releaseWorkflowContents).toContain('uses: changesets/action@v1');
    expect(releaseWorkflowContents).toContain(
      'version: pnpm changeset:version'
    );
    expect(releaseWorkflowContents).toContain('pull-requests: write');
  });

  it('posts a sticky PR comment with coverage totals in the PR coverage workflow', () => {
    const prCoverageWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'pr-coverage.yml'
    );
    const prCoverageWorkflowContents = readFileSync(
      prCoverageWorkflowPath,
      'utf8'
    );

    expect(prCoverageWorkflowContents).toContain('pull-requests: write');
    expect(prCoverageWorkflowContents).toContain('issues: write');
    expect(prCoverageWorkflowContents).toContain(
      'name: Discover coverage packages and build PR coverage comment body'
    );
    expect(prCoverageWorkflowContents).toContain(
      'coverage/pr-coverage-comment.md'
    );
    expect(prCoverageWorkflowContents).toContain(
      'name: Post sticky PR coverage comment'
    );
    expect(prCoverageWorkflowContents).toContain(
      'uses: actions/github-script@v7'
    );
    expect(prCoverageWorkflowContents).toContain(
      '<!-- pr-coverage-comment -->'
    );
  });

  it('uses shared workflow env configuration in PR coverage workflow', () => {
    const prCoverageWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'pr-coverage.yml'
    );
    const prCoverageWorkflowContents = readFileSync(
      prCoverageWorkflowPath,
      'utf8'
    );

    expectUsesSharedWorkflowEnv(prCoverageWorkflowContents);
  });

  it('uses dynamic LCOV discovery in the push coverage upload workflow', () => {
    const uploadCoverageWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'upload-coverage.yml'
    );
    const uploadCoverageWorkflowContents = readFileSync(
      uploadCoverageWorkflowPath,
      'utf8'
    );

    expect(uploadCoverageWorkflowContents).toContain(
      'name: Discover coverage packages'
    );
    expect(uploadCoverageWorkflowContents).toContain('id: coverage-metadata');
    expect(uploadCoverageWorkflowContents).toContain(
      'readdirSync(coverageRoot, { withFileTypes: true })'
    );
    expect(uploadCoverageWorkflowContents).toContain(
      'files: ${{ steps.coverage-metadata.outputs.codecov_files }}'
    );
    expect(uploadCoverageWorkflowContents).not.toContain(
      './coverage/common/lcov.info,./coverage/back/lcov.info,./coverage/dashboard/lcov.info'
    );
  });

  it('uses shared workflow env configuration in push coverage upload workflow', () => {
    const uploadCoverageWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'upload-coverage.yml'
    );
    const uploadCoverageWorkflowContents = readFileSync(
      uploadCoverageWorkflowPath,
      'utf8'
    );

    expectUsesSharedWorkflowEnv(uploadCoverageWorkflowContents);
  });

  it('defines required backend and dashboard env defaults in the shared workflow env exporter', () => {
    const sharedEnvScriptPath = getRootPath('scripts', 'export-ci-env.mjs');
    const sharedEnvScriptContents = readFileSync(sharedEnvScriptPath, 'utf8');

    expect(sharedEnvScriptContents).toMatch(
      /APP_URL:\s*['"]http:\/\/localhost:3001['"]/
    );
    expect(sharedEnvScriptContents).toMatch(
      /BETTER_AUTH_SECRET:\s*['"]better-auth-ci-default-secret-12345678901234567890['"]/
    );
    expect(sharedEnvScriptContents).toMatch(
      /FIREBASE_PROJECT_ID:\s*['"]demo-startup-template['"]/
    );
    expect(sharedEnvScriptContents).toMatch(
      /FIREBASE_CLIENT_EMAIL:\s*['"]firebase-adminsdk-ci@demo-startup-template\.iam\.gserviceaccount\.com['"]/
    );
    expect(sharedEnvScriptContents).toMatch(
      /FIRESTORE_EMULATOR_HOST:\s*['"]127\.0\.0\.1:8080['"]/
    );
    expect(sharedEnvScriptContents).toMatch(
      /MY_FIRESTORE_EMULATOR_HOST:\s*['"]127\.0\.0\.1:8080['"]/
    );
    expect(sharedEnvScriptContents).toMatch(
      /AUTUMN_SEAT_FEATURE_ID:\s*['"]seats['"]/
    );
  });

  it('does not trigger the general coverage upload workflow on pull requests', () => {
    const uploadCoverageWorkflowPath = getRootPath(
      '.github',
      'workflows',
      'upload-coverage.yml'
    );
    const uploadCoverageWorkflowContents = readFileSync(
      uploadCoverageWorkflowPath,
      'utf8'
    );

    const onBlockMatch = uploadCoverageWorkflowContents.match(
      /\non:\n([\s\S]*?)\n\njobs:\n/
    );

    expect(onBlockMatch).not.toBeNull();

    const onBlock = onBlockMatch![1];

    expect(onBlock).toContain('  push:');
    expect(onBlock).not.toContain('  pull_request:');
  });
});
