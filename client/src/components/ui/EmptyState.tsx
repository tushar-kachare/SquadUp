import type { HTMLAttributes, ReactNode } from "react";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = "⚽",
  title,
  description,
  action,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-mist bg-chalk/50 px-6 py-12 text-center ${className}`}
      {...props}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-turf/10 text-2xl">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-charcoal">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm font-body text-sm text-charcoal/65 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
