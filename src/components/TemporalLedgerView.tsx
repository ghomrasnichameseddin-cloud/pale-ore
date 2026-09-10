import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hourglass, Clock, Search, Filter, ArrowDownRight, ArrowUpRight, 
  Download, Plus, RefreshCw, Moon, Coffee, ShieldAlert, Sparkles,
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Zap, Check,
  Play, Flame, BarChart3, Info, Lock, Unlock, Smartphone, Globe,
  Gamepad2, Film, MessageSquare, Trash2, Edit3, X, SlidersHorizontal,
  History, PlusCircle, AlertOctagon, Copy
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { 
  TimeTransaction, TimeTransactionType, RestPass, LeisureTransaction,
  AppUsageLimit, AppUsageLimitCategory, AppUsageLimitConsequence, AppUsageLogEntry 
} from '../types';
import { RubElHizbIcon, GeometricDivider } from './IslamicRpgDecorations';
import { getLocalDateString, addDays, parseDateSafe } from '../utils/dateUtils';
import { 
  evaluateTodayRestDecision, 
  DEFAULT_REST_PASSES,
  REST_DECISION_THRESHOLDS,
  calculateAppUsageStatus,
  getActiveUsageBlocker
} from '../utils/temporalLedger';

interface TemporalLedgerViewProps {
  onNavigate?: (tab: string) => void;
}

