import { cn } from "../utils/cn";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toast({ kind = "info", title, children, onClose, duration = 5000 }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!duration || !onClose) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const configs = {
    success: {
      gradient: "from-emerald-500 to-teal-500",
      border: "border-emerald-400/30",
      icon: "text-emerald-100",
      progress: "bg-emerald-200",
      Icon: CheckCircle2
    },
    error: {
      gradient: "from-rose-500 to-pink-500",
      border: "border-rose-400/30",
      icon: "text-rose-100",
      progress: "bg-rose-200",
      Icon: AlertCircle
    },
    info: {
      gradient: "from-blue-500 to-indigo-500",
      border: "border-blue-400/30",
      icon: "text-blue-100",
      progress: "bg-blue-200",
      Icon: Info
    },
    warning: {
      gradient: "from-amber-500 to-orange-500",
      border: "border-amber-400/30",
      icon: "text-amber-100",
      progress: "bg-amber-200",
      Icon: AlertTriangle
    },
  };

  const config = configs[kind] || configs.info;
  const { Icon } = config;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
        "bg-gradient-to-br shadow-2xl",
        "animate-slide-in-right",
        "min-w-[320px] max-w-md",
        config.gradient,
        config.border
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={cn("shrink-0 mt-0.5", config.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-bold text-white mb-1">
              {title}
            </h3>
          )}
          {children && (
            <p className="text-xs text-white/90 leading-relaxed">
              {children}
            </p>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {duration && onClose && (
        <div className="h-1 bg-black/20">
          <div
            className={cn("h-full transition-all duration-75 ease-linear", config.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer({ toasts = [], onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto" style={{ animationDelay: `${index * 100}ms` }}>
          <Toast
            kind={toast.kind}
            title={toast.title}
            onClose={() => onClose?.(toast.id)}
            duration={toast.duration}
          >
            {toast.message}
          </Toast>
        </div>
      ))}
    </div>
  );
}
