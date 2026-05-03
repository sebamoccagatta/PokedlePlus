import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2,
  CircleDashed,
  ArrowRight,
  CircleOff,
  Flame,
  Trophy,
  Target,
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
import { getMaxAttempts } from "../constants/game.js";
import {
  DAILY_MODE_IDS,
  computeGlobalStreak,
  computeMissionProgress,
  getRecommendedMode,
  getModeStatus,
} from "../utils/dailyMission.js";

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
  const [streakSummary, setStreakSummary] = useState({ current: 0, best: 0 });
  const [lastMode, setLastMode] = useState(
    () => localStorage.getItem("pokedleplus:lastMode")
  );

  const missionModes = useMemo(
    () => modes.filter((m) => m.id !== "infinite"),
    [modes]
  );

  function computeStatuses() {
    const map = {};
    for (const m of modes) {
      map[m.id] = getModeStatus(dayKey, m.id);
    }
    return map;
  }

  useEffect(() => {
    setStatusByMode(computeStatuses());
    setStreakSummary(computeGlobalStreak(DAILY_MODE_IDS));

    const onStorage = () => {
      setStatusByMode(computeStatuses());
      setStreakSummary(computeGlobalStreak(DAILY_MODE_IDS));
      setLastMode(localStorage.getItem("pokedleplus:lastMode"));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dayKey, modes, missionModes]);

  const missionCompleted = useMemo(
    () => computeMissionProgress(statusByMode, DAILY_MODE_IDS).completed,
    [statusByMode]
  );

  const missionTotal = DAILY_MODE_IDS.length;

  const missionProgressPct = useMemo(
    () => computeMissionProgress(statusByMode, DAILY_MODE_IDS).pct,
    [statusByMode]
  );

  const recommendedMode = useMemo(() => {
    const recommendation = getRecommendedMode(statusByMode, lastMode, DAILY_MODE_IDS);
    const mode = modes.find((item) => item.id === recommendation.modeId) || missionModes[0] || modes[0];
    return { mode, intent: recommendation.intent };
  }, [lastMode, missionModes, modes, statusByMode]);

  const fallbackMode = recommendedMode?.mode || missionModes[0] || modes[0];
  const ctaMode = useMemo(() => {
    if (!lastMode) return fallbackMode;
    return modes.find((item) => item.id === lastMode) || fallbackMode;
  }, [fallbackMode, lastMode, modes]);

  const recommendedModeId = ctaMode?.id;

  const heroCtaLabel = useMemo(() => {
    const modeTitle = ctaMode?.title ?? "";
    if (lastMode) {
      return `${t("home.hero.cta_continue")} ${modeTitle}`;
    }
    if (recommendedMode?.intent === "continue") {
      return `${t("home.hero.cta_continue")} ${modeTitle}`;
    }
    if (recommendedMode?.intent === "start") {
      return `${t("home.hero.cta_start")} ${modeTitle} ${t("home.hero.cta_now")}`;
    }
    return `${t("home.hero.cta_play")} ${modeTitle} ${t("home.hero.cta_now")}`;
  }, [ctaMode, lastMode, recommendedMode, t]);

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

        <div className="mb-8 rounded-3xl border border-app bg-surface shadow-card p-5 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
                {t("home.hero.kicker")}
              </p>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-3 text-strong">
                {t("home.hero.title")}
              </h2>
              <p className="text-muted mb-5 max-w-2xl">{t("home.hero.subtitle")}</p>

              <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-muted">
                <span className="inline-flex items-center gap-2 rounded-full border border-app bg-surface-soft px-3 py-1.5">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  {t("home.today")} <span className="font-semibold text-strong">{dayKey || "??"}</span>
                </span>
              </div>

              <button
                onClick={() => handleSelect(ctaMode.id)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/35 active:translate-y-0 active:scale-[0.99] animate-[pulse_2.8s_ease-in-out_infinite] motion-reduce:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                title={t("home.hero.cta_title")}
                aria-label={`${t("home.hero.cta_aria")} ${ctaMode.title}`}
              >
                <span>{heroCtaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-app bg-surface-soft p-4">
                <div className="flex items-center gap-2 text-sm text-muted mb-1">
                  <Flame className="h-4 w-4" aria-hidden="true" />
                  {t("home.hero.current_streak")}
                </div>
                <div className="text-3xl font-black text-strong">{streakSummary.current}</div>
              </div>

              <div className="rounded-2xl border border-app bg-surface-soft p-4">
                <div className="flex items-center gap-2 text-sm text-muted mb-1">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  {t("home.hero.best_streak")}
                </div>
                <div className="text-3xl font-black text-strong">{streakSummary.best}</div>
              </div>

              <div className="rounded-2xl border border-app bg-surface-soft p-4 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">{t("home.hero.daily_progress")}</span>
                  <span className="font-semibold text-strong">
                    {missionCompleted}/{missionTotal} · {missionProgressPct}%
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-800/70"
                  role="progressbar"
                  aria-label={t("home.hero.daily_progress")}
                  aria-valuemin={0}
                  aria-valuemax={missionTotal}
                  aria-valuenow={missionCompleted}
                >
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${missionProgressPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">{t("home.hero.progress_hint")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-strong">{t("home.modes_title")}</h3>
            <p className="text-sm text-muted">{t("home.tagline")}</p>
          </div>
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
                  m.id === recommendedModeId
                    ? "ring-1 ring-indigo-300/70 dark:ring-indigo-400/45 shadow-[0_0_0_1px_rgba(99,102,241,0.18),0_14px_40px_-22px_rgba(79,70,229,0.65)] hover:-translate-y-1.5 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.28),0_22px_48px_-22px_rgba(79,70,229,0.7)]"
                    : "",
                  st.won
                    ? "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                    : st.played && st.attempts >= getMaxAttempts(m.id) && !st.won
                      ? "border-red-200 bg-red-50/80 hover:bg-red-100/70 dark:border-red-500/30 dark:bg-red-950/20 dark:hover:bg-red-950/30"
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
                        <CheckCircle2 className="h-4 w-4" />
                        {t("home.status_won")}
                      </span>
                    ) : st.attempts >= getMaxAttempts(m.id) && !st.won && st.played ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                        <CircleOff className="h-4 w-4" />
                        {t("home.status_lost")}
                      </span>
                    ) : st.attempts > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                        <CircleDashed className="h-4 w-4" />
                        {t("home.status_inProgress")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
                        <CircleDashed className="h-4 w-4" />
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
