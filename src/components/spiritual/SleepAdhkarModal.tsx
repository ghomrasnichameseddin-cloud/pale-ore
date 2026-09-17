import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Check, 
  X, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Shield, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { ArabesqueCorner } from '../IslamicRpgDecorations';

interface SleepAdhkarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'dhohr' | 'night';
  systemDate: string;
}

export interface DhikrItem {
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

// ==========================================
// ☀️ 1. DAYTIME NAP & QAYLŪLAH (أذكار القيلولة والنوم نهاراً)
// الفقه النبوي: لا يوجد ورد صحيح خاص بالقيلولة نفسها،
// لكن إذا كانت نوماً فعلياً فيُطبّق عليها أذكار النوم الأساسية؛
// لأن أحاديث أذكار النوم غير مقيدة بالليل فقط.
// ==========================================
export const DHOHR_SLEEP_ADHKAR: DhikrItem[] = [
  {
    id: 'dhohr-ayat-kursi',
    titleEn: '1. Ayat al-Kursi (Midday Nap Fortress)',
    titleAr: '① آية الكرسي — مرة واحدة قبل القيلولة',
    source: 'Surah Al-Baqarah (2:255) • Sahih al-Bukhari (2311)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    virtue: 'حفظ وحراسة من الشياطين ووقاية ربانية حتى يستيقظ العبد من نومه.',
    targetCount: 1
  },
  {
    id: 'dhohr-muawwidhat',
    titleEn: '2. The Three Surahs (Al-Ikhlas, Al-Falaq, An-Nas - 1x with Nafth)',
    titleAr: '② الإخلاص والفلق والناس — مرة واحدة لكل سورة (مع النفث ومسح الجسد)',
    source: 'Surahs 112, 113, 114 • Sahih al-Bukhari (5017)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾',
    transliteration: 'Recite each of the three protective Surahs once, puff lightly (nafth) into cupped palms, and wipe over head, face, and front of body.',
    translation: 'Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas once each, then blow lightly into your hands and wipe over your head, face, and body.',
    virtue: 'قراءة المعوذات والنفث في الكفين ومسح الجسد وقاية ربانية ثابتة من السنة النبوية قبل كل نوم.',
    targetCount: 1
  },
  {
    id: 'dhohr-sunnah-side',
    titleEn: '3. Sunnah Etiquette: Sleep on Right Side (النوم على الشق الأيمن)',
    titleAr: '③ أدب السنة النبوية: النوم على الشق الأيمن إن تيسر',
    source: 'Sahih al-Bukhari (6311) & Sahih Muslim (2710)',
    arabic: '«إِذَا أَوَيْتَ إِلَى فِرَاشِكَ فَاضْطَجِعْ عَلَى شِقِّكَ الأَيْمَنِ...»',
    transliteration: 'Lay comfortably upon your right side, resting the right cheek gently upon the right hand if convenient.',
    translation: 'When retiring for sleep or nap, lie upon your right side in adherence to the beloved guidance of the Prophet ﷺ.',
    virtue: 'إرشاد نبوي كريم لإراحة الجسد وسلامة القلب ويقظة الروح عند الاستيقاظ.',
    targetCount: 1
  },
  {
    id: 'dhohr-bismika',
    titleEn: '4. Midday Invocation: Bismika Allahumma amutu wa ahya',
    titleAr: '④ بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'Sahih al-Bukhari (6312, 6324)',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
    transliteration: 'Bismikallāhumma amūtu wa aḥyā.',
    translation: 'In Your Name, O Allah, I die and I live.',
    virtue: 'تفويض الروح وإخلاص الاستيقاظ والموت لله تعالى، واستحضار التوحيد عند كل اضطجاع.',
    targetCount: 1
  }
];

// ==========================================
// 🌙 2. NIGHT SLEEP ADHKAR (أذكار النوم ليلًا — الروتين اليومي الأساسي)
// الترتيب العملي الصحيح المنقول بالسنة بعد العشاء / قبل النوم
// ==========================================
export const NIGHT_SLEEP_ADHKAR: DhikrItem[] = [
  {
    id: 'night-ayat-kursi',
    titleEn: '1. Ayat al-Kursi (The Sovereign Night Guardian - 2:255)',
    titleAr: '① آية الكرسي — مرة واحدة كاملة',
    source: 'Surah Al-Baqarah (2:255) • Sahih al-Bukhari (2311)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    virtue: 'قال النبي ﷺ: «إذا أويتَ إلى فراشكَ فاقرأ آيةَ الكرسي، فإنه لا يزالُ عليك من الله حافظٌ، ولا يقربُك شيطانٌ حتى تصبح».',
    targetCount: 1
  },
  {
    id: 'night-baqarah-last2',
    titleEn: '2. Last Two Verses of Surah Al-Baqarah (285-286)',
    titleAr: '② آخر آيتين من سورة البقرة ﴿آمَنَ الرَّسُولُ...﴾ — مرة واحدة',
    source: 'Surah Al-Baqarah (2:285-286) • Sahih al-Bukhari (5009) & Muslim (808)',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ.',
    transliteration: 'Āmanar-Rasūlu bimā unzila ilayhi mir-Rabbihī wal-mu’minūn... Lā yukallifullāhu nafsan illā wus‘ahā...',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers... Allah does not charge a soul except [with that within] its capacity...',
    virtue: 'قال النبي ﷺ: «من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه» (أي كفتاه من كل سوء ومكروه، وقيل كفتاه من قيام الليل).',
    targetCount: 1
  },
  {
    id: 'night-quls-cupped',
    titleEn: '3. Three Quls with Cupped Hands & Nafth (3 times)',
    titleAr: '③ الإخلاص والفلق والناس — 3 مرات (مع النفث والمسح)',
    source: 'Surahs 112, 113, 114 • Sahih al-Bukhari (5017)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾',
    transliteration: 'Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas into cupped palms, lightly puff (nafth), then wipe over the head, face, and body. Repeat 3 times.',
    translation: 'Recite the three protective Surahs into cupped hands, blow lightly, and wipe over your head, face, and front of body. Repeat this process three times.',
    virtue: 'كان النبي ﷺ إذا أوى إلى فراشه كل ليلة جمع كفيه ثم نفث فيهما فقرأ فيهما المعوذات، ثم يمسح بهما ما استطاع من جسده يبدأ برأسه ووجهه وما أقبل من جسده، يفعل ذلك ثلاث مرات.',
    targetCount: 3
  },
  {
    id: 'night-fatimah-tasbih',
    titleEn: '4. Bedtime Tasbih: 33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar',
    titleAr: '④ التسبيح قبل النوم: سبحان الله (33) • الحمد لله (33) • الله أكبر (34) = 100',
    source: 'Sahih al-Bukhari (3705) & Sahih Muslim (2727)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣ مَرَّةً) • الحَمْدُ لِلَّهِ (٣٣ مَرَّةً) • اللَّهُ أَكْبَرُ (٣٤ مَرَّةً).',
    transliteration: 'SubḥānAllāh (33x), Alḥamdulillāh (33x), Allāhu Akbar (34x) — Total: 100',
    translation: 'Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (34 times) — Total: 100.',
    virtue: 'علّم النبي ﷺ علياً وفاطمة رضي الله عنهما: «ألا أدلكما على ما هو خير لكما من خادم؟ إذا أويتما إلى فراشكما فسبحا ثلاثاً وثلاثين، واحمدا ثلاثاً وثلاثين، وكبرا أربعاً وثلاثين، فهو خير لكما من خادم».',
    targetCount: 100
  },
  {
    id: 'night-bismika-amutu',
    titleEn: '5. Bedtime Supplication: Bismika Allahumma amutu wa ahya',
    titleAr: '⑤ دُعَاءُ النَّوْمِ: اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
    source: 'Sahih al-Bukhari (6312, 6324)',
    arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا.',
    transliteration: 'Allāhumma bismika amūtu wa aḥyā.',
    translation: 'O Allah, in Your Name I die and I live.',
    virtue: 'كان النبي ﷺ إذا أراد أن ينام وضَع يده تحت خده وقال: «اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا».',
    targetCount: 1
  },
  {
    id: 'night-bismika-wada-tu',
    titleEn: '6. Entrusting the Soul upon Laying on Right Side',
    titleAr: '⑥ دُعَاءُ وَضْعِ الجَنْبِ: بِاسْمِكَ اللَّهُمَّ وَضَعْتُ جَنْبِي...',
    source: 'Sahih al-Bukhari (6320) & Sahih Muslim (2714)',
    arabic: 'بِاسْمِكَ اللَّهُمَّ وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
    transliteration: 'Bismika Allāhumma waḍa‘tu janbī, wa bika arfa‘uh, fa in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī ‘ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your Name, O Allah, I lay my side down, and by You I raise it up. If You hold back my soul, have mercy upon it, and if You release it, protect it as You protect Your righteous servants.',
    virtue: 'وصية نبوية شريفة بتفويض الروح وحفظها بالدعاء عند الاضطجاع على الشق الأيمن.',
    targetCount: 1
  },
  {
    id: 'night-concluding-fitrah',
    titleEn: '7. The Crowning Supplication of Fitrah (Last words before sleep)',
    titleAr: '⑦ دُعَاءُ الفِطْرَةِ: اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ... (آخر ما يُقال قبل النوم)',
    source: 'Sahih al-Bukhari (6311) & Sahih Muslim (2710)',
    arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.',
    transliteration: 'Allāhumma aslamtu nafsī ilayka, wa wajjahtu wajhī ilayka, wa fawwaḍtu amrī ilayka, wa alja’tu ẓahrī ilayka, raghbatan wa rahbatan ilayk, lā malja’a wa lā manjā minka illā ilayk. Āmantu bikitābikalladhī anzalta, wa bi-nabiyyikalladhī arsalt.',
    translation: 'O Allah, I submit my soul to You, I turn my face to You, I entrust my affair to You, and I commit my back to You out of desire and fear of You. There is no refuge and no escape from You except to You. I believe in Your Book which You revealed, and in Your Prophet whom You sent.',
    virtue: 'قال النبي ﷺ للبراء بن عازب رضي الله عنه: «واجعلهن من آخر ما تقول، فإن متَّ من ليلتك متَّ على الفطرة».',
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
          className="max-w-3xl w-full bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl p-4 sm:p-6 space-y-4 shadow-[0_0_50px_rgba(197,160,89,0.2)] text-left relative my-auto max-h-[92vh] flex flex-col"
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
                    <span>حِصْنُ أَدْعِيَةِ النَّوْمِ وَالقَيْلُولَة • SLEEP ADHKĀR</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#fef08a]">
                    سُنَّةٌ صَحِيحَة
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  {activeTab === 'dhohr'
                    ? 'أدعية وتوجيهات القيلولة والنوم نهاراً وفق الفقه النبوي الميسر'
                    : 'الروتين اليومي المعتمد لأذكار النوم الصحيحة وحفظ الليل'}
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
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'dhohr'
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>☀️ أذكار القيلولة (Siesta Nap)</span>
                {isDhohrCompleted && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('night')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'night'
                    ? 'bg-violet-950/80 text-violet-200 border border-violet-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-violet-400" />
                <span>🌙 أذكار النوم (Night Sleep)</span>
                {isNightCompleted && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400 text-[11px]">المقروء:</span>
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
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 cursor-pointer"
                title="إعادة ضبط العدادات"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* 😴 PRACTICAL STREAMLINED SEQUENCE BANNER (الترتيب العملي المختصر) */}
          <div className="p-3 bg-gradient-to-r from-[#14120c] via-[#0d0f16] to-[#0a0c13] border border-[#c5a059]/40 rounded-xl space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-[#fef08a] font-display font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{activeTab === 'dhohr' ? 'الترتيب العملي الميسر للقيلولة' : 'الترتيب العملي المختصر (روتين النوم اليومي)'}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-black/40 border border-white/10 px-2 py-0.5 rounded">
                {activeTab === 'dhohr' ? 'عند الاضطجاع نهاراً' : 'بعد العشاء / قبل النوم'}
              </span>
            </div>

            {activeTab === 'dhohr' ? (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-200 shrink-0">① آية الكرسي</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-200 shrink-0">② الإخلاص والمعوذتان ×1</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-200 shrink-0">③ النوم على اليمين</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-200 shrink-0">④ باسمك اللهم أموت وأحيا</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-zinc-400 shrink-0">الوضوء إن تيسر</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-violet-950/60 border border-violet-500/40 text-violet-200 shrink-0 font-bold">① آية الكرسي</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-violet-950/60 border border-violet-500/40 text-violet-200 shrink-0 font-bold">② آخر آيتين من البقرة</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-violet-950/60 border border-violet-500/40 text-violet-200 shrink-0 font-bold">③ المعوذات ×3 (مع النفث والمسح)</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-violet-950/60 border border-violet-500/40 text-violet-200 shrink-0 font-bold">④ التسبيح (٣٣-٣٣-٣٤)</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-violet-950/60 border border-violet-500/40 text-violet-200 shrink-0 font-bold">⑤ ⑥ ⑦ أدعية النوم</span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 shrink-0 font-bold">النوم على اليمين</span>
              </div>
            )}
          </div>

          {/* FIQH & ETIQUETTE BANNER */}
          {activeTab === 'dhohr' ? (
            <div className="p-3 bg-gradient-to-r from-amber-950/30 via-[#18140b] to-[#0d0a06] border border-amber-500/30 rounded-xl space-y-1 shrink-0 text-xs font-sans">
              <div className="flex items-center gap-2 text-amber-300 font-display font-bold text-xs">
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>إرشاد نبوي أصيل في القيلولة (النوم أثناء النهار)</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                لا يوجد ورد صحيح خاص بالقيلولة نفسها كأذكار الصباح والمساء، لكن إذا كانت نوماً فعلياً فيُطبّق عليها أذكار النوم الأساسية؛ لأن الأحاديث الواردة في أذكار النوم ليست مقيدة بالليل فقط. ولا تحتاج إلى قائمة قيلولة منفصلة؛ فإذا كانت قيلولة قصيرة، يكفي تطبيق أذكار النوم الأساسية المستطاعة.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-violet-950/30 via-[#120e1a] to-[#07050d] border border-violet-500/30 rounded-xl space-y-1 shrink-0 text-xs font-sans">
              <div className="flex items-center gap-2 text-violet-300 font-display font-bold text-xs">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                <span>آداب النوم النبوية المباركة (سنن النوم المأثورة)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-[11px] text-zinc-300">
                <div className="p-1.5 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[9px] shrink-0">1</span>
                  <span><strong>الوضوء</strong> قبل النوم إن تيسر</span>
                </div>
                <div className="p-1.5 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[9px] shrink-0">2</span>
                  <span><strong>النفث والمسح</strong> بالمعوذات ۳ مرات</span>
                </div>
                <div className="p-1.5 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[9px] shrink-0">3</span>
                  <span><strong>الاضطجاع على الشق الأيمن</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* SCROLLABLE LIST OF ADHKAR */}
          <div className="overflow-y-auto pr-1.5 space-y-3.5 flex-1 min-h-0">
            {currentList.map((item) => {
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
                          {item.titleAr}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 bg-black/50 border border-white/10 px-2 py-0.5 rounded-md">
                          {item.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-display text-zinc-400 block">
                        {item.titleEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isItemDone ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          تم ({currentVal}/{item.targetCount})
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
                    <p className="text-base sm:text-lg font-serif font-bold text-[#fef08a] leading-loose tracking-wide select-all whitespace-pre-line" dir="rtl">
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
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 border cursor-pointer ${
                          isItemDone
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-white/10'
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>قراءة (+1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetCompleted(item.id, item.targetCount)}
                        className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 text-xs font-mono transition cursor-pointer"
                        title="إكمال العدد المطلوب كاملاً"
                      >
                        ✓ إكمال
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* PALE ORE REVERENCE PRINCIPLE: WORSHIP FULFILLED */}
          <div className="p-3 bg-[#0a0d13] border border-[#c5a059]/25 rounded-xl flex items-center gap-3 text-xs font-sans text-zinc-300 shrink-0">
            <Heart className="h-4 w-4 text-[#c5a059] shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-[#fef08a]">الأذكار عبادة وطاعة:</strong> في تصميم <span className="font-serif text-[#c5a059]">Pale Ore</span>، الأذكار ليست وسيلة لتحصيل النقاط، بل تسجيلها هنا توثيقٌ لـ <span className="text-emerald-400 font-bold">عبادة منجزة</span> واستحضارٌ للإخلاص وحفظ الله تعالى.
            </p>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#c5a059]/20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">
                حالة العبادة اليومية:
              </span>
              {activeTab === 'dhohr' ? (
                isDhohrCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    عبادة منجزة ومُثبتة (ورد القيلولة) ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-300/80 bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    في انتظار التثبيت • بنية التقرب والإخلاص
                  </span>
                )
              ) : (
                isNightCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    عبادة منجزة ومُثبتة (ورد نوم الليل) ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono text-violet-300/80 bg-violet-950/30 px-2.5 py-1 rounded-lg border border-violet-500/20">
                    في انتظار التثبيت • بنية الإخلاص وحضور القلب
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'dhohr' ? (
                <button
                  type="button"
                  onClick={() => toggleAdhkar('sleepDhohr', systemDate)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                    isDhohrCompleted
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/60'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isDhohrCompleted ? 'عبادة منجزة ✓ (إلغاء التثبيت)' : 'تثبيت الورد (تسجيل عبادة منجزة)'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleAdhkar('sleepNight', systemDate)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                    isNightCompleted
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/60'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white border-violet-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isNightCompleted ? 'عبادة منجزة ✓ (إلغاء التثبيت)' : 'تثبيت الورد (تسجيل عبادة منجزة)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#07080c] hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
