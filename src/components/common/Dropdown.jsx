import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/helpers.js";

/** Click-outside aware dropdown with Framer Motion animation. */
export default function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((value) => !value)}>{trigger({ open })}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-40 mt-2 min-w-[12.5rem] rounded-2xl border border-navy-200/80 bg-white/95 p-1.5 shadow-pop backdrop-blur-xl",
              align === "right" ? "right-0" : "left-0",
              className,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ icon: Icon, danger, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-navy-700 hover:bg-navy-100/80 hover:text-navy-900",
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}
