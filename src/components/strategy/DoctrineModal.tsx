import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Doctrine } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface DoctrineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Omit<Doctrine, 'id' | 'createdAt'>, existingId?: string) => void;
  editingDoctrine?: Doctrine | null;
}

const DOCTRINE_TEMPLATES = [
  {
    name: 'Stability Over Intensity',
    category: 'Execution',
    rule: 'When execution collapses or fatigue strikes, reduce daily scope before abandoning the system. Consistency beats heroic erratic sprints.',
    appliesTo: 'All Campaigns & Daily Directives',
    origin: 'Strategic Review & Muḥāsabah'
  },
  {
    name: 'Protect the Golden Hours',
    category: 'Temporal',
    rule: 'The early morning window after Fajr is sacred focus capital. No passive media, open communications, or administrative chores are permitted.',
    appliesTo: 'Focus & Energy Allocation',
    origin: 'Spiritual & Focus Audit'
  },
  {
    name: 'First Principles Before Scaling',
    category: 'Architecture',
    rule: 'Do not automate, outsource, or prematurely scale an unproven hypothesis. Validate manually and repeatedly first.',
    appliesTo: 'Projects & System Architecture',
    origin: 'Systems Engineering Audit'
  },
  {
    name: 'Zero Ambiguity Directives',
    category: 'Planning',
    rule: 'A quest without a concrete, unmistakable finish line is an anxiety trigger. Deconstruct and split until the next physical action takes under 60 minutes.',
    appliesTo: 'Daily Directives & Quests',
    origin: 'Execution Postmortem'
  },
  {
    name: 'Fail Fast, Codify Permanently',
    category: 'Knowledge',
    rule: 'Every operational friction or failed directive must produce a tangible Lesson or an SOP update within 48 hours. Unrecorded failures repeat indefinitely.',
    appliesTo: 'Operations & Postmortems',
    origin: 'Sanctum Operating Doctrine'
  }
];

export const DoctrineModal: React.FC<DoctrineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDoctrine
}) => {
  const [name, setName] = useState('');
  const [rule, setRule] = useState('');
  const [appliesTo, setAppliesTo] = useState('');
  const [origin, setOrigin] = useState('');
  const [category, setCategory] = useState('Execution');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Deprecated'>('Active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDoctrine) {
      setName(editingDoctrine.name);
      setRule(editingDoctrine.rule);
      setAppliesTo(editingDoctrine.appliesTo);
      setOrigin(editingDoctrine.origin);
      setCategory(editingDoctrine.category || 'Execution');
      setStatus(editingDoctrine.status);
    } else {
      setName('');
      setRule('');
      setAppliesTo('');
      setOrigin('');
      setCategory('Execution');
      setStatus('Active');
    }
    setError('');
  }, [editingDoctrine, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof DOCTRINE_TEMPLATES[0]) => {
    setName(tpl.name);
    setCategory(tpl.category);
    setRule(tpl.rule);
    setAppliesTo(tpl.appliesTo);
    setOrigin(tpl.origin);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a doctrine title.');
      return;
    }
    if (!rule.trim()) {
      setError('Please define the immutable rule or standard.');
      return;
    }

    onSave({
      name: name.trim(),
      rule: rule.trim(),
      appliesTo: appliesTo.trim() || 'General Operations',
      origin: origin.trim() || 'Strategic Review',
      category: category.trim() || 'Execution',
      status,
      updatedAt: new Date().toISOString()
    }, editingDoctrine?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl shadow-2xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>{editingDoctrine ? 'EDIT OPERATING DOCTRINE' : 'NEW OPERATING DOCTRINE'}</span>
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Inscribe non-negotiable operational principles, laws of execution & standards
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

        {/* Quick Templates if not editing */}
        {!editingDoctrine && (
          <div className="space-y-2 p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a059] font-bold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> FOUNDATIONAL DOCTRINE PRESETS
              </span>
              <span className="text-[9px] font-mono text-zinc-500">Click to autofill template</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DOCTRINE_TEMPLATES.map(tpl => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-[#141824] hover:bg-[#1f2438] text-zinc-300 hover:text-[#fef08a] border border-white/5 hover:border-[#c5a059]/40 transition text-left"
                >
                  {tpl.name}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Doctrine Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stability Over Intensity"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Domain Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
              >
                <option value="Execution">Execution (Discipline & Cadence)</option>
                <option value="Architecture">Architecture (Systems & Tech)</option>
                <option value="Planning">Planning (Directives & Scoping)</option>
                <option value="Temporal">Temporal (Focus, Energy & Rest)</option>
                <option value="Knowledge">Knowledge (SOPs & Learnings)</option>
                <option value="Spiritual">Spiritual (Niyyah & Sacred Baseline)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">
              Immutable Rule / Mandate *
            </label>
            <textarea
              rows={4}
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="State the non-negotiable law clearly. What is strictly forbidden? What is required when friction occurs?"
              className="w-full bg-[#07080c] border border-white/10 rounded-xl p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Applies To Scope</label>
              <input
                type="text"
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value)}
                placeholder="e.g. All Campaigns & Daily Directives"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 font-medium">Origin / Justification</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Postmortem on Sprint 4 Burnout"
                className="w-full bg-[#07080c] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 font-medium">Operational Status</label>
            <div className="flex gap-2">
              {(['Active', 'Draft', 'Deprecated'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition ${
                    status === st
                      ? st === 'Active' ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500 font-bold' :
                        st === 'Draft' ? 'bg-amber-950/70 text-amber-300 border-amber-500 font-bold' :
                        'bg-zinc-800 text-zinc-400 border-zinc-600 font-bold'
                      : 'bg-[#07080c] text-zinc-500 border-white/5 hover:text-zinc-300'
                  }`}
                >
                  {st}
                </button>
              ))}
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
              <span>{editingDoctrine ? 'Save Changes' : 'Inscribe Doctrine'}</span>
              <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
