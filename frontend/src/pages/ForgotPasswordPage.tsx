import { useState } from 'react';
import type { FormEvent } from 'react';
import { forgotPassword } from '../api/authApi';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import FormMessage from '../components/FormMessage';
import SubmitButton from '../components/SubmitButton';
import { validateFields } from '../lib/validation';

export default function ForgotPasswordPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [errorCount, setErrorCount] = useState(0);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setError('');
    const invalid = validateFields(event.currentTarget as HTMLFormElement); setFields(invalid);
    if (Object.keys(invalid).length) { setErrorCount(count => count + 1); return; }
    setBusy(true);
    try { await forgotPassword(email); setSuccess(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sorğu alınmadı.'); setErrorCount(count => count + 1); }
    finally { setBusy(false); }
  }
  return <AuthShell title="Şifrəmi unutdum" titleId="forgot-title" description="Kiçik fasilə. Email ünvanını yaz, oyuna qayıtmağı asanlaşdıraq." errorCount={errorCount}
    footer={<button className="text-link back-link" type="button" disabled={busy} onClick={onLogin}><ArrowLeft size={16} aria-hidden="true" />Girişə qayıt</button>}>
    {success ? <FormMessage success>Bu email ilə hesab mövcuddursa, şifrə sıfırlama linki göndəriləcək. Gələnlər və spam qovluğunu yoxla.</FormMessage> :
      <form className="auth-form" onSubmit={submit} noValidate aria-busy={busy}>
        <FormField id="forgot-email" label="Email" icon={Mail} type="email" autoComplete="email" placeholder="sen@example.com" required maxLength={254}
          value={email} onChange={e => setEmail(e.target.value)} disabled={busy} error={fields['forgot-email']} />
        {error && <FormMessage>{error}</FormMessage>}
        <SubmitButton busy={busy} label="Sıfırlama linki göndər" busyLabel="Göndərilir…" />
      </form>}
  </AuthShell>;
}
