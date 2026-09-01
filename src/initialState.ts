import { POSState, ShopItem, SpiritualDailyLog } from './types';
import { DEFAULT_PLANNING_DOCS } from './defaultPlanningDocs';
import { DEFAULT_ADHKAR_LIST } from './data/defaultAdhkar';

export const createDefaultSpiritualLog = (date: string): SpiritualDailyLog => ({
  date,
  fajr: { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  dhuhr: { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, sunnahBefore: false, sunnahAfter: false, completedAt: null },
  asr: { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  maghrib: { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  isha: { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  adhkarSabah: false,
  adhkarMasa: false,
  adhkarSleepDhohr: false,
  adhkarSleepNight: false,
  salawatCount: 0,
  salawatCompleted: false,
  qiyamRakats: 0,
  qiyamWitr: false,
  qiyamCompleted: false,
  fasting: {
    isFasting: false,
    fastingType: undefined,
    suhurTaken: false,
    iftarCompleted: false,
    duaMadeAtIftar: false,
    notes: ''
  },
  sunnahPrayers: {
    duhaRakats: 0,
    tahiyyatAlMasjid: false,
    sunnatAlWudu: false,
    istikhara: false,
    tawbah: false,
    hajah: false,
    sujudShukrOrTilawah: false
  },
  quran: {
    pagesRead: 0,
    juzRead: undefined,
    surahName: '',
    surahNumber: undefined,
    ayahNumber: undefined,
    tadabburNotes: '',
    memorizationReviewed: false
  },
  dhikr: {
    tasbeehAfterSalah: false,
    istighfarCount: 0,
    tahlilCount: 0,
    hawqalaCount: 0
  },
  khushuRating: 8,
  totalEarnedXpToday: 0
});

export const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop-coffee-pass',
    name: 'Artisanal Coffee Pass',
    description: 'Redeem for 1 specialty coffee or matcha treat during a deep work session.',
    costCoins: 40,
    category: 'Real Life Reward',
    icon: '☕',
    effectType: 'INVENTORY',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-gaming-session',
    name: '1-Hour Gaming Pass',
    description: '1 hour of guilt-free video game time after completing your daily directives.',
    costCoins: 75,
    category: 'Real Life Reward',
    icon: '🎮',
    effectType: 'INVENTORY',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-cheat-meal',
    name: 'Gourmet Cheat Meal',
    description: 'Enjoy a favorite burger, pizza, or dessert treat with zero guilt.',
    costCoins: 150,
    category: 'Real Life Reward',
    icon: '🍕',
    effectType: 'INVENTORY',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-movie-night',
    name: 'Cinema & Movie Night',
    description: 'Watch a blockbuster movie or binge 2 episodes of your favorite show.',
    costCoins: 100,
    category: 'Real Life Reward',
    icon: '🍿',
    effectType: 'INVENTORY',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-book-pass',
    name: 'New Book / Audiobook Pass',
    description: 'Purchase a new book, audiobook, or learning course module.',
    costCoins: 200,
    category: 'Real Life Reward',
    icon: '📚',
    effectType: 'INVENTORY',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-focus-shield',
    name: 'Focus Shield',
    description: 'Protects 1 habit streak from breaking if a daily directive is missed.',
    costCoins: 60,
    category: 'System Perk',
    icon: '🛡️',
    effectType: 'PERK_FOCUS_SHIELD',
    value: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-momentum-elixir',
    name: 'Momentum Overcharge Elixir',
    description: 'Instantly adds +25 Momentum points to restore high-performance state.',
    costCoins: 50,
    category: 'System Perk',
    icon: '⚡',
    effectType: 'PERK_MOMENTUM_BOOST',
    value: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: 'shop-xp-surge',
    name: 'XP Surge Token',
    description: 'Grants +50 instant bonus XP into your operator level progression.',
    costCoins: 80,
    category: 'System Perk',
    icon: '✨',
    effectType: 'PERK_XP_SURGE',
    value: 50,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_STATE: POSState = {
  goals: [],
  projects: [],
  milestones: [],
  quests: [],
  folders: [],
  lists: [],
  skills: [],
  attributes: [
    { id: 'a-1', name: 'Strength', level: 1, progress: 0, description: 'Physical power and output, built through demanding workouts.' },
    { id: 'a-2', name: 'Endurance', level: 1, progress: 0, description: 'Physical stamina and mental consistency to repeat routines.' },
    { id: 'a-3', name: 'Agility', level: 1, progress: 0, description: 'Mental dexterity and quick skill-switching capability.' },
    { id: 'a-4', name: 'Focus', level: 1, progress: 0, description: 'Capacity to concentrate deeply on main quests without distraction.' },
    { id: 'a-5', name: 'Discipline', level: 1, progress: 0, description: 'Completing required habits and side quests consistently.' },
    { id: 'a-6', name: 'Knowledge', level: 1, progress: 0, description: 'Theoretical underpinnings in coding, languages, and core ideas.' },
    { id: 'a-7', name: 'Wisdom', level: 1, progress: 0, description: 'Applying skills to accomplish major long-term goals and milestones.' },
    { id: 'a-8', name: 'Social', level: 1, progress: 0, description: 'Collaboration, speaking, and teaching capacity.' },
    { id: 'a-9', name: 'Faith', level: 1, progress: 0, description: 'Spiritual alignment, reflection, and connection.' }
  ],
  shopItems: DEFAULT_SHOP_ITEMS,
  inventory: [],
  profile: {
    level: 1,
    xp: 0,
    coins: 150,
    momentum: 50,
    recoveryMode: false,
    currentFocus: '',
    focusGoalId: null,
    currentBossQuestId: null,
    focusMinutesToday: 0,
    focusStreak: 0,
    lastFocusDate: '',
    jobId: 'job-cyber-architect',
    equippedTitleId: 'title-novice-operator',
    focusShields: 0
  },
  xpHistory: [],
  systemDate: getLocalDateString(),
  planningDocuments: DEFAULT_PLANNING_DOCS,
  customJobs: [],
  customTitles: [],
  deletedJobIds: [],
  deletedTitleIds: [],
  messages: [
    {
      id: 'msg-sys-init',
      sender: 'SYSTEM',
      category: 'alert',
      title: 'Progression Operating System Online',
      content: 'PALE ORE POS v2.6 active. Real-time synchronization and local storage pipeline active.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high'
    },
    {
      id: 'msg-pomo-ready',
      sender: 'FOCUS_BOT',
      category: 'note',
      title: 'Pomodoro Engine Calibrated',
      content: 'Engage 25m or custom focus intervals on directives to stack XP, build focus streaks, and elevate momentum.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium'
    }
  ],
  batterySettings: {
    batterySaverMode: true,
    autoEcoLowBattery: true,
    animationThrottle: 'Off',
    oledMode: false,
    maxFpsCap: 60
  },
  muhasabahEntries: [],
  weaknesses: [
    {
      id: 'weakness-scrolling',
      name: 'Uncontrolled Scrolling',
      category: 'Wasted Potential',
      description: 'Falling into passive endless feed loops on phone or browser when fatigued.',
      triggerCause: 'Fatigue & idle unstructured downtime late in evening',
      occurrenceCount: 2,
      lastOccurrenceDate: getLocalDateString(),
      status: 'Active',
      correctiveStrategy: 'Leave phone in another room after Isha and switch to physical book or dhikr.',
      createdAt: new Date().toISOString()
    }
  ],
  spiritualLogs: {},
  customAdhkar: DEFAULT_ADHKAR_LIST,
  adhkarRecitations: {},
  visualCodex: {
    theme: 'imperial-gold',
    ornamentation: 'standard',
    glow: 'standard',
    density: 'standard',
    reducedMotion: false
  }
};
