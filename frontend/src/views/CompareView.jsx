import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Trophy,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  History,
  Play
} from 'lucide-react';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { DebatePanels } from '../components/DebatePanels';
import { GraphVisualizer } from '../components/GraphVisualizer';

export const CompareView = () => {
  const [reports, setReports] = useState([]);
  const [inputA, setInputA] = useState('Zomato');
  const [inputB, setInputB] = useState('Swiggy');
  const [showHistoryPicker, setShowHistoryPicker] = useState(false);

  // Live Research Progress State
  const [isComparingLive, setIsComparingLive] = useState(false);
  const [stateA, setStateA] = useState({ logs: [] });
  const [stateB, setStateB] = useState({ logs: [] });

  // Final Result State
  const [reportA, setReportA] = useState(null);
  const [reportB, setReportB] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);

  // Accordions for thesis panels
  const [openThesisA, setOpenThesisA] = useState(false);
  const [openThesisB, setOpenThesisB] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const QUICK_PAIRS = [
    { a: 'Zomato', b: 'Swiggy' },
    { a: 'Tesla', b: 'BYD' },
    { a: 'Apple', b: 'Microsoft' },
    { a: 'NVIDIA', b: 'AMD' }
  ];

  useEffect(() => {
    fetch(`${apiUrl}/api/reports`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        }
      })
      .catch((e) => console.error('Failed to load history for comparison:', e));
  }, [apiUrl]);

  const runLiveComparison = async (companyA, companyB) => {
    const targetA = companyA || inputA;
    const targetB = companyB || inputB;
    if (!targetA.trim() || !targetB.trim()) return;

    setError(null);
    setIsComparingLive(true);
    setStateA({ logs: [] });
    setStateB({ logs: [] });
    setReportA(null);
    setReportB(null);
    setComparisonResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ companyA: targetA.trim(), companyB: targetB.trim() })
      });

      if (!response.ok) {
        throw new Error(`Comparison API returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const eventLines = block.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of eventLines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === 'log') {
                const tag = parsed.company;
                const nodeName = parsed.node;
                const logItem = `[${nodeName?.toUpperCase() || 'SYS'}] ${parsed.message}`;
                const updateState = (prev) => {
                  const currActive = prev.activeNodes || [];
                  const currComp = prev.completedNodes || [];
                  const newComp = [...new Set([...currComp, ...currActive.filter(n => n !== nodeName)])];
                  const newActive = nodeName && nodeName !== 'system' ? [nodeName] : currActive;
                  return {
                    ...prev,
                    logs: [...(prev.logs || []), logItem],
                    activeNodes: newActive,
                    completedNodes: newComp
                  };
                };
                if (tag === 'A') {
                  setStateA(updateState);
                } else if (tag === 'B') {
                  setStateB(updateState);
                }
              } else if (eventType === 'partial') {
                const tag = parsed.company;
                if (tag === 'A') {
                  setStateA((prev) => ({ ...prev, ...parsed.state }));
                } else if (tag === 'B') {
                  setStateB((prev) => ({ ...prev, ...parsed.state }));
                }
              } else if (eventType === 'final') {
                setReportA(parsed.reportA);
                setReportB(parsed.reportB);
                setComparisonResult(parsed.comparisonResult);
                setIsComparingLive(false);
              } else if (eventType === 'error') {
                throw new Error(parsed.error || 'Comparison pipeline error');
              }
            } catch (e) {
              console.error('SSE parse error:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to compare companies');
      setIsComparingLive(false);
    }
  };

  const selectHistoryPair = (repA, repB) => {
    setReportA(repA);
    setReportB(repB);
    setInputA(repA.companyName || repA.resolvedTicker);
    setInputB(repB.companyName || repB.resolvedTicker);
    setShowHistoryPicker(false);
  };

  const renderVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'INVEST':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> INVEST
          </span>
        );
      case 'PASS':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> PASS
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {verdict || 'WATCH'}
          </span>
        );
    }
  };

  const renderHorizontalScorecard = (scoreA, scoreB, metricName) => {
    const valA = scoreA || 0;
    const valB = scoreB || 0;
    return (
      <div className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase">
          <span className="text-cyan-400">{inputA} ({valA}/10)</span>
          <span className="text-slate-300">{metricName}</span>
          <span className="text-violet-400">{inputB} ({valB}/10)</span>
        </div>
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Bar A (Cyan) right-to-left */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex justify-end">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(valA / 10) * 100}%` }}
            />
          </div>
          {/* Bar B (Violet) left-to-right */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(valB / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-cyan-400" />
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Live AI Institutional Compare Mode
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                Concurrent Multi-Agent Evaluation & Head-to-Head Thesis Allocation
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistoryPicker(!showHistoryPicker)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 flex items-center gap-2 self-start sm:self-auto"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>{showHistoryPicker ? 'Hide History Picker' : 'Or Pick From Saved History'}</span>
          </button>
        </div>

        {/* Saved History Picker Modal / Drawer */}
        {showHistoryPicker && (
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
              Select Two Saved Research Memos From Archive
            </h3>
            {reports.length < 2 ? (
              <p className="text-xs text-slate-400 font-mono">
                At least 2 saved reports are required to compare from history. Currently found: {reports.length}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {reports.slice(0, 6).map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const other = reports.find((item) => item._id !== r._id) || reports[0];
                      selectHistoryPair(r, other);
                    }}
                    className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">
                        {r.companyName || r.resolvedTicker}
                      </span>
                      {renderVerdictBadge(r.verdict)}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {r.plainSummary || r.reasoningSummary}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Input Pair Controls */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Input A */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-cyan-400 block">
                Company A (Cyan)
              </label>
              <input
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                placeholder="e.g. Zomato, Tesla, Apple"
                disabled={isComparingLive}
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* VS Badge */}
            <div className="md:col-span-1 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-extrabold font-mono text-xs text-slate-300">
                VS
              </span>
            </div>

            {/* Input B */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-violet-400 block">
                Company B (Violet)
              </label>
              <input
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                placeholder="e.g. Swiggy, BYD, Microsoft"
                disabled={isComparingLive}
                className="w-full bg-slate-950 border border-violet-500/40 rounded-2xl px-4 py-3.5 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-violet-400 transition-colors"
              />
            </div>
          </div>

          {/* Quick Pairs & Run Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-bold">Quick Pairs:</span>
              {QUICK_PAIRS.map((pair, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputA(pair.a);
                    setInputB(pair.b);
                  }}
                  disabled={isComparingLive}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
                >
                  {pair.a} vs {pair.b}
                </button>
              ))}
            </div>

            <button
              onClick={() => runLiveComparison()}
              disabled={isComparingLive || !inputA.trim() || !inputB.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-50 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all shrink-0"
            >
              {isComparingLive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Researching Concurrently...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Compare Live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Concurrent Research State (2 Side-by-Side GraphVisualizers) */}
        {isComparingLive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  COMPANY A EVALUATION: {inputA}
                </span>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
              <GraphVisualizer
                activeNodes={stateA.activeNodes || ['debateNode']}
                completedNodes={stateA.completedNodes || ['routerNode', 'fundamentalsAgent', 'newsSentimentAgent', 'competitiveAgent', 'riskAgent']}
              />
            </div>

            <div className="glass-card p-6 rounded-3xl border border-violet-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-violet-400">
                  COMPANY B EVALUATION: {inputB}
                </span>
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              </div>
              <GraphVisualizer
                activeNodes={stateB.activeNodes || ['debateNode']}
                completedNodes={stateB.completedNodes || ['routerNode', 'fundamentalsAgent', 'newsSentimentAgent', 'competitiveAgent', 'riskAgent']}
              />
            </div>
          </div>
        )}

        {/* Comparison Result Dashboard */}
        {reportA && reportB && !isComparingLive && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Winner Declaration Banner */}
            <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-widest font-extrabold text-amber-400">
                      ALLOCATION COMMITTEE HEAD-TO-HEAD VERDICT
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {comparisonResult?.winner === 'A' && (
                      <span className="text-cyan-400">
                        Winner: {reportA.companyName} ({reportA.resolvedTicker})
                      </span>
                    )}
                    {comparisonResult?.winner === 'B' && (
                      <span className="text-violet-400">
                        Winner: {reportB.companyName} ({reportB.resolvedTicker})
                      </span>
                    )}
                    {(!comparisonResult?.winner || comparisonResult?.winner === 'TOO_CLOSE') && (
                      <span className="text-amber-400">
                        Too Close To Call (Parity / Distinct Trade-offs)
                      </span>
                    )}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {comparisonResult?.winnerReasoning ||
                      `Both ${reportA.companyName} and ${reportB.companyName} present distinct institutional trade-offs across valuation, growth upside, and governance risk.`}
                  </p>
                </div>

                {/* Side-by-Side Verdict Pills */}
                <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 text-center min-w-[140px]">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">
                      {reportA.companyName}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      {renderVerdictBadge(reportA.verdict)}
                    </div>
                    <span className="text-xs text-slate-400 font-mono mt-1 block">
                      {reportA.confidence}% Conf.
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-violet-500/40 text-center min-w-[140px]">
                    <span className="text-[10px] font-mono text-violet-400 font-bold uppercase block mb-1">
                      {reportB.companyName}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      {renderVerdictBadge(reportB.verdict)}
                    </div>
                    <span className="text-xs text-slate-400 font-mono mt-1 block">
                      {reportB.confidence}% Conf.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Grid: Scorecards & Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Horizontal Bar Scorecards */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  Left vs Right Dimension Scorecards
                </h3>
                {renderHorizontalScorecard(
                  reportA.scores?.financialHealth?.score,
                  reportB.scores?.financialHealth?.score,
                  'Financial Health'
                )}
                {renderHorizontalScorecard(
                  reportA.scores?.growthPotential?.score,
                  reportB.scores?.growthPotential?.score,
                  'Growth Potential'
                )}
                {renderHorizontalScorecard(
                  reportA.scores?.marketPosition?.score,
                  reportB.scores?.marketPosition?.score,
                  'Market Position'
                )}
                {renderHorizontalScorecard(
                  reportA.scores?.riskLevel?.score,
                  reportB.scores?.riskLevel?.score,
                  'Risk Level'
                )}
              </div>

              {/* Shared Overlaid Radar Chart */}
              <ScoreRadarChart
                scores={reportA.scores}
                scoresB={reportB.scores}
                labelA={reportA.companyName}
                labelB={reportB.companyName}
              />
            </div>

            {/* Category Comparison Table */}
            {comparisonResult?.categoryComparison && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  Dimension-by-Dimension Institutional Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
                        <th className="py-3 px-4">Dimension</th>
                        <th className="py-3 px-4 text-cyan-400">{reportA.companyName}</th>
                        <th className="py-3 px-4 text-violet-400">{reportB.companyName}</th>
                        <th className="py-3 px-4">Winner</th>
                        <th className="py-3 px-4">Analyst Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {comparisonResult.categoryComparison.map((cat, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="py-4 px-4 font-bold text-white">{cat.category}</td>
                          <td className="py-4 px-4 font-mono text-cyan-400 font-extrabold">
                            {reportA.scores?.[cat.category === 'Financial Health' ? 'financialHealth' :
                              cat.category === 'Growth Potential' ? 'growthPotential' :
                              cat.category === 'Market Position' ? 'marketPosition' : 'riskLevel']?.score ?? '-'}/10
                          </td>
                          <td className="py-4 px-4 font-mono text-violet-400 font-extrabold">
                            {reportB.scores?.[cat.category === 'Financial Health' ? 'financialHealth' :
                              cat.category === 'Growth Potential' ? 'growthPotential' :
                              cat.category === 'Market Position' ? 'marketPosition' : 'riskLevel']?.score ?? '-'}/10
                          </td>
                          <td className="py-4 px-4">
                            {cat.winner === 'A' && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {reportA.companyName}
                              </span>
                            )}
                            {cat.winner === 'B' && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                {reportB.companyName}
                              </span>
                            )}
                            {cat.winner === 'TIE' && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold bg-slate-800 text-slate-300">
                                PARITY / TIE
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-300 leading-snug">
                            {cat.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Investor Fit Card */}
            {comparisonResult?.investorFitNote && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-violet-950/20 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
                  <Scale className="w-4 h-4" />
                  <span>Investor Profile Allocation Guidance</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {comparisonResult.investorFitNote}
                </p>
              </div>
            )}

            {/* Accordion Thesis Panels for Each Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider">
                Individual Company Bull vs Bear Thesis Drilldown
              </h3>

              {/* Company A Thesis Accordion */}
              <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenThesisA(!openThesisA)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span className="font-extrabold text-base text-white">
                      {reportA.companyName} ({reportA.resolvedTicker}) — Detailed Bull vs Bear Debate
                    </span>
                  </div>
                  {openThesisA ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {openThesisA && (
                  <div className="p-6 border-t border-slate-800/80">
                    <DebatePanels bullCase={reportA.bullCase} bearCase={reportA.bearCase} />
                  </div>
                )}
              </div>

              {/* Company B Thesis Accordion */}
              <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenThesisB(!openThesisB)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-violet-400" />
                    <span className="font-extrabold text-base text-white">
                      {reportB.companyName} ({reportB.resolvedTicker}) — Detailed Bull vs Bear Debate
                    </span>
                  </div>
                  {openThesisB ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {openThesisB && (
                  <div className="p-6 border-t border-slate-800/80">
                    <DebatePanels bullCase={reportB.bullCase} bearCase={reportB.bearCase} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
