import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Goal, GoalStatus, GoalPriority, Project, Milestone, Quest, QuestDifficulty, QuestType, QuestRecurrence } from '../types';
import { 
  Target, Calendar, AlertCircle, Trash2, Plus, Edit3, 
  Play, Pause, Archive, CheckCircle, Clock, BookOpen, BarChart2, History,
  ChevronRight, ArrowRight, GitFork, Link2, Copy, Move, ArrowUpRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

export const GoalsView: React.FC = () => {
  const { 
    state, addGoal, updateGoal, deleteGoal, clearAllGoals,
    addSubGoal, updateSubGoal, toggleSubGoal, deleteSubGoal,
    addProject, updateProject, deleteProject,
    addMilestone, updateMilestone, deleteMilestone,
    addQuest, updateQuest, deleteQuest, completeQuest, reopenQuest,
    duplicateQuest, splitQuest, mergeQuests,
    getGoalProgress, getProjectProgress, getMilestoneProgress, getSkillXpAndLevel,
    systemDate
  } = usePOS();

  // Selected Goal ID
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(state.goals[0]?.id || null);
  
  // Editing SubGoal States
  const [editingSubGoalId, setEditingSubGoalId] = useState<string | null>(null);
  const [editSubGoalName, setEditSubGoalName] = useState('');
  const [editSubGoalDate, setEditSubGoalDate] = useState('');
  
  // Empty all goals confirmation state
  const [showEmptyGoalsConfirm, setShowEmptyGoalsConfirm] = useState(false);
  
  // Create Goal States
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<GoalPriority>('Medium');
  const [newGoalHorizon, setNewGoalHorizon] = useState<'30-Day Sprint' | 'Quarterly (Q1-Q4)' | 'Annual Vision' | 'Life Vision'>('Quarterly (Q1-Q4)');
  const [newGoalEstDate, setNewGoalEstDate] = useState('');
  const [newGoalSkills, setNewGoalSkills] = useState<string[]>([]);

  // Editing Goal States
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalName, setEditGoalName] = useState('');
  const [editGoalDesc, setEditGoalDesc] = useState('');
  const [editGoalPriority, setEditGoalPriority] = useState<GoalPriority>('Medium');
  const [editGoalHorizon, setEditGoalHorizon] = useState<'30-Day Sprint' | 'Quarterly (Q1-Q4)' | 'Annual Vision' | 'Life Vision'>('Quarterly (Q1-Q4)');
  const [editGoalEstDate, setEditGoalEstDate] = useState('');

  // Sub-tabs in Goal Detail Pane
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'projects' | 'quests' | 'skills'>('overview');

  // Create Project States
  const [newProjName, setNewProjName] = useState('');
  const [newProjEstTime, setNewProjEstTime] = useState('10 hours');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Create Milestone States
  const [newMileName, setNewMileName] = useState('');
  const [newMileProjId, setNewMileProjId] = useState('');

  // Create SubGoal States
  const [newSubGoalInput, setNewSubGoalInput] = useState('');
  const [newSubGoalDate, setNewSubGoalDate] = useState('');

  const handleAddSubGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !newSubGoalInput.trim()) return;
    addSubGoal(selectedGoal.id, newSubGoalInput, newSubGoalDate || undefined);
    setNewSubGoalInput('');
    setNewSubGoalDate('');
  };

  // Create Quest States (assigned to Goal)
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestDiff, setNewQuestDiff] = useState<QuestDifficulty>('Normal');
  const [newQuestType, setNewQuestType] = useState<QuestType>('Main');
  const [newQuestProj, setNewQuestProj] = useState('');
  const [newQuestMile, setNewQuestMile] = useState('');
  const [newQuestTime, setNewQuestTime] = useState<number>(45);
  const [newQuestRecurrence, setNewQuestRecurrence] = useState<QuestRecurrence>('None');

  // Advanced Quest Actions States
  const [splitQuestId, setSplitQuestId] = useState<string | null>(null);
  const [splitNameA, setSplitNameA] = useState('');
  const [splitNameB, setSplitNameB] = useState('');
  const [splitRatio, setSplitRatio] = useState<number>(0.5);

  const [mergeQuestIdA, setMergeQuestIdA] = useState<string | null>(null);
  const [mergeQuestIdB, setMergeQuestIdB] = useState('');
  const [mergedName, setMergedName] = useState('');
  const [mergedDesc, setMergedDesc] = useState('');

  const [moveQuestId, setMoveQuestId] = useState<string | null>(null);
  const [moveTargetGoalId, setMoveTargetGoalId] = useState('');
  const [moveTargetProjId, setMoveTargetProjId] = useState('');
  const [moveTargetMileId, setMoveTargetMileId] = useState('');

  // Quest Editing States
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editQuestName, setEditQuestName] = useState('');
  const [editQuestDiff, setEditQuestDiff] = useState<QuestDifficulty>('Normal');
  const [editQuestType, setEditQuestType] = useState<QuestType>('Main');
  const [editQuestXp, setEditQuestXp] = useState<number>(100);
  const [editQuestProj, setEditQuestProj] = useState('');
  const [editQuestMile, setEditQuestMile] = useState('');
  const [editQuestRecurrence, setEditQuestRecurrence] = useState<QuestRecurrence>('None');
  const [editQuestDeadline, setEditQuestDeadline] = useState<string>('');
  const [editQuestSkills, setEditQuestSkills] = useState<string[]>([]);

  const handleEditSkillToggle = (skillId: string) => {
    setEditQuestSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const startEditingQuest = (quest: Quest) => {
    setEditingQuestId(quest.id);
    setEditQuestName(quest.name);
    setEditQuestDiff(quest.difficulty);
    setEditQuestType(quest.type);
    setEditQuestXp(quest.xp);
    setEditQuestProj(quest.projectId || '');
    setEditQuestMile(quest.milestoneId || '');
    setEditQuestRecurrence(quest.recurrence || 'None');
    setEditQuestDeadline(quest.deadline || '');
    setEditQuestSkills(quest.relatedSkills || []);
  };

  const handleSaveQuestEdit = (id: string) => {
    updateQuest(id, {
      name: editQuestName,
      difficulty: editQuestDiff,
      type: editQuestType,
      xp: editQuestXp,
      projectId: editQuestProj ? editQuestProj : null,
      milestoneId: editQuestMile ? editQuestMile : null,
      recurrence: editQuestRecurrence,
      deadline: editQuestDeadline ? editQuestDeadline : null,
      relatedSkills: editQuestSkills
    });
    setEditingQuestId(null);
  };

  const selectedGoal = state.goals.find(g => g.id === selectedGoalId);

  // Status mapping with RPG theme
  const statusColors = {
    'Active': 'text-[#e5c875] bg-[#3a2e12] border-[#c5a059]/40',
    'Paused': 'text-amber-300 bg-amber-950/60 border-amber-500/40',
    'Planned': 'text-purple-300 bg-purple-950/60 border-purple-500/40',
    'Completed': 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
    'Archived': 'text-zinc-500 bg-[#07080c] border-zinc-800'
  };

  const statusIcons = {
    'Active': '✧',
    'Paused': '⏸',
    'Planned': '✦',
    'Completed': '✓',
    'Archived': '⊘'
  };

  // Handle Goal Creation
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    const id = addGoal({
      name: newGoalName,
      description: newGoalDesc,
      status: 'Active',
      priority: newGoalPriority,
      horizon: newGoalHorizon,
      relatedSkills: newGoalSkills,
      estimatedCompletion: newGoalEstDate || 'No deadline specified'
    });

    setNewGoalName('');
    setNewGoalDesc('');
    setNewGoalEstDate('');
    setNewGoalSkills([]);
    setShowCreateGoal(false);
    setSelectedGoalId(id);
  };

  // Start Editing Goal
  const startEditing = () => {
    if (!selectedGoal) return;
    setEditGoalName(selectedGoal.name);
    setEditGoalDesc(selectedGoal.description);
    setEditGoalPriority(selectedGoal.priority);
    setEditGoalHorizon((selectedGoal.horizon as any) || 'Quarterly (Q1-Q4)');
    setEditGoalEstDate(selectedGoal.estimatedCompletion);
    setIsEditingGoal(true);
  };

  // Save Goal Edits
  const handleSaveGoalEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !editGoalName.trim()) return;

    updateGoal(selectedGoalId, {
      name: editGoalName,
      description: editGoalDesc,
      priority: editGoalPriority,
      horizon: editGoalHorizon,
      estimatedCompletion: editGoalEstDate
    });
    setIsEditingGoal(false);
  };

  // Create Project Belonging to Selected Goal
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !newProjName.trim()) return;

    addProject({
      goalId: selectedGoalId,
      name: newProjName,
      status: 'Active',
      estimatedTime: newProjEstTime,
      description: newProjDesc
    });

    setNewProjName('');
    setNewProjEstTime('10 hours');
    setNewProjDesc('');
  };

  // Create Milestone Belonging to Selected Goal
  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !newMileName.trim() || !newMileProjId) return;

    addMilestone({
      projectId: newMileProjId,
      goalId: selectedGoalId,
      name: newMileName,
      status: 'Active'
    });

    setNewMileName('');
    setNewMileProjId('');
  };

  // Create Quest Belonging to Selected Goal
  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !newQuestName.trim()) return;

    let xp = 100;
    if (newQuestDiff === 'Easy') xp = 50;
    else if (newQuestDiff === 'Normal') xp = 100;
    else if (newQuestDiff === 'Hard') xp = 200;
    else if (newQuestDiff === 'Boss') xp = 500;

    addQuest({
      name: newQuestName,
      description: `Directive mapped to ${selectedGoal?.name}.`,
      difficulty: newQuestDiff,
      estimatedTime: newQuestTime,
      xp,
      goalId: selectedGoalId,
      projectId: newQuestProj ? newQuestProj : null,
      milestoneId: newQuestMile ? newQuestMile : null,
      relatedSkills: selectedGoal?.relatedSkills || [],
      type: newQuestType,
      recurrence: newQuestRecurrence,
      deadline: null
    });

    setNewQuestName('');
    setNewQuestProj('');
    setNewQuestMile('');
    setNewQuestTime(45);
    setNewQuestRecurrence('None');
  };

  // Delete Current Goal
  const handleDeleteGoal = () => {
    if (!selectedGoalId) return;
    deleteGoal(selectedGoalId);
    
    const remaining = state.goals.filter(g => g.id !== selectedGoalId);
    setSelectedGoalId(remaining[0]?.id || null);
  };

  // Handle Purge/Empty All Goals
  const handleEmptyAllGoals = () => {
    clearAllGoals();
    setSelectedGoalId(null);
    setShowEmptyGoalsConfirm(false);
  };

  // Handle Split Quest
  const triggerSplit = (quest: Quest) => {
    setSplitQuestId(quest.id);
    setSplitNameA(`${quest.name} (Part 1)`);
    setSplitNameB(`${quest.name} (Part 2)`);
    setSplitRatio(0.5);
  };

  const executeSplit = () => {
    if (!splitQuestId) return;
    splitQuest(splitQuestId, splitNameA, splitNameB, splitRatio);
    setSplitQuestId(null);
  };

  // Handle Merge Quest
  const triggerMerge = (quest: Quest) => {
    setMergeQuestIdA(quest.id);
    setMergedName(`${quest.name} (Merged)`);
    setMergedDesc(quest.description);
    setMergeQuestIdB('');
  };

  const executeMerge = () => {
    if (!mergeQuestIdA || !mergeQuestIdB) return;
    mergeQuests(mergeQuestIdA, mergeQuestIdB, mergedName, mergedDesc);
    setMergeQuestIdA(null);
  };

  // Handle Move Quest
  const triggerMove = (quest: Quest) => {
    setMoveQuestId(quest.id);
    setMoveTargetGoalId(quest.goalId || '');
    setMoveTargetProjId(quest.projectId || '');
    setMoveTargetMileId(quest.milestoneId || '');
  };

  const executeMove = () => {
    if (!moveQuestId) return;
    updateQuest(moveQuestId, {
      goalId: moveTargetGoalId || null,
      projectId: moveTargetProjId || null,
      milestoneId: moveTargetMileId || null
    });
    setMoveQuestId(null);
  };

  // Derived Goal-specific fields
  const goalProjects = selectedGoal ? state.projects.filter(p => p.goalId === selectedGoal.id) : [];
  const goalMilestones = selectedGoal ? state.milestones.filter(m => m.goalId === selectedGoal.id) : [];
  const goalQuests = selectedGoal ? state.quests.filter(q => q.goalId === selectedGoal.id) : [];
  const goalXpEarned = goalQuests.filter(q => q.status === 'Completed').reduce((sum, q) => sum + q.xp, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="goals-view-root">
      
      {/* LEFT PANEL: GOAL SELECTOR & CREATOR */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#c5a059]/20">
          <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
            DESTINIES ({state.goals.length})
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setShowCreateGoal(!showCreateGoal); setShowEmptyGoalsConfirm(false); }}
              className="text-xs font-mono bg-[#3a2e12] border border-[#c5a059]/40 hover:border-[#c5a059] text-[#fef08a] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <Plus className="h-3 w-3" />
              NEW
            </button>
            {state.goals.length > 0 && (
              <button 
                onClick={() => { setShowEmptyGoalsConfirm(!showEmptyGoalsConfirm); setShowCreateGoal(false); }}
                className="text-xs font-mono bg-rose-950/60 border border-rose-500/30 hover:border-rose-500 text-rose-300 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                EMPTY
              </button>
            )}
          </div>
        </div>

        {/* Empty All Goals Confirmation */}
        {showEmptyGoalsConfirm && (
          <div className="p-4 bg-[#1a0808] border border-rose-500/30 rounded-xl space-y-3">
            <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1 font-bold">
              <Trash2 className="h-3 w-3" /> PURGE ALL GOALS
            </h4>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Are you sure you want to empty all goals? This clears all existing goals, projects, and milestones, and unlinks them from quests. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowEmptyGoalsConfirm(false)}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                CANCEL
              </button>
              <button 
                type="button" 
                onClick={handleEmptyAllGoals}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold px-3 py-1.5 rounded cursor-pointer"
              >
                CONFIRM_PURGE
              </button>
            </div>
          </div>
        )}

        {/* Goal Creator Form */}
        {showCreateGoal && (
          <form onSubmit={handleCreateGoal} className="p-4 bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl space-y-3 shadow-xl">
            <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              ESTABLISH_NEW_DESTINY
            </h4>
            
            <div>
              <label className="block text-[10px] font-mono text-[#c5a059] uppercase mb-1 font-bold">Goal Name</label>
              <input 
                type="text" 
                placeholder="e.g. Master Islamic Geometric Art..."
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Description</label>
              <textarea 
                placeholder="Detailed vision logs..."
                value={newGoalDesc}
                onChange={(e) => setNewGoalDesc(e.target.value)}
                rows={2}
                className="w-full bg-[#07080c] border border-white/10 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-sans"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Priority</label>
                <select 
                  value={newGoalPriority}
                  onChange={(e) => setNewGoalPriority(e.target.value as GoalPriority)}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Horizon</label>
                <select 
                  value={newGoalHorizon}
                  onChange={(e) => setNewGoalHorizon(e.target.value as any)}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-purple-300 focus:outline-none font-mono"
                >
                  <option value="30-Day Sprint">30-Day Sprint</option>
                  <option value="Quarterly (Q1-Q4)">Quarterly</option>
                  <option value="Annual Vision">Annual</option>
                  <option value="Life Vision">Life Vision</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Target Date</label>
                <input 
                  type="date"
                  value={newGoalEstDate}
                  onChange={(e) => setNewGoalEstDate(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Link standard skills */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-[#c5a059] uppercase font-bold">Link Disciplines</label>
              
              {/* Primary Core Skills */}
              {state.skills.filter(s => (s.tier || 'Primary') === 'Primary').length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-[#c5a059] uppercase block font-semibold">Primary Disciplines</span>
                  <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                    {state.skills
                      .filter(s => (s.tier || 'Primary') === 'Primary')
                      .map(sk => {
                        const isSel = newGoalSkills.includes(sk.id);
                        return (
                          <button
                            type="button"
                            key={sk.id}
                            onClick={() => setNewGoalSkills(prev => isSel ? prev.filter(x => x !== sk.id) : [...prev, sk.id])}
                            className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              isSel 
                                ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold' 
                                : 'bg-[#07080c] text-zinc-400 border-white/5 hover:border-white/10'
                            }`}
                          >
                            {sk.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Secondary Skills */}
              {state.skills.filter(s => s.tier === 'Secondary').length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[8px] font-mono text-purple-400 uppercase block font-semibold">Specializations</span>
                  <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                    {state.skills
                      .filter(s => s.tier === 'Secondary')
                      .map(sk => {
                        const isSel = newGoalSkills.includes(sk.id);
                        return (
                          <button
                            type="button"
                            key={sk.id}
                            onClick={() => setNewGoalSkills(prev => isSel ? prev.filter(x => x !== sk.id) : [...prev, sk.id])}
                            className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              isSel 
                                ? 'bg-purple-950 text-purple-300 border-purple-500/50 font-bold' 
                                : 'bg-[#07080c] text-zinc-400 border-white/5 hover:border-white/10'
                            }`}
                          >
                            {sk.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setShowCreateGoal(false)}
                className="text-[10px] font-mono text-zinc-500 px-2 py-1"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] text-[10px] font-mono font-black px-3.5 py-1 rounded cursor-pointer"
              >
                CONFIRM
              </button>
            </div>
          </form>
        )}

        {/* Goals List */}
        <div className="space-y-2">
          {state.goals.map(goal => {
            const progress = getGoalProgress(goal.id);
            const isSelected = goal.id === selectedGoalId;

            return (
              <button
                key={goal.id}
                onClick={() => {
                  setSelectedGoalId(goal.id);
                  setIsEditingGoal(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'bg-[#141824]/90 border-[#c5a059] shadow-[0_0_18px_rgba(197,160,89,0.18)] ring-1 ring-[#c5a059]/40' 
                    : 'bg-[#0b0d13]/80 border-[#c5a059]/20 hover:border-[#c5a059]/40 hover:bg-[#131722]/60'
                }`}
              >
                {isSelected && (
                  <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />
                )}

                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-center gap-1">
                    <span className={`text-[9px] font-mono uppercase border px-1.5 py-0.5 rounded font-bold ${statusColors[goal.status]}`}>
                      {statusIcons[goal.status]} {goal.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {goal.horizon && (
                        <span className="text-[8.5px] font-mono uppercase bg-purple-950/60 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">
                          🌐 {goal.horizon}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-[#c5a059] font-bold">P_{goal.priority.toUpperCase()}</span>
                    </div>
                  </div>

                  <h4 className={`font-display font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {goal.name}
                  </h4>
                </div>

                {/* Progress bar info */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span className="text-[#c5a059]">ALIGNMENT</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div 
                      className="rpg-progress-gold h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: GOAL MASTER DETAILS PANE */}
      <div className="lg:col-span-3 space-y-6">
        {selectedGoal ? (
          <div className="glass-panel rounded-xl p-6 space-y-6 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
            
            {/* GOAL HEADER / NAME / BRIEF */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[#c5a059]/20 pb-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">SANCTUM_DESTINY_ANALYSIS</span>
                </div>

                {isEditingGoal ? (
                  <form onSubmit={handleSaveGoalEdit} className="space-y-3 mt-2">
                    <input 
                      type="text" 
                      value={editGoalName}
                      onChange={(e) => setEditGoalName(e.target.value)}
                      className="w-full bg-[#07080c] border border-[#c5a059] rounded px-3 py-1.5 text-sm text-white font-sans font-bold"
                      required
                    />
                    
                    <textarea 
                      value={editGoalDesc}
                      onChange={(e) => setEditGoalDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300 font-sans"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <select 
                        value={editGoalPriority}
                        onChange={(e) => setEditGoalPriority(e.target.value as GoalPriority)}
                        className="bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>

                      <select 
                        value={editGoalHorizon}
                        onChange={(e) => setEditGoalHorizon(e.target.value as any)}
                        className="bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-purple-300 font-mono"
                      >
                        <option value="30-Day Sprint">30-Day Sprint</option>
                        <option value="Quarterly (Q1-Q4)">Quarterly</option>
                        <option value="Annual Vision">Annual</option>
                        <option value="Life Vision">Life Vision</option>
                      </select>

                      <input 
                        type="text" 
                        value={editGoalEstDate}
                        onChange={(e) => setEditGoalEstDate(e.target.value)}
                        className="bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                        placeholder="Estimated date"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingGoal(false)}
                        className="text-[10px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="submit" 
                        className="bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] text-[10px] font-mono px-3 py-1 rounded font-bold cursor-pointer"
                      >
                        APPLY_EDITS
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide">
                        {selectedGoal.name}
                      </h3>
                      {selectedGoal.horizon && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40">
                          {selectedGoal.horizon}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed mt-1">
                      {selectedGoal.description || 'No direct description specified. Provide detailed vision logs for deeper alignment.'}
                    </p>
                  </>
                )}
              </div>

              {/* Goal control buttons */}
              {!isEditingGoal && (
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={startEditing}
                    className="p-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-[#e5c875] rounded text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                    title="Edit goal details"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    EDIT
                  </button>
                  <button 
                    onClick={handleDeleteGoal}
                    className="p-1.5 bg-[#07080c] border border-rose-500/20 hover:border-rose-500 text-zinc-300 hover:text-rose-400 rounded text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    PURGE
                  </button>
                </div>
              )}
            </div>

            {/* Quick Status Adjustments */}
            <div className="flex flex-wrap gap-2 pt-1 border-b border-[#c5a059]/20 pb-4">
              {['Active', 'Paused', 'Planned', 'Completed', 'Archived'].map(status => {
                const isActive = selectedGoal.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => updateGoal(selectedGoal.id, { status: status as GoalStatus })}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isActive 
                        ? statusColors[status as GoalStatus] + ' font-bold shadow-sm' 
                        : 'bg-[#07080c] text-zinc-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {statusIcons[status as GoalStatus]} {status.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* GOAL TABS */}
            <div className="flex border-b border-[#c5a059]/20 gap-4">
              {[
                { id: 'overview', label: 'OVERVIEW', icon: Target },
                { id: 'projects', label: 'PROJECTS & MILESTONES', icon: BookOpen },
                { id: 'quests', label: 'DIRECTIVES & OPERATORS', icon: CheckCircle },
                { id: 'skills', label: 'DISCIPLINES GROWTH', icon: BarChart2 }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`py-2 px-1 text-xs font-mono border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive 
                        ? 'border-[#c5a059] text-[#e5c875] font-bold' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-[#c5a059]" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* GOAL TABS CONTENTS */}
            <div className="pt-2 min-h-[300px]">
              
              {/* TAB 1: OVERVIEW & CORE METRICS */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* METRIC BOXES */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">ALIGNMENT SCORE</span>
                      <p className="text-3xl font-display font-extrabold text-white mt-2">
                        {getGoalProgress(selectedGoal.id)}%
                      </p>
                      <div className="w-full bg-[#0b0d13] rounded-full h-1.5 mt-3 border border-white/5">
                        <div className="rpg-progress-gold h-full rounded-full" style={{ width: `${getGoalProgress(selectedGoal.id)}%` }} />
                      </div>
                    </div>

                    <div className="bg-[#07080c] border border-emerald-500/30 rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">EARNED ESSENCE</span>
                      <p className="text-3xl font-display font-extrabold text-emerald-400 mt-2">
                        +{goalXpEarned} XP
                      </p>
                      <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">
                        From {goalQuests.filter(q => q.status === 'Completed').length} resolved directives
                      </p>
                    </div>

                    <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">ESTIMATED COMPLETION</span>
                      <p className="text-base font-display font-bold text-white mt-2 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[#c5a059] shrink-0" />
                        {selectedGoal.estimatedCompletion}
                      </p>
                      <p className="text-[9px] font-mono text-zinc-400 mt-2 uppercase">
                        Priority rank: {selectedGoal.priority}
                      </p>
                    </div>
                  </div>

                  {/* ACTIVE ASSOCIATIONS TREE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Projects briefly */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">PROJECTS HIERARCHY ({goalProjects.length})</h4>
                      <div className="space-y-2">
                        {goalProjects.length === 0 ? (
                          <p className="text-xs font-mono text-zinc-500">No projects linked to this goal.</p>
                        ) : (
                          goalProjects.map(proj => (
                            <div key={proj.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-lg flex justify-between items-center text-xs">
                              <span className="text-white font-sans font-medium">{proj.name}</span>
                              <span className="text-[#e5c875] font-mono font-bold">{getProjectProgress(proj.id)}%</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Skills briefly */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">LINKED DISCIPLINES</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedGoal.relatedSkills.length === 0 ? (
                          <p className="text-xs font-mono text-zinc-500">No disciplines linked to this goal.</p>
                        ) : (
                          selectedGoal.relatedSkills.map(sid => {
                            const skill = state.skills.find(s => s.id === sid);
                            if (!skill) return null;
                            const skillInfo = getSkillXpAndLevel(sid);
                            const isPrimary = (skill.tier || 'Primary') === 'Primary';
                            return (
                              <div 
                                key={sid} 
                                className={`p-2 bg-[#07080c] border rounded-lg flex items-center gap-2 text-xs transition-colors ${
                                  isPrimary ? 'border-[#c5a059]/30' : 'border-purple-500/30'
                                }`}
                              >
                                <span className="text-white font-sans">{skill.name}</span>
                                <span className={`font-mono font-bold ${
                                  isPrimary ? 'text-[#e5c875]' : 'text-purple-300'
                                }`}>LVL {skillInfo.level}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MINI GOALS / SUB-GOALS BREAKDOWN */}
                  <div className="pt-4 border-t border-[#c5a059]/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                        <GitFork className="h-4 w-4 text-[#c5a059]" />
                        SANCTUM MILESTONES ({(selectedGoal.subGoals || []).filter(sg => sg.completed).length}/{(selectedGoal.subGoals || []).length})
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Deconstruct macro vision into micro-steps
                      </span>
                    </div>

                    {/* Add Mini Goal Form */}
                    <form onSubmit={handleAddSubGoalSubmit} className="flex flex-col sm:flex-row gap-2 bg-[#07080c] p-3 rounded-xl border border-[#c5a059]/30">
                      <input 
                        type="text" 
                        placeholder="Enter milestone title..."
                        value={newSubGoalInput}
                        onChange={(e) => setNewSubGoalInput(e.target.value)}
                        className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
                      />
                      <input 
                        type="date" 
                        value={newSubGoalDate}
                        onChange={(e) => setNewSubGoalDate(e.target.value)}
                        className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                      />
                      <button 
                        type="submit"
                        className="bg-[#3a2e12] hover:bg-[#524119] text-[#fef08a] border border-[#c5a059] px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        ADD MILESTONE
                      </button>
                    </form>

                    {/* SubGoals Checklist */}
                    <div className="space-y-2">
                      {(!selectedGoal.subGoals || selectedGoal.subGoals.length === 0) ? (
                        <div className="p-4 border border-dashed border-[#c5a059]/20 rounded-lg text-center bg-[#07080c]/50">
                          <p className="text-xs font-mono text-zinc-500">
                            No mini-milestones established yet.
                          </p>
                        </div>
                      ) : (
                        selectedGoal.subGoals.map(sg => {
                          const isEditing = editingSubGoalId === sg.id;

                          if (isEditing) {
                            return (
                              <div key={sg.id} className="p-3 bg-[#07080c] border border-[#c5a059] rounded-lg flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  value={editSubGoalName}
                                  onChange={(e) => setEditSubGoalName(e.target.value)}
                                  className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                  placeholder="Milestone Name..."
                                />
                                <input
                                  type="date"
                                  value={editSubGoalDate}
                                  onChange={(e) => setEditSubGoalDate(e.target.value)}
                                  className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none font-mono"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editSubGoalName.trim()) {
                                        updateSubGoal(selectedGoal.id, sg.id, { name: editSubGoalName.trim(), targetDate: editSubGoalDate || undefined });
                                      }
                                      setEditingSubGoalId(null);
                                    }}
                                    className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] text-xs px-2.5 py-1 rounded font-mono font-bold cursor-pointer"
                                  >
                                    SAVE
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubGoalId(null)}
                                    className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded font-mono cursor-pointer"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div 
                              key={sg.id} 
                              className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                                sg.completed 
                                  ? 'bg-[#07080c]/60 border-emerald-500/20 text-zinc-400' 
                                  : 'bg-[#07080c] border-[#c5a059]/20 text-white'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => toggleSubGoal(selectedGoal.id, sg.id)}
                                  className={`w-5 h-5 rounded flex items-center justify-center border transition shrink-0 cursor-pointer ${
                                    sg.completed 
                                      ? 'bg-gradient-to-br from-[#8a6d2b] to-[#c5a059] border-[#c5a059] text-black font-black' 
                                      : 'border-zinc-600 hover:border-[#c5a059] text-transparent'
                                  }`}
                                >
                                  ✓
                                </button>
                                <span className={`text-xs font-sans font-medium ${sg.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                  {sg.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {sg.targetDate && (
                                  <span className="text-[10px] font-mono text-[#c5a059] bg-[#0b0d13] px-2 py-0.5 rounded border border-[#c5a059]/20">
                                    📅 {sg.targetDate}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSubGoalId(sg.id);
                                    setEditSubGoalName(sg.name);
                                    setEditSubGoalDate(sg.targetDate || '');
                                  }}
                                  className="text-zinc-500 hover:text-[#e5c875] p-1 transition cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSubGoal(selectedGoal.id, sg.id)}
                                  className="text-zinc-500 hover:text-rose-400 p-1 transition cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Connected Planning Documents Section */}
                  <div className="pt-4 border-t border-[#c5a059]/20 space-y-3">
                    <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      📄 STRATEGIC PLANNING DIRECTIVES
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(!state.planningDocuments || state.planningDocuments.filter(doc => doc.linkedGoals?.includes(selectedGoal.id)).length === 0) ? (
                        <p className="text-xs font-mono text-zinc-500 col-span-2">No active strategic planning documents linked to this goal.</p>
                      ) : (
                        state.planningDocuments.filter(doc => doc.linkedGoals?.includes(selectedGoal.id)).map(doc => (
                          <div key={doc.id} className="p-2.5 bg-[#07080c] border border-[#c5a059]/20 rounded-lg flex justify-between items-center text-xs">
                            <span className="text-zinc-300 font-mono text-[10px] truncate flex items-center gap-1.5">
                              📂 {doc.path}
                            </span>
                            <span className="text-[9px] bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                              Connected
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PROJECTS & MILESTONES CONTROLLERS */}
              {activeSubTab === 'projects' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT PANEL: PROJECTS LIST & CREATION */}
                    <div className="space-y-4 border-r border-white/5 pr-0 md:pr-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">PROJECTS HIERARCHY</h4>
                      </div>

                      {/* Add project Form */}
                      <form onSubmit={handleCreateProject} className="p-3 bg-[#07080c] border border-[#c5a059]/25 rounded-xl space-y-2.5">
                        <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold">ADD_PROJECT_ENTRY</span>
                        <input 
                          type="text"
                          placeholder="Project title..."
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                          required
                        />
                        <textarea 
                          placeholder="Project description..."
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                          rows={2}
                          className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                        />
                        <div className="flex justify-between items-center">
                          <input 
                            type="text"
                            placeholder="Est time (e.g. 20 hours)"
                            value={newProjEstTime}
                            onChange={(e) => setNewProjEstTime(e.target.value)}
                            className="bg-[#0b0d13] border border-white/10 rounded p-1 text-[10px] text-white focus:outline-none font-mono"
                          />
                          <button type="submit" className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer">
                            LAUNCH
                          </button>
                        </div>
                      </form>

                      {/* Projects interactive list */}
                      <div className="space-y-2">
                        {goalProjects.length === 0 ? (
                          <p className="text-xs font-mono text-zinc-500 text-center py-4">No projects initialized for this goal.</p>
                        ) : (
                          goalProjects.map(proj => (
                            <div key={proj.id} className="p-3.5 bg-[#07080c] border border-[#c5a059]/20 rounded-xl text-xs space-y-3">
                              <div className="flex justify-between items-center">
                                <h5 className="font-display font-bold text-white">{proj.name}</h5>
                                <button 
                                  onClick={() => deleteProject(proj.id)}
                                  className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>

                              {proj.description && (
                                <p className="text-xs text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed mt-1">
                                  {proj.description}
                                </p>
                              )}

                              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                <span>TIME: {proj.estimatedTime}</span>
                                <span className="text-[#e5c875] font-bold">{getProjectProgress(proj.id)}% COMPLETED</span>
                              </div>

                              <div className="w-full bg-[#0b0d13] rounded-full h-1.5 overflow-hidden border border-white/5">
                                <div 
                                  className="rpg-progress-gold h-full rounded-full" 
                                  style={{ width: `${getProjectProgress(proj.id)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* RIGHT PANEL: MILESTONES LIST & CREATION */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">MILESTONES TREE</h4>

                      {/* Add milestone form */}
                      <form onSubmit={handleCreateMilestone} className="p-3 bg-[#07080c] border border-[#c5a059]/25 rounded-xl space-y-2.5">
                        <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold">ADD_MILESTONE_MARKER</span>
                        <input 
                          type="text"
                          placeholder="Milestone title..."
                          value={newMileName}
                          onChange={(e) => setNewMileName(e.target.value)}
                          className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                          required
                        />
                        <div className="flex justify-between items-center">
                          <select 
                            value={newMileProjId}
                            onChange={(e) => setNewMileProjId(e.target.value)}
                            className="bg-[#0b0d13] border border-white/10 rounded p-1 text-[10px] text-zinc-300 focus:outline-none font-mono"
                            required
                          >
                            <option value="">Link Project</option>
                            {goalProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>

                          <button type="submit" className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer">
                            CREATE
                          </button>
                        </div>
                      </form>

                      {/* Milestones list */}
                      <div className="space-y-2">
                        {goalMilestones.length === 0 ? (
                          <p className="text-xs font-mono text-zinc-500 text-center py-4">No milestones marked yet.</p>
                        ) : (
                          goalMilestones.map(mile => {
                            const progress = getMilestoneProgress(mile.id);
                            return (
                              <div key={mile.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl text-xs space-y-2 flex flex-col">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="font-sans font-bold text-zinc-200">{mile.name}</h5>
                                    <span className="text-[9px] font-mono text-[#c5a059]">
                                      PROJECT: {state.projects.find(p => p.id === mile.projectId)?.name || 'Unknown'}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={() => deleteMilestone(mile.id)}
                                    className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                
                                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                                  <span>STATUS: {progress === 100 ? 'ACHIEVED' : 'IN_PROGRESS'}</span>
                                  <span className="text-[#e5c875] font-bold">{progress}%</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: QUESTS MANAGEMENT & ADVANCED ACTIONS */}
              {activeSubTab === 'quests' && (
                <div className="space-y-6">
                  
                  {/* QUEST CREATOR INLINE FOR GOAL */}
                  <form onSubmit={handleCreateQuest} className="p-4 bg-[#07080c] border border-[#c5a059]/30 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-4 border-b border-[#c5a059]/20 pb-1 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[#e5c875] uppercase font-bold flex items-center gap-1">
                        <RubElHizbIcon className="h-2.5 w-2.5 text-[#c5a059]" />
                        ASSIGN_DIRECTIVE_TO_DESTINY
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[9px] font-mono text-[#c5a059] uppercase mb-1 font-bold">Directive Title</label>
                      <input 
                        type="text"
                        placeholder="Draft technical blueprint..."
                        value={newQuestName}
                        onChange={(e) => setNewQuestName(e.target.value)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Difficulty</label>
                      <select 
                        value={newQuestDiff}
                        onChange={(e) => setNewQuestDiff(e.target.value as QuestDifficulty)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                      >
                        <option value="Easy">Easy (50 XP)</option>
                        <option value="Normal">Normal (100 XP)</option>
                        <option value="Hard">Hard (200 XP)</option>
                        <option value="Boss">Boss (500 XP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Type</label>
                      <select 
                        value={newQuestType}
                        onChange={(e) => setNewQuestType(e.target.value)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                      >
                        <option value="Main">Main Quest</option>
                        <option value="Side">Side Quest</option>
                        <option value="Boss">Boss Quest</option>
                        <option value="Recovery">Recovery Quest</option>
                        <option value="Habit">Habit Quest</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Link Project</label>
                      <select 
                        value={newQuestProj}
                        onChange={(e) => setNewQuestProj(e.target.value)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                      >
                        <option value="">No Project</option>
                        {goalProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Link Milestone</label>
                      <select 
                        value={newQuestMile}
                        onChange={(e) => setNewQuestMile(e.target.value)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                      >
                        <option value="">No Milestone</option>
                        {goalMilestones.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Duration (Min)</label>
                      <input 
                        type="number"
                        value={newQuestTime}
                        onChange={(e) => setNewQuestTime(Number(e.target.value))}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Recurrence</label>
                      <select 
                        value={newQuestRecurrence}
                        onChange={(e) => setNewQuestRecurrence(e.target.value as any)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                      >
                        <option value="None">Once Only</option>
                        <option value="Daily">🔁 Daily</option>
                        <option value="Every 2 Days">🔁 Every 2 Days</option>
                        <option value="Weekly">🔁 Weekly</option>
                        <option value="Monthly">🔁 Monthly</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 mt-2">
                      <button type="submit" className="w-full bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] py-2 rounded-lg text-xs font-mono font-black transition-colors cursor-pointer">
                        DISPATCH_DIRECTIVE
                      </button>
                    </div>
                  </form>

                  {/* Split Action Sheet */}
                  {splitQuestId && (
                    <div className="p-4 bg-[#07080c] border border-amber-500/40 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                        <GitFork className="h-4 w-4 animate-pulse" />
                        SPLIT_DIRECTIVE_ENGINE
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Part A Name"
                          value={splitNameA}
                          onChange={(e) => setEditGoalName(e.target.value)}
                          onInput={(e: any) => setSplitNameA(e.target.value)}
                          className="bg-[#0b0d13] border border-white/10 p-1.5 rounded text-xs text-white"
                        />
                        <input 
                          type="text" 
                          placeholder="Part B Name"
                          value={splitNameB}
                          onInput={(e: any) => setSplitNameB(e.target.value)}
                          className="bg-[#0b0d13] border border-white/10 p-1.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-zinc-400">
                        <span className="font-mono">XP Ratio: {Math.round(splitRatio * 100)}% / {Math.round((1 - splitRatio) * 100)}%</span>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="0.9" 
                          step="0.05"
                          value={splitRatio}
                          onChange={(e) => setSplitRatio(Number(e.target.value))}
                          className="w-32 accent-[#c5a059]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setSplitQuestId(null)} className="text-[10px] font-mono text-zinc-500">CANCEL</button>
                        <button onClick={executeSplit} className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] text-[10px] font-mono px-3 py-1 rounded font-bold cursor-pointer">CONFIRM_SPLIT</button>
                      </div>
                    </div>
                  )}

                  {/* Merge Action Sheet */}
                  {mergeQuestIdA && (
                    <div className="p-4 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono text-[#e5c875] uppercase font-bold flex items-center gap-1.5">
                        <Link2 className="h-4 w-4 text-[#c5a059]" />
                        MERGE_DIRECTIVES_ENGINE
                      </span>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase">Select Target Quest to Merge With</label>
                        <select 
                          value={mergeQuestIdB}
                          onChange={(e) => setMergeQuestIdB(e.target.value)}
                          className="w-full bg-[#0b0d13] border border-white/10 rounded p-1.5 text-xs text-zinc-300"
                          required
                        >
                          <option value="">Choose quest...</option>
                          {goalQuests.filter(q => q.id !== mergeQuestIdA && q.status === 'Active').map(q => (
                            <option key={q.id} value={q.id}>{q.name}</option>
                          ))}
                        </select>

                        <input 
                          type="text" 
                          placeholder="New Merged Title..."
                          value={mergedName}
                          onChange={(e) => setMergedName(e.target.value)}
                          className="w-full bg-[#0b0d13] border border-white/10 p-1.5 rounded text-xs text-white"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setMergeQuestIdA(null)} className="text-[10px] font-mono text-zinc-500">CANCEL</button>
                        <button onClick={executeMerge} className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] text-[10px] font-mono px-3 py-1 rounded font-bold cursor-pointer">EXECUTE_MERGE</button>
                      </div>
                    </div>
                  )}

                  {/* Move Action Sheet */}
                  {moveQuestId && (
                    <div className="p-4 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono text-[#e5c875] uppercase font-bold flex items-center gap-1.5">
                        <Move className="h-4 w-4 text-[#c5a059]" />
                        REASSIGN_MAPPING
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Target Goal</label>
                          <select 
                            value={moveTargetGoalId}
                            onChange={(e) => setMoveTargetGoalId(e.target.value)}
                            className="w-full bg-[#0b0d13] border border-white/10 p-1 text-xs text-zinc-300 font-mono"
                          >
                            <option value="">No Goal</option>
                            {state.goals.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Target Project</label>
                          <select 
                            value={moveTargetProjId}
                            onChange={(e) => setMoveTargetProjId(e.target.value)}
                            className="w-full bg-[#0b0d13] border border-white/10 p-1 text-xs text-zinc-300 font-mono"
                          >
                            <option value="">No Project</option>
                            {state.projects.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Target Milestone</label>
                          <select 
                            value={moveTargetMileId}
                            onChange={(e) => setMoveTargetMileId(e.target.value)}
                            className="w-full bg-[#0b0d13] border border-white/10 p-1 text-xs text-zinc-300 font-mono"
                          >
                            <option value="">No Milestone</option>
                            {state.milestones.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setMoveQuestId(null)} className="text-[10px] font-mono text-zinc-500">CANCEL</button>
                        <button onClick={executeMove} className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] text-[10px] font-mono px-3 py-1 rounded font-bold cursor-pointer">REASSIGN</button>
                      </div>
                    </div>
                  )}

                  {/* GOAL QUESTS LIST */}
                  <div className="space-y-2">
                    {goalQuests.length === 0 ? (
                      <p className="text-xs font-mono text-zinc-500 text-center py-6">No directives linked to this goal yet.</p>
                    ) : (
                      goalQuests.map(quest => {
                        const isCompleted = quest.status === 'Completed';
                        const isEditing = editingQuestId === quest.id;

                        if (isEditing) {
                          return (
                            <div key={quest.id} className="p-3.5 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-3 text-left">
                              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                <span className="text-[10px] font-mono text-[#e5c875] uppercase tracking-wider font-bold">CHANGE_DIRECTIVE_PARAMETERS</span>
                                <button type="button" onClick={() => setEditingQuestId(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="space-y-2.5">
                                <div>
                                  <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Quest Title</label>
                                  <input 
                                    type="text"
                                    value={editQuestName}
                                    onChange={(e) => setEditQuestName(e.target.value)}
                                    className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                                    required
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Difficulty</label>
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
                                      className="w-full bg-[#0b0d13] border border-white/10 rounded p-1 text-xs text-white font-mono"
                                    >
                                      <option value="Easy">Easy (50 XP)</option>
                                      <option value="Normal">Normal (100 XP)</option>
                                      <option value="Hard">Hard (200 XP)</option>
                                      <option value="Boss">Boss (500 XP)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">XP Reward</label>
                                    <input 
                                      type="number"
                                      value={editQuestXp}
                                      onChange={(e) => setEditQuestXp(Number(e.target.value))}
                                      className="w-full bg-[#0b0d13] border border-white/10 rounded p-1 text-xs text-white text-center font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Recurrence</label>
                                    <select 
                                      value={editQuestRecurrence}
                                      onChange={(e) => setEditQuestRecurrence(e.target.value as any)}
                                      className="w-full bg-[#0b0d13] border border-white/10 rounded p-1 text-xs text-zinc-300 font-mono"
                                    >
                                      <option value="None">Once Only</option>
                                      <option value="Daily">🔁 Daily</option>
                                      <option value="Every 2 Days">🔁 Every 2 Days</option>
                                      <option value="Weekly">🔁 Weekly</option>
                                      <option value="Monthly">🔁 Monthly</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-1">Project</label>
                                    <select 
                                      value={editQuestProj}
                                      onChange={(e) => setEditQuestProj(e.target.value)}
                                      className="w-full bg-[#0b0d13] border border-white/10 rounded p-1 text-xs text-zinc-300 truncate font-mono"
                                    >
                                      <option value="">No Project</option>
                                      {state.projects.filter(p => p.goalId === selectedGoalId).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[9px] font-mono text-zinc-400 uppercase">Target Date</label>
                                    <button
                                      type="button"
                                      onClick={() => setEditQuestDeadline(editQuestDeadline ? '' : systemDate)}
                                      className="text-[9px] font-mono text-[#c5a059] hover:underline"
                                    >
                                      {!editQuestDeadline ? '♾️ Set Current' : 'Clear Date'}
                                    </button>
                                  </div>
                                  <input 
                                    type="date"
                                    value={editQuestDeadline}
                                    onChange={(e) => setEditQuestDeadline(e.target.value)}
                                    className="w-full bg-[#0b0d13] border border-white/10 rounded p-1 text-xs text-white font-mono"
                                  />
                                </div>

                                <div className="space-y-2 pt-1 border-t border-white/5">
                                  <label className="block text-[9px] font-mono text-[#c5a059] uppercase font-bold">Associate Disciplines</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {state.skills.map(skill => {
                                      const isSelected = editQuestSkills.includes(skill.id);
                                      return (
                                        <button
                                          key={skill.id}
                                          type="button"
                                          onClick={() => handleEditSkillToggle(skill.id)}
                                          className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                            isSelected 
                                              ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold' 
                                              : 'bg-[#0b0d13] text-zinc-400 border-white/5 hover:border-white/10'
                                          }`}
                                        >
                                          {skill.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                                <button 
                                  type="button" 
                                  onClick={() => setEditingQuestId(null)}
                                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                                >
                                  CANCEL
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleSaveQuestEdit(quest.id)}
                                  className="bg-[#3a2e12] hover:bg-[#524119] border border-[#c5a059] text-[#fef08a] text-xs font-mono px-3 py-1 rounded transition-colors flex items-center gap-1 font-bold cursor-pointer"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  SAVE_CHANGES
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={quest.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl flex items-center justify-between gap-3 hover:border-[#c5a059]/50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button 
                                onClick={() => isCompleted ? reopenQuest(quest.id) : completeQuest(quest.id)}
                                className="shrink-0 cursor-pointer"
                              >
                                {isCompleted ? (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8a6d2b] to-[#c5a059] flex items-center justify-center text-black font-bold text-xs">✓</div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-zinc-600 hover:border-[#c5a059]" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <h5 className={`font-sans font-medium text-xs ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                                  {quest.name}
                                </h5>
                                <div className="flex flex-wrap gap-1.5 items-center mt-1">
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase">{quest.type}</span>
                                  <span className="text-[9px] font-mono text-zinc-600">•</span>
                                  <span className="text-[9px] font-mono text-[#c5a059]">LVL {quest.difficulty}</span>
                                  {quest.recurrence && quest.recurrence !== 'None' && (
                                    <>
                                      <span className="text-[9px] font-mono text-zinc-600">•</span>
                                      <span className="text-[9px] font-mono text-purple-300 font-bold">
                                        🔁 {quest.recurrence}
                                      </span>
                                    </>
                                  )}
                                  {quest.projectId && (
                                    <>
                                      <span className="text-[9px] font-mono text-zinc-600">•</span>
                                      <span className="text-[9px] font-mono text-[#e5c875] truncate max-w-[100px]">
                                        📁 {state.projects.find(p => p.id === quest.projectId)?.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions toolbar */}
                            <div className="flex items-center gap-3 shrink-0">
                              {(() => {
                                const isPenalty = quest.type === 'Penalty' || quest.xp < 0;
                                const penaltyVal = isPenalty 
                                  ? (quest.xp < 0 ? quest.xp : -(quest.difficulty === 'Boss' ? 250 : quest.difficulty === 'Hard' ? 100 : quest.difficulty === 'Easy' ? 25 : 50))
                                  : quest.xp;
                                return (
                                  <span className={`text-xs font-mono font-bold ${isPenalty ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                                    {isPenalty ? `${penaltyVal} XP` : `+${quest.xp} XP`}
                                  </span>
                                );
                              })()}
                              
                              {!isCompleted && (
                                <div className="flex gap-1">
                                  <button onClick={() => startEditingQuest(quest)} className="p-1 hover:bg-[#3a2e12] rounded text-zinc-400 hover:text-[#e5c875] cursor-pointer" title="Edit">
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button onClick={() => triggerSplit(quest)} className="p-1 hover:bg-[#3a2e12] rounded text-zinc-400 hover:text-amber-400 cursor-pointer" title="Split">
                                    <GitFork className="h-3 w-3" />
                                  </button>
                                  <button onClick={() => triggerMerge(quest)} className="p-1 hover:bg-[#3a2e12] rounded text-zinc-400 hover:text-[#e5c875] cursor-pointer" title="Merge">
                                    <Link2 className="h-3 w-3" />
                                  </button>
                                  <button onClick={() => triggerMove(quest)} className="p-1 hover:bg-[#3a2e12] rounded text-zinc-400 hover:text-[#e5c875] cursor-pointer" title="Move">
                                    <Move className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              
                              <button onClick={() => duplicateQuest(quest.id)} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white cursor-pointer" title="Duplicate">
                                <Copy className="h-3 w-3" />
                              </button>
                              <button onClick={() => deleteQuest(quest.id)} className="p-1 hover:bg-rose-950 rounded text-zinc-500 hover:text-rose-400 cursor-pointer" title="Delete">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SKILLS CONTRIBUTION */}
              {activeSubTab === 'skills' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">DISCIPLINES REINFORCED BY GOAL</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGoal.relatedSkills.length === 0 ? (
                      <p className="text-xs font-mono text-zinc-500 col-span-2">No disciplines associated. Edit the goal to link discipline parameters.</p>
                    ) : (
                      selectedGoal.relatedSkills.map(sid => {
                        const skill = state.skills.find(s => s.id === sid);
                        if (!skill) return null;
                        const sInfo = getSkillXpAndLevel(sid);
                        const isPrimary = (skill.tier || 'Primary') === 'Primary';
                        return (
                          <div 
                            key={sid} 
                            className="p-4 bg-[#07080c] border border-[#c5a059]/25 rounded-xl text-xs space-y-3 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <h5 className="font-display font-bold text-white leading-tight">{skill.name}</h5>
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                                  isPrimary ? 'text-[#fef08a] bg-[#3a2e12] border-[#c5a059]/40' : 'text-purple-300 bg-purple-950 border-purple-500/40'
                                }`}>
                                  {skill.tier || 'Primary'}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-[#e5c875]">LVL {sInfo.level}</span>
                            </div>
                            
                            <div className="w-full bg-[#0b0d13] rounded-full h-1.5 overflow-hidden border border-white/5">
                              <div 
                                className="rpg-progress-gold h-full rounded-full" 
                                style={{ width: `${sInfo.progress}%` }} 
                              />
                            </div>

                            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                              <span>MASTERY: {sInfo.mastery}%</span>
                              <span>{sInfo.xpIntoLevel} / {sInfo.xpRequiredForNextLevel} XP</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="glass-panel rounded-xl p-10 text-center space-y-2 border border-[#c5a059]/20 bg-[#0b0d13]/80">
            <Target className="h-8 w-8 text-[#c5a059]/60 mx-auto" />
            <h3 className="font-display text-sm font-bold text-white uppercase">No Goal Selected</h3>
            <p className="text-xs text-zinc-500 font-mono">Create a goal or select an existing parameter on the left panel.</p>
          </div>
        )}
      </div>

    </div>
  );
};
