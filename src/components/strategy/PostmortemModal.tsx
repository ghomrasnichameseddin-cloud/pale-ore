import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { StrategicPostmortem } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface PostmortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postmortem: Omit<StrategicPostmortem, 'id' | 'createdAt'>, existingId?: string) => void;
  editingPostmortem?: StrategicPostmortem | null;
}

const POSTMORTEM_TEMPLATES = [
  {
    title: 'Campaign Milestone Delivery Delayed',
    event: 'Quarterly Systems Deployment Delayed by 12 Days',
    expectedOutcome: 'Ship release build with complete automated test suite by end of Month 2.',
    actualOutcome: 'Shipped 12 days late due to unverified external dependencies and mid-sprint scope additions.',
    impact: 'Delayed follow-up onboarding campaign and compressed weekly rest schedule.',
    timeline: 'Week 2: Scope expanded; Week 4: External dependency broke; Week 7: Late-night refactoring.',
    failurePoint: 'Accepting unvalidated dependency assumptions and late feature requests without pushing deadlines.',
    rootCause: '5 Whys analysis showed absence of a hard architectural feature freeze gate.',
    correctiveAction: 'Enforce mandatory dependency spikes in Week 1 of every campaign; enforce hard feature freeze 10 days before target date.',
    lesson: 'A target date without an intentional buffer and hard freeze gate is an aspiration, not an engineering plan.',
    codifiedSopOrDoctrine: 'SOP-04: Campaign Milestone & Dependency Validation Protocol'
  },
  {
    title: 'Mid-Sprint Focus Energy Depletion',
    event: 'Sprint Day 4 & 5 Deep Work Collapse',
    expectedOutcome: 'Complete 3 primary engineering quests per day (6 total over Thursday-Friday).',
    actualOutcome: 'Completed only 1 quest; logged 120 minutes of fatigue and rest bank deficit.',
    impact: 'Sprint rolled over into weekend, elevating stress and guilt.',
    timeline: 'Wednesday night: Late screen usage until 01:30 AM; Thursday: Missed Fajr on-time, sluggish focus; Friday: Accumulated cognitive debt.',
    failurePoint: 'Violated evening shutdown wind-down protocol.',
    rootCause: 'No physical barrier or automation preventing screen access after Isha prayer.',
    correctiveAction: 'Activate hardware phone locker at 22:00 PM; strictly enforce wind-down routine.',
    lesson: 'Discipline in the morning is created by the environment designed the previous night.',
    codifiedSopOrDoctrine: 'Doctrine: Protect the Golden Hours'
  },
  {
    title: 'Scope Creep on Unstructured Directive',
    event: 'Simple 30-Minute Task Ballooned into 4-Hour Refactor',
    expectedOutcome: 'Fix user profile avatar alignment in 30 minutes.',
    actualOutcome: 'Spent 4 hours rewriting entire navigation bar and theming system, abandoning scheduled tasks.',
    impact: 'Missed core daily priority quest and derailed daily sacred XP goals.',
    timeline: '10:00 AM: Start CSS tweak; 10:45 AM: Spot unrelated theme bug; 12:00 PM: Deep rabbit hole in index.css.',
    failurePoint: 'Permitted rabbit-hole exploration without logging a separate backlog ticket.',
    rootCause: 'Lack of an immutable rule mandating that discoveries during a quest become new backlog items, never in-flight additions.',
    correctiveAction: 'Implement Zero Scope Expansion rule: Any refactor >15 min must be logged as a separate quest before touching code.',
    lesson: 'Every side quest embarked upon without an explicit decree steals life capital from your primary destiny.',
    codifiedSopOrDoctrine: 'SOP-05: Defect Logging & Scope Containment Rule'
  }
];

