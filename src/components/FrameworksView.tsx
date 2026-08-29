import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { usePOS } from '../POSContext';
import { Quest, Goal, Project } from '../types';
import { 
  Plus, Trash2, CheckSquare, Sparkles, TrendingUp, Compass, 
  Layers, ShieldAlert, Check, RotateCcw, Info, Calendar, 
  Play, Swords, Target, Award, ArrowRight, HelpCircle,
  GripVertical, Zap, Edit3, ChevronDown, ChevronUp, Clock, Filter, AlertTriangle,
  Lightbulb, FlaskConical, GitBranch, GitCommit, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';
import { OperationalHeuristicsEngine } from './frameworks/DecisionEngines';
import { RootCauseAnalysisEngine, WorkBackwardsEngine } from './frameworks/ProblemSolvingEngines';
import { BrainstormingSandbox, LateralThinkingLab, MindMappingGraph } from './frameworks/CreativeThinkingEngines';
import { TrialAndErrorLaboratory } from './frameworks/ExperimentationEngine';

export type FrameworkCategory = 'all' | 'decision' | 'problem_solving' | 'creative' | 'experimentation';

export type FrameworkTab = 
  | 'eisenhower' | 'pareto' | 'heuristics' | 'ooda'
  | 'root_cause' | 'work_backwards' | 'swot' | 'smart'
  | 'brainstorm' | 'lateral' | 'mindmap'
  | 'experiments';

export const FrameworksView: React.FC = () => {
  const { 
    state, addQuest, updateQuest, deleteQuest, completeQuest, 
    startFocusSession, activeFocusSession, toggleSubQuest, addSubQuest, addSystemMessage,
    isQuestScheduledForDate
  } = usePOS();
  const [activeCategory, setActiveCategory] = useState<FrameworkCategory>('all');
  const [activeTab, setActiveTab] = useState<FrameworkTab>('eisenhower');

  // --- PERSISTED STATE FOR FRAMEWORKS ---
  
  // Eisenhower quadrant mapping: questId -> 'Q1' | 'Q2' | 'Q3' | 'Q4'
  const [eisenhowerMap, setEisenhowerMap] = useState<Record<string, 'Q1' | 'Q2' | 'Q3' | 'Q4'>>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_framework_eisenhower');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // SWOT items state
  const [swotData, setSwotData] = useState<Record<'S' | 'W' | 'O' | 'T', string[]>>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_framework_swot');
      return saved ? JSON.parse(saved) : {
        S: ['Relentless consistency and focus stamina', 'Exceptional system architectural foundation', 'Deep spiritual/moral anchoring'],
        W: ['Occasional impatience with slower administrative tasks', 'Low public social branding/visibility', 'Susceptibility to early-morning sleep friction'],
        O: ['Rapid adoption of Go/Rust systems programming', 'Establishing high-leverage SaaS product pipelines', 'Standardizing Daily rhythms for elite output'],
        T: ['Rapidly changing development workflows', 'Market density saturation in junior dev roles', 'Cognitive fatigue from over-scheduling projects']
      };
    } catch {
      return { S: [], W: [], O: [], T: [] };
    }
  });

  // SMART Goal Checklist evaluations
  const [smartEvals, setSmartEvals] = useState<Record<string, {
    s: boolean; m: boolean; a: boolean; r: boolean; t: boolean;
    notes: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_framework_smart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // OODA loop decision logs
  const [oodaLogs, setOodaLogs] = useState<Array<{
    id: string;
    timestamp: string;
    observe: string;
    orient: string;
    decide: string;
    act: string;
    executedQuestId?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_framework_ooda');
      return saved ? JSON.parse(saved) : [
        {
          id: 'ooda-seed-1',
          timestamp: new Date().toISOString(),
          observe: 'Observe 15m delay in morning launch SOP due to mobile notification checking.',
          orient: 'Mobile notifications break circadian focus anchors. Morning willpower is drained on shallow inputs.',
          decide: 'Implement a physical block: Move mobile device to the kitchen charger before sleeping. No morning exposure.',
          act: 'Purchase physical lock box or set kitchen dock rule as daily pre-requisite.',
          executedQuestId: 'seeded'
        }
      ];
    } catch {
      return [];
    }
  });

  // --- SAVE SIDE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('pale_ore_framework_eisenhower', JSON.stringify(eisenhowerMap));
  }, [eisenhowerMap]);

  useEffect(() => {
    localStorage.setItem('pale_ore_framework_swot', JSON.stringify(swotData));
  }, [swotData]);

  useEffect(() => {
    localStorage.setItem('pale_ore_framework_smart', JSON.stringify(smartEvals));
  }, [smartEvals]);

  useEffect(() => {
    localStorage.setItem('pale_ore_framework_ooda', JSON.stringify(oodaLogs));
  }, [oodaLogs]);


  // --- EISENHOWER PLAYGROUND LOGIC ---
  const [quickAddTexts, setQuickAddTexts] = useState<Record<'Q1' | 'Q2' | 'Q3' | 'Q4', string>>({
    Q1: '', Q2: '', Q3: '', Q4: ''
  });
  const [quickAddTimelines, setQuickAddTimelines] = useState<Record<'Q1' | 'Q2' | 'Q3' | 'Q4', 'NONE' | 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS'>>({
    Q1: 'TODAY', Q2: 'TODAY', Q3: 'TODAY', Q4: 'TODAY'
  });

  const [selectedTimelineFilter, setSelectedTimelineFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS' | 'NO_DATE' | 'OVERDUE'>('ALL');
  const [showMatrixGuide, setShowMatrixGuide] = useState(false);

  const systemDate = state.systemDate || new Date().toISOString().split('T')[0];

  const getTomorrowStr = (baseDateStr: string) => {
    try {
      const parts = baseDateStr.split('-').map(Number);
      if (parts.length !== 3) return baseDateStr;
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return baseDateStr;
    }
  };

  const getNDaysStr = (baseDateStr: string, days: number) => {
    try {
      const parts = baseDateStr.split('-').map(Number);
      if (parts.length !== 3) return baseDateStr;
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2] + days);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return baseDateStr;
    }
  };

  const tomorrowStr = useMemo(() => getTomorrowStr(systemDate), [systemDate]);
  const sevenDaysEndStr = useMemo(() => getNDaysStr(systemDate, 7), [systemDate]);

  const next7Days = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(getNDaysStr(systemDate, i));
    }
    return dates;
  }, [systemDate]);

  const activeQuests = useMemo(() => {
    return state.quests.filter(q => q.status === 'Active');
  }, [state.quests]);

  const isQuestInTimelineHorizon = useCallback((q: Quest, horizon: 'ALL' | 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS' | 'NO_DATE' | 'OVERDUE') => {
    if (horizon === 'ALL') return true;

    const dl = q.deadline;
    const isRecurring = !!(q.recurrence && q.recurrence !== 'None') || q.type === 'Habit';

    if (horizon === 'NO_DATE') {
      return !dl && !isRecurring;
    }

    if (horizon === 'OVERDUE') {
      return !!dl && dl < systemDate;
    }

    if (horizon === 'TODAY') {
      if (isRecurring) {
        const scheduledToday = isQuestScheduledForDate(q, systemDate);
        return scheduledToday && (!dl || dl <= systemDate);
      }
      return !!dl && dl <= systemDate;
    }

    if (horizon === 'TOMORROW') {
      if (isRecurring) {
        return isQuestScheduledForDate(q, tomorrowStr);
      }
      return dl === tomorrowStr;
    }

    if (horizon === 'NEXT_7_DAYS') {
      if (isRecurring) {
        return next7Days.some(dateStr => isQuestScheduledForDate(q, dateStr));
      }
      return !!dl && dl >= systemDate && dl <= sevenDaysEndStr;
    }

    return true;
  }, [systemDate, tomorrowStr, sevenDaysEndStr, next7Days, isQuestScheduledForDate]);

  const filteredActiveQuests = useMemo(() => {
    return activeQuests.filter(q => isQuestInTimelineHorizon(q, selectedTimelineFilter));
  }, [activeQuests, isQuestInTimelineHorizon, selectedTimelineFilter]);

  const classifiedQuests = useMemo(() => {
    const q1: Quest[] = [];
    const q2: Quest[] = [];
    const q3: Quest[] = [];
    const q4: Quest[] = [];
    const unclassified: Quest[] = [];

    filteredActiveQuests.forEach(q => {
      // 1. Check saved eisenhowerMap
      let quad = eisenhowerMap[q.id];

      // 2. Check quest tags for explicit quadrant
      const qTags = (q as any).tags;
      if (!quad && qTags && qTags.length > 0) {
        const tagMatch = qTags.find((t: string) => ['Q1', 'Q2', 'Q3', 'Q4'].includes(t.toUpperCase()));
        if (tagMatch) {
          quad = tagMatch.toUpperCase() as 'Q1' | 'Q2' | 'Q3' | 'Q4';
        }
      }

      // 3. Default fallback mapping based on quest type & difficulty
      if (!quad) {
        if (q.type === 'Penalty' || q.type === 'Boss' || q.difficulty === 'Boss') quad = 'Q1';
        else if (q.type === 'Main' || q.difficulty === 'Hard' || q.difficulty === 'Normal') quad = 'Q2';
        else if (q.recurrence && q.recurrence !== 'None') quad = 'Q3';
        else quad = 'Q4';
      }

      if (quad === 'Q1') q1.push(q);
      else if (quad === 'Q2') q2.push(q);
      else if (quad === 'Q3') q3.push(q);
      else if (quad === 'Q4') q4.push(q);
    });

    return { Q1: q1, Q2: q2, Q3: q3, Q4: q4, unclassified };
  }, [filteredActiveQuests, eisenhowerMap]);

  const timelineCounts = useMemo(() => {
    let today = 0;
    let tomorrow = 0;
    let next7 = 0;
    let noDate = 0;
    let overdue = 0;

    activeQuests.forEach(q => {
      if (isQuestInTimelineHorizon(q, 'TODAY')) today++;
      if (isQuestInTimelineHorizon(q, 'TOMORROW')) tomorrow++;
      if (isQuestInTimelineHorizon(q, 'NEXT_7_DAYS')) next7++;
      if (isQuestInTimelineHorizon(q, 'NO_DATE')) noDate++;
      if (isQuestInTimelineHorizon(q, 'OVERDUE')) overdue++;
    });

    return {
      ALL: activeQuests.length,
      TODAY: today,
      TOMORROW: tomorrow,
      NEXT_7_DAYS: next7,
      NO_DATE: noDate,
      OVERDUE: overdue
    };
  }, [activeQuests, isQuestInTimelineHorizon]);

  const moveQuestQuadrant = (questId: string, quad: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    setEisenhowerMap(prev => ({
      ...prev,
      [questId]: quad
    }));

    // Synchronize tag with global quest state in POSContext
    const targetQuest = state.quests.find(q => q.id === questId);
    if (targetQuest) {
      const existingOtherTags = ((targetQuest as any).tags || []).filter((t: string) => !['Q1', 'Q2', 'Q3', 'Q4'].includes(t.toUpperCase()));
      updateQuest(questId, {
        tags: [quad, ...existingOtherTags]
      } as any);
    }
  };

  const handleQuickAddQuest = (quad: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    const title = (quickAddTexts[quad] || '').trim();
    if (!title) return;

    const difficultyMap = { Q1: 'Hard', Q2: 'Hard', Q3: 'Normal', Q4: 'Easy' } as const;
    const typeMap = { Q1: 'Penalty', Q2: 'Main', Q3: 'Side', Q4: 'Side' } as const;
    const xpMap = { Q1: 150, Q2: 200, Q3: 75, Q4: 25 };

    const timelineTarget = quickAddTimelines[quad];
    let computedDeadline: string | null = systemDate;
    if (timelineTarget === 'TODAY') computedDeadline = systemDate;
    else if (timelineTarget === 'TOMORROW') computedDeadline = tomorrowStr;
    else if (timelineTarget === 'NEXT_7_DAYS') computedDeadline = getNDaysStr(systemDate, 3);
    else if (timelineTarget === 'NONE') computedDeadline = null;

    const newId = addQuest({
      name: title,
      description: `Seeded directly in Eisenhower Matrix (${quad})`,
      difficulty: difficultyMap[quad],
      xp: xpMap[quad],
      type: typeMap[quad],
      estimatedTime: 25,
      deadline: computedDeadline,
      relatedSkills: [],
      subquests: [],
      tags: [quad]
    } as any);

    setEisenhowerMap(prev => ({
      ...prev,
      [newId]: quad
    }));

    setQuickAddTexts(prev => ({ ...prev, [quad]: '' }));

    addSystemMessage({
      sender: 'PROGRESS_ENGINE',
      category: 'alert',
      title: `🎯 DIRECTIVE SEEDED TO ${quad}`,
      content: `"${title}" created in ${quad} [Scheduled: ${computedDeadline}].`,
      priority: 'medium'
    });
  };

  const handleAutoClassify = () => {
    const updatedMap = { ...eisenhowerMap };
    let count = 0;

    activeQuests.forEach(q => {
      if (!updatedMap[q.id]) {
        let quad: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q2';
        if (q.type === 'Penalty' || q.difficulty === 'Boss') quad = 'Q1';
        else if (q.type === 'Main' || q.difficulty === 'Hard') quad = 'Q2';
        else if (q.recurrence && q.recurrence !== 'None') quad = 'Q3';
        else quad = 'Q4';

        updatedMap[q.id] = quad;
        count++;
      }
    });

    setEisenhowerMap(updatedMap);

    addSystemMessage({
      sender: 'PROGRESS_ENGINE',
      category: 'achievement',
      title: '⚡ AUTO-CALIBRATION COMPLETE',
      content: `Calibrated ${count} active directive(s) into strategic Eisenhower matrix quadrants.`,
      priority: 'medium'
    });
  };

  // --- SWOT HANDLERS ---
  const [newSwotText, setNewSwotText] = useState('');
  const [swotTargetType, setSwotTargetType] = useState<'S' | 'W' | 'O' | 'T'>('S');

  const addSwotItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwotText.trim()) return;
    setSwotData(prev => ({
      ...prev,
      [swotTargetType]: [...prev[swotTargetType], newSwotText.trim()]
    }));
    setNewSwotText('');
  };

  const deleteSwotItem = (type: 'S' | 'W' | 'O' | 'T', index: number) => {
    setSwotData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // --- SMART GOALS HANDLERS ---
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const activeGoals = useMemo(() => {
    return state.goals.filter(g => g.status === 'Active');
  }, [state.goals]);

  // Handle selected goal default selection
  useEffect(() => {
    if (activeGoals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(activeGoals[0].id);
    }
  }, [activeGoals, selectedGoalId]);

  const currentSmartEval = useMemo(() => {
    if (!selectedGoalId) return { s: false, m: false, a: false, r: false, t: false, notes: '' };
    return smartEvals[selectedGoalId] || { s: false, m: false, a: false, r: false, t: false, notes: '' };
  }, [selectedGoalId, smartEvals]);

  const toggleSmartCriterion = (criterion: 's' | 'm' | 'a' | 'r' | 't') => {
    if (!selectedGoalId) return;
    setSmartEvals(prev => ({
      ...prev,
      [selectedGoalId]: {
        ...(prev[selectedGoalId] || { s: false, m: false, a: false, r: false, t: false, notes: '' }),
        [criterion]: !((prev[selectedGoalId] || {})[criterion])
      }
    }));
  };

  const updateSmartNotes = (notes: string) => {
    if (!selectedGoalId) return;
    setSmartEvals(prev => ({
      ...prev,
      [selectedGoalId]: {
        ...(prev[selectedGoalId] || { s: false, m: false, a: false, r: false, t: false, notes: '' }),
        notes
      }
    }));
  };

  const smartProgressScore = useMemo(() => {
    let count = 0;
    if (currentSmartEval.s) count++;
    if (currentSmartEval.m) count++;
    if (currentSmartEval.a) count++;
    if (currentSmartEval.r) count++;
    if (currentSmartEval.t) count++;
    return (count / 5) * 100;
  }, [currentSmartEval]);

  // --- OODA LOOP HANDLERS ---
  const [oodaObserve, setOodaObserve] = useState('');
  const [oodaOrient, setOodaOrient] = useState('');
  const [oodaDecide, setOodaDecide] = useState('');
  const [oodaAct, setOodaAct] = useState('');
  const [oodaLinkedProjId, setOodaLinkedProjId] = useState<string>('');
  const [oodaLinkedSkillId, setOodaLinkedSkillId] = useState<string>('');

  const handleCreateOodaAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oodaObserve.trim() || !oodaDecide.trim() || !oodaAct.trim()) return;

    // Create a real operational quest based on the "Act" step
    const questName = `⚡ OODA ACTION: ${oodaAct.trim()}`;
    const questDesc = `OODA LOOP CALIBRATION:\n- OBSERVATION: ${oodaObserve.trim()}\n- DECISION: ${oodaDecide.trim()}`;
    
    const newQuestId = addQuest({
      name: questName,
      description: questDesc,
      difficulty: 'Normal',
      estimatedTime: 25,
      xp: 25,
      goalId: null,
      projectId: oodaLinkedProjId || null,
      milestoneId: null,
      relatedSkills: oodaLinkedSkillId ? [oodaLinkedSkillId] : [],
      type: 'Focus',
      deadline: state.systemDate,
      subquests: []
    });

    const newLog = {
      id: `ooda-${Date.now()}`,
      timestamp: new Date().toISOString(),
      observe: oodaObserve.trim(),
      orient: oodaOrient.trim(),
      decide: oodaDecide.trim(),
      act: oodaAct.trim(),
      executedQuestId: newQuestId
    };

    setOodaLogs(prev => [newLog, ...prev]);

    // Reset form
    setOodaObserve('');
    setOodaOrient('');
    setOodaDecide('');
    setOodaAct('');
    setOodaLinkedProjId('');
    setOodaLinkedSkillId('');
  };

  // --- 80/20 PARETO DATA-DRIVEN ANALYSIS ---
  const paretoAnalysis = useMemo(() => {
    const history = state.xpHistory || [];
    if (history.length === 0) {
      return {
        totalXp: 0,
        skillXpList: [],
        topSkillsContributor: "No XP History logged yet to process Pareto limits.",
        paretoMet: false,
        skillsCount: 0
      };
    }

    // 1. Group XP by Skill
    const skillXpMap: Record<string, { name: string; xp: number }> = {};
    let totalXpAccumulated = 0;

    history.forEach(h => {
      totalXpAccumulated += h.xp;
      if (h.skillIds && h.skillIds.length > 0) {
        h.skillIds.forEach(skId => {
          const actualSkill = state.skills.find(s => s.id === skId);
          const skillName = actualSkill ? actualSkill.name : 'Unknown Skill';
          if (!skillXpMap[skId]) {
            skillXpMap[skId] = { name: skillName, xp: 0 };
          }
          skillXpMap[skId].xp += h.xp;
        });
      } else {
        // Log general focus XP
        if (!skillXpMap['general']) {
          skillXpMap['general'] = { name: '🧘 General Focus & Mindfulness', xp: 0 };
        }
        skillXpMap['general'].xp += h.xp;
      }
    });

    // 2. Sort skills by XP descending
    const sortedSkillXp = Object.keys(skillXpMap)
      .map(id => ({ id, name: skillXpMap[id].name, xp: skillXpMap[id].xp }))
      .sort((a, b) => b.xp - a.xp);

    // 3. Compute cumulative percentages
    let cumulative = 0;
    const skillCumulativeList = sortedSkillXp.map(item => {
      cumulative += item.xp;
      const pct = (cumulative / totalXpAccumulated) * 100;
      return {
        ...item,
        cumulativePct: pct,
        individualPct: (item.xp / totalXpAccumulated) * 100
      };
    });

    // Find the top 20% of skills by count
    const skillsCount = sortedSkillXp.length;
    const top20PercentCount = Math.max(1, Math.round(skillsCount * 0.2));
    const topSkills = sortedSkillXp.slice(0, top20PercentCount);
    const topSkillsXpSum = topSkills.reduce((sum, s) => sum + s.xp, 0);
    const topSkillsXpPct = totalXpAccumulated > 0 ? (topSkillsXpSum / totalXpAccumulated) * 100 : 0;

    const topSkillsNames = topSkills.map(s => `"${s.name}"`).join(', ');

    return {
      totalXp: totalXpAccumulated,
      skillXpList: skillCumulativeList,
      topSkillsNames,
      topSkillsXpPct: Math.round(topSkillsXpPct),
      top20PercentCount,
      skillsCount,
      paretoRatioText: `${Math.round(topSkillsXpPct)}% of your progress is driven by just ${top20PercentCount} of your ${skillsCount} skills (${Math.round((top20PercentCount/skillsCount)*100)}% of your skill library).`
    };
  }, [state.xpHistory, state.skills]);

  return (
    <div className="space-y-6" id="frameworks-hub-view">
      
      {/* Header Banner */}
      <div className="glass-panel border border-[var(--border-accent)] bg-[var(--bg-card)]/90 p-5 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden shadow-xl">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RubElHizbIcon className="h-5 w-5 text-[var(--accent-bright)]" />
              <h2 className="font-display text-base font-black tracking-widest text-white uppercase">
                STRATEGIC THINKING LAB & INTERACTIVE ENGINES
              </h2>
            </div>
            <p className="text-xs text-zinc-300 font-mono">
              11 tactical engines across 4 cognitive disciplines • Calibrate operational friction into bulletproof execution tracks.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all' as const, label: 'All Engines (11)' },
              { id: 'decision' as const, label: '1. Decision (4)' },
              { id: 'problem_solving' as const, label: '2. Problem Solving (4)' },
              { id: 'creative' as const, label: '3. Creative (3)' },
              { id: 'experimentation' as const, label: '4. Experiment (1)' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (cat.id === 'decision' && !['eisenhower', 'pareto', 'heuristics', 'ooda'].includes(activeTab)) {
                    setActiveTab('eisenhower');
                  } else if (cat.id === 'problem_solving' && !['root_cause', 'work_backwards', 'swot', 'smart'].includes(activeTab)) {
                    setActiveTab('root_cause');
                  } else if (cat.id === 'creative' && !['brainstorm', 'lateral', 'mindmap'].includes(activeTab)) {
                    setActiveTab('brainstorm');
                  } else if (cat.id === 'experimentation' && activeTab !== 'experiments') {
                    setActiveTab('experiments');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition border cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[var(--accent-surface)] border-[var(--border-accent)] text-[var(--accent-highlight)] shadow-md'
                    : 'bg-[var(--bg-void)] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Framework Tabs Selectors (11 Engines) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-white/5 scrollbar-thin">
          {[
            // 1. Decision
            { id: 'eisenhower' as const, cat: 'decision', label: '🔲 Eisenhower Matrix', icon: Layers },
            { id: 'pareto' as const, cat: 'decision', label: '⚡ Pareto 80/20', icon: TrendingUp },
            { id: 'heuristics' as const, cat: 'decision', label: '🧠 Operational Heuristics', icon: Compass },
            { id: 'ooda' as const, cat: 'decision', label: '🔄 OODA Loop', icon: RotateCcw },

            // 2. Problem Solving
            { id: 'root_cause' as const, cat: 'problem_solving', label: '🔍 Root Cause (5 Whys)', icon: GitCommit },
            { id: 'work_backwards' as const, cat: 'problem_solving', label: '⏪ Working Backwards', icon: Target },
            { id: 'swot' as const, cat: 'problem_solving', label: '📊 SWOT Matrix', icon: Sparkles },
            { id: 'smart' as const, cat: 'problem_solving', label: '🎯 SMART Validator', icon: CheckSquare },

            // 3. Creative Thinking
            { id: 'brainstorm' as const, cat: 'creative', label: '💡 Brainstorm Sandbox', icon: Lightbulb },
            { id: 'lateral' as const, cat: 'creative', label: '🔀 Lateral Lab (SCAMPER)', icon: Compass },
            { id: 'mindmap' as const, cat: 'creative', label: '🕸️ Mind Map Graph', icon: GitBranch },

            // 4. Experimentation
            { id: 'experiments' as const, cat: 'experimentation', label: '🔬 Trial & Error Lab', icon: FlaskConical },
          ].filter(t => activeCategory === 'all' || t.cat === activeCategory).map(tab => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-gradient-to-r from-[var(--border-accent)] via-[var(--bg-card-hover)] to-[var(--bg-surface)] text-[var(--accent-highlight)] border-[var(--border-accent)] shadow-[0_0_12px_var(--glow-color)]'
                    : 'bg-[var(--bg-void)] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-[var(--border-accent)]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="min-h-[450px]"
        >
          
          {/* --- EISENHOWER MATRIX VIEW --- */}
          {activeTab === 'eisenhower' && (
            <div className="space-y-4" id="framework-eisenhower-window">
              <div className="glass-panel border border-[var(--border-accent)] bg-[var(--bg-card)]/90 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs relative overflow-hidden shadow-lg shadow-black/50">
                <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-white uppercase flex items-center gap-2 tracking-wide text-sm">
                      <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
                      EISENHOWER STRATEGIC DECREES MATRIX
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--accent-highlight)] bg-[var(--accent-surface)] border border-[var(--border-accent)] px-2 py-0.5 rounded font-bold">
                      {activeQuests.length} ACTIVE DIRECTIVES
                    </span>
                  </div>
                  <p className="text-zinc-400 font-mono text-[10px]">
                    Organize sacred trials into tactical quadrants. Guard Q2 (Sacred Mastery) for exponential compounding.
                  </p>
                </div>

                {/* Top Action Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAutoClassify}
                    className="bg-[var(--accent-surface)] hover:bg-[var(--accent-surface-hover)] border border-[var(--border-accent)] text-[var(--accent-highlight)] font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    title="Auto-classify unmapped tasks based on type & difficulty"
                  >
                    <Zap className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                    AUTO-CALIBRATE
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMatrixGuide(!showMatrixGuide)}
                    className="bg-[var(--bg-void)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-accent)] text-zinc-300 font-mono text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Info className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                    STRATEGY DOCTRINE
                    {showMatrixGuide ? <ChevronUp className="h-3 w-3 text-[var(--accent-bright)]" /> : <ChevronDown className="h-3 w-3 text-[var(--accent-bright)]" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Strategy Guide */}
              <AnimatePresence>
                {showMatrixGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-[var(--bg-surface)] border border-[var(--border-accent)] p-4 rounded-xl text-[11px] font-sans shadow-lg">
                      <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg">
                        <div className="font-mono font-bold text-rose-300 flex items-center gap-1.5 mb-1 text-[11px]">
                          <RubElHizbIcon className="h-3 w-3" color="#f43f5e" /> Q1: IMPERIAL CRISIS
                        </div>
                        <p className="text-zinc-300 text-[10px] leading-relaxed">
                          Urgent decrees, critical penalty threats & hard deadlines. Slay with immediate focus.
                        </p>
                      </div>
                      <div className="p-3 bg-[var(--accent-surface)] border border-[var(--border-accent)] rounded-lg">
                        <div className="font-mono font-bold text-[var(--accent-highlight)] flex items-center gap-1.5 mb-1 text-[11px]">
                          <RubElHizbIcon className="h-3 w-3" /> Q2: SACRED MASTERY
                        </div>
                        <p className="text-zinc-300 text-[10px] leading-relaxed">
                          Strategic skill progression, deep work & long-term destiny. Safeguard this chamber from shallow distractions.
                        </p>
                      </div>
                      <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                        <div className="font-mono font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-[11px]">
                          <RubElHizbIcon className="h-3 w-3" color="#f59e0b" /> Q3: SHALLOW FRICTION
                        </div>
                        <p className="text-zinc-300 text-[10px] leading-relaxed">
                          Urgent administrative interruptions & recurring low-leverage demands. Batch or automate with haste.
                        </p>
                      </div>
                      <div className="p-3 bg-[var(--bg-void)] border border-white/10 rounded-lg">
                        <div className="font-mono font-bold text-zinc-400 flex items-center gap-1.5 mb-1 text-[11px]">
                          <RubElHizbIcon className="h-3 w-3" color="#71717a" /> Q4: DISCARDED SHADOWS
                        </div>
                        <p className="text-zinc-400 text-[10px] leading-relaxed">
                          Distractions, cognitive noise & irrelevant loops. Purge relentlessly from active queues.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timeline Horizon Filter Bar */}
              <div className="bg-[var(--bg-surface)]/90 p-2.5 rounded-xl border border-[var(--border-accent)] font-mono text-[10px] shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[var(--accent-bright)] font-bold uppercase flex items-center gap-1 mr-1 shrink-0">
                    <Calendar className="h-3 w-3 text-[var(--accent-bright)]" /> HORIZON:
                  </span>
                  {(['ALL', 'TODAY', 'TOMORROW', 'NEXT_7_DAYS', 'NO_DATE', 'OVERDUE'] as const).map(horizon => {
                    const labelMap = {
                      ALL: `🌐 ALL (${timelineCounts.ALL})`,
                      TODAY: `📅 TODAY (${timelineCounts.TODAY})`,
                      TOMORROW: `☀️ TOMORROW (${timelineCounts.TOMORROW})`,
                      NEXT_7_DAYS: `📆 NEXT 7 DAYS (${timelineCounts.NEXT_7_DAYS})`,
                      NO_DATE: `♾️ NO DATE (${timelineCounts.NO_DATE})`,
                      OVERDUE: `⚠️ OVERDUE (${timelineCounts.OVERDUE})`
                    };
                    const isSelected = selectedTimelineFilter === horizon;
                    return (
                      <button
                        key={horizon}
                        onClick={() => setSelectedTimelineFilter(horizon)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                          isSelected 
                            ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] shadow font-black' 
                            : 'bg-[var(--bg-void)] text-zinc-400 hover:bg-[var(--bg-card-hover)] hover:text-white border border-white/5'
                        }`}
                      >
                        {labelMap[horizon]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matrix Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Q1: Urgent & Important */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q1')}
                  className="glass-panel border-rose-500/30 hover:border-rose-500/50 bg-[#0b0d13]/90 p-4 rounded-xl flex flex-col min-h-[320px] transition-all relative overflow-hidden space-y-3 shadow-lg"
                >
                    <div className="absolute top-0 right-0 p-2 text-[32px] font-black text-rose-500/5 font-mono select-none">Q1</div>
                    <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                      <div>
                        <h4 className="font-mono text-xs font-black text-rose-400 flex items-center gap-1.5">
                          <RubElHizbIcon className="h-3.5 w-3.5" color="#f43f5e" />
                          Q1: URGENT & IMPORTANT (IMMEDIATE DECREE)
                        </h4>
                        <p className="text-[10px] font-mono text-rose-300/60 mt-0.5">High consequence / High priority sacred obligations</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-lg">
                          {classifiedQuests.Q1.length} QUESTS ({classifiedQuests.Q1.reduce((sum, q) => sum + (q.estimatedTime || 0), 0)}m)
                        </span>
                      </div>
                    </div>

                    {/* Direct Quick Add Bar for Q1 */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleQuickAddQuest('Q1'); }}
                      className="flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={quickAddTexts.Q1}
                        onChange={(e) => setQuickAddTexts(prev => ({ ...prev, Q1: e.target.value }))}
                        placeholder="+ Seed urgent Q1 directive..."
                        className="flex-1 bg-[#07080c] border border-rose-500/25 focus:border-rose-500 rounded-lg px-2.5 py-1 text-xs text-white placeholder-rose-400/40 focus:outline-none font-mono"
                      />
                      <select
                        value={quickAddTimelines.Q1}
                        onChange={(e) => setQuickAddTimelines(prev => ({ ...prev, Q1: e.target.value as any }))}
                        className="bg-[#07080c] border border-rose-500/25 text-rose-300 font-mono text-[10px] rounded-lg px-1.5 py-1 focus:outline-none shrink-0 font-bold"
                      >
                        <option value="TODAY">📅 Today</option>
                        <option value="TOMORROW">☀️ Tomorrow</option>
                        <option value="NEXT_7_DAYS">📆 7 Days</option>
                        <option value="NONE">♾️ No Date</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 transition"
                      >
                        + ADD
                      </button>
                    </form>

                    {/* Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                      {classifiedQuests.Q1.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px] py-8 space-y-1">
                          <span>No urgent system threats. Excellent maintenance.</span>
                        </div>
                      ) : (
                        classifiedQuests.Q1.map(q => (
                          <QuestMiniCard 
                            key={q.id} 
                            quest={q} 
                            currentQuad="Q1" 
                            systemDate={systemDate}
                            updateQuest={updateQuest}
                            onMove={moveQuestQuadrant} 
                            completeQuest={completeQuest} 
                            deleteQuest={deleteQuest}
                            startFocus={startFocusSession} 
                            toggleSubQuest={toggleSubQuest}
                            addSubQuest={addSubQuest}
                            activeSession={activeFocusSession} 
                          />
                        ))
                      )}
                    </div>
                  </div>

                {/* Q2: Important, Not Urgent */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q2')}
                  className="glass-panel border border-[var(--border-accent)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]/90 p-4 rounded-xl flex flex-col min-h-[320px] transition-all relative overflow-hidden space-y-3 shadow-lg shadow-[var(--glow-color)]"
                >
                    <div className="absolute top-0 right-0 p-2 text-[32px] font-black text-[var(--accent-bright)]/10 font-mono select-none">Q2</div>
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                      <div>
                        <h4 className="font-mono text-xs font-black text-[var(--accent-highlight)] flex items-center gap-1.5">
                          <RubElHizbIcon className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                          Q2: SACRED MASTERY (IMPORTANT • STRATEGIC FOCUS)
                        </h4>
                        <p className="text-[10px] font-mono text-[var(--accent-bright)]/80 mt-0.5">High leverage strategic execution & skill compounding</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[var(--accent-highlight)] font-bold bg-[var(--accent-surface)] border border-[var(--border-accent)] px-2 py-0.5 rounded-lg">
                          {classifiedQuests.Q2.length} QUESTS ({classifiedQuests.Q2.reduce((sum, q) => sum + (q.estimatedTime || 0), 0)}m)
                        </span>
                      </div>
                    </div>

                    {/* Direct Quick Add Bar for Q2 */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleQuickAddQuest('Q2'); }}
                      className="flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={quickAddTexts.Q2}
                        onChange={(e) => setQuickAddTexts(prev => ({ ...prev, Q2: e.target.value }))}
                        placeholder="+ Seed strategic Q2 mastery directive..."
                        className="flex-1 bg-[var(--bg-void)] border border-[var(--border-accent)] focus:border-[var(--border-strong)] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[var(--text-muted)]/40 focus:outline-none font-mono"
                      />
                      <select
                        value={quickAddTimelines.Q2}
                        onChange={(e) => setQuickAddTimelines(prev => ({ ...prev, Q2: e.target.value as any }))}
                        className="bg-[var(--bg-void)] border border-[var(--border-accent)] text-[var(--accent-highlight)] font-mono text-[10px] rounded-lg px-1.5 py-1 focus:outline-none shrink-0 font-bold"
                      >
                        <option value="TODAY">📅 Today</option>
                        <option value="TOMORROW">☀️ Tomorrow</option>
                        <option value="NEXT_7_DAYS">📆 7 Days</option>
                        <option value="NONE">♾️ No Date</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-[var(--accent-surface)] hover:bg-[var(--accent-surface-hover)] border border-[var(--border-accent)] text-[var(--accent-highlight)] text-xs px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 transition"
                      >
                        + ADD
                      </button>
                    </form>

                    {/* Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                      {classifiedQuests.Q2.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px] py-8 space-y-1">
                          <span>Warning: Seed strategic quests here to protect long-term growth!</span>
                        </div>
                      ) : (
                        classifiedQuests.Q2.map(q => (
                          <QuestMiniCard 
                            key={q.id} 
                            quest={q} 
                            currentQuad="Q2" 
                            systemDate={systemDate}
                            updateQuest={updateQuest}
                            onMove={moveQuestQuadrant} 
                            completeQuest={completeQuest} 
                            deleteQuest={deleteQuest}
                            startFocus={startFocusSession} 
                            toggleSubQuest={toggleSubQuest}
                            addSubQuest={addSubQuest}
                            activeSession={activeFocusSession} 
                          />
                        ))
                      )}
                    </div>
                  </div>

                {/* Q3: Urgent, Not Important */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q3')}
                  className="glass-panel border-amber-500/30 hover:border-amber-500/50 bg-[#0b0d13]/90 p-4 rounded-xl flex flex-col min-h-[320px] transition-all relative overflow-hidden space-y-3 shadow-lg"
                >
                    <div className="absolute top-0 right-0 p-2 text-[32px] font-black text-amber-500/5 font-mono select-none">Q3</div>
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                      <div>
                        <h4 className="font-mono text-xs font-black text-amber-400 flex items-center gap-1.5">
                          <RubElHizbIcon className="h-3.5 w-3.5" color="#f59e0b" />
                          Q3: SHALLOW FRICTION (DELEGATE / BATCH)
                        </h4>
                        <p className="text-[10px] font-mono text-amber-300/60 mt-0.5">Administrative burdens & shallow recurring interruptions</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                          {classifiedQuests.Q3.length} QUESTS ({classifiedQuests.Q3.reduce((sum, q) => sum + (q.estimatedTime || 0), 0)}m)
                        </span>
                      </div>
                    </div>

                    {/* Direct Quick Add Bar for Q3 */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleQuickAddQuest('Q3'); }}
                      className="flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={quickAddTexts.Q3}
                        onChange={(e) => setQuickAddTexts(prev => ({ ...prev, Q3: e.target.value }))}
                        placeholder="+ Seed batch/admin Q3 task..."
                        className="flex-1 bg-[#07080c] border border-amber-500/25 focus:border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white placeholder-amber-400/40 focus:outline-none font-mono"
                      />
                      <select
                        value={quickAddTimelines.Q3}
                        onChange={(e) => setQuickAddTimelines(prev => ({ ...prev, Q3: e.target.value as any }))}
                        className="bg-[#07080c] border border-amber-500/25 text-amber-300 font-mono text-[10px] rounded-lg px-1.5 py-1 focus:outline-none shrink-0 font-bold"
                      >
                        <option value="TODAY">📅 Today</option>
                        <option value="TOMORROW">☀️ Tomorrow</option>
                        <option value="NEXT_7_DAYS">📆 7 Days</option>
                        <option value="NONE">♾️ No Date</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-xs px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 transition"
                      >
                        + ADD
                      </button>
                    </form>

                    {/* Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                      {classifiedQuests.Q3.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px] py-8 space-y-1">
                          <span>Clean operational backlog. No shallow interruptions queued.</span>
                        </div>
                      ) : (
                        classifiedQuests.Q3.map(q => (
                          <QuestMiniCard 
                            key={q.id} 
                            quest={q} 
                            currentQuad="Q3" 
                            systemDate={systemDate}
                            updateQuest={updateQuest}
                            onMove={moveQuestQuadrant} 
                            completeQuest={completeQuest} 
                            deleteQuest={deleteQuest}
                            startFocus={startFocusSession} 
                            toggleSubQuest={toggleSubQuest}
                            addSubQuest={addSubQuest}
                            activeSession={activeFocusSession} 
                          />
                        ))
                      )}
                    </div>
                  </div>

                {/* Q4: Not Urgent & Not Important */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q4')}
                  className="glass-panel border-zinc-800 hover:border-zinc-700 bg-[#07080c]/90 p-4 rounded-xl flex flex-col min-h-[320px] transition-all relative overflow-hidden space-y-3 shadow-lg"
                >
                    <div className="absolute top-0 right-0 p-2 text-[32px] font-black text-zinc-600/5 font-mono select-none">Q4</div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div>
                        <h4 className="font-mono text-xs font-black text-zinc-400 flex items-center gap-1.5">
                          <RubElHizbIcon className="h-3.5 w-3.5" color="#71717a" />
                          Q4: DISCARDED SHADOWS (PURGE / DROP)
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Low-impact distractions & trivial cognitive clutter</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold bg-[#0b0d13] border border-white/10 px-2 py-0.5 rounded-lg">
                          {classifiedQuests.Q4.length} QUESTS ({classifiedQuests.Q4.reduce((sum, q) => sum + (q.estimatedTime || 0), 0)}m)
                        </span>
                      </div>
                    </div>

                    {/* Direct Quick Add Bar for Q4 */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleQuickAddQuest('Q4'); }}
                      className="flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={quickAddTexts.Q4}
                        onChange={(e) => setQuickAddTexts(prev => ({ ...prev, Q4: e.target.value }))}
                        placeholder="+ Seed low-priority Q4 item..."
                        className="flex-1 bg-[#0b0d13] border border-white/10 focus:border-zinc-500 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                      />
                      <select
                        value={quickAddTimelines.Q4}
                        onChange={(e) => setQuickAddTimelines(prev => ({ ...prev, Q4: e.target.value as any }))}
                        className="bg-[#0b0d13] border border-white/10 text-zinc-400 font-mono text-[10px] rounded-lg px-1.5 py-1 focus:outline-none shrink-0 font-bold"
                      >
                        <option value="TODAY">📅 Today</option>
                        <option value="TOMORROW">☀️ Tomorrow</option>
                        <option value="NEXT_7_DAYS">📆 7 Days</option>
                        <option value="NONE">♾️ No Date</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 text-xs px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 transition"
                      >
                        + ADD
                      </button>
                    </form>

                    {/* Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                      {classifiedQuests.Q4.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px] py-8 space-y-1">
                          <span>No administrative or wasteful clutter. Highly efficient system.</span>
                        </div>
                      ) : (
                        classifiedQuests.Q4.map(q => (
                          <QuestMiniCard 
                            key={q.id} 
                            quest={q} 
                            currentQuad="Q4" 
                            systemDate={systemDate}
                            updateQuest={updateQuest}
                            onMove={moveQuestQuadrant} 
                            completeQuest={completeQuest} 
                            deleteQuest={deleteQuest}
                            startFocus={startFocusSession} 
                            toggleSubQuest={toggleSubQuest}
                            addSubQuest={addSubQuest}
                            activeSession={activeFocusSession} 
                          />
                        ))
                      )}
                    </div>
                  </div>

              </div>
            </div>
          )}

          {/* --- SWOT ANALYSIS VIEW --- */}
          {activeTab === 'swot' && (
            <div className="space-y-4" id="framework-swot-window">
              <div className="glass-panel border-white/5 bg-zinc-950/30 p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <h3 className="font-bold text-white uppercase flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Cybernetic SWOT Matrix Builder
                  </h3>
                  <p className="text-zinc-500 font-mono text-[10px]">
                    Outline your internal operational assets (S/W) and match them against external leverage landscapes (O/T).
                  </p>
                </div>
                
                {/* SWOT addition form */}
                <form onSubmit={addSwotItem} className="flex gap-2 self-center w-full md:w-auto">
                  <select
                    value={swotTargetType}
                    onChange={(e) => setSwotTargetType(e.target.value as any)}
                    className="bg-zinc-900 border border-white/10 rounded px-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="S">🟢 STRENGTHS</option>
                    <option value="W">🔴 WEAKNESSES</option>
                    <option value="O">🔵 OPPORTUNITIES</option>
                    <option value="T">⚠️ THREATS</option>
                  </select>
                  <input
                    type="text"
                    value={newSwotText}
                    onChange={(e) => setNewSwotText(e.target.value)}
                    placeholder="Add tactical SWOT factor..."
                    className="flex-1 md:w-64 bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-600"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 font-bold transition flex items-center gap-1 px-3 text-[10px] font-mono shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> ADD
                  </button>
                </form>
              </div>

              {/* SWOT Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="glass-panel border-emerald-500/10 bg-emerald-950/5 p-4 rounded-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-3xl font-black text-emerald-500/5 font-mono select-none">S</div>
                  <h4 className="font-mono text-xs font-black text-emerald-400 uppercase tracking-widest border-b border-emerald-500/10 pb-1.5">
                    🟢 Internal Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {swotData.S.length === 0 ? (
                      <li className="text-zinc-600 italic">No strengths defined.</li>
                    ) : (
                      swotData.S.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start gap-2 text-zinc-300 border-l border-emerald-500/20 pl-2">
                          <span className="py-0.5 leading-relaxed">{item}</span>
                          <button onClick={() => deleteSwotItem('S', idx)} className="text-zinc-600 hover:text-rose-400 p-0.5 transition shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-panel border-rose-500/10 bg-rose-950/5 p-4 rounded-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-3xl font-black text-rose-500/5 font-mono select-none">W</div>
                  <h4 className="font-mono text-xs font-black text-rose-400 uppercase tracking-widest border-b border-rose-500/10 pb-1.5">
                    🔴 Internal Weaknesses
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {swotData.W.length === 0 ? (
                      <li className="text-zinc-600 italic">No weaknesses defined.</li>
                    ) : (
                      swotData.W.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start gap-2 text-zinc-300 border-l border-rose-500/20 pl-2">
                          <span className="py-0.5 leading-relaxed">{item}</span>
                          <button onClick={() => deleteSwotItem('W', idx)} className="text-zinc-600 hover:text-rose-400 p-0.5 transition shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="glass-panel border-cyan-500/10 bg-cyan-950/5 p-4 rounded-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-3xl font-black text-cyan-500/5 font-mono select-none">O</div>
                  <h4 className="font-mono text-xs font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-500/10 pb-1.5">
                    🔵 External Opportunities
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {swotData.O.length === 0 ? (
                      <li className="text-zinc-600 italic">No opportunities defined.</li>
                    ) : (
                      swotData.O.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start gap-2 text-zinc-300 border-l border-cyan-500/20 pl-2">
                          <span className="py-0.5 leading-relaxed">{item}</span>
                          <button onClick={() => deleteSwotItem('O', idx)} className="text-zinc-600 hover:text-rose-400 p-0.5 transition shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Threats */}
                <div className="glass-panel border-amber-500/10 bg-amber-950/5 p-4 rounded-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 text-3xl font-black text-amber-500/5 font-mono select-none">T</div>
                  <h4 className="font-mono text-xs font-black text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-1.5">
                    ⚠️ External Threats
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {swotData.T.length === 0 ? (
                      <li className="text-zinc-600 italic">No threats defined.</li>
                    ) : (
                      swotData.T.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start gap-2 text-zinc-300 border-l border-amber-500/20 pl-2">
                          <span className="py-0.5 leading-relaxed">{item}</span>
                          <button onClick={() => deleteSwotItem('T', idx)} className="text-zinc-600 hover:text-rose-400 p-0.5 transition shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* --- SMART GOAL AUDIT VIEW --- */}
          {activeTab === 'smart' && (
            <div className="space-y-4" id="framework-smart-window">
              <div className="glass-panel border-white/5 bg-zinc-950/30 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white uppercase flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-cyan-400" />
                      SMART Goal-Setting Strategic Auditor
                    </h3>
                    <p className="text-zinc-500 font-mono text-[10px]">
                      Test whether your active operational goals are formulated for elite execution and trace non-compliance.
                    </p>
                  </div>

                  {/* Goal Selector */}
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">AUDIT_GOAL:</span>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                    >
                      {activeGoals.length === 0 ? (
                        <option value="">No Active Goals found</option>
                      ) : (
                        activeGoals.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {activeGoals.length === 0 ? (
                <div className="glass-panel border-white/5 bg-zinc-900/10 p-8 rounded-lg text-center text-zinc-500 italic text-xs">
                  Please create an active goal in the GOALS panel to run strategic SMART audits.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Criteria Checklist */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel border-white/5 p-4 rounded-lg space-y-4">
                      <h4 className="font-mono text-xs font-bold text-zinc-300 border-b border-white/5 pb-2">
                        🔎 CRITERIA CHECKLIST
                      </h4>

                      {/* S */}
                      <div className="flex items-start gap-3 p-2.5 rounded hover:bg-white/[0.01] transition">
                        <button
                          onClick={() => toggleSmartCriterion('s')}
                          className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center transition-all ${currentSmartEval.s ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'border-zinc-700 text-transparent'}`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="space-y-1">
                          <label className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
                            [S] Specific — Precise Formulation
                          </label>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            Is the goal specific? Does it name an exact, unambiguous terminal state (e.g. "Deploy Rust CLI" instead of "Learn Systems")?
                          </p>
                        </div>
                      </div>

                      {/* M */}
                      <div className="flex items-start gap-3 p-2.5 rounded hover:bg-white/[0.01] transition">
                        <button
                          onClick={() => toggleSmartCriterion('m')}
                          className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center transition-all ${currentSmartEval.m ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'border-zinc-700 text-transparent'}`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="space-y-1">
                          <label className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
                            [M] Measurable — Binary or Numeric Success
                          </label>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            Can success be quantified? Is there a clear metric, suite of unit tests, or physical marker to verify completion?
                          </p>
                        </div>
                      </div>

                      {/* A */}
                      <div className="flex items-start gap-3 p-2.5 rounded hover:bg-white/[0.01] transition">
                        <button
                          onClick={() => toggleSmartCriterion('a')}
                          className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center transition-all ${currentSmartEval.a ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'border-zinc-700 text-transparent'}`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="space-y-1">
                          <label className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
                            [A] Actionable — Direct Operational Control
                          </label>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            Are you in full control of the outcome? Does completion depend on your daily focus rather than market conditions?
                          </p>
                        </div>
                      </div>

                      {/* R */}
                      <div className="flex items-start gap-3 p-2.5 rounded hover:bg-white/[0.01] transition">
                        <button
                          onClick={() => toggleSmartCriterion('r')}
                          className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center transition-all ${currentSmartEval.r ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'border-zinc-700 text-transparent'}`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="space-y-1">
                          <label className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
                            [R] Realistic — Balanced Difficulty
                          </label>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            Is it highly feasible within your available schedule, bandwidth, and resource parameters?
                          </p>
                        </div>
                      </div>

                      {/* T */}
                      <div className="flex items-start gap-3 p-2.5 rounded hover:bg-white/[0.01] transition">
                        <button
                          onClick={() => toggleSmartCriterion('t')}
                          className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center transition-all ${currentSmartEval.t ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'border-zinc-700 text-transparent'}`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="space-y-1">
                          <label className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
                            [T] Time-Bound — Hard Deadline Focus
                          </label>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            Does it have a hard target date assigned in your system? Sprints must have temporal constraints to build momentum.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Rating & Notes */}
                  <div className="space-y-4">
                    
                    {/* Gauge widget */}
                    <div className="glass-panel border-white/5 p-4 rounded-lg text-center space-y-3 flex flex-col justify-center items-center">
                      <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase">BULLETPROOF_RATING</h4>
                      
                      <div className="relative flex items-center justify-center h-24 w-24">
                        <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                          <path className="text-zinc-900" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-cyan-400 transition-all duration-300" strokeDasharray={`${smartProgressScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute font-mono text-lg font-black text-white">{smartProgressScore}%</span>
                      </div>

                      <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                        {smartProgressScore === 100 ? '🛡️ BULLETPROOF_SECURED' : '⚠️ HIGH_FRICTION_RISK'}
                      </span>
                    </div>

                    {/* Notes block */}
                    <div className="glass-panel border-white/5 p-4 rounded-lg space-y-2">
                      <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">STRATEGIC AUDIT NOTES</label>
                      <textarea
                        value={currentSmartEval.notes}
                        onChange={(e) => updateSmartNotes(e.target.value)}
                        placeholder="Detail exact specifications, metrics, tests, or blockers for this goal..."
                        rows={5}
                        className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-700 leading-relaxed"
                      />
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {/* --- PARETO 80/20 ANALYSIS VIEW --- */}
          {activeTab === 'pareto' && (
            <div className="space-y-4" id="framework-pareto-window">
              <div className="glass-panel border-white/5 bg-zinc-950/30 p-4 rounded-lg">
                <div className="space-y-1 text-xs">
                  <h3 className="font-bold text-white uppercase flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    Data-Driven Pareto (80/20 Rule) Engine
                  </h3>
                  <p className="text-zinc-500 font-mono text-[10px]">
                    This system parses your entire logged <span className="text-cyan-400">XP History</span> to dynamically extract which top 20% high-leverage domains produce 80% of your progress.
                  </p>
                </div>
              </div>

              {state.xpHistory && state.xpHistory.length === 0 ? (
                <div className="glass-panel border-white/5 bg-zinc-900/10 p-8 rounded-lg text-center text-zinc-500 italic text-xs">
                  No XP logged in the history database yet to run Pareto compilation. Complete some quests or log focus sessions!
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Tactical analysis and ratios */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="glass-panel border-cyan-500/20 bg-cyan-950/5 p-5 rounded-lg space-y-4 flex flex-col justify-center">
                      <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-lg text-center font-mono">
                        <span className="text-[9px] text-zinc-500 uppercase block mb-1">COMPUTED_PARETO_LEVERAGE</span>
                        <span className="text-2xl font-black text-white">{paretoAnalysis.topSkillsXpPct}%</span>
                        <span className="text-[10px] text-cyan-300 block mt-1 font-bold">OF PROGRESS DETECTED</span>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed">
                        <h4 className="font-bold text-white uppercase flex items-center gap-1 font-mono text-[10px]">
                          <Info className="h-3.5 w-3.5 text-cyan-400" />
                          PARETO STATEMENT
                        </h4>
                        <p className="text-zinc-300 font-mono text-[11px]">
                          {paretoAnalysis.paretoRatioText}
                        </p>
                        <p className="text-zinc-400 text-[11px] leading-normal pt-1 border-t border-white/5">
                          To maximize competency compounding, double down on these elite domains: <span className="text-cyan-300 font-mono">{paretoAnalysis.topSkillsNames}</span>. Guard their training times fiercely from shallow administrative distractions!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills cumulative XP distribution bar graph / list */}
                  <div className="lg:col-span-2 glass-panel border-white/5 p-4 rounded-lg space-y-4">
                    <h4 className="font-mono text-xs font-bold text-zinc-300 border-b border-white/5 pb-2 uppercase">
                      📊 LOGGED XP DISTRIBUTION BY COMPETENCY TRACK
                    </h4>
                    
                    <div className="space-y-4">
                      {paretoAnalysis.skillXpList.map((item, index) => {
                        const isTopLeverage = index < paretoAnalysis.top20PercentCount;
                        return (
                          <div key={item.id} className="space-y-1 text-xs">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className={`h-2 w-2 rounded-full ${isTopLeverage ? 'bg-cyan-400 glow-cyan animate-pulse' : 'bg-zinc-700'}`} />
                                <span className="font-bold text-zinc-300 truncate">{item.name}</span>
                                {isTopLeverage && (
                                  <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1 py-0 rounded uppercase font-black tracking-widest scale-90 shrink-0">
                                    HIGH_LEVERAGE
                                  </span>
                                )}
                              </span>
                              <span className="text-zinc-500 shrink-0">
                                {item.xp} XP ({Math.round(item.individualPct)}% contribution)
                              </span>
                            </div>

                            {/* Bar Graphic */}
                            <div className="w-full bg-zinc-950 border border-white/5 rounded-full h-2.5 overflow-hidden flex">
                              <div 
                                className={`h-full rounded-l transition-all ${isTopLeverage ? 'bg-cyan-500' : 'bg-zinc-700'}`} 
                                style={{ width: `${item.individualPct}%` }} 
                              />
                            </div>

                            {/* Cumulative trajectory marker */}
                            <div className="flex justify-between text-[8px] font-mono text-zinc-600 pl-3">
                              <span>CUMULATIVE_TRAJECTORY</span>
                              <span>{Math.round(item.cumulativePct)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* --- OODA LOOP VIEW --- */}
          {activeTab === 'ooda' && (
            <div className="space-y-4" id="framework-ooda-window">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* OODA Form */}
                <div className="lg:col-span-1 glass-panel border-white/5 p-4 rounded-lg space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="font-mono text-xs font-bold text-zinc-300 uppercase">
                      🔄 INITIATE OODA LOOP
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Log a localized failure, friction point, or bottleneck. Calibrate it into an active operational quest immediately.
                    </p>
                  </div>

                  <form onSubmit={handleCreateOodaAction} className="space-y-3 text-xs">
                    
                    {/* Observe */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                        1. OBSERVE (The Friction / Blocker)
                      </label>
                      <textarea
                        value={oodaObserve}
                        onChange={(e) => setOodaObserve(e.target.value)}
                        placeholder="Observe what is happening... e.g. Sleep quality dropped to 60%, feeling groggy in Q1 work block."
                        rows={2}
                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-700"
                        required
                      />
                    </div>

                    {/* Orient */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                        2. ORIENT (Analyze Dependencies)
                      </label>
                      <textarea
                        value={oodaOrient}
                        onChange={(e) => setOodaOrient(e.target.value)}
                        placeholder="Why is this happening? e.g. Eating high-carb meal late at night (9:30 PM) spikes glucose and delays deep rest."
                        rows={2}
                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-700"
                      />
                    </div>

                    {/* Decide */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                        3. DECIDE (Formulate Mitigation)
                      </label>
                      <textarea
                        value={oodaDecide}
                        onChange={(e) => setOodaDecide(e.target.value)}
                        placeholder="What choice will solve this? e.g. Commit to eating last meal before 7:00 PM. No evening snacking."
                        rows={2}
                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-700"
                        required
                      />
                    </div>

                    {/* Act */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                        4. ACT (Resulting Quest to Spawn)
                      </label>
                      <input
                        type="text"
                        value={oodaAct}
                        onChange={(e) => setOodaAct(e.target.value)}
                        placeholder="Action Quest name... e.g. Dinner locked before 7:00 PM"
                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50 placeholder-zinc-700"
                        required
                      />
                    </div>

                    {/* Optional system linkages */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-500 uppercase block">Link Project</label>
                        <select
                          value={oodaLinkedProjId}
                          onChange={(e) => setOodaLinkedProjId(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/5 rounded p-1 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="">None</option>
                          {state.projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-500 uppercase block">Link Skill</label>
                        <select
                          value={oodaLinkedSkillId}
                          onChange={(e) => setOodaLinkedSkillId(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/5 rounded p-1 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="">None</option>
                          {state.skills.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 font-bold transition flex items-center justify-center gap-2 text-[10px] font-mono rounded mt-2.5"
                    >
                      <Swords className="h-3.5 w-3.5" /> SPAWN TERMINAL QUEST
                    </button>
                  </form>
                </div>

                {/* Historical OODA logs */}
                <div className="lg:col-span-2 glass-panel border-white/5 p-4 rounded-lg flex flex-col h-[480px]">
                  <h4 className="font-mono text-xs font-bold text-zinc-300 border-b border-white/5 pb-2 uppercase mb-3">
                    📜 HISTORICAL OODA DECISION LOGS
                  </h4>

                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-mono text-[10px]">
                    {oodaLogs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-600 italic">
                        No calibration loops logged.
                      </div>
                    ) : (
                      oodaLogs.map(log => (
                        <div key={log.id} className="p-3 bg-zinc-950 border border-white/5 rounded space-y-2 relative">
                          <div className="flex justify-between items-center text-[8px] text-zinc-500 border-b border-white/5 pb-1">
                            <span>OODA_CALIBRATION_LOOP [{log.id}]</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                            <div className="space-y-1">
                              <span className="text-cyan-400 font-bold uppercase block">[1] OBSERVE:</span>
                              <p className="text-zinc-300 bg-zinc-900 p-1.5 rounded border border-white/[0.02]">{log.observe}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-zinc-500 font-bold uppercase block">[2] ORIENT:</span>
                              <p className="text-zinc-400 bg-zinc-900 p-1.5 rounded border border-white/[0.02]">{log.orient || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 col-span-1 md:col-span-2">
                              <span className="text-cyan-400 font-bold uppercase block">[3] DECIDE (MITIGATION):</span>
                              <p className="text-zinc-300 bg-cyan-950/10 p-1.5 rounded border border-cyan-500/10">{log.decide}</p>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pt-1 border-t border-white/5 mt-1 text-[9px]">
                            <div className="flex items-center gap-1">
                              <ArrowRight className="h-3 w-3 text-cyan-400" />
                              <span className="text-cyan-400 font-bold uppercase">SPAWNED_QUEST:</span>
                              <span className="text-white">"{log.act}"</span>
                            </div>

                            <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1.5 rounded">
                              TERMINAL_LINKED
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- 1.3 OPERATIONAL HEURISTICS ANALYZER --- */}
          {activeTab === 'heuristics' && (
            <OperationalHeuristicsEngine />
          )}

          {/* --- 2.1 ROOT CAUSE ANALYSIS (5 WHYS) --- */}
          {activeTab === 'root_cause' && (
            <RootCauseAnalysisEngine />
          )}

          {/* --- 2.2 WORKING BACKWARDS MECHANISM --- */}
          {activeTab === 'work_backwards' && (
            <WorkBackwardsEngine />
          )}

          {/* --- 3.1 BRAINSTORMING SANDBOX --- */}
          {activeTab === 'brainstorm' && (
            <BrainstormingSandbox />
          )}

          {/* --- 3.2 LATERAL THINKING LAB --- */}
          {activeTab === 'lateral' && (
            <LateralThinkingLab />
          )}

          {/* --- 3.3 MIND MAPPING GRAPH --- */}
          {activeTab === 'mindmap' && (
            <MindMappingGraph />
          )}

          {/* --- 4.1 TRIAL & ERROR LABORATORY --- */}
          {activeTab === 'experiments' && (
            <TrialAndErrorLaboratory />
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
};

// --- SUPPORTING SUB-COMPONENTS ---

interface QuestMiniCardProps {
  quest: Quest;
  currentQuad: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  systemDate: string;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  onMove: (questId: string, quad: 'Q1' | 'Q2' | 'Q3' | 'Q4') => void;
  completeQuest: (id: string) => void;
  deleteQuest: (id: string) => void;
  startFocus: (questId: string, workTime: number, restTime: number) => void;
  toggleSubQuest: (questId: string, subquestId: string) => void;
  addSubQuest: (questId: string, name: string) => void;
  activeSession: any;
}

const QuestMiniCard: React.FC<QuestMiniCardProps> = ({ 
  quest, currentQuad, systemDate, updateQuest, onMove, completeQuest, deleteQuest, startFocus, toggleSubQuest, addSubQuest, activeSession 
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showSubquests, setShowSubquests] = useState(false);
  const [newSubquestName, setNewSubquestName] = useState('');

  const completedSubquests = (quest.subquests || []).filter(sq => sq.completed).length;
  const totalSubquests = (quest.subquests || []).length;

  const getTomorrowStr = (baseDateStr: string) => {
    try {
      const parts = baseDateStr.split('-').map(Number);
      if (parts.length !== 3) return baseDateStr;
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    } catch {
      return baseDateStr;
    }
  };

  const getNDaysStr = (baseDateStr: string, days: number) => {
    try {
      const parts = baseDateStr.split('-').map(Number);
      if (parts.length !== 3) return baseDateStr;
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2] + days);
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    } catch {
      return baseDateStr;
    }
  };

  const tomorrowStr = getTomorrowStr(systemDate);
  const sevenDaysEndStr = getNDaysStr(systemDate, 7);

  const getDaysDiff = (baseDateStr: string, targetDateStr: string) => {
    try {
      const p1 = baseDateStr.split('-').map(Number);
      const p2 = targetDateStr.split('-').map(Number);
      if (p1.length !== 3 || p2.length !== 3) return 0;
      const d1 = new Date(p1[0], p1[1] - 1, p1[2]).getTime();
      const d2 = new Date(p2[0], p2[1] - 1, p2[2]).getTime();
      return Math.round((d2 - d1) / (1000 * 3600 * 24));
    } catch {
      return 0;
    }
  };

  const getTimelineBadgeInfo = () => {
    const dl = quest.deadline;
    if (!dl) {
      if (quest.recurrence === 'Daily' || quest.type === 'Habit') {
        return { text: '📅 Today (Daily)', color: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' };
      }
      return { text: '📌 Today', color: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' };
    }
    if (dl < systemDate) {
      return { text: `⚠️ Overdue (${dl})`, color: 'bg-rose-950/90 border-rose-500/60 text-rose-300 font-bold animate-pulse' };
    }
    if (dl === systemDate) {
      return { text: '📅 Today', color: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 font-bold' };
    }
    if (dl === tomorrowStr) {
      return { text: '☀️ Tomorrow', color: 'bg-amber-950/80 border-amber-500/40 text-amber-300 font-bold' };
    }
    if (dl > systemDate && dl <= sevenDaysEndStr) {
      const diff = getDaysDiff(systemDate, dl);
      return { text: `📆 In ${diff}d (${dl})`, color: 'bg-purple-950/80 border-purple-500/40 text-purple-300' };
    }
    return { text: `🗓️ ${dl}`, color: 'bg-zinc-900 border-white/10 text-zinc-400' };
  };

  const timelineBadge = getTimelineBadgeInfo();

  const getPriorityColor = (q: Quest) => {
    if (q.type === 'Main' || q.type === 'Boss' || q.difficulty === 'Boss' || q.difficulty === 'Hard') return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
    if (q.difficulty === 'Normal') return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-zinc-400 border-zinc-700 bg-zinc-950';
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubquestName.trim()) return;
    addSubQuest(quest.id, newSubquestName.trim());
    setNewSubquestName('');
  };

  const handleSetDeadline = (newDate: string) => {
    updateQuest(quest.id, { deadline: newDate ? newDate : null });
    setShowDateMenu(false);
  };

  return (
    <div 
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', quest.id)}
      className="p-2.5 bg-zinc-950/90 border border-white/10 hover:border-cyan-500/40 rounded-lg flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:bg-zinc-900/80 transition-all shadow-sm group"
    >
      <div className="flex items-center justify-between gap-2">
        
        {/* Left Side: Drag handle & Title & Badges */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="h-3.5 w-3.5 text-zinc-600 group-hover:text-cyan-400 shrink-0 transition" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold tracking-widest shrink-0 ${getPriorityColor(quest)}`}>
                {quest.difficulty}
              </span>

              {/* Timeline Badge */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDateMenu(!showDateMenu)}
                  className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold tracking-wider hover:brightness-125 transition flex items-center gap-1 ${timelineBadge.color}`}
                  title="Click to reschedule task date"
                >
                  {timelineBadge.text}
                </button>

                {showDateMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDateMenu(false)} />
                    <div className="absolute left-0 top-full mt-1 bg-zinc-950 border border-white/20 rounded-lg shadow-xl p-1.5 z-50 flex flex-col font-mono text-[10px] w-40 gap-1">
                      <div className="text-[9px] text-zinc-500 font-bold px-1 border-b border-white/5 pb-1">
                        RESCHEDULE DATE
                      </div>
                      <button 
                        onClick={() => handleSetDeadline('')}
                        className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 text-left flex items-center gap-1.5 font-bold border border-white/5"
                      >
                        ♾️ No Target Date
                      </button>
                      <button 
                        onClick={() => handleSetDeadline(systemDate)}
                        className="px-2 py-1 rounded hover:bg-cyan-950 text-cyan-300 text-left flex items-center gap-1.5 font-bold"
                      >
                        📅 Today ({systemDate})
                      </button>
                      <button 
                        onClick={() => handleSetDeadline(tomorrowStr)}
                        className="px-2 py-1 rounded hover:bg-amber-950 text-amber-300 text-left flex items-center gap-1.5 font-bold"
                      >
                        ☀️ Tomorrow ({tomorrowStr})
                      </button>
                      <button 
                        onClick={() => handleSetDeadline(sevenDaysEndStr)}
                        className="px-2 py-1 rounded hover:bg-purple-950 text-purple-300 text-left flex items-center gap-1.5 font-bold"
                      >
                        📆 In 7 Days ({sevenDaysEndStr})
                      </button>
                      <div className="p-1 border-t border-white/5 flex items-center gap-1">
                        <span className="text-[8px] text-zinc-400">Custom:</span>
                        <input
                          type="date"
                          value={quest.deadline || ''}
                          onChange={(e) => handleSetDeadline(e.target.value)}
                          className="bg-zinc-900 border border-white/10 rounded px-1 text-[9px] text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                ⏱️ {quest.estimatedTime}m
              </span>
              {totalSubquests > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSubquests(!showSubquests)}
                  className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 transition shrink-0 flex items-center gap-1"
                >
                  <CheckSquare className="h-2.5 w-2.5" />
                  {completedSubquests}/{totalSubquests}
                </button>
              )}
            </div>
            <h5 className="text-[11px] font-bold text-white truncate mt-1 leading-snug">
              {quest.name}
            </h5>
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          
          {/* Subquests Toggle if empty */}
          {totalSubquests === 0 && (
            <button
              type="button"
              onClick={() => setShowSubquests(!showSubquests)}
              className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-cyan-400 rounded transition"
              title="Add Subquests Breakdown"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}

          {/* Pomodoro focus launcher */}
          {activeSession?.questId === quest.id ? (
            <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30 animate-pulse">
              FOCUSING
            </span>
          ) : (
            <button
              type="button"
              onClick={() => startFocus(quest.id, 25, 5)}
              className="p-1 hover:bg-cyan-950/60 border border-transparent hover:border-cyan-500/30 text-cyan-400 rounded transition"
              title="Launch Pomodoro Focus Timer (25m)"
            >
              <Play className="h-3 w-3 fill-cyan-400/20" />
            </button>
          )}

          {/* Complete quest */}
          <button
            type="button"
            onClick={() => completeQuest(quest.id)}
            className="p-1 hover:bg-emerald-950/60 border border-transparent hover:border-emerald-500/30 text-emerald-400 rounded transition"
            title="Mark Completed"
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </button>

          {/* Delete quest */}
          <button
            type="button"
            onClick={() => deleteQuest(quest.id)}
            className="p-1 hover:bg-rose-950/60 border border-transparent hover:border-rose-500/30 text-zinc-600 hover:text-rose-400 rounded transition"
            title="Delete Quest"
          >
            <Trash2 className="h-3 w-3" />
          </button>

          {/* Quadrant Selector Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-cyan-300 hover:bg-zinc-800 transition"
              title="Change Quadrant"
            >
              {currentQuad}
            </button>

            {showMoveMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoveMenu(false)} />
                <div className="absolute right-0 bottom-full mb-1 bg-zinc-950 border border-white/20 rounded-lg shadow-xl p-1 z-50 flex flex-col font-mono text-[10px] w-32 gap-1">
                  <button onClick={() => { onMove(quest.id, 'Q1'); setShowMoveMenu(false); }} className="px-2 py-1 rounded hover:bg-rose-950 text-rose-400 text-left font-bold">🟥 Q1 URGENT</button>
                  <button onClick={() => { onMove(quest.id, 'Q2'); setShowMoveMenu(false); }} className="px-2 py-1 rounded hover:bg-cyan-950 text-cyan-400 text-left font-bold">🟦 Q2 GROWTH</button>
                  <button onClick={() => { onMove(quest.id, 'Q3'); setShowMoveMenu(false); }} className="px-2 py-1 rounded hover:bg-amber-950 text-amber-400 text-left font-bold">🟨 Q3 BATCH</button>
                  <button onClick={() => { onMove(quest.id, 'Q4'); setShowMoveMenu(false); }} className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 text-left font-bold">⬛ Q4 DROP</button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Expandable Subquests Checklist inside Mini Card */}
      <AnimatePresence>
        {showSubquests && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 pt-2 mt-1 space-y-1.5 overflow-hidden"
          >
            {(quest.subquests || []).map(sq => (
              <div key={sq.id} className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleSubQuest(quest.id, sq.id)}
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 transition ${
                    sq.completed 
                      ? 'bg-emerald-500 border-emerald-400 text-black font-bold' 
                      : 'border-white/20 hover:border-cyan-400'
                  }`}
                >
                  {sq.completed && '✓'}
                </button>
                <span className={`text-[10px] font-sans ${sq.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                  {sq.name}
                </span>
              </div>
            ))}

            <form onSubmit={handleAddSub} className="flex gap-1.5 mt-1">
              <input
                type="text"
                value={newSubquestName}
                onChange={(e) => setNewSubquestName(e.target.value)}
                placeholder="+ Subquest breakdown..."
                className="flex-1 bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                type="submit"
                className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold"
              >
                ADD
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
