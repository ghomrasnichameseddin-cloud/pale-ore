import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, CheckCircle2, X, Sparkles, Clock, BookOpen, 
  RotateCcw, Shield, Heart, Copy, Plus
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { PostSalahDhikrMode } from '../../types';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface PostSalahAdhkarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrayer?: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  systemDate: string;
}

type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface DhikrItem {
  id: string;
  stepNumber: number;
  titleEn: string;
  titleAr: string;
  source: string;
  arabic: string;
  transliteration: string;
  translation: string;
  virtue: string;
  targetCount: number;
  fajrMaghribOnly?: boolean;
  repeatForFajrMaghrib?: number;
}

const POST_SALAH_ADHKAR_ITEMS: DhikrItem[] = [
  {
    id: 'post-istighfar',
    stepNumber: 1,
    titleEn: '1. 3x Istighfār After Salah',
    titleAr: 'الاسْتِغْفَارُ ثَلَاثًا عَقِبَ كُلِّ صَلَاةٍ',
    source: 'Sahih Muslim (591)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ.',
    transliteration: 'Astaghfirullāh, Astaghfirullāh, Astaghfirullāh.',
    translation: 'I seek the forgiveness of Allah (3 times).',
    virtue: 'Recited immediately upon completing the final Taslīm of every obligatory prayer before reciting any other supplication.',
    targetCount: 3
  },
  {
    id: 'post-salam-dua',
    stepNumber: 2,
    titleEn: '2. Du‘ā As-Salām (Supplication of Divine Peace)',
    titleAr: 'دُعَاءُ السَّلَامِ عَقِبَ الصَّلَاةِ',
    source: 'Sahih Muslim (591)',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الجَلَالِ وَالإِكْرَامِ.',
    transliteration: 'Allāhumma Antas-Salāmu wa minkas-Salām, tabārakta yā Dhal-Jalāli wal-Ikrām.',
    translation: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.',
    virtue: 'Recited directly following the 3 Istighfārs after the Taslīm.',
    targetCount: 1
  },
  {
    id: 'post-tahlil',
    stepNumber: 3,
    titleEn: '3. Testimony of Sovereign Grace (La Mani‘a lima A‘tayt)',
    titleAr: 'التَّهْلِيلُ وَتَفْوِيضُ المُلْكِ لِلَّهِ',
    source: 'Sahih al-Bukhari (844) & Muslim (593)',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الجَدِّ مِنْكَ الجَدُّ.',
    transliteration: 'Lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa ‘alā kulli shay’in Qadīr. Allāhumma lā māni‘a limā a‘ṭayta, wa lā mu‘ṭiya limā mana‘ta, wa lā yanfa‘u dhal-jaddi minkal-jadd.',
    translation: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs all sovereignty and praise, and He is over all things competent. O Allah, none can withhold what You have given, none can give what You have withheld, and wealth cannot avail the wealthy against You.',
    virtue: 'The Prophet ﷺ regularly recited this after each prescribed prayer to ground the heart in divine decree.',
    targetCount: 1
  },
  {
    id: 'post-zubayr-tahlil',
    stepNumber: 4,
    titleEn: '4. Declaration of Pure Devotion (Ibn az-Zubayr Tahlīl)',
    titleAr: 'تَهْلِيلُ الإِخْلَاصِ وَالثَّنَاءِ الحَسَنِ',
    source: 'Sahih Muslim (594)',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، لَا إِلَهَ إِلَّا اللَّهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الفَضْلُ وَلَهُ الثَّنَاءُ الحَسَنُ، لَا إِلَهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الكَافِرُونَ.',
    transliteration: 'Lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa ‘alā kulli shay’in Qadīr. Lā ḥawla wa lā quwwata illā billāh. Lā ilāha illAllāh, wa lā na‘budu illā iyyāh, lahun-ni‘matu wa lahul-faḍlu wa lahuth-thanā’ul-ḥasan. Lā ilāha illAllāhu mukhliṣīna lahud-dīna wa law karihal-kāfirūn.',
    translation: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs all sovereignty and praise, and He is over all things competent. There is no might nor power except with Allah. None has the right to be worshipped except Allah, and we worship none but Him. To Him belongs all grace, virtue, and beautiful praise. None has the right to be worshipped except Allah, keeping religion sincerely for Him alone, even if the disbelievers detest it.',
    virtue: '‘Abdullah ibn az-Zubayr reported: "The Messenger of Allah ﷺ used to recite these words aloud following the Taslīm of each prayer." (Sahih Muslim 594)',
    targetCount: 1
  },
  {
    id: 'post-ayat-kursi',
    stepNumber: 5,
    titleEn: '5. Āyat al-Kursī (The Throne Verse - 2:255)',
    titleAr: 'آيَةُ الكُرْسِيِّ دُبُرَ كُلِّ صَلَاةٍ مَكْتُوبَةٍ',
    source: 'An-Nasa’i As-Sunan al-Kubra (9848) • Sahih al-Jami‘ (6464)',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khuḏhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    virtue: 'The Prophet ﷺ said: "Whoever recites Āyat al-Kursī after every obligatory prayer, nothing stands between him and entering Paradise except death."',
    targetCount: 1
  },
  {
    id: 'post-tasbih-standard',
    stepNumber: 6,
    titleEn: '6. Standard 33x Tasbīḥ (33 Tasbīḥ, 33 Ḥamd, 33 Takbīr Only)',
    titleAr: 'التَّسْبِيحُ الرَّاتِبُ (٣٣ تَسْبِيح، ٣٣ تَحْمِيد، ٣٣ تَكْبِير فَقَط)',
    source: 'Sahih Muslim (597)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣) • الحَمْدُ لِلَّهِ (٣٣) • اللَّهُ أَكْبَرُ (٣٣)',
    transliteration: 'SubḥānAllāh (33x), Alḥamdulillāh (33x), Allāhu Akbar (33x)',
    translation: 'Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (33 times) — 99 glorifications only.',
    virtue: 'Standard authentic formula: 33 Tasbīḥ, 33 Ḥamd, 33 Takbīr only. Sunnah is counting on the fingers of the right hand.',
    targetCount: 99
  },
  {
    id: 'post-tasbih-mini',
    stepNumber: 7,
    titleEn: '7. Mini 10x Tasbīḥ (10 Tasbīḥ, 10 Ḥamd, 10 Takbīr Only)',
    titleAr: 'التَّسْبِيحُ المُوجَزُ (١٠ تَسْبِيح، ١٠ تَحْمِيد، ١٠ تَكْبِير فَقَط)',
    source: 'Sunan Abi Dawud (1502) & at-Tirmidhi (3410)',
    arabic: 'سُبْحَانَ اللَّهِ (١٠) • الحَمْدُ لِلَّهِ (١٠) • اللَّهُ أَكْبَرُ (١٠)',
    transliteration: 'SubḥānAllāh (10x), Alḥamdulillāh (10x), Allāhu Akbar (10x)',
    translation: 'Glory be to Allah (10 times), Praise be to Allah (10 times), Allah is the Greatest (10 times) — 30 glorifications only.',
    virtue: 'Prophetic formula: 10 Tasbīḥ, 10 Ḥamd, 10 Takbīr only (150 on the tongue, 1500 on the Scale of good deeds).',
    targetCount: 30
  },
  {
    id: 'post-fajr-maghrib-10x',
    stepNumber: 8,
    titleEn: '8. Special 10x Dhikr (Recited Specifically After Fajr & Maghrib)',
    titleAr: 'ذِكْرُ التَّهْلِيلِ المَخْصُوصُ عَقِبَ الفَجْرِ وَالمَغْرِبِ (١٠ مَرَّاتٍ)',
    source: 'Jami‘ at-Tirmidhi (3474) & Sahih at-Targhib (472)',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
    transliteration: 'Lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu, yuḥyī wa yumītu, wa Huwa ‘alā kulli shay’in Qadīr (10 times).',
    translation: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs all dominion and praise, He gives life and causes death, and He is over all things competent (10 times before shifting posture or speaking).',
    virtue: 'Recited 10 times before folding legs or speaking after Fajr & Maghrib: Allah writes 10 good deeds, erases 10 bad deeds, elevates 10 ranks, and protects from Satan until evening/morning.',
    targetCount: 10,
    fajrMaghribOnly: true
  },
  {
    id: 'post-muawwidhat',
    stepNumber: 9,
    titleEn: '9. Al-Mu‘awwidhat (Surahs Al-Ikhlāṣ, Al-Falaq, An-Nās)',
    titleAr: 'المُعَوِّذَاتُ الثَّلَاثُ (الإِخْلَاص وَالفَلَق وَالنَّاس)',
    source: 'Sunan Abi Dawud (1523) & Jami‘ at-Tirmidhi (2903)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Recite Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas (1x after Dhuhr, Asr, Isha; 3x each after Fajr and Maghrib).',
    translation: 'Say: He is Allah, [who is] One... Say: I seek refuge in the Lord of daybreak... Say: I seek refuge in the Lord of mankind...',
    virtue: 'The Prophet ﷺ ordered Uqbah ibn ‘Amir: "Recite the Mu‘awwidhat after every single prayer."',
    targetCount: 1,
    repeatForFajrMaghrib: 3
  },
  {
    id: 'post-muadh-dua',
    stepNumber: 10,
    titleEn: '10. Beloved Supplication of Mu‘ādh ibn Jabal',
    titleAr: 'وَصِيَّةُ النَّبِيِّ ﷺ لِمُعَاذٍ عَقِبَ كُلِّ صَلَاةٍ',
    source: 'Sunan Abi Dawud (1522) & An-Nasa’i (1303)',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.',
    transliteration: 'Allāhumma a‘innī ‘alā ḏhikrika, wa shukrika, wa ḥusni ‘ibādatik.',
    translation: 'O Allah, assist me in remembering You, expressing gratitude to You, and worshipping You with excellence (Iḥsān).',
    virtue: 'The Prophet ﷺ took Mu‘adh by the hand and said: "O Mu‘adh, by Allah I love you! I advise you never to omit this supplication after every prayer."',
    targetCount: 1
  }
];

