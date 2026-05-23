import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test-utils';
import { NewClientDialog } from '../components/forms/new-client-dialog';
import { NewPolicyDialog } from '../components/forms/new-policy-dialog';

vi.mock('../lib/api', () => ({
  customerApi: {
    create: vi.fn().mockResolvedValue({ id: 1 }),
  },
  policyApi: {
    create: vi.fn().mockResolvedValue({ id: 1 }),
  },
  emailStorage: {
    get: vi.fn().mockReturnValue('agent@test.com'),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NewClientDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields when open', () => {
    renderWithProviders(<NewClientDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    // Email label is "Email" with htmlFor="nc-email"
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Israeli ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
  });

  it('does not render fields when closed', () => {
    renderWithProviders(<NewClientDialog open={false} onOpenChange={() => {}} />);
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
  });

  it('shows Required validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewClientDialog open={true} onOpenChange={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Create Client/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByText('Required');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewClientDialog open={true} onOpenChange={() => {}} />);

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'not-an-email');
    // blur to trigger validation
    fireEvent.blur(emailInput);

    // Submit the form
    const form = document.querySelector('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Valid email required')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows Israeli ID validation error for non-9-digit input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewClientDialog open={true} onOpenChange={() => {}} />);

    const idInput = screen.getByLabelText('Israeli ID');
    await user.type(idInput, '12345');

    const submitButton = screen.getByRole('button', { name: /Create Client/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Must be exactly 9 digits')).toBeInTheDocument();
    });
  });

  it('renders Cancel button', () => {
    renderWithProviders(<NewClientDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(<NewClientDialog open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dialog title is visible', () => {
    renderWithProviders(<NewClientDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByText('New Client')).toBeInTheDocument();
  });
});

describe('NewPolicyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields when open', () => {
    renderWithProviders(<NewPolicyDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByLabelText('Customer ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Customer Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByLabelText(/Premium/i)).toBeInTheDocument();
  });

  it('does not render fields when closed', () => {
    renderWithProviders(<NewPolicyDialog open={false} onOpenChange={() => {}} />);
    expect(screen.queryByLabelText('Customer ID')).not.toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewPolicyDialog open={true} onOpenChange={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Create Policy/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByText('Required');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('shows error when customerId is not positive', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewPolicyDialog open={true} onOpenChange={() => {}} />);

    const customerIdInput = screen.getByLabelText('Customer ID');
    await user.type(customerIdInput, '-1');

    const submitButton = screen.getByRole('button', { name: /Create Policy/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Customer ID must be positive')).toBeInTheDocument();
    });
  });

  it('renders Cancel button', () => {
    renderWithProviders(<NewPolicyDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(<NewPolicyDialog open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dialog title is visible', () => {
    renderWithProviders(<NewPolicyDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByText('New Policy')).toBeInTheDocument();
  });
});
