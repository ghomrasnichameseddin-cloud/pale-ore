import React, { useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { Goal } from '../../types';
import { Compass, TrendingUp, AlertCircle, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';

interface StrategicDriftIndicatorProps {
  onNavigateToDestinies?: () => void;
}

export const StrategicDriftIndicator: React.FC<StrategicDriftIndicatorProps> = ({
  onNavigateToDestinies
}) => {
  const { state } = usePOS();

  const driftAnalysis = useMemo(() => {
    const activeGoals = state.goals.filter(g => g.status === 'Active');
    if (activeGoals.length === 0) {
      return {
        hasData: false,
        totalWeight: 0,
        averageDrift: 0,
        goalsData: [],
        status: 'No Active Destinies'
      };
    }

    // 1. Calculate Stated Strategic Weight share per goal
    const rawWeights = activeGoals.map(g => g.strategicWeight || (g.priority === 'High' ? 80 : g.priority === 'Medium' ? 50 : 30));
    const totalWeight = rawWeights.reduce((acc, w) => acc + w, 0) || 1;

    // 2. Calculate Actual Work Allocation per goal
    // Work units = completed quests count linked to goal + (logged work minutes / 30)
    let totalWorkUnits = 0;
    const goalWorkUnits = activeGoals.map(g => {
      const linkedProjects = state.projects.filter(p => p.goalId === g.id);
      const linkedProjectIds = new Set(linkedProjects.map(p => p.id));
      
      const directQuests = state.quests.filter(q => q.goalId === g.id);
      const projectQuests = state.quests.filter(q => q.projectId && linkedProjectIds.has(q.projectId));
      const allQuests = Array.from(new Set([...directQuests, ...projectQuests]));

      const completedCount = allQuests.filter(q => q.status === 'Completed').length;
      const totalMinutesSpent = allQuests.reduce((sum, q) => sum + (q.actualMinutesWorked || q.timeSpent || 0), 0);
      
      const units = completedCount * 2 + (totalMinutesSpent / 30);
      totalWorkUnits += units;
      return {
        goal: g,
        units,
        completedCount,
        totalMinutesSpent
      };
    });

    const safeTotalWorkUnits = totalWorkUnits > 0 ? totalWorkUnits : 1;

    // 3. Compute Share vs Reality and Drift Delta
    let cumulativeDrift = 0;
    const goalsData = goalWorkUnits.map(({ goal, units, completedCount, totalMinutesSpent }) => {
      const statedWeight = goal.strategicWeight || (goal.priority === 'High' ? 80 : goal.priority === 'Medium' ? 50 : 30);
      const statedShare = Math.round((statedWeight / totalWeight) * 100);
      const actualShare = totalWorkUnits > 0 ? Math.round((units / safeTotalWorkUnits) * 100) : statedShare;
      const delta = actualShare - statedShare; // positive = over-allocated, negative = starved
      cumulativeDrift += Math.abs(delta);

      return {
        goal,
        statedShare,
        actualShare,
        delta,
        completedCount,
        totalMinutesSpent
      };
    });

    const averageDrift = Math.round(cumulativeDrift / (activeGoals.length * 2)); // Normalized 0-100 scale

    let status: 'Nominal Alignment' | 'Mild Drift' | 'Significant Strategic Drift';
    if (averageDrift < 15) {
      status = 'Nominal Alignment';
    } else if (averageDrift < 35) {
      status = 'Mild Drift';
    } else {
      status = 'Significant Strategic Drift';
    }

    return {
      hasData: true,
      totalWeight,
      averageDrift,
      goalsData,
      status
    };
  }, [state.goals, state.projects, state.quests]);

  if (!driftAnalysis.hasData) {
    return null;
  }

  const isSignificant = driftAnalysis.status === 'Significant Strategic Drift';
  const isMild = driftAnalysis.status === 'Mild Drift';

  return (
    <div className="glass-panel border-[#c5a059]/30 bg-[#0b0d13]/90 p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-xl">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Compass className={`h-4 w-4 ${isSignificant ? 'text-amber-400 animate-pulse' : 'text-[#c5a059]'}`} />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>STRATEGIC DRIFT INDICATOR</span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                isSignificant 
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40' 
                  : isMild
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {driftAnalysis.status.toUpperCase()} ({driftAnalysis.averageDrift}% DIVERGENCE)
              </span>
            </h3>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Compares stated strategic priority weights against actual logged focus time and directive completions.
          </p>
        </div>

        {onNavigateToDestinies && (
          <button
            onClick={onNavigateToDestinies}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-bold cursor-pointer"
          >
            Adjust Destiny Weights <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Comparative Visual Bars */}
      <div className="space-y-3 pt-1">
        {driftAnalysis.goalsData.map(item => {
          const isStarved = item.delta <= -15;
          const isOverfed = item.delta >= 15;

          return (
            <div key={item.goal.id} className="p-3 bg-[#07080c] border border-white/5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#fef08a] font-display font-bold truncate">
                    {item.goal.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 shrink-0">
                    ({item.completedCount} quests • {Math.round(item.totalMinutesSpent)}m focus)
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isStarved
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : isOverfed
                      ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`} {isStarved ? 'STARVED' : isOverfed ? 'OVER-ALLOCATED' : 'BALANCED'}
                  </span>
                </div>
              </div>

              {/* Comparative Dual Bar */}
              <div className="space-y-1.5 text-[10px] font-mono">
                {/* Stated Intent */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 w-24 shrink-0">Stated Weight:</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#c5a059] h-full rounded-full transition-all"
                      style={{ width: `${item.statedShare}%` }} 
                    />
                  </div>
                  <span className="text-zinc-300 w-8 text-right shrink-0">{item.statedShare}%</span>
                </div>

                {/* Actual Execution */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 w-24 shrink-0">Actual Execution:</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isStarved ? 'bg-rose-500' : isOverfed ? 'bg-cyan-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${item.actualShare}%` }} 
                    />
                  </div>
                  <span className={`w-8 text-right shrink-0 font-bold ${
                    isStarved ? 'text-rose-400' : isOverfed ? 'text-cyan-300' : 'text-emerald-300'
                  }`}>
                    {item.actualShare}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Insight Callout */}
      {isSignificant && (
        <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs font-mono">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-amber-300 font-bold block">Strategic Drift Diagnostic:</span>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Discrepancy detected between your stated high-leverage priorities and daily execution patterns. 
              Daily operational trivia or unplanned firefighting is draining focus from high-weight grand destinies. 
              Consider an intentional directive recalibration in your Friday Muḥāsabah review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
