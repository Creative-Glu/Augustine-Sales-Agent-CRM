import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';

vi.mock('@/services/augustine/roles.service', () => ({
  listRoles: vi.fn().mockResolvedValue([
    { role_id: '1', name: 'Pastor', description: 'Parish pastor' },
    { role_id: '2', name: 'Deacon', description: 'Parish deacon' },
  ]),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
}));

vi.mock('@/services/augustine/roleMappings.service', () => ({
  listRoleMappings: vi.fn().mockResolvedValue([]),
  createRoleMapping: vi.fn(),
  updateRoleMapping: vi.fn(),
  deleteRoleMapping: vi.fn(),
  applyRoleMappings: vi.fn(),
  listJobTitles: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import RolesPage from '@/app/(main)/roles/page';

describe('RolesPage', () => {
  it('renders the parish roles page header', () => {
    renderWithProviders(<RolesPage />);
    expect(screen.getByText(/parish role management/i)).toBeInTheDocument();
  });

  it('renders the roles section with table headers', () => {
    renderWithProviders(<RolesPage />);
    // "Name" and "Slug" appear as both table header and form label
    expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Slug').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the role mappings section', () => {
    renderWithProviders(<RolesPage />);
    // "Job Title" appears as table header and form label
    expect(screen.getAllByText('Job Title').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Parish Role').length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading states initially', () => {
    renderWithProviders(<RolesPage />);
    expect(screen.getByText(/loading roles/i)).toBeInTheDocument();
    expect(screen.getByText(/loading mappings/i)).toBeInTheDocument();
  });

  it('renders action buttons for creating roles and mappings', () => {
    renderWithProviders(<RolesPage />);
    // "New Role" / "New Mapping" may appear in button + form heading
    expect(screen.getAllByText(/new role/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/new mapping/i).length).toBeGreaterThanOrEqual(1);
  });
});
