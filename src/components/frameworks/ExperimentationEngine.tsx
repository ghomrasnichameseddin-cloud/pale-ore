import React, { useState, useEffect } from 'react';
import { usePOS } from '../../POSContext';
import { 
  FlaskConical, Sparkles, Plus, Trash2, CheckCircle, 
  HelpCircle, ArrowRight, ShieldAlert, FileText, Check, Clock, 
  TrendingUp, Layers, Award, AlertTriangle
} from 'lucide-react';
import { UniversalActionModal, ActionSpawnType } from './UniversalActionModal';

interface ExperimentItem {
  id: string;
  name: string;
  hypothesis: string;
  metric: string;
  baseline: string;
  target: string;
  status: 'Drafting' | 'Running' | 'Validated' | 'Refuted';
  startDate: string;
  iterations: Array<{ date: string; note: string; result: string }>;
  verdictNotes?: string;
}

export const TrialAndErrorLaboratory: React.FC = () => {
  const { addPlanningDocument } = usePOS();

  const [experiments, setExperiments] = useState<ExperimentItem[]>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_experiments_lab');
      return saved ? JSON.parse(saved) : [
        {
          id: 'exp-1',
          name: '45-Minute Ultra-Focus Pomodoro vs 25-Minute Standard',
          hypothesis: 'If we extend deep focus intervals to 45m with 10m recovery, total daily high-tier code output will increase by 30% due to reduced task-switching overhead.',
          metric: 'Daily Deep Focus Minutes + Lines of Tested Code',
          baseline: '120 minutes / day (25m standard)',
          target: '180 minutes / day with zero cognitive burnout',
          status: 'Running',
          startDate: '2026-08-20',
          iterations: [
            { date: '2026-08-21', note: 'Day 1 trial: Completed three 45m blocks easily. Momentum felt noticeably deeper.', result: '135m deep work' },
            { date: '2026-08-23', note: 'Day 3 trial: 10m recovery walk completely eliminated afternoon fatigue.', result: '180m deep work' }
          ]
        },
        {
          id: 'exp-2',
          name: 'Zero Morning Device Exposure Before Fajr Routine',
          hypothesis: 'If phone remains in the kitchen docking station until Fajr & morning recitation are complete, daily spiritual score will consistently exceed 90%.',
          metric: 'Daily Sacred Muḥāsabah Score',
          baseline: '74% average',
          target: '≥90% weekly consistency',
          status: 'Validated',
          startDate: '2026-08-10',
          iterations: [
            { date: '2026-08-15', note: '5 consecutive days with zero morning screen friction. Sacred score reached 95%.', result: '95% score' }
          ],
          verdictNotes: 'Validated with high statistical significance. Promoted to permanent 05 SOP.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [selectedExpId, setSelectedExpId] = useState<string>(experiments[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);

  // Form State for new experiment
  const [newExpName, setNewExpName] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newMetric, setNewMetric] = useState('');
  const [newBaseline, setNewBaseline] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Iteration log state
  const [newIterationNote, setNewIterationNote] = useState('');
  const [newIterationResult, setNewIterationResult] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalType, setModalType] = useState<ActionSpawnType>('sop');

  useEffect(() => {
    localStorage.setItem('pale_ore_experiments_lab', JSON.stringify(experiments));
  }, [experiments]);

  const activeExp = experiments.find(e => e.id === selectedExpId) || experiments[0];

  const handleCreateExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim() || !newHypothesis.trim()) return;

    const newExp: ExperimentItem = {
      id: `exp-${Date.now()}`,
      name: newExpName.trim(),
      hypothesis: newHypothesis.trim(),
      metric: newMetric.trim() || 'Daily Performance Index',
      baseline: newBaseline.trim() || 'Unmeasured',
      target: newTarget.trim() || '+20% efficiency',
      status: 'Running',
      startDate: new Date().toISOString().split('T')[0],
      iterations: []
    };

    setExperiments([newExp, ...experiments]);
    setSelectedExpId(newExp.id);
    setIsCreating(false);
    setNewExpName('');
    setNewHypothesis('');
    setNewMetric('');
    setNewBaseline('');
    setNewTarget('');
  };

  const addIteration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIterationNote.trim() || !activeExp) return;

    const newIter = {
      date: new Date().toISOString().split('T')[0],
      note: newIterationNote.trim(),
      result: newIterationResult.trim() || 'Logged'
    };

    setExperiments(experiments.map(e => {
      if (e.id === activeExp.id) {
        return {
          ...e,
          iterations: [...e.iterations, newIter]
        };
      }
      return e;
    }));

    setNewIterationNote('');
    setNewIterationResult('');
  };

  const updateStatus = (id: string, newStatus: ExperimentItem['status']) => {
    setExperiments(experiments.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const deleteExp = (id: string) => {
    setExperiments(experiments.filter(e => e.id !== id));
    if (selectedExpId === id) {
      setSelectedExpId(experiments.find(e => e.id !== id)?.id || '');
    }
  };

  const handlePromoteToSOP = () => {
    if (!activeExp) return;
    setModalType('sop');
    setModalTitle(`SOP Protocol: ${activeExp.name}`);
    setModalDesc(
      `### Origin Experiment (Validated)\n${activeExp.name}\n\n### Proven Hypothesis:\n${activeExp.hypothesis}\n\n### Empirical Results:\nBaseline: ${activeExp.baseline} ➔ Achieved Target: ${activeExp.target}\n\n### Standard Operating Procedure:\n1. Execute proven routine.\n2. Continuous telemetry check.`
    );
    setModalOpen(true);
  };

  const handleArchiveLesson = () => {
    if (!activeExp) return;
    setModalType('codex');
    setModalTitle(`Lesson Learned: ${activeExp.name}`);
    setModalDesc(
      `### Experiment Outcome: ${activeExp.status}\n\n### Hypothesis Tested:\n${activeExp.hypothesis}\n\n### Iteration Log:\n${activeExp.iterations.map(i => `- [${i.date}] ${i.note} (${i.result})`).join('\n')}\n\n### Strategic Takeaway:\nDo not repeat failure modes; refine baseline variables.`
    );
    setModalOpen(true);
  };

  return (
    <div className="space-y-6" id="trial-error-laboratory-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5 text-emerald-400" /> EMPIRICAL STRATEGY & EXPERIMENTATION
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              SCIENTIFIC ITERATION ENGINE
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            TRIAL & ERROR LABORATORY
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Formulate rigorous hypotheses, track measurable variables, and mathematically validate protocols before promoting them into permanent 05 SOPs.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:brightness-110 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          NEW EXPERIMENT
        </button>
      </div>

      {/* Creation Modal / Inline Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateExp} className="glass-panel p-5 rounded-2xl border border-emerald-500/40 bg-[#07080c] space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> FORMULATE NEW EXPERIMENTAL TRIAL
            </h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-zinc-500 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">EXPERIMENT PROTOCOL NAME *</label>
            <input
              type="text"
              required
              value={newExpName}
              onChange={(e) => setNewExpName(e.target.value)}
              placeholder="e.g. Test 3-hour morning deep work block before email check..."
              className="w-full bg-[#0b0d13] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">HYPOTHESIS STATEMENT (IF [ACTION], THEN [OUTCOME] BECAUSE [REASON]) *</label>
            <textarea
              rows={2}
              required
              value={newHypothesis}
              onChange={(e) => setNewHypothesis(e.target.value)}
              placeholder="If we eliminate all shallow tabs before sleeping, morning focus latency will drop by 50% because cognitive residue is zero."
              className="w-full bg-[#0b0d13] border border-white/15 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">PRIMARY METRIC</label>
              <input
                type="text"
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                placeholder="e.g. Focus minutes"
                className="w-full bg-[#0b0d13] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">CURRENT BASELINE</label>
              <input
                type="text"
                value={newBaseline}
                onChange={(e) => setNewBaseline(e.target.value)}
                placeholder="e.g. 60 min/day"
                className="w-full bg-[#0b0d13] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">TARGET SUCCESS CRITERION</label>
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g. 180 min/day"
                className="w-full bg-[#0b0d13] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs rounded-xl shadow-lg"
            >
              LAUNCH TRIAL
            </button>
          </div>
        </form>
      )}

      {/* Main Experiment Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Experiments */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-[#e5c875] font-bold uppercase tracking-wider">
            LABORATORY EXPERIMENTS ({experiments.length})
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {experiments.map(exp => {
              const isSelected = exp.id === activeExp?.id;
              const statusColors = {
                Drafting: 'bg-zinc-900 text-zinc-400 border-zinc-700',
                Running: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
                Validated: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
                Refuted: 'bg-rose-950 text-rose-300 border-rose-500/40'
              }[exp.status];

              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-[#141824] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-[#07080c] border-white/5 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-mono px-2 py-0.2 rounded border font-bold uppercase ${statusColors}`}>
                      {exp.status}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      Started: {exp.startDate}
                    </span>
                  </div>

                  <h5 className="text-xs font-display font-bold text-white leading-snug">
                    {exp.name}
                  </h5>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                    <span>{exp.iterations.length} Iterations</span>
                    <span className="text-emerald-400 font-bold">{exp.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Experiment Dossier & Iteration Log */}
        <div className="lg:col-span-2 space-y-5">
          {activeExp ? (
            <div className="glass-panel p-5 rounded-2xl border border-white/15 bg-[#07080c] space-y-5 shadow-xl">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">EXPERIMENTAL PROTOCOL</span>
                    <span className="text-[9px] font-mono text-zinc-500">{activeExp.startDate}</span>
                  </div>
                  <h3 className="text-sm font-display font-bold text-white mt-0.5">{activeExp.name}</h3>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {(['Running', 'Validated', 'Refuted'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => updateStatus(activeExp.id, st)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition ${
                        activeExp.status === st
                          ? st === 'Validated' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : st === 'Refuted' ? 'bg-rose-950 text-rose-300 border-rose-500' : 'bg-cyan-950 text-cyan-300 border-cyan-500'
                          : 'bg-[#0b0d13] text-zinc-500 border-white/5 hover:text-zinc-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    onClick={() => deleteExp(activeExp.id)}
                    className="p-1 text-zinc-600 hover:text-rose-400 transition ml-1"
                    title="Delete Experiment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Hypothesis & Parameters */}
              <div className="space-y-3">
                <div className="p-3 bg-[#0b0d13] border border-emerald-500/20 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">🔬 WORKING HYPOTHESIS:</span>
                  <p className="text-xs text-zinc-200 font-sans leading-relaxed">{activeExp.hypothesis}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#0b0d13] border border-white/5 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase block">METRIC:</span>
                    <span className="text-white font-bold block truncate">{activeExp.metric}</span>
                  </div>
                  <div className="p-2.5 bg-[#0b0d13] border border-white/5 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase block">BASELINE:</span>
                    <span className="text-zinc-300 block truncate">{activeExp.baseline}</span>
                  </div>
                  <div className="p-2.5 bg-[#0b0d13] border border-white/5 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase block">TARGET:</span>
                    <span className="text-emerald-400 font-bold block truncate">{activeExp.target}</span>
                  </div>
                </div>
              </div>

              {/* Empirical Iterations Timeline */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-mono text-[#e5c875] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#c5a059]" />
                  EMPIRICAL RUNS & LOGS ({activeExp.iterations.length})
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeExp.iterations.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 text-xs font-mono">
                      No trial runs logged yet. Execute an iteration below.
                    </div>
                  ) : (
                    activeExp.iterations.map((iter, idx) => (
                      <div key={idx} className="p-2.5 bg-[#0b0d13] border border-white/5 rounded-xl flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 block">{iter.date}</span>
                          <p className="text-zinc-200 font-sans mt-0.5">{iter.note}</p>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0 font-bold">
                          {iter.result}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Iteration Form */}
                <form onSubmit={addIteration} className="flex gap-2 pt-2 border-t border-white/5">
                  <input
                    type="text"
                    required
                    value={newIterationNote}
                    onChange={(e) => setNewIterationNote(e.target.value)}
                    placeholder="Trial observation (e.g. 45m block completed with zero friction)..."
                    className="flex-1 bg-[#0b0d13] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={newIterationResult}
                    onChange={(e) => setNewIterationResult(e.target.value)}
                    placeholder="Result (e.g. 180m)"
                    className="w-28 bg-[#0b0d13] border border-white/15 rounded-xl px-2 py-1.5 text-xs text-emerald-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs rounded-xl"
                  >
                    LOG
                  </button>
                </form>
              </div>

              {/* Final Synthesis & Promotion Actions */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  EXPERIMENT DESTINY:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleArchiveLesson}
                    className="px-3 py-1.5 bg-[#0b0d13] hover:bg-[#141824] border border-white/10 text-zinc-300 font-mono text-xs rounded-xl transition"
                  >
                    Archive to 08 Lessons Learned
                  </button>
                  <button
                    type="button"
                    onClick={handlePromoteToSOP}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:brightness-110 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
                  >
                    <Award className="h-3.5 w-3.5" />
                    PROMOTE TO 05 SOP ➔
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 font-mono text-xs">
              Select or launch an experiment to inspect telemetry.
            </div>
          )}
        </div>

      </div>

      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Trial & Error Laboratory"
      />

    </div>
  );
};
