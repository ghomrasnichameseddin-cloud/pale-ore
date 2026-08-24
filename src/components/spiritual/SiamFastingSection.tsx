import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Moon, Sun, CheckCircle2, Sparkles, AlertCircle, 
  BookOpen, ChevronDown, Check, Info, Flame
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { FastingType, FastingLog } from '../../types';
import { HijriDateInfo } from '../../utils/hijriCalendar';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface SiamFastingSectionProps {
  systemDate: string;
  hijriInfo: HijriDateInfo;
  fastingLog?: FastingLog;
  onOpenGuide?: (section?: string) => void;
}

const FASTING_TYPES_CONFIG: {
  id: FastingType;
  nameEn: string;
  nameAr: string;
  description: string;
  hadithContext: string;
  recommendedToday?: boolean;
}[] = [
  {
    id: 'Monday_Thursday',
    nameEn: 'Monday & Thursday Sunnah',
    nameAr: 'صِيَامُ الإِثْنَيْنِ وَالخَمِيس',
    description: 'Weekly sunnah fasts when deeds are presented to Allah Almighty.',
    hadithContext: '"Deeds are presented on Mondays and Thursdays, and I love that my deeds be presented while I am fasting." (Tirmidhi)'
  },
  {
    id: 'Ayyam_al_Beed',
    nameEn: 'The White Days (13, 14, 15)',
    nameAr: 'صِيَامُ الأَيَّامِ البِيض',
    description: 'Fasting the 13th, 14th, and 15th nights of each lunar Hijri month.',
    hadithContext: '"Fasting three days of every month is equivalent to fasting for a lifetime." (Bukhari & Muslim)'
  },
  {
    id: 'Ramadan',
    nameEn: 'Holy Ramadan Obligation',
    nameAr: 'صِيَامُ شَهْرِ رَمَضَان',
    description: 'The mandatory pillar of Islam during the sacred month of Ramadan.',
    hadithContext: '"Whoever fasts Ramadan out of faith and in the hope of reward, his previous sins will be forgiven." (Bukhari)'
  },
  {
    id: 'Arafah',
    nameEn: 'Day of Arafah (9 Dhul-Hijjah)',
    nameAr: 'صِيَامُ يَوْمِ عَرَفَة',
    description: 'For non-pilgrims, expiates sins of the previous year and the coming year.',
    hadithContext: '"It expiates the sins of the past year and the coming year." (Muslim)'
  },
  {
    id: 'Ashura_Tasua',
    nameEn: 'Ashura & Tasu\'a (9 & 10 Muharram)',
    nameAr: 'صِيَامُ عَاشُورَاء وَتَاسُوعَاء',
    description: 'Day of victory for Musa (AS) and gratitude to Allah Almighty.',
    hadithContext: '"Fasting the day of Ashura expiates the previous year." (Muslim)'
  },
  {
    id: 'Shawwal_Six',
    nameEn: 'Six Days of Shawwal',
    nameAr: 'صِيَامُ سِتَّةِ أَيَّامٍ مِنْ شَوَّال',
    description: 'Fasting 6 days after Eid al-Fitr completes the reward of fasting a whole year.',
    hadithContext: '"Whoever fasts Ramadan then follows it with six days of Shawwal, it is as if he fasted for a lifetime." (Muslim)'
  },
  {
    id: 'Dawud',
    nameEn: 'Fast of Prophet Dawud (AS)',
    nameAr: 'صِيَامُ نَبِيِّ اللهِ دَاوُد',
    description: 'Fasting on alternate days — the most beloved voluntary fast to Allah.',
    hadithContext: '"The most beloved fast to Allah is the fast of Dawud: he would fast one day and break his fast the next." (Bukhari)'
  },
  {
    id: 'Qada',
    nameEn: 'Qadā\' (Make-Up Fast)',
    nameAr: 'قَضَاءُ صِيَامٍ فَائِت',
    description: 'Making up missed obligatory days with sincere intention.',
    hadithContext: 'Fulfilling the debt of obligatory days owed to Allah before next Ramadan.'
  },
  {
    id: 'Nawafil_General',
    nameEn: 'General Voluntary Sunnah Fast',
    nameAr: 'صِيَامُ تَطَوُّعٍ مُطْلَق',
    description: 'Voluntary fasting on any lawful day for spiritual purification and closeness to Allah.',
    hadithContext: '"Whoever fasts a day for the sake of Allah, Allah will distance his face from the Fire by seventy years." (Bukhari)'
  }
];

