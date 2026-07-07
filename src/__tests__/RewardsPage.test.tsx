import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RewardsPage from '../pages/RewardsPage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: 'emp1', firstName: 'Kofi', lastName: 'Mensah', employeePoints: 500, totalEarned: 1000, totalRedeemed: 500 },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    rewardCatalog: [
      { id: 'r1', name: 'Carte Amazon', description: 'Carte cadeau Amazon 50€', pointsCost: 500, category: 'gift-card' as const, stock: 10, active: true },
    ],
    rewardTransactions: [],
    employees: [{ id: 'emp1', firstName: 'Kofi', lastName: 'Mensah', email: 'kofi@test.com' }],
    addRewardTransaction: vi.fn(),
    redeemReward: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('RewardsPage', () => {
  it('renders title and tabs', () => {
    render(<RewardsPage />);
    expect(screen.getByText('Système de récompenses')).toBeInTheDocument();
    expect(screen.getByText('Historique')).toBeInTheDocument();
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
  });

  it('shows points balance', () => {
    render(<RewardsPage />);
    expect(screen.getByText('Votre solde de points')).toBeInTheDocument();
  });
});
