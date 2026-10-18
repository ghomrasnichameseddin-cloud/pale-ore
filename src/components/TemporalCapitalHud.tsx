import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    startActiveRestSession,
    addTimeCredits,
    liquidateTimeDeficitWithCoins
  } = usePOS();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isQuickRedeemOpen, setIsQuickRedeemOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'used' | 'committed' | 'required' | 'allocatable' | 'explainer' | null>(null);
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [customTitle, setCustomTitle] = useState<string>('Mindful Breathing & Qaylulah');
  const [customCategory, setCustomCategory] = useState<RestCategory>('restorative');

  useEffect(() => {
    if (!isQuickRedeemOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickRedeemOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickRedeemOpen]);

  const accounting = getTemporalAccounting();
  const dailyRest = getDailyRestState();
  const currentHours = state.profile.dailyWakingHours || 16;
  const currentBufferPercent = state.profile.protectedBufferPercent ?? DEFAULT_PROTECTED_BUFFER_PERCENT;
  const currentDailyAllowance = state.profile.dailyRestAllowanceMinutes ?? DEFAULT_DAILY_REST_ALLOWANCE_MINUTES;
  const currentRequiredBaseline = state.profile.requiredMinutesBaseline ?? DEFAULT_REQUIRED_MINUTES_BASELINE;
  const usageBlocker = getActiveUsageBlocker(state.appUsageLimits || [], state.appUsageLogs || [], state.systemDate);

  // Format minutes into hours + mins
  const formatMins = (m: number) => {
    const isNeg = m < 0;
    const abs = Math.abs(m);
    const hrs = Math.floor(abs / 60);
    const mins = abs % 60;
    const sign = isNeg ? '-' : '';
    if (hrs === 0) return `${sign}${mins}m`;
    return mins === 0 ? `${sign}${hrs}h` : `${sign}${hrs}h ${mins}m`;
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
        <div className="md:col-span-2 space-y-2.5 min-w-0">
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
                  INVESTED (DONE)
                </span>
                <ChevronDown className={`h-3 w-3 text-emerald-400 transition-transform ${activeDetailTab === 'used' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.usedMinutes)}
              </span>
              <span className="text-[9px] text-zinc-400">Focus + Done Today</span>
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
              <span className="text-[9px] text-zinc-400">Active Quests Today</span>
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
                  REQUIRED BASELINE
                </span>
                <ChevronDown className={`h-3 w-3 text-cyan-400 transition-transform ${activeDetailTab === 'required' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.requiredMinutes)}
              </span>
              <span className="text-[9px] text-zinc-400">5 Salah & Essentials</span>
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
                  SAFELY ALLOCATABLE
                </span>
                <ChevronDown className={`h-3 w-3 ${accounting.safelyAllocatableMinutes > 0 ? 'text-emerald-400' : 'text-rose-400'} transition-transform ${activeDetailTab === 'allocatable' ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(accounting.safelyAllocatableMinutes)}
              </span>
              <span className="text-[9px] text-zinc-400">Safe Work Capacity</span>
            </button>
          </div>

          {/* Mathematical Equation Banner */}
          <div className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-zinc-300 font-bold uppercase">Equation:</span>
              <span className="text-zinc-200">{totalWaking}m Waking</span>
              <span>=</span>
              <span className="text-emerald-400 font-bold">{accounting.usedMinutes}m Done</span>
              <span>+</span>
              <span className="text-amber-400 font-bold">{accounting.committedMinutes}m Active</span>
              <span>+</span>
              <span className="text-cyan-400 font-bold">{accounting.requiredMinutes}m Salah</span>
              <span>+</span>
              <span className="text-zinc-300 font-bold">{accounting.protectedBufferMinutes}m Buffer ({currentBufferPercent}%)</span>
              <span>+</span>
              <span className={`font-bold ${accounting.safelyAllocatableMinutes > 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                {accounting.safelyAllocatableMinutes}m Free
              </span>
            </div>
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
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 min-w-0">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span className="min-w-0 break-words leading-relaxed">
                <strong>Deficit Alert:</strong> Day is over-allocated by +{formatMins(accounting.overdraftMinutes)}. Defer lower-priority tasks to preserve sleep and tomorrow's vigor.
              </span>
            </div>
          )}

          {!accounting.isOverdrawn && accounting.status === 'TIGHT' && (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 min-w-0">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="min-w-0 break-words">
                <strong>Tight Capacity:</strong> Only {formatMins(accounting.rawAvailableMinutes)} raw uncommitted time remains before eating into the {formatMins(accounting.protectedBufferMinutes)} safety buffer.
              </span>
            </div>
          )}

          {/* App Overdraft Lock Notice */}
          {usageBlocker.isBlocked && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="min-w-0 break-words">
                  <strong>Rest Blocked:</strong> Limit for &ldquo;{usageBlocker.appName}&rdquo; exceeded by +{usageBlocker.overdraftMinutes}m.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 3: DUAL REST METRICS (PERMANENT BANK & DAILY ALLOWANCE) */}
        {(() => {
          const isBankInDeficit = (state.profile.timeCredits ?? 60) < 0;
          const deficitMinutes = isBankInDeficit ? Math.abs(state.profile.timeCredits ?? 60) : 0;
          const currentCoins = state.profile.coins ?? 150;
          const canAffordFullCoins = currentCoins >= deficitMinutes;
          const isDailyInOverdraft = dailyRest.restConsumedToday > dailyRest.dailyAllowanceMinutes;

          return (
            <div 
              className={`glass-panel p-3.5 rounded-xl border flex flex-col justify-between relative shadow-md min-w-0 overflow-hidden transition-all ${
                isBankInDeficit
                  ? 'border-rose-500/40 bg-gradient-to-br from-[#160d13]/95 via-[#1a0e16]/90 to-[#261019]/90 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  : 'border-emerald-500/30 bg-gradient-to-br from-[#0c1018] to-[#121927]'
              }`}
            >
              <div className="space-y-3 min-w-0">
                {/* 1. Permanent Rest Bank Balance */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono uppercase text-zinc-400 font-bold min-w-0">
                    <span className={`${isBankInDeficit ? 'text-rose-400' : 'text-emerald-400'} flex items-center gap-1 shrink-0`}>
                      <Moon className="h-3 w-3 shrink-0" />
                      <span>PERMANENT REST BANK</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 tracking-wider ${
                      isBankInDeficit
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isBankInDeficit ? 'OVERDRAFT / DEFICIT' : 'EQUITY'}
                    </span>
                  </div>

                  <div className="pt-0.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1.5 min-w-0">
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                      <span className={`text-2xl font-mono font-black tracking-tight ${
                        isBankInDeficit
                          ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      }`}>
                        {state.profile.timeCredits ?? 60}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                        isBankInDeficit ? 'text-rose-400 font-semibold' : 'text-emerald-400/80'
                      }`}>
                        {isBankInDeficit ? 'MIN (DEFICIT)' : 'MINUTES'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-auto">
                      <button
                        onClick={() => addTimeCredits(15, 'Manual Rest Bank addition')}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition cursor-pointer font-bold ${
                          isBankInDeficit
                            ? 'text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40'
                            : 'text-emerald-400 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                        title="Add +15m to Rest Bank"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => addTimeCredits(30, 'Manual Rest Bank addition')}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition cursor-pointer font-bold ${
                          isBankInDeficit
                            ? 'text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40'
                            : 'text-emerald-400 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                        title="Add +30m to Rest Bank"
                      >
                        +30m
                      </button>
                    </div>
                  </div>

                  {isBankInDeficit ? (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[10px] text-rose-200 leading-tight space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1 font-bold text-rose-300 uppercase tracking-wide">
                          <AlertOctagon className="h-3 w-3 shrink-0 text-rose-400" />
                          <span>Temporal Overdraft Active</span>
                        </div>
                        <span className="font-mono text-[9px] text-[#fef08a] bg-[#3a2e12] px-1.5 py-0.5 rounded border border-[#c5a059]/40 font-bold shrink-0">
                          🪙 {currentCoins} coins
                        </span>
                      </div>

                      <p className="text-zinc-300 break-words leading-relaxed text-[10px]">
                        <strong className="text-rose-300 font-mono">+{deficitMinutes}m</strong> deficit must be repaid via focus sessions or replaced with coins to unlock rest.
                      </p>

                      {/* LIQUIDATE DEFICIT WITH COINS ACTION */}
                      <button
                        type="button"
                        onClick={() => {
                          if (canAffordFullCoins) {
                            liquidateTimeDeficitWithCoins();
                          } else if (currentCoins > 0) {
                            liquidateTimeDeficitWithCoins({ partialIfInsufficient: true });
                          }
                        }}
                        disabled={currentCoins === 0}
                        className={`w-full py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold transition flex items-center justify-between shadow-sm cursor-pointer ${
                          canAffordFullCoins
                            ? 'bg-gradient-to-r from-amber-600/35 via-yellow-500/30 to-amber-600/35 hover:from-amber-600/50 hover:to-yellow-500/45 text-[#fef08a] border border-[#c5a059]/60 shadow-[0_0_15px_rgba(197,160,89,0.25)]'
                            : currentCoins > 0
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                              : 'bg-zinc-800/40 text-zinc-500 border border-white/10 cursor-not-allowed'
                        }`}
                        title={
                          canAffordFullCoins
                            ? `Spend ${deficitMinutes} coins to reset deficit to 0 min`
                            : currentCoins > 0
                              ? `Spend ${currentCoins} coins to reduce deficit by ${currentCoins}m`
                              : `Need ${deficitMinutes} coins to clear deficit`
                        }
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>🪙</span>
                          <span>{canAffordFullCoins ? 'REPLACE WITH COINS' : `REDUCE (-${currentCoins}m)`}</span>
                        </span>
                        <span className="bg-[#05070d] px-1.5 py-0.5 rounded text-[9px] border border-[#c5a059]/40 text-[#fef08a] font-mono font-black shrink-0 ml-1">
                          {canAffordFullCoins ? `-${deficitMinutes} 🪙 → 0 MIN` : `-${currentCoins} 🪙`}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 leading-tight break-words">
                      Earned via focus timer sessions (+10m/25m sprint) & quest victories. Never expires.
                    </p>
                  )}
                </div>

                {/* 2. Daily Rest Allowance Gauge */}
                <div className="border-t border-white/10 pt-2.5 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono min-w-0">
                    <span className="text-zinc-400 uppercase font-semibold shrink-0">DAILY REST ALLOWANCE</span>
                    <span className={`font-bold shrink-0 ${isDailyInOverdraft ? 'text-rose-400' : 'text-teal-300'}`}>
                      {dailyRest.restConsumedToday} / {dailyRest.dailyAllowanceMinutes}m
                      {isDailyInOverdraft && (
                        <span className="ml-1 text-rose-400 text-[9px] font-mono">(+{dailyRest.restConsumedToday - dailyRest.dailyAllowanceMinutes}m over)</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="w-full bg-[#0b0e14] rounded-full h-2 overflow-hidden border border-white/10 p-0.5 min-w-0">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDailyInOverdraft ? 'bg-rose-400' : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((dailyRest.restConsumedToday / dailyRest.dailyAllowanceMinutes) * 100))}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] font-mono text-zinc-500 min-w-0">
                    <span className={`shrink-0 ${dailyRest.remainingAllowance < 0 ? 'text-rose-400 font-bold' : ''}`}>
                      {dailyRest.remainingAllowance < 0 
                        ? `${formatMins(dailyRest.remainingAllowance)} overdraft today` 
                        : `${formatMins(dailyRest.remainingAllowance)} left today`}
                    </span>
                    <span className="shrink-0">{accounting.temporalEfficiencyPercent}% Efficiency</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 min-w-0">
                <button
                  onClick={() => {
                    if (usageBlocker.isBlocked) return;
                    if (isBankInDeficit) {
                      if (canAffordFullCoins) {
                        liquidateTimeDeficitWithCoins();
                      } else if (currentCoins > 0) {
                        liquidateTimeDeficitWithCoins({ partialIfInsufficient: true });
                      }
                      return;
                    }
                    setIsQuickRedeemOpen(true);
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1 shadow-sm min-w-0 ${
                    usageBlocker.isBlocked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed opacity-90'
                      : isBankInDeficit
                        ? canAffordFullCoins
                          ? 'bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 text-[#fef08a] border border-[#c5a059]/60 cursor-pointer shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-pointer opacity-90'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer'
                  }`}
                  title={
                    usageBlocker.isBlocked 
                      ? `Rest pass locked: ${usageBlocker.appName} exceeded limit` 
                      : isBankInDeficit
                        ? canAffordFullCoins
                          ? `Click to spend ${deficitMinutes} coins and reset Permanent Rest Bank to 0 min!`
                          : `Deficit active (${deficitMinutes}m). Need ${deficitMinutes} coins to reset to 0 min.`
                        : "Start an intentional rest block"
                  }
                >
                  {usageBlocker.isBlocked ? (
                    <>
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">REST LOCKED</span>
                    </>
                  ) : isBankInDeficit ? (
                    canAffordFullCoins ? (
                      <>
                        <span>🪙</span>
                        <span className="truncate">RESET TO 0M (-{deficitMinutes} 🪙)</span>
                      </>
                    ) : (
                      <>
                        <AlertOctagon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                        <span className="truncate">DEFICIT LOCKED (+{deficitMinutes}m)</span>
                      </>
                    )
                  ) : (
                    <>
                      <Coffee className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">START REST</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onNavigate?.('shop')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-[#c5a059]/20 text-zinc-300 hover:text-[#fef08a] border border-white/10 hover:border-[#c5a059]/40 transition shrink-0 cursor-pointer"
                  title="Browse Leisure Vouchers in Imperial Vault"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })()}

      </div>

      {/* QUICK REDEEM REST BLOCK MODAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isQuickRedeemOpen && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsQuickRedeemOpen(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-[#0d1017] border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.2)] relative space-y-4 max-h-[92vh] overflow-y-auto my-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Coffee className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-serif text-zinc-100 flex items-center gap-1.5">
                        <RubElHizbIcon className="h-2.5 w-2.5 text-[#c5a059]" />
                        <span>Redeem Active Rest Block</span>
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-400">
                        Intentional Guilt-Free Restoration
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsQuickRedeemOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    title="Close window (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs font-mono text-zinc-300 flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400 text-[11px]">Bank:</span>
                    <span className={`font-bold ${(state.profile.timeCredits ?? 60) < 0 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}`}>
                      {state.profile.timeCredits ?? 60}m {(state.profile.timeCredits ?? 60) < 0 ? '(Deficit)' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400 text-[11px]">Today's Allowance:</span>
                    <span className={`font-bold ${dailyRest.remainingAllowance < 0 ? 'text-rose-400 font-mono' : 'text-teal-400 font-mono'}`}>
                      {dailyRest.remainingAllowance}m {dailyRest.remainingAllowance < 0 ? '(Deficit)' : ''}
                    </span>
                  </div>
                </div>

                {/* Deficit Liquidation Option if Bank in Deficit */}
                {(state.profile.timeCredits ?? 60) < 0 && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-rose-300">
                      <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400" />
                      <span className="text-[11px] font-bold">
                        Deficit: {Math.abs(state.profile.timeCredits ?? 60)}m
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => liquidateTimeDeficitWithCoins({ partialIfInsufficient: true })}
                      disabled={(state.profile.coins ?? 150) === 0}
                      className="px-2.5 py-1 bg-gradient-to-r from-amber-600/40 to-yellow-600/40 hover:from-amber-600/60 hover:to-yellow-600/60 text-[#fef08a] border border-[#c5a059]/60 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                      title="Replace deficit with coins and reset to 0 min"
                    >
                      <span>🪙</span>
                      <span>
                        {(state.profile.coins ?? 150) >= Math.abs(state.profile.timeCredits ?? 60)
                          ? `Pay ${Math.abs(state.profile.timeCredits ?? 60)} 🪙 → 0 MIN`
                          : `Pay ${state.profile.coins ?? 150} 🪙 (-${state.profile.coins ?? 150}m)`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Preset Block Choices */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                    Recommended Rest Protocols
                  </span>
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
                              ? 'bg-[#141926] hover:bg-emerald-500/15 border-white/10 hover:border-emerald-500/40 cursor-pointer text-zinc-200 shadow-sm'
                              : 'bg-white/5 border-transparent opacity-40 cursor-not-allowed text-zinc-500'
                          }`}
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-base">{preset.icon}</span>
                            <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">{preset.mins}m</span>
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
                </div>

                {/* Custom Minutes Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if ((state.profile.timeCredits ?? 60) >= customMinutes) {
                      handleLaunchRest(customTitle.trim() || 'Custom Rest Block', customMinutes);
                    }
                  }}
                  className="pt-3 border-t border-white/10 space-y-2.5"
                >
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                    Custom Duration Protocol
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      placeholder="Rest Activity Title"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <input
                      type="number"
                      min={5}
                      max={Math.max(5, state.profile.timeCredits ?? 60)}
                      value={customMinutes}
                      onChange={e => setCustomMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                      className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs font-mono text-zinc-200 text-center focus:outline-none focus:border-emerald-500 transition"
                    />
                    <span className="text-xs font-mono text-zinc-400 font-bold">m</span>
                  </div>

                  <button
                    type="submit"
                    disabled={(state.profile.timeCredits ?? 60) < customMinutes || (state.profile.timeCredits ?? 60) <= 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                      (state.profile.timeCredits ?? 60) >= customMinutes && (state.profile.timeCredits ?? 60) > 0
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'bg-white/10 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Coffee className="h-3.5 w-3.5" />
                    <span>Launch {customMinutes}m Rest Block</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

