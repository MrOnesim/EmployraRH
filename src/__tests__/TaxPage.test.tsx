import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaxPage from '../pages/TaxPage';

vi.mock('../hooks/usePageLoading', () => ({ usePageLoading: () => false }));

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentCompany: { id: '1', name: 'GlobalTech' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    taxDeclarations: [
      {
        id: '1',
        companyId: '1',
        country: 'TG',
        period: '2024-Q4',
        type: 'IRPP',
        totalSalary: 5600000,
        totalTax: 840000,
        status: 'submitted' as const,
        dueDate: new Date('2025-01-15'),
        submittedAt: new Date('2025-01-10'),
      },
    ],
    employees: [{ id: '1', firstName: 'Kofi', lastName: 'Mensah', salary: 1500000 }],
    addTaxDeclaration: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('TaxPage', () => {
  it('renders tax declarations list', () => {
    render(<TaxPage />);
    expect(screen.getByText('IRPP')).toBeInTheDocument();
    expect(screen.getByText('2024-Q4')).toBeInTheDocument();
  });

  it('shows Nouvelle déclaration button', () => {
    render(<TaxPage />);
    expect(screen.getByText('Nouvelle déclaration')).toBeInTheDocument();
  });
});
