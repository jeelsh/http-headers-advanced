import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { parseCspValue } from '@/lib/csp';

export default function CspSourceField({
  id,
  label,
  value = '',
  onChange,
  placeholder,
  mode = 'sources',
  error,
  onValidation,
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setDraft(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    const result = parseCspValue(draft, mode);
    if (result.corrected !== draft) {
      setDraft(result.corrected);
      if (onChange) {
        onChange(result.corrected);
      }
    }
    if (onValidation) {
      onValidation(id, result.error);
    }
  };

  const commonProps = {
    id,
    value: draft,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    'aria-invalid': Boolean(error),
  };

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      {mode === 'report-uri' ? (
        <Input {...commonProps} />
      ) : (
        <Textarea {...commonProps} />
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
