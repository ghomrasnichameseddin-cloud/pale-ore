import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  HelpCircle, ArrowRight, Sparkles, CheckCircle, Clock, 
  ShieldAlert, Zap, AlertTriangle, BookOpen, Swords, Target,
  FileText, GitCommit, ChevronRight, Plus, Trash2
} from 'lucide-react';
import { UniversalActionModal, ActionSpawnType } from './UniversalActionModal';

// ==========================================
// 1. ROOT CAUSE ANALYSIS (5 WHYS & FISHBONE)
// ==========================================

export const RootCauseAnalysisEngine: React.FC = () => {
  const [problemStatement, setProblemStatement] = useState('');
  const [whys, setWhys] = useState<string[]>([
    'Why did the operational bottleneck or friction occur?',
    '',
    '',
    '',
    ''
  ]);
  const [rootCause, setRootCause] = useState('');
  const [countermeasureSOP, setCountermeasureSOP] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalType, setModalType] = useState<ActionSpawnType>('quest');

  const handleWhyChange = (index: number, val: string) => {
    const updated = [...whys];
    updated[index] = val;
    setWhys(updated);
  };

  const handleSpawnAction = (type: ActionSpawnType) => {
    if (!rootCause.trim()) return;
    setModalType(type);
    setModalTitle(`Fix Root Cause: ${problemStatement.slice(0, 40) || 'System Friction'}`);
    setModalDesc(
      `### Problem Statement\n${problemStatement}\n\n### Identified Root Cause\n${rootCause}\n\n### Preventive Countermeasure SOP\n${countermeasureSOP}`
    );
    setModalOpen(true);
  };

  return (
    <div className="space-y-6" id="root-cause-engine-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> SYSTEMIC PROBLEM DIAGNOSTICS
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30">
              5 WHYS & CAUSAL DRILLDOWN
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            ROOT CAUSE & FAILURE MODE ANALYZER
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Drill past superficial symptoms to uncover the core systemic defect. Prevent recurring operational failures forever.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: 5 Whys Chain */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 bg-[#07080c] space-y-4 shadow-xl">
          <h4 className="text-xs font-mono text-[#e5c875] font-bold uppercase tracking-wider flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-[#c5a059]" />
            1. CAUSAL DRILL-DOWN (5 LEVELS)
          </h4>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              SURFACE INCIDENT / PROBLEM STATEMENT:
            </label>
            <input
              type="text"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g. Missed the 09:00 deep work start window and procrastinated..."
              className="w-full bg-[#0b0d13] border border-white/15 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            {whys.map((why, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1 font-bold">
                  LEVEL {idx + 1} WHY:
                </span>
                <input
                  type="text"
                  value={why}
                  onChange={(e) => handleWhyChange(idx, e.target.value)}
                  placeholder={`Why #${idx + 1}...`}
                  className="w-full bg-[#0b0d13] border border-white/10 focus:border-rose-500/50 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Root Cause Identification & Preventive Countermeasure */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 bg-[#07080c] space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              2. SYSTEMIC ROOT CAUSE & COUNTERMEASURE
            </h4>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                IDENTIFIED ROOT CAUSE (SYSTEMIC FLAW):
              </label>
              <textarea
                rows={3}
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="e.g. Lack of a physical device boundary in the bedroom creates unavoidable dopamine distraction upon waking."
                className="w-full bg-[#0b0d13] border border-white/15 focus:border-emerald-500 rounded-xl p-3 text-xs font-mono text-white focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                PREVENTATIVE SOP COUNTERMEASURE:
              </label>
              <textarea
                rows={3}
                value={countermeasureSOP}
                onChange={(e) => setCountermeasureSOP(e.target.value)}
                placeholder="e.g. Inscribe SOP into Morning Routine: Phone must be docked in the kitchen before 22:00. Zero exceptions."
                className="w-full bg-[#0b0d13] border border-white/15 focus:border-emerald-500 rounded-xl p-3 text-xs font-mono text-white focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Spawn Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
              3. LOCK IN PERMANENT RESOLUTION:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSpawnAction('quest')}
                disabled={!rootCause.trim()}
                className="py-2 px-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                <Swords className="h-3.5 w-3.5" />
                CREATE RECOVERY QUEST
              </button>

              <button
                type="button"
                onClick={() => handleSpawnAction('sop')}
                disabled={!countermeasureSOP.trim()}
                className="py-2 px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                <FileText className="h-3.5 w-3.5" />
                INSCRIBE INTO 05 SOPs
              </button>
            </div>
          </div>

        </div>

      </div>

      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Root Cause Analyzer (5 Whys)"
      />

    </div>
  );
};


// ==========================================
// 2. WORKING BACKWARDS MECHANISM (AMAZON PR/FAQ)
// ==========================================

