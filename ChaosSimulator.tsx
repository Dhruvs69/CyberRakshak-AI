import React, { useState, useCallback, useRef } from 'react';
import {
  Zap, Play, Square, AlertTriangle, CheckCircle, Clock,
  Activity, Shield, BarChart3, X, Flame
} from 'lucide-react';

export interface ChaosSimulatorProps {
  onLogMessage?: (msg: string) => void;
}

export interface AttackVector {
  id: string;
  name: string;
  description: string;
  category: string;
  syntheticPayload: string;
  expectedDetectionMs: number;
  severity: 'critical' | 'high' | 'medium';
}

export interface SimulationResult {
  vectorId: string;
  vectorName: string;
  detected: boolean;
  detectionTimeMs: number;
  containmentTimeMs: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  details: string;
  timestamp: string;
}

export interface SimulationRun {
  id: string;
  startTime: string;
  endTime: string | null;
  status: 'running' | 'complete' | 'aborted';
  results: SimulationResult[];
  overallGrade: string;
  avgDetectionMs: number;
  avgContainmentMs: number;
}

export const ATTACK_VECTORS: AttackVector[] = [
  {
    id: 'syn-flood',
    name: 'SYN Flood Storm',
    description: 'Simulates high-volume TCP SYN packet flood targeting local edge interface',
    category: 'DDoS',
    syntheticPayload: '[SYNTHETIC_DEFENSIVE_ASSET] SYN_FLOOD_SIMULATION: 50,000 SYN packets/sec targeting port 443',
    expectedDetectionMs: 500,
    severity: 'critical',
  },
  {
    id: 'sqli-storm',
    name: 'SQL Injection Storm',
    description: 'Batched SQLi payloads including UNION SELECT, boolean-based, and time-based blind injection',
    category: 'SQL Injection',
    syntheticPayload: "[SYNTHETIC_DEFENSIVE_ASSET] SQLI_TEST: ' OR 1=1 UNION SELECT null,table_name FROM information_schema.tables--",
    expectedDetectionMs: 200,
    severity: 'critical',
  },
  {
    id: 'credential-stuff',
    name: 'Credential Stuffing',
    description: 'Simulated brute-force credential stuffing from rotated proxy IPs',
    category: 'Brute Force',
    syntheticPayload: '[SYNTHETIC_DEFENSIVE_ASSET] CRED_STUFF: 1000 login attempts from 50 rotating IPs in 60 seconds',
    expectedDetectionMs: 1000,
    severity: 'high',
  },
  {
    id: 'xss-polyglot',
    name: 'XSS Polyglot Injection',
    description: 'Multi-context XSS payloads targeting HTML, JS, and CSS injection points',
    category: 'XSS',
    syntheticPayload: '[SYNTHETIC_DEFENSIVE_ASSET] XSS_POLY: <img/src=x onerror="alert(document.cookie)"/><svg/onload=eval(atob("YWxlcnQoMSk="))>',
    expectedDetectionMs: 150,
    severity: 'high',
  },
  {
    id: 'path-traversal',
    name: 'Path Traversal Probe',
    description: 'Directory traversal attempts targeting sensitive system files',
    category: 'Path Traversal',
    syntheticPayload: '[SYNTHETIC_DEFENSIVE_ASSET] PATH_TRAV: ../../../../../../etc/passwd%00.jpg',
    expectedDetectionMs: 100,
    severity: 'medium',
  },
  {
    id: 'jwt-forge',
    name: 'JWT Forgery Attack',
    description: 'Attempts to forge JWT with algorithm confusion (none/HS256 vs RS256)',
    category: 'Auth Bypass',
    syntheticPayload: '[SYNTHETIC_DEFENSIVE_ASSET] JWT_FORGE: {"alg":"none","typ":"JWT"}.{"sub":"admin","role":"superuser"}',
    expectedDetectionMs: 50,
    severity: 'critical',
  },
];

function gradeDetectionTime(actual: number, expected: number): SimulationResult['grade'] {
  const ratio = actual / expected;
  if (ratio <= 0.5) return 'A+';
  if (ratio <= 0.8) return 'A';
  if (ratio <= 1.0) return 'B';
  if (ratio <= 1.5) return 'C';
  if (ratio <= 2.0) return 'D';
  return 'F';
}

