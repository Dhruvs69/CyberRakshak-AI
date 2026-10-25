import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showIcon = true }) => {
  if (level === 'High Risk') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 shadow-glow-red">
        {showIcon && <ShieldAlert className="w-3.5 h-3.5" />}
        High Risk {score !== undefined && `(${score}/100)`}
      </span>
    );
  }
  if (level === 'Suspicious') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
        Suspicious {score !== undefined && `(${score}/100)`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
      Low Risk {score !== undefined && `(${score}/100)`}
    </span>
  );
};
