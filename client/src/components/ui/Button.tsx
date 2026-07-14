import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-turf bg-turf text-chalk hover:bg-turf/90 focus-visible:outline-turf",
  secondary:
    "border-mist bg-transparent text-charcoal hover:border-turf hover:bg-turf/5 focus-visible:outline-turf",
  danger:
    "border-court-red bg-court-red text-chalk hover:bg-court-red/90 focus-visible:outline-court-red",
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold tracking-[0.01em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}
