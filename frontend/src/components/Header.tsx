import React from 'react';
import { ShieldCheck, WifiOff, Lock, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  isOfflineMode?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isOfflineMode = true,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-mono">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Offline Mode Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
          <WifiOff className="w-3.5 h-3.5 text-cyan-400" />
          <span>Offline Processing Active</span>
        </div>

        {/* Privacy Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/50 border border-emerald-800/40 text-emerald-300">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Privacy Preserving</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-slate-800 bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-cyan-400 transition"
            title="Refresh Security Status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
