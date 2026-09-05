import React, { useState } from 'react';
import { usePOS, isQuestArchived } from '../POSContext';
import { getActiveJob, getActiveTitle } from '../jobsAndTitles';
import { JobTitleModal } from './JobTitleModal';
import { 
  Shield, Flame, Clock, CheckSquare, Square,
  ShieldAlert, Activity, ChevronRight, Check, Award, Compass,
  Sliders, Timer, Zap, Star, Coins, ShoppingBag, Plus, Search,
  Filter, Target, FolderKanban, Sparkles, TrendingUp, BarChart2,
  X, ArrowUpRight, Cpu, Layers, Play, RefreshCw, AlertTriangle, Lock, Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestDifficulty, QuestType } from '../types';
import { renderTopicIcon } from './matrix/TopicIconHelper';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';
import { MuhasabahModal } from './MuhasabahModal';
import { BossProgressionBanner } from './BossProgressionBanner';
import { TemporalCapitalHud } from './TemporalCapitalHud';

interface DashboardViewProps {
  onNavigate?: (tab: 'dashboard' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system' | 'quests' | 'shop' | 'muhasabah' | any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    state, updateProfileFocus, getPlayerLevelInfo, getAnalytics, completeQuest,
    isQuestFinishedForToday, processQuestReview, isQuestScheduledForDate, systemDate,
    toggleBatterySaverMode, toggleRecoveryMode, getAttributes, getGoalProgress,
    getProjectProgress, addQuest, getSkillXpAndLevel, getTodayMuhasabahStats, restartAttribute
  } = usePOS();

  const isBatterySaver = state.batterySettings?.batterySaverMode ?? false;
  const muhasabahStats = getTodayMuhasabahStats();

  const [focusText, setFocusText] = useState(state.profile.currentFocus);
  const [focusGoal, setFocusGoal] = useState(state.profile.focusGoalId || '');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [isJobTitleModalOpen, setIsJobTitleModalOpen] = useState(false);
  const [isMuhasabahModalOpen, setIsMuhasabahModalOpen] = useState(false);

  // Quick Quest Creator Modal State
  const [isQuickQuestOpen, setIsQuickQuestOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickType, setQuickType] = useState<QuestType>('Main');
  const [quickDifficulty, setQuickDifficulty] = useState<QuestDifficulty>('Normal');
  const [quickTime, setQuickTime] = useState<number>(30);
  const [quickGoalId, setQuickGoalId] = useState<string>('');
  const [quickProjectId, setQuickProjectId] = useState<string>('');

  // Directives Filtering, Search & GroupBy State
  const QUEST_VIEW_SETTINGS_KEY = 'pale_ore_quest_view_settings';

