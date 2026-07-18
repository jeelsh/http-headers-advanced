import * as React from 'react';
import { cn } from '@/lib/utils';

function Alert({ className, variant = 'default', ...props }) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[16px_1fr] gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
        variant === 'default' && 'bg-background text-foreground',
        variant === 'destructive' && 'border-destructive/50 text-destructive bg-destructive/10 dark:border-destructive [&>svg]:text-destructive',
        variant === 'success' && 'border-green-500/50 text-green-700 bg-green-500/10 dark:border-green-500 dark:text-green-400',
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <h5
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-sm col-start-2 grid justify-items-start gap-1', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
