import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { Goal, GoalPriority, GoalStatus, SubGoal } from '../../types';
import { 
  Target, Layers, Plus, Search, ChevronRight, ChevronDown, 
  CheckCircle, Clock, Calendar, ArrowRight, ShieldCheck,
  TrendingUp, Briefcase, Zap, GitBranch, Sparkles, Filter,
  Check, X, Trash2, Edit3, Compass, ExternalLink
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString } from '../../utils/dateUtils';

interface HierarchicalRoadmapViewProps {
  searchQuery?: string;
  onNavigateToCampaign?: (campaignId: string) => void;
  onNavigateToDirectives?: () => void;
}

type HorizonTier = 'all' | 'lifetime' | '10-year' | '3-year' | 'annual' | 'quarterly';

interface HorizonDefinition {
  id: HorizonTier;
  label: string;
  horizonMatch: string[];
  description: string;
  badgeColor: string;
  borderColor: string;
  accentColor: string;
}

const HORIZON_TIERS: HorizonDefinition[] = [
  {
    id: 'lifetime',
    label: 'LIFELONG DESTINIES',
    horizonMatch: ['lifetime', 'life vision', 'life'],
    description: 'Ultimate eternal purpose, identity mastery & lifelong north stars',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/30',
    accentColor: '#f59e0b'
  },
  {
    id: '10-year',
    label: '10-YEAR HORIZONS',
    horizonMatch: ['10-year', 'decade'],
    description: 'Generational foundational pillars & multi-decade life trajectories',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    borderColor: 'border-yellow-500/30',
    accentColor: '#eab308'
  },
  {
    id: '3-year',
    label: '3-YEAR STRATEGIC PILLARS',
    horizonMatch: ['3-year', 'three-year', 'strategic'],
    description: 'Structural milestones, major capabilities & lifestyle architectures',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderColor: 'border-purple-500/30',
    accentColor: '#a855f7'
  },
  {
    id: 'annual',
    label: '1-YEAR ANNUAL OKRs',
    horizonMatch: ['annual', '1-year', 'yearly'],
    description: 'Current calendar year non-negotiable commitments & outcomes',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    borderColor: 'border-cyan-500/30',
    accentColor: '#06b6d4'
  },
  {
    id: 'quarterly',
    label: '90-DAY QUARTERLY SPRINTS',
    horizonMatch: ['quarterly', '30-day', '30-day sprint', 'q1', 'q2', 'q3', 'q4', 'sprint'],
    description: 'Active 90-day tactical campaigns executing immediate deliverables',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/30',
    accentColor: '#10b981'
  }
];

