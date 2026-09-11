import React, { useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { 
  Gauge, ShieldAlert, Snowflake, Lock, Unlock, 
  Activity, AlertTriangle, CheckCircle2, Flame, RefreshCcw
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';

export const StrategicLoadIndicator: React.FC = () => {
  const { state, setStrategicFreeze } = usePOS();

  const loadMetrics = useMemo(() => {
    const activeGoals = state.goals.filter(g => g.status === 'Active');
    const activeProjects = state.projects.filter(p => p.status === 'Active');
    const blockedProjects = activeProjects.filter(p => p.campaignHealth === 'Blocked');
    const activeExperiments = (state.strategicExperiments || []).filter(e => e.status === 'Running' || e.verdict === 'Pending');
    const todayDirectives = state.quests.filter(q => q.status !== 'Completed' && !q.archived);

    // Compute load score out of 100
    // Ideal: <= 3 goals, <= 4 campaigns, <= 2 experiments
    let score = 0;
    score += Math.min(activeGoals.length * 15, 30); // max 30 for goals
    score += Math.min(activeProjects.length * 12, 50); // max 50 for campaigns
    score += Math.min(activeExperiments.length * 10, 20); // max 20 for experiments
    if (blockedProjects.length > 0) score += blockedProjects.length * 8;

    score = Math.min(score, 100);

    let level: 'LOW' | 'OPTIMAL' | 'HEAVY' | 'OVERLOADED';
    let statusColor: string;
    let badgeBg: string;

    if (score < 40) {
      level = 'LOW';
      statusColor = 'text-cyan-400';
      badgeBg = 'bg-cyan-950 text-cyan-300 border-cyan-500/40';
    } else if (score <= 70) {
      level = 'OPTIMAL';
      statusColor = 'text-emerald-400';
      badgeBg = 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
    } else if (score <= 85) {
      level = 'HEAVY';
      statusColor = 'text-amber-400';
      badgeBg = 'bg-amber-950 text-amber-300 border-amber-500/40';
    } else {
      level = 'OVERLOADED';
      statusColor = 'text-rose-400';
      badgeBg = 'bg-rose-950 text-rose-300 border-rose-500/40';
    }

    return {
      activeGoalsCount: activeGoals.length,
      activeProjectsCount: activeProjects.length,
      blockedProjectsCount: blockedProjects.length,
      activeExperimentsCount: activeExperiments.length,
      todayDirectivesCount: todayDirectives.length,
      score,
      level,
      statusColor,
      badgeBg
    };
  }, [state.goals, state.projects, state.strategicExperiments, state.quests]);

  const isFreeze = !!state.strategicFreeze;

  return (
    <div className={`glass-panel p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-xl transition-all ${
      isFreeze 
        ? 'border-cyan-500/50 bg-gradient-to-r from-[#071318] via-[#04090e] to-[#071318]' 
        : 'border-[#c5a059]/30 bg-[#0b0d13]/90'
    }`}>
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color={isFreeze ? '#38bdf8' : '#c5a059'} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Gauge className={`h-4 w-4 ${loadMetrics.statusColor}`} />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>STRATEGIC LOAD & WIP CONFINEMENT</span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${loadMetrics.badgeBg}`}>
                {loadMetrics.level} LOAD ({loadMetrics.score}%)
              </span>
            </h3>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Work-In-Progress capacity governor preventing initiative fragmentation and cognitive saturation.
          </p>
        </div>

        {/* Strategic Freeze Action Toggle */}
        <button
          onClick={() => setStrategicFreeze(!isFreeze)}
          className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
            isFreeze
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
          }`}
        >
          <Snowflake className={`h-3.5 w-3.5 ${isFreeze ? 'animate-spin text-cyan-300' : 'text-zinc-400'}`} />
          <span>{isFreeze ? 'FREEZE ENGAGED' : 'ENGAGE STRATEGIC FREEZE'}</span>
        </button>
      </div>

      {/* Strategic Freeze Banner if active */}
      {isFreeze && (
        <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl flex items-start gap-3">
          <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-display font-bold text-cyan-300 block">
              INITIATIVE CONFINEMENT PROTOCOL ENFORCED
            </span>
            <p className="text-[11px] font-mono text-cyan-200/80 leading-relaxed">
              All creation of new campaigns and grand destinies is strategically locked. 
              100% of executive bandwidth and temporal capital is strictly restricted to unblocking, finishing, and closing existing active campaigns.
            </p>
          </div>
        </div>
      )}

      {/* Capacity Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#07080c] border border-white/5 space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Destinies</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-display font-bold text-white">{loadMetrics.activeGoalsCount}</span>
            <span className="text-[9px] font-mono text-zinc-500">/ 3 ideal</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#07080c] border border-white/5 space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Campaigns</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-display font-bold text-white">{loadMetrics.activeProjectsCount}</span>
            <span className="text-[9px] font-mono text-zinc-500">/ 4 ideal</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#07080c] border border-white/5 space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block">Blocked Campaigns</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-base font-display font-bold ${loadMetrics.blockedProjectsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {loadMetrics.blockedProjectsCount}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">critical path</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#07080c] border border-white/5 space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Experiments</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-display font-bold text-white">{loadMetrics.activeExperimentsCount}</span>
            <span className="text-[9px] font-mono text-zinc-500">/ 2 ideal</span>
          </div>
        </div>
      </div>

      {/* Progress Load Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
          <span>Throughput Saturation</span>
          <span className={loadMetrics.statusColor}>{loadMetrics.score}% Capacity</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              loadMetrics.level === 'OVERLOADED' 
                ? 'bg-rose-500' 
                : loadMetrics.level === 'HEAVY' 
                ? 'bg-amber-400' 
                : loadMetrics.level === 'OPTIMAL' 
                ? 'bg-emerald-400' 
                : 'bg-cyan-400'
            }`}
            style={{ width: `${loadMetrics.score}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
