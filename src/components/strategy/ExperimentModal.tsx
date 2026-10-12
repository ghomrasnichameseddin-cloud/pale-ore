import React, { useState, useEffect } from 'react';
import { X, FlaskConical, Sparkles, AlertCircle } from 'lucide-react';
import { StrategicExperiment, ExperimentVerdict } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';
import { getLocalDateString, addDays } from '../../utils/dateUtils';

interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: Omit<StrategicExperiment, 'id' | 'createdAt'>, existingId?: string) => void;
  editingExperiment?: StrategicExperiment | null;
}

const EXPERIMENT_TEMPLATES = [
  {
    title: 'Fajr Deep Work Focus Window',
    hypothesis: 'Executing the heaviest campaign directive immediately following Fajr without checking notifications will increase deep work hours by 50% and eliminate afternoon brain fog.',
    prediction: 'Achieve 90 minutes of unbroken focus before 08:00 AM for 14 consecutive days.',
    experiment: 'Phone locked in charging sanctum; workstation initialized night before with directive open.',
    timeboxDays: 14,
    measurement: 'Uninterrupted focus minutes logged via Pomodoro engine and morning directive completion status.'
  },
  {
    title: '45-Minute Quest Granularity Test',
    hypothesis: 'Splitting every directive into strictly <=45 minute verifiable milestones will completely eliminate task avoidance and procrastination.',
    prediction: 'Zero overdue main directives across 7 days of sprint execution.',
    experiment: 'Refuse to launch any quest that cannot be physically validated in 45 minutes.',
    timeboxDays: 7,
    measurement: 'Number of stalled or rolled-over tasks in daily standup.'
  },
  {
    title: 'Asynchronous Communication Batching',
    hypothesis: 'Consolidating all email, messages, and social media checks into a single 30-minute block at 16:30 PM will reduce cognitive switching fatigue.',
    prediction: 'Increase daily completed directives from 3 to 5 while maintaining prompt response times for true urgencies.',
    experiment: 'All notification sounds and badges disabled until 16:30 PM daily alarm.',
    timeboxDays: 10,
    measurement: 'Total daily focused hours vs subjective end-of-day fatigue score.'
  }
];

