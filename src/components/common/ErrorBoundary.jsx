import { Component } from "react";
import Button from "../ui/Button.jsx";

/** Catches render errors so one broken page never white-screens the whole app. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Something went wrong</h1>
        <p className="max-w-md text-sm text-navy-400">
          An unexpected error occurred while rendering this page. Reloading usually fixes it.
        </p>
        <Button onClick={() => window.location.assign("/")}>Back to home</Button>
      </div>
    );
  }
}
