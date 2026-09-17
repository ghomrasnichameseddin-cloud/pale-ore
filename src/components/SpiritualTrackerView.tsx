import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Sparkles, Scale, Clock, Moon, Sun, Award, ChevronLeft, 
  ChevronRight, RefreshCw, AlertTriangle, BookOpen, ShieldCheck, Heart, 
  Plus, Minus, Flame, ArrowUpRight, Check, Compass, Shield, HelpCircle,
  Calendar, Layers, Zap, Bed
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { getHijriDate } from '../utils/hijriCalendar';
import { addDays } from '../utils/dateUtils';
import { RubElHizbIcon, GeometricDivider, ArabesqueCorner } from './IslamicRpgDecorations';
import { SpiritualDailyLog, PrayerCheck, PostSalahDhikrMode } from '../types';
import { SiamFastingSection } from './spiritual/SiamFastingSection';
import { SunnahPrayersSection } from './spiritual/SunnahPrayersSection';
import { AdhkarSection } from './spiritual/AdhkarSection';
import { QuranSection } from './spiritual/QuranSection';
import { SacredProtocolScorecard } from './spiritual/SacredProtocolScorecard';
import { Masjid40DayTracker } from './spiritual/Masjid40DayTracker';
import { PostSalahAdhkarModal } from './spiritual/PostSalahAdhkarModal';
import { SleepAdhkarModal } from './spiritual/SleepAdhkarModal';

interface SpiritualTrackerViewProps {
  onOpenMuhasabahAudit?: () => void;
  onOpenGuide?: (section?: string) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}

