import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { Skill, Goal, Project, Quest } from '../types';
import { 
  Award, Sparkles, Plus, Trash2, Edit2, CheckCircle2, 
  Circle, BarChart, ExternalLink, Target, Briefcase, ListTodo,
  Tag, Lock, Check, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SkillsView: React.FC = () => {
  const { 
    state, addSkill, updateSkillName, updateSkillTier, updateSkillParent, deleteSkill, clearAllSkills, getSkillXpAndLevel, 
    getGoalProgress, getProjectProgress, equipSkillTitle
  } = usePOS();

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(state.skills[0]?.id || null);
  
  // Custom skill creator states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillTier, setNewSkillTier] = useState<'Primary' | 'Secondary'>('Primary');
  const [newSkillParentId, setNewSkillParentId] = useState<string>('');

  // Filter tabs state
  const [filterTier, setFilterTier] = useState<'All' | 'Primary' | 'Secondary'>('All');

  // Empty all skills confirmation state
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  // Editing skill name states
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [editSkillName, setEditSkillName] = useState('');

  const selectedSkill = state.skills.find(s => s.id === selectedSkillId);
  const selectedSkillStats = selectedSkill ? getSkillXpAndLevel(selectedSkill.id) : null;

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

    if (window.confirm(`Are you sure you want to delete the skill "${skillToDelete.name}"? This action is permanent.`)) {
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
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">SKILL_TRACKS ({state.skills.length})</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setShowAddSkill(!showAddSkill); setShowEmptyConfirm(false); }}
              className="text-xs font-mono bg-zinc-900 border border-white/5 hover:border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              CREATE CUSTOM
            </button>
            {state.skills.length > 0 && (
              <button 
                onClick={() => { setShowEmptyConfirm(!showEmptyConfirm); setShowAddSkill(false); }}
                className="text-xs font-mono bg-zinc-900 border border-white/5 hover:border-rose-500/30 text-rose-400 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                EMPTY ALL
              </button>
            )}
          </div>
        </div>

        {/* Empty All Skills Confirmation */}
        {showEmptyConfirm && (
          <div className="p-4 bg-zinc-950 border border-rose-500/20 rounded-lg space-y-3">
            <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> PURGE ALL SKILL TRACKS
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Are you sure you want to empty all skill tracks? This clears all existing skill categories and unlinks them from active/completed goals and quests. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowEmptyConfirm(false)}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                CANCEL
              </button>
              <button 
                type="button"
                onClick={handleEmptyAllSkills}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-mono px-3 py-1 rounded transition-colors"
              >
                CONFIRM_PURGE
              </button>
            </div>
          </div>
        )}

        {/* Custom Skill Creator Form */}
        {showAddSkill && (
          <form onSubmit={handleCreateSkill} className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-3">
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">INITIALIZE_CUSTOM_TRACK</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Skill Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Public Speaking, Arabic..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Skill Tier / Classification</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSkillTier('Primary')}
                    className={`flex-1 text-[10px] font-mono py-1 rounded border transition-all ${
                      newSkillTier === 'Primary'
                        ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.05)]'
                        : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    PRIMARY (CORE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSkillTier('Secondary')}
                    className={`flex-1 text-[10px] font-mono py-1 rounded border transition-all ${
                      newSkillTier === 'Secondary'
                        ? 'bg-fuchsia-950/40 border-fuchsia-500/30 text-fuchsia-400 font-bold shadow-[0_0_10px_rgba(217,70,239,0.05)]'
                        : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    SECONDARY (SUPPORTING)
                  </button>
                </div>
              </div>

              {newSkillTier === 'Secondary' && (
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Linked Primary Skill</label>
                  <select
                    value={newSkillParentId}
                    onChange={(e) => setNewSkillParentId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-mono"
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
                  className="bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-4 py-1.5 rounded hover:bg-cyan-900 transition-colors"
                >
                  INITIALIZE
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex bg-zinc-950/60 p-1 border border-white/5 rounded-lg gap-1">
          {([
            { id: 'All', label: 'ALL TRACKS' },
            { id: 'Primary', label: 'PRIMARY' },
            { id: 'Secondary', label: 'SECONDARY' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTier(tab.id)}
              className={`flex-1 py-1 px-2 text-[10px] font-mono rounded transition-all uppercase ${
                filterTier === tab.id
                  ? 'bg-zinc-900 border border-white/10 text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Skills grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {state.skills
            .filter(skill => {
              if (filterTier === 'All') return true;
              const tier = skill.tier || 'Primary';
              return tier === filterTier;
            })
            .map(skill => {
              const isSelected = skill.id === selectedSkillId;
              const stats = getSkillXpAndLevel(skill.id);
              const tier = skill.tier || 'Primary';
              const isPrimary = tier === 'Primary';

              return (
                <div
                  key={skill.id}
                  className={`group relative rounded-lg border transition-all p-4 space-y-3 flex flex-col justify-between ${
                    isSelected 
                      ? isPrimary 
                        ? 'bg-zinc-900/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                        : 'bg-zinc-900/80 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.05)]'
                      : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Clickable area for selection */}
                  <div 
                    onClick={() => {
                      setSelectedSkillId(skill.id);
                      setIsEditingSkill(false);
                    }}
                    className="cursor-pointer space-y-3 flex-1 w-full"
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-start gap-1 pr-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">LVL_{stats.level}</span>
                          <span className={`text-[8px] font-mono px-1 rounded uppercase font-semibold ${
                            isPrimary ? 'text-cyan-400 bg-cyan-950/40' : 'text-fuchsia-400 bg-fuchsia-950/40'
                          }`}>
                            {tier}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold bg-zinc-950 px-1 rounded uppercase ${
                          isPrimary ? 'text-cyan-400' : 'text-fuchsia-400'
                        }`}>
                          MSTRY {stats.mastery}%
                        </span>
                      </div>
                       <h4 className={`font-sans font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                        {skill.name}
                      </h4>
                      {skill.equippedTitle && (
                        <div className="pt-1">
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            🛡️ {skill.equippedTitle}
                          </span>
                        </div>
                      )}
                      
                      {/* Skill linkage badges */}
                      {skill.tier === 'Secondary' && skill.parentId && (() => {
                        const parent = state.skills.find(s => s.id === skill.parentId);
                        return parent ? (
                          <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                            <span className="text-zinc-500">↳ Linked to</span>
                            <span className="text-cyan-400 font-semibold">{parent.name}</span>
                          </div>
                        ) : null;
                      })()}

                      {(skill.tier || 'Primary') === 'Primary' && (() => {
                        const subSkillsCount = state.skills.filter(s => s.parentId === skill.id).length;
                        return subSkillsCount > 0 ? (
                          <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                            <span className="text-zinc-500">↲ Links</span>
                            <span className="text-fuchsia-400 font-semibold">{subSkillsCount} sub-skill{subSkillsCount > 1 ? 's' : ''}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full space-y-1">
                      <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full rounded transition-all duration-300 ${
                            isPrimary ? 'bg-cyan-500' : 'bg-fuchsia-500'
                          }`}
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                        <span>{stats.xp} TOTAL XP</span>
                        <span>{stats.progress}% LEVEL_GAP</span>
                      </div>
                    </div>
                  </div>

                  {/* Individual separate delete button */}
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
                    className="absolute top-3 right-3 p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-zinc-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Skill Track"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* RIGHT PANEL: SELECTED SKILL MATRIX & HISTORY */}
      <div className="lg:col-span-2 space-y-6">
        {selectedSkill && selectedSkillStats ? (
          <div className="glass-panel rounded-lg p-6 space-y-6">
            
            {/* Header with edit / delete */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Award className={`h-4 w-4 ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`} />
                  <span className={`text-xs font-mono uppercase tracking-wider ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                    {(selectedSkill.tier || 'Primary').toUpperCase()}_SKILL_TRACK
                  </span>
                </div>

                {isEditingSkill ? (
                  <form onSubmit={handleRenameSkill} className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={editSkillName}
                      onChange={(e) => setEditSkillName(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                      required
                    />
                    <button type="submit" className="bg-cyan-950 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono px-2 rounded">
                      SAVE
                    </button>
                    <button type="button" onClick={() => setIsEditingSkill(false)} className="text-[10px] font-mono text-zinc-500">
                      CANCEL
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <h3 className="font-display text-xl font-bold text-white uppercase">
                      {selectedSkill.name}
                    </h3>
                    {selectedSkill.equippedTitle && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                        🛡️ {selectedSkill.equippedTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!isEditingSkill && (
                <div className="flex flex-wrap gap-1.5 shrink-0 justify-end">
                  <button 
                    onClick={() => {
                      const currentTier = selectedSkill.tier || 'Primary';
                      const newTier = currentTier === 'Primary' ? 'Secondary' : 'Primary';
                      updateSkillTier(selectedSkill.id, newTier);
                    }}
                    className={`p-1.5 border rounded text-[10px] font-mono uppercase transition-colors ${
                      (selectedSkill.tier || 'Primary') === 'Primary'
                        ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40'
                        : 'bg-fuchsia-950/20 border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-950/40'
                    }`}
                    title="Click to toggle skill tier (Primary / Secondary)"
                  >
                    Tier: {selectedSkill.tier || 'Primary'}
                  </button>
                  <button 
                    onClick={() => { setEditSkillName(selectedSkill.name); setIsEditingSkill(true); }}
                    className="p-1.5 bg-zinc-900 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white rounded text-[10px] font-mono"
                  >
                    RENAME
                  </button>
                  <button 
                    onClick={handleDeleteSkill}
                    className="p-1.5 bg-zinc-900 border border-white/5 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 rounded text-[10px] font-mono"
                  >
                    PURGE
                  </button>
                </div>
              )}
            </div>

            {/* HIGH-LEVEL METRICS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">CURRENT LEVEL</span>
                <p className="text-3xl font-display font-bold text-white mt-2">LVL {selectedSkillStats.level}</p>
                <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                  {selectedSkillStats.xpIntoLevel} / {selectedSkillStats.xpRequiredForNextLevel} XP to next level
                </p>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">TOTAL SKILL XP</span>
                <p className="text-3xl font-display font-bold text-emerald-400 mt-2">+{selectedSkillStats.xp} XP</p>
                <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                  Accumulated competency index
                </p>
              </div>
            </div>

            {/* PARENT PRIMARY SKILL LINKAGE (For Secondary Skills) */}
            {(selectedSkill.tier || 'Primary') === 'Secondary' && (
              <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-4 space-y-3 mt-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block text-fuchsia-400">Linked Primary Skill (80/20 Rule)</span>
                <div className="flex gap-2">
                  <select
                    value={selectedSkill.parentId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateSkillParent(selectedSkill.id, val ? val : null);
                    }}
                    className="bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white flex-grow focus:outline-none focus:border-fuchsia-500"
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
                  Linking this secondary skill to a primary skill activates <strong>80/20 Pareto distribution</strong>. Quests associated with either skill will share progress: 80% to the Primary skill, 20% to the Secondary skill!
                </p>
              </div>
            )}

            {/* LINKED SECONDARY SKILLS (For Primary Skills) */}
            {(selectedSkill.tier || 'Primary') === 'Primary' && (
              <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-4 space-y-3 mt-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block text-cyan-400">Linked Secondary Skills (80/20 Rule)</span>
                {state.skills.filter(s => s.parentId === selectedSkill.id).length === 0 ? (
                  <p className="text-xs font-mono text-zinc-600">No linked secondary specializations.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {state.skills
                      .filter(s => s.parentId === selectedSkill.id)
                      .map(s => (
                        <span
                          key={s.id}
                          className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-950/35 border border-fuchsia-500/20 px-2.5 py-1 rounded"
                        >
                          {s.name}
                        </span>
                      ))}
                  </div>
                )}
                <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  These secondary skills automatically split 20% of the XP whenever this primary skill is trained or active!
                </p>
              </div>
            )}

            {/* TITLES OPTIONS SECTION */}
            <div className="space-y-3.5 border-t border-b border-white/5 py-5">
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className={`h-4 w-4 ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`} />
                SKILL_TITLES_ALIGNMENT
              </h4>
              
              <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { title: "Novice", lvl: 1 },
                    { title: "Apprentice", lvl: 5 },
                    { title: "Adept", lvl: 10 },
                    { title: "Expert", lvl: 20 },
                    { title: "Master", lvl: 30 },
                    { title: "Sovereign", lvl: 50 }
                  ].map((preset) => {
                    const isUnlocked = selectedSkillStats.level >= preset.lvl;
                    const isEquipped = selectedSkill.equippedTitle === preset.title;
                    const isPrimary = (selectedSkill.tier || 'Primary') === 'Primary';
                    
                    return (
                      <button
                        key={preset.title}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => equipSkillTitle(selectedSkill.id, preset.title)}
                        className={`p-2.5 rounded border text-left transition-all relative flex flex-col justify-between h-[68px] ${
                          isEquipped
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                            : isUnlocked
                              ? isPrimary
                                ? 'bg-zinc-900/60 border-white/5 hover:border-cyan-500/30 text-zinc-300 hover:text-white'
                                : 'bg-zinc-900/60 border-white/5 hover:border-fuchsia-500/30 text-zinc-300 hover:text-white'
                              : 'bg-zinc-950/80 border-white/5 opacity-40 cursor-not-allowed text-zinc-600'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-sans font-bold leading-tight truncate">{preset.title}</span>
                          {isEquipped ? (
                            <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : !isUnlocked ? (
                            <Lock className="h-2.5 w-2.5 text-zinc-600 shrink-0" />
                          ) : (
                            <span className={`text-[8px] font-mono font-semibold ${
                              isPrimary 
                                ? 'text-cyan-500 group-hover:text-cyan-400' 
                                : 'text-fuchsia-500 group-hover:text-fuchsia-400'
                            }`}>UNLOCKED</span>
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
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">ASSIGN CUSTOM ALIAS</span>
                    <span className="text-[8px] font-mono text-zinc-500">UNLOCKS AT LVL 10</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={selectedSkillStats.level >= 10 ? "e.g. Master of Languages..." : "Lvl 10 Required"}
                      disabled={selectedSkillStats.level < 10}
                      id="custom-title-input"
                      className={`flex-1 bg-zinc-950/80 border border-white/5 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        (selectedSkill.tier || 'Primary') === 'Primary' ? 'focus:border-cyan-500' : 'focus:border-fuchsia-500'
                      }`}
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
                      className={`text-[10px] font-mono px-3.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase font-semibold border ${
                        (selectedSkill.tier || 'Primary') === 'Primary'
                          ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/20 text-cyan-300'
                          : 'bg-fuchsia-950/80 hover:bg-fuchsia-900 border-fuchsia-500/20 text-fuchsia-300'
                      }`}
                    >
                      EQUIP
                    </button>
                    {selectedSkill.equippedTitle && (
                      <button
                        type="button"
                        onClick={() => equipSkillTitle(selectedSkill.id, '')}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-mono px-2.5 rounded transition-all uppercase"
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
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className={`h-4 w-4 ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`} />
                ASSOCIATED GOAL PATHS ({relatedGoals.length})
              </h4>
              
              <div className="space-y-2">
                {relatedGoals.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-600">No goals are explicitly associated with this skill parameter.</p>
                ) : (
                  relatedGoals.map(g => (
                    <div key={g.id} className="p-3 bg-zinc-950 border border-white/5 rounded flex justify-between items-center text-xs">
                      <span className="text-white font-sans font-medium">{g.name}</span>
                      <span className={`font-mono font-bold ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>{getGoalProgress(g.id)}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COMPLETED / ACTIVE DIRECTIVES UNDER THIS SKILL */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className={`h-4 w-4 ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`} />
                SKILL HISTORIC DIRECTIVES
              </h4>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {/* Active skill quests */}
                {activeSkillQuests.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">ACTIVE DISPATCHES ({activeSkillQuests.length})</span>
                    {activeSkillQuests.map(q => (
                      <div key={q.id} className="p-2.5 bg-zinc-950/60 border border-white/5 rounded text-xs flex justify-between items-center">
                        <span className="text-zinc-200">{q.name}</span>
                        <span className={`font-mono ${(selectedSkill.tier || 'Primary') === 'Primary' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>+{q.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed skill quests */}
                {completedSkillQuests.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">SOLVED DIRECTIVES ({completedSkillQuests.length})</span>
                    {completedSkillQuests.map(q => (
                      <div key={q.id} className="p-2.5 bg-zinc-950/30 border border-white/5 rounded text-xs flex justify-between items-center">
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
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                📄 STRATEGIC PLANNING DIRECTIVES
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(!state.planningDocuments || state.planningDocuments.filter(doc => doc.linkedSkills?.includes(selectedSkill.id)).length === 0) ? (
                  <p className="text-xs font-mono text-zinc-600 col-span-2">No active strategic planning documents linked to this skill path. Link them from the PLANNING tab.</p>
                ) : (
                  state.planningDocuments.filter(doc => doc.linkedSkills?.includes(selectedSkill.id)).map(doc => (
                    <div key={doc.id} className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-mono text-[10px] truncate flex items-center gap-1.5">
                        📂 {doc.path}
                      </span>
                      <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                        Connected
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-panel rounded-lg p-10 text-center space-y-2">
            <Award className="h-8 w-8 text-zinc-600 mx-auto" />
            <h3 className="font-display text-sm font-bold text-white uppercase">No Skill Selected</h3>
            <p className="text-xs text-zinc-500 font-mono">Select a skill parameter on the left directory to inspect its metrics.</p>
          </div>
        )}
      </div>

    </div>
  );
};
