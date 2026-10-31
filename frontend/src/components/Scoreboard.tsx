import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import { transition, useMotionPreference } from '../lib/motion';

type Props = { completed: number; remaining: number; animate: boolean };

function ScoreNumber({ value }: { value: number }) {
  const reduced = useMotionPreference();
  return <span className="score-number"><AnimatePresence initial={false} mode="popLayout">
    <motion.strong key={value} initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -6 }} transition={{ ...transition, duration: 0.18 }}>{value}</motion.strong>
  </AnimatePresence></span>;
}

export default function Scoreboard({ completed, remaining, animate }: Props) {
  // Bəzi brauzerlərdə az-AZ tarix məlumatı yoxdur; ay və gün adlarını açıq saxlayırıq.
  const now = new Date();
  const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const date = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return (
    <section className="scoreboard" aria-label="Oyun tablosu">
      <div className="match-meta"><CalendarDays size={14} aria-hidden="true" /><time dateTime={isoDate}>{date}</time><span className="match-live"><i aria-hidden="true" />OYUN DAVAM EDİR</span></div>
      <div className={`score-display ${animate ? 'score-update' : ''}`} aria-hidden="true">
        <div className="score-side"><ScoreNumber value={completed} /><span>QOL</span></div>
        <span className="score-divider">:</span>
        <div className="score-side"><ScoreNumber value={remaining} /><span>QALAN</span></div>
      </div>
      <span className="visually-hidden" aria-live="polite" aria-atomic="true">
        {completed} qol, {remaining} tapşırıq qalıb
      </span>
      <p className="score-caption">Hər tamamlanan tapşırıq bir qoldur.</p>
    </section>
  );
}
