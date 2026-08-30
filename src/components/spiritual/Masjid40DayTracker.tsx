import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Sparkles, Award, Shield, Flame, Heart, 
  ChevronRight, RefreshCw, AlertCircle, Info, Moon, Sun, 
  Compass, Check, BookOpen, Layers, Star, ExternalLink,
  Pickaxe, Zap, Activity
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { RubElHizbIcon, GeometricDivider } from '../IslamicRpgDecorations';
import { ORE_COMPLEXITY_INFO, RARITY_ORE_THEMES } from '../SealingPowerView';
import { AncientCarvedRune } from '../AncientCarvedRune';

interface Masjid40DayTrackerProps {
  onOpenGuide?: (section?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const Masjid40DayTracker: React.FC<Masjid40DayTrackerProps> = ({
  onOpenGuide,
  onNavigateTab
}) => {
  const { 
    systemDate, 
    getSpiritualLog, 
    togglePrayer, 
    getMasjid40Stats, 
    toggleAllPrayersInMasjid,
    resetMasjid40Streak,
    setMasjid40Override,
    getActiveOre,
    getTotalOreXpMultiplier
  } = usePOS();

  const [showHadithExplanation, setShowHadithExplanation] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideInput, setOverrideInput] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const stats = getMasjid40Stats(systemDate);
  const activeOre = getActiveOre();
  const totalMultiplier = getTotalOreXpMultiplier();
  const complexity = ORE_COMPLEXITY_INFO[activeOre.rarity];
  const theme = RARITY_ORE_THEMES[activeOre.rarity];
  
  // Calculate Covenant Resonance: Stage 1 = +5%, Stage 2 = +10%, Stage 3 = +15%, Stage 4 = +20%, Full 40-Day Sanctuary = +25%
  const covenantResonancePercent = stats.currentStreak >= 40 ? 25 : Math.max(5, stats.currentStage.stageNumber * 5);
  const prayerCleavedFacets = Math.min(complexity.facetNumber, Math.floor((stats.currentStreak / 40) * complexity.facetNumber));
  const currentLog = getSpiritualLog(systemDate);

  const prayers = [
    { id: 'fajr' as const, nameEn: 'Fajr', nameAr: 'الفجر', icon: Moon, color: 'indigo' },
    { id: 'dhuhr' as const, nameEn: 'Dhuhr', nameAr: 'الظهر', icon: Sun, color: 'amber' },
    { id: 'asr' as const, nameEn: 'Asr', nameAr: 'العصر', icon: Sun, color: 'orange' },
    { id: 'maghrib' as const, nameEn: 'Maghrib', nameAr: 'المغرب', icon: Sun, color: 'amber' },
    { id: 'isha' as const, nameEn: 'Isha', nameAr: 'العشاء', icon: Moon, color: 'blue' }
  ];

  const stages = [
    {
      stage: 1,
      nameAr: 'البداية واليقظة • إدراك تكبيرة الإحرام',
      nameEn: 'Stage 1: Foundations of Vigilance',
      days: 'Days 1 – 10',
      range: [1, 10],
      desc: 'Cultivating the physical habit of arriving at the Masjid before the opening Takbeer of the Imam.',
      accent: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
    },
    {
      stage: 2,
      nameAr: 'طهارة القلب • محاربة الرياء',
      nameEn: 'Stage 2: Heart Purification & Humility',
      days: 'Days 11 – 20',
      range: [11, 20],
      desc: 'Dissolving ostentation (Riyā\') and anchoring absolute sincerity (Ikhlāṣ) purely for the sake of Allah ﷻ.',
      accent: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300'
    },
    {
      stage: 3,
      nameAr: 'نور الاستقامة • سكينة الصف الأول',
      nameEn: 'Stage 3: Radiance of Steadfastness',
      days: 'Days 21 – 30',
      range: [21, 30],
      desc: 'Friction melts away. The Masjid transforms into the primary spiritual oasis of your day.',
      accent: 'border-amber-500/40 bg-amber-950/20 text-amber-300'
    },
    {
      stage: 4,
      nameAr: 'بشارة البراءتين • الحرية من النار والنفاق',
      nameEn: 'Stage 4: Sanctuary of the Two Freedoms',
      days: 'Days 31 – 40',
      range: [31, 40],
      desc: 'Fulfilling the sacred 40-day covenant sealed by the Prophet\'s ﷺ promise: Freedom from the Fire and Freedom from Hypocrisy.',
      accent: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
    }
  ];

  const handleApplyOverride = () => {
    const num = parseInt(overrideInput, 10);
    if (!isNaN(num) && num >= 0 && num <= 40) {
      setMasjid40Override(num);
      setShowOverrideModal(false);
      setOverrideInput('');
    }
  };

  const handleConfirmReset = () => {
    resetMasjid40Streak(systemDate);
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6" id="masjid-40-day-tracker-root">
      
      {/* 1. SACRED PROPHETIC HADITH BANNER */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#1c160b] via-[#100d07] to-[#0a0805] border-2 border-[#c5a059]/60 rounded-3xl relative overflow-hidden shadow-[0_0_35px_rgba(197,160,89,0.15)] space-y-4">
        
        {/* Background Islamic Pattern */}
        <div className="absolute top-0 right-0 w-96 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#c5a059] fill-current">
            <path d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
          </svg>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c5a059]/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#fef08a]">
                <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#c5a059] uppercase tracking-widest font-bold block">
                  Prophetic Covenant • عَهْدُ الأَرْبَعِينَ يَوْمًا فِي الجَمَاعَة
                </span>
                <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                  The 40-Day Sanctuary of the Two Freedoms (البَرَاءَتَان)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHadithExplanation(!showHadithExplanation)}
                className="px-3 py-1.5 bg-[#2a2211] hover:bg-[#382d17] border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#c5a059]" />
                <span>{showHadithExplanation ? 'HIDE EXEGESIS' : 'HADITH EXEGESIS'}</span>
              </button>

              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-mono rounded-xl transition flex items-center gap-1"
                title="Adjust or calibrate current count"
              >
                <span>Adjust</span>
              </button>
            </div>
          </div>

          {/* ARABIC HADITH TEXT WITH GOLDEN CALLIGRAPHIC ACCENTS */}
          <div className="p-4 bg-[#141008]/80 border border-[#c5a059]/30 rounded-2xl space-y-2 text-center relative overflow-hidden">
            <p className="text-base sm:text-lg md:text-xl font-arabic font-bold text-[#fef08a] leading-loose dir-rtl tracking-wide">
              «مَنْ صَلَّى لِلَّهِ أَرْبَعِينَ يَوْمًا فِي جَمَاعَةٍ يُدْرِكُ التَّكْبِيرَةَ الأُولَى كُتِبَتْ لَهُ بَرَاءَتَانِ: بَرَاءَةٌ مِنَ النَّارِ، وَبَرَاءَةٌ مِنَ النِّفَاقِ»
            </p>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans italic max-w-3xl mx-auto leading-relaxed">
              &ldquo;Whoever prays to Allah for forty days in congregation, catching the first Takbeer (Takbīrat al-Iḥrām), two freedoms are decreed for him: freedom from the Fire, and freedom from hypocrisy.&rdquo;
            </p>
            <div className="pt-1 flex items-center justify-center gap-2 text-[10px] font-mono text-[#c5a059]">
              <span>[ Jāmiʿ at-Tirmidhī #241 • Sunan al-Tirmidhi • Graded Ḥasan ]</span>
            </div>
          </div>

          {/* EXPANDABLE HADITH COMMENTARY */}
          <AnimatePresence>
            {showHadithExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-[#0d0f17] border border-[#c5a059]/30 rounded-2xl text-xs text-zinc-300 space-y-2.5 leading-relaxed font-sans"
              >
                <div className="flex items-center gap-2 font-display font-bold text-[#fef08a] text-sm">
                  <Info className="h-4 w-4 text-[#c5a059]" />
                  <span>Theological Conditions & Insights of the 40-Day Sanctuary</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono text-amber-300 font-bold block">1. Sincerity Solely for Allah (لِلَّهِ)</span>
                    <p className="text-[11px] text-zinc-400">
                      The prayer must be performed purely for Allah&apos;s countenance, devoid of social ostentation, reputation, or praise.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono text-cyan-300 font-bold block">2. In Congregation (فِي جَمَاعَة)</span>
                    <p className="text-[11px] text-zinc-400">
                      All 5 daily obligatory prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) attended in the Masjid with the Muslim community.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono text-emerald-300 font-bold block">3. Catching First Takbeer (يُدْرِكُ التَّكْبِيرَةَ الأُولَى)</span>
                    <p className="text-[11px] text-zinc-400">
                      Being ready in the prayer row before or as the Imam says <em>Allahu Akbar</em>, demonstrating highest reverence and punctuality.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 border-t border-white/5 pt-2 italic">
                  <strong>The Two Freedoms (البَرَاءَتَان):</strong> Freedom from the Fire (salvation from punishment) and Freedom from Hypocrisy (salvation from the traits of hypocrites who find congregational prayer burdensome, particularly Fajr and Isha).
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* 2. HERO PROGRESS GAUGE & TODAY'S PRAYER PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: HERO 40-DAY STREAK COUNTER (7 COLS) */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-gradient-to-b from-[#0e121c] via-[#090b12] to-[#07080d] border border-[#c5a059]/40 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between space-y-5">
          
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider font-bold block">
                Active 40-Day Journey Progress
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
                <span>{stats.milestoneTitle}</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                {stats.currentStage.stageDesc}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Best Streak</span>
              <span className="text-lg font-mono font-bold text-amber-300">{stats.bestStreak} Days</span>
            </div>
          </div>

          {/* MAIN RADIAL/BAR DISPLAY */}
          <div className="p-4 bg-gradient-to-r from-[#17140e] via-[#0e1017] to-[#17140e] border border-[#c5a059]/30 rounded-2xl space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-[#fef08a] drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                  {stats.currentStreak}
                </span>
                <span className="text-lg font-display text-zinc-400">/ 40 Days</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {stats.progressPercent}% Completed
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block">
                  {stats.daysRemaining === 0 ? 'GOAL ATTAINED! ✓' : `${stats.daysRemaining} days remaining`}
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-3 bg-zinc-900/90 rounded-full border border-white/5 overflow-hidden p-0.5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-600 via-[#c5a059] to-[#fef08a] rounded-full shadow-[0_0_12px_rgba(197,160,89,0.5)]"
              />
            </div>

            {/* 4 STAGE CHECKPOINTS */}
            <div className="grid grid-cols-4 gap-1 text-center pt-1 text-[10px] font-mono">
              <div className={`py-1 rounded ${stats.currentStreak >= 10 ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-500'}`}>
                10 Days
              </div>
              <div className={`py-1 rounded ${stats.currentStreak >= 20 ? 'bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-500/30' : 'text-zinc-500'}`}>
                20 Days
              </div>
              <div className={`py-1 rounded ${stats.currentStreak >= 30 ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30' : 'text-zinc-500'}`}>
                30 Days
              </div>
              <div className={`py-1 rounded ${stats.currentStreak >= 40 ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 animate-pulse' : 'text-zinc-500'}`}>
                40 Days (Bara&apos;ah)
              </div>
            </div>
          </div>

          {/* FOOTER CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-mono">Total Historical 5-Masjid Days:</span>
              <span className="font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-md">
                {stats.totalCompletedDays}
              </span>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-zinc-500 hover:text-rose-400 text-[11px] font-mono transition underline underline-offset-2"
            >
              Reset Streak Cycle
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: TODAY'S 5-PRAYER MASJID CHECKLIST & 1-CLICK ACTION (5 COLS) */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-gradient-to-b from-[#0c0f17] via-[#090b11] to-[#07080c] border border-white/10 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                Today&apos;s Congregation Log • {systemDate}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${stats.isTodayFullyCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-900 text-amber-300'}`}>
                {stats.todayMasjidCount} / 5 in Masjid
              </span>
            </div>
            <h4 className="text-base font-display font-bold text-white">
              Daily 5-Salaat Masjid Fulfillment
            </h4>
            <p className="text-xs text-zinc-400 font-sans">
              Pray all 5 in the Masjid to mark today fulfilled towards the 40-Day Sanctuary.
            </p>
          </div>

          {/* 5 PRAYER PILLS */}
          <div className="space-y-2">
            {prayers.map(prayer => {
              const prayState = currentLog[prayer.id];
              const isInMasjid = prayState?.inMasjid && prayState?.fardh;
              const Icon = prayer.icon;

              return (
                <div
                  key={prayer.id}
                  onClick={() => togglePrayer(prayer.id, 'inMasjid', systemDate)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isInMasjid
                      ? 'bg-gradient-to-r from-emerald-950/60 to-[#0e161f] border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isInMasjid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-zinc-200 block">{prayer.nameEn} ({prayer.nameAr})</span>
                      <span className="text-[10px] text-zinc-400">
                        {isInMasjid ? 'Performed in Masjid / Jamā\'ah ✓' : 'Click to log in congregation'}
                      </span>
                    </div>
                  </div>

                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center border ${isInMasjid ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/10 bg-zinc-800/80 text-zinc-600'}`}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 1-CLICK COMPLETE ALL 5 IN MASJID */}
          <button
            onClick={() => toggleAllPrayersInMasjid(systemDate)}
            className={`w-full py-3 px-4 rounded-2xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${
              stats.isTodayFullyCompleted
                ? 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border border-emerald-500/50 text-emerald-100'
                : 'bg-gradient-to-r from-[#2a2211] via-[#3d3119] to-[#2a2211] hover:from-[#3a2f18] hover:to-[#3a2f18] border border-[#c5a059]/60 text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.2)]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#c5a059]" />
            <span>
              {stats.isTodayFullyCompleted 
                ? 'ALL 5 IN MASJID FULFILLED TODAY ✓ (+1 Day Streak)' 
                : 'MARK ALL 5 IN MASJID TODAY (+250 XP BONUS)'}
            </span>
          </button>

        </div>

      </div>

      {/* COVENANT ORE CRYSTALLIZATION & CLEAVING RESONANCE */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d1017] via-[#090b10] to-[#121622] border border-[#c5a059]/30 rounded-3xl relative overflow-hidden shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <AncientCarvedRune
                glyph={activeOre.runeSymbol || '💎'}
                size={48}
                shape="octagram"
                stoneVariant="meteorite"
                conduitColor={theme.veinColor}
                secondaryColor="#fef08a"
                glowIntensity="radiant"
                showCracks={true}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold z-10"
                style={{ backgroundColor: theme.veinColor, borderColor: '#000000', color: '#000000' }}
              >
                ✦
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${theme.veinColor}20`,
                    borderColor: `${theme.veinColor}60`,
                    color: theme.veinColor
                  }}
                >
                  {activeOre.rarity} ORE IN CRUCIBLE
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {complexity.facetCount} FACET MATRIX
                </span>
              </div>
              <h3 className="text-base font-display font-bold text-white mt-0.5">
                {activeOre.name}: Congregational Crystalline Resonance
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Covenant Cleave Multiplier</span>
              <span className="text-base font-mono font-bold text-[#fef08a] flex items-center justify-end gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                +{covenantResonancePercent}% Multiplier Boost
              </span>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="px-3 py-2 bg-[#181d2a] hover:bg-[#202738] border border-[#c5a059]/40 rounded-xl text-xs font-mono text-[#e5c875] font-bold flex items-center gap-1.5 transition shrink-0 shadow-md"
              >
                <span>OPEN CRUCIBLE</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#c5a059]" />
              </button>
            )}
          </div>
        </div>

        {/* FACET CLEAVING PROGRESSION FROM MASJID PRAYERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Facet Cleaving */}
          <div className="p-3.5 rounded-2xl bg-[#090c14] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Pickaxe className="h-3.5 w-3.5 text-[#c5a059]" />
                <span>Congregational Facet Cleave</span>
              </span>
              <span className="font-bold text-[#fef08a]">
                {prayerCleavedFacets} / {complexity.facetNumber} Facets
              </span>
            </div>
            
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(8, (prayerCleavedFacets / complexity.facetNumber) * 100)}%`,
                  background: `linear-gradient(90deg, ${theme.veinColor}, #fef08a)`
                }}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              Each 5-prayer Masjid day cleaves and polishes the raw mineral matrix.
            </p>
          </div>

          {/* Card 2: Divine Purity State */}
          <div className="p-3.5 rounded-2xl bg-[#090c14] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Crucible Purification</span>
              </span>
              <span className="font-bold text-emerald-400">
                {stats.currentStreak > 0 ? 'SANCTIFIED BY JAMA\'AH' : 'NEUTRAL PURITY'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
              <span className="text-emerald-300 font-bold">Stage {stats.currentStage.stageNumber}:</span>
              <span>{stats.currentStage.stageNameEn} ({stats.currentStage.stageNameAr})</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              Consecutive congregation shields the ore against corrosion from spiritual slips.
            </p>
          </div>

          {/* Card 3: Live XP Multiplier Stacking */}
          <div className="p-3.5 rounded-2xl bg-[#090c14] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Effective Crucible Yield</span>
              </span>
              <span className="font-bold text-amber-300">
                +{Math.round((totalMultiplier - 1.0) * 100) + covenantResonancePercent}% Total XP
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-300">
              <span>Ore Multiplier:</span>
              <span className="text-[#fef08a] font-bold">+{Math.round(((activeOre.xpBonusMultiplier || 1.0) - 1.0) * 100)}%</span>
              <span className="text-zinc-500">+</span>
              <span>Covenant:</span>
              <span className="text-emerald-400 font-bold">+{covenantResonancePercent}%</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              Stacking active ore buff: {activeOre.buffName || 'Awakened Will'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. THE 40-DAY SACRED BEAD MATRIX (40 INTERACTIVE TILES) */}
      <div className="p-5 sm:p-6 bg-[#0a0c12] border border-white/10 rounded-3xl relative overflow-hidden shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3 w-3 text-amber-400" />
                <span>THE 40-DAY BEAD MATRIX • مَصْفُوفَةُ الأَرْبَعِينَ</span>
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-zinc-100">
              The 40 Illuminated Congregation Milestones
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Each bead represents 24 hours of total congregational devotion (5 prayers in the Masjid).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span>Fulfilled</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span>Upcoming</span>
            </div>
          </div>
        </div>

        {/* 40 TILES IN 4 STAGE GROUPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map(st => {
            const isStageActive = stats.currentStage.stageNumber === st.stage;
            const isStageCompleted = stats.currentStreak >= st.range[1];

            return (
              <div
                key={st.stage}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  isStageCompleted
                    ? 'bg-gradient-to-b from-[#0a141a] to-[#070b10] border-emerald-500/40 shadow-sm'
                    : isStageActive
                      ? 'bg-gradient-to-b from-[#14120b] to-[#090b10] border-[#c5a059]/60 shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                      : 'bg-zinc-950/60 border-white/5 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                      {st.days}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isStageCompleted 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                        : isStageActive
                          ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40'
                          : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {isStageCompleted ? 'COMPLETE ✓' : (isStageActive ? 'CURRENT' : 'LOCKED')}
                    </span>
                  </div>

                  <h5 className="text-xs font-display font-bold text-zinc-200 mt-2">
                    {st.nameEn}
                  </h5>
                  <p className="text-[10px] font-arabic text-[#c5a059] mt-0.5 dir-rtl">
                    {st.nameAr}
                  </p>
                </div>

                {/* 10 BEADS PER STAGE */}
                <div className="grid grid-cols-5 gap-1.5 pt-2">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const dayNumber = (st.stage - 1) * 10 + (idx + 1);
                    const isPassed = stats.currentStreak >= dayNumber;
                    const isCurrent = stats.currentStreak + 1 === dayNumber && !isPassed;

                    return (
                      <div
                        key={dayNumber}
                        className={`h-9 rounded-xl flex flex-col items-center justify-center border transition-all text-xs font-mono ${
                          isPassed
                            ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-500/50 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)] font-bold'
                            : isCurrent
                              ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold shadow-[0_0_12px_rgba(197,160,89,0.3)] animate-pulse'
                              : 'bg-zinc-900/60 border-white/5 text-zinc-600'
                        }`}
                        title={`Day ${dayNumber} of 40`}
                      >
                        <span className="text-[10px]">{dayNumber}</span>
                        {isPassed && <Check className="h-2.5 w-2.5 text-emerald-400 stroke-[3] -mt-0.5" />}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10.5px] text-zinc-400 font-sans line-clamp-2 border-t border-white/5 pt-2">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. THE COVENANT VICTORY BANNER (UNLOCKED UPON REACHING 40 DAYS) */}
      {stats.isBaraatanAchieved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-r from-[#1c160b] via-[#2a220f] to-[#1c160b] border-2 border-[#c5a059] rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.35)] text-center space-y-4"
        >
          <div className="inline-flex p-3 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/60 text-[#fef08a] shadow-[0_0_20px_rgba(197,160,89,0.3)]">
            <Award className="h-8 w-8 text-[#c5a059]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#c5a059] font-bold block">
              Divine Fulfillment • بُشْرَى النَّبِيِّ ﷺ
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#fef08a]">
              حَامِلُ البَرَاءَتَيْنِ • BEARER OF THE TWO FREEDOMS
            </h2>
            <p className="text-sm text-zinc-200 font-sans max-w-2xl mx-auto leading-relaxed pt-1">
              You have completed 40 consecutive days of praying in congregation, catching the first Takbeer! The Prophet ﷺ decreed: <strong>Freedom from the Fire and Freedom from Hypocrisy</strong>. May Allah accept your steadfastness and grant you firm persistence (Istiqāmah).
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              🔥 Freedom from the Fire (براءة من النار) ✓
            </span>
            <span className="px-4 py-1.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold">
              🛡️ Freedom from Hypocrisy (براءة من النفاق) ✓
            </span>
          </div>
        </motion.div>
      )}

      {/* 5. MODAL: ADJUST / OVERRIDE DAY COUNT */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-[#0f121a] border border-[#c5a059]/50 rounded-2xl max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  <span>Adjust 40-Day Sanctuary Count</span>
                </h3>
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="text-zinc-500 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-300 font-sans">
                If you were already on an ongoing streak of 40 days in congregation or wish to synchronize your baseline, enter your current completed day count (0 to 40):
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400">Current Day Count (0 – 40):</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={overrideInput}
                  onChange={e => setOverrideInput(e.target.value)}
                  placeholder={`Current: ${stats.currentStreak}`}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyOverride}
                  className="px-4 py-2 rounded-xl bg-[#2a2211] hover:bg-[#382d17] border border-[#c5a059]/60 text-xs font-mono font-bold text-[#fef08a] transition"
                >
                  Save Count
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL: CONFIRM RESET */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-[#160c0c] border border-rose-500/40 rounded-2xl max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2 text-rose-300 font-display font-bold text-base">
                <AlertCircle className="h-5 w-5 text-rose-400" />
                <span>Reset 40-Day Sanctuary Streak?</span>
              </div>

              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                This will reset your current active consecutive streak to 0 so you can begin a fresh 40-day cycle. Your lifetime historical prayer logs will remain preserved.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono font-bold text-rose-200 transition"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
