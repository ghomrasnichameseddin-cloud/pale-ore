import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity, Weakness, MuhasabahEntry, WeeklyMuhasabahSummary } from '../types';
import { MuhasabahModal } from './MuhasabahModal';
import { DailyBalanceScale } from './DailyBalanceScale';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { 
  Scale, Shield, Flame, Heart, MessageSquare, Clock, AlertTriangle, 
  Sparkles, Plus, Search, Filter, Pickaxe, CheckCircle2, 
  ChevronRight, Lock, Trash2, Eye, EyeOff, HeartHandshake, Coins, Zap, ShieldAlert,
  ShieldCheck, ArrowUpDown, ArrowDown, ArrowUp, Calendar, Layers, X, Info,
  FileText, BookOpen, CalendarDays, History, Check, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_COLORS: Record<MuhasabahCategory, { text: string; bg: string; border: string; icon: any }> = {
  Obligations: { text: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-500/40', icon: Shield },
  Desires: { text: 'text-rose-400', bg: 'bg-rose-950/30', border: 'border-rose-500/40', icon: EyeOff },
  Speech: { text: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/40', icon: MessageSquare },
  Heart: { text: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-500/40', icon: Heart },
  Rights: { text: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-500/40', icon: HeartHandshake },
  'Wasted Potential': { text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/40', icon: Clock }
};

const SEVERITY_ORDER: Record<MuhasabahSeverity, number> = {
  Critical: 5,
  Severe: 4,
  Major: 3,
  Moderate: 2,
  Minor: 1
};

type SortField = 'time' | 'severity' | 'category' | 'xp';
type SortOrder = 'desc' | 'asc';
type GroupMode = 'none' | 'category' | 'severity' | 'date';

interface MuhasabahViewProps {
  onNavigate?: (tab: any) => void;
  onOpenGuide?: (section?: string) => void;
}

export const MuhasabahView: React.FC<MuhasabahViewProps> = ({ onNavigate, onOpenGuide }) => {
  const { 
    state, getTodayMuhasabahStats, deleteMuhasabahEntry, 
    convertWeaknessToSeal, deleteWeakness, updateWeakness,
    addQuest, completeQuest, generateWeeklyMuhasabahSummary, saveAndArchiveWeeklySummary
  } = usePOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [entryToDelete, setEntryToDelete] = useState<MuhasabahEntry | null>(null);

  // Weekly Summary states
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<WeeklyMuhasabahSummary | null>(null);
  const [weeklyReflectionInput, setWeeklyReflectionInput] = useState('');
  const [savedSummarySuccess, setSavedSummarySuccess] = useState<string | null>(null);
  const [showSavedArchivesModal, setShowSavedArchivesModal] = useState(false);
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<WeeklyMuhasabahSummary | null>(null);
  const [injectedActionSuccess, setInjectedActionSuccess] = useState<string | null>(null);
  const [showRefineDrawer, setShowRefineDrawer] = useState(false);

  const [selectedEntryDetail, setSelectedEntryDetail] = useState<MuhasabahEntry | null>(null);
  const [prefillWeaknessId, setPrefillWeaknessId] = useState<string | undefined>(undefined);
  const [prefillCategory, setPrefillCategory] = useState<MuhasabahCategory | undefined>(undefined);
  const [sealForgeMessage, setSealForgeMessage] = useState<string | null>(null);

  const stats = getTodayMuhasabahStats();
  const entries = state.muhasabahEntries || [];
  const weaknesses = state.weaknesses || [];
  const savedSummaries = state.savedWeeklySummaries || [];

  // Real-time live weekly evaluation out of 10.0
  const liveWeeklySummary = useMemo(() => {
    return generateWeeklyMuhasabahSummary();
  }, [state.systemDate, state.spiritualLogs, state.muhasabahEntries, state.xpHistory, state.quests]);

  // Check if current systemDate is Friday
  const isFriday = useMemo(() => {
    try {
      const dt = new Date(`${state.systemDate || '2026-08-22'}T12:00:00`);
      return dt.getDay() === 5;
    } catch {
      return false;
    }
  }, [state.systemDate]);
  
  // Filtered and Sorted entries
  const processedEntries = useMemo(() => {
    const filtered = entries.filter(e => {
      const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchesSev = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchesSearch = searchQuery === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.reflection && e.reflection.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.weaknessName && e.weaknessName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSev && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'time') {
        const timeA = new Date(a.timestamp || a.date).getTime();
        const timeB = new Date(b.timestamp || b.date).getTime();
        comparison = timeA - timeB;
      } else if (sortField === 'severity') {
        const sevA = SEVERITY_ORDER[a.severity] || 1;
        const sevB = SEVERITY_ORDER[b.severity] || 1;
        comparison = sevA - sevB;
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'xp') {
        const xpA = a.xpDeducted || a.rawPenalty || 0;
        const xpB = b.xpDeducted || b.rawPenalty || 0;
        comparison = xpA - xpB;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [entries, categoryFilter, severityFilter, searchQuery, sortField, sortOrder]);

  // Grouped entries structure
  const groupedEntries = useMemo(() => {
    if (groupMode === 'none') {
      return [{ key: 'all', label: 'All Records', entries: processedEntries }];
    }

    const groupsMap = new Map<string, { label: string; entries: MuhasabahEntry[] }>();

    processedEntries.forEach(entry => {
      let groupKey = '';
      let groupLabel = '';

      if (groupMode === 'category') {
        groupKey = entry.category;
        groupLabel = `${entry.category} Realm`;
      } else if (groupMode === 'severity') {
        groupKey = entry.severity;
        groupLabel = `${entry.severity} Severity`;
      } else if (groupMode === 'date') {
        groupKey = entry.date;
        groupLabel = entry.date;
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, { label: groupLabel, entries: [] });
      }
      groupsMap.get(groupKey)!.entries.push(entry);
    });

    return Array.from(groupsMap.entries()).map(([key, val]) => ({
      key,
      label: val.label,
      entries: val.entries
    }));
  }, [processedEntries, groupMode]);

  // Active Kaffārah / Remedy Quests
  const activeKaffarahQuests = state.quests.filter(q => 
    q.status === 'Active' && 
    (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]') || q.type === 'Recovery')
  );

  const handleOpenAuditModal = (weaknessId?: string, cat?: MuhasabahCategory) => {
    setPrefillWeaknessId(weaknessId);
    setPrefillCategory(cat);
    setIsModalOpen(true);
  };

  const handleForgeSeal = (weaknessId: string) => {
    const res = convertWeaknessToSeal(weaknessId);
    if (res.success) {
      setSealForgeMessage(res.message);
      setTimeout(() => setSealForgeMessage(null), 4500);
    }
  };

  const confirmDeleteEntry = () => {
    if (entryToDelete) {
      deleteMuhasabahEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleOpenWeeklySummaryGenerator = () => {
    const sum = generateWeeklyMuhasabahSummary();
    setGeneratedSummary(sum);
    setWeeklyReflectionInput(sum.weeklyReflection || '');
    setIsWeeklySummaryOpen(true);
  };

  const handleSaveAndArchiveWeeklySummary = () => {
    if (!generatedSummary) return;
    const finalSummary: WeeklyMuhasabahSummary = {
      ...generatedSummary,
      summaryReflection: weeklyReflectionInput.trim() || generatedSummary.summaryReflection,
      weeklyReflection: weeklyReflectionInput.trim() || 'Sincere intention renewed for the new week.'
    };
    const res = saveAndArchiveWeeklySummary(finalSummary);
    setSavedSummarySuccess(res.message);
    setIsWeeklySummaryOpen(false);
    setTimeout(() => setSavedSummarySuccess(null), 6000);
  };

  const handleInstantFridaySealAndReset = () => {
    const sum = generateWeeklyMuhasabahSummary();
    const finalSummary: WeeklyMuhasabahSummary = {
      ...sum,
      summaryReflection: sum.summaryReflection,
      weeklyReflection: 'Sealed via Friday Jumu\'ah 1-Click Protocol. Sincere repentance renewed & clean slate activated.'
    };
    const res = saveAndArchiveWeeklySummary(finalSummary);
    setSavedSummarySuccess(`Jumu'ah Seal Completed! Week judged ${sum.scoreOutOf10 !== undefined ? sum.scoreOutOf10.toFixed(1) : '10.0'}/10.0 [${sum.spiritualRating}]. Summary saved to Planning Documents & slip ledger purged for the fresh week.`);
    setTimeout(() => setSavedSummarySuccess(null), 7000);
  };

  const handleInject10OutOf10Directives = () => {
    const b = liveWeeklySummary.weeklyScoreBreakdown;
    if (!b) return;

    let addedCount = 0;
    const dateStr = state.systemDate || '2026-08-24';

    if (b.fardhPrayersScore < 2.45) {
      addQuest({
        name: `[10/10 MUHĀSABAH] 5 Fardh Prayers Strictly On-Time at Adhan`,
        description: `Protect the 5 daily obligatory prayers at the first call to prayer to secure full 2.5/2.5 marks in the weekly audit.`,
        difficulty: 'Normal',
        type: 'Main',
        xp: 150,
        estimatedTime: 25,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        targetDate: dateStr,
        recurrence: 'Daily'
      });
      addedCount++;
    }

    if (b.adhkarFortressScore < 1.45) {
      addQuest({
        name: `[10/10 MUHĀSABAH] Morning & Evening Adhkār Soul Fortress`,
        description: `Complete the authentic Morning Adhkār after Fajr and Evening Adhkār after Asr/Maghrib to fortify spiritual armor (+1.5/1.5 pts).`,
        difficulty: 'Easy',
        type: 'Habit',
        xp: 120,
        estimatedTime: 15,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        targetDate: dateStr,
        recurrence: 'Daily'
      });
      addedCount++;
    }

    if (b.salawatScore < 0.95) {
      addQuest({
        name: `[10/10 MUHĀSABAH] 70+ Daily Salawāt upon Prophet Muhammad ﷺ`,
        description: `Fulfill the daily prophetic covenant of blessings upon the Messenger ﷺ to maximize Salawat pillar marks (+1.0/1.0 pt).`,
        difficulty: 'Easy',
        type: 'Habit',
        xp: 100,
        estimatedTime: 10,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        targetDate: dateStr,
        recurrence: 'Daily'
      });
      addedCount++;
    }

    if (b.sunnahQiyamScore < 1.45) {
      addQuest({
        name: `[10/10 MUHĀSABAH] 2 Rak'ahs Qiyām al-Layl & Witr Vigil`,
        description: `Revive the nightly vigil with 2 rak'ahs before Fajr and conclude with Witr for spiritual elevation (+1.5/1.5 pts).`,
        difficulty: 'Normal',
        type: 'Side',
        xp: 140,
        estimatedTime: 20,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        targetDate: dateStr,
        recurrence: 'Daily'
      });
      addedCount++;
    }

    if (b.slipsRestraintScore < 1.95) {
      addQuest({
        name: `[10/10 MUHĀSABAH] Sacred Boundary: Restraint from Mindless Speech & Desires`,
        description: `Observe conscious self-restraint and mindfulness of speech, gaze, and time to protect the slip ledger and prevent penalties.`,
        difficulty: 'Hard',
        type: 'Recovery',
        xp: 160,
        estimatedTime: 30,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        targetDate: dateStr
      });
      addedCount++;
    }

    setInjectedActionSuccess(`Successfully injected ${addedCount} targeted 10/10 spiritual directives into your Active Directives terminal!`);
    setTimeout(() => setInjectedActionSuccess(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12" id="muhasabah-main-view">
      {/* WEEKLY SUMMARY SAVED SUCCESS BANNER */}
      <AnimatePresence>
        {savedSummarySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-[#101b13] to-[#0c0f17] border border-emerald-500/60 shadow-xl flex items-center justify-between gap-3 text-xs font-mono text-emerald-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-900/80 border border-emerald-500/50 text-emerald-100">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-emerald-400" />
                  Weekly Summary Archived & Ledger Reset
                </span>
                <p className="text-[11px] text-zinc-300 font-sans mt-0.5">{savedSummarySuccess}</p>
              </div>
            </div>
            <button
              onClick={() => setSavedSummarySuccess(null)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10/10 INJECTED DIRECTIVES BANNER */}
      <AnimatePresence>
        {injectedActionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 rounded-xl bg-gradient-to-r from-amber-950 via-[#1e170c] to-[#0c0f17] border border-[#c5a059]/60 shadow-xl flex items-center justify-between gap-3 text-xs font-mono text-[#fef08a]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a]">
                <Sparkles className="h-4 w-4 text-[#c5a059]" />
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-[#e5c875] flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                  10/10 Action Directives Synchronized
                </span>
                <p className="text-[11px] text-zinc-300 font-sans mt-0.5">{injectedActionSuccess}</p>
              </div>
            </div>
            <button
              onClick={() => setInjectedActionSuccess(null)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ISLAMIC GAMIFICATION SAFEGUARD DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-[#120f08] border border-[#c5a059]/40 flex items-start gap-3 shadow-md">
        <Shield className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-zinc-300">
          <p className="font-semibold text-amber-300">
            &ldquo;XP is an in-app motivational measure. It does not represent Allah&apos;s reward, hasanat, or ajr. The true reward of worship belongs to Allah alone.&rdquo;
          </p>
          <p className="text-[11px] text-zinc-400 font-sans">
            Self-audits and XP balance are secondary psychological tools for personal accountability (Muḥāsabah). Legitimate excuses (sleep, forgetfulness, illness, travel hardship) carry zero penalty in Islam and inside the app. Sincerity (Ikhlāṣ) to Allah comes first.
          </p>
        </div>
      </div>

      {/* 1. THE DAILY BALANCE SCALE HERO */}
      <DailyBalanceScale
        todayEarnedXP={stats.todayEarnedXP}
        todayLostXP={stats.todayLostXP}
        todayNetXP={stats.todayNetXP}
        todaySlipsCount={stats.todaySlipsCount}
        todayHasanatCount={stats.todayHasanatCount}
        mizanTilt={stats.mizanTilt}
        equilibriumStatus={stats.equilibriumStatus}
        isSpiritualLocked={stats.isSpiritualLocked}
        pendingKaffarahCount={stats.pendingKaffarahCount}
        onOpenAuditModal={() => handleOpenAuditModal()}
        onViewRemedies={() => {
          const el = document.getElementById('active-kaffarah-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenGuide={() => onOpenGuide?.('muhasabah')}
      />

      {/* 2. WEEKLY 10/10 SACRED AUDIT & REFINEMENT SCORECARD */}
      {(() => {
        const b = liveWeeklySummary.weeklyScoreBreakdown;
        const currentScore = liveWeeklySummary.scoreOutOf10 ?? 10.0;
        const isNearTen = currentScore >= 9.5;

        return (
          <div className="p-4 sm:p-5 rounded-2xl border border-[#c5a059]/40 bg-[#090c12] relative overflow-hidden shadow-2xl space-y-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.08),transparent_65%)] pointer-events-none" />

            {/* TOP HEADER ROW */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                    <Scale className="h-3 w-3 text-[#c5a059]" />
                    <span>تقييم ومحاسبة الأسبوع • WEEKLY SACRED AUDIT / 10</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {liveWeeklySummary.startDate} → {liveWeeklySummary.endDate}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                    <span>Weekly Spiritual Standing:</span>
                  </h3>
                  <span className="text-sm font-bold text-[#e5c875] font-mono">
                    {b?.gradeAr} — <span className="text-zinc-300">{b?.gradeEn}</span>
                  </span>
                </div>
              </div>

              {/* 10/10 GAUGE BADGE */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 p-2.5 px-4 rounded-xl bg-gradient-to-br from-[#1c160a] to-[#07090e] border border-[#c5a059]/50 shadow-inner">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">WEEKLY JUDGMENT</span>
                    <span className="text-[10px] font-mono text-amber-400/80">{isNearTen ? 'Full Mark (10/10)' : 'Refinement Target'}</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className={`text-2xl sm:text-3xl font-black ${
                      currentScore >= 9.5 ? 'text-emerald-300' :
                      currentScore >= 8.5 ? 'text-[#fef08a]' :
                      currentScore >= 7.0 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {currentScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold">/10.0</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowRefineDrawer(!showRefineDrawer)}
                    className="px-3 py-1.5 rounded-lg bg-[#3a2e12] hover:bg-[#4d3c16] border border-[#c5a059]/60 text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-1.5 active:scale-95 shadow-md"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>{showRefineDrawer ? 'HIDE PLAN' : '⚡ REFINE 10/10'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInstantFridaySealAndReset}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-700 via-[#c5a059] to-emerald-600 hover:brightness-110 border border-emerald-400/50 text-black font-display text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-md"
                    title="Snapshot weekly 10/10 audit to Codex & reset slips ledger clean for the new week"
                    id="one-click-friday-seal-btn"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>⚡ 1-CLICK JUMU'AH SEAL</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWeeklySummaryGenerator}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-[#c5a059]/40 text-zinc-200 text-xs font-mono font-bold transition flex items-center gap-1.5 active:scale-95"
                    id="full-friday-audit-modal-btn"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>FULL AUDIT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSavedArchivesModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-zinc-800 border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 text-xs font-mono transition flex items-center gap-1.5 active:scale-95"
                    id="view-saved-archives-btn"
                  >
                    <History className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>ARCHIVES ({savedSummaries.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 6 SUB-PILLARS PROGRESS METERS (TOTAL 10.0 PTS) */}
            {b && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {/* 1. Fardh Prayers (2.5 Max) */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                      <span>1. Farā'iḍ Prayers (أركان الصلاة)</span>
                    </span>
                    <span className="font-bold text-amber-300">{b.fardhPrayersScore.toFixed(1)} / 2.5 pts</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (b.fardhPrayersScore / 2.5) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {liveWeeklySummary.prayersOnTimeCount} on-time (+40 XP) • {liveWeeklySummary.prayersDelayedCount} delayed (−50 XP) out of 35
                  </span>
                </div>

                {/* 2. Slips & Restraint (2.0 Max) */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-rose-400" />
                      <span>2. Restraint & Slips (حفظ الجوارح)</span>
                    </span>
                    <span className="font-bold text-rose-300">{b.slipsRestraintScore.toFixed(1)} / 2.0 pts</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-rose-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (b.slipsRestraintScore / 2.0) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {liveWeeklySummary.totalSlipsCount} slip(s) recorded • −{liveWeeklySummary.totalLostXP} XP penalty
                  </span>
                </div>

                {/* 3. Adhkar Fortress (1.5 Max) */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>3. Adhkār Fortress (حصن الأذكار)</span>
                    </span>
                    <span className="font-bold text-cyan-300">{b.adhkarFortressScore.toFixed(1)} / 1.5 pts</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (b.adhkarFortressScore / 1.5) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {liveWeeklySummary.adhkarSabahCount}/7 Morning • {liveWeeklySummary.adhkarMasaCount}/7 Evening
                  </span>
                </div>

                {/* 4. Sunan & Qiyam (1.5 Max) */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-purple-400" />
                      <span>4. Sunan & Qiyām (السنن والقيام)</span>
                    </span>
                    <span className="font-bold text-purple-300">{b.sunnahQiyamScore.toFixed(1)} / 1.5 pts</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-purple-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (b.sunnahQiyamScore / 1.5) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {liveWeeklySummary.sunnahRawatibCount} Sunan Rawātib • {liveWeeklySummary.qiyamTotalRakats} Qiyām Rak'ahs
                  </span>
                </div>

                {/* 5. Salawat upon Prophet ﷺ (1.0 Max) */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-emerald-400" />
                      <span>5. Salawāt upon ﷺ (الصلاة على النبي)</span>
                    </span>
                    <span className="font-bold text-emerald-300">{b.salawatScore.toFixed(1)} / 1.0 pt</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (b.salawatScore / 1.0) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {liveWeeklySummary.salawatTotal} / 490 weekly covenant target
                  </span>
                </div>

                {/* 6. Tawbah & Kaffarah (1.5 Max) */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>6. Tawbah & Kaffārah (تصفية الكفارات)</span>
                    </span>
                    <span className="font-bold text-indigo-300">{b.kaffarahTawbahScore.toFixed(1)} / 1.5 pts</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-indigo-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (b.kaffarahTawbahScore / 1.5) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {liveWeeklySummary.kaffarahPendingCount} pending • {liveWeeklySummary.kaffarahSettledCount} settled remedies
                  </span>
                </div>
              </div>
            )}

            {/* EXPANDABLE "REFINE TO 10/10" ACTION ROADMAP */}
            <AnimatePresence>
              {showRefineDrawer && b && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 border-t border-[#c5a059]/20 space-y-3"
                >
                  <div className="p-3.5 rounded-xl bg-[#16120b] border border-[#c5a059]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                        <span>خطة الارتقاء للدرجة الكاملة 10/10 • ACTION PLAN TO REFINE TO 10/10</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isNearTen ? '10/10 Ihsanic Equilibrium Achieved' : `${(10.0 - currentScore).toFixed(1)} pts required for 10/10`}
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-zinc-200">
                      {b.actionPlan10OutOf10.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/40 border border-white/5 font-sans leading-relaxed">
                          <span className="text-[#c5a059] font-mono font-bold mt-0.5 shrink-0">[{idx + 1}]</span>
                          <span className="text-zinc-200">{step}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleInject10OutOf10Directives}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-[#c5a059] to-amber-500 hover:brightness-110 active:scale-95 text-black font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-950/60"
                        id="inject-10-out-of-10-directives-btn"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>⚡ INJECT 10/10 ACTION DIRECTIVES INTO TERMINAL</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* 2. 1-TAP ZEN TRIAGE STRIP (FAST SLIP RECORDING) */}
      <div className="p-4 rounded-xl bg-[#0c0e14] border border-[#c5a059]/20 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#c5a059]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              1-Tap Rapid Slip Triage
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Directly open calibrated audit for specific realms
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'Obligations', cat: 'Obligations' as MuhasabahCategory, icon: Shield, color: 'text-amber-400 hover:border-amber-400/60' },
            { label: 'Desires', cat: 'Desires' as MuhasabahCategory, icon: EyeOff, color: 'text-rose-400 hover:border-rose-400/60' },
            { label: 'Speech', cat: 'Speech' as MuhasabahCategory, icon: MessageSquare, color: 'text-cyan-400 hover:border-cyan-400/60' },
            { label: 'Heart', cat: 'Heart' as MuhasabahCategory, icon: Heart, color: 'text-purple-400 hover:border-purple-400/60' },
            { label: 'Rights', cat: 'Rights' as MuhasabahCategory, icon: HeartHandshake, color: 'text-emerald-400 hover:border-emerald-400/60' },
            { label: 'Wasted Potential', cat: 'Wasted Potential' as MuhasabahCategory, icon: Clock, color: 'text-indigo-400 hover:border-indigo-400/60' }
          ].map(realm => {
            const Icon = realm.icon;
            const slipCount = entries.filter(e => e.category === realm.cat).length;
            return (
              <button
                key={realm.cat}
                onClick={() => handleOpenAuditModal(undefined, realm.cat)}
                className={`p-2.5 rounded-lg bg-[#07080c] border border-white/10 ${realm.color} text-left transition flex flex-col justify-between group hover:bg-white/5 active:scale-98`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-mono text-zinc-400">{slipCount}</span>
                </div>
                <span className="text-xs font-bold text-zinc-200 truncate">{realm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEAL FORGE SUCCESS BANNER */}
      <AnimatePresence>
        {sealForgeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-2.5">
              <Pickaxe className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{sealForgeMessage}</span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('seals')}
                className="px-3 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-white text-[11px] font-bold transition flex items-center gap-1 shrink-0"
              >
                View Ores & Chains
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN DUAL-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE KAFFĀRAH RESTITUTIONS & CHAINS OF THE NAFS */}
        <div className="lg:col-span-5 space-y-6">
          {/* ACTIVE KAFFĀRAH RESTITUTIONS CARD */}
          <div 
            id="active-kaffarah-section"
            className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    ACTIVE KAFFĀRAH RESTITUTIONS
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Tangible penance deeds to unlock spiritual equilibrium
                  </span>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                activeKaffarahQuests.length > 0 
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold' 
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              }`}>
                {activeKaffarahQuests.length} In Queue
              </span>
            </div>

            {activeKaffarahQuests.length > 0 ? (
              <div className="space-y-3">
                {activeKaffarahQuests.map(quest => (
                  <div 
                    key={quest.id}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-[#0a1215] to-[#070a0e] border border-cyan-500/30 flex flex-col justify-between gap-3 shadow-md hover:border-cyan-400/50 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-cyan-200 font-mono flex items-center gap-1.5">
                          <RubElHizbIcon className="h-3 w-3 text-cyan-400" />
                          {quest.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30">
                          +{quest.xp} XP Restitution
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono leading-relaxed line-clamp-2 mt-1">
                        {quest.description}
                      </p>
                    </div>

                    <button
                      onClick={() => completeQuest(quest.id)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:brightness-110 active:scale-98 text-black font-display text-xs font-bold tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      FULFILL KAFFĀRAH & RESTORE EQUILIBRIUM
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 rounded-xl bg-[#07090e] border border-white/5 space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto opacity-80" />
                <h4 className="text-xs font-bold text-zinc-200 font-mono">Spiritual Equilibrium Restored</h4>
                <p className="text-[11px] text-zinc-400 font-mono max-w-xs mx-auto">
                  No active penance debts pending. All shop features & perks are fully disengaged from spiritual locks.
                </p>
              </div>
            )}
          </div>

          {/* CHAINS OF THE NAFS (BEHAVIORAL WEAKNESSES) CARD */}
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    CHAINS OF THE NAFS ({weaknesses.length})
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Behavioral patterns to bind into Imperial Power Seals
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleOpenAuditModal()}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs transition"
                title="Add slip or chain"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {weaknesses.length > 0 ? (
              <div className="space-y-3">
                {weaknesses.map(weakness => {
                  const isSealed = weakness.status === 'Sealed' || !!weakness.sealId;
                  const isReadyToForge = weakness.occurrenceCount >= 5 && !isSealed;
                  const catColor = CATEGORY_COLORS[weakness.category] || CATEGORY_COLORS.Obligations;

                  return (
                    <div 
                      key={weakness.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isSealed
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : isReadyToForge
                            ? 'bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-950/30'
                            : 'bg-[#090b10] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-zinc-100 font-mono truncate">
                          {weakness.name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isSealed 
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                            : isReadyToForge
                              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse font-bold'
                              : 'bg-black/40 border-white/10 text-zinc-400'
                        }`}>
                          {weakness.status}
                        </span>
                      </div>

                      {/* Iron Chain Link Meter */}
                      <div className="my-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                          <span>Chain Links:</span>
                          <span className="text-zinc-200 font-bold">{weakness.occurrenceCount} / 5 Slips</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {[1, 2, 3, 4, 5].map(idx => (
                            <div 
                              key={idx}
                              className={`h-1.5 rounded-full transition ${
                                idx <= weakness.occurrenceCount
                                  ? idx >= 5 ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-zinc-300'
                                  : 'bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] font-mono text-zinc-400 line-clamp-1 mb-2.5">
                        Trigger: {weakness.triggerCause}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isReadyToForge ? (
                          <button
                            onClick={() => handleForgeSeal(weakness.id)}
                            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-[#c5a059] text-black font-display text-[11px] font-bold tracking-wider hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Pickaxe className="h-3.5 w-3.5" />
                            FORGE INTO POWER SEAL
                          </button>
                        ) : isSealed ? (
                          <div className="w-full py-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 text-center">
                            Bound into Imperial Power Seal ⛓️
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAuditModal(weakness.id, weakness.category)}
                            className="w-full py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 transition text-center"
                          >
                            + Record Slip on this Chain
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 px-3 rounded-xl bg-[#07090e] border border-white/5">
                <p className="text-[11px] text-zinc-500 font-mono">
                  No behavioral chains recorded yet. Record recurring slips to forge protective Power Seals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: THE SACRED LEDGER OF SLIPS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl">
            {/* LEDGER HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#3a2e12]/60 border border-[#c5a059]/40 text-[#fef08a]">
                  <Scale className="h-4 w-4 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    THE SACRED LEDGER OF SLIPS
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Arranged audit trail ({processedEntries.length} of {entries.length} Records)
                  </span>
                </div>
              </div>

              {/* SEARCH & WEEKLY SUMMARY INPUT */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenWeeklySummaryGenerator}
                  className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-[#3a2e12]/60 border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-[#fef08a] transition flex items-center gap-1.5 text-xs font-mono shrink-0 shadow-sm active:scale-95"
                  title="Generate weekly summary & archive ledger"
                >
                  <FileText className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span className="hidden sm:inline text-[11px] font-bold">Weekly Summary</span>
                </button>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search slips, triggers..."
                    className="bg-[#080a0f] border border-white/10 focus:border-[#c5a059] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 outline-none w-full sm:w-48 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ARRANGE / SORT & GROUP CONTROLS BAR */}
            <div className="py-2.5 px-3 my-2 rounded-lg bg-[#07090e] border border-white/5 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              {/* SORT CONTROLS */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3 text-zinc-400" /> Sort:
                </span>
                <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-white/5">
                  <button
                    onClick={() => setSortField('time')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'time' ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Time
                  </button>
                  <button
                    onClick={() => setSortField('severity')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'severity' ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-500/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Severity
                  </button>
                  <button
                    onClick={() => setSortField('category')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'category' ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setSortField('xp')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'xp' ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-500/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    XP Penalty
                  </button>
                </div>

                <button
                  onClick={toggleSortOrder}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition flex items-center gap-0.5 text-[10px]"
                  title={sortOrder === 'desc' ? 'Descending (Highest/Newest first)' : 'Ascending (Lowest/Oldest first)'}
                >
                  {sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-amber-400" /> : <ArrowUp className="h-3 w-3 text-cyan-400" />}
                  <span>{sortOrder === 'desc' ? 'DESC' : 'ASC'}</span>
                </button>
              </div>

              {/* GROUP BY CONTROLS */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3 text-zinc-400" /> Group:
                </span>
                <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-white/5">
                  <button
                    onClick={() => setGroupMode('none')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'none' ? 'bg-zinc-800 text-zinc-200 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => setGroupMode('category')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'category' ? 'bg-amber-950/80 text-[#fef08a] font-bold border border-[#c5a059]/40' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Realm
                  </button>
                  <button
                    onClick={() => setGroupMode('severity')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'severity' ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-500/40' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Severity
                  </button>
                  <button
                    onClick={() => setGroupMode('date')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'date' ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Date
                  </button>
                </div>
              </div>
            </div>

            {/* CATEGORY & SEVERITY FILTER CHIPS */}
            <div className="space-y-2 py-2 border-b border-white/5">
              {/* Category Realm Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">Realm:</span>
                {['ALL', 'Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition ${
                      categoryFilter === cat
                        ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] font-bold'
                        : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">Severity:</span>
                {['ALL', 'Critical', 'Severe', 'Major', 'Moderate', 'Minor'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap transition ${
                      severityFilter === sev
                        ? 'bg-rose-950 border border-rose-500/60 text-rose-200 font-bold'
                        : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* ENTRIES FEED (SUPPORTS GROUPING & SORTING) */}
            <div className="space-y-4 pt-3 max-h-[680px] overflow-y-auto pr-1">
              {groupedEntries.some(g => g.entries.length > 0) ? (
                groupedEntries.map(group => {
                  if (group.entries.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-2.5">
                      {groupMode !== 'none' && (
                        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-xs">
                          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
                            {group.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded">
                            {group.entries.length} {group.entries.length === 1 ? 'audit' : 'audits'}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {group.entries.map(entry => {
                          const catConfig = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Obligations;
                          const CatIcon = catConfig.icon;
                          const isSelected = selectedEntryDetail?.id === entry.id;

                          // Time formatting
                          let formattedTime = entry.date;
                          if (entry.timestamp) {
                            try {
                              const dt = new Date(entry.timestamp);
                              formattedTime = `${entry.date} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                            } catch {
                              formattedTime = entry.date;
                            }
                          }

                          return (
                            <div 
                              key={entry.id}
                              className={`p-4 rounded-xl border transition ${
                                isSelected 
                                  ? 'bg-[#111622] border-[#c5a059]/60 shadow-lg' 
                                  : 'bg-[#080a10] border-white/10 hover:border-white/20'
                              }`}
                            >
                              {/* Entry Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className={`p-2 rounded-lg ${catConfig.bg} border ${catConfig.border} ${catConfig.text} shrink-0 mt-0.5`}>
                                    <CatIcon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-xs sm:text-sm text-zinc-100 tracking-wide break-words">
                                      {entry.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                                      <span className={`${catConfig.text} font-semibold`}>
                                        {entry.category}
                                      </span>
                                      <span>•</span>
                                      <span className="text-zinc-300 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5 text-zinc-500" />
                                        {formattedTime}
                                      </span>
                                      <span>•</span>
                                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                                        entry.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                                        entry.severity === 'Severe' ? 'bg-purple-950 text-purple-300' :
                                        entry.severity === 'Major' ? 'bg-orange-950 text-orange-300' :
                                        entry.severity === 'Moderate' ? 'bg-amber-950 text-amber-300' :
                                        'bg-blue-950 text-blue-300'
                                      }`}>
                                        {entry.severity}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Consequence Pills */}
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  {entry.isExempt ? (
                                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                                      <ShieldCheck className="h-3 w-3 text-cyan-400" />
                                      0 XP (Exempt)
                                    </span>
                                  ) : (
                                    <>
                                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                                        −{entry.xpDeducted || entry.rawPenalty} XP
                                      </span>
                                      {entry.coinsDeducted ? (
                                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                                          −{entry.coinsDeducted} Coins
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Root Trigger & Reflection */}
                              <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 text-xs font-mono">
                                <div className="flex items-start gap-1.5 text-zinc-400">
                                  <span className="text-rose-400/80 font-bold shrink-0">Trigger:</span>
                                  <span className="text-zinc-300">{entry.cause}</span>
                                </div>

                                {entry.reflection && (
                                  <div className="flex items-start gap-1.5 text-zinc-400">
                                    <span className="text-amber-400/80 font-bold shrink-0">Reflection:</span>
                                    <span className="text-zinc-300">{entry.reflection}</span>
                                  </div>
                                )}

                                {entry.kaffarahTitle && (
                                  <div className="flex items-center justify-between gap-1.5 text-[11px] p-2 rounded-lg bg-[#0c141a] border border-cyan-500/20 text-cyan-200">
                                    <span className="flex items-center gap-1 font-bold">
                                      <Sparkles className="h-3 w-3 text-cyan-400" />
                                      Kaffārah: {entry.kaffarahTitle}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                      entry.kaffarahCompleted ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                                    }`}>
                                      {entry.kaffarahCompleted ? 'Fulfilled ✓' : 'Pending'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="mt-3 flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/5 text-zinc-500">
                                <span>{entry.weaknessName ? `Chain: ${entry.weaknessName}` : 'Independent slip'}</span>
                                <button
                                  onClick={() => setEntryToDelete(entry)}
                                  className="text-zinc-500 hover:text-rose-400 transition p-1 flex items-center gap-1 rounded hover:bg-rose-950/40"
                                  title="Delete audit record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 rounded-xl bg-[#07090e] border border-white/5 space-y-2">
                  <Scale className="h-10 w-10 text-zinc-600 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-300 font-mono">No Audit Records Found</h4>
                  <p className="text-[11px] text-zinc-500 font-mono max-w-xs mx-auto">
                    {searchQuery ? 'Try changing your search query or filters.' : 'Use the 3-Tap Zen Triage above to record self-accountability reflections.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE AUDIT CONFIRMATION WARNING MODAL */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-rose-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 font-mono text-zinc-200"
            >
              <div className="flex items-start justify-between pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider">
                      Delete Audit Record Warning
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      Sacred Ledger Removal Action
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-400 text-[10px] block">TARGET RECORD:</span>
                  <p className="font-bold text-zinc-100">{entryToDelete.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                    <span className="text-amber-400">{entryToDelete.category}</span>
                    <span>•</span>
                    <span className="text-rose-400">{entryToDelete.severity}</span>
                    <span>•</span>
                    <span>{entryToDelete.date}</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1.5 text-[11px] text-rose-200/90 leading-relaxed font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 font-mono text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    <span>IMPORTANT CONSEQUENCE NOTICE:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-300">
                    <li>This will remove the entry from the <strong>audit ledger</strong> and lighten the <strong>Daily Balance Scale</strong>.</li>
                    <li>Historical profile XP & coin deductions are <strong>not refunded</strong> to prevent balance inflation.</li>
                    <li>If a linked Kaffārah quest was created, it will remain in your Quests queue until completed or removed manually.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10 text-xs">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEntry}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-950/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Confirm Deletion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3-TAP ZEN TRIAGE MODAL */}
      <MuhasabahModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefillWeaknessId={prefillWeaknessId}
        prefillCategory={prefillCategory}
      />

      {/* FRIDAY / WEEKLY SUMMARY GENERATOR & ARCHIVE MODAL */}
      <AnimatePresence>
        {isWeeklySummaryOpen && generatedSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e15] border border-[#c5a059]/50 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-mono text-zinc-200 my-8 max-h-[90vh] flex flex-col"
            >
              {/* MODAL HEADER */}
              <div className="p-5 bg-gradient-to-r from-[#1c160a] via-[#121622] to-[#090b10] border-b border-[#c5a059]/30 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] shadow-inner">
                    <CalendarDays className="h-5 w-5 text-[#c5a059]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] bg-black/40 px-2 py-0.5 rounded border border-[#c5a059]/30">
                        FRIDAY JUMU'AH CODEX ARCHIVE
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {generatedSummary.startDate} → {generatedSummary.endDate}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold font-display text-white mt-1 flex items-center gap-1.5">
                      <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                      Weekly Sacred Muhāsabah & 10/10 Judgment
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setIsWeeklySummaryOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL SCROLLABLE CONTENT */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* 10/10 SACRED AUDIT VERDICT CARD */}
                {(() => {
                  const b = generatedSummary.weeklyScoreBreakdown;
                  const score = generatedSummary.scoreOutOf10 ?? 10.0;
                  return (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#1d160b] via-[#121622] to-[#080b11] border border-[#c5a059]/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono font-bold block">
                          SACRED WEEKLY VERDICT (حكم المحاسبة الأسبوعية)
                        </span>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="text-base sm:text-lg font-bold text-[#fef08a] font-display">
                            {b?.gradeAr || generatedSummary.spiritualRating}
                          </span>
                          <span className="text-xs text-zinc-300 font-mono">
                            • {b?.gradeEn || generatedSummary.spiritualRating}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-[#c5a059]/50 flex items-baseline gap-1 font-mono shrink-0 shadow-inner">
                        <span className="text-2xl sm:text-3xl font-black text-[#fef08a]">
                          {score.toFixed(1)}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold">/10.0</span>
                      </div>
                    </div>
                  );
                })()}

                {/* THEOLOGICAL SAFEGUARD DISCLAIMER */}
                <div className="p-3 rounded-xl bg-[#120f08] border border-[#c5a059]/40 flex items-start gap-2.5 text-zinc-300">
                  <Shield className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-amber-300 text-[11px]">
                      &ldquo;XP is an in-app motivational measure. It does not represent Allah&apos;s reward, hasanat, or ajr. The true reward of worship belongs to Allah alone.&rdquo;
                    </p>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      This weekly audit is a personal accountability tool for your self-reflection and spiritual renewal.
                    </p>
                  </div>
                </div>

                {/* 1. KEY METRICS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-bold">RECORDED SLIPS</span>
                    <span className="text-lg font-bold text-white flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      {generatedSummary.totalSlipsCount}
                    </span>
                    <span className="text-[10px] text-rose-400 block">
                      −{generatedSummary.totalLostXP} XP Audited
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-bold">NET SPIRITUAL XP</span>
                    <span className={`text-lg font-bold flex items-center gap-1 ${
                      generatedSummary.totalNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      <Scale className="h-4 w-4 text-[#c5a059]" />
                      {generatedSummary.totalNetXP >= 0 ? `+${generatedSummary.totalNetXP}` : generatedSummary.totalNetXP} XP
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      +{generatedSummary.totalEarnedXP} XP Earned
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-bold">ON-TIME PRAYERS</span>
                    <span className="text-lg font-bold text-emerald-300 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[#c5a059]" />
                      {generatedSummary.prayersOnTimeCount}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {generatedSummary.prayersDelayedCount} Delayed • {generatedSummary.prayersCount}/35 Fardh
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-bold">SUNAN & ADHKĀR</span>
                    <span className="text-lg font-bold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      {generatedSummary.adhkarSabahCount + generatedSummary.adhkarMasaCount}/14
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {generatedSummary.sunnahRawatibCount} Sunan • {generatedSummary.qiyamTotalRakats} Qiyām
                    </span>
                  </div>
                </div>

                {/* 2. 6-PILLAR 10/10 BREAKDOWN IN MODAL */}
                {generatedSummary.weeklyScoreBreakdown && (
                  <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#c5a059]/30 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#fef08a]">
                      <span className="flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-[#c5a059]" />
                        <span>10.0-POINT SACRED PILLARS BREAKDOWN</span>
                      </span>
                      <span className="font-mono text-zinc-400">Total: {generatedSummary.scoreOutOf10?.toFixed(1)} / 10.0</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-400 block">1. Farā'iḍ Prayers</span>
                        <span className="text-xs font-bold text-amber-300">{generatedSummary.weeklyScoreBreakdown.fardhPrayersScore.toFixed(1)} / 2.5 pts</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-400 block">2. Slips & Restraint</span>
                        <span className="text-xs font-bold text-rose-300">{generatedSummary.weeklyScoreBreakdown.slipsRestraintScore.toFixed(1)} / 2.0 pts</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-400 block">3. Adhkār Fortress</span>
                        <span className="text-xs font-bold text-cyan-300">{generatedSummary.weeklyScoreBreakdown.adhkarFortressScore.toFixed(1)} / 1.5 pts</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-400 block">4. Sunan & Qiyām</span>
                        <span className="text-xs font-bold text-purple-300">{generatedSummary.weeklyScoreBreakdown.sunnahQiyamScore.toFixed(1)} / 1.5 pts</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-400 block">5. Salawāt ﷺ</span>
                        <span className="text-xs font-bold text-emerald-300">{generatedSummary.weeklyScoreBreakdown.salawatScore.toFixed(1)} / 1.0 pt</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-400 block">6. Tawbah & Remedies</span>
                        <span className="text-xs font-bold text-indigo-300">{generatedSummary.weeklyScoreBreakdown.kaffarahTawbahScore.toFixed(1)} / 1.5 pts</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. REFINE TO 10/10 ACTION PLAN */}
                {generatedSummary.weeklyScoreBreakdown && (
                  <div className="p-3.5 rounded-xl bg-[#16120b] border border-[#c5a059]/40 space-y-2">
                    <span className="text-[11px] font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span>خطة الارتقاء للعلامة الكاملة 10/10 • REFINE TO 10/10 ACTION PLAN</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-200">
                      {generatedSummary.weeklyScoreBreakdown.actionPlan10OutOf10.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/40 border border-white/5 font-sans leading-relaxed">
                          <span className="text-[#c5a059] font-mono font-bold mt-0.5 shrink-0">[{idx + 1}]</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. RECURRING TRIGGERS & WEAKNESSES */}
                {generatedSummary.topWeaknessCategories && generatedSummary.topWeaknessCategories.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#07090e] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Pickaxe className="h-3.5 w-3.5 text-amber-400" />
                      <span>PRIMARY WEAKNESS VULNERABILITY REALMS</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {generatedSummary.topWeaknessCategories.map(w => (
                        <div key={w.category} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <span className="text-zinc-200 font-semibold">{w.category}</span>
                          <span className="text-amber-400 text-[10px] font-bold">{w.count} Slips</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. WEEKLY SPIRITUAL RESOLUTION & INTENTION */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-400" />
                      <span>UPCOMING WEEK SPIRITUAL INTENTION & STRATEGY (نية وتعهد الأسبوع الجديد)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">Editable</span>
                  </label>
                  <textarea
                    value={weeklyReflectionInput}
                    onChange={e => setWeeklyReflectionInput(e.target.value)}
                    placeholder="Write your personal reflections, commitments, and areas of focus for the upcoming week..."
                    rows={3}
                    className="w-full bg-[#07090e] border border-white/15 focus:border-[#c5a059] rounded-xl p-3 text-xs text-zinc-200 outline-none font-sans leading-relaxed"
                  />
                </div>

                {/* 6. NOTICE REGARDING ARCHIVE & RESET */}
                <div className="p-3 rounded-xl bg-[#1c160a] border border-[#c5a059]/40 space-y-1 text-[11px] text-amber-200/90 font-sans">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>WHAT HAPPENS UPON ARCHIVING:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                    <li>This summary document is permanently saved into your <strong>Planning Documents & Codex</strong>.</li>
                    <li>The <strong>Muhāsabah Slip Ledger is emptied</strong>, giving you a fresh, clean slate for the new week.</li>
                    <li>The <strong>Daily Balance Scale</strong> resets to pure equilibrium for day 1 of the new cycle.</li>
                  </ul>
                </div>
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="p-4 bg-[#07090e] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsWeeklySummaryOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndArchiveWeeklySummary}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-[#c5a059] to-emerald-500 hover:brightness-110 active:scale-95 text-black font-display text-xs font-bold tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60"
                  id="save-archive-weekly-summary-btn"
                >
                  <Check className="h-4 w-4" />
                  <span>SAVE TO CODEX & RESET LEDGER FOR NEW WEEK</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAVED WEEKLY ARCHIVES BROWSER MODAL */}
      <AnimatePresence>
        {showSavedArchivesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e15] border border-[#c5a059]/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-mono text-zinc-200 my-8 max-h-[85vh] flex flex-col"
            >
              {/* HEADER */}
              <div className="p-5 bg-gradient-to-r from-[#1c160a] via-[#121622] to-[#090b10] border-b border-[#c5a059]/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a]">
                    <History className="h-5 w-5 text-[#c5a059]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      SAVED WEEKLY MUHĀSABAH ARCHIVES
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      {savedSummaries.length} Historical Weekly Reviews Recorded
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSavedArchivesModal(false);
                    setSelectedArchiveDetail(null);
                  }}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* LIST / DETAIL */}
              <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
                {selectedArchiveDetail ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedArchiveDetail(null)}
                      className="text-[11px] font-mono text-[#c5a059] hover:underline flex items-center gap-1 font-bold"
                    >
                      ← Back to All Saved Archives
                    </button>

                    <div className="p-4 rounded-xl bg-[#07090e] border border-[#c5a059]/40 space-y-4 shadow-xl">
                      {/* HEADER CARD */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block font-mono">
                            SACRED WEEKLY ARCHIVE ({selectedArchiveDetail.weekLabel || selectedArchiveDetail.generatedDate})
                          </span>
                          <h4 className="text-base font-bold text-white font-display">
                            {selectedArchiveDetail.startDate} → {selectedArchiveDetail.endDate}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                            Archived: {new Date(selectedArchiveDetail.archivedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="p-2.5 px-3.5 rounded-xl bg-black/60 border border-[#c5a059]/50 flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-mono text-zinc-400 block font-bold">SACRED SCORE</span>
                            <span className="text-xs font-bold text-[#fef08a] font-display">
                              {selectedArchiveDetail.weeklyScoreBreakdown?.gradeAr || selectedArchiveDetail.spiritualRating}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 font-mono">
                            <span className="text-2xl font-black text-[#fef08a]">
                              {(selectedArchiveDetail.scoreOutOf10 ?? 10.0).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold">/10.0</span>
                          </div>
                        </div>
                      </div>

                      {/* 6 PILLARS BREAKDOWN */}
                      {selectedArchiveDetail.weeklyScoreBreakdown && (
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          <span className="text-[10px] font-bold text-[#fef08a] font-mono uppercase tracking-wider block">
                            6-Pillar Audit Breakdown
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div className="p-2 rounded bg-zinc-900/60 border border-white/5 space-y-0.5">
                              <span className="text-[9px] text-zinc-400 block">Farā'iḍ Prayers</span>
                              <span className="text-xs font-bold text-amber-300 font-mono">
                                {selectedArchiveDetail.weeklyScoreBreakdown.fardhPrayersScore.toFixed(1)} / 2.5 pts
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-900/60 border border-white/5 space-y-0.5">
                              <span className="text-[9px] text-zinc-400 block">Slips & Restraint</span>
                              <span className="text-xs font-bold text-rose-300 font-mono">
                                {selectedArchiveDetail.weeklyScoreBreakdown.slipsRestraintScore.toFixed(1)} / 2.0 pts
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-900/60 border border-white/5 space-y-0.5">
                              <span className="text-[9px] text-zinc-400 block">Adhkār Fortress</span>
                              <span className="text-xs font-bold text-cyan-300 font-mono">
                                {selectedArchiveDetail.weeklyScoreBreakdown.adhkarFortressScore.toFixed(1)} / 1.5 pts
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-900/60 border border-white/5 space-y-0.5">
                              <span className="text-[9px] text-zinc-400 block">Sunan & Qiyām</span>
                              <span className="text-xs font-bold text-purple-300 font-mono">
                                {selectedArchiveDetail.weeklyScoreBreakdown.sunnahQiyamScore.toFixed(1)} / 1.5 pts
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-900/60 border border-white/5 space-y-0.5">
                              <span className="text-[9px] text-zinc-400 block">Salawāt upon ﷺ</span>
                              <span className="text-xs font-bold text-emerald-300 font-mono">
                                {selectedArchiveDetail.weeklyScoreBreakdown.salawatScore.toFixed(1)} / 1.0 pt
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-900/60 border border-white/5 space-y-0.5">
                              <span className="text-[9px] text-zinc-400 block">Tawbah & Kaffārah</span>
                              <span className="text-xs font-bold text-indigo-300 font-mono">
                                {selectedArchiveDetail.weeklyScoreBreakdown.kaffarahTawbahScore.toFixed(1)} / 1.5 pts
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STATS MATRIX */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-zinc-400 block font-mono">Audited Slips</span>
                          <span className="text-sm font-bold text-rose-400 font-mono">{selectedArchiveDetail.totalSlipsCount}</span>
                          <span className="text-[9px] text-zinc-500 block">−{selectedArchiveDetail.totalLostXP} XP</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-zinc-400 block font-mono">Net Spiritual XP</span>
                          <span className={`text-sm font-bold font-mono ${selectedArchiveDetail.totalNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {selectedArchiveDetail.totalNetXP >= 0 ? `+${selectedArchiveDetail.totalNetXP}` : selectedArchiveDetail.totalNetXP}
                          </span>
                          <span className="text-[9px] text-zinc-500 block">+{selectedArchiveDetail.totalEarnedXP} XP earned</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-zinc-400 block font-mono">On-Time Fardh</span>
                          <span className="text-sm font-bold text-emerald-300 font-mono">{selectedArchiveDetail.prayersOnTimeCount}</span>
                          <span className="text-[9px] text-zinc-500 block">{selectedArchiveDetail.prayersDelayedCount} delayed / {selectedArchiveDetail.prayersCount}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-zinc-400 block font-mono">Adhkār & Sunan</span>
                          <span className="text-sm font-bold text-cyan-300 font-mono">
                            {selectedArchiveDetail.adhkarSabahCount + selectedArchiveDetail.adhkarMasaCount}
                          </span>
                          <span className="text-[9px] text-zinc-500 block">{selectedArchiveDetail.sunnahRawatibCount} Sunan • {selectedArchiveDetail.qiyamTotalRakats} Qiyām</span>
                        </div>
                      </div>

                      {/* REFLECTION & CODEX LOCATION */}
                      {(selectedArchiveDetail.weeklyReflection || selectedArchiveDetail.summaryReflection) && (
                        <div className="pt-2 border-t border-white/10 space-y-1">
                          <span className="text-[10px] font-bold text-amber-300 block uppercase font-mono">
                            Weekly Resolution & Spiritual Intention:
                          </span>
                          <p className="text-xs text-zinc-300 font-sans leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5">
                            &ldquo;{selectedArchiveDetail.weeklyReflection || selectedArchiveDetail.summaryReflection}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="p-2 rounded bg-zinc-950/60 border border-white/5 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                        <span>Codex Document Path:</span>
                        <span className="text-[#c5a059] font-bold">
                          04 Operations/Weekly Muhasabah/Weekly Summary - {selectedArchiveDetail.generatedDate}.md
                        </span>
                      </div>
                    </div>
                  </div>
                ) : savedSummaries.length > 0 ? (
                  savedSummaries.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedArchiveDetail(item)}
                      className="p-3.5 rounded-xl bg-[#07090e] hover:bg-[#121622] border border-white/10 hover:border-[#c5a059]/40 cursor-pointer transition flex items-center justify-between group shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100">{item.startDate} → {item.endDate}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-mono font-bold">
                            {(item.scoreOutOf10 ?? 10.0).toFixed(1)} / 10.0
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-zinc-400 border border-white/5 font-mono">
                            {item.totalSlipsCount} Slips
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                          <span>Net: <strong className={item.totalNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{item.totalNetXP >= 0 ? `+${item.totalNetXP}` : item.totalNetXP} XP</strong></span>
                          <span>•</span>
                          <span>On-Time: <strong className="text-emerald-300">{item.prayersOnTimeCount}</strong></span>
                          <span>•</span>
                          <span className="text-zinc-500">{item.spiritualRating}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-[#c5a059] group-hover:translate-x-0.5 transition" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-zinc-500">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-zinc-300">No archived weekly summaries found yet.</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Use "1-CLICK JUMU'AH SEAL" or "FULL AUDIT" on Friday to snapshot your week and clear the slips ledger for a clean slate.</p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-[#07090e] border-t border-white/10 flex items-center justify-end shrink-0">
                <button
                  onClick={() => {
                    setShowSavedArchivesModal(false);
                    setSelectedArchiveDetail(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition"
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
