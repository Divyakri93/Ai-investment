import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

export const SourcesList = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
        <BookOpen className="w-4 h-4" />
        <span>AUDIT CITATIONS & PRIMARY RESEARCH SOURCES</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all group flex items-start justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  #{idx + 1}
                </span>
                <span className="text-[10px] font-mono uppercase text-cyan-400">
                  {src.category || 'Live Web Search'}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                {src.title}
              </h4>
              {src.snippet && (
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {src.snippet}
                </p>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
};
