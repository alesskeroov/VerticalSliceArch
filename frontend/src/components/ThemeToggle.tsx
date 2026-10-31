import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

type Theme = 'dark' | 'light' | 'system';
const themes: Theme[] = ['dark', 'light', 'system'];
const labels = { dark: 'Tünd', light: 'Açıq', system: 'Sistem' };
function readTheme(): Theme {
  try { const value = localStorage.getItem('matchday-theme'); return themes.includes(value as Theme) ? value as Theme : 'dark'; }
  catch { return 'dark'; }
}
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('matchday-theme', theme); } catch { /* Theme still works if storage is unavailable. */ }
  }, [theme]);
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return <Button variant="ghost" size="icon" className="theme-toggle" aria-label={`Görünüş: ${labels[theme]}. Dəyişdir`}
    title={`Görünüş: ${labels[theme]}`} onClick={() => setTheme(themes[(themes.indexOf(theme) + 1) % themes.length])}>
    <Icon size={18} aria-hidden="true" />
  </Button>;
}
