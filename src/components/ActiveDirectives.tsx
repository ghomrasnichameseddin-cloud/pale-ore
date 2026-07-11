import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Quest, QuestDifficulty, QuestType, QuestRecurrence } from '../types';
import { 
  Circle, CheckCircle2, Trash2, Edit3, Save, X, Skull, 
  Calendar, SkipForward, Play, Pause, Clock, Timer, 
  AlertTriangle, Copy, Ban, Check, ArrowLeft, Terminal, Sliders, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ActiveDirectives: React.FC = () => {
  const { 
    state, updateQuest, completeQuest, reopenQuest, failQuest, deleteQuest, duplicateQuest,
    addSubQuest, toggleSubQuest, deleteSubQuest,
    startFocusSession, activeFocusSession, stopFocusSession,
    isQuestFinishedForToday,
    systemDate
  } = usePOS();

  const [showTomorrowQuests, setShowTomorrowQuests] = useState(false);
  const [focusChoiceQuestId, setFocusChoiceQuestId] = useState<string | null>(null);
  const [energyFilter, setEnergyFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [terminalTab, setTerminalTab] = useState<'today' | 'deferred'>('today');

  // Quest Editing State
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editQuestName, setEditQuestName] = useState('');
  const [editQuestDiff, setEditQuestDiff] = useState<QuestDifficulty>('Normal');
  const [editQuestType, setEditQuestType] = useState<QuestType>('Main');
  const [editQuestXp, setEditQuestXp] = useState<number>(100);
  const [editQuestGoal, setEditQuestGoal] = useState<string>('');
  const [editQuestRecurrence, setEditQuestRecurrence] = useState<QuestRecurrence | 'Custom'>('None');
  const [editQuestImportant, setEditQuestImportant] = useState(false);
  const [editQuestDescription, setEditQuestDescription] = useState('');
  const [editQuestEnergy, setEditQuestEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editQuestDeadline, setEditQuestDeadline] = useState('');

  // Custom recurrence edit states
  const [editCustomRecurrenceType, setEditCustomRecurrenceType] = useState<'days' | 'weekdays' | 'text'>('days');
  const [editCustomRecurrenceDays, setEditCustomRecurrenceDays] = useState<number>(3);
  const [editCustomRecurrenceWeekdays, setEditCustomRecurrenceWeekdays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [editCustomRecurrenceText, setEditCustomRecurrenceText] = useState<string>('Every month');

  const startEditingQuest = (quest: Quest) => {
    setEditingQuestId(quest.id);
    setEditQuestName(quest.name);
    setEditQuestDiff(quest.difficulty);
    setEditQuestType(quest.type);
    setEditQuestXp(quest.xp);
    setEditQuestGoal(quest.goalId || '');
    setEditQuestImportant(quest.important || false);
    setEditQuestDescription(quest.description || '');
    setEditQuestEnergy(quest.energyLevel || 'Medium');
    setEditQuestDeadline(quest.deadline || '');

    const rec = quest.recurrence || 'None';
    if (rec.startsWith('Custom:')) {
      setEditQuestRecurrence('Custom');
      const content = rec.replace('Custom:', '').trim();
      if (content.startsWith('Every ') && content.endsWith(' Days')) {
        setEditCustomRecurrenceType('days');
        const num = parseInt(content.replace('Every', '').replace('Days', '').trim());
        setEditCustomRecurrenceDays(isNaN(num) ? 3 : num);
      } else if (content.includes(',') || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].some(d => content.includes(d))) {
        setEditCustomRecurrenceType('weekdays');
        setEditCustomRecurrenceWeekdays(content.split(',').map(s => s.trim()));
      } else {
        setEditCustomRecurrenceType('text');
        setEditCustomRecurrenceText(content);
      }
    } else {
      setEditQuestRecurrence(rec as any);
    }
  };

  const handleSaveQuestEdit = (id: string) => {
    let finalRecurrence: QuestRecurrence = 'None';
    if (editQuestRecurrence === 'Custom') {
      if (editCustomRecurrenceType === 'days') {
        finalRecurrence = `Custom: Every ${editCustomRecurrenceDays} Days`;
      } else if (editCustomRecurrenceType === 'weekdays') {
        finalRecurrence = `Custom: ${editCustomRecurrenceWeekdays.join(', ')}`;
      } else {
        finalRecurrence = `Custom: ${editCustomRecurrenceText}`;
      }
    } else {
      finalRecurrence = editQuestRecurrence;
    }

    updateQuest(id, {
      name: editQuestName,
      difficulty: editQuestDiff,
      type: editQuestType,
      xp: editQuestXp,
      goalId: editQuestGoal ? editQuestGoal : null,
      recurrence: finalRecurrence,
      important: editQuestImportant,
      description: editQuestDescription,
      energyLevel: editQuestEnergy,
      deadline: editQuestDeadline ? editQuestDeadline : null
    });
    setEditingQuestId(null);
  };

  // Filter by Recovery Mode if active
  const baseQuests = state.quests.filter(q => {
    if (state.profile.recoveryMode) {
      return q.type === 'Recovery' || q.type === 'Optional';
    }
    return true;
  });

  const todayStr = systemDate;

  // 1. Today's quests: Active & (No deadline OR deadline <= todayStr) OR Completed today
  const todayQuests = baseQuests.filter(q => {
    const isFinished = isQuestFinishedForToday(q);
    const matchesEnergy = energyFilter === 'All' || q.energyLevel === energyFilter;
    if (!matchesEnergy) return false;

    if (isFinished) {
       return q.status !== 'Failed'; // Show completed today, exclude fails
    }
    return q.status === 'Active' && (!q.deadline || q.deadline <= todayStr);
  });

  // 2. Tomorrow & Postponed quests: Active & deadline > todayStr, plus completed recurring quests (queued for tomorrow)
  const tomorrowPostponedQuests = baseQuests.filter(q => {
    const isFinished = isQuestFinishedForToday(q);
    const isRecurring = q.recurrence && q.recurrence !== 'None';
    const matchesEnergy = energyFilter === 'All' || q.energyLevel === energyFilter;
    if (!matchesEnergy) return false;
    
    if (isFinished) {
      // Completed recurring quests are queued for tomorrow/future cycles in the defer console
      return isRecurring;
    }
    
    return q.status === 'Active' && q.deadline && q.deadline > todayStr;
  });

  // Calculate tomorrow's string
  const getTomorrowStr = () => {
    try {
      const tomorrow = new Date(systemDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } catch (e) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  };

  const handleMoveToTomorrow = (questId: string) => {
    const tomorrowStr = getTomorrowStr();
    updateQuest(questId, { deadline: tomorrowStr });
  };

  const handleMoveToToday = (questId: string) => {
    updateQuest(questId, { deadline: null });
  };

  const renderQuestCard = (quest: Quest, isDeferred: boolean) => {
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
          className="p-4 bg-zinc-950 border border-cyan-500/30 rounded-lg space-y-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Cpu className="h-3 w-3 animate-spin" /> CHANGE_DIRECTIVE_PARAMETERS
            </span>
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
                  <option value="Every 2 Days">🔁 Every 2 Days</option>
                  <option value="Weekly">🔁 Weekly</option>
                  <option value="Monthly">🔁 Monthly</option>
                  <option value="Custom">⚙️ Custom...</option>
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

            {editQuestRecurrence === 'Custom' && (
              <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg space-y-3 mt-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {(['days', 'weekdays', 'text'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditCustomRecurrenceType(type)}
                      className={`py-1 text-[9px] font-mono rounded border uppercase transition-all ${
                        editCustomRecurrenceType === type 
                          ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400 font-bold' 
                          : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {editCustomRecurrenceType === 'days' && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-sans">Repeat every</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="365"
                      value={editCustomRecurrenceDays}
                      onChange={(e) => setEditCustomRecurrenceDays(Number(e.target.value))}
                      className="w-16 bg-zinc-950 border border-white/10 rounded px-2 py-0.5 text-white text-center font-mono text-xs"
                    />
                    <span className="text-zinc-400 font-sans">days</span>
                  </div>
                )}

                {editCustomRecurrenceType === 'weekdays' && (
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const isSelected = editCustomRecurrenceWeekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setEditCustomRecurrenceWeekdays(prev => 
                              prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                            );
                          }}
                          className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all ${
                            isSelected 
                              ? 'bg-cyan-950 border-cyan-500/30 text-cyan-400 font-bold' 
                              : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}

                {editCustomRecurrenceType === 'text' && (
                  <div>
                    <input 
                      type="text"
                      value={editCustomRecurrenceText}
                      onChange={(e) => setEditCustomRecurrenceText(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
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
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Energy Req</label>
                <select 
                  value={editQuestEnergy}
                  onChange={(e) => setEditQuestEnergy(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-zinc-300"
                >
                  <option value="Low">⚡ Low</option>
                  <option value="Medium">⚡⚡ Medium</option>
                  <option value="High">⚡⚡⚡ High</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Target Date</label>
                <input 
                  type="date"
                  value={editQuestDeadline}
                  onChange={(e) => setEditQuestDeadline(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-1 text-xs text-white font-mono"
                />
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

    const finished = isQuestFinishedForToday(quest);

    return (
      <motion.div
        key={quest.id}
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: isDeferred ? 10 : -10 }}
        transition={{ duration: 0.2 }}
        className={`p-3.5 bg-zinc-950/70 border rounded-lg flex flex-col gap-3 hover:bg-zinc-950/90 transition-all ${
          finished 
            ? 'border-emerald-500/20 bg-emerald-950/5' 
            : isDeferred 
              ? 'border-amber-500/10 hover:border-amber-500/25' 
              : 'border-white/5 hover:border-cyan-500/20'
        }`}
      >
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Completion Checkbox */}
            <button 
              onClick={() => {
                if (finished) {
                  reopenQuest(quest.id);
                } else {
                  completeQuest(quest.id);
                }
              }}
              className={`mt-0.5 transition-colors shrink-0 ${
                finished ? 'text-emerald-400 hover:text-zinc-500' : 'text-zinc-500 hover:text-emerald-400'
              }`}
              title={finished ? "Reopen Quest" : "Complete Quest"}
            >
              {finished ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Important Badge */}
                {(quest.important || quest.type === 'Main' || quest.type === 'Boss') && (
                  <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                    ⚠️ CRITICAL
                  </span>
                )}

                {/* Difficulty Badge */}
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                  quest.difficulty === 'Easy' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50' :
                  quest.difficulty === 'Normal' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/10' :
                  quest.difficulty === 'Hard' ? 'bg-purple-950/30 text-purple-400 border border-purple-500/10' :
                  'bg-rose-950/40 text-rose-400 border border-rose-500/20 font-bold animate-pulse'
                }`}>
                  {quest.difficulty}
                </span>

                {/* Energy Req Badge */}
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                  quest.energyLevel === 'Low' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' :
                  quest.energyLevel === 'High' ? 'bg-amber-950/20 text-amber-400 border border-amber-500/15' :
                  'bg-zinc-800 text-zinc-300 border border-zinc-700/50'
                }`}>
                  ⚡ {quest.energyLevel || 'Medium'}
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

                {/* Goal Relation */}
                {matchedGoal && (
                  <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[150px] bg-zinc-900/50 px-1.5 py-0.5 rounded">
                    🎯 {matchedGoal.name}
                  </span>
                )}

                {/* Deadline indicator */}
                {quest.deadline && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isDeferred 
                      ? 'text-amber-400 bg-amber-950/40 border border-amber-500/20' 
                      : 'text-zinc-400 bg-zinc-900 border border-white/5'
                  }`}>
                    📅 {isDeferred ? `POSTPONED (${quest.deadline})` : `DUE: ${quest.deadline}`}
                  </span>
                )}

                {/* Recurring Queued indicator */}
                {isDeferred && finished && quest.recurrence && quest.recurrence !== 'None' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold text-amber-400 bg-amber-950/45 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    ⚡ QUEUED_NEXT_CYCLE
                  </span>
                )}
              </div>

              <h5 className={`font-sans text-sm font-semibold leading-tight mt-1 ${
                finished ? 'line-through text-zinc-500' : 'text-white'
              }`}>
                {quest.name}
              </h5>

              {quest.description && (
                <p className="text-xs text-zinc-400 font-sans mt-1 whitespace-pre-wrap leading-relaxed">
                  {quest.description}
                </p>
              )}

              {/* Estimated time display */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mt-1">
                <Clock className="h-3 w-3 text-zinc-500" />
                <span>EST: {quest.estimatedTime}m</span>
              </div>

              {/* Subquests Section */}
              <div className="mt-3 space-y-2 border-l border-zinc-800 pl-3">
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
            </div>
          </div>

          {/* Right XP details & Actions */}
          <div className="flex flex-col items-end justify-between self-stretch shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
              +{quest.xp} XP
            </span>

            <div className="flex items-center gap-1 mt-3">
              {/* Pomodoro Focus Launcher Option */}
              {!finished && (
                <button
                  onClick={() => setFocusChoiceQuestId(focusChoiceQuestId === quest.id ? null : quest.id)}
                  className={`p-1 rounded border transition-colors flex items-center justify-center ${
                    focusChoiceQuestId === quest.id
                      ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
                      : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:border-white/10 hover:text-cyan-400'
                  }`}
                  title="Start Focus Timer (Pomodoro)"
                >
                  <Timer className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Move to Tomorrow or Move to Today */}
              {isDeferred ? (
                !finished && (
                  <button
                    onClick={() => handleMoveToToday(quest.id)}
                    className="p-1 rounded bg-amber-950/20 border border-amber-500/30 text-amber-400 hover:bg-amber-900/30 transition-colors flex items-center justify-center font-bold"
                    title="Accelerate: Move to Today"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                )
              ) : (
                !finished && (
                  <button
                    onClick={() => handleMoveToTomorrow(quest.id)}
                    className="p-1 rounded bg-zinc-900/40 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-amber-400 transition-colors flex items-center justify-center"
                    title="Postpone to Tomorrow"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </button>
                )
              )}

              {/* Won't Do / Fail Task (Activate Penalty) */}
              {!finished && (
                <button
                  onClick={() => {
                    if (window.confirm(`Mark "${quest.name}" as "Won't Do"? It will fail the quest, skip it, and activate an operational XP/momentum penalty.`)) {
                      failQuest(quest.id);
                    }
                  }}
                  className="p-1 rounded bg-zinc-900/40 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-rose-500 transition-colors flex items-center justify-center font-bold"
                  title="Won't Do (Skip and Penalize)"
                >
                  <Ban className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Edit */}
              <button 
                onClick={() => startEditingQuest(quest)}
                className="p-1 rounded bg-zinc-900/40 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-cyan-400 transition-colors"
                title="Edit directive"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>

              {/* Duplicate */}
              <button 
                onClick={() => duplicateQuest(quest.id)}
                className="p-1 rounded bg-zinc-900/40 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-white transition-colors"
                title="Duplicate directive"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>

              {/* Delete */}
              <button 
                onClick={() => deleteQuest(quest.id)}
                className="p-1 rounded bg-zinc-900/40 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-rose-400 transition-colors"
                title="Delete directive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Focus / Pomodoro Mode Selector */}
        {focusChoiceQuestId === quest.id && (
          <div className="p-3 bg-zinc-950/90 border border-cyan-500/20 rounded-lg space-y-2 animate-fadeIn max-w-lg">
            <div className="flex justify-between items-center pb-1 border-b border-white/5">
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                LAUNCH_POMODORO_FOCUS
              </span>
              <button
                onClick={() => setFocusChoiceQuestId(null)}
                className="text-zinc-600 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 font-sans">
              Estimated task completion time is <span className="font-mono text-white font-bold">{quest.estimatedTime}m</span>. Choose your Pomodoro configuration:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  startFocusSession(quest.id, 25, 5);
                  setFocusChoiceQuestId(null);
                }}
                className="p-2.5 bg-cyan-950/20 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-500/40 rounded text-left transition-all"
              >
                <span className="text-xs font-bold text-cyan-400 block font-mono">25 Min Work + 5 Min Rest</span>
                <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">
                  Recommended: {Math.ceil(quest.estimatedTime / 25)} Focus Cycles
                </span>
              </button>

              <button
                onClick={() => {
                  startFocusSession(quest.id, 50, 10);
                  setFocusChoiceQuestId(null);
                }}
                className="p-2.5 bg-cyan-950/20 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-500/40 rounded text-left transition-all"
              >
                <span className="text-xs font-bold text-cyan-400 block font-mono">50 Min Work + 10 Min Rest</span>
                <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">
                  Recommended: {Math.ceil(quest.estimatedTime / 50)} Focus Cycles
                </span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4" id="active-quests-panel">
      {/* Active Focus Session Banner (if running) */}
      {activeFocusSession && (
        <div className="glass-panel border-cyan-500/30 bg-cyan-950/10 p-4 rounded-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden" id="pomodoro-focus-panel-directives">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334407_1px,transparent_1px)] pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 rounded-lg animate-pulse">
                <Timer className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold uppercase tracking-wider">
                    {activeFocusSession.mode === 'work' ? '🟢 WORK FOCUS' : '🟡 REST PHASE'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    CYCLE {activeFocusSession.completedCycles + 1} OF {activeFocusSession.estimatedCycles}
                  </span>
                </div>
                <h5 className="text-xs font-sans font-bold text-white mt-1">
                  Focusing: <span className="text-cyan-300">"{activeFocusSession.questName}"</span>
                </h5>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="font-mono text-xl md:text-2xl font-bold text-white tracking-wider">
                {String(Math.floor(activeFocusSession.timeLeft / 60)).padStart(2, '0')}:{String(activeFocusSession.timeLeft % 60).padStart(2, '0')}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (window.confirm("Complete the associated quest now? This will award standard XP and stop the focus timer.")) {
                      completeQuest(activeFocusSession.questId);
                      stopFocusSession();
                    }
                  }}
                  className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-mono transition-colors"
                  title="Complete Quest"
                >
                  COMPLETE
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to abort this focus session?")) {
                      stopFocusSession();
                    }
                  }}
                  className="p-1 bg-rose-950/40 hover:bg-rose-950 border border-rose-500/20 rounded text-rose-400"
                  title="Stop Focus"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy 2: Adaptive Load Energy Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-zinc-950/45 border border-white/5 rounded-lg gap-3">
        <div className="flex items-center gap-2.5">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
            ADAPTIVE_LOAD_ENERGY_LEVEL_FILTER:
          </span>
        </div>
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Low', 'Medium', 'High'] as const).map(level => (
            <button
              key={level}
              onClick={() => setEnergyFilter(level)}
              className={`px-3 py-1 text-[10px] font-mono rounded border transition-all duration-200 uppercase whitespace-nowrap ${
                energyFilter === level
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.1)] font-bold'
                  : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              {level === 'All' ? '🌌 ALL_LOAD' : level === 'Low' ? '⚡ LOW' : level === 'Medium' ? '⚡⚡ MED' : '⚡⚡⚡ HIGH'}
            </button>
          ))}
        </div>
      </div>

      {/* COMPACTED UNIFIED TERMINAL CONSOLE */}
      <div 
        className={`glass-panel rounded-lg p-5 border transition-all duration-300 relative overflow-hidden flex flex-col h-[550px] ${
          terminalTab === 'today'
            ? 'border-cyan-500/20 bg-zinc-950/45 shadow-[0_0_20px_rgba(6,182,212,0.03)]'
            : 'border-amber-500/20 bg-zinc-950/45 shadow-[0_0_20px_rgba(245,158,11,0.02)]'
        }`} 
        id="unified-terminal"
      >
        <div className={`absolute inset-0 pointer-events-none bg-[size:100%_4px] transition-all duration-300 ${
          terminalTab === 'today'
            ? 'bg-[linear-gradient(to_bottom,rgba(6,182,212,0.01)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_bottom,rgba(245,158,11,0.01)_1px,transparent_1px)]'
        }`} />
        
        {/* Terminal Header with Window Controls & Styled Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-white/10 mb-4 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            {/* Terminal OS window indicator dots */}
            <div className="flex items-center gap-1.5 mr-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            
            {/* Embedded interactive tab toggles */}
            <div className="flex bg-zinc-900/90 p-0.5 rounded border border-white/5 shrink-0">
              <button
                onClick={() => setTerminalTab('today')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono rounded uppercase transition-all duration-150 ${
                  terminalTab === 'today'
                    ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.05)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Terminal className="h-3 w-3" />
                SYS_ACTIVE_TODAY
              </button>
              <button
                onClick={() => setTerminalTab('deferred')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono rounded uppercase transition-all duration-150 ${
                  terminalTab === 'deferred'
                    ? 'bg-amber-950 text-amber-400 font-bold border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Calendar className="h-3 w-3" />
                SYS_DEFERRED_QUEUE
              </button>
            </div>
          </div>

          {/* Dynamic state monitor badge */}
          {terminalTab === 'today' ? (
            <div className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide">
              ONLINE_FLOW: {todayQuests.filter(q => !isQuestFinishedForToday(q)).length} ACTIVE
            </div>
          ) : (
            <div className="text-[10px] font-mono text-amber-400/80 bg-amber-950/30 border border-amber-500/15 px-2 py-0.5 rounded uppercase font-bold tracking-wide">
              QUEUED: {tomorrowPostponedQuests.length} DEFERRED
            </div>
          )}
        </div>

        {/* Dynamic Body Log description box */}
        {terminalTab === 'today' ? (
          <div className="bg-zinc-900/60 border border-white/5 rounded px-3 py-2 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
            <span className="text-cyan-400/80">root@pos-os:~#</span> cat /sys/today_operational_log<br/>
            Running daily operational protocol. Completed objectives archive below.
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-white/5 rounded px-3 py-2 text-[10px] font-mono text-zinc-500 mb-4 shrink-0 leading-relaxed">
            <span className="text-amber-500/80">root@pos-os:~#</span> cat /sys/deferred_queue_log<br/>
            Operational objectives postponed to future cycles. Click &lt;Accelerate&gt; to pull back.
          </div>
        )}

        {/* Dynamic unified Quest list scroll region */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800">
          {terminalTab === 'today' ? (
            todayQuests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-cyan-500/10 rounded-lg">
                <Terminal className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-zinc-500 font-mono">NO ACTIVE DIRECTIVES LOGGED FOR THIS CYCLE</p>
                <p className="text-[9px] text-zinc-600 font-mono mt-1">Use top CLI prompt to register a new directive.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {todayQuests.map(q => renderQuestCard(q, false))}
              </AnimatePresence>
            )
          ) : (
            tomorrowPostponedQuests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-amber-500/10 rounded-lg">
                <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-zinc-500 font-mono">NO OBJECTIVES DELAYED OR POSTPONED</p>
                <p className="text-[9px] text-zinc-600 font-mono mt-1">Postpone any active task to defer execution load.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {tomorrowPostponedQuests.map(q => renderQuestCard(q, true))}
              </AnimatePresence>
            )
          )}
        </div>
      </div>
    </div>
  );
};
