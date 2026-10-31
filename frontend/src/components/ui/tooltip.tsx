import type { ComponentProps } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export function TooltipContent({ children, sideOffset = 8, ...props }: ComponentProps<typeof TooltipPrimitive.Content>) {
  return <TooltipPrimitive.Portal><TooltipPrimitive.Content className="tooltip-content" sideOffset={sideOffset} {...props}>
    {children}<TooltipPrimitive.Arrow className="tooltip-arrow" />
  </TooltipPrimitive.Content></TooltipPrimitive.Portal>;
}
