import React, { useState } from 'react';
import { 
  Activity, Upload, FileSpreadsheet, AlertTriangle, ShieldCheck, 
  RefreshCw, Sparkles, Server, Terminal, ShieldAlert 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { ScanResult } from '../types';
import { api } from '../services/api';
import { ScanResultCard } from '../components/ScanResultCard';

const SAMPLE_PORT_SCAN_CSV = `timestamp,src_ip,dst_ip,dst_port,protocol,bytes,packets,flags
10:00:01,192.168.1.105,10.0.0.1,21,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,22,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,23,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,25,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,53,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,80,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,443,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,3389,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,4444,TCP,64,1,SYN
10:00:01,192.168.1.105,10.0.0.1,8080,TCP,64,1,SYN
10:00:02,192.168.1.200,198.51.100.5,4444,TCP,1024,8,PSH-ACK
10:00:04,192.168.1.15,8.8.8.8,53,UDP,128,2,
10:00:05,192.168.1.15,142.250.190.46,443,TCP,4500,12,ACK`;

const SAMPLE_CLEAN_CSV = `timestamp,src_ip,dst_ip,dst_port,protocol,bytes,packets,flags
10:00:01,192.168.1.15,8.8.8.8,53,UDP,128,2,
10:00:02,192.168.1.15,142.250.190.46,443,TCP,4500,12,ACK
10:00:03,192.168.1.18,172.217.16.206,443,TCP,15200,28,ACK
10:00:04,192.168.1.22,13.107.42.14,443,TCP,8400,16,ACK
10:00:05,192.168.1.30,151.101.65.140,443,TCP,22000,34,ACK`;

export const NetworkMonitorPage: React.FC = () => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async (csvData?: string) => {
    const dataToTest = (csvData || csvContent).trim();
    if (!dataToTest) {
      setError('Please upload a flow CSV file or paste flow records.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.scanNetwork(undefined, dataToTest);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to inspect network flow records.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContent(text);
        handleScan(text);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = (sample: string) => {
    setCsvContent(sample);
    handleScan(sample);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Network Flow Anomaly & Port-Scan Monitor
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Reconnaissance sweep detection • Flood burst heuristics • Exploit port flags • Flow telemetry analysis
        </p>
      </div>

      {/* Input / Upload Box */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="block text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
            Network Flow Records (CSV Format)
          </label>
          <label className="cursor-pointer text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload CSV File
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          rows={6}
          placeholder="timestamp,src_ip,dst_ip,dst_port,protocol,bytes,packets,flags..."
          className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-3.5 text-xs font-mono text-white placeholder-slate-600 outline-none transition resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Datasets:
            </span>
            <button
              onClick={() => handleLoadSample(SAMPLE_PORT_SCAN_CSV)}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-red-400 font-mono"
            >
              Port-Scan & C2 Attack
            </button>
            <button
              onClick={() => handleLoadSample(SAMPLE_CLEAN_CSV)}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-emerald-400 font-mono"
            >
              Baseline Flow Sample
            </button>
          </div>

          <button
            onClick={() => handleScan()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            <span>{loading ? 'Evaluating Flow Records...' : 'Analyze Network Flow'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Network Visualizations & Anomalies */}
      {result && (
        <div className="space-y-6">
          {/* Anomaly Callout Table */}
          {result.anomalies && result.anomalies.length > 0 && (
            <div className="bg-navy-900/90 rounded-2xl border border-red-500/40 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Detected Security Anomalies ({result.anomalies.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="pb-2">Anomaly Type</th>
                      <th className="pb-2">Severity</th>
                      <th className="pb-2">Source Host</th>
                      <th className="pb-2">Target</th>
                      <th className="pb-2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {result.anomalies.map((ano, idx) => (
                      <tr key={idx} className="hover:bg-navy-850/50">
                        <td className="py-2.5 font-bold text-red-300">{ano.type}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ano.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                            {ano.severity}
                          </span>
                        </td>
                        <td className="py-2.5 text-cyan-300">{ano.source}</td>
                        <td className="py-2.5 text-slate-300">{ano.target}</td>
                        <td className="py-2.5 text-slate-400">{ano.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Time Series Traffic Chart */}
          {result.traffic_summary && result.traffic_summary.length > 0 && (
            <div className="bg-navy-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
                Network Flow Packet Timeline
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.traffic_summary}>
                    <defs>
                      <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="packets" stroke="#00f0ff" fillOpacity={1} fill="url(#colorPackets)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* General Result Card */}
          <ScanResultCard result={result} onReset={() => { setResult(null); setCsvContent(''); }} />
        </div>
      )}

      {/* Advisory Notice */}
      <div className="bg-navy-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-1 font-mono">
        <span className="text-cyan-400 font-bold block uppercase text-[10px]">
          Sample Data Flow Mode
        </span>
        <p className="text-[11px] leading-relaxed">
          CyberRakshak AI analyzes imported network flow records. It strictly does not initiate packet sniffing or external port scans against foreign devices.
        </p>
      </div>
    </div>
  );
};
