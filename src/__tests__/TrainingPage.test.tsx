import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrainingPage from '../pages/TrainingPage';

vi.mock('../hooks/usePageLoading', () => ({ usePageLoading: () => false }));

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: '1', firstName: 'Kofi', lastName: 'Mensah' },
  }),
}));

vi.mock('../context/DataContext', () => ({
  useData: () => ({
    courses: [
      {
        id: '1',
        title: 'Introduction à React',
        description: 'Apprenez les bases de React',
        category: 'Développement',
        duration: 20,
        instructor: 'Kwame Adjei',
        enrolledCount: 3,
        lessons: [
          {
            id: 'l1',
            courseId: '1',
            title: 'Les fondamentaux',
            content: 'JSX',
            duration: 4,
            order: 1,
          },
        ],
        createdAt: new Date('2024-06-01'),
      },
    ],
    enrollments: [],
    quizzes: [],
    certificates: [],
    enrollCourse: vi.fn(),
    updateLessonProgress: vi.fn(),
    submitQuizAttempt: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('TrainingPage', () => {
  it('renders tabs', () => {
    render(<TrainingPage />);
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByText('Mes formations')).toBeInTheDocument();
  });

  it('shows course cards', () => {
    render(<TrainingPage />);
    expect(screen.getByText('Introduction à React')).toBeInTheDocument();
    expect(screen.getByText('Kwame Adjei')).toBeInTheDocument();
  });
});
