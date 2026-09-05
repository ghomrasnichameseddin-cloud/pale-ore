import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity } from '../types';
import { RubElHizbIcon } from './IslamicRpgDecorations';
import { 
  X, AlertTriangle, Shield, ShieldCheck, CheckCircle2, Flame, Heart, 
  MessageSquare, Sparkles, Scale, BookOpen, Clock, ArrowRight,
  Lock, Coins, Zap, ShieldAlert, HeartHandshake, EyeOff, Radio,
  Repeat, Activity, TrendingUp, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSinRecurrence, SEVERITY_BASE_CONSEQUENCES } from '../utils/muhasabahRecurrence';
import { getLocalDateString } from '../initialState';

interface MuhasabahModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillWeaknessId?: string;
  prefillCategory?: MuhasabahCategory;
}

interface QuickSlipPreset {
  id: string;
  title: string;
  category: MuhasabahCategory;
  severity: MuhasabahSeverity;
  cause: string;
  kaffarahTitle: string;
  kaffarahType: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';
  icon: any;
  color: string;
}

const QUICK_SLIP_PRESETS: QuickSlipPreset[] = [
  {
    id: 'fajr-delay',
    title: 'Delayed Prayer / Fajr Hesitation',
    category: 'Obligations',
    severity: 'Moderate',
    cause: 'Late sleep without proper spiritual boundaries and immediate snooze reflex.',
    kaffarahTitle: '2 Rak\'ahs of Tawbah & Recite Surah Al-Mulk',
    kaffarahType: 'Prayer',
    icon: Shield,
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/25'
  },
  {
    id: 'feed-scrolling',
    title: 'Mindless Feed Doomscrolling',
    category: 'Wasted Potential',
    severity: 'Moderate',
    cause: 'Cognitive friction avoidance and opening algorithms without strict intention.',
    kaffarahTitle: 'Execute 1 Locked Deep Focus Sprint (25m)',
    kaffarahType: 'Focus',
    icon: Clock,
    color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/25'
  },
  {
    id: 'tongue-gossip',
    title: 'Harsh Tongue / Gossip / Idle Sarcasm',
    category: 'Speech',
    severity: 'Moderate',
    cause: 'Social seeking of laughs, unmonitored tongue, or reactionary irritation.',
    kaffarahTitle: '100x Istighfār & Sincere Secret Du\'a for Others',
    kaffarahType: 'Quran',
    icon: MessageSquare,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/25'
  },
  {
    id: 'gaze-dopamine',
    title: 'Uncontrolled Gaze / Dopamine Trap',
    category: 'Desires',
    severity: 'Major',
    cause: 'Late night solitude with unshielded screen device & micro-rationalizations.',
    kaffarahTitle: 'Dopamine Fast (45m Screen Detox) & $5 Sadaqah Charity',
    kaffarahType: 'Detox',
    icon: EyeOff,
    color: 'text-rose-400 border-rose-500/40 bg-rose-950/25'
  },
  {
    id: 'heart-arrogance',
    title: 'Hidden Pride, Envy or Resentment',
    category: 'Heart',
    severity: 'Major',
    cause: 'Comparing personal status, desiring public praise, or harboring ill-will.',
    kaffarahTitle: 'Perform 1 Hidden Good Deed with Zero Broadcast',
    kaffarahType: 'Service',
    icon: Heart,
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/25'
  },
  {
    id: 'rights-neglect',
    title: 'Neglect of Kin / Delayed Promise',
    category: 'Rights',
    severity: 'Moderate',
    cause: 'Self-absorption, impatience with family, or postponing promised duties.',
    kaffarahTitle: 'Direct Sincere Apology or Act of Physical Service',
    kaffarahType: 'Service',
    icon: HeartHandshake,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/25'
  }
];