export const SpiritualTrackerView: React.FC<SpiritualTrackerViewProps> = ({
  onOpenMuhasabahAudit,
  onOpenGuide,
  onNavigateTab,
  onNavigate
}) => {
  const handleNav = onNavigateTab || onNavigate;
  const { 
    state, 
    systemDate, 
    setSystemDate, 
    syncWithRealClock, 
    getSpiritualLog,
    togglePrayer,
    toggleAllPrayersInMasjid,
    updateQiyam,
    setKhushuRating,
    toggleAdhkar,
    incrementSalawat,
    toggleFasting,
    updateSunnahPrayers,
    updateDhikrLog,
    updateQuranLog,
    getTodayMuhasabahStats,
    getMasjid40Stats,
    getAdhkarFortressStats,
    getQuranFreshnessScore
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'overview' | 'salaat' | 'masjid40' | 'sunnah' | 'siam' | 'adhkar' | 'quran' | 'audit'>('overview');
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [selectedPostPrayer, setSelectedPostPrayer] = useState<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>('fajr');
  const [isPostAdhkarModalOpen, setIsPostAdhkarModalOpen] = useState(false);
  const [sleepModalTab, setSleepModalTab] = useState<'dhohr' | 'night'>('night');
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  const currentLog: SpiritualDailyLog = getSpiritualLog(systemDate);
  const hijriInfo = getHijriDate(systemDate);
  const mizanStats = getTodayMuhasabahStats();
  const masjid40Stats = getMasjid40Stats(systemDate);

  const postMap = currentLog.dhikr?.postSalahAdhkar || {};
  const postIstighfarMap = currentLog.dhikr?.postSalahIstighfar || {};
  const completedPostPrayersCount = (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).filter(p => {
    const mode = postMap[p];
    return mode === 'standard33' || mode === 'mini10';
  }).length;

  const handleSetPostSalah = (prayerId: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', mode: PostSalahDhikrMode) => {
    updateDhikrLog({
      postSalahAdhkar: {
        ...postMap,
        [prayerId]: mode
      }
    }, systemDate);
  };

  const handleTogglePostIstighfar = (prayerId: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    updateDhikrLog({
      postSalahIstighfar: {
        ...postIstighfarMap,
        [prayerId]: !postIstighfarMap[prayerId]
      }
    }, systemDate);
  };

  const shiftDate = (days: number) => {
    try {
      setSystemDate(addDays(systemDate, days));
    } catch (e) {
      console.error(e);
    }
  };

  // Prayers configuration with refined styling metadata
  const prayersConfig = [
    {
      id: 'fajr' as const,
      nameEn: 'Fajr',
      nameAr: 'الفَجْر',
      fardhRakats: 2,
      timeLabel: 'Dawn (Before Sunrise)',
      icon: Moon,
      gradient: 'from-indigo-950/70 via-[#10162a] to-[#0c0f18]',
      accentColor: 'text-indigo-300',
      iconBg: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300',
      fardhXp: 150,
      fardhCoins: 15,
      sunnahLabel: '2 R. before (Better than world)',
      sunnahXp: 40,
      sunnahCoins: 5,
      masjidXp: 50,
      masjidCoins: 5
    },
    {
      id: 'dhuhr' as const,
      nameEn: 'Dhuhr',
      nameAr: 'الظُّهْر',
      fardhRakats: 4,
      timeLabel: 'Midday / Noon',
      icon: Sun,
      gradient: 'from-amber-950/50 via-[#1a150c] to-[#0c0f18]',
      accentColor: 'text-amber-300',
      iconBg: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
      fardhXp: 100,
      fardhCoins: 10,
      sunnahLabel: '4 R. before & 2 R. after',
      sunnahXp: 45,
      sunnahCoins: 5,
      masjidXp: 50,
      masjidCoins: 5
    },
    {
      id: 'asr' as const,
      nameEn: 'Asr',
      nameAr: 'العَصْر',
      fardhRakats: 4,
      timeLabel: 'Late Afternoon',
      icon: Sun,
      gradient: 'from-orange-950/40 via-[#19130d] to-[#0c0f18]',
      accentColor: 'text-amber-300',
      iconBg: 'bg-orange-950/60 border-orange-500/30 text-orange-300',
      fardhXp: 120,
      fardhCoins: 12,
      sunnahLabel: '4 R. before Fardh',
      sunnahXp: 30,
      sunnahCoins: 5,
      masjidXp: 50,
      masjidCoins: 5
    },
    {
      id: 'maghrib' as const,
      nameEn: 'Maghrib',
      nameAr: 'المَغْرِب',
      fardhRakats: 3,
      timeLabel: 'Sunset / Twilight',
      icon: Moon,
      gradient: 'from-rose-950/40 via-[#190f14] to-[#0c0f18]',
      accentColor: 'text-rose-300',
      iconBg: 'bg-rose-950/60 border-rose-500/30 text-rose-300',
      fardhXp: 100,
      fardhCoins: 10,
      sunnahLabel: '2 R. after Fardh',
      sunnahXp: 30,
      sunnahCoins: 5,
      masjidXp: 50,
      masjidCoins: 5
    },
    {
      id: 'isha' as const,
      nameEn: 'Isha',
      nameAr: 'العِشَاء',
      fardhRakats: 4,
      timeLabel: 'Nightfall',
      icon: Moon,
      gradient: 'from-blue-950/50 via-[#0d1424] to-[#0c0f18]',
      accentColor: 'text-blue-300',
      iconBg: 'bg-blue-950/60 border-blue-500/30 text-blue-300',
      fardhXp: 110,
      fardhCoins: 10,
      sunnahLabel: '2 R. after Fardh',
      sunnahXp: 30,
      sunnahCoins: 5,
      masjidXp: 50,
      masjidCoins: 5
    }
  ];

  // Daily statistics
  const completedFardhCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(
    p => currentLog[p as keyof SpiritualDailyLog] && (currentLog[p as keyof SpiritualDailyLog] as PrayerCheck).fardh
  ).length;

  const onTimeCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(
    p => currentLog[p as keyof SpiritualDailyLog] && (currentLog[p as keyof SpiritualDailyLog] as PrayerCheck).onTime
  ).length;

  const masjidCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(
    p => currentLog[p as keyof SpiritualDailyLog] && (currentLog[p as keyof SpiritualDailyLog] as PrayerCheck).inMasjid
  ).length;

  const qiyamRakats = currentLog.qiyamRakats || 0;
  const qiyamWitr = currentLog.qiyamWitr || false;
  const khushuRating = currentLog.khushuRating || 8;
  const duhaRakats = currentLog.sunnahPrayers?.duhaRakats || 0;
  const salawatCount = currentLog.salawatCount || 0;
  const fortressStats = getAdhkarFortressStats ? getAdhkarFortressStats(systemDate) : null;
  const quranFreshness = getQuranFreshnessScore ? getQuranFreshnessScore(systemDate) : null;

  // 12 Sunan Rawātib calculation
  const fajrRawatib = !!currentLog.fajr?.sunnahRawatib;
  const dhuhrRawatib = !!currentLog.dhuhr?.sunnahRawatib;
  const maghribRawatib = !!currentLog.maghrib?.sunnahRawatib;
  const ishaRawatib = !!currentLog.isha?.sunnahRawatib;
  const rawatibRakatsCompleted = 
    (fajrRawatib ? 2 : 0) +
    (dhuhrRawatib ? 6 : 0) +
    (maghribRawatib ? 2 : 0) +
    (ishaRawatib ? 2 : 0);
  const houseInJannahAchieved = rawatibRakatsCompleted >= 12;

  // 10 Pillars Live Quality Score calculation for Daily Hub
  const prayersArr = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  const pDelayedCount = prayersArr.filter(p => currentLog[p]?.delayed).length;
  const rawP1 = Math.max(0, Math.min(10, Math.round((completedFardhCount * 1.6 + onTimeCount * 0.4 - pDelayedCount * 1.0) * 10) / 10));
  const rawP2 = Math.min(10, masjidCount * 2);
  const rawP3 = Math.min(10, Math.round((rawatibRakatsCompleted / 12) * 10));
  let rawP4 = 0;
  if (qiyamRakats >= 4 && qiyamWitr) rawP4 = 10;
  else if (qiyamRakats >= 2 && qiyamWitr) rawP4 = 8.5;
  else if (qiyamRakats >= 2) rawP4 = 6.0;
  else if (qiyamWitr) rawP4 = 4.0;
  const isFastingToday = !!currentLog.fasting?.isFasting;
  const rawP5 = isFastingToday 
    ? (4 + (currentLog.fasting?.suhurTaken ? 2 : 0) + (currentLog.fasting?.iftarCompleted ? 2.5 : 0) + (currentLog.fasting?.duaMadeAtIftar ? 1.5 : 0))
    : 7;
  const rawP6 = fortressStats ? Math.min(10, Math.round((fortressStats.integrityScore / 10) * 10) / 10) : 0;
  const postRemembrance = currentLog.dhikr?.postSalahAdhkar || {};
  const postDoneCount = prayersArr.filter(p => postRemembrance[p] === 'standard33' || postRemembrance[p] === 'mini10').length;
  const rawP7 = Math.min(10, postDoneCount * 2);
  const rawP8 = Math.min(10, Math.round((salawatCount / 70) * 100) / 10);
  const qPages = currentLog.quran?.pagesRead || 0;
  let rawP9 = Math.min(5, qPages * 0.5);
  if (currentLog.quran?.juzRead) rawP9 = 5;
  if (currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0) rawP9 += 2.5;
  if (currentLog.quran?.memorizationReviewed) rawP9 += 2.5;
  rawP9 = Math.min(10, Math.round(rawP9 * 10) / 10);
  const rawP10 = Math.min(10, khushuRating);

  const totalQualityScore = Math.round((rawP1 + rawP2 + rawP3 + rawP4 + rawP5 + rawP6 + rawP7 + rawP8 + rawP9 + rawP10) * 10) / 10;
  const qualityScoreOutOf10 = (totalQualityScore / 10).toFixed(1);
  const qualityPercentage = Math.min(100, Math.round(totalQualityScore));

  const getRecommendedFasting = (): { type: any; labelEn: string; labelAr: string } => {
    if (hijriInfo.hijriMonth === 9) return { type: 'Ramadan', labelEn: 'Ramadan (Obligatory)', labelAr: 'رمضان المبارك' };
    if (hijriInfo.hijriMonth === 12 && hijriInfo.hijriDay === 9) return { type: 'Arafah', labelEn: 'Day of Arafah', labelAr: 'يوم عرفة' };
    if (hijriInfo.hijriMonth === 1 && (hijriInfo.hijriDay === 9 || hijriInfo.hijriDay === 10)) return { type: 'Ashura_Tasua', labelEn: 'Ashura & Tasua', labelAr: 'عاشوراء وتاسوعاء' };
    if (hijriInfo.hijriDay >= 13 && hijriInfo.hijriDay <= 15) return { type: 'Ayyam_al_Beed', labelEn: 'White Days (13-15)', labelAr: 'الأيام البيض' };
    if (hijriInfo.dayOfWeekEn === 'Monday' || hijriInfo.dayOfWeekEn === 'Thursday') return { type: 'Monday_Thursday', labelEn: 'Mon & Thu Sunnah', labelAr: 'الإثنين والخميس' };
    if (hijriInfo.hijriMonth === 10) return { type: 'Shawwal_Six', labelEn: '6 Days of Shawwal', labelAr: 'الست من شوال' };
    return { type: 'Monday_Thursday', labelEn: 'Voluntary Sunnah', labelAr: 'صيام التطوع' };
  };
  const recFasting = getRecommendedFasting();

  const getKhushuLabel = (val: number) => {
    if (val >= 9) return { label: 'Mumtāz / Deep Presence (حضور تام وخشوع عالٍ)', color: 'text-emerald-300' };
    if (val >= 7) return { label: 'Jayyid Jiddan / Attentive & Still (حضور جيد وطمأنينة)', color: 'text-amber-300' };
    if (val >= 5) return { label: 'Maqbūl / Moderate Focus (تركيز متوسط مع بعض الشرود)', color: 'text-cyan-300' };
    return { label: 'Needs Renewal / Distracted (يحتاج تأنياً ومجاهدة)', color: 'text-rose-300' };
  };

  const tabsConfig = [
    { id: 'overview' as const, label: 'Daily Hub', labelAr: 'المحراب اليومي', icon: Sparkles, badge: `${completedFardhCount}/5` },
    { id: 'salaat' as const, label: '5 Daily Salaat', labelAr: 'الصلوات الخمس', icon: Sun },
    { id: 'masjid40' as const, label: '40-Day Sanctuary', labelAr: 'أربعون في المسجد', icon: Shield, badge: `${masjid40Stats.currentStreak}D` },
    { id: 'sunnah' as const, label: 'Sunan & Qiyām', labelAr: 'النوافل والقيام', icon: Compass },
    { id: 'siam' as const, label: 'Siam & Fasting', labelAr: 'الصيام', icon: Moon, badge: currentLog.fasting?.isFasting ? 'Fasting' : undefined },
    { id: 'adhkar' as const, label: 'Adhkār Fortress', labelAr: 'الأذكار', icon: Heart, badge: fortressStats ? `${fortressStats.integrityScore}%` : `${salawatCount}ﷺ` },
    { id: 'quran' as const, label: 'Qur’an Sanctum', labelAr: 'القرآن الكريم', icon: BookOpen, badge: `${currentLog.quran?.pagesRead || 0}p` },
    { id: 'audit' as const, label: 'Quality Scorecard', labelAr: 'ميزان الجودة', icon: Award, badge: `${qualityScoreOutOf10}/10` }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" id="sacred-protocol-root">
      
      {/* 1. SINCERITY SAFEGUARD & TOP BAR */}
      <div className="p-3.5 sm:p-4 bg-[var(--accent-surface)] border border-[var(--border-accent)] rounded-2xl relative overflow-hidden shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] shrink-0 mt-0.5 sm:mt-0">
            <RubElHizbIcon className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--accent-bright)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-bright)] font-bold">
                ضَابِطُ الإِخْلَاصِ وَالنِّيَّة • THEOLOGICAL SINCERITY SAFEGUARD
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-0.5">
              XP and levels are strictly motivational tools for personal discipline. True reward and divine acceptance (الأَجْرُ وَالقَبُول) belong solely to Allah ﷻ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenMuhasabahAudit && (
            <button
              onClick={onOpenMuhasabahAudit}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Log spiritual lapses in Muhasabah"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Muhāsabah Log</span>
            </button>
          )}

          <button
            onClick={() => setShowScorecardModal(true)}
            className="px-3 py-1.5 bg-[var(--accent-surface)] hover:bg-[var(--accent-surface-hover)] border border-[var(--border-accent)] text-[var(--accent-highlight)] text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Award className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
            <span>10/10 Scorecard</span>
          </button>
        </div>
      </div>

      {/* 2. SACRED ASTRONOMICAL HEADER & HIJRI CALENDAR BAR */}
      <div className="p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-accent)] rounded-2xl relative overflow-hidden shadow-xl space-y-4">
        
        {/* Background Arabesque filigree */}
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[var(--accent-bright)] fill-current">
            <path d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" />
                <span>SACRED PROTOCOL • البُرُوتُوكُولُ الإِيمَانِيّ</span>
              </span>

              {/* AUTOMATIC HIJRI VIRTUE TAGS */}
              {hijriInfo.isJumuah && (
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  🕌 Blessed Friday (يَوْمُ الجُمُعَة)
                </span>
              )}
              {hijriInfo.hijriDay >= 13 && hijriInfo.hijriDay <= 15 && (
                <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  🌕 Ayyam al-Beed (الأيام البيض)
                </span>
              )}
              {(hijriInfo.dayOfWeekEn === 'Monday' || hijriInfo.dayOfWeekEn === 'Thursday') && (
                <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  🌟 Sunnah Fasting Day
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 flex-wrap pt-1">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
                {hijriInfo.formattedAr}
              </h1>
              <span className="text-sm font-mono text-[var(--accent-bright)]">
                ({hijriInfo.formattedEn})
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-400">
              Gregorian Sync: {systemDate} • Day of {hijriInfo.dayOfWeekEn} ({hijriInfo.dayOfWeekAr})
            </p>
          </div>

          {/* DATE NAVIGATION CONTROLS */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={syncWithRealClock}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-accent)] text-xs font-mono text-[var(--accent-highlight)] font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
              <span>TODAY</span>
            </button>

            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3. SIMPLIFIED 5-METRIC SUMMARY STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          
          {/* Fardh Salaat */}
          <div 
            onClick={() => setActiveTab('salaat')}
            className="p-3 bg-[#080a0f] hover:bg-[#0c0f16] border border-white/5 hover:border-indigo-500/40 rounded-xl space-y-1 cursor-pointer transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">5 Daily Salaat</span>
              <Sun className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-base font-display font-bold ${completedFardhCount === 5 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                {completedFardhCount} / 5
              </span>
              <span className="text-[10px] font-mono text-[var(--accent-bright)]">{onTimeCount} on time</span>
            </div>
          </div>

          {/* 40-Day Masjid Sanctuary */}
          <div 
            onClick={() => setActiveTab('masjid40')}
            className="p-3 bg-gradient-to-br from-[var(--accent-surface)] to-[var(--bg-void)] border border-[var(--border-accent)] hover:border-[var(--border-strong)] rounded-xl space-y-1 cursor-pointer transition shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase group-hover:text-[var(--accent-highlight)]">40-Day Masjid</span>
              <Shield className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-[var(--accent-highlight)]">
                {masjid40Stats.currentStreak} / 40 D
              </span>
              <span className={`text-[10px] font-mono ${masjid40Stats.isTodayFullyCompleted ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                {masjid40Stats.todayMasjidCount}/5 Today
              </span>
            </div>
          </div>

          {/* Adhkar Fortress */}
          <div 
            onClick={() => setActiveTab('adhkar')}
            className="p-3 bg-[#080a0f] hover:bg-[#0c0f16] border border-white/5 hover:border-rose-500/40 rounded-xl space-y-1 cursor-pointer transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Adhkār Fortress</span>
              <Shield className="h-3.5 w-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-rose-300">
                {fortressStats ? `${fortressStats.integrityScore}%` : `${completedPostPrayersCount}/5 Post`}
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                {fortressStats ? `⚡ ${fortressStats.currentStreak}D streak` : `${salawatCount} ﷺ`}
              </span>
            </div>
          </div>

          {/* Qur’an Sanctum */}
          <div 
            onClick={() => setActiveTab('quran')}
            className="p-3 bg-[#080a0f] hover:bg-[#0c0f16] border border-white/5 hover:border-emerald-500/40 rounded-xl space-y-1 cursor-pointer transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Qur’an Sanctum</span>
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-emerald-300">
                {currentLog.quran?.pagesRead || 0} pgs
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {quranFreshness ? `${quranFreshness.score}% Fresh` : 'Active'}
              </span>
            </div>
          </div>

          {/* Siam / Fasting */}
          <div 
            onClick={() => setActiveTab('siam')}
            className="p-3 bg-[#080a0f] hover:bg-[#0c0f16] border border-white/5 hover:border-amber-500/40 rounded-xl space-y-1 cursor-pointer transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Siam / Fasting</span>
              <Moon className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-base font-display font-bold ${currentLog.fasting?.isFasting ? 'text-amber-300' : 'text-zinc-400'}`}>
                {currentLog.fasting?.isFasting ? (currentLog.fasting.iftarCompleted ? 'Completed ✓' : 'Fasting Active') : 'None'}
              </span>
              {currentLog.fasting?.isFasting && <span className="text-[10px] font-mono text-amber-300">🌙</span>}
            </div>
          </div>

        </div>

      </div>

      {/* 4. CLEAN TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-x-auto select-none no-scrollbar">
        {tabsConfig.map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] shadow-[0_0_12px_var(--glow-color)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[var(--accent-bright)]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-60 font-sans hidden sm:inline">({tab.labelAr})</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${
                  isSelected ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border-[var(--border-accent)]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. TAB CONTENT ROUTING */}
      <div className="space-y-6">
        
        {/* ========================================================================= */}
        {/* A. OVERVIEW / DAILY HUB (SIMPLIFIED MASTER DASHBOARD)                      */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* MASTER SYNCHRONIZATION COMMAND CENTER: QUALITY SCORECARD & 40-DAY SANCTUARY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="daily-hub-sync-center">
              
              {/* POD 1: SACRED QUALITY SCORECARD AUDIT */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#12141c] via-[#0b0d13] to-[#07080c] border border-[#c5a059]/40 rounded-2xl relative overflow-hidden shadow-xl space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-[#c5a059]/20 text-[#fef08a] border border-[#c5a059]/50 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(197,160,89,0.15)]">
                        <Award className="h-3 w-3 text-[#c5a059]" />
                        <span>QUALITY SCORECARD • مِيزَانُ الجَوْدَة</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setShowScorecardModal(true)}
                      className="text-xs font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>Audit 10 Pillars</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-base text-zinc-100">
                        Today&apos;s Divine Discipline Score
                      </h4>
                      <span className="text-xs text-zinc-400 font-sans">
                        Synchronized across all 10 Sacred Protocol pillars
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-display font-black text-[#fef08a] bg-[#1a140a] px-3 py-0.5 rounded-xl border border-[#c5a059]/50">
                        {qualityScoreOutOf10} <span className="text-xs font-mono font-normal text-[#c5a059]">/ 10</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                        {qualityPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* 10-PIP MINI STRIP */}
                  <div className="pt-1 space-y-1.5">
                    <div className="grid grid-cols-10 gap-1">
                      {[
                        { id: 1, tab: 'salaat', val: rawP1, label: 'Salaat' },
                        { id: 2, tab: 'masjid40', val: rawP2, label: '40D Sanctuary' },
                        { id: 3, tab: 'sunnah', val: rawP3, label: '12 Rawātib' },
                        { id: 4, tab: 'sunnah', val: rawP4, label: 'Qiyām' },
                        { id: 5, tab: 'siam', val: rawP5, label: 'Siam' },
                        { id: 6, tab: 'adhkar', val: rawP6, label: 'Fortress' },
                        { id: 7, tab: 'adhkar', val: rawP7, label: 'Post-Salah' },
                        { id: 8, tab: 'adhkar', val: rawP8, label: 'Salawāt' },
                        { id: 9, tab: 'quran', val: rawP9, label: 'Qur\'an' },
                        { id: 10, tab: 'overview', val: rawP10, label: 'Khushū\'' }
                      ].map(pip => (
                        <button
                          key={pip.id}
                          onClick={() => setActiveTab(pip.tab as any)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            pip.val >= 9.5
                              ? 'bg-gradient-to-r from-emerald-500 to-[#c5a059] shadow-[0_0_6px_rgba(197,160,89,0.4)]'
                              : pip.val >= 5.0
                              ? 'bg-amber-500/80'
                              : 'bg-zinc-800'
                          }`}
                          title={`Pillar 0${pip.id} (${pip.label}): ${pip.val.toFixed(1)}/10 - Click to Open`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Interactive: Click pip to inspect pillar</span>
                      <span>10/10 Standard</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scale className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>View Quality Scorecard Tab</span>
                  </button>
                  <button
                    onClick={() => setShowScorecardModal(true)}
                    className="px-2.5 py-1 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                  >
                    Scorecard Modal
                  </button>
                </div>
              </div>

              {/* POD 2: 40-DAY MASJID SANCTUARY LIVE HUB */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#0c131d] via-[#091017] to-[#070b10] border border-emerald-500/40 rounded-2xl relative overflow-hidden shadow-xl space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                        <Shield className="h-3 w-3 text-emerald-400" />
                        <span>40-DAY SANCTUARY • عَهْدُ الأَرْبَعِينَ فِي المَسْجِد</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('masjid40')}
                      className="text-xs font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>Full Matrix</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-base text-zinc-100">
                        Consecutive Congregation Covenant
                      </h4>
                      <span className="text-xs text-zinc-400 font-sans">
                        Al-Barā&apos;atān: Freedom from Hellfire &amp; Hypocrisy
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-display font-black text-emerald-300 bg-emerald-950/60 px-3 py-0.5 rounded-xl border border-emerald-500/40">
                        {masjid40Stats.currentStreak} <span className="text-xs font-mono font-normal text-emerald-400">/ 40 D</span>
                      </span>
                    </div>
                  </div>

                  {/* TODAY'S ATTENDANCE & STAGE */}
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${masjidCount === 5 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
                      <span className="text-xs font-mono text-zinc-300">
                        Today: <strong className="text-white">{masjidCount}/5</strong> in Masjid
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Stage {masjid40Stats.currentStage?.stageNumber || 1}: {masjid40Stats.currentStage?.stageNameEn || 'The Anchor'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleAllPrayersInMasjid(systemDate, true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      masjidCount === 5 
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{masjidCount === 5 ? 'All 5 in Masjid Fulfilled ✓' : '1-Click All 5 in Masjid'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('masjid40')}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                  >
                    View 40-Day Tracker →
                  </button>
                </div>
              </div>

            </div>

            {/* 1. THE 5 OBLIGATORY PRAYERS SECTION */}
            <div className="p-5 sm:p-6 bg-[#0a0c12] border border-white/10 rounded-2xl relative overflow-hidden shadow-xl space-y-5" id="five-daily-salaat">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5">
                      <RubElHizbIcon className="h-3 w-3 text-indigo-400" />
                      <span>الصَّلَوَاتُ المَكْتُوبَة • THE 5 OBLIGATORY PILLARS</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-zinc-100">
                    Daily Salaat Accountability &amp; Congregation
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Log your daily obligatory prayers, congregation punctuality, and Sunan Rawātib.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('salaat')}
                  className="text-xs font-mono text-[var(--accent-bright)] hover:text-[var(--accent-highlight)] transition flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Detailed Salaat View</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 5 PRAYERS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prayersConfig.map(prayer => {
                  const prayerState: PrayerCheck = (currentLog[prayer.id as keyof SpiritualDailyLog] as PrayerCheck) || {
                    fardh: false,
                    onTime: false,
                    delayed: false,
                    inMasjid: false,
                    sunnahRawatib: false,
                    completedAt: null
                  };

                  const Icon = prayer.icon;

                  return (
                    <div
                      key={prayer.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        prayerState.fardh
                          ? 'bg-gradient-to-br from-[#0c131d] to-[#070b10] border-emerald-500/40 shadow-sm'
                          : `bg-gradient-to-br ${prayer.gradient} border-white/10 hover:border-white/20`
                      }`}
                    >
                      {/* TOP HEADER */}
                      <div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl border ${prayer.iconBg}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-display font-bold text-base text-zinc-100">{prayer.nameEn}</h4>
                                <span className="text-xs text-[var(--accent-bright)] font-display">({prayer.nameAr})</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400 block">{prayer.timeLabel} • {prayer.fardhRakats} Rak&apos;ahs</span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-[var(--accent-bright)] bg-[var(--accent-surface)] border border-[var(--border-accent)] px-2 py-0.5 rounded-full">
                            +{prayer.fardhXp} XP
                          </span>
                        </div>

                        {/* PRIMARY FARDH COMPLETION BUTTON */}
                        <div className="pt-3">
                          <button
                            onClick={() => togglePrayer(prayer.id, 'fardh', systemDate)}
                            className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                              prayerState.fardh
                                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-sm'
                                : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
                            }`}
                          >
                            <CheckCircle2 className={`h-4 w-4 ${prayerState.fardh ? 'text-emerald-400' : 'text-zinc-600'}`} />
                            <span>{prayerState.fardh ? 'FARDH COMPLETED ✓ (أُدِّيَت)' : `PRAY ${prayer.nameEn.toUpperCase()} FARDH`}</span>
                          </button>
                        </div>
                      </div>

                      {/* SECONDARY MODIFIERS: ON TIME, IN MASJID, SUNAN RAWATIB */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        
                        {/* Timeliness toggle: On-Time (+40 XP) vs Delayed (-50 XP) */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-zinc-400">Timeliness:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => togglePrayer(prayer.id, 'onTime', systemDate)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                                prayerState.onTime
                                  ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              On-Time (+40 XP)
                            </button>
                            <button
                              onClick={() => togglePrayer(prayer.id, 'delayed', systemDate)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                                prayerState.delayed
                                  ? 'bg-rose-950 border-rose-500/60 text-rose-200'
                                  : 'bg-[#07090e] border-white/5 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              Delayed (-50 XP)
                            </button>
                          </div>
                        </div>

                        {/* In Masjid / Jama'ah (+50 XP) */}
                        <button
                          onClick={() => togglePrayer(prayer.id, 'inMasjid', systemDate)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono font-bold transition flex items-center justify-between ${
                            prayerState.inMasjid
                              ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200'
                              : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>🕌 In Masjid / Jamā&apos;ah</span>
                            {prayerState.inMasjid && <span className="text-[9px] text-[var(--accent-highlight)] bg-[var(--accent-surface)] border border-[var(--border-subtle)] px-1 rounded">40D +1</span>}
                          </span>
                          <span className="text-[10px] text-indigo-300">+{prayer.masjidXp} XP</span>
                        </button>

                        {/* Sunan Rawatib (+30 to 45 XP) */}
                        <button
                          onClick={() => togglePrayer(prayer.id, 'sunnahRawatib', systemDate)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono font-bold transition flex items-center justify-between ${
                            prayerState.sunnahRawatib
                              ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                              : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate max-w-[200px]">✨ {prayer.sunnahLabel}</span>
                          <span className="text-[10px] text-amber-300 shrink-0 ml-1">+{prayer.sunnahXp} XP</span>
                        </button>

                        {/* Post-Salah Adhkār Row */}
                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-[11px] font-mono font-bold text-zinc-300">
                                Post-Salah Adhkār (أذكار بعد الصلاة)
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPostPrayer(prayer.id);
                                setIsPostAdhkarModalOpen(true);
                              }}
                              className="text-[10px] font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-0.5"
                            >
                              <span>Read</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleTogglePostIstighfar(prayer.id)}
                              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                postIstighfarMap[prayer.id]
                                  ? 'bg-amber-950 border-amber-500/80 text-amber-200 shadow-sm'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="3x Istighfār immediately after prayer (+5 XP)"
                            >
                              <CheckCircle2 className={`h-3 w-3 shrink-0 ${postIstighfarMap[prayer.id] ? 'text-amber-400' : 'text-zinc-600'}`} />
                              <span className="truncate">3x Istighfār</span>
                            </button>
                            <button
                              onClick={() => handleSetPostSalah(prayer.id, postMap[prayer.id] === 'standard33' ? 'none' : 'standard33')}
                              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                postMap[prayer.id] === 'standard33'
                                  ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200 shadow-sm'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="Standard 33x: 33 Tasbīḥ, 33 Ḥamd, 33 Takbīr ONLY (+20 XP)"
                            >
                              <CheckCircle2 className={`h-3 w-3 shrink-0 ${postMap[prayer.id] === 'standard33' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                              <span className="truncate">33x Only</span>
                            </button>
                            <button
                              onClick={() => handleSetPostSalah(prayer.id, postMap[prayer.id] === 'mini10' ? 'none' : 'mini10')}
                              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                postMap[prayer.id] === 'mini10'
                                  ? 'bg-teal-950 border-teal-500/80 text-teal-200 shadow-sm'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="Mini 10x: 10 Tasbīḥ, 10 Ḥamd, 10 Takbīr ONLY (+12 XP)"
                            >
                              <CheckCircle2 className={`h-3 w-3 shrink-0 ${postMap[prayer.id] === 'mini10' ? 'text-teal-400' : 'text-zinc-600'}`} />
                              <span className="truncate">10x Only</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. DAILY SUPPLEMENTS BENTO (FASTING, QIYAM, ADHKAR) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* BOX A: SIAM & FASTING QUICK CARD */}
              <div className="p-5 bg-gradient-to-br from-[#0e1614] via-[#09100d] to-[#070b09] border border-emerald-500/30 rounded-2xl space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                        <Moon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-zinc-100">Siam &amp; Fasting</h4>
                        <span className="text-[10px] font-mono text-emerald-400">الصِّيَام وَالسَّحُور</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('siam')}
                      className="text-[10px] font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-0.5"
                    >
                      <span>Full Hub</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Hijri Calendar Recommendation */}
                    <div className="flex items-center justify-between text-[10px] font-mono bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-lg">
                      <span className="text-zinc-400">Recommended:</span>
                      <span className="text-emerald-300 font-bold">{recFasting.labelEn}</span>
                    </div>

                    <button
                      onClick={() => toggleFasting('isFasting', currentLog.fasting?.fastingType || recFasting.type, systemDate)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-between cursor-pointer ${
                        currentLog.fasting?.isFasting
                          ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-sm'
                          : 'bg-[#07090e] border-white/10 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className={`h-4 w-4 ${currentLog.fasting?.isFasting ? 'text-emerald-400' : 'text-zinc-600'}`} />
                        <span>Fasting Today ({currentLog.fasting?.fastingType ? currentLog.fasting.fastingType.replace('_', ' ') : recFasting.labelEn})</span>
                      </span>
                      <span className="text-[10px] text-emerald-300 font-bold">
                        {currentLog.fasting?.isFasting ? '+200 XP' : 'Start Fast'}
                      </span>
                    </button>

                    {currentLog.fasting?.isFasting && (
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => toggleFasting('suhurTaken', undefined, systemDate)}
                          className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-mono font-bold transition text-center cursor-pointer ${
                            currentLog.fasting?.suhurTaken
                              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                              : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                          }`}
                        >
                          {currentLog.fasting?.suhurTaken ? '✓ Suhūr' : 'Suhūr +25'}
                        </button>

                        <button
                          onClick={() => toggleFasting('iftarCompleted', undefined, systemDate)}
                          className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-mono font-bold transition text-center cursor-pointer ${
                            currentLog.fasting?.iftarCompleted
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                              : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                          }`}
                        >
                          {currentLog.fasting?.iftarCompleted ? '✓ Ifṭār' : 'Ifṭār +50'}
                        </button>

                        <button
                          onClick={() => toggleFasting('duaMadeAtIftar', undefined, systemDate)}
                          className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-mono font-bold transition text-center cursor-pointer ${
                            currentLog.fasting?.duaMadeAtIftar
                              ? 'bg-purple-950/80 border-purple-500/50 text-purple-200'
                              : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                          }`}
                        >
                          {currentLog.fasting?.duaMadeAtIftar ? '✓ Du‘ā' : 'Du‘ā +25'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>9 Fasting Modalities Connected</span>
                  <span className="text-emerald-400 font-bold">{currentLog.fasting?.isFasting ? 'Active Sanctuary' : 'Voluntary Track'}</span>
                </div>
              </div>

              {/* BOX B: QIYAM & SUNAN QUICK CARD */}
              <div className="p-5 bg-gradient-to-br from-[#131019] via-[#0d0a14] to-[#07060d] border border-amber-500/30 rounded-2xl space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-zinc-100">Qiyām &amp; Nawāfil</h4>
                        <span className="text-[10px] font-mono text-amber-400">قِيَامُ اللَّيْلِ وَالوِتْر</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('sunnah')}
                      className="text-[10px] font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-0.5"
                    >
                      <span>Full Hub</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {/* Qiyam Rak'ahs Stepper */}
                    <div className="p-2.5 bg-[#07090e] border border-white/10 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-300">Qiyām Rak&apos;ahs:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQiyam(Math.max(0, qiyamRakats - 2), qiyamWitr, systemDate)}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-amber-300 min-w-[20px] text-center">
                          {qiyamRakats} R
                        </span>
                        <button
                          onClick={() => updateQiyam(qiyamRakats + 2, qiyamWitr, systemDate)}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateQiyam(qiyamRakats, !qiyamWitr, systemDate)}
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                          qiyamWitr
                            ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                        }`}
                      >
                        {qiyamWitr ? '✓ Witr Sealed' : 'Witr (+40 XP)'}
                      </button>

                      <button
                        onClick={() => updateSunnahPrayers({ duhaRakats: duhaRakats > 0 ? 0 : 2 }, systemDate)}
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                          duhaRakats > 0
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                        }`}
                      >
                        {duhaRakats > 0 ? `✓ Ḍuḥā (${duhaRakats}R)` : 'Ḍuḥā (+35 XP)'}
                      </button>
                    </div>

                    {/* 12 Sunan Rawātib Integration Bar */}
                    <div className="p-2.5 bg-[#07090e] border border-white/10 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">12 Sunan Rawātib:</span>
                        <span className={`font-bold ${houseInJannahAchieved ? 'text-emerald-400' : 'text-amber-300'}`}>
                          {rawatibRakatsCompleted}/12 Rak&apos;ahs
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            houseInJannahAchieved ? 'bg-gradient-to-r from-emerald-500 to-[#c5a059]' : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, (rawatibRakatsCompleted / 12) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-zinc-500">Hadith: House in Jannah</span>
                        <span className={houseInJannahAchieved ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                          {houseInJannahAchieved ? 'Earned Today 🏰' : `${12 - rawatibRakatsCompleted}R remaining`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>Qiyām + 12 Rawātib Linked</span>
                  <button
                    onClick={() => setActiveTab('sunnah')}
                    className="text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Full Sunan Suite →</span>
                  </button>
                </div>
              </div>

              {/* BOX C: ADHKAR & SALAWAT QUICK CARD */}
              <div className="p-5 bg-gradient-to-br from-[#190e14] via-[#120a0f] to-[#0a0709] border border-rose-500/30 rounded-2xl space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-zinc-100">Adhkār Fortress</h4>
                        <span className="text-[10px] font-mono text-rose-400">حُصُونُ الأَذْكَارِ وَالصَّلَاةُ عَلَى النَّبِيّ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        (fortressStats?.integrityScore || 0) >= 80
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                          : (fortressStats?.integrityScore || 0) >= 40
                          ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      }`}>
                        {fortressStats?.integrityScore || 0}% Shield
                      </span>
                      <button
                        onClick={() => setActiveTab('adhkar')}
                        className="text-[10px] font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        <span>Hub</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* 4 PROPHETIC TIME-LITANIES */}
                  <div className="space-y-2">
                    {/* Morning & Evening Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Morning Adhkar */}
                      <button
                        onClick={() => toggleAdhkar('sabah', systemDate)}
                        className={`py-2 px-2.5 rounded-xl border text-[10px] font-mono font-bold transition flex items-center justify-between cursor-pointer ${
                          currentLog.adhkarSabah
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 shadow-sm'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Sun className="h-3.5 w-3.5 text-amber-400" />
                          <span>ورد الصباح</span>
                        </span>
                        <span className="text-[9px] font-bold font-sans">
                          {currentLog.adhkarSabah ? '✓ أُنجِزَت' : 'تسجيل'}
                        </span>
                      </button>

                      {/* Evening Adhkar */}
                      <button
                        onClick={() => toggleAdhkar('masa', systemDate)}
                        className={`py-2 px-2.5 rounded-xl border text-[10px] font-mono font-bold transition flex items-center justify-between cursor-pointer ${
                          currentLog.adhkarMasa
                            ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 shadow-sm'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Moon className="h-3.5 w-3.5 text-indigo-400" />
                          <span>ورد المساء</span>
                        </span>
                        <span className="text-[9px] font-bold font-sans">
                          {currentLog.adhkarMasa ? '✓ أُنجِزَت' : 'تسجيل'}
                        </span>
                      </button>
                    </div>

                    {/* Dhohr Nap vs Night Bedtime Distinct Dual Section */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {/* Noon Sleep / Qaylulah Card */}
                      <div className={`p-2.5 rounded-xl border transition flex flex-col justify-between space-y-1.5 ${
                        currentLog.adhkarSleepDhohr
                          ? 'bg-amber-950/40 border-amber-500/40 shadow-sm'
                          : 'bg-zinc-950/60 border-white/5'
                      }`}>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleAdhkar('sleepDhohr', systemDate)}
                            className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-amber-300 hover:text-amber-200 text-left cursor-pointer"
                          >
                            <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">أذكار القيلولة (Siesta)</span>
                          </button>
                          <span 
                            className={`h-4 w-4 rounded-md border flex items-center justify-center text-[9px] cursor-pointer transition ${
                              currentLog.adhkarSleepDhohr ? 'bg-amber-500 border-amber-400 text-black font-bold' : 'border-zinc-700 bg-black/40 hover:border-zinc-500'
                            }`}
                            onClick={() => toggleAdhkar('sleepDhohr', systemDate)}
                            title={currentLog.adhkarSleepDhohr ? 'إلغاء التثبيت' : 'تثبيت أذكار القيلولة'}
                          >
                            {currentLog.adhkarSleepDhohr && '✓'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono">
                          <span className={currentLog.adhkarSleepDhohr ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                            {currentLog.adhkarSleepDhohr ? 'عبادة منجزة ✓' : 'تحصين ٤ أذكار'}
                          </span>
                          <button
                            onClick={() => {
                              setSleepModalTab('dhohr');
                              setIsSleepModalOpen(true);
                            }}
                            className="text-[var(--accent-bright)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            title="عرض أذكار وإرشادات القيلولة"
                          >
                            <span>اقرأ (٤)</span>
                            <BookOpen className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Night Bedtime Sleep Card */}
                      <div className={`p-2.5 rounded-xl border transition flex flex-col justify-between space-y-1.5 ${
                        currentLog.adhkarSleepNight
                          ? 'bg-purple-950/40 border-purple-500/40 shadow-sm'
                          : 'bg-zinc-950/60 border-white/5'
                      }`}>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleAdhkar('sleepNight', systemDate)}
                            className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-purple-300 hover:text-purple-200 text-left cursor-pointer"
                          >
                            <Bed className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                            <span className="truncate">أذكار النوم (Night)</span>
                          </button>
                          <span 
                            className={`h-4 w-4 rounded-md border flex items-center justify-center text-[9px] cursor-pointer transition ${
                              currentLog.adhkarSleepNight ? 'bg-purple-500 border-purple-400 text-white font-bold' : 'border-zinc-700 bg-black/40 hover:border-zinc-500'
                            }`}
                            onClick={() => toggleAdhkar('sleepNight', systemDate)}
                            title={currentLog.adhkarSleepNight ? 'إلغاء التثبيت' : 'تثبيت أذكار نوم الليل'}
                          >
                            {currentLog.adhkarSleepNight && '✓'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono">
                          <span className={currentLog.adhkarSleepNight ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                            {currentLog.adhkarSleepNight ? 'عبادة منجزة ✓' : 'حصن الليل ٧'}
                          </span>
                          <button
                            onClick={() => {
                              setSleepModalTab('night');
                              setIsSleepModalOpen(true);
                            }}
                            className="text-[var(--accent-bright)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            title="عرض أذكار النوم الصحيحة وحفظ الليل"
                          >
                            <span>اقرأ (٧)</span>
                            <Shield className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* WORSHIP PRINCIPLE MICRO-BANNER */}
                    <div className="px-2 py-1 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between text-[9px] font-sans text-zinc-400">
                      <span className="flex items-center gap-1 text-[#c5a059]">
                        <Heart className="h-2.5 w-2.5 text-rose-400" />
                        <span>الأذكار عبادة وطاعة • توثيقٌ لعبادة منجزة</span>
                      </span>
                      <span className="font-mono text-zinc-500">حفظٌ وتحصين</span>
                    </div>

                    {/* 5 POST-SALAH ADHKĀR INTERACTIVE STRIP */}
                    <div className="p-2.5 bg-[#07090e] border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          <span className="font-bold text-zinc-200">Post-Salah 5/5:</span>
                          <span className={`font-bold ml-1 ${completedPostPrayersCount === 5 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {completedPostPrayersCount}/5
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPostPrayer('fajr');
                            setIsPostAdhkarModalOpen(true);
                          }}
                          className="text-[10px] text-[var(--accent-bright)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Open Reader</span>
                          <BookOpen className="h-3 w-3" />
                        </button>
                      </div>

                      {/* 5 Prayer Pills */}
                      <div className="grid grid-cols-5 gap-1">
                        {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(p => {
                          const mode = postMap[p];
                          return (
                            <button
                              key={p}
                              onClick={() => {
                                setSelectedPostPrayer(p);
                                setIsPostAdhkarModalOpen(true);
                              }}
                              className={`py-1 rounded text-[9px] font-mono font-bold border transition text-center cursor-pointer ${
                                mode === 'standard33'
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                  : mode === 'mini10'
                                  ? 'bg-teal-950 border-teal-500 text-teal-300'
                                  : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                              }`}
                              title={`${p.toUpperCase()}: ${mode === 'standard33' ? 'Standard 33x Done' : mode === 'mini10' ? 'Mini 10x Done' : 'Click to Read & Log'}`}
                            >
                              <span className="block uppercase">{p.slice(0, 3)}</span>
                              <span className="text-[8px] opacity-80">{mode === 'standard33' ? '33x ✓' : mode === 'mini10' ? '10x ✓' : '—'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Salawat Quick Increment */}
                    <div className="p-2.5 bg-[#07090e] border border-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-zinc-300 block">Salawāt: {salawatCount}/70+</span>
                        <span className="text-[9px] font-mono text-zinc-500">اللَّهُمَّ صَلِّ عَلَى مُحَمَّد</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => incrementSalawat(1, systemDate)}
                          className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-mono font-bold transition cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => incrementSalawat(10, systemDate)}
                          className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-mono font-bold transition cursor-pointer"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => incrementSalawat(33, systemDate)}
                          className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-mono font-bold transition cursor-pointer"
                        >
                          +33
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>Authentic Adhkār Fortress • حُصُونُ الأَذْكَار</span>
                  <span className="text-emerald-400 font-bold">{completedPostPrayersCount === 5 ? '✓ اكتملت أذكار الصلوات الخمس' : `متبقٍ ${5 - completedPostPrayersCount} صلوات`}</span>
                </div>
              </div>

            </div>

            {/* QUR'AN TILĀWAH, TADABBUR & MEMORIZATION COCKPIT */}
            <div className="p-5 bg-gradient-to-r from-[#0c141d] via-[#091017] to-[#070b10] border border-cyan-500/30 rounded-2xl relative overflow-hidden shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    <h4 className="font-display font-bold text-base text-zinc-100">
                      Qur&apos;ān Tilāwah &amp; Tadabbur Sanctum (تِلَاوَةُ القُرْآنِ وَتَدَبُّرُهُ)
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Pillar 7: Daily pages (+5 XP/page up to 100 XP), Full Juz (+100 XP), Tadabbur Reflection (+40 XP), and Hifdh Revision (+50 XP).
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {quranFreshness && (
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                      quranFreshness.score >= 80 
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        : quranFreshness.score >= 50
                        ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                        : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                    }`}>
                      Freshness: {quranFreshness.score}% ({quranFreshness.dueCount} due)
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full">
                    {currentLog.quran?.pagesRead || 0} Pages Read Today
                  </span>
                  <button
                    onClick={() => setActiveTab('quran')}
                    className="text-xs font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-1 font-bold cursor-pointer ml-1"
                  >
                    <span>Full Sanctum</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* CONTROLS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Pages Quick Dial */}
                <div className="p-3 bg-[#07090e] border border-white/10 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">DAILY TILĀWAH PAGES</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold font-mono text-cyan-400">
                      {currentLog.quran?.pagesRead || 0} <span className="text-xs text-zinc-500 font-normal">pages</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuranLog({ pagesRead: Math.max(0, (currentLog.quran?.pagesRead || 0) - 1) }, systemDate)}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded text-xs font-mono font-bold cursor-pointer"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => updateQuranLog({ pagesRead: (currentLog.quran?.pagesRead || 0) + 1 }, systemDate)}
                        className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono font-bold cursor-pointer"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => updateQuranLog({ pagesRead: (currentLog.quran?.pagesRead || 0) + 5 }, systemDate)}
                        className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono font-bold cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Full Juz Completed */}
                <button
                  onClick={() => updateQuranLog({ juzRead: currentLog.quran?.juzRead ? undefined : 1 }, systemDate)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    currentLog.quran?.juzRead
                      ? 'bg-emerald-950/80 border-emerald-500/60 shadow-sm'
                      : 'bg-[#07090e] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">FULL JUZ COMPLETED</span>
                    <span className={`h-4 w-4 rounded border flex items-center justify-center text-[9px] ${
                      currentLog.quran?.juzRead ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-zinc-700'
                    }`}>
                      {currentLog.quran?.juzRead && '✓'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${currentLog.quran?.juzRead ? 'text-emerald-300' : 'text-zinc-300'}`}>
                      {currentLog.quran?.juzRead ? 'Juz Completed ✓' : 'Complete 1 Juz'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">+100 XP</span>
                  </div>
                </button>

                {/* 3. Tadabbur Reflection Note Toggle */}
                <button
                  onClick={() => {
                    const existing = currentLog.quran?.tadabburNotes;
                    updateQuranLog({ 
                      tadabburNotes: existing ? '' : 'Reflected upon the divine verses with presence and contemplation.' 
                    }, systemDate);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    Boolean(currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0)
                      ? 'bg-amber-950/80 border-amber-500/60 shadow-sm'
                      : 'bg-[#07090e] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">TADABBUR CONTEMPLATION</span>
                    <span className={`h-4 w-4 rounded border flex items-center justify-center text-[9px] ${
                      Boolean(currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0) ? 'bg-amber-500 border-amber-400 text-black font-bold' : 'border-zinc-700'
                    }`}>
                      {Boolean(currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0) && '✓'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${Boolean(currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0) ? 'text-amber-300' : 'text-zinc-300'}`}>
                      {Boolean(currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0) ? 'Tadabbur Recorded ✓' : 'Log Tadabbur'}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">+40 XP</span>
                  </div>
                </button>

                {/* 4. Hifdh Revision */}
                <button
                  onClick={() => updateQuranLog({ memorizationReviewed: !currentLog.quran?.memorizationReviewed }, systemDate)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    currentLog.quran?.memorizationReviewed
                      ? 'bg-indigo-950/80 border-indigo-500/60 shadow-sm'
                      : 'bg-[#07090e] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">HIFDH &amp; REVISION</span>
                    <span className={`h-4 w-4 rounded border flex items-center justify-center text-[9px] ${
                      currentLog.quran?.memorizationReviewed ? 'bg-indigo-500 border-indigo-400 text-white font-bold' : 'border-zinc-700'
                    }`}>
                      {currentLog.quran?.memorizationReviewed && '✓'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${currentLog.quran?.memorizationReviewed ? 'text-indigo-300' : 'text-zinc-300'}`}>
                      {currentLog.quran?.memorizationReviewed ? 'Hifdh Reviewed ✓' : 'Review Hifdh'}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">+50 XP</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. KHUSHU' & HEART PRESENCE GAUGE */}
            <div className="p-5 bg-gradient-to-r from-[#17140e] via-[#100e0a] to-[#070605] border border-[var(--border-accent)] rounded-2xl relative overflow-hidden shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
                    <h4 className="font-display font-bold text-base text-zinc-100">
                      Khushū&apos; &amp; Heart Presence Gauge (مِيزَانُ الخُشُوعِ وَحُضُورِ القَلْب)
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Honest self-assessment of stillness, comprehension, and freedom from worldly distractions during worship today.
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${getKhushuLabel(khushuRating).color}`}>
                    {getKhushuLabel(khushuRating).label}
                  </span>
                </div>
              </div>

              {/* 1 TO 10 RATING SELECTOR */}
              <div className="flex items-center gap-1.5 sm:gap-2 justify-between overflow-x-auto no-scrollbar py-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
                  <button
                    key={val}
                    onClick={() => setKhushuRating(val, systemDate)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition flex flex-col items-center justify-center ${
                      khushuRating === val
                        ? 'bg-[var(--accent-bright)] text-[var(--bg-void)] border border-[var(--accent-highlight)] shadow-[0_0_15px_var(--glow-accent)]'
                        : 'bg-[#07080a] border border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-sm">{val}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* B. SPECIALIZED DEDICATED TABS (NO CLUTTER / NO DUPLICATION)               */}
        {/* ========================================================================= */}

        {/* 40-DAY MASJID SANCTUARY TAB */}
        {activeTab === 'masjid40' && (
          <Masjid40DayTracker 
            onOpenGuide={onOpenGuide}
            onNavigateTab={handleNav}
          />
        )}

        {/* 5 DAILY SALAAT TAB */}
        {activeTab === 'salaat' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 bg-[#0a0c12] border border-white/10 rounded-2xl relative overflow-hidden shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5">
                      <RubElHizbIcon className="h-3 w-3 text-indigo-400" />
                      <span>الصَّلَوَاتُ المَكْتُوبَة • THE 5 OBLIGATORY PILLARS</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-zinc-100">
                    5 Daily Salaat Detailed Cockpit
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    &ldquo;The first matter that the slave will be brought to account for on the Day of Judgment is prayer.&rdquo;
                  </p>
                </div>
              </div>

              {/* 5 PRAYERS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prayersConfig.map(prayer => {
                  const prayerState: PrayerCheck = (currentLog[prayer.id as keyof SpiritualDailyLog] as PrayerCheck) || {
                    fardh: false,
                    onTime: false,
                    delayed: false,
                    inMasjid: false,
                    sunnahRawatib: false,
                    completedAt: null
                  };

                  const Icon = prayer.icon;

                  return (
                    <div
                      key={prayer.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        prayerState.fardh
                          ? 'bg-gradient-to-br from-[#0c131d] to-[#070b10] border-emerald-500/40 shadow-sm'
                          : `bg-gradient-to-br ${prayer.gradient} border-white/10 hover:border-white/20`
                      }`}
                    >
                      {/* TOP HEADER */}
                      <div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl border ${prayer.iconBg}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-display font-bold text-base text-zinc-100">{prayer.nameEn}</h4>
                                <span className="text-xs text-[var(--accent-bright)] font-display">({prayer.nameAr})</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400 block">{prayer.timeLabel} • {prayer.fardhRakats} Rak&apos;ahs</span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-[var(--accent-bright)] bg-[var(--accent-surface)] border border-[var(--border-accent)] px-2 py-0.5 rounded-full">
                            +{prayer.fardhXp} XP
                          </span>
                        </div>

                        {/* PRIMARY FARDH COMPLETION BUTTON */}
                        <div className="pt-3">
                          <button
                            onClick={() => togglePrayer(prayer.id, 'fardh', systemDate)}
                            className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                              prayerState.fardh
                                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-sm'
                                : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
                            }`}
                          >
                            <CheckCircle2 className={`h-4 w-4 ${prayerState.fardh ? 'text-emerald-400' : 'text-zinc-600'}`} />
                            <span>{prayerState.fardh ? 'FARDH COMPLETED ✓ (أُدِّيَت)' : `PRAY ${prayer.nameEn.toUpperCase()} FARDH`}</span>
                          </button>
                        </div>
                      </div>

                      {/* SECONDARY MODIFIERS */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-zinc-400">Timeliness:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => togglePrayer(prayer.id, 'onTime', systemDate)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                                prayerState.onTime
                                  ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              On-Time (+40 XP)
                            </button>
                            <button
                              onClick={() => togglePrayer(prayer.id, 'delayed', systemDate)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                                prayerState.delayed
                                  ? 'bg-rose-950 border-rose-500/60 text-rose-200'
                                  : 'bg-[#07090e] border-white/5 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              Delayed (-50 XP)
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => togglePrayer(prayer.id, 'inMasjid', systemDate)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono font-bold transition flex items-center justify-between ${
                            prayerState.inMasjid
                              ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200'
                              : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span>🕌 In Masjid / Jamā&apos;ah</span>
                          <span className="text-[10px] text-indigo-300">+{prayer.masjidXp} XP</span>
                        </button>

                        <button
                          onClick={() => togglePrayer(prayer.id, 'sunnahRawatib', systemDate)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono font-bold transition flex items-center justify-between ${
                            prayerState.sunnahRawatib
                              ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                              : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate max-w-[200px]">✨ {prayer.sunnahLabel}</span>
                          <span className="text-[10px] text-amber-300 shrink-0 ml-1">+{prayer.sunnahXp} XP</span>
                        </button>

                        {/* Post-Salah Adhkār Row */}
                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-[11px] font-mono font-bold text-zinc-300">
                                Post-Salah Adhkār (أذكار بعد الصلاة)
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPostPrayer(prayer.id);
                                setIsPostAdhkarModalOpen(true);
                              }}
                              className="text-[10px] font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-0.5"
                            >
                              <span>Read</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleTogglePostIstighfar(prayer.id)}
                              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                postIstighfarMap[prayer.id]
                                  ? 'bg-amber-950 border-amber-500/80 text-amber-200 shadow-sm'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="3x Istighfār immediately after prayer (+5 XP)"
                            >
                              <CheckCircle2 className={`h-3 w-3 shrink-0 ${postIstighfarMap[prayer.id] ? 'text-amber-400' : 'text-zinc-600'}`} />
                              <span className="truncate">3x Istighfār</span>
                            </button>
                            <button
                              onClick={() => handleSetPostSalah(prayer.id, postMap[prayer.id] === 'standard33' ? 'none' : 'standard33')}
                              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                postMap[prayer.id] === 'standard33'
                                  ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200 shadow-sm'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="Standard 33x: 33 Tasbīḥ, 33 Ḥamd, 33 Takbīr ONLY (+20 XP)"
                            >
                              <CheckCircle2 className={`h-3 w-3 shrink-0 ${postMap[prayer.id] === 'standard33' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                              <span className="truncate">33x Only</span>
                            </button>
                            <button
                              onClick={() => handleSetPostSalah(prayer.id, postMap[prayer.id] === 'mini10' ? 'none' : 'mini10')}
                              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                postMap[prayer.id] === 'mini10'
                                  ? 'bg-teal-950 border-teal-500/80 text-teal-200 shadow-sm'
                                  : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="Mini 10x: 10 Tasbīḥ, 10 Ḥamd, 10 Takbīr ONLY (+12 XP)"
                            >
                              <CheckCircle2 className={`h-3 w-3 shrink-0 ${postMap[prayer.id] === 'mini10' ? 'text-teal-400' : 'text-zinc-600'}`} />
                              <span className="truncate">10x Only</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SIAM & FASTING TAB */}
        {activeTab === 'siam' && (
          <SiamFastingSection
            systemDate={systemDate}
            hijriInfo={hijriInfo}
            fastingLog={currentLog.fasting}
            onOpenGuide={onOpenGuide}
          />
        )}

        {/* SUNNAH PRAYERS & NAWAFIL TAB */}
        {activeTab === 'sunnah' && (
          <SunnahPrayersSection
            systemDate={systemDate}
            sunnahLog={currentLog.sunnahPrayers}
            spiritualLog={currentLog}
            onOpenGuide={onOpenGuide}
            onOpenMuhasabahAudit={onOpenMuhasabahAudit}
          />
        )}

        {/* ADHKAR FORTRESS TAB */}
        {activeTab === 'adhkar' && (
          <AdhkarSection
            systemDate={systemDate}
            spiritualLog={currentLog}
            onOpenGuide={onOpenGuide}
          />
        )}

        {/* QURAN SANCTUM TAB */}
        {activeTab === 'quran' && (
          <QuranSection
            systemDate={systemDate}
            spiritualLog={currentLog}
            onOpenGuide={onOpenGuide}
          />
        )}

        {/* 10/10 AUDIT SCORECARD TAB */}
        {activeTab === 'audit' && (
          <SacredProtocolScorecard />
        )}

      </div>

      {/* SCORECARD MODAL POPUP */}
      <AnimatePresence>
        {showScorecardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto rounded-2xl"
            >
              <SacredProtocolScorecard onClose={() => setShowScorecardModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POST-SALAH ADHKĀR MODAL */}
      <PostSalahAdhkarModal
        isOpen={isPostAdhkarModalOpen}
        onClose={() => setIsPostAdhkarModalOpen(false)}
        systemDate={systemDate}
        initialPrayer={selectedPostPrayer}
      />

      {/* SLEEP ADHKĀR MODAL */}
      <SleepAdhkarModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        systemDate={systemDate}
        initialTab={sleepModalTab}
      />

    </div>
  );
};

