import React from "react";

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-app bg-surface px-4 py-3 opacity-60">
      <div className="shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function AttemptRowSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-2 p-2 border-b border-app">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  );
}
