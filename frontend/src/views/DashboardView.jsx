import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, GitCompare, History, BookmarkCheck, ArrowRight, Activity, ShieldCheck, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardView = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/research/${encodeURIComponent(query.trim())}`);
  };

  const handleChipClick = (company) => {
    navigate(`/research/${encodeURIComponent(company)}`);
  };

  const popularChips = [
    { name: 'Tesla', ticker: 'TSLA' },
    { name: 'NVIDIA', ticker: 'NVDA' },
    { name: 'Apple', ticker: 'AAPL' },
    { name: 'Microsoft', ticker: 'MSFT' },
    { name: 'Alphabet', ticker: 'GOOGL' },
    { name: 'Zomato', ticker: 'ZOMATO.NS' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
      {/* Welcome & Terminal Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase font-bold mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>ANALYST TERMINAL ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Research Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-semibold">{user?.name || user?.email}</span>. Launch multi-agent research or review committee memos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/compare"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span>COMPARE MODE</span>
          </Link>
          <Link
            to="/history"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>ARCHIVE</span>
          </Link>
        </div>
      </div>

      {/* Main Search Box */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Launch Live LangGraph Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter any public ticker or company name to trigger concurrent agent research & adversarial debate.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter ticker or company name (e.g. TSLA, NVIDIA, AAPL)..."
              className="w-full pl-12 pr-36 py-4 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium text-sm sm:text-base shadow-inner"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>EVALUATE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Popular Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-mono">QUICK LAUNCH:</span>
            {popularChips.map((chip) => (
              <button
                key={chip.ticker}
                onClick={() => handleChipClick(chip.name)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-cyan-400 text-xs font-mono transition-colors flex items-center gap-1"
              >
                <span className="font-bold">{chip.ticker}</span>
                <span className="text-slate-400">({chip.name})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/compare"
          className="group glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Head-to-Head Compare</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare any two companies side-by-side. Our committee weighs relative valuation, moat strength, and risk profiles to issue a capital allocation recommendation.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-mono text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
            <span>LAUNCH COMPARE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/history"
          className="group glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Institutional Archive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access your saved research memos, review historical committee decisions, export PDF memos, or launch interactive Ask InvestIQ Q&amp;A sessions.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
            <span>VIEW ARCHIVE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/watchlist"
          className="group glass-card p-6 rounded-2xl border border-slate-800 hover:border-violet-500/50 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Committee Watchlist</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track your priority watchlist tickers and monitor companies marked as WATCH by the LangGraph adversarial investment committee.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-mono text-violet-400 font-bold group-hover:translate-x-1 transition-transform">
            <span>OPEN WATCHLIST</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
};
