import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Sparkles, Scale, Clock, Moon, Sun, Award, ChevronLeft, 
  ChevronRight, RefreshCw, AlertTriangle, BookOpen, ShieldCheck, Heart, 
  Plus, Minus, Flame, ArrowUpRight, Check, Compass, Shield, HelpCircle
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { getHijriDate } from '../utils/hijriCalendar';
import { RubElHizbIcon, GeometricDivider, ArabesqueCorner } from './IslamicRpgDecorations';
import { SpiritualDailyLog, PrayerCheck } from '../types';
import { SiamFastingSection } from './spiritual/SiamFastingSection';
import { SunnahPrayersSection } from './spiritual/SunnahPrayersSection';
import { AdhkarSection } from './spiritual/AdhkarSection';
import { SacredProtocolScorecard } from './spiritual/SacredProtocolScorecard';
import { Masjid40DayTracker } from './spiritual/Masjid40DayTracker';

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
    updateQiyam,
    setKhushuRating,
    getTodayMuhasabahStats,
    getMasjid40Stats
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'all' | 'masjid40' | 'salaat' | 'siam' | 'sunnah' | 'adhkar' | 'audit'>('all');
  const [showScorecardModal, setShowScorecardModal] = useState(false);

  const currentLog: SpiritualDailyLog = getSpiritualLog(systemDate);
  const hijriInfo = getHijriDate(systemDate);
  const mizanStats = getTodayMuhasabahStats();
  const masjid40Stats = getMasjid40Stats(systemDate);

  const postMap = currentLog.dhikr?.postSalahAdhkar || {};
  const completedPostPrayersCount = (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).filter(p => {
    const mode = postMap[p];
    return mode === 'standard33' || mode === 'mini10';
  }).length;

  const shiftDate = (days: number) => {
    try {
      const [y, m, d] = systemDate.split('-').map(Number);
      const current = new Date(y, m - 1, d);
      current.setDate(current.getDate() + days);
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      setSystemDate(`${year}-${month}-${day}`);
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
      sunnahLabel: '2 Rak\'ahs before Fardh (Better than the world & all in it)',
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
      sunnahLabel: '4 Rak\'ahs before (2+2) & 2 Rak\'ahs after',
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
      sunnahLabel: '4 Rak\'ahs before Fardh (Sunnah Ghayr Mu\'akkadah)',
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
      sunnahLabel: '2 Rak\'ahs after Fardh',
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
      sunnahLabel: '2 Rak\'ahs after Fardh',
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

  const handleQiyamChange = (delta: number) => {
    const nextRakats = Math.max(0, qiyamRakats + delta);
    updateQiyam(nextRakats, qiyamWitr, systemDate);
  };

  const handleToggleWitr = () => {
    updateQiyam(qiyamRakats, !qiyamWitr, systemDate);
  };

  const getKhushuLabel = (val: number) => {
    if (val >= 9) return { label: 'Mumtāz / Deep Presence (حضور تام وخشوع عالٍ)', color: 'text-emerald-300' };
    if (val >= 7) return { label: 'Jayyid Jiddan / Attentive & Still (حضور جيد وطمأنينة)', color: 'text-amber-300' };
    if (val >= 5) return { label: 'Maqbūl / Moderate Focus (تركيز متوسط مع بعض الشرود)', color: 'text-cyan-300' };
    return { label: 'Needs Renewal / Distracted (يحتاج تأنياً ومجاهدة)', color: 'text-rose-300' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" id="sacred-protocol-root">
      
      {/* 1. SINCERITY SAFEGUARD & THEOLOGICAL DISCLAIMER BANNER */}
      <div className="p-4 bg-gradient-to-r from-[#17140e] via-[#100e0a] to-[#0a0806] border border-[#c5a059]/40 rounded-2xl relative overflow-hidden shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#fef08a] shrink-0 mt-0.5 sm:mt-0">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold">
                Theological Principle • ضَابِطُ الإِخْلَاصِ وَالنِّيَّة
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-0.5">
              XP and levels in this system are strictly personal motivational accountability tools. True reward and divine acceptance (الأَجْرُ وَالقَبُول) belong exclusively to Allah ﷻ. Sincerity (الإخلاص) is the foundation of all deeds.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowScorecardModal(true)}
          className="px-3.5 py-2 bg-[#1f1a10] hover:bg-[#2a2213] border border-[#c5a059]/50 text-[#fef08a] text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Award className="h-4 w-4 text-[#c5a059]" />
          <span>VIEW 10/10 QUALITY AUDIT</span>
        </button>
      </div>

      {/* 2. SACRED ASTRONOMICAL HEADER & HIJRI CALENDAR BAR */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-[#131722] via-[#0b0d13] to-[#07080c] border border-[#c5a059]/30 rounded-2xl relative overflow-hidden shadow-xl space-y-4">
        
        {/* Background Arabesque filigree */}
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#c5a059] fill-current">
            <path d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono bg-[#c5a059]/15 text-[#fef08a] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
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
                <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  🌟 Sunnah Fasting Day
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 flex-wrap pt-1">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
                {hijriInfo.formattedAr}
              </h1>
              <span className="text-sm font-mono text-[#c5a059]">
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
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-[#c5a059]/30 text-xs font-mono text-[#fef08a] font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#c5a059]" />
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

        {/* 3. METRICS STRIP: OBLIGATIONS, 40-DAY MASJID, FASTING, SUNAN, DHIKR, KHUSHU */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          
          {/* Fardh Salaat */}
          <div className="p-3 bg-[#080a0f] border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">5 Daily Salaat</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-base font-display font-bold ${completedFardhCount === 5 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                {completedFardhCount} / 5
              </span>
              <span className="text-[10px] font-mono text-[#c5a059]">{onTimeCount} on time</span>
            </div>
          </div>

          {/* 40-Day Masjid Sanctuary */}
          <div 
            onClick={() => setActiveTab('masjid40')}
            className="p-3 bg-gradient-to-br from-[#1c160b]/40 to-[#080a0f] border border-[#c5a059]/30 hover:border-[#c5a059] rounded-xl space-y-1 cursor-pointer transition shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#c5a059] uppercase block group-hover:text-amber-200">40-Day Masjid</span>
              <span className="text-[10px] font-mono text-amber-300">🕌</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-[#fef08a]">
                {masjid40Stats.currentStreak} / 40 D
              </span>
              <span className={`text-[10px] font-mono ${masjid40Stats.isTodayFullyCompleted ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                {masjid40Stats.todayMasjidCount}/5 Today
              </span>
            </div>
          </div>

          {/* Siam / Fasting */}
          <div className="p-3 bg-[#080a0f] border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Siam / Fasting</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-base font-display font-bold ${currentLog.fasting?.isFasting ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {currentLog.fasting?.isFasting ? (currentLog.fasting.iftarCompleted ? 'Completed ✓' : 'Fasting Active') : 'None'}
              </span>
              {currentLog.fasting?.isFasting && <span className="text-[10px] font-mono text-amber-300">🌙</span>}
            </div>
          </div>

          {/* Sunan & Nawafil & Qiyam */}
          <div className="p-3 bg-[#080a0f] border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Sunan &amp; Qiyām</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-amber-200">
                {qiyamRakats > 0 
                  ? `${qiyamRakats}R Qiyām` 
                  : ((currentLog.sunnahPrayers?.duhaRakats || 0) > 0 
                      ? `${currentLog.sunnahPrayers?.duhaRakats}R Ḍuḥā` 
                      : 'Nawāfil')}
              </span>
              <span className="text-[10px] font-mono text-indigo-300">{qiyamWitr ? 'Witr ✓' : '+Duha'}</span>
            </div>
          </div>

          {/* Adhkar */}
          <div className="p-3 bg-[#080a0f] border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Adhkār (الأذكار)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-violet-300">
                {completedPostPrayersCount}/5 Post
              </span>
              <span className="text-[10px] font-mono text-rose-300">
                {currentLog.salawatCount || 0}/70+ ﷺ
              </span>
            </div>
          </div>

          {/* Khushu Score */}
          <div className="p-3 bg-[#080a0f] border border-[#c5a059]/20 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-[#c5a059] uppercase block">Khushū&apos; Gauge</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-display font-bold text-[#fef08a]">
                {khushuRating} / 10
              </span>
              <span className="text-[10px] font-mono text-emerald-300">Presence</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. MULTI-TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 p-1 bg-[#090b10] border border-white/10 rounded-2xl overflow-x-auto select-none no-scrollbar">
        {[
          { id: 'all' as const, label: 'All Protocols (الكل)', icon: Sparkles },
          { id: 'masjid40' as const, label: '40-Day Masjid Sanctuary (أربعون في المسجد)', icon: Shield },
          { id: 'salaat' as const, label: '5 Daily Salaat (الصلوات الخمس)', icon: Sun },
          { id: 'siam' as const, label: 'Siam & Fasting (الصيام والسحور)', icon: Moon },
          { id: 'sunnah' as const, label: 'Sunan, Nawāfil & Qiyām (النوافل والقيام)', icon: Compass },
          { id: 'adhkar' as const, label: 'Adhkār (الأَذْكَار)', icon: Heart },
          { id: 'audit' as const, label: '10/10 Audit Scorecard (التقييم)', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-[#1a1710] text-[#fef08a] border border-[#c5a059]/60 shadow-[0_0_12px_rgba(197,160,89,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#c5a059]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. DYNAMIC TAB CONTENT ROUTING */}
      <div className="space-y-6">
        
        {/* AUDIT SCORECARD TAB */}
        {activeTab === 'audit' && (
          <SacredProtocolScorecard />
        )}

        {/* 40-DAY MASJID COVENANT HERO (DISPLAYED ON ALL OR MASJID40 TAB) */}
        {(activeTab === 'all' || activeTab === 'masjid40') && (
          <Masjid40DayTracker 
            onOpenGuide={onOpenGuide}
            onNavigateTab={handleNav}
          />
        )}

        {/* 5 OBLIGATORY PRAYERS SECTION */}
        {(activeTab === 'all' || activeTab === 'salaat') && (
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
                  Daily Salaat Accountability & Sunan Rawātib
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  &ldquo;The first matter that the slave will be brought to account for on the Day of Judgment is prayer.&rdquo;
                </p>
              </div>

              {onOpenMuhasabahAudit && (
                <button
                  onClick={onOpenMuhasabahAudit}
                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Log Delayed/Missed in Muhāsabah</span>
                </button>
              )}
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
                              <span className="text-xs text-[#c5a059] font-display">({prayer.nameAr})</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 block">{prayer.timeLabel} • {prayer.fardhRakats} Rak&apos;ahs</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-[#c5a059] bg-[#1a140a] border border-[#c5a059]/30 px-2 py-0.5 rounded-full">
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
                        <span>🕌 In Masjid / Jamā&apos;ah</span>
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

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SIAM & FASTING SECTION */}
        {(activeTab === 'all' || activeTab === 'siam') && (
          <SiamFastingSection
            systemDate={systemDate}
            hijriInfo={hijriInfo}
            fastingLog={currentLog.fasting}
            onOpenGuide={onOpenGuide}
          />
        )}

        {/* SUNNAH PRAYERS & NAWAFIL SECTION (INCLUDES QIYAM AL-LAYL & WITR) */}
        {(activeTab === 'all' || activeTab === 'sunnah') && (
          <SunnahPrayersSection
            systemDate={systemDate}
            sunnahLog={currentLog.sunnahPrayers}
            spiritualLog={currentLog}
            onOpenGuide={onOpenGuide}
            onOpenMuhasabahAudit={onOpenMuhasabahAudit}
          />
        )}

        {/* ADHKAR FORTRESS */}
        {(activeTab === 'all' || activeTab === 'adhkar') && (
          <AdhkarSection
            systemDate={systemDate}
            spiritualLog={currentLog}
            onOpenGuide={onOpenGuide}
          />
        )}

        {/* KHUSHU' & HEART PRESENCE GAUGE (1-10 STEPPER) */}
        {(activeTab === 'all' || activeTab === 'salaat') && (
          <div className="p-5 bg-gradient-to-r from-[#17140e] via-[#100e0a] to-[#070605] border border-[#c5a059]/30 rounded-2xl relative overflow-hidden shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  <h4 className="font-display font-bold text-base text-zinc-100">
                    Khushū&apos; & Heart Presence Gauge (مِيزَانُ الخُشُوعِ وَحُضُورِ القَلْب)
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
                      ? 'bg-[#c5a059] text-black border border-amber-200 shadow-[0_0_15px_rgba(197,160,89,0.4)]'
                      : 'bg-[#07080a] border border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-sm">{val}</span>
                </button>
              ))}
            </div>
          </div>
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

    </div>
  );
};
