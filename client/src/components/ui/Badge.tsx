import type { HTMLAttributes, ReactNode } from "react";

type BadgeStatus = "open" | "full" | "cancelled" | "expired" | "muted";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  status?: BadgeStatus;
}

const statusClasses: Record<BadgeStatus, string> = {
  open: "bg-turf/10 text-turf",
  full: "bg-amber/20 text-charcoal",
  cancelled: "bg-court-red/10 text-court-red",
  expired: "bg-court-red/10 text-court-red",
  muted: "bg-mist/60 text-charcoal/70",
};

export function Badge({ children, className = "", status = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${statusClasses[status]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