export const SiamFastingSection: React.FC<SiamFastingSectionProps> = ({
  systemDate,
  hijriInfo,
  fastingLog,
  onOpenGuide
}) => {
  const { toggleFasting } = usePOS();
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const isFasting = fastingLog?.isFasting || false;
  const currentType = fastingLog?.fastingType;
  const suhurTaken = fastingLog?.suhurTaken || false;
  const iftarCompleted = fastingLog?.iftarCompleted || false;
  const duaMadeAtIftar = fastingLog?.duaMadeAtIftar || false;

  // Determine auto-recommended fast based on today's Hijri & Gregorian date
  const isMondayOrThursday = hijriInfo.dayOfWeekEn === 'Monday' || hijriInfo.dayOfWeekEn === 'Thursday';
  const isWhiteDay = hijriInfo.hijriDay >= 13 && hijriInfo.hijriDay <= 15;
  const isRamadan = hijriInfo.hijriMonth === 9;
  const isArafahDay = hijriInfo.hijriMonth === 12 && hijriInfo.hijriDay === 9;
  const isAshuraDay = hijriInfo.hijriMonth === 1 && (hijriInfo.hijriDay === 9 || hijriInfo.hijriDay === 10);
  const isShawwalMonth = hijriInfo.hijriMonth === 10 && hijriInfo.hijriDay > 1;

  let recommendedType: FastingType = 'Monday_Thursday';
  let recommendedReason = '';

  if (isRamadan) {
    recommendedType = 'Ramadan';
    recommendedReason = 'Holy Month of Ramadan (Fardh Obligation)';
  } else if (isArafahDay) {
    recommendedType = 'Arafah';
    recommendedReason = 'Day of Arafah (9 Dhul-Hijjah - Great Virtues)';
  } else if (isAshuraDay) {
    recommendedType = 'Ashura_Tasua';
    recommendedReason = 'Ashura / Tasu\'a (Muharram Fasting)';
  } else if (isWhiteDay) {
    recommendedType = 'Ayyam_al_Beed';
    recommendedReason = `The White Days (${hijriInfo.hijriDay}th of ${hijriInfo.hijriMonthNameEn})`;
  } else if (isMondayOrThursday) {
    recommendedType = 'Monday_Thursday';
    recommendedReason = `Blessed ${hijriInfo.dayOfWeekEn} (Deeds presented to Allah)`;
  } else if (isShawwalMonth) {
    recommendedType = 'Shawwal_Six';
    recommendedReason = 'Month of Shawwal (Virtue of 6 Days Fast)';
  } else {
    recommendedType = 'Nawafil_General';
    recommendedReason = 'Voluntary Fast for Spiritual Purification';
  }

  const selectedConfig = FASTING_TYPES_CONFIG.find(t => t.id === (currentType || recommendedType)) || FASTING_TYPES_CONFIG[0];

  return (
    <div className="p-5 sm:p-6 bg-gradient-to-br from-[#0e1619] via-[#091113] to-[#060a0c] border border-emerald-500/30 rounded-2xl relative overflow-hidden shadow-xl space-y-5" id="siam-fasting-sanctuary">
      
      {/* HEADER WITH BADGE AND CONTEXT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5">
              <RubElHizbIcon className="h-3 w-3 text-emerald-400" />
              <span>بَابُ الرَّيَّان • BĀB AL-RAYYĀN & SIAM</span>
            </span>

            {isFasting && (
              <span className="text-[10px] font-mono bg-amber-950/70 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                🌟 Active Fast (صَائِم اليَوْم)
              </span>
            )}

            {recommendedReason && !isFasting && (
              <span className="text-[10px] font-mono bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ✨ {recommendedReason}
              </span>
            )}
          </div>

          <h3 className="text-lg font-display font-bold text-zinc-100 flex items-center gap-2">
            <span>The Sacred Fast of the Believer (صيام التطوع والفرائض)</span>
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
            &ldquo;Fasting is a shield. When one of you is fasting, he should neither indulge in obscenity nor raise his voice.&rdquo;
          </p>
        </div>

        {/* PRIMARY TOGGLE BUTTON */}
        <button
          onClick={() => toggleFasting('isFasting', currentType || recommendedType, systemDate)}
          className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md ${
            isFasting
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-[#07090e] hover:bg-emerald-950/40 border-white/10 hover:border-emerald-500/40 text-zinc-200 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${isFasting ? 'text-emerald-400' : 'text-zinc-500'}`} />
          <span>{isFasting ? 'FASTING TODAY ✓ (صائم)' : 'LOG FASTING TODAY (+50 XP)'}</span>
        </button>
      </div>

      {/* FASTING TYPE SELECTOR & HADITH CONTEXT CARD */}
      <div className="p-4 bg-[#070b0d] border border-emerald-500/20 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Intention / Fast Category:</span>
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="px-3 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5"
            >
              <span>{selectedConfig.nameEn} ({selectedConfig.nameAr})</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showTypeSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <span className="text-[11px] font-mono text-amber-200/80">
            Reward: +200 XP Potential Total • +35 Coins • +5 Momentum
          </span>
        </div>

        {/* Dropped Selector Menu */}
        {showTypeSelector && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20"
          >
            {FASTING_TYPES_CONFIG.map(type => {
              const isSelected = (currentType || recommendedType) === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    if (isFasting) {
                      toggleFasting('isFasting', type.id, systemDate);
                    } else {
                      toggleFasting('isFasting', type.id, systemDate);
                    }
                    setShowTypeSelector(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between space-y-1 ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-sm'
                      : 'bg-[#0a0f12] hover:bg-emerald-950/30 border-white/5 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-display">{type.nameEn}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] text-amber-200 font-display">{type.nameAr}</span>
                  <span className="text-[10px] text-zinc-400 font-sans line-clamp-1">{type.description}</span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Hadith Context Quote */}
        <div className="p-3 bg-[#0a1215]/80 border border-emerald-500/10 rounded-lg text-xs font-sans text-emerald-200/90 italic flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
          <span>{selectedConfig.hadithContext}</span>
        </div>
      </div>

      {/* THREE INTERACTIVE PROTOCOL STEPS: SUHUR, IFTAR, AND DUA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* 1. SUHUR (السحور) */}
        <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
          suhurTaken
            ? 'bg-gradient-to-br from-[#0d1c15] to-[#07110c] border-emerald-500/40 shadow-sm'
            : 'bg-[#070b0d] border-white/10 hover:border-emerald-500/30'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="font-display font-bold text-zinc-100 text-sm">Sunnah of Suhūr (السَّحُور)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                +25 XP
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
              Pre-dawn meal eaten before Fajr. &ldquo;Eat Suhur, for in Suhur there is blessing.&rdquo;
            </p>
          </div>

          <button
            onClick={() => toggleFasting('suhurTaken', currentType || recommendedType, systemDate)}
            className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
              suhurTaken
                ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-100 shadow-sm'
                : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${suhurTaken ? 'text-emerald-400' : 'text-zinc-600'}`} />
            <span>{suhurTaken ? 'SUHŪR TAKEN ✓' : 'LOG SUHŪR (+25 XP)'}</span>
          </button>
        </div>

        {/* 2. IFTAR COMPLETED (إتمام الصيام والإفطار) */}
        <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
          iftarCompleted
            ? 'bg-gradient-to-br from-[#1c1810] to-[#0d0b07] border-[#c5a059]/50 shadow-sm'
            : 'bg-[#070b0d] border-white/10 hover:border-[#c5a059]/30'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#1c1810] border border-[#c5a059]/40 text-[#e5c875]">
                  <Moon className="h-4 w-4 text-[#c5a059]" />
                </div>
                <span className="font-display font-bold text-zinc-100 text-sm">Iftār Completion (إِتْمَامُ الصِّيَام)</span>
              </div>
              <span className="text-[10px] font-mono text-amber-200 font-bold bg-[#1c1810] border border-[#c5a059]/40 px-2 py-0.5 rounded-full">
                +125 XP • +20 C
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
              Completing the day's fast until sunset (Maghrib). Guarding the tongue, heart, and gaze.
            </p>
          </div>

          <button
            onClick={() => toggleFasting('iftarCompleted', currentType || recommendedType, systemDate)}
            className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
              iftarCompleted
                ? 'bg-[#1c1810] border-[#c5a059]/70 text-amber-100 shadow-sm'
                : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${iftarCompleted ? 'text-[#e5c875]' : 'text-zinc-600'}`} />
            <span>{iftarCompleted ? 'FAST COMPLETED ✓ (مُتَمِّم)' : 'COMPLETE FAST (+125 XP)'}</span>
          </button>
        </div>

        {/* 3. DUA AT IFTAR (دعاء الإفطار) */}
        <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
          duaMadeAtIftar
            ? 'bg-gradient-to-br from-[#0c181a] to-[#070f12] border-cyan-500/40 shadow-sm'
            : 'bg-[#070b0d] border-white/10 hover:border-cyan-500/30'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-display font-bold text-zinc-100 text-sm">Du\'ā at Iftār (دُعَاءُ الإِفْطَار)</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                +25 XP
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
              The supplication of the fasting person at the moment of breaking fast is never rejected.
            </p>
          </div>

          <button
            onClick={() => toggleFasting('duaMadeAtIftar', currentType || recommendedType, systemDate)}
            className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
              duaMadeAtIftar
                ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-100 shadow-sm'
                : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${duaMadeAtIftar ? 'text-cyan-400' : 'text-zinc-600'}`} />
            <span>{duaMadeAtIftar ? 'DU\'Ā RECITED ✓' : 'RECITE IFTĀR DU\'Ā (+25 XP)'}</span>
          </button>
        </div>
      </div>

      {/* AUTHENTIC MASNOON IFTAR SUPPLICATIONS BANNER */}
      <div className="p-4 bg-[#0a0f12] border border-white/10 rounded-xl space-y-2.5">
        <div className="flex items-center gap-2 text-amber-200 text-xs font-mono font-bold uppercase">
          <BookOpen className="h-3.5 w-3.5 text-[#c5a059]" />
          <span>Masnoon Prophetic Du\'ās for Breaking the Fast (أدعية الإفطار المأثورة)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Dua 1 (Abu Dawud) */}
          <div className="p-3 bg-[#070a0c] border border-white/5 rounded-lg space-y-1.5">
            <p className="text-sm font-display text-amber-100 text-right leading-relaxed" dir="rtl">
              «ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ العُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ الله»
            </p>
            <p className="text-[11px] text-zinc-300 font-sans italic">
              &ldquo;Dhahaba adh-Dhama'u, wabtallat al-'urooqu, wa thabata al-ajru in sha Allah.&rdquo;
            </p>
            <span className="text-[10px] text-zinc-500 font-mono block">
              &ldquo;The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.&rdquo; (Abu Dawud 2357)
            </span>
          </div>

          {/* Dua 2 */}
          <div className="p-3 bg-[#070a0c] border border-white/5 rounded-lg space-y-1.5">
            <p className="text-sm font-display text-amber-100 text-right leading-relaxed" dir="rtl">
              «اللَّهُمَّ إِنِّي لَكَ صُمْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ»
            </p>
            <p className="text-[11px] text-zinc-300 font-sans italic">
              &ldquo;Allahumma inni laka sumtu, wa 'ala rizqika aftartu.&rdquo;
            </p>
            <span className="text-[10px] text-zinc-500 font-mono block">
              &ldquo;O Allah, for You I have fasted, and upon Your provision I have broken my fast.&rdquo; (Abu Dawud)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
