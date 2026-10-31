export function validateFields(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of Array.from(form.querySelectorAll('input'))) {
    if (field.required && !field.value.trim()) errors[field.id] = 'Bu sahəni doldurun.';
    else if (field.type === 'email' && field.validity.typeMismatch) errors[field.id] = 'Düzgün email ünvanı daxil edin.';
    else if (field.minLength > 0 && field.value.length < field.minLength) errors[field.id] = `Ən azı ${field.minLength} simvol daxil edin.`;
  }
  const first = Object.keys(errors)[0];
  if (first) form.querySelector<HTMLInputElement>(`#${first}`)?.focus();
  return errors;
}
