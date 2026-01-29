import React from "react";
import { PokemonCardSkeleton } from "./Skeleton.jsx";

export default function ComboList({
  items = [],
  onPick,
  disabled,
  onScrollBottom,
  loadingMore,
  searching,
  hasMore,
  t,
}) {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [items]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled || items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        onPick?.(items[activeIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, activeIndex, onPick, disabled]);

  const handleScroll = (event) => {
    const el = event.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom) onScrollBottom?.();
  };

  return (
    <div
      className="mt-3 rounded-2xl border border-app bg-surface overflow-y-auto overscroll-contain"
      style={{ maxHeight: 320 }}
      onScroll={handleScroll}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onPick?.(item)}
            disabled={disabled}
            className={[
              "flex items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3 text-left transition-all duration-200",
              "hover:scale-[1.02] hover:shadow-lg hover:border-indigo-400/50 active:scale-[0.98]",
              "disabled:opacity-60 disabled:pointer-events-none",
              index === activeIndex ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md" : "border-app",
            ].join(" ")}
          >
            <div className="shrink-0">
              <img src={item.sprite} alt={item.name} className="h-8 w-8 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold capitalize text-strong">
                {item.name}
              </div>
              <div className="text-xs text-muted">#{item.id}</div>
            </div>
          </button>
        ))}

        {searching && items.length === 0 && (
          <>
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
          </>
        )}

        {loadingMore && (
          <>
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
            <PokemonCardSkeleton />
          </>
        )}
      </div>

      {!searching && (loadingMore || hasMore) && (
        <div className="border-t border-app px-3 py-2 text-center text-xs text-muted">
          {loadingMore ? t("game.loading_more") : t("game.scroll_more")}
        </div>
      )}
    </div>
  );
}
