import { useEffect, useState } from 'react';
import { WEEKLY_GOAL } from '../constants';
import type { Todo } from '../types/todo';
import { Target, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { transition, useMotionPreference } from '../lib/motion';

export default function SeasonProgress({ todos }: { todos: Todo[] }) {
  const reduced = useMotionPreference();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    // Yeni tamamlanma dərhal sayılsın; növbəti dəqiqəni gözləməsin.
    setNow(new Date());
    // Səhifə gecə açıq qalsa da, həftənin sərhədi yenilənsin.
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, [todos]);
  // Həftə istifadəçinin yerli vaxtı ilə bazar ertəsi 00:00-da başlayır.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const completed = todos.filter(todo => {
    if (!todo.isCompleted || !todo.completedAt) return false;
    // SQL-dən gələn UTC tarixində zona işarəsi yoxdursa, onu açıq əlavə edirik.
    const value = todo.completedAt;
    const timestamp = new Date(/Z$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
    return timestamp >= start && timestamp <= now;
  }).length;
  const reached = completed >= WEEKLY_GOAL;
  return (
    <motion.section className={`season-progress ${reached ? 'goal-reached' : ''}`} aria-label="Həftəlik hədəf"
      initial={{ opacity: 0, y: reduced ? 0 : 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={transition}>
      <div className="progress-heading"><span className="progress-icon"><Target size={19} aria-hidden="true" /></span>
        <div className="progress-label"><span>HƏFTƏLİK HƏDƏF</span><p>Kiçik addımlar, böyük nəticələr.</p></div>
        <span className="progress-count"><strong>{completed}</strong><span> / {WEEKLY_GOAL}</span></span></div>
      <div className="progress-track" role="progressbar" aria-label="Həftəlik hədəf"
        aria-valuemin={0} aria-valuemax={WEEKLY_GOAL} aria-valuenow={Math.min(completed, WEEKLY_GOAL)}
        aria-valuetext={`${completed} / ${WEEKLY_GOAL} tapşırıq`}>
        <motion.span initial={false} animate={{ scaleX: Math.min(completed / WEEKLY_GOAL, 1) }} transition={reduced ? { duration: 0 } : transition} />
      </div>
      {reached && <p className="target-reached"><Trophy size={15} aria-hidden="true" /> Hədəf tamamlandı</p>}
    </motion.section>
  );
}
