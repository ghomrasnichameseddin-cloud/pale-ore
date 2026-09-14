import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, CheckCircle2, ShieldCheck, Sparkles, 
  Scale, Flame, Heart, BookOpen, Sun, Moon,
  ArrowUpRight, Check, AlertCircle, Compass,
  ChevronDown, ChevronUp, RefreshCw, X
} from 'lucide-react';
import { RubElHizbIcon } from '../IslamicRpgDecorations';
import { usePOS } from '../../POSContext';
import { SpiritualDailyLog, PrayerCheck } from '../../types';

interface SacredProtocolScorecardProps {
  onClose?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SacredProtocolScorecard: React.FC<SacredProtocolScorecardProps> = ({ 
  onClose,
  onNavigateTab
}) => {
  const { 
    systemDate, 
    getSpiritualLog, 
    getMasjid40Stats, 
    getAdhkarFortressStats, 
    getQuranFreshnessScore,
    togglePrayer,
    toggleAllPrayersInMasjid,
    updateQiyam,
    toggleFasting,
    incrementSalawat,
    setKhushuRating,
    updateQuranLog
  } = usePOS();

  const [activeMode, setActiveMode] = useState<'live' | 'specs'>('live');
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);

  const currentLog = getSpiritualLog(systemDate);
  const masjid40Stats = getMasjid40Stats(systemDate);
  const fortressStats = getAdhkarFortressStats(systemDate);
  const quranFreshness = getQuranFreshnessScore(systemDate);

  // 1. Pillar 1: 5 Daily Salaat
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  const completedFardh = prayers.filter(p => currentLog[p]?.fardh).length;
  const onTimeCount = prayers.filter(p => currentLog[p]?.onTime).length;
  const delayedCount = prayers.filter(p => currentLog[p]?.delayed).length;
  // Score: 1.6 pt per fardh + 0.4 pt per on-time, minus 1 per delayed, capped at 10
  const rawPillar1 = Math.max(0, Math.min(10, Math.round((completedFardh * 1.6 + onTimeCount * 0.4 - delayedCount * 1.0) * 10) / 10));

  // 2. Pillar 2: 40-Day Masjid Sanctuary
  const todayMasjidCount = prayers.filter(p => currentLog[p]?.inMasjid && (currentLog[p]?.fardh !== false)).length;
  // Score: 2 pts per masjid prayer (5/5 = 10 pts)
  const rawPillar2 = Math.min(10, todayMasjidCount * 2);

  // 3. Pillar 3: 12 Sunan Rawatib
  const fajrRawatib = !!currentLog.fajr?.sunnahRawatib;
  const dhuhrRawatib = !!currentLog.dhuhr?.sunnahRawatib;
  const maghribRawatib = !!currentLog.maghrib?.sunnahRawatib;
  const ishaRawatib = !!currentLog.isha?.sunnahRawatib;
  const rawatibRakats = (fajrRawatib ? 2 : 0) + (dhuhrRawatib ? 6 : 0) + (maghribRawatib ? 2 : 0) + (ishaRawatib ? 2 : 0);
  const rawPillar3 = Math.min(10, Math.round((rawatibRakats / 12) * 10));

  // 4. Pillar 4: Qiyam al-Layl & Witr
  const qiyamRakats = currentLog.qiyamRakats || 0;
  const qiyamWitr = !!currentLog.qiyamWitr;
  let rawPillar4 = 0;
  if (qiyamRakats >= 4 && qiyamWitr) rawPillar4 = 10;
  else if (qiyamRakats >= 2 && qiyamWitr) rawPillar4 = 8.5;
  else if (qiyamRakats >= 2) rawPillar4 = 6.0;
  else if (qiyamWitr) rawPillar4 = 4.0;

  // 5. Pillar 5: Siam & Fasting
  const isFasting = !!currentLog.fasting?.isFasting;
  const suhurTaken = !!currentLog.fasting?.suhurTaken;
  const iftarCompleted = !!currentLog.fasting?.iftarCompleted;
  const duaMade = !!currentLog.fasting?.duaMadeAtIftar;
  let rawPillar5 = 0;
  if (isFasting) {
    rawPillar5 = 4 + (suhurTaken ? 2 : 0) + (iftarCompleted ? 2.5 : 0) + (duaMade ? 1.5 : 0);
  } else {
    // If not fasting on a voluntary day, base score default of 7 for lawful non-fasting if intentions are pure, or 10 if fasting
    rawPillar5 = 7;
  }

