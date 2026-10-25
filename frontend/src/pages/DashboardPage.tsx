import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Globe, MessageSquare, 
  Activity, ArrowUpRight, Clock, RefreshCw, Zap, Cpu, Server, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { DashboardStats, ScanResult } from '../types';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { PageId } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onSelectScan?: (scan: ScanResult) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectScan }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-mono text-slate-400">Loading On-Device Telemetry...</span>
        </div>
      </div>
    );
  }

  const hasData = (stats?.total_scans ?? 0) > 0;

  // Chart data preparation
  const categoryData = [
    { name: 'URLs', count: stats?.category_counts['url'] || 0, color: '#00f0ff' },
    { name: 'Messages', count: stats?.category_counts['message'] || 0, color: '#3b82f6' },
    { name: 'Screenshots', count: stats?.category_counts['screenshot'] || 0, color: '#8b5cf6' },
    { name: 'QR Codes', count: stats?.category_counts['qr'] || 0, color: '#ec4899' },
    { name: 'Network', count: stats?.category_counts['network'] || 0, color: '#f59e0b' },
  ];

  const pieData = [
    { name: 'Low Risk', value: stats?.risk_distribution['Low Risk'] || 0, color: '#10b981' },
    { name: 'Suspicious', value: stats?.risk_distribution['Suspicious'] || 0, color: '#f59e0b' },
    { name: 'High Risk', value: stats?.risk_distribution['High Risk'] || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            stats?.status_level === 'critical' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-glow-red' 
              : stats?.status_level === 'warning'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            {stats?.status_level === 'critical' ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : stats?.status_level === 'warning' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Security Posture</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {stats?.security_status}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 bg-navy-850 hover:bg-navy-800 border border-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Scans */}
        <div className="bg-navy-900/80 border border-slate-800/80 p-5 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">1. Total Scans</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats?.total_scans ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Processed entirely on-device</p>
        </div>

        {/* Card 2: Threats Detected */}
        <div className="bg-navy-900/80 border border-slate-800/80 p-5 rounded-xl hover:border-red-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-red-400">2. Threats Flagged</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono">
            {stats?.threats_detected ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Critical high-risk attacks</p>
        </div>

        {/* Card 3: Suspicious URLs */}
        <div className="bg-navy-900/80 border border-slate-800/80 p-5 rounded-xl hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400">3. Deceptive URLs</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {stats?.suspicious_urls ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Phishing & shortener links</p>
        </div>

        {/* Card 4: Scam Messages Detected */}
        <div className="bg-navy-900/80 border border-slate-800/80 p-5 rounded-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-amber-400">4. Scam Messages</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {stats?.scam_messages ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">KYC, UPI & lottery traps</p>
        </div>

        {/* Card 5: Security Status */}
        <div className="bg-navy-900/80 border border-slate-800/80 p-5 rounded-xl hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">5. Edge Health</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono uppercase mt-1">
            ARM OPTIMIZED
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Zero cloud data leakage</p>
        </div>
      </div>

      {/* If No Scans Analyzed Yet: Clean Informative Empty State */}
      {!hasData && (
        <div className="bg-navy-900/60 border border-cyan-800/40 rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-glow-cyan">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">System Ready – No Scans Analyzed Yet</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              CyberRakshak AI strictly presents authentic on-device statistics and never manufactures simulated fake detections.
              Initiate your first analysis below to test the detection engines.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('url-scanner')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-glow-cyan transition flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> Analyze a Suspicious URL
            </button>
            <button
              onClick={() => onNavigate('message-scanner')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Inspect Scam SMS / Message
            </button>
            <button
              onClick={() => onNavigate('qr-scanner')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 transition"
            >
              Scan QR Code
            </button>
          </div>
        </div>
      )}

      {/* Analytics & Charts Section (Rendered when scans exist) */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Threat Categories */}
          <div className="bg-navy-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
                Threat Breakdown by Vector
              </h4>
              <span className="text-[10px] font-mono text-cyan-400">Total: {stats?.total_scans}</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Threat Activity Timeline */}
          <div className="bg-navy-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
                Detection Activity Over Time
              </h4>
              <span className="text-[10px] font-mono text-emerald-400">Active</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.activity_trend && stats.activity_trend.length > 0 ? stats.activity_trend : [{ date: 'Today', scans: stats?.total_scans || 0 }]}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Risk Distribution */}
          <div className="bg-navy-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
                Risk Classification Mix
              </h4>
            </div>
            <div className="h-48 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500 font-mono">No data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts & Scan Table */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest High-Risk Alerts */}
          <div className="bg-navy-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> High-Risk Alerts ({stats?.recent_alerts.length || 0})
              </h4>
            </div>
            
            <div className="space-y-2.5">
              {stats?.recent_alerts && stats.recent_alerts.length > 0 ? (
                stats.recent_alerts.map((alert) => (
                  <div key={alert.scan_id} className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1 text-xs">
                    <div className="flex justify-between font-mono text-[10px] text-red-300">
                      <span>{alert.scan_type.toUpperCase()}</span>
                      <span>Score: {alert.risk_score}</span>
                    </div>
                    <p className="font-semibold text-slate-200 line-clamp-1">{alert.target_content}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{alert.explanation}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-mono py-6 text-center">
                  No high-risk threats detected in current history.
                </p>
              )}
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="lg:col-span-2 bg-navy-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Recent Scan Log
              </h4>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
              >
                View Full History <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Target Content</th>
                    <th className="pb-2">Classification</th>
                    <th className="pb-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats?.recent_scans.map((scan) => (
                    <tr key={scan.scan_id} className="hover:bg-navy-850/40 transition">
                      <td className="py-2.5 uppercase text-cyan-400 font-bold">{scan.scan_type}</td>
                      <td className="py-2.5 max-w-xs truncate text-slate-300 font-sans">{scan.target_content}</td>
                      <td className="py-2.5">
                        <RiskBadge level={scan.classification} showIcon={false} />
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-200">{scan.risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
