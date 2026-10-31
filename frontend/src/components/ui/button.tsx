import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// shadcn/ui's composable button pattern: native button semantics, optional Slot.
const buttonVariants = cva('ui-button inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: { default: 'button-primary', ghost: 'button-ghost', outline: 'button-outline', destructive: 'button-destructive' },
    size: { default: 'button-default', icon: 'button-icon', small: 'button-small' },
  }, defaultVariants: { variant: 'default', size: 'default' },
});
type Props = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };
export function Button({ className, variant, size, asChild = false, type = 'button', ...props }: Props) {
  const Component = asChild ? Slot : 'button';
  return <Component data-slot="button" type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
