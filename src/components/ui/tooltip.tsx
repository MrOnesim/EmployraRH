import * as React from 'react';
import { cn } from '../../utils/cn';

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, asChild, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  return <button type="button" {...props}>{children}</button>;
}

export function TooltipContent({ className, side = 'right', children, ...props }: React.ComponentProps<'div'> & { side?: string }) {
  return <div className={cn('z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm shadow-md', className)} {...props}>{children}</div>;
}
