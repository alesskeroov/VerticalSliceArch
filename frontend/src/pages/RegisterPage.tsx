import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

type Props = { onLogin: () => void };
export default function RegisterPage({ onLogin }: Props) {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await auth.register(email, password, displayName); }
    catch (err) { setError(err instanceof Error ? err.message : 'Qeydiyyat alınmadı.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <header className="auth-brand"><h1>MATCHDAY</h1></header>
    <section className="auth-card" aria-labelledby="register-title">
      <h2 id="register-title">Qeydiyyat</h2>
      <p className="auth-description">Şəxsi tapşırıqların üçün hesab yarat.</p>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="register-name">Ad</label>
        <input id="register-name" autoComplete="name" required maxLength={100}
          value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={busy} />
        <label htmlFor="register-email">Email</label>
        <input id="register-email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        <label htmlFor="register-password">Parol</label>
        <div className="password-field">
          <input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
            required minLength={8} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
          <button type="button" aria-label={showPassword ? 'Parolu gizlət' : 'Parolu göstər'}
            aria-pressed={showPassword} disabled={busy} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Gizlət' : 'Göstər'}</button>
        </div>
        <span className="auth-hint">Ən azı 8 simvol.</span>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Hesab yaradılır…' : 'Qeydiyyatdan keç'}</button>
      </form>
      <p className="auth-switch">Hesabın var? <button type="button" disabled={busy} onClick={onLogin}>Daxil ol</button></p>
    </section>
  </main>;
}
