/**
 * Tests shared message catalog behavior.
 */
import { describe, expect, it } from 'vitest';
import {
  getCommonMessages,
  hasCommonMessage,
  resolveCommonMessage,
  translateCommonMessage,
} from '../src/messages';

describe('messages', () => {
  it('uses english defaults by default', () => {
    expect(resolveCommonMessage('errors.unknown')).toBeDefined();
  });

  it('returns a shared english message map', () => {
    expect(getCommonMessages()['errors.unknown']).toBeTypeOf('string');
  });

  it('translates with interpolation and preserves unresolved placeholders', () => {
    expect(
      translateCommonMessage('Welcome {name} from {city}', { name: 'Alice' })
    ).toBe('Welcome Alice from {city}');
  });

  it('returns raw key when translation key does not exist', () => {
    expect(translateCommonMessage('non.existent.key')).toBe('non.existent.key');
    expect(hasCommonMessage('non.existent.key')).toBe(false);
  });
});
