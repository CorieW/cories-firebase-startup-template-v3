/**
 * Tests dashboard auth guard helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authLogger: {
    action: vi.fn(),
    log: vi.fn(),
  },
  redirect: vi.fn((payload: unknown) => payload),
  createFileRoute: vi.fn(() => vi.fn(() => ({}))),
}));

vi.mock('@tanstack/react-router', () => ({
  redirect: mocks.redirect,
  createFileRoute: mocks.createFileRoute,
}));

vi.mock('@cories-firebase-startup-template-v3/common', async () => {
  const actual = await vi.importActual<
    typeof import('@cories-firebase-startup-template-v3/common')
  >('@cories-firebase-startup-template-v3/common');

  return {
    ...actual,
    createScopedLogger: () => mocks.authLogger,
  };
});

import {
  enforceActiveOrganization,
  enforceAuthentication,
  enforceNoActiveOrganization,
  enforceSignedOut,
} from '@/lib/auth';

describe('enforceAuthentication', () => {
  beforeEach(() => {
    mocks.redirect.mockClear();
    mocks.authLogger.action.mockClear();
    mocks.authLogger.log.mockClear();
  });

  it('skips auth checks for public routes', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      orgId: null,
      userId: 'user_1',
    });

    await expect(enforceAuthentication('/sign-in', readAuthState)).resolves.toBeUndefined();
    expect(readAuthState).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users away from protected routes', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      orgId: null,
    });

    await expect(enforceAuthentication('/pricing', readAuthState)).rejects.toEqual({
      params: {
        _splat: '',
      },
      to: '/sign-in/$',
    });

    expect(mocks.redirect).toHaveBeenCalledWith({
      params: {
        _splat: '',
      },
      to: '/sign-in/$',
    });
    expect(mocks.authLogger.action).toHaveBeenCalledWith(
      'enforceAuthenticationRedirect',
      expect.objectContaining({
        pathname: '/pricing',
        redirectTo: '/sign-in/$',
      }),
      'warn'
    );
  });

  it('allows authenticated users on protected routes', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: null,
    });

    await expect(
      enforceAuthentication('/pricing', readAuthState)
    ).resolves.toBeUndefined();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe('enforceActiveOrganization', () => {
  beforeEach(() => {
    mocks.redirect.mockClear();
  });

  it('redirects unauthenticated users to sign-in', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      orgId: null,
    });

    await expect(
      enforceActiveOrganization('/pricing/subscriptions', readAuthState)
    ).rejects.toEqual({
      params: {
        _splat: '',
      },
      to: '/sign-in/$',
    });

    expect(mocks.redirect).toHaveBeenCalledWith({
      params: {
        _splat: '',
      },
      to: '/sign-in/$',
    });
  });

  it('redirects authenticated users without an active org to user billing', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: null,
    });

    await expect(
      enforceActiveOrganization('/pricing/subscriptions', readAuthState)
    ).rejects.toEqual({
      to: '/pricing',
    });

    expect(mocks.redirect).toHaveBeenCalledWith({
      to: '/pricing',
    });
  });

  it('allows authenticated users with an active org', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: 'org_1',
    });

    await expect(
      enforceActiveOrganization('/pricing/subscriptions', readAuthState)
    ).resolves.toBeUndefined();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe('enforceSignedOut', () => {
  beforeEach(() => {
    mocks.redirect.mockClear();
  });

  it('skips auth state checks for non-entry auth routes', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: null,
    });

    await expect(
      enforceSignedOut('/sign-in/reset-password', readAuthState)
    ).resolves.toBeUndefined();
    expect(readAuthState).not.toHaveBeenCalled();
  });

  it('redirects authenticated users away from auth entry routes', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: null,
    });

    await expect(enforceSignedOut('/sign-in', readAuthState)).rejects.toEqual({
      to: '/',
    });

    expect(mocks.redirect).toHaveBeenCalledWith({
      to: '/',
    });
  });

  it('allows signed-out users to reach auth entry routes', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      orgId: null,
    });

    await expect(enforceSignedOut('/sign-up', readAuthState)).resolves.toBeUndefined();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe('enforceNoActiveOrganization', () => {
  beforeEach(() => {
    mocks.redirect.mockClear();
  });

  it('redirects unauthenticated users to sign-in', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      orgId: null,
    });

    await expect(
      enforceNoActiveOrganization('/pricing/subscriptions', readAuthState)
    ).rejects.toEqual({
      params: {
        _splat: '',
      },
      to: '/sign-in/$',
    });

    expect(mocks.redirect).toHaveBeenCalledWith({
      params: {
        _splat: '',
      },
      to: '/sign-in/$',
    });
  });

  it('redirects authenticated users with an active org to organization billing', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: 'org_1',
    });

    await expect(
      enforceNoActiveOrganization('/pricing/subscriptions', readAuthState)
    ).rejects.toEqual({
      to: '/pricing',
    });

    expect(mocks.redirect).toHaveBeenCalledWith({
      to: '/pricing',
    });
  });

  it('allows authenticated users without an active org', async () => {
    const readAuthState = vi.fn().mockResolvedValue({
      isAuthenticated: true,
      userId: 'user_1',
      orgId: null,
    });

    await expect(
      enforceNoActiveOrganization('/pricing/subscriptions', readAuthState)
    ).resolves.toBeUndefined();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
