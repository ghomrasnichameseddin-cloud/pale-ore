import type { JobSpec, TitleSpec } from './jobsAndTitles';

export type GoalStatus = 'Active' | 'Paused' | 'Planned' | 'Completed' | 'Archived';
export type GoalPriority = 'Low' | 'Medium' | 'High';

export interface SubGoal {
  id: string;
  name: string;
  completed: boolean;
  targetDate?: string;
}

export interface SubProject {
  id: string;
  name: string;
  completed: boolean;
  description?: string;
  targetDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  horizon?: '30-Day Sprint' | 'Quarterly (Q1-Q4)' | 'Annual Vision' | 'Life Vision';
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  relatedSkills: string[]; // skill IDs
  estimatedCompletion: string;
  createdAt: string;
  subGoals?: SubGoal[];
}

export interface Project {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  status: 'Active' | 'Paused' | 'Planned' | 'Completed' | 'Archived';
  estimatedTime: string;
  createdAt: string;
  subProjects?: SubProject[];
  archived?: boolean;
}

export interface SubQuest {
  id: string;
  name: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  goalId: string;
  name: string;
  status: 'Active' | 'Completed';
  createdAt: string;
}

export interface QuestFolder {
  id: string;
  name: string;
  description?: string;
  color?: string; // hex or tailwind color class
  createdAt: string;
  archived?: boolean;
  archivedAt?: string | null;
}

export interface QuestList {
  id: string;
  folderId: string | null; // Belongs to a folder, or null (standalone)
  name: string;
  description?: string;
  createdAt: string;
  archived?: boolean;
  archivedAt?: string | null;
}

export type QuestDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Boss' | 'Custom';
export type QuestType = 'Main' | 'Side' | 'Boss' | 'Optional' | 'Habit' | 'Recovery' | 'Milestone' | 'Penalty' | string;
export type QuestRecurrence = 'None' | 'Daily' | 'Every 2 Days' | 'Weekly' | 'Monthly' | string;

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: QuestDifficulty;
  estimatedTime: number; // in minutes
  xp: number;
  goalId: string | null;
  projectId: string | null;
  milestoneId: string | null;
  listId?: string | null; // Belongs to a QuestList, or null
  relatedSkills: string[]; // skill IDs
  type: QuestType;
  recurrence?: QuestRecurrence;
  streakCount?: number;
  bestStreak?: number;
  lastCompletedDate?: string | null;
  cueTrigger?: string;
  rewardPerk?: string;
  status: 'Active' | 'Completed' | 'Failed';
  deadline: string | null; // YYYY-MM-DD
  completedAt: string | null; // ISO Timestamp when completed
  createdAt: string;
  subquests?: SubQuest[];
  energyLevel?: 'Low' | 'Medium' | 'High';
  postponedFrom?: string | null;
  postponedTo?: string | null;
  archived?: boolean;
  archivedAt?: string | null;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  xp: number;
  mastery: number; // calculated, e.g. 0-100 or independent
  relatedGoals: string[]; // Goal IDs
  relatedProjects: string[]; // Project IDs
  equippedTitle?: string;
  iconName?: string;
  tier?: 'Primary' | 'Secondary';
  parentId?: string | null;
  createdAt?: string;
  archived?: boolean;
}

export interface Attribute {
  id: string;
  name: string;
  level: number;
  progress: number; // 0 to 100% to next level
  description: string;
  icon?: string;
  baseLevel?: number;
  earnedBonus?: number;
  sealBoost?: number;
  total?: number;
}

export interface UserProfile {
  level: number;
  xp: number;
  coins: number;
  momentum: number; // 0 to 100 based on recent completions
  recoveryMode: boolean;
  currentFocus: string;
  focusGoalId: string | null;
  currentBossQuestId: string | null;
  focusMinutesToday?: number;
  focusStreak?: number;
  lastFocusDate?: string;
  jobId?: string;
  equippedTitleId?: string;
  focusShields?: number; // count of streak protection shields
  jobLevels?: Record<string, number>; // mapping of jobId -> level (1-7)
  titleLevels?: Record<string, number>; // mapping of titleId -> level (1-7)
  fatigueLevel?: number; // 0 to 100
  lastFatigueUpdateDate?: string;
}

export interface XPHistoryEntry {
  id: string;
  questId: string | null;
  questName: string;
  xp: number;
  timestamp: string; // ISO String
  skillIds: string[];
}

