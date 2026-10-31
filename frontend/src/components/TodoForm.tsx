import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, CornerDownLeft } from 'lucide-react';
import { Button } from './ui/button';

type Props = { busy: boolean; onAdd: (title: string) => Promise<boolean> };

export default function TodoForm({ busy, onAdd }: Props) {
  const [title, setTitle] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    // Uğursuz sorğuda yazılmış başlığı saxlayırıq ki, istifadəçi itirməsin.
    if (title.trim() && await onAdd(title.trim())) setTitle('');
  }
  return (
    <form className="todo-form" onSubmit={submit}>
      <label className="visually-hidden" htmlFor="new-todo">Yeni tapşırıq əlavə et</label>
      <span className="add-glyph" aria-hidden="true"><Plus size={20} /></span>
      <input id="new-todo" value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Yeni tapşırıq əlavə et" maxLength={200} required disabled={busy} autoComplete="off" />
      <Button className="add-button" variant="ghost" size="icon" disabled={busy || !title.trim()}
        type="submit" aria-label="Tapşırıq əlavə et"><CornerDownLeft size={18} aria-hidden="true" /></Button>
    </form>
  );
}
