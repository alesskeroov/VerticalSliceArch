import { useRef } from 'react';
import type { Todo } from '../types/todo';
import { Trash2, ShieldAlert } from 'lucide-react';

type Props = { todo: Todo; busy: boolean; onDelete: (id: string) => Promise<boolean> };

export default function ConfirmSheet({ todo, busy, onDelete }: Props) {
  const sheet = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  return <>
    <button className="icon-button delete-button" type="button" disabled={busy}
      onClick={() => { sheet.current?.showModal(); cancelButton.current?.focus(); }}
      aria-label={`${todo.title}: sil`}><Trash2 size={17} aria-hidden="true" /></button>
    {/* Native dialog fokus tələsini, Escape-i və arxa səhifənin bağlanmasını təmin edir. */}
    <dialog className="action-sheet" ref={sheet} aria-labelledby={`delete-title-${todo.id}`}
      aria-describedby={`delete-description-${todo.id}`}
      onClick={event => { if (event.target === event.currentTarget) sheet.current?.close(); }}>
      <div className="sheet-group">
        <h2 id={`delete-title-${todo.id}`}><ShieldAlert size={20} aria-hidden="true" />Bu tapşırıq oyundan çıxarılsın?</h2>
        <p id={`delete-description-${todo.id}`}>{todo.title}</p>
        <button className="destructive" type="button" disabled={busy} onClick={async () => {
          await onDelete(todo.id);
          // Xəta da olsa panel bağlanır ki, siyahıdakı xəta mesajı oxunsun.
          sheet.current?.close();
        }}>Sil</button>
      </div>
      <button className="sheet-cancel" type="button" ref={cancelButton}
        onClick={() => sheet.current?.close()}>Ləğv et</button>
    </dialog>
  </>;
}