export interface SystemMessage {
  id: string;
  sender: 'SYSTEM' | 'OPERATOR' | 'FOCUS_BOT' | 'PROGRESS_ENGINE';
  category: 'alert' | 'achievement' | 'log' | 'note' | 'warning';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface ActiveFocusSession {
  questId: string | null;
  questName: string;
  totalWorkTime: number; // in minutes
  totalRestTime: number;  // in minutes
  mode: 'work' | 'rest';
  status: 'running' | 'paused' | 'idle';
  timeLeft: number; // in seconds
  completedCycles: number;
  estimatedCycles: number;
  lastUpdated?: number; // timestamp in ms
  timeSpent?: number; // total time spent in this session in seconds
}

export interface PlanningDocument {
  id: string;
  path: string; // e.g. "00 Vision/Life Vision.md" or "04 Operations/Daily"
  name: string; // e.g. "Life Vision.md"
  content: string; // markdown content
  linkedGoals: string[]; // Goal IDs
  linkedProjects: string[]; // Project IDs
  linkedQuests: string[]; // Quest IDs
  linkedSkills: string[]; // Skill IDs
  updatedAt: string;
}

export type SealRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Divine' | 'Forbidden';
export type SealStatus = 'Locked' | 'Unsealing' | 'Broken';

export interface PowerSeal {
  id: string;
  name: string;
  description: string;
  rarity: SealRarity;
  status: SealStatus;
  brokenAt?: string | null;
  requiredLevel: number;
  requiredRank?: string;
  costXP: number;
  requiredQuestId?: string | null;
  requiredSkillId?: string | null;
  requiredSkillLevel?: number;
  requiredStreakDays?: number;
  buffName: string;
  buffDescription: string;
  xpBonusMultiplier?: number; // e.g. 1.15 (+15%)
  momentumBoost?: number;
  attributeBoosts?: { attributeId: string; boostAmount: number }[];
  unlockedFeatures?: string[];
  runeSymbol?: string;
  colorTheme?: string;
  createdAt: string;
}

export type ShopItemCategory = 'Real Life Reward' | 'System Perk' | 'Custom Personal';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  costCoins: number;
  category: ShopItemCategory;
  icon: string;
  effectType?: 'INVENTORY' | 'PERK_FOCUS_SHIELD' | 'PERK_MOMENTUM_BOOST' | 'PERK_XP_SURGE';
  value?: number; // e.g. amount of momentum or shield
  isCustom?: boolean;
  createdAt: string;
}

export interface RedeemedReward {
  id: string;
  itemId: string;
  itemName: string;
  costCoins: number;
  category: ShopItemCategory;
  icon: string;
  redeemedAt: string; // ISO date/time
  status: 'Available' | 'Used';
  usedAt?: string | null;
}

export interface BatterySettings {
  batterySaverMode: boolean; // Eco Defense toggle
  autoEcoLowBattery: boolean; // Auto-enable if battery < 20%
  animationThrottle: 'Full' | 'Reduced' | 'Off'; // Full 60fps, Reduced, Off
  oledMode: boolean; // Pure #000 pitch black canvas for low screen power draw
  maxFpsCap: number; // 60, 30, 15
}

export type MuhasabahCategory = 
  | 'Obligations' 
  | 'Desires' 
  | 'Speech' 
  | 'Heart' 
  | 'Rights' 
  | 'Wasted Potential';

export type MuhasabahSeverity = 
  | 'Minor'      // -100 XP
  | 'Moderate'   // -200 XP
  | 'Major'      // -300 XP
  | 'Severe'     // -400 XP
  | 'Critical';  // -500 XP

export interface MuhasabahEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  title: string;
  description: string;
  category: MuhasabahCategory;
  severity: MuhasabahSeverity;
  isExempt?: boolean; // True if due to legitimate excuse / lawful exemption (0 penalty)
  exemptionReason?: string;
  xpDeducted: number; // Actual XP deducted (respecting 500/day cap and available XP)
  rawPenalty: number; // 100, 200, 300, 400, 500
  coinsDeducted?: number; // Real fine / charity obligation deducted
  momentumLost?: number; // % momentum lost
  cause: string; // Root trigger / environment / emotional state
  reflection?: string; // Honest personal takeaway
  correctiveQuestId?: string | null; // ID of linked corrective quest
  correctiveQuestName?: string | null;
  kaffarahTitle?: string; // Sacred penance deed title
  kaffarahType?: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';
  kaffarahCompleted?: boolean;
  recoveryPercentage?: number; // 10, 20, 30%
  recoveredXP?: number;
  weaknessId?: string | null; // ID of linked weakness
  weaknessName?: string | null;
}

export type WeaknessStatus = 'Active' | 'Under Control' | 'Overcome' | 'Sealed';

