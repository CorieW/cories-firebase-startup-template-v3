/**
 * Tests small backend utilities.
 */
import { describe, expect, it } from 'vitest';
import { createUniqueToken } from '../src/utils/utils';

describe('createUniqueToken', () => {
  it('returns a token with the requested length', () => {
    const token = createUniqueToken(40);
    expect(token).toHaveLength(40);
  });

  it('creates alphanumeric tokens', () => {
    const token = createUniqueToken(64);
    expect(token).toMatch(/^[A-Za-z0-9]+$/);
  });
});
