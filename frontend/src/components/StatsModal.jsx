import React from "react";
import { X, Trophy, Flame, Target, BarChart3, Share2 } from "lucide-react";

export default function StatsModal({ stats, onClose, onShare, t }) {
  if (!stats) return null;

  const { totalGames, wins, currentStreak, maxStreak, distribution } = stats;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const maxDist = Math.max(...Object.values(distribution), 1);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-app rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-app">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-black uppercase tracking-tight">
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

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 text-center mb-10">
            <div>
              <div className="text-3xl font-black text-strong">{totalGames}</div>
              <div className="text-[10px] uppercase font-bold text-muted">
                {t("stats.played")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-strong">{winRate}%</div>
              <div className="text-[10px] uppercase font-bold text-muted">
                {t("stats.win_rate")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-strong">{currentStreak}</div>
              <div className="text-[10px] uppercase font-bold text-muted">
                {t("stats.current_streak")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-strong">{maxStreak}</div>
              <div className="text-[10px] uppercase font-bold text-muted">
                {t("stats.max_streak")}
              </div>
            </div>
          </div>

          <h3 className="text-xs font-black uppercase tracking-widest text-muted mb-6">
            {t("stats.distribution")}
          </h3>
          
          <div className="space-y-2">
            {Object.entries(distribution).map(([guess, count]) => (
              <div key={guess} className="flex items-center gap-3">
                <div className="w-4 text-[11px] font-bold text-muted">{guess}</div>
                <div className="flex-1 h-5 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className={[
                      "h-full rounded-full transition-all duration-500 flex items-center justify-end px-2 min-w-[20px]",
                      count > 0 ? "bg-indigo-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-transparent"
                    ].join(" ")}
                    style={{ width: `${Math.max((count / maxDist) * 100, 5)}%` }}
                  >
                    <span className="text-[10px] font-bold">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-surface-soft border-t border-app flex flex-col sm:flex-row gap-3">
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
