import { useToast } from '@/hooks/useToast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          variant={toast.variant}
          className="relative w-80 shadow-lg pr-10"
        >
          {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
          {toast.description && <AlertDescription>{toast.description}</AlertDescription>}
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="absolute top-3 right-3 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      ))}
    </div>
  );
}
