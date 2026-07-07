import React from 'react';
import { usePOS } from '../POSContext';
import { 
  BarChart3, Target, Award, Calendar, Flame, Activity, 
  TrendingUp, TrendingDown, Clock, ShieldCheck, Zap 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { state, getAnalytics, getAttributes } = usePOS();
  
  const analytics = getAnalytics();
  const attributes = getAttributes();

  // Find max value in daily trend to scale chart height
  const maxTrendXp = Math.max(...analytics.dailyXpTrend.map((t: any) => t.xp), 100);

  // Consistency calculation: Percentage of active days in the last 7 days with earned XP
  const activeDaysCount = analytics.dailyXpTrend.filter((t: any) => t.xp > 0).length;
  const consistencyScore = Math.round((activeDaysCount / 7) * 100);

  return (
    <div className="space-y-6" id="analytics-view-root">
      
      {/* SECTION HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          SYSTEM ANALYTICS HUB
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          POS_METRICS_DUMP • Grounded in evidence-based historical data logs
        </p>
      </div>

      {/* TOP COUNT MODULES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'OVERALL COMPLETION', value: `${analytics.overallCompletionRate}%`, icon: ShieldCheck, desc: 'Quest completion ratio' },
          { label: 'GOALS ACQUIRED', value: analytics.goalsCompleted, icon: Target, desc: '100% completed goal tracks' },
          { label: 'PROJECTS CONCLUDED', value: analytics.projectsCompleted, icon: Award, desc: 'Successfully fully-delivered blocks' },
          { label: 'MILESTONES UNLOCKED', value: analytics.milestonesCompleted, icon: Zap, desc: 'Key milestone achievements' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel rounded-lg p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">{stat.label}</span>
                <span className="text-3xl font-display font-black text-white block mt-1">{stat.value}</span>
                <span className="text-[9px] font-mono text-zinc-400 block">{stat.desc}</span>
              </div>
              <Icon className="h-8 w-8 text-cyan-500/10 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* MID ROW SUMMARY DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART BAR CARD (DAILY XP TREND) */}
        <div className="lg:col-span-2 glass-panel rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              DAILY XP EARNED CYCLE
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Historical metric analysis of completed work over the past 7 days</p>
          </div>

          {/* Bar Chart Svg/CSS */}
          <div className="pt-6 h-[240px] flex items-end justify-between gap-4 border-b border-white/5">
            {analytics.dailyXpTrend.map((day: any, idx: number) => {
              // Calculate percent height of bar
              const percentHeight = Math.max(5, Math.round((day.xp / maxTrendXp) * 100));
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group">
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-6 opacity-0 group-hover:opacity-100 bg-zinc-950 border border-white/10 text-[9px] font-mono text-cyan-400 px-1.5 py-0.5 rounded transition-opacity pointer-events-none z-10">
                    +{day.xp} XP
                  </div>

                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[28px] rounded-t-sm transition-all duration-500 ${
                      day.xp > 0 
                        ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:bg-cyan-400' 
                        : 'bg-zinc-900 border border-white/5'
                    }`}
                    style={{ height: `${percentHeight}%` }}
                  />

                  {/* Axis Label */}
                  <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase rotate-12 md:rotate-0">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart footer metrics */}
          <div className="grid grid-cols-3 text-center pt-2">
            <div className="border-r border-white/5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">WEEKLY TOTAL</span>
              <span className="text-lg font-mono font-bold text-white block mt-1">+{analytics.weeklyXp} XP</span>
            </div>
            <div className="border-r border-white/5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">MONTHLY TOTAL</span>
              <span className="text-lg font-mono font-bold text-white block mt-1">+{analytics.monthlyXp} XP</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">DAILY AVERAGE</span>
              <span className="text-lg font-mono font-bold text-cyan-400 block mt-1">+{analytics.averageXp} XP</span>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE POS ATTRIBUTES RADAR LIST */}
        <div className="glass-panel rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              SUSTAINED ATTRIBUTES
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Attributes level based on completed quest volume evidence</p>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {attributes.map((attr) => (
              <div key={attr.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-200 font-bold uppercase">{attr.name}</span>
                  <span className="text-cyan-400 font-bold">LVL {attr.level}</span>
                </div>
                
                <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden relative">
                  <div 
                    className="bg-cyan-500 h-full rounded" 
                    style={{ width: `${attr.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LOWER GRID: FOCUS DUMPS & WORKLOAD ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* COMPREHENSIVE CATEGORY BREAKDOWNS */}
        <div className="glass-panel rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            CATEGORICAL REVEAL
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
              <span className="text-zinc-500 font-mono">MOST_IMPROVED_SKILL:</span>
              <span className="text-cyan-400 font-sans font-bold uppercase">{analytics.mostImprovedSkill}</span>
            </div>

            <div className="flex justify-between items-start text-xs py-1 border-b border-white/5 gap-4">
              <span className="text-zinc-500 font-mono shrink-0">MOST_ACTIVE_GOAL_PATH:</span>
              <span className="text-white font-sans font-bold text-right uppercase line-clamp-1 truncate max-w-[250px]" title={analytics.mostActiveGoal}>
                {analytics.mostActiveGoal}
              </span>
            </div>

            <div className="flex justify-between items-start text-xs py-1 border-b border-white/5 gap-4">
              <span className="text-zinc-500 font-mono shrink-0">LEAST_ACTIVE_GOAL_PATH:</span>
              <span className="text-zinc-400 font-sans text-right uppercase line-clamp-1 truncate max-w-[250px]" title={analytics.leastActiveGoal}>
                {analytics.leastActiveGoal}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
              <span className="text-zinc-500 font-mono">STRONGEST_ATTRIBUTE_CORE:</span>
              <span className="text-emerald-400 font-sans font-bold uppercase">{analytics.strongestAttr}</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
              <span className="text-zinc-500 font-mono">WEAKEST_ATTRIBUTE_CORE:</span>
              <span className="text-rose-400 font-sans font-bold uppercase">{analytics.weakestAttr}</span>
            </div>
          </div>
        </div>

        {/* CONSISTENCY ANALYSIS & WORKLOAD */}
        <div className="glass-panel rounded-lg p-6 space-y-5">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            CONSISTENCY METRIC REPORT
          </h3>

          <div className="space-y-4">
            
            {/* Consistency Gauge */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">ACTIVE DAYS CONSISTENCY SCORE</span>
                <span className="text-white font-bold">{consistencyScore}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded transition-all duration-300 ${
                    consistencyScore > 75 ? 'bg-emerald-500' : consistencyScore > 40 ? 'bg-cyan-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${consistencyScore}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-zinc-500 block mt-1 uppercase">
                Based on days with earned XP in the last 7-day cycle.
              </span>
            </div>

            {/* Workload Status breakdown */}
            <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">LOAD BALANCE INDEX</span>
                <span className={`text-xs font-mono font-bold uppercase ${
                  analytics.workloadStatus === 'Heavy Workload' ? 'text-rose-400' :
                  analytics.workloadStatus === 'Moderate Workload' ? 'text-amber-400' :
                  analytics.workloadStatus === 'No Workload' ? 'text-zinc-500' : 'text-emerald-400'
                }`}>
                  {analytics.workloadStatus}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {analytics.workloadStatus === 'Heavy Workload' 
                  ? 'Your estimated daily duration exceeds sustainable benchmarks. Highly recommend toggling RECOVERY MODE to rebuild momentum safely without penalties.' 
                  : analytics.workloadStatus === 'Moderate Workload'
                  ? 'Your current workloads are at peak optimization. Directives are mapped and scaled smoothly.'
                  : 'Your workloads are light. Clear custom goals or dispatch new quests to accelerate level-ups.'}
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
