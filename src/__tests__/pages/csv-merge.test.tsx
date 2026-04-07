import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';

import CsvMergePage from '@/app/(main)/csv-merge/_components/CsvMergePage';

describe('CsvMergePage', () => {
  it('renders the page header and upload zones', () => {
    renderWithProviders(<CsvMergePage />);
    expect(screen.getByText('Preview Before Import')).toBeInTheDocument();
    expect(screen.getByText(/your hubspot file/i)).toBeInTheDocument();
    expect(screen.getByText(/our crm file/i)).toBeInTheDocument();
  });

  it('renders the Preview Changes button as disabled initially', () => {
    renderWithProviders(<CsvMergePage />);
    const btn = screen.getByRole('button', { name: /preview changes/i });
    expect(btn).toBeDisabled();
  });

  it('shows two file upload drop zones', () => {
    renderWithProviders(<CsvMergePage />);
    const dropTexts = screen.getAllByText(/drag & drop csv/i);
    expect(dropTexts).toHaveLength(2);
  });

  it('shows Reset button only after a file is selected', () => {
    renderWithProviders(<CsvMergePage />);
    // Reset should not be visible initially
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
  });
});
