import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { Project, CampaignHealth, CampaignDependency, CampaignDependencyType, Quest } from '../../types';
import { 
  Briefcase, Plus, CheckSquare, Clock, AlertTriangle, 
  ShieldAlert, GitBranch, ArrowRight, X, Trash2, Edit3,
  Calendar, Layers, FileText, CheckCircle2, ChevronDown, ChevronRight,
  TrendingUp, Activity
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString } from '../../utils/dateUtils';

interface OperationalCampaignsManagerProps {
  onNavigateToCodex?: (docId: string) => void;
  onNavigateToQuests?: () => void;
}

export const OperationalCampaignsManager: React.FC<OperationalCampaignsManagerProps> = ({
  onNavigateToCodex,
  onNavigateToQuests
}) => {
  const { 
    state, addProject, updateProject, deleteProject, getProjectProgress, 
    addQuest, completeQuest, reopenQuest, addSystemMessage 
  } = usePOS();

  const [healthFilter, setHealthFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  // New Campaign Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formGoalId, setFormGoalId] = useState<string>('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formBudgetHours, setFormBudgetHours] = useState(20);
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Quick inputs inside expanded campaign
  const [newDeliverableText, setNewDeliverableText] = useState('');
  const [newDirectiveText, setNewDirectiveText] = useState('');
  const [newStatusUpdateText, setNewStatusUpdateText] = useState('');
  const [depTargetCampaignId, setDepTargetCampaignId] = useState('');
  const [depType, setDepType] = useState<CampaignDependencyType>('Depends On');

  const filteredProjects = useMemo(() => {
    return state.projects.filter(p => {
      if (healthFilter === 'All') return p.status !== 'Archived';
      if (healthFilter === 'Blocked') return p.campaignHealth === 'Blocked';
      if (healthFilter === 'At Risk') return p.campaignHealth === 'At Risk';
      if (healthFilter === 'Healthy') return p.campaignHealth === 'Healthy' || !p.campaignHealth;
      if (healthFilter === 'Completed') return p.status === 'Completed';
      return true;
    });
  }, [state.projects, healthFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addProject({
      name: formName.trim(),
      description: formDescription.trim(),
      goalId: formGoalId || '',
      deadline: formDeadline || undefined,
      estimatedTime: `${formBudgetHours} hours`,
      priority: formPriority,
      timeBudgetHours: formBudgetHours,
      campaignHealth: 'Healthy',
      status: 'Active',
      dependencies: [],
      dependenciesList: [],
      deliverables: [],
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: getLocalDateString(),
          note: 'Campaign initiated in strategic command.',
          content: 'Campaign initiated in strategic command.',
          healthSnapshot: 'Healthy'
        }
      ],
      campaignUpdates: [
        {
          id: `upd-${Date.now()}`,
          date: getLocalDateString(),
          note: 'Campaign initiated in strategic command.',
          content: 'Campaign initiated in strategic command.',
          healthSnapshot: 'Healthy'
        }
      ]
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Operational Campaign Launched',
      content: `Operational Campaign launched: "${formName.trim()}".`,
      priority: 'medium'
    });
    setIsCreateModalOpen(false);
    setFormName('');
    setFormDescription('');
    setFormGoalId('');
    setFormDeadline('');
  };

  const handleAddDeliverable = (project: Project) => {
    if (!newDeliverableText.trim()) return;
    const current = (project.deliverables || []) as any[];
    const updated = [
      ...current,
      {
        id: `deliv-${Date.now()}`,
        title: newDeliverableText.trim(),
        isCompleted: false,
        dueDate: project.deadline || undefined
      }
    ];
    updateProject(project.id, { deliverables: updated });
    setNewDeliverableText('');
  };

  const toggleDeliverable = (project: Project, delivId: string) => {
    const updated = ((project.deliverables || []) as any[]).map((d: any) => {
      const id = typeof d === 'string' ? d : d.id;
      if (id === delivId) {
        if (typeof d === 'string') {
          return { id: d, title: d, isCompleted: true };
        }
        return { ...d, isCompleted: !d.isCompleted };
      }
      return d;
    });
    updateProject(project.id, { deliverables: updated });
  };

  const handleAddDirective = (project: Project) => {
    if (!newDirectiveText.trim()) return;
    addQuest({
      name: newDirectiveText.trim(),
      description: `Directive for ${project.name}`,
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 100,
      projectId: project.id,
      goalId: project.goalId || null,
      milestoneId: null,
      relatedSkills: [],
      type: 'Main',
      recurrence: 'None',
      deadline: project.deadline || null
    });
    setNewDirectiveText('');
  };

  const handleAddDependency = (project: Project) => {
    if (!depTargetCampaignId) return;
    const currentList = project.dependenciesList || [];
    if (currentList.some(d => d.targetCampaignId === depTargetCampaignId)) return;

    const newDep: CampaignDependency = {
      targetCampaignId: depTargetCampaignId,
      type: depType,
      notes: ''
    };
    updateProject(project.id, {
      dependenciesList: [...currentList, newDep]
    });
    setDepTargetCampaignId('');
  };

  const removeDependency = (project: Project, targetId: string) => {
    const updated = (project.dependenciesList || []).filter(d => d.targetCampaignId !== targetId);
    updateProject(project.id, { dependenciesList: updated });
  };

  const handleAddStatusUpdate = (project: Project) => {
    if (!newStatusUpdateText.trim()) return;
    const current = project.campaignUpdates || [];
    const update = {
      id: `upd-${Date.now()}`,
      date: getLocalDateString(),
      note: newStatusUpdateText.trim(),
      healthSnapshot: project.campaignHealth || 'Healthy'
    };
    updateProject(project.id, {
      campaignUpdates: [update, ...current]
    });
    setNewStatusUpdateText('');
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border-[#c5a059]/30 bg-[#07080c]/90">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
              OPERATIONAL CAMPAIGNS & DIRECTIVES
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
              {state.projects.length} TOTAL
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Answers: "WHAT MAJOR OPERATION MOVES ME THERE?" • Tactical execution pipelines with dependency graphs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Health Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-mono bg-[#0b0d13] p-1 rounded-xl border border-white/10">
            {['All', 'Healthy', 'At Risk', 'Blocked', 'Completed'].map(filter => (
              <button
                key={filter}
                onClick={() => setHealthFilter(filter)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  healthFilter === filter
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-cyan-600/20"
          >
            <Plus className="h-4 w-4" /> Launch Campaign
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border-white/5 text-zinc-500 font-mono text-xs">
            No operational campaigns found matching this filter.
          </div>
        ) : (
          filteredProjects.map(project => {
            const isExpanded = expandedCampaignId === project.id;
            const progress = getProjectProgress(project.id);
            const parentGoal = state.goals.find(g => g.id === project.goalId);
            const isBlocked = project.campaignHealth === 'Blocked';
            const isAtRisk = project.campaignHealth === 'At Risk';
            const projectQuests = state.quests.filter(q => q.projectId === project.id);
            const openQuests = projectQuests.filter(q => q.status !== 'Completed');
            const totalHoursLogged = (projectQuests.reduce((sum, q) => sum + (q.actualMinutesWorked || q.timeSpent || 0), 0) / 60).toFixed(1);
            const budgetHours = project.timeBudgetHours || 20;

            // Check if any upstream dependencies are blocked
            const blockedDeps = (project.dependenciesList || []).filter(dep => {
              const target = state.projects.find(p => p.id === dep.targetCampaignId);
              return target && (target.campaignHealth === 'Blocked' || target.status === 'Paused');
            });

            return (
              <div
                key={project.id}
                className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
                  isBlocked
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isAtRisk
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-white/10 bg-[#0b0d13] hover:border-cyan-500/40'
                }`}
              >
                {/* Main Card Header */}
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-[#0e1017]"
                  onClick={() => setExpandedCampaignId(isExpanded ? null : project.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button type="button" className="text-zinc-400 p-0.5">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-zinc-500" />
                      )}
                    </button>

                    <Briefcase className={`h-4 w-4 shrink-0 ${isBlocked ? 'text-rose-400' : 'text-cyan-400'}`} />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-display font-bold text-white truncate">
                          {project.name}
                        </span>

                        {/* Health Selector Dropdown */}
                        <div onClick={e => e.stopPropagation()}>
                          <select
                            value={project.campaignHealth || 'Healthy'}
                            onChange={e => updateProject(project.id, { campaignHealth: e.target.value as CampaignHealth })}
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer border ${
                              isBlocked
                                ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                                : isAtRisk
                                ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            <option value="Healthy">HEALTHY</option>
                            <option value="At Risk">AT RISK</option>
                            <option value="Blocked">BLOCKED</option>
                            <option value="Completed">COMPLETED</option>
                          </select>
                        </div>

                        {/* Parent Goal Chip */}
                        {parentGoal ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#fef08a] border border-white/10">
                            Anchor: {parentGoal.name}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                            UNANCHORED ORPHAN
                          </span>
                        )}

                        {blockedDeps.length > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-900 text-rose-200 border border-rose-500 animate-pulse">
                            {blockedDeps.length} UPSTREAM BLOCKS
                          </span>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-xs font-mono text-zinc-400 truncate mt-0.5 max-w-xl">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side stats */}
                  <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 block">Logged / Budget</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {totalHoursLogged}h / {budgetHours}h
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 block">Directives</span>
                      <span className="text-xs font-mono font-bold text-white">
                        {openQuests.length} open
                      </span>
                    </div>

                    <div className="w-16 bg-white/5 h-2 rounded-full overflow-hidden shrink-0">
                      <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>

                    <span className="text-xs font-mono font-bold text-cyan-400 w-10 text-right">
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="p-4 border-t border-white/5 bg-[#07080c] space-y-4">
                    {/* Top Row: Parent Anchor Selector + Deadline + Time Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#0b0d13] rounded-xl border border-white/5 text-xs font-mono">
                      <div>
                        <label className="text-zinc-500 block mb-1">Parent Grand Destiny:</label>
                        <select
                          value={project.goalId || ''}
                          onChange={e => updateProject(project.id, { goalId: e.target.value || null })}
                          className="w-full p-1.5 bg-[#07080c] border border-white/10 rounded-lg text-white"
                        >
                          <option value="">-- No Anchor (Orphan) --</option>
                          {state.goals.map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.horizon})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-500 block mb-1">Target Deadline:</label>
                        <input
                          type="date"
                          value={project.deadline || ''}
                          onChange={e => updateProject(project.id, { deadline: e.target.value || null })}
                          className="w-full p-1.5 bg-[#07080c] border border-white/10 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-500 block mb-1">Time Budget (Hours):</label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={budgetHours}
                          onChange={e => updateProject(project.id, { timeBudgetHours: Number(e.target.value) })}
                          className="w-full p-1.5 bg-[#07080c] border border-white/10 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    {/* Dependencies Section */}
                    <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                          <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                          Strategic Dependencies Graph
                        </span>
                      </div>

                      {/* Dependencies list */}
                      <div className="flex flex-wrap gap-2">
                        {(project.dependenciesList || []).map(dep => {
                          const target = state.projects.find(p => p.id === dep.targetCampaignId);
                          const isTargetBlocked = target && (target.campaignHealth === 'Blocked' || target.status === 'Paused');

                          return (
                            <div 
                              key={dep.targetCampaignId}
                              className={`text-xs font-mono px-2.5 py-1 rounded-lg border flex items-center gap-2 ${
                                isTargetBlocked
                                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                                  : 'bg-[#07080c] border-white/10 text-zinc-300'
                              }`}
                            >
                              <span className="text-[10px] text-cyan-400 uppercase">{dep.type}:</span>
                              <span className="font-bold">{target ? target.name : 'Unknown Campaign'}</span>
                              {isTargetBlocked && (
                                <span className="text-[9px] text-rose-400 font-bold">[BLOCKED]</span>
                              )}
                              <button 
                                onClick={() => removeDependency(project, dep.targetCampaignId)}
                                className="text-zinc-500 hover:text-rose-400 ml-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Dependency Controls */}
                      <div className="flex items-center gap-2 pt-1">
                        <select
                          value={depType}
                          onChange={e => setDepType(e.target.value as CampaignDependencyType)}
                          className="p-1.5 text-xs font-mono bg-[#07080c] border border-white/10 rounded-lg text-white"
                        >
                          <option value="Depends On">Depends On (Hard Block)</option>
                          <option value="Blocks">Blocks</option>
                          <option value="Supports">Supports</option>
                          <option value="Informs">Informs</option>
                          <option value="Derived From">Derived From</option>
                        </select>

                        <select
                          value={depTargetCampaignId}
                          onChange={e => setDepTargetCampaignId(e.target.value)}
                          className="flex-1 p-1.5 text-xs font-mono bg-[#07080c] border border-white/10 rounded-lg text-white"
                        >
                          <option value="">-- Select Target Campaign --</option>
                          {state.projects.filter(p => p.id !== project.id).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleAddDependency(project)}
                          disabled={!depTargetCampaignId}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg text-xs font-mono font-bold"
                        >
                          Link
                        </button>
                      </div>
                    </div>

                    {/* Deliverables & Directives 2-Column Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Deliverables / Milestones */}
                      <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-2">
                        <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                          Deliverable Milestones
                        </span>

                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {((project.deliverables || []) as any[]).map((d: any, idx: number) => {
                            const delivId = typeof d === 'string' ? `d-${idx}` : d.id;
                            const delivTitle = typeof d === 'string' ? d : d.title;
                            const isCompleted = typeof d === 'string' ? false : !!d.isCompleted;

                            return (
                              <div 
                                key={delivId}
                                onClick={() => toggleDeliverable(project, delivId)}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#07080c] border border-white/5 text-xs font-mono cursor-pointer hover:border-cyan-500/40"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckSquare className={`h-3.5 w-3.5 ${isCompleted ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                  <span className={isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                                    {delivTitle}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add deliverable..."
                            value={newDeliverableText}
                            onChange={e => setNewDeliverableText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddDeliverable(project)}
                            className="flex-1 p-1.5 text-xs font-mono bg-[#07080c] border border-white/10 rounded-lg text-white placeholder:text-zinc-600"
                          />
                          <button
                            onClick={() => handleAddDeliverable(project)}
                            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Directives (Quests) */}
                      <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-2">
                        <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                          Active Directives ({projectQuests.length})
                        </span>

                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {projectQuests.map(q => (
                            <div 
                              key={q.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#07080c] border border-white/5 text-xs font-mono"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  onClick={() => q.status === 'Completed' ? reopenQuest(q.id) : completeQuest(q.id)}
                                  className="text-zinc-500 hover:text-emerald-400"
                                >
                                  <CheckSquare className={`h-3.5 w-3.5 ${q.status === 'Completed' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                </button>
                                <span className={`truncate ${q.status === 'Completed' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                  {q.name}
                                </span>
                              </div>
                              <span className="text-[9px] text-zinc-500 shrink-0">
                                {q.difficulty} • {q.actualMinutesWorked || q.timeSpent || 0}m
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add directive quest..."
                            value={newDirectiveText}
                            onChange={e => setNewDirectiveText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddDirective(project)}
                            className="flex-1 p-1.5 text-xs font-mono bg-[#07080c] border border-white/10 rounded-lg text-white placeholder:text-zinc-600"
                          />
                          <button
                            onClick={() => handleAddDirective(project)}
                            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Operational Log Updates */}
                    <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-2">
                      <span className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                        Dated Operational Logs
                      </span>

                      <div className="space-y-1.5">
                        {((project.campaignUpdates || project.updates || []) as any[]).slice(0, 3).map(upd => (
                          <div key={upd.id} className="text-xs font-mono p-2 bg-[#07080c] rounded-lg border border-white/5 flex items-start gap-2">
                            <span className="text-[10px] text-cyan-400 font-bold shrink-0">{upd.date}:</span>
                            <span className="text-zinc-300 flex-1">{upd.note || upd.content}</span>
                            <span className="text-[9px] text-zinc-500 shrink-0 uppercase">{upd.healthSnapshot || upd.health}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Log operational update note..."
                          value={newStatusUpdateText}
                          onChange={e => setNewStatusUpdateText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddStatusUpdate(project)}
                          className="flex-1 p-1.5 text-xs font-mono bg-[#07080c] border border-white/10 rounded-lg text-white placeholder:text-zinc-600"
                        />
                        <button
                          onClick={() => handleAddStatusUpdate(project)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono"
                        >
                          Log Update
                        </button>
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          if (confirm(`Archive/Delete Campaign "${project.name}"?`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Archive Campaign
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Launch Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-cyan-500/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#38bdf8" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  LAUNCH OPERATIONAL CAMPAIGN
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Campaign Operational Codename:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Campaign: Production LLM Evaluation Harness"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Parent Grand Destiny Anchor:</label>
                <select
                  value={formGoalId}
                  onChange={e => setFormGoalId(e.target.value)}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="">-- Select Grand Destiny --</option>
                  {state.goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.horizon})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Scope & Objective:</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Specify clear boundaries, critical path, and deliverable conditions."
                  rows={2}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Time Budget (Hours):</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formBudgetHours}
                    onChange={e => setFormBudgetHours(Number(e.target.value))}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Deadline Date:</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
