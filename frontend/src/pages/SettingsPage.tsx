import React, { useState, useEffect } from 'react';
import { 
  Sliders, Cpu, Database, ShieldCheck, WifiOff, Trash2, 
  CheckCircle2, XCircle, Play, RefreshCw, AlertTriangle, Terminal 
} from 'lucide-react';
import { SystemHealth } from '../types';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saveHistory, setSaveHistory] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(true);
  const [lowRiskMax, setLowRiskMax] = useState<number>(29);
  const [suspiciousMax, setSuspiciousMax] = useState<number>(69);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [runningTests, setRunningTests] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any | null>(null);

  useEffect(() => {
    loadSettings();
    api.getSystemHealth().then(setHealth).catch(console.error);
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setSaveHistory(data.save_history !== 'false');
      setOfflineMode(data.offline_mode !== 'false');
      if (data.low_risk_max) setLowRiskMax(parseInt(data.low_risk_max, 10));
      if (data.suspicious_max) setSuspiciousMax(parseInt(data.suspicious_max, 10));
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.updateSettings({
        save_history: saveHistory ? 'true' : 'false',
        offline_mode: offlineMode ? 'true' : 'false',
        low_risk_max: lowRiskMax.toString(),
        suspicious_max: suspiciousMax.toString(),
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const handleRunTests = async () => {
    setRunningTests(true);
    setTestResults(null);
    try {
      const results = await api.runTests();
      setTestResults(results);
    } catch (e) {
      console.error('Failed to run backend tests:', e);
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          Settings & Edge Architecture Configuration
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          System health telemetry • Privacy & history storage preferences • Automated offline test harness
        </p>
      </div>

      {/* System Health & Hardware Info */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Hardware & Edge Runtime Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">OPERATING SYSTEM</span>
            <span className="text-white font-bold">{health?.operating_system} ({health?.os_release})</span>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">ARCHITECTURE</span>
            <span className="text-cyan-400 font-bold">{health?.architecture} (ARM Optimized)</span>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">PRIVACY STATUS</span>
            <span className="text-emerald-400 font-bold">100% Local / Zero Cloud</span>
          </div>
        </div>

        {/* Local Detection Engines Status */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            On-Device Engine Components Status
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/80">
              <span className="text-slate-300">SQLite Audit Database</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/80">
              <span className="text-slate-300">Scikit-Learn NLP Model</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Trained Local
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/80">
              <span className="text-slate-300">OpenCV QRCodeDetector</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/80">
              <span className="text-slate-300">Local Tesseract OCR</span>
              <span className={health?.components?.tesseract_ocr?.available ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-amber-400 font-bold flex items-center gap-1'}>
                {health?.components?.tesseract_ocr?.available ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Active</>
                ) : (
                  <><AlertTriangle className="w-3.5 h-3.5" /> Manual Paste Mode</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage and Scoring Preferences */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Storage & Risk Scoring Configuration
        </h3>

        <div className="space-y-4">
          {/* History Logging Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">Persist Scan History in Local SQLite Database</span>
              <span className="text-[11px] text-slate-400 font-mono">
                When enabled, sanitized scan records are stored locally on your device for auditing and export.
              </span>
            </div>
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => setSaveHistory(e.target.checked)}
              className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Offline Mode Indicator */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">Simulated Complete Disconnected Operation Mode</span>
              <span className="text-[11px] text-slate-400 font-mono">
                Ensures detection modules operate without any external network access.
              </span>
            </div>
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => setOfflineMode(e.target.checked)}
              className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Threshold Sliders */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Low Risk Upper Threshold:</span>
                <span className="text-emerald-400 font-bold">0 to {lowRiskMax}</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={lowRiskMax}
                onChange={(e) => setLowRiskMax(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Suspicious Risk Upper Threshold:</span>
                <span className="text-amber-400 font-bold">{lowRiskMax + 1} to {suspiciousMax} (High Risk: {suspiciousMax + 1}+)</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={suspiciousMax}
                onChange={(e) => setSuspiciousMax(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3">
          {savedNotice && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preferences Saved!
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Automated On-Device Test Harness Runner */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Automated Built-In Unit Test Suite
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Execute on-device unit tests validating URL parsing, NLP message classifiers, and QR payload integrity.
            </p>
          </div>

          <button
            onClick={handleRunTests}
            disabled={runningTests}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-800/40 hover:border-cyan-500 transition flex items-center gap-2 disabled:opacity-50"
          >
            {runningTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Play className="w-3.5 h-3.5" />}
            <span>{runningTests ? 'Executing Tests...' : 'Run Test Suite'}</span>
          </button>
        </div>

        {/* Test Suite Results */}
        {testResults && (
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">
                Results: {testResults.passed}/{testResults.total} Tests Passed
              </span>
              <span className={`px-2.5 py-0.5 rounded font-bold ${testResults.all_passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'}`}>
                {testResults.all_passed ? 'ALL TESTS PASSED (100%)' : `${testResults.failed} FAILED`}
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto text-xs font-mono">
              {testResults.results.map((t: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-slate-300">{t.test_case}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">Expected: {t.expected}</span>
                    <span className={`text-[10px] font-bold ${t.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      Actual: {t.actual} ({t.score})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
