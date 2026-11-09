import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils.js";

const ToastContext = createContext(null);

const STYLES = {
  success: {
    icon: CheckCircle2,
    badge: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
    bar: "bg-emerald-500",
    title: "Success",
  },
  error: {
    icon: XCircle,
    badge: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
    bar: "bg-rose-500",
    title: "Error",
  },
  warning: {
    icon: TriangleAlert,
    badge: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
    bar: "bg-amber-500",
    title: "Heads up",
  },
  info: {
    icon: Info,
    badge: "bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20",
    bar: "bg-brand-500",
    title: "Notice",
  },
};

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration = 4200) => {
      const id = ++counter;
      setToasts((current) => [...current.slice(-3), { id, type, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message, 6000),
      warning: (message) => push("warning", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const style = STYLES[toast.type];
            const Icon = style.icon;
            return (
              <motion.div
                key={toast.id}
                role="status"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border border-navy-200/80 bg-white/95 p-4 shadow-pop backdrop-blur-xl"
              >
                <span className={cn("absolute inset-y-0 left-0 w-1", style.bar)} />
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", style.badge)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-semibold text-navy-900">{style.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-navy-600">{toast.message}</p>
                </div>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="rounded-lg p-1 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
