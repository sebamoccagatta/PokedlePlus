import React, { useMemo } from "react";
import { ArrowRight, Target } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { LanguageSelector } from "./LanguageSelector.jsx";
import { HomeDailyHubSection } from "./HomeDailyHubSection.jsx";
import { HOME_MODE_CATALOG } from "../constants/homeCatalog.js";
import { HOME_DAILY_GAMES, HOME_GAME_ACTIONS } from "../constants/homeGames.js";
import { useHomeDashboard } from "../hooks/useHomeDashboard.js";

export function Home({ onHomeGameAction, dayKey, i18n, dailyGameStatuses = {} }) {
  const { t, locale, changeLocale, availableLocales } = i18n;
  const modes = useMemo(
    () =>
      HOME_MODE_CATALOG.map((mode) => ({
        ...mode,
        title: t(mode.titleKey),
        desc: t(mode.descKey),
      })),
    [t],
  );

  const { streakSummary, missionProgress, ctaMode, heroCtaLabel } =
    useHomeDashboard({
      dayKey,
      modeCatalog: modes,
      t,
    });

  const dailyGames = useMemo(
    () =>
      HOME_DAILY_GAMES.map((game) => ({
        ...game,
        title: t(game.titleKey),
        description:
          game.id === "guess-pokemon"
            ? `${t(game.descriptionKey)} ${ctaMode.title}`
            : t(game.descriptionKey),
      })),
    [ctaMode.title, t],
  );

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
              <p className="text-muted mb-5 max-w-2xl">
                {t("home.hero.subtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-muted">
                <span className="inline-flex items-center gap-2 rounded-full border border-app bg-surface-soft px-3 py-1.5">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  {t("home.today")}{" "}
                  <span className="font-semibold text-strong">
                    {dayKey || "??"}
                  </span>
                </span>
              </div>

              <button
                onClick={() =>
                  onHomeGameAction({ type: HOME_GAME_ACTIONS.OPEN_GUESS_HUB })
                }
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/35 active:translate-y-0 active:scale-[0.99] animate-[pulse_2.8s_ease-in-out_infinite] motion-reduce:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                title={t("home.hero.cta_title")}
                aria-label={`${t("home.hero.cta_aria")} ${ctaMode.title}`}
              >
                <span>{heroCtaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <HomeDailyHubSection
              t={t}
              streakSummary={streakSummary}
              missionProgress={missionProgress}
            />
          </div>
        </div>

        <section className="mb-8" aria-labelledby="daily-games-title">
          <div className="mb-4">
            <h3
              id="daily-games-title"
              className="text-xl md:text-2xl font-extrabold text-strong"
            >
              {t("home.daily_games.title")}
            </h3>
            <p className="text-sm text-muted">
              {t("home.daily_games.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dailyGames.map((game) => {
              const baseCardClasses = [
                "relative h-full w-full rounded-2xl border p-5 text-left transition-all duration-300",
                "min-h-[170px]",
                game.isEnabled
                  ? "border-app bg-surface shadow-card hover:-translate-y-0.5 hover:border-indigo-400/70 hover:shadow-lg hover:shadow-indigo-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                  : "border-app/70 bg-surface-soft/70 opacity-65 cursor-not-allowed",
              ].join(" ");

              return (
                <div key={game.id} className="h-full">
                  {game.isEnabled ? (
                    <button
                      type="button"
                      aria-label={`${game.title} · ${t("home.daily_games.play_now")}`}
                      onClick={() =>
                        onHomeGameAction({ type: game.actionType, gameId: game.id })
                      }
                      className={baseCardClasses}
                    >
                      <div className="flex h-full flex-col justify-between gap-5">
                        <div className="space-y-2">
                          <span className="inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                            {t("home.daily_games.active_today")}
                          </span>
                          <span className="ml-2 inline-flex items-center rounded-full border border-indigo-500/35 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-200">
                            {t(`home.status_${dailyGameStatuses[game.id] || "pending"}`)}
                          </span>
                          <p className="text-base font-bold text-strong">
                            {game.title}
                          </p>
                          <p className="text-sm text-muted">
                            {game.description}
                          </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/45 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-200">
                          {t("home.daily_games.play_now")}
                          <ArrowRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div aria-disabled="true" className={baseCardClasses}>
                      <div className="flex h-full flex-col justify-between gap-5">
                        <div className="space-y-2">
                          <span className="inline-flex items-center rounded-full border border-zinc-500/35 bg-zinc-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-300">
                            {t("home.daily_games.soon")}
                          </span>
                          <p className="text-base font-bold text-strong/85">
                            {game.title}
                          </p>
                          <p className="text-sm text-muted">
                            {game.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-10 text-center text-xs text-muted">
          {t("home.footer")}
        </div>
      </div>
    </div>
  );
}
