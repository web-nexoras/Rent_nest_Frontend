import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient.js";
import { AuthProvider } from "@/hooks/useAuth.jsx";
import { ThemeProvider } from "@/hooks/useTheme.jsx";
import { ToastProvider } from "@/components/feedback/ToastContext.jsx";
import ErrorBoundary from "@/components/common/ErrorBoundary.jsx";

/**
 * Single composition root for every app-wide provider. Keeping the nesting in
 * one place makes the entry file tiny and avoids provider-order mistakes.
 */
export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
