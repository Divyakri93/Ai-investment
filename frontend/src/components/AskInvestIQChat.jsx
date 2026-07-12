import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';

export const AskInvestIQChat = ({ reportId, companyName }) => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !reportId || loading) return;

    const currentQ = question.trim();
    setQuestion('');
    setHistory((prev) => [...prev, { role: 'user', content: currentQ }]);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/reports/${reportId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQ })
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setHistory((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setHistory((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error || 'Could not generate an answer.'}` }
        ]);
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error communicating with InvestIQ AI server.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/80 to-slate-950 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              Ask InvestIQ Institutional AI
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                <Sparkles className="w-3 h-3" /> GROUNDED IN MEMO
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Ask follow-up questions about {companyName || 'this company'} — answered strictly from gathered research
            </p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl flex items-start gap-3.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-800/80 border border-slate-700 text-slate-200 ml-auto max-w-2xl'
                  : 'bg-cyan-950/30 border border-cyan-500/30 text-slate-100 mr-auto max-w-3xl'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-cyan-500 text-slate-950'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="whitespace-pre-line flex-1">{msg.content}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask a question about ${companyName || 'this research report'} (e.g., What are their top competitors? What is their cash buffer?)`}
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Ask InvestIQ</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
