import { cn } from '../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const variantMap = {
  blue: 'bg-primary/10 text-primary dark:text-blue-300',
  green: 'bg-success/10 text-success dark:text-green-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  gray: 'bg-surface text-gray-700 dark:text-gray-300',
};

export default function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', variantMap[variant], className)}>
      {children}
    </span>
  );
}
