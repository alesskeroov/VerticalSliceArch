import type { TodoFilter } from '../types/todo';
import { LayoutGroup, motion } from 'motion/react';
import { useId } from 'react';
import { transition, useMotionPreference } from '../lib/motion';

type Props = { filter: TodoFilter; onChange: (filter: TodoFilter) => void };
const filters: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'Hamısı' },
  { value: 'active', label: 'Meydanda' },
  { value: 'completed', label: 'Qol' },
];

export default function FilterBar({ filter, onChange }: Props) {
  const scope = useId();
  const reduced = useMotionPreference();
  return (
    <LayoutGroup id={scope}><div className="filters" role="group" aria-label="Tapşırıq filtri">
      {filters.map(item => <button key={item.value} type="button"
        aria-pressed={filter === item.value} onClick={() => onChange(item.value)}>
        {filter === item.value && <motion.span className="filter-thumb" aria-hidden="true" layoutId="filter-indicator"
          transition={reduced ? { duration: 0 } : { ...transition, duration: 0.18 }} />}
        <span className="filter-label">{item.label}</span>
      </button>)}
    </div></LayoutGroup>
  );
}
