import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Activity, History, Terminal } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              Invest<span className="text-cyan-400">IQ</span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">
                AI Agent
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-mono -mt-1 hidden sm:block">
              Institutional Multi-Agent Debate Terminal
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              location.pathname === '/'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              location.pathname === '/history'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ARCHIVE</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>MERN JS SYSTEM ONLINE</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
