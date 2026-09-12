import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  evaluateStrategicGaps, 
  generateCapabilityPath, 
  getSkillIntelligenceOverview,
  StrategicCapabilityGap
} from '../../utils/capabilityIntelligence';
import { CapabilityReviewNote, RequiredCapability } from '../../types';
import { CapabilityRadar } from './CapabilityRadar';
import { 
  Target, AlertTriangle, CheckCircle2, ChevronRight, 
  GitMerge, Trash2, Archive, ArchiveRestore, ShieldAlert,
  Sparkles, Compass, BookOpen, Clock, Calendar, Save,
  Check, X, ArrowRight, Layers
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface IntelligenceViewProps {
  onSelectSkill: (skillId: string) => void;
  onSelectAttribute: (name: string) => void;
  onNavigateTab: (tab: 'OVERVIEW' | 'ATTRIBUTES' | 'DISCIPLINES' | 'INTELLIGENCE') => void;
  activeGapModal: StrategicCapabilityGap | null;
  onCloseGapModal: () => void;
  onOpenGapModal: (gap: StrategicCapabilityGap) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  onSelectSkill,
  onSelectAttribute,
  onNavigateTab,
  activeGapModal,
  onCloseGapModal,
  onOpenGapModal
}) => {
  const { 
    state, 
    mergeSkills, 
    deleteUnusedSkills, 
    toggleArchiveSkill, 
    getSkillXpAndLevel,
    saveCapabilityReview,
    setRequiredCapabilities
  } = usePOS();

  // Gap analysis
  const strategicGaps = evaluateStrategicGaps(state);
  const criticalGaps = strategicGaps.filter(g => g.isCritical);
  const intelligenceOverview = getSkillIntelligenceOverview(state);

  // Hygiene modal states
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [mergeConfirmation, setMergeConfirmation] = useState(false);

  // Capability Review Form states
  const [reviewBottleneck, setReviewBottleneck] = useState('');
  const [reviewStrength, setReviewStrength] = useState('');
  const [reviewConstitution, setReviewConstitution] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'CONTINUE' | 'CALIBRATE' | 'CONSOLIDATE'>('CONTINUE');
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState(false);

  // New Requirement Quick-Add state (to attach a required capability to a campaign or destiny)
  const [showAddRequirement, setShowAddRequirement] = useState(false);
  const [reqEntityType, setReqEntityType] = useState<'project' | 'goal'>('project');
  const [reqEntityId, setReqEntityId] = useState('');
  const [reqSkillId, setReqSkillId] = useState('');
  const [reqLevel, setReqLevel] = useState(10);
  const [reqPriority, setReqPriority] = useState<'Essential' | 'Important' | 'Supporting'>('Essential');

  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) {
      alert('Select distinct source and target disciplines.');
      return;
    }
    const sourceSkill = state.skills.find(s => s.id === mergeSourceId);
    const targetSkill = state.skills.find(s => s.id === mergeTargetId);
    if (!sourceSkill || !targetSkill) return;

    if (window.confirm(`Consolidate "${sourceSkill.name}" INTO "${targetSkill.name}"? All historical XP, linked directives, child specializations, and campaigns will be transferred to "${targetSkill.name}".`)) {
      mergeSkills(mergeSourceId, mergeTargetId);
      setMergeSourceId('');
      setMergeTargetId('');
      setMergeConfirmation(true);
      setTimeout(() => setMergeConfirmation(false), 4000);
    }
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBottleneck.trim() && !reviewStrength.trim()) return;

    const summary = `Bottleneck: ${reviewBottleneck || 'None'} | Highlight: ${reviewStrength || 'Consistent execution'} | Constitution: ${reviewConstitution || 'Balanced'}`;

    const note: CapabilityReviewNote = {
      id: `rev-${Date.now()}`,
      date: state.systemDate,
      improvedSkillIds: reviewStrength ? [reviewStrength] : [],
      stagnatedSkillIds: [],
      decliningSkillIds: [],
      blockingGap: reviewBottleneck || '',
      nextTrainingPriority: reviewDecision || 'Maintain current cadence',
      notes: `Bottleneck: ${reviewBottleneck || 'None'} | Highlight: ${reviewStrength || 'Consistent execution'} | Constitution: ${reviewConstitution || 'Balanced'}`,
      createdAt: new Date().toISOString()
    };

    saveCapabilityReview(note);
    setReviewBottleneck('');
    setReviewStrength('');
    setReviewConstitution('');
    setReviewSavedSuccess(true);
    setTimeout(() => setReviewSavedSuccess(false), 4000);
  };

  const handleSaveNewRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEntityId || !reqSkillId) return;

    const existingReqs = reqEntityType === 'project'
      ? (state.projects.find(p => p.id === reqEntityId)?.requiredCapabilities || [])
      : (state.goals.find(g => g.id === reqEntityId)?.requiredCapabilities || []);

    const updated: RequiredCapability[] = [
      ...existingReqs.filter(r => r.skillId !== reqSkillId),
      {
        skillId: reqSkillId,
        targetLevel: reqLevel,
        importance: reqPriority
      }
    ];

    setRequiredCapabilities(reqEntityType, reqEntityId, updated);
    setShowAddRequirement(false);
    setReqEntityId('');
  };

  return (
    <div className="space-y-6" id="skills-intelligence-root">
      
      {/* 1. STRATEGIC CAPABILITY GAP ENGINE */}
      <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-white/5 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                STRATEGIC_CAPABILITY_GAP_ENGINE
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold bg-[#0e2a36] border border-cyan-500/40 text-cyan-300">
                {strategicGaps.length} AUDITED REQUIREMENTS
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Cross-references active Destinies & Operational Campaigns against current discipline mastery levels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddRequirement(!showAddRequirement)}
            className="px-3 py-1.5 bg-[#0e2a36] border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Target className="h-3 w-3" />
            ATTACH REQUIREMENT
          </button>
        </div>

        {/* ATTACH REQUIREMENT INLINE FORM */}
        {showAddRequirement && (
          <form onSubmit={handleSaveNewRequirement} className="p-4 bg-[#07080c] border border-cyan-500/40 rounded-xl space-y-3">
            <span className="text-xs font-mono text-cyan-300 uppercase font-bold block">
              LINK REQUIRED CAPABILITY TO DESTINY / CAMPAIGN
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Scope</label>
                <select
                  value={reqEntityType}
                  onChange={(e) => {
                    setReqEntityType(e.target.value as any);
                    setReqEntityId('');
                  }}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 font-mono"
                >
                  <option value="project">Campaign (Project)</option>
                  <option value="goal">Destiny (Goal)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Target Entity</label>
                <select
                  value={reqEntityId}
                  onChange={(e) => setReqEntityId(e.target.value)}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 font-mono truncate"
                  required
                >
                  <option value="">-- Choose Target --</option>
                  {reqEntityType === 'project'
                    ? state.projects.filter(p => p.status === 'Active').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    : state.goals.filter(g => g.status === 'Active').map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))
                  }
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Required Discipline</label>
                <select
                  value={reqSkillId}
                  onChange={(e) => setReqSkillId(e.target.value)}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-zinc-200 font-mono"
                  required
                >
                  <option value="">-- Choose Discipline --</option>
                  {state.skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Lvl {getSkillXpAndLevel(s.id).level})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Target Level & Priority</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={reqLevel}
                    onChange={(e) => setReqLevel(parseInt(e.target.value) || 10)}
                    className="w-16 bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as any)}
                    className="flex-1 bg-[#0b0d13] border border-white/10 rounded px-1 py-1 text-xs text-zinc-200 font-mono"
                  >
                    <option value="Essential">Essential</option>
                    <option value="Important">Important</option>
                    <option value="Supportive">Supportive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddRequirement(false)}
                className="px-3 py-1 text-xs font-mono text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#0e2a36] border border-cyan-500 text-cyan-200 rounded text-xs font-mono font-bold cursor-pointer"
              >
                LINK REQUIREMENT
              </button>
            </div>
          </form>
        )}

        {/* GAPS TABLE / CARDS */}
        {strategicGaps.length > 0 ? (
          <div className="space-y-2.5">
            {strategicGaps.map((gap, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  gap.isCritical
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-400'
                    : 'bg-[#07080c] border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                      [{gap.sourceEntityType.toUpperCase()}] {gap.sourceEntityName}
                    </span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded uppercase font-bold border ${
                      gap.isCritical
                        ? 'text-red-300 bg-red-950 border-red-500/40'
                        : 'text-zinc-400 bg-zinc-900 border-zinc-700/40'
                    }`}>
                      {gap.importance}
                    </span>
                    {gap.isCritical && (
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded uppercase font-black text-red-200 bg-red-900 border border-red-400">
                        CRITICAL DEFICIT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-display font-bold text-white">
                      {gap.skillName}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      Current: <strong className="text-white">Lvl {gap.currentLevel}</strong> / Target: <strong className="text-cyan-300">Lvl {gap.targetLevel}</strong>
                    </span>
                    <span className={`font-mono text-[11px] font-bold ${gap.gapLevel > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {gap.gapLevel > 0 ? `-${gap.gapLevel} lvls` : 'Surpassed'}
                    </span>
                  </div>

                  {/* READINESS PROGRESS BAR */}
                  <div className="w-full max-w-md bg-[#0b0d13] h-2 rounded-full overflow-hidden border border-white/10 mt-1">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        gap.isCritical 
                          ? 'bg-red-500' 
                          : gap.readinessPercent >= 100 
                            ? 'bg-emerald-500' 
                            : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, gap.readinessPercent)}%` }}
                    />
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <button
                  type="button"
                  onClick={() => onOpenGapModal(gap)}
                  className="px-3.5 py-1.5 bg-[#0b0d13] hover:bg-[#141824] border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                >
                  <span>PROGRESSION PATH</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#07080c] rounded-xl border border-white/5 space-y-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
            <h5 className="font-display font-bold text-sm text-white">
              Zero Strategic Capability Gaps
            </h5>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              All active Destinies and Campaigns are either fully provisioned with required mastery levels or have not had strict requirements assigned yet.
            </p>
          </div>
        )}
      </div>

      {/* 2. DUAL-RADAR REFERENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CapabilityRadar initialMode="strategic" height={360} />
        <CapabilityRadar initialMode="attributes" height={360} />
      </div>

      {/* 3. SKILL HYGIENE SUITE (CONSOLIDATE / PRUNE / ARCHIVE) */}
      <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-5">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-[#c5a059]" />
            <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider">
              SKILL_HYGIENE_SUITE (ANTI-INFLATION ENGINE)
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            CLEAN CAPITAL
          </span>
        </div>

        {mergeConfirmation && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Discipline tracks successfully consolidated. All history, directives, and specializations merged cleanly.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* A. CONSOLIDATE / MERGE FORM */}
          <form onSubmit={handleMergeSubmit} className="p-4 bg-[#07080c] border border-white/10 rounded-xl space-y-3">
            <div>
              <span className="text-xs font-mono text-[#fef08a] uppercase font-bold block">
                CONSOLIDATE DISCIPLINE TRACKS
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Merge duplicate or fragmented tracks into a single high-density discipline.
              </p>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold">
                  Source Track (Will be absorbed & removed)
                </label>
                <select
                  value={mergeSourceId}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                  required
                >
                  <option value="">-- Choose Source Track --</option>
                  {state.skills.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Lvl {getSkillXpAndLevel(s.id).level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold">
                  Target Track (Receives all XP, Directives, and Child Tracks)
                </label>
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                  required
                >
                  <option value="">-- Choose Target Track --</option>
                  {state.skills.filter(s => s.id !== mergeSourceId).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Lvl {getSkillXpAndLevel(s.id).level})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId}
              className="w-full py-2 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              EXECUTE MERGE & TRANSFER XP
            </button>
          </form>

          {/* B. PRUNE UNUSED & ORPHANED TRACKS */}
          <div className="p-4 bg-[#07080c] border border-white/10 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-[#fef08a] uppercase font-bold block">
                PRUNE ZERO-XP & ORPHANED TRACKS
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Safely purge discipline tracks that possess zero logged XP, no active directives, and no linked campaigns. Keeps your capability architecture focused and dense.
              </p>
            </div>

            <div className="p-3 bg-[#0b0d13] rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block">
                Unused Tracks in Workspace: <strong className="text-white">{intelligenceOverview.underused.length}</strong>
              </span>
              <p className="text-[10px] text-zinc-500">
                Purging never alters recorded attribute scores or previous quest completions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Purge all zero-XP and unused discipline tracks from the workspace?')) {
                  deleteUnusedSkills();
                }
              }}
              disabled={intelligenceOverview.underused.length === 0}
              className="w-full py-2 bg-red-950/40 border border-red-500/40 hover:border-red-400 text-red-200 rounded text-xs font-mono font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              PRUNE {intelligenceOverview.underused.length} UNUSED TRACKS
            </button>
          </div>

        </div>
      </div>

      {/* 4. CAPABILITY REVIEW (FRIDAY MUḤĀSABAH CAPABILITY AUDIT) */}
      <div className="bg-[#0b0d13] border border-[#c5a059]/25 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#c5a059]" />
            <span className="text-xs font-mono font-bold text-[#e5c875] uppercase tracking-wider">
              WEEKLY_CAPABILITY_REVIEW (FRIDAY MUḤĀSABAH)
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-400">
            RECORD STRATEGIC AUDIT
          </span>
        </div>

        {reviewSavedSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Strategic capability review successfully codified into systemic memory.
          </div>
        )}

        <form onSubmit={handleSaveReview} className="p-4 bg-[#07080c] border border-white/10 rounded-xl space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                1. What capability bottleneck throttled operational execution this cycle?
              </label>
              <input
                type="text"
                value={reviewBottleneck}
                onChange={(e) => setReviewBottleneck(e.target.value)}
                placeholder="e.g. Memory management in systems code, delayed research..."
                className="w-full bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                2. Which discipline demonstrated the highest leverage or growth?
              </label>
              <input
                type="text"
                value={reviewStrength}
                onChange={(e) => setReviewStrength(e.target.value)}
                placeholder="e.g. Focus endurance during Fajr deep work..."
                className="w-full bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                3. Constitution Symmetry Check (Neglected Sovereign Attributes)
              </label>
              <input
                type="text"
                value={reviewConstitution}
                onChange={(e) => setReviewConstitution(e.target.value)}
                placeholder="e.g. Physical Vitality lagged behind Intellectual Knowledge..."
                className="w-full bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                4. Strategic Decision for Next Operating Cycle
              </label>
              <select
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value as any)}
                className="w-full bg-[#0b0d13] border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-200 font-mono"
              >
                <option value="CONTINUE">CONTINUE (Maintain Execution Cadence)</option>
                <option value="CALIBRATE">CALIBRATE (Rebalance Training Focus)</option>
                <option value="CONSOLIDATE">CONSOLIDATE (Prune & Deepen Core Tracks)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!reviewBottleneck.trim() && !reviewStrength.trim()}
              className="px-4 py-2 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded hover:bg-[#524119] text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              CODIFY CAPABILITY REVIEW
            </button>
          </div>
        </form>

        {/* HISTORICAL REVIEWS LIST */}
        {(state.capabilityReviews || []).length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              HISTORICAL REVIEWS ({(state.capabilityReviews || []).length})
            </span>
            <div className="space-y-2">
              {(state.capabilityReviews || []).slice(0, 3).map((rev) => (
                <div key={rev.id} className="p-3 bg-[#07080c] rounded-lg border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#c5a059] font-bold">{rev.date}</span>
                    {rev.nextTrainingPriority && (
                      <span className="px-1.5 py-0.2 rounded font-bold uppercase bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40">
                        {rev.nextTrainingPriority}
                      </span>
                    )}
                  </div>
                  {rev.blockingGap && (
                    <p className="text-red-300/90 font-mono text-[11px]">Gap: {rev.blockingGap}</p>
                  )}
                  {rev.notes && (
                    <p className="text-zinc-300 font-sans">{rev.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. STEP-BY-STEP PROGRESSION PATH MODAL */}
      {activeGapModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-[#c5a059]/40 rounded-xl max-w-xl w-full p-5 space-y-4 relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-start pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  PROGRESSION PATH PROTOCOL
                </span>
                <h3 className="font-display font-bold text-base text-white">
                  Close Gap: {activeGapModal.skillName} for {activeGapModal.sourceEntityName}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseGapModal}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-[#07080c] rounded-lg border border-white/5 text-xs text-zinc-300 space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span>Deficit: <strong className="text-red-400">-{activeGapModal.gapLevel} Levels</strong></span>
                <span>Current Readiness: <strong className="text-cyan-300">{activeGapModal.readinessPercent}%</strong></span>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Execute the 5 progression milestones in sequence to bridge this capability bottleneck:
              </p>
            </div>

            {/* 5 STEPS */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {generateCapabilityPath(activeGapModal).map((step) => (
                <div 
                  key={step.step}
                  className="p-3 bg-[#07080c] rounded-lg border border-white/10 hover:border-[#c5a059]/40 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="font-display font-bold text-xs text-white">{step.title}</h5>
                      <span className="text-[8px] font-mono text-[#c5a059] uppercase">{step.milestone}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">{step.directive}</p>
                    <div className="text-[9px] font-mono text-cyan-400/80 pt-0.5">
                      Target XP: +{step.xpTarget} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onCloseGapModal}
                className="px-4 py-1.5 bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] rounded text-xs font-mono font-bold cursor-pointer"
              >
                DISMISS PROTOCOL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
