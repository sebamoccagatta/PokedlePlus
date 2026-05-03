import { badgeClass } from "../ui.js";
import { Skeleton } from "./Skeleton.jsx";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeftRight, Search, Sparkles } from "lucide-react";
import { getMaxAttempts } from "../constants/game.js";

function Pill({ children, kind, pop = false, isDark, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center gap-1 md:gap-1.5",
        "rounded-lg border-b-[3px] border-l border-r border-t px-2 md:px-3 py-1.5",
        "text-[10px] md:text-[11px] font-bold uppercase tracking-wide leading-none",
        "min-h-[34px] min-w-[85px] md:min-w-[92px]",
        "shadow-sm",
        "transition-all duration-200 active:translate-y-[2px] active:border-b active:shadow-none hover:brightness-110",
        pop ? "scale-[1.05]" : "scale-100",
        badgeClass(kind, isDark),
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function AttemptRow({
  attempt,
  index,
  isLatest,
  showGenColumn,
  isDark,
  translateHint,
  canReveal,
  arrow,
  formatHeight,
  formatWeight,
}) {
  const columns = attempt.columns || {};
  const isTop = index === 0;
  const gateTop = isTop && (canReveal?.(0) ?? false);
  const canRevealColumn = (i) => (gateTop ? canReveal?.(i) : true);

  const gridClass = showGenColumn
  ? "grid-cols-[minmax(180px,1.6fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(80px,.8fr)_minmax(110px,1.1fr)_minmax(100px,1fr)_minmax(80px,.8fr)_minmax(90px,.9fr)_minmax(95px,.9fr)]"
  : "grid-cols-[minmax(200px,1.8fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(120px,1.1fr)_minmax(110px,1fr)_minmax(90px,.9fr)_minmax(95px,.9fr)_minmax(105px,1fr)]";


  return (
    <div
      className={[
        "w-full", // 👈 importante
        `grid gap-1.5 md:gap-2 items-center px-4 py-4 transition-colors surface-hover`,
        isLatest ? "bg-indigo-500/5 ring-1 ring-inset ring-indigo-500/25" : "",
        gridClass,
        isTop ? "reveal-pop" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="rounded-2xl bg-surface-soft p-2 border border-app">
          <img
            src={attempt.sprite}
            alt={attempt.name}
            className="h-9 w-9"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate font-extrabold capitalize text-strong">
            {attempt.name}
          </div>
          <div className="text-xs text-muted">#{attempt.id}</div>
        </div>
      </div>

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(0) ? columns.type1 : ""}
          pop={isTop && canRevealColumn(0)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-0" : ""}
        >
          <span className="capitalize">
            {translateHint("types", attempt.types?.[0] ?? "none")}
          </span>
        </Pill>
      </div>

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(1) ? columns.type2 : ""}
          pop={isTop && canRevealColumn(1)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-1" : ""}
        >
          <span className="capitalize">
            {translateHint("types", attempt.types?.[1] ?? "none")}
          </span>
        </Pill>
      </div>

      {showGenColumn && (
        <div className="flex justify-center">
          <Pill
            kind={
              canRevealColumn(2)
                ? columns.gen === "correct"
                  ? "correct"
                  : "absent"
                : ""
            }
            pop={isTop && canRevealColumn(2)}
            isDark={isDark}
            className={gateTop ? "reveal-flip reveal-delay-2" : ""}
          >
            <span>Gen {attempt.gen}</span>
          </Pill>
        </div>
      )}

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(3) ? columns.habitat : ""}
          pop={isTop && canRevealColumn(3)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-3" : ""}
        >
          <span className="capitalize">
            {translateHint("habitats", attempt.habitat)}
          </span>
        </Pill>
      </div>

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(4) ? columns.color : ""}
          pop={isTop && canRevealColumn(4)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-4" : ""}
        >
          <span className="capitalize">
            {translateHint("colors", attempt.color)}
          </span>
        </Pill>
      </div>

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(5) ? columns.evolution : ""}
          pop={isTop && canRevealColumn(5)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-5" : ""}
        >
          <span>{attempt.evolution_stage}</span>
          <span className="font-black">
            {canRevealColumn(5) ? arrow(columns.evolution) : ""}
          </span>
        </Pill>
      </div>

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(6) ? columns.height : ""}
          pop={isTop && canRevealColumn(6)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-6" : ""}
        >
          <span>{formatHeight(attempt.height_dm)}</span>
          <span className="font-black">
            {canRevealColumn(6) ? arrow(columns.height) : ""}
          </span>
        </Pill>
      </div>

      <div className="flex justify-center">
        <Pill
          kind={canRevealColumn(7) ? columns.weight : ""}
          pop={isTop && canRevealColumn(7)}
          isDark={isDark}
          className={gateTop ? "reveal-flip reveal-delay-7" : ""}
        >
          <span>{formatWeight(attempt.weight_hg)}</span>
          <span className="font-black">
            {canRevealColumn(7) ? arrow(columns.weight) : ""}
          </span>
        </Pill>
      </div>
    </div>
  );
}

export default function AttemptsTable({
  attempts = [],
  mode,
  showGenColumn,
  isDark,
  translateHint,
  t,
  canReveal,
  arrow,
  formatHeight,
  formatWeight,
  busy,
}) {
  const maxAttempts = getMaxAttempts(mode || "classic");
  const headerClass = showGenColumn
  ? "grid-cols-[minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(80px,.8fr)_minmax(110px,1.1fr)_minmax(100px,1fr)_minmax(80px,.8fr)_minmax(90px,.9fr)_minmax(95px,.9fr)]"
  : "grid-cols-[minmax(200px,1.8fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(120px,1.1fr)_minmax(110px,1fr)_minmax(90px,.9fr)_minmax(95px,.9fr)_minmax(105px,1fr)]";


  const colCount = showGenColumn ? 9 : 8;
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const hasHorizontalOverflow = canScrollLeft || canScrollRight;

  useEffect(() => {
    if (attempts.length > 0 && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [attempts.length]);

  const checkScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, attempts]);

  return (
    <section className="rounded-[32px] border border-app bg-surface p-4 md:p-6 shadow-card transition-colors">
      <div className="mb-4 rounded-2xl border border-app bg-surface-soft p-3 md:p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-2">
            {t("game.legend.title")}
          </span>
          <span className="text-[11px] text-muted">
            {attempts.length} / {maxAttempts}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] leading-tight text-muted">
          <span className={`inline-flex rounded-md px-2 py-1 font-bold ${badgeClass("correct", isDark)}`}>
            {t("game.legend.correct")}
          </span>
          <span className={`inline-flex rounded-md px-2 py-1 font-bold ${badgeClass("present", isDark)}`}>
            {t("game.legend.present")}
          </span>
          <span className={`inline-flex rounded-md px-2 py-1 font-bold ${badgeClass("absent", isDark)}`}>
            {t("game.legend.absent")}
          </span>
          <span className="mx-1 hidden h-4 w-px bg-app sm:block" aria-hidden="true" />
          <span className={`inline-flex rounded-md px-2 py-1 font-bold ${badgeClass("higher", isDark)}`}>
            {arrow("higher")} {t("game.legend.higher")}
          </span>
          <span className={`inline-flex rounded-md px-2 py-1 font-bold ${badgeClass("lower", isDark)}`}>
            {arrow("lower")} {t("game.legend.lower")}
          </span>
        </div>
      </div>

      <div className="relative group">
        {/* Scroll Indicators */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
        />

        <div
          className="overflow-x-auto overscroll-x-contain rounded-3xl border border-app bg-surface"
          ref={(el) => {
            tableRef.current = el;
            containerRef.current = el;
          }}
          onScroll={checkScroll}
        >
        <div
          className={[
            "w-full", // 👈 importante
            "grid gap-1.5 md:gap-2 border-b border-app bg-surface-soft px-4 py-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-muted whitespace-nowrap",
            headerClass,
          ].join(" ")}
        >
          <div className="text-left">{t("game.columns.pokemon")}</div>
          <div className="text-center">{t("game.columns.type1")}</div>
          <div className="text-center">{t("game.columns.type2")}</div>

          {showGenColumn && (
            <div className="text-center">{t("game.columns.gen")}</div>
          )}

          <div className="text-center">{t("game.columns.habitat")}</div>
          <div className="text-center">{t("game.columns.color")}</div>
          <div className="text-center">{t("game.columns.evolution")}</div>
          <div className="text-center">{t("game.columns.height")}</div>
          <div className="text-center">{t("game.columns.weight")}</div>
        </div>

        <div className="divide-y divide-app min-w-max">
          {busy && (
            <div className={`grid gap-1.5 md:gap-2 items-center px-4 py-4 ${headerClass}`}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-2xl" />
                <div className="space-y-1 md:space-y-2">
                  <Skeleton className="h-4 w-20 md:w-24" />
                  <Skeleton className="h-3 w-10 md:w-12" />
                </div>
              </div>
              {[...Array(colCount - 1)].map((_, i) => (
                <div key={i} className="flex justify-center">
                  <Skeleton className="h-7 w-20 md:h-8 md:w-24 rounded-xl" />
                </div>
              ))}
            </div>
          )}
          {attempts.length === 0 && !busy ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-4 rounded-full bg-surface-soft p-6 shadow-inner">
                <Search className="h-10 w-10 text-muted-2" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-strong">
                {t("game.empty_state_title") || "¡Empieza a jugar!"}
              </h3>
              <p className="mt-1 text-sm text-muted max-w-xs">
                {t("game.empty_state") || "Busca un Pokémon arriba para comenzar tu investigación."}
              </p>
              <div className="mt-5 w-full max-w-md rounded-2xl border border-app bg-surface-soft p-4 text-left">
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("game.empty_steps_title")}
                </p>
                <ol className="space-y-2 text-sm text-muted">
                  <li>1. {t("game.empty_step_1")}</li>
                  <li>2. {t("game.empty_step_2")}</li>
                  <li>3. {t("game.empty_step_3")}</li>
                </ol>
              </div>
            </div>
          ) : (
            attempts.map((attempt, rowIndex) => (
              <AttemptRow
                key={`${attempt.id}-${rowIndex}`}
                attempt={attempt}
                index={rowIndex}
                isLatest={rowIndex === 0}
                showGenColumn={showGenColumn}
                isDark={isDark}
                translateHint={translateHint}
                canReveal={canReveal}
                arrow={arrow}
                formatHeight={formatHeight}
                formatWeight={formatWeight}
              />
            ))
          )}
        </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 px-1 sm:hidden">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            {t("game.table_scroll_hint")}
          </p>
          {hasHorizontalOverflow && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-indigo-400 ${canScrollRight ? "animate-pulse" : "opacity-40"}`}
                aria-hidden="true"
              />
              {canScrollRight ? t("game.table_scroll_more") : t("game.table_scroll_end")}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
