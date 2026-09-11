import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { StrategicDecision } from '../../types';
import { 
  Compass, HelpCircle, ArrowRight, Lightbulb, GitCommit, 
  FlaskConical, CheckSquare, Target, Zap, Plus, X, Trash2, 
  Layers, CheckCircle2, ChevronRight, Activity, Award
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';
import { FrameworksView, FrameworkTab } from '../FrameworksView';
import { getLocalDateString, addDays } from '../../utils/dateUtils';

interface ChallengeRecommendation {
  id: string;
  question: string;
  subtitle: string;
  recommendedFrameworks: Array<{
    tab: FrameworkTab;
    name: string;
    why: string;
  }>;
}

const CHALLENGES: ChallengeRecommendation[] = [
  {
    id: 'priorities',
    question: 'Too many competing priorities / Overwhelmed',
    subtitle: 'Cannot discern signal from noise, high-leverage vs shallow busywork.',
    recommendedFrameworks: [
      { tab: 'eisenhower', name: 'Eisenhower Quadrant Matrix', why: 'Isolates urgent firefighting from high-leverage strategic growth (Q2).' },
      { tab: 'pareto', name: 'Pareto 80/20 Analysis', why: 'Identifies the 20% of inputs that produce 80% of strategic outcomes.' }
    ]
  },
  {
    id: 'friction',
    question: 'Something is stalled, broken, or failing',
    subtitle: 'Campaign execution is blocked or an operation is producing zero forward momentum.',
    recommendedFrameworks: [
      { tab: 'root_cause', name: 'Root Cause (5 Whys & Fishbone)', why: 'Drills past surface symptoms down to systemic friction vectors.' },
      { tab: 'ooda', name: 'OODA Loop (Observe-Orient-Decide-Act)', why: 'Re-orients operational posture in rapidly changing or stalled conditions.' }
    ]
  },
  {
    id: 'strategy',
    question: 'Need to construct a master strategy or plan',
    subtitle: 'Starting a new initiative, product, or major operational overhaul.',
    recommendedFrameworks: [
      { tab: 'work_backwards', name: 'Amazon Working Backwards (PR/FAQ)', why: 'Writes the customer press release and FAQ before writing any code or spending effort.' },
      { tab: 'swot', name: 'SWOT Strategic Matrix', why: 'Audits internal Strengths/Weaknesses and external Opportunities/Threats.' },
      { tab: 'smart', name: 'SMART Milestone Designer', why: 'Ensures milestones are Specific, Measurable, Achievable, Relevant, and Time-bound.' }
    ]
  },
  {
    id: 'creative',
    question: 'Need fresh ideas / Lateral breakthrough',
    subtitle: 'Conventional approaches have plateaued; need non-linear solutions.',
    recommendedFrameworks: [
      { tab: 'lateral', name: 'SCAMPER Lateral Thinking Lab', why: 'Forces Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.' },
      { tab: 'brainstorm', name: 'Brainstorming Sandbox', why: 'Unconstrained capture and rapid clustering of hypotheses.' },
      { tab: 'mindmap', name: 'Mind Mapping Canvas', why: 'Visual associative graph connecting concepts across disciplines.' }
    ]
  },
  {
    id: 'validate',
    question: 'Need to test an assumption or hypothesis',
    subtitle: 'Uncertain whether a tactic or strategy will work before committing heavy capital.',
    recommendedFrameworks: [
      { tab: 'experiments', name: 'Trial & Error Experiment Lab', why: 'Structures falsifiable bets with predictions, timeboxes, and metric verdicts.' }
    ]
  }
];

export const StrategyLabView: React.FC = () => {
  const { 
    state, addStrategicDecision, updateStrategicDecision, 
    deleteStrategicDecision, addSystemMessage 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'wizard' | 'frameworks' | 'journal'>('wizard');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('priorities');
  const [activeFramework, setActiveFramework] = useState<FrameworkTab>('eisenhower');
  const [isNewDecisionModalOpen, setIsNewDecisionModalOpen] = useState(false);

  // New Decision Form State
  const [decProblem, setDecProblem] = useState('');
  const [decContext, setDecContext] = useState('');
  const [decOptions, setDecOptions] = useState('');
  const [decFramework, setDecFramework] = useState('Pareto 80/20 & Heuristics');
  const [decDecision, setDecDecision] = useState('');
  const [decExpectedResult, setDecExpectedResult] = useState('');
  const [decConfidence, setDecConfidence] = useState(80);
  const [decReviewDate, setDecReviewDate] = useState(addDays(new Date(), 14));

  const selectedChallenge = CHALLENGES.find(c => c.id === selectedChallengeId) || CHALLENGES[0];

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decProblem.trim() || !decDecision.trim()) return;

    const optionsList = decOptions.split('\n').filter(o => o.trim().length > 0);
    addStrategicDecision({
      problem: decProblem.trim(),
      context: decContext.trim(),
      options: optionsList,
      optionsConsidered: optionsList,
      frameworkUsed: decFramework,
      decision: decDecision.trim(),
      reason: decExpectedResult.trim() || 'Strategic optimization',
      expectedResult: decExpectedResult.trim(),
      confidence: decConfidence,
      reviewDate: decReviewDate,
      status: 'Open'
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Strategic Decision Logged',
      content: `Strategic decision logged: "${decProblem.trim()}". Review scheduled for ${decReviewDate}.`,
      priority: 'medium'
    });
    setIsNewDecisionModalOpen(false);
    setDecProblem('');
    setDecContext('');
    setDecOptions('');
    setDecDecision('');
    setDecExpectedResult('');
  };

  const jumpToFramework = (tab: FrameworkTab) => {
    setActiveFramework(tab);
    setActiveTab('frameworks');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border-[#c5a059]/30 bg-[#07080c]/90">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[#c5a059]" />
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
              TACTICAL DECISION FRAMEWORKS & STRATEGY LAB
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
              11 INTERACTIVE ENGINES • {(state.strategicDecisions || []).length} LOGGED DECISIONS
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Answers: "WHAT SHOULD I DO NEXT?" & "WHICH FRAMEWORK APPLIES?" • Cognitive guidance and empirical decision journal.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-mono bg-[#0b0d13] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'wizard' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Decision Wizard
            </button>
            <button
              onClick={() => setActiveTab('frameworks')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'frameworks' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Interactive Engines
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'journal' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Decision Journal ({ (state.strategicDecisions || []).length })
            </button>
          </div>

          <button
            onClick={() => setIsNewDecisionModalOpen(true)}
            className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Log Decision
          </button>
        </div>
      </div>

      {activeTab === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Challenge Selector */}
          <div className="lg:col-span-5 space-y-2 glass-panel p-4 rounded-2xl border-white/10 bg-[#0b0d13]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#fef08a] uppercase pb-2 border-b border-white/5">
              <HelpCircle className="h-4 w-4 text-[#c5a059]" />
              <span>What kind of operational challenge are you facing?</span>
            </div>

            <div className="space-y-2 pt-1">
              {CHALLENGES.map(c => {
                const isSelected = selectedChallengeId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChallengeId(c.id)}
                    className={`p-3 rounded-xl border text-xs font-mono transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-lg shadow-[#c5a059]/10'
                        : 'bg-[#07080c] border-white/5 hover:border-white/20 text-zinc-300'
                    }`}
                  >
                    <div className="font-display font-bold text-white text-xs mb-1">
                      {c.question}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono line-clamp-2">
                      {c.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Frameworks Output */}
          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0d0f17] space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[9px] font-mono text-[#c5a059] uppercase block font-bold">
                OPERATIONAL DIAGNOSIS & PRESCRIPTION
              </span>
              <h3 className="text-sm font-display font-bold text-white">
                Recommended Decision Protocol for: "{selectedChallenge.question}"
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                {selectedChallenge.subtitle}
              </p>
            </div>

            {/* Recommendations cards */}
            <div className="space-y-3">
              {selectedChallenge.recommendedFrameworks.map(rec => (
                <div 
                  key={rec.tab}
                  className="p-4 rounded-xl bg-[#07080c] border border-white/10 hover:border-[#c5a059]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-display font-bold text-white block">
                      {rec.name}
                    </span>
                    <p className="text-xs font-mono text-zinc-400">
                      {rec.why}
                    </p>
                  </div>

                  <button
                    onClick={() => jumpToFramework(rec.tab)}
                    className="px-3 py-1.5 bg-[#3a2e12] hover:bg-[#4d3d18] text-[#fef08a] border border-[#c5a059]/40 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Launch Engine</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 6-Stage Reference Matrix Footer */}
            <div className="p-3.5 bg-[#07080c] border border-white/5 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                The Pale Ore 6-Stage Strategic Matrix:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400">
                <div>1. Diagnose (5 Whys, SWOT)</div>
                <div>2. Prioritize (Eisenhower, 80/20)</div>
                <div>3. Decide (OODA, Heuristics)</div>
                <div>4. Design (PR/FAQ, SMART)</div>
                <div>5. Explore (SCAMPER, Brainstorm)</div>
                <div>6. Validate (Experiments Lab)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'frameworks' && (
        <div className="space-y-4">
          <FrameworksView />
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(state.strategicDecisions || []).length === 0 ? (
              <div className="col-span-2 text-center py-12 glass-panel rounded-2xl border-white/5 text-zinc-500 font-mono text-xs">
                No strategic decisions recorded in the journal yet. Click "Log Decision" to capture your reasoning.
              </div>
            ) : (
              (state.strategicDecisions || []).map(dec => (
                <div
                  key={dec.id}
                  className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0b0d13] space-y-3 hover:border-[#c5a059]/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-[#fef08a] border border-[#c5a059]/30">
                        {dec.frameworkUsed}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        (dec.status || 'Open') === 'Validated' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : (dec.status || 'Open') === 'Invalidated'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {(dec.status || 'Open').toUpperCase()} ({dec.confidence}% CONFIDENCE)
                      </span>
                    </div>

                    <h4 className="text-xs font-display font-bold text-white">
                      Problem: {dec.problem}
                    </h4>

                    <div className="p-2.5 bg-[#07080c] rounded-xl border border-white/5 space-y-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Verdict / Decision:</span>
                      <p className="text-xs font-mono text-white font-bold">
                        {dec.decision}
                      </p>
                    </div>

                    {dec.expectedResult && (
                      <div className="text-[10px] font-mono text-zinc-400">
                        <span className="text-zinc-500">Expected Result: </span>
                        <span>{dec.expectedResult}</span>
                      </div>
                    )}

                    {(dec.actualOutcome || dec.actualResult) ? (
                      <div className="p-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[10px] font-mono text-emerald-300">
                        <span className="font-bold block">Actual Outcome:</span>
                        {dec.actualOutcome || dec.actualResult}
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between pt-1 border-t border-white/5">
                        <span>Review Scheduled: {dec.reviewDate}</span>
                        <button
                          onClick={() => {
                            const outcome = prompt('What was the actual empirical result of this decision?');
                            if (outcome) {
                              updateStrategicDecision(dec.id, {
                                actualResult: outcome,
                                actualOutcome: outcome,
                                status: 'Validated'
                              });
                            }
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          Record Outcome
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Delete decision entry "${dec.problem}"?`)) {
                          deleteStrategicDecision(dec.id);
                        }
                      }}
                      className="text-zinc-600 hover:text-rose-400 p-1"
                      title="Delete Decision"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Log Decision Modal */}
      {isNewDecisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-[#c5a059]/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  LOG STRATEGIC DECISION
                </h3>
              </div>
              <button 
                onClick={() => setIsNewDecisionModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Problem / Crossroads Statement:</label>
                <input
                  type="text"
                  required
                  value={decProblem}
                  onChange={e => setDecProblem(e.target.value)}
                  placeholder="e.g. Whether to migrate primary stack to Next.js or stay with Vite"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Context & Constraints:</label>
                <textarea
                  value={decContext}
                  onChange={e => setDecContext(e.target.value)}
                  placeholder="Timeline pressure, performance constraints, developer ergonomics..."
                  rows={2}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Framework Utilized:</label>
                  <select
                    value={decFramework}
                    onChange={e => setDecFramework(e.target.value)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Pareto 80/20 & Heuristics">Pareto 80/20 & Heuristics</option>
                    <option value="Eisenhower Matrix">Eisenhower Matrix</option>
                    <option value="Root Cause (5 Whys)">Root Cause (5 Whys)</option>
                    <option value="OODA Loop">OODA Loop</option>
                    <option value="Working Backwards PR/FAQ">Working Backwards PR/FAQ</option>
                    <option value="SWOT Analysis">SWOT Analysis</option>
                    <option value="Trial & Error Experimentation">Trial & Error Experimentation</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Confidence Rating (0-100%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={decConfidence}
                    onChange={e => setDecConfidence(Number(e.target.value))}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Decision / Path Chosen:</label>
                <input
                  type="text"
                  required
                  value={decDecision}
                  onChange={e => setDecDecision(e.target.value)}
                  placeholder="e.g. Remain on Vite + Cloud Run; eliminate SSR complexity."
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Expected Outcome / Hypothesis:</label>
                  <input
                    type="text"
                    value={decExpectedResult}
                    onChange={e => setDecExpectedResult(e.target.value)}
                    placeholder="Build times under 15s, 0 server hydration bugs."
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Review Date (Feedback Loop):</label>
                  <input
                    type="date"
                    value={decReviewDate}
                    onChange={e => setDecReviewDate(e.target.value)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewDecisionModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold rounded-lg cursor-pointer"
                >
                  Inscribe Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
