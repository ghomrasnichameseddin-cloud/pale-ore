import { PrayerCheck, SpiritualDailyLog } from '../types';

export const PRAYER_ORDER: ('fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha')[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha'
];

export const PRAYER_NAMES: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', { en: string; ar: string; defaultRakats: number }> = {
  fajr: { en: 'Fajr', ar: 'الفَجْر', defaultRakats: 2 },
  dhuhr: { en: 'Dhuhr', ar: 'الظُّهْر', defaultRakats: 4 },
  asr: { en: 'Asr', ar: 'العَصْر', defaultRakats: 4 },
  maghrib: { en: 'Maghrib', ar: 'المَغْرِب', defaultRakats: 3 },
  isha: { en: 'Isha', ar: 'العِشَاء', defaultRakats: 4 }
};

export const NEXT_PRAYER_DEFAULT_TARGETS: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'midnight'> = {
  fajr: 'dhuhr',
  dhuhr: 'asr',
  asr: 'maghrib',
  maghrib: 'isha',
  isha: 'midnight'
};

/**
 * Severe Penalty for unexecuted prayers past midnight (00:00).
 */
export const MIDNIGHT_MISSED_PRAYER_PENALTY_XP = 200;
export const MIDNIGHT_MISSED_PRAYER_PENALTY_HP = 10;

/**
 * Penalty for missing Salat al-Jumu'ah on Friday without excuse.
 */
export const MISSED_JUMUAH_PENALTY_XP = 150;
export const MISSED_JUMUAH_PENALTY_HP = 5;

/**
 * Calculates compound penalty for delayed prayers:
 * "delayed : done at the time of another prayer = compound penalty with each delayed prayer"
 * 
 * Compounding schedule:
 * 1st delayed prayer: -50 XP (Base)
 * 2nd delayed prayer: -100 XP (2x Compound)
 * 3rd delayed prayer: -175 XP (3.5x Compound)
 * 4th delayed prayer: -275 XP (5.5x Compound)
 * 5th delayed prayer: -400 XP (8x Compound)
 */
export const getCompoundDelayPenalty = (tier: number): number => {
  if (tier <= 1) return 50;
  if (tier === 2) return 100;
  if (tier === 3) return 175;
  if (tier === 4) return 275;
  return 400;
};

/**
 * Evaluates all prayers in a day's spiritual log and computes their compound tiers.
 */
export const calculateCompoundDelayTiers = (
  log: Partial<SpiritualDailyLog>
): Record<string, { tier: number; penaltyXp: number }> => {
  const result: Record<string, { tier: number; penaltyXp: number }> = {};
  let currentTier = 0;

  for (const prayer of PRAYER_ORDER) {
    const pState = log[prayer] as PrayerCheck | undefined;
    if (pState?.delayed) {
      currentTier++;
      const penaltyXp = getCompoundDelayPenalty(currentTier);
      result[prayer] = {
        tier: currentTier,
        penaltyXp
      };
    }
  }

  return result;
};

/**
 * Prophetic Hadith Warning for skipping Jumu'ah:
 * «لَيَنْتَهِيَنَّ أَقْوَامٌ عَنْ وَدْعِهِمُ الْجُمُعَاتِ، أَوْ لَيَخْتِمَنَّ اللَّهُ عَلَى قُلُوبِهِمْ ثُمَّ لَيَكُونُنَّ مِنَ الْغَافِلِينَ» (صحيح مسلم)
 * «مَنْ تَرَكَ ثَلَاثَ جُمَعٍ تَهَاوُنًا بِهَا طَبَعَ اللَّهُ عَلَى قَلْبِهِ» (أبو داود والترمذي والنسائي)
 * «مَنْ تَرَكَ جُمُعَتَيْنِ تَهَاوُنًا طُبِعَ عَلَى قَلْبِهِ» (النسائي وأحمد)
 */
