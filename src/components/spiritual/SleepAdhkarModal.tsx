import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Sparkles, CheckCircle2, Check, X, 
  Bed, Shield, RotateCcw, BookOpen, Clock, Heart, Plus
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from '../IslamicRpgDecorations';

interface SleepAdhkarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'dhohr' | 'night';
  systemDate: string;
}

interface DhikrItem {
  id: string;
  titleEn: string;
  titleAr: string;
  source: string;
  arabic: string;
  transliteration: string;
  translation: string;
  virtue: string;
  targetCount: number;
}

export const DHOHR_SLEEP_ADHKAR: DhikrItem[] = [
  {
    id: 'dhohr-bismika-amutu',
    titleEn: '1. Dua Upon Lying Down (Bismika Allahumma)',
    titleAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'Sahih al-Bukhari (6312)',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allāhumma amūtu wa aḥyā',
    translation: 'In Your Name, O Allah, I die and I live.',
    virtue: 'Prophetic affirmation that sleep is a minor death under Allah’s sovereignty.',
    targetCount: 1
  },
  {
    id: 'dhohr-bismika-rabbi',
    titleEn: '2. Entrusting the Soul (Bismika Rabbi Wada‘tu Janbi)',
    titleAr: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي',
    source: 'Sahih al-Bukhari (6320) & Muslim (2714)',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration: 'Bismika Rabbī waḍa‘tu janbī wa bika arfa‘uh, in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī ‘ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your Name my Lord, I put down my side and by Your strength I rise. If You retain my soul, have mercy upon it, and if You release it, safeguard it as You safeguard Your righteous servants.',
    virtue: 'Guarantees comprehensive divine guardianship over your soul while unconscious.',
    targetCount: 1
  },
  {
    id: 'dhohr-ayat-kursi',
    titleEn: '3. Ayat al-Kursi (The Throne Verse - 2:255)',
    titleAr: 'آيَةُ الكُرْسِيّ (البقرة: 255)',
    source: 'Sahih al-Bukhari (2311)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta’khuḏhūhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    virtue: 'Allah sends an angel to guard you continuously so no shayṭān can draw near until you awaken.',
    targetCount: 1
  },
  {
    id: 'dhohr-waking-dua',
    titleEn: '4. Dua Upon Awakening from Qaylulah',
    titleAr: 'دُعَاءُ الاسْتِيقَاظِ مِنَ القَيْلُولَة',
    source: 'Sahih al-Bukhari (6312)',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Al-ḥamdu lillāhillaḏhī aḥyānā ba‘da mā amātanā wa ilayhin-nushūr.',
    translation: 'All praise is for Allah Who gave us life after having caused us to die, and unto Him is the final resurrection.',
    virtue: 'Instills immediate gratitude and awakens the heart into Allah’s remembrance for the afternoon prayers.',
    targetCount: 1
  }
];

