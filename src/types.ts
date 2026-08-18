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
}
