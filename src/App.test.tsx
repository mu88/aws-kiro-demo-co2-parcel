import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('rendert die Startüberschrift', () => {
    render(<App />);
    expect(
      screen.getByText('CO2-Fussabdruck Paketversand'),
    ).toBeInTheDocument();
  });
});
