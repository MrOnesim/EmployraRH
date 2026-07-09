import { type ReactNode } from 'react';
import Spinner from './Spinner';
import { cn } from '../../utils/cn';

interface LoadingButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50',
  secondary: 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 disabled:opacity-50',
  ghost: 'text-gray-600 hover:bg-surface disabled:opacity-50',
};

export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  className,
  onClick,
  type = 'button',
  variant = 'primary',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-[0.98]',
        variantClasses[variant],
        className,
      )}
    >
      {loading && <Spinner size="sm" className="shrink-0" />}
      {children}
    </button>
  );
}
