import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { getErrorMessage } from "@/lib/apiClient.js";

/**
 * Mutation wrapper: shows a success/error toast and invalidates the given query keys.
 */
export function useApiMutation(mutationFn, { success, invalidate = [], onSuccess } = {}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      const message = typeof success === "function" ? success(data) : success || data?.message;
      if (message) toast.success(message);
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
