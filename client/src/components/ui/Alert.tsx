import type { HTMLAttributes, ReactNode } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const variantStyles: Record<AlertVariant, { container: string; title: string; icon: string }> = {
  success: {
    container: "border-turf/20 bg-turf/10 text-turf",
    title: "text-turf font-bold",
    icon: "✓",
  },
  error: {
    container: "border-court-red/20 bg-court-red/10 text-court-red",
    title: "text-court-red font-bold",
    icon: "✕",
  },
  warning: {
    container: "border-amber/40 bg-amber/15 text-charcoal",
    title: "text-charcoal font-bold",
    icon: "⚠️",
  },
  info: {
    container: "border-mist bg-mist/30 text-charcoal",
    title: "text-charcoal font-bold",
    icon: "ℹ️",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
  ...props
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm font-medium transition-all ${styles.container} ${className}`}
      role="alert"
      {...props}
    >
      <span aria-hidden="true" className="select-none text-base leading-none">
        {styles.icon}
      </span>
      <div className="flex-1">
        {title && <p className={`mb-1 font-display text-base ${styles.title}`}>{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/**
 * Formats caught errors to ensure technical stack traces or generic exceptions
 * display a friendly user message, while preserving clean backend API error strings.
 */
export function formatErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  if (typeof error === "string") {
    const isTechnical = error.includes("TypeError:") || error.includes("ReferenceError:") || error.includes("SyntaxError:") || error.includes("at ");
    return isTechnical ? fallback : error;
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("Load failed")
    ) {
      return "Unable to connect. Please check your internet connection and try again.";
    }

    const isTechnical =
      msg.includes("TypeError") ||
      msg.includes("undefined is not") ||
      msg.includes("cannot read property") ||
      msg.includes("at ") ||
      msg.includes("eval at");

    return isTechnical ? fallback : msg;
  }

  return fallback;
}
