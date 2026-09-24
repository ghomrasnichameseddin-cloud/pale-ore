import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity } from '../types';
import { RubElHizbIcon } from './IslamicRpgDecorations';
import { 
  X, AlertTriangle, Shield, ShieldCheck, CheckCircle2, Flame, Heart, 
  MessageSquare, Sparkles, Scale, BookOpen, Clock, ArrowRight,
  Lock, Coins, Zap, HeartHandshake, EyeOff,
  Repeat, Smartphone, Gamepad2, Tv, Coffee, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSinRecurrence, SEVERITY_BASE_CONSEQUENCES } from '../utils/muhasabahRecurrence';
import { getLocalDateString } from '../utils/dateUtils';

export type MuhasabahModalTab = 'slip' | 'wasted_time' | 'exemption';

export type DistractionSource = 
  | 'social_media' 
  | 'gaming' 
  | 'video_streaming' 
  | 'idle_chatting' 
  | 'procrastination' 
  | 'custom';

export type KaffarahMode = 'focus' | 'detox' | 'quran' | 'prayer' | 'sadaqah';

export interface MuhasabahModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MuhasabahModalTab;
  prefillWeaknessId?: string;
  prefillCategory?: MuhasabahCategory;
  onNavigateToQuests?: () => void;
}

