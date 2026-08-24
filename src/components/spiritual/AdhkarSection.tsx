import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Sparkles, CheckCircle2, Plus, 
  Minus, RefreshCw, Heart, Award, HelpCircle, Check, Zap
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { PostSalahAdhkarMap, PostSalahDhikrMode, SpiritualDailyLog } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface AdhkarSectionProps {
  systemDate: string;
  spiritualLog: SpiritualDailyLog;
  onOpenGuide?: (section?: string) => void;
}

export const AdhkarSection: React.FC<AdhkarSectionProps> = ({
  systemDate,
  spiritualLog,
  onOpenGuide
}) => {
  const { 
    toggleAdhkar, 
    incrementSalawat, 
    setSalawatCount, 
    updateDhikrLog 
  } = usePOS();

  const [salawatCustomInput, setSalawatCustomInput] = useState('');
  const [showPostSalahHadith, setShowPostSalahHadith] = useState(false);

  const adhkarSabah = spiritualLog.adhkarSabah;
  const adhkarMasa = spiritualLog.adhkarMasa;
  const salawatCount = spiritualLog.salawatCount || 0;
  const salawatTargetReached = salawatCount >= 70;

  const dhikr = spiritualLog.dhikr || {
    tasbeehAfterSalah: false,
    postSalahAdhkar: {},
    tasbeehCount: 0,
    hamdCount: 0,
    tahlilCount: 0,
    takbirCount: 0,
    istighfarCount: 0,
    hawqalaCount: 0
  };

  const postSalahMap = dhikr.postSalahAdhkar || {};
  const tasbeehCount = dhikr.tasbeehCount || 0;
  const hamdCount = dhikr.hamdCount || 0;
  const tahlilCount = dhikr.tahlilCount || 0;
  const takbirCount = dhikr.takbirCount || 0;

  // 5 prayers list for post-salah adhkar
  const prayersConfig: { id: keyof PostSalahAdhkarMap; nameEn: string; nameAr: string; time: string }[] = [
    { id: 'fajr', nameEn: 'Fajr', nameAr: 'الفَجْر', time: 'Dawn' },
    { id: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظُّهْر', time: 'Midday' },
    { id: 'asr', nameEn: '‘Asr', nameAr: 'العَصْر', time: 'Afternoon' },
    { id: 'maghrib', nameEn: 'Maghrib', nameAr: 'المَغْرِب', time: 'Sunset' },
    { id: 'isha', nameEn: '‘Ishā’', nameAr: 'العِشَاء', time: 'Night' }
  ];

  const completedPostPrayersCount = prayersConfig.filter(p => {
    const mode = postSalahMap[p.id];
    return mode === 'standard33' || mode === 'mini10';
  }).length;

  const handleSetPrayerAdhkar = (prayerId: keyof PostSalahAdhkarMap, mode: PostSalahDhikrMode) => {
    const currentMode = postSalahMap[prayerId] || 'none';
    const newMode = currentMode === mode ? 'none' : mode;

    // Adjust word counters based on delta
    let deltaTasbih = 0;
    let deltaHamd = 0;
    let deltaTakbir = 0;
    let deltaTahlil = 0;

    // Subtract old mode
    if (currentMode === 'standard33') {
      deltaTasbih -= 33;
      deltaHamd -= 33;
      deltaTakbir -= 33;
      deltaTahlil -= 1;
    } else if (currentMode === 'mini10') {
      deltaTasbih -= 10;
      deltaHamd -= 10;
      deltaTakbir -= 10;
    }

    // Add new mode
    if (newMode === 'standard33') {
      deltaTasbih += 33;
      deltaHamd += 33;
      deltaTakbir += 33;
      deltaTahlil += 1;
    } else if (newMode === 'mini10') {
      deltaTasbih += 10;
      deltaHamd += 10;
      deltaTakbir += 10;
    }

    const updatedMap: PostSalahAdhkarMap = {
      ...postSalahMap,
      [prayerId]: newMode
    };

    updateDhikrLog({
      postSalahAdhkar: updatedMap,
      tasbeehCount: Math.max(0, tasbeehCount + deltaTasbih),
      hamdCount: Math.max(0, hamdCount + deltaHamd),
      takbirCount: Math.max(0, takbirCount + deltaTakbir),
      tahlilCount: Math.max(0, tahlilCount + deltaTahlil),
      tasbeehAfterSalah: Object.values(updatedMap).some(m => m === 'standard33' || m === 'mini10')
    }, systemDate);
  };

  const handleSetAllPostAdhkar = (targetMode: 'standard33' | 'mini10') => {
    const updatedMap: PostSalahAdhkarMap = {
      fajr: targetMode,
      dhuhr: targetMode,
      asr: targetMode,
      maghrib: targetMode,
      isha: targetMode
    };

    const multiplier = targetMode === 'standard33' ? 33 : 10;
    const tahlilInc = targetMode === 'standard33' ? 5 : 0;

    updateDhikrLog({
      postSalahAdhkar: updatedMap,
      tasbeehCount: Math.max(0, tasbeehCount + (multiplier * 5)),
      hamdCount: Math.max(0, hamdCount + (multiplier * 5)),
      takbirCount: Math.max(0, takbirCount + (multiplier * 5)),
      tahlilCount: Math.max(0, tahlilCount + tahlilInc),
      tasbeehAfterSalah: true
    }, systemDate);
  };

  const handleResetAllPostAdhkar = () => {
    updateDhikrLog({
      postSalahAdhkar: {
        fajr: 'none',
        dhuhr: 'none',
        asr: 'none',
        maghrib: 'none',
        isha: 'none'
      },
      tasbeehAfterSalah: false
    }, systemDate);
  };

  const incrementCount = (key: 'tasbeehCount' | 'hamdCount' | 'tahlilCount' | 'takbirCount', delta: number) => {
    const currentVal = dhikr[key] || 0;
    const nextVal = Math.max(0, currentVal + delta);
    updateDhikrLog({ [key]: nextVal }, systemDate);
  };

  const resetWordCount = (key: 'tasbeehCount' | 'hamdCount' | 'tahlilCount' | 'takbirCount') => {
    updateDhikrLog({ [key]: 0 }, systemDate);
  };

  const incrementAllFour = (delta: number) => {
    updateDhikrLog({
      tasbeehCount: Math.max(0, tasbeehCount + delta),
      hamdCount: Math.max(0, hamdCount + delta),
      tahlilCount: Math.max(0, tahlilCount + delta),
      takbirCount: Math.max(0, takbirCount + delta)
    }, systemDate);
  };

  const handleCustomSalawat = () => {
    const parsed = parseInt(salawatCustomInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      incrementSalawat(parsed, systemDate);
      setSalawatCustomInput('');
    }
  };

  // Four Words Configuration
  const fourWords = [
    {
      id: 'tasbeehCount' as const,
      nameEn: 'Tasbīḥ',
      nameAr: 'التَّسْبِيح',
      arabicText: 'سُبْحَانَ اللهِ',
      transliteration: 'SubḥānAllāh',
      meaning: 'Glory be to Allah',
      count: tasbeehCount,
      gradient: 'from-cyan-950/40 via-[#071317] to-[#04080a]',
      border: 'border-cyan-500/30',
      accentColor: 'text-cyan-300',
      badgeBg: 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40',
      btnBg: 'bg-cyan-950/60 hover:bg-cyan-900 border-cyan-500/30 text-cyan-200'
    },
    {
      id: 'hamdCount' as const,
      nameEn: 'Ḥamd',
      nameAr: 'التَّحْمِيد',
      arabicText: 'الحَمْدُ لِلَّهِ',
      transliteration: 'Alḥamdulillāh',
      meaning: 'All praise is due to Allah',
      count: hamdCount,
      gradient: 'from-emerald-950/40 via-[#071710] to-[#040a07]',
      border: 'border-emerald-500/30',
      accentColor: 'text-emerald-300',
      badgeBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40',
      btnBg: 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-500/30 text-emerald-200'
    },
    {
      id: 'tahlilCount' as const,
      nameEn: 'Tahlīl',
      nameAr: 'التَّهْلِيل',
      arabicText: 'لَا إِلَهَ إِلَّا اللهُ',
      transliteration: 'Lā ilāha illAllāh',
      meaning: 'None has right to be worshipped but Allah',
      count: tahlilCount,
      gradient: 'from-amber-950/40 via-[#181308] to-[#0a0804]',
      border: 'border-amber-500/30',
      accentColor: 'text-amber-300',
      badgeBg: 'bg-amber-950/80 text-amber-200 border-amber-500/40',
      btnBg: 'bg-amber-950/60 hover:bg-amber-900 border-amber-500/30 text-amber-200'
    },
    {
      id: 'takbirCount' as const,
      nameEn: 'Takbīr',
      nameAr: 'التَّكْبِير',
      arabicText: 'اللهُ أَكْبَرُ',
      transliteration: 'Allāhu Akbar',
      meaning: 'Allah is the Greatest',
      count: takbirCount,
      gradient: 'from-rose-950/40 via-[#19090f] to-[#0a0406]',
      border: 'border-rose-500/30',
      accentColor: 'text-rose-300',
      badgeBg: 'bg-rose-950/80 text-rose-200 border-rose-500/40',
      btnBg: 'bg-rose-950/60 hover:bg-rose-900 border-rose-500/30 text-rose-200'
    }
  ];

  return (
    <div className="p-5 sm:p-6 bg-gradient-to-br from-[#110f17] via-[#0c0912] to-[#06050a] border border-violet-500/30 rounded-2xl relative overflow-hidden shadow-xl space-y-6" id="adhkar-sanctuary">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-500/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono bg-violet-950/80 text-violet-300 border border-violet-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5 shadow-sm">
              <RubElHizbIcon className="h-3 w-3 text-violet-400" />
              <span>الأَذْكَار • ADHKĀR & REMEMBRANCE</span>
            </span>

            <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
              🕌 {completedPostPrayersCount}/5 Post-Prayer Adhkār
            </span>

            {salawatTargetReached && (
              <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                🌹 70+ Salawāt Completed (+100 XP)
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-display font-bold text-zinc-100 flex items-center gap-2">
            <span>Morning &amp; Evening Adhkār, Post-Prayers (/5), Ṣalāt ‘ala ar-Rasūl ﷺ &amp; The 4 Beloved Words</span>
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-3xl">
            &ldquo;The most beloved words to Allah are four: SubhanAllah, Alhamdulillah, La ilaha illallah, and Allahu Akbar.&rdquo; (Sahih Muslim) • &ldquo;Unquestionably, by the remembrance of Allah hearts are assured.&rdquo; (Surah Ar-Ra&apos;d 13:28)
          </p>
        </div>
      </div>

      {/* 2. PILLAR 1: MORNING & EVENING ADHKAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
              1. Morning &amp; Evening Adhkār (أَذْكَارُ الصَّبَاحِ وَالمَسَاء)
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">The Spiritual Fortress</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* MORNING ADHKAR */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
            adhkarSabah
              ? 'bg-gradient-to-br from-[#1c160c] to-[#0d0905] border-amber-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-display font-bold text-zinc-100 text-sm block">Morning Adhkār (أَذْكَارُ الصَّبَاح)</span>
                  <span className="text-[10px] font-mono text-zinc-400">Dawn until Sunrise</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                +75 XP • +10 C
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              The fortress of the believer from dawn to sunrise. Protection against harms, doubts, and anxiety throughout the day.
            </p>

            <button
              onClick={() => toggleAdhkar('sabah', systemDate)}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                adhkarSabah
                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-100 shadow-sm'
                  : 'bg-[#07050c] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${adhkarSabah ? 'text-amber-400' : 'text-zinc-600'}`} />
              <span>{adhkarSabah ? 'MORNING ADHKĀR COMPLETED ✓ (أُدِّيَت)' : 'LOG MORNING ADHKĀR (+75 XP)'}</span>
            </button>
          </div>

          {/* EVENING ADHKAR */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
            adhkarMasa
              ? 'bg-gradient-to-br from-[#160d1f] to-[#0a050f] border-violet-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-violet-500/30'
          }`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-300">
                  <Moon className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-display font-bold text-zinc-100 text-sm block">Evening Adhkār (أَذْكَارُ المَسَاء)</span>
                  <span className="text-[10px] font-mono text-zinc-400">After &apos;Asr until Sunset</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-violet-300 font-bold bg-violet-950/60 border border-violet-500/30 px-2 py-0.5 rounded-full">
                +75 XP • +10 C
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Recited after &apos;Asr into the evening. Guarding the soul and home under divine protection through the night.
            </p>

            <button
              onClick={() => toggleAdhkar('masa', systemDate)}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                adhkarMasa
                  ? 'bg-violet-950/80 border-violet-500/70 text-violet-100 shadow-sm'
                  : 'bg-[#07050c] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${adhkarMasa ? 'text-violet-400' : 'text-zinc-600'}`} />
              <span>{adhkarMasa ? 'EVENING ADHKĀR COMPLETED ✓ (أُدِّيَت)' : 'LOG EVENING ADHKĀR (+75 XP)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. PILLAR 2: POST-PRAYER ADHKAR /5 (STANDARD 33x VS MINI 10x) */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Post-Prayer Adhkār (أَذْكَارُ أَدْبَارِ الصَّلَوَاتِ المَكْتُوبَة)</span>
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px]">
                {completedPostPrayersCount} / 5 Prayers
              </span>
            </span>
          </div>

          {/* BATCH ACTION CONTROLS */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleSetAllPostAdhkar('standard33')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm"
              title="Set all 5 prayers to 33-33-33-1 Standard Sunnah"
            >
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>All 5 Standard (33x)</span>
            </button>

            <button
              onClick={() => handleSetAllPostAdhkar('mini10')}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm"
              title="Set all 5 prayers to 10-10-10 Mini Sunnah (150 on tongue, 1500 on scale)"
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>All 5 Mini (10x)</span>
            </button>

            {completedPostPrayersCount > 0 && (
              <button
                onClick={handleResetAllPostAdhkar}
                className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 text-[10px] font-mono transition"
                title="Reset all 5 prayer adhkars"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* POST-PRAYER BANNER & HADITH EXPLANATION */}
        <div className="p-4 bg-gradient-to-r from-[#0d1c15] via-[#091510] to-[#060e0a] border border-emerald-500/40 rounded-2xl space-y-3 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-display font-bold text-zinc-100">
                  Choose Standard (33x) or Mini (10x) for each Obligatory Prayer
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                  +20 XP/Standard • +12 XP/Mini • +25 XP if 5/5
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Log the remembrance recited immediately after completing each obligatory prayer: <strong>Standard</strong> (33 Tasbih, 33 Hamd, 33 Takbir + 1 Tahlil) or <strong>Mini</strong> (10 Tasbih, 10 Hamd, 10 Takbir).
              </p>
            </div>

            <button
              onClick={() => setShowPostSalahHadith(!showPostSalahHadith)}
              className="text-[11px] font-mono text-emerald-300 hover:text-emerald-200 flex items-center gap-1 shrink-0 self-start md:self-auto bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-500/30"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{showPostSalahHadith ? 'Hide Hadith Proofs' : 'View Authentic Hadith Proofs'}</span>
            </button>
          </div>

          {/* HADITH PROOFS ACCORDION */}
          <AnimatePresence>
            {showPostSalahHadith && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-emerald-500/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300 font-sans"
              >
                <div className="p-3 bg-[#06100b] border border-emerald-500/30 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase block">
                    ✨ 1. The Standard Version (33-33-33-1)
                  </span>
                  <p className="text-zinc-400 italic">
                    &ldquo;Whoever glorifies Allah thirty-three times after every prayer, praises Allah thirty-three times, and magnifies Allah thirty-three times, making ninety-nine, and completes the hundred with: <em>Lā ilāha illAllāh waḥdahu lā sharīka lah...</em>, his sins will be forgiven even if they were like the foam of the sea.&rdquo; (Sahih Muslim 597)
                  </p>
                </div>

                <div className="p-3 bg-[#061014] border border-cyan-500/30 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase block">
                    ⚡ 2. The Mini Version (10-10-10)
                  </span>
                  <p className="text-zinc-400 italic">
                    &ldquo;Two qualities, no Muslim preserves them except that he enters Paradise... He glorifies Allah 10 times, praises Him 10 times, and magnifies Him 10 times after every prayer. That is 150 on the tongue, and 1,500 on the Scale!&rdquo; (Sunan Abi Dawud 5065, Tirmidhi 3410, Sahih)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5 PRAYERS TILES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {prayersConfig.map(prayer => {
            const currentMode = postSalahMap[prayer.id] || 'none';
            const isStandard = currentMode === 'standard33';
            const isMini = currentMode === 'mini10';
            const isCompleted = isStandard || isMini;

            return (
              <div
                key={prayer.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                  isStandard
                    ? 'bg-gradient-to-b from-[#0e2117] to-[#06110b] border-emerald-500/60 shadow-md'
                    : isMini
                    ? 'bg-gradient-to-b from-[#091e24] to-[#040f12] border-cyan-500/60 shadow-md'
                    : 'bg-[#090810] border-white/10 hover:border-white/20'
                }`}
              >
                {/* PRAYER TITLE */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div>
                    <span className="font-display font-bold text-zinc-100 text-sm block">
                      {prayer.nameEn} ({prayer.nameAr})
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{prayer.time}</span>
                  </div>

                  {isCompleted ? (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isStandard ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {isStandard ? '33x ✓' : '10x ✓'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-500">Pending</span>
                  )}
                </div>

                {/* SUMMARY OF ADHKAR RECITED */}
                <div className="text-[11px] font-sans text-center py-1">
                  {isStandard ? (
                    <span className="text-emerald-300 font-medium">33 Tasbīḥ + 33 Ḥamd + 33 Takbīr + 1 Tahlīl</span>
                  ) : isMini ? (
                    <span className="text-cyan-300 font-medium">10 Tasbīḥ + 10 Ḥamd + 10 Takbīr</span>
                  ) : (
                    <span className="text-zinc-500">Select standard or mini</span>
                  )}
                </div>

                {/* INTERACTIVE TOGGLE BUTTONS */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => handleSetPrayerAdhkar(prayer.id, 'standard33')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 border ${
                      isStandard
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                        : 'bg-zinc-900/80 hover:bg-emerald-950/60 text-zinc-300 border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    {isStandard && <Check className="h-3 w-3" />}
                    <span>33x Std</span>
                  </button>

                  <button
                    onClick={() => handleSetPrayerAdhkar(prayer.id, 'mini10')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 border ${
                      isMini
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                        : 'bg-zinc-900/80 hover:bg-cyan-950/60 text-zinc-300 border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    {isMini && <Check className="h-3 w-3" />}
                    <span>10x Mini</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PILLAR 3: 70+ SALAWAT UPON PROPHET MUHAMMAD ﷺ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
              3. Ṣalāt ‘ala ar-Rasūl ﷺ (الصَّلَاةُ عَلَى النَّبِيِّ ﷺ)
            </span>
          </div>
          <span className="text-[10px] font-mono text-rose-300 font-bold">Target: 70+ Blessings Daily</span>
        </div>

        <div className="p-5 bg-gradient-to-r from-[#1f1015] via-[#150a0e] to-[#0c0508] border border-rose-500/40 rounded-2xl relative overflow-hidden shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
                  <Heart className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-bold text-base text-zinc-100">
                      70+ Prophetic Salawāt (الصَّلَاةُ وَالسَّلَامُ عَلَى النَّبِيّ)
                    </h4>
                    <span className="text-xs font-display text-rose-300">«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّد»</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    &ldquo;Whoever sends blessings upon me once, Allah sends blessings upon him tenfold, removes ten sins, and raises him ten degrees.&rdquo; (An-Nasa&apos;i)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-2xl font-display font-bold text-rose-200">{salawatCount}</span>
                <span className="text-xs text-zinc-400 font-mono"> / 70+</span>
              </div>
              <div className="w-28 bg-zinc-900 rounded-full h-3 overflow-hidden border border-white/10">
                <div 
                  className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (salawatCount / 70) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* INCREMENT BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold mr-1">Add Blessings:</span>
            {[+1, +10, +33, +70].map(val => (
              <button
                key={val}
                onClick={() => incrementSalawat(val, systemDate)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0c0609] hover:bg-rose-950/80 border border-rose-500/30 hover:border-rose-400 text-rose-200 text-xs font-mono font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="h-3 w-3" />
                <span>{val}</span>
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto">
              <input
                type="number"
                min="1"
                value={salawatCustomInput}
                onChange={(e) => setSalawatCustomInput(e.target.value)}
                placeholder="Custom #"
                className="w-20 bg-[#070406] border border-rose-500/30 rounded-lg px-2 py-1 text-xs text-rose-200 font-mono focus:outline-none focus:border-rose-400"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSalawat()}
              />
              {salawatCustomInput && (
                <button
                  onClick={handleCustomSalawat}
                  className="px-2.5 py-1 bg-rose-900 text-rose-100 rounded-lg text-xs font-mono font-bold hover:bg-rose-800"
                >
                  Add
                </button>
              )}

              <button
                onClick={() => setSalawatCount(0, systemDate)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/5 text-xs transition"
                title="Reset Salawat counter"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PILLAR 4: TASBIH + HAMD + TAHLIL + TAKBIR (THE FOUR BELOVED WORDS) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#c5a059] uppercase tracking-wider">
              4. The 4 Beloved Words: Tasbīḥ + Ḥamd + Tahlīl + Takbīr (البَاقِيَاتُ الصَّالِحَات)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-400">Batch increment:</span>
            <button
              onClick={() => incrementAllFour(33)}
              className="px-2.5 py-1 rounded-lg bg-[#14121a] hover:bg-[#201d2a] border border-[#c5a059]/40 text-[#fef08a] text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="h-3 w-3" />
              <span>+33 to All 4 Words</span>
            </button>
            <button
              onClick={() => incrementAllFour(10)}
              className="px-2.5 py-1 rounded-lg bg-[#10141a] hover:bg-[#1a222c] border border-cyan-500/40 text-cyan-200 text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="h-3 w-3" />
              <span>+10 to All 4</span>
            </button>
          </div>
        </div>

        {/* 4 CARDS GRID: TASBIH, HAMD, TAHLIL, TAKBIR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {fourWords.map(word => {
            return (
              <div
                key={word.id}
                className={`p-4 rounded-2xl border ${word.border} bg-gradient-to-b ${word.gradient} flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01]`}
              >
                {/* CARD TOP */}
                <div className="border-b border-white/5 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${word.badgeBg}`}>
                      {word.nameEn} ({word.nameAr})
                    </span>
                    <button
                      onClick={() => resetWordCount(word.id)}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                      title="Reset counter"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="text-center py-2 space-y-0.5">
                    <h5 className="text-xl font-display font-bold text-white tracking-wide">
                      {word.arabicText}
                    </h5>
                    <span className="text-[11px] font-sans italic text-zinc-400 block">
                      {word.transliteration}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-sans block">
                      &ldquo;{word.meaning}&rdquo;
                    </span>
                  </div>
                </div>

                {/* COUNTER DISPLAY */}
                <div className="text-center py-1 bg-black/30 rounded-xl border border-white/5">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-2xl font-display font-bold ${word.accentColor}`}>
                      {word.count}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">recitations</span>
                  </div>
                  {word.count >= 33 && (
                    <span className="text-[9px] font-mono text-emerald-400 block">
                      ✓ {Math.floor(word.count / 33)} complete set{Math.floor(word.count / 33) > 1 ? 's' : ''} (+{Math.min(75, Math.floor(word.count / 33) * 25)} XP)
                    </span>
                  )}
                </div>

                {/* INCREMENT CONTROLS */}
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-4 gap-1">
                    {[+1, +10, +33, +100].map(val => (
                      <button
                        key={val}
                        onClick={() => incrementCount(word.id, val)}
                        className={`py-1 rounded-lg border text-[10px] font-mono font-bold transition flex items-center justify-center gap-0.5 ${word.btnBg}`}
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>{val}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => incrementCount(word.id, -1)}
                    disabled={word.count <= 0}
                    className="w-full py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 disabled:opacity-20 text-[10px] font-mono text-zinc-400 transition flex items-center justify-center gap-1 border border-white/5"
                  >
                    <Minus className="h-2.5 w-2.5" />
                    <span>Undo 1</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
