/**
 * Tests canonical pricing route redirect behavior.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeConfigs = new Map<
  string,
  {
    beforeLoad?: (args: { location: { pathname: string } }) => Promise<unknown>;
    component?: unknown;
  }
>();

const mocks = vi.hoisted(() => ({
  enforceSignedOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@tanstack/react-router', () => ({
  createFileRoute:
    (path: string) =>
    (config: {
      beforeLoad: (args: {
        location: { pathname: string };
      }) => Promise<unknown>;
    }) => {
      routeConfigs.set(path, config);
      return config;
    },
  redirect: (payload: unknown) => payload,
}));

vi.mock('@/lib/auth', () => ({
  enforceSignedOut: mocks.enforceSignedOut,
}));

describe('route redirects', () => {
  async function expectRedirect(
    beforeLoad:
      | ((args: { location: { pathname: string } }) => Promise<unknown>)
      | undefined,
    pathname: string,
    to: string
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

    expect(thrown).toMatchObject({ to });
  }

  beforeEach(async () => {
    vi.resetModules();
    routeConfigs.clear();
    mocks.enforceSignedOut.mockClear();

    await import('@/routes/pricing');
    await import('@/routes/pricing.subscriptions');
    await import('@/routes/pricing.wallet');
    await import('@/routes/sign-in.$');
    await import('@/routes/sign-up.$');
  });

  it('redirects pricing index to subscriptions', async () => {
    await expectRedirect(
      routeConfigs.get('/pricing')?.beforeLoad,
      '/pricing',
      '/pricing/subscriptions'
    );
  });

  it('keeps generic subscriptions route on its own page', () => {
    const config = routeConfigs.get('/pricing/subscriptions');
    expect(config?.component).toBeDefined();
    expect(config?.beforeLoad).toBeUndefined();
  });

  it('keeps generic wallet route on its own page', () => {
    const config = routeConfigs.get('/pricing/wallet');
    expect(config?.component).toBeDefined();
    expect(config?.beforeLoad).toBeUndefined();
  });

  it('guards the sign-in entry route for authenticated users', async () => {
    mocks.enforceSignedOut.mockRejectedValueOnce({
      to: '/',
    });

    const beforeLoad = routeConfigs.get('/sign-in/$')?.beforeLoad;
    expect(beforeLoad).toBeDefined();

    await expect(
      beforeLoad?.({
        location: {
          pathname: '/sign-in',
        },
      })
    ).rejects.toEqual({
      to: '/',
    });

    expect(mocks.enforceSignedOut).toHaveBeenCalledWith('/sign-in');
  });

  it('guards the sign-up entry route for authenticated users', async () => {
    mocks.enforceSignedOut.mockRejectedValueOnce({
      to: '/',
    });

    const beforeLoad = routeConfigs.get('/sign-up/$')?.beforeLoad;
    expect(beforeLoad).toBeDefined();

    await expect(
      beforeLoad?.({
        location: {
          pathname: '/sign-up',
        },
      })
    ).rejects.toEqual({
      to: '/',
    });

    expect(mocks.enforceSignedOut).toHaveBeenCalledWith('/sign-up');
  });
});
