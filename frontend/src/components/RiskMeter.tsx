import React from 'react';
import { RiskLevel } from '../types';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level }) => {
  const getColor = () => {
    if (score >= 70) return 'from-red-500 to-rose-600';
    if (score >= 30) return 'from-amber-400 to-yellow-500';
    return 'from-emerald-400 to-teal-500';
  };

  const getTextColor = () => {
    if (score >= 70) return 'text-red-400';
    if (score >= 30) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">
          Threat Risk Index
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${getTextColor()}`}>{score}</span>
          <span className="text-xs text-slate-500 font-mono">/ 100</span>
        </div>
      </div>

      <div className="h-3 w-full bg-navy-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(score, 4)}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-0.5">
        <span>0 (Safe)</span>
        <span>30 (Suspicious)</span>
        <span>70 (High Risk)</span>
        <span>100</span>
      </div>
    </div>
  );
};