  const loadSavedDashboardQuestSettings = () => {
    try {
      const raw = localStorage.getItem(QUEST_VIEW_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          typeFilter: parsed.categoryFilter ? parsed.categoryFilter.toUpperCase() : 'ALL',
          sort: (parsed.sortBy === 'name' ? 'NAME' : parsed.sortBy === 'time' ? 'TIME' : parsed.sortBy === 'difficulty' ? 'DIFFICULTY' : 'XP') as 'XP' | 'TIME' | 'NAME' | 'DIFFICULTY',
          groupBy: (parsed.groupBy || 'none') as 'none' | 'list' | 'folder' | 'category' | 'difficulty'
        };
      }
    } catch (e) {
      console.error('Error loading dashboard quest settings:', e);
    }
    return { typeFilter: 'ALL', sort: 'XP' as const, groupBy: 'none' as const };
  };

  const initialSettings = loadSavedDashboardQuestSettings();
  const [directiveSearch, setDirectiveSearch] = useState('');
  const [directiveTypeFilter, setDirectiveTypeFilterState] = useState<string>(initialSettings.typeFilter);
  const [directiveSort, setDirectiveSortState] = useState<'XP' | 'TIME' | 'NAME' | 'DIFFICULTY'>(initialSettings.sort);
  const [directiveGroupBy, setDirectiveGroupByState] = useState<'none' | 'list' | 'folder' | 'category' | 'difficulty'>(initialSettings.groupBy);
  const [selectedAttributeName, setSelectedAttributeName] = useState<string | null>(null);
  const [confirmRestartAttr, setConfirmRestartAttr] = useState(false);

  const saveSettingsToStorage = (typeVal: string, sortVal: string, groupVal: string) => {
    try {
      const raw = localStorage.getItem(QUEST_VIEW_SETTINGS_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      const catVal = typeVal === 'ALL' ? 'All' : typeVal === 'MAIN' ? 'Main' : typeVal === 'HABIT' ? 'Habit' : typeVal === 'SIDE' ? 'Side' : typeVal === 'BOSS' ? 'Boss' : typeVal === 'RECOVERY' ? 'Recovery' : typeVal === 'PENALTY' ? 'Penalty' : typeVal === 'OPTIONAL' ? 'Optional' : 'All';
      const sortByVal = sortVal === 'XP' ? 'xp' : sortVal === 'NAME' ? 'name' : sortVal === 'TIME' ? 'deadline' : sortVal === 'DIFFICULTY' ? 'difficulty' : 'default';
      
      const next = {
        ...prev,
        categoryFilter: catVal,
        groupBy: groupVal,
        sortBy: sortByVal
      };
      localStorage.setItem(QUEST_VIEW_SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Error saving dashboard quest settings:', e);
    }
  };

  const setDirectiveTypeFilter = (val: string) => {
    setDirectiveTypeFilterState(val);
    saveSettingsToStorage(val, directiveSort, directiveGroupBy);
  };

  const setDirectiveSort = (val: 'XP' | 'TIME' | 'NAME' | 'DIFFICULTY') => {
    setDirectiveSortState(val);
    saveSettingsToStorage(directiveTypeFilter, val, directiveGroupBy);
  };

  const setDirectiveGroupBy = (val: 'none' | 'list' | 'folder' | 'category' | 'difficulty') => {
    setDirectiveGroupByState(val);
    saveSettingsToStorage(directiveTypeFilter, directiveSort, val);
  };

  const levelInfo = getPlayerLevelInfo();
  const analytics = getAnalytics();
  const attributes = getAttributes();
  const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
  const activeTitle = getActiveTitle(state.profile.equippedTitleId, state.customTitles || [], state.deletedTitleIds || []);
  
  const isRecoveryActive = state.profile.recoveryMode || state.quests.some(q => !isQuestArchived(q, state.lists, state.folders) && q.status === 'Active' && (q.type.toUpperCase() === 'PENALTY' || q.type.toUpperCase() === 'RECOVERY'));

  const baseQuests = state.quests.filter(q => {
    if (isQuestArchived(q, state.lists, state.folders)) return false;
    if (isRecoveryActive) {
      if (q.type !== 'Recovery' && q.type !== 'Optional' && q.type !== 'Penalty') return false;
    }
    return true;
  });

  const activeQuests = baseQuests.filter(q => 
    q.status === 'Active' && 
    !isQuestFinishedForToday(q) && 
    isQuestScheduledForDate(q, systemDate) &&
    (!q.deadline || q.deadline <= systemDate)
  );
  
  const frogOfTheDay = activeQuests.find(q => q.type === 'Main' || q.type === 'Boss' || q.difficulty === 'Boss' || q.difficulty === 'Hard') || 
                       (activeQuests.length > 0 ? [...activeQuests].sort((a, b) => b.xp - a.xp)[0] : null);
  // Active Goals for linkage cards
  const activeGoals = state.goals.filter(g => g.status === 'Active').slice(0, 3);

  const activeDirectiveProjects = Array.from(
    new Map(
      activeQuests
        .filter(q => q.projectId)
        .map(q => {
          const project = (state.projects || []).find((p: any) => p.id === q.projectId);
          return project ? [project.id, project] as const : null;
        })
        .filter((entry): entry is readonly [string, any] => !!entry)
    ).values()
  ).slice(0, 3) as Array<{ id: string; name: string; goalId?: string; status?: string; description?: string; estimatedTime?: string; createdAt?: string }>;

  const activeDirectiveSkillMap = new Map<string, {
    id: string;
    name: string;
    iconName?: string;
    tier: 'Primary' | 'Secondary';
    parentId?: string | null;
    level: number;
    xp: number;
    progress: number;
    xpIntoLevel: number;
    xpRequiredForNextLevel: number;
    directives: number;
    linkedSubSkills: string[];
  }>();

  activeQuests.forEach(quest => {
    const relatedSkillIds = Array.from(new Set((quest.relatedSkills || []) as string[]));
    relatedSkillIds.forEach((skillId: string) => {
      const existingSkill = (state.skills || []).find((s: any) => s.id === skillId);
      if (!existingSkill) return;

      // Identify primary skill (either self or parent)
      let primarySkill = existingSkill;
      let isSubSkill = false;
      if ((existingSkill.tier === 'Secondary' || existingSkill.parentId) && existingSkill.parentId) {
        const parent = (state.skills || []).find((s: any) => s.id === existingSkill.parentId);
        if (parent) {
          primarySkill = parent;
          isSubSkill = true;
        }
      }

      const pId = primarySkill.id;
      const existingEntry = activeDirectiveSkillMap.get(pId);
      const skillStats = getSkillXpAndLevel(pId);

      const subSkillsList = existingEntry?.linkedSubSkills ? [...existingEntry.linkedSubSkills] : [];
      if (isSubSkill && !subSkillsList.includes(existingSkill.name)) {
        subSkillsList.push(existingSkill.name);
      }

      activeDirectiveSkillMap.set(pId, {
        id: primarySkill.id,
        name: primarySkill.name,
        iconName: primarySkill.iconName || 'Sparkles',
        tier: 'Primary',
        parentId: null,
        level: skillStats.level,
        xp: skillStats.xp,
        progress: skillStats.progress,
        xpIntoLevel: skillStats.xpIntoLevel,
        xpRequiredForNextLevel: skillStats.xpRequiredForNextLevel,
        directives: (existingEntry?.directives ?? 0) + 1,
        linkedSubSkills: subSkillsList
      });
    });
  });

  const activeDirectiveSkills = Array.from(activeDirectiveSkillMap.values())
    .sort((a, b) => b.level - a.level || b.xp - a.xp);

  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileFocus(focusText, focusGoal ? focusGoal : null);
    setIsEditingFocus(false);
  };

  const handleCreateQuickQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    // Calculate XP estimate
    const baseDiffXp = quickDifficulty === 'Easy' ? 25 : quickDifficulty === 'Normal' ? 50 : quickDifficulty === 'Hard' ? 100 : 200;
    const timeXp = Math.round(quickTime * 1.5);
    const calculatedXp = baseDiffXp + timeXp;

    addQuest({
      name: quickName.trim(),
      description: quickDesc.trim() || 'Created via Progression Terminal Quick Actions.',
      difficulty: quickDifficulty,
      estimatedTime: quickTime,
      xp: calculatedXp,
      type: quickType,
      goalId: quickGoalId || null,
      projectId: quickProjectId || null,
      milestoneId: null,
      relatedSkills: [],
      status: 'Active',
      deadline: systemDate,
      subquests: []
    });

    setQuickName('');
    setQuickDesc('');
    setQuickType('Main');
    setQuickDifficulty('Normal');
    setQuickTime(30);
    setQuickGoalId('');
    setQuickProjectId('');
    setIsQuickQuestOpen(false);
  };

  // Filtered directives
  const filteredDirectives = activeQuests.filter(q => {
    const matchesSearch = q.name.toLowerCase().includes(directiveSearch.toLowerCase()) || 
                          (q.description && q.description.toLowerCase().includes(directiveSearch.toLowerCase()));
    if (!matchesSearch) return false;

    if (directiveTypeFilter === 'MAIN' && !(q.type === 'Main' || q.type === 'Boss')) return false;
    if (directiveTypeFilter === 'HABIT' && !(q.type === 'Habit' || q.recurrence === 'Daily')) return false;
    if (directiveTypeFilter === 'SIDE' && !(q.type === 'Side' || q.type === 'Optional')) return false;
    if (directiveTypeFilter === 'BOSS' && !(q.type === 'Boss' || q.difficulty === 'Boss')) return false;
    if (directiveTypeFilter === 'RECOVERY' && q.type !== 'Recovery') return false;
    if (directiveTypeFilter === 'PENALTY' && q.type !== 'Penalty') return false;
    if (directiveTypeFilter === 'OPTIONAL' && q.type !== 'Optional') return false;

    if (selectedAttributeName) {
      const attrLower = selectedAttributeName.toLowerCase();
      if (attrLower === 'strength') {
        return q.type === 'Boss' || q.difficulty === 'Hard' || q.relatedSkills.some(sId => {
          const sk = state.skills.find(s => s.id === sId);
          return sk?.name.toLowerCase().includes('fitness') || sk?.name.toLowerCase().includes('workout');
        });
      }
      if (attrLower === 'focus') {
        return q.type === 'Main' || q.type === 'Boss';
      }
      if (attrLower === 'knowledge') {
        return q.relatedSkills.some(sId => {
          const sk = state.skills.find(s => s.id === sId);
          return ['programming', 'english', 'arabic', 'french', 'chess', 'coding'].some(k => sk?.name.toLowerCase().includes(k));
        });
      }
      if (attrLower === 'discipline') {
        return q.type === 'Habit' || q.recurrence === 'Daily' || q.type === 'Side';
      }
      if (attrLower === 'agility') {
        return q.type === 'Side' || q.type === 'Optional' || q.estimatedTime <= 15;
      }
      if (attrLower === 'wisdom') {
        return q.goalId !== null || q.projectId !== null;
      }
      if (attrLower === 'social') {
        return q.relatedSkills.some(sId => {
          const sk = state.skills.find(s => s.id === sId);
          return ['writing', 'cooking', 'business', 'communication'].some(k => sk?.name.toLowerCase().includes(k));
        });
      }
      if (attrLower === 'faith') {
        return q.relatedSkills.some(sId => {
          const sk = state.skills.find(s => s.id === sId);
          return ['qur\'an', 'arabic', 'spirituality'].some(k => sk?.name.toLowerCase().includes(k));
        });
      }
    }

    return true;
  }).sort((a, b) => {
    if (directiveSort === 'XP') return b.xp - a.xp;
    if (directiveSort === 'TIME') return a.estimatedTime - b.estimatedTime;
    if (directiveSort === 'NAME') return a.name.localeCompare(b.name);
    if (directiveSort === 'DIFFICULTY') {
      const diffWeight: Record<string, number> = { 'Easy': 1, 'Normal': 2, 'Hard': 3, 'Boss': 4, 'Custom': 2 };
      return (diffWeight[b.difficulty] || 2) - (diffWeight[a.difficulty] || 2);
    }
    return 0;
  });

  return (
    <div className="space-y-6" id="dashboard-view-root">
      
      {/* HEADER BAR & QUICK ACTION STRIP */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <RubElHizbIcon className="h-5 w-5 text-[var(--accent-bright)]" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              SANCTUM COMMAND TERMINAL
            </h2>
            <span className="text-[10px] font-mono font-bold bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] px-2 py-0.5 rounded-md">
              DIVINE SYSTEM OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-mono mt-1">
            SYS_DATE: {systemDate} • STATUS:{' '}
            {isRecoveryActive ? (
              <span className="text-[var(--accent-bright)] font-bold animate-pulse drop-shadow-[0_0_10px_var(--glow-color)]">
                🛡️ RECOVERY PROTOCOL ACTIVE
              </span>
            ) : (
              <span className="text-emerald-400/90 font-medium">
                FULL HARMONIC VELOCITY
              </span>
            )}
          </p>
        </div>

        {/* QUICK COMMAND ACTION STRIP */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setIsQuickQuestOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-[var(--accent-dim)] to-[var(--accent-primary)] hover:from-[var(--accent-primary)] hover:to-[var(--accent-bright)] text-black font-mono font-bold text-xs rounded-xl shadow-[0_0_15px_var(--glow-color)] transition flex items-center gap-1.5 border border-[var(--border-accent)] cursor-pointer"
          >
            <Plus className="h-4 w-4 text-black" />
            + QUICK TRIAL
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('shop')}
              className="px-3 py-2 bg-[var(--accent-surface)] hover:bg-[var(--accent-surface-hover)] text-[var(--accent-highlight)] border border-[var(--border-accent)] rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Open Imperial Vault"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
              VAULT ({state.profile.coins ?? 150} 🪙)
            </button>
          )}

          <button
            disabled={true}
            onClick={(e) => e.preventDefault()}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              isRecoveryActive
                ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border-[var(--border-accent)] shadow-[0_0_18px_var(--glow-color)] animate-pulse cursor-not-allowed pointer-events-none'
                : 'bg-[var(--bg-void)]/60 text-zinc-600 border-white/5 opacity-40 cursor-not-allowed pointer-events-none'
            }`}
            title="Recovery Protocol status is automated by system requirements (no manual switching off)"
          >
            <Lock className={`h-3.5 w-3.5 ${isRecoveryActive ? 'text-[var(--accent-bright)]' : 'text-zinc-600'}`} />
            <span>{isRecoveryActive ? 'RECOVERY SANCTUM ACTIVE' : 'RECOVERY INACTIVE'}</span>
          </button>
        </div>
      </div>

      {/* BOSS PROGRESSION GATE BANNER */}
      <BossProgressionBanner onNavigateToQuests={() => onNavigate?.('quests')} />

      {/* TWO COLUMN MAIN TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PROFILE, ATTRIBUTES, EAT THE FROG, DIRECTIVES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE TERMINAL CARD */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden border border-[var(--border-accent)] bg-[var(--bg-card)]/90 shadow-xl" id="profile-card">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-5 w-5" />
            <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-5 w-5" />

            {/* Background glow accent */}
            <div className={`absolute right-0 top-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all ${
              isRecoveryActive ? 'bg-[var(--glow-color)] animate-pulse' : 'bg-[var(--accent-primary)]/10'
            }`} />
            
            <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
              <div>
                <span className="text-[10px] font-mono text-[var(--accent-bright)] tracking-widest uppercase font-bold flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" /> OPERATOR SACRED SIGNATURE
                </span>
                <h3 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight transition-all mt-1 ${
                  isRecoveryActive
                    ? 'text-[var(--accent-bright)] drop-shadow-[0_0_20px_var(--glow-color)] animate-pulse'
                    : 'text-white'
                }`}>
                  {isRecoveryActive ? '🛡️ RECOVERING_OPERATOR' : 'SOLE_PROGRESSOR'}
                </h3>

                {/* Job & Title Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {/* RECOVERY TITLE BADGE - GLOWS WHEN ACTIVE, DIMS WHEN INACTIVE */}
                  {isRecoveryActive ? (
                    <span className="text-[10px] font-mono font-bold bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_var(--glow-color)] animate-pulse">
                      <Shield className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                      [RECOVERY] RECOVERING OPERATOR
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-[var(--bg-void)]/60 border border-white/5 text-zinc-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 opacity-40">
                      <Shield className="h-3.5 w-3.5 text-zinc-600" />
                      [RECOVERY] RECOVERING OPERATOR (INACTIVE)
                    </span>
                  )}

                  <span className="text-[10px] font-mono font-bold bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    {renderTopicIcon(activeTitle.iconName || 'Award', 'h-3.5 w-3.5')} 
                    [{activeTitle.badge}] {activeTitle.name}
                  </span>

                  <span className="text-[10px] font-mono font-bold bg-[var(--bg-card)] border border-[var(--border-accent)] text-zinc-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    {renderTopicIcon(activeJob.iconName || 'Shield', 'h-3.5 w-3.5')}
                    DISCIPLINE: {activeJob.name}
                  </span>

                  <button
                    onClick={() => setIsJobTitleModalOpen(true)}
                    className="text-[10px] font-mono font-bold bg-[var(--bg-void)] hover:bg-[var(--accent-surface)] border border-[var(--border-accent)] hover:border-[var(--border-strong)] text-zinc-300 hover:text-[var(--accent-highlight)] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="h-3 w-3 text-[var(--accent-bright)]" /> CAREER & TITLES
                  </button>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase font-bold">SANCTUM RANK</span>
                <p className="text-lg sm:text-xl font-display font-bold text-[var(--accent-bright)] tracking-wide uppercase mt-0.5">
                  {levelInfo.rank}
                </p>
                <div className="text-[10px] font-mono text-zinc-300 mt-1">
                  PERK: <span className="text-[var(--accent-highlight)] font-bold">{activeJob.perk}</span>
                </div>
              </div>
            </div>

            {/* LEVEL & XP PROGRESSION HUD: Ergonomic 2x2 on Mobile, 5-col on Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-[var(--border-subtle)] relative z-10">
              {/* Level indicator */}
              <div className="col-span-1 bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase font-bold">SYS_LEVEL</span>
                <span className="text-xl sm:text-2xl font-display font-bold text-white mt-1">LVL {levelInfo.level}</span>
              </div>

              {/* Momentum Indicator */}
              <div className="col-span-1 bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300 uppercase font-bold">
                  <span className="text-[var(--accent-bright)]">MOMENTUM</span>
                  <Flame className={`h-3.5 w-3.5 ${state.profile.momentum > 50 ? 'text-[var(--accent-bright)] animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">
                  {state.profile.momentum}%
                </div>
                <div className="w-full bg-[var(--bg-void)] rounded-full h-1.5 overflow-hidden mt-1 border border-white/5">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      state.profile.momentum > 75 ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-highlight)]' : state.profile.momentum > 40 ? 'bg-[var(--accent-primary)]' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${state.profile.momentum}%` }}
                  />
                </div>
              </div>

              {/* XP progress */}
              <div 
                onClick={() => onNavigate?.('xp_history')}
                className="col-span-2 lg:col-span-2 bg-[var(--bg-surface)]/80 hover:bg-[var(--accent-surface)] border border-[var(--border-subtle)] hover:border-[#c5a059]/40 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between cursor-pointer transition group shadow-sm"
                title="Click to view full XP History & Audit Ledger"
              >
                <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase font-bold">
                  <span className="text-[var(--accent-bright)] flex items-center gap-1.5">
                    <span>DIVINE_XP</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 group-hover:bg-[#c5a059]/20 text-zinc-400 group-hover:text-[#fef08a] transition font-normal">
                      LEDGER ↗
                    </span>
                  </span>
                  <span className="text-[var(--accent-bright)] font-bold">{levelInfo.totalXp} XP</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-[var(--bg-void)] rounded-full h-2 overflow-hidden border border-[var(--border-subtle)]">
                    <div 
                      className="bg-gradient-to-r from-[var(--accent-dim)] to-[var(--accent-bright)] h-full transition-all duration-500 shadow-[0_0_10px_var(--glow-color)]" 
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400 font-bold">
                    <span>{levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForNextLevel} XP</span>
                    <span className="text-[var(--accent-bright)]">{levelInfo.xpUntilNextLevel} XP TO NEXT LVL</span>
                  </div>
                </div>
              </div>

              {/* Coins & Reward Shop Card */}
              <div 
                onClick={() => onNavigate?.('shop')}
                className="col-span-1 sm:col-span-1 bg-[var(--accent-surface)] hover:bg-[var(--accent-surface-hover)] border border-[var(--border-accent)] hover:border-[var(--border-strong)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between cursor-pointer transition group shadow-md"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-[var(--accent-highlight)] uppercase font-bold">
                  <span>VAULT DINARS</span>
                  <ShoppingBag className="h-3.5 w-3.5 text-[var(--accent-bright)] group-hover:scale-110 transition" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-[var(--accent-highlight)] mt-0.5">
                  {state.profile.coins ?? 150} 🪙
                </div>
                <div className="text-[9px] font-mono text-[var(--accent-bright)] font-bold mt-1 flex items-center gap-1">
                  <span>OPEN VAULT</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>

            </div>

            {/* FOCUS HUD & PERFORMANCE METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)] relative z-10">
              <div className="bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] rounded-xl p-2.5">
                <span className="text-[9px] font-mono text-[var(--accent-bright)] uppercase font-bold block">FOCUS MINUTES TODAY</span>
                <span className="text-sm font-mono font-bold text-white mt-1 flex items-center gap-1.5">
                  🧘 {state.profile.focusMinutesToday || 0}m
                </span>
              </div>
              <div className="bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] rounded-xl p-2.5">
                <span className="text-[9px] font-mono text-[var(--accent-bright)] uppercase font-bold block">FOCUS STREAK</span>
                <span className="text-sm font-mono font-bold text-[var(--accent-bright)] mt-1 flex items-center gap-1.5">
                  🔥 {state.profile.focusStreak || 0} Days
                </span>
              </div>
              <div className="col-span-2 lg:col-span-1 bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-mono text-rose-300 uppercase font-bold">SOUL VITALITY</span>
                  <span className="text-[10px] font-mono font-bold text-rose-300">
                    {muhasabahStats.currentHp}/{muhasabahStats.maxHp} HP
                  </span>
                </div>
                <div className="h-1.5 mt-2 rounded-full bg-zinc-900 border border-rose-500/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    style={{ width: `${Math.min(100, Math.max(0, (muhasabahStats.currentHp / Math.max(1, muhasabahStats.maxHp)) * 100))}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-rose-300/80 mt-1 block">
                  {muhasabahStats.todayLostHp > 0 ? `−${muhasabahStats.todayLostHp} HP today` : 'No HP loss today'}
                </span>
              </div>
            </div>

            {/* TEMPORAL CAPITAL & REST HUD */}
            <div className="mt-4" id="dashboard-temporal-capital-hud">
              <TemporalCapitalHud onNavigate={onNavigate} />
            </div>

            {/* MUHĀSABAH SELF-ACCOUNTABILITY WIDGET */}
            <div className="mt-4 p-3 bg-[var(--bg-void)] border border-[var(--border-accent)] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] shrink-0">
                  <Scale className="h-4 w-4 text-[var(--accent-bright)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1">
                      <RubElHizbIcon className="h-2.5 w-2.5 text-[var(--accent-bright)]" />
                      MUHĀSABAH AUDIT
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      muhasabahStats.todayLostXP > 0 
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' 
                        : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    }`}>
                      {muhasabahStats.todayLostXP > 0 ? `−${muhasabahStats.todayLostXP} XP Lost Today` : 'Clean Sheet Today'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-0.5">
                    <span>Net: <strong className={muhasabahStats.todayNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{muhasabahStats.todayNetXP >= 0 ? `+${muhasabahStats.todayNetXP}` : muhasabahStats.todayNetXP} XP</strong></span>
                    <span>•</span>
                    <span>Total Lost: <strong className="text-rose-400">−{muhasabahStats.todayLostXP} XP</strong></span>
                    {muhasabahStats.activeWeaknessesCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{muhasabahStats.activeWeaknessesCount} Active Weakness</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMuhasabahModalOpen(true)}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-[#c5a059] text-black font-display text-[11px] font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 shadow"
                  id="dashboard-record-slip-btn"
                >
                  <Scale className="h-3 w-3" />
                  RECORD SLIP
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('muhasabah' as any)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#07080c] hover:bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 transition flex items-center gap-1"
                    title="Open Full Muhāsabah Chamber"
                  >
                    <span>CHAMBER</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {state.profile.momentum < 40 && (
              <div className="mt-4 p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-[10px] font-mono text-rose-300 animate-pulse">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                <span>WARNING: LOW MOMENTUM DEBUFF ACTIVE — COMPLETE OPERATIONAL DIRECTIVES TO RESTORE FULL REWARD VELOCITY.</span>
              </div>
            )}
          </div>

          {/* ATTRIBUTES MATRIX PREVIEW CARD */}
          <div className="glass-panel rounded-2xl p-5 border border-[var(--border-accent)] bg-[var(--bg-card)]/90 relative overflow-hidden space-y-4 shadow-xl" id="dashboard-attributes-matrix">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  CORE ATTRIBUTE CAPABILITIES MATRIX
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedAttributeName && (
                  <button
                    onClick={() => setSelectedAttributeName(null)}
                    className="text-[10px] font-mono text-[var(--accent-highlight)] hover:text-white bg-[var(--accent-surface)] border border-[var(--border-accent)] px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    RESET FILTER
                  </button>
                )}
                {onNavigate && (
                  <button 
                    onClick={() => onNavigate('analytics')}
                    className="text-[10px] font-mono text-[var(--accent-bright)] hover:text-[var(--accent-highlight)] flex items-center gap-1 transition cursor-pointer font-bold"
                  >
                    FULL MATRIX <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 font-mono">
              Click an attribute to inspect its divine mathematical formula, linked disciplines, and filter active decrees.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {attributes.slice(0, 6).map(attr => {
                const totalVal = attr.total ?? attr.level;
                const baseVal = attr.baseLevel ?? 10;
                const bonusVal = attr.earnedBonus ?? (totalVal - baseVal);
                const isSelected = selectedAttributeName === attr.name;
                const ptsInto = attr.pointsIntoLevel ?? 0;
                const ptsNeeded = attr.pointsRequiredForNextLevel ?? 14;
                const pct = attr.progress ?? 0;

                return (
                  <div 
                    key={attr.name} 
                    onClick={() => {
                      setSelectedAttributeName(isSelected ? null : attr.name);
                      setConfirmRestartAttr(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[var(--accent-surface)] border-[var(--accent-bright)] shadow-[0_0_15px_var(--glow-color)] ring-1 ring-[var(--border-accent)]'
                        : 'bg-[var(--bg-void)]/80 border-[var(--border-subtle)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="text-sm">{attr.icon}</span>
                        {attr.name}
                      </span>
                      <span className="text-sm font-mono font-extrabold text-[var(--accent-highlight)]">
                        LVL {totalVal}
                      </span>
                    </div>

                    <div className="w-full bg-[var(--bg-void)] rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-[var(--border-strong)] to-[var(--accent-bright)] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_var(--glow-color)]" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
                      <span>BASE {baseVal}</span>
                      <span className="text-zinc-300">{ptsInto}/{ptsNeeded} PTS</span>
                      <span className="text-[var(--accent-highlight)] font-bold">+{bonusVal}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ATTRIBUTE INSPECTOR & LINKED DIRECTIVES PANEL */}
            {selectedAttributeName && (() => {
              const selectedAttr = attributes.find(a => a.name === selectedAttributeName);
              if (!selectedAttr) return null;

              const totalVal = selectedAttr.total ?? selectedAttr.level;
              const baseVal = selectedAttr.baseLevel ?? 10;
              const bonusVal = selectedAttr.earnedBonus ?? 0;
              const ptsInto = selectedAttr.pointsIntoLevel ?? 0;
              const ptsNeeded = selectedAttr.pointsRequiredForNextLevel ?? 14;
              const pct = selectedAttr.progress ?? 0;

              // Find matching skills
              const relatedSkills = state.skills.filter(s => {
                const nameL = selectedAttributeName.toLowerCase();
                if (nameL === 'strength') return s.name.toLowerCase().includes('fitness');
                if (nameL === 'knowledge') return ['programming', 'english', 'arabic', 'french', 'chess', 'coding'].some(k => s.name.toLowerCase().includes(k));
                if (nameL === 'social') return ['writing', 'cooking', 'business'].some(k => s.name.toLowerCase().includes(k));
                if (nameL === 'faith') return ['qur\'an', 'arabic', 'spirituality'].some(k => s.name.toLowerCase().includes(k));
                return true;
              });

              return (
                <div className="mt-3 p-4 bg-[var(--bg-void)]/90 border border-[var(--border-accent)] rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedAttr.icon}</span>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1">
                          <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" />
                          {selectedAttr.name} Attribute Intelligence
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-400">
                          {selectedAttr.description}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedAttributeName(null);
                        setConfirmRestartAttr(false);
                      }}
                      className="text-zinc-500 hover:text-white text-xs font-mono cursor-pointer"
                    >
                      ✕ CLOSE
                    </button>
                  </div>

                  {/* FORMULA BREAKDOWN GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
                      <span className="text-[9px] text-zinc-400 uppercase block">BASE</span>
                      <span className="text-sm font-bold text-[var(--accent-bright)]">{baseVal}</span>
                    </div>
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
                      <span className="text-[9px] text-zinc-400 uppercase block">EARNED</span>
                      <span className="text-sm font-bold text-emerald-400">+{bonusVal}</span>
                    </div>
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
                      <span className="text-[9px] text-zinc-400 uppercase block">NEXT LEVEL</span>
                      <span className="text-xs font-bold text-[#fef08a]">{ptsInto} / {ptsNeeded} PTS ({pct}%)</span>
                    </div>
                    <div className="p-2 bg-[var(--accent-surface)] border border-[var(--border-accent)] rounded-lg">
                      <span className="text-[9px] text-[var(--accent-highlight)] font-bold uppercase block">TOTAL LEVEL</span>
                      <span className="text-sm font-extrabold text-white">LVL {totalVal}</span>
                    </div>
                  </div>

                  {/* DYNAMIC SCALING NOTICE */}
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="text-zinc-400">
                      <span className="text-[#fef08a] font-bold">DYNAMIC SCALING: </span>
                      Leveling requirements increase with every level up. Advancing to LVL {totalVal + 1} requires {ptsNeeded} pts from completed deeds.
                    </div>
                    
                    {confirmRestartAttr ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-rose-400 text-[9px]">RESET TO LVL 1?</span>
                        <button
                          type="button"
                          onClick={() => setConfirmRestartAttr(false)}
                          className="px-2 py-0.5 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
                        >
                          CANCEL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            restartAttribute(selectedAttr.id);
                            setConfirmRestartAttr(false);
                          }}
                          className="px-2 py-0.5 text-[9px] bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded cursor-pointer font-bold"
                        >
                          CONFIRM
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRestartAttr(true)}
                        className="px-2.5 py-1 text-[9px] bg-rose-950/30 hover:bg-rose-950 border border-rose-500/30 text-rose-300 rounded-lg transition cursor-pointer font-mono shrink-0"
                        title="Restart this attribute back to Level 1"
                      >
                        RESTART ATTRIBUTE
                      </button>
                    )}
                  </div>

                  {/* LINKED SKILLS & DIRECTIVES QUICK ACTION */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                      <span className="text-[var(--accent-bright)] font-bold uppercase">LINKED SKILLS:</span>
                      {relatedSkills.length > 0 ? (
                        relatedSkills.map(sk => (
                          <span key={sk.id} className="bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] px-2 py-0.5 rounded-md">
                            {sk.name} (LVL {sk.level})
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 italic">Resonates across all operational decrees</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('system')}
                          className="text-[10px] font-mono text-zinc-400 hover:text-[var(--accent-highlight)] underline"
                        >
                          Calibrate Baseline in System →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Strategy 1: Eat the Frog Priority Target */}
          {frogOfTheDay && (
            <div className="glass-panel rounded-2xl p-5 border border-[var(--border-accent)] bg-[var(--accent-surface)] relative overflow-hidden shadow-[0_0_20px_var(--glow-color)]" id="frog-of-the-day-card">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-[var(--accent-bright)]/60 uppercase font-bold tracking-widest">
                CRITICAL_SANCTUM_NODE
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-bright)] animate-ping" />
                    <span className="text-[10px] font-mono text-[var(--accent-highlight)] font-bold uppercase tracking-wider flex items-center gap-1">
                      <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" />
                      COGNITIVE PRIORITY // PRIMORDIAL DECREE
                    </span>
                  </div>
                  <h4 className="text-base font-sans font-extrabold text-white">
                    {frogOfTheDay.name}
                  </h4>
                  <p className="text-xs text-zinc-300 line-clamp-1">
                    {frogOfTheDay.description || 'No operational decree parameters logged.'}
                  </p>
                  <p className="text-[9px] text-[var(--accent-bright)]/80 font-mono italic">
                    "Conquer the heaviest burden at dawn, and all subsequent trials shall yield before you."
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => completeQuest(frogOfTheDay.id)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-[var(--border-strong)] to-[var(--accent-bright)] hover:brightness-110 text-[var(--bg-void)] font-mono font-bold text-xs rounded-xl transition shadow-[0_0_15px_var(--glow-color)] uppercase flex items-center justify-center gap-1.5 border border-[var(--border-accent)] cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> COMPLETE_DECREE (+{frogOfTheDay.xp} XP)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE OPERATIONAL DIRECTIVES TERMINAL BOARD */}
          <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[var(--border-accent)] bg-[var(--bg-card)]/90 relative overflow-hidden shadow-xl" id="dashboard-active-directives">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>OPERATIONAL DECREES BOARD ({filteredDirectives.length})</span>
                  <span className="inline-block w-2 h-3.5 bg-[var(--accent-bright)] animate-pulse shadow-[0_0_8px_var(--glow-color)] rounded-[1px] ml-0.5" title="Terminal Live Cursor" />
                </h3>
                {selectedAttributeName && (
                  <span className="text-[10px] font-mono bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                    <span>⚡ RESONANCE: {selectedAttributeName.toUpperCase()}</span>
                    <button 
                      onClick={() => setSelectedAttributeName(null)}
                      className="hover:text-white ml-1 font-extrabold cursor-pointer"
                      title="Clear attribute filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {/* DIRECTIVES SEARCH & FILTER CONTROL BAR */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="h-3.5 w-3.5 text-[#c5a059] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search decrees..."
                    value={directiveSearch}
                    onChange={(e) => setDirectiveSearch(e.target.value)}
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                  {directiveSearch && (
                    <button onClick={() => setDirectiveSearch('')} className="absolute right-2 top-2 text-zinc-500 hover:text-white text-xs cursor-pointer">✕</button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={directiveTypeFilter}
                  onChange={(e) => setDirectiveTypeFilter(e.target.value)}
                  className="bg-[#07080c] border border-[#c5a059]/30 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#c5a059] cursor-pointer font-bold"
                >
                  <option value="ALL">Category: All</option>
                  <option value="MAIN">Primordial Quests</option>
                  <option value="SIDE">Sacred Trials</option>
                  <option value="BOSS">Titan Confrontations</option>
                  <option value="HABIT">Daily Rites</option>
                  <option value="RECOVERY">Sanctuary</option>
                  <option value="PENALTY">Atonement</option>
                  <option value="OPTIONAL">Elective</option>
                </select>

                {/* Group By Dropdown */}
                <select
                  value={directiveGroupBy}
                  onChange={(e) => setDirectiveGroupBy(e.target.value as any)}
                  className="bg-[#07080c] border border-[#c5a059]/30 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#fef08a] focus:outline-none focus:border-[#c5a059] cursor-pointer font-bold"
                >
                  <option value="none">Group: Flat List</option>
                  <option value="list">Group: By Scroll</option>
                  <option value="folder">Group: By Codex</option>
                  <option value="category">Group: By Category</option>
                  <option value="difficulty">Group: By Difficulty</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={directiveSort}
                  onChange={(e) => setDirectiveSort(e.target.value as any)}
                  className="bg-[#07080c] border border-[#c5a059]/30 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#c5a059] cursor-pointer font-bold"
                >
                  <option value="XP">Sort: Highest XP</option>
                  <option value="DIFFICULTY">Sort: Difficulty</option>
                  <option value="TIME">Sort: Shortest Time</option>
                  <option value="NAME">Sort: Alphabetical</option>
                </select>
              </div>
            </div>

            {filteredDirectives.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-[#07080c]/60 border border-[#c5a059]/15 rounded-xl">
                <p className="text-sm text-zinc-300 font-sans">
                  {directiveSearch ? 'No decrees matching search criteria.' : 'No active decrees registered for today.'}
                </p>
                <p className="text-xs text-[#c5a059]/80 font-mono">
                  Sanctum harmony optimal. Inscribe a new trial to build momentum.
                </p>
                <button 
                  onClick={() => setIsQuickQuestOpen(true)}
                  className="mt-3 bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059]/50 text-[#fef08a] text-xs font-mono px-4 py-2 rounded-xl transition font-bold cursor-pointer"
                >
                  + INSCRIBE QUICK TRIAL
                </button>
              </div>
            ) : (() => {
              const renderDashboardQuestCard = (quest: any) => {
                const completedSubquests = (quest.subquests || []).filter((sq: any) => sq.completed).length;
                const totalSubquests = (quest.subquests || []).length;

                return (
                  <div 
                    key={quest.id}
                    className="p-3.5 bg-[#07080c]/90 border border-[#c5a059]/20 rounded-xl flex items-center justify-between gap-3 hover:border-[#c5a059] hover:bg-[#141824] transition group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button 
                        onClick={() => completeQuest(quest.id)}
                        className="text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 p-1 cursor-pointer"
                        title="Mark Complete"
                      >
                        <Square className="h-5 w-5" />
                      </button>

                      <div className="min-w-0 space-y-1">
                        <span className="text-xs font-sans font-semibold text-white block truncate group-hover:text-[#e5c875] transition">
                          {quest.name}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono bg-[#0b0d13] text-[#c5a059] border border-[#c5a059]/30 px-1.5 py-0.5 rounded uppercase font-bold">
                            {quest.type}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                            quest.difficulty === 'Easy' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' :
                            quest.difficulty === 'Normal' ? 'bg-[#3a2e12]/60 text-[#fef08a] border border-[#c5a059]/40' :
                            quest.difficulty === 'Hard' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40' :
                            'bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse'
                          }`}>
                            {quest.difficulty}
                          </span>
                          {quest.estimatedTime && (
                            <span className="text-[9px] font-mono text-zinc-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 text-[#c5a059]" /> {quest.estimatedTime}m
                            </span>
                          )}
                          {totalSubquests > 0 && (
                            <span className="text-[9px] font-mono text-[#e5c875] bg-[#3a2e12]/40 px-1.5 py-0.5 rounded border border-[#c5a059]/30">
                              {completedSubquests}/{totalSubquests} RITES
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {(() => {
                        const isPenalty = quest.type === 'Penalty' || quest.xp < 0;
                        const penaltyVal = isPenalty 
                          ? (quest.xp < 0 ? quest.xp : -(quest.difficulty === 'Boss' ? 250 : quest.difficulty === 'Hard' ? 100 : quest.difficulty === 'Easy' ? 25 : 50))
                          : quest.xp;
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg shadow-sm border ${
                              isPenalty 
                                ? 'text-rose-300 bg-rose-950/70 border-rose-500/50' 
                                : 'text-[#fef08a] bg-[#3a2e12]/60 border-[#c5a059]/40'
                            }`}>
                              {isPenalty ? `${penaltyVal} XP` : `+${quest.xp} XP`}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              };

              if (directiveGroupBy === 'none') {
                return (
                  <div className="space-y-2.5">
                    {filteredDirectives.map(renderDashboardQuestCard)}
                  </div>
                );
              }

              // Group sections calculation
              let groupSections: Array<{
                key: string;
                title: string;
                icon: string;
                headerClass: string;
                badgeClass: string;
                quests: any[];
              }> = [];

              if (directiveGroupBy === 'list') {
                const lists = (state.lists || []).filter(l => !l.archived);
                lists.forEach(l => {
                  const lQuests = filteredDirectives.filter(q => q.listId === l.id);
                  if (lQuests.length > 0) {
                    groupSections.push({
                      key: `list-${l.id}`,
                      title: `SCROLL: ${l.name}`,
                      icon: '📜',
                      headerClass: 'bg-[#3a2e12]/60 border-[#c5a059]/40 text-[#fef08a]',
                      badgeClass: 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/50',
                      quests: lQuests,
                    });
                  }
                });
                const unassignedQuests = filteredDirectives.filter(q => !q.listId || !lists.some(l => l.id === q.listId));
                if (unassignedQuests.length > 0) {
                  groupSections.push({
                    key: 'list-unassigned',
                    title: 'UNBOUND / STANDALONE DECREES',
                    icon: '📌',
                    headerClass: 'bg-[#07080c] border-[#c5a059]/30 text-zinc-300',
                    badgeClass: 'bg-[#0b0d13] text-zinc-300 border-[#c5a059]/20',
                    quests: unassignedQuests,
                  });
                }
              } else if (directiveGroupBy === 'folder') {
                const folders = (state.folders || []).filter(f => !f.archived);
                const lists = (state.lists || []).filter(l => !l.archived);
                folders.forEach(f => {
                  const folderListIds = lists.filter(l => l.folderId === f.id).map(l => l.id);
                  const fQuests = filteredDirectives.filter(q => q.listId && folderListIds.includes(q.listId));
                  if (fQuests.length > 0) {
                    groupSections.push({
                      key: `folder-${f.id}`,
                      title: `CODEX: ${f.name}`,
                      icon: '📖',
                      headerClass: 'bg-[#3a2e12]/60 border-[#c5a059]/40 text-[#fef08a]',
                      badgeClass: 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/50',
                      quests: fQuests,
                    });
                  }
                });
                const unassignedFolderQuests = filteredDirectives.filter(q => {
                  if (!q.listId) return true;
                  const questList = lists.find(l => l.id === q.listId);
                  return !questList || !questList.folderId || !folders.some(f => f.id === questList.folderId);
                });
                if (unassignedFolderQuests.length > 0) {
                  groupSections.push({
                    key: 'folder-unassigned',
                    title: 'UNBOUND / ROOT DECREES',
                    icon: '📌',
                    headerClass: 'bg-[#07080c] border-[#c5a059]/30 text-zinc-300',
                    badgeClass: 'bg-[#0b0d13] text-zinc-300 border-[#c5a059]/20',
                    quests: unassignedFolderQuests,
                  });
                }
              } else if (directiveGroupBy === 'category') {
                const categoryOrder = ['Main', 'Side', 'Boss', 'Habit', 'Recovery', 'Penalty', 'Optional', 'General'];
                const groups: Record<string, any[]> = {};
                filteredDirectives.forEach(q => {
                  const catKey = q.type || 'Main';
                  const norm = 
                    catKey.toLowerCase() === 'main' ? 'Main' :
                    catKey.toLowerCase() === 'side' ? 'Side' :
                    catKey.toLowerCase() === 'boss' ? 'Boss' :
                    catKey.toLowerCase() === 'habit' ? 'Habit' :
                    catKey.toLowerCase() === 'recovery' ? 'Recovery' :
                    catKey.toLowerCase() === 'penalty' ? 'Penalty' :
                    catKey.toLowerCase() === 'optional' ? 'Optional' : 'General';
                  if (!groups[norm]) groups[norm] = [];
                  groups[norm].push(q);
                });

                categoryOrder.forEach(catKey => {
                  const catQuests = groups[catKey];
                  if (catQuests && catQuests.length > 0) {
                    groupSections.push({
                      key: `cat-${catKey}`,
                      title: `${catKey.toUpperCase()} DECREES`,
                      icon: catKey === 'Main' ? '🏆' : catKey === 'Boss' ? '🔥' : catKey === 'Habit' ? '⚡' : catKey === 'Recovery' ? '🛡️' : '🎯',
                      headerClass: 'bg-[#3a2e12]/60 border-[#c5a059]/40 text-[#fef08a]',
                      badgeClass: 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/50',
                      quests: catQuests,
                    });
                  }
                });
              } else if (directiveGroupBy === 'difficulty') {
                const difficulties: QuestDifficulty[] = ['Easy', 'Normal', 'Hard', 'Boss', 'Custom'];
                difficulties.forEach(diff => {
                  const dQuests = filteredDirectives.filter(q => q.difficulty === diff);
                  if (dQuests.length > 0) {
                    groupSections.push({
                      key: `diff-${diff}`,
                      title: `DIFFICULTY: ${diff.toUpperCase()}`,
                      icon: diff === 'Boss' ? '🔥' : diff === 'Hard' ? '⚔️' : diff === 'Easy' ? '🌱' : '⚡',
                      headerClass: diff === 'Boss' ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' : 'bg-[#3a2e12]/60 border-[#c5a059]/40 text-[#fef08a]',
                      badgeClass: diff === 'Boss' ? 'bg-rose-950 text-rose-300 border-rose-500/50' : 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/50',
                      quests: dQuests,
                    });
                  }
                });
              }

              return (
                <div className="space-y-4">
                  {groupSections.map(sec => (
                    <div key={sec.key} className="space-y-2">
                      <div className={`px-3 py-1.5 rounded-lg border flex items-center justify-between text-xs font-mono font-bold ${sec.headerClass}`}>
                        <div className="flex items-center gap-2">
                          <span>{sec.icon}</span>
                          <span className="uppercase tracking-wider">{sec.title}</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded border font-mono ${sec.badgeClass}`}>
                          {sec.quests.length} {sec.quests.length === 1 ? 'DECREE' : 'DECREES'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {sec.quests.map(renderDashboardQuestCard)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Active Directives Groupings */}
          {/* Note: Backlog Sanctuary removed per request */}

        </div>

        {/* RIGHT COLUMN: CURRENT FOCUS, GOALS & PROJECTS PREVIEW, DAILY HABITS, WORKLOAD REPORT */}
        <div className="space-y-6">

          {/* STRATEGIC COMMAND & CODEX PORTAL */}
          <div className="glass-panel rounded-2xl p-4 border border-[var(--border-accent)] bg-[var(--bg-card)]/90 relative overflow-hidden shadow-lg space-y-4" id="dashboard-strategic-codex-portal">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] shrink-0 shadow-[0_0_12px_var(--glow-color)]">
                <Compass className="h-5 w-5 text-[var(--accent-bright)]" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">STRATEGIC MATRIX & CODEX LAB</h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] font-black">11 ENGINES ACTIVE</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans">Grand Destinies, campaigns, Codex doctrine, and tactical decision frameworks.</p>
              </div>
            </div>
            {onNavigate && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onNavigate('goals')} className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-void)] hover:bg-[var(--bg-surface)] border border-white/10 text-[10px] font-mono text-zinc-200">DESTINIES</button>
                <button onClick={() => onNavigate('projects')} className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-void)] hover:bg-[var(--bg-surface)] border border-white/10 text-[10px] font-mono text-zinc-200">CAMPAIGNS</button>
                <button onClick={() => onNavigate('frameworks')} className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-void)] hover:bg-[var(--bg-surface)] border border-white/10 text-[10px] font-mono text-zinc-200">ENGINES</button>
                <button onClick={() => onNavigate('strategy_codex')} className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[var(--border-strong)] via-[var(--accent-bright)] to-[var(--border-strong)] text-[var(--bg-void)] text-[10px] font-mono font-bold">MATRIX HUB <ArrowUpRight className="h-3 w-3 inline" /></button>
              </div>
            )}
          </div>

          {/* CURRENT FOCUS CARD */}
          <div className="glass-panel rounded-2xl p-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl" id="current-focus-card">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex justify-between items-center mb-3 border-b border-[#c5a059]/20 pb-2">
              <span className="text-xs font-mono font-bold text-[#c5a059] tracking-wider uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" /> CURRENT OPERATOR FOCUS
              </span>
              {!isEditingFocus && (
                <button 
                  onClick={() => setIsEditingFocus(true)}
                  className="text-[10px] font-mono text-[#e5c875] hover:text-white underline transition-colors cursor-pointer"
                >
                  MODIFY
                </button>
              )}
            </div>

            {isEditingFocus ? (
              <form onSubmit={handleSaveFocus} className="space-y-3">
                <input 
                  type="text" 
                  value={focusText}
                  onChange={(e) => setFocusText(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                  required
                />
                
                <select 
                  value={focusGoal}
                  onChange={(e) => setFocusGoal(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#c5a059] font-mono cursor-pointer"
                >
                  <option value="">No Associated Grand Destiny</option>
                  {state.goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>

                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingFocus(false)}
                    className="text-[10px] font-mono text-zinc-400 px-2 py-1 cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 text-[10px] font-mono px-3 py-1 rounded-lg hover:bg-[#4d3d18] font-bold cursor-pointer"
                  >
                    SAVE FOCUS
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-sans font-medium text-white leading-relaxed">
                  "{state.profile.currentFocus || 'Inscribe your primary focus core decree.'}"
                </p>
                {state.profile.focusGoalId && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-[#c5a059]">🎯 LINKED TO:</span>
                    <button 
                      type="button"
                      onClick={() => onNavigate?.('goals')}
                      className="text-[10px] font-mono text-[#e5c875] truncate font-bold hover:underline cursor-pointer"
                    >
                      {state.goals.find(g => g.id === state.profile.focusGoalId)?.name}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVE STRATEGIC GOALS PREVIEW */}
          <div className="glass-panel rounded-2xl p-5 space-y-3 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl" id="active-goals-preview">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex justify-between items-center border-b border-[#c5a059]/20 pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  GRAND DESTINIES ({activeGoals.length})
                </h3>
              </div>
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('goals')}
                  className="text-[10px] font-mono text-[#c5a059] hover:text-[#e5c875] flex items-center gap-0.5 transition cursor-pointer font-bold"
                >
                  ALL <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {activeGoals.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 py-2 text-center">No active grand destinies established.</p>
            ) : (
              <div className="space-y-2">
                {activeGoals.map(goal => {
                  const progressVal = getGoalProgress(goal.id);
                  const progressPercent = typeof progressVal === 'number' ? progressVal : 0;
                  const goalQuestsCount = state.quests.filter(q => q.goalId === goal.id).length;
                  const goalProjectsCount = (state.projects || []).filter(p => p.goalId === goal.id).length;
                  return (
                    <div 
                      key={goal.id} 
                      onClick={() => onNavigate?.('goals')}
                      className="p-3 bg-[#07080c]/90 border border-[#c5a059]/20 rounded-xl space-y-1.5 cursor-pointer hover:border-[#c5a059] hover:bg-[#141824] transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans font-bold text-white truncate group-hover:text-[#e5c875] transition">
                          {goal.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#e5c875] shrink-0">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                        <span className="text-[#c5a059]">{(goal as any).category || goal.horizon || 'Strategic'}</span>
                        <span>{goalQuestsCount} Decrees • {goalProjectsCount} Operations</span>
                      </div>
                      <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] h-full rounded-full transition-all duration-300" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="glass-panel rounded-2xl p-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl" id="active-directive-projects-preview">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#c5a059]/20">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#c5a059]">
                  <FolderKanban className="h-3 w-3" /> Projects
                </div>
                <span className="text-[9px] font-mono text-zinc-400">{activeDirectiveProjects.length} live</span>
              </div>
              {activeDirectiveProjects.length === 0 ? (
                <p className="text-[10px] font-mono text-zinc-500">No active project links in today’s directives.</p>
              ) : (
                <div className="space-y-2">
                  {activeDirectiveProjects.map(project => {
                    const projectProgress = getProjectProgress(project.id);
                    const projectQuestCount = activeQuests.filter(q => q.projectId === project.id).length;

                    return (
                      <div key={project.id} className="rounded-lg border border-[#c5a059]/15 bg-[#07080c] p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-sans font-semibold text-white truncate">{project.name}</span>
                          <span className="text-[9px] font-mono text-[#e5c875]">{projectProgress}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#10131a] border border-white/5">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#8a6d2b] to-[#c5a059]" style={{ width: `${projectProgress}%` }} />
                        </div>
                        <div className="mt-1 text-[9px] font-mono text-zinc-400">{projectQuestCount} directive{projectQuestCount === 1 ? '' : 's'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl" id="active-directive-skills-preview">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#c5a059]/20">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#c5a059]">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>PRIMARY SKILLS // DIRECTIVES IMPACT</span>
                </div>
                <span className="text-[9px] font-mono text-[#fef08a] bg-[#3a2e12]/60 px-2 py-0.5 rounded border border-[#c5a059]/30 font-bold">
                  {activeDirectiveSkills.length} PRIMARY TRACK{activeDirectiveSkills.length === 1 ? '' : 'S'}
                </span>
              </div>
              {activeDirectiveSkills.length === 0 ? (
                <p className="text-[10px] font-mono text-zinc-500 py-2">No primary skill links in today’s active directives.</p>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {activeDirectiveSkills.map(skill => (
                    <div key={skill.id} className="rounded-xl border border-[#c5a059]/20 bg-[#07080c] p-2.5 hover:border-[#c5a059]/40 transition">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {renderTopicIcon(skill.iconName || 'Sparkles', 'h-3.5 w-3.5 text-[#c5a059]')}
                          <span className="text-[11px] font-sans font-semibold text-white truncate">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-[#c5a059]/40 bg-[#3a2e12]/60 text-[#fef08a] font-bold">
                            PRIMARY
                          </span>
                          <span className="text-[9px] font-mono text-[#fef08a] font-bold">LVL {skill.level}</span>
                        </div>
                      </div>

                      {skill.linkedSubSkills && skill.linkedSubSkills.length > 0 && (
                        <div className="mt-1 text-[8px] font-mono text-purple-300/90 flex items-center gap-1 flex-wrap">
                          <span className="text-zinc-500">Sub-tracks:</span>
                          {skill.linkedSubSkills.map(st => (
                            <span key={st} className="px-1 py-0.2 bg-purple-950/60 border border-purple-500/30 rounded text-[7.5px] text-purple-200">
                              {st}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                        <span className="text-amber-300/90">XP {skill.xp}</span>
                        <span className="text-[#fef08a] font-bold">{skill.progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#10131a] border border-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#8a6d2b] to-[#c5a059]" style={{ width: `${skill.progress}%` }} />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[8.5px] font-mono text-zinc-400">
                        <span className="text-emerald-400 font-bold">{skill.directives} active directive{skill.directives === 1 ? '' : 's'}</span>
                        <span className="text-zinc-500">{skill.xpRequiredForNextLevel - skill.xpIntoLevel} XP to next level</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QUICK-TAP DAILY HABITS / RITES LOBBY */}
          <div className="glass-panel rounded-2xl p-5 space-y-3 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl" id="habit-lobby-panel">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex justify-between items-center border-b border-[#c5a059]/20 pb-2">
              <div className="flex items-center gap-1.5">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                <span className="text-xs font-mono font-bold text-[#c5a059] uppercase tracking-wider">⚡ DAILY RITES LOBBY</span>
              </div>
              <span className="text-[9px] font-mono text-[#e5c875] bg-[#3a2e12]/60 border border-[#c5a059]/30 px-2 py-0.5 rounded-full font-bold">1-TAP RITE</span>
            </div>
            
            {state.quests.filter(q => !isQuestArchived(q, state.lists, state.folders) && (q.type?.toLowerCase() === 'habit' || q.recurrence === 'Daily') && isQuestScheduledForDate(q, systemDate)).length === 0 ? (
              <div className="text-center py-4 space-y-1">
                <p className="text-xs text-zinc-400 font-mono">
                  No active daily rites registered for today.
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('quests')}
                    className="text-[10px] font-mono text-[#c5a059] hover:underline"
                  >
                    + Register Daily Habit in Directives →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {state.quests.filter(q => !isQuestArchived(q, state.lists, state.folders) && (q.type?.toLowerCase() === 'habit' || q.recurrence === 'Daily') && isQuestScheduledForDate(q, systemDate)).map(habit => {
                  const isFinished = isQuestFinishedForToday(habit);
                  const streakDays = habit.streakCount || (habit as any).streakDays || 0;

                  return (
                    <div 
                      key={habit.id}
                      onClick={() => {
                        if (!isFinished) {
                          completeQuest(habit.id);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isFinished 
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-zinc-500' 
                          : 'bg-[#07080c] border-[#c5a059]/20 hover:border-[#c5a059] hover:bg-[#141824] text-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                          isFinished 
                            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' 
                            : 'bg-[#0b0d13] border-[#c5a059]/30 text-[#c5a059] group-hover:border-[#c5a059] group-hover:text-[#fef08a]'
                        }`}>
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-sans font-medium truncate block ${isFinished ? 'line-through text-zinc-500' : 'group-hover:text-[#fef08a] transition-colors'}`}>
                            {habit.name}
                          </span>
                          {streakDays > 0 && (
                            <span className="text-[9px] font-mono text-[#c5a059] flex items-center gap-1">
                              <Flame className="h-2.5 w-2.5 text-[#e5c875]" /> {streakDays} Day Streak
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold shrink-0 px-2 py-0.5 rounded ${
                        isFinished ? 'text-emerald-400 bg-emerald-950/50' : 'text-[#fef08a] bg-[#3a2e12]/80 border border-[#c5a059]/40'
                      }`}>
                        {isFinished ? '✓ RITE COMPLETED' : `+${habit.xp} XP`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RESOURCE WORKLOAD REPORT */}
          <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl" id="workload-panel">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <h4 className="text-xs font-mono font-bold text-[#c5a059] uppercase tracking-wider border-b border-[#c5a059]/20 pb-2 flex items-center gap-1.5">
              <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" /> RESOURCE & WORKLOAD REPORT
            </h4>

            <div className="space-y-3">
              {/* Today's Goal Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300">CYCLE HARMONY RATE</span>
                  <span className="text-[#e5c875] font-bold">{analytics.overallCompletionRate}%</span>
                </div>
                <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] h-full rounded-full" 
                    style={{ width: `${analytics.overallCompletionRate}%` }}
                  />
                </div>
              </div>

              {/* Today's Skill XP */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-[#c5a059]/10">
                <span className="text-zinc-400">TODAY EARNED XP</span>
                <span className="text-emerald-400 font-bold">+{analytics.todayXp} XP</span>
              </div>

              {/* Total active count */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-[#c5a059]/10">
                <span className="text-zinc-400">ACTIVE DECREES</span>
                <span className="text-white font-bold">{activeQuests.length}</span>
              </div>

              {/* Est XP Pending */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-[#c5a059]/10">
                <span className="text-zinc-400">ESTIMATED PENDING XP</span>
                <span className="text-[#fef08a] font-bold">
                  {activeQuests.reduce((sum, q) => sum + q.xp, 0)} XP
                </span>
              </div>

              {/* Estimated Time */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-[#c5a059]/10">
                <span className="text-zinc-400">ESTIMATED TIME BUDGET</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#c5a059]" />
                  {Math.round(analytics.totalActiveTime / 60 * 10) / 10} Hours
                </span>
              </div>

              {/* Workload Status Gauge */}
              <div className="p-3 bg-[#07080c] rounded-xl border border-[#c5a059]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">SYSTEM WORKLOAD STATE</span>
                  <span className={`text-xs font-display font-bold uppercase mt-0.5 block ${
                    analytics.workloadStatus === 'Heavy Workload' ? 'text-rose-400' :
                    analytics.workloadStatus === 'Moderate Workload' ? 'text-amber-400' :
                    analytics.workloadStatus === 'No Workload' ? 'text-zinc-500' : 'text-emerald-400'
                  }`}>
                    {analytics.workloadStatus}
                  </span>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  analytics.workloadStatus === 'Heavy Workload' ? 'bg-rose-500 animate-ping' :
                  analytics.workloadStatus === 'Moderate Workload' ? 'bg-amber-500' :
                  analytics.workloadStatus === 'No Workload' ? 'bg-zinc-700' : 'bg-emerald-500'
                }`} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* QUICK QUEST MODAL */}
      <AnimatePresence>
        {isQuickQuestOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden"
            >
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                <h3 className="font-bold text-[#e5c875] text-base font-display flex items-center gap-2">
                  <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                  INSCRIBE QUICK OPERATIONAL DECREE
                </h3>
                <button
                  onClick={() => setIsQuickQuestOpen(false)}
                  className="text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateQuickQuest} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1">Decree Inscription</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete 20min Focused Study Rite"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1">Exegesis / Details (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Key operational rites..."
                    value={quickDesc}
                    onChange={(e) => setQuickDesc(e.target.value)}
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1">Decree Category</label>
                    <select
                      value={quickType}
                      onChange={(e) => setQuickType(e.target.value as any)}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059] cursor-pointer"
                    >
                      <option value="Main">Primordial Quest</option>
                      <option value="Side">Sacred Trial</option>
                      <option value="Habit">Daily Rite</option>
                      <option value="Boss">Titan Confrontation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1">Difficulty</label>
                    <select
                      value={quickDifficulty}
                      onChange={(e) => setQuickDifficulty(e.target.value as any)}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059] cursor-pointer"
                    >
                      <option value="Easy">Easy (+25 XP)</option>
                      <option value="Normal">Normal (+50 XP)</option>
                      <option value="Hard">Hard (+100 XP)</option>
                      <option value="Boss">Titan (+200 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1">Estimated Time (mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={quickTime}
                      onChange={(e) => setQuickTime(Number(e.target.value))}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-[#fef08a] font-mono font-bold focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1">Link Grand Destiny (Optional)</label>
                    <select
                      value={quickGoalId}
                      onChange={(e) => setQuickGoalId(e.target.value)}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059] cursor-pointer"
                    >
                      <option value="">No Destiny Linked</option>
                      {state.goals.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#c5a059]/20">
                  <div className="text-xs font-mono text-[#e5c875] font-bold">
                    SACRED REWARD: +{(quickDifficulty === 'Easy' ? 25 : quickDifficulty === 'Normal' ? 50 : quickDifficulty === 'Hard' ? 100 : 200) + Math.round(quickTime * 1.5)} XP
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickQuestOpen(false)}
                      className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-[#3a2e12] hover:bg-[#4d3d18] text-[#fef08a] border border-[#c5a059]/50 font-mono font-bold text-xs px-5 py-2 rounded-xl transition shadow-md cursor-pointer"
                    >
                      INSCRIBE DECREE
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <JobTitleModal 
        isOpen={isJobTitleModalOpen} 
        onClose={() => setIsJobTitleModalOpen(false)} 
      />

      <MuhasabahModal
        isOpen={isMuhasabahModalOpen}
        onClose={() => setIsMuhasabahModalOpen(false)}
      />
    </div>
  );
};
