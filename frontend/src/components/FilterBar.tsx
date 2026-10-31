import type { TodoFilter } from '../types/todo';

type Props = { filter: TodoFilter; onChange: (filter: TodoFilter) => void };
const filters: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'Hamısı' },
  { value: 'active', label: 'Meydanda' },
  { value: 'completed', label: 'Qol' },
];

export default function FilterBar({ filter, onChange }: Props) {
  const selectedIndex = filters.findIndex(item => item.value === filter);
  return (
    <div className="filters" role="group" aria-label="Tapşırıq filtri">
      {/* Eyni tablet yerini dəyişir; hər seçimdə ayrıca animasiya yaranmır. */}
      <span className="filter-thumb" aria-hidden="true"
        style={{ transform: `translateX(${selectedIndex * 100}%)` }} />
      {filters.map(item => <button key={item.value} type="button"
        aria-pressed={filter === item.value} onClick={() => onChange(item.value)}>
        {item.label}
      </button>)}
    </div>
  );
}
