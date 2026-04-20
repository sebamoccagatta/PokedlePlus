import React, { useState } from "react";
import {
  X,
  Trophy,
  Flame,
  Target,
  BarChart3,
  Share2,
  Activity,
  CheckCircle2,
  Repeat,
  Shuffle,
  Clock3,
} from "lucide-react";

export default function StatsModal({
  stats,
  localMetrics,
  recentMetricEvents,
  onClose,
  onShare,
  t,
}) {
  if (!stats) return null;

  const [activeTab, setActiveTab] = useState("summary");
  const [showFullDistribution, setShowFullDistribution] = useState(false);
  const [showMoreEvents, setShowMoreEvents] = useState(false);

  const { totalGames, wins, currentStreak, maxStreak, distribution } = stats;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const {
    started = 0,
    finished = 0,
    completionRate = 0,
    shareRate = 0,
    modeChanges = 0,
  } = localMetrics || {};

  const distributionEntries = Object.entries(distribution || {});
  const nonZeroDistribution = distributionEntries.filter(([, count]) => count > 0);
  const compactDistribution =
    nonZeroDistribution.length > 0
      ? nonZeroDistribution
      : distributionEntries.slice(0, 6);
  const visibleDistribution = showFullDistribution
    ? distributionEntries
    : compactDistribution;
  const canToggleDistribution =
    distributionEntries.length > compactDistribution.length;
  const maxDist = Math.max(...Object.values(distribution || {}), 1);

  const cappedRecentEvents = (recentMetricEvents || []).slice(0, 5);
  const visibleRecentEvents = showMoreEvents
    ? cappedRecentEvents
    : cappedRecentEvents.slice(0, 3);
  const canToggleRecentEvents = cappedRecentEvents.length > 3;

  const eventLabelByType = {
    game_started: t("stats.local.events.game_started"),
    game_finished: t("stats.local.events.game_finished"),
    share_clicked: t("stats.local.events.share_clicked"),
    mode_changed: t("stats.local.events.mode_changed"),
  };

  const eventMeta = (event) => {
    if (event?.type === "game_finished") {
      return event.meta?.won
        ? t("stats.local.events.finished_won")
        : t("stats.local.events.finished_lost");
    }

    if (event?.type === "mode_changed") {
      const fromMode = event.meta?.fromMode || "-";
      const toMode = event.meta?.toMode || "-";
      return `${fromMode} → ${toMode}`;
    }

    return `${t("stats.local.mode")}: ${event?.mode || "-"}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-app rounded-[32px] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-app flex-shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">
              {t("stats.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-soft transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 md:px-6 pt-3 pb-2 border-b border-app/70 flex-shrink-0">
          <div
            role="tablist"
            aria-label={t("stats.tabs.aria_label")}
            className="grid grid-cols-2 rounded-xl bg-surface-soft p-1"
          >
            <button
              type="button"
              role="tab"
              id="stats-tab-summary"
              aria-selected={activeTab === "summary"}
              aria-controls="stats-panel-summary"
              onClick={() => setActiveTab("summary")}
              className={[
                "rounded-lg px-3 py-2 text-xs md:text-sm font-bold transition-colors",
                activeTab === "summary"
                  ? "bg-surface border border-app text-strong"
                  : "text-muted hover:text-strong",
              ].join(" ")}
            >
              {t("stats.tabs.summary")}
            </button>
            <button
              type="button"
              role="tab"
              id="stats-tab-activity"
              aria-selected={activeTab === "activity"}
              aria-controls="stats-panel-activity"
              onClick={() => setActiveTab("activity")}
              className={[
                "rounded-lg px-3 py-2 text-xs md:text-sm font-bold transition-colors",
                activeTab === "activity"
                  ? "bg-surface border border-app text-strong"
                  : "text-muted hover:text-strong",
              ].join(" ")}
            >
              {t("stats.tabs.activity")}
            </button>
          </div>
        </div>

        <div className="p-3 md:p-4 lg:p-5 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === "summary" ? (
            <div role="tabpanel" id="stats-panel-summary" aria-labelledby="stats-tab-summary">
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-5 md:mb-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-2.5 md:p-3 text-center">
                  <Target className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-lg md:text-2xl font-black text-strong">{totalGames}</div>
                  <div className="text-[9px] uppercase font-bold text-muted mt-1 leading-tight">
                    {t("stats.played")}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-2.5 md:p-3 text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                  <div className="text-lg md:text-2xl font-black text-strong">{winRate}%</div>
                  <div className="text-[9px] uppercase font-bold text-muted mt-1 leading-tight">
                    {t("stats.win_rate")}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-2.5 md:p-3 text-center">
                  <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                  <div className="text-lg md:text-2xl font-black text-strong">{currentStreak}</div>
                  <div className="text-[9px] uppercase font-bold text-muted mt-1 leading-tight">
                    {t("stats.current_streak")}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-2.5 md:p-3 text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <div className="text-lg md:text-2xl font-black text-strong">{maxStreak}</div>
                  <div className="text-[9px] uppercase font-bold text-muted mt-1 leading-tight">
                    {t("stats.max_streak")}
                  </div>
                </div>
              </div>

              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted mb-2.5">
                {t("stats.distribution")}
              </h3>

              <div className="space-y-1.5">
                {visibleDistribution.map(([guess, count]) => (
                  <div key={guess} className="flex items-center gap-2">
                    <div className="w-5 text-[10px] font-bold text-strong bg-surface-soft rounded-md px-1 py-0.5 text-center">
                      {guess}
                    </div>
                    <div className="flex-1 h-4 md:h-5 bg-surface-soft rounded-lg overflow-hidden border border-app/50">
                      <div
                        className={[
                          "h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2 min-w-[20px]",
                          count > 0
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                            : "bg-transparent text-transparent",
                        ].join(" ")}
                        style={{ width: `${Math.max((count / maxDist) * 100, 5)}%` }}
                      >
                        <span className="text-[9px] font-bold">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {canToggleDistribution ? (
                <button
                  type="button"
                  onClick={() => setShowFullDistribution((prev) => !prev)}
                  className="mt-3 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  {showFullDistribution
                    ? t("stats.distribution_toggle.show_less")
                    : t("stats.distribution_toggle.show_full")}
                </button>
              ) : null}
            </div>
          ) : (
            <div role="tabpanel" id="stats-panel-activity" aria-labelledby="stats-tab-activity">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted mb-2.5">
                {t("stats.local.title")}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="rounded-xl border border-app bg-surface-soft p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider leading-tight">
                    <Activity className="h-3.5 w-3.5" />
                    {t("stats.local.started")}
                  </div>
                  <p className="mt-1.5 text-xl font-black text-strong">{started}</p>
                </div>

                <div className="rounded-xl border border-app bg-surface-soft p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("stats.local.finished")}
                  </div>
                  <p className="mt-1.5 text-xl font-black text-strong">{finished}</p>
                </div>

                <div className="rounded-xl border border-app bg-surface-soft p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider leading-tight">
                    <Target className="h-3.5 w-3.5" />
                    {t("stats.local.completion_rate")}
                  </div>
                  <p className="mt-1.5 text-xl font-black text-strong">{completionRate}%</p>
                </div>

                <div className="rounded-xl border border-app bg-surface-soft p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider leading-tight">
                    <Repeat className="h-3.5 w-3.5" />
                    {t("stats.local.share_rate")}
                  </div>
                  <p className="mt-1.5 text-xl font-black text-strong">{shareRate}%</p>
                </div>

                <div className="rounded-xl border border-app bg-surface-soft p-2.5 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider leading-tight">
                    <Shuffle className="h-3.5 w-3.5" />
                    {t("stats.local.mode_changes")}
                  </div>
                  <p className="mt-1.5 text-xl font-black text-strong">{modeChanges}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-app bg-surface-soft p-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-muted mb-2.5">
                  {t("stats.local.recent_events")}
                </h4>

                {cappedRecentEvents.length ? (
                  <>
                    <ul className="space-y-1.5">
                      {visibleRecentEvents.map((event, idx) => (
                        <li
                          key={`${event.type}-${event.ts}-${idx}`}
                          className="rounded-lg border border-app/60 bg-surface px-2.5 py-2"
                        >
                          <p className="text-[11px] font-bold text-strong leading-tight">
                            {eventLabelByType[event.type] || event.type}
                          </p>
                          <p className="text-[10px] text-muted leading-tight mt-0.5">
                            {eventMeta(event)}
                          </p>
                          <p className="text-[10px] text-muted mt-1 inline-flex items-center gap-1 leading-tight">
                            <Clock3 className="h-3 w-3" />
                            {new Date(event.ts).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>

                    {canToggleRecentEvents ? (
                      <button
                        type="button"
                        onClick={() => setShowMoreEvents((prev) => !prev)}
                        className="mt-3 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        {showMoreEvents
                          ? t("stats.events_toggle.show_less")
                          : t("stats.events_toggle.show_more")}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-muted">{t("stats.local.no_events")}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 bg-surface-soft border-t border-app flex flex-col sm:flex-row gap-3 flex-shrink-0">
           <button
             onClick={onShare}
             className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
           >
             <Share2 className="h-4 w-4" />
             {t("game.share")}
           </button>
           <button
             onClick={onClose}
             className="flex-1 px-6 py-3 rounded-2xl bg-surface border border-app font-bold hover:bg-surface-soft transition-colors"
           >
             {t("stats.close")}
           </button>
        </div>
      </div>
    </div>
  );
}
