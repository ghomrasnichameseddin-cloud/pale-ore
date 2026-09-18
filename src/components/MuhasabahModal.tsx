import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity } from '../types';
import { RubElHizbIcon } from './IslamicRpgDecorations';
import { 
  X, AlertTriangle, Shield, ShieldCheck, CheckCircle2, Flame, Heart, 
  MessageSquare, Sparkles, Scale, BookOpen, Clock, ArrowRight,
  Lock, Coins, Zap, ShieldAlert, HeartHandshake, EyeOff, Radio,
  Repeat, Activity, TrendingUp, History, Smartphone, Gamepad2,
  Tv, Coffee, Compass, DollarSign, Calendar
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
  examples: string;
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
    borderColor: 'border-rose-500/30',
    examples: 'Instagram, TikTok, Twitter/X, Reels, Shorts, Reddit doomscrolling'
  },
  gaming: {
    id: 'gaming',
    labelEn: 'Excessive Gaming',
    labelAr: 'الألعاب والتسلية المفرطة',
    defaultCategory: 'Wasted Potential',
    icon: Gamepad2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/30',
    borderColor: 'border-purple-500/30',
    examples: 'Video games, mobile games, online matches, late-night gaming'
  },
  video_streaming: {
    id: 'video_streaming',
    labelEn: 'Video Binge & Streaming',
    labelAr: 'مشاهدة المقاطع والمسلسلات',
    defaultCategory: 'Wasted Potential',
    icon: Tv,
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-500/30',
    examples: 'YouTube rabbit holes, Netflix, anime, twitch streams, film binging'
  },
  idle_chatting: {
    id: 'idle_chatting',
    labelEn: 'Idle Chatting & Debates',
    labelAr: 'اللغو والجدال والدردشة العبثية',
    defaultCategory: 'Speech',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/30',
    borderColor: 'border-cyan-500/30',
    examples: 'Group chat debates, unverified gossip, endless messaging, server banter'
  },
  procrastination: {
    id: 'procrastination',
    labelEn: 'Sloth & Procrastination',
    labelAr: 'الكسل والمماطلة والتسويف',
    defaultCategory: 'Wasted Potential',
    icon: Coffee,
    color: 'text-orange-400',
    bgColor: 'bg-orange-950/30',
    borderColor: 'border-orange-500/30',
    examples: 'Lying in bed, day-dreaming, avoiding work, passive aimless browsing'
  },
  custom: {
    id: 'custom',
    labelEn: 'Other Distraction',
    labelAr: 'تشتت مخصص آخر',
    defaultCategory: 'Wasted Potential',
    icon: Compass,
    color: 'text-zinc-300',
    bgColor: 'bg-zinc-900/60',
    borderColor: 'border-zinc-700/50',
    examples: 'Shopping portals, unmonitored rabbit holes, tangents'
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<MuhasabahModalTab>(initialTab);

  // Synchronize initialTab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFeedback(null);
      setCreatedWastedResult(null);
    }
  }, [isOpen, initialTab]);

  // Form states for Mode 1: Slip
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fajr-delay');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MuhasabahCategory>(prefillCategory || 'Obligations');
  const [severity, setSeverity] = useState<MuhasabahSeverity>('Moderate');
  const [cause, setCause] = useState('');
  const [kaffarahTitle, setKaffarahTitle] = useState('');
  const [selectedWeaknessId, setSelectedWeaknessId] = useState<string>(prefillWeaknessId || '');

  // Form states for Mode 2: Wasted Time & Distraction
  const [selectedSource, setSelectedSource] = useState<DistractionSource>('social_media');
  const [customDistractionTitle, setCustomDistractionTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [selectedKaffarah, setSelectedKaffarah] = useState<KaffarahMode>('focus');
  const [debitFromRestBank, setDebitFromRestBank] = useState<boolean>(true);
  const [wastedReflection, setWastedReflection] = useState<string>('');
  const [createdWastedResult, setCreatedWastedResult] = useState<{
    entryId: string;
    questName: string;
    xpDeducted: number;
    hpLoss: number;
    coinsFine: number;
    estTime: number;
    severity: MuhasabahSeverity;
  } | null>(null);

  // Form states for Mode 3: Exemption
  const [exemptionReason, setExemptionReason] = useState<string>('Unintentional Sleep / Forgetfulness (نوم / نسيان)');
  const [exemptionTitle, setExemptionTitle] = useState<string>('');
  const [exemptionCategory, setExemptionCategory] = useState<MuhasabahCategory>('Obligations');

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

  // Recurrence Analysis for Slip Mode
  const recurrenceAnalysis = useMemo(() => {
    if (activeTab !== 'slip' || !title.trim()) return null;
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
  }, [title, category, severity, selectedWeaknessId, weaknesses, state.systemDate, state.muhasabahEntries, activeTab, currentSysDate]);

  const baseHpLoss = baseConsequences.baseHp;
  const baseCoinFine = baseConsequences.baseCoins;
  const baseXpPenalty = consequence.xpPenalty;

  const actualMultiplier = recurrenceAnalysis?.multiplier || 1.0;
  const actualHpLoss = recurrenceAnalysis ? recurrenceAnalysis.escalatedHpLoss : baseHpLoss;
  const actualCoinFine = recurrenceAnalysis ? recurrenceAnalysis.escalatedCoinFine : baseCoinFine;
  const actualXpDeduction = recurrenceAnalysis ? recurrenceAnalysis.escalatedXpPenalty : baseXpPenalty;

  const currentHp = stats.currentHp ?? (state.profile.hp ?? 100);
  const maxHp = stats.maxHp ?? (state.profile.maxHp ?? 100);
  const projectedHp = Math.max(0, currentHp - actualHpLoss);

  // Dynamic Calculation for Wasted Time Mode
  const wastedCalculation = useMemo(() => {
    let sev: MuhasabahSeverity = 'Minor';
    let xpPen = 100;
    let hpDeduct = 10;
    let coinDeduct = 10;
    let momentumLoss = 15;

    if (durationMinutes < 30) {
      sev = 'Minor';
      xpPen = 100;
      hpDeduct = 10;
      coinDeduct = 10;
      momentumLoss = 15;
    } else if (durationMinutes < 75) {
      sev = 'Moderate';
      xpPen = 200;
      hpDeduct = 20;
      coinDeduct = 25;
      momentumLoss = 35;
    } else if (durationMinutes < 150) {
      sev = 'Major';
      xpPen = 300;
      hpDeduct = 35;
      coinDeduct = 50;
      momentumLoss = 100;
    } else {
      sev = 'Critical';
      xpPen = 500;
      hpDeduct = 75;
      coinDeduct = 200;
      momentumLoss = 100;
    }

    let kTitle = '';
    let kType: 'Focus' | 'Detox' | 'Quran' | 'Prayer' | 'Sadaqah' = 'Focus';
    let estimatedTime = 25;

    if (selectedKaffarah === 'focus') {
      kType = 'Focus';
      if (durationMinutes < 30) {
        kTitle = 'Execute 1 Locked Deep Focus Sprint (25m)';
        estimatedTime = 25;
      } else if (durationMinutes < 75) {
        kTitle = 'Execute 2 Locked Focus Sprints (50m) to Reclaim Lost Momentum';
        estimatedTime = 50;
      } else if (durationMinutes < 150) {
        kTitle = 'Execute 75m Deep Work Counter-Attack (Zero Interruption)';
        estimatedTime = 75;
      } else {
        kTitle = 'Execute Double Focus Block (100m) on Top Priority Directive';
        estimatedTime = 100;
      }
    } else if (selectedKaffarah === 'detox') {
      kType = 'Detox';
      if (durationMinutes < 45) {
        kTitle = '30m Screen Detox & Mindful Walk in Nature';
        estimatedTime = 30;
      } else if (durationMinutes < 120) {
        kTitle = '60m Screen & Dopamine Fast (Phone in Closed Drawer)';
        estimatedTime = 60;
      } else {
        kTitle = 'Strict Evening Digital Lockdown (Zero Entertainment Screens Today)';
        estimatedTime = 90;
      }
    } else if (selectedKaffarah === 'quran') {
      kType = 'Quran';
      kTitle = '100x Sincere Istighfār & Tadabbur Recitation of Surah Al-Mulk';
      estimatedTime = 20;
    } else if (selectedKaffarah === 'prayer') {
      kType = 'Prayer';
      kTitle = '2 Rak\'ahs of Sincere Tawbah with Prolonged Sujood in Solitude';
      estimatedTime = 15;
    } else if (selectedKaffarah === 'sadaqah') {
      kType = 'Sadaqah';
      const dollarAmt = durationMinutes < 60 ? '$5' : durationMinutes < 120 ? '$10' : '$20';
      kTitle = `Offer ${dollarAmt} Secret Sadaqah to Extinguish Distraction Slip`;
      estimatedTime = 10;
    }

    const currentSource = DISTRACTION_CONFIGS[selectedSource];
    const compTitle = selectedSource === 'custom' && customDistractionTitle.trim()
      ? `Wasted ${durationMinutes}m on ${customDistractionTitle.trim()}`
      : `Wasted ${durationMinutes}m on ${currentSource.labelEn}`;

    const recoveryXp = Math.max(25, Math.round(xpPen * 0.2));

    return {
      severity: sev,
      xpPenalty: xpPen,
      hpLoss: hpDeduct,
      coinFine: coinDeduct,
      momentumLoss,
      kaffarahTitle: kTitle,
      kaffarahType: kType,
      estimatedTime,
      computedTitle: compTitle,
      recoveryXp,
      category: currentSource.defaultCategory
    };
  }, [selectedSource, customDistractionTitle, durationMinutes, selectedKaffarah]);

  if (!isOpen) return null;

  // Handle Mode 1: Slip Submission
  const handleSlipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please specify the slip summary.' });
      return;
    }
    if (!cause.trim()) {
      setFeedback({ type: 'error', message: 'Please identify the root cause trigger.' });
      return;
    }

    const res = addMuhasabahEntry({
      title: title.trim(),
      category,
      severity,
      cause: cause.trim(),
      isExempt: false,
      createCorrectiveQuest: true,
      correctiveQuestName: kaffarahTitle.trim() || undefined,
      weaknessId: selectedWeaknessId || undefined
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1200);
    }
  };

  // Handle Mode 2: Wasted Time Submission
  const handleWastedTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;

    const source = DISTRACTION_CONFIGS[selectedSource];
    const compTitle = wastedCalculation.computedTitle;
    const compCause = `Unmonitored drift into ${source.labelEn} for ${durationMinutes} minutes. ${wastedReflection ? `Reflection: ${wastedReflection}` : ''}`.trim();

    // Submit through the canonical Muhasabah Engine
    const result = addMuhasabahEntry({
      title: compTitle,
      category: wastedCalculation.category,
      severity: wastedCalculation.severity,
      cause: compCause,
      isExempt: false,
      createCorrectiveQuest: true,
      correctiveQuestName: `[KAFFĀRAH] ${wastedCalculation.kaffarahTitle}`,
      weaknessId: undefined
    });

    // Optionally debit from Leisure Bank in Temporal Ledger
    if (debitFromRestBank && addTimeCredits) {
      addTimeCredits(
        -durationMinutes,
        `Distraction Overdraft: Lost ${durationMinutes}m to ${source.labelEn}`,
        'manual_adjustment'
      );
    }

    setCreatedWastedResult({
      entryId: result.entryId,
      questName: `[KAFFĀRAH] ${wastedCalculation.kaffarahTitle}`,
      xpDeducted: wastedCalculation.xpPenalty,
      hpLoss: wastedCalculation.hpLoss,
      coinsFine: wastedCalculation.coinFine,
      estTime: wastedCalculation.estimatedTime,
      severity: wastedCalculation.severity
    });
  };

  // Handle Mode 3: Lawful Exemption Submission
  const handleExemptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = exemptionTitle.trim() || `Lawful Exemption: ${exemptionReason}`;

    const res = addMuhasabahEntry({
      title: finalTitle,
      category: exemptionCategory,
      severity: 'Minor',
      cause: `[EXEMPTION] ${exemptionReason}`,
      isExempt: true,
      exemptionReason: exemptionReason,
      createCorrectiveQuest: false
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Lawful Exemption recorded with 0 penalty. Introspection record updated.' });
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
        className="glass-panel border border-[var(--border-strong)] rounded-2xl bg-[#0b0d13]/98 max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden text-zinc-300"
        id="muhasabah-modal-container"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] shrink-0">
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
                  مركز محاسبة النفس الشامل
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Unified Introspection, Habit Triage &amp; Wasted Time Restitution Engine
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

        {/* UNIFIED NAVIGATION TABS */}
        <div className="pt-3 pb-2 flex items-center gap-1.5 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveTab('slip'); setCreatedWastedResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'slip'
                ? 'bg-gradient-to-r from-amber-600/30 to-[#c5a059]/30 border border-[#c5a059]/60 text-[#fef08a] shadow-sm'
                : 'bg-black/30 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>⚡ 3-Tap Slip Audit (زلّة عمل)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('wasted_time'); setCreatedWastedResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'wasted_time'
                ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/60 text-indigo-200 shadow-sm'
                : 'bg-black/30 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>⏳ Wasted Time &amp; Distraction (هدر الوقت)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('exemption'); setCreatedWastedResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'exemption'
                ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/60 text-cyan-200 shadow-sm'
                : 'bg-black/30 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5 text-cyan-400" />
            <span>🛡️ Lawful Exemption (عذر شرعي)</span>
          </button>
        </div>

        {/* SAFEGUARD DISCLAIMER BANNER */}
        <div className="my-2.5 p-2.5 bg-gradient-to-r from-[#18140b] via-[#10131d] to-[#0d0f18] border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-200/90 shrink-0">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-300">
              &ldquo;XP is an in-app motivational measure. It does not represent Allah&apos;s reward, hasanat, or ajr. The true reward of worship belongs to Allah alone.&rdquo;
            </p>
            <p className="text-[10px] text-zinc-400">
              In-app penalties create healthy behavioral friction to counter rationalization, never divine condemnation.
            </p>
          </div>
        </div>

        {/* TAB 1: 3-TAP SLIP AUDIT */}
        {activeTab === 'slip' && (
          <form onSubmit={handleSlipSubmit} className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            {/* STEP 1: IDENTIFY SLIP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#c5a059] text-black text-[10px] font-bold flex items-center justify-center">1</span>
                  Identify the Slip (3-Tap Triage)
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
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                          isSelected 
                            ? `${preset.color} ring-1 ring-[#c5a059] shadow-lg` 
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
                    className="w-full bg-[#08090d] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                  />
                  <input 
                    type="text"
                    required
                    value={cause}
                    onChange={e => setCause(e.target.value)}
                    placeholder="Root Cause / Trigger (e.g. Phone notifications distraction)..."
                    className="w-full bg-[#08090d] border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                  />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                    {(['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'] as MuhasabahCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-2 py-1 rounded text-[10px] font-mono border transition cursor-pointer ${
                          category === cat ? 'bg-amber-950/60 border-amber-500/60 text-[#fef08a] font-bold' : 'bg-black/30 border-white/5 text-zinc-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RECURRING SIN DETECTION & COMPOUNDING PENALTY WARNING */}
            {recurrenceAnalysis && recurrenceAnalysis.isRecurring && (
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
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: WEIGH SEVERITY */}
            <div>
              <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#c5a059] text-black text-[10px] font-bold flex items-center justify-center">2</span>
                  Determine Consequence Weight (Wazn)
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

              <div className="mt-2.5 p-2.5 rounded-xl bg-[#090b10] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-rose-400 font-bold">
                    <Heart className="h-3.5 w-3.5" />
                    <span>−{actualHpLoss} HP</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Coins className="h-3.5 w-3.5" />
                    <span>−{actualCoinFine} Coins</span>
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
                  <span className="w-4 h-4 rounded-full bg-[#c5a059] text-black text-[10px] font-bold flex items-center justify-center">3</span>
                  Sacred Kaffārah Restitution (Remedy)
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
                  Completing this corrective quest unlocks the Imperial Shop and restores soul equilibrium.
                </p>
              </div>
            </div>

            {/* OPTIONAL WEAKNESS LINKER */}
            {weaknesses.length > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e111a] border border-white/10 text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Link to Weakness Chain:
                </span>
                <select
                  value={selectedWeaknessId}
                  onChange={e => setSelectedWeaknessId(e.target.value)}
                  className="bg-[#07090e] border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-[#c5a059]"
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
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-[#c5a059] to-amber-500 text-black font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center gap-2 shadow-xl shadow-amber-950/50 cursor-pointer"
                id="confirm-muhasabah-audit-btn"
              >
                <Scale className="h-4 w-4" />
                {recurrenceAnalysis?.isRecurring 
                  ? `COMMIT AUDIT (−${actualHpLoss} HP, −${actualCoinFine} 🪙, −${actualXpDeduction} XP • ${recurrenceAnalysis.multiplier.toFixed(2)}x)` 
                  : `COMMIT AUDIT (−${actualHpLoss} HP, −${actualCoinFine} 🪙, −${actualXpDeduction} XP)`
                }
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: WASTED TIME & DISTRACTION RECOVERY INTEGRATOR */}
        {activeTab === 'wasted_time' && (
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            {createdWastedResult ? (
              /* POST-SUBMISSION CELEBRATION CARD */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-[#0e181c] via-[#091116] to-[#04080b] border border-emerald-500/40 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold text-emerald-200">
                      Wasted Time Penalized &amp; Kaffārah Minted!
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      Amānah restored. Your corrective counter-attack quest is now active.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/20 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-zinc-400">Created Restitution Quest:</span>
                    <span className="font-bold text-emerald-300">{createdWastedResult.questName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                      <span className="block text-[10px] text-zinc-400">HP Lost</span>
                      <span className="font-bold text-sm">−{createdWastedResult.hpLoss}</span>
                    </div>
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
                      <span className="block text-[10px] text-zinc-400">Fine Deducted</span>
                      <span className="font-bold text-sm">−{createdWastedResult.coinsFine} 🪙</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">
                      <span className="block text-[10px] text-zinc-400">XP Friction</span>
                      <span className="font-bold text-sm">−{createdWastedResult.xpDeducted} XP</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Completion Reward:</span>
                    </span>
                    <span className="font-bold">+35 HP Vitality Refund &amp; +20% XP Restore</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setCreatedWastedResult(null); onClose(); }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/5 transition cursor-pointer"
                  >
                    Done &amp; Close
                  </button>
                  {onNavigateToQuests && (
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
              </motion.div>
            ) : (
              <form onSubmit={handleWastedTimeSubmit} className="space-y-4">
                {/* 1. SELECT DISTRACTION SOURCE */}
                <div>
                  <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    Select Distraction Vector (مصدر التشتت)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(DISTRACTION_CONFIGS) as DistractionSource[]).map(srcKey => {
                      const cfg = DISTRACTION_CONFIGS[srcKey];
                      const Icon = cfg.icon;
                      const isSelected = selectedSource === srcKey;
                      return (
                        <button
                          key={srcKey}
                          type="button"
                          onClick={() => setSelectedSource(srcKey)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                            isSelected 
                              ? `${cfg.bgColor} ${cfg.borderColor} border-2 shadow-lg ring-1 ring-indigo-500/50` 
                              : 'bg-[#0f121a] border-white/10 hover:border-white/20 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-zinc-300">
                              {cfg.defaultCategory}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-100 block">{cfg.labelEn}</span>
                            <span className="text-[10px] font-sans text-zinc-400 block">{cfg.labelAr}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSource === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customDistractionTitle}
                        onChange={e => setCustomDistractionTitle(e.target.value)}
                        placeholder="Specify distraction activity (e.g. Online impulse window shopping)..."
                        className="w-full bg-[#08090d] border border-indigo-500/40 focus:border-indigo-400 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 2. DURATION SLIDER & PRESETS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                      Wasted Duration (Minutes)
                    </label>
                    <span className="text-sm font-mono font-bold text-amber-300 bg-amber-950/50 border border-amber-500/40 px-3 py-0.5 rounded-lg">
                      {durationMinutes} mins
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {DURATION_PRESETS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDurationMinutes(preset)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                          durationMinutes === preset
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-black/30 border border-white/10 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="240"
                    step="5"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />

                  {/* LIVE SEVERITY & PENALTY SUMMARY STRIP */}
                  <div className="mt-2.5 p-3 rounded-xl bg-[#090b12] border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Calculated Wazn:</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${SEVERITY_CONSEQUENCES[wastedCalculation.severity].badge}`}>
                        {wastedCalculation.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-400 font-bold">−{wastedCalculation.hpLoss} HP</span>
                      <span className="text-amber-400 font-bold">−{wastedCalculation.coinFine} Coins</span>
                      <span className="text-orange-400 font-bold">−{wastedCalculation.xpPenalty} XP</span>
                    </div>
                  </div>
                </div>

                {/* 3. LEISURE BANK DEBIT TOGGLE */}
                <div className="p-3 rounded-xl bg-[#0d0f1a] border border-indigo-500/20 flex items-start justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>Debit from Leisure Bank in Temporal Ledger</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 font-sans">
                      Treats wasted time as unauthorized leisure overdraft, balancing your temporal account by deducting {durationMinutes}m of banked rest.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={debitFromRestBank}
                      onChange={e => setDebitFromRestBank(e.target.checked)}
                      className="rounded border-white/20 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs font-mono text-zinc-300">
                      {debitFromRestBank ? `−${durationMinutes}m Debit` : 'No Debit'}
                    </span>
                  </label>
                </div>

                {/* 4. CHOOSE KAFFĀRAH RESTITUTION */}
                <div>
                  <label className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                    Choose Restitution Counter-Attack (كفّارة الوقت)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'focus' as KaffarahMode, title: 'Deep Focus Counter-Attack', desc: 'Locked deep work sprint (1.25x time ratio)', icon: Zap, color: 'text-indigo-400' },
                      { id: 'detox' as KaffarahMode, title: 'Digital Detox & Reset', desc: 'Screen fast, mindful walk or physical reset', icon: EyeOff, color: 'text-rose-400' },
                      { id: 'quran' as KaffarahMode, title: '100x Istighfār & Qur\'an', desc: 'Recite Surah Al-Mulk or Al-Waqi\'ah with tadabbur', icon: BookOpen, color: 'text-cyan-400' },
                      { id: 'prayer' as KaffarahMode, title: '2 Rak\'ahs of Tawbah', desc: 'Sincere voluntary prayer with prolonged prostration', icon: ShieldCheck, color: 'text-amber-400' },
                      { id: 'sadaqah' as KaffarahMode, title: 'Micro-Sadaqah Charity', desc: 'Direct financial donation to extinguish the slip', icon: DollarSign, color: 'text-emerald-400' }
                    ].map(k => {
                      const Icon = k.icon;
                      const isSelected = selectedKaffarah === k.id;
                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => setSelectedKaffarah(k.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500'
                              : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${k.color}`} />
                          <div>
                            <span className="text-xs font-bold text-zinc-100 block">{k.title}</span>
                            <span className="text-[10px] text-zinc-400 block">{k.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-200">Minted Quest Directive:</span>
                    <span className="text-white font-bold truncate max-w-sm">
                      {wastedCalculation.kaffarahTitle}
                    </span>
                  </div>
                </div>

                {/* 5. USER REFLECTION */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">
                    Personal Reflection (Why did the friction guard fail?)
                  </label>
                  <input
                    type="text"
                    value={wastedReflection}
                    onChange={e => setWastedReflection(e.target.value)}
                    placeholder="e.g., opened phone when exhausted instead of performing active rest..."
                    className="w-full bg-[#08090d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:bg-white/5 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center gap-2 shadow-xl shadow-indigo-950/60 cursor-pointer"
                    id="confirm-wasted-time-recovery-btn"
                  >
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span>CONVERT {durationMinutes}M INTO RESTITUTION QUEST</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: LAWFUL EXEMPTION (عذر شرعي) */}
        {activeTab === 'exemption' && (
          <form onSubmit={handleExemptionSubmit} className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
                <HeartHandshake className="h-4 w-4 text-cyan-400" />
                <span>PRINCIPLE OF UNBURDENED ACCOUNTABILITY (رفع الحرج)</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                In Islamic jurisprudence, unintentional omissions due to sleep, involuntary forgetfulness, serious illness, or lawful hardship carry zero moral blame and zero sin. In this system, logging an exemption records the occurrence cleanly without imposing HP, Coin, or XP deductions.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-zinc-200 font-bold block mb-1.5">
                  Select Lawful Excuse / Sharia Ground (السبب الشرعي)
                </label>
                <select
                  value={exemptionReason}
                  onChange={e => setExemptionReason(e.target.value)}
                  className="w-full bg-[#080b12] border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-cyan-200 outline-none font-mono"
                >
                  <option value="Unintentional Sleep / Forgetfulness (نوم / نسيان)">Unintentional Sleep or Involuntary Forgetfulness (نوم / نسيان)</option>
                  <option value="Sickness / Physical Inability (مرض / عجز)">Sickness / Physical Inability (مرض / عجز)</option>
                  <option value="Lawful Travel / Hardship (سفر / مشقة)">Lawful Travel / Hardship (سفر / مشقة)</option>
                  <option value="Menses / Postnatal Exemption (عذر شرعي للنساء)">Menses / Postnatal Exemption (عذر شرعي للنساء)</option>
                  <option value="Unforeseen Urgent Emergency (ظرف طارئ)">Unforeseen Urgent Emergency (ظرف طارئ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-200 font-bold block mb-1.5">
                  Action or Obligation Affected (Optional Title)
                </label>
                <input
                  type="text"
                  value={exemptionTitle}
                  onChange={e => setExemptionTitle(e.target.value)}
                  placeholder="e.g., Slept through Fajr alarm despite sleeping early..."
                  className="w-full bg-[#08090d] border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-200 font-bold block mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'] as MuhasabahCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setExemptionCategory(cat)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition cursor-pointer ${
                        exemptionCategory === cat ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 font-bold' : 'bg-black/30 border-white/5 text-zinc-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FEEDBACK BANNER */}
            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                feedback.type === 'success' 
                  ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-200' 
                  : 'bg-rose-950/90 border border-rose-500/50 text-rose-200'
              }`}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center gap-2 shadow-xl shadow-cyan-950/60 cursor-pointer"
                id="confirm-exemption-btn"
              >
                <HeartHandshake className="h-4 w-4" />
                <span>RECORD LAWFUL EXEMPTION (0 PENALTY)</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
