import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sun, Moon, Compass, ShieldCheck, Heart, Sparkles, 
  CheckCircle2, Plus, Minus, BookOpen, AlertCircle, 
  HelpCircle, ChevronDown, Check, Award
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { SunnahPrayersLog, SpiritualDailyLog } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface SunnahPrayersSectionProps {
  systemDate: string;
  sunnahLog?: SunnahPrayersLog;
  spiritualLog?: SpiritualDailyLog;
  onOpenGuide?: (section?: string) => void;
  onOpenMuhasabahAudit?: () => void;
}

export const SunnahPrayersSection: React.FC<SunnahPrayersSectionProps> = ({
  systemDate,
  sunnahLog,
  spiritualLog,
  onOpenGuide,
  onOpenMuhasabahAudit
}) => {
  const { updateSunnahPrayers, setQiyamRakats, getSpiritualLog, togglePrayer } = usePOS();
  const [showDuhaInfo, setShowDuhaInfo] = useState(false);
  const [showQiyamInfo, setShowQiyamInfo] = useState(false);
  const [showWitrDua, setShowWitrDua] = useState(false);
  const [showRawatibInfo, setShowRawatibInfo] = useState(false);
  const [showIstikharaDua, setShowIstikharaDua] = useState(false);

  const activeLog = spiritualLog || getSpiritualLog(systemDate);
  const qiyamRakats = activeLog?.qiyamRakats || 0;
  const qiyamWitr = !!activeLog?.qiyamWitr;

  const duhaRakats = sunnahLog?.duhaRakats || 0;
  const tahiyyatAlMasjid = sunnahLog?.tahiyyatAlMasjid || false;
  const sunnatAlWudu = sunnahLog?.sunnatAlWudu || false;
  const istikhara = sunnahLog?.istikhara || false;
  const tawbah = sunnahLog?.tawbah || false;
  const hajah = sunnahLog?.hajah || false;
  const sujud = sunnahLog?.sujudShukrOrTilawah || false;

  const totalNawafilCompletedCount = 
    (qiyamRakats > 0 ? 1 : 0) +
    (qiyamWitr ? 1 : 0) +
    (duhaRakats > 0 ? 1 : 0) + 
    (tahiyyatAlMasjid ? 1 : 0) + 
    (sunnatAlWudu ? 1 : 0) + 
    (istikhara ? 1 : 0) + 
    (tawbah ? 1 : 0) + 
    (hajah ? 1 : 0) + 
    (sujud ? 1 : 0);

  const handleQiyamChange = (delta: number) => {
    const next = Math.max(0, qiyamRakats + delta);
    setQiyamRakats(next, qiyamWitr, systemDate);
  };

  const handleSetQiyamPreset = (rakats: number) => {
    setQiyamRakats(rakats, qiyamWitr, systemDate);
  };

  const handleToggleWitr = () => {
    setQiyamRakats(qiyamRakats, !qiyamWitr, systemDate);
  };

  const setDuha = (rakats: number) => {
    updateSunnahPrayers({ duhaRakats: rakats }, systemDate);
  };

  const toggleField = (field: keyof SunnahPrayersLog) => {
    if (field === 'duhaRakats') return;
    const current = !!sunnahLog?.[field];
    updateSunnahPrayers({ [field]: !current }, systemDate);
  };

  const fajrRawatib = !!activeLog?.fajr?.sunnahRawatib;
  const dhuhrRawatib = !!activeLog?.dhuhr?.sunnahRawatib;
  const asrRawatib = !!activeLog?.asr?.sunnahRawatib;
  const maghribRawatib = !!activeLog?.maghrib?.sunnahRawatib;
  const ishaRawatib = !!activeLog?.isha?.sunnahRawatib;

  const rawatibRakatsCompleted = 
    (fajrRawatib ? 2 : 0) +
    (dhuhrRawatib ? 6 : 0) + // 4 before, 2 after
    (maghribRawatib ? 2 : 0) +
    (ishaRawatib ? 2 : 0);
  const houseInJannahAchieved = rawatibRakatsCompleted >= 12;

  return (
    <div className="p-5 sm:p-6 bg-gradient-to-br from-[#121019] via-[#0d0a14] to-[#08060d] border border-amber-500/30 rounded-2xl relative overflow-hidden shadow-xl space-y-6" id="sunnah-nawafil-sanctuary">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5 shadow-sm">
              <RubElHizbIcon className="h-3 w-3 text-amber-400" />
              <span>السُّنَنُ وَالنَّوَافِلُ وَقِيَامُ اللَّيْل • SUNAN, NAWĀFIL & QIYĀM</span>
            </span>

            <span className="text-[10px] font-mono bg-amber-900/40 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full">
              {totalNawafilCompletedCount} Active Sunnah &amp; Nawāfil Categories Today
            </span>

            {qiyamRakats >= 2 && (
              <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                🌙 {qiyamRakats}R Qiyām al-Layl Complete
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-display font-bold text-zinc-100 flex items-center gap-2">
            <span>Qiyām al-Layl &amp; Witr, Ṣalāt ad-Ḍuḥā &amp; Supererogatory Nawāfil</span>
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-3xl">
            &ldquo;The best prayer after the obligatory prayer is prayer in the middle of the night.&rdquo; (Sahih Muslim) • &ldquo;My servant continues to draw near to Me with voluntary acts until I love him.&rdquo; (Hadith Qudsi, Bukhari)
          </p>
        </div>
      </div>

      {/* 1. PINNACLE NAWAFIL: QIYAM AL-LAYL, TAHAJJUD & WITR (قيام الليل والتهجد والوتر) */}
      <div className="p-5 bg-gradient-to-br from-[#13162b] via-[#0c1020] to-[#070914] border border-indigo-500/40 rounded-2xl relative overflow-hidden shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-300 shadow-sm">
                <Moon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display font-bold text-base text-zinc-100">
                    Qiyām al-Layl, Tahajjud &amp; Witr (قِيَامُ اللَّيْلِ وَالتَّهَجُّدِ وَالوِتْر)
                  </h4>
                  {qiyamRakats > 0 && (
                    <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                      {qiyamRakats} Rak&apos;ahs Complete (+{100 + Math.max(0, Math.floor((qiyamRakats - 2) / 2) * 40)} XP)
                    </span>
                  )}
                  {qiyamWitr && (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Witr Prayed ✓ (+50 XP)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  The supreme honor of the believer. Prayed in pairs in the quietest depths of the night before Fajr.
                </p>
              </div>
            </div>
          </div>

          {/* RAK'AH SELECTOR & WITR BUTTON */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-[#060810] p-1.5 rounded-xl border border-indigo-500/30">
              <span className="text-[10px] font-mono text-zinc-400 px-1.5 uppercase font-bold">Qiyām:</span>
              {[0, 2, 4, 6, 8, 11].map(count => (
                <button
                  key={count}
                  onClick={() => handleSetQiyamPreset(count)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    qiyamRakats === count
                      ? count === 0
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                        : 'bg-indigo-600 text-white border border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {count === 0 ? 'None' : `${count} R`}
                </button>
              ))}
            </div>

            {/* WITR TOGGLE */}
            <button
              onClick={handleToggleWitr}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                qiyamWitr
                  ? 'bg-indigo-950/90 border-indigo-400 text-indigo-100 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'bg-[#060810] border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${qiyamWitr ? 'text-indigo-400' : 'text-zinc-600'}`} />
              <span>{qiyamWitr ? 'WITR LOGGED ✓' : 'LOG WITR (الوتر)'}</span>
            </button>
          </div>
        </div>

        {/* Hadith Citation & Sunnah Toggles */}
        <div className="pt-2 border-t border-indigo-500/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="text-[11px] font-sans text-indigo-200/80 italic">
            &ldquo;Make the last of your prayer at night Witr (an odd number of rak&apos;ahs).&rdquo; (Sahih Bukhari &amp; Muslim)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWitrDua(!showWitrDua)}
              className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Sparkles className="h-3 w-3" />
              <span>{showWitrDua ? 'Hide Witr Sunan' : 'Witr Sunnah Recitation & Du‘ā’'}</span>
            </button>
            <button
              onClick={() => setShowQiyamInfo(!showQiyamInfo)}
              className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <HelpCircle className="h-3 w-3" />
              <span>{showQiyamInfo ? 'Hide Details' : 'Qiyām Guidance'}</span>
            </button>
          </div>
        </div>

        {/* PROPHETIC WITR SUNAN ACCORDING TO HADITH */}
        {showWitrDua && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-[#090b16] border border-amber-500/30 rounded-xl space-y-3 text-xs"
          >
            <div className="border-b border-amber-500/20 pb-2 flex items-center justify-between">
              <span className="font-mono text-amber-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Prophetic Witr Blueprint (هَدْيُ النَّبِيِّ ﷺ فِي الوِتْر)</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Sunan an-Nasa&apos;i 1700, 1732 • Abu Dawud 1425</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#0e1222] border border-indigo-500/20 space-y-1">
                <span className="text-[10px] font-mono text-indigo-300 font-bold block">1. 1st Rak‘ah (الرَّكْعَةُ الأُولَى)</span>
                <p className="text-zinc-200 font-serif text-sm">سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى</p>
                <p className="text-[10px] font-mono text-zinc-400">Surah Al-A‘lā (Ch. 87)</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1222] border border-indigo-500/20 space-y-1">
                <span className="text-[10px] font-mono text-indigo-300 font-bold block">2. 2nd Rak‘ah (الرَّكْعَةُ الثَّانِيَة)</span>
                <p className="text-zinc-200 font-serif text-sm">قُلْ يَا أَيُّهَا الْكَافِرُونَ</p>
                <p className="text-[10px] font-mono text-zinc-400">Surah Al-Kāfirūn (Ch. 109)</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1222] border border-indigo-500/20 space-y-1">
                <span className="text-[10px] font-mono text-indigo-300 font-bold block">3. 3rd Rak‘ah (الرَّكْعَةُ الثَّالِثَة)</span>
                <p className="text-zinc-200 font-serif text-sm">قُلْ هُوَ اللَّهُ أَحَدٌ</p>
                <p className="text-[10px] font-mono text-zinc-400">Surah Al-Ikhlāṣ (Ch. 112)</p>
              </div>
            </div>

            {/* Post Witr Dhikr */}
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
              <span className="text-[10px] font-mono text-indigo-300 font-bold block">
                Post-Witr Dhikr (الذِّكْرُ المَسْنُونُ عَقِبَ الوِتْرِ - ثَلَاثَ مَرَّات):
              </span>
              <p className="text-sm font-serif text-zinc-100 leading-relaxed">
                «سُبْحَانَ المَلِكِ القُدُّوسِ» (ثلاث مرات، يجهر ويمد بها صوته في الثالثة ويقول: «رَبِّ المَلَائِكَةِ وَالرُّوحِ»)
              </p>
              <p className="text-[10px] font-mono text-zinc-300">
                Transliteration: Subḥānal-Malikil-Quddūs (3x), raising and elongating on the third: Rabbi-l-Malā’ikati war-Rūḥ. (Sunan an-Nasa&apos;i 1732, Sahih)
              </p>
            </div>

            {/* Qunut Supplication */}
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1.5">
              <span className="text-[10px] font-mono text-amber-300 font-bold block">
                Du‘ā’ al-Qunūt (دُعَاءُ القُنُوتِ فِي الوِتْرِ - عَلَّمَهُ النَّبِيُّ ﷺ لِلْحَسَنِ بْنِ عَلِيّ):
              </span>
              <p className="text-sm font-serif text-amber-100 leading-relaxed">
                «اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ»
              </p>
              <p className="text-[10px] font-sans text-zinc-300">
                “O Allah, guide me among those You have guided, grant me health among those You have granted health, look after me among those You have looked after, bless me in what You have given, and protect me from the evil of what You have decreed...” (Sunan Abi Dawud 1425, Jami‘ at-Tirmidhi 464 - Sahih)
              </p>
            </div>
          </motion.div>
        )}

        {showQiyamInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-[#070912] border border-indigo-500/20 rounded-xl text-xs text-zinc-300 font-sans space-y-1.5"
          >
            <p><strong>Baseline Sunnah:</strong> 2 Rak&apos;ahs baseline (+100 XP) followed by pairs of two (up to 8 or 10 rak&apos;ahs), concluded with 1 or 3 Rak&apos;ahs of Witr.</p>
            <p><strong>Prime Time:</strong> The last third of the night when Allah descends to the lowest heaven, asking: &ldquo;Who is calling upon Me that I may answer him?&rdquo; (Sahih Bukhari 1145)</p>
          </motion.div>
        )}
      </div>

      {/* 2. THE 12 CONFIRMED SUNAN RAWĀTIB (السُّنَنُ الرَّوَاتِبُ الاثْنَتَا عَشْرَةَ • بَيْتٌ فِي الجَنَّةِ) */}
      <div className="p-5 bg-gradient-to-r from-[#17120a] via-[#110e08] to-[#0a0805] border border-[#c5a059]/40 rounded-2xl relative overflow-hidden shadow-xl space-y-4" id="sunan-rawatib-section">
        
        {/* Header & Hadith Callout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-[#c5a059]/20 text-[#fef08a] border border-[#c5a059]/50 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <Award className="h-3 w-3 text-[#c5a059]" />
                <span>12 SUNAN RAWĀTIB • بَيْتٌ فِي الجَنَّةِ</span>
              </span>
              {houseInJannahAchieved && (
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                  🏰 House in Jannah Earned!
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <span>The 12 Confirmed Daily Sunan</span>
              <span className="text-xs font-mono text-[#c5a059]">({rawatibRakatsCompleted}/12 Rak‘ahs)</span>
            </h3>

            <p className="text-xs font-sans text-zinc-300">
              «مَنْ صَلَّى فِي يَوْمٍ وَلَيْلَةٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً بُنِيَ لَهُ بَيْتٌ فِي الجَنَّةِ» — Sahih Muslim 728
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-2xl font-display font-bold text-[#fef08a]">{rawatibRakatsCompleted}</span>
              <span className="text-xs font-mono text-zinc-400">/12 R.</span>
            </div>
            <button
              onClick={() => setShowRawatibInfo(!showRawatibInfo)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/30 text-amber-300 transition"
              title="Learn about Sunan Rawatib"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showRawatibInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-[#0a0805] border border-[#c5a059]/30 rounded-xl text-xs text-zinc-300 space-y-1.5 font-sans"
          >
            <p><strong>The Prophetic 12 Rak‘ahs (Sahih Muslim 728):</strong> 2 before Fajr, 4 before Dhuhr (in two pairs of two), 2 after Dhuhr, 2 after Maghrib, and 2 after Isha.</p>
            <p><strong>Additional Merit:</strong> &ldquo;Whoever guards 4 rak&apos;ahs before Dhuhr and 4 after it, Allah forbids him to the Fire.&rdquo; (Jami‘ at-Tirmidhi 428)</p>
            <p><strong>Before ‘Aṣr (Ghayr Mu’akkadah):</strong> &ldquo;May Allah have mercy on a person who prays four rak&apos;ahs before ‘Asr.&rdquo; (Sunan Abi Dawud 1271)</p>
          </motion.div>
        )}

        {/* PROGRESS BAR */}
        <div className="space-y-1">
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 ${
                houseInJannahAchieved ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-[#c5a059]'
              }`}
              style={{ width: `${Math.min(100, (rawatibRakatsCompleted / 12) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>2 Fajr • 6 Dhuhr • 2 Maghrib • 2 Isha</span>
            <span>{houseInJannahAchieved ? '100% Complete ✓' : `${12 - rawatibRakatsCompleted} Rak‘ahs Remaining`}</span>
          </div>
        </div>

        {/* 5 PRAYERS RAWATIB INTERACTIVE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          
          {/* Fajr */}
          <div className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
            fajrRawatib ? 'bg-indigo-950/60 border-indigo-500/50 shadow-sm' : 'bg-black/40 border-white/10'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-300">Fajr • الفجر</span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">2 R. Before</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                &ldquo;Better than this world and everything in it&rdquo; (Muslim 725)
              </p>
            </div>
            <button
              onClick={() => togglePrayer('fajr', 'sunnahRawatib', systemDate)}
              className={`w-full py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                fajrRawatib
                  ? 'bg-indigo-900 text-indigo-100 border-indigo-400'
                  : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-indigo-500/40'
              }`}
            >
              <CheckCircle2 className={`h-3 w-3 ${fajrRawatib ? 'text-indigo-300' : 'text-zinc-600'}`} />
              <span>{fajrRawatib ? '2 R. Done ✓' : 'Log 2 R. Sunnah'}</span>
            </button>
          </div>

          {/* Dhuhr */}
          <div className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
            dhuhrRawatib ? 'bg-amber-950/60 border-amber-500/50 shadow-sm' : 'bg-black/40 border-white/10'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">Dhuhr • الظهر</span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">4 Bef + 2 Aft</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Total 6 Rak‘ahs (Tirmidhi 428). Palatial foundation.
              </p>
            </div>
            <button
              onClick={() => togglePrayer('dhuhr', 'sunnahRawatib', systemDate)}
              className={`w-full py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                dhuhrRawatib
                  ? 'bg-amber-900 text-amber-100 border-amber-400'
                  : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-amber-500/40'
              }`}
            >
              <CheckCircle2 className={`h-3 w-3 ${dhuhrRawatib ? 'text-amber-300' : 'text-zinc-600'}`} />
              <span>{dhuhrRawatib ? '6 R. Done ✓' : 'Log 4+2 R. Sunnah'}</span>
            </button>
          </div>

          {/* Asr */}
          <div className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
            asrRawatib ? 'bg-orange-950/60 border-orange-500/50 shadow-sm' : 'bg-black/40 border-white/10'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-300">‘Aṣr • العصر</span>
                <span className="text-[10px] font-mono text-zinc-400">4 R. Before</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Sunnah Ghayr Mu&apos;akkadah: &ldquo;May Allah have mercy&rdquo; (Abu Dawud)
              </p>
            </div>
            <button
              onClick={() => togglePrayer('asr', 'sunnahRawatib', systemDate)}
              className={`w-full py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                asrRawatib
                  ? 'bg-orange-900 text-orange-100 border-orange-400'
                  : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-orange-500/40'
              }`}
            >
              <CheckCircle2 className={`h-3 w-3 ${asrRawatib ? 'text-orange-300' : 'text-zinc-600'}`} />
              <span>{asrRawatib ? '4 R. Done ✓' : 'Log 4 R. Sunnah'}</span>
            </button>
          </div>

          {/* Maghrib */}
          <div className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
            maghribRawatib ? 'bg-rose-950/60 border-rose-500/50 shadow-sm' : 'bg-black/40 border-white/10'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-300">Maghrib • المغرب</span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">2 R. After</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Confirmed Mu&apos;akkadah. Optional 2 before also rewarded.
              </p>
            </div>
            <button
              onClick={() => togglePrayer('maghrib', 'sunnahRawatib', systemDate)}
              className={`w-full py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                maghribRawatib
                  ? 'bg-rose-900 text-rose-100 border-rose-400'
                  : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-rose-500/40'
              }`}
            >
              <CheckCircle2 className={`h-3 w-3 ${maghribRawatib ? 'text-rose-300' : 'text-zinc-600'}`} />
              <span>{maghribRawatib ? '2 R. Done ✓' : 'Log 2 R. Sunnah'}</span>
            </button>
          </div>

          {/* Isha */}
          <div className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
            ishaRawatib ? 'bg-blue-950/60 border-blue-500/50 shadow-sm' : 'bg-black/40 border-white/10'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-300">‘Ishā’ • العشاء</span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">2 R. After</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Confirmed Mu&apos;akkadah. Final 2 of the 12 Jannah Rawātib.
              </p>
            </div>
            <button
              onClick={() => togglePrayer('isha', 'sunnahRawatib', systemDate)}
              className={`w-full py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                ishaRawatib
                  ? 'bg-blue-900 text-blue-100 border-blue-400'
                  : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-blue-500/40'
              }`}
            >
              <CheckCircle2 className={`h-3 w-3 ${ishaRawatib ? 'text-blue-300' : 'text-zinc-600'}`} />
              <span>{ishaRawatib ? '2 R. Done ✓' : 'Log 2 R. Sunnah'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. FEATURED: SALAT AD-DUHA (صلاة الضحى / الأوابين) */}
      <div className="p-5 bg-gradient-to-r from-[#1c140c] via-[#140e08] to-[#0c0805] border border-amber-500/40 rounded-2xl relative overflow-hidden shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300">
                <Sun className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-zinc-100">
                    Ṣalāt ad-Ḍuḥā (صَلَاةُ الضُّحَى • صَلَاةُ الأَوَّابِينَ)
                  </h4>
                  {duhaRakats > 0 && (
                    <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      {duhaRakats} Rak&apos;ahs Complete (+{Math.floor(duhaRakats / 2) * 40} XP)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Prayed after sunrise until before Dhuhr. Daily charity fulfilling gratitude for all 360 bodily joints.
                </p>
              </div>
            </div>
          </div>

          {/* RAK'AH SELECTOR BUTTONS (0, 2, 4, 6, 8) */}
          <div className="flex items-center gap-1.5 bg-[#080503] p-1.5 rounded-xl border border-amber-500/30 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400 px-2 uppercase font-bold">Ḍuḥā:</span>
            {[0, 2, 4, 6, 8].map(count => (
              <button
                key={count}
                onClick={() => setDuha(count)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  duhaRakats === count
                    ? count === 0
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                      : 'bg-amber-500 text-black border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {count === 0 ? 'None' : `${count} R`}
              </button>
            ))}
          </div>
        </div>

        {/* Hadith citation */}
        <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between text-xs">
          <p className="text-[11px] font-sans text-amber-200/80 italic">
            &ldquo;None preserves the Duha prayer except the oft-repentant (Awwāb).&rdquo; (Ibn Khuzaymah)
          </p>
          <button
            onClick={() => setShowDuhaInfo(!showDuhaInfo)}
            className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <HelpCircle className="h-3 w-3" />
            <span>{showDuhaInfo ? 'Hide Details' : 'Virtue Details'}</span>
          </button>
        </div>

        {showDuhaInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-[#0a0704] border border-amber-500/20 rounded-xl text-xs text-zinc-300 font-sans space-y-1.5"
          >
            <p><strong>Minimum:</strong> 2 Rak&apos;ahs. <strong>Most common Sunnah:</strong> 4 or 8 Rak&apos;ahs in pairs of two.</p>
            <p><strong>Timing:</strong> From roughly 15 minutes after sunrise until ~15 minutes before the Dhuhr Adhan.</p>
          </motion.div>
        )}
      </div>

      {/* 3. 6 SACRED NAWAFIL TILES GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            Voluntary Special Sunan &amp; Occasions (نَوَافِلُ المُنَاسَبَاتِ وَالأَحْوَال)
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Authentic Prophetic Practices</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          {/* 1. TAHIYYAT AL-MASJID (تحية المسجد) */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            tahiyyatAlMasjid
              ? 'bg-gradient-to-br from-[#1c180d] to-[#0e0c06] border-amber-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-amber-500/30'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-zinc-100 text-sm">Taḥiyyat al-Masjid (تَحِيَّةُ المَسْجِد)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  +35 XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                2 Rak&apos;ahs of greeting upon entering Allah&apos;s house before sitting down.
              </p>
            </div>

            <button
              onClick={() => toggleField('tahiyyatAlMasjid')}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                tahiyyatAlMasjid
                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-100 shadow-sm'
                  : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${tahiyyatAlMasjid ? 'text-amber-400' : 'text-zinc-600'}`} />
              <span>{tahiyyatAlMasjid ? 'COMPLETED (2 RAK\'AHS) ✓' : 'LOG TAHIYYAT AL-MASJID'}</span>
            </button>
          </div>

          {/* 2. SUNNAT AL-WUDU (سنة الوضوء / ركعتا بلال) */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            sunnatAlWudu
              ? 'bg-gradient-to-br from-[#0e181c] to-[#070c0e] border-cyan-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-cyan-500/30'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-zinc-100 text-sm">Sunnat al-Wuḍū&apos; (سُنَّةُ الوُضُوء)</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  +30 XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                2 Rak&apos;ahs after performing ablution (The practice of Bilal RA).
              </p>
            </div>

            <button
              onClick={() => toggleField('sunnatAlWudu')}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                sunnatAlWudu
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-100 shadow-sm'
                  : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${sunnatAlWudu ? 'text-cyan-400' : 'text-zinc-600'}`} />
              <span>{sunnatAlWudu ? 'COMPLETED (2 RAK\'AHS) ✓' : 'LOG SUNNAT AL-WUDU'}</span>
            </button>
          </div>

          {/* 3. SALAT AL-ISTIKHARA (صلاة الاستخارة) */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            istikhara
              ? 'bg-gradient-to-br from-[#18131d] to-[#0b080e] border-violet-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-violet-500/30'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-300">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-zinc-100 text-sm">Ṣalāt al-Istikhārah (صَلَاةُ الاسْتِخَارَة)</span>
                </div>
                <span className="text-[10px] font-mono text-violet-300 font-bold bg-violet-950/60 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  +50 XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                2 Rak&apos;ahs + guidance supplication for clarity in important decisions.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => toggleField('istikhara')}
                className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                  istikhara
                    ? 'bg-violet-950/80 border-violet-500/70 text-violet-100 shadow-sm'
                    : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${istikhara ? 'text-violet-400' : 'text-zinc-600'}`} />
                <span>{istikhara ? 'ISTIKHARA PRAYED ✓' : 'LOG ISTIKHARA (+50 XP)'}</span>
              </button>
              <button
                onClick={() => setShowIstikharaDua(!showIstikharaDua)}
                className="w-full text-[10px] font-mono text-violet-300/80 hover:text-violet-200 text-center block"
              >
                {showIstikharaDua ? 'Hide Prophetic Dua' : 'View Istikhara Dua Text'}
              </button>
            </div>
          </div>

          {/* 4. SALAT AT-TAWBAH (صلاة التوبة) */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            tawbah
              ? 'bg-gradient-to-br from-[#1c0d12] to-[#0e0609] border-rose-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-rose-500/30'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-zinc-100 text-sm">Ṣalāt at-Tawbah (صَلَاةُ التَّوْبَة)</span>
                </div>
                <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  +50 XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                2 Rak&apos;ahs of sincere repentance immediately after committing any slip or mistake.
              </p>
            </div>

            <button
              onClick={() => toggleField('tawbah')}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                tawbah
                  ? 'bg-rose-950/80 border-rose-500/70 text-rose-100 shadow-sm'
                  : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${tawbah ? 'text-rose-400' : 'text-zinc-600'}`} />
              <span>{tawbah ? 'REPENTANCE PRAYED ✓' : 'LOG SALAT AT-TAWBAH'}</span>
            </button>
          </div>

          {/* 5. SALAT AL-HAJAH (صلاة الحاجة) */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            hajah
              ? 'bg-gradient-to-br from-[#1c180e] to-[#0e0c07] border-amber-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-amber-500/30'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                    <Heart className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-zinc-100 text-sm">Ṣalāt al-Ḥājah (صَلَاةُ الحَاجَة)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  +40 XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                2 Rak&apos;ahs seeking the fulfillment of a vital worldly or religious need from Allah.
              </p>
            </div>

            <button
              onClick={() => toggleField('hajah')}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                hajah
                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-100 shadow-sm'
                  : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${hajah ? 'text-amber-400' : 'text-zinc-600'}`} />
              <span>{hajah ? 'HAJAH PRAYED ✓' : 'LOG SALAT AL-HAJAH'}</span>
            </button>
          </div>

          {/* 6. SUJUD ASH-SHUKR / TILAWAH (سجود الشكر وسجود التلاوة) */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            sujud
              ? 'bg-gradient-to-br from-[#0d1c15] to-[#070e0a] border-emerald-500/50 shadow-sm'
              : 'bg-[#0a080f] border-white/10 hover:border-emerald-500/30'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-zinc-100 text-sm">Sujūd ash-Shukr (سُجُودُ الشُّكْر)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  +20 XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans my-3 leading-relaxed">
                Instant prostration of gratitude upon receiving a blessing, relief, or good news.
              </p>
            </div>

            <button
              onClick={() => toggleField('sujudShukrOrTilawah')}
              className={`w-full py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                sujud
                  ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-100 shadow-sm'
                  : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${sujud ? 'text-emerald-400' : 'text-zinc-600'}`} />
              <span>{sujud ? 'SUJŪD PERFORMED ✓' : 'LOG PROSTRATION (+20 XP)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ISTIKHARA DUA MODAL / INLINE DRAWER */}
      {showIstikharaDua && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[#0a0710] border border-violet-500/30 rounded-xl space-y-2.5"
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold text-violet-300 uppercase">
            <span>Authentic Dua al-Istikhara (دعاء صلاة الاستخارة)</span>
            <button onClick={() => setShowIstikharaDua(false)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
          <p className="text-sm font-display text-violet-100 text-right leading-relaxed" dir="rtl">
            «اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الغُيُوبِ...»
          </p>
          <p className="text-xs text-zinc-300 font-sans italic">
            &ldquo;O Allah, I seek Your counsel through Your knowledge and I seek strength through Your power, and I ask of You from Your immense bounty; for You have power and I do not, and You know and I do not, and You are the Knower of the unseen...&rdquo; (Sahih al-Bukhari 1162)
          </p>
        </motion.div>
      )}

    </div>
  );
};
