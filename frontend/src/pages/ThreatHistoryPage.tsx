import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Trash2, Download, Eye, 
  AlertTriangle, RefreshCw, X, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { ScanResult, RiskLevel } from '../types';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ScanResultCard } from '../components/ScanResultCard';

export const ThreatHistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [scanType, setScanType] = useState<string>('all');
  const [riskLevel, setRiskLevel] = useState<string>('all');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory({
        limit: 100,
        offset: 0,
        search: search.trim() || undefined,
        scan_type: scanType !== 'all' ? scanType : undefined,
        risk_level: riskLevel !== 'all' ? riskLevel : undefined,
      });
      setScans(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [scanType, riskLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (scanId: string) => {
    try {
      await api.deleteScan(scanId);
      setScans(prev => prev.filter(s => s.scan_id !== scanId));
      setTotal(prev => Math.max(prev - 1, 0));
      if (selectedScan?.scan_id === scanId) setSelectedScan(null);
    } catch (e) {
      console.error('Failed to delete scan:', e);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearHistory();
      setScans([]);
      setTotal(0);
      setShowClearConfirm(false);
      setSelectedScan(null);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Local Threat History & Audit Vault
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {total} local scan records stored securely in on-device SQLite database
          </p>
        </div>

        {/* Action Buttons: Export & Clear */}
        <div className="flex items-center gap-2">
          <a
            href={api.exportHistoryUrl('json')}
            download="cyberrakshak_history.json"
            className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-navy-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </a>
          <a
            href={api.exportHistoryUrl('csv')}
            download="cyberrakshak_history.csv"
            className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-navy-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </a>
          {total > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30 hover:border-red-500/60 transition flex items-center gap-1.5 ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clearing History */}
      {showClearConfirm && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Are you sure you want to permanently clear all local scan history? This action cannot be undone.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 rounded-lg text-xs font-mono text-slate-300 bg-navy-850 border border-slate-700 hover:bg-navy-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, domains, URLs, or indicators..."
            className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-600 outline-none"
          />
        </form>

        {/* Filter by Type */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Type:</span>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="bg-navy-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none font-mono"
          >
            <option value="all">All Types</option>
            <option value="url">URLs</option>
            <option value="message">Messages</option>
            <option value="screenshot">Screenshots</option>
            <option value="qr">QR Codes</option>
            <option value="network">Network Flows</option>
          </select>
        </div>

        {/* Filter by Risk */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Risk:</span>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="bg-navy-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none font-mono"
          >
            <option value="all">All Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Low Risk">Low Risk</option>
          </select>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-cyan-400 transition"
          title="Refresh Table"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Scans Table */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Querying Local SQLite Database...</span>
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Historical Records Found</h4>
            <p className="text-xs text-slate-500 font-mono">
              Perform scans across URL, SMS, or QR modules to see persistent records here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-navy-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Scan ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target Snippet</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((scan) => (
                  <tr key={scan.scan_id} className="hover:bg-navy-850/50 transition">
                    <td className="py-3 px-4 text-cyan-400 font-bold">{scan.scan_id}</td>
                    <td className="py-3 px-4 uppercase text-slate-300">{scan.scan_type}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300 font-sans">{scan.target_content}</td>
                    <td className="py-3 px-4">
                      <RiskBadge level={scan.classification} showIcon={false} />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">{scan.risk_score}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {scan.timestamp ? new Date(scan.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedScan(scan)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => scan.scan_id && handleDelete(scan.scan_id)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-navy-950 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <ScanResultCard result={selectedScan} />
          </div>
        </div>
      )}
    </div>
  );
};
