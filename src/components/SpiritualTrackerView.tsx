import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Sparkles, Scale, Clock, Moon, Sun, Award, ChevronLeft, 
  ChevronRight, RefreshCw, AlertTriangle, BookOpen, ShieldCheck, Heart, 
  Plus, Minus, Flame, ArrowUpRight
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { getHijriDate } from '../utils/hijriCalendar';
import { RubElHizbIcon, GeometricDivider } from './IslamicRpgDecorations';
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

  // Prayers configuration
  const prayersConfig = [
    {
      id: 'fajr' as const,
      nameEn: 'Fajr',
      nameAr: 'الفَجْر',
      fardhRakats: 2,
      timeLabel: 'Dawn (Before Sunrise)',
      icon: Moon,
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
      timeLabel: 'Sunset',
      icon: Moon,
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

  // Calculate total spiritual XP earned today
  let spiritualXpTotal = 0;
  prayersConfig.forEach(p => {
    const pCheck = currentLog[p.id] || { fardh: false, inMasjid: false, sunnahRawatib: false };
    if (pCheck.fardh) spiritualXpTotal += p.fardhXp;
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
    <div className="space-y-6 animate-fadeIn pb-12" id="spiritual-tracker-container">
      
      {/* 1. HIJRI CALENDAR & SACRED HEADER BANNER */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#17130a] via-[#0d0f17] to-[#0a1215] border border-[#c5a059]/40 rounded-2xl relative overflow-hidden shadow-[0_4px_25px_rgba(197,160,89,0.12)]">
        {/* Subtle decorative background geometry */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <RubElHizbIcon className="w-64 h-64 text-[#c5a059]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 px-2.5 py-0.5 rounded font-bold uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                <span>الرِّعَايَةُ وَالفَرَائِض • THE SACRED PROTOCOL</span>
              </span>

              {hijriInfo.isHolyMonth && (
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  ✨ Sacred Month ({hijriInfo.hijriMonthNameEn})
                </span>
              )}

              {hijriInfo.specialEvent && (
                <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                  {hijriInfo.specialEvent}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#fef08a] tracking-wide flex items-center gap-2">
                <span>{hijriInfo.formattedAr}</span>
                <span className="text-zinc-500 text-sm font-sans font-normal">|</span>
                <span className="text-base sm:text-lg text-zinc-200">{hijriInfo.formattedEn}</span>
              </h2>
            </div>

            <p className="text-xs text-zinc-400 font-sans flex items-center gap-2">
              <span>{hijriInfo.dayOfWeekAr} • {hijriInfo.dayOfWeekEn}</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">Gregorian: {systemDate}</span>
            </p>
          </div>

          {/* DATE CONTROLS & SYNC */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => shiftDate(-1)}
                className="p-1.5 text-zinc-400 hover:text-[#fef08a] hover:bg-[#3a2e12]/40 rounded-lg transition"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-mono font-bold text-[#fef08a]">
                {systemDate}
              </span>
              <button
                onClick={() => shiftDate(1)}
                className="p-1.5 text-zinc-400 hover:text-[#fef08a] hover:bg-[#3a2e12]/40 rounded-lg transition"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={syncWithRealClock}
              className="px-2.5 py-1.5 bg-[#0b0d13] hover:bg-[#3a2e12]/50 border border-[#c5a059]/40 text-[#fef08a] rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Sync to Today's Real Clock"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">TODAY</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('muhasabah')}
                className="px-2.5 py-1.5 bg-[#0b0d13] hover:bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                title="Spiritual & Mizan Guide"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>GUIDE</span>
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="mt-4 pt-4 border-t border-[#c5a059]/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-[#07080c]/80 border border-[#c5a059]/20 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">5 Obligatory Salaat</span>
            <span className="text-base font-display font-bold text-[#fef08a] flex items-center gap-1.5">
              <span>{completedFardhCount}/5 Complete</span>
              {completedFardhCount === 5 && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            </span>
          </div>

          <div className="p-2.5 bg-[#07080c]/80 border border-amber-500/20 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">🕌 Masjid & Sunan</span>
            <span className="text-base font-display font-bold text-amber-300">
              {completedMasjidCount} Masjid • {completedSunnahCount} Sunan
            </span>
          </div>

          <div className="p-2.5 bg-[#07080c]/80 border border-cyan-500/20 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">📿 Adhkār & Qiyām</span>
            <span className="text-base font-display font-bold text-cyan-300">
              {currentLog.adhkarSabah && currentLog.adhkarMasa ? '2/2 Adhkār' : currentLog.adhkarSabah || currentLog.adhkarMasa ? '1/2 Adhkār' : '0/2 Adhkār'} • {currentLog.qiyamRakats} Rakaat
            </span>
          </div>

          <div className="p-2.5 bg-[#07080c]/80 border border-emerald-500/30 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">✨ Earned Hasanāt XP</span>
            <span className="text-base font-display font-bold text-emerald-400 flex items-center gap-1">
              <span>+{spiritualXpTotal} XP</span>
              <span className="text-[10px] font-mono text-[#c5a059]">(+Left Pan)</span>
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'all' ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Protocols
          </button>
          <button
            onClick={() => setActiveTab('salaat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'salaat' ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🕌 5 Salaats ({completedFardhCount}/5)
          </button>
          <button
            onClick={() => setActiveTab('adhkar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'adhkar' ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📿 Adhkār & Salawāt
          </button>
          <button
            onClick={() => setActiveTab('qiyam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              activeTab === 'qiyam' ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🌙 Qiyām al-Layl ({currentLog.qiyamRakats} Rak'ahs)
          </button>
        </div>

        {/* Quick link to Sacred Mizan */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('muhasabah')}
            className="px-3 py-1.5 bg-[#0b0d13] hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Sacred Mīzān: Net {mizanStats.todayNetXP >= 0 ? `+${mizanStats.todayNetXP}` : mizanStats.todayNetXP} XP</span>
          </button>
        )}
      </div>

      {/* 2. THE 5 OBLIGATORY PRAYERS (الصلوات الخمس) */}
      {(activeTab === 'all' || activeTab === 'salaat') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
              <span>الصلوات الخمس • THE 5 OBLIGATORY SALAATS</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Fardh Obligation (Most Important) + Masjid & Sunan Rawātib Bonuses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {prayersConfig.map((p) => {
              const prayerState: PrayerCheck = currentLog[p.id] || { fardh: false, inMasjid: false, sunnahRawatib: false };
              const Icon = p.icon;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    prayerState.fardh
                      ? 'bg-gradient-to-br from-[#171c14] to-[#0a100d] border-emerald-500/40 shadow-[0_2px_15px_rgba(16,185,129,0.08)]'
                      : 'bg-zinc-950/90 border-white/10 hover:border-[#c5a059]/40'
                  }`}
                >
                  {/* Header: Name & Time */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${
                        prayerState.fardh
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-900 border-white/10 text-zinc-400'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-white">{p.nameEn}</span>
                          <span className="text-sm text-[#fef08a] font-display">{p.nameAr}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">{p.timeLabel} • {p.fardhRakats} Rak'ahs</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      prayerState.fardh
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {prayerState.fardh ? 'FULFILLED' : 'PENDING'}
                    </span>
                  </div>

                  {/* 1. Obligatory Fardh Button */}
                  <div className="pt-3 space-y-2.5">
                    <button
                      onClick={() => togglePrayer(p.id, 'fardh', systemDate)}
                      className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-between ${
                        prayerState.fardh
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                          : 'bg-zinc-900/80 hover:bg-[#3a2e12]/40 border-white/10 hover:border-[#c5a059]/40 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${prayerState.fardh ? 'text-emerald-400' : 'text-zinc-600'}`} />
                        <span>Fardh (الفرض)</span>
                      </div>
                      <span className={`text-[10px] font-mono ${prayerState.fardh ? 'text-emerald-300' : 'text-zinc-500'}`}>
                        +{p.fardhXp} XP • +{p.fardhCoins} Coins
                      </span>
                    </button>

                    {/* 2. Masjid / Jamā'ah Bonus Toggle */}
                    <button
                      onClick={() => togglePrayer(p.id, 'inMasjid', systemDate)}
                      className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-center justify-between ${
                        prayerState.inMasjid
                          ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold shadow-sm'
                          : 'bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🕌</span>
                        <span>In Masjid / Jamā'ah (جماعة)</span>
                      </div>
                      <span className={`text-[10px] font-mono ${prayerState.inMasjid ? 'text-[#fef08a]' : 'text-zinc-500'}`}>
                        +{p.masjidXp} XP
                      </span>
                    </button>

                    {/* 3. Sunan Rawātib Bonus Toggles */}
                    {p.id === 'dhuhr' ? (
                      <div className="space-y-2 pt-0.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#fef08a] px-1 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                            <span>السُّنَنُ الرَّوَاتِب • Sunan Rawātib (6 Rak'ahs)</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Before & After</span>
                        </div>

                        {/* Sunnah Before (Qabliyyah) */}
                        <button
                          onClick={() => togglePrayer('dhuhr', 'sunnahBefore', systemDate)}
                          className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-start justify-between text-left ${
                            prayerState.sunnahBefore
                              ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 font-bold shadow-sm'
                              : 'bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-start gap-2 pr-2">
                            <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${prayerState.sunnahBefore ? 'text-amber-400' : 'text-zinc-500'}`} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold">Sunnah Before (السُّنَّة القَبْلِيَّة)</span>
                                {prayerState.sunnahBefore && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-400 block">4 Rak'ahs before Fardh (prayed as 2 + 2)</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${prayerState.sunnahBefore ? 'text-amber-300' : 'text-zinc-500'}`}>
                            +25 XP • +3 Coins
                          </span>
                        </button>

                        {/* Sunnah After (Ba'diyyah) */}
                        <button
                          onClick={() => togglePrayer('dhuhr', 'sunnahAfter', systemDate)}
                          className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-start justify-between text-left ${
                            prayerState.sunnahAfter
                              ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 font-bold shadow-sm'
                              : 'bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-start gap-2 pr-2">
                            <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${prayerState.sunnahAfter ? 'text-amber-400' : 'text-zinc-500'}`} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold">Sunnah After (السُّنَّة البَعْدِيَّة)</span>
                                {prayerState.sunnahAfter && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-400 block">2 Rak'ahs after Fardh</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${prayerState.sunnahAfter ? 'text-amber-300' : 'text-zinc-500'}`}>
                            +20 XP • +2 Coins
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => togglePrayer(p.id, 'sunnahRawatib', systemDate)}
                        className={`w-full py-2 px-3 rounded-xl border font-mono text-xs transition flex items-start justify-between text-left ${
                          prayerState.sunnahRawatib
                            ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 font-bold shadow-sm'
                            : 'bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-start gap-2 pr-2">
                          <Sparkles className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${prayerState.sunnahRawatib ? 'text-amber-400' : 'text-zinc-500'}`} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="block font-semibold">Sunan Rawātib (الرواتب)</span>
                              {prayerState.sunnahRawatib && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                            </div>
                            <span className="text-[10px] text-zinc-400 block">{p.sunnahLabel}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${prayerState.sunnahRawatib ? 'text-amber-300' : 'text-zinc-500'}`}>
                          +{p.sunnahXp} XP • +{p.sunnahCoins} Coins
                        </span>
                      </button>
                    )}

                    {/* 4. Missed or Delayed Prayer? 1-Click Muhasabah Audit */}
                    {!prayerState.fardh && onOpenMuhasabahAudit && (
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          onClick={onOpenMuhasabahAudit}
                          className="text-[10px] font-mono text-rose-400/80 hover:text-rose-300 transition flex items-center gap-1 hover:underline"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>Missed / Delayed? Record in Muhāsabah</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ADHKĀR SABĀH & MASĀ' + 70 SALAWĀT UPON RASOUL ﷺ */}
      {(activeTab === 'all' || activeTab === 'adhkar') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-cyan-400" />
              <span>الأذكار والصلاة على النبي ﷺ • ADHKĀR & 70+ SALAWĀT</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Fortification of the Heart & Salawāt Target
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Morning Adhkār */}
            <div className={`p-4 rounded-2xl border transition ${
              currentLog.adhkarSabah
                ? 'bg-gradient-to-br from-[#101b22] to-[#080e12] border-cyan-500/40 shadow-sm'
                : 'bg-zinc-950 border-white/10'
            }`}>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="font-display font-bold text-white text-sm">Morning Adhkār (أذكار الصباح)</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">+75 XP</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-2.5 leading-relaxed">
                Spiritual armor and protection from Fajr until Dhuhr. Ayat al-Kursi, 3 Quls, Sayyid al-Istighfar, and morning supplications.
              </p>
              <button
                onClick={() => toggleAdhkar('sabah', systemDate)}
                className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentLog.adhkarSabah
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${currentLog.adhkarSabah ? 'text-cyan-400' : 'text-zinc-600'}`} />
                <span>{currentLog.adhkarSabah ? 'MORNING ADHKĀR COMPLETE' : 'MARK COMPLETED (+75 XP)'}</span>
              </button>
            </div>

            {/* Evening Adhkār */}
            <div className={`p-4 rounded-2xl border transition ${
              currentLog.adhkarMasa
                ? 'bg-gradient-to-br from-[#171022] to-[#0c0812] border-purple-500/40 shadow-sm'
                : 'bg-zinc-950 border-white/10'
            }`}>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-purple-400" />
                  <span className="font-display font-bold text-white text-sm">Evening Adhkār (أذكار المساء)</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 font-bold">+75 XP</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-2.5 leading-relaxed">
                Protection and gratitude from Asr until bedtime. Evening fortresses, evening supplications, and Istighfar.
              </p>
              <button
                onClick={() => toggleAdhkar('masa', systemDate)}
                className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentLog.adhkarMasa
                    ? 'bg-purple-950 border-purple-500 text-purple-200'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${currentLog.adhkarMasa ? 'text-purple-400' : 'text-zinc-600'}`} />
                <span>{currentLog.adhkarMasa ? 'EVENING ADHKĀR COMPLETE' : 'MARK COMPLETED (+75 XP)'}</span>
              </button>
            </div>

            {/* 70+ Salawāt upon Prophet Muhammad ﷺ */}
            <div className={`p-4 rounded-2xl border transition ${
              currentLog.salawatCount >= 70
                ? 'bg-gradient-to-br from-[#1b170c] to-[#0f0c05] border-[#c5a059]/50 shadow-sm'
                : 'bg-zinc-950 border-white/10'
            }`}>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-[#c5a059]" />
                  <span className="font-display font-bold text-white text-sm">70+ Salawāt ﷺ (الصلاة على النبي)</span>
                </div>
                <span className="text-[10px] font-mono text-[#fef08a] font-bold">+100 XP Target</span>
              </div>

              {/* Counter progress */}
              <div className="my-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Daily Counter:</span>
                  <span className={`font-bold ${currentLog.salawatCount >= 70 ? 'text-emerald-400' : 'text-[#fef08a]'}`}>
                    {currentLog.salawatCount} / 70+ {currentLog.salawatCount >= 70 ? '✓ (Met!)' : ''}
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/5">
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

              {/* Quick Tap Buttons */}
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => incrementSalawat(1, systemDate)}
                  className="py-1.5 bg-[#0b0d13] hover:bg-[#3a2e12] border border-[#c5a059]/30 text-[#fef08a] rounded-lg font-bold transition text-center"
                >
                  +1
                </button>
                <button
                  onClick={() => incrementSalawat(10, systemDate)}
                  className="py-1.5 bg-[#0b0d13] hover:bg-[#3a2e12] border border-[#c5a059]/30 text-[#fef08a] rounded-lg font-bold transition text-center"
                >
                  +10
                </button>
                <button
                  onClick={() => incrementSalawat(70, systemDate)}
                  className="py-1.5 bg-[#3a2e12] hover:bg-[#4a3b18] border border-[#c5a059] text-[#fef08a] rounded-lg font-bold transition text-center col-span-2"
                >
                  +70 Goal
                </button>
              </div>

              {/* Custom input */}
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Custom count..."
                  value={salawatInput}
                  onChange={(e) => setSalawatInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059]"
                />
                <button
                  onClick={handleCustomSalawatAdd}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono font-bold"
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
      )}

      {/* 4. QIYĀM AL-LAYL (قيام الليل والتهجد) */}
      {(activeTab === 'all' || activeTab === 'qiyam') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-indigo-400" />
              <span>قيام الليل والتهجد • QIYĀM AL-LAYL & NIGHT DEVOTION</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              2 Rak'ahs Mandatory Baseline + Bonus Points per Additional Pair
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#0e0f1e] via-[#090b14] to-[#07080c] border border-indigo-500/30 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h4 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <span>The Honor of the Believer (شرف المؤمن قيام الليل)</span>
                </h4>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Standing in the depths of the night. Minimum 2 Rak'ahs required; every additional pair adds extra Hasanāt XP and Faith attribute weight.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold px-3 py-1 bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 rounded-xl">
                  {currentLog.qiyamRakats} Rak'ahs Logged
                </span>
                {currentLog.qiyamWitr && (
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a] rounded-xl">
                    + Witr (الوتر)
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Pair Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mandatory 2 Rak'ahs */}
              <div className="p-3.5 bg-zinc-950/90 border border-indigo-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-300">
                  <span>1. Mandatory 2 Rak'ahs Baseline</span>
                  <span className="text-[10px] text-emerald-400">+100 XP</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  The foundational 2 Rak'ahs of Tahajjud / Qiyām before dawn.
                </p>
                <button
                  onClick={() => updateQiyam(currentLog.qiyamRakats >= 2 ? 0 : 2, currentLog.qiyamWitr, systemDate)}
                  className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                    currentLog.qiyamRakats >= 2
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${currentLog.qiyamRakats >= 2 ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  <span>{currentLog.qiyamRakats >= 2 ? '2 RAK\'AHS PERFORMED' : 'LOG 2 RAK\'AHS (+100 XP)'}</span>
                </button>
              </div>

              {/* Extra Pairs (+2, +4, +6, etc.) */}
              <div className="p-3.5 bg-zinc-950/90 border border-indigo-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-300">
                  <span>2. Additional Pairs (+2 Rak'ahs)</span>
                  <span className="text-[10px] text-[#fef08a]">+40 XP / Pair</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Extra rak'ahs in pairs (4, 6, 8, 10, 12 rak'ahs). Stacking devotion.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQiyam(Math.max(0, currentLog.qiyamRakats - 2), currentLog.qiyamWitr, systemDate)}
                    disabled={currentLog.qiyamRakats === 0}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-white/10 text-zinc-300 rounded-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-center py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-sm font-mono font-bold text-white">
                    {currentLog.qiyamRakats} Rak'ahs
                  </div>
                  <button
                    onClick={() => updateQiyam(currentLog.qiyamRakats === 0 ? 2 : currentLog.qiyamRakats + 2, currentLog.qiyamWitr, systemDate)}
                    className="p-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Witr Prayer */}
              <div className="p-3.5 bg-zinc-950/90 border border-[#c5a059]/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#fef08a]">
                  <span>3. Witr Prayer (صلاة الوتر)</span>
                  <span className="text-[10px] text-emerald-400">+50 XP</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Odd-numbered prayer sealing the night devotion (1 or 3 rak'ahs).
                </p>
                <button
                  onClick={() => updateQiyam(currentLog.qiyamRakats, !currentLog.qiyamWitr, systemDate)}
                  className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                    currentLog.qiyamWitr
                      ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${currentLog.qiyamWitr ? 'text-[#fef08a]' : 'text-zinc-600'}`} />
                  <span>{currentLog.qiyamWitr ? 'WITR COMPLETED' : 'MARK WITR (+50 XP)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SYSTEM LINK: SACRED MĪZĀN & ATTRIBUTE INTEGRATION NOTICE */}
      <div className="p-4 bg-zinc-950/90 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3a2e12] border border-[#c5a059]/40 rounded-xl text-[#fef08a] shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase">
              Direct System Integration: The Sacred Mīzān & Attributes
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              All prayer and dhikr points feed directly into today's <strong>Al-Hasanāt (Left Pan)</strong> of the Sacred Mīzān, elevate your <strong>Faith (الإيمان)</strong> & <strong>Discipline</strong> stats, and earn system coins.
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('muhasabah')}
            className="px-3 py-2 bg-[#3a2e12] hover:bg-[#4a3b18] border border-[#c5a059] text-[#fef08a] rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Open Sacred Mīzān</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>

    </div>
  );
};
