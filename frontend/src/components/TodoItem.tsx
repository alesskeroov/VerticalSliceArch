import { useState } from 'react';
import type { Todo } from '../types/todo';
import { CheckIcon } from './icons';
import ConfirmSheet from './ConfirmSheet';
import GoalBurst from './GoalBurst';

type Props = {
  todo: Todo; busy: boolean; goalId: string | null; goalKey: number;
  onToggle: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSave: (id: string, title: string) => Promise<boolean>;
};

export default function TodoItem({ todo, busy, onToggle, onDelete, onSave, goalId, goalKey }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const startEditing = () => { setTitle(todo.title); setEditing(true); };
  return (
    <li className={`todo-item ${todo.isCompleted ? 'completed' : ''} ${goalId === todo.id ? 'scored' : ''}`}>
      <label className="check-target">
        <input type="checkbox" checked={todo.isCompleted} disabled={busy}
          aria-label={`${todo.title}: ${todo.isCompleted ? 'aktiv et' : 'tamamla'}`}
          onChange={() => onToggle(todo.id)} />
        <span className="check-circle"><CheckIcon /></span>
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
            <button type="submit" disabled={busy || !title.trim()}>Saxla</button>
            <button type="button" disabled={busy} onClick={() => setEditing(false)}>Ləğv et</button>
          </div>
        </form>
      ) : <button className="todo-title" type="button" disabled={busy}
        onClick={startEditing} aria-label={`${todo.title}: redaktə et`}>{todo.title}</button>}
      <ConfirmSheet todo={todo} busy={busy} onDelete={onDelete} />
    </li>
  );
}
