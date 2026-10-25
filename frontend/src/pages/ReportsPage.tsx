import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, ShieldCheck, ShieldAlert, 
  AlertTriangle, CheckCircle2, Clock, Calendar 
} from 'lucide-react';
import { DashboardStats } from '../types';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const total = stats?.total_scans || 0;
  const threats = stats?.threats_detected || 0;
  const suspicious = (stats?.suspicious_urls || 0) + (stats?.scam_messages || 0);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            CyberRakshak AI – Formal Security Audit & Incident Report
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Executive threat intelligence summary • Compliance & incident review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-200 bg-navy-900 hover:bg-navy-850 border border-slate-700 transition flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print / Save as PDF</span>
          </button>
          <a
            href={api.exportHistoryUrl('json')}
            download="cyberrakshak_security_audit.json"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-glow-cyan transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full JSON</span>
          </a>
        </div>
      </div>

      {/* Printable Report Document Shell */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-8 space-y-8 shadow-2xl print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                SECURITY OPERATIONS REPORT
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 print:text-black">
              CyberRakshak AI Threat Telemetry Summary
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 print:text-slate-600">
              Evaluation Engine: On-Device Heuristic & NLP Models (Edge Architecture)
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Time: {new Date().toLocaleTimeString()}</div>
            <div className="text-emerald-400 font-semibold print:text-emerald-700 mt-1">Status: Verified Local</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold print:text-slate-700">
            1. Executive Security Posture
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed print:text-slate-800">
            During the operational audit period, CyberRakshak AI monitored and evaluated {total} local artifacts across URL,
            messaging, QR, and network vectors. A total of {threats} high-risk malicious incidents and {suspicious} suspicious
            anomalies were flagged without exfiltrating private telemetry or sensitive credentials to external cloud services.
          </p>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 print:bg-slate-100 print:border-slate-300">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Scans</span>
            <span className="text-2xl font-bold font-mono text-white print:text-black">{total}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 print:bg-slate-100 print:border-slate-300">
            <span className="text-[10px] font-mono uppercase text-red-400 block">Critical Threats</span>
            <span className="text-2xl font-bold font-mono text-red-400">{threats}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 print:bg-slate-100 print:border-slate-300">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block">Phishing URLs</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">{stats?.suspicious_urls || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 print:bg-slate-100 print:border-slate-300">
            <span className="text-[10px] font-mono uppercase text-amber-400 block">Scam Messages</span>
            <span className="text-2xl font-bold font-mono text-amber-400">{stats?.scam_messages || 0}</span>
          </div>
        </div>

        {/* Threat Distribution Table */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold print:text-slate-700">
            2. Threat Classification Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border border-slate-800 print:border-slate-300">
              <thead className="bg-navy-950 print:bg-slate-200">
                <tr className="text-slate-400 print:text-slate-700">
                  <th className="p-2.5">Severity Category</th>
                  <th className="p-2.5">Incident Count</th>
                  <th className="p-2.5">Distribution %</th>
                  <th className="p-2.5">Compliance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                <tr>
                  <td className="p-2.5 text-red-400 font-bold">High Risk</td>
                  <td className="p-2.5">{stats?.risk_distribution['High Risk'] || 0}</td>
                  <td className="p-2.5">
                    {total > 0 ? (((stats?.risk_distribution['High Risk'] || 0) / total) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-2.5 text-slate-400 print:text-slate-700">Immediate user advisory & sender report</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-amber-400 font-bold">Suspicious</td>
                  <td className="p-2.5">{stats?.risk_distribution['Suspicious'] || 0}</td>
                  <td className="p-2.5">
                    {total > 0 ? (((stats?.risk_distribution['Suspicious'] || 0) / total) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-2.5 text-slate-400 print:text-slate-700">Caution advised; verify through official portal</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-400 font-bold">Low Risk</td>
                  <td className="p-2.5">{stats?.risk_distribution['Low Risk'] || 0}</td>
                  <td className="p-2.5">
                    {total > 0 ? (((stats?.risk_distribution['Low Risk'] || 0) / total) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-2.5 text-slate-400 print:text-slate-700">Standard operational vigilance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Defense & Incident Protocol */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold print:text-slate-700">
            3. Operational Defensive Recommendations
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800 list-disc list-inside">
            <li>Never enter UPI PIN to receive incoming cashbacks or lottery rewards.</li>
            <li>Enforce official domain verification: do not trust unverified shortened or lookalike URLs.</li>
            <li>In case of fraudulent debits or shared credentials in India, report to National Cybercrime Helpline 1930.</li>
            <li>Maintain automated endpoint scanning on ARM and edge hardware without external cloud leakage.</li>
          </ul>
        </div>

        {/* Sign-off */}
        <div className="border-t border-slate-800 pt-6 text-[11px] font-mono text-slate-500 flex justify-between print:text-slate-600">
          <span>Audit Engine: CyberRakshak AI (Edge Version 1.0)</span>
          <span>Privacy Certificate: Verified On-Device Execution</span>
        </div>
      </div>
    </div>
  );
};
