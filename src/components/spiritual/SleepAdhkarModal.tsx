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
    id: 'dhohr-bismika',
    titleEn: '1. The Foundational Sleep Intention (باسمك اللهم أموت وأحيا)',
    titleAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'Sahih al-Bukhari (6312, 6324)',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
    transliteration: 'Bismikallāhumma amūtu wa aḥyā.',
    translation: 'In Your Name, O Allah, I die and I live.',
    virtue: 'Recited by the Prophet ﷺ whenever retiring to his bed for rest during the day or night to anchor the soul in Allah.',
    targetCount: 1
  },
  {
    id: 'dhohr-rabbi-wada\'tu',
    titleEn: '2. Divine Entrustment on Right Side (باسمك ربي وضعت جنبي)',
    titleAr: 'تَفْوِيضُ الأَمْرِ وَالدُّعَاءُ عِنْدَ وَضْعِ الجَنْبِ',
    source: 'Sahih al-Bukhari (6320) & Sahih Muslim (2714)',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
    transliteration: 'Bismika Rabbī waḍa‘tu janbī wa bika arfa‘uh, in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī ‘ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your Name, my Lord, I lay my side down and in Your Name I raise it up. If You hold back my soul, have mercy upon it, and if You release it, protect it as You protect Your righteous servants.',
    virtue: 'The Prophet ﷺ instructed the believer to dust the resting place and recite this while resting on the right side.',
    targetCount: 1
  },
  {
    id: 'dhohr-ayat-kursi',
    titleEn: '3. Āyat al-Kursī Midday Fortress (آية الكرسي)',
    titleAr: 'آيَةُ الكُرْسِيِّ لِلْحِفْظِ مِنَ الشَّيَاطِينِ',
    source: 'Sahih al-Bukhari (2311)',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khuḏhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...',
    virtue: 'A guardian protector from Allah remains over you and no devil can approach you until you wake.',
    targetCount: 1
  },
  {
    id: 'dhohr-waking-hamd',
    titleEn: '4. Prophetic Awakening from Qaylūlah (الحمد لله الذي أحيانا)',
    titleAr: 'دُعَاءُ الاسْتِيقَاظِ مِنَ القَيْلُولَةِ',
    source: 'Sahih al-Bukhari (6312)',
    arabic: 'الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.',
    transliteration: 'Al-ḥamdu lillāhilladhī aḥyānā ba‘da mā amātanā wa ilayhin-nushūr.',
    translation: 'All praise is due to Allah who gave us life after causing us to die, and unto Him is the resurrection.',
    virtue: 'Recited by the Prophet ﷺ immediately upon waking from midday rest or sleep, expressing gratitude for revitalized life.',
    targetCount: 1
  }
];

