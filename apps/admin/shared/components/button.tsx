import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/helpers";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-teal-700 text-white hover:bg-teal-800"
          : "bg-transparent text-slate-700 hover:bg-slate-100",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
