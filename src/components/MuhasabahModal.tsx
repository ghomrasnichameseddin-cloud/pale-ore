import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity } from '../types';
import { RubElHizbIcon } from './IslamicRpgDecorations';
import { 
  X, AlertTriangle, Shield, CheckCircle2, Flame, Heart, 
  MessageSquare, Sparkles, Scale, BookOpen, Clock, ArrowRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MuhasabahModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillWeaknessId?: string;
  prefillCategory?: MuhasabahCategory;
}

const CATEGORY_INFO: Record<MuhasabahCategory, { label: string; icon: any; color: string; desc: string }> = {
  Obligations: { 
    label: 'Obligations', 
    icon: Shield, 
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    desc: 'Missed or delayed mandatory commitments, prayer hesitations, broken covenants.'
  },
  Desires: { 
    label: 'Desires', 
    icon: Flame, 
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    desc: 'Indulgence, appetite lack of restraint, impulse spending, comfort trap.'
  },
  Speech: { 
    label: 'Speech', 
    icon: MessageSquare, 
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    desc: 'Idle chatter, harshness, arguing, sarcasm, vanity, complaining.'
  },
  Heart: { 
    label: 'Heart', 
    icon: Heart, 
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
    desc: 'Envy, arrogance, ungratefulness, despair, seeking human validation, insincerity.'
  },
  Rights: { 
    label: 'Rights', 
    icon: Scale, 
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    desc: 'Neglect of parents, family, colleagues, delayed dues, withholding kindness.'
  },
  'Wasted Potential': { 
    label: 'Wasted Potential', 
    icon: Clock, 
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    desc: 'Endless doomscrolling, procrastination, unstructured drift, laziness.'
  }
};

const SEVERITY_INFO: Record<MuhasabahSeverity, { penalty: number; label: string; color: string; badge: string }> = {
  Minor: { penalty: 100, label: 'Minor', color: 'text-blue-400', badge: 'bg-blue-950/50 border-blue-500/40 text-blue-300' },
  Moderate: { penalty: 200, label: 'Moderate', color: 'text-amber-400', badge: 'bg-amber-950/50 border-amber-500/40 text-amber-300' },
  Major: { penalty: 300, label: 'Major', color: 'text-orange-400', badge: 'bg-orange-950/50 border-orange-500/40 text-orange-300' },
  Severe: { penalty: 400, label: 'Severe', color: 'text-red-400', badge: 'bg-red-950/50 border-red-500/40 text-red-300' },
  Critical: { penalty: 500, label: 'Critical', color: 'text-rose-500', badge: 'bg-rose-950/60 border-rose-500/50 text-rose-200' }
};

