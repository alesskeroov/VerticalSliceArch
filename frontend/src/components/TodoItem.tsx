import { useState } from 'react';
import type { Todo } from '../types/todo';
import { Check, Pencil, CheckCheck, X } from 'lucide-react';
import { motion, useIsPresent } from 'motion/react';
import { transition, useMotionPreference } from '../lib/motion';
import ConfirmSheet from './ConfirmSheet';
import GoalBurst from './GoalBurst';

type Props = {
  todo: Todo; busy: boolean; goalId: string | null; goalKey: number; index: number;
  onToggle: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSave: (id: string, title: string) => Promise<boolean>;
};

export default function TodoItem({ todo, busy, onToggle, onDelete, onSave, goalId, goalKey, index }: Props) {
  const reduced = useMotionPreference();
  const present = useIsPresent();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const startEditing = () => { setTitle(todo.title); setEditing(true); };
  return (
    <motion.li className={`todo-item ${todo.isCompleted ? 'completed' : ''} ${goalId === todo.id ? 'scored' : ''}`} inert={!present} aria-hidden={!present || undefined}
      initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -6 }}
      transition={{ ...transition, duration: 0.18, delay: reduced || index >= 4 ? 0 : index * 0.03 }}>
      <label className="check-target">
        <input type="checkbox" checked={todo.isCompleted} disabled={busy}
          aria-label={`${todo.title}: ${todo.isCompleted ? 'aktiv et' : 'tamamla'}`}
          onChange={() => onToggle(todo.id)} />
        <span className="check-circle"><Check size={14} aria-hidden="true" /></span>
        {goalId === todo.id && <GoalBurst key={goalKey} kind="particles" />}
      </label>
      {editing ? (
        <form className="edit-form" onSubmit={async event => {
          event.preventDefault();
          if (title.trim() && await onSave(todo.id, title.trim())) setEditing(false);
        }}>
          <input aria-label="Tapşırığın başlığı" value={title} autoFocus
            onChange={e => setTitle(e.target.value)} maxLength={200} required disabled={busy}
            onKeyDown={event => { if (event.key === 'Escape') {
              event.preventDefault(); setEditing(false);
            } }} />
          <div className="edit-actions">
            <button type="submit" disabled={busy || !title.trim()}><CheckCheck size={15} aria-hidden="true" />Saxla</button>
            <button type="button" disabled={busy} onClick={() => setEditing(false)}><X size={15} aria-hidden="true" />Ləğv et</button>
          </div>
        </form>
      ) : <button className="todo-title" type="button" disabled={busy}
        onClick={startEditing} aria-label={`${todo.title}: redaktə et`}>{todo.title}<Pencil className="edit-hint" size={14} aria-hidden="true" /></button>}
      <ConfirmSheet todo={todo} busy={busy} onDelete={onDelete} />
    </motion.li>
  );
}
