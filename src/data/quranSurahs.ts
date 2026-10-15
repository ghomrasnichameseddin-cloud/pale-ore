export interface QuranSurahMetadata {
  number: number;
  nameArabic: string;
  nameTransliteration: string;
  nameEnglish: string;
  revelationType: 'Meccan' | 'Medinan';
  totalAyahs: number;
  startPage: number;
  endPage: number;
  totalPages: number;
  juz: number;
}

export const QURAN_SURAHS: QuranSurahMetadata[] = [
  { number: 1, nameArabic: 'الفاتحة', nameTransliteration: 'Al-Fatihah', nameEnglish: 'The Opener', revelationType: 'Meccan', totalAyahs: 7, startPage: 1, endPage: 1, totalPages: 1, juz: 1 },
  { number: 2, nameArabic: 'البقرة', nameTransliteration: 'Al-Baqarah', nameEnglish: 'The Cow', revelationType: 'Medinan', totalAyahs: 286, startPage: 2, endPage: 49, totalPages: 48, juz: 1 },
  { number: 3, nameArabic: 'آل عمران', nameTransliteration: "Ali 'Imran", nameEnglish: 'Family of Imran', revelationType: 'Medinan', totalAyahs: 200, startPage: 50, endPage: 76, totalPages: 27, juz: 3 },
  { number: 4, nameArabic: 'النساء', nameTransliteration: 'An-Nisa', nameEnglish: 'The Women', revelationType: 'Medinan', totalAyahs: 176, startPage: 77, endPage: 106, totalPages: 30, juz: 4 },
  { number: 5, nameArabic: 'المائدة', nameTransliteration: "Al-Ma'idah", nameEnglish: 'The Table Spread', revelationType: 'Medinan', totalAyahs: 120, startPage: 106, endPage: 127, totalPages: 22, juz: 6 },
  { number: 6, nameArabic: 'الأنعام', nameTransliteration: "Al-An'am", nameEnglish: 'The Cattle', revelationType: 'Meccan', totalAyahs: 165, startPage: 128, endPage: 150, totalPages: 23, juz: 7 },
  { number: 7, nameArabic: 'الأعراف', nameTransliteration: "Al-A'raf", nameEnglish: 'The Heights', revelationType: 'Meccan', totalAyahs: 206, startPage: 151, endPage: 176, totalPages: 26, juz: 8 },
  { number: 8, nameArabic: 'الأنفال', nameTransliteration: 'Al-Anfal', nameEnglish: 'The Spoils of War', revelationType: 'Medinan', totalAyahs: 75, startPage: 177, endPage: 186, totalPages: 10, juz: 9 },
  { number: 9, nameArabic: 'التوبة', nameTransliteration: 'At-Tawbah', nameEnglish: 'The Repentance', revelationType: 'Medinan', totalAyahs: 129, startPage: 187, endPage: 207, totalPages: 21, juz: 10 },
  { number: 10, nameArabic: 'يونس', nameTransliteration: 'Yunus', nameEnglish: 'Jonah', revelationType: 'Meccan', totalAyahs: 109, startPage: 208, endPage: 221, totalPages: 14, juz: 11 },
  { number: 11, nameArabic: 'هود', nameTransliteration: 'Hud', nameEnglish: 'Hud', revelationType: 'Meccan', totalAyahs: 123, startPage: 221, endPage: 235, totalPages: 15, juz: 11 },
  { number: 12, nameArabic: 'يوسف', nameTransliteration: 'Yusuf', nameEnglish: 'Joseph', revelationType: 'Meccan', totalAyahs: 111, startPage: 235, endPage: 248, totalPages: 14, juz: 12 },
  { number: 13, nameArabic: 'الرعد', nameTransliteration: "Ar-Ra'd", nameEnglish: 'The Thunder', revelationType: 'Medinan', totalAyahs: 43, startPage: 249, endPage: 255, totalPages: 7, juz: 13 },
  { number: 14, nameArabic: 'إبراهيم', nameTransliteration: 'Ibrahim', nameEnglish: 'Abraham', revelationType: 'Meccan', totalAyahs: 52, startPage: 255, endPage: 261, totalPages: 7, juz: 13 },
  { number: 15, nameArabic: 'الحجر', nameTransliteration: 'Al-Hijr', nameEnglish: 'The Rocky Tract', revelationType: 'Meccan', totalAyahs: 99, startPage: 262, endPage: 267, totalPages: 6, juz: 14 },
  { number: 16, nameArabic: 'النحل', nameTransliteration: 'An-Nahl', nameEnglish: 'The Bee', revelationType: 'Meccan', totalAyahs: 128, startPage: 267, endPage: 281, totalPages: 15, juz: 14 },
  { number: 17, nameArabic: 'الإسراء', nameTransliteration: 'Al-Isra', nameEnglish: 'The Night Journey', revelationType: 'Meccan', totalAyahs: 111, startPage: 282, endPage: 293, totalPages: 12, juz: 15 },
  { number: 18, nameArabic: 'الكهف', nameTransliteration: 'Al-Kahf', nameEnglish: 'The Cave', revelationType: 'Meccan', totalAyahs: 110, startPage: 293, endPage: 304, totalPages: 12, juz: 15 },
  { number: 19, nameArabic: 'مريم', nameTransliteration: 'Maryam', nameEnglish: 'Mary', revelationType: 'Meccan', totalAyahs: 98, startPage: 305, endPage: 312, totalPages: 8, juz: 16 },
  { number: 20, nameArabic: 'طه', nameTransliteration: 'Taha', nameEnglish: 'Ta-Ha', revelationType: 'Meccan', totalAyahs: 135, startPage: 312, endPage: 321, totalPages: 10, juz: 16 },
  { number: 21, nameArabic: 'الأنبياء', nameTransliteration: 'Al-Anbiya', nameEnglish: 'The Prophets', revelationType: 'Meccan', totalAyahs: 112, startPage: 322, endPage: 331, totalPages: 10, juz: 17 },
  { number: 22, nameArabic: 'الحج', nameTransliteration: 'Al-Hajj', nameEnglish: 'The Pilgrimage', revelationType: 'Medinan', totalAyahs: 78, startPage: 332, endPage: 341, totalPages: 10, juz: 17 },
  { number: 23, nameArabic: 'المؤمنون', nameTransliteration: "Al-Mu'minun", nameEnglish: 'The Believers', revelationType: 'Meccan', totalAyahs: 118, startPage: 342, endPage: 349, totalPages: 8, juz: 18 },
  { number: 24, nameArabic: 'النور', nameTransliteration: 'An-Nur', nameEnglish: 'The Light', revelationType: 'Medinan', totalAyahs: 64, startPage: 350, endPage: 359, totalPages: 10, juz: 18 },
  { number: 25, nameArabic: 'الفرقان', nameTransliteration: 'Al-Furqan', nameEnglish: 'The Criterion', revelationType: 'Meccan', totalAyahs: 77, startPage: 359, endPage: 366, totalPages: 8, juz: 18 },
  { number: 26, nameArabic: 'الشعراء', nameTransliteration: "Ash-Shu'ara", nameEnglish: 'The Poets', revelationType: 'Meccan', totalAyahs: 227, startPage: 367, endPage: 376, totalPages: 10, juz: 19 },
  { number: 27, nameArabic: 'النمل', nameTransliteration: 'An-Naml', nameEnglish: 'The Ant', revelationType: 'Meccan', totalAyahs: 93, startPage: 377, endPage: 385, totalPages: 9, juz: 19 },
  { number: 28, nameArabic: 'القصص', nameTransliteration: 'Al-Qasas', nameEnglish: 'The Stories', revelationType: 'Meccan', totalAyahs: 88, startPage: 385, endPage: 396, totalPages: 12, juz: 20 },
  { number: 29, nameArabic: 'العنكبوت', nameTransliteration: "Al-'Ankabut", nameEnglish: 'The Spider', revelationType: 'Meccan', totalAyahs: 69, startPage: 396, endPage: 404, totalPages: 9, juz: 20 },
  { number: 30, nameArabic: 'الروم', nameTransliteration: 'Ar-Rum', nameEnglish: 'The Romans', revelationType: 'Meccan', totalAyahs: 60, startPage: 404, endPage: 410, totalPages: 7, juz: 21 },
  { number: 31, nameArabic: 'لقمان', nameTransliteration: 'Luqman', nameEnglish: 'Luqman', revelationType: 'Meccan', totalAyahs: 34, startPage: 411, endPage: 414, totalPages: 4, juz: 21 },
  { number: 32, nameArabic: 'السجدة', nameTransliteration: 'As-Sajdah', nameEnglish: 'The Prostration', revelationType: 'Meccan', totalAyahs: 30, startPage: 415, endPage: 417, totalPages: 3, juz: 21 },
  { number: 33, nameArabic: 'الأحزاب', nameTransliteration: 'Al-Ahzab', nameEnglish: 'The Combined Forces', revelationType: 'Medinan', totalAyahs: 73, startPage: 418, endPage: 427, totalPages: 10, juz: 21 },
  { number: 34, nameArabic: 'سبأ', nameTransliteration: 'Saba', nameEnglish: 'Sheba', revelationType: 'Meccan', totalAyahs: 54, startPage: 428, endPage: 434, totalPages: 7, juz: 22 },
  { number: 35, nameArabic: 'فاطر', nameTransliteration: 'Fatir', nameEnglish: 'Originator', revelationType: 'Meccan', totalAyahs: 45, startPage: 434, endPage: 440, totalPages: 7, juz: 22 },
  { number: 36, nameArabic: 'يس', nameTransliteration: 'Ya-Sin', nameEnglish: 'Ya-Sin', revelationType: 'Meccan', totalAyahs: 83, startPage: 440, endPage: 445, totalPages: 6, juz: 22 },
  { number: 37, nameArabic: 'الصافات', nameTransliteration: 'As-Saffat', nameEnglish: 'Those Ranks', revelationType: 'Meccan', totalAyahs: 182, startPage: 446, endPage: 452, totalPages: 7, juz: 23 },
  { number: 38, nameArabic: 'ص', nameTransliteration: 'Sad', nameEnglish: 'The Letter Sad', revelationType: 'Meccan', totalAyahs: 88, startPage: 453, endPage: 458, totalPages: 6, juz: 23 },
  { number: 39, nameArabic: 'الزمر', nameTransliteration: 'Az-Zumar', nameEnglish: 'The Troops', revelationType: 'Meccan', totalAyahs: 75, startPage: 458, endPage: 467, totalPages: 10, juz: 23 },
  { number: 40, nameArabic: 'غافر', nameTransliteration: 'Ghafir', nameEnglish: 'The Forgiver', revelationType: 'Meccan', totalAyahs: 85, startPage: 467, endPage: 476, totalPages: 10, juz: 24 },
  { number: 41, nameArabic: 'فصلت', nameTransliteration: 'Fussilat', nameEnglish: 'Explained in Detail', revelationType: 'Meccan', totalAyahs: 54, startPage: 477, endPage: 482, totalPages: 6, juz: 24 },
  { number: 42, nameArabic: 'الشورى', nameTransliteration: 'Ash-Shura', nameEnglish: 'The Consultation', revelationType: 'Meccan', totalAyahs: 53, startPage: 483, endPage: 489, totalPages: 7, juz: 25 },
  { number: 43, nameArabic: 'الزخرف', nameTransliteration: 'Az-Zukhruf', nameEnglish: 'The Gold Adornment', revelationType: 'Meccan', totalAyahs: 89, startPage: 489, endPage: 495, totalPages: 7, juz: 25 },
  { number: 44, nameArabic: 'الدخان', nameTransliteration: 'Ad-Dukhan', nameEnglish: 'The Smoke', revelationType: 'Meccan', totalAyahs: 59, startPage: 496, endPage: 498, totalPages: 3, juz: 25 },
  { number: 45, nameArabic: 'الجاثية', nameTransliteration: 'Al-Jathiyah', nameEnglish: 'The Crouching', revelationType: 'Meccan', totalAyahs: 37, startPage: 499, endPage: 502, totalPages: 4, juz: 25 },
  { number: 46, nameArabic: 'الأحقاف', nameTransliteration: 'Al-Ahqaf', nameEnglish: 'The Wind-Curved Sandhills', revelationType: 'Meccan', totalAyahs: 35, startPage: 502, endPage: 506, totalPages: 5, juz: 26 },
  { number: 47, nameArabic: 'محمد', nameTransliteration: 'Muhammad', nameEnglish: 'Muhammad', revelationType: 'Medinan', totalAyahs: 38, startPage: 507, endPage: 510, totalPages: 4, juz: 26 },
  { number: 48, nameArabic: 'الفتح', nameTransliteration: 'Al-Fath', nameEnglish: 'The Victory', revelationType: 'Medinan', totalAyahs: 29, startPage: 511, endPage: 515, totalPages: 5, juz: 26 },
  { number: 49, nameArabic: 'الحجرات', nameTransliteration: 'Al-Hujurat', nameEnglish: 'The Rooms', revelationType: 'Medinan', totalAyahs: 18, startPage: 515, endPage: 517, totalPages: 3, juz: 26 },
  { number: 50, nameArabic: 'ق', nameTransliteration: 'Qaf', nameEnglish: 'The Letter Qaf', revelationType: 'Meccan', totalAyahs: 45, startPage: 518, endPage: 520, totalPages: 3, juz: 26 },
  { number: 51, nameArabic: 'الذاريات', nameTransliteration: 'Adh-Dhariyat', nameEnglish: 'The Winnowing Winds', revelationType: 'Meccan', totalAyahs: 60, startPage: 520, endPage: 523, totalPages: 4, juz: 26 },
  { number: 52, nameArabic: 'الطور', nameTransliteration: 'At-Tur', nameEnglish: 'The Mount', revelationType: 'Meccan', totalAyahs: 49, startPage: 523, endPage: 525, totalPages: 3, juz: 27 },
  { number: 53, nameArabic: 'النجم', nameTransliteration: 'An-Najm', nameEnglish: 'The Star', revelationType: 'Meccan', totalAyahs: 62, startPage: 526, endPage: 528, totalPages: 3, juz: 27 },
  { number: 54, nameArabic: 'القمر', nameTransliteration: 'Al-Qamar', nameEnglish: 'The Moon', revelationType: 'Meccan', totalAyahs: 55, startPage: 528, endPage: 531, totalPages: 4, juz: 27 },
  { number: 55, nameArabic: 'الرحمن', nameTransliteration: 'Ar-Rahman', nameEnglish: 'The Beneficent', revelationType: 'Medinan', totalAyahs: 78, startPage: 531, endPage: 534, totalPages: 4, juz: 27 },
  { number: 56, nameArabic: 'الواقعة', nameTransliteration: "Al-Waqi'ah", nameEnglish: 'The Inevitable', revelationType: 'Meccan', totalAyahs: 96, startPage: 534, endPage: 537, totalPages: 4, juz: 27 },
  { number: 57, nameArabic: 'الحديد', nameTransliteration: 'Al-Hadid', nameEnglish: 'The Iron', revelationType: 'Medinan', totalAyahs: 29, startPage: 537, endPage: 541, totalPages: 5, juz: 27 },
  { number: 58, nameArabic: 'المجادلة', nameTransliteration: 'Al-Mujadilah', nameEnglish: 'The Pleading Woman', revelationType: 'Medinan', totalAyahs: 22, startPage: 542, endPage: 545, totalPages: 4, juz: 28 },
  { number: 59, nameArabic: 'الحشر', nameTransliteration: 'Al-Hashr', nameEnglish: 'The Exile', revelationType: 'Medinan', totalAyahs: 24, startPage: 545, endPage: 548, totalPages: 4, juz: 28 },
  { number: 60, nameArabic: 'الممتحنة', nameTransliteration: 'Al-Mumtahanah', nameEnglish: 'She That Is Examined', revelationType: 'Medinan', totalAyahs: 13, startPage: 549, endPage: 551, totalPages: 3, juz: 28 },
  { number: 61, nameArabic: 'الصف', nameTransliteration: 'As-Saff', nameEnglish: 'The Ranks', revelationType: 'Medinan', totalAyahs: 14, startPage: 551, endPage: 552, totalPages: 2, juz: 28 },
  { number: 62, nameArabic: 'الجمعة', nameTransliteration: "Al-Jumu'ah", nameEnglish: 'Friday', revelationType: 'Medinan', totalAyahs: 11, startPage: 553, endPage: 554, totalPages: 2, juz: 28 },
  { number: 63, nameArabic: 'المنافقون', nameTransliteration: 'Al-Munafiqun', nameEnglish: 'The Hypocrites', revelationType: 'Medinan', totalAyahs: 11, startPage: 554, endPage: 555, totalPages: 2, juz: 28 },
  { number: 64, nameArabic: 'التغابن', nameTransliteration: 'At-Taghabun', nameEnglish: 'Mutual Disillusion', revelationType: 'Medinan', totalAyahs: 18, startPage: 556, endPage: 557, totalPages: 2, juz: 28 },
  { number: 65, nameArabic: 'الطلاق', nameTransliteration: 'At-Talaq', nameEnglish: 'The Divorce', revelationType: 'Medinan', totalAyahs: 12, startPage: 558, endPage: 559, totalPages: 2, juz: 28 },
  { number: 66, nameArabic: 'التحريم', nameTransliteration: 'At-Tahrim', nameEnglish: 'The Prohibition', revelationType: 'Medinan', totalAyahs: 12, startPage: 560, endPage: 561, totalPages: 2, juz: 28 },
  { number: 67, nameArabic: 'الملك', nameTransliteration: 'Al-Mulk', nameEnglish: 'The Sovereignty', revelationType: 'Meccan', totalAyahs: 30, startPage: 562, endPage: 564, totalPages: 3, juz: 29 },
  { number: 68, nameArabic: 'القلم', nameTransliteration: 'Al-Qalam', nameEnglish: 'The Pen', revelationType: 'Meccan', totalAyahs: 52, startPage: 564, endPage: 566, totalPages: 3, juz: 29 },
  { number: 69, nameArabic: 'الحاقة', nameTransliteration: 'Al-Haqqah', nameEnglish: 'The Inevitable Reality', revelationType: 'Meccan', totalAyahs: 52, startPage: 566, endPage: 568, totalPages: 3, juz: 29 },
  { number: 70, nameArabic: 'المعارج', nameTransliteration: "Al-Ma'arij", nameEnglish: 'The Ascending Stairways', revelationType: 'Meccan', totalAyahs: 44, startPage: 568, endPage: 570, totalPages: 3, juz: 29 },
  { number: 71, nameArabic: 'نوح', nameTransliteration: 'Nuh', nameEnglish: 'Noah', revelationType: 'Meccan', totalAyahs: 28, startPage: 570, endPage: 571, totalPages: 2, juz: 29 },
  { number: 72, nameArabic: 'الجن', nameTransliteration: 'Al-Jinn', nameEnglish: 'The Jinn', revelationType: 'Meccan', totalAyahs: 28, startPage: 572, endPage: 573, totalPages: 2, juz: 29 },
  { number: 73, nameArabic: 'المزمل', nameTransliteration: 'Al-Muzzammil', nameEnglish: 'The Enshrouded One', revelationType: 'Meccan', totalAyahs: 20, startPage: 574, endPage: 575, totalPages: 2, juz: 29 },
  { number: 74, nameArabic: 'المدثر', nameTransliteration: 'Al-Muddaththir', nameEnglish: 'The Cloaked One', revelationType: 'Meccan', totalAyahs: 56, startPage: 575, endPage: 577, totalPages: 3, juz: 29 },
  { number: 75, nameArabic: 'القيامة', nameTransliteration: 'Al-Qiyamah', nameEnglish: 'The Resurrection', revelationType: 'Meccan', totalAyahs: 40, startPage: 577, endPage: 578, totalPages: 2, juz: 29 },
  { number: 76, nameArabic: 'الإنسان', nameTransliteration: 'Al-Insan', nameEnglish: 'Man', revelationType: 'Medinan', totalAyahs: 31, startPage: 578, endPage: 580, totalPages: 3, juz: 29 },
  { number: 77, nameArabic: 'المرسلات', nameTransliteration: 'Al-Mursalat', nameEnglish: 'The Emissaries', revelationType: 'Meccan', totalAyahs: 50, startPage: 580, endPage: 581, totalPages: 2, juz: 29 },
  { number: 78, nameArabic: 'النبأ', nameTransliteration: 'An-Naba', nameEnglish: 'The Tidings', revelationType: 'Meccan', totalAyahs: 40, startPage: 582, endPage: 583, totalPages: 2, juz: 30 },
  { number: 79, nameArabic: 'النازعات', nameTransliteration: "An-Nazi'at", nameEnglish: 'Those Who Drag Forth', revelationType: 'Meccan', totalAyahs: 46, startPage: 583, endPage: 584, totalPages: 2, juz: 30 },
  { number: 80, nameArabic: 'عبس', nameTransliteration: "'Abasa", nameEnglish: 'He Frowned', revelationType: 'Meccan', totalAyahs: 42, startPage: 585, endPage: 586, totalPages: 2, juz: 30 },
  { number: 81, nameArabic: 'التكوير', nameTransliteration: 'At-Takwir', nameEnglish: 'The Overthrowing', revelationType: 'Meccan', totalAyahs: 29, startPage: 586, endPage: 586, totalPages: 1, juz: 30 },
  { number: 82, nameArabic: 'الانفطار', nameTransliteration: 'Al-Infitar', nameEnglish: 'The Cleaving', revelationType: 'Meccan', totalAyahs: 19, startPage: 587, endPage: 587, totalPages: 1, juz: 30 },
  { number: 83, nameArabic: 'المطففين', nameTransliteration: 'Al-Mutaffifin', nameEnglish: 'Defrauding', revelationType: 'Meccan', totalAyahs: 36, startPage: 587, endPage: 589, totalPages: 3, juz: 30 },
  { number: 84, nameArabic: 'الانشقاق', nameTransliteration: 'Al-Inshiqaq', nameEnglish: 'The Splitting Open', revelationType: 'Meccan', totalAyahs: 25, startPage: 589, endPage: 590, totalPages: 2, juz: 30 },
  { number: 85, nameArabic: 'البروج', nameTransliteration: 'Al-Buruj', nameEnglish: 'The Constellations', revelationType: 'Meccan', totalAyahs: 22, startPage: 590, endPage: 590, totalPages: 1, juz: 30 },
  { number: 86, nameArabic: 'الطارق', nameTransliteration: 'At-Tariq', nameEnglish: 'The Nightcomer', revelationType: 'Meccan', totalAyahs: 17, startPage: 591, endPage: 591, totalPages: 1, juz: 30 },
  { number: 87, nameArabic: 'الأعلى', nameTransliteration: "Al-A'la", nameEnglish: 'The Most High', revelationType: 'Meccan', totalAyahs: 19, startPage: 591, endPage: 592, totalPages: 2, juz: 30 },
  { number: 88, nameArabic: 'الغاشية', nameTransliteration: 'Al-Ghashiyah', nameEnglish: 'The Overwhelming', revelationType: 'Meccan', totalAyahs: 26, startPage: 592, endPage: 593, totalPages: 2, juz: 30 },
  { number: 89, nameArabic: 'الفجر', nameTransliteration: 'Al-Fajr', nameEnglish: 'The Dawn', revelationType: 'Meccan', totalAyahs: 30, startPage: 593, endPage: 594, totalPages: 2, juz: 30 },
  { number: 90, nameArabic: 'البلد', nameTransliteration: 'Al-Balad', nameEnglish: 'The City', revelationType: 'Meccan', totalAyahs: 20, startPage: 594, endPage: 595, totalPages: 2, juz: 30 },
  { number: 91, nameArabic: 'الشمس', nameTransliteration: 'Ash-Shams', nameEnglish: 'The Sun', revelationType: 'Meccan', totalAyahs: 15, startPage: 595, endPage: 595, totalPages: 1, juz: 30 },
  { number: 92, nameArabic: 'الليل', nameTransliteration: 'Al-Layl', nameEnglish: 'The Night', revelationType: 'Meccan', totalAyahs: 21, startPage: 595, endPage: 596, totalPages: 2, juz: 30 },
  { number: 93, nameArabic: 'الضحى', nameTransliteration: 'Ad-Duha', nameEnglish: 'The Morning Hours', revelationType: 'Meccan', totalAyahs: 11, startPage: 596, endPage: 596, totalPages: 1, juz: 30 },
  { number: 94, nameArabic: 'الشرح', nameTransliteration: 'Ash-Sharh', nameEnglish: 'The Relief', revelationType: 'Meccan', totalAyahs: 8, startPage: 596, endPage: 596, totalPages: 1, juz: 30 },
  { number: 95, nameArabic: 'التين', nameTransliteration: 'At-Tin', nameEnglish: 'The Fig', revelationType: 'Meccan', totalAyahs: 8, startPage: 597, endPage: 597, totalPages: 1, juz: 30 },
  { number: 96, nameArabic: 'العلق', nameTransliteration: "Al-'Alaq", nameEnglish: 'The Clot', revelationType: 'Meccan', totalAyahs: 19, startPage: 597, endPage: 597, totalPages: 1, juz: 30 },
  { number: 97, nameArabic: 'القدر', nameTransliteration: 'Al-Qadr', nameEnglish: 'The Power', revelationType: 'Meccan', totalAyahs: 5, startPage: 598, endPage: 598, totalPages: 1, juz: 30 },
  { number: 98, nameArabic: 'البينة', nameTransliteration: 'Al-Bayyinah', nameEnglish: 'The Clear Proof', revelationType: 'Medinan', totalAyahs: 8, startPage: 598, endPage: 599, totalPages: 2, juz: 30 },
  { number: 99, nameArabic: 'الزلزلة', nameTransliteration: 'Az-Zalzalah', nameEnglish: 'The Earthquake', revelationType: 'Medinan', totalAyahs: 8, startPage: 599, endPage: 599, totalPages: 1, juz: 30 },
  { number: 100, nameArabic: 'العاديات', nameTransliteration: "Al-'Adiyat", nameEnglish: 'The Courser', revelationType: 'Meccan', totalAyahs: 11, startPage: 599, endPage: 600, totalPages: 2, juz: 30 },
  { number: 101, nameArabic: 'القارعة', nameTransliteration: "Al-Qari'ah", nameEnglish: 'The Calamity', revelationType: 'Meccan', totalAyahs: 11, startPage: 600, endPage: 600, totalPages: 1, juz: 30 },
  { number: 102, nameArabic: 'التكاثر', nameTransliteration: 'At-Takathur', nameEnglish: 'The Rivalry in World Increase', revelationType: 'Meccan', totalAyahs: 8, startPage: 600, endPage: 600, totalPages: 1, juz: 30 },
  { number: 103, nameArabic: 'العصر', nameTransliteration: "Al-'Asr", nameEnglish: 'The Declining Day', revelationType: 'Meccan', totalAyahs: 3, startPage: 601, endPage: 601, totalPages: 1, juz: 30 },
  { number: 104, nameArabic: 'الهمزة', nameTransliteration: 'Al-Humazah', nameEnglish: 'The Traducer', revelationType: 'Meccan', totalAyahs: 9, startPage: 601, endPage: 601, totalPages: 1, juz: 30 },
  { number: 105, nameArabic: 'الفيل', nameTransliteration: 'Al-Fil', nameEnglish: 'The Elephant', revelationType: 'Meccan', totalAyahs: 5, startPage: 601, endPage: 601, totalPages: 1, juz: 30 },
  { number: 106, nameArabic: 'قريش', nameTransliteration: 'Quraysh', nameEnglish: 'Quraysh', revelationType: 'Meccan', totalAyahs: 4, startPage: 602, endPage: 602, totalPages: 1, juz: 30 },
  { number: 107, nameArabic: 'الماعون', nameTransliteration: "Al-Ma'un", nameEnglish: 'The Small Kindness', revelationType: 'Meccan', totalAyahs: 7, startPage: 602, endPage: 602, totalPages: 1, juz: 30 },
  { number: 108, nameArabic: 'الكوثر', nameTransliteration: 'Al-Kawthar', nameEnglish: 'The Abundance', revelationType: 'Meccan', totalAyahs: 3, startPage: 602, endPage: 602, totalPages: 1, juz: 30 },
  { number: 109, nameArabic: 'الكافرون', nameTransliteration: 'Al-Kafirun', nameEnglish: 'The Disbelievers', revelationType: 'Meccan', totalAyahs: 6, startPage: 603, endPage: 603, totalPages: 1, juz: 30 },
  { number: 110, nameArabic: 'النصر', nameTransliteration: 'An-Nasr', nameEnglish: 'The Divine Support', revelationType: 'Medinan', totalAyahs: 3, startPage: 603, endPage: 603, totalPages: 1, juz: 30 },
  { number: 111, nameArabic: 'المسد', nameTransliteration: 'Al-Masad', nameEnglish: 'The Palm Fiber', revelationType: 'Meccan', totalAyahs: 5, startPage: 603, endPage: 603, totalPages: 1, juz: 30 },
  { number: 112, nameArabic: 'الإخلاص', nameTransliteration: 'Al-Ikhlas', nameEnglish: 'The Sincerity', revelationType: 'Meccan', totalAyahs: 4, startPage: 604, endPage: 604, totalPages: 1, juz: 30 },
  { number: 113, nameArabic: 'الفلق', nameTransliteration: 'Al-Falaq', nameEnglish: 'The Daybreak', revelationType: 'Meccan', totalAyahs: 5, startPage: 604, endPage: 604, totalPages: 1, juz: 30 },
  { number: 114, nameArabic: 'الناس', nameTransliteration: 'An-Nas', nameEnglish: 'Mankind', revelationType: 'Meccan', totalAyahs: 6, startPage: 604, endPage: 604, totalPages: 1, juz: 30 },
];

import { SurahLedgerEntry } from '../types';

export function generateDefaultSurahLedger(): Record<number, SurahLedgerEntry> {
  const ledger: Record<number, SurahLedgerEntry> = {};

  for (const surah of QURAN_SURAHS) {
    ledger[surah.number] = {
      surahNumber: surah.number,
      memorizationStatus: 'not_started',
      memorizedPages: 0,
      memorizedAyahs: 0,
      revisionStatus: 'unrevised',
      masteryStrength: 1,
      revisionCount: 0,
      readStatus: 'unread',
      readPages: 0,
    };
  }

  return ledger;
}