export const TemporalLedgerView: React.FC<TemporalLedgerViewProps> = ({ onNavigate }) => {
  const { 
    state, 
    addTimeCredits, 
    redeemRestPass, 
    getDailyWakingCapital,
    addAppUsageLimit,
    updateAppUsageLimit,
    deleteAppUsageLimit,
    logAppUsage,
    deleteAppUsageLog,
    resetDefaultAppUsageLimits
  } = usePOS();

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

  // App Usage State & Modals
  const [isAddLimitModalOpen, setIsAddLimitModalOpen] = useState(false);
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [limitName, setLimitName] = useState('');
  const [limitCategory, setLimitCategory] = useState<AppUsageLimitCategory>('gaming');
  const [limitMinutes, setLimitMinutes] = useState<number>(45);
  const [limitConsequence, setLimitConsequence] = useState<AppUsageLimitConsequence>('deduct_leisure_bank');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLimitForLog, setSelectedLimitForLog] = useState<AppUsageLimit | null>(null);
  const [logMinutesInput, setLogMinutesInput] = useState<number>(15);
  const [logNotesInput, setLogNotesInput] = useState<string>('');

  const [isUsageHistoryDrawerOpen, setIsUsageHistoryDrawerOpen] = useState(false);

  const transactions: LeisureTransaction[] = (state.timeHistory || []) as LeisureTransaction[];
  const profile = state.profile;
  const currentCredits = profile.timeCredits ?? 60;
  const currentCoins = profile.coins ?? 150;
  const todayKey = state.systemDate || getLocalDateString();

  // App Usage Limits & Overdraft Calculations
  const appUsageLimits = state.appUsageLimits || [];
  const appUsageLogs = state.appUsageLogs || [];

  const usageStatuses = useMemo(() => {
    return appUsageLimits.map(limit => ({
      limit,
      status: calculateAppUsageStatus(limit, appUsageLogs, todayKey)
    }));
  }, [appUsageLimits, appUsageLogs, todayKey]);

  const totalUsageOverdraftMinutes = useMemo(() => {
    return usageStatuses.reduce((sum, item) => sum + item.status.overdraftMinutes, 0);
  }, [usageStatuses]);

  const totalAppMinutesUsedToday = useMemo(() => {
    return usageStatuses.reduce((sum, item) => sum + item.status.usedMinutes, 0);
  }, [usageStatuses]);

  const usageBlocker = useMemo(() => {
    return getActiveUsageBlocker(appUsageLimits, appUsageLogs, todayKey);
  }, [appUsageLimits, appUsageLogs, todayKey]);

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

  // Today's Decision calculation (incorporates digital overdraft minutes)
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
  const todayDecision = evaluateTodayRestDecision(todayMinted, todaySpent, totalUsageOverdraftMinutes);

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
    if (usageBlocker.isBlocked) return;
    if (redeemRestPass) {
      redeemRestPass(pass);
    }
  };

  // App Usage Category & Consequence Helpers
  const getCategoryMeta = (cat: AppUsageLimitCategory) => {
    switch (cat) {
      case 'gaming':
        return { label: 'Gaming', icon: Gamepad2, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
      case 'video_streaming':
        return { label: 'Streaming', icon: Film, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' };
      case 'social_media':
        return { label: 'Social Media', icon: MessageSquare, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      case 'browsing':
        return { label: 'Web Browsing', icon: Globe, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' };
      case 'other':
      default:
        return { label: 'App / Other', icon: Smartphone, color: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30' };
    }
  };

  const getConsequenceMeta = (consequence: AppUsageLimitConsequence) => {
    switch (consequence) {
      case 'block_rest_passes':
        return {
          label: 'Locks Rest Passes',
          shortLabel: 'Lock Passes',
          desc: 'Exceeding limit completely locks rest pass redemption for the day.',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: Lock
        };
      case 'deduct_leisure_bank':
        return {
          label: 'Auto-Debits Rest Bank',
          shortLabel: 'Debit Bank',
          desc: 'Each overdrawn minute is deducted from Rest Bank as time debt.',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Zap
        };
      case 'informational':
      default:
        return {
          label: 'Advisory Warning',
          shortLabel: 'Advisory',
          desc: 'Advisory alert and decision status impact only.',
          badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
          icon: Info
        };
    }
  };

  const handleOpenAddLimit = () => {
    setEditingLimitId(null);
    setLimitName('');
    setLimitCategory('gaming');
    setLimitMinutes(45);
    setLimitConsequence('deduct_leisure_bank');
    setIsAddLimitModalOpen(true);
  };

  const handleOpenEditLimit = (limit: AppUsageLimit) => {
    setEditingLimitId(limit.id);
    setLimitName(limit.name);
    setLimitCategory(limit.category);
    setLimitMinutes(limit.dailyLimitMinutes);
    setLimitConsequence(limit.consequence);
    setIsAddLimitModalOpen(true);
  };

  const handleSaveLimitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitName.trim()) return;

    if (editingLimitId) {
      updateAppUsageLimit(editingLimitId, {
        name: limitName.trim(),
        category: limitCategory,
        dailyLimitMinutes: Math.max(1, limitMinutes),
        consequence: limitConsequence
      });
    } else {
      addAppUsageLimit({
        name: limitName.trim(),
        category: limitCategory,
        dailyLimitMinutes: Math.max(1, limitMinutes),
        consequence: limitConsequence,
        enabled: true
      });
    }
    setIsAddLimitModalOpen(false);
  };

  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    const text = [
      `══ PALE ORE: TEMPORAL LEDGER & REST AUDIT [${todayKey}] ══`,
      `• Rest Bank Balance: ${currentCredits} Minutes`,
      `• Rest Minted Today: +${todayMinted}m`,
      `• Rest Redeemed Today: -${todaySpent}m`,
      `• Net Rest Position: ${todayMinted - todaySpent >= 0 ? '+' : ''}${todayMinted - todaySpent}m (${todayDecision.headline})`,
      `• Waking Capital Utilization: ${wakingCapital.utilizationPercent}% (${wakingCapital.investedMinutes}m invested / ${wakingCapital.budgetMinutes}m budget)`,
      `• App Ceilings Monitored: ${appUsageLimits.length} Apps (${totalAppMinutesUsedToday}m logged today, ${totalUsageOverdraftMinutes}m overdraft)`,
      `• Rest Passes Lock Status: ${usageBlocker.isBlocked ? `LOCKED (due to "${usageBlocker.appName}" +${usageBlocker.overdraftMinutes}m)` : 'UNLOCKED / ACTIVE'}`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleOpenLogModal = (limit: AppUsageLimit) => {
    setSelectedLimitForLog(limit);
    setLogMinutesInput(15);
    setLogNotesInput('');
    setIsLogModalOpen(true);
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLimitForLog || logMinutesInput <= 0) return;
    logAppUsage(selectedLimitForLog.id, logMinutesInput, logNotesInput.trim() || undefined);
    setIsLogModalOpen(false);
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
            onClick={handleCopySummary}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 ${
              copiedSummary 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
            }`}
            title="Copy high-level daily balance report to clipboard"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
            <span>{copiedSummary ? 'COPIED!' : 'COPY AUDIT'}</span>
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

            {todayDecision.usageOverdraftWarning && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="font-sans leading-relaxed">{todayDecision.usageOverdraftWarning}</span>
              </div>
            )}
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

        {usageBlocker.isBlocked && (
          <div className="mb-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 flex items-start gap-3 shadow-md">
            <Lock className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-rose-300 uppercase tracking-wider">
                  REST PASS REDEMPTION LOCKED
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-100 font-mono font-bold">
                  +{usageBlocker.overdraftMinutes}m OVERDRAFT
                </span>
              </div>
              <p className="text-xs text-rose-200 font-sans mt-0.5">
                Daily limit of {usageBlocker.limit?.dailyLimitMinutes ?? ''}m for &ldquo;{usageBlocker.appName}&rdquo; was exceeded.
                Consequence rule <span className="font-mono text-rose-300 font-bold">block_rest_passes</span> enforces a strict lock on rest pass redemption.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DEFAULT_REST_PASSES.map((pass) => {
            const hasEnoughMinutes = currentCredits >= pass.costMinutes;
            const hasEnoughCoins = currentCoins >= pass.costCoins;
            const canAfford = hasEnoughMinutes && hasEnoughCoins;
            const isBlocked = usageBlocker.isBlocked;

            return (
              <div 
                key={pass.id}
                className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                  canAfford && !isBlocked
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
                    disabled={!canAfford || isBlocked}
                    onClick={() => handleQuickRedeemPass(pass)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm ${
                      isBlocked
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-white/5 disabled:text-zinc-600 disabled:cursor-not-allowed'
                    }`}
                    title={isBlocked ? `Locked: Exceeded limit on "${usageBlocker.appName}"` : undefined}
                  >
                    {isBlocked ? <Lock className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                    <span>{isBlocked ? 'LOCKED' : 'REST'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* APP / SITE USAGE LIMITS & DIGITAL OVERDRAFT MONITOR */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 bg-[#0c1018] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1.5">
                <Smartphone className="h-3 w-3 text-[#c5a059]" />
                DIGITAL BOUNDARIES & OVERDRAFT
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                totalUsageOverdraftMinutes > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {totalUsageOverdraftMinutes > 0
                  ? `+${totalUsageOverdraftMinutes}M DIGITAL OVERDRAFT`
                  : `ALL WITHIN CEILINGS (${totalAppMinutesUsedToday}M USED)`}
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-zinc-100 tracking-wide mt-0.5">
              App & Site Usage Ceilings
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Deliberate boundaries on leisure and digital apps. Exceeding daily ceilings triggers consequences (Rest Bank debit, Rest Pass lock, or reflective alerts).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsUsageHistoryDrawerOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition flex items-center gap-1.5"
              title="View today's logged app usage entries"
            >
              <History className="h-3.5 w-3.5 text-zinc-400" />
              <span>Today&apos;s Logs ({appUsageLogs.filter(l => l.date === todayKey).length})</span>
            </button>

            <button
              onClick={handleOpenAddLimit}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#141824] hover:bg-[#1c2235] text-[#fef08a] border border-[#c5a059]/40 transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Add Limit</span>
            </button>

            {appUsageLimits.length === 0 && (
              <button
                onClick={resetDefaultAppUsageLimits}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                <span>Restore Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Limit Cards Grid */}
        {usageStatuses.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
            <Smartphone className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-xs text-zinc-300 font-medium">No active app or site usage limits configured.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Add a custom limit or restore default ceilings (Steam, YouTube, Social Media).</p>
            <button
              onClick={resetDefaultAppUsageLimits}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10"
            >
              Load Default Ceilings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {usageStatuses.map(({ limit, status }) => {
              const catMeta = getCategoryMeta(limit.category);
              const CatIcon = catMeta.icon;
              const conMeta = getConsequenceMeta(limit.consequence);
              const ConIcon = conMeta.icon;

              const percent = status.percentUsed;
              const isOver = status.isOverdrawn;

              return (
                <div 
                  key={limit.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isOver 
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-sm' 
                      : 'bg-[#11141e] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Header: App Name & Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border ${catMeta.color}`}>
                          <CatIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-zinc-100 line-clamp-1">{limit.name}</h4>
                          <span className="text-[9px] font-mono text-zinc-400 block">{catMeta.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditLimit(limit)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                          title="Edit Limit"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteAppUsageLimit(limit.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-white/5"
                          title="Delete Limit"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Minutes */}
                    <div className="mt-3">
                      <div className="flex justify-between items-baseline text-xs font-mono mb-1">
                        <span className="text-zinc-400">
                          Used: <strong className={isOver ? 'text-rose-400' : 'text-zinc-200'}>{status.usedMinutes}m</strong>
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          Cap: <strong className="text-zinc-300">{status.dailyLimitMinutes}m</strong>
                        </span>
                      </div>

                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isOver 
                              ? 'bg-rose-500' 
                              : percent > 80 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono mt-1.5">
                        {isOver ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>+{status.overdraftMinutes}m OVER CEILING</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400">
                            {status.remainingMinutes}m remaining
                          </span>
                        )}
                        <span className="text-zinc-500">{percent}%</span>
                      </div>
                    </div>

                    {/* Consequence Tag */}
                    <div className="mt-2.5">
                      <span 
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${conMeta.badgeClass}`}
                        title={conMeta.desc}
                      >
                        <ConIcon className="h-2.5 w-2.5" />
                        <span>{conMeta.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Log Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-1.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Log:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => logAppUsage(limit.id, 15)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition"
                        title="Log 15 minutes today"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => logAppUsage(limit.id, 30)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition"
                        title="Log 30 minutes today"
                      >
                        +30m
                      </button>
                      <button
                        onClick={() => handleOpenLogModal(limit)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c2235] hover:bg-[#252e47] text-[#fef08a] border border-[#c5a059]/30 transition"
                        title="Custom log with notes"
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                        <div className="font-sans font-medium line-clamp-1" title={tx.reason}>
                          {tx.reason}
                        </div>
                        {tx.type === 'quest_dividend' && (tx.reason.includes('Elapsed Time') || tx.reason.includes('superseding') || tx.reason.includes('work')) && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-mono font-bold text-teal-300 bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20">
                            <Zap className="h-2.5 w-2.5" />
                            <span>Labor Reconciled</span>
                          </div>
                        )}
                        {tx.type === 'time_debt_penalty' && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-mono font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span>App Ceiling Overdraft</span>
                          </div>
                        )}
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

        {/* MODAL 2: ADD / EDIT APP USAGE CEILING */}
        {isAddLimitModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-[#c5a059]/40 bg-[#0d1017] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#c5a059]" />
                  <h3 className="font-serif font-bold text-zinc-100 text-sm tracking-wide">
                    {editingLimitId ? 'Edit Usage Ceiling' : 'Configure App Ceiling'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLimitModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLimitForm} className="space-y-4 text-xs font-mono">
                {/* App Name */}
                <div>
                  <label className="text-zinc-400 block mb-1">App / Service / Site Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Steam Games, YouTube, Reddit, Discord"
                    value={limitName}
                    onChange={e => setLimitName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-zinc-400 block mb-1">Category:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['gaming', 'video_streaming', 'social_media', 'browsing', 'other'] as AppUsageLimitCategory[]).map(cat => {
                      const meta = getCategoryMeta(cat);
                      const Icon = meta.icon;
                      const isSel = limitCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setLimitCategory(cat)}
                          className={`py-1.5 px-2 rounded-lg border text-center transition flex items-center justify-center gap-1 text-[11px] ${
                            isSel
                              ? 'bg-white/15 border-white/30 text-white font-bold'
                              : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Ceiling in Minutes */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-zinc-400">Daily Ceiling (Minutes):</label>
                    <span className="text-[#fef08a] font-bold">{limitMinutes} minutes/day</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={limitMinutes}
                    onChange={e => setLimitMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[30, 45, 60, 90, 120].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setLimitMinutes(mins)}
                        className={`flex-1 py-1 rounded text-[10px] border transition ${
                          limitMinutes === mins
                            ? 'bg-white/20 border-white/40 text-white font-bold'
                            : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consequence Rule */}
                <div>
                  <label className="text-zinc-400 block mb-1">Breach Consequence Rule:</label>
                  <div className="space-y-1.5">
                    {[
                      {
                        value: 'deduct_leisure_bank',
                        label: 'Auto-Debit Leisure Bank',
                        desc: 'Each overdrawn minute is deducted from Rest Bank as time debt.',
                        icon: Zap,
                        badgeColor: 'border-amber-500/40 text-amber-300'
                      },
                      {
                        value: 'block_rest_passes',
                        label: 'Lock Rest Passes',
                        desc: 'Exceeding limit completely locks rest pass redemption for the day.',
                        icon: Lock,
                        badgeColor: 'border-rose-500/40 text-rose-300'
                      },
                      {
                        value: 'informational',
                        label: 'Advisory Warning Only',
                        desc: 'Warns in Today’s Rest Decision without automated debit or lockout.',
                        icon: Info,
                        badgeColor: 'border-zinc-500/40 text-zinc-300'
                      }
                    ].map(item => {
                      const Icon = item.icon;
                      const isSel = limitConsequence === item.value;
                      return (
                        <div
                          key={item.value}
                          onClick={() => setLimitConsequence(item.value as AppUsageLimitConsequence)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition ${
                            isSel
                              ? 'bg-white/10 border-[#c5a059]'
                              : 'bg-black/30 border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`h-3.5 w-3.5 ${isSel ? 'text-[#c5a059]' : 'text-zinc-500'}`} />
                            <span className={`text-xs font-bold ${isSel ? 'text-zinc-100' : 'text-zinc-300'}`}>
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-sans mt-0.5 pl-5.5">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddLimitModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!limitName.trim()}
                    className="px-4 py-2 rounded-xl bg-[#c5a059] text-black font-bold hover:bg-[#d6b168] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {editingLimitId ? 'Update Ceiling' : 'Save Ceiling'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 3: LOG APP USAGE */}
        {isLogModalOpen && selectedLimitForLog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/20 bg-[#0d1017] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-zinc-100 text-sm tracking-wide">
                    Log Usage — {selectedLimitForLog.name}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Daily Ceiling: {selectedLimitForLog.dailyLimitMinutes}m
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitLog} className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-zinc-400">Minutes Spent:</label>
                    <span className="text-[#fef08a] font-bold">+{logMinutesInput}m</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={logMinutesInput}
                    onChange={e => setLogMinutesInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[15, 30, 45, 60, 90].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setLogMinutesInput(m)}
                        className={`flex-1 py-1 rounded text-[10px] border transition ${
                          logMinutesInput === m
                            ? 'bg-white/20 border-white/40 text-white font-bold'
                            : 'bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        +{m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Optional Notes / Context:</label>
                  <input
                    type="text"
                    placeholder="e.g. Evening match, video tutorial, relaxing break"
                    value={logNotesInput}
                    onChange={e => setLogNotesInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    Record Usage
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 4: USAGE LOGS AUDIT TRAIL FOR TODAY */}
        {isUsageHistoryDrawerOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/20 bg-[#0d1017] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-zinc-400" />
                  <h3 className="font-serif font-bold text-zinc-100 text-sm tracking-wide">
                    Today&apos;s App Usage Activity ({todayKey})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUsageHistoryDrawerOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
                {appUsageLogs.filter(l => l.date === todayKey).length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">
                    No app usage logged for today yet.
                  </div>
                ) : (
                  appUsageLogs
                    .filter(l => l.date === todayKey)
                    .slice()
                    .reverse()
                    .map(entry => {
                      const limit = appUsageLimits.find(l => l.id === entry.limitId);
                      const timeStr = entry.timestamp.split('T')[1]?.substring(0, 5) || '';
                      return (
                        <div
                          key={entry.id}
                          className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-200">
                                {entry.appName || limit?.name || 'App'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
                                {timeStr}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                                {entry.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-zinc-200 font-bold">
                              {entry.minutesUsed}m
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteAppUsageLog(entry.id)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition"
                              title="Delete log entry"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-white/10 text-xs font-mono">
                <span className="text-zinc-400">
                  Total Today: <strong className="text-[#fef08a]">{totalAppMinutesUsedToday}m</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsUsageHistoryDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-zinc-300 hover:bg-white/15"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