export const NIGHT_SLEEP_ADHKAR: DhikrItem[] = [
  {
    id: 'night-three-quls',
    titleEn: '1. The 3 Quls with Nafth (Al-Ikhlas, Al-Falaq, An-Nas) x3',
    titleAr: 'المُعَوِّذَاتُ وَالإِخْلَاص مَعَ النَّفْث (3 مَرَّات)',
    source: 'Sahih al-Bukhari (5017)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas (Recited 3 times into cupped hands, then wiping the head, face, and body).',
    translation: 'Recite each Surah 3 times into cupped palms, gently blow (nafth) with fine moisture, and wipe hands over entire head, face, and front of the body.',
    virtue: 'Shields the believer from nightmares, evil eye, jealousy, witchcraft, and unseen whispers throughout the entire night.',
    targetCount: 3
  },
  {
    id: 'night-ayat-kursi',
    titleEn: '2. Ayat al-Kursi (2:255)',
    titleAr: 'آيَةُ الكُرْسِيّ (البقرة: 255)',
    source: 'Sahih al-Bukhari (2311)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allāhu lā ilāha illā huwal-ḥayyul-qayyūm...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...',
    virtue: 'Prophetic promise: "An angel from Allah will remain as your guardian, and no devil will come near you until morning."',
    targetCount: 1
  },
  {
    id: 'night-baqarah-last2',
    titleEn: '3. Last Two Verses of Surah Al-Baqarah (2:285-286)',
    titleAr: 'خَوَاتِيمُ سُورَةِ البَقَرَة (285-286)',
    source: 'Sahih al-Bukhari (5009) & Muslim (807)',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Āmanar-rasūlu bimā unzila ilayhi mir-rabbihī wal-mu’minūn...',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and so have the believers... Whoever recites these two verses at night, they will suffice him (kafataah).',
    virtue: 'Sufices the reader against all evils, harms, sorcery, and replaces night worship deficits.',
    targetCount: 1
  },
  {
    id: 'night-tasbih-fatimah',
    titleEn: '4. Tasbīḥ Fāṭimah (33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar)',
    titleAr: 'تَسْبِيحُ فَاطِمَةَ الزَّهْرَاءِ (33، 33، 34)',
    source: 'Sahih al-Bukhari (3705) & Muslim (2727)',
    arabic: 'سُبْحَانَ اللهِ (33×) • الحَمْدُ لِلَّهِ (33×) • اللهُ أَكْبَرُ (34×)',
    transliteration: 'SubḥānAllāh (33x), Al-ḥamdulillāh (33x), Allāhu Akbar (34x) — Total: 100 recitations.',
    translation: 'Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (34x).',
    virtue: 'Prophet Muhammad ﷺ gave this to Fatima & Ali when they asked for a servant: "It is better for you both than a servant."',
    targetCount: 100
  },
  {
    id: 'night-bismika-rabbi',
    titleEn: '5. Entrusting the Soul (Bismika Rabbi Wada‘tu Janbi)',
    titleAr: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي',
    source: 'Sahih al-Bukhari (6320)',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration: 'Bismika Rabbī waḍa‘tu janbī wa bika arfa‘uh, in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī ‘ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your Name my Lord, I put down my side and by You I raise it up. If You hold my soul, have mercy upon it, and if You send it back, guard it as You guard Your righteous servants.',
    virtue: 'Authentic protection over the soul in the spiritual realms while asleep.',
    targetCount: 1
  },
  {
    id: 'night-dua-fitrah',
    titleEn: '6. Prophetic Du‘a al-Fiṭrah (Allahumma Aslamtu Nafsi)',
    titleAr: 'دُعَاءُ الفِطْرَةِ الأَعْظَم (اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ)',
    source: 'Sahih al-Bukhari (6313) & Muslim (2710)',
    arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
    transliteration: 'Allāhumma aslamtu nafsī ilayk, wa fawwaḍtu amrī ilayk, wa wajjahtu wajhī ilayk, wa alja’tu ẓahrī ilayk, raghbatan wa rahbatan ilayk, lā malja’a wa lā manjā minka illā ilayk, āmantu bikitābikal-laḏhī anzalt, wa binabiyyikal-laḏhī arsalt.',
    translation: 'O Allah, I surrender my soul to You, entrust my affair to You, turn my face to You, and commit my back to You in longing and awe of You. There is no haven or refuge from You except with You. I believe in Your Book which You revealed and in Your Prophet whom You sent.',
    virtue: 'The Prophet ﷺ taught Al-Bara’ ibn ‘Azib: "Make this the very last thing you speak before sleep. If you die that night, you die upon the pure natural religion (Fiṭrah)."',
    targetCount: 1
  },
  {
    id: 'night-qini-adhabak',
    titleEn: '7. Refuge from the Day of Resurrection (x3)',
    titleAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ (3×)',
    source: 'Sunan Abi Dawud (5045) & Tirmidhi (3398)',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    transliteration: 'Allāhumma qinī ‘aḏhābaka yawma tab‘athu ‘ibādak (Recited 3 times with right hand placed under right cheek).',
    translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
    virtue: 'Recited by the Prophet ﷺ three times whenever he lay down to sleep.',
    targetCount: 3
  },
  {
    id: 'night-surah-mulk',
    titleEn: '8. Surah Al-Mulk (Tabarakal-Ladhi)',
    titleAr: 'سُورَةُ المُلْك (المَانِعَةُ المُنْجِيَة)',
    source: 'Jami‘ at-Tirmidhi (2891) & Sahih al-Jami‘ (3643)',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ...',
    transliteration: 'Tabārakal-laḏhī biyadihil-mulku wa huwa ‘alā kulli shay’in qadīr...',
    translation: 'Blessed is He in Whose hand is dominion, and He is over all things competent...',
    virtue: 'Thirty verses that intercede for their reciter until his sins are forgiven and shields against the torment of the grave.',
    targetCount: 1
  },
  {
    id: 'night-waking-dua',
    titleEn: '9. Dua Upon Awakening in the Morning',
    titleAr: 'دُعَاءُ الاسْتِيقَاظِ عِنْدَ الصَّبَاح',
    source: 'Sahih al-Bukhari (6312)',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Al-ḥamdu lillāhillaḏhī aḥyānā ba‘da mā amātanā wa ilayhin-nushūr.',
    translation: 'Praise is to Allah Who gave us life after He caused us to die, and unto Him is the final resurrection.',
    virtue: 'Unties the first knot of shayṭān upon awakening, welcoming the dawn with pure Tawḥīd.',
    targetCount: 1
  }
];

