import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import Button from "./Button.jsx";
import { getErrorMessage } from "../../lib/axios.js";

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-navy-100 text-brand-600 ring-1 ring-brand-500/15">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-navy-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = "Couldn't load this data" }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20">
        <TriangleAlert className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-navy-500">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}
