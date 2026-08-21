/**
 * Hijri Calendar Calculation & Islamic Date Utilities
 * Uses both Internationalization API (Intl.DateTimeFormat) with 'islamic-umalqura'
 * and astronomical lunar fallback conversion algorithm for 100% reliability.
 */

export interface HijriDateInfo {
  hijriDay: number;
  hijriMonth: number; // 1 to 12
  hijriMonthNameEn: string;
  hijriMonthNameAr: string;
  hijriYear: number;
  formattedEn: string;
  formattedAr: string;
  isHolyMonth: boolean;
  isJumuah: boolean;
  dayOfWeekEn: string;
  dayOfWeekAr: string;
  specialEvent?: string | null;
}

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhul-Qi\'dah',
  'Dhul-Hijjah'
];

export const HIJRI_MONTHS_AR = [
  'مُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الآخِر',
  'جُمَادَى الأُولَى',
  'جُمَادَى الآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة'
];

export const ARABIC_DAYS = [
  'الأَحَد',    // Sunday
  'الاِثْنَيْن', // Monday
  'الثُّلاثَاء', // Tuesday
  'الأَرْبِعَاء', // Wednesday
  'الخَمِيس',   // Thursday
  'الجُمُعَة',   // Friday
  'السَّبْت'     // Saturday
];

export const ENGLISH_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Arabic numeral converter
export const toArabicNumerals = (num: number | string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
};

/**
 * Astronomical Kuwaiti Algorithm fallback for converting Gregorian to Hijri
 */
function gregorianToHijriFallback(date: Date): { day: number; month: number; year: number } {
  let day = date.getDate();
  let month = date.getMonth(); // 0-indexed
  let year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  let bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);
  day = (bb - dd) - Math.floor(30.6001 * ee);
  month = ee - 1;
  if (ee > 13) {
    cc += 1;
    month = ee - 13;
  }
  year = cc - 4716;

  let wd = (jd + 1) % 7;

  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  let hMonth = Math.floor((24 * l) / 709);
  let hDay = l - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  return {
    day: Math.max(1, Math.min(30, hDay)),
    month: Math.max(1, Math.min(12, hMonth)),
    year: hYear
  };
}

/**
 * Calculates accurate Hijri Date Info from a date string (YYYY-MM-DD) or Date object
 */
export function getHijriDate(dateInput: string | Date = new Date()): HijriDateInfo {
  let date: Date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(Number);
    if (parts.length === 3) {
      date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  const dayOfWeek = date.getDay();
  const isJumuah = dayOfWeek === 5; // Friday

  let hDay = 1;
  let hMonth = 1;
  let hYear = 1447;

  // Try Intl format with umalqura calendar
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    
    for (const part of parts) {
      if (part.type === 'day') hDay = parseInt(part.value, 10);
      else if (part.type === 'month') hMonth = parseInt(part.value, 10);
      else if (part.type === 'year') {
        // Extract numeric year in case of suffix like "1447 AH"
        const yNum = parseInt(part.value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(yNum) && yNum > 1000) hYear = yNum;
      }
    }
  } catch {
    // Fallback to mathematical converter
    const fallback = gregorianToHijriFallback(date);
    hDay = fallback.day;
    hMonth = fallback.month;
    hYear = fallback.year;
  }

  // Ensure within bounds
  hMonth = Math.max(1, Math.min(12, hMonth));
  hDay = Math.max(1, Math.min(30, hDay));

  const monthIdx = hMonth - 1;
  const monthNameEn = HIJRI_MONTHS_EN[monthIdx] || 'Safar';
  const monthNameAr = HIJRI_MONTHS_AR[monthIdx] || 'صَفَر';

  // Holy months in Islam: Muharram (1), Rajab (7), Dhul-Qi'dah (11), Dhul-Hijjah (12), and Ramadan (9)
  const isHolyMonth = [1, 7, 9, 11, 12].includes(hMonth);

  // Determine special occasions / sacred markers
  let specialEvent: string | null = null;
  if (hMonth === 9) {
    specialEvent = hDay > 20 ? '🌙 Ramadan (Last 10 Nights)' : '🌙 Holy Month of Ramadan';
  } else if (hMonth === 12) {
    if (hDay === 9) specialEvent = '🕋 Day of Arafah (Yawm Arafah)';
    else if (hDay === 10) specialEvent = '🎉 Eid al-Adha';
    else if (hDay >= 1 && hDay <= 10) specialEvent = '✨ Sacred 10 Days of Dhul-Hijjah';
    else if (hDay >= 11 && hDay <= 13) specialEvent = 'Days of Tashreeq';
  } else if (hMonth === 10 && hDay === 1) {
    specialEvent = '🎉 Eid al-Fitr';
  } else if (hMonth === 1 && hDay === 10) {
    specialEvent = '🌊 Day of Ashura';
  } else if (hDay >= 13 && hDay <= 15) {
    specialEvent = '🌕 Ayyam al-Beed (The White Days Fasting)';
  } else if (isJumuah) {
    specialEvent = '🕌 Yawm al-Jumu\'ah (Blessed Friday)';
  }

  const formattedEn = `${hDay} ${monthNameEn} ${hYear} AH`;
  const formattedAr = `${toArabicNumerals(hDay)} ${monthNameAr} ${toArabicNumerals(hYear)} هـ`;

  return {
    hijriDay: hDay,
    hijriMonth: hMonth,
    hijriMonthNameEn: monthNameEn,
    hijriMonthNameAr: monthNameAr,
    hijriYear: hYear,
    formattedEn,
    formattedAr,
    isHolyMonth,
    isJumuah,
    dayOfWeekEn: ENGLISH_DAYS[dayOfWeek],
    dayOfWeekAr: ARABIC_DAYS[dayOfWeek],
    specialEvent
  };
}
