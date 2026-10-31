import { useState } from 'react';
import type { FormEvent } from 'react';
import { forgotPassword } from '../api/authApi';

export default function ForgotPasswordPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await forgotPassword(email); setSuccess(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sorğu alınmadı.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <header className="auth-brand"><h1>MATCHDAY</h1></header>
    <section className="auth-card" aria-labelledby="forgot-title">
      <h2 id="forgot-title">Şifrəmi unutdum</h2>
      <p className="auth-description">Şifrəni yeniləmək üçün hesabının email ünvanını daxil et.</p>
      {success ? <p className="auth-success" role="status">Bu email ilə hesab mövcuddursa, şifrə sıfırlama linki göndəriləcək. Gələnlər və spam qovluğunu yoxla.</p> :
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="forgot-email">Email</label>
          <input id="forgot-email" type="email" autoComplete="email" required maxLength={254}
            value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Göndərilir…' : 'Sıfırlama linki göndər'}</button>
        </form>}
      <p className="auth-switch"><button type="button" disabled={busy} onClick={onLogin}>Girişə qayıt</button></p>
    </section>
  </main>;
}
