import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Shield, Lock, Sun, Moon,
  Server, ShieldAlert, Zap, X
} from 'lucide-react';
import { SystemNode, Incident } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: any) => void;
  onToggleLockdown: () => void;
  onIsolateNode: (nodeId: string) => void;
  onToggleTheme: () => void;
  onSimulateCriticalAttack?: () => void;
  nodes: SystemNode[];
  incidents: Incident[];
  theme: 'light' | 'dark';
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onToggleLockdown,
  onIsolateNode,
  onToggleTheme,
  onSimulateCriticalAttack,
  nodes,
  incidents,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNodes = nodes.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || n.id.toLowerCase().includes(query.toLowerCase()));
  const filteredIncidents = incidents.filter(i => i.sourceIp.includes(query) || i.category.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())).slice(0, 4);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/60">
            <Search className="w-4 h-4 text-sky-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search telemetry (e.g. 'Lockdown', 'Node', 'Threats')..."
              className="w-full text-xs font-mono bg-transparent outline-none text-slate-100 placeholder-slate-500"
            />
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions List */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
            {/* Quick Navigation Commands */}
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                Navigation & Views
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => { onSelectTab('console'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>Jump to Threat Console</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">View Map & Incidents</span>
                </button>

                <button
                  onClick={() => { onSelectTab('ingress'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-sky-400" />
                    <span>Jump to Ingress Target Scanner</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">URL & Log Audit</span>
                </button>

                <button
                  onClick={() => { onSelectTab('secops'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span>Jump to SecOps Suite (MITRE Matrix, UEBA, SOAR)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Advanced SecOps</span>
                </button>

                <button
                  onClick={() => { onSelectTab('url-scanner'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Jump to AI Phishing URL Scanner</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Heuristic Engine</span>
                </button>

                <button
                  onClick={() => { onSelectTab('message-scanner'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Jump to SMS, WhatsApp & Email Scam Detector</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">TF-IDF NLP</span>
                </button>

                <button
                  onClick={() => { onSelectTab('screenshot-scanner'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Jump to Screenshot Fraud Inspector</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">OCR Scanner</span>
                </button>

                <button
                  onClick={() => { onSelectTab('qr-scanner'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Jump to QR Code Security Scanner</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">OpenCV & UPI</span>
                </button>

                <button
                  onClick={() => { onSelectTab('network-monitor'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Jump to Network Flow Monitor</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Port Scan Detection</span>
                </button>

                <button
                  onClick={() => { onSelectTab('history'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Jump to Local Threat History Vault</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">SQLite Vault</span>
                </button>

                <button
                  onClick={() => { onSelectTab('reports'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-teal-400" />
                    <span>Jump to Security Audit & Reports</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Executive Summary</span>
                </button>

                <button
                  onClick={() => { onSelectTab('settings'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Jump to Edge Architecture & Health</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">ARM Hardware</span>
                </button>

                <button
                  onClick={() => { onSelectTab('about'); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>About CyberRakshak AI</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Helpline & Privacy</span>
                </button>
              </div>
            </div>

            {/* Emergency & System Actions */}
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                Emergency & System Actions
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => { onToggleLockdown(); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-rose-950/40 text-rose-300"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-rose-500" />
                    <span>Toggle Emergency Lockdown Protocol</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded font-mono font-bold">
                    KILL SWITCH
                  </span>
                </button>

                {onSimulateCriticalAttack && (
                  <button
                    onClick={() => { onSimulateCriticalAttack(); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-amber-950/40 text-amber-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Inject Test Threat Alert / Simulated Attack</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold">
                      INJECT
                    </span>
                  </button>
                )}

                <button
                  onClick={() => { onToggleTheme(); onClose(); }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Toggle Appearance Theme</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Appearance</span>
                </button>
              </div>
            </div>

            {/* Edge Gateway Nodes matching query */}
            {filteredNodes.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                  Edge Gateway Nodes
                </p>
                <div className="space-y-1">
                  {filteredNodes.map(node => (
                    <button
                      key={node.id}
                      onClick={() => { onIsolateNode(node.id); onClose(); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-900 text-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <Server className="w-4 h-4 text-sky-400" />
                        <span>Isolate/Reconnect Gateway {node.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{node.region} • {node.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Incidents matching query */}
            {filteredIncidents.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                  Telemetry Threat Vectors
                </p>
                <div className="space-y-1">
                  {filteredIncidents.map(inc => (
                    <div
                      key={inc.id}
                      className="px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-bold">{inc.sourceIp}</span>
                        <span className="text-slate-500">[{inc.category}]</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{inc.targetService}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">Esc</kbd> to close</span>
            <span>DEEPSHEILD Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
