import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockLogin = vi.fn();
const mockPush = vi.fn();

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    accessToken: null,
    isInitializing: false,
    login: mockLogin,
    logout: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form with email and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the Augustine logo', () => {
    render(<LoginPage />);
    expect(screen.getByAltText(/augustine institute/i)).toBeInTheDocument();
  });

  it('shows password toggle button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('toggles password visibility on click', async () => {
    render(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'secret123');
    });
  });

  it('redirects on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('disables submit button while submitting', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('trims email before submitting', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), '  admin@test.com  ');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'secret');
    });
  });
});
