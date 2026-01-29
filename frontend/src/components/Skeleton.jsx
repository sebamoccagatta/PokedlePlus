import React from "react";
import { Loader2 } from "lucide-react";

export function Skeleton({ className = "" }) {
  return (
    <div 
      className={`relative overflow-hidden bg-surface-soft rounded ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />
    </div>
  );
}

export function LoadingSpinner({ size = "sm", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={`animate-spin text-current ${sizeClasses[size] || sizeClasses.sm} ${className}`} />
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-app bg-surface px-4 py-3 opacity-80">
      <div className="shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
      </div>
    </div>
  );
}

export function AttemptRowSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-2 p-2 border-b border-app">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-xl opacity-60" />
      ))}
    </div>
  );
}