  // 6. Pillar 6: Adhkar Fortress (Sabah, Masa, Sleep)
  const rawPillar6 = Math.min(10, Math.round((fortressStats.integrityScore / 10) * 10) / 10);

  // 7. Pillar 7: 5 Post-Salah Adhkar
  const postRemembrance = currentLog.dhikr?.postSalahAdhkar || {};
  const postDoneCount = prayers.filter(p => postRemembrance[p] === 'standard33' || postRemembrance[p] === 'mini10').length;
  const rawPillar7 = Math.min(10, postDoneCount * 2);

  // 8. Pillar 8: 70+ Salawat upon the Prophet ﷺ
  const salawatCount = currentLog.salawatCount || 0;
  const rawPillar8 = Math.min(10, Math.round((salawatCount / 70) * 100) / 10);

  // 9. Pillar 9: Quran Sanctum (Tilawah, Tadabbur, Hifdh)
  const quranPages = currentLog.quran?.pagesRead || 0;
  const hasJuz = !!currentLog.quran?.juzRead;
  const hasTadabbur = !!currentLog.quran?.tadabburNotes && currentLog.quran.tadabburNotes.trim().length > 0;
  const hasHifdh = !!currentLog.quran?.memorizationReviewed;
  let rawPillar9 = Math.min(5, quranPages * 0.5);
  if (hasJuz) rawPillar9 = 5;
  if (hasTadabbur) rawPillar9 += 2.5;
  if (hasHifdh) rawPillar9 += 2.5;
  rawPillar9 = Math.min(10, Math.round(rawPillar9 * 10) / 10);

  // 10. Pillar 10: Khushu & Heart Presence
  const khushuScore = currentLog.khushuRating || 8;
  const rawPillar10 = Math.min(10, khushuScore);

  // Aggregate Total Daily Score
  const totalScore = Math.round(
    (rawPillar1 + rawPillar2 + rawPillar3 + rawPillar4 + rawPillar5 +
     rawPillar6 + rawPillar7 + rawPillar8 + rawPillar9 + rawPillar10) * 10
  ) / 10;
  const percentage = Math.min(100, Math.round(totalScore));
  const scoreOutOf10 = (totalScore / 10).toFixed(1);