export const HierarchicalRoadmapView: React.FC<HierarchicalRoadmapViewProps> = ({
  searchQuery = '',
  onNavigateToCampaign,
  onNavigateToDirectives
}) => {
  const { 
    state, 
    getGoalProgress, 
    getProjectProgress, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    addProject,
    addQuest 
  } = usePOS();

  const [activeTierFilter, setActiveTierFilter] = useState<HorizonTier>('all');
  const [viewMode, setViewMode] = useState<'cascade' | 'tree'>('cascade');
  const [expandedGoalIds, setExpandedGoalIds] = useState<Record<string, boolean>>({});
  
  // Add Goal Modal State
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDesiredOutcome, setGoalDesiredOutcome] = useState('');
  const [goalHorizon, setGoalHorizon] = useState<string>('Annual Vision');
  const [goalPriority, setGoalPriority] = useState<GoalPriority>('High');
  const [goalEstimatedCompletion, setGoalEstimatedCompletion] = useState('');

  // Quick Branch Campaign / Directive state
  const [branchGoalId, setBranchGoalId] = useState<string | null>(null);
  const [branchCampaignName, setBranchCampaignName] = useState('');
  const [quickDirectiveGoalId, setQuickDirectiveGoalId] = useState<string | null>(null);
  const [quickDirectiveName, setQuickDirectiveName] = useState('');

  // Helper to categorize goals into horizon tiers
  const getGoalTier = (goal: Goal): HorizonTier => {
    const horizon = (goal.horizon || '').toLowerCase();
    for (const tier of HORIZON_TIERS) {
      if (tier.horizonMatch.some(m => horizon.includes(m))) {
        return tier.id;
      }
    }
    return 'annual'; // default
  };

  const toggleExpand = (id: string) => {
    setExpandedGoalIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    state.goals.forEach(g => { next[g.id] = true; });
    setExpandedGoalIds(next);
  };

  const collapseAll = () => {
    setExpandedGoalIds({});
  };

  // Filtered goals by search and horizon
  const filteredGoals = useMemo(() => {
    return state.goals.filter(goal => {
      const matchesSearch = !searchQuery.trim() || 
        goal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.desiredOutcome?.toLowerCase().includes(searchQuery.toLowerCase());

      const tier = getGoalTier(goal);
      const matchesTier = activeTierFilter === 'all' || activeTierFilter === tier;

      return matchesSearch && matchesTier;
    });
  }, [state.goals, searchQuery, activeTierFilter]);

  // Grouped goals by horizon for Cascade view
  const goalsByTier = useMemo(() => {
    const map = new Map<HorizonTier, Goal[]>();
    HORIZON_TIERS.forEach(t => map.set(t.id, []));

    filteredGoals.forEach(g => {
      const tier = getGoalTier(g);
      const list = map.get(tier) || [];
      list.push(g);
      map.set(tier, list);
    });

    return map;
  }, [filteredGoals]);

  // Subgoal toggle completion
  const handleToggleSubGoal = (goal: Goal, subGoalIndex: number) => {
    if (!goal.subGoals) return;
    const nextSubGoals = goal.subGoals.map((sg, idx) => {
      if (idx === subGoalIndex) {
        return { ...sg, completed: !sg.completed };
      }
      return sg;
    });
    updateGoal(goal.id, { subGoals: nextSubGoals });
  };

  // Add sub-goal inline
  const handleAddSubGoal = (goal: Goal, title: string) => {
    if (!title.trim()) return;
    const newSubGoal: SubGoal = {
      id: `sg-${Date.now()}`,
      name: title.trim(),
      completed: false
    };
    const nextSubGoals = [...(goal.subGoals || []), newSubGoal];
    updateGoal(goal.id, { subGoals: nextSubGoals });
  };

  // Save Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: goalName.trim(),
        description: goalDescription.trim(),
        desiredOutcome: goalDesiredOutcome.trim(),
        horizon: goalHorizon as any,
        priority: goalPriority,
        estimatedCompletion: goalEstimatedCompletion || editingGoal.estimatedCompletion || ''
      });
    } else {
      addGoal({
        name: goalName.trim(),
        description: goalDescription.trim(),
        desiredOutcome: goalDesiredOutcome.trim(),
        status: 'Active',
        priority: goalPriority,
        horizon: goalHorizon as any,
        relatedSkills: [],
        relevantAttributes: [],
        estimatedCompletion: goalEstimatedCompletion || '2026-12-31',
        subGoals: []
      });
    }

    setIsAddGoalModalOpen(false);
    setEditingGoal(null);
    setGoalName('');
    setGoalDescription('');
    setGoalDesiredOutcome('');
  };

  const openAddGoalModal = (presetHorizon?: string) => {
    setEditingGoal(null);
    setGoalName('');
    setGoalDescription('');
    setGoalDesiredOutcome('');
    setGoalHorizon(presetHorizon || 'Annual Vision');
    setGoalPriority('High');
    setGoalEstimatedCompletion('');
    setIsAddGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalDescription(goal.description || '');
    setGoalDesiredOutcome(goal.desiredOutcome || '');
    setGoalHorizon(goal.horizon || 'Annual Vision');
    setGoalPriority(goal.priority || 'High');
    setGoalEstimatedCompletion(goal.estimatedCompletion || '');
    setIsAddGoalModalOpen(true);
  };

  // Branch Campaign handler
  const handleBranchCampaign = (goalId: string) => {
    if (!branchCampaignName.trim()) return;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    addProject({
      goalId,
      name: branchCampaignName.trim(),
      description: `Tactical operational campaign executing ${goal.name}.`,
      status: 'Active',
      campaignHealth: 'Healthy',
      priority: goal.priority || 'High',
      startDate: getLocalDateString(),
      estimatedTime: '40h',
      subProjects: [],
      risks: []
    });

    setBranchCampaignName('');
    setBranchGoalId(null);
  };

  // Quick Directive handler
  const handleCreateDirective = (goalId: string) => {
    if (!quickDirectiveName.trim()) return;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    addQuest({
      name: quickDirectiveName.trim(),
      description: `Directive supporting ${goal.name}`,
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 100,
      goalId,
      projectId: null,
      milestoneId: null,
      relatedSkills: goal.relatedSkills || [],
      type: 'Main',
      recurrence: 'None',
      deadline: null
    });

    setQuickDirectiveName('');
    setQuickDirectiveGoalId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#080b14]/95 p-4 rounded-xl border border-[#c5a059]/30 relative overflow-hidden shadow-xl">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        <div>
          <h3 className="text-base font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#e5c875]" />
            HIERARCHICAL LIFE ROADMAP
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
              HORIZON CONTINUUM
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Multi-horizon architectural cascade connecting lifelong purpose down to annual commitments and 90-day sprints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center bg-[#05070d] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('cascade')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition cursor-pointer ${
                viewMode === 'cascade' 
                  ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              CASCADE BOARD
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition cursor-pointer ${
                viewMode === 'tree' 
                  ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              CASCADE TREE
            </button>
          </div>

          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-[#05070d] border border-white/10 rounded-lg transition cursor-pointer"
          >
            EXPAND ALL
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-[#05070d] border border-white/10 rounded-lg transition cursor-pointer"
          >
            COLLAPSE
          </button>

          <button
            onClick={() => openAddGoalModal()}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-[#c5a059] hover:bg-[#d4b068] text-black rounded-lg transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>ANCHOR DESTINY</span>
          </button>
        </div>
      </div>

      {/* HORIZON FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <span className="text-[10px] font-mono text-[#c5a059] uppercase mr-1 flex items-center gap-1 font-bold">
          <Filter className="h-3 w-3 text-[#c5a059]" /> HORIZON:
        </span>
        <button
          onClick={() => setActiveTierFilter('all')}
          className={`px-2.5 py-1 text-xs font-mono rounded-lg transition cursor-pointer ${
            activeTierFilter === 'all'
              ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] font-bold shadow-sm'
              : 'bg-[#080b14] text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          ALL HORIZONS ({state.goals.length})
        </button>

        {HORIZON_TIERS.map(tier => {
          const count = state.goals.filter(g => getGoalTier(g) === tier.id).length;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTierFilter(tier.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTierFilter === tier.id
                  ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] font-bold shadow-sm'
                  : 'bg-[#080b14] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{tier.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: HORIZON CASCADE BOARD (Columns for each Horizon Tier) */}
      {viewMode === 'cascade' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {HORIZON_TIERS.filter(tier => activeTierFilter === 'all' || activeTierFilter === tier.id).map(tier => {
            const tierGoals = goalsByTier.get(tier.id) || [];

            return (
              <div 
                key={tier.id}
                className="bg-[#080b14]/90 border border-white/10 rounded-xl p-4 space-y-3 relative overflow-hidden flex flex-col shadow-lg"
              >
                {/* Column Header */}
                <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.accentColor }} />
                      {tier.label}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-sans mt-0.5 line-clamp-1">
                      {tier.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">
                    {tierGoals.length}
                  </span>
                </div>

                {/* Column Goals List */}
                <div className="space-y-3 min-h-[160px]">
                  {tierGoals.length > 0 ? (
                    tierGoals.map(goal => {
                      const progress = getGoalProgress(goal.id);
                      const isExpanded = !!expandedGoalIds[goal.id];
                      const linkedProjects = state.projects.filter(p => p.goalId === goal.id);
                      const linkedQuests = state.quests.filter(q => q.goalId === goal.id);
                      const subGoals = goal.subGoals || [];
                      const completedSubGoals = subGoals.filter(sg => sg.completed).length;

                      return (
                        <div 
                          key={goal.id}
                          className="bg-[#05070d] border border-white/10 hover:border-[#c5a059]/40 rounded-lg p-3 space-y-2.5 transition-all shadow-md group"
                        >
                          {/* Goal Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h5 className="font-display text-xs font-bold text-white uppercase leading-snug group-hover:text-[#fef08a] transition-colors">
                                {goal.name}
                              </h5>
                              {goal.desiredOutcome && (
                                <p className="text-[11px] text-zinc-400 font-sans mt-0.5 line-clamp-2">
                                  {goal.desiredOutcome}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditGoalModal(goal)}
                                className="p-1 text-zinc-500 hover:text-white transition cursor-pointer"
                                title="Edit Goal"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => toggleExpand(goal.id)}
                                className="p-1 text-zinc-400 hover:text-[#fef08a] transition cursor-pointer"
                              >
                                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Progress Gauge */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-zinc-400">Progression</span>
                              <span className="text-emerald-400 font-bold tabular-nums">{progress}%</span>
                            </div>
                            <div className="w-full bg-[#080b14] rounded-full h-1.5 overflow-hidden border border-white/5">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" 
                                style={{ width: `${progress}%` }} 
                              />
                            </div>
                          </div>

                          {/* Unboxed Metadata (Zero-Pill Rule) */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono text-zinc-400 pt-0.5 border-t border-white/5">
                            <span className="text-zinc-300">{goal.priority} Priority</span>
                            <span aria-hidden="true" className="text-zinc-600">·</span>
                            <span>{linkedProjects.length} Campaigns</span>
                            <span aria-hidden="true" className="text-zinc-600">·</span>
                            <span>{linkedQuests.length} Directives</span>
                            {goal.estimatedCompletion && (
                              <>
                                <span aria-hidden="true" className="text-zinc-600">·</span>
                                <span className="text-amber-400/80">{goal.estimatedCompletion}</span>
                              </>
                            )}
                          </div>

                          {/* EXPANDED ACCORDION: Sub-Goals, Linked Campaigns & Quick Action Forges */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-white/10 space-y-3">
                              {/* Sub-Goals Checklist */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                  <span>KEY MILESTONES ({completedSubGoals}/{subGoals.length})</span>
                                </div>
                                <div className="space-y-1">
                                  {subGoals.map((sg, sgIdx) => (
                                    <div 
                                      key={sg.id || sgIdx}
                                      onClick={() => handleToggleSubGoal(goal, sgIdx)}
                                      className="flex items-center gap-2 p-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-sans text-zinc-200 cursor-pointer transition"
                                    >
                                      <div className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${
                                        sg.completed ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300' : 'border-zinc-500'
                                      }`}>
                                        {sg.completed && <Check className="h-2.5 w-2.5" />}
                                      </div>
                                      <span className={`text-[11px] truncate ${sg.completed ? 'line-through text-zinc-500' : ''}`}>
                                        {sg.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Inline Add Sub-Goal */}
                                <input 
                                  type="text"
                                  placeholder="+ Add sub-goal checkpoint..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddSubGoal(goal, (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                  className="w-full bg-[#080b14] border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder-zinc-500 font-sans focus:outline-none focus:border-[#c5a059]"
                                />
                              </div>

                              {/* Linked Campaigns List */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                                  ANCHORED CAMPAIGNS ({linkedProjects.length})
                                </span>
                                {linkedProjects.length > 0 ? (
                                  linkedProjects.map(proj => {
                                    const pProg = getProjectProgress(proj.id);
                                    return (
                                      <div 
                                        key={proj.id}
                                        onClick={() => onNavigateToCampaign && onNavigateToCampaign(proj.id)}
                                        className="p-1.5 bg-[#080b14] hover:bg-[#101424] border border-purple-500/20 hover:border-purple-500/50 rounded flex items-center justify-between text-xs cursor-pointer transition group/proj"
                                      >
                                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                                          <Briefcase className="h-3 w-3 text-purple-400 shrink-0" />
                                          <span className="font-sans text-[11px] text-zinc-200 group-hover/proj:text-purple-300 truncate">
                                            {proj.name}
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-purple-400 font-bold tabular-nums">
                                          {pProg}%
                                        </span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-[10px] text-zinc-500 italic">No operational campaigns anchored yet.</p>
                                )}
                              </div>

                              {/* Action Forges (Branch Campaign / Quick Directive) */}
                              <div className="pt-2 border-t border-white/5 space-y-2">
                                {branchGoalId === goal.id ? (
                                  <div className="space-y-1.5 bg-purple-950/20 p-2 rounded border border-purple-500/30">
                                    <span className="text-[10px] font-mono text-purple-300 font-bold">BRANCH OPERATIONAL CAMPAIGN:</span>
                                    <div className="flex gap-1.5">
                                      <input 
                                        type="text"
                                        value={branchCampaignName}
                                        onChange={(e) => setBranchCampaignName(e.target.value)}
                                        placeholder="Campaign title (e.g. Q4 MVP Build)..."
                                        className="flex-1 bg-[#05070d] border border-purple-500/40 rounded px-2 py-1 text-xs text-white placeholder-zinc-500 font-sans focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleBranchCampaign(goal.id)}
                                        className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold cursor-pointer"
                                      >
                                        ADD
                                      </button>
                                      <button
                                        onClick={() => setBranchGoalId(null)}
                                        className="px-1.5 text-zinc-400 hover:text-white cursor-pointer"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ) : quickDirectiveGoalId === goal.id ? (
                                  <div className="space-y-1.5 bg-emerald-950/20 p-2 rounded border border-emerald-500/30">
                                    <span className="text-[10px] font-mono text-emerald-300 font-bold">FORGE NEXT DIRECTIVE:</span>
                                    <div className="flex gap-1.5">
                                      <input 
                                        type="text"
                                        value={quickDirectiveName}
                                        onChange={(e) => setQuickDirectiveName(e.target.value)}
                                        placeholder="Directive task name..."
                                        className="flex-1 bg-[#05070d] border border-emerald-500/40 rounded px-2 py-1 text-xs text-white placeholder-zinc-500 font-sans focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleCreateDirective(goal.id)}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold cursor-pointer"
                                      >
                                        FORGE
                                      </button>
                                      <button
                                        onClick={() => setQuickDirectiveGoalId(null)}
                                        className="px-1.5 text-zinc-400 hover:text-white cursor-pointer"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setBranchGoalId(goal.id);
                                        setQuickDirectiveGoalId(null);
                                      }}
                                      className="flex-1 py-1 px-2 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                                    >
                                      <Briefcase className="h-3 w-3" />
                                      <span>BRANCH CAMPAIGN</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setQuickDirectiveGoalId(goal.id);
                                        setBranchGoalId(null);
                                      }}
                                      className="flex-1 py-1 px-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                                    >
                                      <Zap className="h-3 w-3" />
                                      <span>FORGE DIRECTIVE</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-white/5 rounded-lg">
                      <p>No destinies in this horizon.</p>
                      <button
                        onClick={() => openAddGoalModal(tier.label)}
                        className="mt-2 text-[10px] text-[#c5a059] hover:underline cursor-pointer"
                      >
                        + Anchor New Destiny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: UNIFIED CASCADE TREE VIEW (Hierarchical Parent -> Child Tree) */}
      {viewMode === 'tree' && (
        <div className="bg-[#080b14]/90 border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase font-bold">
              UNIFIED STRATEGIC CASCADE TREE (VISION $\rightarrow$ SPRINT DIRECTIVES)
            </span>
            <span className="text-[10px] font-mono text-[#c5a059] font-bold">
              {filteredGoals.length} STRATEGIC DESTINIES
            </span>
          </div>

          <div className="space-y-4">
            {filteredGoals.map(goal => {
              const progress = getGoalProgress(goal.id);
              const tier = getGoalTier(goal);
              const tierDef = HORIZON_TIERS.find(t => t.id === tier) || HORIZON_TIERS[3];
              const linkedProjects = state.projects.filter(p => p.goalId === goal.id);

              return (
                <div key={goal.id} className="border-l-2 pl-4 py-1 space-y-3" style={{ borderColor: tierDef.accentColor }}>
                  {/* Goal Root Node */}
                  <div className="flex items-start justify-between gap-3 bg-[#05070d] p-3 rounded-lg border border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${tierDef.accentColor}25`, color: tierDef.accentColor }}>
                          {tierDef.label}
                        </span>
                        <h4 className="font-display text-sm font-bold text-white uppercase">
                          {goal.name}
                        </h4>
                      </div>
                      {goal.desiredOutcome && (
                        <p className="text-xs text-zinc-400 font-sans">
                          {goal.desiredOutcome}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">{progress}%</span>
                      <div className="text-[10px] text-zinc-500 uppercase">{goal.priority} PRIORITY</div>
                    </div>
                  </div>

                  {/* Children Campaigns */}
                  {linkedProjects.length > 0 && (
                    <div className="ml-6 space-y-2 border-l border-white/10 pl-4">
                      <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">
                        OPERATIONAL CAMPAIGNS ({linkedProjects.length})
                      </span>
                      {linkedProjects.map(proj => {
                        const projProg = getProjectProgress(proj.id);
                        const projQuests = state.quests.filter(q => q.projectId === proj.id);

                        return (
                          <div key={proj.id} className="bg-[#0b0e1a] border border-purple-500/20 p-2.5 rounded-lg space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                                <Briefcase className="h-3 w-3 text-purple-400" />
                                {proj.name}
                              </span>
                              <span className="font-mono text-[10px] text-purple-400 font-bold tabular-nums">
                                {projProg}% • {proj.campaignHealth || 'Healthy'}
                              </span>
                            </div>
                            
                            {/* Children Directives */}
                            {projQuests.length > 0 && (
                              <div className="ml-4 pt-1 space-y-1 border-l border-white/5 pl-2.5">
                                {projQuests.slice(0, 4).map(q => (
                                  <div key={q.id} className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                                    <span className="truncate max-w-[280px]">· {q.name}</span>
                                    <span className={q.status === 'Completed' ? 'text-emerald-400' : 'text-rose-400'}>
                                      [{q.status}]
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD / EDIT GOAL MODAL */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#080b14] border border-[#c5a059]/40 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-display text-sm font-bold text-white uppercase flex items-center gap-2">
                <Target className="h-4 w-4 text-[#e5c875]" />
                {editingGoal ? 'CALIBRATE STRATEGIC DESTINY' : 'ANCHOR NEW STRATEGIC DESTINY'}
              </h4>
              <button 
                onClick={() => setIsAddGoalModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3 font-sans text-xs">
              <div>
                <label className="text-zinc-300 font-mono block mb-1">DESTINY / GOAL TITLE</label>
                <input 
                  type="text" 
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Master Arabic Morphology & Quranic Syntax"
                  className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-mono block mb-1">DESIRED ULTIMATE OUTCOME</label>
                <textarea 
                  rows={2}
                  value={goalDesiredOutcome}
                  onChange={(e) => setGoalDesiredOutcome(e.target.value)}
                  placeholder="What concrete reality exists when this destiny is achieved?"
                  className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-mono block mb-1">HORIZON TIER</label>
                  <select
                    value={goalHorizon}
                    onChange={(e) => setGoalHorizon(e.target.value)}
                    className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#c5a059] font-mono text-xs"
                  >
                    <option value="Lifetime">Life Vision / Lifelong</option>
                    <option value="10-Year">10-Year Horizon</option>
                    <option value="3-Year">3-Year Strategic Pillar</option>
                    <option value="Annual Vision">1-Year Annual OKR</option>
                    <option value="Quarterly">90-Day Quarterly Sprint</option>
                    <option value="30-Day Sprint">30-Day Sprint</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-mono block mb-1">PRIORITY</label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as GoalPriority)}
                    className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#c5a059] font-mono text-xs"
                  >
                    <option value="High">High (Core Pillar)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-mono block mb-1">TARGET COMPLETION DATE</label>
                <input 
                  type="date"
                  value={goalEstimatedCompletion}
                  onChange={(e) => setGoalEstimatedCompletion(e.target.value)}
                  className="w-full bg-[#05070d] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#c5a059] font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg font-mono text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#c5a059] hover:bg-[#d4b068] text-black font-mono font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  {editingGoal ? 'UPDATE DESTINY' : 'INSCRIBE DESTINY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
