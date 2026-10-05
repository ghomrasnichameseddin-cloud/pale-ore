import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { Skill, SkillType, CoreDomain } from '../../types';
import { 
  CORE_DOMAINS,
  DOMAIN_ATTRIBUTES,
  ATTRIBUTE_DOMAIN_MAP,
  CANONICAL_ATTRIBUTES,
  CANONICAL_ATTRIBUTE_METADATA,
  CORE_DOMAIN_METADATA,
  canonicalizeAttributeName,
  getSkillRank,
  getSkillRankDetails,
  calculateSkillLevel,
  calculateSkillMastery,
  SKILL_RANK_THRESHOLDS,
  CanonicalAttributeName
} from '../../utils/progressionEngine';
import { 
  Award, Sparkles, Plus, Trash2, Edit2, CheckCircle2, 
  Search, Archive, ArchiveRestore, Tag, X, ChevronRight,
  Filter, Layers, ArrowUpRight, Zap, Target, BookOpen, Shield, Crown
} from 'lucide-react';
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
    createSkill,
    updateSkill,
    changeSkillType,
    toggleArchiveSkill, 
    deleteSkill, 
    addSkillXp,
    equipSkillTitle,
    addQuest,
    getSkillRankDetails
  } = usePOS();

  // Selected skill
  const selectedSkill = state.skills.find(s => s.id === selectedSkillId) || state.skills[0] || null;
  const selectedRankDetails = selectedSkill ? getSkillRankDetails(selectedSkill.xp || 0) : null;

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState<CoreDomain | 'ALL'>('ALL');
  const [filterAttribute, setFilterAttribute] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'primary' | 'secondary'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');

  // Creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [newSkillType, setNewSkillType] = useState<SkillType>('primary');
  const [newSkillPrimaryAttr, setNewSkillPrimaryAttr] = useState<CanonicalAttributeName>('Knowledge');
  const [newSkillSecondaryAttr, setNewSkillSecondaryAttr] = useState<string>('Focus');
  const [newSkillTags, setNewSkillTags] = useState<string>('');
  const [newSkillInitialXp, setNewSkillInitialXp] = useState<number>(0);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSkillId, setEditSkillId] = useState<string>('');
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillDescription, setEditSkillDescription] = useState('');
  const [editSkillType, setEditSkillType] = useState<SkillType>('primary');
  const [editSkillPrimaryAttr, setEditSkillPrimaryAttr] = useState<CanonicalAttributeName>('Knowledge');
  const [editSkillSecondaryAttr, setEditSkillSecondaryAttr] = useState<string>('');
  const [editSkillTags, setEditSkillTags] = useState<string>('');

  // Quick XP award state
  const [showAddXpModal, setShowAddXpModal] = useState(false);
  const [xpToAdd, setXpToAdd] = useState<number>(100);

  // Quick Directive creation state
  const [showCreateDirective, setShowCreateDirective] = useState(false);
  const [newDirectiveName, setNewDirectiveName] = useState('');

  // Filter skills based on search, domain, attribute, type, and status
  const filteredSkills = state.skills.filter(skill => {
    // 1. Status
    if (filterStatus === 'ACTIVE' && skill.archived) return false;
    if (filterStatus === 'ARCHIVED' && !skill.archived) return false;

    // 2. Type (Primary / Secondary)
    const normalizedType: SkillType = skill.type || (skill.tier === 'Secondary' ? 'secondary' : 'primary');
    if (filterType !== 'ALL' && normalizedType !== filterType) return false;

    // 3. Domain Filter
    const primaryCanonical = canonicalizeAttributeName(skill.primaryAttribute);
    const domain = ATTRIBUTE_DOMAIN_MAP[primaryCanonical] || 'Mind';
    if (filterDomain !== 'ALL' && domain !== filterDomain) return false;

    // 4. Attribute Filter
    if (filterAttribute !== 'ALL') {
      const targetCanonical = canonicalizeAttributeName(filterAttribute);
      const secondaryCanonical = skill.secondaryAttribute ? canonicalizeAttributeName(skill.secondaryAttribute) : null;
      if (primaryCanonical !== targetCanonical && secondaryCanonical !== targetCanonical) {
        return false;
      }
    }

    // 5. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const nameMatch = skill.name.toLowerCase().includes(q);
      const descMatch = (skill.description || '').toLowerCase().includes(q);
      const tagsMatch = (skill.tags || []).some(t => t.toLowerCase().includes(q));
      const attrMatch = primaryCanonical.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !tagsMatch && !attrMatch) return false;
    }

    return true;
  });

  // Group into primary and secondary for clear visual hierarchy
  const primarySkills = filteredSkills.filter(s => (s.type || (s.tier === 'Secondary' ? 'secondary' : 'primary')) === 'primary');
  const secondarySkills = filteredSkills.filter(s => (s.type || (s.tier === 'Secondary' ? 'secondary' : 'primary')) === 'secondary');

  // Handle skill creation
  const handleCreateSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const tagsArray = newSkillTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const id = createSkill({
      name: newSkillName.trim(),
      type: newSkillType,
      description: newSkillDescription.trim(),
      primaryAttribute: newSkillPrimaryAttr,
      secondaryAttribute: newSkillSecondaryAttr && newSkillSecondaryAttr !== 'none' ? newSkillSecondaryAttr : null,
      tags: tagsArray,
      initialXp: Math.max(0, newSkillInitialXp)
    });

    setNewSkillName('');
    setNewSkillDescription('');
    setNewSkillTags('');
    setNewSkillInitialXp(0);
    setShowCreateModal(false);
    onSelectSkill(id);
  };

  // Open Edit Modal with selected skill values
  const startEditingSkill = (skill: Skill) => {
    setEditSkillId(skill.id);
    setEditSkillName(skill.name);
    setEditSkillDescription(skill.description || '');
    setEditSkillType(skill.type || (skill.tier === 'Secondary' ? 'secondary' : 'primary'));
    setEditSkillPrimaryAttr(canonicalizeAttributeName(skill.primaryAttribute));
    setEditSkillSecondaryAttr(skill.secondaryAttribute ? canonicalizeAttributeName(skill.secondaryAttribute) : '');
    setEditSkillTags((skill.tags || []).join(', '));
    setShowEditModal(true);
  };

  const handleEditSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSkillId || !editSkillName.trim()) return;

    const tagsArray = editSkillTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    updateSkill(editSkillId, {
      name: editSkillName.trim(),
      description: editSkillDescription.trim(),
      type: editSkillType,
      primaryAttribute: editSkillPrimaryAttr,
      secondaryAttribute: editSkillSecondaryAttr && editSkillSecondaryAttr !== 'none' ? editSkillSecondaryAttr : null,
      tags: tagsArray
    });

    setShowEditModal(false);
  };

  // Handle create directive for skill
  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill || !newDirectiveName.trim()) return;

    addQuest({
      name: `[${selectedSkill.name.toUpperCase()}] ${newDirectiveName.trim()}`,
      description: `Targeted operational development directive to advance ${selectedSkill.name} competencies.`,
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 80,
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

  return (
    <div className="space-y-6" id="skills-disciplines-root">
      
      {/* 1. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
            <h2 className="text-sm font-mono font-bold uppercase text-[#e5c875] tracking-wider">
              SKILL_CATALOG ({filteredSkills.length} of {state.skills.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-[#3a2e12] border border-[#c5a059] hover:bg-[#524119] text-[#fef08a] px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              CREATE SKILL
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, tags, or attributes..."
              className="w-full bg-[#07080c] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] font-sans"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Domain */}
          <div>
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value as any)}
              className="w-full bg-[#07080c] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#c5a059]"
            >
              <option value="ALL">🌐 All Domains</option>
              <option value="Mind">🧠 Mind Domain</option>
              <option value="Body">⚡ Body Domain</option>
              <option value="Soul">✨ Soul Domain</option>
            </select>
          </div>

          {/* Filter Attribute */}
          <div>
            <select
              value={filterAttribute}
              onChange={(e) => setFilterAttribute(e.target.value)}
              className="w-full bg-[#07080c] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#c5a059]"
            >
              <option value="ALL">🛡️ All Attributes (18 Pillars)</option>
              {CORE_DOMAINS.map(domain => (
                <optgroup key={domain} label={`${domain} Domain`}>
                  {DOMAIN_ATTRIBUTES[domain].map(attrName => (
                    <option key={attrName} value={attrName}>{attrName}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Filter Classification (Primary / Secondary) */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-[#07080c] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#c5a059]"
            >
              <option value="ALL">All Types</option>
              <option value="primary">Primary Skills</option>
              <option value="secondary">Secondary Skills</option>
            </select>
          </div>
        </div>

        {/* Quick Active / Archived toggle */}
        <div className="flex gap-2 pt-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterStatus === 'ACTIVE'
                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold'
                : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            ACTIVE SKILLS
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ARCHIVED')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterStatus === 'ARCHIVED'
                ? 'bg-amber-950 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            ARCHIVED
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              filterStatus === 'ALL'
                ? 'bg-white/10 border-white/20 text-white font-bold'
                : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            VIEW ALL
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: SKILL DIRECTORY & DEEP INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SKILLS LIST (PRIMARY & SECONDARY) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PRIMARY SKILLS SECTION */}
          {primarySkills.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-[#c5a059]" />
                  PRIMARY SKILLS ({primarySkills.length})
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  MAJOR COMPETENCIES
                </span>
              </div>

              <div className="space-y-2">
                {primarySkills.map(skill => {
                  const isSelected = skill.id === selectedSkill?.id;
                  const rank = getSkillRank(skill.xp || 0);
                  const details = getSkillRankDetails(skill.xp || 0);
                  const primCanonical = canonicalizeAttributeName(skill.primaryAttribute);
                  const domain = ATTRIBUTE_DOMAIN_MAP[primCanonical] || 'Mind';
                  const domainMeta = CORE_DOMAIN_METADATA[domain];

                  return (
                    <div
                      key={skill.id}
                      onClick={() => onSelectSkill(skill.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative space-y-2 ${
                        skill.archived
                          ? 'bg-[#07080c]/50 border-white/5 opacity-60'
                          : isSelected
                            ? 'bg-[#141824] border-[#c5a059] shadow-[0_0_16px_rgba(197,160,89,0.2)] ring-1 ring-[#c5a059]/40'
                            : 'bg-[#0b0d13] border-white/10 hover:border-[#c5a059]/40 hover:bg-[#131722]/60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-display font-bold text-sm ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                              {skill.name}
                            </h4>
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
                              PRIMARY
                            </span>
                            {skill.archived && (
                              <span className="text-[8px] font-mono font-bold px-1 rounded uppercase bg-amber-950 text-amber-400">
                                ARCHIVED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-zinc-400">
                            <span>{domainMeta.icon} {domain} / {primCanonical}</span>
                            {skill.secondaryAttribute && (
                              <span className="text-zinc-500">• {skill.secondaryAttribute}</span>
                            )}
                          </div>
                        </div>

                        {/* Rank Badge & XP */}
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${details.badgeClass}`}>
                            RANK {rank}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                            {skill.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>

                      {/* Rank Progress Bar */}
                      <div className="w-full bg-[#07080c] h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${details.progress}%`, backgroundColor: details.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECONDARY SKILLS SECTION */}
          {secondarySkills.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  SECONDARY SKILLS ({secondarySkills.length})
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  SUPPORTING DISCIPLINES
                </span>
              </div>

              <div className="space-y-2">
                {secondarySkills.map(skill => {
                  const isSelected = skill.id === selectedSkill?.id;
                  const rank = getSkillRank(skill.xp || 0);
                  const details = getSkillRankDetails(skill.xp || 0);
                  const primCanonical = canonicalizeAttributeName(skill.primaryAttribute);
                  const domain = ATTRIBUTE_DOMAIN_MAP[primCanonical] || 'Mind';
                  const domainMeta = CORE_DOMAIN_METADATA[domain];

                  return (
                    <div
                      key={skill.id}
                      onClick={() => onSelectSkill(skill.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative space-y-2 ${
                        skill.archived
                          ? 'bg-[#07080c]/50 border-white/5 opacity-60'
                          : isSelected
                            ? 'bg-[#181329] border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.2)] ring-1 ring-purple-400/40'
                            : 'bg-[#0b0d13] border-white/5 hover:border-purple-400/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-display font-bold text-sm ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                              {skill.name}
                            </h4>
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-purple-950 border border-purple-500/40 text-purple-300">
                              SECONDARY
                            </span>
                            {skill.archived && (
                              <span className="text-[8px] font-mono font-bold px-1 rounded uppercase bg-amber-950 text-amber-400">
                                ARCHIVED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-zinc-400">
                            <span>{domainMeta.icon} {domain} / {primCanonical}</span>
                            {skill.secondaryAttribute && (
                              <span className="text-zinc-500">• {skill.secondaryAttribute}</span>
                            )}
                          </div>
                        </div>

                        {/* Rank Badge & XP */}
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${details.badgeClass}`}>
                            RANK {rank}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                            {skill.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>

                      {/* Rank Progress Bar */}
                      <div className="w-full bg-[#07080c] h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${details.progress}%`, backgroundColor: details.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredSkills.length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl p-6 bg-[#07080c]">
              <Award className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-mono text-zinc-400">No skills match the active filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterDomain('ALL');
                  setFilterAttribute('ALL');
                  setFilterType('ALL');
                  setFilterStatus('ACTIVE');
                }}
                className="mt-3 text-xs font-mono text-[#c5a059] hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DEEP SKILL INSPECTOR */}
        {selectedSkill && selectedRankDetails ? (
          <div className="lg:col-span-7 space-y-5">
            
            {/* HERO SKILL INSPECTOR CARD */}
            <div className="bg-[#0b0d13] border border-[#c5a059]/30 rounded-2xl p-5 relative overflow-hidden shadow-xl space-y-4">
              <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${selectedRankDetails.badgeClass}`}>
                      RANK {selectedSkill.rank || selectedRankDetails.rank} • {selectedRankDetails.title}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                      (selectedSkill.type || (selectedSkill.tier === 'Secondary' ? 'secondary' : 'primary')) === 'primary'
                        ? 'text-[#fef08a] bg-[#3a2e12] border-[#c5a059]/40'
                        : 'text-purple-300 bg-purple-950 border-purple-500/40'
                    }`}>
                      {selectedSkill.type || (selectedSkill.tier === 'Secondary' ? 'secondary' : 'primary')} Skill
                    </span>
                    {selectedSkill.archived && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                        ARCHIVED
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
                    {selectedSkill.name}
                  </h2>

                  {selectedSkill.description && (
                    <p className="text-xs font-sans text-zinc-400 max-w-xl leading-relaxed">
                      {selectedSkill.description}
                    </p>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => startEditingSkill(selectedSkill)}
                    className="p-2 bg-[#07080c] border border-white/10 hover:border-[#c5a059] text-zinc-300 hover:text-white rounded-xl transition cursor-pointer"
                    title="Edit skill details"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddXpModal(true)}
                    className="px-2.5 py-1.5 bg-[#3a2e12] border border-[#c5a059]/50 hover:border-[#c5a059] text-[#fef08a] rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Add Skill XP"
                  >
                    <Plus className="h-3 w-3" />
                    XP
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateDirective(!showCreateDirective)}
                    className="px-3 py-1.5 bg-[#07080c] border border-white/10 hover:border-[#c5a059] text-zinc-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    DIRECTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleArchiveSkill(selectedSkill.id)}
                    className="p-2 bg-[#07080c] border border-white/10 hover:border-[#c5a059]/40 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
                    title={selectedSkill.archived ? 'Restore skill' : 'Archive skill'}
                  >
                    {selectedSkill.archived ? <ArchiveRestore className="h-3.5 w-3.5 text-emerald-400" /> : <Archive className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* QUICK DIRECTIVE CREATION FORM */}
              {showCreateDirective && (
                <form onSubmit={handleCreateDirective} className="p-3.5 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">
                    DEPLOY TARGETED DIRECTIVE FOR {selectedSkill.name.toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDirectiveName}
                      onChange={(e) => setNewDirectiveName(e.target.value)}
                      placeholder="e.g. Complete practical module / solve algorithm / recite passage..."
                      className="flex-1 bg-[#0b0d13] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newDirectiveName.trim()}
                      className="px-3.5 py-1.5 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold rounded-lg cursor-pointer"
                    >
                      DEPLOY
                    </button>
                  </div>
                </form>
              )}

              {/* AUTHORITATIVE XP & RANK PROGRESSION BAR */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Authoritative Skill XP:</span>
                    <strong className="text-white text-sm font-mono">{selectedSkill.xp.toLocaleString()} XP</strong>
                  </div>
                  <div className="text-right">
                    {selectedRankDetails.isMaxRank ? (
                      <span className="text-[#fef08a] font-bold">MAX RANK ACHIEVED</span>
                    ) : (
                      <span className="text-[#e5c875] font-bold">
                        {selectedRankDetails.xpIntoRank.toLocaleString()} / { (selectedRankDetails.nextRankMinXp - selectedRankDetails.currentRankMinXp).toLocaleString() } XP ({selectedRankDetails.progress}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-[#07080c] h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ 
                      width: `${selectedRankDetails.progress}%`,
                      backgroundColor: selectedRankDetails.color
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Current: Rank {selectedRankDetails.rank} ({selectedRankDetails.title})</span>
                  {!selectedRankDetails.isMaxRank && (
                    <span>Next Rank: {selectedRankDetails.xpNeededForNextRank.toLocaleString()} XP needed</span>
                  )}
                </div>
              </div>
            </div>

            {/* CORE DOMAIN & ATTRIBUTES BINDING */}
            <div className="bg-[#0b0d13] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#c5a059]" />
                  CORE DOMAIN &amp; ATTRIBUTE ANCHORS
                </span>
                <button
                  type="button"
                  onClick={() => startEditingSkill(selectedSkill)}
                  className="text-[10px] font-mono text-[#c5a059] hover:underline cursor-pointer"
                >
                  Change Attributes
                </button>
              </div>

              <p className="text-xs font-sans text-zinc-400 leading-relaxed">
                When you execute actions or directives tied to this skill, progression points directly develop these underlying canonical attributes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Primary Attribute */}
                {(() => {
                  const primCanonical = canonicalizeAttributeName(selectedSkill.primaryAttribute);
                  const domain = ATTRIBUTE_DOMAIN_MAP[primCanonical] || 'Mind';
                  const meta = CANONICAL_ATTRIBUTE_METADATA[primCanonical];
                  const domainMeta = CORE_DOMAIN_METADATA[domain];

                  return (
                    <div 
                      onClick={() => {
                        onSelectAttribute(primCanonical);
                        onNavigateTab('ATTRIBUTES');
                      }}
                      className="p-3 rounded-xl border border-[#c5a059]/40 bg-[#3a2e12]/30 hover:bg-[#3a2e12]/50 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{meta.icon}</span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-400 uppercase block">
                            PRIMARY ATTRIBUTE (+2 PTS)
                          </span>
                          <h4 className="font-display font-bold text-sm text-white">
                            {meta.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[#fef08a]">
                            {domainMeta.icon} {domain} Domain
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    </div>
                  );
                })()}

                {/* Secondary Attribute */}
                {selectedSkill.secondaryAttribute ? (() => {
                  const secCanonical = canonicalizeAttributeName(selectedSkill.secondaryAttribute);
                  const domain = ATTRIBUTE_DOMAIN_MAP[secCanonical] || 'Mind';
                  const meta = CANONICAL_ATTRIBUTE_METADATA[secCanonical];
                  const domainMeta = CORE_DOMAIN_METADATA[domain];

                  return (
                    <div 
                      onClick={() => {
                        onSelectAttribute(secCanonical);
                        onNavigateTab('ATTRIBUTES');
                      }}
                      className="p-3 rounded-xl border border-white/10 hover:border-white/20 bg-[#07080c] transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{meta.icon}</span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-400 uppercase block">
                            SECONDARY ATTRIBUTE (+1 PT)
                          </span>
                          <h4 className="font-display font-bold text-sm text-white">
                            {meta.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {domainMeta.icon} {domain} Domain
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    </div>
                  );
                })() : (
                  <div 
                    onClick={() => startEditingSkill(selectedSkill)}
                    className="p-3 rounded-xl border border-dashed border-white/10 bg-[#07080c] flex items-center justify-center text-center cursor-pointer hover:border-white/20"
                  >
                    <span className="text-xs font-mono text-zinc-500">
                      + Assign Secondary Attribute
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* TAGS & CLASSIFICATION */}
            <div className="bg-[#0b0d13] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#c5a059]" />
                  CLASSIFICATION &amp; TAGS
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextType: SkillType = selectedSkill.type === 'primary' ? 'secondary' : 'primary';
                    changeSkillType(selectedSkill.id, nextType);
                  }}
                  className="text-[10px] font-mono text-[#c5a059] hover:underline cursor-pointer"
                >
                  Switch to {selectedSkill.type === 'primary' ? 'Secondary' : 'Primary'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(selectedSkill.tags && selectedSkill.tags.length > 0) ? (
                  selectedSkill.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 bg-[#07080c] border border-white/10 rounded-lg text-xs font-mono text-zinc-300"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-zinc-500">No tags assigned.</span>
                )}
              </div>
            </div>

            {/* DANGER ZONE: DELETE */}
            <div className="pt-2 flex justify-between items-center text-xs font-mono text-zinc-500 px-1">
              <span>Skill ID: {selectedSkill.id}</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${selectedSkill.name}"? This removes the skill from the active catalog.`)) {
                    deleteSkill(selectedSkill.id);
                  }
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                DELETE SKILL
              </button>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#0b0d13]">
            <p className="text-zinc-500 font-mono text-sm">Select a skill to inspect its progression.</p>
          </div>
        )}

      </div>

      {/* 3. CREATE SKILL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-mono font-bold uppercase text-[#fef08a] tracking-wider">
                  CREATE_NEW_SKILL
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                  Skill Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Git, Muay Thai, Python Programming..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                  Description
                </label>
                <textarea 
                  rows={2}
                  placeholder="Specific competence focus, practice scope, or craft mastery roadmap..."
                  value={newSkillDescription}
                  onChange={(e) => setNewSkillDescription(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type: Primary vs Secondary */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                    Classification
                  </label>
                  <select
                    value={newSkillType}
                    onChange={(e) => setNewSkillType(e.target.value as SkillType)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="primary">Primary (Major Competency)</option>
                    <option value="secondary">Secondary (Supporting Competency)</option>
                  </select>
                </div>

                {/* Primary Attribute */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                    Primary Attribute *
                  </label>
                  <select
                    value={newSkillPrimaryAttr}
                    onChange={(e) => setNewSkillPrimaryAttr(e.target.value as CanonicalAttributeName)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                  >
                    {CORE_DOMAINS.map(domain => (
                      <optgroup key={domain} label={`${domain} Domain`}>
                        {DOMAIN_ATTRIBUTES[domain].map(attrName => (
                          <option key={attrName} value={attrName}>{attrName}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Secondary Attribute */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                    Secondary Attribute (Optional)
                  </label>
                  <select
                    value={newSkillSecondaryAttr}
                    onChange={(e) => setNewSkillSecondaryAttr(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="none">-- None --</option>
                    {CORE_DOMAINS.map(domain => (
                      <optgroup key={domain} label={`${domain} Domain`}>
                        {DOMAIN_ATTRIBUTES[domain].map(attrName => (
                          <option key={attrName} value={attrName}>{attrName}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Starting XP */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                    Initial XP (Optional)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    step="50"
                    value={newSkillInitialXp}
                    onChange={(e) => setNewSkillInitialXp(Number(e.target.value))}
                    className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                  Tags (comma separated)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. coding, devops, tools, martial-arts"
                  value={newSkillTags}
                  onChange={(e) => setNewSkillTags(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!newSkillName.trim()}
                  className="px-5 py-2 bg-[#3a2e12] border border-[#c5a059] hover:bg-[#524119] text-[#fef08a] rounded-xl text-xs font-mono font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  CREATE SKILL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT SKILL MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-mono font-bold uppercase text-[#fef08a] tracking-wider">
                  EDIT_SKILL_PARAMETERS
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                  Skill Name *
                </label>
                <input 
                  type="text"
                  required
                  value={editSkillName}
                  onChange={(e) => setEditSkillName(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-sans focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                  Description
                </label>
                <textarea 
                  rows={2}
                  value={editSkillDescription}
                  onChange={(e) => setEditSkillDescription(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type: Primary vs Secondary */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                    Classification
                  </label>
                  <select
                    value={editSkillType}
                    onChange={(e) => setEditSkillType(e.target.value as SkillType)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="primary">Primary (Major Competency)</option>
                    <option value="secondary">Secondary (Supporting Competency)</option>
                  </select>
                </div>

                {/* Primary Attribute */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                    Primary Attribute *
                  </label>
                  <select
                    value={editSkillPrimaryAttr}
                    onChange={(e) => setEditSkillPrimaryAttr(e.target.value as CanonicalAttributeName)}
                    className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                  >
                    {CORE_DOMAINS.map(domain => (
                      <optgroup key={domain} label={`${domain} Domain`}>
                        {DOMAIN_ATTRIBUTES[domain].map(attrName => (
                          <option key={attrName} value={attrName}>{attrName}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secondary Attribute */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                  Secondary Attribute
                </label>
                <select
                  value={editSkillSecondaryAttr}
                  onChange={(e) => setEditSkillSecondaryAttr(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="none">-- None --</option>
                  {CORE_DOMAINS.map(domain => (
                    <optgroup key={domain} label={`${domain} Domain`}>
                      {DOMAIN_ATTRIBUTES[domain].map(attrName => (
                        <option key={attrName} value={attrName}>{attrName}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                  Tags (comma separated)
                </label>
                <input 
                  type="text"
                  value={editSkillTags}
                  onChange={(e) => setEditSkillTags(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!editSkillName.trim()}
                  className="px-5 py-2 bg-[#3a2e12] border border-[#c5a059] hover:bg-[#524119] text-[#fef08a] rounded-xl text-xs font-mono font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD SKILL XP MODAL */}
      {showAddXpModal && selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase text-[#fef08a]">
                AWARD SKILL XP: {selectedSkill.name}
              </span>
              <button 
                type="button" 
                onClick={() => setShowAddXpModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 font-sans">
              Directly award Skill XP for deliberate practice or project completion.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                XP Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 250].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setXpToAdd(amt)}
                    className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                      xpToAdd === amt ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]' : 'bg-[#07080c] border-white/10 text-zinc-400'
                    }`}
                  >
                    +{amt} XP
                  </button>
                ))}
              </div>
              <input 
                type="number"
                min="1"
                step="10"
                value={xpToAdd}
                onChange={(e) => setXpToAdd(Number(e.target.value))}
                className="w-full bg-[#07080c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddXpModal(false)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-400"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  if (xpToAdd > 0) {
                    addSkillXp(selectedSkill.id, xpToAdd);
                    setShowAddXpModal(false);
                  }
                }}
                className="px-4 py-1.5 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded-xl text-xs font-mono font-bold"
              >
                AWARD XP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DisciplinesView;