export const WorkBackwardsEngine: React.FC = () => {
  const [futureOutcome, setFutureOutcome] = useState('');
  const [pressReleaseHeadline, setPressReleaseHeadline] = useState('');
  const [pressReleaseSummary, setPressReleaseSummary] = useState('');
  const [selfFAQ, setSelfFAQ] = useState('');
  
  const [milestoneSequence, setMilestoneSequence] = useState<Array<{ id: string; name: string; targetHorizon: string }>>([
    { id: 'wb-1', name: 'Phase 3 (Final): Deployed production platform with 100% test coverage', targetHorizon: 'Target Launch Date' },
    { id: 'wb-2', name: 'Phase 2: Core functional engine completed and integrated with storage', targetHorizon: 'T - 14 Days' },
    { id: 'wb-3', name: 'Phase 1: Architecture RFC & minimal vertical slice prototype working', targetHorizon: 'T - 30 Days' }
  ]);

  const [newMileName, setNewMileName] = useState('');
  const [newMileHorizon, setNewMileHorizon] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalType, setModalType] = useState<ActionSpawnType>('campaign');

  const addMilestone = () => {
    if (!newMileName.trim()) return;
    setMilestoneSequence([
      ...milestoneSequence,
      {
        id: `wb-${Date.now()}`,
        name: newMileName.trim(),
        targetHorizon: newMileHorizon.trim() || 'T - X Days'
      }
    ]);
    setNewMileName('');
    setNewMileHorizon('');
  };

  const removeMilestone = (id: string) => {
    setMilestoneSequence(milestoneSequence.filter(m => m.id !== id));
  };

  const handleCharterCampaign = () => {
    setModalType('campaign');
    setModalTitle(pressReleaseHeadline || futureOutcome || 'Working Backwards Campaign');
    setModalDesc(
      `### Future Press Release\n${pressReleaseHeadline}\n\n${pressReleaseSummary}\n\n### Reverse Milestones:\n${milestoneSequence.map((m, idx) => `${idx + 1}. [${m.targetHorizon}] ${m.name}`).join('\n')}\n\n### Internal FAQ:\n${selfFAQ}`
    );
    setModalOpen(true);
  };

  return (
    <div className="space-y-6" id="work-backwards-engine-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-cyan-400" /> REVERSE-ENGINEERED STRATEGY
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              AMAZON WORKING BACKWARDS PROTOCOL
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            WORK BACKWARDS MECHANISM & FUTURE PR/FAQ
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Start at the triumphant finish line. Draft the future press release, answer the hard questions, and trace the sequence backward to day one.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Future Press Release & FAQ */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 bg-[#07080c] space-y-4 shadow-xl">
          <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4" />
            1. THE FUTURE PRESS RELEASE (T = COMPLETION)
          </h4>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              HEADLINE OF THE SUCCESSFUL LAUNCH:
            </label>
            <input
              type="text"
              value={pressReleaseHeadline}
              onChange={(e) => setPressReleaseHeadline(e.target.value)}
              placeholder="e.g. Pale Ore Deploys Unified Strategy & Thinking Lab Architecture..."
              className="w-full bg-[#0b0d13] border border-white/15 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              PRESS RELEASE BODY (WHAT PROBLEM WAS SOLVED?):
            </label>
            <textarea
              rows={3}
              value={pressReleaseSummary}
              onChange={(e) => setPressReleaseSummary(e.target.value)}
              placeholder="Today marks the official completion of... It completely eliminates friction by..."
              className="w-full bg-[#0b0d13] border border-white/15 focus:border-cyan-500 rounded-xl p-3 text-xs font-mono text-white focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              SELF / CUSTOMER FAQ (ADDRESSING CRITICAL HARD QUESTIONS):
            </label>
            <textarea
              rows={3}
              value={selfFAQ}
              onChange={(e) => setSelfFAQ(e.target.value)}
              placeholder="Q: How do we maintain 100% offline persistence?&#10;A: Local storage synchronization engine handles all state without network lag."
              className="w-full bg-[#0b0d13] border border-white/15 focus:border-cyan-500 rounded-xl p-3 text-xs font-mono text-white focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Right: Reverse Milestones Breakdown */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 bg-[#07080c] space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-[#e5c875] font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#c5a059]" />
              2. REVERSE MILESTONE TIMELINE (BACKWARD TRACE)
            </h4>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {milestoneSequence.map((m, idx) => (
                <div key={m.id} className="p-3 bg-[#0b0d13] border border-white/10 rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold block">{m.targetHorizon}</span>
                    <span className="text-xs font-mono text-zinc-200 block truncate">{m.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Reverse Milestone Form */}
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={newMileHorizon}
                onChange={(e) => setNewMileHorizon(e.target.value)}
                placeholder="Horizon (e.g. T-7d)"
                className="w-24 bg-[#0b0d13] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
              />
              <input
                type="text"
                value={newMileName}
                onChange={(e) => setNewMileName(e.target.value)}
                placeholder="Milestone deliverable..."
                className="flex-1 bg-[#0b0d13] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={addMilestone}
                className="px-3 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-lg font-mono font-bold text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleCharterCampaign}
              disabled={!pressReleaseHeadline.trim() && !futureOutcome.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:brightness-110 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              CHARTER REVERSE-ENGINEERED CAMPAIGN ➔
            </button>
          </div>

        </div>

      </div>

      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Working Backwards Engine"
      />

    </div>
  );
};
