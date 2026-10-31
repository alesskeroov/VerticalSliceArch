import { useState } from 'react';
import type { FormEvent } from 'react';
import { resetPassword } from '../api/authApi';
import { clearSession } from '../auth/tokenStorage';
import type { ResetLink } from '../auth/resetLink';

export default function ResetPasswordPage({ link, onLogin }: { link: ResetLink; onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Parollar uyğun gəlmir.'); return; }
    setBusy(true);
    try { await resetPassword(link.email, link.token, password, confirmPassword); clearSession(); setSuccess(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Şifrə yenilənmədi.'); }
    finally { setBusy(false); }
  }
  const validLink = Boolean(link.email && link.token);
  return <main className="auth-page">
    <header className="auth-brand"><h1>MATCHDAY</h1></header>
    <section className="auth-card" aria-labelledby="reset-title">
      <h2 id="reset-title">Yeni şifrə təyin et</h2>
      {success ? <p className="auth-success" role="status">Şifrən yeniləndi. Yeni şifrə ilə daxil ola bilərsən.</p> : !validLink ?
        <p className="auth-error" role="alert">Sıfırlama linki etibarsızdır. Giriş səhifəsindən yeni link istə.</p> : <>
        <p className="auth-description">Ən azı 8 simvoldan ibarət yeni şifrə seç. Link yalnız bir dəfə istifadə edilə bilər.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="reset-password">Yeni parol</label>
          <input id="reset-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128}
            value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
          <label htmlFor="reset-confirm">Parolun təkrarı</label>
          <input id="reset-confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128}
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={busy} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Yenilənir…' : 'Şifrəni yenilə'}</button>
        </form></>}
      <p className="auth-switch"><button type="button" disabled={busy} onClick={onLogin}>Girişə qayıt</button></p>
    </section>
  </main>;
}
