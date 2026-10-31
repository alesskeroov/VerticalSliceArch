import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

type Props = { onRegister: () => void; onForgotPassword: () => void };
export default function LoginPage({ onRegister, onForgotPassword }: Props) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await auth.login(email, password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Giriş alınmadı.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <header className="auth-brand"><h1>MATCHDAY</h1></header>
    <section className="auth-card" aria-labelledby="login-title">
      <h2 id="login-title">Daxil ol</h2>
      <p className="auth-description">Tapşırıqlarına davam etmək üçün hesabına daxil ol.</p>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        <label htmlFor="login-password">Parol</label>
        <div className="password-field">
          <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
            required minLength={8} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
          <button type="button" aria-label={showPassword ? 'Parolu gizlət' : 'Parolu göstər'}
            aria-pressed={showPassword} disabled={busy} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Gizlət' : 'Göstər'}</button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Giriş edilir…' : 'Daxil ol'}</button>
      </form>
      <p className="auth-switch"><button type="button" disabled={busy} onClick={onForgotPassword}>Şifrəmi unutdum?</button></p>
      <p className="auth-switch">Hesabın yoxdur? <button type="button" disabled={busy} onClick={onRegister}>Qeydiyyatdan keç</button></p>
    </section>
  </main>;
}
