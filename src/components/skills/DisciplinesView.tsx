import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { Skill, Goal, Project, Quest } from '../../types';
import { 
  SOVEREIGN_ATTRIBUTES_METADATA, 
  getSkillEvidence, 
  calculateMasteryDimension,
  getDefaultAttributesForSkill,
  StrategicCapabilityGap
} from '../../utils/capabilityIntelligence';
import { 
  Award, Sparkles, Plus, Trash2, Edit2, CheckCircle2, 
  Circle, BarChart, ExternalLink, Target, Briefcase, ListTodo,
  Tag, Lock, Check, Crown, Search, Archive, ArchiveRestore,
  GitMerge, Layers, Filter, AlertTriangle, Unlink, X, ChevronDown,
  ChevronRight, BookOpen, Clock, FileText, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface DisciplinesViewProps {
  selectedSkillId: string | null;
  onSelectSkill: (id: string) => void;
  onSelectAttribute: (name: string) => void;
  onNavigateTab: (tab: 'OVERVIEW' | 'ATTRIBUTES' | 'DISCIPLINES' | 'INTELLIGENCE') => void;
}

export const DisciplinesView: React.FC<DisciplinesViewProps> = ({
  selectedSkillId,
  onSelectSkill,
  onSelectAttribute,
  onNavigateTab
}) => {
  const { 
    state, 
    addSkill, 
    updateSkillName, 
    updateSkillTier, 
    updateSkillParent, 
    toggleArchiveSkill, 
    mergeSkills, 
    deleteSkill, 
    deleteUnusedSkills, 
    clearAllSkills, 
    getSkillXpAndLevel, 
    getGoalProgress, 
    getProjectProgress, 
    equipSkillTitle,
    updateSkillAttributes,
    updateSkillDetails,
    addQuest
  } = usePOS();

  // Selected skill
  const selectedSkill = state.skills.find(s => s.id === selectedSkillId) || state.skills[0] || null;
  const selectedSkillStats = selectedSkill ? getSkillXpAndLevel(selectedSkill.id) : null;
  const skillEvidence = selectedSkill ? getSkillEvidence(selectedSkill.id, state) : null;
  const masteryDimension = (selectedSkill && skillEvidence) 
    ? calculateMasteryDimension(selectedSkill, skillEvidence)
    : null;

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Archived' | 'Primary' | 'Secondary' | 'Unused'>('Active');
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  // Creation modal states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillTier, setNewSkillTier] = useState<'Primary' | 'Secondary'>('Primary');
  const [newSkillParentId, setNewSkillParentId] = useState<string>('');
  const [newPrimaryAttr, setNewPrimaryAttr] = useState<string>('a-6'); // Default Knowledge
  const [antiInflationWarning, setAntiInflationWarning] = useState<string | null>(null);

  // Rename skill state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Merge modal state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');

  // Quick Directive creation state
  const [showCreateDirective, setShowCreateDirective] = useState(false);
  const [newDirectiveName, setNewDirectiveName] = useState('');

  // Add secondary specialization states
  const [newSecSkillName, setNewSecSkillName] = useState('');
  const [attachSecSkillId, setAttachSecSkillId] = useState('');

  // Attribute assignment states
  const [isEditingAttributes, setIsEditingAttributes] = useState(false);
  const [selectedPrimaryAttrId, setSelectedPrimaryAttrId] = useState<string>('');
  const [selectedSecondaryAttrIds, setSelectedSecondaryAttrIds] = useState<string[]>([]);

  // Filter skills
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

  // Group into tree: Primary skills and Standalone secondary skills
  const primarySkills = filteredSkills.filter(s => (s.tier || 'Primary') === 'Primary');
  const standaloneSecondary = filteredSkills.filter(s => s.tier === 'Secondary' && (!s.parentId || !state.skills.some(p => p.id === s.parentId)));

  // Toggle parent node collapse
  const toggleParentCollapse = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedParents(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  // Anti-inflation check on new skill name
  const handleNameChange = (val: string) => {
    setNewSkillName(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setAntiInflationWarning(null);
      return;
    }
    // Check direct duplicate
    const exact = state.skills.find(s => s.name.toLowerCase() === trimmed);
    if (exact) {
      setAntiInflationWarning(`A discipline track named "${exact.name}" already exists. Prefer deepening this track instead of fragmenting.`);
      return;
    }
    // Check close substring
    const closeMatch = state.skills.find(s => s.name.toLowerCase().includes(trimmed) || trimmed.includes(s.name.toLowerCase()));
    if (closeMatch && trimmed.length > 3) {
      setAntiInflationWarning(`Close match with existing track "${closeMatch.name}". Consider adding this as a Secondary Specialization under "${closeMatch.name}" to prevent skill dilution.`);
      return;
    }
    setAntiInflationWarning(null);
  };

  // Handle skill creation
  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const duplicate = state.skills.find(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (duplicate) {
      alert(`Discipline "${duplicate.name}" already exists.`);
      return;
    }

    const id = addSkill(newSkillName.trim(), newSkillTier, newSkillTier === 'Secondary' && newSkillParentId ? newSkillParentId : null);
    
    // Assign chosen primary attribute
    updateSkillAttributes(id, newPrimaryAttr, []);

    setNewSkillName('');
    setNewSkillTier('Primary');
    setNewSkillParentId('');
    setShowAddSkill(false);
    onSelectSkill(id);
  };

  // Handle create directive for skill
  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill || !newDirectiveName.trim()) return;

    addQuest({
      name: `[${selectedSkill.name.toUpperCase()}] ${newDirectiveName.trim()}`,
      description: `Targeted execution directive for skill mastery in ${selectedSkill.name}.`,
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 75,
      type: 'Main',
      relatedSkills: [selectedSkill.id],
      goalId: null,
      projectId: null,
      status: 'Active',
      recurrence: 'None',
      subquests: [],
      deadline: state.systemDate
    });

    setNewDirectiveName('');
    setShowCreateDirective(false);
  };

  // Handle save edited attributes
  const handleSaveAttributes = () => {
    if (!selectedSkill) return;
    updateSkillAttributes(selectedSkill.id, selectedPrimaryAttrId, selectedSecondaryAttrIds);
    setIsEditingAttributes(false);
  };

  // Open attribute edit mode with current values
  const startEditingAttributes = () => {
    if (!selectedSkill) return;
    const defaults = getDefaultAttributesForSkill(selectedSkill.name);
    setSelectedPrimaryAttrId(selectedSkill.primaryAttributeId || defaults.primaryId);
    setSelectedSecondaryAttrIds(selectedSkill.secondaryAttributeIds || defaults.secondaryIds);
    setIsEditingAttributes(true);
  };

  // Find linked Destinies & Campaigns
  const linkedGoals = selectedSkill 
    ? state.goals.filter(g => g.relatedSkills.includes(selectedSkill.id))
    : [];

  const linkedProjects = selectedSkill
    ? state.projects.filter(p => 
        (p.requiredSkills || []).includes(selectedSkill.id) ||
        (p.requiredCapabilities || []).some(rc => rc.skillId === selectedSkill.id)
      )
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="skills-disciplines-root">
      
      {/* LEFT 1-2 COLUMNS: HIERARCHICAL SKILL TREE & DIRECTORY */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* DIRECTORY CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-[#c5a059]/20 gap-2">
          <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
            DISCIPLINE_TREE ({filteredSkills.length})
          </span>

          <div className="flex flex-wrap gap-1.5">
            <button 
              type="button"
              onClick={() => { setShowAddSkill(!showAddSkill); }}
              className="text-[11px] font-mono bg-[#3a2e12]/90 border border-[#c5a059]/40 hover:border-[#c5a059] text-[#fef08a] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
              title="Create a new discipline track"
            >
              <Plus className="h-3 w-3" />
              NEW TRACK
            </button>
            <button 
              type="button"
              onClick={() => onNavigateTab('INTELLIGENCE')}
              className="text-[11px] font-mono bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Open Skill Hygiene Suite"
            >
              <GitMerge className="h-3 w-3 text-[#c5a059]" />
              HYGIENE
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by craft or specialization..."
              className="w-full bg-[#07080c] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] font-sans"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['Active', 'All', 'Primary', 'Secondary', 'Archived'] as const).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded uppercase transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a]'
                    : 'bg-[#07080c] border border-white/5 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ANTI-INFLATION SKILL CREATION MODAL */}
        {showAddSkill && (
          <form onSubmit={handleCreateSkill} className="p-4 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-[#c5a059]" />
                INITIALIZE_DISCIPLINE_TRACK
              </span>
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                Discipline Track Name
              </label>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Systems Architecture, Qur'anic Exegesis, Arabic Grammar..."
                className="w-full bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                autoFocus
              />
            </div>

            {/* ANTI-INFLATION WARNING CALLOUT */}
            {antiInflationWarning && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1 font-bold text-[10px] font-mono text-amber-300">
                  <AlertTriangle className="h-3 w-3" />
                  CAPABILITY DENSITY PROTOCOL
                </div>
                <p className="text-[11px] leading-relaxed">
                  {antiInflationWarning}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* TIER SELECTION */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                  Hierarchy Tier
                </label>
                <select
                  value={newSkillTier}
                  onChange={(e) => setNewSkillTier(e.target.value as any)}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-300 font-mono"
                >
                  <option value="Primary">Primary Discipline (Parent Track)</option>
                  <option value="Secondary">Secondary Specialization (Sub-Track)</option>
                </select>
              </div>

              {/* PARENT SELECTION IF SECONDARY */}
              {newSkillTier === 'Secondary' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                    Parent Discipline
                  </label>
                  <select
                    value={newSkillParentId}
                    onChange={(e) => setNewSkillParentId(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-300 font-mono"
                  >
                    <option value="">-- Standalone Sub-Track --</option>
                    {state.skills.filter(s => (s.tier || 'Primary') === 'Primary').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* PRIMARY CORE ATTRIBUTE LINKAGE */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                  Feeding Sovereign Attribute
                </label>
                <select
                  value={newPrimaryAttr}
                  onChange={(e) => setNewPrimaryAttr(e.target.value)}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-300 font-mono"
                >
                  {Object.values(SOVEREIGN_ATTRIBUTES_METADATA).map(meta => (
                    <option key={meta.id} value={meta.id}>
                      {meta.icon} {meta.name} ({meta.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!newSkillName.trim()}
                className="px-4 py-1.5 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                INITIALIZE
              </button>
            </div>
          </form>
        )}

        {/* SKILL TREE NODES LIST */}
        <div className="space-y-3">
          {primarySkills.map(primary => {
            const stats = getSkillXpAndLevel(primary.id);
            const isSelected = primary.id === selectedSkill?.id;
            const subSkills = state.skills.filter(s => s.parentId === primary.id);
            const isCollapsed = !!collapsedParents[primary.id];

            return (
              <div key={primary.id} className="space-y-1.5">
                {/* PRIMARY DISCIPLINE NODE */}
                <div
                  onClick={() => onSelectSkill(primary.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    primary.archived
                      ? 'bg-[#07080c]/50 border-white/5 opacity-60'
                      : isSelected
                        ? 'bg-[#141824] border-[#c5a059] shadow-[0_0_16px_rgba(197,160,89,0.18)] ring-1 ring-[#c5a059]/40'
                        : 'bg-[#0b0d13] border-[#c5a059]/20 hover:border-[#c5a059]/40 hover:bg-[#131722]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {subSkills.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => toggleParentCollapse(primary.id, e)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                      >
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    ) : (
                      <span className="w-5 text-center text-[10px] text-zinc-600 font-mono">•</span>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-display font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {primary.name}
                        </h4>
                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded uppercase font-bold text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40">
                          PRIMARY
                        </span>
                        {primary.archived && (
                          <span className="text-[8px] font-mono px-1 rounded uppercase font-bold text-amber-400 bg-amber-950/60 border border-amber-500/20">
                            ARCHIVED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-zinc-400">
                        <span>Mastery {stats.mastery}%</span>
                        {primary.equippedTitle && (
                          <span className="text-[#e5c875] font-semibold flex items-center gap-1">
                            • {primary.equippedTitle}
                          </span>
                        )}
                        {subSkills.length > 0 && (
                          <span className="text-purple-300 font-semibold">
                            • {subSkills.length} sub-track{subSkills.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-mono font-bold text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40 px-2 py-0.5 rounded">
                      LVL_{stats.level}
                    </span>
                  </div>
                </div>

                {/* NESTED SECONDARY SPECIALIZATIONS */}
                {!isCollapsed && subSkills.length > 0 && (
                  <div className="pl-6 space-y-1.5 border-l-2 border-[#c5a059]/20 ml-4">
                    {subSkills.map(sub => {
                      const subStats = getSkillXpAndLevel(sub.id);
                      const isSubSelected = sub.id === selectedSkill?.id;

                      return (
                        <div
                          key={sub.id}
                          onClick={() => onSelectSkill(sub.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            sub.archived
                              ? 'bg-[#07080c]/50 border-white/5 opacity-60'
                              : isSubSelected
                                ? 'bg-[#181329] border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                                : 'bg-[#0b0d13]/90 border-white/5 hover:border-purple-400/40 hover:bg-[#131122]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 text-xs">↳</span>
                            <div>
                              <h5 className={`font-display font-bold text-xs ${isSubSelected ? 'text-white' : 'text-zinc-300'}`}>
                                {sub.name}
                              </h5>
                              <span className="text-[8px] font-mono text-purple-300 uppercase">
                                Secondary • Mstry {subStats.mastery}%
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-purple-200 bg-purple-950/80 border border-purple-500/40 px-1.5 py-0.5 rounded">
                            LVL_{subStats.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* STANDALONE SECONDARY SKILLS */}
          {standaloneSecondary.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                STANDALONE SPECIALIZATIONS ({standaloneSecondary.length})
              </span>
              {standaloneSecondary.map(sub => {
                const stats = getSkillXpAndLevel(sub.id);
                const isSelected = sub.id === selectedSkill?.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => onSelectSkill(sub.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#181329] border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.2)]'
                        : 'bg-[#0b0d13] border-white/5 hover:border-purple-400/40'
                    }`}
                  >
                    <div>
                      <h4 className="font-display font-bold text-xs text-white">
                        {sub.name}
                      </h4>
                      <span className="text-[8px] font-mono text-purple-300 uppercase">
                        Standalone Secondary Track
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-200 bg-purple-950 border border-purple-500/40 px-2 py-0.5 rounded">
                      LVL_{stats.level}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT 2 COLUMNS: DEEP SKILL PROFILE & MASTERY DIMENSION INSPECTOR */}
      {selectedSkill && selectedSkillStats && (
        <div className="lg:col-span-2 space-y-6">
          
          {/* HERO SKILL CARD */}
          <div className="bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40 px-2 py-0.5 rounded">
                    LVL_{selectedSkillStats.level}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                    (selectedSkill.tier || 'Primary') === 'Primary'
                      ? 'text-[#fef08a] bg-[#3a2e12] border-[#c5a059]/40'
                      : 'text-purple-300 bg-purple-950 border-purple-500/40'
                  }`}>
                    {selectedSkill.tier || 'Primary'}
                  </span>
                  {selectedSkill.archived && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold text-amber-400 bg-amber-950 border border-amber-500/30">
                      ARCHIVED
                    </span>
                  )}
                </div>

                {isEditingName ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="bg-[#07080c] border border-[#c5a059] rounded px-2.5 py-1 text-sm text-white font-display font-bold focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editNameValue.trim()) {
                          updateSkillName(selectedSkill.id, editNameValue.trim());
                        }
                        setIsEditingName(false);
                      }}
                      className="px-2.5 py-1 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold rounded"
                    >
                      SAVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl text-white">
                      {selectedSkill.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditNameValue(selectedSkill.name);
                        setIsEditingName(true);
                      }}
                      className="text-zinc-500 hover:text-[#c5a059] transition-colors p-1"
                      title="Rename discipline"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {selectedSkill.equippedTitle && (
                  <div className="pt-0.5">
                    <span className="text-[10px] font-mono text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/50 px-2.5 py-0.5 rounded uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
                      <Crown className="h-3 w-3 text-[#e5c875]" />
                      {selectedSkill.equippedTitle}
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowCreateDirective(!showCreateDirective)}
                  className="px-3 py-1.5 bg-[#3a2e12] border border-[#c5a059]/50 hover:border-[#c5a059] text-[#fef08a] rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  DIRECTIVE
                </button>
                <button
                  type="button"
                  onClick={() => toggleArchiveSkill(selectedSkill.id)}
                  className="p-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={selectedSkill.archived ? 'Restore discipline' : 'Archive discipline'}
                >
                  {selectedSkill.archived ? <ArchiveRestore className="h-4 w-4 text-emerald-400" /> : <Archive className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* QUICK DIRECTIVE FORGE */}
            {showCreateDirective && (
              <form onSubmit={handleCreateDirective} className="p-3 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">
                  DEPLOY DIRECTIVE TIED TO {selectedSkill.name.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDirectiveName}
                    onChange={(e) => setNewDirectiveName(e.target.value)}
                    placeholder="e.g. Complete chapter 4 problems, refactor database schema..."
                    className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newDirectiveName.trim()}
                    className="px-3 py-1 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold rounded cursor-pointer"
                  >
                    DEPLOY
                  </button>
                </div>
              </form>
            )}

            {/* XP PROGRESSION BAR */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Total XP: {selectedSkillStats.xp}</span>
                <span className="text-[#e5c875] font-bold">
                  Level {selectedSkillStats.level} ({selectedSkillStats.progress}% to Level {selectedSkillStats.level + 1})
                </span>
              </div>
              <div className="w-full bg-[#07080c] h-2 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#c5a059] to-[#e5c875] transition-all duration-300 rounded-full"
                  style={{ width: `${selectedSkillStats.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4-STAGE MASTERY DIMENSION & EVIDENCE */}
          {masteryDimension && (
            <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-[#c5a059]" />
                  4-STAGE_MASTERY_DIMENSION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
                  STAGE {masteryDimension.stage}
                </span>
              </div>

              {/* 4 STAGE PILL TRACK */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { stage: 'Exposure', label: '1. Exposure', req: 'Directives 1-5' },
                  { stage: 'Practice', label: '2. Practice', req: 'Directives 6-15' },
                  { stage: 'Application', label: '3. Application', req: 'Campaign Project' },
                  { stage: 'Demonstration', label: '4. Demonstration', req: 'Codex / Playbook' }
                ].map((s) => {
                  const isActive = masteryDimension.stage === s.stage;
                  const stages = ['Exposure', 'Practice', 'Application', 'Demonstration'];
                  const isPassed = stages.indexOf(s.stage) < stages.indexOf(masteryDimension.stage);

                  return (
                    <div
                      key={s.stage}
                      className={`p-2.5 rounded-lg border text-center space-y-1 ${
                        isActive
                          ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.2)]'
                          : isPassed
                            ? 'bg-[#07080c] border-emerald-500/30 text-emerald-400'
                            : 'bg-[#07080c] border-white/5 text-zinc-600'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-bold block">{s.label}</span>
                      <span className="text-[8px] font-mono block opacity-80">{s.req}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-[#07080c] rounded-lg border border-white/5 text-xs text-zinc-300 space-y-1">
                <p className="leading-relaxed">
                  {masteryDimension.stageDescription}
                </p>
                <div className="text-[10px] font-mono text-[#fef08a] pt-1">
                  🎯 Next Stage Milestone: {masteryDimension.nextMilestoneRequirement}
                </div>
              </div>

              {/* EVIDENCE NUMBERS */}
              {skillEvidence && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-2.5 bg-[#07080c] rounded-lg border border-white/5 text-center">
                    <span className="text-base font-mono font-bold text-white block">
                      {skillEvidence.completedDirectivesCount}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400 uppercase">
                      DIRECTIVES DONE
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#07080c] rounded-lg border border-white/5 text-center">
                    <span className="text-base font-mono font-bold text-cyan-300 block">
                      {skillEvidence.focusMinutesTotal}m
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400 uppercase">
                      DEEP WORK LABORED
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#07080c] rounded-lg border border-white/5 text-center">
                    <span className="text-base font-mono font-bold text-[#fef08a] block">
                      {skillEvidence.strategicCampaignsCount}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400 uppercase">
                      CAMPAIGNS TIED
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#07080c] rounded-lg border border-white/5 text-center">
                    <span className="text-base font-mono font-bold text-purple-300 block">
                      {skillEvidence.codexDocsCount}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400 uppercase">
                      CODEX DOCS
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONSTITUTIONAL LINKAGE (SOVEREIGN ATTRIBUTES ROUTING) */}
          <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                CONSTITUTIONAL_LINKAGE (SOVEREIGN ATTRIBUTES)
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isEditingAttributes) {
                    handleSaveAttributes();
                  } else {
                    startEditingAttributes();
                  }
                }}
                className="text-[10px] font-mono text-[#c5a059] hover:text-[#fef08a] font-bold cursor-pointer flex items-center gap-1"
              >
                {isEditingAttributes ? <Check className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                {isEditingAttributes ? 'SAVE LINKAGES' : 'CONFIGURE'}
              </button>
            </div>

            {isEditingAttributes ? (
              <div className="space-y-3 p-3.5 bg-[#07080c] rounded-xl border border-[#c5a059]/40">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                    Primary Sovereign Attribute (Receives full direct progression points)
                  </label>
                  <select
                    value={selectedPrimaryAttrId}
                    onChange={(e) => setSelectedPrimaryAttrId(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    {Object.values(SOVEREIGN_ATTRIBUTES_METADATA).map(meta => (
                      <option key={meta.id} value={meta.id}>
                        {meta.icon} {meta.name} ({meta.focusArea})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                    Secondary Sovereign Attributes (Receives 75% secondary progression points)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.values(SOVEREIGN_ATTRIBUTES_METADATA)
                      .filter(m => m.id !== selectedPrimaryAttrId)
                      .map(meta => {
                        const isChecked = selectedSecondaryAttrIds.includes(meta.id);
                        return (
                          <label
                            key={meta.id}
                            className={`p-2 rounded border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]'
                                : 'bg-[#0b0d13] border-white/10 text-zinc-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSecondaryAttrIds([...selectedSecondaryAttrIds, meta.id]);
                                } else {
                                  setSelectedSecondaryAttrIds(selectedSecondaryAttrIds.filter(id => id !== meta.id));
                                }
                              }}
                              className="rounded border-zinc-700 text-[#c5a059] focus:ring-0"
                            />
                            <span>{meta.icon} {meta.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAttributes(false)}
                    className="px-3 py-1 text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAttributes}
                    className="px-4 py-1 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded text-xs font-mono font-bold"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When directives associated with this discipline are completed, XP automatically flows into these Sovereign Core Attributes:
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const defaults = getDefaultAttributesForSkill(selectedSkill.name);
                    const primaryMeta = Object.values(SOVEREIGN_ATTRIBUTES_METADATA).find(m => m.id === (selectedSkill.primaryAttributeId || defaults.primaryId));
                    const secondaryMetas = (selectedSkill.secondaryAttributeIds || defaults.secondaryIds).map(id => 
                      Object.values(SOVEREIGN_ATTRIBUTES_METADATA).find(m => m.id === id)
                    ).filter(Boolean);

                    return (
                      <>
                        {primaryMeta && (
                          <div 
                            onClick={() => {
                              onSelectAttribute(primaryMeta.name);
                              onNavigateTab('ATTRIBUTES');
                            }}
                            className="px-3 py-1.5 bg-[#3a2e12] border border-[#c5a059] rounded-lg text-xs font-mono text-[#fef08a] flex items-center gap-1.5 cursor-pointer hover:bg-[#524119] transition-all"
                          >
                            <span>{primaryMeta.icon}</span>
                            <span className="font-bold">{primaryMeta.name}</span>
                            <span className="text-[8px] bg-[#07080c] px-1 py-0.2 rounded uppercase">PRIMARY (100%)</span>
                          </div>
                        )}

                        {secondaryMetas.map(sec => sec && (
                          <div
                            key={sec.id}
                            onClick={() => {
                              onSelectAttribute(sec.name);
                              onNavigateTab('ATTRIBUTES');
                            }}
                            className="px-2.5 py-1 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 rounded-lg text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <span>{sec.icon}</span>
                            <span>{sec.name}</span>
                            <span className="text-[8px] text-zinc-500 uppercase">SECONDARY</span>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* MASTER TITLES & ALIAS FORGE (PRESERVED) */}
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

              {/* Custom Title Option (Unlocks at level 10) */}
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
                    className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059] disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          equipSkillTitle(selectedSkill.id, val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={selectedSkillStats.level < 10}
                    onClick={() => {
                      const input = document.getElementById('custom-title-input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        equipSkillTitle(selectedSkill.id, input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-3 py-1.5 bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
                  >
                    FORGE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ADD SECONDARY SPECIALIZATIONS CONTROLS */}
          {(selectedSkill.tier || 'Primary') === 'Primary' && (
            <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
              <span className="text-xs font-mono text-[#c5a059] uppercase tracking-wider block font-bold">
                ATTACH SECONDARY SPECIALIZATION
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Create New */}
                <div className="p-3 bg-[#07080c] border border-white/10 rounded-lg space-y-2">
                  <span className="text-[9px] font-mono text-purple-300 uppercase block font-semibold">
                    ➕ Create New Sub-Track
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newSecSkillName}
                      onChange={(e) => setNewSecSkillName(e.target.value)}
                      placeholder="e.g. Async Programming"
                      className="bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400 flex-1 font-sans"
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
                      className="px-3 py-1 bg-purple-950 border border-purple-500/40 text-purple-200 rounded text-xs font-mono font-bold disabled:opacity-40 cursor-pointer"
                    >
                      ADD
                    </button>
                  </div>
                </div>

                {/* Option B: Attach Existing Track */}
                <div className="p-3 bg-[#07080c] border border-white/10 rounded-lg space-y-2">
                  <span className="text-[9px] font-mono text-[#e5c875] uppercase block font-semibold">
                    🔗 Attach Existing Track
                  </span>
                  <div className="flex gap-1.5">
                    <select
                      value={attachSecSkillId}
                      onChange={(e) => setAttachSecSkillId(e.target.value)}
                      className="bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-[#c5a059] font-mono truncate"
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
                      className="px-3 py-1 bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] rounded text-xs font-mono font-bold disabled:opacity-40 cursor-pointer"
                    >
                      ATTACH
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DANGER ZONE: MERGE / PURGE */}
          <div className="pt-2 flex justify-between items-center text-xs font-mono text-zinc-500">
            <button
              type="button"
              onClick={() => onNavigateTab('INTELLIGENCE')}
              className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <GitMerge className="h-3 w-3 text-[#c5a059]" />
              MERGE WITH ANOTHER TRACK
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Purge discipline "${selectedSkill.name}"? Historical XP remains intact, but this skill will be removed from all active directives.`)) {
                  deleteSkill(selectedSkill.id);
                }
              }}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              PURGE TRACK
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