export const PostSalahAdhkarModal: React.FC<PostSalahAdhkarModalProps> = ({
  isOpen,
  onClose,
  initialPrayer = 'fajr',
  systemDate
}) => {
  const { getSpiritualLog, updateDhikrLog } = usePOS();
  const [activePrayer, setActivePrayer] = useState<PrayerId>(initialPrayer);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Interactive mini bead counters for the active session
  const [istighfarCount, setIstighfarCount] = useState(0);
  const [subhanallahCount, setSubhanallahCount] = useState(0);
  const [alhamdulillahCount, setAlhamdulillahCount] = useState(0);
  const [allahuakbarCount, setAllahuakbarCount] = useState(0);

  useEffect(() => {
    if (isOpen && initialPrayer) {
      setActivePrayer(initialPrayer);
    }
  }, [isOpen, initialPrayer]);

  const currentLog = getSpiritualLog(systemDate);
  const postMap = currentLog.dhikr?.postSalahAdhkar || {};
  const istighfarMap = currentLog.dhikr?.postSalahIstighfar || {};
  const currentPrayerMode: PostSalahDhikrMode = postMap[activePrayer] || 'none';
  const isIstighfarDone = !!istighfarMap[activePrayer];

  // Sync beads when active prayer, prayer mode, or istighfar status changes
  useEffect(() => {
    // 3 Istighfars tracked separately
    setIstighfarCount(isIstighfarDone ? 3 : 0);

    // Standard 33x: 33 tasbih, 33 hamd, 33 takbir ONLY
    // Mini 10x: 10 tasbih, 10 hamd, 10 takbir ONLY
    if (currentPrayerMode === 'standard33') {
      setSubhanallahCount(33);
      setAlhamdulillahCount(33);
      setAllahuakbarCount(33);
    } else if (currentPrayerMode === 'mini10') {
      setSubhanallahCount(10);
      setAlhamdulillahCount(10);
      setAllahuakbarCount(10);
    } else {
      setSubhanallahCount(0);
      setAlhamdulillahCount(0);
      setAllahuakbarCount(0);
    }
  }, [activePrayer, currentPrayerMode, isIstighfarDone]);

  if (!isOpen) return null;

  const isFajrOrMaghrib = activePrayer === 'fajr' || activePrayer === 'maghrib';

  const prayerMeta: Record<PrayerId, { nameEn: string; nameAr: string; time: string; accent: string }> = {
    fajr: { nameEn: 'Fajr', nameAr: 'الفَجْر', time: 'Dawn', accent: 'text-indigo-300' },
    dhuhr: { nameEn: 'Dhuhr', nameAr: 'الظُّهْر', time: 'Noon', accent: 'text-amber-300' },
    asr: { nameEn: '‘Asr', nameAr: 'العَصْر', time: 'Afternoon', accent: 'text-orange-300' },
    maghrib: { nameEn: 'Maghrib', nameAr: 'المَغْرِب', time: 'Sunset', accent: 'text-rose-300' },
    isha: { nameEn: '‘Ishā’', nameAr: 'العِشَاء', time: 'Night', accent: 'text-purple-300' }
  };

  const handleToggleIstighfar = () => {
    const nextDone = !isIstighfarDone;
    setIstighfarCount(nextDone ? 3 : 0);
    updateDhikrLog({
      postSalahIstighfar: {
        ...istighfarMap,
        [activePrayer]: nextDone
      }
    }, systemDate);
  };

  const handleSetMode = (mode: PostSalahDhikrMode) => {
    // 33x and 10x only set tasbih, hamd, takbir - istighfar is separate
    if (mode === 'standard33') {
      setSubhanallahCount(33);
      setAlhamdulillahCount(33);
      setAllahuakbarCount(33);
    } else if (mode === 'mini10') {
      setSubhanallahCount(10);
      setAlhamdulillahCount(10);
      setAllahuakbarCount(10);
    } else {
      setSubhanallahCount(0);
      setAlhamdulillahCount(0);
      setAllahuakbarCount(0);
    }

    updateDhikrLog({
      postSalahAdhkar: {
        ...postMap,
        [activePrayer]: mode
      }
    }, systemDate);
  };

  const incrementBead = (type: 'istighfar' | 'subhanallah' | 'alhamdulillah' | 'allahuakbar') => {
    let nextSub = subhanallahCount;
    let nextHamd = alhamdulillahCount;
    let nextTakbir = allahuakbarCount;

    if (type === 'istighfar') {
      const nextIstighfar = Math.min(3, istighfarCount + 1);
      setIstighfarCount(nextIstighfar);
      if (nextIstighfar === 3 && !isIstighfarDone) {
        updateDhikrLog({
          postSalahIstighfar: {
            ...istighfarMap,
            [activePrayer]: true
          }
        }, systemDate);
      }
      return;
    } else if (type === 'subhanallah') {
      nextSub = Math.min(33, subhanallahCount + 1);
      setSubhanallahCount(nextSub);
      updateDhikrLog({ tasbeehCount: (currentLog.dhikr?.tasbeehCount || 0) + 1 }, systemDate);
    } else if (type === 'alhamdulillah') {
      nextHamd = Math.min(33, alhamdulillahCount + 1);
      setAlhamdulillahCount(nextHamd);
      updateDhikrLog({ hamdCount: (currentLog.dhikr?.hamdCount || 0) + 1 }, systemDate);
    } else if (type === 'allahuakbar') {
      nextTakbir = Math.min(33, allahuakbarCount + 1);
      setAllahuakbarCount(nextTakbir);
      updateDhikrLog({ takbirCount: (currentLog.dhikr?.takbirCount || 0) + 1 }, systemDate);
    }

    // Auto-advance mode to standard33 if completed 33x tasbih, 33x hamd, 33x takbir ONLY
    if (nextSub === 33 && nextHamd === 33 && nextTakbir === 33 && currentPrayerMode !== 'standard33') {
      updateDhikrLog({
        postSalahAdhkar: {
          ...postMap,
          [activePrayer]: 'standard33'
        }
      }, systemDate);
    } else if (nextSub === 10 && nextHamd === 10 && nextTakbir === 10 && currentPrayerMode === 'none') {
      updateDhikrLog({
        postSalahAdhkar: {
          ...postMap,
          [activePrayer]: 'mini10'
        }
      }, systemDate);
    }
  };

  const handleCopy = (item: DhikrItem) => {
    const text = `${item.arabic}\n\n${item.transliteration}\n\n${item.translation}\n(${item.titleEn} - ${item.source})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetBeads = () => {
    setIstighfarCount(0);
    setSubhanallahCount(0);
    setAlhamdulillahCount(0);
    setAllahuakbarCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-4xl bg-[#090b11] border border-[var(--border-accent,#c5a059)] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
      >
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" />

        {/* 1. MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-zinc-950 via-[#0e121b] to-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3 w-3 text-emerald-400" />
                <span>SACRED PROTOCOL • POST-SALAH FORTRESS</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {systemDate}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
              <span>أَذْكَارُ مَا بَعْدَ الصَّلَاةِ المَكْتُوبَة</span>
              <span className="text-xs font-mono text-emerald-400 font-normal hidden sm:inline">
                • Post-Obligatory Prayer Remembrance
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Authentic Sunnah litanies recited immediately following the Taslīm of the 5 Farā&apos;iḍ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. PRAYER SELECTOR TABS STRIP */}
        <div className="px-4 py-3 bg-[#07080c] border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(p => {
              const meta = prayerMeta[p];
              const mode = postMap[p];
              const hasIstighfar = istighfarMap[p];
              const isSelected = activePrayer === p;

              return (
                <button
                  key={p}
                  onClick={() => setActivePrayer(p)}
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{meta.nameEn}</span>
                  <span className="text-[10px] opacity-70">({meta.nameAr})</span>
                  {hasIstighfar && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" title="3x Istighfār Recited" />
                  )}
                  {mode === 'standard33' && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Standard 33x Sealed (Tasbīḥ, Ḥamd, Takbīr Only)" />
                  )}
                  {mode === 'mini10' && (
                    <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" title="Mini 10x Sealed (Tasbīḥ, Ḥamd, Takbīr Only)" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Prayer Status & 1-Click Seal Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 3x Istighfar Button (Separate Sunnah) */}
            <button
              onClick={handleToggleIstighfar}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isIstighfarDone
                  ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                  : 'bg-amber-950/20 hover:bg-amber-900/40 border-amber-500/30 text-amber-300'
              }`}
              title="3x Istighfar recited immediately after the Taslīm (separate from 33/10 tasbih formula)"
            >
              <Check className={`h-3.5 w-3.5 ${isIstighfarDone ? 'text-amber-400' : 'text-amber-400/50'}`} />
              <span>3x Istighfār (+5)</span>
            </button>

            {/* Standard 33x (33 Tasbih, 33 Hamd, 33 Takbir ONLY) */}
            <button
              onClick={() => handleSetMode(currentPrayerMode === 'standard33' ? 'none' : 'standard33')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPrayerMode === 'standard33'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-300'
              }`}
              title="Standard 33x: 33 Tasbih, 33 Hamd, 33 Takbir ONLY"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Standard 33x (+20)</span>
            </button>

            {/* Mini 10x (10 Tasbih, 10 Hamd, 10 Takbir ONLY) */}
            <button
              onClick={() => handleSetMode(currentPrayerMode === 'mini10' ? 'none' : 'mini10')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPrayerMode === 'mini10'
                  ? 'bg-teal-600 border-teal-400 text-white shadow-md'
                  : 'bg-teal-950/40 hover:bg-teal-900/50 border-teal-500/30 text-teal-300'
              }`}
              title="Mini 10x: 10 Tasbih, 10 Hamd, 10 Takbir ONLY"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mini 10x (+12)</span>
            </button>

            {(currentPrayerMode !== 'none' || isIstighfarDone) && (
              <button
                onClick={() => {
                  handleSetMode('none');
                  if (isIstighfarDone) handleToggleIstighfar();
                }}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                title="Reset this prayer post-adhkar"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. SCROLLABLE AUTHENTIC ADHKAR BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          
          {/* POST-SALAH TO ADHKAR FORTRESS SYNC BADGE */}
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Connected to Sacred Protocol:</strong> Standard 33x logs 33 SubḥānAllāh, 33 Ḥamd, 33 Takbīr <strong>only</strong> (99 total). Mini 10x logs 10 SubḥānAllāh, 10 Ḥamd, 10 Takbīr <strong>only</strong> (30 total). 3x Istighfār is logged separately.
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 shrink-0 font-bold">
              LIVE SYNC
            </span>
          </div>

          {/* SPECIAL ADVICE BANNER FOR FAJR & MAGHRIB */}
          {isFajrOrMaghrib && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-mono font-bold text-amber-300 uppercase tracking-wide block">
                  Prophetic Specialty for {prayerMeta[activePrayer].nameEn} ({prayerMeta[activePrayer].nameAr})
                </span>
                <p className="text-zinc-300">
                  Remain in your sitting posture before moving or speaking: recite the <strong>10x Tahlīl</strong> (&ldquo;Lā ilāha illAllāh... yuḥyī wa yumīt&rdquo;) and repeat the <strong>Three Mu‘awwiḏhāt 3 times</strong> each for fortified divine shielding.
                </p>
              </div>
            </div>
          )}

          {/* INTERACTIVE DIGITAL TASBIH COMPACT COUNTER */}
          <div className="p-4 bg-gradient-to-br from-[#0e141a] via-[#090d12] to-[#06080b] border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  DIGITAL POST-SALAH TASBĪḤ COUNTER (المِسْبَحَةُ الإِلِكْتُرُونِيَّة)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleIstighfar}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition font-bold cursor-pointer ${
                    isIstighfarDone
                      ? 'border-amber-500/80 bg-amber-950 text-amber-200 shadow-sm'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-amber-300'
                  }`}
                >
                  {isIstighfarDone ? '3x Istighfār Sealed ✓' : 'Mark 3x Istighfār (+5 XP)'}
                </button>
                <button
                  onClick={resetBeads}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Beads</span>
                </button>
              </div>
            </div>

            {/* BEADS GRID: 3x Istighfar + 33/10 SubhanAllah, Alhamdulillah, Allahu Akbar ONLY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 3x ISTIGHFAR */}
              <button
                onClick={() => incrementBead('istighfar')}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between cursor-pointer active:scale-95 ${
                  istighfarCount >= 3
                    ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 shadow-sm'
                    : 'bg-black/40 border-white/10 hover:border-amber-500/40 text-zinc-200'
                }`}
              >
                <span className="text-xs font-display font-bold">أَسْتَغْفِرُ الله</span>
                <span className="text-[10px] font-mono text-zinc-400">3x Istighfār</span>
                <div className="mt-2 text-base font-mono font-extrabold text-amber-400">
                  {istighfarCount} <span className="text-[10px] text-zinc-500">/ 3</span>
                </div>
              </button>

              {/* SUBHANALLAH */}
              <button
                onClick={() => incrementBead('subhanallah')}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between cursor-pointer active:scale-95 ${
                  subhanallahCount >= (currentPrayerMode === 'mini10' ? 10 : 33)
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-black/40 border-white/10 hover:border-emerald-500/40 text-zinc-200'
                }`}
              >
                <span className="text-xs font-display font-bold">سُبْحَانَ الله</span>
                <span className="text-[10px] font-mono text-zinc-400">SubḥānAllāh</span>
                <div className="mt-2 text-base font-mono font-extrabold text-emerald-400">
                  {subhanallahCount} <span className="text-[10px] text-zinc-500">/ {currentPrayerMode === 'mini10' ? 10 : 33}</span>
                </div>
              </button>

              {/* ALHAMDULILLAH */}
              <button
                onClick={() => incrementBead('alhamdulillah')}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between cursor-pointer active:scale-95 ${
                  alhamdulillahCount >= (currentPrayerMode === 'mini10' ? 10 : 33)
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-black/40 border-white/10 hover:border-emerald-500/40 text-zinc-200'
                }`}
              >
                <span className="text-xs font-display font-bold">الحَمْدُ لله</span>
                <span className="text-[10px] font-mono text-zinc-400">Alḥamdulillāh</span>
                <div className="mt-2 text-base font-mono font-extrabold text-emerald-400">
                  {alhamdulillahCount} <span className="text-[10px] text-zinc-500">/ {currentPrayerMode === 'mini10' ? 10 : 33}</span>
                </div>
              </button>

              {/* ALLAHU AKBAR */}
              <button
                onClick={() => incrementBead('allahuakbar')}
                className={`p-3 rounded-xl border text-center transition flex flex-col justify-between cursor-pointer active:scale-95 ${
                  allahuakbarCount >= (currentPrayerMode === 'mini10' ? 10 : 33)
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-black/40 border-white/10 hover:border-emerald-500/40 text-zinc-200'
                }`}
              >
                <span className="text-xs font-display font-bold">اللهُ أَكْبَر</span>
                <span className="text-[10px] font-mono text-zinc-400">Allāhu Akbar</span>
                <div className="mt-2 text-base font-mono font-extrabold text-emerald-400">
                  {allahuakbarCount} <span className="text-[10px] text-zinc-500">/ {currentPrayerMode === 'mini10' ? 10 : 33}</span>
                </div>
              </button>
            </div>
          </div>

          {/* ADHKAR CARDS LIST */}
          <div className="space-y-4">
            {POST_SALAH_ADHKAR_ITEMS.map((item) => {
              if (item.fajrMaghribOnly && !isFajrOrMaghrib) {
                return null;
              }

              const targetDisplay = (item.repeatForFajrMaghrib && isFajrOrMaghrib)
                ? `${item.repeatForFajrMaghrib}x times (Fajr & Maghrib)`
                : `${item.targetCount}x recitation`;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#07090e] hover:border-white/20 transition space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {item.titleEn}
                        </span>
                        <span className="text-xs font-display text-zinc-400">
                          ({item.titleAr})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.source} • Target: {targetDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.id === 'post-istighfar' && (
                        <button
                          onClick={handleToggleIstighfar}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                            isIstighfarDone
                              ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-sm'
                              : 'bg-amber-950/20 hover:bg-amber-900/40 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          <Check className={`h-3 w-3 ${isIstighfarDone ? 'text-amber-400' : 'text-amber-400/50'}`} />
                          <span>{isIstighfarDone ? 'Recited (3x) ✓' : 'Complete 3x'}</span>
                        </button>
                      )}

                      {item.id === 'post-tasbih-standard' && (
                        <button
                          onClick={() => handleSetMode(currentPrayerMode === 'standard33' ? 'none' : 'standard33')}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                            currentPrayerMode === 'standard33'
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>{currentPrayerMode === 'standard33' ? 'Sealed (33x) ✓' : 'Seal Standard 33x'}</span>
                        </button>
                      )}

                      {item.id === 'post-tasbih-mini' && (
                        <button
                          onClick={() => handleSetMode(currentPrayerMode === 'mini10' ? 'none' : 'mini10')}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                            currentPrayerMode === 'mini10'
                              ? 'bg-teal-600 border-teal-400 text-white shadow-sm'
                              : 'bg-teal-950/40 hover:bg-teal-900/50 border-teal-500/30 text-teal-300'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>{currentPrayerMode === 'mini10' ? 'Sealed (10x) ✓' : 'Seal Mini 10x'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(item)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
                        title="Copy Arabic & Meaning"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="text-[10px] font-mono">{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* ARABIC CALLIGRAPHY */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 text-right" dir="rtl">
                    <p className="font-display font-bold text-lg sm:text-xl text-amber-200 leading-relaxed tracking-wide">
                      {item.arabic}
                    </p>
                  </div>

                  {/* TRANSLITERATION & TRANSLATION */}
                  <div className="space-y-1 text-xs">
                    <p className="font-mono text-zinc-400 italic">
                      {item.transliteration}
                    </p>
                    <p className="text-zinc-200">
                      {item.translation}
                    </p>
                  </div>

                  {/* PROPHETIC VIRTUE */}
                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[11px] font-sans text-emerald-300/90 flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Prophetic Virtue:</strong> {item.virtue}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* 4. MODAL FOOTER */}
        <div className="p-4 border-t border-white/10 bg-[#07080c] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Current Status for {prayerMeta[activePrayer].nameEn}:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              currentPrayerMode === 'standard33' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : currentPrayerMode === 'mini10'
                ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {currentPrayerMode === 'standard33' ? 'Standard 33x Sealed ✓' : currentPrayerMode === 'mini10' ? 'Mini 10x Sealed ✓' : 'Pending / Not Logged'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition"
            >
              Done / Return to Hub
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
