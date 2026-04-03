import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';

import Sidebar from '@/components/Sidebar';

describe('Sidebar', () => {
  it('renders the Augustine logo', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByAltText(/augustine institute/i)).toBeInTheDocument();
  });

  it('renders navigation group labels', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    // "Admin" appears as both nav group label and user role — check both exist
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(2);
  });

  it('renders key navigation links', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders the user info section', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
    // Role "Admin" also appears as nav group label
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the sign out button', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('renders the user avatar with first initial', () => {
    renderWithProviders(<Sidebar />);
    // The avatar should show "T" for "Test Admin"
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
