import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils.js";

const ToastContext = createContext(null);

const STYLES = {
  success: {
    icon: CheckCircle2,
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30",
    bar: "bg-gradient-to-b from-[#D4AF37] to-emerald-500",
    defaultTitle: "Success",
  },
  error: {
    icon: XCircle,
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30",
    bar: "bg-gradient-to-b from-rose-500 to-[#C59B27]",
    defaultTitle: "Error",
  },
  warning: {
    icon: TriangleAlert,
    badge: "bg-[#C59B27]/15 text-[#C59B27] dark:text-[#D4AF37] ring-1 ring-[#D4AF37]/30",
    bar: "bg-gradient-to-b from-[#D4AF37] to-[#C59B27]",
    defaultTitle: "Heads up",
  },
  info: {
    icon: Info,
    badge: "bg-[#C59B27]/15 text-[#C59B27] dark:text-[#D4AF37] ring-1 ring-[#D4AF37]/30",
    bar: "bg-gradient-to-b from-[#C59B27] to-[#D4AF37]",
    defaultTitle: "Notice",
  },
};

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, title = null, duration = 4500) => {
      const id = ++counter;
      setToasts((current) => [...current.slice(-3), { id, type, message, title }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message, title) => push("success", message, title),
      error: (message, title) => push("error", message, title, 6000),
      warning: (message, title) => push("warning", message, title),
      info: (message, title) => push("info", message, title),
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
            const style = STYLES[toast.type] || STYLES.info;
            const Icon = style.icon;
            const displayTitle = toast.title || style.defaultTitle;
            return (
              <motion.div
                key={toast.id}
                role="status"
                initial={{ opacity: 0, y: -14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 28, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "pointer-events-auto relative flex items-start gap-3.5 overflow-hidden rounded-2xl p-4 shadow-xl backdrop-blur-xl transition-all",
                  "border border-[#E5DEC9] bg-[#FAF7F2]/95 text-[#141413]",
                  "dark:border-[#252C3D] dark:bg-[#131722]/95 dark:text-[#F5F0E6] dark:shadow-black/50"
                )}
              >
                {/* Brand Luxury Accent Strip */}
                <span className={cn("absolute inset-y-0 left-0 w-1.5", style.bar)} />

                {/* Styled Icon Badge */}
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", style.badge)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-bold tracking-wide uppercase text-[#141413] dark:text-[#F5F0E6]">
                    {displayTitle}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#5C5549] dark:text-[#9A9488]">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismiss(toast.id)}
                  className="rounded-lg p-1 text-[#8C8479] hover:bg-[#EFE9DC] hover:text-[#141413] dark:text-[#6E675F] dark:hover:bg-[#1E2433] dark:hover:text-[#F5F0E6] transition-colors"
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
