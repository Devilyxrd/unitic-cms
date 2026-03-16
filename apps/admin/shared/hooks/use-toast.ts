"use client";

import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ShowToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

const DEFAULT_DURATION_MS = 3500;

export function useToast() {
  const dismissToast = useCallback((id: number) => {
    toast.dismiss(String(id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = "info", durationMs = DEFAULT_DURATION_MS }: ShowToastOptions) => {
      const message = description ? `${title}\n${description}` : title;

      if (variant === "success") {
        toast.success(message, { duration: durationMs });
        return;
      }

      if (variant === "error") {
        toast.error(message, { duration: durationMs });
        return;
      }

      toast(message, { duration: durationMs });
    },
    [],
  );

  const showSuccess = useCallback(
    (title: string, description?: string) =>
      showToast({ title, description, variant: "success" }),
    [showToast],
  );

  const showError = useCallback(
    (title: string, description?: string) =>
      showToast({ title, description, variant: "error", durationMs: 5000 }),
    [showToast],
  );

  const showInfo = useCallback(
    (title: string, description?: string) =>
      showToast({ title, description, variant: "info" }),
    [showToast],
  );

  return useMemo(
    () => ({
      toasts: [] as ToastItem[],
      dismissToast,
      showToast,
      showSuccess,
      showError,
      showInfo,
    }),
    [dismissToast, showToast, showSuccess, showError, showInfo],
  );
}
