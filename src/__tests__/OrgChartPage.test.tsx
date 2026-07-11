import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrgChartPage from '../pages/OrgChartPage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({}),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    employees: [
      {
        id: '1',
        firstName: 'Kofi',
        lastName: 'Mensah',
        email: 'admin@globaltech.com',
        position: 'Directeur Général',
        department: 'Direction',
        role: 'admin' as const,
        phone: '+228 90 12 34 56',
      },
      {
        id: '2',
        firstName: 'Ama',
        lastName: 'Gbeko',
        email: 'ama@globaltech.com',
        position: 'Responsable RH',
        department: 'Ressources Humaines',
        role: 'employee' as const,
        phone: '',
      },
    ],
  }),
}));

describe('OrgChartPage', () => {
  it('renders search input', () => {
    render(<OrgChartPage />);
    expect(
      screen.getByPlaceholderText('Rechercher un employé, département ou poste...'),
    ).toBeInTheDocument();
  });

  it('shows employee cards', () => {
    render(<OrgChartPage />);
    expect(screen.getByText('Kofi Mensah')).toBeInTheDocument();
    expect(screen.getByText('Ama Gbeko')).toBeInTheDocument();
  });
});
