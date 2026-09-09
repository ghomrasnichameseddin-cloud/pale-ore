import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hourglass, Clock, Search, Filter, ArrowDownRight, ArrowUpRight, 
  Download, Plus, RefreshCw, Moon, Coffee, ShieldAlert, Sparkles,
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Zap, Check,
  Play, Flame, BarChart3, Info
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { TimeTransaction, TimeTransactionType, RestPass, LeisureTransaction } from '../types';
import { RubElHizbIcon, GeometricDivider } from './IslamicRpgDecorations';
import { getLocalDateString, addDays, parseDateSafe } from '../utils/dateUtils';
import { 
  evaluateTodayRestDecision, 
  DEFAULT_REST_PASSES,
  REST_DECISION_THRESHOLDS 
} from '../utils/temporalLedger';

interface TemporalLedgerViewProps {
  onNavigate?: (tab: string) => void;
}

export const TemporalLedgerView: React.FC<TemporalLedgerViewProps> = ({ onNavigate }) => {
  const { state, addTimeCredits, redeemRestPass, getDailyWakingCapital } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TimeTransactionType>('ALL');
  const [natureFilter, setNatureFilter] = useState<'ALL' | 'GAINS' | 'SPENT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState(false);
  const [selectedPassForRedeem, setSelectedPassForRedeem] = useState<RestPass | null>(null);

  // Calibrate Form State
  const [calibrateMinutes, setCalibrateMinutes] = useState<number>(30);
  const [calibrateNature, setCalibrateNature] = useState<'GRANT' | 'DEDUCT'>('GRANT');
  const [calibrateReason, setCalibrateReason] = useState('');

  const transactions: LeisureTransaction[] = (state.timeHistory || []) as LeisureTransaction[];
  const profile = state.profile;
  const currentCredits = profile.timeCredits ?? 60;
  const currentCoins = profile.coins ?? 150;
  const todayKey = state.systemDate || getLocalDateString();

  // Waking Capital & Overdraft Alarm
  const wakingCapital = getDailyWakingCapital ? getDailyWakingCapital() : {
    budgetMinutes: (profile.dailyWakingHours || 16) * 60,
    investedMinutes: profile.focusMinutesToday || 0,
    committedMinutes: 0,
    slackMinutes: (profile.dailyWakingHours || 16) * 60 - (profile.focusMinutesToday || 0),
    isOverdrawn: false,
    overdraftMinutes: 0,
    utilizationPercent: 0
  };

  // Today's Decision calculation
  const todayTransactions = transactions.filter(tx => tx.timestamp.startsWith(todayKey));
  const todayMinted = todayTransactions.reduce((sum, tx) => {
    const val = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;
    return sum + (val > 0 ? val : 0);
  }, 0);
  const todaySpent = todayTransactions.reduce((sum, tx) => {
    const val = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;
    return sum + (val < 0 ? Math.abs(val) : 0);
  }, 0);
  const todayNet = todayMinted - todaySpent;
  const todayDecision = evaluateTodayRestDecision(todayMinted, todaySpent);

  // 7-day Recovery Rhythm (bucketing by day)
  const weeklyRestTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const key = addDays(todayKey, -(6 - index));
      const date = parseDateSafe(key);
      const dayTransactions = transactions.filter(tx => tx.timestamp.startsWith(key));
      const minted = dayTransactions.reduce((sum, tx) => {
        const val = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;
        return sum + (val > 0 ? val : 0);
      }, 0);
      const spent = dayTransactions.reduce((sum, tx) => {
        const val = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;
        return sum + (val < 0 ? Math.abs(val) : 0);
      }, 0);
      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        dateKey: key,
        minted,
        spent,
        net: minted - spent
      };
    });
  }, [transactions, todayKey]);

  const weeklySpent = weeklyRestTrend.reduce((sum, day) => sum + day.spent, 0);
  const weeklyMinted = weeklyRestTrend.reduce((sum, day) => sum + day.minted, 0);
  const recoverySignal = weeklySpent > weeklyMinted && weeklySpent > 0;

  // Filtered & Sorted Transactions (Audit trail list only grows)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const delta = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;

      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesReason = (tx.reason || '').toLowerCase().includes(term);
        const matchesType = (tx.type || '').toLowerCase().includes(term);
        const matchesLinked = ((tx.linkedId || tx.relatedId || '')).toLowerCase().includes(term);
        if (!matchesReason && !matchesType && !matchesLinked) return false;
      }

      // Nature filter
      if (natureFilter === 'GAINS' && delta <= 0) return false;
      if (natureFilter === 'SPENT' && delta >= 0) return false;

      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

      return true;
    });
  }, [transactions, searchTerm, natureFilter, typeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Badge helper
  const getTypeBadge = (type: TimeTransactionType) => {
    switch (type) {
      case 'focus_mint':
        return { label: 'FOCUS HARVEST', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: Zap };
      case 'quest_dividend':
        return { label: 'QUEST DIVIDEND', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30', icon: Sparkles };
      case 'ritual_reward':
        return { label: 'SACRED RITE', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: RubElHizbIcon };
      case 'leisure_redemption':
        return { label: 'REST REDEEMED', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', icon: Coffee };
      case 'rest_refund':
        return { label: 'REST REFUND', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', icon: RefreshCw };
      case 'time_debt_penalty':
        return { label: 'TIME DEBT', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: AlertTriangle };
      case 'manual_adjustment':
      default:
        return { label: 'CALIBRATION', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30', icon: Hourglass };
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Type', 'Minutes Delta', 'Ending Balance', 'Reason', 'Linked Reference'];
    const rows = filteredTransactions.map(tx => {
      const delta = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;
      const balance = tx.endingBalance !== undefined ? tx.endingBalance : tx.balanceAfter;
      const linked = tx.linkedId || tx.relatedId || '';
      return [
        `"${tx.id}"`,
        `"${tx.timestamp}"`,
        `"${tx.type}"`,
        delta,
        balance,
        `"${(tx.reason || '').replace(/"/g, '""')}"`,
        `"${linked.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `temporal_leisure_ledger_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyCalibration = () => {
    if (!calibrateReason.trim()) return;
    const finalMinutes = calibrateNature === 'GRANT' ? Math.abs(calibrateMinutes) : -Math.abs(calibrateMinutes);
    addTimeCredits(finalMinutes, `Operator Calibration: ${calibrateReason}`, 'manual_adjustment');
    setIsCalibrateModalOpen(false);
    setCalibrateReason('');
  };

  const handleQuickRedeemPass = (pass: RestPass) => {
    if (redeemRestPass) {
      redeemRestPass(pass);
    }
  };

  return (
    <div className="space-y-6" id="temporal-ledger-view">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              <span>TEMPORAL CURRENCY LEDGER</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              {filteredTransactions.length} RECORDS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100 tracking-wide mt-1">
            Temporal Ledger & Sacred Rest Bank
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans mt-0.5">
            Rest is earned capital, not stolen time. Deep work mints leisure credits; redeemed passes grant guilt-free, deliberate renewal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCalibrateModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#141824] hover:bg-[#1c2235] text-[#fef08a] border border-[#c5a059]/40 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>CALIBRATE TIME</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition flex items-center gap-1.5"
            title="Download CSV spreadsheet audit trail"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* OVERDRAFT ALARM (STEP 6: committed > budget − invested-so-far) */}
      {wakingCapital.isOverdrawn ? (
        <div className="glass-panel rounded-xl p-4 border border-rose-500/50 bg-rose-950/25 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tracking-wider text-rose-400 uppercase font-black">
                    OVERDRAFT ALARM TRIGGERED
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 font-mono font-bold">
                    +{wakingCapital.overdraftMinutes}m OVER BUDGET
                  </span>
                </div>
                <p className="text-xs text-rose-200 font-sans mt-1">
                  Committed tasks ({wakingCapital.committedMinutes}m) exceed remaining waking capacity ({Math.max(0, wakingCapital.budgetMinutes - wakingCapital.investedMinutes)}m). 
                  You are borrowing from tomorrow's sleep or essential rest. Rebalance your day now.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono text-xs border-t sm:border-t-0 border-rose-500/20 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[9px] text-zinc-400 uppercase block">Utilization</span>
                <span className="font-black text-rose-300">{wakingCapital.utilizationPercent}%</span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('quests')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[11px] font-bold transition"
                >
                  Trim Quests
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-3 sm:p-4 border border-white/10 bg-[#090d14] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-bold">
                  DAILY WAKING CAPITAL (BUDGET: {Math.round(wakingCapital.budgetMinutes / 60)}H)
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  SLACK: {wakingCapital.slackMinutes}M
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                Invested: <strong className="text-zinc-200">{wakingCapital.investedMinutes}m</strong> | Committed: <strong className="text-zinc-200">{wakingCapital.committedMinutes}m</strong> | Capacity Honored.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48 bg-black/40 h-2 rounded-full overflow-hidden border border-white/5 shrink-0">
            <div 
              className={`h-full transition-all duration-500 ${
                wakingCapital.utilizationPercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, wakingCapital.utilizationPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* TODAY'S REST DECISION WIDGET & 7-DAY RHYTHM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Widget 1: Today's Rest Decision */}
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-[#0b1016] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-emerald-400" />
                TODAY'S REST DECISION
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                todayDecision.status === 'deficit'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : todayDecision.status === 'generous'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : todayDecision.status === 'funded'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                      : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
              }`}>
                {todayDecision.headline}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {todayDecision.guidanceText}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-3 border-t border-white/5">
            <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
              <span className="block text-[9px] font-mono text-zinc-400 uppercase">Minted</span>
              <strong className="text-emerald-300 font-mono text-sm">+{todayMinted}m</strong>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
              <span className="block text-[9px] font-mono text-zinc-400 uppercase">Spent</span>
              <strong className="text-indigo-300 font-mono text-sm">-{todaySpent}m</strong>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
              <span className="block text-[9px] font-mono text-zinc-400 uppercase">Today Net</span>
              <strong className={`font-mono text-sm ${todayNet >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {todayNet >= 0 ? '+' : ''}{todayNet}m
              </strong>
            </div>
          </div>
        </div>

        {/* Widget 2: 7-Day Recovery Rhythm */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 bg-[#0b0e14] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase font-bold flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-zinc-400" />
                  7-DAY RECOVERY RHYTHM
                </span>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Recovery must synchronize with load, preventing debt from compounding unnoticed.
                </p>
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border self-start sm:self-auto ${
                recoverySignal 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {recoverySignal ? 'RECOVERY DEFICIT' : 'RHYTHM BALANCED'}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 items-end h-20 mt-3">
              {weeklyRestTrend.map(day => {
                const peak = Math.max(...weeklyRestTrend.map(item => Math.max(item.minted, item.spent)), 1);
                const mintedHeight = Math.max(6, Math.round((day.minted / peak) * 100));
                const spentHeight = Math.max(6, Math.round((day.spent / peak) * 100));
                const isToday = day.dateKey === todayKey;
                return (
                  <div key={day.dateKey} className="h-full flex flex-col items-center justify-end gap-1">
                    <div className="flex items-end gap-0.5 h-full w-full justify-center">
                      <div 
                        className={`w-2 rounded-t transition-all ${isToday ? 'bg-emerald-400' : 'bg-emerald-500/70'}`} 
                        style={{ height: `${mintedHeight}%` }} 
                        title={`${day.label}: Minted ${day.minted}m`} 
                      />
                      <div 
                        className={`w-2 rounded-t transition-all ${isToday ? 'bg-indigo-400' : 'bg-indigo-500/70'}`} 
                        style={{ height: `${spentHeight}%` }} 
                        title={`${day.label}: Spent ${day.spent}m`} 
                      />
                    </div>
                    <span className={`text-[9px] font-mono uppercase ${isToday ? 'text-emerald-300 font-bold' : 'text-zinc-500'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-3 border-t border-white/5 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>7D MINTED: <strong className="text-emerald-300">+{weeklyMinted}m</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              <span>7D SPENT: <strong className="text-indigo-300">-{weeklySpent}m</strong></span>
            </span>
          </div>
        </div>

      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Available Leisure Bank */}
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-[#0c1018] relative shadow-md">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
            <Moon className="h-3 w-3" />
            AVAILABLE REST BANK
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-emerald-300">
              {currentCredits}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400/70">MINS</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Guilt-free leisure currency ready to redeem
          </p>
        </div>

        {/* Card 2: Lifetime Deep Work Invested */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 bg-[#0d1017]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" />
            LIFETIME DEEP WORK
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-zinc-100">
              {profile.totalTimeInvested || 0}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">MINS ({Math.round(((profile.totalTimeInvested || 0) / 60) * 10) / 10}h)</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Total focused work blocks completed
          </p>
        </div>

        {/* Card 3: Total Leisure Minted */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 bg-[#0d1017]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-teal-400" />
            CUMULATIVE MINTED
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-teal-300">
              +{profile.totalTimeEarned || currentCredits}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">MINS</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            From focus sessions & quest victories
          </p>
        </div>

        {/* Card 4: Total Rest Redeemed */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 bg-[#0d1017]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
            <Coffee className="h-3 w-3 text-indigo-400" />
            REST REDEEMED
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-indigo-300">
              {profile.totalTimeSpent || 0}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">MINS</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Active rest sessions & vault vouchers
          </p>
        </div>

      </div>

      {/* REST PASS QUICK LAUNCHER (STEP 4 & STEP 5 REDEMPTION SHELF) */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 bg-[#0c1018]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
              <Coffee className="h-3.5 w-3.5 text-indigo-400" />
              REST PASS SHELF — REDEEM INTENTIONAL LEISURE
            </h3>
            <p className="text-[11px] text-zinc-400">
              Deducts coins and rest credits atomically. Launches the full-screen timer with pro-rata early return refunds.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-zinc-400">Coins: <strong className="text-[#fef08a]">{currentCoins}</strong></span>
            <span className="text-zinc-400">Rest: <strong className="text-emerald-300">{currentCredits}m</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DEFAULT_REST_PASSES.map((pass) => {
            const hasEnoughMinutes = currentCredits >= pass.costMinutes;
            const hasEnoughCoins = currentCoins >= pass.costCoins;
            const canAfford = hasEnoughMinutes && hasEnoughCoins;

            return (
              <div 
                key={pass.id}
                className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                  canAfford 
                    ? 'bg-[#121622] border-white/10 hover:border-indigo-500/50 hover:bg-[#161c2c]' 
                    : 'bg-[#0f121a]/60 border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-mono font-bold text-zinc-200 line-clamp-1">{pass.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 shrink-0">
                      {pass.durationMinutes}m
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 min-h-[28px]">
                    {pass.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono">
                    <span className={hasEnoughMinutes ? 'text-emerald-400' : 'text-rose-400'}>{pass.costMinutes}m</span>
                    <span className="text-zinc-600 mx-1">+</span>
                    <span className={hasEnoughCoins ? 'text-[#fef08a]' : 'text-rose-400'}>{pass.costCoins}c</span>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleQuickRedeemPass(pass)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-white/5 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Play className="h-2.5 w-2.5" />
                    <span>REST</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="glass-panel rounded-xl p-3 sm:p-4 border border-white/10 bg-[#0b0e14] flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search transactions by reason, type, or reference ID..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#121622] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition font-sans"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nature filter */}
          <div className="flex bg-[#121622] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => { setNatureFilter('ALL'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${natureFilter === 'ALL' ? 'bg-white/15 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              ALL
            </button>
            <button
              onClick={() => { setNatureFilter('GAINS'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${natureFilter === 'GAINS' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              +MINTED
            </button>
            <button
              onClick={() => { setNatureFilter('SPENT'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition ${natureFilter === 'SPENT' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              -SPENT
            </button>
          </div>

          {/* Type filter dropdown */}
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
            className="bg-[#121622] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="focus_mint">Focus Harvest</option>
            <option value="quest_dividend">Quest Dividend</option>
            <option value="leisure_redemption">Rest Redeemed</option>
            <option value="rest_refund">Rest Refund</option>
            <option value="ritual_reward">Sacred Rite</option>
            <option value="time_debt_penalty">Time Debt</option>
            <option value="manual_adjustment">Manual Adjustment</option>
          </select>
        </div>

      </div>

      {/* TRANSACTION TABLE (AUDIT TRAIL) */}
      <div className="glass-panel rounded-xl border border-white/10 bg-[#090c12] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e121a] text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Event & Reason</th>
                <th className="py-3 px-4 font-semibold">Linked Ref</th>
                <th className="py-3 px-4 font-semibold text-right">Time Flux</th>
                <th className="py-3 px-4 font-semibold text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Hourglass className="h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                    <span>No temporal transactions matching current filters.</span>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const badge = getTypeBadge(tx.type);
                  const Icon = badge.icon;
                  const delta = tx.minutesDelta !== undefined ? tx.minutesDelta : tx.minutes;
                  const ending = tx.endingBalance !== undefined ? tx.endingBalance : tx.balanceAfter;
                  const linked = tx.linkedId || tx.relatedId;
                  const isGain = delta >= 0;

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        {formatDate(tx.timestamp)}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold ${badge.color}`}>
                          <Icon className="h-2.5 w-2.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Description / Reason */}
                      <td className="py-3.5 px-4 text-zinc-200">
                        <div className="font-sans font-medium line-clamp-1">
                          {tx.reason}
                        </div>
                      </td>

                      {/* Linked Reference */}
                      <td className="py-3.5 px-4 text-zinc-500 text-[10px] font-mono whitespace-nowrap">
                        {linked ? (
                          <span className="truncate max-w-[120px] inline-block" title={linked}>
                            {linked}
                          </span>
                        ) : (
                          <span className="text-zinc-700">—</span>
                        )}
                      </td>

                      {/* Time Flux Change */}
                      <td className={`py-3.5 px-4 text-right font-black text-xs whitespace-nowrap ${
                        isGain ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isGain ? `+${delta}m` : `${delta}m`}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-300 whitespace-nowrap">
                        {ending}m
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-3 border-t border-white/5 bg-[#0b0e14] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Showing {paginatedTransactions.length} of {filteredTransactions.length} records</span>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
              className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-zinc-300"
            >
              <option value={15}>15 rows</option>
              <option value={30}>30 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CALIBRATE TIME MODAL */}
      <AnimatePresence>
        {isCalibrateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d1017] border border-[#c5a059]/40 rounded-2xl p-5 shadow-2xl space-y-4 text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#c5a059]/20 text-[#fef08a]">
                    <Hourglass className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold font-serif text-zinc-100">
                    Calibrate Temporal Balance
                  </h4>
                </div>
                <button
                  onClick={() => setIsCalibrateModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Calibration Action:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCalibrateNature('GRANT')}
                      className={`py-2 rounded-xl border text-center transition ${
                        calibrateNature === 'GRANT'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      + Grant Leisure (+Mins)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalibrateNature('DEDUCT')}
                      className={`py-2 rounded-xl border text-center transition ${
                        calibrateNature === 'DEDUCT'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                          : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      - Deduct / Discipline (-Mins)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Duration (Minutes):</label>
                  <input
                    type="number"
                    min={1}
                    value={calibrateMinutes}
                    onChange={e => setCalibrateMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Reason & Notes:</label>
                  <input
                    type="text"
                    placeholder="e.g. Unscheduled deep study block offline / Manual rest voucher"
                    value={calibrateReason}
                    onChange={e => setCalibrateReason(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCalibrateModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!calibrateReason.trim()}
                  onClick={handleApplyCalibration}
                  className="px-4 py-2 rounded-xl bg-[#c5a059] text-black font-bold hover:bg-[#d6b168] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply Calibration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
