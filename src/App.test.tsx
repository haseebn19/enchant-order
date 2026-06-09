import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('shows workspace title', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('heading', { name: 'Build your setup', level: 2 })).toBeDefined();
  });
});