  const getTier = (pct: number) => {
    if (pct >= 90) return { titleEn: 'Mumtāz (Mastery / Uncompromised)', titleAr: 'مُمْتَاز • حِصْنٌ مَنِيعٌ', color: 'text-[#e5c875]', border: 'border-[#c5a059]', bg: 'bg-[#c5a059]/20' };
    if (pct >= 80) return { titleEn: 'Jayyid Jiddan (Exemplary Devotion)', titleAr: 'جَيِّدٌ جِدّاً • طَاعَةٌ مُبَارَكَة', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/40' };
    if (pct >= 70) return { titleEn: 'Jayyid (Guarded Sanctuary)', titleAr: 'جَيِّد • حِمَايَةٌ جَيِّدَة', color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-950/40' };
    if (pct >= 50) return { titleEn: 'Maqbūl (Vulnerable Perimeter)', titleAr: 'مَقْبُول • ثَغْرٌ مَفْتُوح', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/40' };
    return { titleEn: 'Da\'eef (Critical Fortification Required)', titleAr: 'يَحْتَاجُ تَثْبِيتاً وَمُجَاهَدَة', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/40' };
  };

  const tier = getTier(percentage);

  const pillarsData = [
    {
      id: 1,
      tabId: 'salaat',
      titleEn: '5 Obligatory Daily Prayers & Congregation',
      titleAr: 'الصلوات الخمس المكتوبة في أوقاتها',
      score: rawPillar1,
      target: '10 pts',
      statusText: `${completedFardh}/5 Performed • ${onTimeCount} On-Time${delayedCount > 0 ? ` • ${delayedCount} Delayed` : ''}`,
      desc: 'Accountability for Fajr, Dhuhr, Asr, Maghrib, and Isha with punctuality bonuses and delay deterrence.',
      actionLabel: completedFardh === 5 ? 'All 5 Fulfilled ✓' : 'Open Salaat View',
      componentsCovered: [
        '5 Obligatory Fardh prayers (+100 to +150 XP each)',
        'Punctuality On-Time bonus (+40 XP each) vs Delay deterrent (-50 XP)',
        'Instant link to Muhāsabah Audit if delayed'
      ]
    },
    {
      id: 2,
      tabId: 'masjid40',
      titleEn: '40-Day Consecutive Masjid Sanctuary',
      titleAr: 'عَهْدُ الأربعين يوماً في المسجد (البراءتان)',
      score: rawPillar2,
      target: '10 pts',
      statusText: `${todayMasjidCount}/5 in Masjid Today • Active Streak: ${masjid40Stats.currentStreak} Days`,
      desc: 'Consecutive congregation in the Masjid based on the Hadith of Al-Barā\'atān (Freedom from Fire and Hypocrisy).',
      actionLabel: todayMasjidCount === 5 ? 'All 5 in Masjid ✓' : '1-Click All in Masjid',
      onAction: () => toggleAllPrayersInMasjid(systemDate, true),
      componentsCovered: [
        '40-bead illuminated sanctuary matrix with live streak tracking',
        'Al-Barā\'atān Stages (Muqbil, Sālik, Thābit, Fa\'iz)',
        'Masjid / Jamā\'ah bonus (+50 XP per prayer)'
      ]
    },
    {
      id: 3,
      tabId: 'sunnah',
      titleEn: 'The 12 Confirmed Sunan Rawātib',
      titleAr: 'السنن الرواتب الاثنتا عشرة (بيت في الجنة)',
      score: rawPillar3,
      target: '10 pts',
      statusText: `${rawatibRakats}/12 Rak'ahs Completed ${rawatibRakats >= 12 ? '• House in Jannah Earned 🏰' : ''}`,
      desc: 'The 12 daily Sunnah rak\'ahs guaranteeing a palace in Jannah (Fajr 2, Dhuhr 4+2, Maghrib 2, Isha 2).',
      actionLabel: rawatibRakats >= 12 ? 'Rawātib Fulfilled ✓' : 'Open Sunan Tab',
      componentsCovered: [
        'Fajr 2 before (+40 XP), Dhuhr 4 before + 2 after (+60 XP)',
        'Maghrib 2 after (+30 XP), Isha 2 after (+30 XP)',
        'Automatic "House in Jannah" covenant verification'
      ]
    },
    {
      id: 4,
      tabId: 'sunnah',
      titleEn: 'Qiyām al-Layl, Tahajjud & Witr',
      titleAr: 'قيام الليل والتهجد والوتر',
      score: rawPillar4,
      target: '10 pts',
      statusText: `${qiyamRakats} Rak'ahs Prayed • ${qiyamWitr ? 'Witr Sealed ✓' : 'Witr Remaining'}`,
      desc: 'The sacred night vigil in the final third of the night, sealed with the Prophet\'s odd-numbered Witr.',
      actionLabel: qiyamWitr ? 'Night Vigil Done ✓' : 'Log 2R + Witr',
      onAction: () => updateQiyam(Math.max(2, qiyamRakats), true, systemDate),
      componentsCovered: [
        'Foundational 2 Rak\'ahs (+100 XP) + progressive pairs (+40 XP/pair)',
        'Odd-numbered Witr closure (+50 XP, +5 Coins)',
        'Last-third divine descent mindfulness'
      ]
    },
    {
      id: 5,
      tabId: 'siam',
      titleEn: 'Siam & Sacred Fasting Sanctuary',
      titleAr: 'الصيام وسنة السحور ودعاء الإفطار',
      score: rawPillar5,
      target: '10 pts',
      statusText: isFasting 
        ? `Fasting Active • Suhur ${suhurTaken ? '✓' : '—'} • Iftar ${iftarCompleted ? '✓' : '—'} • Dua ${duaMade ? '✓' : '—'}`
        : 'Non-Fasting Day (Voluntary Intent Pure)',
      desc: 'Observance of obligatory and prophetic voluntary fasts with the blessings of Suhūr and accepted Ifṭār supplication.',
      actionLabel: isFasting ? 'Fasting Active ✓' : 'Start Fast Today',
      onAction: () => toggleFasting('isFasting', undefined, systemDate),
      componentsCovered: [
        '9 Fasting modalities with automatic Hijri calendar detection',
        'Sunnah of Suhūr (+25 XP) with Hadith blessing',
        'Ifṭār (+125 XP, +20 Coins) and authentic prophetic Du\'ā logging'
      ]
    },
    {
      id: 6,
      tabId: 'adhkar',
      titleEn: 'Adhkār Fortress: Sabah, Masa & Sleep',
      titleAr: 'حصن الأذكار: الصباح والمساء والنوم',
      score: rawPillar6,
      target: '10 pts',
      statusText: `${fortressStats.statusLabel} • ${fortressStats.integrityScore}% Integrity`,
      desc: 'The triple fortress sheltering the believer from dawn till dusk and through the nocturnal rest.',
      actionLabel: fortressStats.integrityScore >= 95 ? 'Fortress Sealed ✓' : 'Open Fortress Tab',
      componentsCovered: [
        'Morning Sabah Adhkār (+75 XP) from Fajr to sunrise',
        'Evening Masa Adhkār (+75 XP) after Asr / Maghrib',
        'Bedtime Sleep Adhkār (+75 XP) with Ayat al-Kursi & Tasbīḥ Fāṭimah'
      ]
    },
    {
      id: 7,
      tabId: 'adhkar',
      titleEn: '5 Post-Ṣalāh Sunnah Adhkār',
      titleAr: 'أذكار دبر كل صلاة مكتوبة (٣٣-٣٣-٣٣-١)',
      score: rawPillar7,
      target: '10 pts',
      statusText: `${postDoneCount}/5 Obligatory Prayers Sealed with Tasbīḥ`,
      desc: 'The 33 SubhanAllah, 33 Alhamdulillah, 33 Allahu Akbar, and 1 Tahlil sequence wiping sins away.',
      actionLabel: postDoneCount === 5 ? 'All 5 Sealed ✓' : 'Open Post-Adhkār',
      componentsCovered: [
        'Sunnah remembrance after Fajr, Dhuhr, Asr, Maghrib, and Isha',
        'Standard 33x tasbīḥ set or Mini 10x travel set',
        'Forgiveness of sins even if like the foam of the sea'
      ]
    },
    {
      id: 8,
      tabId: 'adhkar',
      titleEn: '70+ Daily Salawāt upon the Messenger ﷺ',
      titleAr: 'الورد اليومي للصلاة على النبي ﷺ (٧٠+)',
      score: rawPillar8,
      target: '10 pts',
      statusText: `${salawatCount}/70+ Recitations (${salawatCount >= 70 ? 'Threshold Achieved ✓' : `${70 - salawatCount} remaining`})`,
      desc: 'Fulfilling the daily prophetic covenant of invocations, unlocking ten blessings and elevation from Allah for each recitation.',
      actionLabel: salawatCount >= 70 ? 'Target Reached ✓' : '+10 Salawāt',
      onAction: () => incrementSalawat(10, systemDate),
      componentsCovered: [
        'Counter tracking toward the minimum 70+ prophetic threshold (+100 XP)',
        'Friday blessing multiplier guidance',
        'Removal of distress and forgiveness of sins guarantee'
      ]
    },
    {
      id: 9,
      tabId: 'quran',
      titleEn: 'Qur\'ān Sanctum: Tilāwah, Tadabbur & Revision',
      titleAr: 'القرآن الكريم: تلاوة وتدبر ومراجعة الحفظ',
      score: rawPillar9,
      target: '10 pts',
      statusText: `${quranPages} Pages • ${hasJuz ? 'Full Juz ✓ • ' : ''}${hasTadabbur ? 'Tadabbur ✓ • ' : ''}${hasHifdh ? 'Hifdh ✓' : 'Revision pending'}`,
      desc: 'Daily reading, deep contemplation, and retention freshness across the book of Allah.',
      actionLabel: quranPages >= 10 ? 'Portion Read ✓' : '+2 Pages Tilāwah',
      onAction: () => updateQuranLog({ pagesRead: quranPages + 2 }, systemDate),
      componentsCovered: [
        'Daily Tilāwah pages & 30-Juz completion accountability',
        'Tadabbur reflection notes (+40 XP)',
        'Hifdh revision queue with Spaced Repetition & Freshness rating'
      ]
    },
    {
      id: 10,
      tabId: 'overview',
      titleEn: 'Khushū\' & Heart Presence Gauge',
      titleAr: 'ميزان الخشوع وحضور القلب والطمأنينة',
      score: rawPillar10,
      target: '10 pts',
      statusText: `${khushuScore}/10 (${khushuScore >= 9 ? 'Supreme Stillness' : khushuScore >= 7 ? 'Attentive Focus' : 'Distracted / Needs Renewal'})`,
      desc: 'Self-evaluative spiritual quality metric measuring mental tranquility, stillness, and freedom from worldly noise.',
      actionLabel: 'Adjust Khushū\'',
      componentsCovered: [
        'Daily 1-10 heart presence rating scale with qualitative feedback',
        'Theological Sincerity Safeguards warning against spiritual pride (Ujb)',
        'Focus reminder: "You only gain from your prayer that which you were mindful of"'
      ]
    }
  ];

  const handlePillarClick = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
      if (onClose) onClose();
    }
  };

  return (
    <div className="p-5 sm:p-7 bg-gradient-to-br from-[#12141c] via-[#0b0d13] to-[#07080c] border border-[#c5a059]/40 rounded-2xl relative overflow-hidden shadow-2xl space-y-6" id="sacred-protocol-quality-scorecard">
      
      {/* BACKGROUND FILIGREE */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full text-[#c5a059] fill-current">
          <path d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
        </svg>
      </div>

      {/* HEADER WITH LIVE QUALITY SCORE */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-[#c5a059]/20 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono bg-[#c5a059]/20 text-[#fef08a] border border-[#c5a059]/50 px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(197,160,89,0.2)]">
              <Award className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>SACRED PROTOCOL QUALITY SCORECARD • مِيزَانُ الجَوْدَةِ الإِيمَانِيَّة</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-full">
              Date: {systemDate}
            </span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              Daily Quality Evaluation:
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-display font-black text-[#fef08a] bg-[#1a140a] px-3.5 py-0.5 rounded-xl border border-[#c5a059]/50 shadow-[0_0_20px_rgba(197,160,89,0.25)]">
                {scoreOutOf10} <span className="text-xs font-mono font-normal text-[#c5a059]">/ 10</span>
              </span>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${tier.border} ${tier.bg} ${tier.color}`}>
                {tier.titleEn} ({percentage}%)
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 font-sans max-w-2xl">
            A dynamic, real-time audit assessing your daily performance across all 10 foundational pillars of the Sacred Protocol, synchronized continuously with your actions.
          </p>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {/* VIEW MODE TOGGLE */}
          <div className="p-1 bg-zinc-900/90 border border-white/10 rounded-xl flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveMode('live')}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                activeMode === 'live' 
                  ? 'bg-[#c5a059] text-black shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Today's Live Score
            </button>
            <button
              onClick={() => setActiveMode('specs')}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                activeMode === 'specs' 
                  ? 'bg-[#c5a059] text-black shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Theological Specs
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-white/10 transition"
              title="Close Scorecard"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 10-PIP VISUAL PROGRESS METER */}
      <div className="p-4 bg-[#090b10] border border-[#c5a059]/20 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>10 Sacred Pillars Compliance Gauge:</span>
          </span>
          <span className="font-bold text-[#fef08a]">{totalScore.toFixed(1)} / 100 Points ({percentage}%)</span>
        </div>

        {/* 10 PIPS STRIP */}
        <div className="grid grid-cols-10 gap-1.5">
          {pillarsData.map(p => {
            const isFull = p.score >= 9.5;
            const isPartial = p.score >= 5.0;
            return (
              <div 
                key={p.id} 
                className="group relative cursor-pointer"
                onClick={() => handlePillarClick(p.tabId)}
              >
                <div className={`h-2.5 rounded-full transition-all ${
                  isFull 
                    ? 'bg-gradient-to-r from-emerald-500 to-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.5)]' 
                    : isPartial 
                    ? 'bg-amber-500/80' 
                    : 'bg-zinc-800 border border-white/5'
                }`} />
                {/* TOOLTIP */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 whitespace-nowrap bg-zinc-900 border border-[#c5a059]/40 text-[10px] font-mono px-2 py-1 rounded shadow-xl pointer-events-none">
                  <span className="text-[#e5c875] font-bold">Pillar 0{p.id}:</span> {p.score.toFixed(1)}/10
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10 PILLARS INTERACTIVE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillarsData.map((pillar) => {
          const isFull = pillar.score >= 9.5;
          const isExpanded = expandedPillar === pillar.id;

          return (
            <div
              key={pillar.id}
              className={`p-4 rounded-xl transition-all space-y-3 flex flex-col justify-between border ${
                isFull 
                  ? 'bg-gradient-to-br from-[#0c141d] to-[#070b10] border-emerald-500/40 shadow-sm' 
                  : 'bg-[#090b10] border-white/10 hover:border-[#c5a059]/40'
              }`}
            >
              {/* TOP ROW */}
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-[#c5a059]">0{pillar.id}.</span>
                      <h4 className="font-display font-bold text-zinc-100 text-sm">{pillar.titleEn}</h4>
                    </div>
                    <span className="text-[11px] font-display text-[var(--accent-bright)] block">
                      {pillar.titleAr}
                    </span>
                  </div>

                  {/* SCORE BADGE */}
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isFull 
                        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' 
                        : pillar.score >= 5 
                        ? 'bg-amber-950/80 border-amber-500/40 text-amber-300' 
                        : 'bg-zinc-900 border-white/10 text-zinc-400'
                    }`}>
                      {pillar.score.toFixed(1)} / 10
                    </span>
                  </div>
                </div>

                {/* CURRENT LIVE STATUS */}
                <div className="mt-2.5 p-2 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <div className={`h-2 w-2 rounded-full ${isFull ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400'}`} />
                    <span className="text-zinc-300 font-semibold">{pillar.statusText}</span>
                  </div>
                  {isFull && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                </div>

                <p className="text-xs text-zinc-400 font-sans mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              {/* ACTION & NAVIGATION BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between gap-2">
                  {pillar.onAction && !isFull ? (
                    <button
                      onClick={pillar.onAction}
                      className="px-3 py-1.5 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-[#c5a059]" />
                      <span>{pillar.actionLabel}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      {isFull ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
                      <span>{pillar.actionLabel}</span>
                    </span>
                  )}

                  <button
                    onClick={() => handlePillarClick(pillar.tabId)}
                    className="text-xs font-mono text-[var(--accent-bright)] hover:text-[var(--accent-highlight)] hover:underline transition flex items-center gap-1 shrink-0"
                  >
                    <span>Go to Tab</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* SPECS EXPANDER (IF IN SPECS MODE OR EXPANDED) */}
                {(activeMode === 'specs' || isExpanded) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-white/5 space-y-1.5"
                  >
                    <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold block">Theological Standards:</span>
                    <ul className="space-y-1">
                      {pillar.componentsCovered.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5 font-sans">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#c5a059] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {activeMode === 'live' && (
                  <button
                    onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 pt-1"
                  >
                    <span>{isExpanded ? 'Hide Hadith Standards' : 'Show Hadith Standards'}</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* FOOTER COVENANT SUMMARY */}
      <div className="p-4 bg-gradient-to-r from-[#1c180e] via-[#120f09] to-[#0a0805] border border-[#c5a059]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#e5c875] text-xs font-mono font-bold uppercase">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
            <span>Mīzān al-A'māl (مِيزَانُ الأَعْمَال) • Real-Time Theological Accountability</span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            All 10 pillars operate under strict prophetic guidance. Every prayer, fast, remembrance, and recitation logged across the Sacred Protocol feeds directly into this live scale.
          </p>
        </div>

        <div className="text-center sm:text-right shrink-0">
          <span className="text-2xl font-display font-bold text-[#fef08a]">{percentage}%</span>
          <span className="text-[10px] font-mono text-[#c5a059] block uppercase">Daily Sanctuary Total</span>
        </div>
      </div>

    </div>
  );
};
