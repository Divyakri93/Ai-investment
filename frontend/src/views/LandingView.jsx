import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, ShieldCheck, Cpu, Scale } from 'lucide-react';

export const LandingView = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
    { name: 'Zomato', ticker: 'ZOMATO.NS' },
    { name: 'NVIDIA', ticker: 'NVDA' },
    { name: 'Apple', ticker: 'AAPL' },
    { name: 'Microsoft', ticker: 'MSFT' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 mb-8 shadow-inner">
        <Sparkles className="w-3.5 h-3.5" />
        <span>INSTITUTIONAL AI AGENTIC INVESTMENT COMMITTEE</span>
      </div>

      {/* Hero Heading */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-center tracking-tight text-white max-w-4xl leading-[1.08]">
        Multi-Agent Adversarial <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
          Investment Research
        </span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-slate-400 text-center max-w-2xl font-normal leading-relaxed">
        Enter any public company or ticker. Our autonomous LangGraph ReAct committee
        gathers financial filings, debates Bull vs. Bear theses, and issues a quantified
        verdict with full source citations.
      </p>

      {/* Hero Search Box */}
      <form
        onSubmit={handleSearch}
        className="mt-10 w-full max-w-2xl relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500" />
        <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
          <Search className="w-6 h-6 text-slate-400 ml-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or ticker (e.g., Tesla, Zomato, NVDA)..."
            className="w-full bg-transparent px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
          >
            <span>Research</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Popular Demo Quick Chips */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        <span className="text-xs font-mono text-slate-500 mr-1">INSTANT DEMOS:</span>
        {popularChips.map((item) => (
          <button
            key={item.ticker}
            onClick={() => handleChipClick(item.name)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-all shadow-sm"
          >
            {item.name} <span className="text-slate-500">({item.ticker})</span>
          </button>
        ))}
      </div>

      {/* Feature Pillar Highlights */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Parallel Specialist Agents</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            4 dedicated LangGraph agents fetch SEC EDGAR metrics, live Tavily news catalysts, competitive moats, and institutional risk profiles simultaneously.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Adversarial Bull vs Bear Debate</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A dedicated Bull Analyst and Bear Analyst clash over valuation multiples, operating leverage, and margin sustainability before a final vote.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Audited Verdict & Institutional PDF</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Produces an INVEST / WATCH / PASS verdict with 4-dimension radar scores and multi-page institutional PDF Investment Memo export.
          </p>
        </div>
      </div>
    </div>
  );
};
