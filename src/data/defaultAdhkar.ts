import { AdhkarItem } from '../types';

export const DEFAULT_ADHKAR_LIST: AdhkarItem[] = [
  // ==========================================
  // 1. MORNING ADHKAR (أذكار الصباح)
  // ==========================================
  {
    id: 'adhkar-morning-1',
    title: 'Sayyid al-Istighfār (The Master of Supplications for Forgiveness)',
    titleAr: 'سَيِّدُ الاسْتِغْفَارِ',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي؛ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    transliteration: 'Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa anā ‘abduka, wa anā ‘alā ‘ahdika wa wa‘dika mastata‘tu, a‘ūdhu bika min sharri mā ṣana‘tu, abū’u laka bi ni‘matika ‘alayya, wa abū’u laka bi dhanbī, faghfir lī, fa innahū lā yaghfiru-dh-dhunūba illā Ant.',
    translation: 'O Allah, You are my Lord, there is no deity worthy of worship except You. You created me and I am Your servant, and I uphold Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I confess my sins to You; forgive me, for none forgives sins except You.',
    category: 'morning',
    targetCount: 1,
    virtue: 'Whoever recites this with firm conviction in the morning and dies during that day before evening will be among the people of Paradise.',
    hadithSource: 'Sahih al-Bukhari 6306',
    order: 1
  },
  {
    id: 'adhkar-morning-2',
    title: 'Ayat al-Kursi (The Verse of the Throne)',
    titleAr: 'آيَةُ الكُرْسِيِّ',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dhal-ladhī yashfa‘u ‘indahū illā bi idhnih, ya‘lamu mā bayna aydīhim wa mā khalfahum, wa lā yuḥīṭūna bi shay’im-min ‘ilmihī illā bi mā shā’, wasi‘a kursiyyuhus-samāwāti wal-arḍ, wa lā ya’ūduhū ḥifẓuhumā, wa Huwal-‘Aliyyul-‘Aẓīm.',
    translation: 'Allah! There is no deity worthy of worship except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    category: 'morning',
    targetCount: 1,
    virtue: 'Whoever recites this when he wakes in the morning is shielded and protected from the Jinn until evening.',
    hadithSource: 'Al-Hakim 1/562, Sahih at-Targhib 655',
    order: 2
  },
  {
    id: 'adhkar-morning-3',
    title: 'The Three Protective Surahs (Al-Mu‘awwidhat)',
    titleAr: 'المُعَوِّذَاتُ الثَّلَاثُ (الإخلاص، الفلق، الناس)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ... • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... • قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
    transliteration: 'Sūrat al-Ikhlāṣ, Sūrat al-Falaq, Sūrat an-Nās (3 times each)',
    translation: 'Say: He is Allah, the One... • Say: I seek refuge in the Lord of daybreak... • Say: I seek refuge in the Lord of mankind...',
    category: 'morning',
    targetCount: 3,
    virtue: 'Reciting them three times morning and evening suffices you against all harm and evil.',
    hadithSource: 'Sunan Abi Dawud 5082, Sunan at-Tirmidhi 3575 (Hasan Sahih)',
    order: 3
  },
  {
    id: 'adhkar-morning-4',
    title: 'Asbahna wa Asbahal-Mulk',
    titleAr: 'أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.',
    transliteration: 'Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa ‘alā kulli shay’in Qadīr. Rabbi as’aluka khayra mā fī hādhal-yawmi wa khayra mā ba‘dah, wa a‘ūdhu bika min sharri mā fī hādhal-yawmi wa sharri mā ba‘dah, Rabbi a‘ūdhu bika minal-kasali wa sū’il-kibar, Rabbi a‘ūdhu bika min ‘adhābin fin-nāri wa ‘adhābin fil-qabr.',
    translation: 'We have entered the morning and the entire Dominion belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, with no partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things Omnipotent. My Lord, I ask You for the good of this day and the good of what comes after it, and I seek refuge in You from the evil of this day and the evil of what comes after it. My Lord, I seek refuge in You from laziness and the hardships of old age. My Lord, I seek refuge in You from torment in the Fire and torment in the Grave.',
    category: 'morning',
    targetCount: 1,
    virtue: 'Comprehensive prophetic invocation affirming Allah’s sovereignty and seeking preservation from spiritual lethargy and torment.',
    hadithSource: 'Sahih Muslim 2723',
    order: 4
  },
  {
    id: 'adhkar-morning-5',
    title: 'Bismillahil-ladhi la yadurru',
    titleAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.',
    transliteration: 'Bismillāhil-ladhī lā yaḍurru ma‘as-mihī shay’un fil-arḍi wa lā fis-samā’i wa Huwas-Samī‘ul-‘Alīm.',
    translation: 'In the Name of Allah, with Whose Name nothing can cause harm in the earth nor in the heaven, and He is the All-Hearing, the All-Knowing.',
    category: 'morning',
    targetCount: 3,
    virtue: 'Whoever recites it three times in the morning will not be harmed by any sudden calamity or affliction until evening.',
    hadithSource: 'Sunan Abi Dawud 5088, Sunan at-Tirmidhi 3388',
    order: 5
  },
  {
    id: 'adhkar-morning-6',
    title: 'Raditu Billahi Rabba',
    titleAr: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلَامِ دِينًا',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.',
    transliteration: 'Raḍītu billāhi Rabban, wa bil-Islāmi dīnan, wa bi Muḥammadin (ṣallAllāhu ‘alayhi wa sallam) Nabiyyā.',
    translation: 'I am content with Allah as my Lord, with Islam as my religion, and with Muhammad (peace and blessings be upon him) as my Prophet.',
    category: 'morning',
    targetCount: 3,
    virtue: 'Allah takes it upon Himself to make whoever says this three times pleased on the Day of Resurrection.',
    hadithSource: 'Sunan Abi Dawud 5072, Sunan at-Tirmidhi 3389',
    order: 6
  },
  {
    id: 'adhkar-morning-7',
    title: 'HasbiyAllahu la ilaha illa Huwa',
    titleAr: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ العَرْشِ العَظِيمِ.',
    transliteration: 'ḤasbiyAllāhu lā ilāha illā Huwa ‘alayhi tawakkaltu wa Huwa Rabbul-‘Arshil-‘Aẓīm.',
    translation: 'Allah is sufficient for me; there is no deity worthy of worship except Him. Upon Him I rely, and He is the Lord of the Mighty Throne.',
    category: 'morning',
    targetCount: 7,
    virtue: 'Whoever recites this seven times in the morning and evening, Allah will suffice him for all that concerns him of worldly and spiritual affairs.',
    hadithSource: 'Sunan Abi Dawud 5081',
    order: 7
  },
  {
    id: 'adhkar-morning-8',
    title: 'SubhanAllahi wa bihamdih, adada khalqih (The Great Tasbih)',
    titleAr: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
    transliteration: 'SubḥānAllāhi wa biḥamdih: ‘adada khalqih, wa riḍā nafsih, wa zinata ‘arshih, wa midāda kalimātih.',
    translation: 'Glory be to Allah and praise be to Him: according to the number of His creation, according to the pleasure of Himself, according to the weight of His Throne, and according to the ink of His words.',
    category: 'morning',
    targetCount: 3,
    virtue: 'Reciting this 3 times outweighs hours of continuous remembrance from morning till noon in weight and reward.',
    hadithSource: 'Sahih Muslim 2726',
    order: 8
  },
  {
    id: 'adhkar-morning-9',
    title: 'SubhanAllahi wa bihamdih (100x Daily Foundation)',
    titleAr: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ (١٠٠ مَرَّة)',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ.',
    transliteration: 'SubḥānAllāhi wa biḥamdih (100 times)',
    translation: 'Glory be to Allah and His is all praise.',
    category: 'morning',
    targetCount: 100,
    virtue: 'Whoever says it 100 times in the morning and evening, no one will come on the Day of Resurrection with anything better except someone who said the same or more.',
    hadithSource: 'Sahih Muslim 2692',
    order: 9
  },

  // ==========================================
  // 2. EVENING ADHKAR (أذكار المساء)
  // ==========================================
  {
    id: 'adhkar-evening-1',
    title: 'Sayyid al-Istighfār (Evening)',
    titleAr: 'سَيِّدُ الاسْتِغْفَارِ (المَسَاء)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي؛ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    transliteration: 'Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa anā ‘abduka, wa anā ‘alā ‘ahdika wa wa‘dika mastata‘tu, a‘ūdhu bika min sharri mā ṣana‘tu, abū’u laka bi ni‘matika ‘alayya, wa abū’u laka bi dhanbī, faghfir lī, fa innahū lā yaghfiru-dh-dhunūba illā Ant.',
    translation: 'O Allah, You are my Lord, there is no deity worthy of worship except You. You created me and I am Your servant, and I uphold Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I confess my sins to You; forgive me, for none forgives sins except You.',
    category: 'evening',
    targetCount: 1,
    virtue: 'Whoever recites it in the evening with certainty and dies that night before morning will enter Paradise.',
    hadithSource: 'Sahih al-Bukhari 6306',
    order: 1
  },
  {
    id: 'adhkar-evening-2',
    title: 'Amsayna wa Amsal-Mulk',
    titleAr: 'أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ',
    arabic: 'أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.',
    transliteration: 'Amsaynā wa amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa ‘alā kulli shay’in Qadīr. Rabbi as’aluka khayra mā fī hādhihil-laylati wa khayra mā ba‘dahā, wa a‘ūdhu bika min sharri mā fī hādhihil-laylati wa sharri mā ba‘dahā...',
    translation: 'We have entered the evening and the entire Kingdom belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, with no partner. To Him belongs the dominion and praise, and He is Omnipotent over all things...',
    category: 'evening',
    targetCount: 1,
    virtue: 'Evening consecration placing the coming night and its trials under divine safety and sanctuary.',
    hadithSource: 'Sahih Muslim 2723',
    order: 2
  },
  {
    id: 'adhkar-evening-3',
    title: 'A‘udhu bi kalimatillahit-Tammati min sharri ma khalaq',
    titleAr: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    transliteration: 'A‘ūdhu bi kalimātillāhit-tāmmāti min sharri mā khalaq.',
    translation: 'I seek refuge in the Perfect Words of Allah from the evil of what He has created.',
    category: 'evening',
    targetCount: 3,
    virtue: 'Whoever recites it 3 times in the evening will not be harmed by any venomous bite, sting, or evil that night.',
    hadithSource: 'Sahih Muslim 2709, Sunan at-Tirmidhi 3604',
    order: 3
  },
  {
    id: 'adhkar-evening-4',
    title: 'Bismillahil-ladhi la yadurru (Evening)',
    titleAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ (المَسَاء)',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.',
    transliteration: 'Bismillāhil-ladhī lā yaḍurru ma‘as-mihī shay’un fil-arḍi wa lā fis-samā’i wa Huwas-Samī‘ul-‘Alīm.',
    translation: 'In the Name of Allah, with Whose Name nothing can cause harm in the earth nor in the heaven, and He is the All-Hearing, the All-Knowing.',
    category: 'evening',
    targetCount: 3,
    virtue: 'Invokes impenetrable divine immunity against sudden afflictions from dusk until dawn.',
    hadithSource: 'Sunan Abi Dawud 5088',
    order: 4
  },
  {
    id: 'adhkar-evening-5',
    title: 'The Three Protective Surahs (Evening)',
    titleAr: 'المُعَوِّذَاتُ الثَّلَاثُ (المَسَاء)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ... • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... • قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
    transliteration: 'Sūrat al-Ikhlāṣ, Sūrat al-Falaq, Sūrat an-Nās (3 times each)',
    translation: 'Recitation of Surah Al-Ikhlas, Al-Falaq, and An-Nas three times before the darkness of night.',
    category: 'evening',
    targetCount: 3,
    virtue: 'Suffices the believer against all harms, evil eye, whispers, and nocturnal hostility.',
    hadithSource: 'Sunan Abi Dawud 5082',
    order: 5
  },

  // ==========================================
  // 3. POST-SALAH ADHKAR (أذكار بعد الصلوات)
  // ==========================================
  {
    id: 'adhkar-postsalah-1',
    title: 'Post-Prayer Istighfār & As-Salām',
    titleAr: 'الاسْتِغْفَارُ وَدُعَاءُ السَّلَامِ عَقِبَ الصَّلَاةِ',
    arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الجَلَالِ وَالإِكْرَامِ.',
    transliteration: 'Astaghfirullāh, Astaghfirullāh, Astaghfirullāh. Allāhumma Antas-Salāmu wa minkas-Salām, tabārakta yā Dhal-Jalāli wal-Ikrām.',
    translation: 'I ask Allah for forgiveness (3 times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.',
    category: 'postSalah',
    prayerTarget: 'all',
    targetCount: 3,
    virtue: 'The first Sunnah recited immediately upon completing the Taslim of every obligatory prayer.',
    hadithSource: 'Sahih Muslim 591',
    order: 1
  },
  {
    id: 'adhkar-postsalah-2',
    title: 'At-Tahlīl & La Mani‘a lima a‘tayt',
    titleAr: 'التَّهْلِيلُ: لَا مَانِعَ لِمَا أَعْطَيْتَ',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الجَدِّ مِنْكَ الجَدُّ.',
    transliteration: 'Lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa ‘alā kulli shay’in Qadīr. Allāhumma lā māni‘a limā a‘ṭayta, wa lā mu‘ṭiya limā mana‘ta, wa lā yanfa‘u dhal-jaddi minkal-jadd.',
    translation: 'None has the right to be worshipped except Allah alone, with no partner. To Him belongs all kingdom and praise, and He is Omnipotent. O Allah, none can withhold what You grant, none can grant what You withhold, and no fortune can benefit its owner against You.',
    category: 'postSalah',
    prayerTarget: 'all',
    targetCount: 1,
    virtue: 'Affirms absolute divine predetermination and sovereignty after each prayer.',
    hadithSource: 'Sahih al-Bukhari 844, Sahih Muslim 593',
    order: 2
  },
  {
    id: 'adhkar-postsalah-3',
    title: 'Ayat al-Kursi After Every Obligatory Prayer',
    titleAr: 'آيَةُ الكُرْسِيِّ دُبُرَ كُلِّ صَلَاةٍ مَكْتُوبَةٍ',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm...',
    translation: 'Recitation of the greatest verse in the Quran following the completion of each Fardh prayer.',
    category: 'postSalah',
    prayerTarget: 'all',
    targetCount: 1,
    virtue: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.',
    hadithSource: 'An-Nasa’i As-Sunan al-Kubra 9848, Sahih al-Jami‘ 6464 (Sahih)',
    order: 3
  },
  {
    id: 'adhkar-postsalah-4',
    title: 'Standard Sunnah Tasbīḥ (33x SubhanAllah, 33x Alhamdulillah, 33x Allahu Akbar + 1x Tahlil)',
    titleAr: 'التَّسْبِيحُ الكَامِلُ (٣٣-٣٣-٣٣-١)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣) • الحَمْدُ لِلَّهِ (٣٣) • اللَّهُ أَكْبَرُ (٣٣) • لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
    transliteration: 'SubḥānAllāh (33x), Alḥamdulillāh (33x), Allāhu Akbar (33x) + Lā ilāha illAllāhu waḥdahū lā sharīka lah...',
    translation: 'Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (33), completed with the testimony of Tawhid to make 100.',
    category: 'postSalah',
    prayerTarget: 'all',
    targetCount: 100,
    virtue: 'Whoever recites this after every prayer, his sins will be forgiven even if they were like the foam of the sea.',
    hadithSource: 'Sahih Muslim 597',
    order: 4
  },
  {
    id: 'adhkar-postsalah-5',
    title: 'Special 10x Dhikr After Fajr & Maghrib',
    titleAr: 'ذِكْرُ الفَجْرِ وَالمَغْرِبِ المَخْصُوصُ (١٠ مَرَّاتٍ قَبْلَ الكَلَامِ)',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
    transliteration: 'Lā ilāha illAllāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu, yuḥyī wa yumītu, wa Huwa ‘alā kulli shay’in Qadīr (10 times).',
    translation: 'None has the right to be worshipped except Allah alone with no partner. To Him belongs the dominion and praise, He gives life and causes death, and He is Omnipotent.',
    category: 'postSalah',
    prayerTarget: 'fajr',
    targetCount: 10,
    virtue: 'Whoever says it 10 times while sitting in place before speaking after Fajr and Maghrib receives 10 good deeds, 10 sins erased, 10 ranks elevated, and safety from Satan all day.',
    hadithSource: 'Sunan at-Tirmidhi 3474, Sahih at-Targhib 472 (Hasan)',
    order: 5
  },
  {
    id: 'adhkar-postsalah-6',
    title: 'Fajr Post-Salah Supplication for Beneficial Knowledge',
    titleAr: 'دُعَاءُ الفَجْرِ: عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.',
    transliteration: 'Allāhumma innī as’aluka ‘ilman nāfi‘an, wa rizqan ṭayyiban, wa ‘amalan mutaqabbalā.',
    translation: 'O Allah, I ask You for knowledge that is beneficial, provision that is pure and good, and deeds that are accepted.',
    category: 'postSalah',
    prayerTarget: 'fajr',
    targetCount: 1,
    virtue: 'Prophetic morning invocation recited immediately after the Fajr prayer greeting.',
    hadithSource: 'Sunan Ibn Majah 925, Sahih',
    order: 6
  },
  {
    id: 'adhkar-postsalah-7',
    title: 'Al-Mu‘awwidhat After Every Obligatory Prayer',
    titleAr: 'المُعَوِّذَاتُ دُبُرَ كُلِّ صَلَاةٍ',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ • قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Surah Al-Ikhlas, Al-Falaq, and An-Nas (1x after Dhuhr, Asr, Isha; 3x after Fajr & Maghrib)',
    translation: 'Recitation of the three purifying and protective chapters after finishing each prayer.',
    category: 'postSalah',
    prayerTarget: 'all',
    targetCount: 1,
    virtue: 'The Messenger of Allah ﷺ commanded Uqbah ibn ‘Amir to recite the Mu‘awwidhat after every prayer.',
    hadithSource: 'Sunan Abi Dawud 1523, Sunan at-Tirmidhi 2903',
    order: 7
  },

  // ==========================================
  // 4. NOON SLEEP / QAYLULAH ADHKAR (أذكار نوم القيلولة والظهيرة)
  // ==========================================
  {
    id: 'adhkar-sleep-dhohr-1',
    title: 'Surrender in Sleep (Bismika Allāhumma Amūtu wa Aḥyā)',
    titleAr: 'تَسْلِيمُ النَّفْسِ عِنْدَ القَيْلُولَةِ: بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
    transliteration: 'Bismika Allāhumma amūtu wa aḥyā.',
    translation: 'In Your Name, O Allah, I die and I live.',
    category: 'sleep_dhohr',
    targetCount: 1,
    virtue: 'The standard Sunnah upon laying down for midday sleep (Qaylūlah) to sanctify the rest.',
    hadithSource: 'Sahih al-Bukhari 6312, Sahih Muslim 2711',
    order: 1
  },
  {
    id: 'adhkar-sleep-dhohr-2',
    title: 'Resting upon the Right Side (Bismika Rabbī Waḍa‘tu Janbī)',
    titleAr: 'الاضْطِجَاعُ عَلَى الشِّقِّ الأَيْمَنِ: بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
    transliteration: 'Bismika Rabbī waḍa‘tu janbī wa bika arfa‘uh, in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī ‘ibādakaṣ-ṣāliḥīn.',
    translation: 'In Your Name, my Lord, I lay down my side and by You I raise it up. If You hold my soul, have mercy upon it; and if You release it, protect it as You protect Your righteous servants.',
    category: 'sleep_dhohr',
    targetCount: 1,
    virtue: 'Authentic protection over the spirit and physical rest during afternoon sleep.',
    hadithSource: 'Sahih al-Bukhari 6320, Sahih Muslim 2714',
    order: 2
  },
  {
    id: 'adhkar-sleep-dhohr-3',
    title: 'Āyat al-Kursī for Midday Nap (Surah Al-Baqarah 2:255)',
    titleAr: 'آيَةُ الكُرْسِيِّ حِرْزُ القَيْلُولَةِ',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta’khuḏhuhū sinatuw-wa lā nawm...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...',
    category: 'sleep_dhohr',
    targetCount: 1,
    virtue: 'Guarantees that a guardian angel from Allah protects you and no devil comes near you until you awake.',
    hadithSource: 'Sahih al-Bukhari 2311',
    order: 3
  },
  {
    id: 'adhkar-sleep-dhohr-4',
    title: 'Awakening from Qaylūlah Supplication',
    titleAr: 'دُعَاءُ الاسْتِيقَاظِ مِنَ القَيْلُولَةِ لِصَلَاةِ العَصْرِ',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.',
    transliteration: 'Al-ḥamdu lillāhillaḏhī aḥyānā ba‘da mā amātanā wa ilayhin-nushūr.',
    translation: 'All praise is for Allah Who gave us life after He caused us to die, and unto Him is the resurrection.',
    category: 'sleep_dhohr',
    targetCount: 1,
    virtue: 'Revives the spiritual consciousness upon awakening, readying the believer for the ‘Asr prayer and afternoon vigor.',
    hadithSource: 'Sahih al-Bukhari 6312',
    order: 4
  },

  // ==========================================
  // 5. NIGHT BEDTIME FORTRESS ADHKAR (أذكار نوم الليل وحصن المسلم)
  // ==========================================
  {
    id: 'adhkar-sleep-night-1',
    title: 'The 3 Protective Surahs (Mu‘awwiḏhāt x3 with Nafth into Hands)',
    titleAr: 'المُعَوِّذَاتُ الثَّلَاثُ مَعَ النَّفْثِ وَالمَسْحِ (٣ مَرَّاتٍ)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ: قُلْ هُوَ اللَّهُ أَحَدٌ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ... (يَنْفُثُ فِي كَفَّيْهِ وَيَمْسَحُ جَسَدَهُ ٣ مَرَّاتٍ).',
    transliteration: 'Recite Surah Al-Ikhlāṣ, Surah Al-Falaq, and Surah An-Nās, blowing into cupped hands and wiping over the body 3 times starting with head and face.',
    translation: 'The nightly prophetic sunnah of cupping hands, lightly blowing into them with recitations of the 3 Quls, then wiping as much of the body as possible (3 times).',
    category: 'sleep_night',
    targetCount: 3,
    virtue: 'A complete nocturnal shield against spiritual harms, night terrors, envy, and evil spirits.',
    hadithSource: 'Sahih al-Bukhari 5017, Sahih Muslim 2192',
    order: 1
  },
  {
    id: 'adhkar-sleep-night-2',
    title: 'Āyat al-Kursī (Nocturnal Divine Protector - 2:255)',
    titleAr: 'آيَةُ الكُرْسِيِّ حَارِسُ اللَّيْلِ الأَعْظَم',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...',
    transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm...',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...',
    category: 'sleep_night',
    targetCount: 1,
    virtue: 'Whoever recites it when going to bed, a protector from Allah remains with him, and no devil can approach him until morning.',
    hadithSource: 'Sahih al-Bukhari 2311',
    order: 2
  },
  {
    id: 'adhkar-sleep-night-3',
    title: 'Last Two Verses of Surah Al-Baqarah (2:285-286)',
    titleAr: 'خَوَاتِيمُ سُورَةِ البَقَرَةِ (٢٨٥ - ٢٨٦): كَفَتَاهُ',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ...',
    transliteration: 'Āmanar-Rasūlu bimā unzila ilayhi mir-Rabbihī wal-mu’minūn...',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and so have the believers...',
    category: 'sleep_night',
    targetCount: 1,
    virtue: 'The Prophet ﷺ said: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him (against every evil and night calamity)."',
    hadithSource: 'Sahih al-Bukhari 5009, Sahih Muslim 807',
    order: 3
  },
  {
    id: 'adhkar-sleep-night-4',
    title: 'Tasbīḥ Fāṭimah (Bedtime Strength: 33-33-34)',
    titleAr: 'تَسْبِيحُ فَاطِمَةَ الزَّهْرَاءِ (٣٣ - ٣٣ - ٣٤)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣) • الحَمْدُ لِلَّهِ (٣٣) • اللَّهُ أَكْبَرُ (٣٤).',
    transliteration: 'SubḥānAllāh (33 times), Alḥamdulillāh (33 times), Allāhu Akbar (34 times)',
    translation: 'Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (34).',
    category: 'sleep_night',
    targetCount: 100,
    virtue: 'The Prophet ﷺ taught this to ‘Ali and Fatimah, declaring it better for them than a servant for physical and mental energy.',
    hadithSource: 'Sahih al-Bukhari 3705, Sahih Muslim 2727',
    order: 4
  },
  {
    id: 'adhkar-sleep-night-5',
    title: 'Du‘a al-Fiṭrah (The Grand Bedtime Covenant)',
    titleAr: 'دُعَاءُ الفِطْرَةِ عِنْدَ النَّوْمِ: اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ',
    arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.',
    transliteration: 'Allāhumma aslamtu nafsī ilayk, wa fawwaḍtu amrī ilayk, wa wajjahtu wajhī ilayk, wa alja’tu ẓahrī ilayk, raghbatan wa rahbatan ilayk, lā malja’a wa lā manjā minka illā ilayk, āmantu bi Kitābikal-ladhī anzalt, wa bi Nabiyyikal-ladhī arsalt.',
    translation: 'O Allah, I have surrendered myself to You, entrusted my affairs to You, turned my face towards You, and leaned my back against You in desire and awe of You. There is no sanctuary or escape from You except to You. I believe in Your Book which You revealed, and in Your Prophet whom You sent.',
    category: 'sleep_night',
    targetCount: 1,
    virtue: 'The Prophet ﷺ commanded Al-Bara’ ibn ‘Azib: "Make this your very last utterance before sleep; if you die that night, you die upon the pure primordial faith (Fiṭrah)."',
    hadithSource: 'Sahih al-Bukhari 247, Sahih Muslim 2710',
    order: 5
  },
  {
    id: 'adhkar-sleep-night-6',
    title: 'Refuge from the Day of Resurrection (x3)',
    titleAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ (٣ مَرَّاتٍ)',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
    transliteration: 'Allāhumma qinī ‘adhābaka yawma tab‘athu ‘ibādak (3 times with right hand under cheek).',
    translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
    category: 'sleep_night',
    targetCount: 3,
    virtue: 'Recited 3 times whenever the Prophet ﷺ lay down to sleep upon his right cheek.',
    hadithSource: 'Sunan Abi Dawud 5045, Jami‘ at-Tirmidhi 3398',
    order: 6
  },
  {
    id: 'adhkar-sleep-night-7',
    title: 'Surah Al-Mulk (The Savior from Grave Torment)',
    titleAr: 'سُورَةُ المُلْكِ (المَانِعَةُ المُنْجِيَةُ مِنْ عَذَابِ القَبْرِ)',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ...',
    transliteration: 'Tabārakal-ladhī biyadihil-mulku wa Huwa ‘alā kulli shay’in Qadīr...',
    translation: 'Blessed is He in Whose hand is dominion, and He is over all things competent...',
    category: 'sleep_night',
    targetCount: 1,
    virtue: 'Thirty verses that intercede for their reciter until forgiven, protecting him from the trials of the grave.',
    hadithSource: 'Jami‘ at-Tirmidhi 2891, Sahih al-Jami‘ 3643',
    order: 7
  },

  // ==========================================
  // 5. GENERAL & ISTIGHFAR (أذكار عامة)
  // ==========================================
  {
    id: 'adhkar-general-1',
    title: 'Daily 100x Astaghfirullah',
    titleAr: 'الاسْتِغْفَارُ اليَوْمِيُّ (١٠٠ مَرَّة)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.',
    transliteration: 'Astaghfirullāha wa atūbu ilayh (100 times)',
    translation: 'I seek the forgiveness of Allah and I repent to Him.',
    category: 'general',
    targetCount: 100,
    virtue: 'The Messenger of Allah ﷺ said: "By Allah, I seek forgiveness of Allah and repent to Him more than seventy times a day."',
    hadithSource: 'Sahih al-Bukhari 6307, Sahih Muslim 2702',
    order: 1
  },
  {
    id: 'adhkar-general-2',
    title: 'La hawla wa la quwwata illa billah',
    titleAr: 'الحَوْقَلَةُ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ العَلِيِّ العَظِيمِ.',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāhil-‘Aliyyil-‘Aẓīm.',
    translation: 'There is no power and no might except with Allah, the Most High, the Most Great.',
    category: 'general',
    targetCount: 100,
    virtue: 'One of the precious treasures from beneath the Throne of Allah in Paradise.',
    hadithSource: 'Sahih al-Bukhari 4205, Sahih Muslim 2704',
    order: 2
  },
  {
    id: 'adhkar-general-3',
    title: 'SubhanAllahi wa bihamdihi SubhanAllahil-‘Adheem',
    titleAr: 'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ.',
    transliteration: 'SubḥānAllāhi wa biḥamdih, SubḥānAllāhil-‘Aẓīm.',
    translation: 'Glory be to Allah and His is the praise; Glory be to Allah the Supreme.',
    category: 'general',
    targetCount: 100,
    virtue: 'Two words that are beloved to the Most Merciful, light on the tongue, and heavy on the Scale of good deeds.',
    hadithSource: 'Sahih al-Bukhari 6406, Sahih Muslim 2694',
    order: 3
  }
];
