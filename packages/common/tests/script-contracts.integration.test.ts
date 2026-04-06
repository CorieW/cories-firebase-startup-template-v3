/**
 * Integration tests for repository helper scripts.
 */
import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

type ScriptRunResult = {
  code: number;
  stderr: string;
  stdout: string;
};

function getRootPath(...segments: string[]) {
  return path.resolve(process.cwd(), '..', '..', ...segments);
}

function createTempDirectory(prefix: string) {
  return mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeFile(filePath: string, content: string) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function runNodeScript(
  scriptPath: string,
  args: string[],
  envOverrides: Record<string, string>
): Promise<ScriptRunResult> {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      env: {
        ...process.env,
        ...envOverrides,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('close', code => {
      resolve({
        code: code ?? 0,
        stderr,
        stdout,
      });
    });
  });
}

describe('script contracts integration', () => {
  const temporaryDirectories: string[] = [];

  afterEach(() => {
    for (const tempDir of temporaryDirectories) {
      rmSync(tempDir, { force: true, recursive: true });
    }

    temporaryDirectories.length = 0;
  });

  it('verifies preview routes for expected public and protected behavior', async () => {
    const verifyScriptPath = getRootPath(
      'scripts',
      'verify-dashboard-preview.mjs'
    );

    const server = createServer((request, response) => {
      const requestPath = request.url ?? '/';

      if (requestPath === '/sign-in' || requestPath === '/sign-up') {
        response.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
        });
        response.end(
          '<!DOCTYPE html><html><body><script id="$tsr-stream-barrier"></script></body></html>'
        );
        return;
      }

      if (requestPath === '/' || requestPath === '/chat') {
        response.writeHead(307, {
          location: '/sign-in',
        });
        response.end();
        return;
      }

      response.writeHead(404, {
        'content-type': 'text/plain; charset=utf-8',
      });
      response.end('not found');
    });

    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test preview server');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    const result = await runNodeScript(verifyScriptPath, [], {
      BASE_URL: baseUrl,
      PROTECTED_ROUTES: '/,/chat',
      PUBLIC_ROUTES: '/sign-in,/sign-up',
      READINESS_ROUTE: '/sign-in',
    });

    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Production dashboard smoke passed.');
  });

  it('prints preview verification debug traces when --debug is provided', async () => {
    const verifyScriptPath = getRootPath(
      'scripts',
      'verify-dashboard-preview.mjs'
    );

    const server = createServer((request, response) => {
      const requestPath = request.url ?? '/';

      if (requestPath === '/sign-in') {
        response.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
        });
        response.end(
          '<!DOCTYPE html><html><body><script id="$tsr-stream-barrier"></script></body></html>'
        );
        return;
      }

      if (requestPath === '/') {
        response.writeHead(307, {
          location: '/sign-in',
        });
        response.end();
        return;
      }

      response.writeHead(404, {
        'content-type': 'text/plain; charset=utf-8',
      });
      response.end('not found');
    });

    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test preview server');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    const result = await runNodeScript(verifyScriptPath, ['--debug'], {
      BASE_URL: baseUrl,
      PROTECTED_ROUTES: '/',
      PUBLIC_ROUTES: '/sign-in',
      READINESS_ROUTE: '/sign-in',
    });

    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('[debug] Base URL:');
    expect(result.stdout).toContain('Readiness probe 1/30');
    expect(result.stdout).toContain(`Fetching /sign-in via ${baseUrl}/sign-in`);
    expect(result.stdout).toContain('Received 307 for /');
  });

  it('fails preview verification when a protected route does not redirect', async () => {
    const verifyScriptPath = getRootPath(
      'scripts',
      'verify-dashboard-preview.mjs'
    );

    const server = createServer((request, response) => {
      const requestPath = request.url ?? '/';

      if (requestPath === '/sign-in') {
        response.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
        });
        response.end('<!DOCTYPE html><html><body>$_TSR</body></html>');
        return;
      }

      if (requestPath === '/chat') {
        response.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
        });
        response.end('<!DOCTYPE html><html><body>$_TSR</body></html>');
        return;
      }

      response.writeHead(307, {
        location: '/sign-in',
      });
      response.end();
    });

    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test preview server');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    const result = await runNodeScript(verifyScriptPath, [], {
      BASE_URL: baseUrl,
      PROTECTED_ROUTES: '/chat',
      PUBLIC_ROUTES: '/sign-in',
      READINESS_ROUTE: '/sign-in',
    });

    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Protected route expected 307 redirect');
  });

  it('logs shared workflow env resolution details when --debug is provided', async () => {
    const exportScriptPath = getRootPath('scripts', 'export-ci-env.mjs');
    const tempDir = createTempDirectory('export-ci-env-');
    temporaryDirectories.push(tempDir);

    const githubEnvPath = path.join(tempDir, 'github.env');
    writeFile(githubEnvPath, '');

    const result = await runNodeScript(exportScriptPath, ['--debug'], {
      GITHUB_ENV: githubEnvPath,
      GITHUB_VARS_JSON: JSON.stringify({
        AUTUMN_URL: 'https://autumn.example.test',
        PROJECT_ID: 'vars-project-id',
      }),
      WORKFLOW_BETTER_AUTH_SECRET: 'better-auth-secret-from-override',
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain(
      '[debug] Writing workflow environment exports to'
    );
    expect(result.stdout).toContain(
      'Resolved required BETTER_AUTH_SECRET from workflow secret override'
    );
    expect(result.stdout).toContain(
      'Resolved required PROJECT_ID from workflow vars json'
    );
    expect(result.stdout).toContain('Resolved required APP_URL from default');
    expect(result.stdout).toContain(
      'Resolved optional AUTUMN_URL from workflow vars json'
    );
    expect(result.stdout).not.toContain('better-auth-secret-from-override');

    const githubEnvContents = readFileSync(githubEnvPath, 'utf8');
    expect(githubEnvContents).toContain('PROJECT_ID<<');
    expect(githubEnvContents).toContain('AUTUMN_URL<<');
  });

  it('switches common dependency between tgz and workspace deterministically', async () => {
    const tempRepoRoot = createTempDirectory('toggle-common-');
    temporaryDirectories.push(tempRepoRoot);

    const toggleScriptPath = getRootPath(
      'scripts',
      'toggle-common-dependency.js'
    );
    const backPackageJsonPath = path.join(
      tempRepoRoot,
      'packages',
      'back',
      'package.json'
    );

    writeFile(
      path.join(tempRepoRoot, 'packages', 'common', 'package.json'),
      JSON.stringify(
        {
          name: '@acme/common',
          version: '0.0.0',
        },
        null,
        2
      ) + '\n'
    );

    writeFile(
      path.join(tempRepoRoot, 'packages', 'common', 'acme-common.tgz'),
      'fake tgz payload'
    );

    writeFile(
      backPackageJsonPath,
      JSON.stringify(
        {
          name: '@acme/back',
          private: true,
          dependencies: {
            '@acme/common': 'link:../common',
          },
        },
        null,
        2
      ) + '\n'
    );

    const toTgzResult = await runNodeScript(
      toggleScriptPath,
      [backPackageJsonPath, '--to=tgz'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(toTgzResult.code).toBe(0);

    const toggledToTgz = JSON.parse(
      readFileSync(backPackageJsonPath, 'utf8')
    ) as {
      dependencies: Record<string, string>;
    };

    expect(toggledToTgz.dependencies['@acme/common']).toBe(
      'file:../common/acme-common.tgz'
    );

    const toWorkspaceResult = await runNodeScript(
      toggleScriptPath,
      [backPackageJsonPath, '--to=workspace'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(toWorkspaceResult.code).toBe(0);

    const toggledToWorkspace = JSON.parse(
      readFileSync(backPackageJsonPath, 'utf8')
    ) as {
      dependencies: Record<string, string>;
    };

    expect(toggledToWorkspace.dependencies['@acme/common']).toBe(
      'link:../common'
    );
  });

  it('prints dependency toggle debug traces when --debug is provided', async () => {
    const tempRepoRoot = createTempDirectory('toggle-common-debug-');
    temporaryDirectories.push(tempRepoRoot);

    const toggleScriptPath = getRootPath(
      'scripts',
      'toggle-common-dependency.js'
    );
    const backPackageJsonPath = path.join(
      tempRepoRoot,
      'packages',
      'back',
      'package.json'
    );

    writeFile(
      path.join(tempRepoRoot, 'packages', 'common', 'package.json'),
      JSON.stringify(
        {
          name: '@acme/common',
          version: '0.0.0',
        },
        null,
        2
      ) + '\n'
    );

    writeFile(
      path.join(tempRepoRoot, 'packages', 'common', 'acme-common.tgz'),
      'fake tgz payload'
    );

    writeFile(
      backPackageJsonPath,
      JSON.stringify(
        {
          name: '@acme/back',
          private: true,
          dependencies: {
            '@acme/common': 'link:../common',
          },
        },
        null,
        2
      ) + '\n'
    );

    const result = await runNodeScript(
      toggleScriptPath,
      [backPackageJsonPath, '--to=tgz', '--debug'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('[debug] Resolved repo root to');
    expect(result.stdout).toContain('[debug] Computed references');
    expect(result.stdout).toContain(
      '[debug] Wrote updated dependency reference'
    );
  });

  it('fails tgz mode when the common tgz artifact is missing', async () => {
    const tempRepoRoot = createTempDirectory('toggle-common-missing-');
    temporaryDirectories.push(tempRepoRoot);

    const toggleScriptPath = getRootPath(
      'scripts',
      'toggle-common-dependency.js'
    );
    const backPackageJsonPath = path.join(
      tempRepoRoot,
      'packages',
      'back',
      'package.json'
    );

    writeFile(
      path.join(tempRepoRoot, 'packages', 'common', 'package.json'),
      JSON.stringify(
        {
          name: '@acme/common',
          version: '0.0.0',
        },
        null,
        2
      ) + '\n'
    );

    writeFile(
      backPackageJsonPath,
      JSON.stringify(
        {
          name: '@acme/back',
          private: true,
          dependencies: {
            '@acme/common': 'link:../common',
          },
        },
        null,
        2
      ) + '\n'
    );

    const result = await runNodeScript(
      toggleScriptPath,
      [backPackageJsonPath, '--to=tgz'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Missing packed common artifact');

    const untouchedPackageJson = JSON.parse(
      readFileSync(backPackageJsonPath, 'utf8')
    ) as {
      dependencies: Record<string, string>;
    };

    expect(untouchedPackageJson.dependencies['@acme/common']).toBe(
      'link:../common'
    );
  });

  it('packs the common tarball with debug traces when --debug is provided', async () => {
    const tempRepoRoot = createTempDirectory('pack-common-debug-');
    temporaryDirectories.push(tempRepoRoot);

    const packScriptPath = getRootPath('scripts', 'pack-common.js');
    const commonDir = path.join(tempRepoRoot, 'packages', 'common');
    const versionedFilename = 'acme-common-1.2.3.tgz';
    const stableFilename = 'acme-common.tgz';

    writeFile(
      path.join(commonDir, 'package.json'),
      JSON.stringify(
        {
          name: '@acme/common',
          version: '1.2.3',
        },
        null,
        2
      ) + '\n'
    );
    writeFile(path.join(commonDir, versionedFilename), 'tgz payload');

    const result = await runNodeScript(packScriptPath, ['--debug'], {
      REPO_ROOT: tempRepoRoot,
    });

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('[debug] Resolved repo root to');
    expect(result.stdout).toContain('[debug] Copied');
    expect(result.stdout).toContain('[debug] Updated mtime');
    expect(existsSync(path.join(commonDir, stableFilename))).toBe(true);
    expect(existsSync(path.join(commonDir, versionedFilename))).toBe(false);
  });

  it('supports dry-run rename and leaves files unchanged', async () => {
    const tempRepoRoot = createTempDirectory('rename-project-dry-run-');
    temporaryDirectories.push(tempRepoRoot);

    const renameScriptPath = getRootPath('scripts', 'rename-project.js');

    const readmePath = path.join(tempRepoRoot, 'README.md');
    const sourcePath = path.join(
      tempRepoRoot,
      'packages',
      'dashboard',
      'src',
      'example.ts'
    );

    writeFile(
      path.join(tempRepoRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'alpha-template',
          private: true,
        },
        null,
        2
      ) + '\n'
    );
    writeFile(readmePath, 'Project: alpha-template\n');
    writeFile(sourcePath, "export const scope = 'alpha-template';\n");

    const readmeBefore = readFileSync(readmePath, 'utf8');
    const sourceBefore = readFileSync(sourcePath, 'utf8');

    const result = await runNodeScript(
      renameScriptPath,
      ['beta-template', '--dry-run'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Dry run completed');

    expect(readFileSync(readmePath, 'utf8')).toBe(readmeBefore);
    expect(readFileSync(sourcePath, 'utf8')).toBe(sourceBefore);
  });

  it('prints rename debug traces when --debug is provided', async () => {
    const tempRepoRoot = createTempDirectory('rename-project-debug-');
    temporaryDirectories.push(tempRepoRoot);

    const renameScriptPath = getRootPath('scripts', 'rename-project.js');

    writeFile(
      path.join(tempRepoRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'alpha-template',
          private: true,
        },
        null,
        2
      ) + '\n'
    );
    writeFile(
      path.join(tempRepoRoot, 'README.md'),
      'Project: alpha-template\n'
    );
    writeFile(
      path.join(tempRepoRoot, 'packages', 'dashboard', 'src', 'example.ts'),
      "export const scope = 'alpha-template';\n"
    );
    writeFile(
      path.join(
        tempRepoRoot,
        'packages',
        'dashboard',
        'src',
        'routeTree.gen.ts'
      ),
      "export const generated = 'alpha-template';\n"
    );

    const result = await runNodeScript(
      renameScriptPath,
      ['beta-template', '--dry-run', '--debug'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('[debug] Resolved repo root to');
    expect(result.stdout).toContain('[debug] Scanning directory .');
    expect(result.stdout).toContain('[debug] Queued candidate file README.md');
    expect(result.stdout).toContain(
      '[debug] Skipping ignored file packages/dashboard/src/routeTree.gen.ts'
    );
    expect(result.stdout).toContain(
      '[debug] Prepared 1 replacement in packages/dashboard/src/example.ts'
    );
  });

  it('renames expected files and skips generated/build outputs', async () => {
    const tempRepoRoot = createTempDirectory('rename-project-apply-');
    temporaryDirectories.push(tempRepoRoot);

    const renameScriptPath = getRootPath('scripts', 'rename-project.js');

    const readmePath = path.join(tempRepoRoot, 'README.md');
    const sourcePath = path.join(
      tempRepoRoot,
      'packages',
      'dashboard',
      'src',
      'example.ts'
    );
    const generatedPath = path.join(
      tempRepoRoot,
      'packages',
      'dashboard',
      'src',
      'routeTree.gen.ts'
    );
    const distPath = path.join(
      tempRepoRoot,
      'packages',
      'dashboard',
      'dist',
      'bundle.js'
    );

    writeFile(
      path.join(tempRepoRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'alpha-template',
          private: true,
        },
        null,
        2
      ) + '\n'
    );

    writeFile(readmePath, 'alpha-template docs\n');
    writeFile(sourcePath, "export const scope = 'alpha-template';\n");
    writeFile(generatedPath, "export const generated = 'alpha-template';\n");
    writeFile(distPath, "window.__bundle = 'alpha-template';\n");

    const result = await runNodeScript(
      renameScriptPath,
      ['alpha-template', 'beta-template'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(result.code).toBe(0);

    expect(readFileSync(readmePath, 'utf8')).toContain('beta-template');
    expect(readFileSync(sourcePath, 'utf8')).toContain('beta-template');
    expect(readFileSync(generatedPath, 'utf8')).toContain('alpha-template');
    expect(readFileSync(distPath, 'utf8')).toContain('alpha-template');
  });

  it('fails rename when no replacements are found', async () => {
    const tempRepoRoot = createTempDirectory('rename-project-missing-');
    temporaryDirectories.push(tempRepoRoot);

    const renameScriptPath = getRootPath('scripts', 'rename-project.js');

    writeFile(
      path.join(tempRepoRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'alpha-template',
          private: true,
        },
        null,
        2
      ) + '\n'
    );
    writeFile(path.join(tempRepoRoot, 'README.md'), 'alpha-template docs\n');

    const result = await runNodeScript(
      renameScriptPath,
      ['missing-template', 'beta-template', '--dry-run'],
      {
        REPO_ROOT: tempRepoRoot,
      }
    );

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('No replacements were made');
  });
});
