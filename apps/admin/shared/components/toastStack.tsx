"use client";

import type { ToastItem } from "@/shared/hooks/useToast";

type ToastStackProps = {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  void toasts;
  void onDismiss;
  return null;
}
