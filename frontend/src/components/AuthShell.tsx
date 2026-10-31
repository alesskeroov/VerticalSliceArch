import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useAnimate } from 'motion/react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { transition, useMotionPreference } from '../lib/motion';
import Brand from './Brand';
import ThemeToggle from './ThemeToggle';

type Props = { title: string; titleId: string; description?: string; children: ReactNode; footer: ReactNode; errorCount?: number };
export default function AuthShell({ title, titleId, description, children, footer, errorCount = 0 }: Props) {
  const reduced = useMotionPreference();
  const [scope, animate] = useAnimate<HTMLElement>();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (errorCount && !reduced) void animate(scope.current, { x: [0, -3, 3, 0] }, transition);
  }, [errorCount, reduced, animate, scope]);
  return <main className="auth-page">
    <div className="auth-theme"><ThemeToggle /></div>
    <motion.div className="auth-composition" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
      <header className="auth-brand"><Brand heading /><span className="brand-tagline">Hər gün yeni bir oyun.</span></header>
      <section ref={scope} className="auth-card" aria-labelledby={titleId}>
        <div className="auth-eyebrow"><span className="live-dot" aria-hidden="true" /> SƏNİN MEYDANIN</div>
        <h2 id={titleId} ref={titleRef} tabIndex={-1}>{title}<ArrowUpRight size={22} aria-hidden="true" /></h2>
        {description && <p className="auth-description">{description}</p>}
        {children}
        <div className="auth-footer">{footer}</div>
      </section>
      <p className="auth-assurance"><ShieldCheck size={14} aria-hidden="true" />Tapşırıqların yalnız sənə görünür.</p>
    </motion.div>
  </main>;
}
