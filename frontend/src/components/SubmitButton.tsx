import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';

export default function SubmitButton({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return <Button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
    <span>{label}</span>{busy ? <LoaderCircle className="spinner" size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
    <span className="visually-hidden" role="status">{busy ? busyLabel : ''}</span>
  </Button>;
}
