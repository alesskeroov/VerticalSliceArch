import { useEffect, useState } from 'react';
import { WEEKLY_GOAL } from '../constants';
import type { Todo } from '../types/todo';
import { YellowCardIcon } from './icons';

export default function SeasonProgress({ todos }: { todos: Todo[] }) {
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
    <section className={`season-progress ${reached ? 'goal-reached' : ''}`} aria-label="Həftəlik hədəf">
      <div className="progress-label"><span>HƏFTƏLİK HƏDƏF</span><span>{completed} / {WEEKLY_GOAL}</span></div>
      <div className="progress-track" role="progressbar" aria-label="Həftəlik hədəf"
        aria-valuemin={0} aria-valuemax={WEEKLY_GOAL} aria-valuenow={Math.min(completed, WEEKLY_GOAL)}
        aria-valuetext={`${completed} / ${WEEKLY_GOAL} tapşırıq`}>
        <span style={{ width: `${Math.min(completed / WEEKLY_GOAL, 1) * 100}%` }} />
      </div>
      {reached && <p className="target-reached"><YellowCardIcon /> Hədəf tamamlandı</p>}
    </section>
  );
}
