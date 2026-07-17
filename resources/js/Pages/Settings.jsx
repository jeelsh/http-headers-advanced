import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Settings({ title, message, enabled, customHeader }) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{message}</p>

      <div className="flex items-center gap-4 mb-4">
        <Button onClick={() => setIsEnabled(!isEnabled)}>
          {isEnabled ? 'Disable' : 'Enable'} Advanced Headers
        </Button>
        <span className="text-sm text-muted-foreground">
          Status: {isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {customHeader && (
        <p className="text-sm">
          Custom header:{' '}
          <code className="bg-muted px-1 rounded">{customHeader}</code>
        </p>
      )}
    </div>
  );
}
