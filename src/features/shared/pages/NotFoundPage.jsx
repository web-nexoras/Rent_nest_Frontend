import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="text-7xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-navy-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go to dashboard</Button>
      </Link>
    </div>
  );
}
