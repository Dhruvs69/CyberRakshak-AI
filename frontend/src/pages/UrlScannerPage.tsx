import React, { useState } from 'react';
import { Globe, Search, ShieldCheck, AlertCircle, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { ScanResult, SamplePreset } from '../types';
import { api } from '../services/api';
import { ScanResultCard } from '../components/ScanResultCard';

const SAMPLE_URLS: SamplePreset[] = [
  {
    label: 'Legitimate Government Portal',
    url: 'https://www.cybercrime.gov.in/Webform/Index.aspx',
    type: 'Safe',
    description: 'Authentic Indian national cybercrime reporting portal'
  },
  {
    label: 'Fake KYC Phishing (.xyz)',
    url: 'http://sbi-kyc-update-portal.xyz/login.php?user=verify',
    type: 'High Risk',
    description: 'High-abuse TLD with brand impersonation and credential keywords'
  },
  {
    label: 'Direct IP-Address Trap',
    url: 'http://185.220.101.5:8080/secure-banking/login',
    type: 'High Risk',
    description: 'Numerical IP destination using non-standard web port 8080'
  },
  {
    label: 'URL Shortener Link',
    url: 'https://bit.ly/3xFakeBankOffer',
    type: 'Suspicious',
    description: 'Shortened link that conceals the true destination'
  },
  {
    label: 'Typosquatted Brand Clone',
    url: 'http://paypa1-account-security-verification.com/login',
    type: 'High Risk',
    description: 'Misspelled brand name with misleading subdomains'
  }
];

export const UrlScannerPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async (targetUrl?: string) => {
    const urlToTest = (targetUrl || urlInput).trim();
    if (!urlToTest) {
      setError('Please enter a valid URL to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.scanUrl(urlToTest);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    handleScan(sampleUrl);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          AI Phishing & Deceptive URL Detector
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Structural heuristic inspection • Punycode & Typosquatting checks • IP & TLD analysis • 100% Offline (No Web Requests)
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <label className="block text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
          Enter Website Address / URL
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="e.g. http://sbi-kyc-update-portal.xyz/login or https://example.com"
              className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none transition"
            />
          </div>

          <button
            onClick={() => handleScan()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Analyzing...' : 'Scan URL'}</span>
          </button>
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
            <Sparkles className="w-3 h-3 text-cyan-400" /> Test with Synthetic Scenarios
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample.url!)}
                className="px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 transition text-left flex items-center gap-2 font-mono"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sample.type === 'Safe' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          <ScanResultCard result={result} onReset={() => { setResult(null); setUrlInput(''); }} />
        </div>
      )}

      {/* Defensive Advisory Box */}
      <div className="bg-navy-950/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> On-Device Safe Inspection Guarantee
        </h4>
        <p className="leading-relaxed">
          CyberRakshak AI analyzes URL structures, IP patterns, punycode strings, and lexical tokens entirely in local device memory.
          The target website is <strong>never contacted or requested</strong>, safeguarding your IP address and device fingerprint from malicious web servers.
        </p>
      </div>
    </div>
  );
};
