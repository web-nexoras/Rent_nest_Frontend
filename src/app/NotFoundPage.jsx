import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import Button from "@/components/common/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/20">
        <Compass className="h-8 w-8" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Error 404</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-900">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
        The page you're looking for doesn't exist or has been moved to a different route.
      </p>
      <Link to="/" className="mt-7">
        <Button size="lg">
          <ArrowLeft className="h-4 w-4" /> Return to workspace
        </Button>
      </Link>
    </div>
  );
}
