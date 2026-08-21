import { POSState, PowerSeal, ShopItem, SpiritualDailyLog } from './types';
import { DEFAULT_PLANNING_DOCS } from './defaultPlanningDocs';

export const createDefaultSpiritualLog = (date: string): SpiritualDailyLog => ({
  date,
  fajr: { fardh: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  dhuhr: { fardh: false, inMasjid: false, sunnahRawatib: false, sunnahBefore: false, sunnahAfter: false, completedAt: null },
  asr: { fardh: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  maghrib: { fardh: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  isha: { fardh: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
  adhkarSabah: false,
  adhkarMasa: false,
  salawatCount: 0,
  salawatCompleted: false,
  qiyamRakats: 0,
  qiyamWitr: false,
  qiyamCompleted: false,
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

export const DEFAULT_SEALS: PowerSeal[] = [
  {
    id: 'seal-slothful-chains',
    name: 'Slothful Iron Ore & Chains',
    description: 'An unrefined chunk of magnetic iron ore bound tightly by heavy rusted chains. Shattering the chains awakens baseline operator momentum.',
    rarity: 'Common',
    status: 'Locked',
    requiredLevel: 1,
    costXP: 100,
    buffName: 'Unchained Inertia',
    buffDescription: '+10% XP gain on all completed directives and +5 base momentum floor.',
    xpBonusMultiplier: 1.10,
    momentumBoost: 5,
    attributeBoosts: [{ attributeId: 'a-5', boostAmount: 1 }],
    runeSymbol: '⛓️',
    colorTheme: 'cyan',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-limiting-mind',
    name: 'Cobalt Focus Ore & Chains',
    description: 'A heavy luminescent cobalt ore core wrapped in reinforced steel chains that restrict focus depth. Unchaining it unlocks deep cognitive endurance.',
    rarity: 'Rare',
    status: 'Locked',
    requiredLevel: 3,
    costXP: 300,
    buffName: 'Clarity Matrix',
    buffDescription: '+15% XP on Main Directives and +2 Focus attribute level boost.',
    xpBonusMultiplier: 1.15,
    attributeBoosts: [{ attributeId: 'a-4', boostAmount: 2 }],
    runeSymbol: '🪨',
    colorTheme: 'purple',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-astral-surge',
    name: 'Mithril Surge Ore & Chains',
    description: 'A luminous piece of raw mithril ore encased in silver-etched chains. Shattering the chains triggers high-frequency neural overclocking.',
    rarity: 'Epic',
    status: 'Locked',
    requiredLevel: 5,
    costXP: 650,
    buffName: 'Overclocked Neural Nexus',
    buffDescription: '+20% XP multiplier on all directives, +3 Agility, and -25% penalty impact.',
    xpBonusMultiplier: 1.20,
    attributeBoosts: [{ attributeId: 'a-3', boostAmount: 3 }],
    runeSymbol: '💎',
    colorTheme: 'emerald',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-apex-sovereign',
    name: 'Auric Sovereign Ore & Chains',
    description: 'A radiant golden adamantine ore vein bound under heavy forged gold chains. Unshackling its chains asserts supreme command over operations.',
    rarity: 'Legendary',
    status: 'Locked',
    requiredLevel: 8,
    costXP: 1200,
    buffName: 'Sovereign Command',
    buffDescription: '+30% XP boost across all categories and +4 Wisdom & Strength boost.',
    xpBonusMultiplier: 1.30,
    attributeBoosts: [
      { attributeId: 'a-1', boostAmount: 4 },
      { attributeId: 'a-7', boostAmount: 4 }
    ],
    runeSymbol: '🪙',
    colorTheme: 'amber',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-void-overlord',
    name: 'Obsidian Void Ore & Chains',
    description: 'A primordial obsidian ore chunk pulsing with void energy, locked in spiked netherite chains. Unchaining it unleashes ultimate cosmic power.',
    rarity: 'Divine',
    status: 'Locked',
    requiredLevel: 12,
    costXP: 2500,
    buffName: 'Void Transcendence',
    buffDescription: '+50% total XP multiplier, +5 to All Attributes, and permanent immunity to recovery debuffs.',
    xpBonusMultiplier: 1.50,
    attributeBoosts: [
      { attributeId: 'a-1', boostAmount: 5 },
      { attributeId: 'a-2', boostAmount: 5 },
      { attributeId: 'a-3', boostAmount: 5 },
      { attributeId: 'a-4', boostAmount: 5 },
      { attributeId: 'a-5', boostAmount: 5 },
      { attributeId: 'a-6', boostAmount: 5 },
      { attributeId: 'a-7', boostAmount: 5 }
    ],
    runeSymbol: '🌋',
    colorTheme: 'rose',
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
  seals: DEFAULT_SEALS,
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
  spiritualLogs: {}
};
