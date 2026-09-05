import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { XPHistoryEntry, XPSourceCategory } from '../types';
import { 
  TrendingUp, TrendingDown, Search, Filter, ArrowUpDown, 
  Download, Calendar, Award, Zap, ShieldAlert, Clock, 
  RotateCcw, ChevronLeft, ChevronRight, CheckCircle2,
  AlertTriangle, HelpCircle, Layers, PlusCircle, MinusCircle,
  ExternalLink, FileSpreadsheet, Sparkles, Scale, Swords
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

// Helper to derive the source and human label of any XP History entry
export const deriveXpSourceInfo = (entry: XPHistoryEntry, questMap: Map<string, any>): {
  category: XPSourceCategory;
  label: string;
  badgeClass: string;
  icon: any;
} => {
  if (entry.source) {
    switch (entry.source) {
      case 'focus':
        return { category: 'focus', label: 'Focus Session', badgeClass: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300', icon: Clock };
      case 'muhasabah':
        return { category: 'muhasabah', label: 'Muhāsabah Audit', badgeClass: 'bg-purple-950/60 border-purple-500/30 text-purple-300', icon: Scale };
      case 'penalty_midnight':
        return { category: 'penalty_midnight', label: 'Midnight Lapsed', badgeClass: 'bg-rose-950/60 border-rose-500/40 text-rose-300', icon: ShieldAlert };
      case 'penalty_failed':
        return { category: 'penalty_failed', label: 'Failed Decree', badgeClass: 'bg-amber-950/60 border-amber-500/40 text-amber-300', icon: AlertTriangle };
      case 'boss':
        return { category: 'boss', label: 'Boss Trial', badgeClass: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300', icon: Award };
      case 'habit':
        return { category: 'habit', label: 'Habit Rite', badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300', icon: RotateCcw };
      case 'surge':
        return { category: 'surge', label: 'Resonance Surge', badgeClass: 'bg-amber-950/60 border-amber-500/30 text-amber-300', icon: Zap };
      default:
        return { category: 'quest', label: 'Direct Quest', badgeClass: 'bg-blue-950/60 border-blue-500/30 text-blue-300', icon: Swords };
    }
  }

  const name = (entry.questName || '').toLowerCase();
  
  if (name.includes('midnight penalty') || name.includes('midnight') && entry.xp < 0) {
    return { category: 'penalty_midnight', label: 'Midnight Lapsed', badgeClass: 'bg-rose-950/60 border-rose-500/40 text-rose-300', icon: ShieldAlert };
  }
  if (name.includes('muhāsabah') || name.includes('muhasabah') || name.includes('mīzān') || name.includes('mizan')) {
    return { category: 'muhasabah', label: 'Muhāsabah Audit', badgeClass: 'bg-purple-950/60 border-purple-500/30 text-purple-300', icon: Scale };
  }
  if (name.includes('focus session') || name.includes('🧘') || name.includes('work block')) {
    return { category: 'focus', label: 'Focus Session', badgeClass: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300', icon: Clock };
  }
  if (name.includes('xp surge') || name.includes('streak surge')) {
    return { category: 'surge', label: 'Resonance Surge', badgeClass: 'bg-amber-950/60 border-amber-500/30 text-amber-300', icon: Zap };
  }
  if (name.includes('penalty') || entry.xp < 0) {
    return { category: 'penalty_failed', label: 'Failed Decree', badgeClass: 'bg-amber-950/60 border-amber-500/40 text-amber-300', icon: AlertTriangle };
  }
  if (name.includes('boss')) {
    return { category: 'boss', label: 'Boss Trial', badgeClass: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300', icon: Award };
  }

  // Check if associated quest is a Habit
  if (entry.questId && questMap.has(entry.questId)) {
    const q = questMap.get(entry.questId);
    if (q.type === 'Habit' || q.cadence) {
      return { category: 'habit', label: 'Habit Rite', badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300', icon: RotateCcw };
    }
    if (q.type === 'Boss') {
      return { category: 'boss', label: 'Boss Trial', badgeClass: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300', icon: Award };
    }
  }

  return { category: 'quest', label: 'Direct Quest', badgeClass: 'bg-blue-950/60 border-blue-500/30 text-blue-300', icon: Swords };
};

interface XPHistoryLedgerProps {
  onNavigate?: (tab: string) => void;
}

export const XPHistoryLedger: React.FC<XPHistoryLedgerProps> = ({ onNavigate }) => {
  const { state, addXp, getPlayerLevelInfo } = usePOS();

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [natureFilter, setNatureFilter] = useState<'all' | 'gain' | 'loss'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_gain' | 'highest_loss'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Manual Adjust Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState<'gain' | 'loss'>('gain');
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustSkillId, setAdjustSkillId] = useState<string>('');

  // Expanded Row for Details
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Quick Map of Quests for Fast Metadata Lookups
  const questMap = useMemo(() => {
    const map = new Map<string, any>();
    (state.quests || []).forEach(q => map.set(q.id, q));
    return map;
  }, [state.quests]);

  // Quick Map of Skills for Skill Name Lookups
  const skillMap = useMemo(() => {
    const map = new Map<string, string>();
    (state.skills || []).forEach(s => map.set(s.id, s.name));
    return map;
  }, [state.skills]);

  // Pre-calculate Chronological Running Balance for ALL history entries
  // Entries in state.xpHistory are generally ordered newest-first, but we ensure precise chronology
  const chronologicalHistory = useMemo(() => {
    const raw = [...(state.xpHistory || [])];
    // Sort chronologically ascending to compute running cumulative total
    raw.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let runningBalance = 0;
    return raw.map((entry) => {
      runningBalance += entry.xp;
      const sourceInfo = deriveXpSourceInfo(entry, questMap);
      return {
        ...entry,
        cumulativeBalance: runningBalance,
        sourceCategory: sourceInfo.category,
        sourceLabel: sourceInfo.label,
        sourceBadgeClass: sourceInfo.badgeClass,
        SourceIcon: sourceInfo.icon
      };
    });
  }, [state.xpHistory, questMap]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalGains = 0;
    let totalLosses = 0;
    let gainsCount = 0;
    let lossesCount = 0;
    let todayGains = 0;
    let todayLosses = 0;

    const todayDateStr = (state.systemDate || new Date().toISOString()).split('T')[0];

    chronologicalHistory.forEach(entry => {
      const isToday = entry.timestamp.startsWith(todayDateStr);

      if (entry.xp >= 0) {
        totalGains += entry.xp;
        gainsCount++;
        if (isToday) todayGains += entry.xp;
      } else {
        totalLosses += Math.abs(entry.xp);
        lossesCount++;
        if (isToday) todayLosses += Math.abs(entry.xp);
      }
    });

    const netXp = totalGains - totalLosses;
    const netToday = todayGains - todayLosses;
    const totalTransactions = chronologicalHistory.length;
    const gainRatio = totalTransactions > 0 ? Math.round((gainsCount / totalTransactions) * 100) : 100;

    return {
      totalGains,
      totalLosses,
      netXp,
      todayGains,
      todayLosses,
      netToday,
      gainsCount,
      lossesCount,
      totalTransactions,
      gainRatio
    };
  }, [chronologicalHistory, state.systemDate]);

  // Filter & Sort Entries
  const filteredEntries = useMemo(() => {
    const now = new Date(state.systemDate || new Date()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;
    const todayDateStr = (state.systemDate || new Date().toISOString()).split('T')[0];

    return chronologicalHistory.filter(entry => {
      // 1. Nature Filter
      if (natureFilter === 'gain' && entry.xp < 0) return false;
      if (natureFilter === 'loss' && entry.xp >= 0) return false;

      // 2. Source Filter
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'penalty') {
          if (entry.sourceCategory !== 'penalty_midnight' && entry.sourceCategory !== 'penalty_failed') return false;
        } else if (entry.sourceCategory !== sourceFilter) {
          return false;
        }
      }

      // 3. Time Filter
      if (timeFilter === 'today') {
        if (!entry.timestamp.startsWith(todayDateStr)) return false;
      } else if (timeFilter === '7days') {
        const entryTime = new Date(entry.timestamp).getTime();
        if (now - entryTime > sevenDays) return false;
      } else if (timeFilter === '30days') {
        const entryTime = new Date(entry.timestamp).getTime();
        if (now - entryTime > thirtyDays) return false;
      }

      // 4. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (entry.questName || '').toLowerCase().includes(q);
        const matchesSource = entry.sourceLabel.toLowerCase().includes(q);
        const matchesSkill = (entry.skillIds || []).some(id => (skillMap.get(id) || '').toLowerCase().includes(q));
        if (!matchesName && !matchesSource && !matchesSkill) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortOrder === 'highest_gain') {
        return b.xp - a.xp;
      }
      if (sortOrder === 'highest_loss') {
        return a.xp - b.xp;
      }
      return 0;
    });
  }, [chronologicalHistory, natureFilter, sourceFilter, timeFilter, searchTerm, sortOrder, state.systemDate, skillMap]);

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / rowsPerPage));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredEntries.slice(start, start + rowsPerPage);
  }, [filteredEntries, currentPage, rowsPerPage]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Source', 'Description', 'XP_Impact', 'Cumulative_Balance', 'Associated_Skills', 'Quest_ID', 'ID'];
    const rows = filteredEntries.map(e => {
      const skillsStr = (e.skillIds || []).map(id => skillMap.get(id) || id).join('; ');
      const typeStr = e.xp >= 0 ? 'GAIN' : 'LOSS';
      return [
        `"${e.timestamp}"`,
        `"${typeStr}"`,
        `"${e.sourceLabel}"`,
        `"${(e.questName || '').replace(/"/g, '""')}"`,
        e.xp,
        e.cumulativeBalance,
        `"${skillsStr}"`,
        `"${e.questId || ''}"`,
        `"${e.id}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `xp_history_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle Manual XP Adjustment Submission
  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAmount || adjustAmount <= 0) return;

    const finalAmount = adjustType === 'gain' ? Math.round(adjustAmount) : -Math.round(adjustAmount);
    const reasonText = adjustReason.trim() || (adjustType === 'gain' ? 'Manual Operator XP Bonus' : 'Manual Disciplinary Deduction');
    const skillList = adjustSkillId ? [adjustSkillId] : [];

    addXp(finalAmount, `[OPERATOR] ${reasonText}`, skillList);

    setShowAdjustModal(false);
    setAdjustReason('');
    setAdjustAmount(50);
    setAdjustSkillId('');
  };

  const playerLevelInfo = getPlayerLevelInfo();

  return (
    <div className="space-y-6 animate-fadeIn" id="xp-history-ledger-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <span>SYSTEM XP LEDGER & AUDIT HISTORY</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-300 font-mono mt-1">
            Complete empirical ledger of every XP gain, quest bounty, focus harvest, midnight lapse, and Muhāsabah audit.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-[#0b0d13] hover:bg-[#141824] border border-[#c5a059]/30 text-[#e5c875] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>CALIBRATE XP</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Net XP */}
        <div className="glass-panel rounded-xl p-4 border border-[var(--border-accent)] bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase font-bold">TOTAL SYSTEM XP</span>
            <Sparkles className="h-4 w-4 text-[var(--accent-bright)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            {metrics.netXp.toLocaleString()} <span className="text-xs font-mono text-zinc-400 font-normal">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5">
            Level <span className="text-[#fef08a] font-bold">{playerLevelInfo.level}</span> • Next: <span className="text-zinc-300">{playerLevelInfo.xpIntoLevel}/{playerLevelInfo.xpRequiredForNextLevel}</span>
          </div>
        </div>

        {/* Total Gains */}
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">CUMULATIVE GAINS</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-emerald-300 tracking-tight">
            +{metrics.totalGains.toLocaleString()} <span className="text-xs font-mono text-emerald-500 font-normal">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5">
            Across <span className="text-emerald-400 font-bold">{metrics.gainsCount}</span> reward events
          </div>
        </div>

        {/* Total Deductions / Losses */}
        <div className="glass-panel rounded-xl p-4 border border-rose-500/20 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">CUMULATIVE DEDUCTIONS</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-rose-300 tracking-tight">
            -{metrics.totalLosses.toLocaleString()} <span className="text-xs font-mono text-rose-500 font-normal">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5">
            Across <span className="text-rose-400 font-bold">{metrics.lossesCount}</span> penalty & audit events
          </div>
        </div>

        {/* Today's Net Flux */}
        <div className="glass-panel rounded-xl p-4 border border-[#c5a059]/20 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold">TODAY'S NET FLUX</span>
            <Calendar className="h-4 w-4 text-[#c5a059]" />
          </div>
          <div className={`text-2xl sm:text-3xl font-display font-black tracking-tight ${
            metrics.netToday > 0 ? 'text-emerald-300' : metrics.netToday < 0 ? 'text-rose-400' : 'text-zinc-300'
          }`}>
            {metrics.netToday > 0 ? `+${metrics.netToday}` : metrics.netToday} <span className="text-xs font-mono text-zinc-400 font-normal">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5 flex items-center justify-between">
            <span>+{metrics.todayGains} earned</span>
            <span className="text-rose-400">-{metrics.todayLosses} lost</span>
          </div>
        </div>

      </div>

      {/* FILTER AND SEARCH CONTROLS */}
      <div className="glass-panel rounded-xl p-4 border border-[#c5a059]/20 bg-[#07080c]/90 space-y-3.5 shadow-md">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by decree name, discipline, or keyword..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#0b0d13] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills: Nature */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b0d13] border border-white/5 rounded-lg shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => { setNatureFilter('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-md transition-all cursor-pointer font-bold ${
                natureFilter === 'all' ? 'bg-[#c5a059] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ALL ({chronologicalHistory.length})
            </button>
            <button
              type="button"
              onClick={() => { setNatureFilter('gain'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-md transition-all cursor-pointer font-bold flex items-center gap-1 ${
                natureFilter === 'gain' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              GAINS ({metrics.gainsCount})
            </button>
            <button
              type="button"
              onClick={() => { setNatureFilter('loss'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-md transition-all cursor-pointer font-bold flex items-center gap-1 ${
                natureFilter === 'loss' ? 'bg-rose-700 text-white shadow' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <TrendingDown className="h-3 w-3" />
              LOSSES ({metrics.lossesCount})
            </button>
          </div>

        </div>

        {/* Secondary Filter Row: Source, Time, Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/5 text-xs font-mono">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Source Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">SOURCE:</span>
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="quest">⚔️ Direct Quests</option>
                <option value="habit">🔄 Habits & Daily Rites</option>
                <option value="focus">🧘 Focus Sessions</option>
                <option value="muhasabah">⚖️ Muhāsabah Audits</option>
                <option value="penalty">💀 Penalties (Midnight & Failed)</option>
                <option value="boss">👑 Boss Trials</option>
                <option value="surge">⚡ Surges & Boosts</option>
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">TIME:</span>
              <select
                value={timeFilter}
                onChange={(e) => { setTimeFilter(e.target.value as any); setCurrentPage(1); }}
                className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today Only</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
              </select>
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              SORT:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_gain">Highest Gain (+XP)</option>
              <option value="highest_loss">Highest Loss (-XP)</option>
            </select>
          </div>

        </div>
      </div>

      {/* MAIN XP HISTORY TABLE */}
      <div className="glass-panel rounded-xl border border-[var(--border-accent)] bg-[#0b0d13]/90 overflow-hidden shadow-xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#c5a059]/20 bg-[#07080c] text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-[110px]">TIMESTAMP</th>
                <th className="py-3 px-4 w-[140px]">SOURCE</th>
                <th className="py-3 px-4">EVENT & DETAILS</th>
                <th className="py-3 px-4 hidden md:table-cell w-[170px]">DISCIPLINES</th>
                <th className="py-3 px-4 text-right w-[120px]">IMPACT</th>
                <th className="py-3 px-4 text-right w-[130px]">BALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <RubElHizbIcon className="h-8 w-8 text-zinc-600 mx-auto" />
                      <div className="text-zinc-400 font-bold uppercase text-xs">NO XP RECORDS MATCHING FILTER</div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                        No transactions found for the selected criteria. Try resetting the filters, or fulfill directives and record daily Muhāsabah audits to generate logs.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setNatureFilter('all');
                          setSourceFilter('all');
                          setTimeFilter('all');
                        }}
                        className="px-3 py-1 bg-[#141824] hover:bg-[#1e2436] border border-white/10 rounded text-[10px] text-[#fef08a] cursor-pointer"
                      >
                        RESET ALL FILTERS
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => {
                  const isGain = entry.xp >= 0;
                  const isExpanded = expandedRowId === entry.id;
                  const dateObj = new Date(entry.timestamp);
                  const dateStr = isNaN(dateObj.getTime()) 
                    ? entry.timestamp 
                    : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeStr = isNaN(dateObj.getTime())
                    ? ''
                    : dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

                  const SourceIcon = entry.SourceIcon;

                  return (
                    <React.Fragment key={entry.id}>
                      <tr 
                        onClick={() => setExpandedRowId(isExpanded ? null : entry.id)}
                        className={`hover:bg-[#141824]/60 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#141824]/80' : ''
                        }`}
                      >
                        {/* TIMESTAMP */}
                        <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                          <div className="text-[11px] font-bold text-zinc-300">{dateStr}</div>
                          <div className="text-[9px] text-zinc-500">{timeStr}</div>
                        </td>

                        {/* SOURCE BADGE */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${entry.sourceBadgeClass}`}>
                            <SourceIcon className="h-3 w-3" />
                            <span>{entry.sourceLabel}</span>
                          </span>
                        </td>

                        {/* EVENT TITLE */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-200 font-sans font-medium line-clamp-1 break-all">
                              {entry.questName || 'Unnamed Record'}
                            </span>
                            {entry.questId && (
                              <span className="text-[9px] text-zinc-500 bg-white/5 px-1 rounded shrink-0 hidden sm:inline">
                                #{entry.questId.slice(-4)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* LINKED SKILLS */}
                        <td className="py-3 px-4 hidden md:table-cell">
                          {entry.skillIds && entry.skillIds.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {entry.skillIds.slice(0, 2).map((skId) => (
                                <span 
                                  key={skId}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#fef08a] truncate max-w-[120px]"
                                >
                                  {skillMap.get(skId) || skId}
                                </span>
                              ))}
                              {entry.skillIds.length > 2 && (
                                <span className="text-[9px] text-zinc-500">+{entry.skillIds.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">—</span>
                          )}
                        </td>

                        {/* IMPACT (XP GAIN / LOSS) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className={`font-mono font-black text-xs ${
                            isGain ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isGain ? `+${entry.xp}` : entry.xp} XP
                          </span>
                        </td>

                        {/* CUMULATIVE BALANCE */}
                        <td className="py-3 px-4 text-right whitespace-nowrap text-zinc-300 font-mono text-xs">
                          {entry.cumulativeBalance.toLocaleString()} XP
                        </td>
                      </tr>

                      {/* EXPANDABLE ROW DETAILS */}
                      {isExpanded && (
                        <tr className="bg-[#07080c] border-b border-white/5">
                          <td colSpan={6} className="p-4 space-y-3">
                            <div className="p-3 bg-[#0b0d13] border border-white/10 rounded-lg space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 text-[10px] font-mono">
                                <span className="text-[#c5a059] font-bold uppercase">TRANSACTION METADATA: {entry.id}</span>
                                <span className="text-zinc-500">ISO: {entry.timestamp}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-sans">
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">FULL EVENT TITLE</span>
                                  <span className="text-white font-medium">{entry.questName}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">AUDIT DOMAIN</span>
                                  <span className="text-zinc-300">{entry.sourceLabel} ({isGain ? 'Credit / Elevation' : 'Disciplinary Penalty'})</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">RUNNING BALANCE AFTER IMPACT</span>
                                  <span className="text-[#fef08a] font-mono font-bold">{entry.cumulativeBalance.toLocaleString()} XP</span>
                                </div>
                              </div>
                              {entry.skillIds && entry.skillIds.length > 0 && (
                                <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap text-[10px] font-mono">
                                  <span className="text-zinc-500 uppercase">IMPACTED DISCIPLINES:</span>
                                  {entry.skillIds.map(skId => (
                                    <span key={skId} className="px-2 py-0.5 bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#fef08a] rounded">
                                      {skillMap.get(skId) || skId}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-3 bg-[#07080c] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredEntries.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filteredEntries.length)} of {filteredEntries.length} records
            </span>
            <div className="flex items-center gap-1 ml-3">
              <span className="text-zinc-500">Rows:</span>
              {[15, 30, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => { setRowsPerPage(val); setCurrentPage(1); }}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                    rowsPerPage === val ? 'bg-[#c5a059] text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded bg-[#0b0d13] border border-white/10 hover:bg-[#141824] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-zinc-300"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-bold text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded bg-[#0b0d13] border border-white/10 hover:bg-[#141824] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-zinc-300"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* MANUAL XP CALIBRATION MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
            
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-white uppercase flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                CALIBRATE SANCTUM XP
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Inject or deduct experience points directly into the audit ledger with reason logging.
              </p>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#07080c] border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustType('gain')}
                  className={`py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adjustType === 'gain' 
                      ? 'bg-emerald-700 text-white shadow' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  GRANT XP (+GAIN)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('loss')}
                  className={`py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adjustType === 'loss' 
                      ? 'bg-rose-700 text-white shadow' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MinusCircle className="h-4 w-4" />
                  DEDUCT XP (-LOSS)
                </button>
              </div>

              {/* XP Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">XP AMOUNT</label>
                <input 
                  type="number"
                  min="1"
                  max="10000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#07080c] border border-white/15 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">REASON / AUDIT NOTE</label>
                <input 
                  type="text"
                  placeholder="e.g., Unlogged gym session, divine bonus, system recalibration"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              {/* Optional Skill Link */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">LINKED DISCIPLINE (OPTIONAL)</label>
                <select
                  value={adjustSkillId}
                  onChange={(e) => setAdjustSkillId(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="">None (Global Profile Only)</option>
                  {(state.skills || []).map(sk => (
                    <option key={sk.id} value={sk.id}>{sk.name} (LVL {sk.level})</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all shadow ${
                    adjustType === 'gain'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-700 hover:bg-rose-600 text-white'
                  }`}
                >
                  CONFIRM {adjustType === 'gain' ? '+GRANT' : '-DEDUCT'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
