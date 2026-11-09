import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils.js";

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, bar: "bg-brand-500", text: "text-brand-600" },
  error: { icon: XCircle, bar: "bg-red-500", text: "text-red-500" },
  warning: { icon: TriangleAlert, bar: "bg-accent-500", text: "text-accent-600" },
  info: { icon: Info, bar: "bg-navy-500", text: "text-navy-500" },
};

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration = 4000) => {
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
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => {
          const style = STYLES[toast.type];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto relative flex animate-slide-in-right items-start gap-3 overflow-hidden rounded-xl border border-navy-100 bg-white p-4 pl-5 shadow-pop"
            >
              <span className={cn("absolute inset-y-0 left-0 w-1", style.bar)} />
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.text)} />
              <p className="flex-1 text-sm text-navy-800">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-navy-400 transition hover:text-navy-700"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
