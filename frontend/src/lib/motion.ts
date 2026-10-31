import { useReducedMotion } from 'motion/react';

export const easeOut = [0.16, 1, 0.3, 1] as const;
export const transition = { duration: 0.22, ease: easeOut };
export function useMotionPreference() { return useReducedMotion() === true; }
