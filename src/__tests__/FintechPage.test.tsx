import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FintechPage from '../pages/FintechPage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: 'emp1', firstName: 'Kofi', lastName: 'Mensah' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    salaryAdvances: [],
    salaryTransfers: [],
    employees: [{ id: 'emp1', firstName: 'Kofi', lastName: 'Mensah', salary: 1000000 }],
    requestSalaryAdvance: vi.fn(),
    approveSalaryAdvance: vi.fn(),
    paySalaryAdvance: vi.fn(),
    rejectSalaryAdvance: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('FintechPage', () => {
  it('renders tabs', () => {
    render(<FintechPage />);
    expect(screen.getByText('Avances sur salaire')).toBeInTheDocument();
    expect(screen.getByText('Transferts')).toBeInTheDocument();
  });

  it('shows request advance button', () => {
    render(<FintechPage />);
    expect(screen.getByText('Demander une avance')).toBeInTheDocument();
  });
});
