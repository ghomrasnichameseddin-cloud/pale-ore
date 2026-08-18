import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Skill, Goal, Project, Quest } from '../types';
import { 
  Award, Sparkles, Plus, Trash2, Edit2, CheckCircle2, 
  Circle, BarChart, ExternalLink, Target, Briefcase, ListTodo,
  Tag, Lock, Check, Crown, Search, Archive, ArchiveRestore,
  GitMerge, Layers, Filter, AlertTriangle, Unlink, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

export const SkillsView: React.FC = () => {
  const { 
    state, addSkill, updateSkillName, updateSkillTier, updateSkillParent, 
    toggleArchiveSkill, mergeSkills, deleteSkill, deleteUnusedSkills, clearAllSkills, 
    getSkillXpAndLevel, getGoalProgress, getProjectProgress, equipSkillTitle
  } = usePOS();

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(state.skills[0]?.id || null);
  
  // Custom skill creator states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillTier, setNewSkillTier] = useState<'Primary' | 'Secondary'>('Primary');
  const [newSkillParentId, setNewSkillParentId] = useState<string>('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Archived' | 'Primary' | 'Secondary' | 'Unused'>('Active');

  // Confirmation modals
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [showCleanUnusedConfirm, setShowCleanUnusedConfirm] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');

  // Editing skill name states
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [editSkillName, setEditSkillName] = useState('');

  // Secondary skills management states
  const [newSecSkillName, setNewSecSkillName] = useState('');
  const [attachSecSkillId, setAttachSecSkillId] = useState('');
  const [editingSecSkillId, setEditingSecSkillId] = useState<string | null>(null);
  const [editingSecSkillName, setEditingSecSkillName] = useState('');

  const selectedSkill = state.skills.find(s => s.id === selectedSkillId);
  const selectedSkillStats = selectedSkill ? getSkillXpAndLevel(selectedSkill.id) : null;

  // Calculate unused skills count
  const unusedSkillsList = state.skills.filter(s => {
    const hasGoal = state.goals.some(g => g.relatedSkills.includes(s.id));
    const hasQuest = state.quests.some(q => q.relatedSkills.includes(s.id));
    const hasXpHistory = state.xpHistory.some(h => h.skillIds && h.skillIds.includes(s.id));
    return !hasGoal && !hasQuest && !hasXpHistory;
  });
  const unusedSkillsCount = unusedSkillsList.length;

  const activeSkillsCount = state.skills.filter(s => !s.archived).length;
  const archivedSkillsCount = state.skills.filter(s => s.archived).length;
  const primarySkillsCount = state.skills.filter(s => (s.tier || 'Primary') === 'Primary').length;
  const secondarySkillsCount = state.skills.filter(s => s.tier === 'Secondary').length;

  // Handle skill creation
  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    // Check if skill already exists
    const duplicate = state.skills.find(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (duplicate) {
      alert('This skill track is already initialized.');
      return;
    }

    const id = addSkill(newSkillName.trim(), newSkillTier, newSkillTier === 'Secondary' && newSkillParentId ? newSkillParentId : null);
    setNewSkillName('');
    setNewSkillTier('Primary');
    setNewSkillParentId('');
    setShowAddSkill(false);
    setSelectedSkillId(id);
  };

  // Handle skill rename
  const handleRenameSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId || !editSkillName.trim()) return;

    updateSkillName(selectedSkillId, editSkillName.trim());
    setIsEditingSkill(false);
  };

  // Handle skill deletion
  const handleDeleteSkill = () => {
    if (!selectedSkillId) return;
    const skillToDelete = state.skills.find(s => s.id === selectedSkillId);
    if (!skillToDelete) return;

    if (window.confirm(`Are you sure you want to purge the discipline "${skillToDelete.name}"? This action is permanent.`)) {
      deleteSkill(selectedSkillId);
      
      const remaining = state.skills.filter(s => s.id !== selectedSkillId);
      setSelectedSkillId(remaining[0]?.id || null);
    }
  };

  // Handle empty all skills
  const handleEmptyAllSkills = () => {
    clearAllSkills();
    setSelectedSkillId(null);
    setShowEmptyConfirm(false);
  };

  // Handle clean unused skills
  const handleCleanUnusedSkills = () => {
    const deletedCount = deleteUnusedSkills();
    setShowCleanUnusedConfirm(false);
    const remaining = state.skills.filter(s => !s.archived);
    if (!remaining.some(s => s.id === selectedSkillId)) {
      setSelectedSkillId(remaining[0]?.id || null);
    }
  };

  // Handle merge skills submit
  const handleMergeSkillsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) {
      alert('Please select two distinct disciplines to merge.');
      return;
    }
    const sourceSkill = state.skills.find(s => s.id === mergeSourceId);
    const targetSkill = state.skills.find(s => s.id === mergeTargetId);
    if (!sourceSkill || !targetSkill) return;

    if (window.confirm(`Merge discipline "${sourceSkill.name}" into "${targetSkill.name}"? All related directives, goals, and history will be reassigned to "${targetSkill.name}", and "${sourceSkill.name}" will be purged.`)) {
      mergeSkills(mergeSourceId, mergeTargetId);
      setShowMergeModal(false);
      setSelectedSkillId(targetSkill.id);
      setMergeSourceId('');
      setMergeTargetId('');
    }
  };

  // Filter skills list
  const filteredSkills = state.skills.filter(skill => {
    if (searchQuery.trim() && !skill.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
      return false;
    }

    if (filterStatus === 'Active') return !skill.archived;
    if (filterStatus === 'Archived') return !!skill.archived;
    if (filterStatus === 'Primary') return (skill.tier || 'Primary') === 'Primary';
    if (filterStatus === 'Secondary') return skill.tier === 'Secondary';
    if (filterStatus === 'Unused') {
      const hasGoal = state.goals.some(g => g.relatedSkills.includes(skill.id));
      const hasQuest = state.quests.some(q => q.relatedSkills.includes(skill.id));
      const hasXpHistory = state.xpHistory.some(h => h.skillIds && h.skillIds.includes(skill.id));
      return !hasGoal && !hasQuest && !hasXpHistory;
    }
    return true;
  });

  // Find related goals/projects/quests for selected skill
  const relatedGoals = selectedSkill 
    ? state.goals.filter(g => g.relatedSkills.includes(selectedSkill.id)) 
    : [];

  const relatedQuests = selectedSkill
    ? state.quests.filter(q => q.relatedSkills.includes(selectedSkill.id))
    : [];

  const activeSkillQuests = relatedQuests.filter(q => q.status === 'Active');
  const completedSkillQuests = relatedQuests.filter(q => q.status === 'Completed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="skills-view-root">
      
      {/* LEFT PANEL: SKILLS DIRECTORY */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-[#c5a059]/20 gap-2">
          <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
            DISCIPLINE_ARCHIVE ({state.skills.length})
          </span>
          <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-1 rounded border border-[#c5a059]/45 bg-[#3a2e12] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.18)]">
            10/10 READY
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button 
              onClick={() => { setShowAddSkill(!showAddSkill); setShowEmptyConfirm(false); setShowCleanUnusedConfirm(false); setShowMergeModal(false); }}
              className="text-[11px] font-mono bg-[#3a2e12]/80 border border-[#c5a059]/40 hover:border-[#c5a059] text-[#fef08a] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
              title="Create a new discipline track"
            >
              <Plus className="h-3 w-3" />
              CREATE
            </button>
            <button 
              onClick={() => { setShowMergeModal(!showMergeModal); setShowAddSkill(false); setShowEmptyConfirm(false); setShowCleanUnusedConfirm(false); }}
              className="text-[11px] font-mono bg-[#141824] border border-[#c5a059]/30 hover:border-[#c5a059] text-purple-300 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Merge redundant disciplines together"
            >
              <GitMerge className="h-3 w-3" />
              MERGE
            </button>
            {unusedSkillsCount > 0 && (
              <button 
                onClick={() => { setShowCleanUnusedConfirm(!showCleanUnusedConfirm); setShowAddSkill(false); setShowEmptyConfirm(false); setShowMergeModal(false); }}
                className="text-[11px] font-mono bg-[#141824] border border-[#c5a059]/30 hover:border-[#c5a059] text-[#e5c875] px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Clean disciplines with 0 XP and no links"
              >
                <Layers className="h-3 w-3" />
                CLEAN ({unusedSkillsCount})
              </button>
            )}
            {state.skills.length > 0 && (
              <button 
                onClick={() => { setShowEmptyConfirm(!showEmptyConfirm); setShowAddSkill(false); setShowCleanUnusedConfirm(false); setShowMergeModal(false); }}
                className="text-[11px] font-mono bg-rose-950/60 border border-rose-500/30 hover:border-rose-500 text-rose-300 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                EMPTY
              </button>
            )}
          </div>
        </div>

        {/* Merge Skills Modal / Form */}
        {showMergeModal && (
          <form onSubmit={handleMergeSkillsSubmit} className="p-4 bg-[#0b0d13] border border-[#c5a059]/40 rounded-xl space-y-3 shadow-xl">
            <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <GitMerge className="h-3.5 w-3.5 text-[#c5a059]" /> CONSOLIDATE & MERGE DISCIPLINES
            </h4>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Combine duplicate or redundant disciplines into a single track. Associated directives and history will transfer automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Source Discipline (To Purge)</label>
                <select
                  value={mergeSourceId}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full bg-[#07080c] border border-rose-500/40 rounded px-2.5 py-1.5 text-xs text-rose-300 font-mono focus:outline-none"
                  required
                >
                  <option value="">-- Select Discipline --</option>
                  {state.skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.xp} XP)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#c5a059] uppercase mb-1">Target Discipline (Destination)</label>
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#c5a059]/40 rounded px-2.5 py-1.5 text-xs text-[#fef08a] font-mono focus:outline-none"
                  required
                >
                  <option value="">-- Select Target --</option>
                  {state.skills.filter(s => s.id !== mergeSourceId).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.xp} XP)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => setShowMergeModal(false)}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                disabled={!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId}
                className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] text-xs font-mono font-bold px-3.5 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                EXECUTE_MERGE
              </button>
            </div>
          </form>
        )}

        {/* Clean Unused Confirmation */}
        {showCleanUnusedConfirm && (
          <div className="p-4 bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl space-y-3">
            <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Layers className="h-3.5 w-3.5 text-[#c5a059]" /> PURGE UNUSED DISCIPLINES ({unusedSkillsCount})
            </h4>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Found <strong>{unusedSkillsCount}</strong> disciplines with 0 XP and no linked objectives ({unusedSkillsList.map(s => `"${s.name}"`).join(', ')}).
            </p>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowCleanUnusedConfirm(false)}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                CANCEL
              </button>
              <button 
                type="button" 
                onClick={handleCleanUnusedSkills}
                className="bg-[#3a2e12] hover:bg-[#524119] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold px-3 py-1.5 rounded cursor-pointer"
              >
                PURGE {unusedSkillsCount} DISCIPLINES
              </button>
            </div>
          </div>
        )}

        {/* Empty All Skills Confirmation */}
        {showEmptyConfirm && (
          <div className="p-4 bg-[#1a0808] border border-rose-500/30 rounded-xl space-y-3">
            <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1 font-bold">
              <Trash2 className="h-3 w-3" /> PURGE ALL DISCIPLINE TRACKS
            </h4>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Are you sure you want to empty all skill tracks? This clears all existing skill categories and unlinks them from active/completed goals and quests. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowEmptyConfirm(false)}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                CANCEL
              </button>
              <button 
                type="button" 
                onClick={handleEmptyAllSkills}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold px-3 py-1.5 rounded cursor-pointer"
              >
                CONFIRM_PURGE
              </button>
            </div>
          </div>
        )}

        {/* Custom Skill Creator Form */}
        {showAddSkill && (
          <form onSubmit={handleCreateSkill} className="p-4 bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl space-y-3">
            <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              INITIALIZE_CUSTOM_DISCIPLINE
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-[#c5a059] uppercase mb-1 font-bold">Discipline Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Classical Arabic, System Architecture..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Tier / Classification</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSkillTier('Primary')}
                    className={`flex-1 text-[10px] font-mono py-1.5 rounded-lg border transition-all cursor-pointer ${
                      newSkillTier === 'Primary'
                        ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold shadow-[0_0_10px_rgba(197,160,89,0.2)]'
                        : 'bg-[#07080c] border-white/5 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    PRIMARY (CORE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSkillTier('Secondary')}
                    className={`flex-1 text-[10px] font-mono py-1.5 rounded-lg border transition-all cursor-pointer ${
                      newSkillTier === 'Secondary'
                        ? 'bg-purple-950 border-purple-500/50 text-purple-300 font-bold'
                        : 'bg-[#07080c] border-white/5 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    SECONDARY (SUPPORT)
                  </button>
                </div>
              </div>

              {newSkillTier === 'Secondary' && (
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Linked Primary Discipline</label>
                  <select
                    value={newSkillParentId}
                    onChange={(e) => setNewSkillParentId(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
                  >
                    <option value="">-- No Linked Primary --</option>
                    {state.skills
                      .filter(s => (s.tier || 'Primary') === 'Primary')
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddSkill(false)}
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] text-xs font-mono font-black px-4 py-1.5 rounded-lg shadow cursor-pointer"
                >
                  INITIALIZE
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Search & Filter Controls */}
        <div className="space-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#c5a059]" />
            <input 
              type="text"
              placeholder="Search disciplines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-2.5 top-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex flex-wrap bg-[#07080c] p-1 border border-[#c5a059]/20 rounded-lg gap-1">
            {([
              { id: 'Active', label: `ACTIVE (${activeSkillsCount})` },
              { id: 'All', label: `ALL (${state.skills.length})` },
              { id: 'Primary', label: `PRIMARY (${primarySkillsCount})` },
              { id: 'Secondary', label: `SECONDARY (${secondarySkillsCount})` },
              { id: 'Archived', label: `ARCHIVED (${archivedSkillsCount})` },
              { id: 'Unused', label: `UNUSED (${unusedSkillsCount})` }
            ] as const).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`flex-1 min-w-[70px] py-1 px-1.5 text-[9px] font-mono rounded transition-all uppercase whitespace-nowrap text-center cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredSkills.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-[#07080c]/50 border border-dashed border-[#c5a059]/20 rounded-lg">
              <p className="text-xs font-mono text-zinc-500">No skills matched your filter criteria.</p>
            </div>
          ) : (
            filteredSkills.map(skill => {
              const isSelected = skill.id === selectedSkillId;
              const stats = getSkillXpAndLevel(skill.id);
              const tier = skill.tier || 'Primary';
              const isPrimary = tier === 'Primary';
              const isArchived = !!skill.archived;

              const linkedQuests = state.quests.filter(q => q.relatedSkills.includes(skill.id));
              const activeLinkedCount = linkedQuests.filter(q => q.status === 'Active').length;

              return (
                <div
                  key={skill.id}
                  className={`group relative rounded-xl border transition-all p-4 space-y-3 flex flex-col justify-between overflow-hidden ${
                    isArchived
                      ? 'bg-[#07080c]/40 border-white/5 opacity-60 hover:opacity-100'
                      : isSelected 
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
                      setSelectedSkillId(skill.id);
                      setIsEditingSkill(false);
                    }}
                    className="cursor-pointer space-y-3 flex-1 w-full"
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-start gap-1 pr-14">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">LVL_{stats.level}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                            isPrimary 
                              ? 'text-[#fef08a] bg-[#3a2e12] border-[#c5a059]/40' 
                              : 'text-purple-300 bg-purple-950 border-purple-500/40'
                          }`}>
                            {tier}
                          </span>
                          {isArchived && (
                            <span className="text-[8px] font-mono px-1 rounded uppercase font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/20">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-[#07080c] text-[#e5c875] border border-[#c5a059]/30 px-1.5 py-0.5 rounded uppercase">
                          MSTRY {stats.mastery}%
                        </span>
                      </div>
                      <h4 className={`font-display font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                        {skill.name}
                      </h4>
                      {skill.equippedTitle && (
                        <div className="pt-1">
                          <span className="text-[9px] font-mono text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/50 px-2 py-0.5 rounded uppercase tracking-wider font-bold inline-flex items-center gap-1">
                            <RubElHizbIcon className="h-2 w-2 text-[#e5c875]" />
                            {skill.equippedTitle}
                          </span>
                        </div>
                      )}
                      
                      {/* Skill linkage badges */}
                      {skill.tier === 'Secondary' && skill.parentId && (() => {
                        const parent = state.skills.find(s => s.id === skill.parentId);
                        return parent ? (
                          <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                            <span className="text-zinc-500">↳ Linked to</span>
                            <span className="text-[#e5c875] font-semibold">{parent.name}</span>
                          </div>
                        ) : null;
                      })()}

                      {(skill.tier || 'Primary') === 'Primary' && (() => {
                        const subSkillsCount = state.skills.filter(s => s.parentId === skill.id).length;
                        return subSkillsCount > 0 ? (
                          <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                            <span className="text-zinc-500">↲ Links</span>
                            <span className="text-purple-300 font-semibold">{subSkillsCount} sub-skill{subSkillsCount > 1 ? 's' : ''}</span>
                          </div>
                        ) : null;
                      })()}

                      {activeLinkedCount > 0 && (
                        <div className="pt-0.5 text-[9px] font-mono text-zinc-400">
                          🎯 {activeLinkedCount} active directive{activeLinkedCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full space-y-1">
                      <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div 
                          className="rpg-progress-gold h-full rounded transition-all duration-300"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                        <span className="text-[#c5a059]">{stats.xp} TOTAL XP</span>
                        <span>{stats.progress}% GAP</span>
                      </div>
                    </div>
                  </div>

                  {/* Top-right Actions: Archive / Delete */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleArchiveSkill(skill.id);
                      }}
                      className="p-1 rounded hover:bg-[#3a2e12] text-zinc-500 hover:text-[#e5c875] transition-colors cursor-pointer"
                      title={isArchived ? "Unarchive Skill" : "Archive Skill"}
                    >
                      {isArchived ? <ArchiveRestore className="h-3.5 w-3.5 text-[#e5c875]" /> : <Archive className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete the skill "${skill.name}"? This action is permanent.`)) {
                          deleteSkill(skill.id);
                          if (selectedSkillId === skill.id) {
                            const remaining = state.skills.filter(s => s.id !== skill.id);
                            setSelectedSkillId(remaining[0]?.id || null);
                          }
                        }
                      }}
                      className="p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-zinc-500 transition-colors cursor-pointer"
                      title="Purge Skill Track"
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

      {/* RIGHT PANEL: SELECTED SKILL MATRIX & HISTORY */}
      <div className="lg:col-span-2 space-y-6">
        {selectedSkill && selectedSkillStats ? (
          <div className="glass-panel rounded-xl p-6 space-y-6 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            {/* Header with edit / archive / delete */}
            <div className="flex justify-between items-start border-b border-[#c5a059]/20 pb-4 gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#e5c875] font-bold">
                    {(selectedSkill.tier || 'Primary').toUpperCase()}_SKILL_CODEX
                  </span>
                  {selectedSkill.archived && (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                      ARCHIVED
                    </span>
                  )}
                </div>

                {isEditingSkill ? (
                  <form onSubmit={handleRenameSkill} className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={editSkillName}
                      onChange={(e) => setEditSkillName(e.target.value)}
                      className="bg-[#07080c] border border-[#c5a059]/40 rounded px-2.5 py-1 text-xs text-white"
                      required
                    />
                    <button type="submit" className="bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] text-[10px] font-mono px-2.5 rounded font-bold cursor-pointer">
                      SAVE
                    </button>
                    <button type="button" onClick={() => setIsEditingSkill(false)} className="text-[10px] font-mono text-zinc-500 cursor-pointer">
                      CANCEL
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide">
                      {selectedSkill.name}
                    </h3>
                    {selectedSkill.equippedTitle && (
                      <span className="text-[10px] font-mono text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/50 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                        🛡️ {selectedSkill.equippedTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!isEditingSkill && (
                <div className="flex flex-wrap gap-1.5 shrink-0 justify-end">
                  <button 
                    onClick={() => toggleArchiveSkill(selectedSkill.id)}
                    className="p-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-400 hover:text-[#e5c875] rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                    title="Archive or unarchive this skill"
                  >
                    {selectedSkill.archived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
                    <span>{selectedSkill.archived ? 'UNARCHIVE' : 'ARCHIVE'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      const currentTier = selectedSkill.tier || 'Primary';
                      const newTier = currentTier === 'Primary' ? 'Secondary' : 'Primary';
                      updateSkillTier(selectedSkill.id, newTier);
                    }}
                    className={`p-1.5 border rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                      (selectedSkill.tier || 'Primary') === 'Primary'
                        ? 'bg-[#3a2e12]/60 border-[#c5a059]/50 text-[#fef08a]'
                        : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                    }`}
                    title="Click to toggle skill tier"
                  >
                    Tier: {selectedSkill.tier || 'Primary'}
                  </button>
                  <button 
                    onClick={() => { setEditSkillName(selectedSkill.name); setIsEditingSkill(true); }}
                    className="p-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-400 hover:text-[#e5c875] rounded text-[10px] font-mono cursor-pointer"
                  >
                    RENAME
                  </button>
                  <button 
                    onClick={handleDeleteSkill}
                    className="p-1.5 bg-[#07080c] border border-rose-500/20 hover:border-rose-500 text-zinc-400 hover:text-rose-400 rounded text-[10px] font-mono cursor-pointer"
                  >
                    PURGE
                  </button>
                </div>
              )}
            </div>

            {/* HIGH-LEVEL METRICS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold flex items-center gap-1">
                  <RubElHizbIcon className="h-2 w-2" />
                  CURRENT RANK
                </span>
                <p className="text-3xl font-display font-extrabold text-white mt-2">LVL {selectedSkillStats.level}</p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">
                  {selectedSkillStats.xpIntoLevel} / {selectedSkillStats.xpRequiredForNextLevel} XP to next level
                </p>
              </div>

              <div className="bg-[#07080c] border border-emerald-500/30 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  TOTAL SKILL XP
                </span>
                <p className="text-3xl font-display font-extrabold text-emerald-400 mt-2">+{selectedSkillStats.xp} XP</p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">
                  Accumulated mastery index
                </p>
              </div>
            </div>

            {/* PARENT PRIMARY SKILL LINKAGE (For Secondary Skills) */}
            {(selectedSkill.tier || 'Primary') === 'Secondary' && (
              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 space-y-3 mt-4">
                <span className="text-[10px] font-mono text-[#e5c875] uppercase block font-bold">
                  Linked Primary Skill (XP Routing)
                </span>
                <div className="flex gap-2">
                  <select
                    value={selectedSkill.parentId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateSkillParent(selectedSkill.id, val ? val : null);
                    }}
                    className="bg-[#0b0d13] border border-[#c5a059]/30 rounded px-2.5 py-1.5 text-xs font-mono text-white flex-grow focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="">-- No Linked Primary Skill --</option>
                    {state.skills
                      .filter(s => (s.tier || 'Primary') === 'Primary' && s.id !== selectedSkill.id)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  Linking this secondary skill to a primary skill allows it to receive a proportional share of XP when directives are executed.
                </p>
              </div>
            )}

            {/* LINKED SECONDARY SKILLS (For Primary Skills) */}
            {(selectedSkill.tier || 'Primary') === 'Primary' && (
              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#e5c875] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                    LINKED SPECIALIZATIONS
                  </span>
                  <span className="text-[9px] font-mono bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] px-2 py-0.5 rounded font-semibold">
                    {state.skills.filter(s => s.parentId === selectedSkill.id).length} Specializations
                  </span>
                </div>

                {/* List of currently linked secondary skills */}
                {state.skills.filter(s => s.parentId === selectedSkill.id).length === 0 ? (
                  <div className="p-3 bg-[#0b0d13] border border-dashed border-[#c5a059]/20 rounded-lg text-center">
                    <p className="text-xs font-mono text-zinc-500">No secondary specializations linked to this primary skill yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.skills
                      .filter(s => s.parentId === selectedSkill.id)
                      .map(secSkill => {
                        const isEditingThis = editingSecSkillId === secSkill.id;
                        const secStats = getSkillXpAndLevel(secSkill.id);

                        return (
                          <div
                            key={secSkill.id}
                            className="flex items-center justify-between gap-2 p-2.5 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg transition-all hover:border-[#c5a059]/60"
                          >
                            {isEditingThis ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  type="text"
                                  value={editingSecSkillName}
                                  onChange={(e) => setEditingSecSkillName(e.target.value)}
                                  className="bg-[#07080c] border border-[#c5a059] rounded px-2 py-1 text-xs text-white font-sans flex-1 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingSecSkillName.trim()) {
                                      updateSkillName(secSkill.id, editingSecSkillName.trim());
                                    }
                                    setEditingSecSkillId(null);
                                  }}
                                  className="p-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded hover:bg-emerald-900 cursor-pointer"
                                  title="Save Name"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSecSkillId(null)}
                                  className="p-1 bg-zinc-800 border border-white/10 text-zinc-400 rounded hover:text-white cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded">
                                    LVL {secStats.level}
                                  </span>
                                  <span className="text-xs font-sans font-semibold text-zinc-200 truncate">
                                    {secSkill.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSecSkillId(secSkill.id);
                                      setEditingSecSkillName(secSkill.name);
                                    }}
                                    className="p-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-400 hover:text-[#e5c875] rounded text-[9px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Rename"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">RENAME</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateSkillParent(secSkill.id, null);
                                    }}
                                    className="p-1.5 bg-[#07080c] border border-white/10 hover:border-amber-500/30 text-zinc-400 hover:text-amber-400 rounded text-[9px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Unlink"
                                  >
                                    <Unlink className="h-3 w-3" />
                                    <span className="hidden sm:inline">UNLINK</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Delete secondary specialization "${secSkill.name}" permanently?`)) {
                                        deleteSkill(secSkill.id);
                                      }
                                    }}
                                    className="p-1.5 bg-[#07080c] border border-rose-500/20 hover:border-rose-500 text-zinc-400 hover:text-rose-400 rounded text-[9px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">PURGE</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* ADD SECONDARY SKILLS CONTROLS */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider block font-bold">
                    ADD SECONDARY SPECIALIZATION
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A: Create New Secondary Skill */}
                    <div className="p-3 bg-[#0b0d13] border border-[#c5a059]/20 rounded-lg space-y-2">
                      <span className="text-[9px] font-mono text-purple-300 uppercase block font-semibold">
                        ➕ Create New Specialization
                      </span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newSecSkillName}
                          onChange={(e) => setNewSecSkillName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newSecSkillName.trim()) {
                              e.preventDefault();
                              addSkill(newSecSkillName.trim(), 'Secondary', selectedSkill.id);
                              setNewSecSkillName('');
                            }
                          }}
                          placeholder="e.g. Arabic Calligraphy"
                          className="bg-[#07080c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059] flex-1 font-sans"
                        />
                        <button
                          type="button"
                          disabled={!newSecSkillName.trim()}
                          onClick={() => {
                            if (newSecSkillName.trim()) {
                              addSkill(newSecSkillName.trim(), 'Secondary', selectedSkill.id);
                              setNewSecSkillName('');
                            }
                          }}
                          className="px-3 py-1.5 bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
                        >
                          CREATE
                        </button>
                      </div>
                    </div>

                    {/* Option B: Link Existing Skill */}
                    <div className="p-3 bg-[#0b0d13] border border-[#c5a059]/20 rounded-lg space-y-2">
                      <span className="text-[9px] font-mono text-[#e5c875] uppercase block font-semibold">
                        🔗 Attach Existing Track
                      </span>
                      <div className="flex gap-1.5">
                        <select
                          value={attachSecSkillId}
                          onChange={(e) => setAttachSecSkillId(e.target.value)}
                          className="bg-[#07080c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-[#c5a059] font-mono truncate"
                        >
                          <option value="">-- Choose Existing Track --</option>
                          {state.skills
                            .filter(s => s.id !== selectedSkill.id && s.parentId !== selectedSkill.id)
                            .map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.tier || 'Primary'})
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          disabled={!attachSecSkillId}
                          onClick={() => {
                            if (attachSecSkillId) {
                              updateSkillParent(attachSecSkillId, selectedSkill.id);
                              updateSkillTier(attachSecSkillId, 'Secondary');
                              setAttachSecSkillId('');
                            }
                          }}
                          className="px-3 py-1.5 bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
                        >
                          ATTACH
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TITLES OPTIONS SECTION */}
            <div className="space-y-3.5 border-t border-b border-[#c5a059]/20 py-5">
              <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Crown className="h-4 w-4 text-[#c5a059]" />
                SKILL_TITLES_ALIGNMENT
              </h4>
              
              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { title: "Novice", lvl: 1 },
                    { title: "Seeker", lvl: 5 },
                    { title: "Scholar", lvl: 10 },
                    { title: "Master", lvl: 20 },
                    { title: "Grand Sage", lvl: 30 },
                    { title: "Apex Sovereign", lvl: 50 }
                  ].map((preset) => {
                    const isUnlocked = selectedSkillStats.level >= preset.lvl;
                    const isEquipped = selectedSkill.equippedTitle === preset.title;
                    
                    return (
                      <button
                        key={preset.title}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => equipSkillTitle(selectedSkill.id, preset.title)}
                        className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between h-[68px] cursor-pointer ${
                          isEquipped
                            ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                            : isUnlocked
                              ? 'bg-[#0b0d13] border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-white'
                              : 'bg-[#07080c] border-white/5 opacity-40 cursor-not-allowed text-zinc-600'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-sans font-bold leading-tight truncate">{preset.title}</span>
                          {isEquipped ? (
                            <Check className="h-3 w-3 text-[#e5c875] shrink-0" />
                          ) : !isUnlocked ? (
                            <Lock className="h-2.5 w-2.5 text-zinc-600 shrink-0" />
                          ) : (
                            <span className="text-[8px] font-mono font-semibold text-[#c5a059]">UNLOCKED</span>
                          )}
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500 mt-1 uppercase">REQS LVL {preset.lvl}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Title Option */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">ASSIGN CUSTOM ALIAS</span>
                    <span className="text-[8px] font-mono text-zinc-500">UNLOCKS AT LVL 10</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={selectedSkillStats.level >= 10 ? "e.g. Master of Sacred Geometry..." : "Lvl 10 Required"}
                      disabled={selectedSkillStats.level < 10}
                      id="custom-title-input"
                      className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059] disabled:opacity-50 disabled:cursor-not-allowed"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.currentTarget as HTMLInputElement).value.trim();
                          if (val) {
                            equipSkillTitle(selectedSkill.id, val);
                            (e.currentTarget as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={selectedSkillStats.level < 10}
                      onClick={() => {
                        const input = document.getElementById('custom-title-input') as HTMLInputElement;
                        const val = input?.value.trim();
                        if (val) {
                          equipSkillTitle(selectedSkill.id, val);
                          input.value = '';
                        }
                      }}
                      className="text-[10px] font-mono px-3.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold border bg-[#3a2e12] hover:bg-[#524119] border-[#c5a059]/40 text-[#fef08a] cursor-pointer"
                    >
                      EQUIP
                    </button>
                    {selectedSkill.equippedTitle && (
                      <button
                        type="button"
                        onClick={() => equipSkillTitle(selectedSkill.id, '')}
                        className="bg-[#07080c] hover:bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-mono px-2.5 rounded transition-all uppercase cursor-pointer"
                        title="Unequip Title"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ASSOCIATED GOALS */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Target className="h-4 w-4 text-[#c5a059]" />
                ASSOCIATED GOAL PATHWAYS ({relatedGoals.length})
              </h4>
              
              <div className="space-y-2">
                {relatedGoals.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-500">No goals are explicitly associated with this skill parameter.</p>
                ) : (
                  relatedGoals.map(g => (
                    <div key={g.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-lg flex justify-between items-center text-xs">
                      <span className="text-white font-sans font-medium">{g.name}</span>
                      <span className="font-mono font-bold text-[#e5c875]">{getGoalProgress(g.id)}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COMPLETED / ACTIVE DIRECTIVES UNDER THIS SKILL */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <ListTodo className="h-4 w-4 text-[#c5a059]" />
                SKILL DIRECTIVE LOGS
              </h4>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {/* Active skill quests */}
                {activeSkillQuests.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold">ACTIVE DISPATCHES ({activeSkillQuests.length})</span>
                    {activeSkillQuests.map(q => (
                      <div key={q.id} className="p-2.5 bg-[#07080c] border border-[#c5a059]/20 rounded text-xs flex justify-between items-center">
                        <span className="text-zinc-200">{q.name}</span>
                        <span className="font-mono text-[#e5c875]">+{q.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed skill quests */}
                {completedSkillQuests.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">SOLVED DIRECTIVES ({completedSkillQuests.length})</span>
                    {completedSkillQuests.map(q => (
                      <div key={q.id} className="p-2.5 bg-[#07080c]/50 border border-white/5 rounded text-xs flex justify-between items-center">
                        <span className="text-zinc-500 line-through">{q.name}</span>
                        <span className="text-emerald-400 font-mono">+{q.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}

                {relatedQuests.length === 0 && (
                  <p className="text-xs font-mono text-zinc-600">No quests completed or scheduled for this parameter yet.</p>
                )}
              </div>
            </div>

            {/* Connected Planning Documents Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                📄 STRATEGIC PLANNING DIRECTIVES
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(!state.planningDocuments || state.planningDocuments.filter(doc => doc.linkedSkills?.includes(selectedSkill.id)).length === 0) ? (
                  <p className="text-xs font-mono text-zinc-600 col-span-2">No active strategic planning documents linked to this skill path. Link them from the PLANNING tab.</p>
                ) : (
                  state.planningDocuments.filter(doc => doc.linkedSkills?.includes(selectedSkill.id)).map(doc => (
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
        ) : (
          <div className="glass-panel rounded-xl p-10 text-center space-y-2 border border-[#c5a059]/20 bg-[#0b0d13]/80">
            <Award className="h-8 w-8 text-[#c5a059]/60 mx-auto" />
            <h3 className="font-display text-sm font-bold text-white uppercase">No Skill Selected</h3>
            <p className="text-xs text-zinc-500 font-mono">Select a skill parameter on the left directory to inspect its metrics.</p>
          </div>
        )}
      </div>

    </div>
  );
};
