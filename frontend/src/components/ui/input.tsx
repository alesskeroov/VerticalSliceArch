import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input data-slot="input" className={cn('ui-input w-full min-w-0 disabled:cursor-not-allowed disabled:opacity-60', className)} {...props} />;
}
