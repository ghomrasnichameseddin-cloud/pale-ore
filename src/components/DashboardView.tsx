import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { getActiveJob, getActiveTitle } from '../jobsAndTitles';
import { JobTitleModal } from './JobTitleModal';
import { 
  Shield, Flame, Clock, Swords, CheckSquare, Square,
  ShieldAlert, Activity, ChevronRight, Check, Award, Compass,
  Sliders, Timer, Zap, Star, Coins, ShoppingBag, Plus, Search,
  Filter, Target, FolderKanban, Sparkles, TrendingUp, BarChart2,
  X, ArrowUpRight, Cpu, Layers, Play, RefreshCw, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestDifficulty, QuestType } from '../types';

interface DashboardViewProps {
  onNavigate?: (tab: 'dashboard' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system' | 'quests' | 'shop') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    state, updateProfileFocus, getPlayerLevelInfo, getAnalytics, completeQuest,
    isQuestFinishedForToday, processQuestReview, isQuestScheduledForDate, systemDate,
    toggleBatterySaverMode, toggleRecoveryMode, getAttributes, getGoalProgress,
    getProjectProgress, addQuest
  } = usePOS();

  const isBatterySaver = state.batterySettings?.batterySaverMode ?? false;

  const [focusText, setFocusText] = useState(state.profile.currentFocus);
  const [focusGoal, setFocusGoal] = useState(state.profile.focusGoalId || '');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [isJobTitleModalOpen, setIsJobTitleModalOpen] = useState(false);

  // Quick Quest Creator Modal State
  const [isQuickQuestOpen, setIsQuickQuestOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickType, setQuickType] = useState<QuestType>('Main');
  const [quickDifficulty, setQuickDifficulty] = useState<QuestDifficulty>('Normal');
  const [quickTime, setQuickTime] = useState<number>(30);
  const [quickGoalId, setQuickGoalId] = useState<string>('');
  const [quickProjectId, setQuickProjectId] = useState<string>('');

  // Directives Filtering & Search State
  const [directiveSearch, setDirectiveSearch] = useState('');
  const [directiveTypeFilter, setDirectiveTypeFilter] = useState<string>('ALL');
  const [directiveSort, setDirectiveSort] = useState<'XP' | 'TIME' | 'NAME'>('XP');
  const [selectedAttributeName, setSelectedAttributeName] = useState<string | null>(null);

  const levelInfo = getPlayerLevelInfo();
  const analytics = getAnalytics();
  const attributes = getAttributes();
  const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
  const activeTitle = getActiveTitle(state.profile.equippedTitleId, state.customTitles || [], state.deletedTitleIds || []);
  
  const activeQuests = state.quests.filter(q => 
    q.status === 'Active' && 
    !isQuestFinishedForToday(q) && 
    isQuestScheduledForDate(q, systemDate)
  );
  
  const frogOfTheDay = activeQuests.find(q => q.type === 'Main' || q.type === 'Boss' || q.difficulty === 'Boss' || q.difficulty === 'Hard') || 
                       (activeQuests.length > 0 ? [...activeQuests].sort((a, b) => b.xp - a.xp)[0] : null);
  const overdueQuests = activeQuests;

