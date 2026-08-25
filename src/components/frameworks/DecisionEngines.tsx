import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  Compass, HelpCircle, ArrowRight, Sparkles, CheckCircle, 
  Clock, ShieldAlert, Zap, AlertTriangle, BookOpen, Swords, Target
} from 'lucide-react';
import { UniversalActionModal, ActionSpawnType } from './UniversalActionModal';

interface DecisionEnginesProps {
  onSpawnAction?: (title: string, desc: string, type: ActionSpawnType) => void;
}

export const OperationalHeuristicsEngine: React.FC<DecisionEnginesProps> = () => {
  const [selectedHeuristic, setSelectedHeuristic] = useState<string>('inversion');
  const [userDilemma, setUserDilemma] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    principleName: string;
    advice: string;
    actionableDirective: string;
    riskAvoidance: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');

  const HEURISTICS = [
    {
      id: 'inversion',
      name: 'Inversion Principle (Jacobi)',
      tagline: 'Avoid stupidity rather than seeking brilliance',
      description: 'Instead of asking "How do I succeed?", ask "How could I guarantee complete, catastrophic failure?", and rigorously avoid those conditions.',
      formula: 'Identify Anti-Goals ➔ Systematically Eliminate Failure Modes'
    },
    {
      id: 'two_minute',
      name: 'Two-Minute Rule (Allen)',
      tagline: 'Friction elimination for micro-tasks',
      description: 'If an actionable task takes less than 2 minutes to complete, execute it immediately without filing, scheduling, or deliberating.',
      formula: 'Execution Time < 120s ➔ Immediate Zero-Lag Completion'
    },
    {
      id: 'regret_min',
      name: 'Regret Minimization (Bezos)',
      tagline: 'Long-term horizon perspective alignment',
      description: 'Project yourself to age 80 looking back on your life. Will you regret attempting this and failing, or will you regret never trying at all?',
      formula: 'Age 80 Perspective ➔ Maximize Courage, Minimize Omission'
    },
    {
      id: 'first_principles',
      name: 'First Principles Thinking',
      tagline: 'Deconstruct to fundamental truths',
      description: 'Boil a problem down to its most basic, non-negotiable truths and reason up from there, rather than reasoning by analogy or copying others.',
      formula: 'Break to Raw Physics/Truths ➔ Rebuild Logic Upwards'
    },
    {
      id: 'occams_razor',
      name: "Occam's Razor",
      tagline: 'The simplest sufficient explanation is best',
      description: 'When presented with competing hypotheses or solutions, select the one that makes the fewest assumptions and introduces the least complexity.',
      formula: 'Minimal Assumptions ➔ Robust, Low-Entropy Execution'
    },
    {
      id: 'galls_law',
      name: "Gall's Law",
      tagline: 'Complex systems evolve from working simple ones',
      description: 'A complex system designed from scratch never works and cannot be patched. You must start with a simple system that works and evolve it incrementally.',
      formula: 'Build Working Minimal Core ➔ Evolve Complexity Organically'
    },
    {
      id: 'chestertons_fence',
      name: "Chesterton's Fence",
      tagline: 'Understand the purpose before destroying the rule',
      description: 'Do not remove a rule, habit, code line, or boundary until you thoroughly understand why it was put there in the first place.',
      formula: 'Comprehend Legacy Rationale ➔ Safe Reform or Removal'
    }
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDilemma.trim()) return;

    const heuristic = HEURISTICS.find(h => h.id === selectedHeuristic) || HEURISTICS[0];

    let advice = '';
    let directive = '';
    let avoidance = '';

    if (selectedHeuristic === 'inversion') {
      advice = `Look at "${userDilemma}". If you wanted to guarantee absolute disaster, you would: procrastinate, leave assumptions unverified, ignore feedback, and let distraction dictate your hours.`;
      directive = `Write down the top 3 fatal errors that would sabotage "${userDilemma}" and place protective boundaries against them today.`;
      avoidance = `Avoid adding complexity. Simply eliminate the known destructive habits first.`;
    } else if (selectedHeuristic === 'two_minute') {
      advice = `Break "${userDilemma}" into its immediate 120-second ignition action. Momentum starts with the first tiny mechanical step.`;
      directive = `Execute the immediate sub-step (e.g. open terminal, draft first sentence, create file) right now without thinking.`;
      avoidance = `Avoid over-planning when immediate action will collapse ambiguity.`;
    } else if (selectedHeuristic === 'first_principles') {
      advice = `Strip all industry jargon and past assumptions from "${userDilemma}". What are the fundamental physical inputs? Time, code, energy, data.`;
      directive = `Design the minimal mathematical solution using only proven first principles.`;
      avoidance = `Avoid "because everyone does it this way". Build the leanest direct architecture.`;
    } else if (selectedHeuristic === 'regret_min') {
      advice = `At age 80, the pain of a failed attempt on "${userDilemma}" will be zero, but the lingering regret of hesitation will remain forever.`;
      directive = `Commit to the boldest calculated move and launch the initiative.`;
      avoidance = `Avoid letting temporary fear of judgment paralyze strategic growth.`;
    } else if (selectedHeuristic === 'galls_law') {
      advice = `Do not try to build the ultimate version of "${userDilemma}" on day one. Build the smallest prototype that actually works end-to-end.`;
      directive = `Ship an MVP with only 1 primary feature, verify it works, then iterate.`;
      avoidance = `Avoid monolithic architectures designed on whiteboards before code runs.`;
    } else {
      advice = `Evaluate "${userDilemma}" against "${heuristic.name}". Cut unnecessary variables and focus on the highest-leverage mechanical lever.`;
      directive = `Formulate a clean directive and execute with disciplined focus.`;
      avoidance = `Avoid assumptions without telemetry.`;
    }

    setAnalysisResult({
      principleName: heuristic.name,
      advice,
      actionableDirective: directive,
      riskAvoidance: avoidance
    });
  };

  const handleSpawn = () => {
    if (!analysisResult) return;
    setModalTitle(`Execute: ${analysisResult.principleName} Directive`);
    setModalDesc(`${analysisResult.actionableDirective}\n\nContext: ${userDilemma}`);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6" id="heuristics-engine-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" /> MENTAL MODELS & DECISION COUNSEL
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30">
              7 HEURISTICS ACTIVE
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            OPERATIONAL HEURISTICS ANALYZER
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Cut through mental fog, prevent catastrophic errors, and align immediate tactics with timeless decision principles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Heuristics Selector */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono text-[#c5a059] font-bold uppercase tracking-wider">
            1. SELECT COGNITIVE HEURISTIC
          </h4>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {HEURISTICS.map(h => {
              const isSelected = selectedHeuristic === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHeuristic(h.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#141824] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]' 
                      : 'bg-[#07080c] border-white/5 hover:border-[#c5a059]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold text-white">{h.name}</span>
                    {isSelected && <Sparkles className="h-3 w-3 text-[#fef08a]" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{h.tagline}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle & Right: Dilemma Formulation & Analysis Output */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Active Heuristic Card */}
          {(() => {
            const h = HEURISTICS.find(x => x.id === selectedHeuristic) || HEURISTICS[0];
            return (
              <div className="p-4 bg-[#0e121d] border border-[#c5a059]/25 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#e5c875] font-bold uppercase">{h.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10">
                    {h.formula}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">{h.description}</p>
              </div>
            );
          })()}

          {/* Form */}
          <form onSubmit={handleAnalyze} className="space-y-3">
            <label className="block text-xs font-mono text-zinc-300 font-bold uppercase">
              2. INPUT YOUR STRATEGIC DILEMMA OR DECISION:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userDilemma}
                onChange={(e) => setUserDilemma(e.target.value)}
                placeholder="e.g. Should I build a complex custom auth microservice or use a simple library?"
                className="flex-1 bg-[#07080c] border border-white/15 focus:border-[#c5a059] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#c5a059] hover:bg-[#d8b368] text-black font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                ANALYZE
              </button>
            </div>
          </form>

          {/* Result Card */}
          {analysisResult && (
            <div className="p-5 bg-gradient-to-br from-[#0b0d13] to-[#121624] border border-[#c5a059]/40 rounded-2xl space-y-4 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {analysisResult.principleName} SYNTHESIS
                  </h4>
                </div>
                <button
                  onClick={handleSpawn}
                  className="text-[10px] font-mono px-3 py-1 rounded-lg bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] hover:brightness-125 font-bold flex items-center gap-1.5 transition"
                >
                  <Swords className="h-3 w-3" />
                  SPAWN DIRECTIVE ➔
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold block mb-0.5">🧠 STRATEGIC COUNSEL:</span>
                  <p className="text-zinc-200 font-sans leading-relaxed">{analysisResult.advice}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-0.5">⚡ ACTIONABLE DIRECTIVE:</span>
                  <p className="text-emerald-200 font-mono bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">{analysisResult.actionableDirective}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-0.5">⚠️ FAILURE MODE TO ELIMINATE:</span>
                  <p className="text-amber-200/90 font-sans">{analysisResult.riskAvoidance}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Universal Action Modal */}
      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="quest"
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Operational Heuristics Analyzer"
      />

    </div>
  );
};