export interface Weakness {
  id: string;
  name: string; // e.g. "Uncontrolled Scrolling", "Idle / Vanity Speech", "Fajr Hesitation"
  category: MuhasabahCategory;
  description?: string;
  triggerCause: string; // Primary root cause
  occurrenceCount: number;
  lastOccurrenceDate: string;
  status: WeaknessStatus;
  correctiveStrategy?: string; // What the operator will do when triggered
  sealId?: string | null; // Linked PowerSeal ID if converted to a Seal
  createdAt: string;
}

export interface PrayerCheck {
  fardh: boolean;
  onTime?: boolean; // Prayed on time (+40 XP bonus)
  delayed?: boolean; // Prayed late / missed window (-50 XP penalty deduction)
  inMasjid: boolean; // Masjid / Jama'ah bonus (+50 XP)
  sunnahRawatib: boolean; // Sunan Rawatib bonus (+30-40 XP)
  sunnahBefore?: boolean; // Specifically for Dhuhr (4 Rak'ahs before: 2+2) (+25 XP)
  sunnahAfter?: boolean; // Specifically for Dhuhr (2 Rak'ahs after) (+20 XP)
  completedAt?: string | null;
}

export interface WeeklyMuhasabahSummary {
  id: string;
  generatedDate: string; // YYYY-MM-DD
  weekLabel: string; // e.g. "Week ending Friday, August 21, 2026"
  startDate: string;
  endDate: string;
  totalNetXP: number;
  totalEarnedXP: number;
  totalLostXP: number;
  totalLostCoins: number;
  totalSlipsCount: number;
  prayersCount: number; // completed fardh (out of 35)
  prayersOnTimeCount: number;
  prayersDelayedCount: number;
  prayersMissedCount: number;
  sunnahRawatibCount: number;
  adhkarSabahCount: number;
  adhkarMasaCount: number;
  salawatTotal: number;
  qiyamTotalRakats: number;
  questsCompletedCount: number;
  focusMinutesTotal: number;
  kaffarahSettledCount: number;
  kaffarahPendingCount: number;
  topWeaknessCategories: { category: MuhasabahCategory; count: number; lostXP: number }[];
  spiritualRating: 'Mumtaz (Exceptional)' | 'Jayyid Jiddan (Very Good)' | 'Jayyid (Good)' | 'Maqbool (Passing)' | 'Needs Immediate Reform';
  summaryReflection: string;
  recommendations: string[];
  archivedAt: string; // ISO string
}

export interface SpiritualDailyLog {
  date: string; // YYYY-MM-DD
  fajr: PrayerCheck;
  dhuhr: PrayerCheck;
  asr: PrayerCheck;
  maghrib: PrayerCheck;
  isha: PrayerCheck;
  adhkarSabah: boolean; // Morning Adhkar (+75 XP)
  adhkarMasa: boolean; // Evening Adhkar (+75 XP)
  salawatCount: number; // Target 70+ Salawat upon the Prophet (ﷺ) (+100 XP when >= 70)
  salawatCompleted: boolean;
  qiyamRakats: number; // 2 mandatory baseline (+100 XP) + bonus per additional pair (+40 XP per pair)
  qiyamWitr: boolean; // Witr prayer (+50 XP)
  qiyamCompleted: boolean;
  totalEarnedXpToday?: number;
  notes?: string;
}

export interface PlayerLevelInfo {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpUntilNextLevel: number;
  progress: number;
  rank: string;
  xpRequiredForNextLevel: number;
  isLevelCappedByBoss?: boolean;
  bossQuestsCompletedCount?: number;
  bossQuestsRequiredCount?: number;
  effectiveLevel?: number;
  unlockedLevel?: number;
}

export interface POSState {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  quests: Quest[];
  folders: QuestFolder[];
  lists: QuestList[];
  skills: Skill[];
  attributes: Attribute[];
  seals?: PowerSeal[];
  shopItems?: ShopItem[];
  inventory?: RedeemedReward[];
  profile: UserProfile;
  xpHistory: XPHistoryEntry[];
  systemDate: string; // format YYYY-MM-DD
  planningDocuments: PlanningDocument[];
  customJobs?: JobSpec[];
  customTitles?: TitleSpec[];
  deletedJobIds?: string[];
  deletedTitleIds?: string[];
  messages?: SystemMessage[];
  batterySettings?: BatterySettings;
  muhasabahEntries?: MuhasabahEntry[];
  weaknesses?: Weakness[];
  spiritualLogs?: Record<string, SpiritualDailyLog>;
  savedWeeklySummaries?: WeeklyMuhasabahSummary[];
}
