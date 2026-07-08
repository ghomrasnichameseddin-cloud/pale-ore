import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Project, Goal, Milestone, Quest } from '../types';
import { 
  Briefcase, ArrowRight, Target, Plus, Trash2, Calendar, 
  Clock, CheckCircle, Award, ListTodo, CircleAlert
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { 
    state, addProject, updateProject, deleteProject, clearAllProjects,
    getProjectProgress, getMilestoneProgress, completeQuest, reopenQuest, deleteQuest
  } = usePOS();

  const [selectedProjId, setSelectedProjId] = useState<string | null>(state.projects[0]?.id || null);
  
  // Empty all projects confirmation state
  const [showEmptyProjectsConfirm, setShowEmptyProjectsConfirm] = useState(false);
  
  // Create Project States
  const [showCreateProj, setShowCreateProj] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjGoalId, setNewProjGoalId] = useState('');
  const [newProjEstTime, setNewProjEstTime] = useState('20 hours');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Edit Project States
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [editProjName, setEditProjName] = useState('');
  const [editProjEstTime, setEditProjEstTime] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');

  const selectedProj = state.projects.find(p => p.id === selectedProjId);
  const relatedGoal = selectedProj ? state.goals.find(g => g.id === selectedProj.goalId) : null;

  // Handle Project Creation
  const handleCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjGoalId) return;

    const id = addProject({
      goalId: newProjGoalId,
      name: newProjName,
      status: 'Active',
      estimatedTime: newProjEstTime,
      description: newProjDesc
    });

    setNewProjName('');
    setNewProjGoalId('');
    setNewProjEstTime('20 hours');
    setNewProjDesc('');
    setShowCreateProj(false);
    setSelectedProjId(id);
  };

  // Start editing project
  const startEditing = () => {
    if (!selectedProj) return;
    setEditProjName(selectedProj.name);
    setEditProjEstTime(selectedProj.estimatedTime);
    setEditProjDesc(selectedProj.description || '');
    setIsEditingProj(true);
  };

  // Save project edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjId || !editProjName.trim()) return;

    updateProject(selectedProjId, {
      name: editProjName,
      estimatedTime: editProjEstTime,
      description: editProjDesc
    });
    setIsEditingProj(false);
  };

  // Delete project
  const handleDeleteProj = () => {
    if (!selectedProjId) return;
    const projToDelete = state.projects.find(p => p.id === selectedProjId);
    if (!projToDelete) return;

    if (window.confirm(`Are you sure you want to delete the project "${projToDelete.name}"? This action is permanent.`)) {
      deleteProject(selectedProjId);
      
      const remaining = state.projects.filter(p => p.id !== selectedProjId);
      setSelectedProjId(remaining[0]?.id || null);
    }
  };

  // Handle Purge/Empty All Projects
  const handleEmptyAllProjects = () => {
    clearAllProjects();
    setSelectedProjId(null);
    setShowEmptyProjectsConfirm(false);
  };

  // Derived project variables
  const projQuests = selectedProj ? state.quests.filter(q => q.projectId === selectedProj.id) : [];
  const completedQuests = projQuests.filter(q => q.status === 'Completed');
  const remainingQuests = projQuests.filter(q => q.status === 'Active');
  
  const projMilestones = selectedProj ? state.milestones.filter(m => m.projectId === selectedProj.id) : [];
  const projXpEarned = completedQuests.reduce((sum, q) => sum + q.xp, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="projects-view-root">
      
      {/* LEFT PANEL: PROJECT SELECTOR & CREATOR */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">PROJECTS_LOG ({state.projects.length})</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setShowCreateProj(!showCreateProj); setShowEmptyProjectsConfirm(false); }}
              className="text-xs font-mono bg-zinc-900 border border-white/5 hover:border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              NEW
            </button>
            {state.projects.length > 0 && (
              <button 
                onClick={() => { setShowEmptyProjectsConfirm(!showEmptyProjectsConfirm); setShowCreateProj(false); }}
                className="text-xs font-mono bg-zinc-900 border border-white/5 hover:border-rose-500/30 text-rose-400 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                EMPTY ALL
              </button>
            )}
          </div>
        </div>

        {/* Empty All Projects Confirmation */}
        {showEmptyProjectsConfirm && (
          <div className="p-4 bg-zinc-950 border border-rose-500/20 rounded-lg space-y-3">
            <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> PURGE ALL PROJECTS
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Are you sure you want to empty all projects? This clears all existing projects and milestones, and unlinks them from quests. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowEmptyProjectsConfirm(false)}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                CANCEL
              </button>
              <button 
                type="button"
                onClick={handleEmptyAllProjects}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-mono px-3 py-1 rounded transition-colors"
              >
                CONFIRM_PURGE
              </button>
            </div>
          </div>
        )}

        {/* Project Creation Form */}
        {showCreateProj && (
          <form onSubmit={handleCreateProj} className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-3">
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">INITIATE_PROJECT_PROMPT</h4>
            
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Project Title</label>
              <input 
                type="text" 
                placeholder="Portfolio design v2..."
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Project Description</label>
              <textarea 
                placeholder="Core objectives & roadmap..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Parent Goal</label>
              <select 
                value={newProjGoalId}
                onChange={(e) => setNewProjGoalId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                required
              >
                <option value="">Select Target Goal</option>
                {state.goals.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Est. Duration (Text)</label>
              <input 
                type="text" 
                placeholder="20 hours / 4 weeks..."
                value={newProjEstTime}
                onChange={(e) => setNewProjEstTime(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setShowCreateProj(false)}
                className="text-[10px] font-mono text-zinc-500 px-2 py-1"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-3 py-1 rounded"
              >
                INIT
              </button>
            </div>
          </form>
        )}

        {/* Project Selector List */}
        <div className="space-y-2">
          {state.projects.map(proj => {
            const progress = getProjectProgress(proj.id);
            const isSelected = proj.id === selectedProjId;
            const parentGoal = state.goals.find(g => g.id === proj.goalId);

            return (
              <div
                key={proj.id}
                className={`group relative p-3.5 rounded-lg border text-xs transition-all flex flex-col gap-3 ${
                  isSelected 
                    ? 'bg-zinc-900/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                    : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Clickable area for selection */}
                <div
                  onClick={() => {
                    setSelectedProjId(proj.id);
                    setIsEditingProj(false);
                  }}
                  className="cursor-pointer space-y-3 flex-1 w-full text-left"
                >
                  <div className="space-y-1 pr-6">
                    {parentGoal && (
                      <span className="text-[9px] font-mono text-zinc-500 uppercase truncate block max-w-full">
                        🎯 {parentGoal.name}
                      </span>
                    )}
                    <h4 className={`font-sans font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {proj.name}
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>COMPLETED</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Individual separate delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete the project "${proj.name}"? This action is permanent.`)) {
                      deleteProject(proj.id);
                      if (selectedProjId === proj.id) {
                        const remaining = state.projects.filter(p => p.id !== proj.id);
                        setSelectedProjId(remaining[0]?.id || null);
                      }
                    }
                  }}
                  className="absolute top-3.5 right-3.5 p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-zinc-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: PROJECT DETAIL MONITOR */}
      <div className="lg:col-span-3 space-y-6">
        {selectedProj ? (
          <div className="glass-panel rounded-lg p-6 space-y-6">
            
            {/* PROJECT NAME HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-cyan-400 shrink-0" />
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT_MONITOR_NODE</span>
                </div>

                {isEditingProj ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3 mt-2">
                    <input 
                      type="text" 
                      value={editProjName}
                      onChange={(e) => setEditProjName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-sm text-white font-sans font-bold"
                      required
                    />

                    <input 
                      type="text" 
                      value={editProjEstTime}
                      onChange={(e) => setEditProjEstTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      placeholder="Estimated hours (e.g. 20 hours)"
                    />

                    <textarea 
                      value={editProjDesc}
                      onChange={(e) => setEditProjDesc(e.target.value)}
                      rows={2}
                      placeholder="Project description..."
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-300 font-sans focus:outline-none"
                    />

                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProj(false)}
                        className="text-[10px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="submit" 
                        className="bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono px-3 py-1 rounded"
                      >
                        UPDATE
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="font-display text-xl font-bold text-white uppercase mt-1">
                      {selectedProj.name}
                    </h3>

                    {selectedProj.description && (
                      <p className="text-xs text-zinc-400 font-sans mt-1.5 whitespace-pre-wrap leading-relaxed">
                        {selectedProj.description}
                      </p>
                    )}
                    
                    {relatedGoal && (
                      <p className="text-xs text-zinc-400 font-sans flex items-center gap-1 mt-1">
                        <Target className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                        Related Goal: <span className="text-cyan-400 font-bold uppercase">{relatedGoal.name}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {!isEditingProj && (
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={startEditing}
                    className="p-1.5 bg-zinc-900 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white rounded text-xs flex items-center gap-1.5 font-mono"
                  >
                    EDIT
                  </button>
                  <button 
                    onClick={handleDeleteProj}
                    className="p-1.5 bg-zinc-900 border border-white/5 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 rounded text-xs flex items-center gap-1.5 font-mono"
                  >
                    DELETE
                  </button>
                </div>
              )}
            </div>

            {/* THREE COLUMN SUMMARY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">PROJECT COMPLETION</span>
                <p className="text-3xl font-display font-bold text-white mt-2">
                  {getProjectProgress(selectedProj.id)}%
                </p>
                <div className="w-full bg-zinc-900 rounded-full h-1 mt-3">
                  <div className="bg-cyan-500 h-full rounded" style={{ width: `${getProjectProgress(selectedProj.id)}%` }} />
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">XP RECOLLECTED</span>
                <p className="text-3xl font-display font-bold text-emerald-400 mt-2">
                  +{projXpEarned} XP
                </p>
                <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                  From {completedQuests.length} solved directives
                </p>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">ESTIMATED CYCLE LIMIT</span>
                <p className="text-lg font-mono font-bold text-white mt-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  {selectedProj.estimatedTime || 'Undefined budget'}
                </p>
                <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                  Active remaining quests: {remainingQuests.length}
                </p>
              </div>
            </div>

            {/* LOWER SPLIT: MILESTONES & ACTIVE QUESTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* MILESTONES LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-cyan-400" />
                  ASSOCIATED MILESTONES ({projMilestones.length})
                </h4>

                <div className="space-y-2">
                  {projMilestones.length === 0 ? (
                    <p className="text-xs font-mono text-zinc-600">No milestone logs configured for this project structure.</p>
                  ) : (
                    projMilestones.map(mile => {
                      const progress = getMilestoneProgress(mile.id);
                      return (
                        <div key={mile.id} className="p-3 bg-zinc-950 border border-white/5 rounded flex justify-between items-center text-xs">
                          <div>
                            <span className="text-white font-sans font-medium">{mile.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono ${progress === 100 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {progress === 100 ? 'ACHIEVED' : 'ACTIVE'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* REMAINING QUESTS IN PROJECT */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="h-4 w-4 text-cyan-400" />
                  ACTIVE WORK DIRECTIVES ({remainingQuests.length})
                </h4>

                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {remainingQuests.length === 0 ? (
                    <div className="p-4 border border-dashed border-white/5 rounded text-center">
                      <p className="text-xs font-mono text-zinc-600">All work directives solved for this block.</p>
                    </div>
                  ) : (
                    remainingQuests.map(quest => (
                      <div key={quest.id} className="p-3 bg-zinc-950/60 border border-white/5 rounded-lg flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <p className="text-white font-sans font-medium leading-tight">{quest.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">{quest.difficulty} Difficulty</span>
                            {quest.recurrence && quest.recurrence !== 'None' && (
                              <>
                                <span className="text-[9px] font-mono text-zinc-600">•</span>
                                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">🔁 {quest.recurrence}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">+{quest.xp} XP</span>
                          <button 
                            onClick={() => completeQuest(quest.id)}
                            className="bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 border border-white/5 p-1 rounded font-mono text-[9px]"
                          >
                            SOLVE
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-panel rounded-lg p-10 text-center space-y-2">
            <Briefcase className="h-8 w-8 text-zinc-600 mx-auto" />
            <h3 className="font-display text-sm font-bold text-white uppercase">No Project Selected</h3>
            <p className="text-xs text-zinc-500 font-mono">Create or choose a project parameter on the left panel to begin monitoring.</p>
          </div>
        )}
      </div>

    </div>
  );
};
