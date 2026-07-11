import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MissionsPage from '../pages/MissionsPage';

vi.mock('../hooks/usePageLoading', () => ({ usePageLoading: () => false }));

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: '1', firstName: 'Kofi', lastName: 'Mensah', role: 'admin' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    employees: [
      { id: '1', firstName: 'Kofi', lastName: 'Mensah' },
      { id: '2', firstName: 'Ama', lastName: 'Gbeko' },
    ],
    missions: [
      {
        id: '1',
        employeeId: '1',
        title: 'Déploiement client Abidjan',
        destination: "Abidjan, Côte d'Ivoire",
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        objectives: 'Installation et formation',
        transportType: 'Avion',
        budget: 1500000,
        status: 'approved' as const,
        approvedBy: '1',
        createdAt: new Date('2024-12-20'),
      },
    ],
    expenses: [],
    addMission: vi.fn(),
    updateMission: vi.fn(),
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('MissionsPage', () => {
  it('renders missions and notes de frais tabs', () => {
    render(<MissionsPage />);
    expect(screen.getByText('Missions')).toBeInTheDocument();
    expect(screen.getByText('Notes de frais')).toBeInTheDocument();
  });

  it('shows Nouvelle mission button', () => {
    render(<MissionsPage />);
    expect(screen.getByText('Nouvelle mission')).toBeInTheDocument();
  });
});
