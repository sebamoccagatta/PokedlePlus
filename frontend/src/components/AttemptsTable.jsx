import { badgeClass } from "../ui.js";
import { Skeleton } from "./Skeleton.jsx";
import { useEffect, useRef } from "react";

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
    ? "grid-cols-[180px,110px,110px,85px,130px,110px,75px,85px,100px]"
    : "grid-cols-[180px,110px,110px,130px,110px,75px,85px,100px]";

  return (
    <div
      className={[
        `grid gap-1.5 md:gap-2 items-center px-4 py-3 transition-colors surface-hover`,
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
  const headerClass = showGenColumn
    ? "grid-cols-[180px,110px,110px,85px,130px,110px,75px,85px,100px]"
    : "grid-cols-[180px,110px,110px,130px,110px,75px,85px,100px]";

  const colCount = showGenColumn ? 9 : 8;
  const tableRef = useRef(null);

  useEffect(() => {
    if (attempts.length > 0 && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [attempts.length]);

  return (
    <div className="overflow-x-auto rounded-3xl border border-app bg-surface" ref={tableRef}>
      <div
        className={[
          "grid gap-1.5 md:gap-2 px-4 py-3 text-[10px] md:text-[11px] font-black uppercase tracking-wider text-muted whitespace-nowrap",
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
          <div className={`grid gap-1.5 md:gap-2 items-center px-4 py-3 ${headerClass}`}>
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
          <div className="px-4 py-10 text-center text-sm text-muted">
            {t("game.empty_state")}
          </div>
        ) : (
          attempts.map((attempt, rowIndex) => (
            <AttemptRow
              key={`${attempt.id}-${rowIndex}`}
              attempt={attempt}
              index={rowIndex}
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
  );
}
