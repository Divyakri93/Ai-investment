import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, Zap, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const DebatePanels = ({ bullCase, bearCase }) => {
  const renderPoints = (points, variant = 'bull') => {
    if (Array.isArray(points) && points.length > 0) {
      return (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          {points.map((item, idx) => {
            const strength = (item.strength || 'moderate').toLowerCase();
            const basedOn = item.basedOn || 'Research';
            const text = item.point || item;

            const badgeStyles = {
              strong: variant === 'bull'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm shadow-emerald-500/30'
                : 'bg-red-500 text-slate-950 font-extrabold shadow-sm shadow-red-500/30',
              moderate: variant === 'bull'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold',
              minor: 'bg-slate-800 text-slate-400 border border-slate-700 font-medium'
            }[strength] || 'bg-slate-800 text-slate-300 font-medium';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start gap-3 transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeStyles}`}>
                    {strength}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                    {basedOn}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-4">
        {String(points || 'Analyst thesis is currently being synthesized...')}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bull Case Panel */}
      <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-transparent space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              Institutional Bull Analyst Case
            </h3>
            <p className="text-xs text-emerald-400 font-mono">
              LONG / BUY ADVERSARIAL ARGUMENTATION
            </p>
          </div>
        </div>

        {renderPoints(bullCase, 'bull')}
      </div>

      {/* Bear Case Panel */}
      <div className="glass-card p-6 rounded-3xl border border-red-500/30 bg-gradient-to-b from-red-950/20 to-transparent space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              Institutional Bear Analyst Case
            </h3>
            <p className="text-xs text-red-400 font-mono">
              SHORT / PASS ADVERSARIAL ARGUMENTATION
            </p>
          </div>
        </div>

        {renderPoints(bearCase, 'bear')}
      </div>
    </div>
  );
};
