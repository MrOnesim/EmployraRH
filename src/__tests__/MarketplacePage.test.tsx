import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarketplacePage from '../pages/MarketplacePage';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentCompany: { id: '1', name: 'TechAfrique Solutions' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    jobPosts: [
      {
        id: '1',
        title: 'Développeur Full Stack',
        company: 'TechAfrique Solutions',
        companyId: '1',
        description: 'Développement applications web',
        requirements: 'React, Node.js',
        location: 'Lomé, Togo',
        type: 'CDI' as const,
        salary: '800K - 1.2M FCFA',
        category: 'Informatique',
        status: 'published' as const,
        featured: true,
        views: 245,
        applications: 12,
        createdAt: new Date('2024-12-01'),
        expiresAt: new Date('2025-02-01'),
      },
    ],
    addJobPost: vi.fn(),
    updateJobPost: vi.fn(),
    deleteJobPost: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('MarketplacePage', () => {
  it('renders offres publiées and marché emploi tabs', () => {
    render(<MarketplacePage />);
    expect(screen.getByText('Offres publiées')).toBeInTheDocument();
    expect(screen.getAllByText('Marché emploi')).toHaveLength(2);
  });
});