const SEVERITY_CONSEQUENCES: Record<MuhasabahSeverity, {
  label: string;
  xpPenalty: number;
  coinFine: number;
  momentumPenalty: string;
  shopLocked: boolean;
  badge: string;
  desc: string;
}> = {
  Minor: {
    label: 'Minor',
    xpPenalty: 150,
    coinFine: 15,
    momentumPenalty: '−15% Momentum',
    shopLocked: false,
    badge: 'border-blue-500/40 bg-blue-950/40 text-blue-300',
    desc: 'Momentary slip promptly noticed.'
  },
  Moderate: {
    label: 'Moderate',
    xpPenalty: 300,
    coinFine: 35,
    momentumPenalty: '−35% Momentum',
    shopLocked: false,
    badge: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    desc: 'Noticeable lapse in discipline or routine.'
  },
  Major: {
    label: 'Major',
    xpPenalty: 500,
    coinFine: 75,
    momentumPenalty: 'Momentum Reset (0%)',
    shopLocked: true,
    badge: 'border-orange-500/40 bg-orange-950/40 text-orange-300',
    desc: 'Significant violation. Shop locked until Kaffārah complete.'
  },
  Severe: {
    label: 'Severe',
    xpPenalty: 750,
    coinFine: 125,
    momentumPenalty: 'Momentum Reset (0%)',
    shopLocked: true,
    badge: 'border-red-500/50 bg-red-950/50 text-red-300',
    desc: 'Heavy boundary breach. Shop locked + Attribute penalty.'
  },
  Critical: {
    label: 'Critical',
    xpPenalty: 1000,
    coinFine: 250,
    momentumPenalty: 'Momentum Reset (0%)',
    shopLocked: true,
    badge: 'border-rose-500/60 bg-rose-950/60 text-rose-200',
    desc: 'Emergency spiritual lockdown. Full XP loss cap applied.'
  }
};

