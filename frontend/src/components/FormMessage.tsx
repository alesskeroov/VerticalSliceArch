import { motion } from 'motion/react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { transition, useMotionPreference } from '../lib/motion';

export default function FormMessage({ children, success = false }: { children: ReactNode; success?: boolean }) {
  const reduced = useMotionPreference();
  const Icon = success ? CircleCheck : CircleAlert;
  return <motion.div className={success ? 'auth-success' : 'auth-error'} role={success ? 'status' : 'alert'}
    initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
    <Icon size={18} aria-hidden="true" /><span>{children}</span>
  </motion.div>;
}
