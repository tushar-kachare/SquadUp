import type { HTMLAttributes } from "react";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-mist/60 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-mist border-t-[3px] border-t-mist bg-surface p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="mt-2 h-10 w-full rounded-md" />
    </div>
  );
}
