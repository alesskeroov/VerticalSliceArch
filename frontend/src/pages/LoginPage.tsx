import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Mail } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import FormMessage from '../components/FormMessage';
import SubmitButton from '../components/SubmitButton';
import { validateFields } from '../lib/validation';

type Props = { onRegister: () => void; onForgotPassword: () => void };
export default function LoginPage({ onRegister, onForgotPassword }: Props) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [errorCount, setErrorCount] = useState(0);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    const invalid = validateFields(event.currentTarget as HTMLFormElement);
    setFields(invalid); setError('');
    if (Object.keys(invalid).length) { setErrorCount(count => count + 1); return; }
    setBusy(true);
    try { await auth.login(email, password); }
    catch (err) { setError(err instanceof Error ? err.message : 'Giriş alınmadı.'); setErrorCount(count => count + 1); }
    finally { setBusy(false); }
  }
  return <AuthShell title="Daxil ol" titleId="login-title" description="Oyuna qayıt. Gününün növbəti qolunu vur." errorCount={errorCount}
    footer={<p>Hesabın yoxdur? <button className="text-link" type="button" disabled={busy} onClick={onRegister}>Qeydiyyatdan keç</button></p>}>
    <form className="auth-form" onSubmit={submit} noValidate aria-busy={busy}>
      <FormField id="login-email" label="Email" icon={Mail} type="email" autoComplete="email" placeholder="sen@example.com" required maxLength={254}
        value={email} onChange={e => setEmail(e.target.value)} disabled={busy} error={fields['login-email']} />
      <FormField id="login-password" label="Parol" password autoComplete="current-password" placeholder="Şifrənizi daxil edin"
        required minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} error={fields['login-password']}
        action={<button className="text-link forgot-link" type="button" disabled={busy} onClick={onForgotPassword}>Şifrəmi unutdum?</button>} />
      {error && <FormMessage>{error}</FormMessage>}
      <SubmitButton busy={busy} label="Daxil ol" busyLabel="Giriş edilir…" />
    </form>
  </AuthShell>;
}
