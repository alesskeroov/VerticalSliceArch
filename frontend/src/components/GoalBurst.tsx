import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { transition, useMotionPreference } from '../lib/motion';

type Props = { kind: 'label' | 'particles' };

export default function GoalBurst({ kind }: Props) {
  const [visible, setVisible] = useState(true);
  const reduced = useMotionPreference();
  useEffect(() => {
    // Hissəciklər bitəndə DOM-dan çıxır; daimi animasiya saxlamırıq.
    const timer = window.setTimeout(() => setVisible(false), 300);
    return () => window.clearTimeout(timer);
  }, [kind]);
  if (!visible || reduced) return null;
  if (kind === 'label') return <motion.span className="goal-label" aria-hidden="true" initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: [0, 1, 0], y: [4, 0, -4] }} transition={{ ...transition, duration: 0.3 }}>QOL!</motion.span>;
  return <span className="goal-burst" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => {
    // Sabit bucaqlar kiçik effekti təsadüfi və ağır hesablamalar olmadan yaradır.
    const angle = index * Math.PI * 2 / 8;
    return <motion.i key={index} initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], x: Math.cos(angle) * 24, y: Math.sin(angle) * 24 - 4, rotate: index * 35 }}
      transition={{ ...transition, duration: 0.28 }} />;
  })}</span>;
}