export const SleepAdhkarModal: React.FC<SleepAdhkarModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'night',
  systemDate
}) => {
  const { getSpiritualLog, toggleAdhkar } = usePOS();
  const [activeTab, setActiveTab] = useState<'dhohr' | 'night'>(initialTab);
  const [counters, setCounters] = useState<Record<string, number>>({});

  // Sync tab when opened
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentLog = getSpiritualLog(systemDate);
  const isDhohrCompleted = Boolean(currentLog.adhkarSleepDhohr);
  const isNightCompleted = Boolean(currentLog.adhkarSleepNight);

  const currentList = activeTab === 'dhohr' ? DHOHR_SLEEP_ADHKAR : NIGHT_SLEEP_ADHKAR;

  const handleIncrement = (id: string, target: number) => {
    setCounters(prev => {
      const current = prev[id] || 0;
      const next = current >= target ? 0 : current + 1;
      return { ...prev, [id]: next };
    });
  };

  const handleSetCompleted = (id: string, target: number) => {
    setCounters(prev => ({
      ...prev,
      [id]: target
    }));
  };

  const handleResetCurrentCounters = () => {
    const next = { ...counters };
    currentList.forEach(item => {
      delete next[item.id];
    });
    setCounters(next);
  };

  const completedCount = currentList.filter(item => (counters[item.id] || 0) >= item.targetCount).length;
  const progressPercent = Math.round((completedCount / currentList.length) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-3xl w-full bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl p-5 sm:p-6 space-y-5 shadow-[0_0_50px_rgba(197,160,89,0.2)] text-left relative my-auto max-h-[90vh] flex flex-col"
        >
          <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
          <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-[#c5a059]/20 pb-3.5 shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#18150d] border border-[#c5a059]/60 rounded-xl text-[#fef08a] shadow-inner">
                {activeTab === 'dhohr' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-violet-400" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    <span>SLEEP ADHKĀR FORTRESS • حِصْنُ أَدْعِيَةِ النَّوْم</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#fef08a]">
                    AUTHENTIC SUNNAH
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  Prophetic remembrances, Quranic shields, and etiquette for Dhohr Qaylulah nap &amp; bedtime rest.
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-zinc-800 transition"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="grid grid-cols-2 gap-2 bg-[#06070b] p-1.5 rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('dhohr')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'dhohr'
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Dhohr Nap (Qaylūlah)</span>
                {isDhohrCompleted && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('night')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'night'
                    ? 'bg-violet-950/80 text-violet-200 border border-violet-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-violet-400" />
                <span>Night Sleep (النوم بالليل)</span>
                {isNightCompleted && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400 text-[11px]">Recited:</span>
              <span className="font-bold text-[#fef08a]">{completedCount} / {currentList.length}</span>
              <div className="w-20 bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/10">
                <div 
                  className={`h-full transition-all duration-300 ${
                    activeTab === 'dhohr' ? 'bg-amber-400' : 'bg-violet-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                onClick={handleResetCurrentCounters}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
                title="Reset counters"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* SUNNAH ETIQUETTE BANNER */}
          {activeTab === 'dhohr' ? (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-[#18140b] to-[#0d0a06] border border-amber-500/30 rounded-xl space-y-1.5 shrink-0 text-xs font-sans">
              <div className="flex items-center gap-2 text-amber-300 font-display font-bold text-xs">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>The Prophetic Sunnah of Qaylūlah (قِيلُوا فَإِنَّ الشَّيَاطِينَ لَا تَقِيلُ)</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                The Prophet ﷺ said: <em>&ldquo;Take a midday nap, for the devils do not take a midday nap.&rdquo;</em> (Sahih al-Jami‘ 4431). 
                Sunnah etiquette: Rest for 20–30 minutes before or after Dhuhr prayer with the intention of gaining vitality for afternoon worship, productive labor, and Tahajjud (Qiyām al-Layl).
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-gradient-to-r from-violet-950/40 via-[#120e1a] to-[#07050d] border border-violet-500/30 rounded-xl space-y-1.5 shrink-0 text-xs font-sans">
              <div className="flex items-center gap-2 text-violet-300 font-display font-bold text-xs">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                <span>The 3 Essential Prophetic Bedtime Etiquettes (آدَابُ النَّوْمِ النَّبَوِيَّة)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-[11px] text-zinc-300">
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">1</span>
                  <span><strong>Wuḍū’</strong> prior to bed as for prayer</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">2</span>
                  <span><strong>Dust bed 3x</strong> with garment edge</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">3</span>
                  <span><strong>Sleep on right side</strong>, hand on cheek</span>
                </div>
              </div>
            </div>
          )}

          {/* SCROLLABLE LIST OF ADHKAR */}
          <div className="overflow-y-auto pr-1.5 space-y-3.5 flex-1 min-h-0">
            {currentList.map((item, idx) => {
              const currentVal = counters[item.id] || 0;
              const isItemDone = currentVal >= item.targetCount;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-2.5 ${
                    isItemDone
                      ? 'bg-[#0b1411] border-emerald-500/50 shadow-sm'
                      : 'bg-[#07080c] border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* TOP TITLE & BADGES */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-white">
                          {item.titleEn}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 bg-black/50 border border-white/10 px-2 py-0.5 rounded-md">
                          {item.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-display text-zinc-400 block">
                        {item.titleAr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isItemDone ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Done ({currentVal}/{item.targetCount})
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/5">
                          {currentVal} / {item.targetCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ARABIC SCRIPT */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-right">
                    <p className="text-base sm:text-lg font-serif font-bold text-[#fef08a] leading-loose tracking-wide select-all" dir="rtl">
                      {item.arabic}
                    </p>
                  </div>

                  {/* TRANSLITERATION & TRANSLATION */}
                  <div className="space-y-1 text-xs font-sans">
                    <p className="text-zinc-300 italic font-mono text-[11px] leading-relaxed">
                      {item.transliteration}
                    </p>
                    <p className="text-zinc-400 text-[11.5px] leading-relaxed">
                      &ldquo;{item.translation}&rdquo;
                    </p>
                  </div>

                  {/* VIRTUE & ACTION BUTTONS */}
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-amber-300/80 font-sans">
                      <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                      <span>{item.virtue}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleIncrement(item.id, item.targetCount)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 border ${
                          isItemDone
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-white/10'
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tap Recite (+1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetCompleted(item.id, item.targetCount)}
                        className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 text-xs font-mono transition"
                        title="Mark full set completed"
                      >
                        ✓ Max
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-[#c5a059]/20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">
                Daily Status:
              </span>
              {activeTab === 'dhohr' ? (
                isDhohrCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Dhohr Qaylūlah Logged (+50 XP)
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-400/90 font-bold">
                    Pending (+50 XP available)
                  </span>
                )
              ) : (
                isNightCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Night Sleep Adhkār Logged (+75 XP)
                  </span>
                ) : (
                  <span className="text-xs font-mono text-violet-400/90 font-bold">
                    Pending (+75 XP available)
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'dhohr' ? (
                <button
                  type="button"
                  onClick={() => toggleAdhkar('sleepDhohr', systemDate)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm ${
                    isDhohrCompleted
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isDhohrCompleted ? 'Dhohr Nap Logged ✓ (Undo)' : 'LOG DHOHR NAP ADHKĀR (+50 XP)'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleAdhkar('sleepNight', systemDate)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm ${
                    isNightCompleted
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white border-violet-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isNightCompleted ? 'Night Sleep Logged ✓ (Undo)' : 'LOG NIGHT SLEEP ADHKĀR (+75 XP)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#07080c] hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition"
              >
                Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
