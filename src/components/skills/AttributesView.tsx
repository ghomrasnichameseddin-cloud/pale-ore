import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  SOVEREIGN_ATTRIBUTES_METADATA, 
  getAttributeEvidence, 
  getAttributeTrend 
} from '../../utils/capabilityIntelligence';
import { 
  Shield, Zap, Award, Target, Plus, RefreshCw, 
  TrendingUp, AlertTriangle, CheckCircle2, ChevronRight,
  Sparkles, ExternalLink, Dumbbell, BookOpen, HeartHandshake,
  Compass
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface AttributesViewProps {
  selectedAttributeName: string;
  onSelectAttribute: (name: string) => void;
  onSelectSkill: (skillId: string) => void;
  onNavigateTab: (tab: 'OVERVIEW' | 'ATTRIBUTES' | 'DISCIPLINES' | 'INTELLIGENCE') => void;
}

export const AttributesView: React.FC<AttributesViewProps> = ({
  selectedAttributeName,
  onSelectAttribute,
  onSelectSkill,
  onNavigateTab
}) => {
  const { 
    state, 
    getAttributes, 
    restartAttribute, 
    addQuest,
    getSkillXpAndLevel 
  } = usePOS();

  const attributes = getAttributes();
  const currentAttr = attributes.find(a => a.name === selectedAttributeName) || attributes[0];
  const meta = SOVEREIGN_ATTRIBUTES_METADATA[currentAttr?.name || 'Strength'];
  const evidence = currentAttr ? getAttributeEvidence(currentAttr.name, state) : null;
  const trend = currentAttr ? getAttributeTrend(currentAttr.name, state.xpHistory, state.systemDate) : null;

  // New directive draft state for this attribute
  const [showDraftDirective, setShowDraftDirective] = useState(false);
  const [directiveTitle, setDirectiveTitle] = useState('');
  const [directiveDifficulty, setDirectiveDifficulty] = useState<'Easy' | 'Normal' | 'Hard' | 'Boss'>('Normal');

  // Active weaknesses related to this attribute from Muhasabah
  const linkedWeaknesses = (state.weaknesses || []).filter(w => {
    if (w.status !== 'Active') return false;
    const name = currentAttr?.name?.toLowerCase() || '';
    return (
      w.name.toLowerCase().includes(name) ||
      (w.description && w.description.toLowerCase().includes(name)) ||
      (w.category && w.category.toLowerCase().includes(name))
    );
  });

  const handleCreateDirectiveForAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveTitle.trim()) return;

    // Pick first related skill or leave general
    const primarySkill = evidence?.relatedSkills[0];

    addQuest({
      name: `[${currentAttr.name.toUpperCase()}] ${directiveTitle.trim()}`,
      description: `Targeted operational development directive to strengthen constitutional attribute ${currentAttr.name}.`,
      difficulty: directiveDifficulty,
      estimatedTime: directiveDifficulty === 'Hard' ? 45 : 25,
      xp: directiveDifficulty === 'Hard' ? 120 : (directiveDifficulty === 'Easy' ? 40 : 75),
      type: 'Main',
      relatedSkills: primarySkill ? [primarySkill.id] : [],
      goalId: null,
      projectId: null,
      status: 'Active',
      recurrence: 'None',
      subquests: [],
      deadline: state.systemDate
    });

    setDirectiveTitle('');
    setShowDraftDirective(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="skills-attributes-root">
      
      {/* LEFT COLUMN: 9 ATTRIBUTES SELECTION RAIL */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#c5a059]/20">
          <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
            <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
            SOVEREIGN_ATTRIBUTES (9)
          </span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            CONSTITUTION
          </span>
        </div>

        <div className="space-y-2">
          {attributes.map(attr => {
            const attrMeta = SOVEREIGN_ATTRIBUTES_METADATA[attr.name];
            const isSelected = attr.name === currentAttr?.name;
            const attrTrend = getAttributeTrend(attr.name, state.xpHistory, state.systemDate);

            return (
              <div
                key={attr.id}
                onClick={() => onSelectAttribute(attr.name)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#141824] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.18)] ring-1 ring-[#c5a059]/40'
                    : 'bg-[#0b0d13] border-white/5 hover:border-[#c5a059]/30 hover:bg-[#131722]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {attrMeta?.icon || '⚡'}
                  </span>
                  <div>
                    <h4 className={`font-display font-bold text-sm leading-none ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {attr.name}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-1">
                      {attrMeta?.focusArea}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40 px-1.5 py-0.5 rounded">
                    LVL {attr.level}
                  </span>
                  <span className={`text-[8px] font-mono font-bold block mt-1 uppercase ${
                    attrTrend.status === 'Improving' ? 'text-emerald-400' : attrTrend.status === 'Declining' ? 'text-amber-400' : 'text-zinc-500'
                  }`}>
                    {attrTrend.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT 2 COLUMNS: DEEP ATTRIBUTE INSPECTOR */}
      {currentAttr && meta && evidence && trend && (
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. HERO INSPECTOR BANNER */}
          <div className="bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl p-5 relative overflow-hidden space-y-4">
            <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
                  style={{ 
                    backgroundColor: `${meta.color}15`,
                    borderColor: `${meta.color}50`
                  }}
                >
                  {meta.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl text-white">
                      {currentAttr.name}
                    </h2>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a]">
                      {meta.category} CONSTITUTION
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-400 mt-1 max-w-xl">
                    {meta.definition}
                  </p>
                </div>
              </div>

              {/* LEVEL & RESTART */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">CURRENT TIER</span>
                  <span className="text-2xl font-mono font-black text-[#fef08a]">
                    LVL_{currentAttr.level}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Recalibrate baseline for ${currentAttr.name}? Historical XP remains recorded, but attribute progression will recalculate from zero cutoff.`)) {
                      restartAttribute(currentAttr.id);
                    }
                  }}
                  className="p-2 bg-[#07080c] border border-white/10 hover:border-amber-500/40 text-zinc-400 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                  title="Recalibrate / Restart attribute progression"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* PROGRESS BAR & POINTS INTO LEVEL */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  Progression into Level {currentAttr.level + 1}
                </span>
                <span className="text-[#e5c875] font-bold">
                  {currentAttr.pointsIntoLevel || 0} / {currentAttr.pointsRequiredForNextLevel || 14} PTS ({currentAttr.progress}%)
                </span>
              </div>
              <div className="w-full bg-[#07080c] h-2.5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${currentAttr.progress}%`,
                    backgroundColor: meta.color
                  }}
                />
              </div>
            </div>

            {/* VELOCITY & TREND STRIP */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">7-DAY VELOCITY:</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  trend.status === 'Improving' 
                    ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/30'
                    : trend.status === 'Declining'
                      ? 'text-amber-400 bg-amber-950/80 border border-amber-500/30'
                      : 'text-zinc-400 bg-zinc-900 border border-zinc-700/40'
                }`}>
                  {trend.label}
                </span>
              </div>
              <span className="text-zinc-500">
                Focus Area: <strong className="text-zinc-300">{meta.focusArea}</strong>
              </span>
            </div>
          </div>

          {/* 2. TRACEABLE CAPABILITY EVIDENCE: "WHY DID THIS ATTRIBUTE CHANGE?" */}
          <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#c5a059]" />
                CAPABILITY_EVIDENCE & EXECUTION_TRACE
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                REAL OPERATIONS LOG
              </span>
            </div>

            <p className="text-xs font-sans text-zinc-300 leading-relaxed bg-[#07080c] p-3 rounded-lg border border-white/5">
              💡 <strong className="text-white">Progression Grounding:</strong> {evidence.explanation}
            </p>

            {/* EVIDENCE METRICS QUADRANT */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#07080c] rounded-lg border border-white/5 text-center">
                <span className="text-lg font-mono font-bold text-white block">
                  {evidence.directivesCount}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">
                  DIRECTIVES DONE
                </span>
              </div>
              <div className="p-3 bg-[#07080c] rounded-lg border border-white/5 text-center">
                <span className="text-lg font-mono font-bold text-cyan-300 block">
                  {evidence.focusMinutesTotal}m
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">
                  FOCUS LABORED
                </span>
              </div>
              <div className="p-3 bg-[#07080c] rounded-lg border border-white/5 text-center">
                <span className="text-lg font-mono font-bold text-[#fef08a] block">
                  {evidence.relatedSkills.length}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">
                  LINKED CRAFTS
                </span>
              </div>
              <div className="p-3 bg-[#07080c] rounded-lg border border-white/5 text-center">
                <span className="text-lg font-mono font-bold text-emerald-400 block">
                  {evidence.bossVictories}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">
                  BOSS VICTORIES
                </span>
              </div>
            </div>

            {/* RELATED CRAFT DISCIPLINES */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                CONNECTED CRAFT DISCIPLINES FEEDING {currentAttr.name.toUpperCase()}:
              </span>
              {evidence.relatedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {evidence.relatedSkills.map(sk => {
                    const stats = getSkillXpAndLevel(sk.id);
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => {
                          onSelectSkill(sk.id);
                          onNavigateTab('DISCIPLINES');
                        }}
                        className="px-2.5 py-1 bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/30 hover:border-[#c5a059] rounded-lg text-xs font-mono text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{sk.name}</span>
                        <span className="text-[9px] text-[#c5a059] font-bold">LVL {stats.level}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  No specialized disciplines explicitly bound to {currentAttr.name} yet. Assign this attribute inside Disciplines to route XP dynamically.
                </p>
              )}
            </div>

            {/* RELATED CAMPAIGNS */}
            {evidence.relatedCampaigns.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  ACTIVE CAMPAIGNS REQUIRING THIS CONSTITUTION:
                </span>
                <div className="flex flex-wrap gap-2">
                  {evidence.relatedCampaigns.map(camp => (
                    <span 
                      key={camp.id}
                      className="text-xs font-mono px-2.5 py-1 bg-[#0e2a36] border border-cyan-500/40 text-cyan-300 rounded-lg flex items-center gap-1"
                    >
                      <Target className="h-3 w-3" />
                      {camp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. ACTIVE WEAKNESSES IDENTIFIED IN MUHASABAH */}
          {linkedWeaknesses.length > 0 && (
            <div className="bg-[#160c0c] border border-red-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                  IDENTIFIED_CONSTITUTIONAL_VULNERABILITY ({linkedWeaknesses.length})
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Self-accountability audit flagged weakness vulnerabilities impacting {currentAttr.name}:
              </p>
              <div className="space-y-2">
                {linkedWeaknesses.map(w => (
                  <div key={w.id} className="p-2.5 bg-[#07080c] border border-red-500/20 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{w.name}</span>
                      <span className="text-[10px] text-zinc-400">{w.description}</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-red-950 text-red-300 border border-red-500/40">
                      VULNERABILITY
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SUGGESTED DEVELOPMENT ACTIONS & DIRECTIVE FORGE */}
          <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#c5a059]" />
                SUGGESTED_DEVELOPMENT_PROTOCOL
              </span>
              <button
                type="button"
                onClick={() => setShowDraftDirective(!showDraftDirective)}
                className="text-[11px] font-mono bg-[#3a2e12] border border-[#c5a059]/40 hover:border-[#c5a059] text-[#fef08a] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
              >
                <Plus className="h-3 w-3" />
                DRAFT DIRECTIVE
              </button>
            </div>

            {/* DRAFT DIRECTIVE MODAL / INLINE FORM */}
            {showDraftDirective && (
              <form onSubmit={handleCreateDirectiveForAttribute} className="p-3.5 bg-[#07080c] border border-[#c5a059]/40 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">
                  CREATE TARGETED DIRECTIVE FOR {currentAttr.name.toUpperCase()}
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={directiveTitle}
                    onChange={(e) => setDirectiveTitle(e.target.value)}
                    placeholder={`e.g. 30-min deliberate training for ${currentAttr.name}...`}
                    className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                    autoFocus
                  />
                  <select
                    value={directiveDifficulty}
                    onChange={(e) => setDirectiveDifficulty(e.target.value as any)}
                    className="bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-300 font-mono"
                  >
                    <option value="Easy">Easy (40 XP)</option>
                    <option value="Normal">Normal (75 XP)</option>
                    <option value="Hard">Hard (120 XP)</option>
                    <option value="Boss">Boss (200 XP)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!directiveTitle.trim()}
                    className="px-4 py-1.5 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    DEPLOY
                  </button>
                </div>
              </form>
            )}

            {/* ACTION PROTOCOLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {meta.suggestedActions.map((action, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-[#07080c] rounded-lg border border-white/5 flex items-start gap-2.5"
                >
                  <span className="text-[#c5a059] font-mono text-xs font-bold">
                    0{idx + 1}.
                  </span>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
