import * as React from 'react';
import { cn } from '../../utils/cn';

export function Sheet({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }) {
  if (open) onOpenChange?.(false);
  return <>{children}</>;
}

export function SheetContent({ side = 'right', className, children, ...props }: React.ComponentProps<'div'> & { side?: 'left' | 'right' }) {
  return (
    <div className={cn('fixed inset-y-0 right-0 z-50 w-3/4 bg-white p-6 shadow-lg border-l sm:max-w-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
