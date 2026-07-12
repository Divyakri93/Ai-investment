import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Database,
  Newspaper,
  ShieldAlert,
  Swords,
  Scale,
  FileCheck,
  CheckCircle2,
  Loader2,
  Clock
} from 'lucide-react';

export const GraphVisualizer = ({ activeNodes = [], completedNodes = [] }) => {
  const activeList = Array.isArray(activeNodes)
    ? activeNodes
    : activeNodes
      ? [activeNodes]
      : [];
  const completedList = Array.isArray(completedNodes)
    ? completedNodes
    : completedNodes
      ? [completedNodes]
      : [];
  const nodes = [
    {
      id: 'routerNode',
      label: 'Router Node',
      subtitle: 'Entity Resolution & Ticker Mapping',
      icon: Compass,
      color: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500/40'
    },
    {
      id: 'fundamentalsAgent',
      label: 'Fundamentals Specialist',
      subtitle: 'P/E, FCF, Margins & SEC EDGAR Metrics',
      icon: Database,
      color: 'from-blue-600 to-indigo-600',
      border: 'border-blue-500/40'
    },
    {
      id: 'newsSentimentAgent',
      label: 'News & Sentiment Specialist',
      subtitle: 'Tavily Live Catalysts & Press Scan',
      icon: Newspaper,
      color: 'from-indigo-600 to-purple-600',
      border: 'border-indigo-500/40'
    },
    {
      id: 'competitiveAgent',
      label: 'Competitive Moat Analyst',
      subtitle: 'Peer Benchmarking & Moat Rating',
      icon: ShieldAlert,
      color: 'from-purple-600 to-pink-600',
      border: 'border-purple-500/40'
    },
    {
      id: 'riskAgent',
      label: 'Risk Specialist',
      subtitle: 'Regulatory Scrutiny & Debt Profile',
      icon: ShieldAlert,
      color: 'from-pink-600 to-rose-600',
      border: 'border-pink-500/40'
    },
    {
      id: 'debateNode',
      label: 'Adversarial Debate Committee',
      subtitle: 'Bull Analyst vs Bear Analyst Thesis Synthesis',
      icon: Swords,
      color: 'from-amber-500 to-orange-600',
      border: 'border-amber-500/40'
    },
    {
      id: 'decisionNode',
      label: 'Decision & Scoring Committee',
      subtitle: '4-Dimension Scorecard & INVEST / WATCH / PASS Verdict',
      icon: Scale,
      color: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-500/40'
    },
    {
      id: 'reportNode',
      label: 'Investment Report Node',
      subtitle: 'Archive & Institutional PDF Memo Generation',
      icon: FileCheck,
      color: 'from-teal-500 to-cyan-600',
      border: 'border-teal-500/40'
    }
  ];

  const getNodeStatus = (id) => {
    if (completedList.includes(id)) return 'completed';
    if (activeList.includes(id)) return 'active';
    return 'pending';
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            LangGraph Multi-Agent Architecture
          </h3>
          <p className="text-xs text-slate-400">
            Real-time visual state tracking of autonomous LangGraph nodes.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const status = getNodeStatus(node.id);
          const Icon = node.icon;

          return (
            <motion.div
              key={node.id}
              layout
              className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                status === 'active'
                  ? 'bg-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                  : status === 'completed'
                  ? 'bg-slate-900/60 border-emerald-500/40'
                  : 'bg-slate-900/20 border-slate-800/60 opacity-60'
              }`}
            >
              {status === 'active' && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                </span>
              )}

              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {status === 'active' && (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
              </div>

              <h4 className="font-bold text-sm text-white">{node.label}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {node.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
