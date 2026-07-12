import React from 'react';

export const HistorySkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="glass-card p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800" />
            <div className="space-y-2">
              <div className="w-32 h-4 rounded bg-slate-800" />
              <div className="w-20 h-3 rounded bg-slate-800/60" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-16 h-6 rounded-full bg-slate-800" />
            <div className="w-12 h-4 rounded bg-slate-800" />
            <div className="w-24 h-8 rounded-xl bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ReportSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="w-48 h-4 rounded bg-slate-800" />
        <div className="w-64 h-8 rounded bg-slate-800" />
        <div className="w-full h-16 rounded bg-slate-800/60" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 rounded-3xl border border-slate-800 h-28 bg-slate-800/40" />
        ))}
      </div>
    </div>
  );
};
