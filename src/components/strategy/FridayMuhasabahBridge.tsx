import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  Sparkles, ShieldAlert, CheckCircle2, ArrowRight, 
  Target, Briefcase, Compass, BookOpen, Bookmark, Activity,
  ChevronRight, Save, Award
} from 'lucide-react';
import { ArabesqueCorner, GeometricDivider } from '../IslamicRpgDecorations';
import { getLocalDateString } from '../../utils/dateUtils';

interface FridayMuhasabahBridgeProps {
  onCompleteAudit?: () => void;
}

export const FridayMuhasabahBridge: React.FC<FridayMuhasabahBridgeProps> = ({
  onCompleteAudit
}) => {
  const { 
    state, addPlanningDocument, addDoctrine, addSystemMessage, 
    getGoalProgress, getProjectProgress 
  } = usePOS();

  const [currentStep, setCurrentStep] = useState(1);
  const [executiveVerdict, setExecutiveVerdict] = useState<'CONTINUE' | 'MODIFY' | 'PAUSE' | 'ABANDON' | 'CODIFY'>('CONTINUE');
  const [lessonsNote, setLessonsNote] = useState('');
  const [priorityForNextWeek, setPriorityForNextWeek] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Compute live statistics for the review
  const activeGoals = state.goals.filter(g => g.status === 'Active');
  const activeProjects = state.projects.filter(p => p.status === 'Active');
  const blockedProjects = activeProjects.filter(p => p.campaignHealth === 'Blocked');
  const runningExperiments = (state.strategicExperiments || []).filter(e => e.status === 'Running');

  const todayStr = getLocalDateString();

  const handleInscribeAuditToCodex = () => {
    const docName = `Friday Strategic & Spiritual Audit — ${todayStr}`;
    const docFolder = '09 Reviews & Archive';
    
    const content = `# Friday Strategic & Spiritual Recalibration (${todayStr})

## 1. Executive Verdict: ${executiveVerdict}
- **Primary Focus Next Week**: ${priorityForNextWeek || 'Maintain critical path execution'}
- **Core Lesson Learned**: ${lessonsNote || 'Reality tested operational assumptions; recalibrated momentum'}

## 2. Grand Destinies Audit
${activeGoals.map(g => `- **${g.name}** (${g.horizon}): ${getGoalProgress(g.id)}% completed • Health: ${g.health || g.destinyHealth || 'Nominal'}`).join('\n')}

## 3. Operational Campaigns Audit
${activeProjects.map(p => `- **${p.name}**: ${getProjectProgress(p.id)}% • Health: ${p.campaignHealth || 'Healthy'} (${p.timeBudgetHours || 20}h budget)`).join('\n')}

## 4. Blockers & Upstream Risks
- Blocked Campaigns: ${blockedProjects.length}
${blockedProjects.map(b => `  - ⚠️ ${b.name}: ${b.risks?.join(', ') || 'Roadblock active'}`).join('\n')}

## 5. Active Experiments Lab
- Running Trials: ${runningExperiments.length}
${runningExperiments.map(e => `  - 🧪 ${e.title || e.experiment}: ${e.hypothesis} (Verdict: ${e.verdict})`).join('\n')}

---
*Codified into Pale Ore Strategic Memory on ${todayStr} via Friday Muḥāsabah Bridge.*
`;

    addPlanningDocument(docFolder, docName, content);
    setIsSaved(true);
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'achievement',
      title: 'Audit Inscribed',
      content: 'Friday Strategic Audit inscribed into Codex "09 Reviews & Archive".',
      priority: 'high'
    });
    if (onCompleteAudit) {
      setTimeout(onCompleteAudit, 1500);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[#c5a059]/40 bg-gradient-to-b from-[#0b0e17] via-[#07090f] to-[#0d0912] space-y-6 relative overflow-hidden shadow-2xl">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* Header */}
      <div className="border-b border-white/10 pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#c5a059]" />
          <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
            FRIDAY MUḤĀSABAH STRATEGIC BRIDGE
          </h3>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
            WEEKLY RECALIBRATION PROTOCOL
          </span>
        </div>
        <p className="text-xs font-mono text-zinc-400">
          Unifies spiritual self-accounting (Muḥāsabah) with ruthless operational truth: Inspect velocity, prune stagnation, and codify doctrine.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 text-[10px] font-mono">
        {[
          { step: 1, label: 'Spiritual Baseline' },
          { step: 2, label: 'Destinies Audit' },
          { step: 3, label: 'Campaigns & Blocks' },
          { step: 4, label: 'Experiments & Verdicts' },
          { step: 5, label: 'Executive Synthesis' }
        ].map(item => (
          <button
            key={item.step}
            onClick={() => setCurrentStep(item.step)}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap cursor-pointer ${
              currentStep === item.step
                ? 'bg-[#c5a059] text-black font-bold border-[#c5a059]'
                : currentStep > item.step
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : 'bg-white/5 text-zinc-400 border-white/5'
            }`}
          >
            {item.step}. {item.label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[220px]">
        {currentStep === 1 && (
          <div className="space-y-4 p-4 rounded-xl bg-[#07080c] border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
              <span>Step 1: Spiritual & Character Alignment</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Strategic clarity collapses when the soul is weighed down by neglected obligations or unrepented moral friction. 
              Review your prayer consistency, daily dhikr, and Mizan equilibrium before assessing external conquests.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block">Character Slips</span>
                <span className="text-base font-display font-bold text-rose-400">
                  {(state.muhasabahEntries || []).filter(e => e.date === todayStr).length} recorded
                </span>
              </div>
              <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block">Active Weaknesses</span>
                <span className="text-base font-display font-bold text-amber-400">
                  {(state.weaknesses || []).filter(w => w.status === 'Active').length} tracked
                </span>
              </div>
              <div className="p-3 bg-[#0b0d13] rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block">Temporal Ledger</span>
                <span className="text-base font-display font-bold text-emerald-400">
                  {state.profile.focusShields || 0} Shields
                </span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 p-4 rounded-xl bg-[#07080c] border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
              <span>Step 2: Grand Destinies Audit</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Are your active destinies receiving adequate focus, or are they being starved by operational minutiae?
            </p>
            <div className="space-y-2">
              {activeGoals.map(goal => (
                <div key={goal.id} className="p-2.5 bg-[#0b0d13] rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{goal.name} ({goal.horizon})</span>
                    <span className="text-[10px] text-zinc-500">Weight: {goal.strategicWeight || 50}/100 • Confidence: {goal.confidence || 75}%</span>
                  </div>
                  <span className="text-xs font-bold text-[#fef08a]">{getGoalProgress(goal.id)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 p-4 rounded-xl bg-[#07080c] border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
              <span>Step 3: Campaigns & Roadblocks Audit</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Examine blocked or at-risk campaigns. If an operation has had no progress in over a week, decide whether to unblock it or prune it.
            </p>
            {blockedProjects.length > 0 ? (
              <div className="space-y-2">
                {blockedProjects.map(p => (
                  <div key={p.id} className="p-2.5 bg-rose-950/20 border border-rose-500/40 rounded-lg text-rose-300">
                    <span className="font-bold block">⚠️ BLOCKED: {p.name}</span>
                    <span className="text-[10px] text-rose-200/80">Identified roadblock in critical path. Requires Root Cause 5 Whys.</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero critical blocked campaigns. Execution pipeline is clear.</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 p-4 rounded-xl bg-[#07080c] border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
              <span>Step 4: Active Experiments & Doctrine Codification</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              What did reality teach you this week? Review ongoing trials and convert winning practices into immutable doctrines.
            </p>
            <div className="space-y-2">
              {runningExperiments.length === 0 ? (
                <div className="text-zinc-500 italic">No running experiments. Initiate a trial in the Experiments Lab.</div>
              ) : (
                runningExperiments.map(e => (
                  <div key={e.id} className="p-2.5 bg-[#0b0d13] rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">🧪 {e.title}</span>
                      <span className="text-[10px] text-zinc-500">Hypothesis: {e.hypothesis}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                      {e.verdict}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4 p-4 rounded-xl bg-[#07080c] border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
              <span>Step 5: Executive Synthesis & Inscription</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Executive Weekly Verdict:</label>
                <select
                  value={executiveVerdict}
                  onChange={e => setExecutiveVerdict(e.target.value as any)}
                  className="w-full p-2 bg-[#0b0d13] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="CONTINUE">CONTINUE (Maintain Pace & Focus)</option>
                  <option value="MODIFY">MODIFY (Re-allocate Stated Weights)</option>
                  <option value="PAUSE">PAUSE (Halt Pending Upstream Block)</option>
                  <option value="ABANDON">ABANDON (Prune Dead Weight)</option>
                  <option value="CODIFY">CODIFY (Promote to Doctrine/SOP)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Single Highest-Leverage Priority Next Week:</label>
                <input
                  type="text"
                  value={priorityForNextWeek}
                  onChange={e => setPriorityForNextWeek(e.target.value)}
                  placeholder="e.g. Close Campaign: Production LLM Evaluation"
                  className="w-full p-2 bg-[#0b0d13] border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Reality Lesson / Reflection Note:</label>
              <textarea
                value={lessonsNote}
                onChange={e => setLessonsNote(e.target.value)}
                placeholder="What failure or unexpected empirical result altered your understanding this week?"
                rows={2}
                className="w-full p-2 bg-[#0b0d13] border border-white/10 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg cursor-pointer"
        >
          Previous Step
        </button>

        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Step {currentStep + 1}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={handleInscribeAuditToCodex}
            disabled={isSaved}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <Save className="h-4 w-4" />
            <span>{isSaved ? 'Audit Inscribed to 09 Reviews!' : 'Inscribe Audit to Codex 09'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
