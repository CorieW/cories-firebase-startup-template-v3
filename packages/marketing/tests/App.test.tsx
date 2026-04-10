/**
 * Smoke tests for the marketing page shell.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('Marketing App', () => {
  it('renders the slideshow hero and pricing handoff links', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /launch the site your dashboard deserves/i,
      })
    ).toBeTruthy();

    expect(
      screen.getByRole('heading', {
        name: /marketing pricing now hands off to the live billing flow/i,
      })
    ).toBeTruthy();

    expect(
      screen.getByRole('link', {
        name: /open subscriptions/i,
      })
    ).toBeTruthy();

    expect(
      screen
        .getByRole('link', {
          name: /open subscriptions/i,
        })
        .getAttribute('href')
    ).toBe('http://localhost:3001/pricing/subscriptions');

    expect(
      screen
        .getByRole('link', {
          name: /open wallet billing/i,
        })
        .getAttribute('href')
    ).toBe('http://localhost:3001/pricing/wallet');

    expect(
      screen.getByRole('button', {
        name: /conversion-focused handoff/i,
      })
    ).toBeTruthy();
  });
});
