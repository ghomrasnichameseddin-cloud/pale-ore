import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Project, Goal, Milestone, Quest } from '../types';
import { 
  Briefcase, ArrowRight, Target, Plus, Trash2, Calendar, 
  Clock, CheckCircle, Award, ListTodo, CircleAlert, Edit3
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

export const ProjectsView: React.FC = () => {
  const { 
    state, addProject, updateProject, deleteProject, clearAllProjects,
    addSubProject, updateSubProject, toggleSubProject, deleteSubProject,
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
  const [newProjTimeBudget, setNewProjTimeBudget] = useState<number>(20);
  const [newProjHealth, setNewProjHealth] = useState<'Healthy' | 'At Risk' | 'Blocked' | 'Completed'>('Healthy');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDeliverables, setNewProjDeliverables] = useState('');
  const [newProjRisks, setNewProjRisks] = useState('');

  // Edit Project States
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [editProjName, setEditProjName] = useState('');
  const [editProjEstTime, setEditProjEstTime] = useState('');
  const [editProjTimeBudget, setEditProjTimeBudget] = useState<number>(20);
  const [editProjHealth, setEditProjHealth] = useState<'Healthy' | 'At Risk' | 'Blocked' | 'Completed'>('Healthy');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjDeliverables, setEditProjDeliverables] = useState('');
  const [editProjRisks, setEditProjRisks] = useState('');

  // SubProject / Mini-Project States
  const [newSubProjName, setNewSubProjName] = useState('');
  const [newSubProjDate, setNewSubProjDate] = useState('');

  // Editing SubProject States
  const [editingSubProjId, setEditingSubProjId] = useState<string | null>(null);
  const [editSubProjName, setEditSubProjName] = useState('');
  const [editSubProjDate, setEditSubProjDate] = useState('');

  const handleAddSubProjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj || !newSubProjName.trim()) return;
    addSubProject(selectedProj.id, newSubProjName, undefined, newSubProjDate || undefined);
    setNewSubProjName('');
    setNewSubProjDate('');
  };

  const selectedProj = state.projects.find(p => p.id === selectedProjId);
  const relatedGoal = selectedProj ? state.goals.find(g => g.id === selectedProj.goalId) : null;

  // Handle Project Creation
  const handleCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjGoalId) return;

    const deliverablesList = newProjDeliverables
      ? newProjDeliverables.split('\n').map(d => d.trim()).filter(Boolean)
      : [];
    const risksList = newProjRisks
      ? newProjRisks.split('\n').map(r => r.trim()).filter(Boolean)
      : [];

    const id = addProject({
      goalId: newProjGoalId,
      name: newProjName,
      status: 'Active',
      campaignHealth: newProjHealth,
      timeBudgetHours: newProjTimeBudget || 20,
      estimatedTime: newProjEstTime || `${newProjTimeBudget || 20} hours`,
      description: newProjDesc,
      deliverables: deliverablesList,
      risks: risksList
    });

    setNewProjName('');
    setNewProjGoalId('');
    setNewProjEstTime('20 hours');
    setNewProjTimeBudget(20);
    setNewProjHealth('Healthy');
    setNewProjDesc('');
    setNewProjDeliverables('');
    setNewProjRisks('');
    setShowCreateProj(false);
    setSelectedProjId(id);
  };

  // Start editing project
  const startEditing = () => {
    if (!selectedProj) return;
    setEditProjName(selectedProj.name);
    setEditProjEstTime(selectedProj.estimatedTime || '');
    setEditProjTimeBudget(selectedProj.timeBudgetHours || 20);
    setEditProjHealth(selectedProj.campaignHealth || 'Healthy');
    setEditProjDesc(selectedProj.description || '');
    setEditProjDeliverables((selectedProj.deliverables || []).join('\n'));
    setEditProjRisks((selectedProj.risks || []).join('\n'));
    setIsEditingProj(true);
  };

  // Save project edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjId || !editProjName.trim()) return;

    const deliverablesList = editProjDeliverables
      ? editProjDeliverables.split('\n').map(d => d.trim()).filter(Boolean)
      : [];
    const risksList = editProjRisks
      ? editProjRisks.split('\n').map(r => r.trim()).filter(Boolean)
      : [];

    updateProject(selectedProjId, {
      name: editProjName,
      estimatedTime: editProjEstTime,
      timeBudgetHours: editProjTimeBudget,
      campaignHealth: editProjHealth,
      description: editProjDesc,
      deliverables: deliverablesList,
      risks: risksList
    });
    setIsEditingProj(false);
  };

  // Delete project
  const handleDeleteProj = () => {
    if (!selectedProjId) return;
    const projToDelete = state.projects.find(p => p.id === selectedProjId);
    if (!projToDelete) return;

    deleteProject(selectedProjId);
    const remaining = state.projects.filter(p => p.id !== selectedProjId);
    setSelectedProjId(remaining[0]?.id || null);
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
        <div className="flex justify-between items-center pb-2 border-b border-[#c5a059]/20">
          <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
            PROJECTS ({state.projects.length})
          </span>
          <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-1 rounded border border-[#c5a059]/45 bg-[#3a2e12] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.18)]">
            10/10 READY
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setShowCreateProj(!showCreateProj); setShowEmptyProjectsConfirm(false); }}
              className="text-xs font-mono bg-[#3a2e12] border border-[#c5a059]/40 hover:border-[#c5a059] text-[#fef08a] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <Plus className="h-3 w-3" />
              NEW
            </button>
            {state.projects.length > 0 && (
              <button 
                onClick={() => { setShowEmptyProjectsConfirm(!showEmptyProjectsConfirm); setShowCreateProj(false); }}
                className="text-xs font-mono bg-rose-950/60 border border-rose-500/30 hover:border-rose-500 text-rose-300 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                PURGE
              </button>
            )}
          </div>
        </div>

        {/* Empty All Projects Confirmation */}
        {showEmptyProjectsConfirm && (
          <div className="p-4 bg-[#1a0808] border border-rose-500/30 rounded-xl space-y-3">
            <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1 font-bold">
              <Trash2 className="h-3 w-3" /> PURGE ALL PROJECTS
            </h4>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Are you sure you want to empty all projects? This clears all existing projects and milestones, and unlinks them from directives.
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
                className="bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold px-3 py-1.5 rounded cursor-pointer"
              >
                CONFIRM_PURGE
              </button>
            </div>
          </div>
        )}

        {/* Project Creation Form */}
        {showCreateProj && (
          <form onSubmit={handleCreateProj} className="p-4 bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl space-y-3 shadow-xl">
            <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              INITIATE_PROJECT_BLUEPRINT
            </h4>
            
            <div>
              <label className="block text-[10px] font-mono text-[#c5a059] uppercase mb-1 font-bold">Campaign Title</label>
              <input 
                type="text" 
                placeholder="e.g. Celestial Astrolabe App..."
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded p-2 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Campaign Description</label>
              <textarea 
                placeholder="Core objectives & roadmap..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                rows={2}
                className="w-full bg-[#07080c] border border-white/10 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-[#c5a059] uppercase mb-1 font-bold">Parent Destiny</label>
                <select 
                  value={newProjGoalId}
                  onChange={(e) => setNewProjGoalId(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                  required
                >
                  <option value="">Select Target Destiny</option>
                  {state.goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#c5a059] uppercase mb-1 font-bold">Campaign Health</label>
                <select 
                  value={newProjHealth}
                  onChange={(e) => setNewProjHealth(e.target.value as any)}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                >
                  <option value="Healthy">Healthy (On Track)</option>
                  <option value="At Risk">At Risk (Slipping)</option>
                  <option value="Blocked">Blocked (Impediments)</option>
                  <option value="Completed">Completed (Victory)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Time Budget (Hours)</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="20"
                  value={newProjTimeBudget}
                  onChange={(e) => setNewProjTimeBudget(Number(e.target.value))}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Duration Label</label>
                <input 
                  type="text" 
                  placeholder="20 hours / 4 weeks..."
                  value={newProjEstTime}
                  onChange={(e) => setNewProjEstTime(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Key Deliverables (one per line)</label>
              <textarea 
                placeholder="Core Engine Module&#10;Tactical UI Suite&#10;End-to-End Tests"
                value={newProjDeliverables}
                onChange={(e) => setNewProjDeliverables(e.target.value)}
                rows={2}
                className="w-full bg-[#07080c] border border-white/10 rounded p-2 text-xs text-zinc-300 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Risks & Dependencies (one per line)</label>
              <textarea 
                placeholder="External API quota limit&#10;Design token approvals"
                value={newProjRisks}
                onChange={(e) => setNewProjRisks(e.target.value)}
                rows={2}
                className="w-full bg-[#07080c] border border-white/10 rounded p-2 text-xs text-zinc-300 focus:outline-none font-mono"
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
                className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] text-[10px] font-mono font-black px-3.5 py-1 rounded cursor-pointer"
              >
                ENACT CAMPAIGN
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
                className={`group relative p-3.5 rounded-xl border text-xs transition-all flex flex-col gap-3 cursor-pointer overflow-hidden ${
                  isSelected 
                    ? 'bg-[#141824]/90 border-[#c5a059] shadow-[0_0_18px_rgba(197,160,89,0.18)] ring-1 ring-[#c5a059]/40' 
                    : 'bg-[#0b0d13]/80 border-[#c5a059]/20 hover:border-[#c5a059]/40 hover:bg-[#131722]/60'
                }`}
              >
                {isSelected && (
                  <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />
                )}

                {/* Clickable area for selection */}
                <div
                  onClick={() => {
                    setSelectedProjId(proj.id);
                    setIsEditingProj(false);
                  }}
                  className="space-y-3 flex-1 w-full text-left"
                >
                  <div className="space-y-1 pr-6">
                    {parentGoal && (
                      <span className="text-[9px] font-mono text-[#c5a059] uppercase truncate block max-w-full font-bold">
                        ✦ {parentGoal.name}
                      </span>
                    )}
                    <h4 className={`font-display font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {proj.name}
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span className="text-[#c5a059]">PROGRESS</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className="rpg-progress-gold h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Individual separate delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(proj.id);
                    if (selectedProjId === proj.id) {
                      const remaining = state.projects.filter(p => p.id !== proj.id);
                      setSelectedProjId(remaining[0]?.id || null);
                    }
                  }}
                  className="absolute top-3.5 right-3.5 p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-zinc-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
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
          <div className="glass-panel rounded-xl p-6 space-y-6 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
            
            {/* PROJECT NAME HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[#c5a059]/20 pb-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold">PROJECT_MONITOR_NODE</span>
                </div>

                {isEditingProj ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3 mt-2">
                    <input 
                      type="text" 
                      value={editProjName}
                      onChange={(e) => setEditProjName(e.target.value)}
                      className="w-full bg-[#07080c] border border-[#c5a059] rounded px-3 py-1.5 text-sm text-white font-sans font-bold"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono text-[#c5a059] uppercase mb-0.5">Campaign Health</label>
                        <select 
                          value={editProjHealth}
                          onChange={(e) => setEditProjHealth(e.target.value as any)}
                          className="w-full bg-[#07080c] border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-200 font-mono"
                        >
                          <option value="Healthy">Healthy (On Track)</option>
                          <option value="At Risk">At Risk (Slipping)</option>
                          <option value="Blocked">Blocked (Impediments)</option>
                          <option value="Completed">Completed (Victory)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-0.5">Time Budget (Hours)</label>
                        <input 
                          type="number" 
                          value={editProjTimeBudget}
                          onChange={(e) => setEditProjTimeBudget(Number(e.target.value))}
                          className="w-full bg-[#07080c] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <input 
                      type="text" 
                      value={editProjEstTime}
                      onChange={(e) => setEditProjEstTime(e.target.value)}
                      className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono"
                      placeholder="Estimated duration label (e.g. 20 hours / 4 weeks)"
                    />

                    <textarea 
                      value={editProjDesc}
                      onChange={(e) => setEditProjDesc(e.target.value)}
                      rows={2}
                      placeholder="Campaign description..."
                      className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300 font-sans focus:outline-none"
                    />

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-0.5">Deliverables (one per line)</label>
                      <textarea 
                        value={editProjDeliverables}
                        onChange={(e) => setEditProjDeliverables(e.target.value)}
                        rows={2}
                        placeholder="Deliverables list..."
                        className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase mb-0.5">Risks & Dependencies (one per line)</label>
                      <textarea 
                        value={editProjRisks}
                        onChange={(e) => setEditProjRisks(e.target.value)}
                        rows={2}
                        placeholder="Risks list..."
                        className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none"
                      />
                    </div>

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
                        className="bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] text-[10px] font-mono px-3 py-1 rounded font-bold cursor-pointer"
                      >
                        SAVE CAMPAIGN
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide">
                        {selectedProj.name}
                      </h3>
                      {selectedProj.campaignHealth && (
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-black tracking-wider ${
                          selectedProj.campaignHealth === 'Healthy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          selectedProj.campaignHealth === 'At Risk' ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse' :
                          selectedProj.campaignHealth === 'Blocked' ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse' :
                          'bg-blue-950 text-blue-300 border border-blue-500/40'
                        }`}>
                          {selectedProj.campaignHealth}
                        </span>
                      )}
                    </div>

                    {selectedProj.description && (
                      <p className="text-xs text-zinc-300 font-sans mt-1.5 whitespace-pre-wrap leading-relaxed">
                        {selectedProj.description}
                      </p>
                    )}
                    
                    {relatedGoal && (
                      <p className="text-xs text-zinc-400 font-sans flex items-center gap-1.5 mt-1.5">
                        <Target className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                        Parent Destiny: <span className="text-[#e5c875] font-bold uppercase">{relatedGoal.name}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {!isEditingProj && (
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={startEditing}
                    className="p-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-[#e5c875] rounded text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    EDIT
                  </button>
                  <button 
                    onClick={handleDeleteProj}
                    className="p-1.5 bg-[#07080c] border border-rose-500/20 hover:border-rose-500 text-zinc-300 hover:text-rose-400 rounded text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    DELETE
                  </button>
                </div>
              )}
            </div>

            {/* THREE COLUMN SUMMARY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">PROJECT COMPLETION</span>
                <p className="text-3xl font-display font-extrabold text-white mt-2">
                  {getProjectProgress(selectedProj.id)}%
                </p>
                <div className="w-full bg-[#0b0d13] rounded-full h-1.5 mt-3 border border-white/5">
                  <div className="rpg-progress-gold h-full rounded-full" style={{ width: `${getProjectProgress(selectedProj.id)}%` }} />
                </div>
              </div>

              <div className="bg-[#07080c] border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">ESSENCE HARVESTED</span>
                <p className="text-3xl font-display font-extrabold text-emerald-400 mt-2">
                  +{projXpEarned} XP
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">
                  From {completedQuests.length} resolved directives
                </p>
              </div>

              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">ESTIMATED BUDGET</span>
                <p className="text-base font-mono font-bold text-white mt-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#c5a059]" />
                  {selectedProj.timeBudgetHours ? `${selectedProj.timeBudgetHours} Hours Allocated` : (selectedProj.estimatedTime || 'Undefined budget')}
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">
                  Active directives: {remainingQuests.length}
                </p>
              </div>
            </div>

            {/* STRATEGIC DELIVERABLES & RISK REGISTER */}
            {((selectedProj.deliverables && selectedProj.deliverables.length > 0) || (selectedProj.risks && selectedProj.risks.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deliverables */}
                {selectedProj.deliverables && selectedProj.deliverables.length > 0 && (
                  <div className="p-4 bg-[#07080c] border border-cyan-500/25 rounded-xl space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
                        KEY CAMPAIGN DELIVERABLES ({selectedProj.deliverables.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedProj.deliverables.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#0b0d13] border border-cyan-500/15 text-xs font-mono text-zinc-300 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-cyan-400">0{idx + 1}.</span>
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks & Dependencies */}
                {selectedProj.risks && selectedProj.risks.length > 0 && (
                  <div className="p-4 bg-[#07080c] border border-rose-500/25 rounded-xl space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-rose-300 font-bold uppercase flex items-center gap-1.5">
                        <CircleAlert className="h-3.5 w-3.5 text-rose-400" />
                        RISKS & BOTTLENECK REGISTER ({selectedProj.risks.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedProj.risks.map((risk, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#0b0d13] border border-rose-500/15 text-xs font-mono text-rose-200 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-rose-400">⚠</span>
                          <span className="truncate">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MINI-PROJECTS & SUB-PROJECTS BREAKDOWN */}
            <div className="p-4 bg-[#07080c] border border-[#c5a059]/30 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                  SUB-PROJECT DELIVERABLES ({(selectedProj.subProjects || []).filter(sp => sp.completed).length}/{(selectedProj.subProjects || []).length})
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">
                  Deconstruct project deliverables
                </span>
              </div>

              {/* Add SubProject Form */}
              <form onSubmit={handleAddSubProjSubmit} className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Enter sub-deliverable title..."
                  value={newSubProjName}
                  onChange={(e) => setNewSubProjName(e.target.value)}
                  className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
                />
                <input 
                  type="date" 
                  value={newSubProjDate}
                  onChange={(e) => setNewSubProjDate(e.target.value)}
                  className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                />
                <button 
                  type="submit"
                  className="bg-[#3a2e12] hover:bg-[#524119] text-[#fef08a] border border-[#c5a059] px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  ADD DELIVERABLE
                </button>
              </form>

              {/* SubProjects Checklist */}
              <div className="space-y-2">
                {(!selectedProj.subProjects || selectedProj.subProjects.length === 0) ? (
                  <div className="p-3 border border-dashed border-[#c5a059]/20 rounded-lg text-center bg-[#07080c]/50">
                    <p className="text-xs font-mono text-zinc-500">
                      No sub-deliverables marked yet.
                    </p>
                  </div>
                ) : (
                  selectedProj.subProjects.map(sp => {
                    const isEditing = editingSubProjId === sp.id;

                    if (isEditing) {
                      return (
                        <div key={sp.id} className="p-3 bg-[#07080c] border border-[#c5a059] rounded-lg flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={editSubProjName}
                            onChange={(e) => setEditSubProjName(e.target.value)}
                            className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                            placeholder="Deliverable Name..."
                          />
                          <input
                            type="date"
                            value={editSubProjDate}
                            onChange={(e) => setEditSubProjDate(e.target.value)}
                            className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none font-mono"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (editSubProjName.trim()) {
                                  updateSubProject(selectedProj.id, sp.id, { name: editSubProjName.trim(), targetDate: editSubProjDate || undefined });
                                }
                                setEditingSubProjId(null);
                              }}
                              className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] text-xs px-2.5 py-1 rounded font-mono font-bold cursor-pointer"
                            >
                              SAVE
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSubProjId(null)}
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
                        key={sp.id} 
                        className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                          sp.completed 
                            ? 'bg-[#07080c]/60 border-emerald-500/20 text-zinc-400' 
                            : 'bg-[#07080c] border-[#c5a059]/20 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleSubProject(selectedProj.id, sp.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition shrink-0 cursor-pointer ${
                              sp.completed 
                                ? 'bg-gradient-to-br from-[#8a6d2b] to-[#c5a059] border-[#c5a059] text-black font-black' 
                                : 'border-zinc-600 hover:border-[#c5a059] text-transparent'
                            }`}
                          >
                            ✓
                          </button>
                          <span className={`text-xs font-sans font-medium ${sp.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {sp.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {sp.targetDate && (
                            <span className="text-[10px] font-mono text-[#c5a059] bg-[#0b0d13] px-2 py-0.5 rounded border border-[#c5a059]/20">
                              📅 {sp.targetDate}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubProjId(sp.id);
                              setEditSubProjName(sp.name);
                              setEditSubProjDate(sp.targetDate || '');
                            }}
                            className="text-zinc-500 hover:text-[#e5c875] p-1 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubProject(selectedProj.id, sp.id)}
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

            {/* LOWER SPLIT: MILESTONES & ACTIVE QUESTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* MILESTONES LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Award className="h-4 w-4 text-[#c5a059]" />
                  ASSOCIATED MILESTONES ({projMilestones.length})
                </h4>

                <div className="space-y-2">
                  {projMilestones.length === 0 ? (
                    <p className="text-xs font-mono text-zinc-500">No milestone logs configured for this project structure.</p>
                  ) : (
                    projMilestones.map(mile => {
                      const progress = getMilestoneProgress(mile.id);
                      return (
                        <div key={mile.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <span className="text-white font-sans font-medium">{mile.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold ${progress === 100 ? 'text-emerald-400' : 'text-[#c5a059]'}`}>
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
                <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <ListTodo className="h-4 w-4 text-[#c5a059]" />
                  ACTIVE WORK DIRECTIVES ({remainingQuests.length})
                </h4>

                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {remainingQuests.length === 0 ? (
                    <div className="p-4 border border-dashed border-[#c5a059]/20 rounded-lg text-center bg-[#07080c]/50">
                      <p className="text-xs font-mono text-zinc-500">All work directives solved for this block.</p>
                    </div>
                  ) : (
                    remainingQuests.map(quest => (
                      <div key={quest.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-lg flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <p className="text-white font-sans font-medium leading-tight">{quest.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-[#c5a059] uppercase">{quest.difficulty} Difficulty</span>
                            {quest.recurrence && quest.recurrence !== 'None' && (
                              <>
                                <span className="text-[9px] font-mono text-zinc-600">•</span>
                                <span className="text-[9px] font-mono text-purple-300 font-bold uppercase">🔁 {quest.recurrence}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {(() => {
                            const isPenalty = quest.type === 'Penalty' || quest.xp < 0;
                            const penaltyVal = isPenalty 
                              ? (quest.xp < 0 ? quest.xp : -(quest.difficulty === 'Boss' ? 250 : quest.difficulty === 'Hard' ? 100 : quest.difficulty === 'Easy' ? 25 : 50))
                              : quest.xp;
                            return (
                              <span className={`text-xs font-mono font-bold shrink-0 ${isPenalty ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                                {isPenalty ? `${penaltyVal} XP` : `+${quest.xp} XP`}
                              </span>
                            );
                          })()}
                          <button 
                            onClick={() => completeQuest(quest.id)}
                            className="bg-[#3a2e12] hover:bg-[#524119] text-[#fef08a] border border-[#c5a059] px-2.5 py-1 rounded font-mono text-[9px] font-bold cursor-pointer"
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

            {/* Connected Planning Documents Section */}
            <div className="mt-6 pt-5 border-t border-[#c5a059]/20 space-y-3">
              <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                CODEX STRATEGIC SCROLLS & DOCUMENTS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(!state.planningDocuments || state.planningDocuments.filter(doc => doc.linkedProjects?.includes(selectedProj.id)).length === 0) ? (
                  <p className="text-xs font-mono text-zinc-400 col-span-2">No active strategic planning scrolls linked to this operation.</p>
                ) : (
                  state.planningDocuments.filter(doc => doc.linkedProjects?.includes(selectedProj.id)).map(doc => (
                    <div key={doc.id} className="p-2.5 bg-[#07080c] border border-[#c5a059]/20 rounded-lg flex justify-between items-center text-xs shadow-sm">
                      <span className="text-zinc-300 font-mono text-[10px] truncate flex items-center gap-1.5">
                        📜 {doc.path}
                      </span>
                      <span className="text-[9px] bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                        Attuned
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-panel rounded-xl p-10 text-center space-y-2 border border-[#c5a059]/20 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
            <RubElHizbIcon className="h-8 w-8 text-[#c5a059]/60 mx-auto" />
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">No Active Operation Selected</h3>
            <p className="text-xs text-[#c5a059]/80 font-mono">Inscribe or choose an operation parameter on the left panel to begin monitoring.</p>
          </div>
        )}
      </div>

    </div>
  );
};
