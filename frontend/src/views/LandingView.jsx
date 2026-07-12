import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Scale,
  CheckCircle2,
  GitCompare,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertTriangle,
  Search,
  BookOpen,
  Check,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingView = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Subtle Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[300px] bg-emerald-500/5 blur-[140px] pointer-events-none -z-10" />

      {/* =========================================================================
          SECTION 2: HERO SECTION
          ========================================================================= */}
      <section className="pt-10 pb-16 lg:pt-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTONOMOUS MULTI-AGENT INVESTMENT COMMITTEE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Give it a company name.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Get an institutional-grade investment verdict
            </span>{' '}
            — with the reasoning shown.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            A committee of autonomous AI research agents investigates a company from multiple angles and debates the case before deciding.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>GO TO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/history"
                  className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-sm font-bold transition-all"
                >
                  VIEW ARCHIVE
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>GET STARTED FREE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signin"
                  className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-sm font-bold transition-all"
                >
                  SIGN IN
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Static Multi-Agent Pipeline Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/95 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500" />
            
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-300">
                  LANGGRAPH.JS COMMITTEE WORKFLOW PREVIEW
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                8-NODE PARALLEL GRAPH
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span>NODE 1</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Router &amp; Entity Map</div>
                <div className="text-[10px] text-slate-400 font-mono">Resolves SEC EDGAR identifiers</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-blue-400">
                  <span>SPECIALIST A</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Fundamentals Agent</div>
                <div className="text-[10px] text-slate-400 font-mono">10-K/10-Q &amp; Cash Flow audit</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400">
                  <span>SPECIALIST B</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">News &amp; Sentiment Agent</div>
                <div className="text-[10px] text-slate-400 font-mono">Live macro headlines tone</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-violet-400">
                  <span>SPECIALIST C</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Competitive &amp; Moat</div>
                <div className="text-[10px] text-slate-400 font-mono">Pricing power vs peers</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                  <span>SPECIALIST D</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Risk Audit Agent</div>
                <div className="text-[10px] text-slate-400 font-mono">Tail risks &amp; governance</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
                  <span>NODE 6</span>
                  <Scale className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Bull vs Bear Debate</div>
                <div className="text-[10px] text-slate-400 font-mono">Adversarial thesis clash</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>NODE 7</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Decision &amp; Score Node</div>
                <div className="text-[10px] text-slate-400 font-mono">INVEST / WATCH / PASS</div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border border-cyan-400/50 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <span>NODE 8</span>
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Institutional Memo</div>
                <div className="text-[10px] text-slate-300 font-mono">Cited PDF briefing export</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "HOW IT WORKS" — 4-STEP VISUAL FLOW
          ========================================================================= */}
      <section id="how-it-works" className="py-16 border-y border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-extrabold">
              HOW IT WORKS
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              A 4-Step Institutional Evaluation Flow
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/60 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                01
              </div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Type a company name</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter any public company or ticker symbol. Our router automatically resolves stock identifiers and Edgar regulatory mappings.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/60 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
                02
              </div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Parallel AI Research</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 specialist agents — <span className="text-slate-200">Fundamentals</span>,{' '}
                <span className="text-slate-200">News &amp; Sentiment</span>,{' '}
                <span className="text-slate-200">Competitive Moat</span>, and{' '}
                <span className="text-slate-200">Risk Audit</span> — investigate filings concurrently.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/60 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
                03
              </div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                <span>Bull vs. Bear Debate</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Opposing agent personas argue the strongest Bull and Bear cases, directly eliminating single-prompt bias and blind spots.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/60 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                04
              </div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Scored Verdict Memo</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an actionable <span className="text-emerald-400 font-bold">INVEST</span>,{' '}
                <span className="text-amber-400 font-bold">WATCH</span>, or{' '}
                <span className="text-red-400 font-bold">PASS</span> verdict with confidence score and fully cited reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURE GRID (CONCRETE & TECHNICAL)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-extrabold">
            INSTITUTIONAL ARCHITECTURE
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Built for Serious Equity Research Analysts
          </h3>
          <p className="text-sm sm:text-base text-slate-400">
            Concrete features designed to eliminate hallucination, expose trade-offs, and accelerate committee diligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">LangGraph.js Pipeline</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Orchestrated with LangGraph.js directed stateful graphs, enabling parallel execution across specialist agents with deterministic routing.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Adversarial Bull vs Bear</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every thesis is challenged by an opposing Bear Persona before synthesizing the final decision, preventing hype-driven optimism.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Compare Mode</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Research two companies side-by-side. InvestIQ evaluates relative valuation, moat durability, and risks to issue a capital allocation winner.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Ask InvestIQ Chat</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have a multi-turn conversational deep-dive on any completed report. Ask follow-up questions grounded strictly in gathered evidence.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Full Source Citations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every financial claim, revenue growth metric, and risk warning is cited directly back to EDGAR filings or verified live news sources.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Downloadable PDF Memo</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export professional two-page investment briefing PDFs instantly to share with your investment committee or portfolio managers.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Honest Confidence Scoring</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our scoring model naturally caps confidence for private or data-sparse companies rather than inflating certainty when data is incomplete.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Explainability Mode Toggle</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch instantly between a plain-language executive briefing for stakeholders and quantitative institutional depth for analysts.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "SEE A SAMPLE VERDICT" PREVIEW
          ========================================================================= */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold uppercase">
              <span>SAMPLE REPORT — ILLUSTRATIVE ANALYSIS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              See the Payoff Before You Sign Up
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Every report delivers a quantified verdict, integer confidence rating, and structured Bull/Bear reasoning.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-white">NVIDIA Corporation</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-xs font-mono font-bold">NVDA</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  SECTOR: SEMICONDUCTORS &amp; AI INFRASTRUCTURE
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono font-black text-lg">
                  INVEST
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-white">84 / 100</div>
                  <div className="text-[10px] text-slate-400">CONFIDENCE RATING</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  BULL THESIS HIGHLIGHTS
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-medium">
                    &bull; Dominant AI accelerator pricing power with &gt;75% gross margin and CUDA developer ecosystem lock-in.
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    BASED ON: FUNDAMENTALS &amp; COMPETITIVE POSITION
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-medium">
                    &bull; Strong forward visibility driven by multi-year hyperscaler data center buildouts.
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    BASED ON: NEWS SENTIMENT &amp; FILINGS
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                  BEAR THESIS &amp; RISK AUDIT
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-medium">
                    &bull; Customer concentration among top 4 cloud providers and geopolitical regulatory headwinds.
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono">
                    BASED ON: RISK AUDIT &amp; GOVERNANCE
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-medium">
                    &bull; Custom ASIC substitution risk from key hyperscale customers over the next 36 months.
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono">
                    BASED ON: COMPETITIVE PEER ANALYSIS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: TRUST / CREDIBILITY STRIP
          ========================================================================= */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-mono font-bold text-cyan-400">01. EVERY CLAIM SOURCED</div>
            <div className="text-[11px] text-slate-400">Direct SEC EDGAR &amp; news citations</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-mono font-bold text-cyan-400">02. LANGGRAPH.JS ORCHESTRATED</div>
            <div className="text-[11px] text-slate-400">Stateful multi-agent ReAct committee</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-mono font-bold text-cyan-400">03. OPEN EXPLAINABILITY</div>
            <div className="text-[11px] text-slate-400">Granular reasoning, zero black boxes</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-mono font-bold text-cyan-400">04. ADVERSARIAL DILIGENCE</div>
            <div className="text-[11px] text-slate-400">Bull vs Bear synthesis eliminates hype</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FINAL CTA SECTION
          ========================================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Upgrade Your Equity Diligence?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Join analysts and investment committees using LangGraph-driven adversarial research.
        </p>
        <div className="flex justify-center pt-2">
          {user ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all"
            >
              <span>GO TO DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/signup"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all"
            >
              <span>GET STARTED FREE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">InvestIQ</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                INSTITUTIONAL AI
              </span>
            </div>

            <div className="flex items-center gap-6 font-mono">
              <a href="#how-it-works" className="hover:text-slate-200 transition-colors">
                HOW IT WORKS
              </a>
              <Link to="/signin" className="hover:text-slate-200 transition-colors">
                SIGN IN
              </Link>
              <Link to="/signup" className="hover:text-slate-200 transition-colors">
                SIGN UP
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
              InvestIQ is an AI-powered institutional research and decision-support tool. It is for informational and analysis purposes only and does not constitute financial, investment, or legal advice.
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              &copy; {new Date().getFullYear()} InvestIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
