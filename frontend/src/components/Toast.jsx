import { cn } from "../utils/cn";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function Toast({ kind = "info", title, children, onClose }) {
  const configs = {
    success: {
      classes: "bg-emerald-500/95 border-emerald-400 text-white shadow-[0_0_50px_rgba(16,185,129,0.5)]",
      Icon: CheckCircle2
    },
    error: {
      classes: "bg-rose-500/95 border-rose-400 text-white shadow-[0_0_50px_rgba(244,63,94,0.5)]",
      Icon: AlertCircle
    },
    info: {
      classes: "bg-blue-500/95 border-blue-400 text-white shadow-[0_0_50px_rgba(59,130,246,0.5)]",
      Icon: Info
    },
    warning: {
      classes: "bg-amber-500/95 border-amber-400 text-amber-950 shadow-[0_0_50px_rgba(245,158,11,0.5)]",
      Icon: AlertTriangle
    },
  };

  const config = configs[kind] || configs.info;
  const { Icon } = config;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[40px] border-4 p-10 text-center backdrop-blur-xl",
        "animate-scale-in",
        config.classes,
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full bg-white/20 p-4">
          <Icon className="h-12 w-12" />
        </div>
        
        <div className="flex flex-col gap-2">
          {title && (
            <h2 className="text-4xl font-black uppercase tracking-tighter">
              {title}
            </h2>
          )}
          {children && (
            <p className="max-w-sm text-xl font-semibold opacity-90 leading-snug">
              {children}
            </p>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="group mt-2 flex items-center gap-2 rounded-2xl bg-black/20 px-10 py-4 text-sm font-black uppercase tracking-widest hover:bg-black/30 transition-all active:scale-95"
          >
            Continuar
            <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ToastContainer({ toasts = [], onClose }) {
  if (toasts.length === 0) return null;

  // Solo mostramos el más reciente para evitar duplicados visuales (especialmente durante recargas en desarrollo)
  // y para mantener la estética de "modal" único.
  const activeToast = toasts[toasts.length - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md pointer-events-auto animate-fade-in">
      <div className="w-full max-w-xl">
        <Toast
          key={activeToast.id}
          kind={activeToast.kind}
          title={activeToast.title}
          onClose={() => onClose?.(activeToast.id)}
        >
          {activeToast.message}
        </Toast>
      </div>
    </div>
  );
}
