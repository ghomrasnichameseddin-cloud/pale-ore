import { POSState, PowerSeal } from './types';
import { DEFAULT_PLANNING_DOCS } from './defaultPlanningDocs';

export const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_SEALS: PowerSeal[] = [
  {
    id: 'seal-slothful-chains',
    name: 'Seal of Slothful Chains',
    description: 'An ancient cognitive inhibitor that induces inertia and task hesitation. Shattering this seal awakens baseline operator momentum.',
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
    name: 'Seal of Limiting Will',
    description: 'A mental barrier restricting focus depth and cognitive endurance during prolonged operations.',
    rarity: 'Rare',
    status: 'Locked',
    requiredLevel: 3,
    costXP: 300,
    buffName: 'Clarity Matrix',
    buffDescription: '+15% XP on Main Directives and +2 Focus attribute level boost.',
    xpBonusMultiplier: 1.15,
    attributeBoosts: [{ attributeId: 'a-4', boostAmount: 2 }],
    runeSymbol: '🔮',
    colorTheme: 'purple',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-astral-surge',
    name: 'Seal of Astral Surge',
    description: 'A dense energy lock constricting high-frequency execution and tactical overclocking capabilities.',
    rarity: 'Epic',
    status: 'Locked',
    requiredLevel: 5,
    costXP: 650,
    buffName: 'Overclocked Neural Nexus',
    buffDescription: '+20% XP multiplier on all directives, +3 Agility, and -25% penalty impact.',
    xpBonusMultiplier: 1.20,
    attributeBoosts: [{ attributeId: 'a-3', boostAmount: 3 }],
    runeSymbol: '⚡',
    colorTheme: 'emerald',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-apex-sovereign',
    name: 'Seal of Apex Sovereign',
    description: 'The royal seal of command. Unlocking this seal asserts complete dominance over multi-track operational loads.',
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
    runeSymbol: '👑',
    colorTheme: 'amber',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seal-void-overlord',
    name: 'Seal of Void Overlord',
    description: 'A primordial forbidden seal containing unbridled cosmic execution power.',
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
    runeSymbol: '🐉',
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
  profile: {
    level: 1,
    xp: 0,
    momentum: 50,
    recoveryMode: false,
    currentFocus: '',
    focusGoalId: null,
    currentBossQuestId: null,
    focusMinutesToday: 0,
    focusStreak: 0,
    lastFocusDate: '',
    jobId: 'job-cyber-architect',
    equippedTitleId: 'title-novice-operator'
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
  ]
};
