import { useEffect, useState } from 'react';
import * as api from './api/todoApi';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import type { Todo, TodoFilter } from './types/todo';
import Scoreboard from './components/Scoreboard';
import SeasonProgress from './components/SeasonProgress';
import GoalBurst from './components/GoalBurst';
import { TrophyIcon } from './components/icons';
import './App.css';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState<{ id: string; key: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!goal) return;
    const timer = window.setTimeout(() => setGoal(null), 1000);
    return () => window.clearTimeout(timer);
  }, [goal]);
  useEffect(() => {
    // Səhifə bağlanıbsa gecikmiş cavabla vəziyyəti dəyişmirik.
    let active = true;
    api.getTodos().then(data => { if (active) setTodos(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function change(action: () => Promise<void>) {
    setBusy(true); setError('');
    try { await action(); return true; }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Gözlənilməz xəta baş verdi.');
      return false;
    } finally { setBusy(false); }
  }
  // Bütün məlumat saxlanır ki, qalan işlərin sayı filtrdən asılı olmasın.
  const remaining = todos.filter(todo => !todo.isCompleted).length;
  const completed = todos.length - remaining;
  const visible = todos.filter(todo => filter === 'all' ||
    (filter === 'active' ? !todo.isCompleted : todo.isCompleted));
  return (
    <main className="page">
      <header className={`navigation ${scrolled ? 'is-scrolled' : ''}`}>
        <h1 id="page-title">MATCHDAY</h1>
        <span className="compact-score" aria-hidden="true">{completed} : {remaining}</span>
      </header>
      <section className="content" aria-labelledby="page-title">
        <div className="scoreboard-wrap">
          <Scoreboard completed={completed} remaining={remaining} animate={Boolean(goal)} />
          {goal && <GoalBurst key={goal.key} kind="label" />}
        </div>
        <SeasonProgress todos={todos} />
        <h2 className="list-title">Bugünkü oyun</h2>
        <FilterBar filter={filter} onChange={setFilter} />
        <TodoForm busy={busy || loading} onAdd={title => change(async () => {
          const todo = await api.createTodo(title); setTodos(current => [todo, ...current]);
        })} />
        {error && <div className="error" role="alert"><span>{error}</span>
          <button type="button" onClick={() => window.location.reload()}>Yenidən cəhd et</button></div>}
        {!loading && todos.length > 0 && remaining === 0 &&
          <p className="final-whistle" role="status"><TrophyIcon /><span><strong>Final fiti!</strong> Bütün tapşırıqlar tamamlandı</span></p>}
        {loading ? <p className="status" role="status"><span className="spinner" aria-hidden="true" />Tapşırıqlar yüklənir…</p> : !error || todos.length ?
          <TodoList todos={visible} filter={filter} busy={busy} goalId={goal?.id ?? null} goalKey={goal?.key ?? 0}
            onToggle={id => change(async () => { const updated = await api.toggleTodo(id);
              // Yalnız server tamamlanmanı təsdiqləyəndə qol effekti veririk; geri qaytarmada yox.
              setGoal(updated.isCompleted ? { id, key: Date.now() } : null);
              setTodos(current => current.map(todo => todo.id === id ? updated : todo)); })}
            onSave={(id, title) => change(async () => { const updated = await api.updateTodo(id, title);
              setTodos(current => current.map(todo => todo.id === id ? updated : todo)); })}
            onDelete={id => change(async () => { await api.deleteTodo(id);
              setTodos(current => current.filter(todo => todo.id !== id)); })} /> : null}
        <p className="save-status" role="status">{busy ? 'Dəyişiklik saxlanır…' : ''}</p>
      </section>
    </main>
  );
}
