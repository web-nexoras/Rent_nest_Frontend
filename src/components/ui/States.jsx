import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import Button from "./Button.jsx";
import { getErrorMessage } from "../../lib/axios.js";

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-300">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-navy-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-navy-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = "Couldn't load this data" }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-400">
        <TriangleAlert className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-navy-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-navy-400">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}
