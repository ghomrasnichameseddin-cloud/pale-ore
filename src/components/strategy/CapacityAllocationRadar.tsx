import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { 
  Activity, Clock, PieChart, AlertTriangle, ShieldCheck, 
  TrendingUp, Compass, Sliders, CheckCircle, Flame, Moon,
  Zap, Heart, Brain, Briefcase, Award, ArrowUpRight
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface DomainAllocation {
  id: string;
  name: string;
  arabicName: string;
  color: string;
  plannedPercent: number;
  actualHours: number;
  actualPercent: number;
  driftPercent: number;
  description: string;
  icon: React.ElementType;
}

export const CapacityAllocationRadar: React.FC = () => {
  const { state, getAttributes } = usePOS();

  // Custom Planned Domain Allocations (defaults to 100% total)
  const [plannedAllocations, setPlannedAllocations] = useState<Record<string, number>>({
    spiritual: 20,
    intellectual: 20,
    empire: 35,
    vitality: 15,
    covenant: 10
  });

  // 168h Weekly Capacity settings
  const [weeklySleepHours, setWeeklySleepHours] = useState(56); // 8h/day
  const [weeklyDeepWorkHours, setWeeklyDeepWorkHours] = useState(35); // 5h/day
  const [weeklyShallowHours, setWeeklyShallowHours] = useState(20);
  const [weeklySacredHours, setWeeklySacredHours] = useState(14); // 2h/day

  // Calculate actual hours worked across domains from quests & time transactions
  const domainMetrics = useMemo(() => {
    let spiritualMins = 0;
    let intellectualMins = 0;
    let empireMins = 0;
    let vitalityMins = 0;
    let covenantMins = 0;

    // Scan quests
    (state.quests || []).forEach(q => {
      const mins = q.actualMinutesWorked || q.timeSpent || (q.status === 'Completed' ? q.estimatedTime || 30 : 0);
      const nameLower = (q.name || '').toLowerCase();
      const descLower = (q.description || '').toLowerCase();

      if (q.type === 'Habit' || nameLower.includes('fajr') || nameLower.includes('quran') || nameLower.includes('adhkar') || nameLower.includes('prayer') || descLower.includes('spiritual')) {
        spiritualMins += mins;
      } else if (nameLower.includes('read') || nameLower.includes('study') || nameLower.includes('skill') || nameLower.includes('learn') || nameLower.includes('arabic')) {
        intellectualMins += mins;
      } else if (nameLower.includes('gym') || nameLower.includes('workout') || nameLower.includes('run') || nameLower.includes('sleep') || nameLower.includes('rest')) {
        vitalityMins += mins;
      } else if (nameLower.includes('family') || nameLower.includes('charity') || nameLower.includes('call') || nameLower.includes('covenant')) {
        covenantMins += mins;
      } else {
        empireMins += mins; // default to Empire / Career work
      }
    });

    const totalActualMins = Math.max(1, spiritualMins + intellectualMins + empireMins + vitalityMins + covenantMins);
    const totalActualHours = Math.round(totalActualMins / 60);

    const domains: DomainAllocation[] = [
      {
        id: 'empire',
        name: 'Empire & Professional Mastery',
        arabicName: 'المُلك والسعي',
        color: '#a855f7',
        plannedPercent: plannedAllocations.empire,
        actualHours: Math.round((empireMins / 60) * 10) / 10,
        actualPercent: Math.round((empireMins / totalActualMins) * 100),
        driftPercent: Math.round((empireMins / totalActualMins) * 100) - plannedAllocations.empire,
        description: 'Core projects, software engineering, capital generation & career advancement.',
        icon: Briefcase
      },
      {
        id: 'spiritual',
        name: 'Spiritual Vitality & Moral Restraint',
        arabicName: 'الرُّوح والمُحاسبة',
        color: '#10b981',
        plannedPercent: plannedAllocations.spiritual,
        actualHours: Math.round((spiritualMins / 60) * 10) / 10,
        actualPercent: Math.round((spiritualMins / totalActualMins) * 100),
        driftPercent: Math.round((spiritualMins / totalActualMins) * 100) - plannedAllocations.spiritual,
        description: 'Obligatory prayers, Tahajjud, Quranic recitation, Adhkar & Muhāsabah boundary audits.',
        icon: Heart
      },
      {
        id: 'intellectual',
        name: 'Intellectual & Strategic Mastery',
        arabicName: 'العقل والحِكمة',
        color: '#3b82f6',
        plannedPercent: plannedAllocations.intellectual,
        actualHours: Math.round((intellectualMins / 60) * 10) / 10,
        actualPercent: Math.round((intellectualMins / totalActualMins) * 100),
        driftPercent: Math.round((intellectualMins / totalActualMins) * 100) - plannedAllocations.intellectual,
        description: 'Deep reading, discipline acquisition, codex architecture & mental models.',
        icon: Brain
      },
      {
        id: 'vitality',
        name: 'Bodily Vitality & Rest Bank',
        arabicName: 'البَدَن والراحة',
        color: '#f59e0b',
        plannedPercent: plannedAllocations.vitality,
        actualHours: Math.round((vitalityMins / 60) * 10) / 10,
        actualPercent: Math.round((vitalityMins / totalActualMins) * 100),
        driftPercent: Math.round((vitalityMins / totalActualMins) * 100) - plannedAllocations.vitality,
        description: 'Physical training, rest bank solvency, sleep hygiene & biological recovery.',
        icon: Moon
      },
      {
        id: 'covenant',
        name: 'Covenant, Family & Character',
        arabicName: 'العَهد والخُلُق',
        color: '#06b6d4',
        plannedPercent: plannedAllocations.covenant,
        actualHours: Math.round((covenantMins / 60) * 10) / 10,
        actualPercent: Math.round((covenantMins / totalActualMins) * 100),
        driftPercent: Math.round((covenantMins / totalActualMins) * 100) - plannedAllocations.covenant,
        description: 'Family duty, brotherhood covenants, character discipline & noble conduct.',
        icon: Award
      }
    ];

    return {
      domains,
      totalActualHours
    };
  }, [state.quests, plannedAllocations]);

  // 168-Hour Weekly Capacity Math
  const capacityMath = useMemo(() => {
    const totalAllocated = weeklySleepHours + weeklyDeepWorkHours + weeklyShallowHours + weeklySacredHours;
    const weeklyMarginHours = 168 - totalAllocated;
    const isOverAllocated = weeklyMarginHours < 0;
    const isMarginLow = weeklyMarginHours < 14;

    return {
      totalAllocated,
      weeklyMarginHours,
      isOverAllocated,
      isMarginLow
    };
  }, [weeklySleepHours, weeklyDeepWorkHours, weeklyShallowHours, weeklySacredHours]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-[#080b14]/95 border border-[#c5a059]/30 rounded-xl p-5 relative overflow-hidden shadow-2xl">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#e5c875]" />
              STRATEGIC CAPACITY &amp; ENERGY ALLOCATION RADAR
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
                168-HOUR AUDIT
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Exposing the delta between stated strategic ambitions and real execution hours across all 5 constitutional life domains.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#05070d] border border-white/10 rounded-lg px-3 py-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Total Logged Output</span>
              <span className="text-sm font-mono font-bold text-[#fef08a] tabular-nums">
                {domainMetrics.totalActualHours}h Active Work
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Weekly Margin</span>
              <span className={`text-sm font-mono font-bold tabular-nums ${
                capacityMath.isOverAllocated ? 'text-rose-400' : capacityMath.isMarginLow ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {capacityMath.weeklyMarginHours}h Buffer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. DOMAIN ALLOCATION COMPARISON: PLANNED INTENT VS ACTUAL REALITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 2 COLS: DOMAINS BREAKDOWN */}
        <div className="lg:col-span-2 bg-[#080b14]/90 border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#c5a059]" />
              LIFE DOMAIN TIME ALLOCATION (INTENDED VS MEASURED)
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              5 CONSTITUTIONAL SPHERES
            </span>
          </div>

          <div className="space-y-4">
            {domainMetrics.domains.map(d => {
              const Icon = d.icon;
              const hasDrift = Math.abs(d.driftPercent) >= 8;
              const isDeficit = d.driftPercent < -5;

              return (
                <div 
                  key={d.id}
                  className="bg-[#05070d] border border-white/10 rounded-xl p-3.5 space-y-2.5 transition hover:border-[#c5a059]/30 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10" style={{ color: d.color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display text-xs font-bold text-white uppercase flex items-center gap-2">
                          {d.name}
                          <span className="font-serif text-[10px] text-zinc-500 font-normal">
                            ({d.arabicName})
                          </span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                          {d.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="text-xs font-bold text-white tabular-nums">
                        {d.actualHours}h <span className="text-zinc-500 font-normal">({d.actualPercent}%)</span>
                      </div>
                      <span className={`text-[10px] font-bold ${
                        d.driftPercent > 5 ? 'text-amber-400' : isDeficit ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {d.driftPercent > 0 ? `+${d.driftPercent}% over` : `${d.driftPercent}% drift`}
                      </span>
                    </div>
                  </div>

                  {/* Dual Comparison Gauges */}
                  <div className="space-y-1.5 pt-1">
                    {/* Intended Target Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>Target Strategy: {d.plannedPercent}%</span>
                        <span>Actual Focus: {d.actualPercent}%</span>
                      </div>
                      <div className="w-full bg-[#080b14] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div 
                          className="h-full rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, d.plannedPercent)}%`, backgroundColor: `${d.color}60` }} 
                        />
                      </div>
                    </div>

                    {/* Actual Measured Output Bar */}
                    <div className="w-full bg-[#080b14] rounded-full h-2 overflow-hidden border border-white/10">
                      <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, d.actualPercent)}%`, backgroundColor: d.color }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 1 COL: 168-HOUR WEEKLY CAPACITY ALLOCATOR */}
        <div className="space-y-4">
          
          <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#c5a059]" />
                168-HOUR WEEKLY CAPACITY
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                FIXED ASSET
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              Every week has exactly 168 hours. Calibrate non-negotiable blocks to ensure realistic strategic capacity.
            </p>

            {/* Capacity Allocator Sliders */}
            <div className="space-y-3 font-mono text-xs">
              
              <div className="bg-[#05070d] p-2.5 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Sleep &amp; Biological Rest:</span>
                  <span className="text-amber-400 font-bold">{weeklySleepHours}h/wk ({Math.round(weeklySleepHours / 7)}h/d)</span>
                </div>
                <input 
                  type="range" 
                  min="42" 
                  max="70" 
                  value={weeklySleepHours}
                  onChange={(e) => setWeeklySleepHours(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="bg-[#05070d] p-2.5 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Deep Work &amp; Strategic Sprints:</span>
                  <span className="text-purple-400 font-bold">{weeklyDeepWorkHours}h/wk</span>
                </div>
                <input 
                  type="range" 
                  min="15" 
                  max="60" 
                  value={weeklyDeepWorkHours}
                  onChange={(e) => setWeeklyDeepWorkHours(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="bg-[#05070d] p-2.5 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Spiritual Practice &amp; Prayers:</span>
                  <span className="text-emerald-400 font-bold">{weeklySacredHours}h/wk ({Math.round(weeklySacredHours / 7)}h/d)</span>
                </div>
                <input 
                  type="range" 
                  min="7" 
                  max="28" 
                  value={weeklySacredHours}
                  onChange={(e) => setWeeklySacredHours(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="bg-[#05070d] p-2.5 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Shallow &amp; Maintenance Tasks:</span>
                  <span className="text-cyan-400 font-bold">{weeklyShallowHours}h/wk</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="35" 
                  value={weeklyShallowHours}
                  onChange={(e) => setWeeklyShallowHours(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

            </div>

            {/* Capacity Status Alert */}
            <div className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
              capacityMath.isOverAllocated
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : capacityMath.isMarginLow
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            }`}>
              <div className="flex items-center gap-1.5 font-bold uppercase">
                {capacityMath.isOverAllocated ? (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                )}
                <span>
                  {capacityMath.isOverAllocated 
                    ? 'CAPACITY OVERDRAFT WARNING' 
                    : capacityMath.isMarginLow 
                    ? 'TIGHT MARGIN WARNING' 
                    : 'CAPACITY ALLOCATION SOLVENT'}
                </span>
              </div>
              <p className="text-[11px] font-sans leading-relaxed text-zinc-300">
                {capacityMath.isOverAllocated
                  ? `Allocated ${capacityMath.totalAllocated}h exceeds 168h week by +${Math.abs(capacityMath.weeklyMarginHours)}h. Reduce workload to avoid systemic burnout.`
                  : capacityMath.isMarginLow
                  ? `Only ${capacityMath.weeklyMarginHours}h of margin remaining. Ensure adequate recovery buffer.`
                  : `Healthy ${capacityMath.weeklyMarginHours} hours of discretionary margin available for family, reading, and unplanned friction.`}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
