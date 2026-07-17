import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DashedLine from '@/components/ui/DashedLine';

export default function Settings({
  title,
  message,
  enabled,
  customHeader,
  assetBaseUrl,
  isDark,
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
      <DashedLine
        position="bottom"
        assetBaseUrl={assetBaseUrl}
        isDark={isDark}
        className="my-4"
      />

      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
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
    </div>
  );
}
