import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Sparkles, Scale, Clock, Moon, Sun, Award, ChevronLeft, 
  ChevronRight, RefreshCw, AlertTriangle, BookOpen, ShieldCheck, Heart, 
  Plus, Minus, Flame, ArrowUpRight, Check, Compass, Shield
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { getHijriDate } from '../utils/hijriCalendar';
import { RubElHizbIcon, GeometricDivider, ArabesqueCorner } from './IslamicRpgDecorations';
import { SpiritualDailyLog, PrayerCheck } from '../types';

interface SpiritualTrackerViewProps {
  onOpenMuhasabahAudit?: () => void;
  onOpenGuide?: (section?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const SpiritualTrackerView: React.FC<SpiritualTrackerViewProps> = ({
  onOpenMuhasabahAudit,
  onOpenGuide,
  onNavigateTab
}) => {
  const { 
    state, 
    systemDate, 
    setSystemDate, 
    syncWithRealClock, 
    getSpiritualLog,
    togglePrayer,
    toggleAdhkar,
    incrementSalawat,
    setSalawatCount,
    updateQiyam,
    getTodayMuhasabahStats
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'all' | 'salaat' | 'adhkar' | 'qiyam'>('all');
  const [salawatInput, setSalawatInput] = useState<string>('');

  const currentLog: SpiritualDailyLog = getSpiritualLog(systemDate);
  const hijriInfo = getHijriDate(systemDate);
  const mizanStats = getTodayMuhasabahStats();

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
      gradient: 'from-indigo-950/50 via-[#111422] to-[#0c0f18]',
      accentColor: 'text-indigo-300',
      iconBg: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300',
      fardhXp: 100,
      fardhCoins: 10,
      sunnahLabel: '2 Rak\'ahs after Fardh',
      sunnahXp: 30,
      sunnahCoins: 5,
      masjidXp: 50,
      masjidCoins: 5
    }
  ];

  // Calculate statistics
  const completedFardhCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(
    p => currentLog[p as keyof SpiritualDailyLog] && (currentLog[p as keyof SpiritualDailyLog] as PrayerCheck).fardh
  ).length;

  const completedMasjidCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(
    p => currentLog[p as keyof SpiritualDailyLog] && (currentLog[p as keyof SpiritualDailyLog] as PrayerCheck).inMasjid
  ).length;

  const completedSunnahCount = ['fajr', 'asr', 'maghrib', 'isha'].filter(
    p => currentLog[p as keyof SpiritualDailyLog] && (currentLog[p as keyof SpiritualDailyLog] as PrayerCheck).sunnahRawatib
  ).length + (currentLog.dhuhr?.sunnahBefore ? 1 : 0) + (currentLog.dhuhr?.sunnahAfter ? 1 : 0);

  // Calculate total spiritual practice XP earned today
  let spiritualXpTotal = 0;
  prayersConfig.forEach(p => {
    const pCheck = currentLog[p.id] || { fardh: false, inMasjid: false, sunnahRawatib: false };
    if (pCheck.fardh) {
      spiritualXpTotal += p.fardhXp;
      if (pCheck.onTime !== false && !pCheck.delayed) {
        spiritualXpTotal += 40; // On-time bonus
      } else if (pCheck.delayed) {
        spiritualXpTotal -= 50; // Delayed deduction
      }
    }
    if (pCheck.inMasjid) spiritualXpTotal += p.masjidXp;
    if (p.id === 'dhuhr') {
      if (pCheck.sunnahBefore) spiritualXpTotal += 25;
      if (pCheck.sunnahAfter) spiritualXpTotal += 20;
    } else {
      if (pCheck.sunnahRawatib) spiritualXpTotal += p.sunnahXp;
    }
  });

  if (currentLog.adhkarSabah) spiritualXpTotal += 75;
  if (currentLog.adhkarMasa) spiritualXpTotal += 75;
  if (currentLog.salawatCount >= 70) spiritualXpTotal += 100;
  if (currentLog.qiyamRakats >= 2) {
    spiritualXpTotal += 100; // base 2 rak'ahs
    const extraPairs = Math.floor((currentLog.qiyamRakats - 2) / 2);
    if (extraPairs > 0) spiritualXpTotal += extraPairs * 40;
  }
  if (currentLog.qiyamWitr) spiritualXpTotal += 50;

  const handleCustomSalawatAdd = () => {
    const count = parseInt(salawatInput, 10);
    if (!isNaN(count) && count > 0) {
      incrementSalawat(count, systemDate);
      setSalawatInput('');
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12" id="spiritual-tracker-container">
      
      {/* 0. SACRED DISCLAIMER & SINCERITY (IKHLĀṢ) SAFEGUARD */}
      <div className="p-3.5 sm:p-4 bg-[#0d1017] border border-[#c5a059]/30 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#1c1810] border border-[#c5a059]/40 rounded-xl text-[#e5c875] shrink-0 mt-0.5">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1">
                <span>SINCERITY OF INTENTION • الإِخْلَاصُ للهِ تَعَالَى</span>
              </span>
              <span className="text-[9px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                SAFEGUARD
              </span>
            </div>
            <p className="text-xs text-zinc-200 font-sans leading-relaxed">
              &ldquo;<strong className="text-amber-200 font-semibold">XP is an in-app motivational measure. It does not represent Allah&apos;s reward, hasanat, or ajr. The true reward of worship belongs to Allah alone.</strong>&rdquo;
            </p>
            <p className="text-[11px] text-zinc-400 font-sans">
              Worship and sincere devotion come first. Gamification metrics (XP, streaks, levels) are secondary personal tracking aids.
            </p>
          </div>
        </div>
      </div>

      {/* 1. HIJRI CALENDAR & SACRED HEADER CARD */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#121622]/90 via-[#0c0f16]/95 to-[#090b10] border border-[#c5a059]/30 rounded-2xl relative overflow-hidden shadow-xl">
        <ArabesqueCorner position="top-right" className="top-2.5 right-2.5 h-4 w-4" color="#c5a059" />
        <ArabesqueCorner position="bottom-left" className="bottom-2.5 left-2.5 h-4 w-4" color="#c5a059" />

        {/* Subtle decorative background geometry watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <RubElHizbIcon className="w-56 h-56 text-[#c5a059]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono bg-[#1c1810] text-[#e5c875] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                <span>الرِّعَايَةُ وَالفَرَائِض • THE SACRED PROTOCOL</span>
              </span>

              {hijriInfo.isHolyMonth && (
                <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  ✨ Sacred Month ({hijriInfo.hijriMonthNameEn})
                </span>
              )}

              {hijriInfo.isJumuah && (
                <span className="text-[10px] font-mono bg-amber-950/70 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  🌟 Jumu'ah Mubarak (يوم الجمعة)
                </span>
              )}

              {hijriInfo.specialEvent && (
                <span className="text-[10px] font-mono bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  {hijriInfo.specialEvent}
                </span>
              )}
            </div>

            {/* BILINGUAL HIJRI DATE DISPLAY */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-amber-100 tracking-wide">
                  {hijriInfo.formattedAr}
                </h2>
                <span className="text-zinc-500 text-sm font-sans">|</span>
                <span className="text-base sm:text-lg text-zinc-200 font-medium font-display">
                  {hijriInfo.formattedEn}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-sans flex flex-wrap items-center gap-2">
                <span className="text-amber-200/80 font-medium">{hijriInfo.dayOfWeekAr} ({hijriInfo.dayOfWeekEn})</span>
                <span className="text-zinc-600">•</span>
                <span className="text-cyan-300/90 font-mono">Gregorian: {systemDate}</span>
              </p>
            </div>
          </div>

          {/* DATE CONTROLS & SYNC */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#07090e] border border-white/10 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => shiftDate(-1)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2.5 text-xs font-mono font-bold text-zinc-200">
                {systemDate}
              </span>
              <button
                onClick={() => shiftDate(1)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={syncWithRealClock}
              className="px-3 py-1.5 bg-[#07090e] hover:bg-white/5 border border-white/10 hover:border-[#c5a059]/40 text-zinc-200 hover:text-[#e5c875] rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Sync to Today's Real Clock"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">TODAY</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('muhasabah')}
                className="px-3 py-1.5 bg-[#07090e] hover:bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                title="Spiritual Protocols & Daily Balance Guide"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>GUIDE</span>
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY METRICS STRIP (TRANQUIL & EASY ON THE EYE) */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 bg-[#07090e]/80 border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">5 Obligatory Salaat</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-100">{completedFardhCount}/5 Complete</span>
              {completedFardhCount === 5 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-zinc-500 font-mono">{5 - completedFardhCount} left</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#07090e]/80 border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">🕌 Masjid & Sunan</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-200">{completedMasjidCount} Masjid</span>
              <span className="text-[11px] text-zinc-400 font-mono">{completedSunnahCount} Sunan</span>
            </div>
          </div>

          <div className="p-3 bg-[#07090e]/80 border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">📿 Adhkār & Qiyām</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-cyan-200">
                {currentLog.adhkarSabah && currentLog.adhkarMasa ? '2/2 Adhkār' : currentLog.adhkarSabah || currentLog.adhkarMasa ? '1/2 Adhkār' : '0/2 Adhkār'}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">{currentLog.qiyamRakats} Rak'ahs</span>
            </div>
          </div>

          <div className="p-3 bg-[#07090e]/80 border border-emerald-500/20 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">✨ Motivational XP</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-300">+{spiritualXpTotal} XP</span>
              <span className="text-[10px] font-mono text-zinc-400">(Practice)</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & BALANCE INTEGRATION */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-[#090b10] border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'all' 
                ? 'bg-[#1c1810] text-[#e5c875] font-bold border border-[#c5a059]/40 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Protocols
          </button>
          <button
            onClick={() => setActiveTab('salaat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'salaat' 
                ? 'bg-[#1c1810] text-[#e5c875] font-bold border border-[#c5a059]/40 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🕌 5 Salaats ({completedFardhCount}/5)
          </button>
          <button
            onClick={() => setActiveTab('adhkar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'adhkar' 
                ? 'bg-[#1c1810] text-[#e5c875] font-bold border border-[#c5a059]/40 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📿 Adhkār & Salawāt
          </button>
          <button
            onClick={() => setActiveTab('qiyam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'qiyam' 
                ? 'bg-[#1c1810] text-[#e5c875] font-bold border border-[#c5a059]/40 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🌙 Qiyām ({currentLog.qiyamRakats} Rak'ahs)
          </button>
        </div>

        {/* Quick link to Daily Balance */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('muhasabah')}
            className="px-3.5 py-1.5 bg-[#07090e] hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Scale className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Daily Balance: {mizanStats.todayNetXP >= 0 ? `+${mizanStats.todayNetXP}` : mizanStats.todayNetXP} XP Net</span>
          </button>
        )}
      </div>

      {/* 2. THE 5 OBLIGATORY PRAYERS (الصلوات الخمس) */}
      {(activeTab === 'all' || activeTab === 'salaat') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-mono font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>الصلوات الخمس • THE 5 OBLIGATORY SALAATS</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Fardh Obligation + Masjid & Sunan Rawātib
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {prayersConfig.map((p) => {
              const prayerState: PrayerCheck = currentLog[p.id] || { fardh: false, inMasjid: false, sunnahRawatib: false };
              const Icon = p.icon;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                    prayerState.fardh
                      ? 'bg-gradient-to-br from-[#0f1712] to-[#080d0a] border-emerald-500/40 shadow-[0_2px_15px_rgba(16,185,129,0.06)]'
                      : `bg-gradient-to-br ${p.gradient} border-white/10 hover:border-white/20`
                  }`}
                >
                  {/* Card Header: Name, Arabic, Rak'ahs, Time, Status */}
                  <div>
                    <div className="flex items-start justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${p.iconBg}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-base text-zinc-100">{p.nameEn}</span>
                            <span className="text-sm text-amber-200/90 font-display">{p.nameAr}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400">{p.timeLabel} • {p.fardhRakats} Rak'ahs</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        prayerState.fardh
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-900/80 text-zinc-500 border border-white/5'
                      }`}>
                        {prayerState.fardh ? 'FULFILLED ✓' : 'PENDING'}
                      </span>
                    </div>

                    {/* ACTIONS CONTAINER */}
                    <div className="pt-3 space-y-2.5">
                      
                      {/* 1. Primary Fardh Obligation Button */}
                      <button
                        onClick={() => togglePrayer(p.id, 'fardh', systemDate)}
                        className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-between ${
                          prayerState.fardh
                            ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-100 shadow-sm'
                            : 'bg-[#07090e] hover:bg-zinc-800/80 border-white/10 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`h-4 w-4 ${prayerState.fardh ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <span>Fardh (الفرض)</span>
                        </div>
                        <span className={`text-[10px] font-mono ${prayerState.fardh ? 'text-emerald-300 font-semibold' : 'text-zinc-400'}`}>
                          +{p.fardhXp} XP • +{p.fardhCoins} Coins
                        </span>
                      </button>

                      {/* 2. Prayer Timeliness Accountability (On-Time Bonus vs. Delayed Penalty) */}
                      <div className="p-2 rounded-xl bg-[#07090e]/80 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span className="flex items-center gap-1 font-semibold text-zinc-300">
                            <Clock className="h-3 w-3 text-[#c5a059]" />
                            <span>TIMELINESS</span>
                          </span>
                          <span>
                            {prayerState.delayed ? (
                              <span className="text-rose-400 font-bold">−50 XP Penalty</span>
                            ) : prayerState.onTime !== false && prayerState.fardh ? (
                              <span className="text-emerald-300 font-bold">+40 XP Bonus</span>
                            ) : (
                              <span className="text-zinc-500">Standard</span>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                          <button
                            onClick={() => {
                              if (!prayerState.fardh) {
                                togglePrayer(p.id, 'fardh', systemDate);
                              } else {
                                togglePrayer(p.id, 'onTime', systemDate);
                              }
                            }}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                              prayerState.fardh && (prayerState.onTime !== false && !prayerState.delayed)
                                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-sm'
                                : 'bg-[#07090e] hover:bg-zinc-800 border-white/5 text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Prayed on time in its prescribed window (+40 XP Bonus)"
                          >
                            <span>⏱️ On-Time (في وقتها)</span>
                          </button>

                          <button
                            onClick={() => {
                              if (!prayerState.fardh) {
                                togglePrayer(p.id, 'fardh', systemDate);
                                setTimeout(() => togglePrayer(p.id, 'delayed', systemDate), 50);
                              } else {
                                togglePrayer(p.id, 'delayed', systemDate);
                              }
                            }}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                              prayerState.delayed
                                ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-sm'
                                : 'bg-[#07090e] hover:bg-rose-950/20 border-white/5 text-zinc-400 hover:text-rose-300'
                            }`}
                            title="Prayed late / delayed past the window (−50 XP Penalty Deduction)"
                          >
                            <AlertTriangle className="h-3 w-3 text-rose-400" />
                            <span>Delayed (تأخير)</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. Masjid / Jamā'ah Bonus Toggle */}
                      <button
                        onClick={() => togglePrayer(p.id, 'inMasjid', systemDate)}
                        className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-center justify-between ${
                          prayerState.inMasjid
                            ? 'bg-[#1c1810] border-[#c5a059]/60 text-amber-200 font-bold shadow-sm'
                            : 'bg-[#07090e] hover:bg-zinc-800 border-white/5 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🕌</span>
                          <span>In Masjid / Jamā'ah (جماعة)</span>
                        </div>
                        <span className={`text-[10px] font-mono ${prayerState.inMasjid ? 'text-amber-200' : 'text-zinc-500'}`}>
                          +{p.masjidXp} XP
                        </span>
                      </button>

                      {/* 4. Sunan Rawātib Bonus Toggles */}
                      {p.id === 'dhuhr' ? (
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between text-[11px] font-mono text-amber-200/90 px-1 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                              <span>Sunan Rawātib (6 Rak'ahs)</span>
                            </span>
                            <span className="text-[10px] text-zinc-400">Before & After</span>
                          </div>

                          {/* Sunnah Before (Qabliyyah) */}
                          <button
                            onClick={() => togglePrayer('dhuhr', 'sunnahBefore', systemDate)}
                            className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-start justify-between text-left ${
                              prayerState.sunnahBefore
                                ? 'bg-amber-950/50 border-amber-500/50 text-amber-200 font-bold shadow-sm'
                                : 'bg-[#07090e] hover:bg-zinc-800 border-white/5 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-start gap-2 pr-2">
                              <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${prayerState.sunnahBefore ? 'text-amber-400' : 'text-zinc-600'}`} />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-zinc-200">Sunnah Before (السُّنَّة القَبْلِيَّة)</span>
                                  {prayerState.sunnahBefore && <Check className="h-3 w-3 text-amber-400" />}
                                </div>
                                <span className="text-[10px] text-zinc-400 block">4 Rak'ahs before Fardh (2 + 2)</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${prayerState.sunnahBefore ? 'text-amber-300' : 'text-zinc-500'}`}>
                              +25 XP
                            </span>
                          </button>

                          {/* Sunnah After (Ba'diyyah) */}
                          <button
                            onClick={() => togglePrayer('dhuhr', 'sunnahAfter', systemDate)}
                            className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-start justify-between text-left ${
                              prayerState.sunnahAfter
                                ? 'bg-amber-950/50 border-amber-500/50 text-amber-200 font-bold shadow-sm'
                                : 'bg-[#07090e] hover:bg-zinc-800 border-white/5 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-start gap-2 pr-2">
                              <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${prayerState.sunnahAfter ? 'text-amber-400' : 'text-zinc-600'}`} />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-zinc-200">Sunnah After (السُّنَّة البَعْدِيَّة)</span>
                                  {prayerState.sunnahAfter && <Check className="h-3 w-3 text-amber-400" />}
                                </div>
                                <span className="text-[10px] text-zinc-400 block">2 Rak'ahs after Fardh</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${prayerState.sunnahAfter ? 'text-amber-300' : 'text-zinc-500'}`}>
                              +20 XP
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => togglePrayer(p.id, 'sunnahRawatib', systemDate)}
                          className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-start justify-between text-left ${
                            prayerState.sunnahRawatib
                              ? 'bg-amber-950/50 border-amber-500/50 text-amber-200 font-bold shadow-sm'
                              : 'bg-[#07090e] hover:bg-zinc-800 border-white/5 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-start gap-2 pr-2">
                            <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${prayerState.sunnahRawatib ? 'text-amber-400' : 'text-zinc-600'}`} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="block font-semibold text-zinc-200">Sunan Rawātib (الرواتب)</span>
                                {prayerState.sunnahRawatib && <Check className="h-3 w-3 text-amber-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-400 block">{p.sunnahLabel}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${prayerState.sunnahRawatib ? 'text-amber-300' : 'text-zinc-500'}`}>
                            +{p.sunnahXp} XP
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 5. Missed or Delayed Prayer? Discrete Muhasabah Link */}
                  {!prayerState.fardh && onOpenMuhasabahAudit && (
                    <div className="pt-2 border-t border-white/5 mt-2 flex items-center justify-end">
                      <button
                        onClick={onOpenMuhasabahAudit}
                        className="text-[10px] font-mono text-rose-300/80 hover:text-rose-300 transition flex items-center gap-1 hover:underline"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Missed or delayed? Log in Muhāsabah</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ADHKĀR SABĀH & MASĀ' + 70+ SALAWĀT UPON RASOUL ﷺ */}
      {(activeTab === 'all' || activeTab === 'adhkar') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-mono font-bold text-cyan-200 uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-3.5 w-3.5 text-cyan-400" />
              <span>الأذكار والصلاة على النبي ﷺ • ADHKĀR & 70+ SALAWĀT</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Fortification of the Soul
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Morning Adhkār */}
            <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
              currentLog.adhkarSabah
                ? 'bg-gradient-to-br from-[#0c181a] to-[#070f12] border-cyan-500/40 shadow-sm'
                : 'bg-[#0c0f16] border-white/10 hover:border-cyan-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                      <Sun className="h-4 w-4" />
                    </div>
                    <span className="font-display font-bold text-zinc-100 text-sm">Morning Adhkār (أذكار الصباح)</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    +75 XP
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                  Spiritual protection from Fajr until Dhuhr. Ayat al-Kursi, 3 Quls, Sayyid al-Istighfar, and morning supplications.
                </p>
              </div>

              <button
                onClick={() => toggleAdhkar('sabah', systemDate)}
                className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentLog.adhkarSabah
                    ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-100 shadow-sm'
                    : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${currentLog.adhkarSabah ? 'text-cyan-400' : 'text-zinc-600'}`} />
                <span>{currentLog.adhkarSabah ? 'MORNING ADHKĀR COMPLETED ✓' : 'MARK COMPLETED (+75 XP)'}</span>
              </button>
            </div>

            {/* Evening Adhkār */}
            <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
              currentLog.adhkarMasa
                ? 'bg-gradient-to-br from-[#140e1e] to-[#0a0710] border-purple-500/40 shadow-sm'
                : 'bg-[#0c0f16] border-white/10 hover:border-purple-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300">
                      <Moon className="h-4 w-4" />
                    </div>
                    <span className="font-display font-bold text-zinc-100 text-sm">Evening Adhkār (أذكار المساء)</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    +75 XP
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                  Evening fortresses and peace from Asr until sleep. Gratitude, evening supplications, and Istighfar.
                </p>
              </div>

              <button
                onClick={() => toggleAdhkar('masa', systemDate)}
                className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentLog.adhkarMasa
                    ? 'bg-purple-950/80 border-purple-500/70 text-purple-100 shadow-sm'
                    : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${currentLog.adhkarMasa ? 'text-purple-400' : 'text-zinc-600'}`} />
                <span>{currentLog.adhkarMasa ? 'EVENING ADHKĀR COMPLETED ✓' : 'MARK COMPLETED (+75 XP)'}</span>
              </button>
            </div>

            {/* 70+ Salawāt upon Prophet Muhammad ﷺ */}
            <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
              currentLog.salawatCount >= 70
                ? 'bg-gradient-to-br from-[#1c1810] to-[#0d0b07] border-[#c5a059]/50 shadow-sm'
                : 'bg-[#0c0f16] border-white/10 hover:border-[#c5a059]/30'
            }`}>
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#1c1810] border border-[#c5a059]/40 text-[#e5c875]">
                      <Heart className="h-4 w-4 text-[#c5a059]" />
                    </div>
                    <span className="font-display font-bold text-zinc-100 text-sm">70+ Salawāt ﷺ (الصلاة على النبي)</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-200 font-bold bg-[#1c1810] border border-[#c5a059]/40 px-2 py-0.5 rounded-full">
                    +100 XP Goal
                  </span>
                </div>

                {/* Progress bar */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Tasbīḥ Counter:</span>
                    <span className={`font-bold ${currentLog.salawatCount >= 70 ? 'text-emerald-300' : 'text-amber-200'}`}>
                      {currentLog.salawatCount} / 70+ {currentLog.salawatCount >= 70 ? '✓ (Target Met)' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-[#07090e] h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentLog.salawatCount >= 70
                          ? 'bg-gradient-to-r from-[#c5a059] to-emerald-400'
                          : 'bg-gradient-to-r from-amber-600 to-[#c5a059]'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((currentLog.salawatCount / 70) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Tap Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => incrementSalawat(1, systemDate)}
                    className="py-1.5 bg-[#07090e] hover:bg-[#1c1810] border border-white/10 hover:border-[#c5a059]/40 text-zinc-200 hover:text-amber-100 rounded-lg font-bold transition text-center active:scale-95"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => incrementSalawat(10, systemDate)}
                    className="py-1.5 bg-[#07090e] hover:bg-[#1c1810] border border-white/10 hover:border-[#c5a059]/40 text-zinc-200 hover:text-amber-100 rounded-lg font-bold transition text-center active:scale-95"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => incrementSalawat(33, systemDate)}
                    className="py-1.5 bg-[#07090e] hover:bg-[#1c1810] border border-white/10 hover:border-[#c5a059]/40 text-zinc-200 hover:text-amber-100 rounded-lg font-bold transition text-center active:scale-95"
                  >
                    +33
                  </button>
                  <button
                    onClick={() => incrementSalawat(70, systemDate)}
                    className="py-1.5 bg-[#1c1810] hover:bg-[#2c2415] border border-[#c5a059]/60 text-[#e5c875] rounded-lg font-bold transition text-center active:scale-95"
                  >
                    +70
                  </button>
                </div>

                {/* Custom input & Reset */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Custom count..."
                    value={salawatInput}
                    onChange={(e) => setSalawatInput(e.target.value)}
                    className="flex-1 bg-[#07090e] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#c5a059]"
                  />
                  <button
                    onClick={handleCustomSalawatAdd}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono font-bold transition"
                  >
                    Add
                  </button>
                  {currentLog.salawatCount > 0 && (
                    <button
                      onClick={() => setSalawatCount(0, systemDate)}
                      className="px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 font-mono"
                      title="Reset Counter"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. QIYĀM AL-LAYL (قيام الليل والتهجد) */}
      {(activeTab === 'all' || activeTab === 'qiyam') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-mono font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>قيام الليل والتهجد • QIYĀM AL-LAYL & NIGHT DEVOTION</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              2 Rak'ahs Baseline + Bonus Pairs + Witr
            </span>
          </div>

          <div className="p-5 bg-gradient-to-br from-[#0f1122] via-[#090b16] to-[#07080f] border border-indigo-500/30 rounded-2xl space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h4 className="text-base font-display font-bold text-zinc-100 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span>The Honor of the Believer (شرف المؤمن قيام الليل)</span>
                </h4>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Standing in the stillness of the night. Minimum 2 Rak'ahs required; extra pairs cultivate Faith & Discipline.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold px-3 py-1 bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 rounded-xl">
                  {currentLog.qiyamRakats} Rak'ahs Logged
                </span>
                {currentLog.qiyamWitr && (
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-[#1c1810] border border-[#c5a059]/40 text-amber-200 rounded-xl">
                    + Witr (الوتر)
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Pair Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mandatory 2 Rak'ahs Baseline */}
              <div className="p-3.5 bg-[#07090e]/90 border border-indigo-500/20 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-200">
                    <span>1. Baseline 2 Rak'ahs</span>
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">+100 XP</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1">
                    Foundational 2 Rak'ahs of Tahajjud / Qiyām before dawn.
                  </p>
                </div>
                <button
                  onClick={() => updateQiyam(currentLog.qiyamRakats >= 2 ? 0 : 2, currentLog.qiyamWitr, systemDate)}
                  className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                    currentLog.qiyamRakats >= 2
                      ? 'bg-indigo-950/80 border-indigo-500/70 text-indigo-100 shadow-sm'
                      : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${currentLog.qiyamRakats >= 2 ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  <span>{currentLog.qiyamRakats >= 2 ? '2 RAK\'AHS PERFORMED ✓' : 'LOG 2 RAK\'AHS (+100 XP)'}</span>
                </button>
              </div>

              {/* Extra Pairs (+2, +4, +6, etc.) */}
              <div className="p-3.5 bg-[#07090e]/90 border border-indigo-500/20 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-200">
                    <span>2. Additional Pairs (+2)</span>
                    <span className="text-[10px] text-amber-200 font-bold bg-[#1c1810] px-1.5 py-0.5 rounded border border-[#c5a059]/30">+40 XP / Pair</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1">
                    Extra rak'ahs in pairs (4, 6, 8, 10 rak'ahs). Stacking devotion.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQiyam(Math.max(0, currentLog.qiyamRakats - 2), currentLog.qiyamWitr, systemDate)}
                    disabled={currentLog.qiyamRakats === 0}
                    className="p-2 bg-[#0c0f16] hover:bg-zinc-800 disabled:opacity-30 border border-white/10 text-zinc-300 rounded-lg transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-center py-1.5 bg-[#0c0f16] border border-white/10 rounded-lg text-sm font-mono font-bold text-zinc-100">
                    {currentLog.qiyamRakats} Rak'ahs
                  </div>
                  <button
                    onClick={() => updateQiyam(currentLog.qiyamRakats === 0 ? 2 : currentLog.qiyamRakats + 2, currentLog.qiyamWitr, systemDate)}
                    className="p-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 rounded-lg transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Witr Prayer */}
              <div className="p-3.5 bg-[#07090e]/90 border border-[#c5a059]/20 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-200">
                    <span>3. Witr Prayer (الوتر)</span>
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">+50 XP</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1">
                    Odd-numbered prayer sealing the night devotion (1 or 3 rak'ahs).
                  </p>
                </div>
                <button
                  onClick={() => updateQiyam(currentLog.qiyamRakats, !currentLog.qiyamWitr, systemDate)}
                  className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                    currentLog.qiyamWitr
                      ? 'bg-[#1c1810] border-[#c5a059]/60 text-amber-200 shadow-sm'
                      : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${currentLog.qiyamWitr ? 'text-amber-300' : 'text-zinc-600'}`} />
                  <span>{currentLog.qiyamWitr ? 'WITR COMPLETED ✓' : 'MARK WITR (+50 XP)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SYSTEM LINK: DAILY BALANCE & ATTRIBUTE INTEGRATION NOTICE */}
      <div className="p-4 bg-[#0a0d14] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1c1810] border border-[#c5a059]/30 rounded-xl text-[#e5c875] shrink-0">
            <Scale className="h-5 w-5 text-[#c5a059]" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase">
              System Integration: Daily Habit Balance & Sacred Attributes
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Spiritual habits log practice XP on the left pan of your Daily Balance Scale, reinforce <strong>Faith (الإيمان)</strong> & <strong>Discipline</strong> stats, and grant in-app coins.
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('muhasabah')}
            className="px-3.5 py-2 bg-[#1c1810] hover:bg-[#282215] border border-[#c5a059]/50 text-amber-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Open Daily Balance</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>

    </div>
  );
};
