import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Quest, QuestDifficulty, QuestType } from '../types';
import { 
  Shield, Zap, Activity, Flame, Clock, Plus, Trash2, 
  Copy, ToggleLeft, ToggleRight, CheckCircle2, Circle, Swords,
  Edit3, Save, X, Skull, AlertTriangle, ShieldAlert, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { 
    state, addQuest, updateQuest, completeQuest, reopenQuest, failQuest, deleteQuest, 
    duplicateQuest, toggleRecoveryMode, updateProfileFocus, getPlayerLevelInfo, getAnalytics,
    addSubQuest, toggleSubQuest, deleteSubQuest
  } = usePOS();

  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestType, setNewQuestType] = useState<QuestType>('Main');
  const [newQuestDiff, setNewQuestDiff] = useState<QuestDifficulty>('Normal');
  const [newQuestGoal, setNewQuestGoal] = useState<string>('');
  const [newQuestSkills, setNewQuestSkills] = useState<string[]>([]);
  const [newQuestDuration, setNewQuestDuration] = useState<number>(30);
  const [newQuestRecurrence, setNewQuestRecurrence] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>('None');
  const [newQuestImportant, setNewQuestImportant] = useState(false);
  const [newQuestDescription, setNewQuestDescription] = useState('');

  const [focusText, setFocusText] = useState(state.profile.currentFocus);
  const [focusGoal, setFocusGoal] = useState(state.profile.focusGoalId || '');
  const [isEditingFocus, setIsEditingFocus] = useState(false);

  // Quest Editing State
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editQuestName, setEditQuestName] = useState('');
  const [editQuestDiff, setEditQuestDiff] = useState<QuestDifficulty>('Normal');
  const [editQuestType, setEditQuestType] = useState<QuestType>('Main');
  const [editQuestXp, setEditQuestXp] = useState<number>(100);
  const [editQuestGoal, setEditQuestGoal] = useState<string>('');
  const [editQuestRecurrence, setEditQuestRecurrence] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>('None');
  const [editQuestImportant, setEditQuestImportant] = useState(false);
  const [editQuestDescription, setEditQuestDescription] = useState('');

  const startEditingQuest = (quest: Quest) => {
    setEditingQuestId(quest.id);
    setEditQuestName(quest.name);
    setEditQuestDiff(quest.difficulty);
    setEditQuestType(quest.type);
    setEditQuestXp(quest.xp);
    setEditQuestGoal(quest.goalId || '');
    setEditQuestRecurrence(quest.recurrence || 'None');
    setEditQuestImportant(quest.important || false);
    setEditQuestDescription(quest.description || '');
  };

  const handleSaveQuestEdit = (id: string) => {
    updateQuest(id, {
      name: editQuestName,
      difficulty: editQuestDiff,
      type: editQuestType,
      xp: editQuestXp,
      goalId: editQuestGoal ? editQuestGoal : null,
      recurrence: editQuestRecurrence,
      important: editQuestImportant,
      description: editQuestDescription
    });
    setEditingQuestId(null);
  };

  const levelInfo = getPlayerLevelInfo();
  const analytics = getAnalytics();

  // Get active quests for today
  const activeQuests = state.quests.filter(q => q.status === 'Active');
  
  // Filter by Recovery Mode if active
  const filteredActiveQuests = state.profile.recoveryMode
    ? activeQuests.filter(q => q.type === 'Recovery' || q.type === 'Optional')
    : activeQuests;

  // Handle Focus form submission
  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileFocus(focusText, focusGoal ? focusGoal : null);
    setIsEditingFocus(false);
  };

  // Quick Add Quest
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestName.trim()) return;

    // Estimate XP based on Difficulty
    let xp = 80;
    if (newQuestDiff === 'Easy') xp = 50;
    else if (newQuestDiff === 'Normal') xp = 100;
    else if (newQuestDiff === 'Hard') xp = 200;
    else if (newQuestDiff === 'Boss') xp = 500;

    // An important quest is either explicitly toggled OR is of category Main/Boss OR difficulty Hard/Boss
    const autoImportant = newQuestType === 'Main' || newQuestType === 'Boss' || newQuestDiff === 'Hard' || newQuestDiff === 'Boss';
    const isImportant = newQuestImportant || autoImportant;

    addQuest({
      name: newQuestName,
      description: newQuestDescription.trim() || `Rapidly logged via OS terminal interface.`,
      difficulty: newQuestDiff,
      estimatedTime: newQuestDuration,
      xp,
      goalId: newQuestGoal ? newQuestGoal : null,
      projectId: null,
      milestoneId: null,
      relatedSkills: newQuestSkills,
      type: newQuestType,
      recurrence: newQuestRecurrence,
      deadline: new Date().toISOString().split('T')[0],
      important: isImportant
    });

    setNewQuestName('');
    setNewQuestDescription('');
    setNewQuestSkills([]);
    setNewQuestRecurrence('None');
    setNewQuestImportant(false);
  };

  // Toggle skills selection for new quest
  const handleSkillToggle = (skillId: string) => {
    setNewQuestSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div className="space-y-6" id="dashboard-view-root">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            Progression Terminal
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            SYS_TIME: {new Date().toLocaleTimeString()} • GROUNDED IN EVIDENCE
          </p>
        </div>

        {/* Recovery Protocol Button */}
        <button 
          onClick={toggleRecoveryMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-all duration-300 ${
            state.profile.recoveryMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20'
          }`}
          id="toggle-recovery-mode"
        >
          <Shield className={`h-4 w-4 ${state.profile.recoveryMode ? 'text-amber-400 animate-pulse' : ''}`} />
          {state.profile.recoveryMode ? 'RECOVERY MODE ACTIVE' : 'RECOVERY MODE INACTIVE'}
        </button>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CORE STATS & INLINE CREATION */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="glass-panel rounded-lg p-6 relative overflow-hidden" id="profile-card">
            {/* Background vector accents */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">PLAYER SIGNATURE</span>
                <h3 className="font-display text-3xl font-extrabold text-white mt-1 uppercase tracking-tight">
                  {state.profile.recoveryMode ? 'RECOVERING_OPERATOR' : 'SOLE_PROGRESSOR'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-zinc-500">POS RANK</span>
                <p className="text-lg font-display font-bold text-cyan-400 tracking-wide uppercase mt-0.5">
                  {levelInfo.rank}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
              {/* Level indicator */}
              <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">SYS_LEVEL</span>
                <span className="text-3xl font-display font-bold text-white mt-2">LVL {levelInfo.level}</span>
              </div>

              {/* XP progress */}
              <div className="bg-white/[0.02] border border-white/5 rounded p-3 md:col-span-2 flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>ACCUMULATED_XP</span>
                  <span className="text-cyan-400 font-bold">{levelInfo.totalXp} XP</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-500" 
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>{levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForNextLevel} XP</span>
                    <span>{levelInfo.xpUntilNextLevel} XP TO LVL {levelInfo.level + 1}</span>
                  </div>
                </div>
              </div>

              {/* Momentum Indicator */}
              <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase">
                  <span>MOMENTUM</span>
                  <Flame className={`h-3 w.3 ${state.profile.momentum > 50 ? 'text-orange-400 animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div className="text-2xl font-display font-bold text-white mt-1">
                  {state.profile.momentum}%
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden mt-2">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      state.profile.momentum > 75 ? 'bg-orange-500' : state.profile.momentum > 40 ? 'bg-cyan-500' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${state.profile.momentum}%` }}
                  />
                </div>
              </div>
            </div>

            {state.profile.momentum < 40 && (
              <div className="mt-4 p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-lg flex items-center gap-2.5 text-[10px] font-mono text-rose-400 animate-pulse">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                <span>WARNING: DEBUFF_ACTIVE [SLUGGISH] - PRODUCTIVITY MOMENTUM CRITICAL. CORE REWARDS NOMINALLY REDUCED.</span>
              </div>
            )}
          </div>

          {/* ACTIVE QUESTS MODULE */}
          <div className="glass-panel rounded-lg p-6 space-y-4" id="active-quests-panel">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  {state.profile.recoveryMode ? 'RECOVERY DIRECTIVES' : 'TODAY\'S ACTIVE DIRECTIVES'}
                </h4>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {filteredActiveQuests.length} ACTIVE / {state.quests.filter(q => q.status === 'Completed').length} ARCHIVED TODAY
                </p>
              </div>

              {state.profile.recoveryMode && (
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                  REDUCED LOAD ACTIVE
                </span>
              )}
            </div>

            {/* Quests Container */}
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {filteredActiveQuests.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-lg">
                  <p className="text-xs text-zinc-500 font-mono">NO ACTIVE DIRECTIVES LOGGED FOR THIS CYCLE</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-1">Add a custom quest below to begin progression.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredActiveQuests.map((quest) => {
                    const matchedGoal = state.goals.find(g => g.id === quest.goalId);
                    const isEditing = editingQuestId === quest.id;
                    
                    if (isEditing) {
                      return (
                        <motion.div
                          key={quest.id}
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-4 bg-zinc-950 border border-cyan-500/30 rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">CHANGE_DIRECTIVE_PARAMETERS</span>
                            <button 
                              type="button"
                              onClick={() => setEditingQuestId(null)}
                              className="text-zinc-500 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Quest Title</label>
                              <input 
                                type="text"
                                value={editQuestName}
                                onChange={(e) => setEditQuestName(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white font-sans"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Quest Description</label>
                              <textarea 
                                value={editQuestDescription}
                                onChange={(e) => setEditQuestDescription(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white font-sans h-16 resize-none focus:outline-none focus:border-cyan-500"
                                placeholder="Enter quest description..."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Difficulty</label>
                                <select 
                                  value={editQuestDiff}
                                  onChange={(e) => {
                                    const diff = e.target.value as QuestDifficulty;
                                    setEditQuestDiff(diff);
                                    if (diff === 'Easy') setEditQuestXp(50);
                                    else if (diff === 'Normal') setEditQuestXp(100);
                                    else if (diff === 'Hard') setEditQuestXp(200);
                                    else if (diff === 'Boss') setEditQuestXp(500);
                                  }}
                                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-white"
                                >
                                  <option value="Easy">Easy (50 XP)</option>
                                  <option value="Normal">Normal (100 XP)</option>
                                  <option value="Hard">Hard (200 XP)</option>
                                  <option value="Boss">Boss (500 XP)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">XP Reward</label>
                                <input 
                                  type="number"
                                  value={editQuestXp}
                                  onChange={(e) => setEditQuestXp(Number(e.target.value))}
                                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-white text-center font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Recurrence</label>
                                <select 
                                  value={editQuestRecurrence}
                                  onChange={(e) => setEditQuestRecurrence(e.target.value as any)}
                                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300"
                                >
                                  <option value="None">Once Only</option>
                                  <option value="Daily">🔁 Daily</option>
                                  <option value="Weekly">🔁 Weekly</option>
                                  <option value="Monthly">🔁 Monthly</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Parent Goal</label>
                                <select 
                                  value={editQuestGoal}
                                  onChange={(e) => setEditQuestGoal(e.target.value)}
                                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300 truncate"
                                >
                                  <option value="">No Goal</option>
                                  {state.goals.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Quest Category</label>
                                <select 
                                  value={editQuestType}
                                  onChange={(e) => setEditQuestType(e.target.value as QuestType)}
                                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300"
                                >
                                  <option value="Main">Main Quest</option>
                                  <option value="Side">Side Quest</option>
                                  <option value="Boss">Boss Quest</option>
                                  <option value="Recovery">Recovery Quest</option>
                                  <option value="Habit">Habit Quest</option>
                                  <option value="Optional">Optional Quest</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Critical/Important</label>
                                <button
                                  type="button"
                                  onClick={() => setEditQuestImportant(!editQuestImportant)}
                                  className={`w-full bg-zinc-900 border rounded p-1 text-xs font-mono transition-all duration-200 flex items-center justify-center gap-1 ${
                                    editQuestImportant 
                                      ? 'border-rose-500/50 text-rose-400 bg-rose-950/20' 
                                      : 'border-white/10 text-zinc-500 hover:border-white/20'
                                  }`}
                                >
                                  {editQuestImportant ? '⚠️ YES' : 'NO'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                            <button 
                              type="button"
                              onClick={() => setEditingQuestId(null)}
                              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              CANCEL
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleSaveQuestEdit(quest.id)}
                              className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-3 py-1 rounded transition-colors flex items-center gap-1"
                            >
                              <Save className="h-3 w-3" />
                              SAVE_CHANGES
                            </button>
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={quest.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 bg-zinc-950/60 border border-white/5 rounded-lg flex items-start justify-between gap-3 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Checkbox */}
                          <button 
                            onClick={() => completeQuest(quest.id)}
                            className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                            title="Complete Quest"
                          >
                            <Circle className="h-5 w-5" />
                          </button>
                          
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Important / Critical badge */}
                              {(quest.important || quest.type === 'Main' || quest.type === 'Boss') && (
                                <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                                  ⚠️ CRITICAL
                                </span>
                              )}

                              {/* Difficulty */}
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                quest.difficulty === 'Easy' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50' :
                                quest.difficulty === 'Normal' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/10' :
                                quest.difficulty === 'Hard' ? 'bg-purple-950/30 text-purple-400 border border-purple-500/10' :
                                'bg-rose-950/40 text-rose-400 border border-rose-500/20 font-bold animate-pulse'
                              }`}>
                                {quest.difficulty}
                              </span>

                              {/* Type */}
                              <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded">
                                {quest.type}
                              </span>

                              {/* Recurrence */}
                              {quest.recurrence && quest.recurrence !== 'None' && (
                                <span className="text-[9px] font-mono text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                                  🔁 {quest.recurrence}
                                </span>
                              )}

                              {/* Goal relation */}
                              {matchedGoal && (
                                <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[150px] bg-zinc-900/50 px-1.5 py-0.5 rounded">
                                  🎯 {matchedGoal.name}
                                </span>
                              )}
                            </div>

                            <h5 className="font-sans text-sm font-semibold text-white leading-tight">
                              {quest.name}
                            </h5>

                            {quest.description && (
                              <p className="text-xs text-zinc-400 font-sans mt-1.5 whitespace-pre-wrap leading-relaxed">
                                {quest.description}
                              </p>
                            )}

                            {/* Subquests Section */}
                            <div className="mt-3.5 space-y-2 border-l border-zinc-800 pl-3">
                              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                <span>Subquests ({quest.subquests?.filter(s => s.completed).length || 0}/{quest.subquests?.length || 0})</span>
                              </div>
                              
                              {quest.subquests && quest.subquests.length > 0 && (
                                <div className="space-y-1.5 max-w-md">
                                  {quest.subquests.map(sq => (
                                    <div key={sq.id} className="flex items-center justify-between gap-2 group/sq">
                                      <button
                                        onClick={() => toggleSubQuest(quest.id, sq.id)}
                                        className="flex items-center gap-1.5 text-xs text-left text-zinc-300 hover:text-white transition-colors"
                                      >
                                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                                          sq.completed 
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                                            : 'border-white/10 group-hover/sq:border-white/20'
                                        }`}>
                                          {sq.completed && <Check className="h-2 w-2 stroke-[3]" />}
                                        </span>
                                        <span className={`font-sans text-[11px] ${sq.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                                          {sq.name}
                                        </span>
                                      </button>
                                      
                                      <button
                                        onClick={() => deleteSubQuest(quest.id, sq.id)}
                                        className="opacity-0 group-hover/sq:opacity-100 text-zinc-600 hover:text-rose-400 p-0.5 rounded transition-all"
                                        title="Delete Subquest"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Subquest input */}
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const form = e.currentTarget;
                                  const input = form.elements.namedItem('subquestName') as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    addSubQuest(quest.id, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="flex gap-1.5 mt-2 max-w-sm"
                              >
                                <input
                                  type="text"
                                  name="subquestName"
                                  placeholder="Add subquest..."
                                  className="bg-zinc-900/50 border border-white/5 rounded px-2 py-0.5 text-[10px] text-zinc-300 focus:outline-none focus:border-cyan-500/50 flex-1 font-sans"
                                />
                                <button
                                  type="submit"
                                  className="bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white px-2 py-0.5 rounded text-[9px] font-mono hover:bg-zinc-800 transition-colors shrink-0"
                                >
                                  ADD
                                </button>
                              </form>
                            </div>

                            {/* Skills tags */}
                            {quest.relatedSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {quest.relatedSkills.map(sid => {
                                  const skill = state.skills.find(s => s.id === sid);
                                  return skill ? (
                                    <span key={sid} className="text-[9px] font-mono text-cyan-500">
                                      #{skill.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right side info & Actions */}
                        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                            +{quest.xp} XP
                          </span>
                          
                          <div className="flex items-center gap-1.5 mt-2">
                            {/* Edit */}
                            <button 
                              onClick={() => startEditingQuest(quest)}
                              className="text-zinc-500 hover:text-cyan-400 p-1 rounded hover:bg-white/5 transition-colors"
                              title="Edit directive"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            {/* Duplicate */}
                            <button 
                              onClick={() => duplicateQuest(quest.id)}
                              className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                              title="Duplicate directive"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            {/* Delete */}
                            <button 
                              onClick={() => deleteQuest(quest.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors"
                              title="Delete directive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {/* Fail Directive (Apply Penalty) */}
                            <button 
                              onClick={() => {
                                if (window.confirm(`Mark "${quest.name}" as FAILED? This will subtract XP and penalize your productivity momentum.`)) {
                                  failQuest(quest.id);
                                }
                              }}
                              className="text-zinc-500 hover:text-rose-600 p-1 rounded hover:bg-white/5 transition-colors"
                              title="Fail Directive (Apply Penalty)"
                            >
                              <Skull className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* GRAVEYARD OF LOST DIRECTIVES */}
            {state.quests.filter(q => q.status === 'Failed').length > 0 && (
              <div className="pt-4 border-t border-white/5 space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-[11px] font-mono text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Skull className="h-4 w-4 animate-pulse text-rose-500" />
                    GRAVEYARD_OF_LOST_DIRECTIVES
                  </h5>
                  <span className="text-[9px] font-mono text-zinc-500 bg-rose-950/20 border border-rose-500/10 px-1.5 py-0.5 rounded">
                    {state.quests.filter(q => q.status === 'Failed').length} FAILED
                  </span>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 animate-fadeIn">
                  {state.quests.filter(q => q.status === 'Failed').map(quest => {
                    let penaltyXp = 50;
                    if (quest.difficulty === 'Easy') penaltyXp = 25;
                    else if (quest.difficulty === 'Normal') penaltyXp = 50;
                    else if (quest.difficulty === 'Hard') penaltyXp = 100;
                    else if (quest.difficulty === 'Boss') penaltyXp = 250;
                    const isImportant = quest.important || quest.type === 'Main' || quest.type === 'Boss' || quest.difficulty === 'Hard' || quest.difficulty === 'Boss';
                    const finalPenaltyXp = Math.round(isImportant ? penaltyXp * 1.5 : penaltyXp);

                    return (
                      <div 
                        key={quest.id}
                        className="p-3 bg-rose-950/10 border border-rose-950/40 rounded-lg flex items-center justify-between gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[8px] font-mono text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase">
                              FAILED_DIRECTIVE
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase">
                              {quest.type}
                            </span>
                          </div>
                          <h6 className="font-sans text-xs font-semibold text-zinc-300 line-through truncate">
                            {quest.name}
                          </h6>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-rose-500">
                            -{finalPenaltyXp} XP
                          </span>
                          
                          <button
                            onClick={() => reopenQuest(quest.id)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-400 text-[10px] font-mono px-2 py-1 rounded transition-all uppercase"
                          >
                            Reattempt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* QUICK ADD QUEST FORM */}
          <div className="glass-panel rounded-lg p-5" id="quick-add-panel">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
              EXECUTE_NEW_QUEST_PROMPT
            </h4>
            
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    placeholder="Enter custom quest title..."
                    value={newQuestName}
                    onChange={(e) => setNewQuestName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  
                  <input
                    type="text"
                    placeholder="Enter optional quest description..."
                    value={newQuestDescription}
                    onChange={(e) => setNewQuestDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 px-4 py-3 rounded text-xs font-mono hover:bg-cyan-900 transition-colors flex items-center gap-1.5 self-stretch justify-center"
                >
                  <Plus className="h-3.5 w-3.5" />
                  LOG
                </button>
              </div>

              {/* Form Options Row */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-1">
                {/* Type Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Quest Category</label>
                  <select 
                    value={newQuestType}
                    onChange={(e) => setNewQuestType(e.target.value as QuestType)}
                    className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Main">Main Quest</option>
                    <option value="Side">Side Quest</option>
                    <option value="Boss">Boss Quest</option>
                    <option value="Recovery">Recovery Quest</option>
                    <option value="Habit">Habit Quest</option>
                    <option value="Optional">Optional Quest</option>
                  </select>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Difficulty</label>
                  <select 
                    value={newQuestDiff}
                    onChange={(e) => setNewQuestDiff(e.target.value as QuestDifficulty)}
                    className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Easy">Easy (50 XP)</option>
                    <option value="Normal">Normal (100 XP)</option>
                    <option value="Hard">Hard (200 XP)</option>
                    <option value="Boss">Boss (500 XP)</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Est. Duration (Min)</label>
                  <input 
                    type="number"
                    min="5"
                    max="480"
                    value={newQuestDuration}
                    onChange={(e) => setNewQuestDuration(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Recurrence Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Recurrence</label>
                  <select 
                    value={newQuestRecurrence}
                    onChange={(e) => setNewQuestRecurrence(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="None">Once Only</option>
                    <option value="Daily">🔁 Daily</option>
                    <option value="Weekly">🔁 Weekly</option>
                    <option value="Monthly">🔁 Monthly</option>
                  </select>
                </div>

                {/* Goal assignment */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Assign Goal</label>
                  <select 
                    value={newQuestGoal}
                    onChange={(e) => setNewQuestGoal(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded p-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="">No Assigned Goal</option>
                    {state.goals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Critical Directive Toggle */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Critical/Important</label>
                  <button
                    type="button"
                    onClick={() => setNewQuestImportant(!newQuestImportant)}
                    className={`w-full bg-zinc-950 border rounded p-1 text-xs font-mono transition-all duration-200 flex items-center justify-center gap-1 ${
                      newQuestImportant 
                        ? 'border-rose-500/50 text-rose-400 bg-rose-950/20' 
                        : 'border-white/10 text-zinc-500 hover:border-white/20'
                    }`}
                  >
                    {newQuestImportant ? '⚠️ YES' : 'NO'}
                  </button>
                </div>
              </div>

              {/* Skills assignment check */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5">Associate Skills</label>
                <div className="flex flex-wrap gap-1.5">
                  {state.skills.map(skill => {
                    const isSelected = newQuestSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill.id)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          isSelected 
                            ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30' 
                            : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: WORKLOAD ANALYTICS & CURRENT FOCUS */}
        <div className="space-y-6">
          
          {/* CURRENT FOCUS CARD */}
          <div className="glass-panel rounded-lg p-5" id="current-focus-card">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">CURRENT_FOCUS</span>
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
                  className="w-full bg-zinc-950 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
                
                <select 
                  value={focusGoal}
                  onChange={(e) => setFocusGoal(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
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
                    className="text-[10px] font-mono text-zinc-500 px-2 py-1"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-3 py-1 rounded hover:bg-cyan-900"
                  >
                    SAVE
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
                    <span className="text-[10px] font-mono text-zinc-500">🎯 LINKED TO:</span>
                    <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[200px]">
                      {state.goals.find(g => g.id === state.profile.focusGoalId)?.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TODAY'S WORKLOAD BLOCK */}
          <div className="glass-panel rounded-lg p-5 space-y-4" id="workload-panel">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider border-b border-white/5 pb-2">
              RESOURCE_WORKLOAD_REPORT
            </h4>

            <div className="space-y-4">
              {/* Today's Goal Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">CYCLE PROGRESS RATE</span>
                  <span className="text-white">{analytics.overallCompletionRate}%</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1">
                  <div 
                    className="bg-cyan-500 h-full rounded-full" 
                    style={{ width: `${analytics.overallCompletionRate}%` }}
                  />
                </div>
              </div>

              {/* Today's Skill XP */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">CYCLE EARNED XP</span>
                <span className="text-emerald-400 font-bold">+{analytics.todayXp} XP</span>
              </div>

              {/* Total active count */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">ACTIVE DIRECTIVES</span>
                <span className="text-white">{activeQuests.length}</span>
              </div>

              {/* Est XP Pending */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">ESTIMATED_PENDING_XP</span>
                <span className="text-cyan-400">
                  {activeQuests.reduce((sum, q) => sum + q.xp, 0)} XP
                </span>
              </div>

              {/* Estimated Time */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">ESTIMATED TIME BUDGET</span>
                <span className="text-white flex items-center gap-1">
                  <Clock className="h-3 w-3 text-zinc-400" />
                  {Math.round(analytics.totalActiveTime / 60 * 10) / 10} Hours
                </span>
              </div>

              {/* Workload Status Gauge */}
              <div className="p-3 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">SYSTEM_WORKLOAD</span>
                  <span className={`text-xs font-display font-bold uppercase mt-1 block ${
                    analytics.workloadStatus === 'Heavy Workload' ? 'text-rose-400' :
                    analytics.workloadStatus === 'Moderate Workload' ? 'text-amber-400' :
                    analytics.workloadStatus === 'No Workload' ? 'text-zinc-500' : 'text-emerald-400'
                  }`}>
                    {analytics.workloadStatus}
                  </span>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${
                  analytics.workloadStatus === 'Heavy Workload' ? 'bg-rose-500 animate-ping' :
                  analytics.workloadStatus === 'Moderate Workload' ? 'bg-amber-500' :
                  analytics.workloadStatus === 'No Workload' ? 'bg-zinc-700' : 'bg-emerald-500'
                }`} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
