import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity, Weakness, MuhasabahEntry, WeeklyMuhasabahSummary } from '../types';
import { MuhasabahModal, MuhasabahModalTab } from './MuhasabahModal';
import { DailyBalanceScale } from './DailyBalanceScale';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { AncientCarvedRune } from './AncientCarvedRune';
import { getWeekBoundaries } from '../utils/weeklyCycle';
import { getLocalDateString, parseDateSafe, getDaysDifference } from '../utils/dateUtils';
import { getWeaknessDecayMetrics } from '../utils/muhasabahRecurrence';
import { 
  Scale, Shield, Flame, Heart, MessageSquare, Clock, AlertTriangle, 
  Sparkles, Plus, Search, Filter, CheckCircle2, 
  ChevronRight, Lock, Trash2, Eye, EyeOff, HeartHandshake, Coins, Zap, ShieldAlert,
  ShieldCheck, ArrowUpDown, ArrowDown, ArrowUp, Calendar, Layers, X, Info,
  FileText, BookOpen, CalendarDays, History, Check, ArrowRight, Repeat, Edit3, Target,
  Award, TrendingDown
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
type GroupMode = 'none' | 'horizon' | 'category' | 'severity' | 'date';
type TimeScope = 'today' | 'week' | 'all';

export type MuhasabahMainTab = 'DAILY' | 'LEDGER' | 'PATTERNS' | 'WEEKLY';

interface MuhasabahViewProps {
  onNavigate?: (tab: any) => void;
  onOpenGuide?: (section?: string) => void;
}

export const MuhasabahView: React.FC<MuhasabahViewProps> = ({ onNavigate, onOpenGuide }) => {
  const { 
    state, getTodayMuhasabahStats, deleteMuhasabahEntry, 
    addWeakness, deleteWeakness, updateWeakness,
    addQuest, completeQuest, generateWeeklyMuhasabahSummary, saveAndArchiveWeeklySummary,
    clearAllWeeklyArchives, deleteWeeklyArchive, getRecurringSins
  } = usePOS();

  const [activeMainTab, setActiveMainTab] = useState<MuhasabahMainTab>('DAILY');
  const [timeScope, setTimeScope] = useState<TimeScope>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<MuhasabahModalTab>('slip');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [entryToDelete, setEntryToDelete] = useState<MuhasabahEntry | null>(null);

  // Patterns & Behavioral Boundary states
  const [patternStatusFilter, setPatternStatusFilter] = useState<'ALL' | 'Active' | 'Under Control' | 'Overcome'>('ALL');
  const [isAddPatternModalOpen, setIsAddPatternModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Weakness | null>(null);

  // Form states for Pattern Modal
  const [patternFormName, setPatternFormName] = useState('');
  const [patternFormCategory, setPatternFormCategory] = useState<MuhasabahCategory>('Obligations');
  const [patternFormTrigger, setPatternFormTrigger] = useState('');
  const [patternFormProtocol, setPatternFormProtocol] = useState('');
  const [patternFormCueFriction, setPatternFormCueFriction] = useState('');
  const [patternFormReplacement, setPatternFormReplacement] = useState('');
  const [patternFormIdentity, setPatternFormIdentity] = useState('');
  const [patternFormDecayDays, setPatternFormDecayDays] = useState(2);
  const [patternFormStatus, setPatternFormStatus] = useState<'Active' | 'Under Control' | 'Overcome'>('Active');
  const [patternFormError, setPatternFormError] = useState<string | null>(null);

  const handleOpenAddPatternModal = () => {
    setEditingPattern(null);
    setPatternFormName('');
    setPatternFormCategory('Obligations');
    setPatternFormTrigger('');
    setPatternFormProtocol('');
    setPatternFormCueFriction('');
    setPatternFormReplacement('');
    setPatternFormIdentity('');
    setPatternFormDecayDays(2);
    setPatternFormStatus('Active');
    setPatternFormError(null);
    setIsAddPatternModalOpen(true);
  };

  const handleOpenEditPatternModal = (w: Weakness) => {
    setEditingPattern(w);
    setPatternFormName(w.name);
    setPatternFormCategory(w.category);
    setPatternFormTrigger(w.triggerCause || '');
    setPatternFormProtocol(w.preventiveProtocol || w.correctiveStrategy || '');
    setPatternFormCueFriction(w.cueFriction || '');
    setPatternFormReplacement(w.replacementHabit || '');
    setPatternFormIdentity(w.identityAnchor || '');
    setPatternFormDecayDays(w.decayIntervalDays || 2);
    setPatternFormStatus(w.status);
    setPatternFormError(null);
    setIsAddPatternModalOpen(true);
  };

  const handleSavePattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternFormName.trim()) {
      setPatternFormError('Please enter a name for the pattern/weakness.');
      return;
    }
    if (!patternFormTrigger.trim()) {
      setPatternFormError('Please identify the root trigger cue.');
      return;
    }
    if (!patternFormProtocol.trim()) {
      setPatternFormError('Please define a concrete preventive protocol / rule.');
      return;
    }

    if (editingPattern) {
      updateWeakness(editingPattern.id, {
        name: patternFormName.trim(),
        category: patternFormCategory,
        triggerCause: patternFormTrigger.trim(),
        correctiveStrategy: patternFormProtocol.trim(),
        preventiveProtocol: patternFormProtocol.trim(),
        cueFriction: patternFormCueFriction.trim() || undefined,
        replacementHabit: patternFormReplacement.trim() || undefined,
        identityAnchor: patternFormIdentity.trim() || undefined,
        decayIntervalDays: Number(patternFormDecayDays) || 2,
        status: patternFormStatus
      });
    } else {
      addWeakness({
        name: patternFormName.trim(),
        category: patternFormCategory,
        triggerCause: patternFormTrigger.trim(),
        correctiveStrategy: patternFormProtocol.trim(),
        preventiveProtocol: patternFormProtocol.trim(),
        cueFriction: patternFormCueFriction.trim() || undefined,
        replacementHabit: patternFormReplacement.trim() || undefined,
        identityAnchor: patternFormIdentity.trim() || undefined,
        decayIntervalDays: Number(patternFormDecayDays) || 2,
        occurrenceCount: 0,
        totalHistoricalSlips: 0,
        lastOccurrenceDate: '',
        status: patternFormStatus,
        historyDates: []
      });
    }
    setIsAddPatternModalOpen(false);
    setEditingPattern(null);
  };

  // Weekly Summary states
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<WeeklyMuhasabahSummary | null>(null);
  const [weeklyReflectionInput, setWeeklyReflectionInput] = useState('');
  const [savedSummarySuccess, setSavedSummarySuccess] = useState<string | null>(null);
  const [showSavedArchivesModal, setShowSavedArchivesModal] = useState(false);
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<WeeklyMuhasabahSummary | null>(null);
  const [showClearArchivesConfirm, setShowClearArchivesConfirm] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<WeeklyMuhasabahSummary | null>(null);
  const [injectedActionSuccess, setInjectedActionSuccess] = useState<string | null>(null);
  const [showRefineDrawer, setShowRefineDrawer] = useState(false);

  const [selectedEntryDetail, setSelectedEntryDetail] = useState<MuhasabahEntry | null>(null);
  const [prefillWeaknessId, setPrefillWeaknessId] = useState<string | undefined>(undefined);
  const [prefillCategory, setPrefillCategory] = useState<MuhasabahCategory | undefined>(undefined);

  const stats = getTodayMuhasabahStats();
  const entries = state.muhasabahEntries || [];
  const weaknesses = state.weaknesses || [];
  const savedSummaries = state.savedWeeklySummaries || [];

  const recurringSinsRegistry = useMemo(() => {
    return getRecurringSins ? getRecurringSins() : null;
  }, [entries, weaknesses, state.systemDate, getRecurringSins]);

  const todayDateStr = state.systemDate || getLocalDateString();

  // Canonical Islamic week cycle range (Saturday → Friday)
  const { weekStartDate, weekEndDate, daysInWeek, weekLabel } = useMemo(() => {
    const boundaries = getWeekBoundaries(todayDateStr);
    return {
      weekStartDate: boundaries.weekStart,
      weekEndDate: boundaries.weekEnd,
      daysInWeek: boundaries.daysInWeek,
      weekLabel: boundaries.weekLabel
    };
  }, [todayDateStr]);

  // Today's specific slip calculations
  const todayEntries = useMemo(() => {
    return entries.filter(e => e.date === todayDateStr);
  }, [entries, todayDateStr]);

  const todayLostXP = useMemo(() => {
    return todayEntries.reduce((sum, e) => sum + (e.xpDeducted || e.rawPenalty || 0), 0);
  }, [todayEntries]);

  const todayLostCoins = useMemo(() => {
    return todayEntries.reduce((sum, e) => sum + (e.coinsDeducted || 0), 0);
  }, [todayEntries]);

  // Week-long slip calculations (7-day cycle)
  const weekEntries = useMemo(() => {
    return entries.filter(e => {
      if (!e.date) return true;
      return e.date >= weekStartDate && e.date <= weekEndDate;
    });
  }, [entries, weekStartDate, weekEndDate]);

  const weekLostXP = useMemo(() => {
    return weekEntries.reduce((sum, e) => sum + (e.xpDeducted || e.rawPenalty || 0), 0);
  }, [weekEntries]);

  const weekLostCoins = useMemo(() => {
    return weekEntries.reduce((sum, e) => sum + (e.coinsDeducted || 0), 0);
  }, [weekEntries]);

  // All-time slip calculations
  const allLostXP = useMemo(() => {
    return entries.reduce((sum, e) => sum + (e.xpDeducted || e.rawPenalty || 0), 0);
  }, [entries]);

  // Real-time live weekly evaluation out of 10.0
  const liveWeeklySummary = useMemo(() => {
    return generateWeeklyMuhasabahSummary();
  }, [state.systemDate, state.spiritualLogs, state.muhasabahEntries, state.xpHistory, state.quests]);

  // Check if current systemDate is Friday
  const isFriday = useMemo(() => {
    try {
      return parseDateSafe(todayDateStr).getDay() === 5;
    } catch {
      return false;
    }
  }, [todayDateStr]);

  // Scope-filtered entries (Today vs This Week vs All-Time)
  const scopeFilteredEntries = useMemo(() => {
    if (timeScope === 'today') {
      return todayEntries;
    }
    if (timeScope === 'week') {
      return weekEntries;
    }
    return entries;
  }, [timeScope, todayEntries, weekEntries, entries]);

  // Filtered and Sorted entries
  const processedEntries = useMemo(() => {
    const filtered = scopeFilteredEntries.filter(e => {
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
        const timeA = parseDateSafe(a.timestamp || a.date).getTime();
        const timeB = parseDateSafe(b.timestamp || b.date).getTime();
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
  }, [scopeFilteredEntries, categoryFilter, severityFilter, searchQuery, sortField, sortOrder]);

  // Relative Date Helper
  const getRelativeDateInfo = (dateStr?: string) => {
    if (!dateStr || dateStr === todayDateStr) {
      return { label: 'Today • اليوم', isToday: true, isThisWeek: true, badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50' };
    }
    try {
      const diffDays = getDaysDifference(dateStr, todayDateStr);
      if (diffDays === 1) {
        return { label: 'Yesterday • أمس', isToday: false, isThisWeek: true, badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-600/40' };
      }
      if (diffDays > 1 && diffDays <= 7) {
        return { label: `${diffDays}d ago • في الأسبوع`, isToday: false, isThisWeek: true, badgeColor: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40' };
      }
      return { label: dateStr, isToday: false, isThisWeek: false, badgeColor: 'bg-black/50 text-zinc-400 border-white/10' };
    } catch {
      return { label: dateStr, isToday: false, isThisWeek: false, badgeColor: 'bg-black/50 text-zinc-400 border-white/10' };
    }
  };

  // Grouped entries structure
  const groupedEntries = useMemo(() => {
    if (groupMode === 'none') {
      return [{ key: 'all', label: 'All Records', entries: processedEntries }];
    }

    const groupsMap = new Map<string, { label: string; entries: MuhasabahEntry[] }>();

    processedEntries.forEach(entry => {
      let groupKey = '';
      let groupLabel = '';

      if (groupMode === 'horizon') {
        const info = getRelativeDateInfo(entry.date);
        if (info.isToday) {
          groupKey = 'today';
          groupLabel = '⚡ Today\'s Slips (سِجِلُّ هَفَوَاتِ اليَوْم)';
        } else if (info.isThisWeek) {
          groupKey = 'this-week';
          groupLabel = '🗓️ Earlier This Week (سِجِلُّ هَفَوَاتِ الأُسْبُوع الحَالِي)';
        } else {
          groupKey = 'archived';
          groupLabel = '📜 Prior Cycles (مِنْ أَسَابِيعَ سَابِقَة)';
        }
      } else if (groupMode === 'category') {
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
  }, [processedEntries, groupMode, todayDateStr]);

  // Active Kaffārah / Remedy Quests
  const activeKaffarahQuests = state.quests.filter(q => 
    q.status === 'Active' && 
    (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]') || q.type === 'Recovery')
  );

  const activeWeaknesses = useMemo(() => weaknesses.filter(w => w.status === 'Active'), [weaknesses]);
  const underControlWeaknesses = useMemo(() => weaknesses.filter(w => w.status === 'Under Control'), [weaknesses]);
  const overcomeWeaknesses = useMemo(() => weaknesses.filter(w => w.status === 'Overcome'), [weaknesses]);
  const activeChainsCount = useMemo(() => weaknesses.filter(w => (w.occurrenceCount || 0) >= 5 && w.status !== 'Overcome').length, [weaknesses]);

  const displayedWeaknesses = useMemo(() => {
    if (patternStatusFilter === 'Active') return activeWeaknesses;
    if (patternStatusFilter === 'Under Control') return underControlWeaknesses;
    if (patternStatusFilter === 'Overcome') return overcomeWeaknesses;
    return weaknesses;
  }, [patternStatusFilter, activeWeaknesses, underControlWeaknesses, overcomeWeaknesses, weaknesses]);

  const realmPatternSummary = useMemo(() => {
    const realms: MuhasabahCategory[] = ['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'];
    return realms.map(category => {
      const realmEntries = entries.filter(entry => entry.category === category);
      const latestEntry = [...realmEntries].sort((a, b) => (b.timestamp || b.date).localeCompare(a.timestamp || a.date))[0];
      const pattern = weaknesses.find(weakness => weakness.category === category && weakness.status !== 'Overcome') || weaknesses.find(weakness => weakness.category === category);
      return {
        category,
        count: realmEntries.length,
        pattern,
        latestTitle: latestEntry?.title || 'No audit recorded'
      };
    });
  }, [entries, weaknesses]);

  const handleOpenAuditModal = (
    weaknessId?: string, 
    cat?: MuhasabahCategory, 
    initialTab: MuhasabahModalTab = 'slip'
  ) => {
    setPrefillWeaknessId(weaknessId);
    setPrefillCategory(cat);
    setModalInitialTab(initialTab);
    setIsModalOpen(true);
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
      weeklyReflection: weeklyReflectionInput.trim() || 'Sincere intention renewed; the life ledger remains open.'
    };
    const res = saveAndArchiveWeeklySummary(finalSummary);
    setSavedSummarySuccess(res.message);
    setIsWeeklySummaryOpen(false);
    setTimeout(() => setSavedSummarySuccess(null), 6000);
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
        deadline: dateStr,
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
        deadline: dateStr,
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
        deadline: dateStr,
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
        deadline: dateStr,
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
        deadline: dateStr
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
                  Review Archived & Life Ledger Preserved
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
            className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-surface)] via-[var(--bg-card)] to-[var(--bg-void)] border border-[var(--border-accent)] shadow-xl flex items-center justify-between gap-3 text-xs font-mono text-[var(--accent-highlight)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)]">
                <Sparkles className="h-4 w-4 text-[var(--accent-bright)]" />
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-[var(--accent-bright)] flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
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

      

      {/* 1. TOP HEADER & SANCTUM ACCOUNTABILITY METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0b0d13] border border-[#c5a059]/25 rounded-2xl p-5 relative overflow-hidden shadow-lg">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider font-bold flex items-center gap-1">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              MUḤĀSABAH // SELF-ACCOUNTABILITY
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
              سِجِلُّ المِيزَان
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
            Self-Accountability (Muḥāsabah)
          </h1>

          <p className="text-xs font-sans text-zinc-400 max-w-2xl leading-relaxed italic">
            “حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا” — “Take account of yourselves before you are taken to account, and weigh your deeds before you are weighed.” (Umar ibn al-Khattāb رضي الله عنه)
          </p>
        </div>

        {/* SUMMARY METRICS & QUICK ACTION */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-[#07080c] border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className={`text-sm font-mono font-bold block ${stats.todayNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.todayNetXP >= 0 ? `+${stats.todayNetXP}` : stats.todayNetXP} XP
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Today's Net</span>
          </div>

          <div className="bg-[#07080c] border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className="text-sm font-mono font-bold text-[#fef08a] block">{todayEntries.length}</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Slips Today</span>
          </div>

          <div className="bg-[#07080c] border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className={`text-sm font-mono font-bold block ${activeKaffarahQuests.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeKaffarahQuests.length}
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Penance Debt</span>
          </div>

          <div className="bg-[#07080c] border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className="text-sm font-mono font-bold text-cyan-300 block">{liveWeeklySummary.scoreOutOf10?.toFixed(1) || '10.0'}/10</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Weekly Score</span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAuditModal(undefined, undefined, 'slip')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#3a2e12] to-[#241c09] hover:from-[#4c3c18] hover:to-[#2e230c] border border-[#c5a059] text-[#fef08a] rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer ml-1"
          >
            <Plus className="h-4 w-4" />
            <span>+ RECORD SLIP</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION TABS */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1" id="muhasabah-main-tab-nav">
        {[
          { id: 'DAILY', label: 'Daily Balance & Audit', icon: Scale, desc: 'Mizan scale & rapid triage' },
          { id: 'LEDGER', label: 'Sacred Slip Ledger', icon: FileText, badge: `${entries.length}`, desc: 'Complete audit history' },
          { id: 'PATTERNS', label: 'Habit Boundaries', icon: Shield, badge: `${weaknesses.length}`, desc: 'Triggers & preventive rules' },
          { id: 'WEEKLY', label: 'Weekly Evaluation (10/10)', icon: Sparkles, badge: `${liveWeeklySummary.scoreOutOf10?.toFixed(1) || '10.0'}`, desc: "Friday Jumu'ah review" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMainTab(tab.id as MuhasabahMainTab)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_16px_rgba(197,160,89,0.2)]'
                  : 'bg-[#07080c] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#c5a059]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-[#c5a059]/30 text-[#fef08a]' : 'bg-white/5 text-zinc-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>


      {/* 3. ACTIVE TAB WORKSPACES */}

      {/* TAB 1: DAILY BALANCE & AUDIT */}
      {activeMainTab === 'DAILY' && (
        <div className="space-y-6">
          {/* ISLAMIC GAMIFICATION SAFEGUARD DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-accent)] flex items-start gap-3 shadow-md">
        <Shield className="h-4 w-4 text-[var(--accent-bright)] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-zinc-300">
          <p className="font-semibold text-[var(--accent-highlight)]">
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
        currentHp={stats.currentHp}
        maxHp={stats.maxHp}
        todayLostHp={stats.todayLostHp}
        todayLostCoins={todayLostCoins}
        todayRecurringSlipsCount={stats.todayRecurringSlipsCount}
        onOpenAuditModal={(tab) => handleOpenAuditModal(undefined, undefined, tab || 'slip')}
        onViewRemedies={() => {
          const el = document.getElementById('active-kaffarah-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenGuide={() => onOpenGuide?.('muhasabah')}
      />

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

          {/* DUAL SECTION: ACTIVE KAFFARAH RESTITUTIONS + TODAY'S RECORDED SLIPS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
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
            </div>
            <div className="lg:col-span-6">
              
          {/* RIGHT COLUMN: TODAY'S RECORDED SLIPS */}
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    TODAY'S RECORDED SLIPS ({todayEntries.length})
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Sacred daily ledger • {todayLostXP} XP penalty audited
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMainTab('LEDGER')}
                className="text-[10px] font-mono text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>Full Ledger →</span>
              </button>
            </div>

            {todayEntries.length > 0 ? (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {todayEntries.map(entry => {
                  const catColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Obligations;
                  const CategoryIcon = catColor.icon;
                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg ${catColor.bg} ${catColor.border} border shrink-0 mt-0.5`}>
                          <CategoryIcon className={`h-3.5 w-3.5 ${catColor.text}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-zinc-200">{entry.title || entry.category}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              entry.severity === 'Severe' || entry.severity === 'Critical' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' :
                              entry.severity === 'Major' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' :
                              'bg-zinc-800 text-zinc-300 border border-zinc-700/30'
                            }`}>
                              {entry.severity}
                            </span>
                          </div>
                          {entry.cause && (
                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                              Trigger: {entry.cause}
                            </p>
                          )}
                          {entry.reflection && (
                            <p className="text-[10px] text-zinc-400 italic mt-0.5 line-clamp-1">
                              "{entry.reflection}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-rose-400">
                          −{entry.xpDeducted || entry.rawPenalty || 0} XP
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedEntryDetail(entry)}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-white/5"
                          title="Delete Slip"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-black/30 border border-emerald-500/20 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto opacity-80" />
                <h4 className="text-xs font-bold text-emerald-300 font-mono">Spiritual Slate Guarded & Clean</h4>
                <p className="text-[11px] text-zinc-400 font-mono max-w-xs mx-auto">
                  Zero slips recorded today. Your boundaries remain steadfast. Continue with remembrance and mindfulness.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAuditModal(undefined, undefined, 'slip')}
                  className="mt-2 text-[10.5px] font-mono text-[#c5a059] hover:underline cursor-pointer"
                >
                  + Record an Honest Slip if one occurred →
                </button>
              </div>
            )}
          </div>

            </div>
          </div>

          
          {/* COMPACT WEEKLY PRACTICE PREVIEW BANNER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#1b1509] via-[#101520] to-[#07090e] border border-[#c5a059]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c5a059] bg-[#3a2e12] px-2 py-0.5 rounded border border-[#c5a059]/40">
                  WEEKLY PRACTICE EVALUATION
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {liveWeeklySummary.startDate} → {liveWeeklySummary.endDate}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-lg font-bold text-white font-display">
                  Live Score: <span className="text-[#fef08a]">{liveWeeklySummary.scoreOutOf10?.toFixed(1) || '10.0'} / 10.0</span>
                </span>
                <span className="text-xs text-zinc-300 font-mono">
                  • {liveWeeklySummary.weeklyScoreBreakdown?.gradeAr || 'ممتاز'} ({liveWeeklySummary.weeklyScoreBreakdown?.gradeEn || 'Excellent'})
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Evaluation across all 6 Sacred Pillars: Farā'iḍ prayers, Slip restraint, Adhkār fortress, Sunan/Qiyām, Salawāt ﷺ, and Tawbah.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveMainTab('WEEKLY')}
              className="px-4 py-2.5 rounded-xl bg-[#3a2e12] hover:bg-[#4c3c18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <span>View Full 10.0 Evaluation & Pillars</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: SACRED SLIP LEDGER */}
      {activeMainTab === 'LEDGER' && (
        <div className="space-y-4">
          {/* RIGHT COLUMN: THE SACRED LEDGER OF SLIPS */}
        <div className="space-y-4">
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl space-y-4">
            {/* LEDGER HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#3a2e12]/80 border border-[#c5a059]/50 text-[#fef08a] shadow-inner">
                  <Scale className="h-4 w-4 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider flex items-center gap-2">
                    <span>THE SACRED LEDGER OF SLIPS</span>
                    <span className="text-[10px] font-mono font-normal text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/30">
                      سِجِلُّ الهَفَوَات
                    </span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Sacred audit ledger • {processedEntries.length} displayed ({timeScope === 'today' ? 'Today only' : timeScope === 'week' ? 'Past 7 days' : 'Lifetime'})
                  </span>
                </div>
              </div>

              {/* SEARCH & WEEKLY SUMMARY ACTION */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenWeeklySummaryGenerator}
                  className="px-2.5 py-1.5 rounded-lg bg-[#3a2e12]/40 hover:bg-[#3a2e12]/80 border border-[#c5a059]/30 hover:border-[#c5a059]/60 text-[#fef08a] transition flex items-center gap-1.5 text-xs font-mono shrink-0 shadow-sm active:scale-95"
                  title="Generate weekly summary & archive ledger"
                >
                  <FileText className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span className="hidden sm:inline text-[11px] font-bold">Weekly Audit</span>
                </button>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search slips, triggers..."
                    className="bg-[#080a0f] border border-white/10 focus:border-[#c5a059] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 outline-none w-full sm:w-44 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* DUAL SCOPE SELECTOR TABS (TODAY VS WEEK-LONG VS ARCHIVE) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#06080d] border border-white/5 font-mono text-xs">
              <button
                onClick={() => setTimeScope('today')}
                className={`py-2 px-2.5 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center relative ${
                  timeScope === 'today'
                    ? 'bg-gradient-to-b from-[#3a2e12] to-[#241c09] text-[#fef08a] border border-[#c5a059]/60 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className={`h-3.5 w-3.5 ${timeScope === 'today' ? 'text-[#c5a059]' : 'text-zinc-500'}`} />
                  <span className="text-[11px]">Today's Slips</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    timeScope === 'today' ? 'bg-black/50 text-[#fef08a]' : 'bg-black/40 text-zinc-400'
                  }`}>
                    {todayEntries.length}
                  </span>
                  {todayLostXP > 0 && (
                    <span className="text-[9px] text-rose-400 font-mono hidden md:inline">
                      −{todayLostXP} XP
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setTimeScope('week')}
                className={`py-2 px-2.5 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center relative ${
                  timeScope === 'week'
                    ? 'bg-gradient-to-b from-[#182638] to-[#0d1624] text-cyan-200 border border-cyan-500/60 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CalendarDays className={`h-3.5 w-3.5 ${timeScope === 'week' ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span className="text-[11px]">Week-Long Slips</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    timeScope === 'week' ? 'bg-black/50 text-cyan-300' : 'bg-black/40 text-zinc-400'
                  }`}>
                    {weekEntries.length}
                  </span>
                  {weekLostXP > 0 && (
                    <span className="text-[9px] text-rose-400 font-mono hidden md:inline">
                      −{weekLostXP} XP
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setTimeScope('all')}
                className={`py-2 px-2.5 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center relative ${
                  timeScope === 'all'
                    ? 'bg-gradient-to-b from-[#251b2e] to-[#140e1b] text-purple-200 border border-purple-500/60 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className={`h-3.5 w-3.5 ${timeScope === 'all' ? 'text-purple-400' : 'text-zinc-500'}`} />
                  <span className="text-[11px]">All-Time ({entries.length})</span>
                </div>
                {allLostXP > 0 && (
                  <span className="text-[9px] text-zinc-400 font-mono hidden md:inline">
                    −{allLostXP} XP
                  </span>
                )}
              </button>
            </div>

            {/* DEDICATED SCOPE DISTINCTION OVERVIEW BARS */}
            <AnimatePresence mode="wait">
              {timeScope === 'today' ? (
                <motion.div
                  key="today-summary"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-[#1c160a]/90 via-[#0e1017] to-[#0a0d14] border border-[#c5a059]/40 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Today's Audit Ledger: {todayDateStr}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Resets daily at 00:00 • Contributes to Daily Mīzān
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenAuditModal()}
                      className="px-2.5 py-1 rounded-lg bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-[11px] font-mono transition flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                      Log Slip Today
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Today's Slips</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-base font-bold ${todayEntries.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {todayEntries.length}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {todayEntries.length === 0 ? 'Pure Day ✓' : todayEntries.length === 1 ? 'incident' : 'incidents'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Today's Deductions</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-base font-bold ${todayLostXP > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                          −{todayLostXP}
                        </span>
                        <span className="text-[10px] text-zinc-400">XP</span>
                        {todayLostCoins > 0 && (
                          <span className="text-[10px] text-amber-400 ml-1">
                            (−{todayLostCoins}g)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Today's Mīzān Balance</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-xs font-bold ${
                          stats.equilibriumStatus === 'Radiant Balance' || stats.equilibriumStatus === 'Blessed Equilibrium' ? 'text-emerald-400' :
                          stats.equilibriumStatus === 'Severe Nafs Warning' || stats.equilibriumStatus === 'Spiritual Deficit' ? 'text-rose-400' :
                          'text-amber-400'
                        }`}>
                          {stats.equilibriumStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : timeScope === 'week' ? (
                <motion.div
                  key="week-summary"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-[#0c1a29]/90 via-[#0e1017] to-[#0a0d14] border border-cyan-500/40 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        7-Day Accounting Cycle: {weekStartDate} → {weekEndDate}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Evaluated at Friday Jumu'ah
                      </span>
                    </div>
                    <button
                      onClick={handleOpenWeeklySummaryGenerator}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] font-mono transition flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Sparkles className="h-3 w-3" />
                      View Friday Evaluation
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">7-Day Slips Tally</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-base font-bold ${weekEntries.length > 3 ? 'text-amber-400' : 'text-cyan-300'}`}>
                          {weekEntries.length}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          audited slips
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Weekly Deductions</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-base font-bold ${weekLostXP > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                          −{weekLostXP}
                        </span>
                        <span className="text-[10px] text-zinc-400">XP</span>
                        {weekLostCoins > 0 && (
                          <span className="text-[10px] text-amber-400 ml-1">
                            (−{weekLostCoins}g)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Slip Restraint Score</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-base font-bold text-[#fef08a]">
                          {(liveWeeklySummary.weeklyScoreBreakdown?.slipsRestraintScore ?? 2.0).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-zinc-400">/ 2.0 pts</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="all-summary"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-[#1b1224]/90 via-[#0e1017] to-[#0a0d14] border border-purple-500/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      Complete Historical Ledger ({entries.length} Total Records)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Cumulative spiritual audit archive
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Total Audits</span>
                      <span className="text-base font-bold text-purple-300">{entries.length}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Lifetime Deductions</span>
                      <span className="text-base font-bold text-rose-400">−{allLostXP} XP</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] text-zinc-500 block uppercase">Weakness Chains</span>
                      <span className="text-base font-bold text-amber-300">{weaknesses.length}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SIMPLE FILTER BAR */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 py-2.5 border-b border-white/5 text-[10px] font-mono">
              <label className="flex items-center gap-2 bg-[#07090e] border border-white/10 rounded-lg px-2 py-1.5 text-zinc-400">
                <span>Sort</span>
                <select value={`${sortField}:${sortOrder}`} onChange={event => {
                  const [field, order] = event.target.value.split(':') as [SortField, SortOrder];
                  setSortField(field);
                  setSortOrder(order);
                }} className="min-w-0 flex-1 bg-transparent text-zinc-200 outline-none">
                  <option value="time:desc">Newest</option>
                  <option value="time:asc">Oldest</option>
                  <option value="severity:desc">Severity</option>
                  <option value="xp:desc">Largest penalty</option>
                  <option value="category:asc">Realm A-Z</option>
                </select>
              </label>
              <label className="flex items-center gap-2 bg-[#07090e] border border-white/10 rounded-lg px-2 py-1.5 text-zinc-400">
                <span>Group</span>
                <select value={groupMode} onChange={event => setGroupMode(event.target.value as GroupMode)} className="min-w-0 flex-1 bg-transparent text-zinc-200 outline-none">
                  <option value="none">Flat list</option>
                  <option value="horizon">Time horizon</option>
                  <option value="category">Realm</option>
                  <option value="severity">Severity</option>
                  <option value="date">Date</option>
                </select>
              </label>
              <label className="flex items-center gap-2 bg-[#07090e] border border-white/10 rounded-lg px-2 py-1.5 text-zinc-400">
                <span>Realm</span>
                <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="min-w-0 flex-1 bg-transparent text-zinc-200 outline-none">
                  <option value="ALL">All realms</option>
                  {['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'].map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 bg-[#07090e] border border-white/10 rounded-lg px-2 py-1.5 text-zinc-400">
                <span>Severity</span>
                <select value={severityFilter} onChange={event => setSeverityFilter(event.target.value)} className="min-w-0 flex-1 bg-transparent text-zinc-200 outline-none">
                  <option value="ALL">All levels</option>
                  {['Critical', 'Severe', 'Major', 'Moderate', 'Minor'].map(severity => <option key={severity} value={severity}>{severity}</option>)}
                </select>
              </label>
            </div>

            {/* ENTRIES FEED (SUPPORTS GROUPING & SORTING) */}
            <div className="space-y-4 pt-2 max-h-[680px] overflow-y-auto pr-1">
              {groupedEntries.some(g => g.entries.length > 0) ? (
                groupedEntries.map(group => {
                  if (group.entries.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-2.5">
                      {groupMode !== 'none' && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gradient-to-r from-white/10 to-transparent border border-white/10 font-mono text-xs shadow-sm">
                          <span className="font-bold text-zinc-100 flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
                            {group.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-white/5 font-semibold">
                            {group.entries.length} {group.entries.length === 1 ? 'audit record' : 'audit records'}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {group.entries.map(entry => {
                          const catConfig = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Obligations;
                          const CatIcon = catConfig.icon;
                          const isSelected = selectedEntryDetail?.id === entry.id;
                          const dateInfo = getRelativeDateInfo(entry.date);

                          // Time formatting
                          let formattedTime = entry.date;
                          let timeOnly = '';
                          if (entry.timestamp) {
                            try {
                              const dt = new Date(entry.timestamp);
                              timeOnly = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              formattedTime = `${entry.date} ${timeOnly}`;
                            } catch {
                              formattedTime = entry.date;
                            }
                          }

                          return (
                            <div 
                              key={entry.id}
                              className={`p-4 rounded-xl border transition ${
                                isSelected 
                                  ? 'bg-[#111622] border-[#c5a059]/80 shadow-xl' 
                                  : dateInfo.isToday
                                  ? 'bg-[#0e0c07]/90 border-amber-500/30 hover:border-amber-500/50 shadow-md'
                                  : 'bg-[#080a10] border-white/10 hover:border-white/20'
                              }`}
                            >
                              {/* Entry Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className={`p-2 rounded-lg ${catConfig.bg} border ${catConfig.border} ${catConfig.text} shrink-0 mt-0.5 shadow-sm`}>
                                    <CatIcon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                      {/* DISTINCTIVE TODAY VS WEEK BADGE */}
                                      {dateInfo.isToday ? (
                                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-sm">
                                          <Zap className="h-3 w-3 text-amber-400 animate-pulse" />
                                          TODAY • اليوم
                                        </span>
                                      ) : dateInfo.isThisWeek ? (
                                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                          <CalendarDays className="h-2.5 w-2.5 text-cyan-400" />
                                          {dateInfo.label}
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-black/50 text-zinc-400 border border-white/10">
                                          Prior Cycle
                                        </span>
                                      )}

                                      <span className={`px-1.5 py-0.2 rounded font-bold font-mono text-[10px] ${
                                        entry.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                                        entry.severity === 'Severe' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                                        entry.severity === 'Major' ? 'bg-orange-950 text-orange-300 border border-orange-500/30' :
                                        entry.severity === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                                        'bg-blue-950 text-blue-300 border border-blue-500/30'
                                      }`}>
                                        {entry.severity}
                                      </span>

                                      {/* RECURRING SLIP ESCALATION BADGE */}
                                      {entry.isRecurring && (
                                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-950/90 text-rose-300 border border-rose-500/60 flex items-center gap-1 shadow-sm">
                                          <Repeat className="h-3 w-3 text-rose-400 animate-pulse" />
                                          {entry.recurrenceCadence || 'Recurring Loop'}
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="font-bold text-xs sm:text-sm text-zinc-100 tracking-wide break-words">
                                      {entry.title}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                                      <span className={`${catConfig.text} font-semibold`}>
                                        {entry.category} Realm
                                      </span>
                                      <span>•</span>
                                      <span className="text-zinc-300 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5 text-zinc-500" />
                                        {dateInfo.isToday && timeOnly ? `Today at ${timeOnly}` : formattedTime}
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
                                      <div className="flex items-center gap-1">
                                        {entry.hpDeducted !== undefined && entry.hpDeducted > 0 && (
                                          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40 flex items-center gap-1">
                                            <Heart className="h-3 w-3 text-rose-400" />
                                            −{entry.hpDeducted} HP
                                          </span>
                                        )}
                                        <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                                          −{entry.xpDeducted || entry.rawPenalty} XP
                                        </span>
                                      </div>
                                      {entry.coinsDeducted ? (
                                        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold flex items-center gap-1">
                                          <Coins className="h-2.5 w-2.5 text-amber-400" />
                                          −{entry.coinsDeducted} Coins
                                        </span>
                                      ) : null}
                                      {entry.isRecurring && (
                                        <span className="text-[9px] font-mono text-rose-200 bg-rose-900/80 px-1.5 py-0.2 rounded-full border border-rose-400/50 font-bold flex items-center gap-0.5">
                                          <Repeat className="h-2.5 w-2.5" />
                                          {entry.multiplier ? `${entry.multiplier.toFixed(2)}x Escalated` : 'Escalated'}
                                        </span>
                                      )}
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
                                      entry.kaffarahCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                    }`}>
                                      {entry.kaffarahCompleted ? 'Fulfilled ✓' : 'Pending Quest'}
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
                  <h4 className="text-xs font-bold text-zinc-300 font-mono">
                    {timeScope === 'today' ? 'No Slips Recorded Today' : timeScope === 'week' ? 'No Slips Recorded This Week' : 'No Audit Records Found'}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-mono max-w-xs mx-auto">
                    {searchQuery 
                      ? 'Try changing your search query or filters.' 
                      : timeScope === 'today' 
                      ? 'Alhamdulillah! Your daily ledger is pure. Use the 3-Tap Zen Triage above if you need to log an accountability reflection.'
                      : 'Use the 3-Tap Zen Triage above to record self-accountability reflections.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* TAB 3: PATTERNS & BEHAVIORAL BOUNDARIES */}
      {activeMainTab === 'PATTERNS' && (
        <div className="space-y-4">
          {/* RECURRING PATTERNS: USED ONLY TO PREVENT REPETITION */}
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    PATTERNS TO PREVENT RECURRENCE ({weaknesses.length})
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Define root triggers and enforce concrete preventive protocols.
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenAddPatternModal}
                className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059]/25 border border-[#c5a059]/40 text-[#c5a059] text-[10.5px] font-mono font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                title="Add a new pattern & preventive protocol"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ NEW PROTOCOL</span>
              </button>
            </div>

            {/* Filter Tabs: All, Active, Under Control, Overcome */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[10px] font-mono">
              <button
                onClick={() => setPatternStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                  patternStatusFilter === 'ALL'
                    ? 'bg-white/15 border-white/30 text-white font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ALL ({weaknesses.length})
              </button>
              <button
                onClick={() => setPatternStatusFilter('Active')}
                className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  patternStatusFilter === 'Active'
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ACTIVE ({activeWeaknesses.length})
                {activeChainsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] rounded-full font-bold animate-pulse">
                    {activeChainsCount} CHAINS
                  </span>
                )}
              </button>
              <button
                onClick={() => setPatternStatusFilter('Under Control')}
                className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                  patternStatusFilter === 'Under Control'
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                UNDER CONTROL ({underControlWeaknesses.length})
              </button>
              <button
                onClick={() => setPatternStatusFilter('Overcome')}
                className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                  patternStatusFilter === 'Overcome'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                OVERCOME ({overcomeWeaknesses.length})
              </button>
            </div>

            {recurringSinsRegistry && recurringSinsRegistry.totalRecurringCount > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-amber-950/20 border border-amber-500/30">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    RECURRENCE CADENCE REGISTRY ({recurringSinsRegistry.totalRecurringCount} DETECTED)
                  </span>
                  {recurringSinsRegistry.activeChainsCount > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 border border-rose-500/40 text-rose-300">
                      {recurringSinsRegistry.activeChainsCount} ACTIVE COMPOUNDING CHAINS
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <div className="text-zinc-500">SAME-DAY RELAPSE</div>
                    <div className="text-rose-400 font-bold text-xs mt-0.5">{recurringSinsRegistry.intraDaySins.length} patterns</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <div className="text-zinc-500">CONSECUTIVE DAILY</div>
                    <div className="text-amber-400 font-bold text-xs mt-0.5">{recurringSinsRegistry.dailySins.length} patterns</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <div className="text-zinc-500">EVERY 2 DAYS</div>
                    <div className="text-yellow-400 font-bold text-xs mt-0.5">{recurringSinsRegistry.everyTwoDaysSins.length} patterns</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <div className="text-zinc-500">PERIODIC (3-7 DAYS)</div>
                    <div className="text-cyan-400 font-bold text-xs mt-0.5">{recurringSinsRegistry.periodicSins.length} patterns</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {realmPatternSummary.map(realm => {
                const catColor = CATEGORY_COLORS[realm.category] || CATEGORY_COLORS.Obligations;
                const RealmIcon = catColor.icon;
                return (
                  <button
                    key={realm.category}
                    onClick={() => handleOpenAuditModal(realm.pattern?.id, realm.category)}
                    className={`text-left p-2.5 rounded-lg border ${catColor.border} ${catColor.bg} hover:brightness-125 transition group`}
                    title={`Audit ${realm.category} and address its latest trigger`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${catColor.text}`}>
                        <RealmIcon className="h-3 w-3" /> {realm.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-300">{realm.count}</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-1 truncate">{realm.pattern ? `Trigger: ${realm.pattern.triggerCause}` : realm.latestTitle}</p>
                    <span className="text-[9px] font-mono text-zinc-300 group-hover:text-white mt-1 block">{realm.pattern ? 'REVIEW PATTERN →' : 'LOG AUDIT →'}</span>
                  </button>
                );
              })}
            </div>

            {displayedWeaknesses.length > 0 ? (
              <div className="space-y-3">
                {displayedWeaknesses.map(weakness => {
                  const catColor = CATEGORY_COLORS[weakness.category] || CATEGORY_COLORS.Obligations;
                  const CategoryIcon = catColor.icon;
                  const decay = getWeaknessDecayMetrics(weakness, todayDateStr);
                  const effectiveSlots = decay.activeSlots;
                  const isOvercome = weakness.status === 'Overcome' || decay.effectiveStatus === 'Overcome';
                  const isUnderControl = (weakness.status === 'Under Control' || decay.effectiveStatus === 'Under Control') && !isOvercome;
                  const isActiveChain = effectiveSlots >= 5;

                  // Calculate restraint days
                  const daysInRestraint = weakness.lastOccurrenceDate
                    ? Math.max(0, getDaysDifference(weakness.lastOccurrenceDate, todayDateStr))
                    : null;

                  const currentProtocol = weakness.preventiveProtocol || weakness.correctiveStrategy;

                  return (
                    <div 
                      key={weakness.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition ${
                        isOvercome
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : isUnderControl
                            ? 'bg-[#0a1018] border-cyan-500/35'
                            : isActiveChain
                              ? 'bg-[#150a0e] border-rose-500/50 shadow-sm shadow-rose-950/50'
                              : 'bg-[#090b10] border-white/10'
                      }`}
                    >
                      {/* Top Bar: Name, Realm Badge, Status Toggle & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-zinc-100 font-mono truncate">
                              {weakness.name}
                            </span>
                            <span className={`text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${catColor.border} ${catColor.bg} ${catColor.text}`}>
                              <CategoryIcon className="h-2.5 w-2.5" />
                              {weakness.category}
                            </span>
                            {decay.slotsRecovered > 0 && (
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                                <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                                {decay.slotsRecovered} {decay.slotsRecovered === 1 ? 'Slot' : 'Slots'} Emptied
                              </span>
                            )}
                          </div>

                          {/* Restraint streak / last occurrence */}
                          <div className="text-[10px] font-mono mt-1.5 flex items-center gap-2 flex-wrap">
                            {daysInRestraint === null ? (
                              <span className="text-zinc-400">🌱 Proactive boundary (0 recorded slips)</span>
                            ) : daysInRestraint === 0 ? (
                              <span className="text-rose-400 font-semibold flex items-center gap-1">
                                <Flame className="h-3 w-3 text-rose-500 shrink-0" /> Slipped today ({weakness.lastOccurrenceDate})
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <Shield className="h-3 w-3 text-emerald-400 shrink-0" />
                                {daysInRestraint} {daysInRestraint === 1 ? 'day' : 'days'} in restraint (Thabāt)
                              </span>
                            )}

                            {/* Eligibility shortcuts */}
                            {daysInRestraint !== null && daysInRestraint >= 7 && weakness.status === 'Active' && (
                              <button
                                onClick={() => updateWeakness(weakness.id, { status: 'Under Control' })}
                                className="text-[9px] text-cyan-300 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/40 hover:bg-cyan-900/60 transition cursor-pointer"
                                title="7+ days clean without slip"
                              >
                                ⚡ Move to Under Control
                              </button>
                            )}
                            {daysInRestraint !== null && daysInRestraint >= 21 && weakness.status === 'Under Control' && (
                              <button
                                onClick={() => updateWeakness(weakness.id, { status: 'Overcome' })}
                                className="text-[9px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 hover:bg-emerald-900/60 transition cursor-pointer"
                                title="21+ days clean: Habit loop broken"
                              >
                                🌟 Mark Overcome
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status Switcher & Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              const nextStatus = weakness.status === 'Active' ? 'Under Control' : weakness.status === 'Under Control' ? 'Overcome' : 'Active';
                              updateWeakness(weakness.id, { status: nextStatus });
                            }}
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border cursor-pointer transition ${
                              isOvercome
                                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' 
                                : isUnderControl
                                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                            }`}
                            title="Click to toggle status: Active → Under Control → Overcome"
                          >
                            {weakness.status}
                          </button>
                          <button
                            onClick={() => handleOpenEditPatternModal(weakness)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                            title="Edit Trigger & Preventive Protocol"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteWeakness(weakness.id)}
                            className="p-1 rounded bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 transition cursor-pointer shrink-0"
                            title="Delete pattern"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* DYNAMIC REVERSIBLE 5-SLOT METER */}
                      <div className="my-2.5 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[10.5px] font-mono">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-zinc-400 font-semibold">Recurrence Slots:</span>
                            {isActiveChain ? (
                              <span className="text-rose-400 font-bold uppercase flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-rose-500 animate-pulse" />
                                5/5 Slots Full (Chronic Chain)
                              </span>
                            ) : decay.isChainBroken ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                Chain Broken ({effectiveSlots}/5 Active)
                              </span>
                            ) : effectiveSlots === 0 ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                Boundary Fully Guarded (0/5 Active)
                              </span>
                            ) : (
                              <span className="text-amber-300 font-semibold">
                                {effectiveSlots} / 5 Active Slots
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                            <span>Lifetime Slips: <strong className="text-zinc-200">{weakness.totalHistoricalSlips || weakness.occurrenceCount || 0}</strong></span>
                          </div>
                        </div>

                        {/* 5-Slot Visual Indicators */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map(idx => {
                            const isFilled = idx <= effectiveSlots;
                            const isEmptiedByCleanDays = !isFilled && idx <= (weakness.occurrenceCount || 0);

                            return (
                              <div
                                key={idx}
                                className={`h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                                  isFilled
                                    ? idx >= 5 
                                      ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse'
                                      : 'bg-amber-400 text-black shadow-sm'
                                    : isEmptiedByCleanDays
                                      ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-950/50'
                                      : 'bg-zinc-800/60 border border-white/5 text-zinc-600'
                                }`}
                                title={
                                  isFilled
                                    ? `Slot ${idx}: Active Slip (${idx}/5)`
                                    : isEmptiedByCleanDays
                                      ? `Slot ${idx}: Emptied through clean days of restraint!`
                                      : `Slot ${idx}: Clear`
                                }
                              >
                                {isFilled ? (
                                  idx === 5 ? <Flame className="h-3 w-3 text-white" /> : idx
                                ) : isEmptiedByCleanDays ? (
                                  <Shield className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <span className="text-[9px] text-zinc-600">○</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Dynamic Recovery Progress Bar / Countdown */}
                        {effectiveSlots > 0 ? (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="flex items-center gap-1 text-emerald-300 font-medium">
                                <Zap className="h-3 w-3 text-emerald-400" />
                                Slot Recovery Rate: 1 slot emptied every {decay.decayIntervalDays} clean days
                              </span>
                              <span className="text-zinc-300">
                                Cycle: <strong className="text-emerald-400">{decay.cleanDaysProgress}</strong> / {decay.decayIntervalDays} clean days
                              </span>
                            </div>
                            <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                style={{ width: `${Math.min(100, (decay.cleanDaysProgress / decay.decayIntervalDays) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[9.5px] font-mono text-zinc-400 flex items-center justify-between">
                              <span>
                                {decay.daysUntilNextDecay === 0
                                  ? '🌟 Milestone achieved! Keep this boundary unbroken.'
                                  : `✨ Maintain restraint for ${decay.daysUntilNextDecay} more ${decay.daysUntilNextDecay === 1 ? 'clean day' : 'clean days'} without logging this slip to empty Slot #${effectiveSlots}.`}
                              </span>
                              {decay.isChainBroken && (
                                <span className="text-emerald-400 font-bold ml-2 shrink-0">
                                  +25% Penalty Floor Lifted
                                </span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                            <span className="flex items-center gap-1 font-bold">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                              All 5 slots cleared! Habit loop successfully interrupted.
                            </span>
                            <span className="text-[9.5px] text-zinc-400">
                              {decay.daysClean >= 21 ? '🏆 21+ Days: Overcome Mastery' : `${21 - decay.daysClean} days to Overcome`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Active Chronic Chain Warning Banner (Self-contained, non-power seal) */}
                      {isActiveChain && !isOvercome && (
                        <div className="my-2.5 p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-[10.5px] font-mono">
                          <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                              CHRONIC CHAIN ACTIVE (5/5 SLOTS FULL)
                            </span>
                            <span className="text-[9.5px] bg-rose-900/80 px-1.5 py-0.2 rounded border border-rose-500/40 text-rose-200">
                              +25% Penalty Floor
                            </span>
                          </div>
                          <p className="text-zinc-300 text-[10px] leading-relaxed">
                            Repeated recurrence confirms an unchecked habit loop. The system enforces a +25% penalty floor. Log 2 clean days without this audit to empty a slot and break the chain.
                          </p>
                        </div>
                      )}

                      {/* Recurrence Cadence & Escalation Status */}
                      <div className="my-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-[10px] font-mono flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1.5 ${effectiveSlots >= 5 ? 'text-rose-400' : effectiveSlots >= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          <Repeat className="h-3 w-3 shrink-0" />
                          {decay.effectiveCadenceLabel}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded border text-[9px] ${effectiveSlots >= 5 ? 'bg-rose-900/60 border-rose-500/30 text-rose-200' : 'bg-zinc-800 border-white/10 text-zinc-300'}`}>
                          {decay.effectiveMultiplier > 1.0 ? `${((decay.effectiveMultiplier)).toFixed(2)}x Penalties` : '1.00x Baseline'}
                        </span>
                      </div>

                      {/* 4-PILLAR BEHAVIORAL DISRUPTION BLUEPRINT */}
                      <div className="my-2.5 p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono space-y-2.5">
                        <div className="flex items-center justify-between pb-1 border-b border-white/5">
                          <span className="text-[10px] uppercase font-bold text-amber-300/90 tracking-wider flex items-center gap-1.5">
                            <Target className="h-3 w-3 text-amber-400" />
                            Habit Disruption Blueprint (قَوَاعِدُ نَقْضِ العَادَة)
                          </span>
                          <span className="text-[9px] text-zinc-400">
                            Behavioral Strategy
                          </span>
                        </div>

                        {/* Pillar 1: Cue & Physical Friction */}
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-[9.5px] uppercase font-bold text-amber-400/90 shrink-0 w-24 flex items-center gap-1">
                              <EyeOff className="h-2.5 w-2.5 text-amber-400" />
                              1. Cue:
                            </span>
                            <div className="flex-1 text-[10.5px] text-zinc-300">
                              <div><strong className="text-zinc-400 font-normal">Trigger:</strong> {weakness.triggerCause || 'No trigger specified'}</div>
                              {weakness.cueFriction && (
                                <div className="text-amber-300/90 mt-0.5"><strong className="text-zinc-400 font-normal">Friction Barrier:</strong> {weakness.cueFriction}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pillar 2: Implementation Intention (If-Then) */}
                        <div className="space-y-1 pt-1.5 border-t border-white/5">
                          <div className="flex items-start gap-2">
                            <span className="text-[9.5px] uppercase font-bold text-emerald-400/90 shrink-0 w-24 flex items-center gap-1">
                              <Shield className="h-2.5 w-2.5 text-emerald-400" />
                              2. Protocol:
                            </span>
                            <div className="flex-1 text-[10.5px] text-zinc-200">
                              {currentProtocol ? (
                                <p className="leading-relaxed">{currentProtocol}</p>
                              ) : (
                                <button
                                  onClick={() => handleOpenEditPatternModal(weakness)}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                                >
                                  + Set If-Then Rule (e.g. IF alarm sounds, THEN stand immediately)
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pillar 3 & 4: Replacement Habit & Identity Anchor */}
                        {(weakness.replacementHabit || weakness.identityAnchor) && (
                          <div className="pt-1.5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            {weakness.replacementHabit && (
                              <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/5">
                                <div className="text-[9px] uppercase font-bold text-cyan-300 flex items-center gap-1 mb-0.5">
                                  <Zap className="h-2.5 w-2.5" />
                                  3. Replacement Habit:
                                </div>
                                <div className="text-zinc-300">{weakness.replacementHabit}</div>
                              </div>
                            )}
                            {weakness.identityAnchor && (
                              <div className="p-2 rounded-lg bg-[#3a2e12]/20 border border-[#c5a059]/30">
                                <div className="text-[9px] uppercase font-bold text-[#fef08a] flex items-center gap-1 mb-0.5">
                                  <Heart className="h-2.5 w-2.5 text-[#c5a059]" />
                                  4. Identity Anchor:
                                </div>
                                <div className="text-zinc-200 italic font-serif">"{weakness.identityAnchor}"</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenAuditModal(weakness.id, weakness.category)}
                          className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-mono text-zinc-300 hover:text-white transition text-center cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Record Slip
                        </button>
                        <button
                          onClick={() => handleOpenEditPatternModal(weakness)}
                          className="px-3 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] text-[10.5px] font-mono transition cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit Strategy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 rounded-xl bg-[#07090e] border border-white/5">
                <p className="text-xs text-zinc-400 font-mono">
                  {patternStatusFilter === 'ALL'
                    ? 'No behavioral patterns recorded yet. Click "+ NEW PROTOCOL" to proactively establish boundary rules.'
                    : `No patterns currently matching status "${patternStatusFilter}".`}
                </p>
                {patternStatusFilter !== 'ALL' && (
                  <button
                    onClick={() => setPatternStatusFilter('ALL')}
                    className="mt-2 text-[10.5px] text-[#c5a059] hover:underline font-mono cursor-pointer"
                  >
                    View All Patterns →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WEEKLY REVIEW & EVALUATION (10/10) */}
      {activeMainTab === 'WEEKLY' && (
        <div className="space-y-4">
          {/* 2. LIFE MUHASABAH WITH WEEKLY REVIEW CADENCE */}
      {(() => {
        const b = liveWeeklySummary.weeklyScoreBreakdown;
        const currentScore = liveWeeklySummary.scoreOutOf10 ?? 10.0;
        const isNearTen = currentScore >= 9.5;

        return (
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] relative overflow-hidden shadow-2xl space-y-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,var(--glow-color),transparent_65%)] pointer-events-none" />

            {/* TOP HEADER ROW */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                    <Scale className="h-3 w-3 text-[var(--accent-bright)]" />
                    <span>محاسبة الحياة • LIFE MUHASABAH / 10</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {liveWeeklySummary.startDate} → {liveWeeklySummary.endDate}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
                    <span>Weekly Practice Snapshot:</span>
                  </h3>
                  <span className="text-sm font-bold text-[var(--accent-bright)] font-mono">
                    {b?.gradeAr} — <span className="text-zinc-300">{b?.gradeEn}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <span className="text-rose-300">LIFE LEDGER: {entries.length} audits</span>
                  <span>•</span>
                  <span className="text-amber-300">−{allLostXP} lifetime XP</span>
                  <span>•</span>
                  <span>Score = practice feedback, not divine judgment</span>
                </div>
              </div>

              {/* 10/10 GAUGE BADGE & ACTIONS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center justify-between sm:justify-end gap-3 p-2.5 px-4 rounded-xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-accent)] shadow-inner">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">PRACTICE SNAPSHOT</span>
                    <span className="text-[10px] font-mono text-[var(--accent-bright)]">Not a spiritual verdict</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className={`text-2xl sm:text-3xl font-black ${
                      currentScore >= 9.5 ? 'text-emerald-300' :
                      currentScore >= 8.5 ? 'text-[var(--accent-highlight)]' :
                      currentScore >= 7.0 ? 'text-[var(--accent-bright)]' :
                      'text-rose-400'
                    }`}>
                      {currentScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold">/10.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowRefineDrawer(!showRefineDrawer)}
                    className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-[var(--accent-surface)] hover:bg-[var(--accent-surface-hover)] border border-[var(--border-accent)] text-[var(--accent-highlight)] text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer"
                    title="Toggle the 10/10 Refine action plan with one-tap quest injection"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                    <span>{showRefineDrawer ? 'HIDE' : '⚡ REFINE'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWeeklySummaryGenerator}
                    className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-[var(--border-accent)] text-zinc-200 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    id="full-friday-audit-modal-btn"
                    title="Open the weekly summary modal to write a personal reflection and manually archive any time"
                  >
                    <FileText className="h-3.5 w-3.5 text-[var(--accent-bright)] shrink-0" />
                    <span>FULL AUDIT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSavedArchivesModal(true)}
                    className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-black/60 hover:bg-zinc-800 border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 text-xs font-mono transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    id="view-saved-archives-btn"
                  >
                    <History className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
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
                    {((liveWeeklySummary.adhkarSleepNightCount || 0) > 0 || (liveWeeklySummary.adhkarSleepDhohrCount || 0) > 0) && (
                      <span> • {liveWeeklySummary.adhkarSleepNightCount || 0}/7 Night • {liveWeeklySummary.adhkarSleepDhohrCount || 0}/7 Nap</span>
                    )}
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
                  className="pt-3 border-t border-[var(--border-subtle)] space-y-3"
                >
                  <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-accent)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[var(--accent-highlight)] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                        <span>خطة الارتقاء للدرجة الكاملة 10/10 • ACTION PLAN TO REFINE TO 10/10</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isNearTen ? '10/10 Ihsanic Equilibrium Achieved' : `${(10.0 - currentScore).toFixed(1)} pts required for 10/10`}
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-zinc-200">
                      {b.actionPlan10OutOf10.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/40 border border-white/5 font-sans leading-relaxed">
                          <span className="text-[var(--accent-bright)] font-mono font-bold mt-0.5 shrink-0">[{idx + 1}]</span>
                          <span className="text-zinc-200">{step}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleInject10OutOf10Directives}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-dim)] via-[var(--accent-primary)] to-[var(--accent-bright)] hover:brightness-110 active:scale-95 text-black font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[var(--glow-color)]"
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
        </div>
      )}

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

      {/* UNIFIED MUHASABAH AUDIT & RECOVERY COMMAND CENTER */}
      <MuhasabahModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalInitialTab}
        prefillWeaknessId={prefillWeaknessId}
        prefillCategory={prefillCategory}
        onNavigateToQuests={() => onNavigate?.('quests')}
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
                      Weekly Muhāsabah Practice Review
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
                {/* Practice feedback card: never a divine verdict. */}
                {(() => {
                  const b = generatedSummary.weeklyScoreBreakdown;
                  const score = generatedSummary.scoreOutOf10 ?? 10.0;
                  return (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#1d160b] via-[#121622] to-[#080b11] border border-[#c5a059]/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono font-bold block">
                          WEEKLY PRACTICE FEEDBACK (مراجعة السلوك الأسبوعية)
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
                      {generatedSummary.adhkarSabahCount + generatedSummary.adhkarMasaCount + (generatedSummary.adhkarSleepNightCount || 0) + (generatedSummary.adhkarSleepDhohrCount || 0)} Adhkār
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {generatedSummary.sunnahRawatibCount} Sunan • {generatedSummary.qiyamTotalRakats} Qiyām
                    </span>
                  </div>
                </div>

                {/* ADHKĀR FORTRESS & QUR'AN GUIDANCE INTEGRATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-[#080d16] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-cyan-300 font-bold uppercase flex items-center gap-1.5 font-mono">
                        <ShieldCheck className="h-4 w-4 text-cyan-400" />
                        <span>Adhkār Fortress Integrity</span>
                      </span>
                      <span className="text-xs font-bold font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        {generatedSummary.adhkarFortressIntegrityAvg !== undefined ? `${generatedSummary.adhkarFortressIntegrityAvg}%` : '100%'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 flex items-center justify-between pt-1 border-t border-white/5 font-mono">
                      <span className="text-zinc-400">Completed Sessions:</span>
                      <span className="text-zinc-200">
                        🌅 {generatedSummary.adhkarMorningSessions || 0} Morn • 🌇 {generatedSummary.adhkarEveningSessions || 0} Eve • 🌙 {generatedSummary.adhkarSleepSessions || 0} Sleep
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#08120d] border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-300 font-bold uppercase flex items-center gap-1.5 font-mono">
                        <BookOpen className="h-4 w-4 text-emerald-400" />
                        <span>Qur’an Guidance & Freshness</span>
                      </span>
                      <span className="text-xs font-bold font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {generatedSummary.quranFreshnessScore !== undefined ? `${generatedSummary.quranFreshnessScore}% Fresh` : '100% Fresh'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 flex items-center justify-between pt-1 border-t border-white/5 font-mono">
                      <span className="text-zinc-400">Tilāwah & Revision:</span>
                      <span className="text-zinc-200">
                        📖 {generatedSummary.quranPagesRead || 0} pgs • 🔄 {generatedSummary.quranPassagesRevised || 0} revised
                      </span>
                    </div>
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
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
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

                {/* 6. NOTICE REGARDING ARCHIVE & PERMANENT LIFE LEDGER */}
                <div className="p-3 rounded-xl bg-[#1c160a] border border-[#c5a059]/40 space-y-1 text-[11px] text-amber-200/90 font-sans">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>WHAT HAPPENS UPON ARCHIVING:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                    <li>This summary document is permanently saved into your <strong>Planning Documents & Codex</strong>.</li>
                    <li>The <strong>Muhāsabah Life Ledger is preserved</strong>; each weekly review is a snapshot, never a deletion of your history.</li>
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

              {/* CONFIRMATION BANNER FOR CLEAR ALL */}
              {showClearArchivesConfirm && (
                <div className="p-4 mx-5 my-2 rounded-xl bg-rose-950/70 border border-rose-500/60 space-y-3 shrink-0 shadow-lg animate-in fade-in duration-150">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-white font-mono uppercase tracking-wide">
                        PERMANENTLY CLEAR ALL ARCHIVED MUHĀSABAH RECORDS?
                      </h4>
                      <p className="text-zinc-300 font-sans leading-relaxed">
                        Are you sure you want to permanently delete all <strong>{savedSummaries.length}</strong> weekly review archives from the system? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClearArchivesConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearAllWeeklyArchives();
                        setShowClearArchivesConfirm(false);
                        setSelectedArchiveDetail(null);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Confirm & Clear All</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CONFIRMATION BANNER FOR SINGLE RECORD */}
              {archiveToDelete && (
                <div className="p-4 mx-5 my-2 rounded-xl bg-rose-950/70 border border-rose-500/60 space-y-3 shrink-0 shadow-lg animate-in fade-in duration-150">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-white font-mono uppercase tracking-wide">
                        DELETE ARCHIVED WEEKLY RECORD?
                      </h4>
                      <p className="text-zinc-300 font-sans leading-relaxed">
                        Delete record for <strong>{archiveToDelete.startDate} → {archiveToDelete.endDate}</strong> ({archiveToDelete.weekLabel || archiveToDelete.generatedDate})?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setArchiveToDelete(null)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteWeeklyArchive(archiveToDelete.id || archiveToDelete.generatedDate);
                        if (selectedArchiveDetail?.id === archiveToDelete.id || selectedArchiveDetail?.generatedDate === archiveToDelete.generatedDate) {
                          setSelectedArchiveDetail(null);
                        }
                        setArchiveToDelete(null);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Record</span>
                    </button>
                  </div>
                </div>
              )}

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

                      {/* ARCHIVED ADHKAR & QUR'AN SUMMARY */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-[#080d16] border border-cyan-500/20 flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Fortress Integrity</span>
                          </span>
                          <span className="text-xs font-bold text-cyan-200">
                            {selectedArchiveDetail.adhkarFortressIntegrityAvg !== undefined ? `${selectedArchiveDetail.adhkarFortressIntegrityAvg}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#08120d] border border-emerald-500/20 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>Qur’an Progress</span>
                          </span>
                          <span className="text-xs font-bold text-emerald-200">
                            {selectedArchiveDetail.quranPagesRead || 0} pgs • {selectedArchiveDetail.quranPassagesRevised || 0} revised
                          </span>
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

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setArchiveToDelete(selectedArchiveDetail)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete This Archive Record</span>
                        </button>
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
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchiveToDelete(item);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                          title="Delete this archive record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-[#c5a059] group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-zinc-500">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-zinc-300">No archived weekly summaries found yet.</p>
                    <p className="text-[10px] text-zinc-500 mt-1">The active slip ledger is auto-archived and reset every Sunday. Use "FULL AUDIT" to snapshot intermediate weeks with a personal reflection.</p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-[#07090e] border-t border-white/10 flex items-center justify-between shrink-0">
                <div>
                  {savedSummaries.length > 0 && !showClearArchivesConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowClearArchivesConfirm(true)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear All Archives</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowSavedArchivesModal(false);
                      setSelectedArchiveDetail(null);
                      setShowClearArchivesConfirm(false);
                      setArchiveToDelete(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT PREVENTIVE PATTERN & PROTOCOL MODAL */}
      <AnimatePresence>
        {isAddPatternModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#0b0e15] border border-[#c5a059]/50 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden font-mono text-zinc-200 my-8 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 bg-gradient-to-r from-[#1c160a] via-[#121622] to-[#090b10] border-b border-[#c5a059]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a]">
                    <Shield className="h-4 w-4 text-[#c5a059]" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white tracking-wider">
                      {editingPattern ? 'EDIT PREVENTIVE PROTOCOL' : 'NEW PREVENTIVE PATTERN & PROTOCOL'}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Formulate an actionable boundary rule to prevent recurring lapses.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddPatternModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSavePattern} className="p-5 space-y-4">
                {patternFormError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{patternFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    PATTERN NAME <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={patternFormName}
                    onChange={e => setPatternFormName(e.target.value)}
                    placeholder="e.g. Uncontrolled Midnight Scrolling, Fajr Hesitation..."
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-[#c5a059] focus:outline-none text-xs text-white placeholder-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      REALM / CATEGORY
                    </label>
                    <select
                      value={patternFormCategory}
                      onChange={e => setPatternFormCategory(e.target.value as MuhasabahCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-[#c5a059] focus:outline-none text-xs text-white"
                    >
                      {(['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'] as MuhasabahCategory[]).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      OPERATIONAL STATUS
                    </label>
                    <select
                      value={patternFormStatus}
                      onChange={e => setPatternFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-[#c5a059] focus:outline-none text-xs text-white"
                    >
                      <option value="Active">Active (Under Scrutiny)</option>
                      <option value="Under Control">Under Control (Guarded)</option>
                      <option value="Overcome">Overcome (Mastered)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1" title="Number of consecutive clean days required to empty 1 slot">
                      CLEAN DAYS / SLOT
                    </label>
                    <select
                      value={patternFormDecayDays}
                      onChange={e => setPatternFormDecayDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-emerald-500/40 focus:border-emerald-400 focus:outline-none text-xs text-emerald-300 font-mono"
                    >
                      <option value={1}>1 Clean Day (Fastest)</option>
                      <option value={2}>2 Clean Days (Standard Daily)</option>
                      <option value={3}>3 Clean Days (Every 2-3 Days)</option>
                      <option value={4}>4 Clean Days (Semi-Weekly)</option>
                      <option value={7}>7 Clean Days (Weekly / Isolated)</option>
                    </select>
                  </div>
                </div>

                {/* 4-Pillar Behavioral Change Framework */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="text-[10px] uppercase font-bold text-amber-300/90 tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5">
                    <Target className="h-3.5 w-3.5 text-amber-400" />
                    Four Pillars of Habit Disruption (قَوَاعِدُ نَقْضِ العَادَة)
                  </div>

                  {/* Pillar 1: Root Trigger Cue & Friction Barrier */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                        <EyeOff className="h-3 w-3 text-amber-400" />
                        1A. ROOT TRIGGER CUE <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={patternFormTrigger}
                        onChange={e => setPatternFormTrigger(e.target.value)}
                        placeholder="e.g. Alarm goes off while in bed; idle late-night phone browsing"
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-amber-400" />
                        1B. PHYSICAL FRICTION BARRIER
                      </label>
                      <input
                        type="text"
                        value={patternFormCueFriction}
                        onChange={e => setPatternFormCueFriction(e.target.value)}
                        placeholder="e.g. Phone kept in hallway overnight; mechanical alarm across room"
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                  </div>

                  {/* Pillar 2: Implementation Intention (If-Then Protocol) */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      2. IF-THEN PROTOCOL (IMPLEMENTATION INTENTION) <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={patternFormProtocol}
                      onChange={e => setPatternFormProtocol(e.target.value)}
                      placeholder="WHEN [Cue happens], I WILL [immediate concrete counter-action], BEFORE [hesitating]..."
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-emerald-400 focus:outline-none text-xs text-white placeholder-zinc-500 resize-none leading-relaxed"
                    />
                    <span className="text-[9px] text-zinc-500 mt-0.5 block">
                      Example: "WHEN the 05:00 Fajr alarm rings, I WILL immediately swing my feet to the floor and say dhikr before lying back down."
                    </span>
                  </div>

                  {/* Pillar 3: Replacement Habit */}
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 mb-1 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-cyan-400" />
                      3. CONSTRUCTIVE REPLACEMENT HABIT (ALTERNATIVE REWARD)
                    </label>
                    <input
                      type="text"
                      value={patternFormReplacement}
                      onChange={e => setPatternFormReplacement(e.target.value)}
                      placeholder="e.g. Immediate cold splash of water on face + large glass of water + direct wudū'"
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-zinc-500"
                    />
                  </div>

                  {/* Pillar 4: Identity Anchor */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#fef08a] mb-1 flex items-center gap-1">
                      <Heart className="h-3 w-3 text-[#c5a059]" />
                      4. SACRED IDENTITY ANCHOR (TAZKIYAH IDENTITY)
                    </label>
                    <input
                      type="text"
                      value={patternFormIdentity}
                      onChange={e => setPatternFormIdentity(e.target.value)}
                      placeholder="e.g. I am an operator who guards the prayer at its earliest appointed time."
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#c5a059]/40 focus:border-[#c5a059] focus:outline-none text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddPatternModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-black font-bold text-xs transition cursor-pointer shadow-lg shadow-[#c5a059]/20"
                  >
                    {editingPattern ? 'Update Protocol' : 'Establish Protocol'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
