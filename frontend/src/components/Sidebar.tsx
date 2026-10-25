import React from 'react';
import { 
  LayoutDashboard, Globe, MessageSquare, FileSearch, 
  QrCode, Activity, Bot, History, FileText, Sliders, HelpCircle, 
  ShieldCheck, Cpu, Flame
} from 'lucide-react';

export type PageId = 
  | 'dashboard'
  | 'url-scanner'
  | 'message-scanner'
  | 'screenshot-scanner'
  | 'qr-scanner'
  | 'network-monitor'
  | 'chaos-simulator'
  | 'assistant'
  | 'history'
  | 'reports'
  | 'settings'
  | 'about';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  threatsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage, threatsCount = 0 }) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'url-scanner' as PageId, label: 'URL Scanner', icon: Globe },
    { id: 'message-scanner' as PageId, label: 'SMS & Email Scam', icon: MessageSquare },
    { id: 'screenshot-scanner' as PageId, label: 'Screenshot Scanner', icon: FileSearch },
    { id: 'qr-scanner' as PageId, label: 'QR Code Scanner', icon: QrCode },
    { id: 'network-monitor' as PageId, label: 'Network Monitor', icon: Activity },
    { id: 'chaos-simulator' as PageId, label: 'Chaos Simulator', icon: Flame },
    { id: 'assistant' as PageId, label: 'Explainable AI', icon: Bot },
    { id: 'history' as PageId, label: 'Threat History', icon: History, badge: threatsCount > 0 ? threatsCount : undefined },
    { id: 'reports' as PageId, label: 'Security Reports', icon: FileText },
    { id: 'settings' as PageId, label: 'Settings & Edge', icon: Sliders },
    { id: 'about' as PageId, label: 'About CyberRakshak', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
          <ShieldCheck className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            CyberRakshak <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono">On-Device Shield</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Architecture Indicator */}
      <div className="p-4 border-t border-slate-800/80 bg-navy-950/60 m-3 rounded-xl border">
        <div className="flex items-center gap-2 mb-1.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono font-semibold text-slate-200">Edge Architecture</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>100% Local / Zero Cloud</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 font-mono">
          ARM Compatible • SQLite • NLP
        </p>
      </div>
    </aside>
  );
};
