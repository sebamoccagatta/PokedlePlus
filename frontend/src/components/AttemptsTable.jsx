import { badgeClass } from "../ui.js";

function Pill({ children, kind, pop = false, isDark }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center gap-1.5",
        "rounded-xl border px-3 py-1.5",
        "text-[12px] font-semibold leading-none",
        "min-h-8 min-w-[92px]",
        "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]",
        "transition-transform transition-opacity duration-200",
        pop ? "scale-[1.03]" : "scale-100",
        badgeClass(kind, isDark),
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
    ? "grid-cols-[240px,120px,120px,90px,140px,120px,80px,90px,110px]"
    : "grid-cols-[240px,120px,120px,140px,120px,80px,90px,110px]";

  return (
    <div
      className={[
        `grid gap-2 items-center px-4 py-3 transition-colors surface-hover`,
        gridClass,
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
}) {
  const headerClass = showGenColumn
    ? "grid-cols-[240px,120px,120px,90px,140px,120px,80px,90px,110px]"
    : "grid-cols-[240px,120px,120px,140px,120px,80px,90px,110px]";

  return (
    <div className="overflow-x-auto rounded-3xl border border-app bg-surface">
      <div
        className={[
          "grid gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-muted",
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

      <div className="divide-y divide-app">
        {attempts.length === 0 ? (
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
