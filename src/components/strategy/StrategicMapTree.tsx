import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { Goal, Project, Quest, PlanningDocument } from '../../types';
import { 
  GitBranch, Target, Briefcase, CheckSquare, ChevronRight, 
  ChevronDown, Search, Filter, Layers, BookOpen, FlaskConical,
  Award, Clock, AlertTriangle, ShieldAlert, Plus, Zap
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';

interface StrategicMapTreeProps {
  onNavigateToCampaign?: (campaignId: string) => void;
  onNavigateToDestiny?: (destinyId: string) => void;
  onNavigateToCodex?: (docId: string) => void;
}

export const StrategicMapTree: React.FC<StrategicMapTreeProps> = ({
  onNavigateToCampaign,
  onNavigateToDestiny,
  onNavigateToCodex
}) => {
  const { state, getGoalProgress, getProjectProgress, addQuest } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('All');
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [quickDirectiveProjectId, setQuickDirectiveProjectId] = useState<string | null>(null);
  const [quickDirectiveName, setQuickDirectiveName] = useState('');

  const toggleGoal = (id: string) => {
    setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allGoals: Record<string, boolean> = {};
    const allProjects: Record<string, boolean> = {};
    state.goals.forEach(g => { allGoals[g.id] = true; });
    state.projects.forEach(p => { allProjects[p.id] = true; });
    setExpandedGoals(allGoals);
    setExpandedProjects(allProjects);
  };

  const collapseAll = () => {
    setExpandedGoals({});
    setExpandedProjects({});
  };

  const handleCreateDirective = (projectId: string) => {
    if (!quickDirectiveName.trim()) return;
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    addQuest({
      name: quickDirectiveName.trim(),
      description: `Strategic directive for campaign: ${project.name}`,
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 100,
      projectId,
      goalId: project.goalId || null,
      milestoneId: null,
      relatedSkills: [],
      type: 'Main',
      recurrence: 'None',
      deadline: null
    });

    setQuickDirectiveName('');
    setQuickDirectiveProjectId(null);
  };

  const filteredGoals = useMemo(() => {
    return state.goals.filter(goal => {
      const matchesSearch = !searchQuery.trim() || 
        goal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const horizon = (goal.horizon || '').toLowerCase();
      let matchesHorizon = true;
      if (selectedHorizon === '30-Day') matchesHorizon = horizon.includes('30-day');
      else if (selectedHorizon === 'Quarterly') matchesHorizon = horizon.includes('quarter');
      else if (selectedHorizon === 'Annual') matchesHorizon = horizon.includes('annual');
      else if (selectedHorizon === 'Lifetime') matchesHorizon = horizon.includes('life');

      return matchesSearch && matchesHorizon;
    });
  }, [state.goals, searchQuery, selectedHorizon]);

  return (
    <div className="glass-panel border-[#c5a059]/30 bg-[#07080c]/95 p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-2xl">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[#c5a059]" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              STRATEGIC CASCADE & MAP TREE
            </h3>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
              {state.goals.length} DESTINIES • {state.projects.length} CAMPAIGNS
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Hierarchical cascade: Horizon Vision → Grand Destiny → Operational Campaign → Directives & Codex Knowledge.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search strategic tree..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs font-mono bg-[#0b0d13] border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 w-48"
            />
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono bg-[#0b0d13] p-0.5 rounded-lg border border-white/10">
            {['All', 'Lifetime', 'Annual', 'Quarterly', '30-Day'].map(horizon => (
              <button
                key={horizon}
                onClick={() => setSelectedHorizon(horizon)}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  selectedHorizon === horizon 
                    ? 'bg-[#c5a059] text-black font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono">
            <button
              onClick={expandAll}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded border border-white/10 cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded border border-white/10 cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="space-y-3 pt-1">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-zinc-500">
            No grand destinies found matching the current horizon or search filter.
          </div>
        ) : (
          filteredGoals.map(goal => {
            const isGoalExpanded = expandedGoals[goal.id] !== false; // default open
            const progress = getGoalProgress(goal.id);
            const attachedCampaigns = state.projects.filter(p => p.goalId === goal.id);
            const linkedDocs = state.planningDocuments.filter(d => d.linkedGoals?.includes(goal.id));

            return (
              <div 
                key={goal.id} 
                className="bg-[#0b0d13] border border-white/10 rounded-xl overflow-hidden transition-all hover:border-[#c5a059]/40"
              >
                {/* Destiny Row */}
                <div 
                  className="p-3.5 flex items-center justify-between gap-3 bg-[#0e1017] cursor-pointer select-none"
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      type="button" 
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      {isGoalExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#c5a059]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-zinc-500" />
                      )}
                    </button>

                    <Target className="h-4 w-4 text-[#c5a059] shrink-0" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-display font-bold text-white truncate">
                          {goal.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 border border-white/10 shrink-0">
                          {goal.horizon || 'Strategic Horizon'}
                        </span>
                        {(goal.health || goal.destinyHealth) && (
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            (goal.health || goal.destinyHealth) === 'On Track'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : (goal.health || goal.destinyHealth) === 'At Risk'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}>
                            {(goal.health || goal.destinyHealth)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5 max-w-xl">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side stats */}
                  <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400 block">Progress</span>
                      <span className="text-xs font-mono font-bold text-[#fef08a]">{progress}%</span>
                    </div>

                    <div className="w-16 bg-white/5 h-2 rounded-full overflow-hidden shrink-0">
                      <div className="bg-[#c5a059] h-full rounded-full" style={{ width: `${progress}%` }} />
                    </div>

                    {onNavigateToDestiny && (
                      <button
                        onClick={() => onNavigateToDestiny(goal.id)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-[#fef08a] px-2 py-1 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Tree: Operational Campaigns */}
                {isGoalExpanded && (
                  <div className="p-3 pl-8 space-y-3 border-t border-white/5 bg-[#07080c]">
                    {attachedCampaigns.length === 0 ? (
                      <div className="p-3 rounded-lg bg-amber-950/10 border border-amber-500/20 text-xs font-mono text-amber-300/80 flex items-center justify-between">
                        <span>No operational campaigns attached to this grand destiny.</span>
                      </div>
                    ) : (
                      attachedCampaigns.map(campaign => {
                        const isProjExpanded = expandedProjects[campaign.id] || false;
                        const campProgress = getProjectProgress(campaign.id);
                        const campQuests = state.quests.filter(q => q.projectId === campaign.id);
                        const activeQuests = campQuests.filter(q => q.status !== 'Completed');
                        const isBlocked = campaign.campaignHealth === 'Blocked';
                        const isAtRisk = campaign.campaignHealth === 'At Risk';

                        return (
                          <div 
                            key={campaign.id}
                            className={`rounded-lg border transition-all ${
                              isBlocked
                                ? 'bg-rose-950/15 border-rose-500/40'
                                : isAtRisk
                                ? 'bg-amber-950/15 border-amber-500/30'
                                : 'bg-[#0b0d13] border-white/5'
                            }`}
                          >
                            {/* Campaign Header */}
                            <div 
                              className="p-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                              onClick={() => toggleProject(campaign.id)}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button type="button" className="text-zinc-500 p-0.5">
                                  {isProjExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-zinc-300" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                                  )}
                                </button>
                                <Briefcase className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-zinc-200 truncate">
                                      {campaign.name}
                                    </span>
                                    <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                      isBlocked 
                                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                        : isAtRisk
                                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    }`}>
                                      {campaign.campaignHealth || 'HEALTHY'}
                                    </span>
                                    {campaign.deadline && (
                                      <span className="text-[8px] font-mono text-zinc-500 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" /> {campaign.deadline}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0" onClick={e => e.stopPropagation()}>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {campProgress}% ({activeQuests.length} open quests)
                                </span>
                                {onNavigateToCampaign && (
                                  <button
                                    onClick={() => onNavigateToCampaign(campaign.id)}
                                    className="text-[9px] font-mono text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-white/5"
                                  >
                                    View
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Campaign Directives / Quests expansion */}
                            {isProjExpanded && (
                              <div className="p-3 pl-8 border-t border-white/5 bg-[#050608] space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                                  <span>Active Directives ({campQuests.length} total)</span>
                                  <button
                                    onClick={() => setQuickDirectiveProjectId(campaign.id)}
                                    className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-bold cursor-pointer"
                                  >
                                    <Plus className="h-3 w-3" /> Quick Directive
                                  </button>
                                </div>

                                {quickDirectiveProjectId === campaign.id && (
                                  <div className="flex items-center gap-2 p-2 bg-[#0b0d13] border border-cyan-500/30 rounded-lg">
                                    <input
                                      type="text"
                                      placeholder="Directive action name..."
                                      value={quickDirectiveName}
                                      onChange={e => setQuickDirectiveName(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && handleCreateDirective(campaign.id)}
                                      className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleCreateDirective(campaign.id)}
                                      className="px-2 py-1 bg-cyan-600 text-white rounded text-[10px] font-mono font-bold hover:bg-cyan-500"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => { setQuickDirectiveProjectId(null); setQuickDirectiveName(''); }}
                                      className="px-2 py-1 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}

                                {campQuests.length === 0 ? (
                                  <span className="text-[10px] font-mono text-zinc-600 italic block">
                                    No directives logged yet.
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    {campQuests.map(q => (
                                      <div 
                                        key={q.id}
                                        className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-white/[0.02] border border-white/5"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <CheckSquare className={`h-3.5 w-3.5 ${q.status === 'Completed' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                          <span className={`truncate ${q.status === 'Completed' ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                                            {q.name}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-zinc-500 shrink-0">
                                          {q.difficulty} • +{q.xp} XP
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
