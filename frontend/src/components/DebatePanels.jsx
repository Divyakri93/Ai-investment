import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';

export const DebatePanels = ({ bullCase, bearCase }) => {
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

        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-emerald-500/20 pt-4">
          {bullCase || 'Bull case thesis is currently being synthesized...'}
        </div>
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

        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-red-500/20 pt-4">
          {bearCase || 'Bear case thesis is currently being synthesized...'}
        </div>
      </div>
    </div>
  );
};