export const getPropheticJumuahWarning = (consecutiveCount: number) => {
  const isSecondOrMore = consecutiveCount >= 2;
  const isThirdOrMore = consecutiveCount >= 3;

  return {
    title: isThirdOrMore
      ? '⛔ DIVINE SEAL WARNING • تَحْذِيرٌ جَلَل: ثَلَاثُ جُمَعٍ مَتْرُوكَة'
      : isSecondOrMore
      ? '🚨 GRAVE PROPHETIC WARNING • تَحْذِيرٌ نَبَوِيٌّ: تَرْكُ جُمُعَتَيْنِ'
      : '⚠️ SACRED WARNING • تَحْذِيرٌ مِنْ تَرْكِ صَلَاةِ الجُمُعَة',
    hadithAr: isSecondOrMore 
      ? 'قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ تَرَكَ جُمُعَتَيْنِ تَهَاوُنًا بِهِمَا طُبِعَ عَلَى قَلْبِهِ، وَكَانَ مِنَ الغَافِلِينَ»'
      : 'قَالَ رَسُولُ اللَّهِ ﷺ: «لَيَنْتَهِيَنَّ أَقْوَامٌ عَنْ وَدْعِهِمُ الْجُمُعَاتِ، أَوْ لَيَخْتِمَنَّ اللَّهُ عَلَى قُلُوبِهِمْ ثُمَّ لَيَكُونُنَّ مِنَ الْغَافِلِينَ» (صحيح مسلم)',
    hadithEn: isSecondOrMore
      ? 'The Messenger of Allah ﷺ warned: "Whoever leaves two Friday prayers out of negligence, a seal is placed upon his heart, and he becomes among the heedless (al-Ghāfilīn)."'
      : 'The Messenger of Allah ﷺ warned: "People must cease neglecting the Friday prayers, or Allah will seal their hearts, and they will surely be among the heedless." (Sahih Muslim 865)',
    explanation: isSecondOrMore
      ? `You have now missed ${consecutiveCount} Jumu'ah prayers. Islamic jurisprudence strictly forbids abandoning Jumu'ah without a compelling legal excuse (عذر شرعي). An automatic penalty of -${MISSED_JUMUAH_PENALTY_XP} XP and -${MISSED_JUMUAH_PENALTY_HP} HP has been deducted. You are now legally required to pray 4 Rak'ahs of Dhuhr (صلاة الظهر) instead.`
      : `Salat al-Jumu'ah is an individual obligation (Farḍ 'Ayn) for every capable Muslim male. Missing it incurs an immediate deduction of -${MISSED_JUMUAH_PENALTY_XP} XP and -${MISSED_JUMUAH_PENALTY_HP} HP. In Islamic law, Jumu'ah cannot be performed alone; you must immediately substitute it with 4 Rak'ahs of Dhuhr (صلاة الظهر).`,
    hadithSecondaryAr: '«مَنْ تَرَكَ ثَلَاثَ جُمَعٍ تَهَاوُنًا بِهَا طَبَعَ اللَّهُ عَلَى قَلْبِهِ» (رواه أبو داود والترمذي والنسائي)',
    hadithSecondaryEn: '"Whoever leaves three Friday prayers out of negligence, Allah will place a seal upon his heart." (Abu Dawood 1052, Tirmidhi 500, An-Nasa\'i 1369)'
  };
};

export const getAvailableDelayTargets = (
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
): { id: 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'midnight'; label: string }[] => {
  switch (prayer) {
    case 'fajr':
      return [
        { id: 'dhuhr', label: 'Dhuhr (الظهر)' },
        { id: 'asr', label: 'Asr (العصر)' },
        { id: 'maghrib', label: 'Maghrib (المغرب)' },
        { id: 'isha', label: 'Isha (العشاء)' },
        { id: 'midnight', label: 'Before Midnight (قبل منتصف الليل)' }
      ];
    case 'dhuhr':
      return [
        { id: 'asr', label: 'Asr (العصر)' },
        { id: 'maghrib', label: 'Maghrib (المغرب)' },
        { id: 'isha', label: 'Isha (العشاء)' },
        { id: 'midnight', label: 'Before Midnight (قبل منتصف الليل)' }
      ];
    case 'asr':
      return [
        { id: 'maghrib', label: 'Maghrib (المغرب)' },
        { id: 'isha', label: 'Isha (العشاء)' },
        { id: 'midnight', label: 'Before Midnight (قبل منتصف الليل)' }
      ];
    case 'maghrib':
      return [
        { id: 'isha', label: 'Isha (العشاء)' },
        { id: 'midnight', label: 'Before Midnight (قبل منتصف الليل)' }
      ];
    case 'isha':
      return [
        { id: 'midnight', label: 'Before Midnight (قبل منتصف الليل)' }
      ];
  }
};
