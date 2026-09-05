import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hourglass, Clock, Search, Filter, ArrowDownRight, ArrowUpRight, 
  Download, Plus, RefreshCw, Moon, Coffee, ShieldAlert, Sparkles,
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Zap, Check
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { TimeTransaction, TimeTransactionType } from '../types';
import { RubElHizbIcon, GeometricDivider } from './IslamicRpgDecorations';

interface TemporalLedgerViewProps {
  onNavigate?: (tab: string) => void;
}

export const TemporalLedgerView: React.FC<TemporalLedgerViewProps> = ({ onNavigate }) => {
  const { state, addTimeCredits } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TimeTransactionType>('ALL');
  const [natureFilter, setNatureFilter] = useState<'ALL' | 'GAINS' | 'SPENT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState(false);

  // Calibrate Form State
  const [calibrateMinutes, setCalibrateMinutes] = useState<number>(30);
  const [calibrateNature, setCalibrateNature] = useState<'GRANT' | 'DEDUCT'>('GRANT');
  const [calibrateReason, setCalibrateReason] = useState('');

  const transactions: TimeTransaction[] = state.timeHistory || [];
  const profile = state.profile;
  const currentCredits = profile.timeCredits ?? 60;

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesReason = tx.reason.toLowerCase().includes(term);
        const matchesType = tx.type.toLowerCase().includes(term);
        if (!matchesReason && !matchesType) return false;
      }

      // Nature filter
      if (natureFilter === 'GAINS' && tx.minutes <= 0) return false;
      if (natureFilter === 'SPENT' && tx.minutes >= 0) return false;

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
        return { label: 'LEISURE VOUCHER', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', icon: Coffee };
      case 'time_debt_penalty':
        return { label: 'TIME DEBT', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: AlertTriangle };
      case 'manual_adjustment':
      default:
        return { label: 'CALIBRATION', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30', icon: Hourglass };
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Type', 'Change (Minutes)', 'Balance After (Minutes)', 'Reason'];
    const rows = filteredTransactions.map(tx => [
      `"${tx.id}"`,
      `"${tx.timestamp}"`,
      `"${tx.type}"`,
      tx.minutes,
      tx.balanceAfter,
      `"${tx.reason.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `temporal_time_ledger_${new Date().toISOString().split('T')[0]}.csv`);
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
            Time as Currency Audit Ledger (Ra's al-Māl)
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans mt-0.5">
            Every minute of deep focus is non-renewable capital minted into guilt-free rest credits. Track all harvests, dividends, and leisure redemptions.
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
            title="Download CSV spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>EXPORT CSV</span>
          </button>
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

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="glass-panel rounded-xl p-3 sm:p-4 border border-white/10 bg-[#0b0e14] flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search temporal transactions..."
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
            <option value="leisure_redemption">Leisure Voucher</option>
            <option value="ritual_reward">Sacred Rite</option>
            <option value="time_debt_penalty">Time Debt</option>
            <option value="manual_adjustment">Manual Adjustment</option>
          </select>
        </div>

      </div>

      {/* TRANSACTION TABLE */}
      <div className="glass-panel rounded-xl border border-white/10 bg-[#090c12] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e121a] text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Event & Reason</th>
                <th className="py-3 px-4 font-semibold text-right">Time Flux</th>
                <th className="py-3 px-4 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Hourglass className="h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                    <span>No temporal transactions matching current filters.</span>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const badge = getTypeBadge(tx.type);
                  const Icon = badge.icon;
                  const isGain = tx.minutes >= 0;

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

                      {/* Time Flux Change */}
                      <td className={`py-3.5 px-4 text-right font-black text-xs whitespace-nowrap ${
                        isGain ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isGain ? `+${tx.minutes}m` : `${tx.minutes}m`}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-300 whitespace-nowrap">
                        {tx.balanceAfter}m
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
