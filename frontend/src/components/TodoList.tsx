import TodoItem from './TodoItem';
import { PitchIcon } from './icons';
import type { Todo, TodoFilter } from '../types/todo';

type Props = {
  todos: Todo[]; filter: TodoFilter; busy: boolean; goalId: string | null; goalKey: number;
  onToggle: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSave: (id: string, title: string) => Promise<boolean>;
};

export default function TodoList({ todos, filter, ...actions }: Props) {
  if (!todos.length) return (
    <div className="empty-state">
      <PitchIcon />
      <h2>Meydan boşdur</h2>
      <p>{filter === 'all' ? 'İlk tapşırığı əlavə et və oyunu başlat' :
        'Bu filtrdə tapşırıq yoxdur. Başqa filtr seç.'}</p>
    </div>
  );
  return <ul className="todo-list">{todos.map(todo =>
    <TodoItem key={todo.id} todo={todo} {...actions} />)}</ul>;
}
