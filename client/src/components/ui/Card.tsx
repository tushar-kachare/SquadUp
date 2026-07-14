import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-mist border-t-[3px] border-t-turf bg-white p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
