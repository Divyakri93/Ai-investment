import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

export const LiveLogConsole = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 font-mono text-xs">
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>INVESTIQ TELEMETRY CONSOLE — STREAMING SSE LOGS</span>
        </div>
        <span className="text-[10px] text-slate-500">
          {logs.length} events received
        </span>
      </div>

      <div
        ref={scrollRef}
        className="p-4 max-h-72 overflow-y-auto space-y-2 bg-[#080B12]"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">
            Waiting for LangGraph streaming events from backend API...
          </p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none">[{idx + 1}]</span>
              <span className="text-cyan-400 font-semibold uppercase">
                {log.node}:
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
