/**
 * Tests canonical support route redirect behavior.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeConfigs = new Map<
  string,
  {
    beforeLoad?: (args: { location: { pathname: string } }) => Promise<unknown>;
    component?: unknown;
  }
>();

vi.mock('@tanstack/react-router', () => ({
  createFileRoute:
    (path: string) =>
    (config: {
      beforeLoad?: (args: {
        location: { pathname: string };
      }) => Promise<unknown>;
      component?: unknown;
    }) => {
      routeConfigs.set(path, config);
      return config;
    },
  redirect: (payload: unknown) => payload,
}));

describe('support route redirects', () => {
  async function expectRedirect(
    beforeLoad:
      | ((args: { location: { pathname: string } }) => Promise<unknown>)
      | undefined,
    pathname: string,
    expectedRedirect: {
      to: string;
      search?: Record<string, string>;
    }
  ) {
    expect(beforeLoad).toBeDefined();

    let thrown: unknown;
    try {
      await beforeLoad?.({
        location: {
          pathname,
        },
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toMatchObject(expectedRedirect);
  }

  beforeEach(async () => {
    vi.resetModules();
    routeConfigs.clear();

    await import('@/routes/support');
    await import('@/routes/support.contact');
    await import('@/routes/support.docs');
  });

  it('redirects support index to docs', async () => {
    await expectRedirect(routeConfigs.get('/support')?.beforeLoad, '/support', {
      to: '/support/docs',
    });
  });

  it('redirects the contact route to contact-support chat', async () => {
    await expectRedirect(
      routeConfigs.get('/support/contact')?.beforeLoad,
      '/support/contact',
      {
        to: '/chat',
        search: {
          source: 'contact-support',
        },
      }
    );
  });

  it('keeps the docs route on its own page', () => {
    const config = routeConfigs.get('/support/docs');
    expect(config?.component).toBeDefined();
    expect(config?.beforeLoad).toBeUndefined();
  });
});
