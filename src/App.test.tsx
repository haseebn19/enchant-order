import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('shows workspace title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Build your setup', level: 2 })).toBeDefined();
  });
});
