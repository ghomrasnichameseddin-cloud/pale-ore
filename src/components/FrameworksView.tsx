import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { Quest, Goal, Project } from '../types';
import { 
  Plus, Trash2, CheckSquare, Sparkles, TrendingUp, Compass, 
  Layers, ShieldAlert, Check, RotateCcw, Info, Calendar, 
  Play, Swords, Target, Award, ArrowRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FrameworkTab = 'eisenhower' | 'swot' | 'smart' | 'pareto' | 'ooda';

export const FrameworksView: React.FC = () => {
  const { state, addQuest, completeQuest, startFocusSession, activeFocusSession } = usePOS();
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
  const activeQuests = useMemo(() => {
    return state.quests.filter(q => q.status === 'Active');
  }, [state.quests]);

  const classifiedQuests = useMemo(() => {
    const q1: Quest[] = [];
    const q2: Quest[] = [];
    const q3: Quest[] = [];
    const q4: Quest[] = [];
    const unclassified: Quest[] = [];

    activeQuests.forEach(q => {
      // Respect manual priority if no explicit quadrant mapping exists
      const savedQuad = eisenhowerMap[q.id];
      if (savedQuad) {
        if (savedQuad === 'Q1') q1.push(q);
        else if (savedQuad === 'Q2') q2.push(q);
        else if (savedQuad === 'Q3') q3.push(q);
        else if (savedQuad === 'Q4') q4.push(q);
      } else {
        // Fallback mapping based on quest importance & difficulty
        if (q.important && q.type === 'Penalty') q1.push(q);
        else if (q.important || q.difficulty === 'Boss' || q.difficulty === 'Hard') q2.push(q);
        else if (q.difficulty === 'Normal') q2.push(q);
        else if (q.recurrence && q.recurrence !== 'None') q3.push(q);
        else q4.push(q);
      }
    });

    return { Q1: q1, Q2: q2, Q3: q3, Q4: q4, unclassified };
  }, [activeQuests, eisenhowerMap]);

  const moveQuestQuadrant = (questId: string, quad: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    setEisenhowerMap(prev => ({
      ...prev,
      [questId]: quad
    }));
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
      important: true,
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
      <div className="glass-panel border-cyan-500/10 bg-zinc-950/20 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-cyan-500/[0.02] to-transparent pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-400" />
            <h2 className="font-display text-base font-black tracking-widest text-white uppercase">INTERACTIVE STRATEGIC FRAMEWORKS</h2>
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            Execute tactical models & calibrate operational friction into bulletproof execution tracks.
          </p>
        </div>

        {/* Framework Tabs Selectors */}
        <div className="flex flex-wrap gap-1 bg-zinc-950/80 border border-white/5 p-1 rounded font-mono text-[10px]">
          <button
            onClick={() => setActiveTab('eisenhower')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'eisenhower' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🔲 EISENHOWER
          </button>
          <button
            onClick={() => setActiveTab('swot')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'swot' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            📊 SWOT MATRIX
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'smart' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🎯 SMART AUDIT
          </button>
          <button
            onClick={() => setActiveTab('pareto')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'pareto' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ⚡ Pareto (80/20)
          </button>
          <button
            onClick={() => setActiveTab('ooda')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'ooda' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🔄 OODA LOOP
          </button>
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
              <div className="glass-panel border-white/5 bg-zinc-950/30 p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <h3 className="font-bold text-white uppercase flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    Eisenhower Priority Calibration Matrix
                  </h3>
                  <p className="text-zinc-500 font-mono text-[10px]">
                    Drag or quickly map active quests to their strategic priority quadrant. Protect Q2 (Important, Not Urgent) for high-leverage skill mastery!
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded border border-white/5 shrink-0 self-center">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  HTML5 DRAG_AND_DROP CONTAINER ACTIVE
                </div>
              </div>

              {/* Matrix Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Q1: Urgent & Important */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q1')}
                  className="glass-panel border-rose-500/20 hover:border-rose-500/40 bg-zinc-900/10 p-4 rounded-lg flex flex-col h-[280px] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 text-[24px] font-black text-rose-500/5 font-mono select-none">Q1</div>
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-3">
                    <h4 className="font-mono text-xs font-black text-rose-400 flex items-center gap-1.5">
                      🟥 URGENT & IMPORTANT (DO NOW)
                    </h4>
                    <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-950/20 px-1.5 rounded">
                      {classifiedQuests.Q1.length} QUESTS
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {classifiedQuests.Q1.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[10px] py-8">
                        No pressing system threats. Excellent maintenance.
                      </div>
                    ) : (
                      classifiedQuests.Q1.map(q => (
                        <QuestMiniCard key={q.id} quest={q} currentQuad="Q1" onMove={moveQuestQuadrant} completeQuest={completeQuest} startFocus={startFocusSession} activeSession={activeFocusSession} />
                      ))
                    )}
                  </div>
                </div>

                {/* Q2: Important, Not Urgent */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q2')}
                  className="glass-panel border-cyan-500/20 hover:border-cyan-500/40 bg-zinc-900/10 p-4 rounded-lg flex flex-col h-[280px] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 text-[24px] font-black text-cyan-500/5 font-mono select-none">Q2</div>
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
                    <h4 className="font-mono text-xs font-black text-cyan-400 flex items-center gap-1.5">
                      🟦 NOT URGENT & IMPORTANT (CHAMPION_GROWTH)
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-500 font-bold bg-cyan-950/20 px-1.5 rounded">
                      {classifiedQuests.Q2.length} QUESTS
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {classifiedQuests.Q2.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[10px] py-8">
                        Warning: Seed strategic quests here to avoid structural stagnation!
                      </div>
                    ) : (
                      classifiedQuests.Q2.map(q => (
                        <QuestMiniCard key={q.id} quest={q} currentQuad="Q2" onMove={moveQuestQuadrant} completeQuest={completeQuest} startFocus={startFocusSession} activeSession={activeFocusSession} />
                      ))
                    )}
                  </div>
                </div>

                {/* Q3: Urgent, Not Important */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q3')}
                  className="glass-panel border-amber-500/20 hover:border-amber-500/40 bg-zinc-900/10 p-4 rounded-lg flex flex-col h-[280px] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 text-[24px] font-black text-amber-500/5 font-mono select-none">Q3</div>
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
                    <h4 className="font-mono text-xs font-black text-amber-400 flex items-center gap-1.5">
                      🟨 URGENT & UNIMPORTANT (DELEGATE/BATCH)
                    </h4>
                    <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-950/20 px-1.5 rounded">
                      {classifiedQuests.Q3.length} QUESTS
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {classifiedQuests.Q3.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[10px] py-8">
                        Clean operational backlog.
                      </div>
                    ) : (
                      classifiedQuests.Q3.map(q => (
                        <QuestMiniCard key={q.id} quest={q} currentQuad="Q3" onMove={moveQuestQuadrant} completeQuest={completeQuest} startFocus={startFocusSession} activeSession={activeFocusSession} />
                      ))
                    )}
                  </div>
                </div>

                {/* Q4: Not Urgent & Not Important */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => moveQuestQuadrant(e.dataTransfer.getData('text'), 'Q4')}
                  className="glass-panel border-zinc-700/30 hover:border-zinc-600 bg-zinc-900/10 p-4 rounded-lg flex flex-col h-[280px] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 text-[24px] font-black text-zinc-500/5 font-mono select-none">Q4</div>
                  <div className="flex items-center justify-between border-b border-zinc-700/30 pb-2 mb-3">
                    <h4 className="font-mono text-xs font-black text-zinc-400 flex items-center gap-1.5">
                      ⬛ NOT URGENT & UNIMPORTANT (ELIMINATE)
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950 px-1.5 rounded">
                      {classifiedQuests.Q4.length} QUESTS
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {classifiedQuests.Q4.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[10px] py-8">
                        No administrative or wasteful clutter. Efficient.
                      </div>
                    ) : (
                      classifiedQuests.Q4.map(q => (
                        <QuestMiniCard key={q.id} quest={q} currentQuad="Q4" onMove={moveQuestQuadrant} completeQuest={completeQuest} startFocus={startFocusSession} activeSession={activeFocusSession} />
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

        </motion.div>
      </AnimatePresence>

    </div>
  );
};

// --- SUPPORTING SUB-COMPONENTS ---

interface QuestMiniCardProps {
  quest: Quest;
  currentQuad: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  onMove: (questId: string, quad: 'Q1' | 'Q2' | 'Q3' | 'Q4') => void;
  completeQuest: (id: string) => void;
  startFocus: (questId: string, workTime: number, restTime: number) => void;
  activeSession: any;
}

const QuestMiniCard: React.FC<QuestMiniCardProps> = ({ 
  quest, currentQuad, onMove, completeQuest, startFocus, activeSession 
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const getPriorityColor = (q: Quest) => {
    if (q.important || q.difficulty === 'Boss' || q.difficulty === 'Hard') return 'text-rose-400 border-rose-500/20 bg-rose-950/10';
    if (q.difficulty === 'Normal') return 'text-amber-400 border-amber-500/20 bg-amber-950/10';
    return 'text-zinc-400 border-zinc-700 bg-zinc-950';
  };

  return (
    <div 
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', quest.id)}
      className="p-2 bg-zinc-950 border border-white/5 rounded flex justify-between items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-zinc-900 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold tracking-widest shrink-0 ${getPriorityColor(quest)}`}>
            {quest.important ? 'URGENT' : quest.difficulty}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
            {quest.estimatedTime}m
          </span>
        </div>
        <h5 className="text-[11px] font-bold text-white truncate mt-1">
          {quest.name}
        </h5>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        
        {/* Play Pomodoro launcher button directly on card */}
        {activeSession?.questId === quest.id ? (
          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1 py-0.5 rounded border border-cyan-500/20 animate-pulse">
            FOCUSING
          </span>
        ) : (
          <button
            onClick={() => startFocus(quest.id, 25, 5)}
            className="p-1 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 text-cyan-400 rounded transition"
            title="Launch Focus Timer (25m)"
          >
            <Play className="h-3 w-3 fill-cyan-400/20" />
          </button>
        )}

        {/* Complete quest */}
        <button
          onClick={() => completeQuest(quest.id)}
          className="p-1 hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/30 text-emerald-400 rounded transition"
          title="Complete Quest"
        >
          <Check className="h-3 w-3" />
        </button>

        {/* Manual Move Quadrant menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="text-zinc-500 hover:text-zinc-300 font-mono text-[9px] bg-zinc-900 border border-white/5 px-1 py-0.5 rounded"
            title="Change Eisenhower Quadrant"
          >
            MAP_QUAD
          </button>

          {showMoveMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoveMenu(false)} />
              <div className="absolute right-0 bottom-full mb-1.5 bg-zinc-950 border border-white/10 rounded shadow-lg p-1 z-50 flex flex-col font-mono text-[9px] w-24 gap-0.5">
                <button onClick={() => { onMove(quest.id, 'Q1'); setShowMoveMenu(false); }} className="px-1.5 py-1 rounded hover:bg-rose-950 text-rose-400 text-left">🟥 Q1 URGENT</button>
                <button onClick={() => { onMove(quest.id, 'Q2'); setShowMoveMenu(false); }} className="px-1.5 py-1 rounded hover:bg-cyan-950 text-cyan-400 text-left">🟦 Q2 GROWTH</button>
                <button onClick={() => { onMove(quest.id, 'Q3'); setShowMoveMenu(false); }} className="px-1.5 py-1 rounded hover:bg-amber-950 text-amber-400 text-left">🟨 Q3 BATCH</button>
                <button onClick={() => { onMove(quest.id, 'Q4'); setShowMoveMenu(false); }} className="px-1.5 py-1 rounded hover:bg-zinc-800 text-zinc-400 text-left">⬛ Q4 DELETE</button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