export const PostmortemModal: React.FC<PostmortemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPostmortem
}) => {
  const [title, setTitle] = useState('');
  const [event, setEvent] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [actualOutcome, setActualOutcome] = useState('');
  const [impact, setImpact] = useState('');
  const [timeline, setTimeline] = useState('');
  const [failurePoint, setFailurePoint] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [lesson, setLesson] = useState('');
  const [codifiedSopOrDoctrine, setCodifiedSopOrDoctrine] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingPostmortem) {
      setTitle(editingPostmortem.title || '');
      setEvent(editingPostmortem.event);
      setExpectedOutcome(editingPostmortem.expectedOutcome);
      setActualOutcome(editingPostmortem.actualOutcome);
      setImpact(editingPostmortem.impact || '');
      setTimeline(editingPostmortem.timeline || '');
      setFailurePoint(editingPostmortem.failurePoint || '');
      setRootCause(editingPostmortem.rootCause);
      setCorrectiveAction(editingPostmortem.correctiveAction);
      setLesson(editingPostmortem.lesson || '');
      setCodifiedSopOrDoctrine(editingPostmortem.codifiedSopOrDoctrine || editingPostmortem.codifiedSOP || '');
    } else {
      setTitle('');
      setEvent('');
      setExpectedOutcome('');
      setActualOutcome('');
      setImpact('');
      setTimeline('');
      setFailurePoint('');
      setRootCause('');
      setCorrectiveAction('');
      setLesson('');
      setCodifiedSopOrDoctrine('');
    }
    setError('');
  }, [editingPostmortem, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof POSTMORTEM_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setEvent(tpl.event);
    setExpectedOutcome(tpl.expectedOutcome);
    setActualOutcome(tpl.actualOutcome);
    setImpact(tpl.impact);
    setTimeline(tpl.timeline);
    setFailurePoint(tpl.failurePoint);
    setRootCause(tpl.rootCause);
    setCorrectiveAction(tpl.correctiveAction);
    setLesson(tpl.lesson);
    setCodifiedSopOrDoctrine(tpl.codifiedSopOrDoctrine);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.trim()) {
      setError('Please identify the event or failure incident.');
      return;
    }
    if (!rootCause.trim()) {
      setError('Please state the root cause derived from 5 Whys analysis.');
      return;
    }
    if (!correctiveAction.trim()) {
      setError('Please state the corrective action.');
      return;
    }

    onSave({
      title: title.trim() || undefined,
      event: event.trim(),
      expectedOutcome: expectedOutcome.trim() || 'Executed on schedule with intended quality',
      actualOutcome: actualOutcome.trim() || 'Friction or deviation encountered',
      impact: impact.trim() || 'Temporary operational friction',
      timeline: timeline.trim() || 'Identified during retrospective',
      failurePoint: failurePoint.trim() || 'Operational breakdown',
      rootCause: rootCause.trim(),
      correctiveAction: correctiveAction.trim(),
      lesson: lesson.trim() || undefined,
      codifiedSopOrDoctrine: codifiedSopOrDoctrine.trim() || undefined,
      codifiedSOP: codifiedSopOrDoctrine.trim() || undefined
    }, editingPostmortem?.id);

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
            <span className="p-2 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-500/40">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>{editingPostmortem ? 'EDIT POSTMORTEM AUDIT' : 'CONDUCT ROOT-CAUSE POSTMORTEM'}</span>
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Transform mistakes into permanent wisdom • 5-Whys root cause, failure vectors & SOP mitigation
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
        {!editingPostmortem && (
          <div className="space-y-2 p-3 bg-[#07080c] border border-rose-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> RETROSPECTIVE INCIDENT PRESETS
              </span>
              <span className="text-[9px] font-mono text-zinc-500">Click to autofill template</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POSTMORTEM_TEMPLATES.map(tpl => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-[#141824] hover:bg-[#1f2438] text-zinc-300 hover:text-rose-300 border border-white/5 hover:border-rose-500/40 transition text-left"
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
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Postmortem Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sprint 4 Slippage"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Incident / Event Name *</label>
              <input
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="e.g. Quarterly Systems Deployment Delayed by 12 Days"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Expected Outcome</label>
              <textarea
                rows={2}
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="What was originally planned to happen?"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Actual Outcome</label>
              <textarea
                rows={2}
                value={actualOutcome}
                onChange={(e) => setActualOutcome(e.target.value)}
                placeholder="What actually took place?"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Failure Point / Primary Vector</label>
              <input
                type="text"
                value={failurePoint}
                onChange={(e) => setFailurePoint(e.target.value)}
                placeholder="e.g. Accepting unvalidated dependency assumptions"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Downstream Impact</label>
              <input
                type="text"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="e.g. Delayed onboarding campaign, elevated stress"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">5-Whys Root Cause Analysis *</label>
            <textarea
              rows={3}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Why did this occur? (Drill down 5 levels to uncover systemic failure rather than surface human error)"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Permanent Corrective Action *</label>
            <textarea
              rows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="What structural system change or guardrail will prevent this from EVER happening again?"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Compounded Life Lesson</label>
              <input
                type="text"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="e.g. A target date without a buffer is an aspiration"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Codified SOP or Doctrine Link</label>
              <input
                type="text"
                value={codifiedSopOrDoctrine}
                onChange={(e) => setCodifiedSopOrDoctrine(e.target.value)}
                placeholder="e.g. SOP-04: Campaign Milestone Validation"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
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
              className="px-5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg"
            >
              <span>{editingPostmortem ? 'Save Audit' : 'Inscribe Postmortem'}</span>
              <RubElHizbIcon className="h-3.5 w-3.5 text-rose-400" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
