import React, { useState } from 'react';
import { Bot, Send, ShieldCheck, Lock, Sparkles, RefreshCw, Languages, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  time: string;
}

const PRESET_QUERIES = [
  { label: 'Why is this message suspicious?', query: 'Why is this message suspicious?' },
  { label: 'What is a UPI Reverse Charge Scam?', query: 'How does the UPI QR code cashback scam work?' },
  { label: 'Why is HTTPS not enough for safety?', query: 'Does HTTPS with padlock icon mean a website is 100% safe?' },
  { label: 'What is Typosquatting?', query: 'What is typosquatting in phishing attacks?' },
  { label: 'I accidentally shared my OTP! Help!', query: 'I accidentally clicked a phishing link and shared my OTP. What should I do now?' },
];

export const AssistantPage: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'gu'>('en');
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: (
        "Hello! I am your On-Device Explainable AI Security Assistant. " +
        "I can explain why specific messages or URLs are suspicious, break down cybersecurity concepts, " +
        "and provide emergency response steps in English, Hindi (हिंदी), and Gujarati (ગુજરાતી). " +
        "How can I assist your digital safety today?"
      ),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSend = async (userQuery?: string) => {
    const q = (userQuery || input).trim();
    if (!q) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: q, time: timeStr };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.askAssistant(q, language);
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response,
        intent: data.intent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while evaluating your question locally. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header & Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Explainable AI Cybersecurity Assistant
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            100% On-Device Knowledge Engine • Multilingual Explanations • Privacy Preserving
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-navy-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition ${language === 'en' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg transition ${language === 'hi' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('gu')}
            className={`px-2.5 py-1 rounded-lg transition ${language === 'gu' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            ગુજરાતી
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 font-sans ${
                m.role === 'user'
                  ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 shadow-glow-cyan'
                  : 'bg-navy-900/90 text-slate-200 border border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-slate-400 border-b border-slate-800/60 pb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  {m.role === 'user' ? 'You' : 'CyberRakshak AI'}
                </span>
                <span>{m.time}</span>
              </div>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono p-3 bg-navy-900/60 rounded-xl border border-slate-800 max-w-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting local cybersecurity knowledge base...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 pt-2">
        {PRESET_QUERIES.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-850 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 transition font-mono"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about phishing, scam messages, UPI safety, or security terms..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
};
