import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-md border border-mist bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-turf focus:ring-2 focus:ring-turf/20 disabled:cursor-not-allowed disabled:bg-mist/30 disabled:text-charcoal/50";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClasses} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClasses} ${className}`} {...props} />;
}
