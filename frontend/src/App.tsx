import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { Trophy, RefreshCw, ArrowUpRight } from 'lucide-react';
import * as api from './api/todoApi';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import Scoreboard from './components/Scoreboard';
import SeasonProgress from './components/SeasonProgress';
import GoalBurst from './components/GoalBurst';
import Brand from './components/Brand';
import AccountMenu from './components/AccountMenu';
import ThemeToggle from './components/ThemeToggle';
import AuthShell from './components/AuthShell';
import FormMessage from './components/FormMessage';
import { Button } from './components/ui/button';
import { TooltipProvider } from './components/ui/tooltip';
import type { Todo, TodoFilter } from './types/todo';
import { transition, useMotionPreference } from './lib/motion';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { consumeResetLink } from './auth/resetLink';
import './App.css';

const initialResetLink = consumeResetLink(window.location, window.history);

function TodoSkeleton() {
  return <div className="todo-skeleton" aria-busy="true" role="status">
    <span className="visually-hidden">Tapşırıqlar yüklənir…</span>
    <div aria-hidden="true">{[0, 1, 2].map(index => <div className="skeleton-row" key={index}><span className="skeleton-circle" /><span className="skeleton-line" /></div>)}</div>
  </div>;
}

function Matchday() {
  const { user } = useAuth();
  const reduced = useMotionPreference();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState<{ id: string; key: number } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!goal) return;
    const timer = window.setTimeout(() => setGoal(null), 300);
    return () => window.clearTimeout(timer);
  }, [goal]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.getTodos().then(data => { if (active) setTodos(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);
  async function change(action: () => Promise<void>) {
    if (busy) return false;
    setBusy(true); setError('');
    try { await action(); return true; }
    catch (err) { setError(err instanceof Error ? err.message : 'Gözlənilməz xəta baş verdi.'); return false; }
    finally { setBusy(false); }
  }
  const remaining = todos.filter(todo => !todo.isCompleted).length;
  const completed = todos.length - remaining;
  const visible = todos.filter(todo => filter === 'all' || (filter === 'active' ? !todo.isCompleted : todo.isCompleted));
  const name = user?.displayName.trim().split(/\s+/)[0] || 'dost';
  return <div className="app-shell">
    <a className="skip-link" href="#new-todo">Tapşırıqlara keç</a>
    <header className="navigation"><div className="header-inner">
      <Brand /><span className="header-divider" aria-hidden="true" /><span className="header-tagline">Gündəlik oyun planın</span>
      <div className="header-actions"><ThemeToggle /><AccountMenu /></div>
    </div></header>
    <main className="page">
      <motion.section className="content" aria-labelledby="page-title" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        <div className="page-intro"><div><p className="eyebrow">XOŞ GƏLDİN, {name}</p><h1 id="page-title">Bu gün sənin günündür<span className="heading-dot">.</span></h1>
          <p>Planını qur. Meydana çıx. Qollarını vur.</p></div><span className="intro-ball" aria-hidden="true"><ArrowUpRight size={24} /></span></div>
        <div className="scoreboard-wrap"><Scoreboard completed={completed} remaining={remaining} animate={Boolean(goal)} />{goal && <GoalBurst key={goal.key} kind="label" />}</div>
        <SeasonProgress todos={todos} />
        <section className="task-section" aria-labelledby="list-title">
          <div className="section-heading"><h2 id="list-title">Bugünkü oyun</h2><span className="task-count">{todos.length} tapşırıq</span></div>
          <FilterBar filter={filter} onChange={setFilter} />
          <TodoForm busy={busy || loading} onAdd={title => change(async () => { const todo = await api.createTodo(title); setTodos(current => [todo, ...current]); })} />
          <AnimatePresence initial={false}>{error && <motion.div key="error" className="todo-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
            <FormMessage>{error}</FormMessage><Button variant="ghost" className="retry-button" onClick={() => setReloadKey(key => key + 1)}><RefreshCw size={15} aria-hidden="true" />Yenidən cəhd et</Button>
          </motion.div>}</AnimatePresence>
          {!loading && todos.length > 0 && remaining === 0 && <motion.p className="final-whistle" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>
            <Trophy size={20} aria-hidden="true" /><span><strong>Final fiti!</strong> Bütün tapşırıqlar tamamlandı.</span></motion.p>}
          {loading ? <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transition}><TodoSkeleton /></motion.div> : !error || todos.length ?
            <TodoList todos={visible} filter={filter} busy={busy} goalId={goal?.id ?? null} goalKey={goal?.key ?? 0}
              onToggle={id => change(async () => { const updated = await api.toggleTodo(id); setGoal(updated.isCompleted ? { id, key: Date.now() } : null); setTodos(current => current.map(todo => todo.id === id ? updated : todo)); })}
              onSave={(id, title) => change(async () => { const updated = await api.updateTodo(id, title); setTodos(current => current.map(todo => todo.id === id ? updated : todo)); })}
              onDelete={id => change(async () => { await api.deleteTodo(id); setTodos(current => current.filter(todo => todo.id !== id)); })} /> : null}
          <p className="save-status" role="status">{busy ? 'Dəyişiklik saxlanır…' : ''}</p>
        </section>
        <footer className="page-footer"><span>Kiçik addımlar da qoldur.</span><span className="footer-dot" aria-hidden="true" />Sənin oyunun. Sənin tempin.</footer>
      </motion.section>
    </main>
  </div>;
}

function AppContent() {
  const auth = useAuth();
  const [page, setPage] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialResetLink ? 'reset' : 'login');
  useEffect(() => { if (auth.user) setPage(current => current === 'reset' ? current : 'login'); }, [auth.user]);
  if (page === 'reset' && initialResetLink) return <ResetPasswordPage key="reset" link={initialResetLink} onLogin={() => setPage('login')} />;
  if (page === 'forgot') return <ForgotPasswordPage key="forgot" onLogin={() => setPage('login')} />;
  if (auth.loading) return <AuthShell title="Giriş yoxlanır…" titleId="session-title" footer={null}><TodoSkeleton /></AuthShell>;
  if (auth.error) return <AuthShell title="Bağlantını yoxla" titleId="connection-title" footer={<Button variant="ghost" onClick={auth.logout}>Daxil ol</Button>}>
    <FormMessage>{auth.error}</FormMessage><Button className="connection-retry" onClick={() => window.location.reload()}>Yenidən cəhd et</Button>
  </AuthShell>;
  // Never keep protected content mounted for an exit animation after logout or 401.
  if (auth.user) return <Matchday />;
  return page === 'register' ? <RegisterPage key="register" onLogin={() => setPage('login')} /> : <LoginPage key="login" onRegister={() => setPage('register')} onForgotPassword={() => setPage('forgot')} />;
}

export default function App() {
  return <MotionConfig reducedMotion="user" transition={transition}><TooltipProvider delayDuration={250}><AppContent /></TooltipProvider></MotionConfig>;
}
