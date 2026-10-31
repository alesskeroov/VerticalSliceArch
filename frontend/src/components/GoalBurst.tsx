import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

type Props = { kind: 'label' | 'particles' };

export default function GoalBurst({ kind }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    // Hissəciklər bitəndə DOM-dan çıxır; daimi animasiya saxlamırıq.
    const timer = window.setTimeout(() => setVisible(false), kind === 'label' ? 1000 : 700);
    return () => window.clearTimeout(timer);
  }, [kind]);
  if (!visible) return null;
  if (kind === 'label') return <span className="goal-label" aria-hidden="true">QOL!</span>;
  return <span className="goal-burst" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => {
    // Sabit bucaqlar kiçik effekti təsadüfi və ağır hesablamalar olmadan yaradır.
    const angle = index * Math.PI * 2 / 14;
    const style = { '--x': `${Math.cos(angle) * 42}px`, '--y': `${Math.sin(angle) * 34 - 12}px`,
      '--rotation': `${index * 40}deg` } as CSSProperties;
    return <i key={index} style={style} />;
  })}</span>;
}
