import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { StrategicExperiment, StrategicPostmortem, Doctrine } from '../../types';
import { 
  FlaskConical, AlertTriangle, Plus, Trash2, CheckCircle2, 
  ArrowRight, X, Bookmark, Edit3, Clock, Activity, ShieldAlert
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString, addDays } from '../../utils/dateUtils';

export const ExperimentsPostmortemsView: React.FC = () => {
  const { 
    state, addStrategicExperiment, updateStrategicExperiment, deleteStrategicExperiment,
    addStrategicPostmortem, deleteStrategicPostmortem, addDoctrine, addSystemMessage
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'experiments' | 'postmortems'>('experiments');
  const [isNewExperimentModalOpen, setIsNewExperimentModalOpen] = useState(false);
  const [isNewPostmortemModalOpen, setIsNewPostmortemModalOpen] = useState(false);

  // Experiment Form
  const [expTitle, setExpTitle] = useState('');
  const [expHypothesis, setExpHypothesis] = useState('');
  const [expPrediction, setExpPrediction] = useState('');
  const [expTimeboxDays, setExpTimeboxDays] = useState(14);
  const [expMetric, setExpMetric] = useState('');

  // Postmortem Form
  const [pmTitle, setPmTitle] = useState('');
  const [pmExpected, setPmExpected] = useState('');
  const [pmActual, setPmActual] = useState('');
  const [pmImpact, setPmImpact] = useState<'Critical' | 'Moderate' | 'Minor'>('Moderate');
  const [pmFailurePoint, setPmFailurePoint] = useState('');
  const [pmRootCause, setPmRootCause] = useState('');
  const [pmCorrectiveAction, setPmCorrectiveAction] = useState('');
  const [pmCodifiedSOP, setPmCodifiedSOP] = useState('');

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expHypothesis.trim()) return;

    addStrategicExperiment({
      title: expTitle.trim(),
      experiment: expTitle.trim(),
      hypothesis: expHypothesis.trim(),
      prediction: expPrediction.trim(),
      timeboxDays: expTimeboxDays,
      metric: expMetric.trim() || 'Key Metric',
      measurement: expMetric.trim() || 'Key Metric',
      status: 'Running',
      verdict: 'Inconclusive'
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Strategic Experiment Initiated',
      content: `Strategic experiment initiated: "${expTitle.trim()}". Timebox: ${expTimeboxDays} days.`,
      priority: 'medium'
    });
    setIsNewExperimentModalOpen(false);
    setExpTitle('');
    setExpHypothesis('');
    setExpPrediction('');
    setExpMetric('');
  };

  const handleCreatePostmortem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmTitle.trim() || !pmRootCause.trim()) return;

    addStrategicPostmortem({
      title: pmTitle.trim(),
      event: pmTitle.trim(),
      date: getLocalDateString(),
      timeline: getLocalDateString(),
      expectedOutcome: pmExpected.trim(),
      actualOutcome: pmActual.trim(),
      impact: pmImpact,
      failurePoint: pmFailurePoint.trim(),
      rootCause: pmRootCause.trim(),
      correctiveAction: pmCorrectiveAction.trim(),
      codifiedSOP: pmCodifiedSOP.trim(),
      codifiedSopOrDoctrine: pmCodifiedSOP.trim(),
      lesson: pmCorrectiveAction.trim()
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'warning',
      title: 'Postmortem Inscribed',
      content: `Postmortem inscribed: "${pmTitle.trim()}". Reality feedback loop closed.`,
      priority: 'high'
    });
    setIsNewPostmortemModalOpen(false);
    setPmTitle('');
    setPmExpected('');
    setPmActual('');
    setPmFailurePoint('');
    setPmRootCause('');
    setPmCorrectiveAction('');
    setPmCodifiedSOP('');
  };

  const codifyExperimentToDoctrine = (exp: StrategicExperiment) => {
    const expName = exp.title || exp.experiment;
    const doctrineName = prompt('Enter Doctrine Name for this validated experiment:', `Doctrine of ${expName}`);
    if (!doctrineName) return;

    addDoctrine({
      name: doctrineName.trim(),
      rule: exp.prediction || exp.hypothesis,
      appliesTo: 'Strategic operations & execution sprints',
      origin: `Empirically validated via experiment: "${expName}"`,
      category: 'Operational',
      status: 'Active'
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'achievement',
      title: 'Doctrine Codified',
      content: `Experiment "${expName}" successfully codified into permanent Doctrine!`,
      priority: 'medium'
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border-[#c5a059]/30 bg-[#07080c]/90">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
              EMPIRICAL EXPERIMENTS & POSTMORTEMS
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              {(state.strategicExperiments || []).length} EXPERIMENTS • {(state.strategicPostmortems || []).length} POSTMORTEMS
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Answers: "WHAT DID REALITY TEACH ME?" • Scientific hypotheses, timeboxed trials, and blameless failure analysis.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-mono bg-[#0b0d13] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'experiments' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Experiments Lab
            </button>
            <button
              onClick={() => setActiveTab('postmortems')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'postmortems' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Failure Postmortems
            </button>
          </div>

          {activeTab === 'experiments' ? (
            <button
              onClick={() => setIsNewExperimentModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Experiment
            </button>
          ) : (
            <button
              onClick={() => setIsNewPostmortemModalOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Inscribe Postmortem
            </button>
          )}
        </div>
      </div>

      {activeTab === 'experiments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(state.strategicExperiments || []).length === 0 ? (
            <div className="col-span-2 text-center py-12 glass-panel rounded-2xl border-white/5 text-zinc-500 font-mono text-xs">
              No experiments active. Formulate a hypothesis and run a timeboxed trial above.
            </div>
          ) : (
            (state.strategicExperiments || []).map(exp => (
              <div
                key={exp.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0b0d13] space-y-3 hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase">
                      {exp.timeboxDays}-DAY TRIAL • {(exp.status || 'Running').toUpperCase()}
                    </span>
                    <select
                      value={exp.verdict}
                      onChange={e => updateStrategicExperiment(exp.id, { verdict: e.target.value as any })}
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#07080c] border border-white/10 rounded text-white"
                    >
                      <option value="Inconclusive">Inconclusive</option>
                      <option value="Keep">VERDICT: KEEP</option>
                      <option value="Modify">VERDICT: MODIFY</option>
                      <option value="Reject">VERDICT: REJECT</option>
                    </select>
                  </div>

                  <h4 className="text-sm font-display font-bold text-white">
                    {exp.title || exp.experiment}
                  </h4>

                  <div className="p-3 bg-[#07080c] rounded-xl border border-white/5 space-y-1 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500">Hypothesis: </span>
                      <span className="text-zinc-200">{exp.hypothesis}</span>
                    </div>
                    {exp.prediction && (
                      <div>
                        <span className="text-zinc-500">Prediction: </span>
                        <span className="text-emerald-300">{exp.prediction}</span>
                      </div>
                    )}
                    {exp.metric && (
                      <div>
                        <span className="text-zinc-500">Target Metric: </span>
                        <span className="text-cyan-300">{exp.metric}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  {exp.verdict === 'Keep' ? (
                    <button
                      onClick={() => codifyExperimentToDoctrine(exp)}
                      className="px-2.5 py-1 bg-[#3a2e12] hover:bg-[#4d3d18] text-[#fef08a] border border-[#c5a059]/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Bookmark className="h-3 w-3" /> Codify into Doctrine
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500">
                      Evaluated via feedback loop
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete experiment "${exp.title}"?`)) {
                        deleteStrategicExperiment(exp.id);
                      }
                    }}
                    className="text-zinc-600 hover:text-rose-400 p-1"
                    title="Delete Experiment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* POSTMORTEMS */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(state.strategicPostmortems || []).length === 0 ? (
              <div className="col-span-2 text-center py-12 glass-panel rounded-2xl border-white/5 text-zinc-500 font-mono text-xs">
                No failure postmortems recorded yet. Convert setbacks into codified wisdom above.
              </div>
            ) : (
              (state.strategicPostmortems || []).map(pm => (
                <div
                  key={pm.id}
                  className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-[#0d090d] space-y-3 hover:border-rose-400/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 uppercase">
                        {pm.impact} IMPACT • {pm.date || pm.timeline || ''}
                      </span>
                    </div>

                    <h4 className="text-sm font-display font-bold text-white">
                      {pm.title || pm.event}
                    </h4>

                    <div className="p-3 bg-[#07080c] rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500">Expected vs Reality: </span>
                        <span className="text-zinc-300 block mt-0.5">{pm.actualOutcome} (Expected: {pm.expectedOutcome})</span>
                      </div>

                      <div className="pt-1 border-t border-white/5">
                        <span className="text-rose-400 font-bold">Root Cause (5 Whys): </span>
                        <span className="text-zinc-200 block mt-0.5">{pm.rootCause}</span>
                      </div>

                      {pm.correctiveAction && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-emerald-400 font-bold">Corrective Action: </span>
                          <span className="text-zinc-200 block mt-0.5">{pm.correctiveAction}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Delete postmortem "${pm.title}"?`)) {
                          deleteStrategicPostmortem(pm.id);
                        }
                      }}
                      className="text-zinc-600 hover:text-rose-400 p-1"
                      title="Delete Postmortem"
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

      {/* New Experiment Modal */}
      {isNewExperimentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-emerald-500/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#10b981" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  INITIATE STRATEGIC EXPERIMENT
                </h3>
              </div>
              <button 
                onClick={() => setIsNewExperimentModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Experiment Name / Title:</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  placeholder="e.g. Asynchronous Standup Directive Cadence"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Falsifiable Hypothesis:</label>
                <textarea
                  required
                  value={expHypothesis}
                  onChange={e => setExpHypothesis(e.target.value)}
                  placeholder="If we replace morning synchronizations with 3 structured directives..."
                  rows={2}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Specific Prediction / Expected Yield:</label>
                <input
                  type="text"
                  value={expPrediction}
                  onChange={e => setExpPrediction(e.target.value)}
                  placeholder="Deep focus hours increase by 35% without velocity loss."
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Timebox Duration (Days):</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={expTimeboxDays}
                    onChange={e => setExpTimeboxDays(Number(e.target.value))}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Measurement Metric:</label>
                  <input
                    type="text"
                    value={expMetric}
                    onChange={e => setExpMetric(e.target.value)}
                    placeholder="e.g. Focus minutes logged"
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewExperimentModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Launch Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Postmortem Modal */}
      {isNewPostmortemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-rose-500/40 bg-[#0d090d] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#f43f5e" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  INSCRIBE FAILURE POSTMORTEM
                </h3>
              </div>
              <button 
                onClick={() => setIsNewPostmortemModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePostmortem} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Incident / Failure Codename:</label>
                <input
                  type="text"
                  required
                  value={pmTitle}
                  onChange={e => setPmTitle(e.target.value)}
                  placeholder="e.g. Q3 Cloud Database Outage & Data Staleness"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Expected Outcome:</label>
                  <input
                    type="text"
                    value={pmExpected}
                    onChange={e => setPmExpected(e.target.value)}
                    placeholder="Instant seamless zero-downtime cutover."
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Actual Outcome:</label>
                  <input
                    type="text"
                    value={pmActual}
                    onChange={e => setPmActual(e.target.value)}
                    placeholder="12-hour synchronization halt."
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Root Cause (Discovered via 5 Whys):</label>
                <textarea
                  required
                  value={pmRootCause}
                  onChange={e => setPmRootCause(e.target.value)}
                  placeholder="Lack of automated staging tests; unchecked foreign-key schema divergence."
                  rows={2}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Corrective Action & Preventive Protocol:</label>
                <input
                  type="text"
                  value={pmCorrectiveAction}
                  onChange={e => setPmCorrectiveAction(e.target.value)}
                  placeholder="Mandate pre-flight smoke dry runs."
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewPostmortemModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Inscribe Postmortem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
