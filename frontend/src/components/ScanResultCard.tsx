import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  ChevronDown, ChevronUp, Copy, Check, Info, Lock, ExternalLink
} from 'lucide-react';
import { ScanResult } from '../types';
import { RiskBadge } from './RiskBadge';
import { RiskMeter } from './RiskMeter';

interface ScanResultCardProps {
  result: ScanResult;
  onReset?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onReset }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `CyberRakshak AI Scan Report
Scan ID: ${result.scan_id || 'N/A'}
Type: ${result.scan_type.toUpperCase()}
Risk Score: ${result.risk_score}/100 (${result.classification})
Target: ${result.target_content}
Explanation: ${result.explanation}
Indicators:
${result.indicators.map(i => ` - ${i}`).join('\n')}
Recommendations:
${result.recommendations.map(r => ` - ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHighRisk = result.classification === 'High Risk';
  const isSuspicious = result.classification === 'Suspicious';

  const borderColor = isHighRisk 
    ? 'border-red-500/40 shadow-glow-red' 
    : isSuspicious 
      ? 'border-amber-500/30' 
      : 'border-emerald-500/30';

  return (
    <div className={`bg-navy-900/90 backdrop-blur-md rounded-xl border ${borderColor} p-6 space-y-6 transition-all duration-300`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              {result.scan_type.toUpperCase()} ANALYSIS COMPLETE
            </span>
            {result.is_offline && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                <Lock className="w-3 h-3" /> On-Device
              </span>
            )}
          </div>
          {result.scan_id && (
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {result.scan_id} {result.timestamp && `• ${new Date(result.timestamp).toLocaleTimeString()}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <RiskBadge level={result.classification} score={result.risk_score} />
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-slate-700 bg-navy-800 text-slate-300 hover:text-white hover:border-slate-600 transition text-xs flex items-center gap-1.5 px-2.5"
            title="Copy Report"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Risk Meter Gauge */}
      <RiskMeter score={result.risk_score} level={result.classification} />

      {/* Target Content Snippet */}
      <div className="bg-navy-950/80 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 break-all">
        <span className="text-slate-500 block mb-1 uppercase text-[10px] tracking-wider">Analyzed Target</span>
        {result.target_content}
      </div>

      {/* Highlighted Phrases for Scam Messages */}
      {result.highlighted_phrases && result.highlighted_phrases.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Deceptive & High-Urgency Phrases Detected
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.highlighted_phrases.map((hp, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                "{hp.text}" <span className="text-slate-400 text-[10px]">({hp.category})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* UPI Details if QR Payload */}
      {result.upi_details && (
        <div className="bg-navy-950/90 rounded-lg p-4 border border-cyan-800/40 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Extracted UPI Payment Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div><span className="text-slate-400">Payee VPA:</span> <span className="text-slate-200">{result.upi_details.payee_vpa || 'N/A'}</span></div>
            <div><span className="text-slate-400">Merchant/Payee:</span> <span className="text-slate-200">{result.upi_details.payee_name || 'N/A'}</span></div>
            <div><span className="text-slate-400">Requested Amount:</span> <span className="text-amber-400 font-bold">{result.upi_details.amount}</span></div>
            <div><span className="text-slate-400">Transaction Note:</span> <span className="text-slate-200">{result.upi_details.note || 'None'}</span></div>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" /> Explainable AI Assessment
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed bg-navy-850/50 p-3 rounded-lg border border-slate-800">
          {result.explanation}
        </p>
      </div>

      {/* Detected Indicators List */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Detected Warning Signs & Anomalies
        </h4>
        <ul className="space-y-2">
          {result.indicators.map((ind, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isHighRisk ? 'bg-red-400' : isSuspicious ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{ind}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Defensive Actions
        </h4>
        <div className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-navy-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-emerald-400 font-mono font-bold">{i + 1}.</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Evidence Accordion */}
      {result.evidence && Object.keys(result.evidence).length > 0 && (
        <div className="border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-cyan-400 font-mono transition"
          >
            <span>Technical Inspection Metadata & Indicators ({Object.keys(result.evidence).length} attributes)</span>
            {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showEvidence && (
            <pre className="mt-3 p-3 bg-navy-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-60">
              {JSON.stringify(result.evidence, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 italic border-t border-slate-850 pt-3">
        {result.disclaimer || "Disclaimer: Heuristic pattern classification runs locally. Always independently verify unexpected communications with official institution apps or customer service lines."}
      </p>

      {/* Reset button */}
      {onReset && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onReset}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-navy-800 hover:bg-navy-700 rounded-lg border border-slate-700 transition"
          >
            Scan Another Target
          </button>
        </div>
      )}
    </div>
  );
};
