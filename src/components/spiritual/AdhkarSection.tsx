import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun, Moon, Sparkles, CheckCircle2, Plus,
  Minus, RefreshCw, Heart, Award, HelpCircle, Check, Zap,
  Bed, BookOpen, Clock, Edit2, Trash2, Search, Filter,
  Volume2, Share2, Copy, AlertCircle, RotateCcw, Shield, Timer, Flame
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import {
  AdhkarItem,
  AdhkarCategory,
  AdhkarPrayerTarget,
  SpiritualDailyLog,
  AdhkarSessionStatus
} from '../../types';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';
import { SleepAdhkarModal } from './SleepAdhkarModal';
import { AdhkarFormModal } from './AdhkarFormModal';
import { PostSalahAdhkarModal } from './PostSalahAdhkarModal';
import { AdhkarFocusSessionModal } from './AdhkarFocusSessionModal';

interface AdhkarSectionProps {
  systemDate: string;
  spiritualLog: SpiritualDailyLog;
  onOpenGuide?: (section?: string) => void;
}

export const AdhkarSection: React.FC<AdhkarSectionProps> = ({
  systemDate,
  spiritualLog,
  onOpenGuide
}) => {
  const { 
    toggleAdhkar, 
    setAdhkarSessionStatus,
    cycleAdhkarSessionStatus,
    getAdhkarFortressStats,
    incrementSalawat, 
    setSalawatCount, 
    updateDhikrLog,
    adhkarList,
    addAdhkar,
    updateAdhkar,
    deleteAdhkar,
    resetDefaultAdhkar,
    incrementAdhkarRecitation,
    resetAdhkarRecitation,
    getAdhkarRecitationCount
  } = usePOS();

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<AdhkarCategory | 'all'>('all');
  const [activePrayerFilter, setActivePrayerFilter] = useState<AdhkarPrayerTarget | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Forms
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdhkarItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepModalTab, setSleepModalTab] = useState<'dhohr' | 'night'>('night');
  const [showPostSalahModal, setShowPostSalahModal] = useState(false);
  const [selectedPostPrayer, setSelectedPostPrayer] = useState<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>('fajr');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFocusSessionModal, setShowFocusSessionModal] = useState(false);
  const [focusSessionAdhkar, setFocusSessionAdhkar] = useState<AdhkarItem | null>(null);

  // Quick inputs
  const [salawatCustomInput, setSalawatCustomInput] = useState('');

  const adhkarSabah = spiritualLog.adhkarSabah;
  const adhkarMasa = spiritualLog.adhkarMasa;
  const adhkarSleepDhohr = spiritualLog.adhkarSleepDhohr;
  const adhkarSleepNight = spiritualLog.adhkarSleepNight;
  const salawatCount = spiritualLog.salawatCount || 0;
  const salawatTargetReached = salawatCount >= 70;

  const postMap = spiritualLog.dhikr?.postSalahAdhkar || {};
  const completedPostPrayersCount = (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).filter(p => {
    const mode = postMap[p];
    return mode === 'standard33' || mode === 'mini10';
  }).length;

  const fortressStats = getAdhkarFortressStats(systemDate);

  // Filtered Adhkar list
  const filteredAdhkar = useMemo(() => {
    return adhkarList.filter(item => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'post_salah' || (activeCategory as string) === 'postSalah') {
          if (item.category !== 'post_salah' && (item.category as string) !== 'postSalah') return false;
        } else if (activeCategory === 'sleep') {
          if (item.category !== 'sleep' && item.category !== 'sleep_dhohr' && item.category !== 'sleep_night') return false;
        } else if (item.category !== activeCategory) {
          return false;
        }
      }
      // Prayer target sub-filter for post_salah
      if ((activeCategory === 'post_salah' || (activeCategory as string) === 'postSalah') && activePrayerFilter !== 'all') {
        if (item.prayerTarget && item.prayerTarget !== 'all') {
          if (item.prayerTarget === 'fajr_maghrib') {
            if (activePrayerFilter !== 'fajr' && activePrayerFilter !== 'maghrib') return false;
          } else if (item.prayerTarget !== activePrayerFilter) {
            return false;
          }
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesArabic = item.arabicText.includes(searchQuery);
        const matchesTrans = item.transliteration?.toLowerCase().includes(q) || false;
        const matchesEng = item.translation.toLowerCase().includes(q);
        const matchesSource = item.source?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesArabic && !matchesTrans && !matchesEng && !matchesSource) {
          return false;
        }
      }
      return true;
    });
  }, [adhkarList, activeCategory, activePrayerFilter, searchQuery]);

  // Statistics
  const categoryCounts = useMemo(() => {
    return {
      all: adhkarList.length,
      morning: adhkarList.filter(a => a.category === 'morning').length,
      evening: adhkarList.filter(a => a.category === 'evening').length,
      post_salah: adhkarList.filter(a => a.category === 'post_salah' || (a.category as string) === 'postSalah').length,
      sleep_dhohr: adhkarList.filter(a => a.category === 'sleep_dhohr').length,
      sleep_night: adhkarList.filter(a => a.category === 'sleep_night').length,
      sleep: adhkarList.filter(a => a.category === 'sleep' || a.category === 'sleep_dhohr' || a.category === 'sleep_night').length,
      general: adhkarList.filter(a => a.category === 'general').length,
    };
  }, [adhkarList]);

  // Completed counts for today
  const completedTodayCount = useMemo(() => {
    return adhkarList.filter(item => {
      const count = getAdhkarRecitationCount(item.id, systemDate);
      return count >= item.targetCount;
    }).length;
  }, [adhkarList, getAdhkarRecitationCount, systemDate]);

  const handleCopyArabic = (item: AdhkarItem) => {
    const text = `${item.arabicText}\n\n${item.translation}\n(${item.title} - ${item.source || 'Adhkar'})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveForm = (data: Omit<AdhkarItem, 'id'>) => {
    if (editingItem) {
      updateAdhkar(editingItem.id, data);
      setEditingItem(null);
    } else {
      addAdhkar(data);
    }
  };

  const handleOpenEdit = (item: AdhkarItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteAdhkar(id);
    setDeletingItemId(null);
  };

  return (
    <div className="space-y-6" id="adhkar-section-root">
      {/* SACRED PROTOCOL HEADER BANNER */}
      <div className="glass-panel rounded-2xl p-5 border border-[var(--border-accent,#c5a059)] bg-gradient-to-r from-[var(--bg-void,#050608)] via-[var(--bg-card,#0c0e14)] to-[var(--bg-void,#050608)] relative overflow-hidden shadow-xl">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright,#fef08a)]" />
              <span className="text-[10px] font-mono text-[var(--accent-highlight,#fef08a)] font-bold tracking-widest uppercase">
                SACRED PROTOCOL • REMEMBRANCE SANCTUM
              </span>
            </div>
            <h3 className="text-xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
              <span>ADHKĀR & SACRED LITANIES</span>
              <span className="text-xs font-mono font-normal text-amber-200/80 px-2 py-0.5 bg-[var(--accent-surface,#c5a059)]/20 border border-[var(--border-accent,#c5a059)]/30 rounded-full">
                أَلاَ بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </span>
            </h3>
            <p className="text-xs text-zinc-300 font-sans max-w-2xl">
              Preserve the morning, evening, post-salah, and nocturnal litanies. Add custom supplications, customize repetition counts, and illuminate the heart through continuous dhikr.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] hover:brightness-110 text-[var(--bg-void,#050608)] font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>ENROLL NEW DHIKR</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 bg-[var(--bg-surface,#141824)] hover:bg-[var(--accent-surface,#c5a059)]/20 border border-[var(--border-subtle,rgba(197,160,89,0.2))] text-zinc-300 hover:text-white font-mono text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Reset all adhkar to authentic Sunnah defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>DEFAULTS</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('spiritual-core')}
                className="p-2 bg-[var(--bg-surface,#141824)] hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl transition cursor-pointer"
                title="Sacred Manual"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Sacred Stat Strip: Fortress Integrity & Streaks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[var(--border-subtle,rgba(197,160,89,0.2))] text-xs font-mono">
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">FORTRESS INTEGRITY</span>
              <Shield className="h-3 w-3 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-[var(--accent-highlight,#fef08a)]">
                {fortressStats.integrityScore}%
              </span>
              <span className="text-[10px] text-zinc-400">
                {fortressStats.statusLabelAr}
              </span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${
                  fortressStats.integrityScore === 100 ? 'bg-emerald-400' :
                  fortressStats.integrityScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${fortressStats.integrityScore}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">FORTRESS STREAK</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {fortressStats.currentStreak} Days
              </span>
              <span className="text-[10px] text-zinc-400">
                Avg: {fortressStats.sevenDayAverage}%
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 block">
              Consistency is your shield
            </span>
          </div>

          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">3 SACRED SESSIONS</span>
            <span className="text-xs font-bold text-zinc-200 mt-1 flex items-center gap-1 flex-wrap">
              <span className={fortressStats.morningStatus === 'complete' ? 'text-emerald-400' : fortressStats.morningStatus === 'in_progress' ? 'text-amber-300' : 'text-zinc-500'}>
                {fortressStats.morningStatus === 'complete' ? '🌅 Sabah ✓' : fortressStats.morningStatus === 'in_progress' ? '🌅 Sabah (⏳)' : '🌅 Sabah'}
              </span>
              <span>•</span>
              <span className={fortressStats.eveningStatus === 'complete' ? 'text-emerald-400' : fortressStats.eveningStatus === 'in_progress' ? 'text-amber-300' : 'text-zinc-500'}>
                {fortressStats.eveningStatus === 'complete' ? '🌇 Masa ✓' : fortressStats.eveningStatus === 'in_progress' ? '🌇 Masa (⏳)' : '🌇 Masa'}
              </span>
              <span>•</span>
              <span className={fortressStats.sleepStatus === 'complete' ? 'text-emerald-400' : fortressStats.sleepStatus === 'in_progress' ? 'text-amber-300' : 'text-zinc-500'}>
                {fortressStats.sleepStatus === 'complete' ? '🌙 Sleep ✓' : fortressStats.sleepStatus === 'in_progress' ? '🌙 Sleep (⏳)' : '🌙 Sleep'}
              </span>
            </span>
          </div>

          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">TOTAL PROTOCOLS</span>
            <span className="text-base font-bold text-white mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {completedTodayCount} / {adhkarList.length} Items
            </span>
            <span className="text-[9px] text-zinc-500 mt-0.5 block">
              Continuous Adhkar
            </span>
          </div>
        </div>
      </div>

      {/* 3 DAILY SACRED SESSIONS: MORNING, EVENING, SLEEP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              THE THREE FORTRESS SESSIONS • جُنَنُ الْحِمَايَةِ الثَّلَاث
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            States: Not Started • In Progress • Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Morning Session */}
          <div className={`p-4 rounded-2xl border transition-all shadow-md flex flex-col justify-between space-y-3 ${
            fortressStats.morningStatus === 'complete'
              ? 'bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/20'
              : fortressStats.morningStatus === 'in_progress'
              ? 'bg-amber-950/30 border-amber-500/40 shadow-amber-950/20'
              : 'bg-[var(--bg-card,#0c0e14)] hover:bg-[var(--accent-surface,#c5a059)]/10 border-[var(--border-subtle,rgba(197,160,89,0.2))]'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  fortressStats.morningStatus === 'complete'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : fortressStats.morningStatus === 'in_progress'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}>
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-300/80 font-bold block">SACRED DAWN LITANY</span>
                  <h4 className="text-sm font-display font-bold text-white">Morning Adhkār (أذكار الصباح)</h4>
                  <span className="text-[10px] font-mono text-zinc-400">After Fajr until Sunrise</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold capitalize ${
                fortressStats.morningStatus === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                fortressStats.morningStatus === 'in_progress' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {fortressStats.morningStatus === 'complete' ? '✓ Complete' :
                 fortressStats.morningStatus === 'in_progress' ? '⏳ In Progress' : 'Not Started'}
              </span>
            </div>

            {/* 3-State Segmented Selector */}
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('morning', 'not_started', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.morningStatus === 'not_started'
                    ? 'bg-zinc-700 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Not Started
              </button>
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('morning', 'in_progress', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.morningStatus === 'in_progress'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('morning', 'complete', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.morningStatus === 'complete'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Complete ✓
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => cycleAdhkarSessionStatus('morning', systemDate)}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-amber-400" />
                <span>Tap to Cycle</span>
              </button>
              <button
                onClick={() => setActiveCategory('morning')}
                className="text-[var(--accent-bright,#fef08a)] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
              >
                <span>View Litanies</span>
              </button>
            </div>
          </div>

          {/* 2. Evening Session */}
          <div className={`p-4 rounded-2xl border transition-all shadow-md flex flex-col justify-between space-y-3 ${
            fortressStats.eveningStatus === 'complete'
              ? 'bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/20'
              : fortressStats.eveningStatus === 'in_progress'
              ? 'bg-amber-950/30 border-amber-500/40 shadow-amber-950/20'
              : 'bg-[var(--bg-card,#0c0e14)] hover:bg-[var(--accent-surface,#c5a059)]/10 border-[var(--border-subtle,rgba(197,160,89,0.2))]'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  fortressStats.eveningStatus === 'complete'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : fortressStats.eveningStatus === 'in_progress'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}>
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-300/80 font-bold block">SACRED SUNSET LITANY</span>
                  <h4 className="text-sm font-display font-bold text-white">Evening Adhkār (أذكار المساء)</h4>
                  <span className="text-[10px] font-mono text-zinc-400">After ‘Asr until Maghrib</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold capitalize ${
                fortressStats.eveningStatus === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                fortressStats.eveningStatus === 'in_progress' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {fortressStats.eveningStatus === 'complete' ? '✓ Complete' :
                 fortressStats.eveningStatus === 'in_progress' ? '⏳ In Progress' : 'Not Started'}
              </span>
            </div>

            {/* 3-State Segmented Selector */}
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('evening', 'not_started', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.eveningStatus === 'not_started'
                    ? 'bg-zinc-700 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Not Started
              </button>
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('evening', 'in_progress', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.eveningStatus === 'in_progress'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('evening', 'complete', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.eveningStatus === 'complete'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Complete ✓
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => cycleAdhkarSessionStatus('evening', systemDate)}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-indigo-400" />
                <span>Tap to Cycle</span>
              </button>
              <button
                onClick={() => setActiveCategory('evening')}
                className="text-[var(--accent-bright,#fef08a)] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
              >
                <span>View Litanies</span>
              </button>
            </div>
          </div>

          {/* 3. Sleep Session */}
          <div className={`p-4 rounded-2xl border transition-all shadow-md flex flex-col justify-between space-y-3 ${
            fortressStats.sleepStatus === 'complete'
              ? 'bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/20'
              : fortressStats.sleepStatus === 'in_progress'
              ? 'bg-amber-950/30 border-amber-500/40 shadow-amber-950/20'
              : 'bg-[var(--bg-card,#0c0e14)] hover:bg-[var(--accent-surface,#c5a059)]/10 border-[var(--border-subtle,rgba(197,160,89,0.2))]'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  fortressStats.sleepStatus === 'complete'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : fortressStats.sleepStatus === 'in_progress'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}>
                  <Bed className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-purple-300/80 font-bold block">SACRED SLEEP REPOSE</span>
                  <h4 className="text-sm font-display font-bold text-white">Sleep Adhkār (أذكار النوم)</h4>
                  <span className="text-[10px] font-mono text-zinc-400">Bedtime Protection Shield</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold capitalize ${
                fortressStats.sleepStatus === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                fortressStats.sleepStatus === 'in_progress' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {fortressStats.sleepStatus === 'complete' ? '✓ Complete' :
                 fortressStats.sleepStatus === 'in_progress' ? '⏳ In Progress' : 'Not Started'}
              </span>
            </div>

            {/* 3-State Segmented Selector */}
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('sleep', 'not_started', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.sleepStatus === 'not_started'
                    ? 'bg-zinc-700 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Not Started
              </button>
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('sleep', 'in_progress', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.sleepStatus === 'in_progress'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setAdhkarSessionStatus('sleep', 'complete', systemDate)}
                className={`py-1 rounded-lg text-center font-bold transition cursor-pointer ${
                  fortressStats.sleepStatus === 'complete'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Complete ✓
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => cycleAdhkarSessionStatus('sleep', systemDate)}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-purple-400" />
                <span>Tap to Cycle</span>
              </button>
              <button
                onClick={() => {
                  setSleepModalTab('night');
                  setShowSleepModal(true);
                }}
                className="text-[var(--accent-bright,#fef08a)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Shield className="h-3 w-3" />
                <span>Read Sleep Shield</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SEPARATE TASBĪḤ & ISTIGHFĀR SECTION */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-bright,#fef08a)]" />
            <div>
              <h4 className="text-sm font-display font-bold text-white uppercase tracking-wide">
                TASBĪḤ, ISTIGHFĀR &amp; SALAWĀT • التَّسْبِيحُ وَالاسْتِغْفَار
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">
                Tracked separately from defense sessions • Consistency &amp; heart presence are primary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Worship Over Gamification
            </span>
          </div>
        </div>

        {/* 6 Separate Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          {/* 1. SubhanAllah */}
          {(() => {
            const currentSubhan = spiritualLog.dhikr?.tasbeehCount || 0;
            return (
              <div className="p-3 bg-[var(--bg-card,#0c0e14)] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">SUBḤĀN ALLĀH</span>
                  <span className="text-xs font-serif font-bold text-amber-200 block mt-0.5">سُبْحَانَ اللَّه</span>
                  <div className="text-lg font-display font-bold text-white mt-1">
                    {currentSubhan} <span className="text-[10px] text-zinc-500 font-normal">/ 33</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => updateDhikrLog({ tasbeehCount: currentSubhan + 1 }, systemDate)}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ tasbeehCount: currentSubhan + 33 }, systemDate)}
                    className="flex-1 py-1 bg-amber-950/40 text-amber-300 border border-amber-500/30 rounded font-bold transition cursor-pointer"
                  >
                    +33
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ tasbeehCount: 0 }, systemDate)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 2. Alhamdulillah */}
          {(() => {
            const currentHamd = spiritualLog.dhikr?.hamdCount || 0;
            return (
              <div className="p-3 bg-[var(--bg-card,#0c0e14)] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">AL-ḤAMDULILLĀH</span>
                  <span className="text-xs font-serif font-bold text-emerald-200 block mt-0.5">الْحَمْدُ لِلَّه</span>
                  <div className="text-lg font-display font-bold text-white mt-1">
                    {currentHamd} <span className="text-[10px] text-zinc-500 font-normal">/ 33</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => updateDhikrLog({ hamdCount: currentHamd + 1 }, systemDate)}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ hamdCount: currentHamd + 33 }, systemDate)}
                    className="flex-1 py-1 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 rounded font-bold transition cursor-pointer"
                  >
                    +33
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ hamdCount: 0 }, systemDate)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 3. Allahu Akbar */}
          {(() => {
            const currentTakbir = spiritualLog.dhikr?.takbirCount || 0;
            return (
              <div className="p-3 bg-[var(--bg-card,#0c0e14)] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">ALLĀHU AKBAR</span>
                  <span className="text-xs font-serif font-bold text-cyan-200 block mt-0.5">اللَّهُ أَكْبَر</span>
                  <div className="text-lg font-display font-bold text-white mt-1">
                    {currentTakbir} <span className="text-[10px] text-zinc-500 font-normal">/ 34</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => updateDhikrLog({ takbirCount: currentTakbir + 1 }, systemDate)}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ takbirCount: currentTakbir + 34 }, systemDate)}
                    className="flex-1 py-1 bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 rounded font-bold transition cursor-pointer"
                  >
                    +34
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ takbirCount: 0 }, systemDate)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 4. Astaghfirullah */}
          {(() => {
            const currentIstighfar = spiritualLog.dhikr?.istighfarCount || 0;
            return (
              <div className="p-3 bg-[var(--bg-card,#0c0e14)] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">ISTIGHFĀR</span>
                  <span className="text-xs font-serif font-bold text-indigo-200 block mt-0.5">أَسْتَغْفِرُ اللَّه</span>
                  <div className="text-lg font-display font-bold text-white mt-1">
                    {currentIstighfar} <span className="text-[10px] text-zinc-500 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => updateDhikrLog({ istighfarCount: currentIstighfar + 1 }, systemDate)}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ istighfarCount: currentIstighfar + 10 }, systemDate)}
                    className="flex-1 py-1 bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 rounded font-bold transition cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ istighfarCount: 0 }, systemDate)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 5. La Ilaha Illallah */}
          {(() => {
            const currentTahlil = spiritualLog.dhikr?.tahlilCount || 0;
            return (
              <div className="p-3 bg-[var(--bg-card,#0c0e14)] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">TAHLĪL</span>
                  <span className="text-xs font-serif font-bold text-violet-200 block mt-0.5">لَا إِلَهَ إِلَّا اللَّه</span>
                  <div className="text-lg font-display font-bold text-white mt-1">
                    {currentTahlil} <span className="text-[10px] text-zinc-500 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => updateDhikrLog({ tahlilCount: currentTahlil + 1 }, systemDate)}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ tahlilCount: currentTahlil + 10 }, systemDate)}
                    className="flex-1 py-1 bg-violet-950/40 text-violet-300 border border-violet-500/30 rounded font-bold transition cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => updateDhikrLog({ tahlilCount: 0 }, systemDate)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 6. Salawat */}
          <div className="p-3 bg-[var(--bg-card,#0c0e14)] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">SALAWĀT PROPHETIC</span>
              <span className="text-xs font-serif font-bold text-rose-300 block mt-0.5">صَلَّى اللَّهُ عَلَيْهِ وَسَلَّم</span>
              <div className="text-lg font-display font-bold text-white mt-1">
                {salawatCount} <span className="text-[10px] text-zinc-500 font-normal">/ 70</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={() => incrementSalawat(1, systemDate)}
                className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={() => incrementSalawat(10, systemDate)}
                className="flex-1 py-1 bg-rose-950/40 text-rose-300 border border-rose-500/30 rounded font-bold transition cursor-pointer"
              >
                +10
              </button>
              <button
                onClick={() => setSalawatCount(0, systemDate)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Post-Salah Quick Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Post-Salah Adhkār (5 Obligatory Farā&apos;iḍ):</span>
            <span className="text-emerald-400 font-bold">{completedPostPrayersCount}/5 Prayers Sealed</span>
          </div>
          <div className="flex items-center gap-2">
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(p => {
              const mode = postMap[p];
              return (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPostPrayer(p);
                    setShowPostSalahModal(true);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold border uppercase transition cursor-pointer ${
                    mode === 'standard33' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' :
                    mode === 'mini10' ? 'bg-teal-950 border-teal-500 text-teal-300' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER & CLASSIFICATION TABS CONTROL BAR */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Classification Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <button
              onClick={() => { setActiveCategory('all'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[var(--accent-primary,#c5a059)] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>ALL ADHKĀR</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.all}</span>
            </button>

            <button
              onClick={() => { setActiveCategory('morning'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'morning'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>MORNING (صباح)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.morning}</span>
            </button>

            <button
              onClick={() => { setActiveCategory('evening'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'evening'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>EVENING (مساء)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.evening}</span>
            </button>

            <button
              onClick={() => { setActiveCategory('post_salah'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'post_salah' || (activeCategory as string) === 'postSalah'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>POST-SALAH (بعد الصلاة)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.post_salah}</span>
            </button>

            <button
              onClick={() => { setActiveCategory('sleep_dhohr'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'sleep_dhohr'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>NOON SLEEP (القيلولة)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.sleep_dhohr}</span>
            </button>

            <button
              onClick={() => { setActiveCategory('sleep_night'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'sleep_night'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bed className="h-3.5 w-3.5" />
              <span>NIGHT SLEEP (نوم الليل)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.sleep_night}</span>
            </button>

            <button
              onClick={() => { setActiveCategory('general'); setActivePrayerFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'general'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>GENERAL (عام)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">{categoryCounts.general}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="h-3.5 w-3.5 text-[var(--accent-bright,#fef08a)] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, arabic, or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filter for Post-Salah by Prayer */}
        {activeCategory === 'post_salah' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 p-2.5 bg-[var(--accent-surface,#c5a059)]/10 border border-[var(--border-accent,#c5a059)]/30 rounded-xl"
          >
            <span className="text-[10px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold flex items-center gap-1">
              <Clock className="h-3 w-3" /> PRAYER TARGET:
            </span>
            {[
              { id: 'all', label: 'All Prayers' },
              { id: 'fajr', label: 'Fajr (Dawn)' },
              { id: 'dhuhr', label: 'Dhuhr (Midday)' },
              { id: 'asr', label: '‘Asr (Afternoon)' },
              { id: 'maghrib', label: 'Maghrib (Sunset)' },
              { id: 'isha', label: '‘Ishā’ (Night)' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setActivePrayerFilter(p.id as AdhkarPrayerTarget | 'all')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition ${
                  activePrayerFilter === p.id
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'bg-black/40 text-zinc-300 hover:text-white border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* ADHKAR CARDS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAdhkar.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-card,#0c0e14)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-2xl space-y-3">
            <RubElHizbIcon className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-mono text-zinc-400">No sacred litanies match the active filters or search decree.</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); setActivePrayerFilter('all'); }}
              className="px-4 py-2 bg-[var(--accent-surface,#c5a059)]/20 border border-[var(--border-accent,#c5a059)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono rounded-xl hover:bg-[var(--accent-surface,#c5a059)]/40 transition"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        ) : (
          filteredAdhkar.map((item) => {
            const currentCount = getAdhkarRecitationCount(item.id, systemDate);
            const isCompleted = currentCount >= item.targetCount;
            const progressPercent = Math.min(100, Math.round((currentCount / item.targetCount) * 100));

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-lg ${
                  isCompleted
                    ? 'bg-gradient-to-r from-[var(--bg-card,#0c0e14)] via-[var(--accent-surface,#c5a059)]/10 to-[var(--bg-card,#0c0e14)] border-[var(--accent-bright,#fef08a)]/60 shadow-[0_0_20px_var(--glow-color,rgba(197,160,89,0.15))]'
                    : 'bg-[var(--bg-card,#0c0e14)] hover:border-[var(--border-strong,#c5a059)] border-[var(--border-subtle,rgba(197,160,89,0.2))]'
                }`}
              >
                {/* Visual Glow Ambient */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-primary,#c5a059)]/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                  {/* Left Metadata & Header */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase border ${
                        item.category === 'morning'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : item.category === 'evening'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                          : item.category === 'post_salah'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : item.category === 'sleep'
                          ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                      }`}>
                        {item.category.replace('_', ' ')}
                      </span>

                      {item.prayerTarget && item.category === 'post_salah' && (
                        <span className="text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md">
                          🕌 {item.prayerTarget.toUpperCase()}
                        </span>
                      )}

                      {item.isCustom && (
                        <span className="text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-md">
                          CUSTOM
                        </span>
                      )}

                      {item.source && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          📜 {item.source}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                      <span>{item.title}</span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                          <Check className="h-3 w-3" /> FULFILLED
                        </span>
                      )}
                    </h4>

                    {/* Arabic Text Display */}
                    {item.arabicText && (
                      <div className="p-4 bg-[var(--bg-void,#050608)]/90 border border-[var(--border-accent,#c5a059)]/30 rounded-xl my-2">
                        <p 
                          dir="rtl"
                          className="font-arabic text-lg sm:text-xl text-right text-amber-100/90 leading-loose tracking-wide select-all"
                        >
                          {item.arabicText}
                        </p>
                      </div>
                    )}

                    {/* Transliteration */}
                    {item.transliteration && (
                      <p className="text-xs font-mono text-[var(--accent-highlight,#fef08a)] italic">
                        "{item.transliteration}"
                      </p>
                    )}

                    {/* English Meaning */}
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {item.translation}
                    </p>

                    {/* Virtue / Reward Note */}
                    {item.virtue && (
                      <div className="text-[11px] text-[var(--accent-bright,#fef08a)]/90 bg-[var(--accent-surface,#c5a059)]/10 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-lg p-2 flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--accent-bright,#fef08a)] shrink-0 mt-0.5" />
                        <span><strong>Virtue:</strong> {item.virtue}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Digital Interactive Counter Beads */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-3 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle,rgba(197,160,89,0.2))]">
                    {/* Action icons row */}
                    <div className="flex items-center gap-1 self-end">
                      <button
                        onClick={() => handleCopyArabic(item)}
                        className="p-1.5 text-zinc-400 hover:text-[var(--accent-bright,#fef08a)] hover:bg-white/5 rounded-lg transition"
                        title="Copy Arabic & Meaning"
                      >
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                        title="Edit Dhikr Specs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                        title="Remove from Sacred Protocol"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setFocusSessionAdhkar(item);
                          setShowFocusSessionModal(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-[#e5c875] hover:bg-[#3a2e12]/60 rounded-lg transition"
                        title="Start Focus Session"
                      >
                        <Timer className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Digital Counter Display */}
                    <div className="bg-[var(--bg-void,#050608)] border border-[var(--border-accent,#c5a059)]/40 rounded-2xl p-3 flex flex-col items-center gap-2 min-w-[160px] shadow-inner">
                      <div className="text-[9px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                        RECITATIONS BEATS
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => incrementAdhkarRecitation(item.id, -1, systemDate)}
                          disabled={currentCount <= 0}
                          className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <div className="text-center">
                          <div className={`text-2xl font-mono font-extrabold transition-all ${
                            isCompleted ? 'text-[var(--accent-highlight,#fef08a)] drop-shadow-[0_0_8px_var(--glow-color)]' : 'text-white'
                          }`}>
                            {currentCount}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            / {item.targetCount} Target
                          </div>
                        </div>

                        <button
                          onClick={() => incrementAdhkarRecitation(item.id, 1, systemDate)}
                          className="h-9 w-9 rounded-xl bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] hover:brightness-110 text-[var(--bg-void,#050608)] flex items-center justify-center font-bold text-base transition shadow-md cursor-pointer active:scale-95"
                        >
                          <Plus className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-[var(--accent-primary,#c5a059)] to-[var(--accent-bright,#fef08a)] h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Quick Bulk Complete & Reset */}
                      <div className="flex items-center gap-2 pt-1 w-full">
                        <button
                          onClick={() => incrementAdhkarRecitation(item.id, item.targetCount - currentCount, systemDate)}
                          className="flex-1 py-1 bg-[var(--accent-surface,#c5a059)]/20 hover:bg-[var(--accent-surface,#c5a059)]/40 border border-[var(--border-accent,#c5a059)]/30 text-[10px] font-mono text-[var(--accent-highlight,#fef08a)] font-bold rounded-lg transition text-center"
                        >
                          FULFILL ({item.targetCount}x)
                        </button>
                        <button
                          onClick={() => resetAdhkarRecitation(item.id, systemDate)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/5"
                          title="Reset count for today"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingItemId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--bg-card,#0c0e14)] border border-rose-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-white uppercase">REMOVE SACRED LITANY?</h4>
                  <p className="text-xs text-zinc-400">This dhikr will be archived from your active Sacred Protocol.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeletingItemId(null)}
                  className="px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white rounded-xl hover:bg-white/5"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deletingItemId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  CONFIRM DELETION
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET TO DEFAULTS CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--bg-card,#0c0e14)] border border-[var(--border-accent,#c5a059)] rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent-surface,#c5a059)]/20 border border-[var(--border-accent,#c5a059)] text-[var(--accent-highlight,#fef08a)]">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-white uppercase">RESTORE AUTHENTIC DEFAULTS?</h4>
                  <p className="text-xs text-zinc-400">Restore the pristine library of Sunnah morning, evening, post-salah, and nocturnal litanies.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white rounded-xl hover:bg-white/5"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    resetDefaultAdhkar();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] font-mono font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  RESTORE DEFAULTS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADHKAR FORM MODAL (ADD / EDIT) */}
      <AdhkarFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveForm}
        initialItem={editingItem}
      />

      {/* SLEEP ADHKAR MODAL */}
      <SleepAdhkarModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        systemDate={systemDate}
        initialTab={sleepModalTab}
      />

      {/* POST-SALAH ADHKAR MODAL */}
      <PostSalahAdhkarModal
        isOpen={showPostSalahModal}
        onClose={() => setShowPostSalahModal(false)}
        systemDate={systemDate}
        initialPrayer={selectedPostPrayer}
      />

      {/* ADHKAR FOCUS SESSION MODAL */}
      <AdhkarFocusSessionModal
        isOpen={showFocusSessionModal}
        onClose={() => {
          setShowFocusSessionModal(false);
          setFocusSessionAdhkar(null);
        }}
        initialAdhkar={focusSessionAdhkar}
      />
    </div>
  );
};
