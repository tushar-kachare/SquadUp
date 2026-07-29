import type { HTMLAttributes } from "react";

export function Spinner({ className = "size-6 text-turf" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  size?: "small" | "medium" | "large";
}

export function LoadingState({
  label = "Loading...",
  size = "medium",
  className = "",
  ...props
}: LoadingStateProps) {
  const spinnerSize = size === "small" ? "size-4 text-turf" : size === "large" ? "size-8 text-turf" : "size-6 text-turf";
  const padding = size === "small" ? "py-4" : size === "large" ? "py-16" : "py-10";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${padding} ${className}`}
      {...props}
    >
      <Spinner className={spinnerSize} />
      {label && <p className="font-body text-sm font-medium text-charcoal/70">{label}</p>}
    </div>
  );
}
