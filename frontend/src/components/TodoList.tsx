import TodoItem from './TodoItem';
import { PitchIcon } from './icons';
import type { Todo, TodoFilter } from '../types/todo';
import { AnimatePresence, motion } from 'motion/react';
import { transition, useMotionPreference } from '../lib/motion';

type Props = {
  todos: Todo[]; filter: TodoFilter; busy: boolean; goalId: string | null; goalKey: number;
  onToggle: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSave: (id: string, title: string) => Promise<boolean>;
};

export default function TodoList({ todos, filter, ...actions }: Props) {
  const reduced = useMotionPreference();
  return <div className="todo-list-region">
    <ul className="todo-list" aria-label="Tapşırıqlar"><AnimatePresence initial={true}>{todos.map((todo, index) =>
      <TodoItem key={todo.id} todo={todo} index={index} {...actions} />)}</AnimatePresence></ul>
    {!todos.length && <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>
      <motion.span className="empty-pitch" initial={{ opacity: 0, y: reduced ? 0 : 3 }} animate={{ opacity: 1, y: 0 }} transition={transition}><PitchIcon /></motion.span>
      <h2>Meydan boşdur</h2>
      <p>{filter === 'all' ? 'İlk tapşırığı əlavə et və oyunu başlat' :
        'Bu filtrdə tapşırıq yoxdur. Başqa filtr seç.'}</p>
    </motion.div>}
  </div>;
}
