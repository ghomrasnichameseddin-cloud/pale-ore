import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  Heart,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Check,
  Star,
  FileText,
  Bookmark,
  Calendar,
  X,
  Plus,
  Minus,
  Edit2,
  Grid,
  List,
  Flame,
  Award,
  ShieldCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { QURAN_SURAHS, QuranSurahMetadata } from '../../data/quranSurahs';
import {
  SurahLedgerEntry,
  SurahMemorizationStatus,
  SurahRevisionStatus,
  SurahReadStatus
} from '../../types';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface SurahLedgerViewProps {
  systemDate: string;
  onOpenGuide?: (section?: string) => void;
}

type FilterCategory = 
  | 'all' 
  | 'memorized' 
  | 'memorizing' 
  | 'unmemorized' 
  | 'needs_revision' 
  | 'mastered_revision' 
  | 'read' 
  | 'unread';

export const SurahLedgerView: React.FC<SurahLedgerViewProps> = ({
  systemDate,
  onOpenGuide
}) => {
  const {
    quranTracker,
    updateSurahLedgerEntry,
    quickToggleSurahMemorized,
    quickToggleSurahRevised,
    quickToggleSurahRead,
    batchUpdateSurahLedger,
    resetSurahLedgerEntry,
    resetFullSurahLedger
  } = usePOS();

  const ledger = useMemo(() => {
    return quranTracker.surahLedger || {};
  }, [quranTracker.surahLedger]);

  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterCategory>('all');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  // Surah Edit Modal State
  const [editingSurah, setEditingSurah] = useState<QuranSurahMetadata | null>(null);
  const [modalMemorizedPages, setModalMemorizedPages] = useState<number>(0);
  const [modalMemorizedStatus, setModalMemorizedStatus] = useState<SurahMemorizationStatus>('not_started');
  const [modalRevisionStatus, setModalRevisionStatus] = useState<SurahRevisionStatus>('unrevised');
  const [modalMasteryStrength, setModalMasteryStrength] = useState<number>(1);
  const [modalReadStatus, setModalReadStatus] = useState<SurahReadStatus>('unread');
  const [modalReadPages, setModalReadPages] = useState<number>(0);
  const [modalNotes, setModalNotes] = useState<string>('');

  // Bulk action confirmation state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'mark_all_read' | 'reset_read' | 'mark_short_memorized' | null>(null);

  // Individual Surah Reset Modal State
  const [surahToReset, setSurahToReset] = useState<QuranSurahMetadata | null>(null);
  const [singleResetScope, setSingleResetScope] = useState<'all' | 'memorization' | 'revision' | 'read'>('all');

  // Master 114 Surahs Ledger Reset Modal State
  const [showMasterResetModal, setShowMasterResetModal] = useState(false);
  const [masterResetScope, setMasterResetScope] = useState<'all' | 'read' | 'revision' | 'memorization'>('all');
  const [masterResetConfirmInput, setMasterResetConfirmInput] = useState('');

  // Toast Feedback Banner
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Calculate Aggregates
  const stats = useMemo(() => {
    let memorizedSurahsCount = 0;
    let inProgressMemorizingCount = 0;
    let totalMemorizedPages = 0;
    let readSurahsCount = 0;
    let totalReadPages = 0;
    let freshRevisionCount = 0;
    let dueRevisionCount = 0;
    let masteredRevisionCount = 0;

    for (const surah of QURAN_SURAHS) {
      const entry = ledger[surah.number];
      if (entry) {
        if (entry.memorizationStatus === 'completed') {
          memorizedSurahsCount++;
          totalMemorizedPages += surah.totalPages;
        } else if (entry.memorizationStatus === 'in_progress') {
          inProgressMemorizingCount++;
          totalMemorizedPages += (entry.memorizedPages || 0);
        }

        if (entry.readStatus === 'completed') {
          readSurahsCount++;
          totalReadPages += surah.totalPages;
        } else if (entry.readStatus === 'in_progress') {
          totalReadPages += (entry.readPages || 0);
        }

        if (entry.revisionStatus === 'fresh') freshRevisionCount++;
        else if (entry.revisionStatus === 'due') dueRevisionCount++;
        else if (entry.revisionStatus === 'mastered') masteredRevisionCount++;
      }
    }

    const hifdhPercent = Math.min(100, Math.round((totalMemorizedPages / 604) * 100));
    const tilawahPercent = Math.min(100, Math.round((readSurahsCount / 114) * 100));

    return {
      memorizedSurahsCount,
      inProgressMemorizingCount,
      totalMemorizedPages,
      hifdhPercent,
      readSurahsCount,
      totalReadPages,
      tilawahPercent,
      freshRevisionCount,
      dueRevisionCount,
      masteredRevisionCount
    };
  }, [ledger]);

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return QURAN_SURAHS.filter(surah => {
      const entry = ledger[surah.number];

      // Text search match
      if (query) {
        const matchesNumber = surah.number.toString() === query;
        const matchesArabic = surah.nameArabic.includes(query);
        const matchesTranslit = surah.nameTransliteration.toLowerCase().includes(query);
        const matchesEnglish = surah.nameEnglish.toLowerCase().includes(query);
        if (!matchesNumber && !matchesArabic && !matchesTranslit && !matchesEnglish) {
          return false;
        }
      }

      // Revelation filter
      if (revelationFilter !== 'all' && surah.revelationType !== revelationFilter) {
        return false;
      }

      // Juz filter
      if (selectedJuz !== 'all' && surah.juz !== selectedJuz) {
        return false;
      }

      // Status filter
      if (statusFilter === 'memorized') {
        return entry?.memorizationStatus === 'completed';
      }
      if (statusFilter === 'memorizing') {
        return entry?.memorizationStatus === 'in_progress';
      }
      if (statusFilter === 'unmemorized') {
        return !entry || entry.memorizationStatus === 'not_started';
      }
      if (statusFilter === 'needs_revision') {
        return entry?.revisionStatus === 'due';
      }
      if (statusFilter === 'mastered_revision') {
        return entry?.revisionStatus === 'mastered';
      }
      if (statusFilter === 'read') {
        return entry?.readStatus === 'completed';
      }
      if (statusFilter === 'unread') {
        return !entry || entry.readStatus === 'unread';
      }

      return true;
    });
  }, [searchQuery, statusFilter, revelationFilter, selectedJuz, ledger]);

  const openEditModal = (surah: QuranSurahMetadata) => {
    const entry = ledger[surah.number];
    setEditingSurah(surah);
    setModalMemorizedStatus(entry?.memorizationStatus || 'not_started');
    setModalMemorizedPages(entry?.memorizedPages ?? (entry?.memorizationStatus === 'completed' ? surah.totalPages : 0));
    setModalRevisionStatus(entry?.revisionStatus || 'unrevised');
    setModalMasteryStrength(entry?.masteryStrength || 1);
    setModalReadStatus(entry?.readStatus || 'unread');
    setModalReadPages(entry?.readPages ?? (entry?.readStatus === 'completed' ? surah.totalPages : 0));
    setModalNotes(entry?.notes || '');
  };

  const handleSaveModal = () => {
    if (!editingSurah) return;
    updateSurahLedgerEntry(editingSurah.number, {
      memorizationStatus: modalMemorizedStatus,
      memorizedPages: Math.min(editingSurah.totalPages, Math.max(0, modalMemorizedPages)),
      revisionStatus: modalRevisionStatus,
      masteryStrength: modalMasteryStrength,
      readStatus: modalReadStatus,
      readPages: Math.min(editingSurah.totalPages, Math.max(0, modalReadPages)),
      notes: modalNotes.trim()
    });
    setEditingSurah(null);
  };

  const handleCycleMemorization = (surahNumber: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    quickToggleSurahMemorized(surahNumber);
  };

  const handleQuickRevised = (surahNumber: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    quickToggleSurahRevised(surahNumber, systemDate);
  };

  const handleCycleRead = (surahNumber: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    quickToggleSurahRead(surahNumber, systemDate);
  };

  const handleStepPages = (surahNumber: number, delta: number, type: 'memorized' | 'read', e?: React.MouseEvent) => {
    e?.stopPropagation();
    const surah = QURAN_SURAHS.find(s => s.number === surahNumber);
    if (!surah) return;

    const entry = ledger[surahNumber];
    if (type === 'memorized') {
      const currentPages = entry?.memorizedPages || 0;
      const nextPages = Math.min(surah.totalPages, Math.max(0, currentPages + delta));
      let nextStatus: SurahMemorizationStatus = entry?.memorizationStatus || 'not_started';
      if (nextPages === surah.totalPages) nextStatus = 'completed';
      else if (nextPages > 0) nextStatus = 'in_progress';
      else nextStatus = 'not_started';

      updateSurahLedgerEntry(surahNumber, {
        memorizedPages: nextPages,
        memorizationStatus: nextStatus
      });
    } else {
      const currentPages = entry?.readPages || 0;
      const nextPages = Math.min(surah.totalPages, Math.max(0, currentPages + delta));
      let nextStatus: SurahReadStatus = entry?.readStatus || 'unread';
      if (nextPages === surah.totalPages) nextStatus = 'completed';
      else if (nextPages > 0) nextStatus = 'in_progress';
      else nextStatus = 'unread';

      updateSurahLedgerEntry(surahNumber, {
        readPages: nextPages,
        readStatus: nextStatus,
        lastReadDate: systemDate
      });
    }
  };

  const handleExecuteBulkAction = () => {
    if (!bulkActionType) return;
    const batch: Record<number, Partial<SurahLedgerEntry>> = {};

    if (bulkActionType === 'mark_all_read') {
      for (const s of QURAN_SURAHS) {
        batch[s.number] = {
          readStatus: 'completed',
          readPages: s.totalPages,
          lastReadDate: systemDate
        };
      }
    } else if (bulkActionType === 'reset_read') {
      for (const s of QURAN_SURAHS) {
        batch[s.number] = {
          readStatus: 'unread',
          readPages: 0
        };
      }
    } else if (bulkActionType === 'mark_short_memorized') {
      // Mark Juz 30 (Surahs 78 to 114) as memorized
      for (let num = 78; num <= 114; num++) {
        const s = QURAN_SURAHS.find(x => x.number === num);
        if (s) {
          batch[num] = {
            memorizationStatus: 'completed',
            memorizedPages: s.totalPages,
            memorizedAyahs: s.totalAyahs,
            revisionStatus: 'mastered',
            masteryStrength: 5,
            lastRevisedDate: systemDate
          };
        }
      }
    }

    batchUpdateSurahLedger(batch);
    setShowBulkModal(false);
    setBulkActionType(null);
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleConfirmSingleReset = () => {
    if (!surahToReset) return;
    resetSurahLedgerEntry(surahToReset.number, singleResetScope);
    const scopeLabel = singleResetScope === 'all' 
      ? 'All streams' 
      : singleResetScope === 'memorization' 
      ? 'Hifdh (memorisation)' 
      : singleResetScope === 'revision' 
      ? 'Muraja\'ah (revision)' 
      : 'Tilawah (reading)';
    showFeedback(`✓ Surah ${surahToReset.number} (${surahToReset.nameTransliteration}) ${scopeLabel} successfully reset.`);
    setSurahToReset(null);
  };

  const handleConfirmMasterReset = () => {
    if (masterResetScope === 'all' && masterResetConfirmInput.trim().toUpperCase() !== 'RESET') {
      return;
    }
    resetFullSurahLedger(masterResetScope);
    const scopeLabel = masterResetScope === 'all'
      ? 'All 114 Surahs (Full Clean Slate)'
      : masterResetScope === 'read'
      ? 'Tilawah (Reading) across all 114 Surahs'
      : masterResetScope === 'revision'
      ? 'Muraja\'ah (Revision) across all 114 Surahs'
      : 'Hifdh (Memorisation) across all 114 Surahs';
    showFeedback(`✓ Master Ledger Reset Applied: ${scopeLabel}.`);
    setShowMasterResetModal(false);
    setMasterResetConfirmInput('');
  };

  const handleResetCurrentEditingSurah = () => {
    if (!editingSurah) return;
    resetSurahLedgerEntry(editingSurah.number, 'all');
    setModalMemorizedPages(0);
    setModalMemorizedStatus('not_started');
    setModalRevisionStatus('unrevised');
    setModalMasteryStrength(1);
    setModalReadStatus('unread');
    setModalReadPages(0);
    setModalNotes('');
    showFeedback(`✓ Surah ${editingSurah.number} (${editingSurah.nameTransliteration}) reset to pristine clean state.`);
    setEditingSurah(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ── ACTION FEEDBACK NOTIFICATION TOAST ── */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-gradient-to-r from-[#17201a] via-[#101713] to-[#17201a] border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-zinc-400 hover:text-white p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP ANALYTICS OVERVIEW ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141824] via-[#0d1017] to-[#141824] border border-[#c5a059]/30 relative overflow-hidden shadow-lg">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color="#c5a059" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
              <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                114 SURAHS MASTER LEDGER
              </h3>
              <span className="text-[10px] font-mono uppercase bg-[#3a2e12] text-[#fef08a] px-2 py-0.5 rounded border border-[#c5a059]/50">
                CANONICAL MADANI MUSHAF (604 PAGES)
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Comprehensive personal covenant tracking for Hifdh (Memorisation), Muraja'ah (Revision), and Tilawah (Reading).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setBulkActionType('mark_short_memorized');
                setShowBulkModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono transition cursor-pointer"
            >
              Quick Preset: Juz 'Amma
            </button>

            <button
              onClick={() => {
                setMasterResetScope('all');
                setMasterResetConfirmInput('');
                setShowMasterResetModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-mono transition cursor-pointer flex items-center gap-1.5 font-bold shadow-sm"
              title="Reset Ledger Options (Single Stream or Complete 114 Surahs)"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
              <span>Reset Ledger</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('quran-revision')}
                className="p-1.5 rounded-xl bg-black/40 hover:bg-white/5 border border-[#c5a059]/30 text-[#fef08a] text-xs font-mono transition cursor-pointer"
                title="View Quran Guide"
              >
                <HelpCircle className="h-4 w-4 text-[#c5a059]" />
              </button>
            )}
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {/* 1. Hifdh (Memorisation) */}
          <div className="p-3.5 bg-black/40 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> HIFDH (MEMORISED)
              </span>
              <span className="text-xs font-mono text-white font-bold">
                {stats.hifdhPercent}%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-zinc-400">Memorised Pages:</span>
              <span className="text-emerald-300 font-bold text-sm">
                {stats.totalMemorizedPages} <span className="text-zinc-500 text-xs">/ 604</span>
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.hifdhPercent}%` }}
              />
            </div>
            <div className="text-[11px] font-sans text-zinc-400 flex items-center justify-between pt-0.5">
              <span>{stats.memorizedSurahsCount} Completed</span>
              <span>{stats.inProgressMemorizingCount} In Progress</span>
            </div>
          </div>

          {/* 2. Muraja'ah (Revision Health) */}
          <div className="p-3.5 bg-black/40 border border-[#c5a059]/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#fef08a] font-bold uppercase flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-[#c5a059]" /> MURAJA'AH (REVISION)
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Active Ledger
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono">
              <div className="p-1 rounded bg-[#3a2e12]/40 border border-[#c5a059]/20">
                <span className="text-[9px] text-[#c5a059] block">MASTERED</span>
                <span className="text-xs font-bold text-white">{stats.masteredRevisionCount}</span>
              </div>
              <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/20">
                <span className="text-[9px] text-emerald-400 block">FRESH</span>
                <span className="text-xs font-bold text-white">{stats.freshRevisionCount}</span>
              </div>
              <div className="p-1 rounded bg-amber-950/40 border border-amber-500/20">
                <span className="text-[9px] text-amber-400 block">DUE</span>
                <span className="text-xs font-bold text-white">{stats.dueRevisionCount}</span>
              </div>
            </div>
            <p className="text-[11px] font-sans text-zinc-400 text-center pt-0.5">
              Rated across 1–5 stars mastery retention strength.
            </p>
          </div>

          {/* 3. Tilawah (Reading / Khatmah) */}
          <div className="p-3.5 bg-black/40 border border-cyan-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> TILAWAH (READING)
              </span>
              <span className="text-xs font-mono text-white font-bold">
                {stats.tilawahPercent}%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-zinc-400">Surahs Read:</span>
              <span className="text-cyan-300 font-bold text-sm">
                {stats.readSurahsCount} <span className="text-zinc-500 text-xs">/ 114</span>
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.tilawahPercent}%` }}
              />
            </div>
            <div className="text-[11px] font-sans text-zinc-400 flex items-center justify-between pt-0.5">
              <span>{stats.totalReadPages} / 604 Pages Read</span>
              <button
                onClick={() => {
                  setBulkActionType('mark_all_read');
                  setShowBulkModal(true);
                }}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                Seal Khatmah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH, CONTROLS & FILTER BAR ── */}
      <div className="p-3 rounded-xl bg-[#0c0e14] border border-[#c5a059]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#c5a059]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, number, or translation..."
            className="w-full bg-black/60 text-white pl-9 pr-8 py-2 rounded-xl border border-zinc-700/80 outline-none focus:border-[#c5a059] text-xs font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-black/50 border border-white/10 rounded-xl">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Card Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Compact Table List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Juz Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Juz:</span>
          <select
            value={selectedJuz}
            onChange={e => setSelectedJuz(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-black/60 text-zinc-200 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-[#c5a059]"
          >
            <option value="all">All Juz (1–30)</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
              <option key={j} value={j}>Juz {j}</option>
            ))}
          </select>
        </div>

        {/* Revelation Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={revelationFilter}
            onChange={e => setRevelationFilter(e.target.value as any)}
            className="bg-black/60 text-zinc-200 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-[#c5a059]"
          >
            <option value="all">All Origins</option>
            <option value="Meccan">Meccan (مكية)</option>
            <option value="Medinan">Medinan (مدنية)</option>
          </select>
        </div>
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'all', label: 'All Surahs', count: 114 },
          { id: 'memorized', label: 'Memorised', count: stats.memorizedSurahsCount },
          { id: 'memorizing', label: 'In Progress (Hifdh)', count: stats.inProgressMemorizingCount },
          { id: 'needs_revision', label: 'Needs Revision', count: stats.dueRevisionCount },
          { id: 'mastered_revision', label: 'Mastered', count: stats.masteredRevisionCount },
          { id: 'read', label: 'Read (Tilawah)', count: stats.readSurahsCount },
          { id: 'unread', label: 'Unread', count: 114 - stats.readSurahsCount }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setStatusFilter(cat.id as FilterCategory)}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === cat.id
                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold shadow-sm'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${
              statusFilter === cat.id ? 'bg-[#c5a059]/30 text-[#fef08a]' : 'bg-white/5 text-zinc-500'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── SURAH LIST OR CARD GRID ── */}
      {filteredSurahs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <BookOpen className="h-8 w-8 text-zinc-600 mx-auto" />
          <h4 className="font-display font-bold text-sm text-zinc-300">No surahs match your filters</h4>
          <p className="text-xs text-zinc-500 font-sans">
            Try adjusting your search query, Juz filter, or active status categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setRevelationFilter('all');
              setSelectedJuz('all');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] font-mono text-xs cursor-pointer mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ── CARD GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSurahs.map(surah => {
            const entry = ledger[surah.number];
            const isMemorized = entry?.memorizationStatus === 'completed';
            const isMemorizing = entry?.memorizationStatus === 'in_progress';
            const isRead = entry?.readStatus === 'completed';
            const isReading = entry?.readStatus === 'in_progress';
            const memorizedPages = entry?.memorizedPages ?? (isMemorized ? surah.totalPages : 0);
            const readPages = entry?.readPages ?? (isRead ? surah.totalPages : 0);
            const memPercent = Math.min(100, Math.round((memorizedPages / surah.totalPages) * 100));

            return (
              <div
                key={surah.number}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                  isMemorized
                    ? 'bg-gradient-to-br from-[#0c1410] to-[#080d0a] border-emerald-500/40 shadow-sm'
                    : isMemorizing
                    ? 'bg-gradient-to-br from-[#1c180e] to-[#0c0d12] border-[#c5a059]/40'
                    : 'bg-[#0a0d14]/90 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-black/60 border border-[#c5a059]/40 text-[#fef08a] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {surah.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display font-bold text-sm text-white">
                            {surah.nameTransliteration}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Juz {surah.juz}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans">
                          {surah.nameEnglish}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-arabic font-bold text-base text-[#fef08a] block leading-tight">
                        {surah.nameArabic}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {surah.revelationType} · {surah.totalAyahs} Ayahs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5 mt-2">
                    <span>Pages {surah.startPage}–{surah.endPage} ({surah.totalPages}p)</span>
                    {entry?.lastRevisedDate && (
                      <span className="text-amber-400/90">
                        Revised: {entry.lastRevisedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tri-Mode Controls Container */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  {/* TRACK 1: HIFDH (MEMORISATION) */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> HIFDH
                      </span>
                      
                      <button
                        onClick={e => handleCycleMemorization(surah.number, e)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                          isMemorized
                            ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                            : isMemorizing
                            ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isMemorized ? 'Memorised' : isMemorizing ? 'In Progress' : 'Not Started'}
                      </button>
                    </div>

                    {/* Page counter & progress */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-zinc-400">Pages Memorised:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={e => handleStepPages(surah.number, -1, 'memorized', e)}
                          disabled={memorizedPages <= 0}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="text-xs font-bold text-white w-10 text-center">
                          {memorizedPages}/{surah.totalPages}
                        </span>
                        <button
                          onClick={e => handleStepPages(surah.number, 1, 'memorized', e)}
                          disabled={memorizedPages >= surah.totalPages}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${memPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* TRACK 2: MURAJA'AH & MASTERY */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#c5a059] font-bold block">REVISION</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= (entry?.masteryStrength || 1)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={e => handleQuickRevised(surah.number, e)}
                        className="px-2 py-1 rounded-lg bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059]/40 text-[#fef08a] text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Mark Revised Today"
                      >
                        <RefreshCw className="h-2.5 w-2.5" /> Revised
                      </button>
                      <button
                        onClick={() => openEditModal(surah)}
                        className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Edit Surah Details"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSurahToReset(surah);
                          setSingleResetScope('all');
                        }}
                        className="p-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-zinc-400 transition cursor-pointer border border-transparent hover:border-rose-500/30"
                        title="Reset Surah Progress"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* TRACK 3: TILAWAH (READING) */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 text-xs font-mono">
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> TILAWAH
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">
                        {readPages}/{surah.totalPages}p
                      </span>
                      <button
                        onClick={e => handleCycleRead(surah.number, e)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                          isRead
                            ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300'
                            : isReading
                            ? 'bg-blue-950 border-blue-500/50 text-blue-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isRead ? 'Read' : isReading ? 'Reading' : 'Unread'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Covenant Note preview if present */}
                {entry?.notes && (
                  <div className="text-[11px] text-zinc-400 italic bg-black/40 p-2 rounded-lg border border-white/5 flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-[#c5a059] shrink-0" />
                    <span className="truncate">{entry.notes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── HIGH-DENSITY COMPACT TABLE LIST VIEW ── */
        <div className="rounded-2xl border border-white/10 bg-[#0a0d14]/90 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141824] border-b border-white/10 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Surah</th>
                  <th className="py-2.5 px-3">Arabic</th>
                  <th className="py-2.5 px-3">Pages / Juz</th>
                  <th className="py-2.5 px-3">Hifdh (Memorised)</th>
                  <th className="py-2.5 px-3">Muraja'ah (Revision)</th>
                  <th className="py-2.5 px-3">Tilawah (Read)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSurahs.map(surah => {
                  const entry = ledger[surah.number];
                  const isMemorized = entry?.memorizationStatus === 'completed';
                  const isMemorizing = entry?.memorizationStatus === 'in_progress';
                  const isRead = entry?.readStatus === 'completed';
                  const memorizedPages = entry?.memorizedPages ?? (isMemorized ? surah.totalPages : 0);

                  return (
                    <tr
                      key={surah.number}
                      className="hover:bg-white/5 transition"
                    >
                      <td className="py-2.5 px-3 text-[#fef08a] font-bold">
                        {surah.number}
                      </td>
                      <td className="py-2.5 px-3">
                        <strong className="text-white block font-sans text-xs">
                          {surah.nameTransliteration}
                        </strong>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          {surah.nameEnglish}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-arabic text-sm text-[#fef08a]">
                        {surah.nameArabic}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {surah.startPage}–{surah.endPage} ({surah.totalPages}p) · J{surah.juz}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => handleCycleMemorization(surah.number)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                            isMemorized
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                              : isMemorizing
                              ? 'bg-amber-950 border-amber-500 text-amber-300'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {memorizedPages}/{surah.totalPages}p · {isMemorized ? 'Memorised' : isMemorizing ? 'In Progress' : 'Not Started'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickRevised(surah.number)}
                            className="px-2 py-0.5 rounded bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] text-[10px] font-bold cursor-pointer"
                          >
                            Revised
                          </button>
                          <span className="text-amber-400 text-[11px]">
                            {'★'.repeat(entry?.masteryStrength || 1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => handleCycleRead(surah.number)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                            isRead
                              ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {isRead ? 'Completed' : 'Unread'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(surah)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            title="Open Details Modal"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              setSurahToReset(surah);
                              setSingleResetScope('all');
                            }}
                            className="p-1 rounded bg-zinc-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-zinc-400 cursor-pointer transition border border-transparent hover:border-rose-500/30"
                            title="Reset Surah Progress"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SURAH EDIT & DETAIL MODAL ── */}
      <AnimatePresence>
        {editingSurah && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative border border-[#c5a059]/50 rounded-2xl max-w-lg w-full bg-gradient-to-b from-[#141824] via-[#0b0e14] to-[#07090e] p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color="#c5a059" />

              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] font-mono font-bold text-sm flex items-center justify-center">
                    {editingSurah.number}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      {editingSurah.nameTransliteration} ({editingSurah.nameArabic})
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">
                      {editingSurah.nameEnglish} · Pages {editingSurah.startPage}–{editingSurah.endPage} ({editingSurah.totalPages} pages)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSurah(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Controls */}
              <div className="space-y-3.5 text-xs font-mono">
                {/* 1. Memorisation Track */}
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                    1. HIFDH (MEMORISATION STATUS)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['not_started', 'in_progress', 'completed'] as SurahMemorizationStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => {
                          setModalMemorizedStatus(st);
                          if (st === 'completed') setModalMemorizedPages(editingSurah.totalPages);
                          else if (st === 'not_started') setModalMemorizedPages(0);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer capitalize ${
                          modalMemorizedStatus === st
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-zinc-400">Pages Memorised:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={editingSurah.totalPages}
                        value={modalMemorizedPages}
                        onChange={e => setModalMemorizedPages(Number(e.target.value) || 0)}
                        className="w-16 bg-black text-white text-center px-2 py-1 rounded border border-zinc-700"
                      />
                      <span className="text-zinc-500">/ {editingSurah.totalPages}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Revision & Mastery */}
                <div className="p-3 rounded-xl bg-black/40 border border-[#c5a059]/30 space-y-2">
                  <span className="text-[10px] text-[#fef08a] font-bold uppercase block">
                    2. MURAJA'AH & RETENTION STRENGTH
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['unrevised', 'due', 'fresh', 'mastered'] as SurahRevisionStatus[]).map(rev => (
                      <button
                        key={rev}
                        onClick={() => setModalRevisionStatus(rev)}
                        className={`py-1 px-1 rounded-lg border text-center transition cursor-pointer capitalize text-[10px] ${
                          modalRevisionStatus === rev
                            ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {rev}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-zinc-400">Mastery Retention (1–5):</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setModalMasteryStrength(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= modalMasteryStrength
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Tilawah Track */}
                <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                    3. TILAWAH (READING PROGRESS)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['unread', 'in_progress', 'completed'] as SurahReadStatus[]).map(rd => (
                      <button
                        key={rd}
                        onClick={() => {
                          setModalReadStatus(rd);
                          if (rd === 'completed') setModalReadPages(editingSurah.totalPages);
                          else if (rd === 'unread') setModalReadPages(0);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer capitalize ${
                          modalReadStatus === rd
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {rd.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes & Reminders */}
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">
                    Covenant Notes & Tajweed Focus:
                  </label>
                  <textarea
                    rows={2}
                    value={modalNotes}
                    onChange={e => setModalNotes(e.target.value)}
                    placeholder="e.g. Guard pause on ayah 15, reinforce transition between verses 8-9..."
                    className="w-full bg-black/60 text-white px-3 py-2 rounded-xl border border-zinc-700 text-xs font-sans outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={handleResetCurrentEditingSurah}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold cursor-pointer flex items-center gap-1.5 transition"
                  title="Reset all tracks of this Surah"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                  <span>Reset This Surah</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingSurah(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveModal}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#fef08a] text-black font-bold cursor-pointer hover:brightness-110 shadow"
                  >
                    Save Surah Covenant
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── BULK ACTION CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="border border-[#c5a059]/50 rounded-2xl max-w-sm w-full bg-[#141824] p-5 space-y-4">
              <h4 className="font-display font-bold text-sm text-white">
                Confirm Bulk Ledger Update
              </h4>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {bulkActionType === 'mark_all_read' && 'Are you sure you want to mark all 114 Surahs as read in this Khatmah cycle?'}
                {bulkActionType === 'reset_read' && 'Are you sure you want to reset reading progress on all 114 Surahs for a new Khatmah cycle?'}
                {bulkActionType === 'mark_short_memorized' && 'This will mark all 37 Surahs of Juz 30 (An-Naba through An-Nas) as completed and mastered in your Hifdh ledger.'}
              </p>
              <div className="flex items-center justify-end gap-2 font-mono text-xs pt-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBulkAction}
                  className="px-3 py-1.5 rounded-xl bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] font-bold cursor-pointer"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SINGLE SURAH RESET CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {surahToReset && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-rose-500/40 rounded-2xl max-w-md w-full bg-gradient-to-b from-[#181119] via-[#0f0d14] to-[#0a080d] p-5 space-y-4 shadow-2xl relative"
            >
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#f43f5e" />
              <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color="#f43f5e" />

              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 font-mono font-bold text-sm flex items-center justify-center">
                    {surahToReset.number}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">
                      Reset Surah {surahToReset.nameTransliteration}
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      {surahToReset.nameArabic} · Pages {surahToReset.startPage}–{surahToReset.endPage} ({surahToReset.totalPages}p)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSurahToReset(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase text-zinc-400 block font-bold">
                  Select Reset Scope:
                </span>

                <div className="space-y-1.5">
                  {[
                    { id: 'all', title: 'Full Reset (All Streams)', desc: 'Clear Hifdh, Revision, Tilawah, and notes back to 0.' },
                    { id: 'memorization', title: 'Reset Hifdh (Memorisation) Only', desc: 'Set to not started (0 pages memorised).' },
                    { id: 'revision', title: 'Reset Muraja\'ah (Revision) Only', desc: 'Clear revision dates and reset mastery strength.' },
                    { id: 'read', title: 'Reset Tilawah (Reading) Only', desc: 'Set to unread (0 pages read) for a fresh cycle.' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingleResetScope(opt.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        singleResetScope === opt.id
                          ? 'bg-rose-950/60 border-rose-500 text-white font-bold shadow-sm'
                          : 'bg-black/40 border-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={singleResetScope === opt.id ? 'text-rose-300' : 'text-zinc-300'}>
                          {opt.title}
                        </span>
                        {singleResetScope === opt.id && (
                          <Check className="h-3.5 w-3.5 text-rose-400" />
                        )}
                      </div>
                      <p className="text-[11px] font-sans text-zinc-500 mt-0.5 font-normal">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 font-mono text-xs pt-2 border-t border-white/10">
                <button
                  onClick={() => setSurahToReset(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSingleReset}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow transition flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Execute Reset</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MASTER 114 SURAHS LEDGER RESET MODAL ── */}
      <AnimatePresence>
        {showMasterResetModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-rose-500/50 rounded-2xl max-w-lg w-full bg-gradient-to-b from-[#1b1016] via-[#100a0e] to-[#070507] p-5 sm:p-6 space-y-4 shadow-2xl relative"
            >
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#f43f5e" />
              <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color="#f43f5e" />

              <div className="flex items-start justify-between border-b border-rose-500/20 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-rose-400" />
                    <h3 className="font-display font-bold text-base text-white">
                      114 Surahs Master Ledger Reset
                    </h3>
                  </div>
                  <p className="text-xs text-rose-300/80 font-arabic">
                    إِعَادَةُ تَعْيِينِ سِجِلِّ القُرْآنِ الكَرِيمِ (١١٤ سُورَة)
                  </p>
                </div>
                <button
                  onClick={() => setShowMasterResetModal(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Choose the scope of data you wish to reset across the <strong>114 canonical Surahs</strong> of the Madani Mus'haf:
              </p>

              <div className="space-y-2 text-xs font-mono">
                {[
                  {
                    id: 'all',
                    title: 'Full Reset (All 114 Surahs Clean Slate)',
                    desc: 'Wipes all Hifdh (memorisation), Muraja\'ah (revision), and Tilawah (reading) records across all 114 Surahs back to original state.',
                    badge: 'COMPLETE WIPE'
                  },
                  {
                    id: 'read',
                    title: 'Reset Tilawah / Reading Only (New Khatmah)',
                    desc: 'Sets all 114 Surahs to unread (0/604 pages) so you can start a fresh reading cycle from Al-Fatihah, without touching memorisation.',
                    badge: 'NEW KHATMAH'
                  },
                  {
                    id: 'revision',
                    title: 'Reset Muraja\'ah / Revision Cycles',
                    desc: 'Clears revision dates, revision counts, and returns mastery strength to 1-star unrevised across all surahs.',
                    badge: 'REVISION RESET'
                  },
                  {
                    id: 'memorization',
                    title: 'Reset Hifdh / Memorisation Only',
                    desc: 'Sets all 114 Surahs to not-started (0 pages memorised) while keeping reading logs intact.',
                    badge: 'HIFDH RESET'
                  }
                ].map(scope => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setMasterResetScope(scope.id as any)}
                    className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                      masterResetScope === scope.id
                        ? 'bg-rose-950/70 border-rose-500 text-white shadow-md'
                        : 'bg-black/50 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${masterResetScope === scope.id ? 'text-rose-200' : 'text-zinc-200'}`}>
                        {scope.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                        {scope.badge}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-zinc-400 mt-1 leading-normal">
                      {scope.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Safety Confirmation Input for Full Wipe */}
              {masterResetScope === 'all' && (
                <div className="p-3 rounded-xl bg-black/60 border border-rose-500/40 space-y-2">
                  <span className="text-[11px] font-mono text-rose-300 font-bold block">
                    Security Safeguard: Type "RESET" to confirm full wipe:
                  </span>
                  <input
                    type="text"
                    value={masterResetConfirmInput}
                    onChange={e => setMasterResetConfirmInput(e.target.value)}
                    placeholder="Type RESET"
                    className="w-full bg-black text-rose-200 px-3 py-1.5 rounded-lg border border-rose-500/50 text-xs font-mono outline-none uppercase placeholder:text-zinc-700"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 font-mono text-xs pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowMasterResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={masterResetScope === 'all' && masterResetConfirmInput.trim().toUpperCase() !== 'RESET'}
                  onClick={handleConfirmMasterReset}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow transition flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Confirm Master Reset</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
