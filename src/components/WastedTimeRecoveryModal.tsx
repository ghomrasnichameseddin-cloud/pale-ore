import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity } from '../types';
import { 
  X, AlertTriangle, Shield, Heart, Clock, ArrowRight,
  Sparkles, CheckCircle2, Zap, Flame, Smartphone, Gamepad2, 
  Tv, MessageSquare, Coffee, Compass, DollarSign, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon } from './IslamicRpgDecorations';
import { getLocalDateString } from '../initialState';

interface WastedTimeRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToQuests?: () => void;
}

export type DistractionSource = 
  | 'social_media' 
  | 'gaming' 
  | 'video_streaming' 
  | 'idle_chatting' 
  | 'procrastination' 
  | 'custom';

export type KaffarahMode = 'focus' | 'detox' | 'quran' | 'prayer' | 'sadaqah';

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
    examples: 'Video games, mobile games, online matches, late-night raids'
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
    examples: 'YouTube rabbit holes, Netflix, anime, twitch, cinema binge'
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
    examples: 'Group chat debates, gossip, endless messaging, idle server banter'
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
    examples: 'Lying in bed, day-dreaming, avoiding friction, passive browsing'
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
    examples: 'Shopping sites, web research drift, unmonitored tangents'
  }
};

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180];

