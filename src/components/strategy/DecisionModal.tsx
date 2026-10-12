import React, { useState, useEffect } from 'react';
import { X, Scale, Sparkles, Plus, Trash2, AlertCircle } from 'lucide-react';
import { StrategicDecision } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';
import { getLocalDateString, addDays } from '../../utils/dateUtils';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (decision: Omit<StrategicDecision, 'id' | 'createdAt'>, existingId?: string) => void;
  editingDecision?: StrategicDecision | null;
}

const DECISION_TEMPLATES = [
  {
    title: 'Strategic Freeze on Secondary Tracks',
    problem: 'Cognitive fragmentation across multiple concurrent technical tracks diluting sprint momentum.',
    context: 'Daily tasks were stalling across 3 parallel projects. Focus capacity was split and deadlines approached.',
    options: [
      'Maintain concurrent execution across all tracks at reduced velocity',
      'Enact a total Strategic Freeze on secondary projects and commit 100% capacity to core track',
      'Outsource low-level implementation to external contractors'
    ],
    frameworkUsed: 'Eisenhower Matrix & Pareto 80/20 Analysis',
    decision: 'Enact strict Strategic Freeze on secondary projects until core architecture reaches production milestone.',
    reason: '80% of leverage stems from the primary track. Context switching consumed an estimated 35% of cognitive energy.',
    expectedResult: 'Deliver core milestone ahead of schedule with zero architectural debt.',
    confidence: 90
  },
  {
    title: 'First Principles Tooling Selection',
    problem: 'Pressure to integrate heavyweight third-party framework vs lightweight bespoke solution.',
    context: 'Evaluating state management and external packages with high cognitive and maintenance overhead.',
    options: [
      'Adopt complex enterprise state management suite',
      'Handcraft minimal reactive context with strict zero-dependency footprint',
      'Postpone decision and use ad-hoc local state'
    ],
    frameworkUsed: 'First Principles Thinking',
    decision: 'Build lightweight, typed native store with zero external runtime dependencies.',
    reason: 'Minimizes bundle size, eliminates breaking dependency upgrades, and maintains 100% transparency.',
    expectedResult: 'Sub-millisecond reactivity with pristine predictability and auditability.',
    confidence: 95
  },
  {
    title: 'Working Backwards User Flow Contract',
    problem: 'Ambiguous feature scope leading to design revisions and scope creep.',
    context: 'Building a complex cross-module workflow without clear acceptance criteria.',
    options: [
      'Draft UI mockups iteratively in code',
      'Write customer-facing PR/FAQ and exact user journey contract before writing code',
      'Rely on informal mental models'
    ],
    frameworkUsed: 'Amazon Working Backwards (PR/FAQ)',
    decision: 'Write customer press release and exact FAQ document before writing any code.',
    reason: 'Forces immediate confrontation with edge cases and ensures user value remains crystal clear.',
    expectedResult: 'Zero scope ambiguity during execution and faster ship time.',
    confidence: 85
  }
];

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDecision
}) => {
  const [problem, setProblem] = useState('');
  const [context, setContext] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [frameworkUsed, setFrameworkUsed] = useState('Pareto 80/20 & Eisenhower');
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [confidence, setConfidence] = useState(85);
  const [reviewDate, setReviewDate] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [lesson, setLesson] = useState('');
  const [status, setStatus] = useState<string>('Open');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDecision) {
      setProblem(editingDecision.problem);
      setContext(editingDecision.context || '');
      setOptions(editingDecision.options && editingDecision.options.length > 0 ? editingDecision.options : ['', '']);
      setFrameworkUsed(editingDecision.frameworkUsed);
      setDecision(editingDecision.decision);
      setReason(editingDecision.reason || '');
      setExpectedResult(editingDecision.expectedResult);
      setConfidence(editingDecision.confidence ?? 85);
      setReviewDate(editingDecision.reviewDate ? editingDecision.reviewDate.split('T')[0] : '');
      setActualResult(editingDecision.actualResult || '');
      setLesson(editingDecision.lesson || '');
      setStatus(editingDecision.status || 'Open');
    } else {
      setProblem('');
      setContext('');
      setOptions(['', '']);
      setFrameworkUsed('Pareto 80/20 & Eisenhower');
      setDecision('');
      setReason('');
      setExpectedResult('');
      setConfidence(85);
      // Default review date: 14 days from now
      setReviewDate(addDays(getLocalDateString(), 14));
      setActualResult('');
      setLesson('');
      setStatus('Open');
    }
    setError('');
  }, [editingDecision, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof DECISION_TEMPLATES[0]) => {
    setProblem(tpl.problem);
    setContext(tpl.context);
    setOptions(tpl.options);
    setFrameworkUsed(tpl.frameworkUsed);
    setDecision(tpl.decision);
    setReason(tpl.reason);
    setExpectedResult(tpl.expectedResult);
    setConfidence(tpl.confidence);
    setError('');
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError('Please describe the problem or dilemma.');
      return;
    }
    if (!decision.trim()) {
      setError('Please state the finalized decision.');
      return;
    }
    if (!expectedResult.trim()) {
      setError('Please describe the expected result.');
      return;
    }

    const cleanedOptions = options.map(o => o.trim()).filter(Boolean);

    onSave({
      problem: problem.trim(),
      context: context.trim(),
      options: cleanedOptions.length > 0 ? cleanedOptions : ['Option A', 'Option B'],
      frameworkUsed: frameworkUsed.trim() || 'General Reasoning',
      decision: decision.trim(),
      reason: reason.trim(),
      expectedResult: expectedResult.trim(),
      confidence,
      reviewDate: reviewDate || new Date().toISOString(),
      actualResult: actualResult.trim() || undefined,
      lesson: lesson.trim() || undefined,
      status
    }, editingDecision?.id);

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
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>{editingDecision ? 'EDIT STRATEGIC DECISION RECORD' : 'LOG STRATEGIC DECISION'}</span>
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Record critical architectural choices, trade-offs, confidence & retrospective lessons
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
        {!editingDecision && (
          <div className="space-y-2 p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a059] font-bold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> STRATEGIC DECISION PRESETS
              </span>
              <span className="text-[9px] font-mono text-zinc-500">Click to autofill template</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DECISION_TEMPLATES.map(tpl => (
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
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Problem Statement / Core Dilemma *</label>
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. Cognitive fragmentation across 3 concurrent technical projects"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Context & Stakes</label>
            <textarea
              rows={2}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What triggered this decision? What were the risks of inaction or status quo?"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Options Considered */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Alternative Options Considered</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-bold"
              >
                <Plus className="h-3 w-3" /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 w-5">0{idx + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}...`}
                    className="flex-1 bg-[#07080c] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
                  />
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Framework and Final Decision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Framework Applied</label>
              <select
                value={frameworkUsed}
                onChange={(e) => setFrameworkUsed(e.target.value)}
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
              >
                <option value="Pareto 80/20 & Eisenhower">Pareto 80/20 & Eisenhower Matrix</option>
                <option value="First Principles Thinking">First Principles Thinking</option>
                <option value="Amazon Working Backwards (PR/FAQ)">Amazon Working Backwards (PR/FAQ)</option>
                <option value="OODA Loop (Observe-Orient-Decide-Act)">OODA Loop</option>
                <option value="5 Whys Root Cause Analysis">5 Whys Root Cause</option>
                <option value="SCAMPER Transformational Sandbox">SCAMPER Sandbox</option>
                <option value="Inversion Principle (Pre-Mortem)">Inversion Principle</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Review Date (Accountability Gate)</label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Chosen Decision *</label>
            <input
              type="text"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Enact strict Strategic Freeze on secondary projects..."
              className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Rationale & Core Leverage</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why this option over others? Where is the asymmetric leverage?"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Expected Result *</label>
              <input
                type="text"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                placeholder="e.g. Deliver core milestone 2 weeks early..."
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-zinc-400 font-medium">Confidence Rating</label>
                <span className="text-xs font-mono font-bold text-[#fef08a]">{confidence}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-[#c5a059] h-2 bg-[#141824] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Actual Result & Lesson (Especially for existing / reviewed decisions) */}
          <div className="p-3.5 bg-[#07080c] border border-white/5 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              RETROSPECTIVE OUTCOME (FILL UPON REVIEW)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">Actual Outcome</label>
                <input
                  type="text"
                  value={actualResult}
                  onChange={(e) => setActualResult(e.target.value)}
                  placeholder="e.g. Core milestone achieved 14 days early..."
                  className="w-full bg-[#0b0d13] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500">Compounding Lesson</label>
                <input
                  type="text"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="e.g. Singular focus creates compounding velocity."
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
              <span>{editingDecision ? 'Save Changes' : 'Record Decision'}</span>
              <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
