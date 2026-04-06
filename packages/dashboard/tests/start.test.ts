/**
 * Tests dashboard bootstrap wiring.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createStart: vi.fn((factory: () => unknown) => {
    factory();
    return { started: true };
  }),
}));

vi.mock('@tanstack/react-start', () => ({
  createStart: mocks.createStart,
}));

describe('start bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.createStart.mockClear();
  });

  it('creates the TanStack Start app instance once', async () => {
    const startModule = await import('@/start');

    expect(mocks.createStart).toHaveBeenCalledTimes(1);
    expect(startModule.startInstance).toEqual({ started: true });
  });
});