export const NIGHT_SLEEP_ADHKAR: DhikrItem[] = [
  {
    id: 'night-quls-cupped',
    titleEn: '1. Three Quls with Cupped Hands & Nafth (المعوذات مع النفث والمسح)',
    titleAr: 'قِرَاءَةُ المُعَوِّذَاتِ الثَّلَاثِ وَالنَّفْثُ فِي الكَفَّيْنِ وَالمَسْحُ ثَلَاثًا',
    source: 'Sahih al-Bukhari (5017)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ (يَنْفُثُ فِي كَفَّيْهِ وَيَمْسَحُ جَسَدَهُ ٣ مَرَّاتٍ).',
    transliteration: 'Recite Surah Al-Ikhlāṣ, Al-Falaq, and An-Nās into cupped hands, lightly puff/blow (nafth), then wipe over the head, face, and front of body. Repeat 3 times.',
    translation: 'Say: He is Allah, [who is] One... Say: I seek refuge in the Lord of daybreak... Say: I seek refuge in the Lord of mankind...',
    virtue: 'Aisha (RA) narrated that every single night when the Prophet ﷺ went to bed, he joined his hands, puffed into them, recited the three Surahs, and wiped as much of his body as he could, starting with head and face, doing this thrice.',
    targetCount: 3
  },
  {
    id: 'night-ayat-kursi',
    titleEn: '2. Āyat al-Kursī (The Night Shield - 2:255)',
    titleAr: 'آيَةُ الكُرْسِيِّ حَارِسُ اللَّيْل',
    source: 'Sahih al-Bukhari (2311) • Hadith of Abu Hurayrah (RA)',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khuḏhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...',
    virtue: 'The Prophet ﷺ confirmed: "When you go to bed, recite Ayat al-Kursi, for then there will remain over you a guardian from Allah, and no devil will come near you until morning."',
    targetCount: 1
  },
  {
    id: 'night-baqarah-last2',
    titleEn: '3. Last Two Verses of Surah Al-Baqarah (خواتيم سورة البقرة 285-286)',
    titleAr: 'خَوَاتِيمُ سُورَةِ البَقَرَةِ (آمَنَ الرَّسُولُ)',
    source: 'Sahih al-Bukhari (5009) & Sahih Muslim (808)',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Āmanar-Rasūlu bimā unzila ilayhi mir-Rabbihī wal-mu’minūn... Lā yukallifullāhu nafsan illā wus‘ahā...',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers... Allah does not charge a soul except [with that within] its capacity...',
    virtue: 'The Prophet ﷺ said: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him (against every evil, affliction, and shayṭān)."',
    targetCount: 1
  },
  {
    id: 'night-fatimah-tasbih',
    titleEn: '4. The Bedtime Gift to Fatimah: 33-33-34 Tasbīḥ (تسبيح فاطمة الزهراء)',
    titleAr: 'تَسْبِيحُ فَاطِمَةَ: ٣٣ سُبْحَانَ الله - ٣٣ الحَمْدُ لله - ٣٤ اللهُ أَكْبَر',
    source: 'Sahih al-Bukhari (3705) & Sahih Muslim (2727)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣ مَرَّةً) • الحَمْدُ لِلَّهِ (٣٣ مَرَّةً) • اللَّهُ أَكْبَرُ (٣٤ مَرَّةً).',
    transliteration: 'SubḥānAllāh (33x), Alḥamdulillāh (33x), Allāhu Akbar (34x) — total 100.',
    translation: 'Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (34 times).',
    virtue: 'When Ali and Fatimah (RA) asked the Prophet ﷺ for a servant, he said: "Shall I not guide you to that which is better for you than a servant? When you take to your bed, say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times. That is better for you than a servant."',
    targetCount: 100
  },
  {
    id: 'night-bismika-wada\'tu',
    titleEn: '5. Laying Down on Right Side Supplication (باسمك ربي وضعت جنبي)',
    titleAr: 'دُعَاءُ وَضْعِ الجَنْبِ عَلَى الشِّقِّ الأَيْمَنِ',
    source: 'Sahih al-Bukhari (6320) & Sahih Muslim (2714)',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
    transliteration: 'Bismika Rabbī waḍa‘tu janbī wa bika arfa‘uh, in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī ‘ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your Name, my Lord, I lay my side down and in Your Name I raise it up. If You hold back my soul, have mercy upon it, and if You release it, protect it as You protect Your righteous servants.',
    virtue: 'The Prophet ﷺ commanded: "When one of you goes to his bed, let him dust it with the inside of his garment, lie on his right side and recite this supplication."',
    targetCount: 1
  },
  {
    id: 'night-qini-adhabak',
    titleEn: '6. Protection from Recompense: 3x (اللهم قني عذابك)',
    titleAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ (٣ مَرَّاتٍ)',
    source: 'Sunan Abi Dawud (5045) & Jami‘ at-Tirmidhi (3398) • Sahih',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
    transliteration: 'Allāhumma qinī ‘adhābaka yawma tab‘athu ‘ibādak (3 times).',
    translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
    virtue: 'Whenever the Prophet ﷺ intended to sleep, he placed his right hand under his cheek and recited this supplication three times.',
    targetCount: 3
  },
  {
    id: 'night-concluding-fitrah',
    titleEn: '7. The Crowning Supplication of Fitrah (اللهم أسلمت نفسي إليك)',
    titleAr: 'وَصِيَّةُ خِتَامِ اللَّيْلِ وَالمَوْتِ عَلَى الفِطْرَةِ',
    source: 'Sahih al-Bukhari (6311) & Sahih Muslim (2710)',
    arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.',
    transliteration: 'Allāhumma aslamtu nafsī ilayka, wa fawwaḍtu amrī ilayka, wa wajjahtu wajhī ilayka, wa alja’tu ẓahrī ilayka, raghbatan wa rahbatan ilayk, lā malja’a wa lā manjā minka illā ilayk. Āmantu bikitābikalladhī anzalta, wa bi-nabiyyikalladhī arsalt.',
    translation: 'O Allah, I surrender my soul to You, I entrust my affair to You, I turn my face to You, and I commit my back to You out of hope and fear of You. There is no refuge and no escape from You except to You. I believe in Your Book which You have revealed and in Your Prophet whom You have sent.',
    virtue: 'The Prophet ﷺ said to al-Bara\' ibn \'Azib: "Make these your very last words before sleeping. For if you die that night, you die upon the pure natural religion (Fitrah)."',
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
  const progressPercent = currentList.length > 0 ? Math.round((completedCount / currentList.length) * 100) : 0;

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
            {currentList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-white/5 bg-black/30 space-y-2.5">
                <Moon className="h-8 w-8 mx-auto text-zinc-600 mb-1" />
                <p className="text-sm font-bold text-zinc-300 font-display">
                  {activeTab === 'dhohr' ? 'NO NOON SLEEP ADHKĀR REGISTERED' : 'NO NIGHT SLEEP ADHKĀR REGISTERED'}
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto font-sans leading-relaxed">
                  The {activeTab === 'dhohr' ? 'Noon Qaylūlah' : 'Night Bedtime'} Adhkār section is currently empty. The section layout and prophetic etiquettes are preserved.
                </p>
              </div>
            ) : (
              currentList.map((item, idx) => {
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
            }))}
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
