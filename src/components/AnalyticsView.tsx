import React from 'react';
import { usePOS } from '../POSContext';
import { 
  BarChart3, Target, Award, Calendar, Flame, Activity, 
  TrendingUp, TrendingDown, Clock, ShieldCheck, Zap, Network
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

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
      <div className="border-b border-[#c5a059]/20 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
          DIVINE ORACLE & METRICS SANCTUM
        </h2>
        <p className="text-xs text-zinc-300 font-mono mt-1">
          SANCTUM_OBSERVATORY • Empirical spiritual resonance & historical trial outcomes
        </p>
      </div>

      {/* TOP COUNT MODULES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'OVERALL COMPLETION', value: `${analytics.overallCompletionRate}%`, icon: ShieldCheck, desc: 'Directive conquest ratio' },
          { label: 'DESTINIES FULFILLED', value: analytics.goalsCompleted, icon: Target, desc: '100% completed goal tracks' },
          { label: 'PROJECTS CONCLUDED', value: analytics.projectsCompleted, icon: Award, desc: 'Fully delivered campaign blocks' },
          { label: 'MILESTONES UNLOCKED', value: analytics.milestonesCompleted, icon: Zap, desc: 'Sacred milestone feats' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel rounded-xl p-5 flex items-center justify-between gap-4 border border-[#c5a059]/25 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg">
              <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase block font-bold">{stat.label}</span>
                <span className="text-3xl font-display font-extrabold text-white block mt-1">{stat.value}</span>
                <span className="text-[9px] font-mono text-zinc-400 block">{stat.desc}</span>
              </div>
              <Icon className="h-8 w-8 text-[#c5a059]/20 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* MID ROW SUMMARY DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART BAR CARD (DAILY XP TREND) */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
          <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
          
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
              DAILY RESONANCE HARVEST CYCLE
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Empirical measurement of spiritual essence over the past 7 days</p>
          </div>

          {/* Bar Chart Svg/CSS */}
          <div className="pt-6 h-[240px] flex items-end justify-between gap-4 border-b border-[#c5a059]/20">
            {analytics.dailyXpTrend.map((day: any, idx: number) => {
              const percentHeight = Math.max(5, Math.round((day.xp / maxTrendXp) * 100));
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group">
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#07080c] border border-[#c5a059] text-[9px] font-mono text-[#fef08a] px-2 py-0.5 rounded transition-opacity pointer-events-none z-10 shadow-lg font-bold">
                    +{day.xp} XP
                  </div>

                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                      day.xp > 0 
                        ? 'bg-gradient-to-t from-[#8a6d2b] to-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)] group-hover:brightness-125' 
                        : 'bg-[#07080c] border border-white/5'
                    }`}
                    style={{ height: `${percentHeight}%` }}
                  />

                  {/* Axis Label */}
                  <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase rotate-12 md:rotate-0">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart footer metrics */}
          <div className="grid grid-cols-3 text-center pt-2">
            <div className="border-r border-[#c5a059]/20">
              <span className="text-[9px] font-mono text-zinc-400 uppercase block">WEEKLY TOTAL</span>
              <span className="text-lg font-mono font-bold text-white block mt-1">+{analytics.weeklyXp} XP</span>
            </div>
            <div className="border-r border-[#c5a059]/20">
              <span className="text-[9px] font-mono text-zinc-400 uppercase block">MONTHLY TOTAL</span>
              <span className="text-lg font-mono font-bold text-white block mt-1">+{analytics.monthlyXp} XP</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#c5a059] uppercase block font-bold">DAILY AVERAGE</span>
              <span className="text-lg font-mono font-bold text-[#fef08a] block mt-1">+{analytics.averageXp} XP</span>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE POS ATTRIBUTES RADAR LIST */}
        <div className="glass-panel rounded-xl p-6 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
          <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
              SUSTAINED ATTRIBUTES
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Attributes mastery based on empirical trial data</p>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {attributes.map((attr) => (
              <div key={attr.id} className="space-y-1.5 text-xs bg-[#07080c]/60 p-2.5 rounded-lg border border-[#c5a059]/15">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-200 font-bold uppercase">{attr.name}</span>
                  <span className="text-[#e5c875] font-bold">LVL {attr.level}</span>
                </div>
                
                <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden relative border border-white/5">
                  <div 
                    className="rpg-progress-gold h-full rounded-full" 
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
        <div className="glass-panel rounded-xl p-6 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
          <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider border-b border-[#c5a059]/20 pb-2 flex items-center gap-2">
            <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
            CATEGORICAL ORACLE REVELATION
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
              <span className="text-zinc-400 font-mono">MOST_IMPROVED_DISCIPLINE:</span>
              <span className="text-[#fef08a] font-sans font-bold uppercase">{analytics.mostImprovedSkill}</span>
            </div>

            <div className="flex justify-between items-start text-xs py-1.5 border-b border-white/5 gap-4">
              <span className="text-zinc-400 font-mono shrink-0">PRIMARY_DESTINY_PATH:</span>
              <span className="text-white font-sans font-bold text-right uppercase line-clamp-1 truncate max-w-[250px]" title={analytics.mostActiveGoal}>
                {analytics.mostActiveGoal}
              </span>
            </div>

            <div className="flex justify-between items-start text-xs py-1.5 border-b border-white/5 gap-4">
              <span className="text-zinc-400 font-mono shrink-0">DORMANT_DESTINY_PATH:</span>
              <span className="text-zinc-400 font-sans text-right uppercase line-clamp-1 truncate max-w-[250px]" title={analytics.leastActiveGoal}>
                {analytics.leastActiveGoal}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
              <span className="text-zinc-400 font-mono">DOMINANT_ATTRIBUTE_CORE:</span>
              <span className="text-emerald-400 font-sans font-bold uppercase">{analytics.strongestAttr}</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
              <span className="text-zinc-400 font-mono">DEVELOPING_ATTRIBUTE_CORE:</span>
              <span className="text-rose-400 font-sans font-bold uppercase">{analytics.weakestAttr}</span>
            </div>
          </div>
        </div>

        {/* CONSISTENCY ANALYSIS & WORKLOAD */}
        <div className="glass-panel rounded-xl p-6 space-y-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
          <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider border-b border-[#c5a059]/20 pb-2 flex items-center gap-2">
            <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
            CONSISTENCY METRIC REPORT
          </h3>

          <div className="space-y-4">
            
            {/* Consistency Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#c5a059] font-bold">ACTIVE REPETITION RATIO</span>
                <span className="text-white font-bold">{consistencyScore}%</span>
              </div>
              <div className="w-full bg-[#07080c] rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    consistencyScore > 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : consistencyScore > 40 ? 'rpg-progress-gold' : 'bg-rose-500'
                  }`}
                  style={{ width: `${consistencyScore}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block mt-1 uppercase">
                Calculated from resolved directives during the last 7 sun cycles.
              </span>
            </div>

            {/* Workload Status breakdown */}
            <div className="p-4 bg-[#07080c] rounded-xl border border-[#c5a059]/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">LOAD BALANCE INDEX</span>
                <span className={`text-xs font-mono font-bold uppercase ${
                  analytics.workloadStatus === 'Heavy Workload' ? 'text-rose-400' :
                  analytics.workloadStatus === 'Moderate Workload' ? 'text-[#fef08a]' :
                  analytics.workloadStatus === 'No Workload' ? 'text-zinc-500' : 'text-emerald-400'
                }`}>
                  {analytics.workloadStatus}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                {analytics.workloadStatus === 'Heavy Workload' 
                  ? 'Your estimated daily duration exceeds sustainable benchmarks. Highly recommend toggling RECOVERY MODE to rebuild spiritual composure.' 
                  : analytics.workloadStatus === 'Moderate Workload'
                  ? 'Your current workloads are at peak harmonic equilibrium. Directives are mapped and scaled smoothly.'
                  : 'Your workloads are light. Inscribe new strategic destinies or dispatch trials to accelerate elevation.'}
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
