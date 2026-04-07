/**
 * Tests admin router creation behavior.
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRouter: vi.fn(() => ({ __router: true })),
}));

vi.mock('@tanstack/react-router', () => ({
  createRouter: mocks.createRouter,
}));

vi.mock('@/routeTree.gen', () => ({
  routeTree: { id: 'root' },
}));

describe('getRouter', () => {
  it('uses root not-found mode so unknown nested paths render the global 404', async () => {
    const { getRouter } = await import('@/router');

    getRouter();

    expect(mocks.createRouter).toHaveBeenCalledWith(
      expect.objectContaining({
        notFoundMode: 'root',
      })
    );
  });
});
