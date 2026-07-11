import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BankingPage from '../pages/BankingPage';

vi.mock('../hooks/usePageLoading', () => ({ usePageLoading: () => false }));

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentCompany: { id: '1', name: 'GlobalTech' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    bankAccounts: [
      {
        id: '1',
        companyId: '1',
        bankName: 'Global Bank',
        accountName: 'Compte Principal',
        accountNumber: 'TG1234567890',
        iban: 'TG53 ECOB 0001 2345 6789 0',
        swift: 'ECOCTGTG',
        currency: 'FCFA',
        isMobileMoney: false,
        isDefault: true,
      },
    ],
    transactions: [
      {
        id: '1',
        companyId: '1',
        type: 'deposit' as const,
        amount: 5000000,
        currency: 'FCFA',
        description: 'Dépôt initial',
        reference: 'DEP-001',
        status: 'completed' as const,
        date: new Date('2024-01-15'),
        accountId: '1',
      },
    ],
    addBankAccount: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('BankingPage', () => {
  it('renders tab buttons', () => {
    render(<BankingPage />);
    expect(screen.getByText('Comptes bancaires')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('renders bank account list when data is provided', () => {
    render(<BankingPage />);
    expect(screen.getByText('Global Bank')).toBeInTheDocument();
    expect(screen.getByText('Compte Principal')).toBeInTheDocument();
  });

  it('renders Ajouter un compte button', () => {
    render(<BankingPage />);
    expect(screen.getByText('Ajouter un compte')).toBeInTheDocument();
  });
});