export const WastedTimeRecoveryModal: React.FC<WastedTimeRecoveryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToQuests
}) => {
  const { state, addMuhasabahEntry, addTimeCredits } = usePOS();

  // State
  const [selectedSource, setSelectedSource] = useState<DistractionSource>('social_media');
  const [customTitle, setCustomTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [selectedKaffarah, setSelectedKaffarah] = useState<KaffarahMode>('focus');
  const [debitFromRestBank, setDebitFromRestBank] = useState<boolean>(true);
  const [userReflection, setUserReflection] = useState<string>('');

  // Result state after submission
  const [createdResult, setCreatedResult] = useState<{
    entryId: string;
    questId: string | null;
    questName: string;
    xpDeducted: number;
    hpLoss: number;
    coinsFine: number;
    estTime: number;
    severity: MuhasabahSeverity;
  } | null>(null);

  // Dynamic Severity and Penalty Calculation
  const calculation = useMemo(() => {
    let severity: MuhasabahSeverity = 'Minor';
    let xpPenalty = 100;
    let hpLoss = 10;
    let coinFine = 10;
    let momentumLoss = 15;

    if (durationMinutes < 30) {
      severity = 'Minor';
      xpPenalty = 100;
      hpLoss = 10;
      coinFine = 10;
      momentumLoss = 15;
    } else if (durationMinutes < 75) {
      severity = 'Moderate';
      xpPenalty = 200;
      hpLoss = 20;
      coinFine = 25;
      momentumLoss = 35;
    } else if (durationMinutes < 150) {
      severity = 'Major';
      xpPenalty = 300;
      hpLoss = 35;
      coinFine = 50;
      momentumLoss = 100;
    } else {
      severity = 'Critical';
      xpPenalty = 500;
      hpLoss = 75;
      coinFine = 200;
      momentumLoss = 100;
    }

    // Dynamic Recovery Quest details based on Kaffarah Choice & Severity
    let kaffarahTitle = '';
    let kaffarahType: 'Focus' | 'Detox' | 'Quran' | 'Prayer' | 'Sadaqah' = 'Focus';
    let estimatedTime = 25;

    if (selectedKaffarah === 'focus') {
      kaffarahType = 'Focus';
      if (durationMinutes < 30) {
        kaffarahTitle = 'Execute 1 Locked Deep Focus Sprint (25m)';
        estimatedTime = 25;
      } else if (durationMinutes < 75) {
        kaffarahTitle = 'Execute 2 Locked Focus Sprints (50m) to Reclaim Lost Momentum';
        estimatedTime = 50;
      } else if (durationMinutes < 150) {
        kaffarahTitle = 'Execute 75m Deep Work Counter-Attack (Zero Interruption)';
        estimatedTime = 75;
      } else {
        kaffarahTitle = 'Execute Double Focus Block (100m) on Top Priority Directive';
        estimatedTime = 100;
      }
    } else if (selectedKaffarah === 'detox') {
      kaffarahType = 'Detox';
      if (durationMinutes < 45) {
        kaffarahTitle = '30m Screen Detox & Mindful Walk in Nature';
        estimatedTime = 30;
      } else if (durationMinutes < 120) {
        kaffarahTitle = '60m Screen & Dopamine Fast (Phone in Closed Drawer)';
        estimatedTime = 60;
      } else {
        kaffarahTitle = 'Strict Evening Digital Lockdown (Zero Entertainment Screens Today)';
        estimatedTime = 90;
      }
    } else if (selectedKaffarah === 'quran') {
      kaffarahType = 'Quran';
      kaffarahTitle = '100x Sincere Istighfār & Tadabbur Recitation of Surah Al-Mulk';
      estimatedTime = 20;
    } else if (selectedKaffarah === 'prayer') {
      kaffarahType = 'Prayer';
      kaffarahTitle = '2 Rak\'ahs of Sincere Tawbah with Prolonged Sujood in Solitude';
      estimatedTime = 15;
    } else if (selectedKaffarah === 'sadaqah') {
      kaffarahType = 'Sadaqah';
      const dollarAmt = durationMinutes < 60 ? '$5' : durationMinutes < 120 ? '$10' : '$20';
      kaffarahTitle = `Offer ${dollarAmt} Secret Sadaqah to Extinguish Distraction Slip`;
      estimatedTime = 10;
    }

    const currentSource = DISTRACTION_CONFIGS[selectedSource];
    const computedTitle = selectedSource === 'custom' && customTitle.trim()
      ? `Wasted ${durationMinutes}m on ${customTitle.trim()}`
      : `Wasted ${durationMinutes}m on ${currentSource.labelEn}`;

    const recoveryXp = Math.max(25, Math.round(xpPenalty * 0.2));

    return {
      severity,
      xpPenalty,
      hpLoss,
      coinFine,
      momentumLoss,
      kaffarahTitle,
      kaffarahType,
      estimatedTime,
      computedTitle,
      recoveryXp,
      category: currentSource.defaultCategory
    };
  }, [selectedSource, customTitle, durationMinutes, selectedKaffarah]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;

    const source = DISTRACTION_CONFIGS[selectedSource];
    const title = calculation.computedTitle;
    const cause = `Unmonitored drift into ${source.labelEn} for ${durationMinutes} minutes. ${userReflection ? `Reflection: ${userReflection}` : ''}`.trim();

    // 1. Submit through the canonical Muhasabah Engine
    const result = addMuhasabahEntry({
      title,
      description: `Logged via Distraction & Time Recovery Integrator: Lost ${durationMinutes} minutes to ${source.labelEn}. Generated restitution: "${calculation.kaffarahTitle}".`,
      category: calculation.category,
      severity: calculation.severity,
      cause,
      reflection: userReflection.trim() || undefined,
      createCorrectiveQuest: true,
      correctiveQuestName: calculation.kaffarahTitle,
      kaffarahType: calculation.kaffarahType,
      recoveryPercentage: 20
    });

    // 2. Optionally debit from the Leisure Bank in Temporal Ledger
    if (debitFromRestBank && addTimeCredits) {
      addTimeCredits(
        -durationMinutes,
        `Distraction Overdraft: Lost ${durationMinutes}m to ${source.labelEn}`,
        'manual_adjustment'
      );
    }

    // 3. Set created state to display congratulatory and actionable restitution card
    setCreatedResult({
      entryId: result.entryId,
      questId: null,
      questName: `[KAFFĀRAH] ${calculation.kaffarahTitle}`,
      xpDeducted: calculation.xpPenalty,
      hpLoss: calculation.hpLoss,
      coinsFine: calculation.coinFine,
      estTime: calculation.estimatedTime,
      severity: calculation.severity
    });
  };

  const handleResetAndClose = () => {
    setCreatedResult(null);
    setUserReflection('');
    setCustomTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-[#090c13] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto"
      >
        {/* TOP ACCENT ORNAMENT */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold flex items-center gap-1">
                  <RubElHizbIcon className="h-2.5 w-2.5" />
                  TEMPORAL MUḤĀSABAH &amp; KAFFĀRAH
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                  RECOVERY CONVERTER
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                Log Wasted Time &amp; Launch Recovery Quest
              </h3>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SUCCESS / CREATED VIEW */}
        {createdResult ? (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                Distraction Audited &amp; Sacred Penance Bound
              </h4>
              <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                Your slip of <strong>{durationMinutes} minutes</strong> has been recorded in the Muhāsabah ledger. The restorative counterweight has been minted into your active quest queue.
              </p>
            </div>

            {/* AUDIT SUMMARY CHIPS */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
                <span className="text-zinc-400 block text-[10px]">XP DEDUCTED</span>
                <span className="text-rose-400 font-bold text-sm">−{createdResult.xpDeducted} XP</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
                <span className="text-zinc-400 block text-[10px]">SOUL VITALITY</span>
                <span className="text-rose-400 font-bold text-sm">−{createdResult.hpLoss} HP</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30">
                <span className="text-zinc-400 block text-[10px]">COIN FINE</span>
                <span className="text-amber-400 font-bold text-sm">−{createdResult.coinsFine} Coins</span>
              </div>
            </div>

            {/* CREATED RECOVERY DIRECTIVE CARD */}
            <div className="p-4 rounded-xl bg-[#0f1420] border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  MINTED RECOVERY QUEST (KAFFĀRAH)
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {createdResult.estTime} mins
                </span>
              </div>

              <div className="text-sm font-bold text-white bg-black/40 p-3 rounded-lg border border-white/5">
                {createdResult.questName}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Heart className="h-3 w-3" /> Heals +35 HP on completion
                </span>
                <span className="text-indigo-300">
                  +20% XP Restored (+{calculation.recoveryXp} XP)
                </span>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-300 bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                Close Window
              </button>
              {onNavigateToQuests && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                    onNavigateToQuests();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/60"
                >
                  <span>Go to Quests &amp; Start Counter-Attack</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* 1. DISTRACTION ACTIVITY SOURCE */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center justify-between">
                <span>1. Identify Distraction Activity (مصدر التشتت)</span>
                <span className="text-[10px] text-zinc-400 lowercase">select source</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(DISTRACTION_CONFIGS) as DistractionSource[]).map(key => {
                  const cfg = DISTRACTION_CONFIGS[key];
                  const Icon = cfg.icon;
                  const isSelected = selectedSource === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSource(key)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${cfg.bgColor} ${cfg.borderColor} border-opacity-100 shadow-md`
                          : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`h-4 w-4 ${isSelected ? cfg.color : 'text-zinc-500'}`} />
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold font-sans ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          {cfg.labelEn}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-sans truncate">
                          {cfg.labelAr}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSource === 'custom' && (
                <div className="pt-1.5">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Specify activity (e.g. Shopping site browsing, endless forum debates)..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-sans text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              )}

              <p className="text-[10.5px] font-sans text-zinc-400 px-1">
                Typical triggers: {DISTRACTION_CONFIGS[selectedSource].examples}
              </p>
            </div>

            {/* 2. DURATION SLIDER & PRESETS */}
            <div className="space-y-2 p-3.5 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-zinc-300 uppercase">
                  2. Duration Wasted (المدة المهدورة)
                </span>
                <span className="text-sm font-bold text-amber-300 font-mono bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/40">
                  {durationMinutes} Minutes ({Math.floor(durationMinutes / 60) > 0 ? `${Math.floor(durationMinutes / 60)}h ` : ''}{durationMinutes % 60}m)
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="5"
                max="240"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {DURATION_PRESETS.map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-amber-500 text-black font-bold shadow-sm'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* 3. DYNAMIC PENALTY & IMPACT PREVIEW */}
            <div className="p-3.5 rounded-xl bg-[#0c0e15] border border-rose-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  CONSEQUENCE &amp; PENALTY MATRIX
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  calculation.severity === 'Minor' ? 'bg-zinc-800 text-zinc-300' :
                  calculation.severity === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                  calculation.severity === 'Major' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                  'bg-rose-900 text-white font-bold border border-rose-400 animate-pulse'
                }`}>
                  {calculation.severity} Severity
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">XP PENALTY</span>
                  <span className="text-rose-400 font-bold">−{calculation.xpPenalty}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">SOUL HP</span>
                  <span className="text-rose-400 font-bold">−{calculation.hpLoss} HP</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">COIN FINE</span>
                  <span className="text-amber-400 font-bold">−{calculation.coinFine}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">MOMENTUM</span>
                  <span className="text-rose-400 font-bold">−{calculation.momentumLoss}%</span>
                </div>
              </div>

              {/* Leisure Bank Overdraft Checkbox */}
              <label className="flex items-center gap-2 pt-1 text-[11px] font-mono text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={debitFromRestBank}
                  onChange={(e) => setDebitFromRestBank(e.target.checked)}
                  className="rounded border-zinc-700 bg-black/60 text-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                />
                <span>Also debit <strong>{durationMinutes}m</strong> from Temporal Leisure Bank (prevents unearned rest passes)</span>
              </label>
            </div>

            {/* 4. SELECT RESTORATIVE KAFFĀRAH (RECOVERY PATH) */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center justify-between">
                <span>3. Choose Restorative Path (نوع الكفارة الاستدراكية)</span>
                <span className="text-[10px] text-zinc-400 font-sans">Sunnah counter-weights</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedKaffarah('focus')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedKaffarah === 'focus'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-md'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Zap className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Focus Counter-Attack</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Locked Pomodoro sprint to restore productive momentum.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedKaffarah('detox')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedKaffarah === 'detox'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-md'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Dopamine Detox</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Screen-free quarantine to reset baseline dopamine.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedKaffarah('quran')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedKaffarah === 'quran'
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-md'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Quran &amp; Istighfār</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    100x Istighfār + tadabbur recitation to polish heart.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedKaffarah('prayer')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedKaffarah === 'prayer'
                      ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-md'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <RubElHizbIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span>2 Rak&apos;ahs Tawbah</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Sunnah prayer of repentance with sincere Sujood.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedKaffarah('sadaqah')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer sm:col-span-2 ${
                    selectedKaffarah === 'sadaqah'
                      ? 'bg-rose-950/40 border-rose-500/50 text-white shadow-md'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <DollarSign className="h-3.5 w-3.5 text-rose-400" />
                    <span>Monetary Sadaqah Charity</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    &ldquo;Charity extinguishes sin as water extinguishes fire.&rdquo; Immediate financial discipline.
                  </p>
                </button>
              </div>

              {/* Realtime Generated Quest Name Preview */}
              <div className="p-3 rounded-xl bg-[#0a0d16] border border-indigo-500/30 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    Auto-Generated Directive to be Created:
                  </div>
                  <div className="text-white font-bold font-sans">
                    [KAFFĀRAH] {calculation.kaffarahTitle}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    Estimated Time: {calculation.estimatedTime}m • Restores +35 HP Soul Vitality &amp; +{calculation.recoveryXp} XP
                  </div>
                </div>
              </div>
            </div>

            {/* 5. SINCERE REFLECTION NOTE (OPTIONAL) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center justify-between">
                <span>4. Root Trigger &amp; Reflection (Optional)</span>
                <span className="text-[10px] text-zinc-400 lowercase">prevent future relapse</span>
              </label>
              <textarea
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
                rows={2}
                placeholder="What triggered this drift? (e.g. Phone was on my desk, feeling tired after Dhohr, avoiding task friction)..."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-sans text-white focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] font-sans text-zinc-400">
                &ldquo;Follow an evil deed with a good deed; it will wipe it out.&rdquo; [Tirmidhi]
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Bind Slip &amp; Launch Recovery Quest</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
