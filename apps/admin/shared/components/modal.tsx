import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  children: ReactNode;
};

export function Modal({ open, children }: ModalProps) {
  if (!open) return null;
  return <div role="dialog">{children}</div>;
}