  // Active Goals for linkage cards
  const activeGoals = state.goals.filter(g => g.status === 'Active').slice(0, 3);

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
    return 0;
  });

  return (
    <div className="space-y-6" id="dashboard-view-root">
      
      {/* HEADER BAR & QUICK ACTION STRIP */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase">
              Progression Terminal
            </h2>
            <span className="text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md">
              v2.5 OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            SYS_DATE: {systemDate} • STATUS: {state.profile.recoveryMode ? 'RECOVERY PROTOCOL' : 'FULL OPERATIONAL VELOCITY'}
          </p>
        </div>

        {/* QUICK COMMAND ACTION STRIP */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setIsQuickQuestOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition flex items-center gap-1.5 border border-cyan-400/40"
          >
            <Plus className="h-4 w-4" />
            + QUICK QUEST
          </button>

          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('quests')}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                title="View Quests Board"
              >
                <Swords className="h-3.5 w-3.5 text-cyan-400" />
                QUESTS
              </button>

              <button
                onClick={() => onNavigate('goals')}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                title="View Goals & Sprints"
              >
                <Target className="h-3.5 w-3.5 text-purple-400" />
                GOALS
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="px-3 py-2 bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                title="Open Reward Shop"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
                SHOP ({state.profile.coins ?? 150} 🪙)
              </button>
            </>
          )}

          <button
            onClick={toggleRecoveryMode}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
              state.profile.recoveryMode
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-950/40 text-zinc-400 border-white/10 hover:text-amber-300'
            }`}
            title="Toggle Recovery Protocol to lower workloads during fatigue"
          >
            <Shield className={`h-3.5 w-3.5 ${state.profile.recoveryMode ? 'text-amber-400 animate-pulse' : ''}`} />
            {state.profile.recoveryMode ? 'RECOVERY ON' : 'RECOVERY'}
          </button>
        </div>
      </div>

      {/* TWO COLUMN MAIN TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PROFILE, ATTRIBUTES, EAT THE FROG, DIRECTIVES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE TERMINAL CARD */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-cyan-950/20" id="profile-card">
            {/* Background glow accent */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold flex items-center gap-1">
                  <span>⚡</span> OPERATOR PROFILE SIGNATURE
                </span>
                <h3 className="font-display text-3xl font-extrabold text-white mt-1 uppercase tracking-tight">
                  {state.profile.recoveryMode ? 'RECOVERING_OPERATOR' : 'SOLE_PROGRESSOR'}
                </h3>

                {/* Job & Title Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Star className="h-3.5 w-3.5 text-cyan-400" />
                    [{activeTitle.badge}] {activeTitle.name}
                  </span>

                  <span className="text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Shield className="h-3.5 w-3.5 text-purple-400" />
                    CLASS: {activeJob.name}
                  </span>

                  <button
                    onClick={() => setIsJobTitleModalOpen(true)}
                    className="text-[10px] font-mono font-bold bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Sliders className="h-3 w-3 text-cyan-400" /> CAREER & TITLES
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">POS RANK</span>
                <p className="text-xl font-display font-bold text-cyan-400 tracking-wide uppercase mt-0.5">
                  {levelInfo.rank}
                </p>
                <div className="text-[10px] font-mono text-zinc-400 mt-1">
                  PERK: <span className="text-cyan-300 font-bold">{activeJob.perk}</span>
                </div>
              </div>
            </div>

            {/* LEVEL & XP PROGRESSION HUD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
              {/* Level indicator */}
              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">SYS_LEVEL</span>
                <span className="text-2xl font-display font-bold text-white mt-1">LVL {levelInfo.level}</span>
              </div>

              {/* XP progress */}
              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-3.5 lg:col-span-2 flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase font-bold">
                  <span>ACCUMULATED_XP</span>
                  <span className="text-cyan-400 font-bold">{levelInfo.totalXp} XP</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400 font-bold">
                    <span>{levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForNextLevel} XP</span>
                    <span>{levelInfo.xpUntilNextLevel} XP TO NEXT LVL</span>
                  </div>
                </div>
              </div>

              {/* Momentum Indicator */}
              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase font-bold">
                  <span>MOMENTUM</span>
                  <Flame className={`h-3.5 w-3.5 ${state.profile.momentum > 50 ? 'text-orange-400 animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div className="text-2xl font-display font-bold text-white mt-0.5">
                  {state.profile.momentum}%
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mt-1 border border-white/5">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      state.profile.momentum > 75 ? 'bg-orange-500' : state.profile.momentum > 40 ? 'bg-cyan-500' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${state.profile.momentum}%` }}
                  />
                </div>
              </div>

              {/* Coins & Reward Shop Card */}
              <div 
                onClick={() => onNavigate?.('shop')}
                className="bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/40 hover:border-amber-400 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition group"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 uppercase font-bold">
                  <span>SHOP COINS</span>
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-amber-300 mt-0.5">
                  {state.profile.coins ?? 150} 🪙
                </div>
                <div className="text-[9px] font-mono text-amber-400/90 font-bold mt-1 flex items-center gap-1">
                  <span>OPEN REWARDS</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* FOCUS HUD & PERFORMANCE METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 relative z-10">
              <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-2.5">
                <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">FOCUS MINUTES TODAY</span>
                <span className="text-sm font-mono font-bold text-white mt-1 flex items-center gap-1.5">
                  🧘 {state.profile.focusMinutesToday || 0}m
                </span>
              </div>
              <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-2.5">
                <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">FOCUS STREAK</span>
                <span className="text-sm font-mono font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                  🔥 {state.profile.focusStreak || 0} Days
                </span>
              </div>
              <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-2.5">
                <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">EAT_FROG BOOST</span>
                <span className="text-sm font-mono font-bold text-cyan-400 mt-1 flex items-center gap-1">
                  ⚡ 1.2x XP ACTIVE
                </span>
              </div>
              <div 
                onClick={toggleBatterySaverMode}
                className={`border rounded-xl p-2.5 cursor-pointer transition flex flex-col justify-between ${
                  isBatterySaver 
                    ? 'bg-emerald-950/60 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                    : 'bg-zinc-950/80 hover:bg-zinc-900 border-white/10'
                }`}
                title="Toggle Eco Saver / Battery Defense mode"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold">ECO MODE</span>
                  <Zap className={`h-3.5 w-3.5 ${isBatterySaver ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <span className={`text-xs font-mono font-bold mt-1 uppercase ${isBatterySaver ? 'text-emerald-300' : 'text-zinc-400'}`}>
                  {isBatterySaver ? '⚡ HARDWARE ECO' : 'STANDARD'}
                </span>
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
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4" id="dashboard-attributes-matrix">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  CORE ATTRIBUTE CAPABILITIES MATRIX
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedAttributeName && (
                  <button
                    onClick={() => setSelectedAttributeName(null)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded transition"
                  >
                    RESET FILTER
                  </button>
                )}
                {onNavigate && (
                  <button 
                    onClick={() => onNavigate('analytics')}
                    className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
                  >
                    FULL MATRIX <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 font-mono">
              Click an attribute to inspect its mathematical breakdown, linked skills, and filter active directives.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {attributes.slice(0, 6).map(attr => {
                const totalVal = attr.total ?? attr.level;
                const baseVal = attr.baseLevel ?? 10;
                const bonusVal = attr.earnedBonus ?? (totalVal - baseVal);
                const isSelected = selectedAttributeName === attr.name;

                return (
                  <div 
                    key={attr.name} 
                    onClick={() => setSelectedAttributeName(isSelected ? null : attr.name)}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50'
                        : 'bg-zinc-950/80 border-white/10 hover:border-purple-500/40 hover:bg-zinc-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="text-sm">{attr.icon}</span>
                        {attr.name}
                      </span>
                      <span className="text-sm font-mono font-extrabold text-cyan-400">
                        LVL {totalVal}
                      </span>
                    </div>

                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (totalVal / 50) * 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
                      <span>BASE {baseVal}</span>
                      <span className="text-purple-300 font-bold">BONUS +{bonusVal}</span>
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
              const sealVal = selectedAttr.sealBoost ?? 0;

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
                <div className="mt-3 p-4 bg-zinc-950/90 border border-purple-500/30 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedAttr.icon}</span>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase">
                          {selectedAttr.name} Attribute Intelligence
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-400">
                          {selectedAttr.description}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedAttributeName(null)}
                      className="text-zinc-500 hover:text-white text-xs font-mono"
                    >
                      ✕ CLOSE
                    </button>
                  </div>

                  {/* FORMULA BREAKDOWN GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-2 bg-zinc-900/80 border border-white/5 rounded-lg">
                      <span className="text-[9px] text-zinc-400 uppercase block">STARTING BASELINE</span>
                      <span className="text-sm font-bold text-amber-300">{baseVal}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/80 border border-white/5 rounded-lg">
                      <span className="text-[9px] text-zinc-400 uppercase block">QUEST/SKILL EARNED</span>
                      <span className="text-sm font-bold text-emerald-400">+{bonusVal}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/80 border border-white/5 rounded-lg">
                      <span className="text-[9px] text-zinc-400 uppercase block">SEAL & CLASS BOOST</span>
                      <span className="text-sm font-bold text-purple-400">+{sealVal}</span>
                    </div>
                    <div className="p-2 bg-purple-950/60 border border-purple-500/40 rounded-lg">
                      <span className="text-[9px] text-purple-300 font-bold uppercase block">TOTAL LEVEL</span>
                      <span className="text-sm font-extrabold text-cyan-300">{totalVal}</span>
                    </div>
                  </div>

                  {/* LINKED SKILLS & DIRECTIVES QUICK ACTION */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                      <span className="text-zinc-400 font-bold uppercase">LINKED SKILLS:</span>
                      {relatedSkills.length > 0 ? (
                        relatedSkills.map(sk => (
                          <span key={sk.id} className="bg-purple-950/60 border border-purple-500/30 text-purple-200 px-2 py-0.5 rounded-md">
                            {sk.name} (LVL {sk.level})
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 italic">Grounded across all operational directives</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('system')}
                          className="text-[10px] font-mono text-zinc-400 hover:text-cyan-300 underline"
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
            <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-amber-950/10 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.08)]" id="frog-of-the-day-card">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-amber-500/40 uppercase font-bold tracking-widest">
                CRITICAL_PATH_NODE
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      🐸 COGNITIVE PRIORITY // EAT THE FROG
                    </span>
                  </div>
                  <h4 className="text-base font-sans font-extrabold text-white">
                    {frogOfTheDay.name}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {frogOfTheDay.description || 'No operational description logged.'}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono italic">
                    "If it's your job to eat a frog, it's best to do it first thing in the morning." — Mark Twain
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => completeQuest(frogOfTheDay.id)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.3)] uppercase flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> COMPLETE_FROG (+{frogOfTheDay.xp} XP)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE OPERATIONAL DIRECTIVES TERMINAL BOARD */}
          <div className="glass-panel rounded-2xl p-5 space-y-4" id="dashboard-active-directives">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Swords className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  OPERATIONAL DIRECTIVES BOARD ({filteredDirectives.length})
                </h3>
                {selectedAttributeName && (
                  <span className="text-[10px] font-mono bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                    <span>⚡ FILTERED BY: {selectedAttributeName.toUpperCase()}</span>
                    <button 
                      onClick={() => setSelectedAttributeName(null)}
                      className="hover:text-white ml-1 font-extrabold"
                      title="Clear attribute filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {/* DIRECTIVES SEARCH & FILTER CONTROL BAR */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search directives..."
                    value={directiveSearch}
                    onChange={(e) => setDirectiveSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 font-mono"
                  />
                  {directiveSearch && (
                    <button onClick={() => setDirectiveSearch('')} className="absolute right-2 top-2 text-zinc-500 hover:text-white text-xs">✕</button>
                  )}
                </div>

                <select
                  value={directiveTypeFilter}
                  onChange={(e) => setDirectiveTypeFilter(e.target.value)}
                  className="bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">ALL TYPES</option>
                  <option value="MAIN">MAIN & BOSS</option>
                  <option value="HABIT">HABITS</option>
                  <option value="SIDE">SIDE QUESTS</option>
                </select>

                <select
                  value={directiveSort}
                  onChange={(e) => setDirectiveSort(e.target.value as any)}
                  className="bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="XP">SORT: HIGHEST XP</option>
                  <option value="TIME">SORT: SHORTEST TIME</option>
                  <option value="NAME">SORT: ALPHABETICAL</option>
                </select>
              </div>
            </div>

            {filteredDirectives.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-zinc-950/40 border border-white/5 rounded-xl">
                <p className="text-sm text-zinc-400 font-sans">
                  {directiveSearch ? 'No directives matching search criteria.' : 'No active operational objectives found for today.'}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  All systems nominal. Deploy a quick quest to keep building momentum.
                </p>
                <button 
                  onClick={() => setIsQuickQuestOpen(true)}
                  className="mt-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono px-4 py-2 rounded-xl transition font-bold"
                >
                  + DEPLOY QUICK QUEST
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredDirectives.map((quest) => {
                  const completedSubquests = (quest.subquests || []).filter(sq => sq.completed).length;
                  const totalSubquests = (quest.subquests || []).length;

                  return (
                    <div 
                      key={quest.id}
                      className="p-3.5 bg-zinc-950/80 border border-white/10 rounded-xl flex items-center justify-between gap-3 hover:border-cyan-500/40 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button 
                          onClick={() => completeQuest(quest.id)}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 p-1"
                          title="Mark Complete"
                        >
                          <Square className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 space-y-1">
                          <span className="text-xs font-sans font-semibold text-white block truncate group-hover:text-cyan-300 transition">
                            {quest.name}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded uppercase font-bold">
                              {quest.type}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                              quest.difficulty === 'Easy' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                              quest.difficulty === 'Normal' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' :
                              quest.difficulty === 'Hard' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                              'bg-rose-950/40 text-rose-400 border border-rose-500/20 animate-pulse'
                            }`}>
                              {quest.difficulty}
                            </span>
                            {quest.estimatedTime && (
                              <span className="text-[9px] font-mono text-zinc-400 flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5 text-zinc-500" /> {quest.estimatedTime}m
                              </span>
                            )}
                            {totalSubquests > 0 && (
                              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/20">
                                {completedSubquests}/{totalSubquests} SUBTASKS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-lg">
                          +{quest.xp} XP
                        </span>
                        <button
                          onClick={() => completeQuest(quest.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> DONE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Strategy 3: End of Day Review Terminal */}
          {overdueQuests.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-purple-500/30 bg-zinc-950/60 relative overflow-hidden" id="eod-debrief-terminal">
              <div className="flex justify-between items-center border-b border-purple-500/20 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                    EOD_CLEAN_SLATE_DEBRIEF // WORKLOAD_MITIGATION
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-500">BACKLOG PROTECTION</span>
              </div>
              
              <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
                Manage unresolved directives to eliminate rollover cognitive debt:
              </p>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {overdueQuests.map(q => (
                  <div key={q.id} className="p-3 bg-zinc-950 border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-sans font-semibold text-white block">{q.name}</span>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase">{q.type} • {q.difficulty} • {q.xp} XP</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => processQuestReview(q.id, 'rollover')}
                        className="flex-1 sm:flex-none px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] font-mono rounded-lg transition uppercase font-bold"
                        title="Move deadline to Tomorrow"
                      >
                        Rollover
                      </button>
                      <button
                        onClick={() => processQuestReview(q.id, 'postpone')}
                        className="flex-1 sm:flex-none px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-mono rounded-lg transition uppercase font-bold"
                        title="Remove Deadline (Move to Queue)"
                      >
                        Defer
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Forgive this objective for today? No penalty will be activated.")) {
                            processQuestReview(q.id, 'forgive');
                          }
                        }}
                        className="flex-1 sm:flex-none px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono rounded-lg transition uppercase font-bold"
                        title="Forgive & Clear for today"
                      >
                        Forgive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: CURRENT FOCUS, GOALS & PROJECTS PREVIEW, DAILY HABITS, WORKLOAD REPORT */}
        <div className="space-y-6">
          
          {/* CURRENT FOCUS CARD */}
          <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20" id="current-focus-card">
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">CURRENT OPERATOR FOCUS</span>
              {!isEditingFocus && (
                <button 
                  onClick={() => setIsEditingFocus(true)}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white underline transition-colors"
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
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  required
                />
                
                <select 
                  value={focusGoal}
                  onChange={(e) => setFocusGoal(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="">No Associated Goal</option>
                  {state.goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>

                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingFocus(false)}
                    className="text-[10px] font-mono text-zinc-400 px-2 py-1"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-3 py-1 rounded-lg hover:bg-cyan-900 font-bold"
                  >
                    SAVE FOCUS
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-sans font-medium text-white leading-relaxed">
                  "{state.profile.currentFocus || 'Define your primary focus core directive.'}"
                </p>
                {state.profile.focusGoalId && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-zinc-400">🎯 LINKED TO:</span>
                    <span className="text-[10px] font-mono text-cyan-400 truncate font-bold">
                      {state.goals.find(g => g.id === state.profile.focusGoalId)?.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVE STRATEGIC GOALS PREVIEW */}
          <div className="glass-panel rounded-2xl p-5 space-y-3 border border-white/10" id="active-goals-preview">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  STRATEGIC GOALS ({activeGoals.length})
                </h3>
              </div>
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('goals')}
                  className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5 transition"
                >
                  ALL <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {activeGoals.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 py-2 text-center">No active strategic goals set.</p>
            ) : (
              <div className="space-y-2">
                {activeGoals.map(goal => {
                  const progress = getGoalProgress(goal.id);
                  return (
                    <div 
                      key={goal.id} 
                      onClick={() => onNavigate?.('goals')}
                      className="p-3 bg-zinc-950/80 border border-white/5 rounded-xl space-y-1.5 cursor-pointer hover:border-purple-500/40 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans font-bold text-white truncate group-hover:text-purple-300 transition">
                          {goal.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-purple-400 shrink-0">
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* QUICK-TAP DAILY HABITS LOBBY */}
          <div className="glass-panel rounded-2xl p-5 space-y-3" id="habit-lobby-panel">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">⚡ DAILY HABITS LOBBY</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400">QUICK TAP</span>
            </div>
            
            {state.quests.filter(q => (q.type?.toLowerCase() === 'habit' || q.recurrence === 'Daily') && isQuestScheduledForDate(q, systemDate)).length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono text-center py-2">
                No active daily habits registered for today.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {state.quests.filter(q => (q.type?.toLowerCase() === 'habit' || q.recurrence === 'Daily') && isQuestScheduledForDate(q, systemDate)).map(habit => {
                  const isFinished = isQuestFinishedForToday(habit);
                  return (
                    <div 
                      key={habit.id}
                      onClick={() => {
                        if (!isFinished) {
                          completeQuest(habit.id);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isFinished 
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-zinc-500' 
                          : 'bg-zinc-950 border-white/10 hover:border-cyan-500/40 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1 rounded-full shrink-0 ${isFinished ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-900 text-zinc-500'}`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={`text-xs font-sans font-medium truncate ${isFinished ? 'line-through text-zinc-500' : ''}`}>
                          {habit.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold shrink-0 ${isFinished ? 'text-emerald-500/40' : 'text-cyan-400'}`}>
                        {isFinished ? 'DONE' : `+${habit.xp} XP`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RESOURCE WORKLOAD REPORT */}
          <div className="glass-panel rounded-2xl p-5 space-y-4" id="workload-panel">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider border-b border-white/10 pb-2">
              RESOURCE & WORKLOAD REPORT
            </h4>

            <div className="space-y-3">
              {/* Today's Goal Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">CYCLE COMPLETION RATE</span>
                  <span className="text-white font-bold">{analytics.overallCompletionRate}%</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-cyan-500 h-full rounded-full" 
                    style={{ width: `${analytics.overallCompletionRate}%` }}
                  />
                </div>
              </div>

              {/* Today's Skill XP */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-400">TODAY EARNED XP</span>
                <span className="text-emerald-400 font-bold">+{analytics.todayXp} XP</span>
              </div>

              {/* Total active count */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-400">ACTIVE DIRECTIVES</span>
                <span className="text-white font-bold">{activeQuests.length}</span>
              </div>

              {/* Est XP Pending */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-400">ESTIMATED PENDING XP</span>
                <span className="text-cyan-400 font-bold">
                  {activeQuests.reduce((sum, q) => sum + q.xp, 0)} XP
                </span>
              </div>

              {/* Estimated Time */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-400">ESTIMATED TIME BUDGET</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-zinc-400" />
                  {Math.round(analytics.totalActiveTime / 60 * 10) / 10} Hours
                </span>
              </div>

              {/* Workload Status Gauge */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-between">
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
                  <Plus className="h-5 w-5 text-cyan-400" />
                  DEPLOY QUICK OPERATIONAL DIRECTIVE
                </h3>
                <button
                  onClick={() => setIsQuickQuestOpen(false)}
                  className="text-zinc-500 hover:text-white font-mono text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateQuickQuest} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Quest Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete 20min Deep Study Session"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Key operational details..."
                    value={quickDesc}
                    onChange={(e) => setQuickDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Quest Type</label>
                    <select
                      value={quickType}
                      onChange={(e) => setQuickType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Main">Main Quest</option>
                      <option value="Side">Side Quest</option>
                      <option value="Habit">Habit / Routine</option>
                      <option value="Boss">Boss Battle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Difficulty</label>
                    <select
                      value={quickDifficulty}
                      onChange={(e) => setQuickDifficulty(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Easy">Easy (+25 XP)</option>
                      <option value="Normal">Normal (+50 XP)</option>
                      <option value="Hard">Hard (+100 XP)</option>
                      <option value="Boss">Boss (+200 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Estimated Time (mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={quickTime}
                      onChange={(e) => setQuickTime(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Link Goal (Optional)</label>
                    <select
                      value={quickGoalId}
                      onChange={(e) => setQuickGoalId(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">No Goal Linked</option>
                      {state.goals.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/10">
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    ESTIMATED REWARD: +{(quickDifficulty === 'Easy' ? 25 : quickDifficulty === 'Normal' ? 50 : quickDifficulty === 'Hard' ? 100 : 200) + Math.round(quickTime * 1.5)} XP
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickQuestOpen(false)}
                      className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs px-5 py-2 rounded-xl transition shadow-md"
                    >
                      DEPLOY DIRECTIVE
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
    </div>
  );
};
