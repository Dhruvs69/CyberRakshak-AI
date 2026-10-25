import React, { useState } from 'react';
import { MessageSquare, Search, ShieldCheck, AlertCircle, RefreshCw, Sparkles, FileText } from 'lucide-react';
import { ScanResult, SamplePreset } from '../types';
import { api } from '../services/api';
import { ScanResultCard } from '../components/ScanResultCard';

const SAMPLE_MESSAGES: SamplePreset[] = [
  {
    label: 'Urgent Bank KYC Deactivation Scam',
    type: 'High Risk',
    text: 'Your bank account will be blocked today. Click the link to update your KYC immediately.',
    description: 'Panic tactic demanding sensitive KYC verification at external link'
  },
  {
    label: 'Electricity Power Cut Disconnection Threat',
    type: 'High Risk',
    text: 'Electricity Alert: Your power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Immediately call electricity officer at 9876543210.',
    description: 'Utility disconnection fear tactic driving urgent phone contact'
  },
  {
    label: 'KBC Lottery Winner / Processing Fee',
    type: 'High Risk',
    text: 'Congratulations! Your mobile number won Rs 25,00,000 in Kaun Banega Crorepati Lottery Draw. Send your name, bank account, and Rs 500 processing fee on WhatsApp 9123456789.',
    description: 'Advance fee fraud promising large lottery prize'
  },
  {
    label: 'Fake PhonePe UPI Cashback PIN Trap',
    type: 'High Risk',
    text: 'Cashback of Rs 4,999 has been approved for your PhonePe account. Open this link and enter your UPI PIN to claim money into your bank account immediately.',
    description: 'Reverse charge trap attempting to initiate an unauthorized debit'
  },
  {
    label: 'Legitimate Courier Delivery Notification',
    type: 'Safe',
    text: 'Your order #78291 has been dispatched via BlueDart. Track package at https://www.amazon.in/orders. Delivery OTP is 4821.',
    description: 'Standard informational transactional update'
  }
];

export const MessageScannerPage: React.FC = () => {
  const [messageText, setMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async (textToScan?: string) => {
    const content = (textToScan || messageText).trim();
    if (!content) {
      setError('Please enter or paste the message text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.scanMessage(content);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze message content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setMessageText(sampleText);
    handleScan(sampleText);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          AI SMS, Email & WhatsApp Scam Detector
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          TF-IDF Machine Learning • Social engineering & panic regex detection • OTP/PIN harvesting flags • 100% On-Device
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <label className="block text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
          Paste Message Body (SMS, WhatsApp, Email, Payment Notification)
        </label>
        
        <div className="space-y-3">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            placeholder="Paste suspicious text here... (e.g. 'Your bank account will be blocked today. Click the link to update your KYC immediately.')"
            className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-3.5 text-xs font-mono text-white placeholder-slate-600 outline-none transition resize-y"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] font-mono text-slate-500">
              {messageText.length} characters • Privacy: Sanitized in RAM
            </span>

            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Evaluating...' : 'Inspect Message'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Synthetic Sample Presets */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Test Common Scam Vectors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_MESSAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample.text!)}
                className="p-2.5 rounded-lg bg-navy-950 hover:bg-navy-850 border border-slate-800 text-left transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 font-mono">{sample.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${sample.type === 'Safe' ? 'text-emerald-400 bg-emerald-950/50' : 'text-red-400 bg-red-950/50'}`}>
                    {sample.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 italic font-sans">"{sample.text}"</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          <ScanResultCard result={result} onReset={() => { setResult(null); setMessageText(''); }} />
        </div>
      )}
    </div>
  );
};