export const ExperimentModal: React.FC<ExperimentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExperiment
}) => {
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [prediction, setPrediction] = useState('');
  const [experiment, setExperiment] = useState('');
  const [timeboxDays, setTimeboxDays] = useState(14);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [result, setResult] = useState('');
  const [verdict, setVerdict] = useState<ExperimentVerdict>('Pending');
  const [decision, setDecision] = useState('');
  const [codifiedSopOrDoctrine, setCodifiedSopOrDoctrine] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExperiment) {
      setTitle(editingExperiment.title || '');
      setHypothesis(editingExperiment.hypothesis);
      setPrediction(editingExperiment.prediction);
      setExperiment(editingExperiment.experiment);
      setTimeboxDays(editingExperiment.timeboxDays || 14);
      setStartDate(editingExperiment.startDate ? editingExperiment.startDate.split('T')[0] : '');
      setEndDate(editingExperiment.endDate ? editingExperiment.endDate.split('T')[0] : '');
      setMeasurement(editingExperiment.measurement);
      setResult(editingExperiment.result || '');
      setVerdict(editingExperiment.verdict || 'Pending');
      setDecision(editingExperiment.decision || '');
      setCodifiedSopOrDoctrine(editingExperiment.codifiedSopOrDoctrine || '');
    } else {
      setTitle('');
      setHypothesis('');
      setPrediction('');
      setExperiment('');
      setTimeboxDays(14);
      const today = getLocalDateString();
      setStartDate(today);
      setEndDate(addDays(today, 14));
      setMeasurement('');
      setResult('');
      setVerdict('Pending');
      setDecision('');
      setCodifiedSopOrDoctrine('');
    }
    setError('');
  }, [editingExperiment, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof EXPERIMENT_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setHypothesis(tpl.hypothesis);
    setPrediction(tpl.prediction);
    setExperiment(tpl.experiment);
    setTimeboxDays(tpl.timeboxDays);
    setMeasurement(tpl.measurement);
    const start = startDate || getLocalDateString();
    setEndDate(addDays(start, tpl.timeboxDays));
    setError('');
  };

  const handleTimeboxChange = (days: number) => {
    setTimeboxDays(days);
    if (startDate) {
      setEndDate(addDays(startDate, days));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim()) {
      setError('Please state the falsifiable hypothesis.');
      return;
    }
    if (!prediction.trim()) {
      setError('Please state the concrete prediction.');
      return;
    }
    if (!experiment.trim()) {
      setError('Please describe the experiment intervention.');
      return;
    }

    const todayStr = getLocalDateString();
    onSave({
      title: title.trim() || undefined,
      hypothesis: hypothesis.trim(),
      prediction: prediction.trim(),
      experiment: experiment.trim(),
      timeboxDays,
      startDate: startDate || todayStr,
      endDate: endDate || undefined,
      measurement: measurement.trim() || 'Daily completion log',
      result: result.trim() || undefined,
      verdict,
      decision: decision.trim() || undefined,
      codifiedSopOrDoctrine: codifiedSopOrDoctrine.trim() || undefined,
      status: verdict === 'Pending' ? 'Running' : 'Concluded'
    }, editingExperiment?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl shadow-2xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>{editingExperiment ? 'EDIT STRATEGIC EXPERIMENT' : 'LAUNCH STRATEGIC EXPERIMENT'}</span>
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Empirical hypothesis-driven optimization, timeboxed testing & SOP promotion
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Templates */}
        {!editingExperiment && (
          <div className="space-y-2 p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a059] font-bold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> EXPERIMENTAL PROTOCOL PRESETS
              </span>
              <span className="text-[9px] font-mono text-zinc-500">Click to autofill template</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIMENT_TEMPLATES.map(tpl => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-[#141824] hover:bg-[#1f2438] text-zinc-300 hover:text-[#fef08a] border border-white/5 hover:border-[#c5a059]/40 transition text-left"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Experiment Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fajr Deep Work Focus Window"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Timebox Window</label>
              <select
                value={timeboxDays}
                onChange={(e) => handleTimeboxChange(Number(e.target.value))}
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
              >
                <option value={7}>7 Days (1 Week Sprint)</option>
                <option value={10}>10 Days (Targeted Window)</option>
                <option value={14}>14 Days (Standard Two-Week Cycle)</option>
                <option value={21}>21 Days (Habit Consolidation)</option>
                <option value={30}>30 Days (Full Monthly Horizon)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Falsifiable Hypothesis *</label>
            <textarea
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="What assumption are you testing? (If we do X, then Y will improve by Z because...)"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Quantifiable Prediction *</label>
              <textarea
                rows={2}
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="What concrete outcome do you predict will happen?"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Intervention / Protocol *</label>
              <textarea
                rows={2}
                value={experiment}
                onChange={(e) => setExperiment(e.target.value)}
                placeholder="What exact behavioral or operational change will you enact?"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Measurement Metric</label>
              <input
                type="text"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="e.g. Focus minutes logged"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Verdict and Outcome (Editable upon conclusion) */}
          <div className="p-3.5 bg-[#07080c] border border-white/5 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              EXPERIMENT VERDICT & CODIFICATION
            </span>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500">Verdict Status</label>
              <div className="flex flex-wrap gap-2">
                {(['Pending', 'Keep', 'Modify', 'Reject', 'Inconclusive'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVerdict(v)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition ${
                      verdict === v
                        ? v === 'Keep' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 font-bold' :
                          v === 'Modify' ? 'bg-amber-950/80 text-amber-300 border-amber-500 font-bold' :
                          v === 'Reject' ? 'bg-rose-950/80 text-rose-300 border-rose-500 font-bold' :
                          v === 'Pending' ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 font-bold' :
                          'bg-zinc-800 text-zinc-300 border-zinc-600 font-bold'
                        : 'bg-[#0b0d13] text-zinc-500 border-white/5 hover:text-zinc-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">Empirical Result</label>
                <input
                  type="text"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="e.g. 12 of 14 days achieved. Deep focus rose 50%..."
                  className="w-full bg-[#0b0d13] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">Codified SOP or Doctrine</label>
                <input
                  type="text"
                  value={codifiedSopOrDoctrine}
                  onChange={(e) => setCodifiedSopOrDoctrine(e.target.value)}
                  placeholder="e.g. Doctrine: Protect the Golden Hours"
                  className="w-full bg-[#0b0d13] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c5a059]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg"
            >
              <span>{editingExperiment ? 'Save Changes' : 'Launch Experiment'}</span>
              <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