interface QuickSlipPreset {
  id: string;
  title: string;
  category: MuhasabahCategory;
  severity: MuhasabahSeverity;
  cause: string;
  kaffarahTitle: string;
  kaffarahType: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';
  isTimeLoss?: boolean;
  defaultMinutes?: number;
  distractionSource?: DistractionSource;
  icon: React.ElementType;
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
    isTimeLoss: true,
    defaultMinutes: 45,
    distractionSource: 'social_media',
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

interface DistractionConfig {
  id: DistractionSource;
  labelEn: string;
  labelAr: string;
  defaultCategory: MuhasabahCategory;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const DISTRACTION_CONFIGS: Record<DistractionSource, DistractionConfig> = {
  social_media: {
    id: 'social_media',
    labelEn: 'Social Media & Feeds',
    labelAr: 'وسائل التواصل والإدمان الرقمي',
    defaultCategory: 'Desires',
    icon: Smartphone,
    color: 'text-rose-400',
    bgColor: 'bg-rose-950/30',
    borderColor: 'border-rose-500/30'
  },
  gaming: {
    id: 'gaming',
    labelEn: 'Excessive Gaming',
    labelAr: 'الألعاب والتسلية المفرطة',
    defaultCategory: 'Wasted Potential',
    icon: Gamepad2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/30',
    borderColor: 'border-purple-500/30'
  },
  video_streaming: {
    id: 'video_streaming',
    labelEn: 'Video Binge & Streaming',
    labelAr: 'مشاهدة المقاطع والمسلسلات',
    defaultCategory: 'Wasted Potential',
    icon: Tv,
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-500/30'
  },
  idle_chatting: {
    id: 'idle_chatting',
    labelEn: 'Idle Chatting & Debates',
    labelAr: 'اللغو والجدال والدردشة العبثية',
    defaultCategory: 'Speech',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/30',
    borderColor: 'border-cyan-500/30'
  },
  procrastination: {
    id: 'procrastination',
    labelEn: 'Sloth & Procrastination',
    labelAr: 'الكسل والمماطلة والتسويف',
    defaultCategory: 'Wasted Potential',
    icon: Coffee,
    color: 'text-orange-400',
    bgColor: 'bg-orange-950/30',
    borderColor: 'border-orange-500/30'
  },
  custom: {
    id: 'custom',
    labelEn: 'Other Distraction',
    labelAr: 'تشتت مخصص آخر',
    defaultCategory: 'Wasted Potential',
    icon: Compass,
    color: 'text-zinc-300',
    bgColor: 'bg-zinc-900/60',
    borderColor: 'border-zinc-700/50'
  }
};

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180];

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
    desc: 'Heavy boundary breach. Shop locked + Soul Vitality drain.'
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

const EXEMPTION_PRESETS = [
  { id: 'sleep', labelEn: 'Unintentional Sleep / Fatigue', labelAr: 'نوم غالب / إرهاق قاهر' },
  { id: 'forgetfulness', labelEn: 'Genuine Forgetfulness', labelAr: 'نسيان غير متعمد' },
  { id: 'sickness', labelEn: 'Unavoidable Sickness / Incapacity', labelAr: 'مرض / عجز جسدي' },
  { id: 'emergency', labelEn: 'Overwhelming Emergency', labelAr: 'ظرف طارئ قاهر' }
];

export const MuhasabahModal: React.FC<MuhasabahModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'slip',
  prefillWeaknessId,
  prefillCategory,
  onNavigateToQuests
}) => {
  const { state, addMuhasabahEntry, addTimeCredits, getTodayMuhasabahStats } = usePOS();
  const weaknesses = state.weaknesses || [];
  const currentRestBankBalance = state.profile.timeCredits ?? 60;

  // Unified Mode: 'standard_slip' vs 'shar_i_exemption'
  const [auditType, setAuditType] = useState<'standard' | 'exemption'>(
    initialTab === 'exemption' ? 'exemption' : 'standard'
  );

  // Core Incident State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fajr-delay');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MuhasabahCategory>(prefillCategory || 'Obligations');
  const [severity, setSeverity] = useState<MuhasabahSeverity>('Moderate');
  const [cause, setCause] = useState('');
  const [selectedWeaknessId, setSelectedWeaknessId] = useState<string>(prefillWeaknessId || '');

  // Integrated Time Squandered Section
  const [includeTimeLoss, setIncludeTimeLoss] = useState<boolean>(initialTab === 'wasted_time');
  const [selectedSource, setSelectedSource] = useState<DistractionSource>('social_media');
  const [customDistractionTitle, setCustomDistractionTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [debitFromRestBank, setDebitFromRestBank] = useState<boolean>(true);

  // Unified Kaffārah State
  const [kaffarahTitle, setKaffarahTitle] = useState('');
  const [createKaffarahQuest, setCreateKaffarahQuest] = useState<boolean>(true);

  // Exemption Specific State
  const [exemptionReason, setExemptionReason] = useState<string>(EXEMPTION_PRESETS[0].labelEn);

  // Submission Result / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    entryId: string;
    questName?: string;
    xpDeducted: number;
    hpLoss: number;
    coinsFine: number;
    timeDebited: number;
    isExempt: boolean;
  } | null>(null);

  // Synchronize on modal open or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setSubmissionResult(null);

      if (initialTab === 'exemption') {
        setAuditType('exemption');
        setTitle('Lawful Exemption / Honest Excuse');
        setCategory(prefillCategory || 'Obligations');
      } else if (initialTab === 'wasted_time') {
        setAuditType('standard');
        setIncludeTimeLoss(true);
        setSelectedPresetId('feed-scrolling');
        setCategory('Wasted Potential');
      } else {
        setAuditType('standard');
        if (prefillCategory) {
          setCategory(prefillCategory);
          const matchingPreset = QUICK_SLIP_PRESETS.find(p => p.category === prefillCategory);
          if (matchingPreset) {
            setSelectedPresetId(matchingPreset.id);
            setIsCustomMode(false);
          } else {
            setIsCustomMode(true);
          }
        }
      }
    }
  }, [isOpen, initialTab, prefillCategory]);

  // Load Preset Defaults
  useEffect(() => {
    if (auditType === 'standard' && !isCustomMode && selectedPresetId) {
      const preset = QUICK_SLIP_PRESETS.find(p => p.id === selectedPresetId);
      if (preset) {
        setTitle(preset.title);
        setCategory(preset.category);
        setSeverity(preset.severity);
        setCause(preset.cause);
        setKaffarahTitle(preset.kaffarahTitle);
        if (preset.isTimeLoss) {
          setIncludeTimeLoss(true);
          if (preset.defaultMinutes) setDurationMinutes(preset.defaultMinutes);
          if (preset.distractionSource) setSelectedSource(preset.distractionSource);
        }
      }
    }
  }, [selectedPresetId, isCustomMode, auditType]);

  const stats = getTodayMuhasabahStats();
  const currentSysDate = state.systemDate || getLocalDateString();
  const consequence = SEVERITY_CONSEQUENCES[severity];
  const baseConsequences = SEVERITY_BASE_CONSEQUENCES[severity] || SEVERITY_BASE_CONSEQUENCES.Moderate;

  // Recurrence Analysis for Standard Slips
  const recurrenceAnalysis = useMemo(() => {
    if (auditType !== 'standard' || !title.trim()) return null;
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
  }, [title, category, severity, selectedWeaknessId, weaknesses, state.systemDate, state.muhasabahEntries, auditType, currentSysDate]);

  // Calculated Consequences
  const actualMultiplier = recurrenceAnalysis?.multiplier || 1.0;
  const actualHpLoss = auditType === 'exemption' ? 0 : (recurrenceAnalysis ? recurrenceAnalysis.escalatedHpLoss : baseConsequences.baseHp);
  const actualCoinFine = auditType === 'exemption' ? 0 : (recurrenceAnalysis ? recurrenceAnalysis.escalatedCoinFine : baseConsequences.baseCoins);
  const actualXpDeduction = auditType === 'exemption' ? 0 : (recurrenceAnalysis ? recurrenceAnalysis.escalatedXpPenalty : consequence.xpPenalty);

  // Time Loss Extra Deductions
  const timeDebitMinutes = includeTimeLoss && debitFromRestBank ? durationMinutes : 0;
  const projectedRestBank = Math.max(0, currentRestBankBalance - timeDebitMinutes);

  if (!isOpen) return null;

  // Unified Submit Handler
  const handleUnifiedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a title or summary for this audit decree.' });
      return;
    }

    if (auditType === 'standard' && !cause.trim()) {
      setFeedback({ type: 'error', message: 'Please note the root trigger cause to reinforce future vigilance.' });
      return;
    }

    // Build Final Title & Cause
    let finalTitle = title.trim();
    let finalCause = cause.trim();

    if (auditType === 'exemption') {
      finalTitle = title.trim() || `Lawful Exemption: ${exemptionReason}`;
      finalCause = `[EXEMPTION] ${exemptionReason}. Honest human incapacity without willful neglect.`;
    } else if (includeTimeLoss) {
      const src = DISTRACTION_CONFIGS[selectedSource];
      const srcName = selectedSource === 'custom' && customDistractionTitle.trim() ? customDistractionTitle.trim() : src.labelEn;
      if (!finalTitle.includes(srcName)) {
        finalTitle = `${finalTitle} (${durationMinutes}m lost to ${srcName})`;
      }
      finalCause = `${finalCause} [Time loss: ${durationMinutes}m squandered to ${srcName}]`.trim();
    }

    // Inscribe Entry
    const res = addMuhasabahEntry({
      title: finalTitle,
      category,
      severity: auditType === 'exemption' ? 'Minor' : severity,
      cause: finalCause,
      isExempt: auditType === 'exemption',
      exemptionReason: auditType === 'exemption' ? exemptionReason : undefined,
      createCorrectiveQuest: auditType === 'standard' && createKaffarahQuest && Boolean(kaffarahTitle.trim()),
      correctiveQuestName: kaffarahTitle.trim() ? `[KAFFĀRAH] ${kaffarahTitle.trim()}` : undefined,
      weaknessId: selectedWeaknessId || undefined
    });

    if (res.success) {
      // Debit from Rest Bank if requested
      if (auditType === 'standard' && includeTimeLoss && debitFromRestBank && addTimeCredits) {
        addTimeCredits(
          -durationMinutes,
          `Distraction Overdraft: Lost ${durationMinutes}m to ${DISTRACTION_CONFIGS[selectedSource].labelEn}`,
          'manual_adjustment'
        );
      }

      setSubmissionResult({
        entryId: res.entryId,
        questName: kaffarahTitle.trim() ? `[KAFFĀRAH] ${kaffarahTitle.trim()}` : undefined,
        xpDeducted: actualXpDeduction,
        hpLoss: actualHpLoss,
        coinsFine: actualCoinFine,
        timeDebited: timeDebitMinutes,
        isExempt: auditType === 'exemption'
      });
    } else {
      setFeedback({ type: 'error', message: res.message || 'Audit inscription failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="muhasabah-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        className="glass-panel border border-[var(--border-strong,#c5a059)] rounded-2xl bg-[#0b0d13]/98 max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden text-zinc-300"
        id="muhasabah-modal-container"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle,rgba(197,160,89,0.2))] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-[#c5a059]/20 to-amber-600/10 border border-[#c5a059]/40 text-[#fef08a] shadow-inner">
              <Scale className="h-5 w-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-zinc-100 tracking-wider flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                  MUḤĀSABAH AUDIT &amp; TIME RECOVERY
                </h3>
                <span className="text-[10px] font-mono uppercase bg-amber-950/40 border border-[#c5a059]/40 text-[#fef08a] px-2 py-0.5 rounded-full font-bold">
                  مركز محاسبة النفس الموحد
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Unified Soul Audit, Habit Disruption &amp; Time Restitution Command Center
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            id="close-muhasabah-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* POST-SUBMISSION RESULT VIEW */}
        {submissionResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 overflow-y-auto py-6 space-y-4 text-center"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e181c] via-[#091116] to-[#04080b] border border-emerald-500/40 max-w-xl mx-auto space-y-4 text-left shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-emerald-200">
                    {submissionResult.isExempt ? 'Lawful Exemption Recorded' : 'Soul Audit Inscribed & Decreed!'}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    {submissionResult.isExempt 
                      ? 'Introspection logged with 0 penalties by Divine Mercy.' 
                      : 'Amānah restored. Your accountability ledger and Kaffārah are active.'}
                  </p>
                </div>
              </div>

              {!submissionResult.isExempt ? (
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2.5 font-mono text-xs">
                  {submissionResult.questName && (
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-zinc-400">Restitution Quest:</span>
                      <span className="font-bold text-emerald-300 truncate max-w-xs">{submissionResult.questName}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                      <span className="block text-[10px] text-zinc-400">HP Lost</span>
                      <span className="font-bold text-sm">−{submissionResult.hpLoss}</span>
                    </div>
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
                      <span className="block text-[10px] text-zinc-400">Treasury Fine</span>
                      <span className="font-bold text-sm">−{submissionResult.coinsFine} 🪙</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">
                      <span className="block text-[10px] text-zinc-400">Discipline XP</span>
                      <span className="font-bold text-sm">−{submissionResult.xpDeducted} XP</span>
                    </div>
                  </div>
                  {submissionResult.timeDebited > 0 && (
                    <div className="p-2 rounded bg-orange-950/30 border border-orange-500/30 text-orange-300 text-center">
                      <span className="font-bold">−{submissionResult.timeDebited}m debited from Rest Bank balance</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs font-mono space-y-1">
                  <p className="font-bold">🕊️ Full Mercy Exemption Applied</p>
                  <p className="text-[11px] text-zinc-400">
                    No XP lost, no HP vitality drained, no coin fines levied. Your moral momentum remains 100% intact.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSubmissionResult(null); onClose(); }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/5 transition cursor-pointer"
                >
                  Done &amp; Close
                </button>
                {onNavigateToQuests && submissionResult.questName && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToQuests();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <span>View in Quests</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* UNIFIED AUDIT FORM */
          <form onSubmit={handleUnifiedSubmit} className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
            
            {/* 1. TOP CLASSIFICATION TOGGLE: SLIP VS SHAR'I EXEMPTION */}
            <div className="p-1 rounded-xl bg-[#090b10] border border-white/10 flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setAuditType('standard')}
                className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  auditType === 'standard'
                    ? 'bg-gradient-to-r from-amber-600/40 via-[#c5a059]/40 to-amber-500/30 border border-[#c5a059] text-[#fef08a] shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>Standard Moral Slip (مخالفة / زلة مسجلة)</span>
              </button>

              <button
                type="button"
                onClick={() => setAuditType('exemption')}
                className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  auditType === 'exemption'
                    ? 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 border border-cyan-400 text-cyan-200 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <HeartHandshake className="h-3.5 w-3.5 text-cyan-400" />
                <span>Honest Excuse / Shar'ī Exemption (عذر شرعي / استثناء)</span>
              </button>
            </div>

            {/* EXEMPTION REASSURANCE BANNER (SHOWN ONLY IF EXEMPTION) */}
            {auditType === 'exemption' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gradient-to-r from-cyan-950/40 via-[#0a1824] to-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Honest Human Vulnerability: 0 XP &amp; 0 Fine Applied</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-mono">
                  Accountability logged for transparent self-auditing. The Prophet ﷺ said: &ldquo;My Ummah has been forgiven for their mistakes, their forgetfulness, and what they are forced to do.&rdquo;
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {EXEMPTION_PRESETS.map(exp => (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExemptionReason(exp.labelEn)}
                      className={`p-2 rounded-lg border text-left transition font-mono cursor-pointer ${
                        exemptionReason === exp.labelEn
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[10px] font-bold truncate">{exp.labelEn}</div>
                      <div className="text-[9px] text-cyan-300/80 truncate">{exp.labelAr}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. QUICK SLIP PRESETS (SHOWN IN STANDARD MODE) */}
            {auditType === 'standard' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#c5a059] text-black text-[10px] font-bold flex items-center justify-center">1</span>
                    Quick Triage Presets
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
                    className="text-xs font-mono text-[#fef08a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isCustomMode ? '← Use Quick Presets' : 'Custom Slip Entry →'}
                  </button>
                </div>

                {!isCustomMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {QUICK_SLIP_PRESETS.map(preset => {
                      const Icon = preset.icon;
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedPresetId(preset.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                            isSelected 
                              ? `${preset.color} ring-1 ring-[#c5a059] shadow-lg` 
                              : 'bg-[#0f121a] border-white/10 hover:border-white/20 text-zinc-400'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-zinc-100 truncate">{preset.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-zinc-300">
                                {preset.category}
                              </span>
                              <span className="text-[9px] font-mono text-amber-300/80">
                                {preset.severity}
                              </span>
                              {preset.isTimeLoss && (
                                <span className="text-[9px] font-mono text-indigo-300 flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" /> {preset.defaultMinutes}m
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. INCIDENT DETAILS & MORAL REALM */}
            <div className="p-3.5 rounded-xl bg-[#0e111a] border border-white/10 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-300 font-bold flex items-center justify-between">
                  <span>Incident Summary / Title:</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Explicit decree</span>
                </label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={auditType === 'exemption' ? 'e.g., Missed Fajr due to heavy feverish sleep...' : 'e.g., Delayed Asr prayer by 35 mins / Browsed social feed...'}
                  className="w-full bg-[#08090d] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 font-mono"
                />
              </div>

              {/* Moral Sphere Category */}
              <div>
                <label className="text-xs font-mono text-zinc-300 font-bold block mb-1.5">
                  Moral Sphere (Sphere of Accountability):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'] as MuhasabahCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border transition cursor-pointer text-center ${
                        category === cat 
                          ? 'bg-amber-950/60 border-amber-500/60 text-[#fef08a] font-bold shadow-sm' 
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Root Cause / Vulnerability Trigger */}
              {auditType === 'standard' && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-300 font-bold block">
                    Root Vulnerability / Trigger Cause:
                  </label>
                  <input 
                    type="text"
                    required
                    value={cause}
                    onChange={e => setCause(e.target.value)}
                    placeholder="e.g. Late night unshielded phone in bed, cognitive boredom, fatigue..."
                    className="w-full bg-[#08090d] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 font-mono"
                  />
                </div>
              )}
            </div>

            {/* 4. RECURRING SIN DETECTION BANNER (IF APPLICABLE) */}
            {auditType === 'standard' && recurrenceAnalysis && recurrenceAnalysis.isRecurring && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-red-950/20 to-black/60 shadow-lg space-y-2"
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
                    <span className="text-xs font-mono font-bold text-rose-200">
                      +{Math.round((recurrenceAnalysis.multiplier - 1) * 100)}% Compounding Penalty
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-rose-500/20 text-xs font-mono">
                  <div className="p-1.5 rounded-lg bg-black/40 border border-rose-500/30">
                    <span className="text-[10px] text-zinc-400 block">HP Loss</span>
                    <span className="text-xs font-bold text-rose-400">−{actualHpLoss} HP</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-amber-500/30">
                    <span className="text-[10px] text-zinc-400 block">Treasury Fine</span>
                    <span className="text-xs font-bold text-amber-400">−{actualCoinFine} 🪙</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-red-500/30">
                    <span className="text-[10px] text-zinc-400 block">Discipline XP</span>
                    <span className="text-xs font-bold text-orange-400">−{actualXpDeduction} XP</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. SEVERITY CONFLICT WEIGHT (ONLY IN STANDARD SLIP MODE) */}
            {auditType === 'standard' && (
              <div>
                <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#c5a059] text-black text-[10px] font-bold flex items-center justify-center">2</span>
                    Determine Severity &amp; Moral Wazn
                  </span>
                  <span className="text-xs text-rose-400 font-bold font-mono">
                    −{actualHpLoss} HP • −{actualCoinFine} Coins • −{actualXpDeduction} XP
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
                        className={`py-2 px-1 rounded-xl border font-mono text-center flex flex-col items-center justify-center transition cursor-pointer ${
                          isSelected 
                            ? `${s.badge} ring-1 ring-[#c5a059] shadow-lg font-bold scale-[1.02]` 
                            : 'bg-[#0e111a] border-white/10 hover:border-white/20 text-zinc-400'
                        }`}
                      >
                        <span className="text-xs font-bold">{s.label}</span>
                        <span className="text-[10px] text-rose-400 font-semibold">−{previewHp} HP</span>
                        <span className="text-[9px] text-amber-400">−{previewCoins} 🪙</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. INTEGRATED TIME LOSS & REST BANK DEBIT */}
            {auditType === 'standard' && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0d101a] via-[#101424] to-[#0d101a] border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Did this slip involve squandered time / distraction?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeTimeLoss(!includeTimeLoss)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      includeTimeLoss
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {includeTimeLoss ? '✓ TIME TRACKED' : '+ LOG MINUTES'}
                  </button>
                </div>

                {includeTimeLoss && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2 border-t border-indigo-500/20"
                  >
                    {/* Distraction Vector Chips */}
                    <div>
                      <span className="text-[11px] font-mono text-zinc-400 block mb-1.5">Distraction Vector:</span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {(Object.keys(DISTRACTION_CONFIGS) as DistractionSource[]).map(srcKey => {
                          const cfg = DISTRACTION_CONFIGS[srcKey];
                          const Icon = cfg.icon;
                          const isSelected = selectedSource === srcKey;
                          return (
                            <button
                              key={srcKey}
                              type="button"
                              onClick={() => setSelectedSource(srcKey)}
                              className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? `${cfg.bgColor} ${cfg.borderColor} border font-bold text-white shadow-sm`
                                  : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                              <span className="text-[9px] font-mono truncate w-full">{cfg.labelEn.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration Chips */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-zinc-400">Duration Lost:</span>
                        <span className="text-xs font-mono font-bold text-indigo-300">{durationMinutes} minutes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {DURATION_PRESETS.map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDurationMinutes(m)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                              durationMinutes === m
                                ? 'bg-indigo-500 text-white font-bold'
                                : 'bg-black/40 border border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                        <input
                          type="number"
                          min={1}
                          max={600}
                          value={durationMinutes}
                          onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 bg-black/40 border border-white/15 focus:border-indigo-400 rounded-lg px-2 text-xs text-white font-mono text-center outline-none"
                        />
                      </div>
                    </div>

                    {/* Rest Bank Debit Option */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-indigo-500/20 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={debitFromRestBank}
                          onChange={e => setDebitFromRestBank(e.target.checked)}
                          className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300">
                          Debit <strong className="text-indigo-300">{durationMinutes}m</strong> directly from Rest Bank balance
                        </span>
                      </label>
                      <div className="text-right text-[10px] font-mono">
                        <span className="text-zinc-500">Current: {currentRestBankBalance}m</span>
                        <span className="text-indigo-400 block font-bold">Projected: {projectedRestBank}m</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* 7. LINK TO BEHAVIORAL PATTERN / WEAKNESS */}
            {auditType === 'standard' && weaknesses.length > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e111a] border border-white/10 text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Bind to Tracked Habit Pattern (Fills 1 of 5 Slots):</span>
                </span>
                <select
                  value={selectedWeaknessId}
                  onChange={e => setSelectedWeaknessId(e.target.value)}
                  className="bg-[#07090e] border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-[#c5a059]"
                >
                  <option value="">-- No linked habit pattern --</option>
                  {weaknesses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.occurrenceCount} slips)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 8. CORRECTIVE KAFFĀRAH RESTITUTION */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0d161c] to-[#0a1215] border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Corrective Kaffārah Restitution (Remedy):</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono text-zinc-400">
                  <input
                    type="checkbox"
                    checked={createKaffarahQuest}
                    onChange={e => setCreateKaffarahQuest(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>Create active Quest</span>
                </label>
              </div>

              <input 
                type="text"
                value={kaffarahTitle}
                onChange={e => setKaffarahTitle(e.target.value)}
                placeholder="Restitution Action (e.g., 2 Rak'ahs Tawbah, 25m Focus Sprint, Al-Mulk, $5 Sadaqah)..."
                className="w-full bg-[#05090d] border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-cyan-200 outline-none placeholder:text-zinc-600 font-mono"
              />

              {/* Quick Kaffārah Suggesters */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  '2 Rak\'ahs of Tawbah with prolonged Sujood',
                  'Execute 1 Locked Deep Focus Sprint (25m)',
                  'Recite Surah Al-Mulk & 100x Istighfār',
                  'Dopamine Fast: 45m Zero Screens Walk',
                  'Offer $5 Secret Sadaqah Charity'
                ].map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setKaffarahTitle(sug)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300/80 hover:text-cyan-200 border border-cyan-500/20 transition cursor-pointer"
                  >
                    + {sug.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* FEEDBACK ERROR BANNER */}
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

            {/* SUBMIT ACTION BAR */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 shrink-0">
              <div className="text-xs font-mono">
                {auditType === 'exemption' ? (
                  <span className="text-cyan-300 font-bold">🕊️ 0 Penalties • Lawful Exemption Recorded</span>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-rose-400 font-bold">−{actualHpLoss} HP</span>
                    <span className="text-amber-400 font-bold">−{actualCoinFine} 🪙</span>
                    <span className="text-orange-400 font-bold">−{actualXpDeduction} XP</span>
                    {includeTimeLoss && debitFromRestBank && (
                      <span className="text-indigo-400 font-bold">−{durationMinutes}m Rest Bank</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                    auditType === 'exemption'
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 text-white shadow-cyan-950/50'
                      : 'bg-gradient-to-r from-amber-600 via-[#c5a059] to-amber-500 text-black shadow-amber-950/50'
                  }`}
                  id="confirm-muhasabah-audit-btn"
                >
                  <Scale className="h-4 w-4" />
                  <span>
                    {auditType === 'exemption' ? 'INSCRIBE LAWFUL EXEMPTION' : 'INSCRIBE AUDIT DECREE'}
                  </span>
                </button>
              </div>
            </div>

          </form>
        )}
      </motion.div>
    </div>
  );
};
