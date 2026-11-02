import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import en from '../public/languages/en.json';
import App from './App';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(en)))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('finds a merge order for the chosen enchantments', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Sword' }));
    const sharpness = screen.getByRole('button', { name: 'Sharpness 5' });
    fireEvent.click(sharpness);
    fireEvent.click(screen.getByRole('button', { name: 'Unbreaking 3' }));
    expect(sharpness.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('2 selected')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));

    const steps = await screen.findAllByRole('listitem');
    expect(steps.map((step) => step.textContent?.trim())).toEqual([
      'Combine Sword with Book (Sharpness 5)Cost: 5 levels (55 xp), Prior Work Penalty: 1 level',
      'Combine Sword (Sharpness 5) with Book (Unbreaking 3)Cost: 4 levels (40 xp), Prior Work Penalty: 3 levels',
    ]);
  });

  it('swaps out an enchantment that is incompatible with the new one', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Sword' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sharpness 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Smite 5' }));

    expect(screen.getByRole('button', { name: 'Sharpness 5' }).getAttribute('aria-pressed')).toBe(
      'false'
    );
    expect(screen.getByRole('button', { name: 'Smite 5' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    expect(within(screen.getByRole('main')).getByText('1 selected')).toBeDefined();
  });
});
