import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundView = ({ onNavigate }) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-card p-10 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-extrabold">
            404 NOT FOUND
          </span>
          <h1 className="text-2xl font-extrabold text-white">
            Institutional Route Missing
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested terminal path or archive view does not exist in the active institutional workspace.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-full py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Research Terminal</span>
        </button>
      </div>
    </div>
  );
};
