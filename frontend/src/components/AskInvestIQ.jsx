import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Globe
} from 'lucide-react';

export const AskInvestIQ = ({ reportId, companyName = 'this company' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const QUICK_QUESTIONS = [
    "What's the single biggest risk here?",
    "How confident are you really?",
    "What would change your mind?",
    "Explain this to me like I'm new to investing."
  ];

  useEffect(() => {
    if (!reportId) return;
    fetch(`${apiUrl}/api/reports/${reportId}/chat`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error('Failed to load chat history:', err));
  }, [reportId, apiUrl]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const content = textToSend || input;
    if (!content.trim() || isStreaming || !reportId) return;

    setError(null);
    const userMsg = { role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const response = await fetch(`${apiUrl}/api/reports/${reportId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim() })
      });

      if (response.status === 429) {
        const errData = await response.json();
        throw new Error(errData.error || 'Rate limit exceeded (max 20 messages per hour).');
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.token) {
                accumulatedText += parsed.token;
                setStreamingContent(accumulatedText);
              }
              if (parsed.done) {
                break;
              }
            } catch (parseErr) {
              // Ignore incomplete json chunks
            }
          }
        }
      }

      if (accumulatedText) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: accumulatedText, timestamp: new Date() }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Connection failed while communicating with InvestIQ.');
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // Helper to format assistant messages with general knowledge badges & basic markdown
  const renderFormattedMessage = (content) => {
    const text = String(content || '');

    // Check if the message contains the general knowledge prefix
    const generalKnowledgeRegex = /Beyond what I researched for [^:]+:/i;
    const match = text.match(generalKnowledgeRegex);

    if (match && match.index !== undefined) {
      const groundedPart = text.slice(0, match.index).trim();
      const generalPart = text.slice(match.index + match[0].length).trim();

      return (
        <div className="space-y-3">
          {groundedPart && (
            <div className="whitespace-pre-line leading-relaxed">{groundedPart}</div>
          )}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-mono uppercase tracking-wider font-extrabold">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>General Knowledge / Outside Scope</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-200 text-xs">
              {generalPart}
            </div>
          </div>
        </div>
      );
    }

    return <div className="whitespace-pre-line leading-relaxed">{text}</div>;
  };

  return (
    <>
      {/* Floating Action Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center gap-3 shadow-2xl shadow-cyan-500/30 transition-all transform hover:scale-105 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span>Ask InvestIQ</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950 border border-slate-950/20">
            AI CHAT
          </span>
        </button>
      )}

      {/* Expandable Slide-over Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0B0F19]/95 border-l border-slate-800 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  Ask InvestIQ
                  <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    Grounded Memo AI
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-[240px]">
                  {companyName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close chat panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quick Question Chips on Empty History */}
            {messages.length === 0 && !isStreaming && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Real Multi-Turn Institutional Chat</span>
                  </div>
                  <p>
                    Ask any question about the gathered research for {companyName}. Answers cite exact findings from the report.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Suggested Quick Questions:
                  </span>
                  <div className="flex flex-col gap-2">
                    {QUICK_QUESTIONS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        disabled={isStreaming}
                        className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 transition-all flex items-center justify-between group"
                      >
                        <span>{chip}</span>
                        <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render Existing Chat Turns */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-slate-800/90 border border-slate-700 text-white rounded-br-none'
                      : 'bg-cyan-950/30 border border-cyan-500/30 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'user'
                    ? msg.content
                    : renderFormattedMessage(msg.content)}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 font-bold mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Active SSE Streaming Turn */}
            {isStreaming && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-1 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl text-sm max-w-[85%] bg-cyan-950/30 border border-cyan-500/40 text-slate-100 rounded-bl-none">
                  {streamingContent ? (
                    renderFormattedMessage(streamingContent)
                  ) : (
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>InvestIQ AI synthesizing grounded response...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-slate-800/80 bg-slate-900/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about ${companyName}...`}
              disabled={isStreaming}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