export const MuhasabahModal: React.FC<MuhasabahModalProps> = ({
  isOpen,
  onClose,
  prefillWeaknessId,
  prefillCategory
}) => {
  const { state, addMuhasabahEntry, getTodayMuhasabahStats } = usePOS();
  const weaknesses = state.weaknesses || [];

  const [category, setCategory] = useState<MuhasabahCategory>(prefillCategory || 'Wasted Potential');
  const [severity, setSeverity] = useState<MuhasabahSeverity>('Moderate');
  const [title, setTitle] = useState('');
  const [cause, setCause] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedWeaknessId, setSelectedWeaknessId] = useState<string>(prefillWeaknessId || '');
  const [customWeaknessName, setCustomWeaknessName] = useState('');
  const [createRemedyQuest, setCreateRemedyQuest] = useState(true);
  const [recoveryPercent, setRecoveryPercent] = useState<number>(20);
  const [customRemedyName, setCustomRemedyName] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const stats = getTodayMuhasabahStats();
  const rawPenalty = SEVERITY_INFO[severity].penalty;
  const potentialDeduction = Math.min(rawPenalty, stats.dailyCapRemaining);
  const recoveredXP = Math.max(15, Math.round(rawPenalty * (recoveryPercent / 100)));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a title or summary for this slip.' });
      return;
    }
    if (!cause.trim()) {
      setFeedback({ type: 'error', message: 'Please identify the root trigger or emotional cause.' });
      return;
    }

    const res = addMuhasabahEntry({
      title: title.trim(),
      category,
      severity,
      cause: cause.trim(),
      reflection: reflection.trim(),
      createCorrectiveQuest: createRemedyQuest,
      correctiveQuestName: customRemedyName.trim() || undefined,
      recoveryPercentage: recoveryPercent,
      weaknessId: selectedWeaknessId || undefined,
      weaknessName: customWeaknessName.trim() || undefined
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        setTitle('');
        setCause('');
        setReflection('');
        setCustomWeaknessName('');
        setCustomRemedyName('');
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="muhasabah-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="glass-panel border border-[#c5a059]/30 rounded-xl bg-[#0a0c12]/95 max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden text-zinc-300"
        id="muhasabah-modal-container"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#c5a059]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3a2e12]/60 border border-[#c5a059]/40 text-[#fef08a]">
              <Scale className="h-5 w-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-zinc-100 tracking-wider flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                  MUHĀSABAH AUDIT
                </h3>
                <span className="text-[10px] font-mono uppercase bg-[#181308] border border-[#c5a059]/30 text-[#e5c875] px-2 py-0.5 rounded">
                  Self-Accountability
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Record → Reflect → Deduct XP → Issue Remedy Directive
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            id="close-muhasabah-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DAILY CAP NOTICE STRIP */}
        <div className="my-3 p-2.5 rounded-lg bg-[#11141d] border border-white/5 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Daily Penalty Cap:</span>
            <span className="text-amber-400 font-bold">−{stats.todayLostXP} / −500 XP</span>
          </div>
          <div className="text-[11px] text-zinc-400">
            {stats.dailyCapRemaining > 0 ? (
              <span className="text-emerald-400">{stats.dailyCapRemaining} XP headroom remaining today</span>
            ) : (
              <span className="text-rose-400 font-semibold">Max Daily Cap Reached (XP Loss Halted)</span>
            )}
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* CATEGORY SELECTOR */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider mb-1.5">
              1. Breach Realm / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_INFO) as MuhasabahCategory[]).map(catKey => {
                const info = CATEGORY_INFO[catKey];
                const Icon = info.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition ${
                      isSelected 
                        ? `${info.color} ring-1 ring-[#c5a059]/60 shadow-md` 
                        : 'bg-[#0f121a] border-white/10 hover:border-white/20 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{info.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-1 leading-tight">
                      {info.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEVERITY LEVEL & XP DEDUCTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                2. Penalty Severity & XP Impact
              </label>
              <span className="text-xs font-mono font-bold text-rose-400">
                −{potentialDeduction} XP {potentialDeduction < rawPenalty && `(Cap throttled from −${rawPenalty})`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(SEVERITY_INFO) as MuhasabahSeverity[]).map(sevKey => {
                const sInfo = SEVERITY_INFO[sevKey];
                const isSel = severity === sevKey;
                return (
                  <button
                    key={sevKey}
                    type="button"
                    onClick={() => setSeverity(sevKey)}
                    className={`py-2 px-1 rounded-lg border text-center font-mono flex flex-col items-center justify-center transition ${
                      isSel 
                        ? `${sInfo.badge} ring-1 ring-white/30 font-bold shadow-md` 
                        : 'bg-[#0f121a] border-white/10 hover:border-white/20 text-zinc-400'
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{sInfo.label}</span>
                    <span className="text-[10px] opacity-80">−{sInfo.penalty} XP</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SLIP SUMMARY / TITLE */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider mb-1">
              3. Slip Identification / Decree
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Delayed Fajr by 45 mins / Mindless doomscrolling feed after 11 PM..."
              className="w-full bg-[#0d1017] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 transition"
              id="muhasabah-title-input"
            />
          </div>

          {/* ROOT CAUSE & TRIGGER */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider mb-1">
              4. Root Cause / Trigger (Be Ruthlessly Honest)
            </label>
            <input 
              type="text"
              required
              value={cause}
              onChange={e => setCause(e.target.value)}
              placeholder="e.g., Evening cognitive fatigue + keeping phone on bedside without friction..."
              className="w-full bg-[#0d1017] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 transition"
              id="muhasabah-cause-input"
            />
          </div>

          {/* PERSONAL REFLECTION / RESOLUTION */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider mb-1">
              5. Personal Reflection & Concrete Defense Strategy
            </label>
            <textarea 
              rows={2}
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="What immediate boundary will be erected to guard against this exact trigger?"
              className="w-full bg-[#0d1017] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 transition resize-none"
              id="muhasabah-reflection-input"
            />
          </div>

          {/* WEAKNESS LINKER / CREATOR */}
          <div className="p-3 rounded-lg bg-[#11141d] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#fef08a] font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Link to Behavioral Weakness
              </span>
              <span className="text-[10px] text-zinc-400">Repeated slips form an active weakness</span>
            </div>

            {weaknesses.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedWeaknessId}
                  onChange={e => {
                    setSelectedWeaknessId(e.target.value);
                    if (e.target.value) setCustomWeaknessName('');
                  }}
                  className="w-full bg-[#0a0c12] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#c5a059]"
                >
                  <option value="">-- Choose Existing Weakness (or create new below) --</option>
                  {weaknesses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.category}) — {w.occurrenceCount} Slips [{w.status}]
                    </option>
                  ))}
                </select>
                {!selectedWeaknessId && (
                  <input
                    type="text"
                    value={customWeaknessName}
                    onChange={e => setCustomWeaknessName(e.target.value)}
                    placeholder="Or enter new Weakness Name (e.g. Uncontrolled Scrolling)..."
                    className="w-full bg-[#0a0c12] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#c5a059]"
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                value={customWeaknessName}
                onChange={e => setCustomWeaknessName(e.target.value)}
                placeholder="Weakness Name (e.g., Uncontrolled Scrolling, Tongue Harshness)..."
                className="w-full bg-[#0a0c12] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#c5a059]"
              />
            )}
          </div>

          {/* CORRECTIVE REMEDY DIRECTIVE CONFIG */}
          <div className="p-3 rounded-lg bg-[#0d141e] border border-cyan-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={createRemedyQuest}
                  onChange={e => setCreateRemedyQuest(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-[#c5a059] focus:ring-0 h-4 w-4"
                />
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Issue Corrective Restitution Quest
                </span>
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                +{recoveredXP} XP Recovery ({recoveryPercent}%)
              </span>
            </div>

            {createRemedyQuest && (
              <div className="space-y-2 pt-1 border-t border-cyan-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-400">Recovery Restitution:</span>
                  {[10, 20, 30].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setRecoveryPercent(pct)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                        recoveryPercent === pct 
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold' 
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {pct}% (+{Math.round(rawPenalty * (pct / 100))} XP)
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  value={customRemedyName}
                  onChange={e => setCustomRemedyName(e.target.value)}
                  placeholder={`Default: [REMEDY] Restitution: ${title || 'Remedy Directive'}`}
                  className="w-full bg-[#090b10] border border-cyan-500/20 focus:border-cyan-400 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none"
                />
              </div>
            )}
          </div>

          {feedback && (
            <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-zinc-400 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-[#c5a059] text-black font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center gap-2 shadow-lg shadow-amber-900/30"
              id="confirm-muhasabah-audit-btn"
            >
              <Scale className="h-4 w-4" />
              CONFIRM AUDIT (−{potentialDeduction} XP)
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
