import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Moon, Coffee, ShieldAlert, Sparkles, ChevronRight, 
  Settings, ShoppingBag, Plus, ArrowUpRight, Flame, Hourglass, Check, Lock,
  ShieldCheck, AlertTriangle, AlertOctagon, Compass, Activity, Zap,
  HelpCircle, Calendar, RefreshCw, X, ChevronDown, ListChecks, CheckCircle2, Info
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { RubElHizbIcon } from './IslamicRpgDecorations';
import { 
  getActiveUsageBlocker, 
  DEFAULT_PROTECTED_BUFFER_PERCENT, 
  DEFAULT_REQUIRED_MINUTES_BASELINE, 
  DEFAULT_DAILY_REST_ALLOWANCE_MINUTES 
} from '../utils/temporalLedger';
import { TemporalStatus, RestCategory } from '../types';

interface TemporalCapitalHudProps {
  onNavigate?: (tab: string) => void;
}

export const TemporalCapitalHud: React.FC<TemporalCapitalHudProps> = ({ onNavigate }) => {
  const { 
    state, 
    getTemporalAccounting,
    getDailyRestState,
    setDailyWakingHours,
    setProtectedBufferPercent,
    setDailyRestAllowance,
    setRequiredMinutesBaseline,
    startActiveRestSession
  } = usePOS();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isQuickRedeemOpen, setIsQuickRedeemOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'used' | 'committed' | 'required' | 'allocatable' | 'explainer' | null>(null);
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [customTitle, setCustomTitle] = useState<string>('Mindful Breathing & Qaylulah');
  const [customCategory, setCustomCategory] = useState<RestCategory>('restorative');

  const accounting = getTemporalAccounting();
  const dailyRest = getDailyRestState();
  const currentHours = state.profile.dailyWakingHours || 16;
  const currentBufferPercent = state.profile.protectedBufferPercent ?? DEFAULT_PROTECTED_BUFFER_PERCENT;
  const currentDailyAllowance = state.profile.dailyRestAllowanceMinutes ?? DEFAULT_DAILY_REST_ALLOWANCE_MINUTES;
  const currentRequiredBaseline = state.profile.requiredMinutesBaseline ?? DEFAULT_REQUIRED_MINUTES_BASELINE;
  const usageBlocker = getActiveUsageBlocker(state.appUsageLimits || [], state.appUsageLogs || [], state.systemDate);

  // Format minutes into hours + mins
  const formatMins = (m: number) => {
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    if (hrs === 0) return `${mins}m`;
    return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
  };

  // 5-segment percentages based on waking capital
  const totalWaking = accounting.wakingCapitalMinutes || 960;
  const investedPct = Math.min(100, Math.round((accounting.usedMinutes / totalWaking) * 100));
  const committedPct = Math.min(100 - investedPct, Math.round((accounting.committedMinutes / totalWaking) * 100));
  const requiredPct = Math.min(100 - investedPct - committedPct, Math.round((accounting.requiredMinutes / totalWaking) * 100));
  const bufferPct = Math.min(100 - investedPct - committedPct - requiredPct, Math.round((accounting.protectedBufferMinutes / totalWaking) * 100));
  const allocatablePct = Math.max(0, 100 - investedPct - committedPct - requiredPct - bufferPct);

  // Solvency Status presentation
  const getStatusBadge = (status: TemporalStatus) => {
    switch (status) {
      case 'STABLE':
        return {
          label: 'STABLE SOLVENCY',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: ShieldCheck,
          desc: 'Remaining time can safely absorb new commitments.'
        };
      case 'TIGHT':
        return {
          label: 'TIGHT MARGIN',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          desc: 'Raw time remains, but committing further encroaches into safety buffers.'
        };
      case 'OVERCOMMITTED':
        return {
          label: 'OVERCOMMITTED',
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          icon: AlertTriangle,
          desc: 'Committed tasks exceed non-renewable waking hours.'
        };
      case 'OVERDRAFT':
      default:
        return {
          label: 'TEMPORAL OVERDRAFT',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
          icon: AlertOctagon,
          desc: 'Day is actively overdrawn! Further action sacrifices sleep or tomorrow.'
        };
    }
  };

  const statusMeta = getStatusBadge(accounting.status);
  const StatusIcon = statusMeta.icon;

  const handleLaunchRest = (title: string, mins: number) => {
    startActiveRestSession(title, mins);
    setIsQuickRedeemOpen(false);
  };

  return (
    <div 
      className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 relative overflow-hidden shadow-lg transition"
      id="temporal-capital-hud-container"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Hourglass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2 text-[#c5a059]" />
                <span>TEMPORAL CONTROL SYSTEM v2</span>
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border flex items-center gap-1 ${statusMeta.color}`}>
                <StatusIcon className="h-2.5 w-2.5" />
                {statusMeta.label}
              </span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-serif tracking-wide">
              Ra's al-Māl (Finite Waking Capital)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Active Date & Daily Reset Status */}
          <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">{accounting.breakdown?.activeDate || state.systemDate}</span>
            <span className="text-emerald-500">•</span>
            <span className="text-zinc-400">Resets Daily 00:00</span>
          </div>

          {/* Explainer Button */}
          <button
            onClick={() => setActiveDetailTab(activeDetailTab === 'explainer' ? null : 'explainer')}
            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1 border ${
              activeDetailTab === 'explainer'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            title="How the Temporal Control System & Daily Reset Works"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">Guide</span>
          </button>

          {/* Config waking hours button */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 border border-white/5"
            title="Configure Temporal Parameters (Hours, Buffer, Allowance)"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{currentHours}h • {currentBufferPercent}% Buf</span>
          </button>

          {/* Ledger link */}
          <button
            onClick={() => onNavigate?.('time_ledger')}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/15 text-zinc-400 hover:text-emerald-300 text-xs font-mono transition flex items-center gap-1.5 border border-white/5"
            title="Open Temporal Ledger & Audit Trail"
          >
            <span className="text-[11px] font-bold">Ledger</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* CONFIG PARAMETERS DRAWER */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 py-3 overflow-hidden text-xs font-mono"
          >
            <div className="bg-[#10141f] rounded-xl p-3 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-zinc-300 font-semibold border-b border-white/5 pb-2">
                <span>Temporal Control Calibration:</span>
                <span className="text-emerald-400 font-bold">{currentHours}h Waking ({currentHours * 60}m)</span>
              </div>

              {/* Row 1: Waking Hours */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Waking Hours (Excludes 7–8h Sleep):</span>
                <div className="flex items-center gap-2">
                  {[14, 15, 16, 17, 18].map(h => (
                    <button
                      key={h}
                      onClick={() => setDailyWakingHours(h)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                        currentHours === h 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Protected Safety Buffer */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Protected Safety Buffer (Friction Reserve):</span>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setProtectedBufferPercent(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                        currentBufferPercent === pct 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      {pct}% ({Math.round(totalWaking * (pct / 100))}m)
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Daily Rest Ceiling */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Daily Rest Allowance Ceiling (Non-Cumulative):</span>
                <div className="flex items-center gap-2">
                  {[60, 90, 120, 180].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setDailyRestAllowance(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                        currentDailyAllowance === mins 
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      {formatMins(mins)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Required Minutes Baseline */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Required Baseline (5 Prayers, Adhkar, Meals):</span>
                <div className="flex items-center gap-2">
                  {[60, 90, 120, 150, 180].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setRequiredMinutesBaseline(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                        currentRequiredBaseline === mins 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      {formatMins(mins)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5">
        
        {/* COLUMN 1 & 2: WAKING CAPITAL SEGMENTED BREAKDOWN */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>CAPITAL SOLVENCY ALLOCATION</span>
            </span>
            <span className="text-zinc-300 font-bold">
              {formatMins(accounting.usedMinutes + accounting.committedMinutes + accounting.requiredMinutes)} / {formatMins(accounting.wakingCapitalMinutes)} ({accounting.utilizationPercent}%)
            </span>
          </div>

          {/* 5-Segment Progress Bar */}
          <div className="w-full bg-[#0b0e14] rounded-full h-3.5 overflow-hidden p-0.5 border border-white/10 flex gap-0.5" title="Temporal Capital Flow">
            {/* Invested / Used */}
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              style={{ width: `${investedPct}%` }}
              title={`Used / Invested: ${formatMins(accounting.usedMinutes)}`}
            />
            {/* Committed (Scheduled Directives) */}
            <div 
              className="bg-gradient-to-r from-amber-500 to-[#c5a059] h-full rounded-full transition-all duration-500" 
              style={{ width: `${committedPct}%` }}
              title={`Committed: ${formatMins(accounting.committedMinutes)}`}
            />
            {/* Required Baseline (Worship & Routines) */}
            <div 
              className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${requiredPct}%` }}
              title={`Required Baseline: ${formatMins(accounting.requiredMinutes)}`}
            />
            {/* Protected Buffer */}
            <div 
              className="bg-white/15 h-full rounded-full transition-all duration-500" 
              style={{ width: `${bufferPct}%` }}
              title={`Protected Safety Buffer: ${formatMins(accounting.protectedBufferMinutes)} (${currentBufferPercent}%)`}
            />
            {/* Safely Allocatable Capacity */}
            <div 
              className="bg-emerald-400/30 border border-emerald-400/50 h-full rounded-full transition-all duration-500" 
              style={{ width: `${allocatablePct}%` }}
              title={`Safely Allocatable: ${formatMins(accounting.safelyAllocatableMinutes)}`}
            />
          </div>

          {/* 4 Cards Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
            <button
              onClick={() => setActiveDetailTab(activeDetailTab === 'used' ? null : 'used')}
              className={`p-2 rounded-xl border flex flex-col text-left transition cursor-pointer ${
                activeDetailTab === 'used'
                  ? 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  USED
                </span>
                <ChevronDown className={`h-3 w-3 text-emerald-400 transition-transform ${activeDetailTab === 'used' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.usedMinutes)}
              </span>
              <span className="text-[9px] text-zinc-500">Done & Focus</span>
            </button>

            <button
              onClick={() => setActiveDetailTab(activeDetailTab === 'committed' ? null : 'committed')}
              className={`p-2 rounded-xl border flex flex-col text-left transition cursor-pointer ${
                activeDetailTab === 'committed'
                  ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                  : 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  COMMITTED
                </span>
                <ChevronDown className={`h-3 w-3 text-amber-400 transition-transform ${activeDetailTab === 'committed' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.committedMinutes)}
              </span>
              <span className="text-[9px] text-zinc-500">Scheduled Quests</span>
            </button>

            <button
              onClick={() => setActiveDetailTab(activeDetailTab === 'required' ? null : 'required')}
              className={`p-2 rounded-xl border flex flex-col text-left transition cursor-pointer ${
                activeDetailTab === 'required'
                  ? 'bg-cyan-500/25 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  REQUIRED
                </span>
                <ChevronDown className={`h-3 w-3 text-cyan-400 transition-transform ${activeDetailTab === 'required' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.requiredMinutes)}
              </span>
              <span className="text-[9px] text-zinc-500">Salah & Routines</span>
            </button>

            <button
              onClick={() => setActiveDetailTab(activeDetailTab === 'allocatable' ? null : 'allocatable')}
              className={`p-2 rounded-xl border flex flex-col text-left transition cursor-pointer ${
                activeDetailTab === 'allocatable'
                  ? 'ring-1 ring-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] ' + (accounting.safelyAllocatableMinutes > 0 ? 'bg-emerald-500/25 border-emerald-400' : 'bg-rose-500/25 border-rose-400')
                  : accounting.safelyAllocatableMinutes > 0 
                    ? 'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold flex items-center gap-1 ${
                  accounting.safelyAllocatableMinutes > 0 ? 'text-emerald-300' : 'text-rose-400'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    accounting.safelyAllocatableMinutes > 0 ? 'bg-emerald-400' : 'bg-rose-400'
                  }`} />
                  ALLOCATABLE
                </span>
                <ChevronDown className={`h-3 w-3 ${accounting.safelyAllocatableMinutes > 0 ? 'text-emerald-400' : 'text-rose-400'} transition-transform ${activeDetailTab === 'allocatable' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.safelyAllocatableMinutes)}
              </span>
              <span className="text-[9px] text-zinc-500">Safely Available</span>
            </button>
          </div>

          {/* INTERACTIVE BREAKDOWN ACCORDION / DRAWER */}
          <AnimatePresence>
            {activeDetailTab && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-[#0c1018] border border-white/10 rounded-xl space-y-2.5 text-xs font-mono">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                      {activeDetailTab === 'used' && <Activity className="h-3.5 w-3.5 text-emerald-400" />}
                      {activeDetailTab === 'committed' && <Clock className="h-3.5 w-3.5 text-amber-400" />}
                      {activeDetailTab === 'required' && <RubElHizbIcon className="h-3.5 w-3.5 text-cyan-400" />}
                      {activeDetailTab === 'allocatable' && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                      {activeDetailTab === 'explainer' && <HelpCircle className="h-3.5 w-3.5 text-amber-400" />}

                      {activeDetailTab === 'used' && 'INVESTED / USED TIME BREAKDOWN'}
                      {activeDetailTab === 'committed' && 'COMMITTED QUESTS (TODAY SCHEDULED)'}
                      {activeDetailTab === 'required' && 'REQUIRED BASELINE (WORSHIP & VITAL ROUTINES)'}
                      {activeDetailTab === 'allocatable' && 'CAPITAL SOLVENCY EQUATION'}
                      {activeDetailTab === 'explainer' && 'TEMPORAL CONTROL SYSTEM & DAILY RESET GUIDE'}
                    </span>
                    <button
                      onClick={() => setActiveDetailTab(null)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* 1. USED DETAIL */}
                  {activeDetailTab === 'used' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Timer Focus Sessions (Today):</span>
                        <span className="text-emerald-400 font-bold">{accounting.breakdown?.focusMinutes || 0}m</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Quests Completed Today ({accounting.breakdown?.completedQuestsList.length || 0}):</span>
                        <span className="text-emerald-400 font-bold">{accounting.breakdown?.completedQuestMinutes || 0}m</span>
                      </div>

                      {accounting.breakdown?.completedQuestsList && accounting.breakdown.completedQuestsList.length > 0 ? (
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1 pt-1">
                          {accounting.breakdown.completedQuestsList.map(q => (
                            <div key={q.id} className="flex justify-between items-center p-1.5 rounded bg-white/5 text-[11px]">
                              <span className="text-zinc-300 truncate max-w-[75%]">✓ {q.title}</span>
                              <span className="text-emerald-300 font-bold">{q.minutes}m</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic">No quests marked completed yet today on this date.</p>
                      )}

                      <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 leading-relaxed">
                        💡 <em>Daily Rule:</em> Resets to 0m at 00:00 midnight. Past days' work is archived in XP history and does not consume today's capital.
                      </div>
                    </div>
                  )}

                  {/* 2. COMMITTED DETAIL */}
                  {activeDetailTab === 'committed' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Active Quests Scheduled For Today:</span>
                        <span className="text-amber-400 font-bold">{accounting.committedMinutes}m ({accounting.breakdown?.activeQuestsList.length || 0} items)</span>
                      </div>

                      {accounting.breakdown?.activeQuestsList && accounting.breakdown.activeQuestsList.length > 0 ? (
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 pt-1">
                          {accounting.breakdown.activeQuestsList.map(q => (
                            <div key={q.id} className="flex justify-between items-center p-1.5 rounded bg-white/5 text-[11px]">
                              <div className="flex items-center gap-1.5 truncate max-w-[75%]">
                                {q.priority && (
                                  <span className={`px-1 rounded text-[9px] uppercase font-bold ${
                                    q.priority === 'High' ? 'bg-rose-500/20 text-rose-300' :
                                    q.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {q.priority}
                                  </span>
                                )}
                                <span className="text-zinc-300 truncate">{q.title}</span>
                              </div>
                              <span className="text-amber-300 font-bold">{q.minutes}m</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic">No active quests scheduled for today. Your committed queue is clear!</p>
                      )}

                      <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 leading-relaxed">
                        💡 <em>Dynamic Commitment:</em> As you complete or reschedule directives, this number decreases and instantly frees up Safely Allocatable capacity.
                      </div>
                    </div>
                  )}

                  {/* 3. REQUIRED DETAIL */}
                  {activeDetailTab === 'required' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-300">
                        Non-negotiable essential floor reserved for biological & spiritual vitality:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                        <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
                          <span className="text-cyan-300 font-bold block">5 Obligatory Prayers</span>
                          <span className="text-zinc-400 text-[10px]">Fajr to Isha + Sunan: ~45m</span>
                        </div>
                        <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
                          <span className="text-cyan-300 font-bold block">Prophetic Adhkār</span>
                          <span className="text-zinc-400 text-[10px]">Morning, Evening & Post-Salah: ~20m</span>
                        </div>
                        <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
                          <span className="text-cyan-300 font-bold block">Meals, Wudu & Hygiene</span>
                          <span className="text-zinc-400 text-[10px]">Essential bodily maintenance: ~25m</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-zinc-200">
                        <span>Total Baseline Reserved:</span>
                        <span className="text-cyan-300">{accounting.requiredMinutes}m (Adjustable in Settings)</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400 leading-relaxed">
                        💡 <em>Why this exists:</em> Planning a 16-hour workday without accounting for prayers and meals is fictitious planning. This baseline protects your obligations automatically.
                      </div>
                    </div>
                  )}

                  {/* 4. ALLOCATABLE DETAIL */}
                  {activeDetailTab === 'allocatable' && (
                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded bg-zinc-900 border border-white/10 space-y-1.5">
                        <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Solvency Balance Sheet:</div>
                        <div className="flex justify-between text-zinc-300">
                          <span>Waking Capital ({state.profile.dailyWakingHours || 16}h):</span>
                          <span className="font-bold text-zinc-100">+{accounting.wakingCapitalMinutes}m</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>− Invested / Used Today:</span>
                          <span>−{accounting.usedMinutes}m</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>− Committed (Today's Quests):</span>
                          <span>−{accounting.committedMinutes}m</span>
                        </div>
                        <div className="flex justify-between text-cyan-400">
                          <span>− Required Obligations Baseline:</span>
                          <span>−{accounting.requiredMinutes}m</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>− Protected Safety Buffer ({accounting.protectedBufferPercent}%):</span>
                          <span>−{accounting.protectedBufferMinutes}m</span>
                        </div>
                        <div className="border-t border-white/10 pt-1 flex justify-between font-bold text-sm">
                          <span className={accounting.safelyAllocatableMinutes > 0 ? 'text-emerald-300' : 'text-rose-300'}>
                            = Safely Allocatable:
                          </span>
                          <span className={accounting.safelyAllocatableMinutes > 0 ? 'text-emerald-300' : 'text-rose-300'}>
                            {formatMins(accounting.safelyAllocatableMinutes)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        This is the true honest capacity you can assign to new tasks without risking deficit, missing prayer, or eroding sleep.
                      </p>
                    </div>
                  )}

                  {/* 5. EXPLAINER GUIDE */}
                  {activeDetailTab === 'explainer' && (
                    <div className="space-y-3 text-[11px] text-zinc-300 leading-relaxed">
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                        <span className="font-bold text-emerald-300 block flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                          HOW DOES THE DAILY RESET WORK?
                        </span>
                        <p className="text-zinc-300">
                          Every midnight (<strong>00:00 AM local time</strong>), the engine automatically performs a cycle turnover:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1 text-[10px]">
                          <li><strong>Waking Capital (Ra's al-Māl):</strong> Fully resets to your chosen waking hours (default 16h = 960m). Time cannot be saved or hoarded across days.</li>
                          <li><strong>Used Time:</strong> Resets to 0m. Tracks fresh focus and completed tasks for the new calendar day.</li>
                          <li><strong>Committed Time:</strong> Dynamically recalculates based exclusively on active directives scheduled for the new date.</li>
                          <li><strong>Daily Rest Allowance (90m):</strong> Resets to full. This is your non-cumulative daily rest entitlement.</li>
                          <li><strong>Permanent Rest Bank (Credits):</strong> Preserved! Earned rest equity never expires and stays in your account indefinitely.</li>
                        </ul>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10 space-y-1">
                        <span className="font-bold text-amber-300 block flex items-center gap-1.5">
                          <Hourglass className="h-3.5 w-3.5 text-amber-400" />
                          WHY ARE METRICS STRUCTURED THIS WAY?
                        </span>
                        <p className="text-zinc-400 text-[10px]">
                          Pale Ore OS replaces the illusion of &ldquo;infinite calendar slots&rdquo; with honest financial-grade temporal accounting. If your day shows <strong>Tight</strong> or <strong>Deficit</strong>, it means you have committed more than a human can sustainably perform today without stealing from sleep, worship, or health.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overdraft or Tight Margin Notice */}
          {accounting.isOverdrawn && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                <strong>Deficit Alert:</strong> Day is over-allocated by +{formatMins(accounting.overdraftMinutes)}. Defer lower-priority tasks to preserve sleep and tomorrow's vigor.
              </span>
            </div>
          )}

          {!accounting.isOverdrawn && accounting.status === 'TIGHT' && (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>
                <strong>Tight Capacity:</strong> Only {formatMins(accounting.rawAvailableMinutes)} raw uncommitted time remains before eating into the {formatMins(accounting.protectedBufferMinutes)} safety buffer.
              </span>
            </div>
          )}

          {/* App Overdraft Lock Notice */}
          {usageBlocker.isBlocked && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  <strong>Rest Blocked:</strong> Limit for &ldquo;{usageBlocker.appName}&rdquo; exceeded by +{usageBlocker.overdraftMinutes}m.
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('time_ledger')}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 border border-rose-500/40 transition shrink-0 font-bold"
                >
                  View Ledger
                </button>
              )}
            </div>
          )}
        </div>

        {/* COLUMN 3: DUAL REST METRICS (PERMANENT BANK & DAILY ALLOWANCE) */}
        <div className="glass-panel p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-[#0c1018] to-[#121927] flex flex-col justify-between relative shadow-md">
          <div className="space-y-3">
            {/* 1. Permanent Rest Bank Balance */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400 font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Moon className="h-3 w-3" />
                  PERMANENT REST BANK
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  EQUITY
                </span>
              </div>

              <div className="pt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  {state.profile.timeCredits ?? 60}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400/80">
                  MINUTES
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Earned via focused work & quest victories. Never expires.
              </p>
            </div>

            {/* 2. Daily Rest Allowance Gauge */}
            <div className="border-t border-white/10 pt-2.5 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-400 uppercase font-semibold">DAILY REST ALLOWANCE</span>
                <span className="text-teal-300 font-bold">{dailyRest.restConsumedToday} / {dailyRest.dailyAllowanceMinutes}m</span>
              </div>
              
              <div className="w-full bg-[#0b0e14] rounded-full h-2 overflow-hidden border border-white/10 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    dailyRest.restConsumedToday > dailyRest.dailyAllowanceMinutes ? 'bg-rose-400' : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((dailyRest.restConsumedToday / dailyRest.dailyAllowanceMinutes) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>{formatMins(dailyRest.remainingAllowance)} left today</span>
                <span>{accounting.temporalEfficiencyPercent}% Efficiency</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => {
                if (usageBlocker.isBlocked) {
                  onNavigate?.('time_ledger');
                } else {
                  setIsQuickRedeemOpen(true);
                }
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1 shadow-sm ${
                usageBlocker.isBlocked
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              }`}
              title={usageBlocker.isBlocked ? `Rest pass locked: ${usageBlocker.appName} exceeded limit` : "Start an intentional rest block"}
            >
              {usageBlocker.isBlocked ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>REST LOCKED</span>
                </>
              ) : (
                <>
                  <Coffee className="h-3.5 w-3.5" />
                  <span>START REST</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate?.('shop')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#c5a059]/20 text-zinc-300 hover:text-[#fef08a] border border-white/10 hover:border-[#c5a059]/40 transition"
              title="Browse Leisure Vouchers in Imperial Vault"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* QUICK REDEEM REST BLOCK MODAL */}
      <AnimatePresence>
        {isQuickRedeemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0d1017] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Coffee className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold font-serif text-zinc-100">
                    Redeem Active Rest Block
                  </h4>
                </div>
                <button
                  onClick={() => setIsQuickRedeemOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs font-mono text-zinc-300 flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                <div>
                  Bank: <span className="text-emerald-400 font-bold">{state.profile.timeCredits ?? 60}m</span>
                </div>
                <div>
                  Today's Allowance: <span className="text-teal-400 font-bold">{dailyRest.remainingAllowance}m</span>
                </div>
              </div>

              {/* Preset Block Choices */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Quick Coffee & Dhikr', mins: 15, icon: '☕', category: 'restorative' as RestCategory },
                  { title: 'Sunnah Qaylulah (Nap)', mins: 25, icon: '😴', category: 'restorative' as RestCategory },
                  { title: 'Intentional Leisure Block', mins: 45, icon: '🍿', category: 'leisure' as RestCategory },
                  { title: 'Deep Recreation Voucher', mins: 60, icon: '🎮', category: 'recreation' as RestCategory }
                ].map(preset => {
                  const hasBank = (state.profile.timeCredits ?? 60) >= preset.mins;
                  const hasAllowance = preset.category === 'restorative' || dailyRest.remainingAllowance >= preset.mins;
                  const canRedeem = hasBank && hasAllowance;

                  return (
                    <button
                      key={preset.mins}
                      disabled={!canRedeem}
                      onClick={() => handleLaunchRest(preset.title, preset.mins)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                        canRedeem
                          ? 'bg-[#141926] hover:bg-emerald-500/15 border-white/10 hover:border-emerald-500/40 cursor-pointer text-zinc-200'
                          : 'bg-white/5 border-transparent opacity-40 cursor-not-allowed text-zinc-500'
                      }`}
                    >
                      <div className="flex justify-between items-center text-sm">
                        <span>{preset.icon}</span>
                        <span className="font-mono font-bold text-xs text-emerald-400">{preset.mins}m</span>
                      </div>
                      <span className="text-[11px] font-serif mt-2 font-medium leading-tight line-clamp-2">
                        {preset.title}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">
                        {preset.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Minutes Input */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="text-[11px] font-mono text-zinc-400 block">
                  Or Custom Duration:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="Rest Activity Title"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    min={5}
                    max={state.profile.timeCredits ?? 60}
                    value={customMinutes}
                    onChange={e => setCustomMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200 text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-mono text-zinc-400">m</span>
                </div>

                <button
                  disabled={(state.profile.timeCredits ?? 60) < customMinutes}
                  onClick={() => handleLaunchRest(customTitle || 'Custom Rest Block', customMinutes)}
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
                    (state.profile.timeCredits ?? 60) >= customMinutes
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/10 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Launch {customMinutes}m Rest Block</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