const gradeColors: Record<string, string> = {
  'A+': 'text-emerald-500 dark:text-emerald-400',
  'A': 'text-emerald-500 dark:text-emerald-400',
  'B': 'text-sky-500 dark:text-sky-400',
  'C': 'text-amber-500 dark:text-amber-400',
  'D': 'text-orange-500 dark:text-orange-400',
  'F': 'text-rose-500 dark:text-rose-400',
};

export const ChaosSimulator: React.FC<ChaosSimulatorProps> = ({ onLogMessage }: ChaosSimulatorProps) => {
  const [selectedVectors, setSelectedVectors] = useState<Set<string>>(new Set(ATTACK_VECTORS.map((v: AttackVector) => v.id)));
  const [currentRun, setCurrentRun] = useState<SimulationRun | null>(null);
  const [activeVectorIdx, setActiveVectorIdx] = useState<number>(-1);
  const [history, setHistory] = useState<SimulationRun[]>([]);
  const abortRef = useRef(false);

  const log = useCallback((msg: string) => {
    if (onLogMessage) onLogMessage(msg);
    else console.log(msg);
  }, [onLogMessage]);

  const toggleVector = (id: string) => {
    setSelectedVectors((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runSimulation = useCallback(async () => {
    const vectors = ATTACK_VECTORS.filter((v: AttackVector) => selectedVectors.has(v.id));
    if (vectors.length === 0) return;

    abortRef.current = false;
    const run: SimulationRun = {
      id: `run-${Date.now()}`,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      results: [],
      overallGrade: '',
      avgDetectionMs: 0,
      avgContainmentMs: 0,
    };
    setCurrentRun(run);
    log(`CHAOS RUNNER: Starting simulation with ${vectors.length} attack vectors...`);

    for (let i = 0; i < vectors.length; i++) {
      if (abortRef.current) {
        run.status = 'aborted';
        break;
      }

      const vec = vectors[i];
      setActiveVectorIdx(i);

      // Simulate processing delay
      const jitter = 0.5 + Math.random() * 1.5;
      const detectionMs = Math.round(vec.expectedDetectionMs * jitter);
      const containmentMs = Math.round(detectionMs * (0.8 + Math.random() * 0.6));

      await new Promise<void>((r) => setTimeout(r, Math.min(detectionMs + 200, 1500)));

      const grade = gradeDetectionTime(detectionMs, vec.expectedDetectionMs);
      const result: SimulationResult = {
        vectorId: vec.id,
        vectorName: vec.name,
        detected: true,
        detectionTimeMs: detectionMs,
        containmentTimeMs: containmentMs,
        grade,
        details: `${vec.category} payload injected and detected in ${detectionMs}ms. Containment in ${containmentMs}ms.`,
        timestamp: new Date().toISOString(),
      };

      run.results.push(result);
      setCurrentRun({ ...run });
      log(`CHAOS RUNNER: [${i + 1}/${vectors.length}] ${vec.name} — Grade: ${grade} (${detectionMs}ms detection)`);
    }

    if (run.status !== 'aborted') run.status = 'complete';
    run.endTime = new Date().toISOString();

    const avgDet = run.results.reduce((s: number, r: SimulationResult) => s + r.detectionTimeMs, 0) / (run.results.length || 1);
    const avgCont = run.results.reduce((s: number, r: SimulationResult) => s + r.containmentTimeMs, 0) / (run.results.length || 1);
    run.avgDetectionMs = Math.round(avgDet);
    run.avgContainmentMs = Math.round(avgCont);

    const gradeOrder = ['A+', 'A', 'B', 'C', 'D', 'F'];
    const worstIdx = Math.max(...run.results.map((r: SimulationResult) => gradeOrder.indexOf(r.grade)));
    run.overallGrade = gradeOrder[worstIdx] || 'A';

    setCurrentRun({ ...run });
    setHistory((prev: SimulationRun[]) => [run, ...prev.slice(0, 9)]);
    setActiveVectorIdx(-1);
    log(`CHAOS RUNNER: Simulation complete. Overall grade: ${run.overallGrade}. Avg detection: ${run.avgDetectionMs}ms`);
  }, [selectedVectors, log]);

  const abortSimulation = () => {
    abortRef.current = true;
    log('CHAOS RUNNER: Simulation aborted by operator.');
  };

  const isRunning = currentRun?.status === 'running';

  return (
    <div className="max-w-7xl w-full mx-auto px-4 mt-6 relative z-10 flex flex-col gap-5 text-slate-100">
      {/* Header */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/40">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Chaos Security Simulator
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automated Adversarial Attack Simulation & Resilience Grading • [ON_DEVICE_ASSET]
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={abortSimulation}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Square className="w-3.5 h-3.5" /> Abort Simulation
              </button>
            ) : (
              <button
                onClick={runSimulation}
                disabled={selectedVectors.size === 0}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 disabled:opacity-50 text-black text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> Launch Adversarial Tests ({selectedVectors.size} vectors)
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Vector Selection */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2 uppercase font-mono">
            <Zap className="w-3.5 h-3.5 text-orange-400" /> Attack Vectors Catalog
          </h3>
          <div className="space-y-2.5">
            {ATTACK_VECTORS.map((vec: AttackVector, idx: number) => {
              const isSelected = selectedVectors.has(vec.id);
              const isActive = isRunning && activeVectorIdx === idx;
              const result = currentRun?.results.find((r: SimulationResult) => r.vectorId === vec.id);

              return (
                <div
                  key={vec.id}
                  className={`px-3.5 py-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-orange-950/40 border-orange-500 animate-pulse'
                      : result
                        ? 'bg-navy-950/80 border-slate-800'
                        : isSelected
                          ? 'bg-navy-950/60 border-cyan-800/60'
                          : 'bg-navy-950/30 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleVector(vec.id)}
                        disabled={isRunning}
                        className="rounded accent-orange-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white font-mono">{vec.name}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        vec.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        vec.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {vec.severity}
                      </span>
                      {result && (
                        <span className={`text-xs font-black font-mono ${gradeColors[result.grade]}`}>
                          {result.grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">{vec.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Simulation Telemetry & Grading */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2 uppercase font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Defense Telemetry & Resilience Grade
            </h3>

            {!currentRun ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No active chaos simulation. Select vectors and launch above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Scorecard */}
                <div className="p-4 bg-navy-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Overall Resilience Grade</span>
                    <span className={`text-3xl font-black font-mono ${gradeColors[currentRun.overallGrade] || 'text-white'}`}>
                      {currentRun.overallGrade || (isRunning ? 'Testing...' : 'N/A')}
                    </span>
                  </div>
                  <div className="text-right font-mono text-xs space-y-1">
                    <div><span className="text-slate-400">Avg Detection:</span> <strong className="text-cyan-400">{currentRun.avgDetectionMs}ms</strong></div>
                    <div><span className="text-slate-400">Avg Containment:</span> <strong className="text-emerald-400">{currentRun.avgContainmentMs}ms</strong></div>
                  </div>
                </div>

                {/* Results list */}
                {currentRun.results.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentRun.results.map((r: SimulationResult) => (
                      <div key={r.vectorId} className="flex items-center gap-3 px-3 py-2 bg-navy-950 rounded-xl border border-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-white font-mono">{r.vectorName}</span>
                          <div className="flex gap-3 text-[10px] font-mono text-slate-400 mt-0.5">
                            <span>Detection: <strong className="text-slate-200">{r.detectionTimeMs}ms</strong></span>
                            <span>Containment: <strong className="text-slate-200">{r.containmentTimeMs}ms</strong></span>
                          </div>
                        </div>
                        <span className={`text-base font-black font-mono ${gradeColors[r.grade]}`}>{r.grade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">Previous Runs</h4>
              <div className="space-y-1">
                {history.slice(1, 4).map((run: SimulationRun) => (
                  <div key={run.id} className="flex items-center justify-between px-2 py-1 text-xs font-mono text-slate-300">
                    <span>{new Date(run.startTime).toLocaleTimeString()}</span>
                    <span>{run.results.length} vectors</span>
                    <span className={`font-bold ${gradeColors[run.overallGrade]}`}>{run.overallGrade}</span>
                    <span>{run.avgDetectionMs}ms avg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChaosSimulator;
