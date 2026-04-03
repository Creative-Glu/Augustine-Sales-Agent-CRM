import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import type { ExecutionStats } from '@/services/execution/stats.service';

import ExecutionKpiDashboard from '@/app/(main)/execution-dashboard/_components/ExecutionKpiDashboard';

const mockStats: ExecutionStats = {
  jobs: { total: 42, pending: 2, running: 1, completed: 35, failed: 4 },
  websites: { total: 1500, success: 1200, failed: 50, processing: 10, pending: 5, missingUrl: 200, other: 35 },
  results: { total: 800, success: 700, error: 100 },
  institutions: 350,
  staff: 1200,
  institutionSync: { eligible: 300, synced: 280, failed: 5 },
  staffSync: { eligible: 1000, synced: 950, failed: 10 },
};

const defaultProps = {
  stats: mockStats,
  recentJobs: [],
  recentFailedResults: [],
  isLoading: false,
  isRecentJobsLoading: false,
  isRecentFailedResultsLoading: false,
  isError: false,
  onRetry: () => {},
};

describe('ExecutionKpiDashboard', () => {
  it('renders the attention alert when there are failures', () => {
    renderWithProviders(<ExecutionKpiDashboard {...defaultProps} />);
    expect(screen.getByText(/needs attention/i)).toBeInTheDocument();
    expect(screen.getByText(/4 failed jobs/i)).toBeInTheDocument();
  });

  it('displays pipeline section headers', () => {
    renderWithProviders(<ExecutionKpiDashboard {...defaultProps} />);
    expect(screen.getByText(/pipeline/i)).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(<ExecutionKpiDashboard {...defaultProps} isLoading={true} stats={undefined} />);
    expect(screen.getByText(/loading kpi dashboard/i)).toBeInTheDocument();
  });

  it('renders without crashing when stats are provided', () => {
    const { container } = renderWithProviders(<ExecutionKpiDashboard {...defaultProps} />);
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });
});
