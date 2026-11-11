import { Component } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Button from "@/components/common/Button.jsx";

/** Catches render errors so one broken page never white-screens the whole app. */
export default class ErrorBoundary extends Component {
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ errorInfo: info });
    console.error("UI error captured by ErrorBoundary:", error, info);
  }

  handleRetry = () => {
    this.setState({ error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const errorMessage =
      this.state.error?.message ||
      (typeof this.state.error === "string"
        ? this.state.error
        : "An unexpected error occurred while rendering this page.");

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#FAF7F2] dark:bg-[#0B0D11] text-[#141413] dark:text-[#F5F0E6] transition-colors">
        <div className="w-full max-w-lg rounded-3xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white dark:bg-[#131722] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-[#C59B27] dark:text-[#D4AF37] ring-1 ring-[#D4AF37]/30">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141413] dark:text-[#F5F0E6]">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-[#6E675F] dark:text-[#9A9488]">
            An unexpected error occurred while rendering this view. Reloading usually fixes it.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Error details:
              </p>
              <p className="mt-1 font-mono text-xs text-rose-700 dark:text-rose-300 break-words">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={RefreshCw}
              onClick={this.handleRetry}
            >
              Reload Page
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={Home}
              onClick={() => window.location.assign("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
