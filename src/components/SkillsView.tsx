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
    state, addSkill, updateSkillName, deleteSkill, clearAllSkills, getSkillXpAndLevel, 
    getGoalProgress, getProjectProgress, equipSkillTitle
  } = usePOS();

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(state.skills[0]?.id || null);
  
  // Custom skill creator states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

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

    const id = addSkill(newSkillName.trim());
    setNewSkillName('');
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
    deleteSkill(selectedSkillId);
    
    const remaining = state.skills.filter(s => s.id !== selectedSkillId);
    setSelectedSkillId(remaining[0]?.id || null);
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
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Public Speaking, Arabic..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 bg-zinc-900 border border-white/5 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
              <button 
                type="submit"
                className="bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-3 rounded hover:bg-cyan-900"
              >
                DISPATCH
              </button>
            </div>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddSkill(false)}
                className="text-[10px] font-mono text-zinc-500"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* Skills grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {state.skills.map(skill => {
            const isSelected = skill.id === selectedSkillId;
            const stats = getSkillXpAndLevel(skill.id);

            return (
              <button
                key={skill.id}
                onClick={() => {
                  setSelectedSkillId(skill.id);
                  setIsEditingSkill(false);
                }}
                className={`text-left p-4 rounded-lg border transition-all space-y-3 flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-zinc-900/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                    : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">LVL_{stats.level}</span>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950/20 px-1 rounded uppercase">
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
                </div>

                {/* Progress bar */}
                <div className="w-full space-y-1">
                  <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full rounded transition-all duration-300"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                    <span>{stats.xp} TOTAL XP</span>
                    <span>{stats.progress}% LEVEL_GAP</span>
                  </div>
                </div>
              </button>
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
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">SKILL_TRACK_MONITOR</span>
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
                <div className="flex gap-1.5 shrink-0">
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

            {/* TITLES OPTIONS SECTION */}
            <div className="space-y-3.5 border-t border-b border-white/5 py-5">
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-cyan-400" />
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
                              ? 'bg-zinc-900/60 border-white/5 hover:border-cyan-500/30 text-zinc-300 hover:text-white'
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
                            <span className="text-[8px] font-mono text-cyan-500 font-semibold group-hover:text-cyan-400">UNLOCKED</span>
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
                      className="flex-1 bg-zinc-950/80 border border-white/5 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono px-3.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase font-semibold"
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
                <Target className="h-4 w-4 text-cyan-400" />
                ASSOCIATED GOAL PATHS ({relatedGoals.length})
              </h4>
              
              <div className="space-y-2">
                {relatedGoals.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-600">No goals are explicitly associated with this skill parameter.</p>
                ) : (
                  relatedGoals.map(g => (
                    <div key={g.id} className="p-3 bg-zinc-950 border border-white/5 rounded flex justify-between items-center text-xs">
                      <span className="text-white font-sans font-medium">{g.name}</span>
                      <span className="text-cyan-400 font-mono font-bold">{getGoalProgress(g.id)}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COMPLETED / ACTIVE DIRECTIVES UNDER THIS SKILL */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="h-4 w-4 text-cyan-400" />
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
                        <span className="text-cyan-400 font-mono">+{q.xp} XP</span>
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
