import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/utils/helpers";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition",
        "placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-200",
        className,
      )}
      {...props}
    />
  );
}
