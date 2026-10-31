import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Mail, UserRound } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import FormMessage from '../components/FormMessage';
import SubmitButton from '../components/SubmitButton';
import { validateFields } from '../lib/validation';

type Props = { onLogin: () => void };
export default function RegisterPage({ onLogin }: Props) {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [errorCount, setErrorCount] = useState(0);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setError('');
    const invalid = validateFields(event.currentTarget as HTMLFormElement);
    if (password !== confirmPassword) invalid['register-confirm'] = 'Parollar uyğun gəlmir.';
    setFields(invalid);
    if (Object.keys(invalid).length) { setError(password !== confirmPassword ? 'Parollar uyğun gəlmir.' : 'İşarələnmiş sahələri yoxlayın.'); setErrorCount(count => count + 1); return; }
    setBusy(true);
    try { await auth.register(email, password, displayName, confirmPassword); }
    catch (err) { setError(err instanceof Error ? err.message : 'Qeydiyyat alınmadı.'); setErrorCount(count => count + 1); }
    finally { setBusy(false); }
  }
  return <AuthShell title="Komandaya qoşul" titleId="register-title" description="Şəxsi meydanın. Yeni hədəflərin. İlk addım burada." errorCount={errorCount}
    footer={<p>Hesabın var? <button className="text-link" type="button" disabled={busy} onClick={onLogin}>Daxil ol</button></p>}>
    <form className="auth-form" onSubmit={submit} noValidate aria-busy={busy}>
      <FormField id="register-name" label="Ad" icon={UserRound} autoComplete="name" placeholder="Sənə necə müraciət edək?" required maxLength={100}
        value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={busy} error={fields['register-name']} />
      <FormField id="register-email" label="Email" icon={Mail} type="email" autoComplete="email" placeholder="sen@example.com" required maxLength={254}
        value={email} onChange={e => setEmail(e.target.value)} disabled={busy} error={fields['register-email']} />
      <FormField id="register-password" label="Parol" password autoComplete="new-password" placeholder="Ən azı 8 simvol" required minLength={8} maxLength={128}
        value={password} onChange={e => setPassword(e.target.value)} disabled={busy} error={fields['register-password']} />
      <FormField id="register-confirm" label="Parolun təkrarı" password autoComplete="new-password" placeholder="Parolu bir daha daxil edin" required minLength={8} maxLength={128}
        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={busy} error={fields['register-confirm']} />
      {error && <FormMessage>{error}</FormMessage>}
      <SubmitButton busy={busy} label="Qeydiyyatdan keç" busyLabel="Hesab yaradılır…" />
    </form>
  </AuthShell>;
}
