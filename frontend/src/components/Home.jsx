import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2,
  CircleDashed,
  ArrowRight,
} from "lucide-react";
import {
  ClassicBall,
  Pokeball,
  Greatball,
  Ultraball,
  Luxuryball,
  Premierball,
  Healball,
  Nestball,
  Netball,
  Quickball,
  InfiniteBall,
} from "./Icons.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { LanguageSelector } from "./LanguageSelector.jsx";

export function Home({ onSelect, dayKey, i18n }) {
  const { t, locale, changeLocale, availableLocales } = i18n;
  const modes = useMemo(
    () => [
      {
        id: "classic",
        title: t("home.modes.classic.title"),
        desc: t("home.modes.classic.desc"),
        color: "bg-purple-600",
        Icon: ClassicBall,
      },
      {
        id: "gen1",
        title: t("home.modes.gen1.title"),
        desc: t("home.modes.gen1.desc"),
        color: "bg-red-500",
        Icon: Pokeball,
      },
      {
        id: "gen2",
        title: t("home.modes.gen2.title"),
        desc: t("home.modes.gen2.desc"),
        color: "bg-blue-600",
        Icon: Greatball,
      },
      {
        id: "gen3",
        title: t("home.modes.gen3.title"),
        desc: t("home.modes.gen3.desc"),
        color: "bg-zinc-800",
        Icon: Ultraball,
      },
      {
        id: "gen4",
        title: t("home.modes.gen4.title"),
        desc: t("home.modes.gen4.desc"),
        color: "bg-gray-900",
        Icon: Luxuryball,
      },
      {
        id: "gen5",
        title: t("home.modes.gen5.title"),
        desc: t("home.modes.gen5.desc"),
        color: "bg-slate-100",
        Icon: Premierball,
      },
      {
        id: "gen6",
        title: t("home.modes.gen6.title"),
        desc: t("home.modes.gen6.desc"),
        color: "bg-pink-400",
        Icon: Healball,
      },
      {
        id: "gen7",
        title: t("home.modes.gen7.title"),
        desc: t("home.modes.gen7.desc"),
        color: "bg-green-500",
        Icon: Nestball,
      },
      {
        id: "gen8",
        title: t("home.modes.gen8.title"),
        desc: t("home.modes.gen8.desc"),
        color: "bg-blue-800",
        Icon: Netball,
      },
      {
        id: "gen9",
        title: t("home.modes.gen9.title"),
        desc: t("home.modes.gen9.desc"),
        color: "bg-yellow-500",
        Icon: Quickball,
      },
      {
        id: "infinite",
        title: t("home.modes.infinite.title"),
        desc: t("home.modes.infinite.desc"),
        color: "bg-amber-600",
        Icon: InfiniteBall,
      },
    ],
    [t]
  );

  const [statusByMode, setStatusByMode] = useState(() => ({}));
  const [lastMode, setLastMode] = useState(
    () => localStorage.getItem("pokedleplus:lastMode") || "classic"
  );

  function safeParse(json) {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function readModeState(dk, modeId) {
    if (!dk) return null;

    const keys = [
      `pokedleplus:v1:${dk}:${modeId}`,
      `pokedleplus:v1:${dk}`,
      `pokedle_state_v1`,
    ];

    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = safeParse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
    return null;
  }

  function computeStatuses() {
    const map = {};
    for (const m of modes) {
      const st = readModeState(dayKey, m.id);
      const attempts = Array.isArray(st?.attempts) ? st.attempts.length : 0;
      const won =
        st?.won === true ||
        st?.status === "won" ||
        st?.win === true ||
        st?.isWon === true;

      map[m.id] = { attempts, won, played: attempts > 0 || won };
    }
    return map;
  }

  useEffect(() => {
    setStatusByMode(computeStatuses());
    const onStorage = () => setStatusByMode(computeStatuses());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey, modes]);

  function handleSelect(id) {
    localStorage.setItem("pokedleplus:lastMode", id);
    setLastMode(id);
    onSelect(id);
  }

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto w-full max-w-[1900px] px-4 md:px-10 2xl:px-16 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-black">Pokedle+</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector
              t={t}
              locale={locale}
              changeLocale={changeLocale}
              availableLocales={availableLocales}
            />
          </div>
        </div>
        <p className="text-center mb-6 text-muted">{t("home.tagline")}</p>

        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <span className="text-xs text-muted">
            {t("home.today")}{" "}
            <span className="font-semibold text-strong">{dayKey || "??"}</span>
          </span>

          <button
            onClick={() => handleSelect(lastMode)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold btn-surface transition"
            title={t("home.continue_title")}
          >
            {t("home.continue")}{" "}
            <span className="text-muted">({lastMode})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {modes.map((m) => {
            const st = statusByMode[m.id] || {
              attempts: 0,
              won: false,
              played: false,
            };

            return (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={[
                  "group relative rounded-[28px] border text-left transition-all duration-300",
                  "p-5 md:p-7 2xl:p-8 min-h-[160px] md:min-h-[170px] 2xl:min-h-[185px]",
                  "shadow-lg hover:shadow-2xl hover:-translate-y-1",
                  st.won
                    ? "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                    : st.played
                      ? "border-white/50 bg-white/60 hover:bg-white/80 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/60"
                      : "border-transparent bg-white/40 hover:bg-white/60 dark:border-transparent dark:bg-zinc-900/20 dark:hover:bg-zinc-800/40",
                ].join(" ")}
                title={m.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-5 min-w-0">
                    <div
                      className={[
                        "h-14 w-14 md:h-16 md:w-16 rounded-3xl",
                        m.color,
                        "flex items-center justify-center text-white shrink-0",
                        "shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
                        "transition-transform duration-200 group-hover:scale-[1.05]",
                      ].join(" ")}
                    >
                      <m.Icon className="h-7 w-7 md:h-8 md:w-8" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xl font-extrabold leading-tight break-words">
                        {m.title}
                      </div>
                      <div className="text-sm text-muted">{m.desc}</div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {st.won ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />{" "}
                        {t("home.status_won")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
                        <CircleDashed className="h-4 w-4" />{" "}
                        {t("home.status_pending")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="text-muted">
                    {t("home.attempts")}{" "}
                    <span className="font-semibold text-strong">
                      {st.attempts}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 text-muted transition group-hover:text-strong">
                    {t("home.play")}{" "}
                    <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-muted">
          {t("home.footer")}
        </div>
      </div>
    </div>
  );
}
