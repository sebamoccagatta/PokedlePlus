import { cn } from '../utils/cn';

export function Toast({ kind = 'info', title, children, onClose, duration }) {
  const palettes = {
    success: 'bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-600',
    error: 'bg-rose-500 border-rose-600 text-white dark:bg-rose-500 dark:border-rose-600',
    info: 'bg-blue-500 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-600',
    warning: 'bg-amber-500 border-amber-600 text-amber-900 dark:bg-amber-500 dark:border-amber-600',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 shadow-lg',
        'animate-slide-in',
        palettes[kind] || palettes.info
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {title && <div className="font-bold">{title}</div>}
          {children && <div className="mt-1 text-sm opacity-90">{children}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg bg-black/10 px-2 py-1 text-xs hover:bg-black/20"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto animate-fade-in">
          <Toast
            kind={toast.kind}
            title={toast.title}
            onClose={() => onClose?.(toast.id)}
          >
            {toast.message}
          </Toast>
        </div>
      ))}
    </div>
  );
}