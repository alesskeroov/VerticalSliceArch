import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

type Props = ComponentProps<'input'> & { id: string; label: string; icon?: LucideIcon; action?: ReactNode; error?: string; hint?: string; password?: boolean };
export default function FormField({ id, label, icon: Icon, action, error, hint, password = false, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const LeadingIcon = Icon ?? (password ? LockKeyhole : undefined);
  const description = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return <div className="form-field">
    <div className="field-label"><label htmlFor={id}>{label}</label>{action}</div>
    <div className={`input-wrapper ${error ? 'is-invalid' : ''}`}>
      {LeadingIcon && <LeadingIcon className="input-icon" size={18} aria-hidden="true" />}
      <Input {...props} id={id} type={password ? visible ? 'text' : 'password' : props.type}
        className={`${LeadingIcon ? 'with-icon' : ''} ${password ? 'with-action' : ''}`}
        aria-invalid={Boolean(error)} aria-describedby={description} />
      {password && <Button className="password-toggle" variant="ghost" size="icon" disabled={props.disabled} type="button"
        aria-label={visible ? 'Parolu gizlət' : 'Parolu göstər'} aria-pressed={visible} onClick={() => setVisible(current => !current)}>
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </Button>}
    </div>
    {error ? <p id={`${id}-error`} className="field-error">{error}</p> : hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
  </div>;
}
