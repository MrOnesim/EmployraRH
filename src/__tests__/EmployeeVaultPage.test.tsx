import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmployeeVaultPage from '../pages/EmployeeVaultPage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: 'emp1', firstName: 'Kofi', lastName: 'Mensah' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    vaultItems: [
      { id: '1', employeeId: 'emp1', type: 'contract', name: 'Passeport', uploadedAt: new Date(), status: 'active' as const },
    ],
    addVaultItem: vi.fn(),
    deleteVaultItem: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('EmployeeVaultPage', () => {
  it('renders title and add button', () => {
    render(<EmployeeVaultPage />);
    expect(screen.getByText('Coffre-fort numérique')).toBeInTheDocument();
    expect(screen.getByText('Ajouter')).toBeInTheDocument();
  });

  it('shows filter categories', () => {
    render(<EmployeeVaultPage />);
    expect(screen.getByText('Tous')).toBeInTheDocument();
    expect(screen.getAllByText('Contrat').length).toBeGreaterThanOrEqual(1);
  });
});
