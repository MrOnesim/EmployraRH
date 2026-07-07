import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EquipmentPage from '../pages/EquipmentPage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: 'emp1', firstName: 'Kofi', lastName: 'Mensah' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    equipment: [
      { id: 'e1', name: 'MacBook Pro 16', type: 'computer', serialNumber: 'SN001', status: 'available', purchaseDate: new Date(), purchasePrice: 2500, assigneeId: undefined, condition: 'good', companyId: 'c1', notes: '' },
    ],
    equipmentAssignments: [],
    employees: [{ id: 'emp1', firstName: 'Kofi', lastName: 'Mensah' }],
    addEquipment: vi.fn(),
    assignEquipment: vi.fn(),
    returnEquipment: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('EquipmentPage', () => {
  it('renders title and add button', () => {
    render(<EquipmentPage />);
    expect(screen.getByText('Gestion du matériel')).toBeInTheDocument();
    expect(screen.getByText('Ajouter un équipement')).toBeInTheDocument();
  });
});