export const MuhasabahModal: React.FC<MuhasabahModalProps> = ({
  isOpen,
  onClose,
  prefillWeaknessId,
  prefillCategory
}) => {
  const { state, addMuhasabahEntry, getTodayMuhasabahStats } = usePOS();
  const weaknesses = state.weaknesses || [];

  // Form states
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fajr-delay');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MuhasabahCategory>(prefillCategory || 'Obligations');
  const [severity, setSeverity] = useState<MuhasabahSeverity>('Moderate');
  const [cause, setCause] = useState('');
  const [kaffarahTitle, setKaffarahTitle] = useState('');
  const [selectedWeaknessId, setSelectedWeaknessId] = useState<string>(prefillWeaknessId || '');
  const [isExempt, setIsExempt] = useState<boolean>(false);
  const [exemptionReason, setExemptionReason] = useState<string>('Unintentional Sleep / Forgetfulness (نوم / نسيان)');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize preset selections
  useEffect(() => {
    if (!isCustomMode && selectedPresetId) {
      const preset = QUICK_SLIP_PRESETS.find(p => p.id === selectedPresetId);
      if (preset) {
        setTitle(preset.title);
        setCategory(preset.category);
        setSeverity(preset.severity);
        setCause(preset.cause);
        setKaffarahTitle(preset.kaffarahTitle);
      }
    }
  }, [selectedPresetId, isCustomMode]);

  // Handle prefilled category
  useEffect(() => {
    if (prefillCategory) {
      const matchingPreset = QUICK_SLIP_PRESETS.find(p => p.category === prefillCategory);
      if (matchingPreset) {
        setSelectedPresetId(matchingPreset.id);
        setIsCustomMode(false);
      } else {
        setIsCustomMode(true);
        setCategory(prefillCategory);
      }
    }
  }, [prefillCategory]);

  const stats = getTodayMuhasabahStats();
  const currentSysDate = state.systemDate || getLocalDateString();
  const consequence = SEVERITY_CONSEQUENCES[severity];
  const baseConsequences = SEVERITY_BASE_CONSEQUENCES[severity] || SEVERITY_BASE_CONSEQUENCES.Moderate;

  // Recurrence Analysis: analyzes whether this sin is recurring (more than once a day, everyday, every two days, etc.)
  const recurrenceAnalysis = useMemo(() => {
    if (isExempt || !title.trim()) return null;
    const selectedWeakness = weaknesses.find(w => w.id === selectedWeaknessId);
    return analyzeSinRecurrence({
      title: title.trim(),
      category,
      severity,
      weaknessId: selectedWeaknessId || null,
      weaknessName: selectedWeakness?.name || null,
      targetDate: currentSysDate,
      allEntries: state.muhasabahEntries || [],
      weaknesses: state.weaknesses || []
    });
  }, [title, category, severity, selectedWeaknessId, weaknesses, state.systemDate, state.muhasabahEntries, isExempt, currentSysDate]);

  const baseHpLoss = isExempt ? 0 : baseConsequences.baseHp;
  const baseCoinFine = isExempt ? 0 : baseConsequences.baseCoins;
  const baseXpPenalty = isExempt ? 0 : consequence.xpPenalty;

  const actualMultiplier = recurrenceAnalysis?.multiplier || 1.0;
  const actualHpLoss = isExempt ? 0 : (recurrenceAnalysis ? recurrenceAnalysis.escalatedHpLoss : baseHpLoss);
  const actualCoinFine = isExempt ? 0 : (recurrenceAnalysis ? recurrenceAnalysis.escalatedCoinFine : baseCoinFine);
  const actualXpDeduction = isExempt ? 0 : (recurrenceAnalysis ? recurrenceAnalysis.escalatedXpPenalty : baseXpPenalty);

  const currentHp = stats.currentHp ?? (state.profile.hp ?? 100);
  const maxHp = stats.maxHp ?? (state.profile.maxHp ?? 100);
  const projectedHp = Math.max(0, currentHp - actualHpLoss);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please specify the slip summary.' });
      return;
    }
    if (!cause.trim() && !isExempt) {
      setFeedback({ type: 'error', message: 'Please identify the root cause trigger.' });
      return;
    }

    const res = addMuhasabahEntry({
      title: title.trim(),
      category,
      severity,
      cause: isExempt ? `[EXEMPTION] ${exemptionReason}` : cause.trim(),
      isExempt,
      exemptionReason: isExempt ? exemptionReason : undefined,
      createCorrectiveQuest: !isExempt,
      correctiveQuestName: isExempt ? undefined : (kaffarahTitle.trim() || undefined),
      weaknessId: isExempt ? undefined : (selectedWeaknessId || undefined)
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="muhasabah-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        className="glass-panel border border-[var(--border-strong)] rounded-2xl bg-[#0b0d13]/98 max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden text-zinc-300"
        id="muhasabah-modal-container"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] shadow-inner">
              <Scale className="h-5 w-5 text-[var(--accent-bright)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-zinc-100 tracking-wider flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                  MUHĀSABAH AUDIT
                </h3>
                <span className="text-[10px] font-mono uppercase bg-[var(--bg-void)] border border-[var(--border-accent)] text-[var(--accent-highlight)] px-2 py-0.5 rounded-full font-bold">
                  Self-Accountability
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Introspective Habit Review &amp; Friction Triage
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

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-3.5 pr-1">
          {/* SAFEGUARD DISCLAIMER BANNER */}
          <div className="p-3 bg-[var(--accent-surface)] border border-[var(--border-accent)] rounded-xl flex items-start gap-2.5 text-xs text-[var(--accent-highlight)]">
            <ShieldCheck className="h-4 w-4 text-[var(--accent-bright)] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[var(--accent-highlight)]">
                &ldquo;XP is an in-app motivational measure. It does not represent Allah&apos;s reward, hasanat, or ajr. The true reward of worship belongs to Allah alone.&rdquo;
              </p>
              <p className="text-[10.5px] text-zinc-400">
                In-app penalties are secondary habit-friction tools for self-discipline, never divine punishment.
              </p>
            </div>
          </div>

          {/* EXEMPTION / UNAVOIDABLE EXCUSE TOGGLE */}
          <div className="p-3 bg-zinc-950/80 border border-cyan-500/30 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Lawful Exemption / Unavoidable Excuse (عذر شرعي)
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isExempt}
                  onChange={e => setIsExempt(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                />
                <span className="text-xs font-mono text-zinc-300">
                  {isExempt ? 'Exemption Active (0 Penalty)' : 'Standard Self-Audit'}
                </span>
              </label>
            </div>

            {isExempt && (
              <div className="space-y-2 pt-1 border-t border-cyan-500/20 text-xs">
                <p className="text-[11px] text-cyan-200 font-sans leading-relaxed">
                  In Islamic guidance, unintentional omissions due to sleep, forgetfulness, illness, travel hardship, or lawful exemptions carry no sin and incur zero in-app penalty.
                </p>
                <select
                  value={exemptionReason}
                  onChange={e => setExemptionReason(e.target.value)}
                  className="w-full bg-[#080b12] border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 outline-none"
                >
                  <option value="Unintentional Sleep / Forgetfulness (نوم / نسيان)">Unintentional Sleep or Forgetfulness (نوم / نسيان)</option>
                  <option value="Sickness / Physical Inability (مرض / عجز)">Sickness / Physical Inability (مرض / عجز)</option>
                  <option value="Lawful Travel / Hardship (سفر / مشقة)">Lawful Travel / Hardship (سفر / مشقة)</option>
                  <option value="Menses / Postnatal Exemption (عذر شرعي للنساء)">Menses / Postnatal Exemption (عذر شرعي للنساء)</option>
                  <option value="Unforeseen Urgent Emergency (ظرف طارئ)">Unforeseen Urgent Emergency (ظرف طارئ)</option>
                </select>
              </div>
            )}
          </div>
          {/* STEP 1: SELECT SLIP (1-TAP PRESETS OR CUSTOM) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--accent-bright)] text-black text-[10px] font-bold flex items-center justify-center">1</span>
                Identify the Slip
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(!isCustomMode);
                  if (!isCustomMode) {
                    setTitle('');
                    setCause('');
                    setKaffarahTitle('');
                  }
                }}
                className="text-xs font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-1"
              >
                {isCustomMode ? '← Use Quick Presets' : 'Custom Slip Entry →'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_SLIP_PRESETS.map(preset => {
                  const Icon = preset.icon;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                        isSelected 
                          ? `${preset.color} ring-1 ring-[var(--border-accent)] shadow-lg` 
                          : 'bg-[#0f121a] border-white/10 hover:border-white/20 text-zinc-400'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-100 truncate">{preset.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-zinc-300">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {preset.cause}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-xl bg-[#0e111a] border border-white/10">
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Slip Summary (e.g. Delayed Asr prayer by 30 mins)..."
                  className="w-full bg-[#08090d] border border-white/15 focus:border-[var(--border-accent)] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                />
                <input 
                  type="text"
                  required
                  value={cause}
                  onChange={e => setCause(e.target.value)}
                  placeholder="Root Cause / Trigger (e.g. Phone notifications distraction)..."
                  className="w-full bg-[#08090d] border border-white/15 focus:border-[var(--border-accent)] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                />
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'] as MuhasabahCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                        category === cat ? 'bg-[var(--accent-surface)] border-[var(--border-accent)] text-[var(--accent-highlight)] font-bold' : 'bg-black/30 border-white/5 text-zinc-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RECURRING SIN DETECTION & AUTOMATIC PENALTY ESCALATION BANNER */}
          {recurrenceAnalysis && recurrenceAnalysis.isRecurring && !isExempt && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-red-950/20 to-black/60 shadow-lg shadow-rose-950/20 space-y-2.5"
              id="muhasabah-recurring-sin-banner"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                        {recurrenceAnalysis.cadenceLabel}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-900/60 border border-rose-500/40 text-rose-200 font-bold">
                        {recurrenceAnalysis.multiplier.toFixed(2)}x Escalation
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 font-mono">
                      Tier {recurrenceAnalysis.escalationTier} Behavioral Pattern • {recurrenceAnalysis.matchedOccurrencesCount} matches detected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                    Penalties Amplified
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-200">
                    +{Math.round((recurrenceAnalysis.multiplier - 1) * 100)}% compounding
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-rose-200/90 leading-relaxed font-sans">
                {recurrenceAnalysis.reason}
              </p>

              {/* Consequence Escalation Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-rose-500/20 text-xs font-mono">
                <div className="p-2 rounded-lg bg-black/40 border border-rose-500/30">
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-400" />
                    <span>HP Loss</span>
                  </div>
                  <div className="text-sm font-bold text-rose-400 flex items-baseline gap-1 mt-0.5">
                    <span>−{actualHpLoss} HP</span>
                    <span className="text-[10px] line-through text-zinc-500">−{baseHpLoss}</span>
                  </div>
                  <span className="text-[9px] text-rose-300/80">Soul Vitality drain</span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-amber-500/30">
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-400" />
                    <span>Treasury Fine</span>
                  </div>
                  <div className="text-sm font-bold text-amber-400 flex items-baseline gap-1 mt-0.5">
                    <span>−{actualCoinFine} 🪙</span>
                    <span className="text-[10px] line-through text-zinc-500">−{baseCoinFine}</span>
                  </div>
                  <span className="text-[9px] text-amber-300/80">Imperial Coin fine</span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-red-500/30">
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-400" />
                    <span>Discipline XP</span>
                  </div>
                  <div className="text-sm font-bold text-orange-400 flex items-baseline gap-1 mt-0.5">
                    <span>−{actualXpDeduction} XP</span>
                    <span className="text-[10px] line-through text-zinc-500">−{baseXpPenalty}</span>
                  </div>
                  <span className="text-[9px] text-orange-300/80">Friction penalty</span>
                </div>
              </div>

              {/* Health Bar Forecast */}
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-cyan-400" />
                  Soul Health Forecast:
                </span>
                <span className="font-bold text-zinc-200">
                  {currentHp} HP ➔ <span className={projectedHp <= 20 ? 'text-rose-400 font-extrabold' : 'text-amber-400'}>{projectedHp} / {maxHp} HP</span>
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: WEIGH SEVERITY & CONSEQUENCES */}
          <div>
            <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--accent-bright)] text-black text-[10px] font-bold flex items-center justify-center">2</span>
                Determine Consequence Weight (Wazn)
              </span>
              <span className="text-xs text-rose-400 font-bold font-mono">
                {isExempt ? '0 Penalty' : `−${actualHpLoss} HP • −${actualCoinFine} Coins • −${actualXpDeduction} XP`}
              </span>
            </label>

            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(SEVERITY_CONSEQUENCES) as MuhasabahSeverity[]).map(sevKey => {
                const s = SEVERITY_CONSEQUENCES[sevKey];
                const baseC = SEVERITY_BASE_CONSEQUENCES[sevKey];
                const isSelected = severity === sevKey;
                const previewHp = Math.round(baseC.baseHp * actualMultiplier);
                const previewCoins = Math.round(baseC.baseCoins * actualMultiplier);
                return (
                  <button
                    key={sevKey}
                    type="button"
                    onClick={() => setSeverity(sevKey)}
                    className={`py-2 px-1 rounded-xl border font-mono text-center flex flex-col items-center justify-center transition ${
                      isSelected 
                        ? `${s.badge} ring-1 ring-[var(--border-accent)] shadow-lg font-bold scale-[1.02]` 
                        : 'bg-[#0e111a] border-white/10 hover:border-white/20 text-zinc-400'
                    }`}
                  >
                    <span className="text-xs font-bold">{s.label}</span>
                    <span className="text-[10px] text-rose-400 font-semibold">−{previewHp} HP</span>
                    <span className="text-[9px] text-[var(--accent-bright)]">−{previewCoins} 🪙</span>
                  </button>
                );
              })}
            </div>

            {/* Consequence Impact Preview Strip */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#090b10] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-rose-400 font-bold">
                  <Heart className="h-3.5 w-3.5" />
                  <span>−{actualHpLoss} HP</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--accent-bright)]">
                  <Coins className="h-3.5 w-3.5" />
                  <span>−{actualCoinFine} Coins Fine</span>
                </div>
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-3.5 w-3.5" />
                  <span>−{actualXpDeduction} XP</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{consequence.momentumPenalty}</span>
                </div>
              </div>
              {consequence.shopLocked && (
                <div className="flex items-center gap-1 text-rose-300 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-[10px]">
                  <Lock className="h-3 w-3" />
                  Shop Locked until Kaffārah Done
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: SACRED KAFFĀRAH RESTITUTION */}
          <div>
            <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--accent-bright)] text-black text-[10px] font-bold flex items-center justify-center">3</span>
                Sacred Kaffārah Restitution (Unlocks Equilibrium)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                +45–60 XP Restitution
              </span>
            </label>

            <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d161c] to-[#0a1215] border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <input 
                  type="text"
                  required
                  value={kaffarahTitle}
                  onChange={e => setKaffarahTitle(e.target.value)}
                  placeholder="Restitution Action (e.g., 2 Rak'ahs of Tawbah & Al-Mulk)..."
                  className="w-full bg-[#05090d] border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-cyan-200 outline-none placeholder:text-zinc-600 font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                Completing this directive fulfills your penance, restores spiritual equilibrium, and unlocks Imperial Shop perks.
              </p>
            </div>
          </div>

          {/* OPTIONAL WEAKNESS LINKER */}
          {weaknesses.length > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e111a] border border-white/10 text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                Link to Chain:
              </span>
              <select
                value={selectedWeaknessId}
                onChange={e => setSelectedWeaknessId(e.target.value)}
                className="bg-[#07090e] border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-[var(--border-accent)]"
              >
                <option value="">-- No specific chain --</option>
                {weaknesses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.occurrenceCount} slips)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* FEEDBACK BANNER */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-200' 
                : 'bg-rose-950/90 border border-rose-500/50 text-rose-200'
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
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--border-strong)] via-[var(--accent-bright)] to-[var(--border-strong)] text-[var(--bg-void)] font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center gap-2 shadow-xl shadow-black/50"
              id="confirm-muhasabah-audit-btn"
            >
              <Scale className="h-4 w-4" />
              {isExempt 
                ? 'RECORD LAWFUL EXEMPTION (0 PENALTY)' 
                : recurrenceAnalysis?.isRecurring 
                  ? `COMMIT AUDIT (−${actualHpLoss} HP, −${actualCoinFine} 🪙, −${actualXpDeduction} XP • ${recurrenceAnalysis.multiplier.toFixed(2)}x)` 
                  : `COMMIT AUDIT (−${actualHpLoss} HP, −${actualCoinFine} 🪙, −${actualXpDeduction} XP)`
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
