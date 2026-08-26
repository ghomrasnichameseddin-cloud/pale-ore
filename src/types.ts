import type { JobSpec, TitleSpec } from './jobsAndTitles';

export type GoalStatus = 'Active' | 'Paused' | 'Planned' | 'Completed' | 'Archived';
export type GoalPriority = 'Low' | 'Medium' | 'High';
export type CampaignHealth = 'Healthy' | 'At Risk' | 'Blocked' | 'Completed';

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
  desiredOutcome?: string;
  status: GoalStatus;
  priority: GoalPriority;
  horizon?: '30-Day Sprint' | 'Quarterly (Q1-Q4)' | 'Annual Vision' | 'Life Vision' | '30-Day' | 'Quarterly' | 'Annual' | 'Lifetime';
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  relatedSkills: string[]; // skill IDs
  relevantAttributes?: string[]; // attribute IDs or names
  estimatedCompletion: string;
  deadline?: string;
  createdAt: string;
  subGoals?: SubGoal[];
}

export interface Project {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  status: 'Active' | 'Paused' | 'Planned' | 'Completed' | 'Archived';
  campaignHealth?: CampaignHealth;
  estimatedTime: string;
  timeBudgetHours?: number;
  deadline?: string;
  deliverables?: string[];
  dependencies?: string[];
  risks?: string[];
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
  linkedExperiments?: string[]; // Experiment IDs
  linkedReviews?: string[]; // Review IDs
  linkedAttributes?: string[]; // Attribute IDs
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

export type FastingType = 
  | 'Ramadan'           // Fardh Ramadan Fast (صيام رمضان)
  | 'Monday_Thursday'   // Sunnah Monday/Thursday (صيام الإثنين والخميس)
  | 'Ayyam_al_Beed'     // White Days 13, 14, 15 (صيام الأيام البيض)
  | 'Ashura_Tasua'      // 9th/10th Muharram (عاشوراء وتاسوعاء)
  | 'Arafah'            // 9th Dhul-Hijjah (يوم عرفة)
  | 'Shawwal_Six'       // 6 Days of Shawwal (ستة من شوال)
  | 'Dawud'             // Fast of Prophet Dawud (صيام داود - alternate days)
  | 'Qada'              // Make-up Fast (قضاء)
  | 'Kaffarah'          // Penance / expiation fast (كفارة)
  | 'Nawafil_General';  // General Voluntary Sunnah Fast (تطوع مطلق)

export interface FastingLog {
  isFasting: boolean;
  fastingType?: FastingType;
  suhurTaken?: boolean; // Sunnah of Suhur (Barakah in Suhur +25 XP)
  iftarCompleted?: boolean; // Iftar with Dua (+125 XP)
  duaMadeAtIftar?: boolean; // Supplication at breaking fast (+25 XP)
  notes?: string;
}

export interface SunnahPrayersLog {
  duhaRakats: number; // 0, 2, 4, 6, 8 (Salat ad-Duha / Awabeen) (+40 XP per 2 rak'ahs, +5 coins)
  tahiyyatAlMasjid: boolean; // Entering Masjid prayer (2 Rak'ahs) (+35 XP)
  sunnatAlWudu: boolean; // 2 Rak'ahs after Wudu (+30 XP)
  istikhara: boolean; // Salat al-Istikhara (+50 XP)
  tawbah: boolean; // Salat at-Tawbah (Repentance prayer) (+50 XP)
  hajah: boolean; // Salat al-Hajah (Prayer of need) (+40 XP)
  sujudShukrOrTilawah: boolean; // Prostration of gratitude or Quran recitation (+20 XP)
}

export interface QuranLog {
  pagesRead: number; // Pages read today (+5 XP per page, up to 100 XP)
  juzRead?: number; // Juz number 1-30 (+100 XP per Juz)
  surahName?: string; // Current Surah name
  surahNumber?: number;
  ayahNumber?: number;
  tadabburNotes?: string; // Reflection on Ayah (+40 XP)
  memorizationReviewed?: boolean; // Hifdh / revision (+50 XP)
}

export type PostSalahDhikrMode = 'standard33' | 'mini10' | 'none';

export interface PostSalahAdhkarMap {
  fajr?: PostSalahDhikrMode;
  dhuhr?: PostSalahDhikrMode;
  asr?: PostSalahDhikrMode;
  maghrib?: PostSalahDhikrMode;
  isha?: PostSalahDhikrMode;
}

export interface DhikrTasbeehLog {
  tasbeehAfterSalah: boolean; // 33 SubhanAllah, 33 Alhamdulillah, 33 Allahu Akbar + 1 La ilaha illallah (+60 XP)
  postSalahAdhkar?: PostSalahAdhkarMap; // 5 prayers post-adhkar tracking (Standard 33x vs Mini 10x)
  tasbeehCount?: number; // SubhanAllah count (سُبْحَانَ الله)
  hamdCount?: number; // Alhamdulillah count (الحَمْدُ لله)
  tahlilCount: number; // La ilaha illallah count (لَا إِلَهَ إِلَّا الله) (+75 XP when >= 100)
  takbirCount?: number; // Allahu Akbar count (اللهُ أَكْبَر)
  istighfarCount?: number; // 100+ Istighfar target (Astaghfirullah)
  hawqalaCount?: number; // La hawla wa la quwwata illa billah
}

export interface WeeklyScoreBreakdown {
  fardhPrayersScore: number; // max 2.5 pts (out of 35 fardh, weighting on-time vs delayed)
  slipsRestraintScore: number; // max 2.0 pts (penalty deductions & slip count)
  adhkarFortressScore: number; // max 1.5 pts (morning + evening adhkar consistency)
  sunnahQiyamScore: number; // max 1.5 pts (12 sunan rawatib + qiyam + witr)
  salawatScore: number; // max 1.0 pt (meeting 70+/day or 490+/week)
  kaffarahTawbahScore: number; // max 1.5 pts (settled kaffarahs & prompt repentance)
  totalScore: number; // sum out of 10.0
  gradeAr: string; // e.g. "مرتبة الإحسان والمراقبة" / "النفس المطمئنة" / "النفس اللوامة"
  gradeEn: string; // e.g. "Ihsanic Excellence (10/10)" / "Steadfast Tranquility" / "Reproaching Nafs (Active Struggle)"
  actionPlan10OutOf10: string[]; // concrete actionable steps to refine score to 10/10
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
  scoreOutOf10?: number;
  weeklyScoreBreakdown?: WeeklyScoreBreakdown;
  summaryReflection: string;
  weeklyReflection?: string;
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
  // ENHANCEMENTS FOR 10/10 SACRED PROTOCOL:
  fasting?: FastingLog;
  sunnahPrayers?: SunnahPrayersLog;
  quran?: QuranLog;
  dhikr?: DhikrTasbeehLog;
  khushuRating?: number; // 1-10 Khushu' / Heart Presence rating
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

export interface Masjid40DayCovenant {
  startDate?: string; // YYYY-MM-DD
  targetDays: number; // 40
  completedDates?: string[]; // array of YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
  totalCompletedDays: number;
  isUnlockedBaraatan?: boolean;
  unlockedAt?: string;
  notes?: string;
}

export interface Masjid40Stats {
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletedDays: number;
  completedDates: string[];
  todayMasjidCount: number;
  isTodayFullyCompleted: boolean;
  daysRemaining: number;
  progressPercent: number;
  isBaraatanAchieved: boolean;
  milestoneTitle: string;
  currentStage: {
    stageNumber: number;
    stageNameAr: string;
    stageNameEn: string;
    stageDesc: string;
    dayRange: string;
  };
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
  masjid40Covenant?: Masjid40DayCovenant;
}
