import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignaturePage from '../pages/SignaturePage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: 'emp1', firstName: 'Kofi', lastName: 'Mensah' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    signatureRequests: [
      {
        id: 'sig1', documentName: 'Contrat Kofi Mensah', documentType: 'contract' as const,
        initiatedBy: 'admin1', initiatedByName: 'Admin', initiatedAt: new Date(), status: 'sent' as const,
        recipients: [{ employeeId: 'emp1', name: 'Kofi Mensah', email: 'kofi@test.com', status: 'pending' as const }],
      },
    ],
    signatureTemplates: [],
    employees: [{ id: 'emp1', firstName: 'Kofi', lastName: 'Mensah' }],
    sendSignatureRequest: vi.fn(),
    signSignatureRequest: vi.fn(),
    rejectSignature: vi.fn(),
    addSignatureTemplate: vi.fn(),
    deleteSignatureTemplate: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('SignaturePage', () => {
  it('renders title', () => {
    render(<SignaturePage />);
    expect(screen.getByText('Signature Électronique')).toBeInTheDocument();
  });

  it('shows pending recipient', () => {
    render(<SignaturePage />);
    expect(screen.getByText('Kofi Mensah')).toBeInTheDocument();
  });
});
