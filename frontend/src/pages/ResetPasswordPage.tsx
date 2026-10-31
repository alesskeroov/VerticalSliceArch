import { useState } from 'react';
import type { FormEvent } from 'react';
import { resetPassword } from '../api/authApi';
import { clearSession } from '../auth/tokenStorage';
import type { ResetLink } from '../auth/resetLink';
import { ArrowLeft } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import FormMessage from '../components/FormMessage';
import SubmitButton from '../components/SubmitButton';
import { validateFields } from '../lib/validation';

export default function ResetPasswordPage({ link, onLogin }: { link: ResetLink; onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [errorCount, setErrorCount] = useState(0);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setError('');
    const invalid = validateFields(event.currentTarget as HTMLFormElement);
    if (password !== confirmPassword) invalid['reset-confirm'] = 'Parollar uyğun gəlmir.';
    setFields(invalid);
    if (Object.keys(invalid).length) { setError(password !== confirmPassword ? 'Parollar uyğun gəlmir.' : 'İşarələnmiş sahələri yoxlayın.'); setErrorCount(count => count + 1); return; }
    setBusy(true);
    try { await resetPassword(link.email, link.token, password, confirmPassword); clearSession(); setSuccess(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Şifrə yenilənmədi.'); setErrorCount(count => count + 1); }
    finally { setBusy(false); }
  }
  const validLink = Boolean(link.email && link.token);
  return <AuthShell title="Yeni şifrə təyin et" titleId="reset-title" description="Yeni başlanğıc üçün təhlükəsiz bir şifrə seç. Link yalnız bir dəfə istifadə edilə bilər." errorCount={errorCount}
    footer={<button className="text-link back-link" type="button" disabled={busy} onClick={onLogin}><ArrowLeft size={16} aria-hidden="true" />Girişə qayıt</button>}>
    {success ? <FormMessage success>Şifrən yeniləndi. Yeni şifrə ilə daxil ola bilərsən.</FormMessage> : !validLink ?
      <FormMessage>Sıfırlama linki etibarsızdır. Giriş səhifəsindən yeni link istə.</FormMessage> :
      <form className="auth-form" onSubmit={submit} noValidate aria-busy={busy}>
        <FormField id="reset-password" label="Yeni parol" password autoComplete="new-password" placeholder="Ən azı 8 simvol" required minLength={8} maxLength={128}
          value={password} onChange={e => setPassword(e.target.value)} disabled={busy} error={fields['reset-password']} />
        <FormField id="reset-confirm" label="Parolun təkrarı" password autoComplete="new-password" placeholder="Yeni parolu təkrar et" required minLength={8} maxLength={128}
          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={busy} error={fields['reset-confirm']} />
        {error && <FormMessage>{error}</FormMessage>}
        <SubmitButton busy={busy} label="Şifrəni yenilə" busyLabel="Yenilənir…" />
      </form>}
  </AuthShell>;
}
