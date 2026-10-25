import React from 'react';
import { 
  ShieldCheck, Cpu, Lock, HelpCircle, AlertTriangle, 
  CheckCircle2, Globe, Heart, PhoneCall, ExternalLink 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-glow-cyan">
          <ShieldCheck className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          CyberRakshak AI
        </h1>
        <p className="text-xs font-mono text-cyan-400">
          On-Device Threat, Phishing & Scam Detection Engine
        </p>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          A modern, explainable cybersecurity assistant engineered specifically for privacy-conscious users,
          students, and edge/ARM computing environments across India and worldwide.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-2">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            100% On-Device Privacy
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero telemetry or analyzed messages/URLs are ever sent to external cloud APIs or remote AI servers.
            Processing stays entirely within your local memory and SQLite database.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-2">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            ARM Edge Compatibility
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Engineered with lightweight Scikit-learn TF-IDF models, OpenCV QR detection, and fast heuristic pattern matchers
            calibrated to run smoothly on edge boards, laptops, and ARM micro-servers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-2">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Multilingual AI Guidance
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Provides plain-language explanations of scam mechanics in English, Hindi (हिंदी), and Gujarati (ગુજરાતી),
            empowering digital citizens against fake KYC and UPI reverse traps.
          </p>
        </div>
      </div>

      {/* Emergency Cybercrime Helpline Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/60 to-navy-900 border border-red-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Emergency Cyber Financial Fraud Reporting (India)</h4>
            <p className="text-xs text-slate-300 font-mono">
              Dial Toll-Free National Helpline <strong className="text-red-400 text-sm">1930</strong> or visit{' '}
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                cybercrime.gov.in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimers & Ethics */}
      <div className="p-6 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-3 text-xs text-slate-400 leading-relaxed">
        <h4 className="text-slate-200 font-bold font-mono uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Ethical Disclaimers & Limitations
        </h4>
        <p>
          1. <strong>Heuristic & Statistical Classification:</strong> Automated detection algorithms run locally based on
          pattern matching, lexical structure analysis, and TF-IDF machine learning. Automated results may yield occasional false
          positives or false negatives.
        </p>
        <p>
          2. <strong>HTTPS Clarification:</strong> The presence of an SSL padlock (HTTPS) indicates transmission encryption,
          NOT domain legitimacy. Over 80% of modern phishing infrastructure utilizes free valid certificates.
        </p>
        <p>
          3. <strong>Zero Active Probing:</strong> CyberRakshak AI never scans foreign networks, brute-forces endpoints,
          or initiates web requests to analyzed URLs without explicit consent.
        </p>
      </div>
    </div>
  );
};
