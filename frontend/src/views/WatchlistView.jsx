import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Trash2, TrendingUp, ExternalLink, ShieldAlert, Trophy } from 'lucide-react';
import { getWatchlist, toggleWatchlist } from '../utils/watchlist';

export const WatchlistView = ({ onSelectReport }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  const handleRemove = (item) => {
    const updated = toggleWatchlist(item);
    setItems(updated);
  };

  const getVerdictStyle = (verdict = '') => {
    const v = verdict.toUpperCase();
    if (v.includes('INVEST')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (v.includes('WATCH')) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest font-extrabold text-cyan-400">
              INSTITUTIONAL SESSION SHORTLIST
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Active Allocation Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Pin high-conviction or watchlist companies during your session for quick comparative review across verdicts and quantitative confidence ratings.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <span className="text-slate-400">SHORTLISTED ASSETS:</span>
          <span className="text-cyan-400 font-extrabold text-base">{items.length}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <BookmarkCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Your Watchlist is Currently Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Pin to Watchlist" inside any institutional research memo to save companies into your session shortlist.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6">Company / Ticker</th>
                  <th className="py-4 px-6">Committee Verdict</th>
                  <th className="py-4 px-6">Confidence</th>
                  <th className="py-4 px-6">Financial Health</th>
                  <th className="py-4 px-6">Growth Upside</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {items.map((item, idx) => {
                  const scores = item.scores || {};
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{item.companyName}</span>
                          <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {item.ticker || item.resolvedTicker}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${getVerdictStyle(
                            item.verdict
                          )}`}
                        >
                          {item.verdict || 'WATCH'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-extrabold text-cyan-400">
                          {item.confidence || 'N/A'}%
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {scores.financialHealth?.score ?? 'N/A'}/10
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {scores.growthPotential?.score ?? 'N/A'}/10
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => onSelectReport && onSelectReport(item.reportId || item._id || item.ticker)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <span>Open Memo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all inline-flex items-center"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
