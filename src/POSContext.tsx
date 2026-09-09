import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Goal, Project, Milestone, Quest, Skill, Attribute, UserProfile, XPHistoryEntry, POSState, QuestFolder, QuestList,
  GoalStatus, GoalPriority, QuestDifficulty, QuestType, ActiveFocusSession, PlanningDocument, SystemMessage,
  ShopItem, RedeemedReward, ShopItemCategory, BatterySettings, SubGoal, SubProject,
  MuhasabahCategory, MuhasabahSeverity, MuhasabahEntry, WeaknessStatus, Weakness,
  SpiritualDailyLog, PrayerCheck, PlayerLevelInfo, WeeklyMuhasabahSummary,
  FastingType, FastingLog, SunnahPrayersLog, QuranLog, DhikrTasbeehLog, PostSalahAdhkarMap, PostSalahDhikrMode,
  Masjid40Stats, Masjid40DayCovenant,
  VisualCodexSettings, CodexThemeId,
  AdhkarItem, AdhkarCategory, AdhkarPrayerTarget, ActiveAdhkarFocusSession,
  NotificationSettings,
  TimeTransaction, TimeTransactionType, TemporalCapitalInfo, ActiveRestSession
} from './types';
import { INITIAL_STATE, DEFAULT_SHOP_ITEMS, getLocalDateString, createDefaultSpiritualLog } from './initialState';
import { DEFAULT_ADHKAR_LIST } from './data/defaultAdhkar';
import { getStoredVisualCodexSettings, saveStoredVisualCodexSettings, applyVisualCodexToDOM } from './utils/visualCodex';
import { sendNativeNotification } from './utils/nativeNotifications';
import { generateDelayedNotifications, scanAllDelayedItems, DelayedScanResult } from './utils/delayedTaskScanner';
import { parseDateSafe, addDays, getDaysDifference, getWeekdayStr, getSystemTimestamp } from './utils/dateUtils';
import { isQuestScheduledForDate, isQuestArchived, processMultiDayPenalties } from './utils/penaltyEngine';
export { getSystemTimestamp, isQuestScheduledForDate, isQuestArchived, processMultiDayPenalties };
import { getActiveJob, getAllJobs, getAllTitles, JobSpec, TitleSpec, getJobLevel, getTitleLevel, evaluateLevelConditions, LEVEL_RANK_NAMES } from './jobsAndTitles';
import { 
  getQuestXpMultiplier, getFocusXpMultiplier, getCoinMultiplier, getFailPenaltyMultiplier, getMomentumMultiplier 
} from './utils/perkEvaluator';
import { SLIP_RUNES } from './components/SlipRune';
import { 
  analyzeSinRecurrence, 
  SEVERITY_BASE_CONSEQUENCES, 
  getRecurringSinsRegistry,
  RecurringSinsRegistry
} from './utils/muhasabahRecurrence';
import {
  getWeekBoundaries,
  getClosingWeekBoundaries,
  generateWeeklyMuhasabahSummaryPure,
  reconcileMissedWeeks,
  buildWeeklySummaryMarkdown,
  WEEKLY_SCORE_WEIGHTS
} from './utils/weeklyCycle';
import {
  SEVERITY_XP_PENALTIES,
  SEVERITY_COIN_FINES,
  SEVERITY_MOMENTUM_PENALTIES,
  SEVERITY_HP_LOSS
} from './utils/muhasabahConsequences';
import { DEFAULT_KAFFARAH_TEMPLATES } from './data/kaffarahTemplates';

interface POSContextType {
  state: POSState;
  
  // System Messages & PC/Mobile Notifications
  addSystemMessage: (msg: Omit<SystemMessage, 'id' | 'timestamp' | 'read'>) => string;
  markSystemMessageRead: (id: string) => void;
  markAllSystemMessagesRead: () => void;
  deleteSystemMessage: (id: string) => void;
  clearAllSystemMessages: () => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  scanDelayedTasks: (forceNotify?: boolean) => Promise<{ addedCount: number; scanResult: DelayedScanResult }>;

  // Pomodoro Focus Timer
  activeFocusSession: ActiveFocusSession | null;
  startFocusSession: (questId: string | null, workTime?: number, restTime?: number, estimatedCycles?: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  stopFocusSession: () => void;
  skipFocusStage: () => void;
  adjustFocusSessionTime: (deltaMinutes: number) => void;
  completeFocusCycle: (questId: string | null) => void;

  // Adhkar Focus Session
  activeAdhkarFocusSession: ActiveAdhkarFocusSession | null;
  startAdhkarFocusSession: (adhkar: AdhkarItem, workTime?: number, estimatedCycles?: number) => void;
  pauseAdhkarFocusSession: () => void;
  resumeAdhkarFocusSession: () => void;
  stopAdhkarFocusSession: () => void;
  completeAdhkarFocusCycle: () => void;
  incrementAdhkarFocusCount: (delta?: number) => void;
  
  // Goals CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  clearAllGoals: () => void;
  addSubGoal: (goalId: string, name: string, targetDate?: string) => void;
  updateSubGoal: (goalId: string, subGoalId: string, updates: Partial<SubGoal>) => void;
  toggleSubGoal: (goalId: string, subGoalId: string) => void;
  deleteSubGoal: (goalId: string, subGoalId: string) => void;
  
  // Projects CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  clearAllProjects: () => void;
  addSubProject: (projectId: string, name: string, description?: string, targetDate?: string) => void;
  updateSubProject: (projectId: string, subProjectId: string, updates: Partial<SubProject>) => void;
  toggleSubProject: (projectId: string, subProjectId: string) => void;
  deleteSubProject: (projectId: string, subProjectId: string) => void;
  
  // Milestones CRUD
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt'>) => string;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  convertMilestoneToQuest: (
    milestoneId: string,
    overrides?: Partial<Omit<Quest, 'id' | 'createdAt' | 'milestoneId' | 'goalId' | 'projectId'>>
  ) => string | null;
  convertSubGoalToQuest: (
    goalId: string,
    subGoalId: string,
    overrides?: Partial<Omit<Quest, 'id' | 'createdAt' | 'goalId' | 'milestoneId'>>
  ) => string | null;

  // Quests CRUD & Advanced Actions
  addQuest: (quest: Partial<Quest> & { name: string; description: string }) => string;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  reopenQuest: (id: string) => void;
  failQuest: (id: string) => void;
  duplicateQuest: (id: string) => string;
  mergeQuests: (idA: string, idB: string, mergedName: string, mergedDescription: string) => string;
  splitQuest: (id: string, questAName: string, questBName: string, xpRatio: number) => void;
  processQuestReview: (id: string, action: 'rollover' | 'postpone' | 'forgive') => void;
  archiveQuest: (id: string) => void;
  unarchiveQuest: (id: string, targetListId?: string | null) => void;
  
  // Folders & Lists CRUD
  addFolder: (name: string, description?: string, color?: string) => string;
  updateFolder: (id: string, updates: { name?: string; description?: string; color?: string }) => void;
  deleteFolder: (id: string) => void;
  archiveFolder: (id: string, archiveContainedListsAndQuests?: boolean) => void;
  unarchiveFolder: (id: string, unarchiveListsAndQuests?: boolean) => void;
  reorderFolders: (folders: QuestFolder[]) => void;
  addList: (folderId: string | null, name: string, description?: string) => string;
  updateList: (id: string, updates: { folderId?: string | null; name?: string; description?: string }) => void;
  deleteList: (id: string) => void;
  archiveList: (id: string, archiveContainedQuests?: boolean) => void;
  unarchiveList: (id: string, targetFolderId?: string | null, unarchiveQuests?: boolean) => void;
  reorderLists: (lists: QuestList[]) => void;
  
  // Subquests CRUD
  addSubQuest: (questId: string, name: string) => void;
  updateSubQuest: (questId: string, subquestId: string, name: string) => void;
  toggleSubQuest: (questId: string, subquestId: string) => void;
  deleteSubQuest: (questId: string, subquestId: string) => void;
  
  // Skills CRUD
  addSkill: (name: string, tier?: 'Primary' | 'Secondary', parentId?: string | null) => string;
  updateSkillName: (id: string, name: string) => void;
  updateSkillTier: (id: string, tier: 'Primary' | 'Secondary') => void;
  updateSkillParent: (id: string, parentId: string | null) => void;
  toggleArchiveSkill: (id: string) => void;
  mergeSkills: (sourceSkillId: string, targetSkillId: string) => void;
  deleteSkill: (id: string) => void;
  deleteUnusedSkills: () => number;
  clearAllSkills: () => void;
  equipSkillTitle: (id: string, title: string) => void;
  
  // Attributes CRUD (allows adjusting base levels if they wish to manual override, though defaults are dynamic)
  updateAttributeBase: (id: string, level: number) => void;
  restartAttribute: (id: string) => void;
  
  // XP Actions
  addXp: (amount: number, reason?: string, skillIds?: string[]) => void;
  
  // Temporal Currency & Leisure Bank
  addTimeCredits: (minutes: number, reason: string, type?: TimeTransactionType, relatedId?: string) => void;
  spendTimeCredits: (minutes: number, reason: string, relatedId?: string) => { success: boolean; message: string };
  setDailyWakingHours: (hours: number) => void;
  repayTimeDebt: (minutes: number) => void;
  getTemporalCapitalInfo: () => TemporalCapitalInfo;
  startActiveRestSession: (title: string, minutes: number) => void;
  stopActiveRestSession: () => void;
  pauseActiveRestSession: () => void;
  resumeActiveRestSession: () => void;
  
  // Profile Adjustments
  toggleRecoveryMode: () => void;
  updateProfileFocus: (focusText: string, goalId: string | null) => void;
  updateJob: (jobId: string) => void;
  updateTitle: (titleId: string) => void;
  levelUpJob: (jobId: string, targetLvl?: number, forceLevelUp?: boolean) => { success: boolean; message: string };
  levelUpTitle: (titleId: string, targetLvl?: number, forceLevelUp?: boolean) => { success: boolean; message: string };
  getJobLevel: (jobId: string) => number;
  getTitleLevel: (titleId: string) => number;
  getJobLvl: (jobId: string) => number;
  getTitleLvl: (titleId: string) => number;
  rechargeFatigue: (amount?: number) => void;
  addCustomJob: (job: Omit<JobSpec, 'id' | 'isCustom'>) => string;
  updateJobSpec: (job: JobSpec) => void;
  deleteJobSpec: (jobId: string) => void;
  deleteCustomJob: (jobId: string) => void;
  addCustomTitle: (title: Omit<TitleSpec, 'id' | 'isCustom'>) => string;
  updateTitleSpec: (title: TitleSpec) => void;
  deleteTitleSpec: (titleId: string) => void;
  deleteCustomTitle: (titleId: string) => void;
  resetAllData: () => void;
  resetLevelAndXp: () => void;
  clearAllQuests: () => void;
  resetBaselineAttributes: () => void;
  
  // Dynamic Helpers & Analytics
  getGoalProgress: (goalId: string) => number;
  getProjectProgress: (projectId: string) => number;
  getMilestoneProgress: (milestoneId: string) => number;
  getSkillXpAndLevel: (skillId: string) => { xp: number; level: number; progress: number; mastery: number; xpIntoLevel: number; xpRequiredForNextLevel: number };
  getAttributes: () => Attribute[];
  getPlayerLevelInfo: () => PlayerLevelInfo;
  getAnalytics: () => any;
  
  // Export/Import
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  isQuestFinishedForToday: (q: Quest) => boolean;
  isQuestScheduledForDate: (q: Quest, dateStr: string) => boolean;
  getWeekdayStr: (dateStr: string) => string;
  systemDate: string;
  setSystemDate: (date: string) => void;
  syncWithRealClock: () => void;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  selectedListId: string | null;
  setSelectedListId: (id: string | null) => void;

  // Battery Saver & Eco Defense Settings
  updateBatterySettings: (updates: Partial<BatterySettings>) => void;
  toggleBatterySaverMode: () => void;

  // Planning Documents Operations
  addPlanningDocument: (path: string, name: string, content: string) => string;
  updatePlanningDocument: (id: string, updates: Partial<PlanningDocument>) => void;
  deletePlanningDocument: (id: string) => void;
  linkPlanningDocToComponent: (id: string, type: 'goal' | 'project' | 'quest' | 'skill', componentId: string, link: boolean) => void;

  // Reward Shop & Coins Operations
  purchaseShopItem: (itemId: string) => { success: boolean; message: string };
  useInventoryItem: (inventoryId: string) => { success: boolean; message: string };
  addCustomShopItem: (item: Omit<ShopItem, 'id' | 'createdAt'>) => string;
  updateShopItem: (item: ShopItem) => void;
  deleteShopItem: (itemId: string) => void;
  deleteCustomShopItem: (itemId: string) => void;
  resetDefaultShopItems: () => void;
  addCoins: (amount: number, reason?: string) => void;
  clearVoucherHistory: () => void;
  clearAllVouchers: () => void;
  isShopLocked: boolean;

  // Muhāsabah (Self-Accountability) Operations
  healSpiritualHp: (amount: number, reason?: string) => void;
  addMuhasabahEntry: (entry: {
    title: string;
    description?: string;
    category: MuhasabahCategory;
    severity: MuhasabahSeverity;
    cause: string;
    isExempt?: boolean;
    exemptionReason?: string;
    reflection?: string;
    createCorrectiveQuest?: boolean;
    correctiveQuestName?: string;
    kaffarahType?: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';
    recoveryPercentage?: number;
    weaknessId?: string | null;
    weaknessName?: string | null;
  }) => { 
    success: boolean; 
    entryId: string; 
    xpDeducted: number; 
    hpDeducted: number;
    coinsDeducted: number;
    rawPenalty: number; 
    recurrenceMultiplier?: number;
    recurrenceCadence?: string;
    isRecurring?: boolean;
    capReached: boolean; 
    message: string 
  };
  updateMuhasabahEntry: (id: string, updates: Partial<MuhasabahEntry>) => void;
  deleteMuhasabahEntry: (id: string) => void;
  clearAllMuhasabahEntries: () => void;
  generateWeeklyMuhasabahSummary: (targetFridayDate?: string) => WeeklyMuhasabahSummary;
  saveAndArchiveWeeklySummary: (summary: WeeklyMuhasabahSummary) => { success: boolean; message: string };
  clearAllWeeklyArchives: () => { success: boolean; message: string };
  deleteWeeklyArchive: (idOrDate: string) => { success: boolean; message: string };
  runWeeklyMuhasabahCycle: (sundayDateStr?: string) => { success: boolean; message: string; summaryId?: string };
  getRecurringSins: () => RecurringSinsRegistry;

  // Weaknesses Management
  addWeakness: (weakness: Omit<Weakness, 'id' | 'createdAt'>) => string;
  updateWeakness: (id: string, updates: Partial<Weakness>) => void;
  deleteWeakness: (id: string) => void;
  getTodayMuhasabahStats: () => {
    todayEarnedXP: number;
    todayLostXP: number;
    todayNetXP: number;
    todayLostCoins: number;
    todayLostHp: number;
    currentHp: number;
    maxHp: number;
    todayRecurringSlipsCount: number;
    dailyCapRemaining: number;
    totalEntriesCount: number;
    todaySlipsCount: number;
    todayHasanatCount: number;
    activeWeaknessesCount: number;
    pendingKaffarahCount: number;
    pendingKaffarahQuests: Quest[];
    mizanTilt: number;
    equilibriumStatus: 'Radiant Balance' | 'Blessed Equilibrium' | 'Neutral Ground' | 'Spiritual Deficit' | 'Severe Nafs Warning';
    isSpiritualLocked: boolean;
  };
  recalibrateMizan: () => { success: boolean; message: string; timestamp: string };

  // Spiritual Daily Tracking & Sacred Protocol
  getSpiritualLog: (dateStr?: string) => SpiritualDailyLog;
  updateSpiritualLog: (dateStr: string, updates: Partial<SpiritualDailyLog>) => void;
  togglePrayer: (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    field: 'fardh' | 'inMasjid' | 'sunnahRawatib' | 'sunnahBefore' | 'sunnahAfter' | 'onTime' | 'delayed',
    dateStr?: string
  ) => void;
  toggleAdhkar: (type: 'sabah' | 'masa' | 'sleepDhohr' | 'sleepNight', dateStr?: string) => void;
  incrementSalawat: (amount: number, dateStr?: string) => void;
  setSalawatCount: (count: number, dateStr?: string) => void;
  updateQiyam: (rakats: number, witr?: boolean, dateStr?: string) => void;
  setQiyamRakats: (rakats: number, witr?: boolean, dateStr?: string) => void;
  toggleFasting: (
    field: 'isFasting' | 'suhurTaken' | 'iftarCompleted' | 'duaMadeAtIftar',
    fastingType?: FastingType,
    dateStr?: string
  ) => void;
  updateSunnahPrayers: (updates: Partial<SunnahPrayersLog>, dateStr?: string) => void;
  updateQuranLog: (updates: Partial<QuranLog>, dateStr?: string) => void;
  updateDhikrLog: (updates: Partial<DhikrTasbeehLog>, dateStr?: string) => void;
  setKhushuRating: (rating: number, dateStr?: string) => void;
  getMasjid40Stats: (dateStr?: string) => Masjid40Stats;
  toggleAllPrayersInMasjid: (dateStr?: string, forceState?: boolean) => void;
  resetMasjid40Streak: (dateStr?: string) => void;
  setMasjid40Override: (streak: number) => void;

  // Adhkar Management System & Sacred Protocol
  adhkarList: AdhkarItem[];
  addAdhkar: (item: Omit<AdhkarItem, 'id'>) => { success: boolean; message: string; adhkar: AdhkarItem };
  updateAdhkar: (id: string, updates: Partial<AdhkarItem>) => { success: boolean; message: string };
  deleteAdhkar: (id: string) => { success: boolean; message: string };
  resetDefaultAdhkar: () => void;
  incrementAdhkarRecitation: (adhkarId: string, delta: number, dateStr?: string) => void;
  resetAdhkarRecitation: (adhkarId: string, dateStr?: string) => void;
  getAdhkarRecitationCount: (adhkarId: string, dateStr?: string) => number;

  // Visual Codex (Appearance System)
  visualCodex: VisualCodexSettings;
  updateVisualCodexSettings: (updates: Partial<VisualCodexSettings>) => void;
  setTheme: (themeId: CodexThemeId) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pale_ore_pos_state';

const getSkillXpFromHistory = (skillId: string, history: XPHistoryEntry[], allSkills: Skill[]): number => {
  let totalXp = 0;
  
  const targetSkill = allSkills.find(s => s.id === skillId);
  if (!targetSkill) return 0;

  const targetCreatedAt = targetSkill.createdAt ? Date.parse(targetSkill.createdAt) : NaN;
  
  for (const h of history) {
    const hTime = h.timestamp ? Date.parse(h.timestamp) : NaN;
    if (Number.isFinite(targetCreatedAt) && Number.isFinite(hTime) && hTime < targetCreatedAt) {
      continue;
    }

    const directSkills = allSkills.filter(s => h.skillIds.includes(s.id));
    if (directSkills.length === 0) continue;
    
    // Resolve primary skill IDs involved directly or indirectly (via child secondary skill)
    const primarySkillIds = new Set<string>();
    directSkills.forEach(s => {
      if ((s.tier || 'Primary') === 'Primary') {
        primarySkillIds.add(s.id);
      } else if (s.tier === 'Secondary' && s.parentId) {
        primarySkillIds.add(s.parentId);
      }
    });
    
    const primaryList = Array.from(primarySkillIds);
    const primaryCount = primaryList.length;
    const isTargetPrimary = (targetSkill.tier || 'Primary') === 'Primary';

    if (primaryCount > 0) {
      // Quest XP is split equally among linked primary skills
      const primaryXpAllocated = h.xp / primaryCount;

      if (isTargetPrimary) {
        if (primarySkillIds.has(skillId)) {
          totalXp += primaryXpAllocated;
        }
      } else {
        // Target is a secondary skill. Check if its parent primary skill is active
        if (targetSkill.parentId && primarySkillIds.has(targetSkill.parentId)) {
          // Find all secondary skills linked under this parent primary skill
          const parentSecondaries = allSkills.filter(s => s.tier === 'Secondary' && s.parentId === targetSkill.parentId);
          if (parentSecondaries.length > 0) {
            // Secondary skills under this primary skill split its allocated XP equally among themselves
            totalXp += primaryXpAllocated / parentSecondaries.length;
          }
        }
      }
    } else {
      // Fallback for standalone/orphaned secondary skills with no primary skill
      const secondarySkills = directSkills.filter(s => s.tier === 'Secondary');
      if (!isTargetPrimary && secondarySkills.some(s => s.id === skillId) && secondarySkills.length > 0) {
        totalXp += h.xp / secondarySkills.length;
      }
    }
  }
  
  return Math.max(0, Math.round(totalXp));
};

const calculatePlayerLevel = (totalXp: number): number => {
  // Starts with a required 1000 XP in level 1, then adds 500 XP with each level up.
  // L = Level. XP to go from level L to L + 1 is 1000 + 500 * (L - 1) = 500 * L + 500.
  // Cumulative XP needed to reach level L:
  // sum_{i=1}^{L-1} (500 * i + 500) = 250 * L * (L - 1) + 500 * (L - 1) = 250 * (L - 1) * (L + 2) = 250 * (L^2 + L - 2).
  // We solve: 250 * (L^2 + L - 2) <= totalXp
  // L^2 + L - (2 + totalXp / 250) <= 0
  // L = (-1 + sqrt(1 + 4 * (2 + totalXp / 250))) / 2 = (-1 + sqrt(9 + totalXp / 62.5)) / 2
  return Math.floor((-1 + Math.sqrt(9 + totalXp / 62.5)) / 2);
};

const getMaxHpForLevel = (level: number): number => 100 + Math.max(0, level - 1) * 5;

export const INTERMEDIATE_RANK_LEVEL_THRESHOLD = 10; // D-Rank and above

export const getCompletedBossQuestsCount = (quests: Quest[] = [], xpHistory: XPHistoryEntry[] = []): number => {
  const completedBossQuests = quests.filter(q => 
    (q.difficulty === 'Boss' || q.type === 'Boss') && 
    (q.status === 'Completed' || q.completedAt !== null)
  );
  // Also check distinct completed boss entries in history
  const bossQuestIdsInQuests = new Set(completedBossQuests.map(q => q.id));
  const bossHistoryEntries = xpHistory.filter(h => 
    h.questId && 
    !bossQuestIdsInQuests.has(h.questId) && 
    (h.questName.toLowerCase().includes('boss') || h.questName.includes('👑') || h.questName.includes('⚔️'))
  );
  return completedBossQuests.length + bossHistoryEntries.length;
};

export const calculateGatedPlayerLevel = (
  totalXp: number,
  completedBossCount: number
): {
  level: number;
  rawLevel: number;
  isLevelCappedByBoss: boolean;
  bossQuestsCompletedCount: number;
  bossQuestsRequiredCount: number;
  nextGateLevel: number | null;
} => {
  const rawLevel = calculatePlayerLevel(totalXp);

  // Boss quest gates appear at intermediate rank milestones:
  // Level 10 reached → 1 boss quest required to advance to Level 11
  // Level 20 reached → 2 boss quests required to advance to Level 21
  // Level 30 reached → 3 boss quests required to advance to Level 31
  // ...
  // Each gate unlocks every 10 levels. Once all boss quests for that gate are slain, you may advance.

  // Pre-Intermediate: no gate, no boss requirement
  if (rawLevel < INTERMEDIATE_RANK_LEVEL_THRESHOLD) {
    return {
      level: rawLevel,
      rawLevel,
      isLevelCappedByBoss: false,
      bossQuestsCompletedCount: completedBossCount,
      bossQuestsRequiredCount: 0,
      nextGateLevel: null
    };
  }

  // Determine the current gate level (the highest gate the player has reached)
  // Gates are at 10, 20, 30, 40, ... 10n for n >= 1
  const currentGateLevel = Math.floor(rawLevel / 10) * 10;

  // Required boss count is how many gate levels the player has REACHED (>=)
  // Each gate level reached adds 1 required boss quest
  let requiredBossCount = 0;
  for (let gate = 10; gate <= rawLevel; gate += 10) {
    requiredBossCount += 1;
  }

  // Max allowed level: each completed boss quest shatters one gate (10 levels)
  // 0 bosses done: max level = 10 (so 10 is the cap when no boss is slain)
  // 1 boss done: max level = 20
  // 2 bosses done: max level = 30
  const maxAllowedLevel = INTERMEDIATE_RANK_LEVEL_THRESHOLD + completedBossCount * 10;
  const isCapped = rawLevel > maxAllowedLevel;
  const effectiveLevel = Math.min(rawLevel, maxAllowedLevel);

  return {
    level: effectiveLevel,
    rawLevel,
    isLevelCappedByBoss: isCapped,
    bossQuestsCompletedCount: completedBossCount,
    bossQuestsRequiredCount: requiredBossCount,
    nextGateLevel: currentGateLevel
  };
};

const resolveRecoveredPenalties = (history: XPHistoryEntry[]): XPHistoryEntry[] => {
  const result: XPHistoryEntry[] = [];
  let availablePositiveXp = 0;

  // Process history from newest to oldest
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (entry.xp >= 0) {
      availablePositiveXp += entry.xp;
      result.push(entry);
    } else {
      const penaltyCost = Math.abs(entry.xp);
      if (availablePositiveXp >= penaltyCost) {
        availablePositiveXp -= penaltyCost;
        // Fully recovered! The penalty vanishes from history.
      } else if (availablePositiveXp > 0) {
        // Partially recovered! Reduce the penalty.
        const remainingPenalty = penaltyCost - availablePositiveXp;
        availablePositiveXp = 0;
        result.push({
          ...entry,
          xp: -remainingPenalty
        });
      } else {
        result.push(entry);
      }
    }
  }
  return result;
};

const resetRecurringQuestsForNewDate = (
  newDateStr: string,
  currentQuests: Quest[],
  lists: QuestList[] = [],
  folders: QuestFolder[] = []
): Quest[] => {
  return currentQuests.map(q => {
    if (isQuestArchived(q, lists, folders)) {
      return q;
    }
    if (!q.recurrence || q.recurrence === 'None') {
      return q;
    }
    
    if (q.completedAt) {
      const lastActionDateStr = q.completedAt.split('T')[0];
      const diff = getDaysDifference(lastActionDateStr, newDateStr);
      
      let shouldReset = false;
      if (diff >= 1) {
        // If a quest is scheduled on this new date, it must be reset so the user can complete it again!
        if (isQuestScheduledForDate(q, newDateStr)) {
          shouldReset = true;
        }
      }
      
      if (shouldReset) {
        return {
          ...q,
          status: 'Active' as const,
          completedAt: null,
          subquests: q.subquests?.map(sq => ({ ...sq, completed: false }))
        };
      }
    }
    return q;
  });
};

export {
  SEVERITY_XP_PENALTIES,
  SEVERITY_COIN_FINES,
  SEVERITY_MOMENTUM_PENALTIES
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isGeneratingWeeklySummaryRef = useRef(false);
  const [state, setState] = useState<POSState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Reconcile and fix any missing Muhasabah deductions in xpHistory
          let reconciledXpHistory: XPHistoryEntry[] = [...(parsed.xpHistory || [])];
          const savedMuhasabahEntries = (parsed.muhasabahEntries || []) as MuhasabahEntry[];
          
          const reconciledMuhasabahEntries = savedMuhasabahEntries.map(entry => {
            const isExempt = Boolean(entry.isExempt);
            if (isExempt) return entry;

            const expectedPenalty = entry.rawPenalty || (
              entry.severity === 'Critical' ? 500 :
              entry.severity === 'Severe' ? 400 :
              entry.severity === 'Major' ? 300 :
              entry.severity === 'Moderate' ? 200 : 100
            );

            // Check if this specific entry is already logged in xpHistory
            const hasHistoryEntry = reconciledXpHistory.some(h => 
              (h.id && (h.id.includes(entry.id) || (entry.id && h.id.endsWith(entry.id)))) ||
              (h.xp === -expectedPenalty && h.questName && h.questName.includes(entry.title))
            );

            if (!hasHistoryEntry) {
              const historyEntry: XPHistoryEntry = {
                id: `xph-muhasabah-${entry.id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                questId: null,
                questName: `[MUHĀSABAH AUDIT] ${entry.category || 'Slip'}: ${entry.title}`,
                xp: -expectedPenalty,
                timestamp: entry.timestamp || entry.date || new Date().toISOString(),
                skillIds: []
              };
              reconciledXpHistory = [historyEntry, ...reconciledXpHistory];
            }

            return {
              ...entry,
              rawPenalty: expectedPenalty,
              xpDeducted: expectedPenalty
            };
          });

          // Reconcile penalty quests that had 0 or positive XP so they show their negative loss
          const reconciledQuests = (parsed.quests || []).map((q: any) => {
            if (q.type === 'Penalty' && (q.xp === 0 || !q.xp || q.xp > 0)) {
              const pVal = q.difficulty === 'Boss' ? 250 : q.difficulty === 'Hard' ? 100 : q.difficulty === 'Easy' ? 25 : 50;
              return { ...q, xp: -pVal };
            }
            return q;
          });

          const totalXp = Math.max(0, reconciledXpHistory.reduce((sum, h) => sum + (h.xp || 0), 0));
          const completedBossCount = getCompletedBossQuestsCount(reconciledQuests, reconciledXpHistory);
          const gatedLevel = calculateGatedPlayerLevel(totalXp, completedBossCount);

          const rawWeaknesses: Weakness[] = (parsed.weaknesses && parsed.weaknesses.length > 0) 
            ? parsed.weaknesses.map((w: any) => ({
                id: w.id,
                name: w.name,
                category: w.category || 'Obligations',
                occurrenceCount: w.occurrenceCount || 0,
                status: w.status === 'Sealed' ? 'Active' : (w.status || 'Active'),
                triggerCause: w.triggerCause || '',
                createdAt: w.createdAt || new Date().toISOString()
              }))
            : (INITIAL_STATE.weaknesses || []);

          // Robustly merge to guarantee all schema properties are defined
          return {
            ...INITIAL_STATE,
            ...parsed,
            profile: {
              ...INITIAL_STATE.profile,
              ...(parsed.profile || {}),
              xp: totalXp,
              level: gatedLevel.level,
              coins: parsed.profile?.coins ?? 150,
              focusShields: parsed.profile?.focusShields ?? 0
            },
            weaknesses: rawWeaknesses,
            shopItems: (parsed.shopItems && parsed.shopItems.length > 0) ? parsed.shopItems : DEFAULT_SHOP_ITEMS,
            inventory: parsed.inventory || [],
            goals: parsed.goals || [],
            projects: parsed.projects || [],
            milestones: parsed.milestones || [],
            quests: reconciledQuests,
            folders: parsed.folders || [],
            lists: parsed.lists || [],
            skills: parsed.skills || [],
            attributes: (parsed.attributes && parsed.attributes.length > 0) ? parsed.attributes : INITIAL_STATE.attributes,
            xpHistory: reconciledXpHistory,
            muhasabahEntries: reconciledMuhasabahEntries,
            systemDate: parsed.systemDate || INITIAL_STATE.systemDate,
            planningDocuments: parsed.planningDocuments || INITIAL_STATE.planningDocuments,
            messages: parsed.messages || INITIAL_STATE.messages || [],
            visualCodex: parsed.visualCodex || getStoredVisualCodexSettings() || INITIAL_STATE.visualCodex,
            customAdhkar: parsed.customAdhkar ? parsed.customAdhkar.filter((a: any) => a.category !== 'sleep_dhohr' && a.category !== 'sleep_night') : undefined
          };
        }
      }
    } catch (e) {
      console.error('Error loading POS state from localStorage:', e);
    }
    return INITIAL_STATE;
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addPlanningDocument = (path: string, name: string, content: string): string => {
    const id = `pdoc-${Date.now()}`;
    const newDoc: PlanningDocument = {
      id,
      path,
      name,
      content,
      linkedGoals: [],
      linkedProjects: [],
      linkedQuests: [],
      linkedSkills: [],
      updatedAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      planningDocuments: [...(prev.planningDocuments || []), newDoc]
    }));
    return id;
  };

  const updatePlanningDocument = (id: string, updates: Partial<PlanningDocument>) => {
    setState(prev => ({
      ...prev,
      planningDocuments: (prev.planningDocuments || []).map(doc => 
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
      )
    }));
  };

  const deletePlanningDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      planningDocuments: (prev.planningDocuments || []).filter(doc => doc.id !== id)
    }));
  };

  const linkPlanningDocToComponent = (
    id: string, 
    type: 'goal' | 'project' | 'quest' | 'skill', 
    componentId: string, 
    link: boolean
  ) => {
    setState(prev => {
      const documents = prev.planningDocuments || [];
      const updatedDocs = documents.map(doc => {
        if (doc.id !== id) return doc;
        
        let linkedGoals = doc.linkedGoals ? [...doc.linkedGoals] : [];
        let linkedProjects = doc.linkedProjects ? [...doc.linkedProjects] : [];
        let linkedQuests = doc.linkedQuests ? [...doc.linkedQuests] : [];
        let linkedSkills = doc.linkedSkills ? [...doc.linkedSkills] : [];

        if (type === 'goal') {
          linkedGoals = link 
            ? Array.from(new Set([...linkedGoals, componentId]))
            : linkedGoals.filter(x => x !== componentId);
        } else if (type === 'project') {
          linkedProjects = link 
            ? Array.from(new Set([...linkedProjects, componentId]))
            : linkedProjects.filter(x => x !== componentId);
        } else if (type === 'quest') {
          linkedQuests = link 
            ? Array.from(new Set([...linkedQuests, componentId]))
            : linkedQuests.filter(x => x !== componentId);
        } else if (type === 'skill') {
          linkedSkills = link 
            ? Array.from(new Set([...linkedSkills, componentId]))
            : linkedSkills.filter(x => x !== componentId);
        }

        return {
          ...doc,
          linkedGoals,
          linkedProjects,
          linkedQuests,
          linkedSkills,
          updatedAt: new Date().toISOString()
        };
      });

      return {
        ...prev,
        planningDocuments: updatedDocs
      };
    });
  };

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const [activeFocusSession, setActiveFocusSession] = useState<ActiveFocusSession | null>(() => {
      try {
        const saved = localStorage.getItem('pale_ore_pos_focus_session');
        if (!saved) return null;
        const session = JSON.parse(saved) as ActiveFocusSession;
        if (session && session.status === 'running' && session.lastUpdated) {
          const elapsedSeconds = Math.floor((Date.now() - session.lastUpdated) / 1000);
          if (elapsedSeconds > 0) {
            let newTimeLeft = session.timeLeft - elapsedSeconds;
            let currentMode = session.mode;
            let completedCycles = session.completedCycles;
  
            while (newTimeLeft <= 0) {
              const cycleLength = currentMode === 'work' ? session.totalWorkTime * 60 : session.totalRestTime * 60;
              newTimeLeft += cycleLength;
              if (currentMode === 'work') {
                completedCycles += 1;
              }
              currentMode = currentMode === 'work' ? 'rest' : 'work';
            }
  
            return {
              ...session,
              timeLeft: newTimeLeft,
              mode: currentMode,
              completedCycles,
              timeSpent: (session.timeSpent || 0) + elapsedSeconds,
              lastUpdated: Date.now()
            };
          }
        }
        return session;
      } catch {
        return null;
      }
    });
  
    const [activeAdhkarFocusSession, setActiveAdhkarFocusSession] = useState<ActiveAdhkarFocusSession | null>(null);

  useEffect(() => {
    if (activeFocusSession) {
      localStorage.setItem('pale_ore_pos_focus_session', JSON.stringify(activeFocusSession));
    } else {
      localStorage.removeItem('pale_ore_pos_focus_session');
    }
  }, [activeFocusSession]);

  useEffect(() => {
    if (!activeFocusSession || activeFocusSession.status !== 'running') return;

    const timer = setInterval(() => {
      setActiveFocusSession(prev => {
        if (!prev || prev.status !== 'running') return prev;
        const now = Date.now();
        const lastUpd = prev.lastUpdated || now;
        const elapsed = Math.max(1, Math.floor((now - lastUpd) / 1000));

        if (prev.timeLeft <= elapsed) {
          const nextMode = prev.mode === 'work' ? 'rest' : 'work';
          const nextDuration = nextMode === 'work' ? prev.totalWorkTime : prev.totalRestTime;
          const nextCycles = prev.mode === 'work' ? prev.completedCycles + 1 : prev.completedCycles;

          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}

          return {
            ...prev,
            mode: nextMode,
            timeLeft: nextDuration * 60,
            completedCycles: nextCycles,
            status: 'paused',
            timeSpent: (prev.timeSpent || 0) + elapsed,
            lastUpdated: now
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - elapsed,
          timeSpent: (prev.timeSpent || 0) + elapsed,
          lastUpdated: now
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeFocusSession?.status]);

  // System Messages Management
  const addSystemMessage = (msg: Omit<SystemMessage, 'id' | 'timestamp' | 'read'>): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: SystemMessage = {
      ...msg,
      id,
      timestamp: new Date().toISOString(),
      read: false
    };
    setState(prev => ({
      ...prev,
      messages: [newMsg, ...(prev.messages || [])]
    }));

    // Trigger Native OS (PC Action Center / macOS / Android Tray) Notification
    if (state.notificationSettings?.enableDesktopNotifications !== false) {
      sendNativeNotification({
        title: msg.title,
        body: msg.content,
        soundCategory: msg.category,
        tag: `pos-msg-${msg.category}-${Date.now()}`,
        data: {
          msgId: id,
          category: msg.category,
          entityType: msg.entityType,
          entityId: msg.entityId
        }
      }).catch(() => {});
    }

    return id;
  };

  const markSystemMessageRead = (id: string) => {
    setState(prev => ({
      ...prev,
      messages: (prev.messages || []).map(m => m.id === id ? { ...m, read: true } : m)
    }));
  };

  const markAllSystemMessagesRead = () => {
    setState(prev => ({
      ...prev,
      messages: (prev.messages || []).map(m => ({ ...m, read: true }))
    }));
  };

  const deleteSystemMessage = (id: string) => {
    setState(prev => ({
      ...prev,
      messages: (prev.messages || []).filter(m => m.id !== id)
    }));
  };

  const clearAllSystemMessages = () => {
    setState(prev => ({
      ...prev,
      messages: []
    }));
  };

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    setState(prev => {
      const current = prev.notificationSettings || {
        enableDesktopNotifications: true,
        enableSound: true,
        enableVibration: true,
        notifyDelayedQuests: true,
        notifyDelayedGoals: true,
        notifyDelayedProjects: true,
        notifyMuhasabahDeficit: true,
        lastDelayedCheckDate: ''
      };
      return {
        ...prev,
        notificationSettings: {
          ...current,
          ...updates
        }
      };
    });
  };

  const scanDelayedTasks = async (forceNotify: boolean = true) => {
    return generateDelayedNotifications(state, addSystemMessage, { forceNotify });
  };

  // Automated scan for delayed quests, goals, and projects on app startup or system date advance
  useEffect(() => {
    const timer = setTimeout(() => {
      const lastCheck = state.notificationSettings?.lastDelayedCheckDate;
      const currentSysDate = state.systemDate || getLocalDateString();
      if (lastCheck !== currentSysDate) {
        generateDelayedNotifications(state, addSystemMessage, { forceNotify: false })
          .then(({ addedCount }) => {
            setState(prev => ({
              ...prev,
              notificationSettings: {
                ...(prev.notificationSettings || {
                  enableDesktopNotifications: true,
                  enableSound: true,
                  enableVibration: true,
                  notifyDelayedQuests: true,
                  notifyDelayedGoals: true,
                  notifyDelayedProjects: true,
                  notifyMuhasabahDeficit: true
                }),
                lastDelayedCheckDate: currentSysDate
              }
            }));
          })
          .catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.systemDate]);

  useEffect(() => {
    if (!activeFocusSession) return;
    if (activeFocusSession.completedCycles > 0) {
      const cycleMinutes = activeFocusSession.totalWorkTime;
      const todayStr = state.systemDate || getLocalDateString();
      
      const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
      const focusXpMult = getFocusXpMultiplier(activeJob);
      const focusXpEarned = Math.round(15 * focusXpMult);

      const xpHistoryId = `h-focus-${Date.now()}`;
      const focusXpEntry: XPHistoryEntry = {
        id: xpHistoryId,
        questId: null,
        questName: `🧘 Focus Session: Completed ${cycleMinutes} min work block on "${activeFocusSession.questName}"`,
        xp: focusXpEarned,
        timestamp: new Date().toISOString(),
        skillIds: []
      };

      // Automatically complete the associated quest ONLY when ALL estimated cycles for the session are finished!
      if (activeFocusSession.mode === 'rest' && activeFocusSession.questId && activeFocusSession.completedCycles >= activeFocusSession.estimatedCycles) {
        completeQuest(activeFocusSession.questId);
      }

      // Automatically dispatch a System Message regarding completed block
      addSystemMessage({
        sender: 'FOCUS_BOT',
        category: 'achievement',
        title: 'Focus Cycle Complete',
        content: `Completed ${cycleMinutes}m work block for "${activeFocusSession.questName}". +${focusXpEarned} XP awarded!`,
        priority: 'high'
      });

      setState(prev => {
        const lastDate = prev.profile.lastFocusDate || '';
        const isSameDay = lastDate === todayStr;
        const prevMinutes = isSameDay ? (prev.profile.focusMinutesToday || 0) : 0;
        const prevStreak = prev.profile.focusStreak || 0;
        
        let newStreak = prevStreak;
        if (!isSameDay) {
          if (lastDate === '') {
            newStreak = 1;
          } else {
            const yesterdayStr = addDays(todayStr, -1);
            if (lastDate === yesterdayStr) {
              newStreak = prevStreak + 1;
            } else {
              newStreak = 1;
            }
          }
        }

        const updatedHistory = resolveRecoveredPenalties([focusXpEntry, ...prev.xpHistory]);
        const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
        const level = calculatePlayerLevel(totalXp);

        // Mint Earned Leisure Credits (1m leisure per 4m focus, minimum 3m)
        const earnedLeisure = Math.max(3, Math.round(cycleMinutes * 0.25));
        const currentCredits = prev.profile.timeCredits ?? 60;
        const newCredits = currentCredits + earnedLeisure;
        const timeTx: TimeTransaction = {
          id: `time-focus-${Date.now()}`,
          type: 'focus_mint',
          minutes: earnedLeisure,
          reason: `Focus Harvest: ${cycleMinutes}m Deep Work on "${activeFocusSession.questName}"`,
          timestamp: getSystemTimestamp(todayStr),
          balanceAfter: newCredits,
          relatedId: activeFocusSession.questId || undefined
        };

        return {
          ...prev,
          xpHistory: updatedHistory,
          timeHistory: [timeTx, ...(prev.timeHistory || [])],
          profile: {
            ...prev.profile,
            focusMinutesToday: prevMinutes + cycleMinutes,
            focusStreak: newStreak,
            lastFocusDate: todayStr,
            xp: totalXp,
            level,
            timeCredits: newCredits,
            totalTimeEarned: (prev.profile.totalTimeEarned || 0) + earnedLeisure,
            totalTimeInvested: (prev.profile.totalTimeInvested || 0) + cycleMinutes
          }
        };
      });
    }
  }, [activeFocusSession?.completedCycles]);

  // LEVEL-UP NOTIFICATION MONITORING FOR ALL ASPECTS
  const prevPlayerLevelRef = useRef<number | null>(null);
  const prevSkillLevelsRef = useRef<Record<string, number>>({});
  const prevAttributeLevelsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // 1. Player Level Up Check
    const currentTotalXp = state.profile.xp || 0;
    const currentLevel = calculatePlayerLevel(currentTotalXp);
    
    if (prevPlayerLevelRef.current !== null && currentLevel > prevPlayerLevelRef.current) {
      const diff = currentLevel - prevPlayerLevelRef.current;
      addSystemMessage({
        sender: 'PROGRESS_ENGINE',
        category: 'achievement',
        title: `🎉 PLAYER LEVEL UP: LEVEL ${currentLevel}!`,
        content: `Ascension complete! You advanced ${diff > 1 ? `${diff} levels` : 'a level'} to Level ${currentLevel}. Focus output and max capacity increased!`,
        priority: 'high'
      });
    }
    prevPlayerLevelRef.current = currentLevel;

    // 2. Skill Level Ups Check
    const newSkillLevels: Record<string, number> = {};
    (state.skills || []).forEach(s => {
      const sXp = getSkillXpFromHistory(s.id, state.xpHistory || [], state.skills || []);
      const sLevel = calculatePlayerLevel(sXp);
      const prevLevel = prevSkillLevelsRef.current[s.id];
      if (prevLevel !== undefined && sLevel > prevLevel) {
        addSystemMessage({
          sender: 'PROGRESS_ENGINE',
          category: 'achievement',
          title: `⚡ SKILL LEVEL UP: ${s.name} (Level ${sLevel})`,
          content: `Competency Tier Advanced! "${s.name}" reached Level ${sLevel}. Output multipliers increased!`,
          priority: 'high'
        });
      }
      newSkillLevels[s.id] = sLevel;
    });
    prevSkillLevelsRef.current = newSkillLevels;

    // 3. Attribute Level Ups Check
    const currentAttributes = getAttributes();
    const newAttrLevels: Record<string, number> = {};
    currentAttributes.forEach(attr => {
      const prevAttrLevel = prevAttributeLevelsRef.current[attr.id];
      if (prevAttrLevel !== undefined && attr.level > prevAttrLevel) {
        addSystemMessage({
          sender: 'PROGRESS_ENGINE',
          category: 'achievement',
          title: `🛡️ ATTRIBUTE ADVANCED: ${attr.name.toUpperCase()} (Level ${attr.level})`,
          content: `Capacity Amplified! Your ${attr.name} stat reached Level ${attr.level} (${attr.description}).`,
          priority: 'medium'
        });
      }
      newAttrLevels[attr.id] = attr.level;
    });
    prevAttributeLevelsRef.current = newAttrLevels;

  }, [state.profile.xp, state.xpHistory, state.skills]);

  const startFocusSession = (questId: string | null = null, workTime = 25, restTime = 5, estimatedCycles?: number) => {
    let questName = "General Deep Focus Session";
    let cycles = estimatedCycles;
    if (questId) {
      const quest = state.quests.find(q => q.id === questId);
      if (quest) {
        questName = quest.name;
        if (!cycles || cycles <= 0) {
          const estTime = quest.estimatedTime || 30;
          cycles = Math.max(1, Math.round(estTime / workTime));
        }
      }
    }
    if (!cycles || cycles <= 0) {
      cycles = 1;
    }
    
    setActiveFocusSession({
      questId,
      questName,
      totalWorkTime: workTime,
      totalRestTime: restTime,
      mode: 'work',
      status: 'running',
      timeLeft: workTime * 60,
      completedCycles: 0,
      estimatedCycles: cycles,
      timeSpent: 0,
      lastUpdated: Date.now()
    });

    addSystemMessage({
      sender: 'FOCUS_BOT',
      category: 'note',
      title: 'Focus Session Engaged',
      content: `Engaged ${workTime}m work / ${restTime}m break focus session for "${questName}". Concentration lock active.`,
      priority: 'medium'
    });
  };

  const pauseFocusSession = () => {
    setActiveFocusSession(prev => prev ? { ...prev, status: 'paused' } : null);
  };

  const resumeFocusSession = () => {
    setActiveFocusSession(prev => prev ? { ...prev, status: 'running', lastUpdated: Date.now() } : null);
  };

  const stopFocusSession = () => {
    if (activeFocusSession) {
      addSystemMessage({
        sender: 'FOCUS_BOT',
        category: 'note',
        title: 'Focus Session Ended',
        content: `Session for "${activeFocusSession.questName}" stopped. Completed ${activeFocusSession.completedCycles} cycles.`,
        priority: 'low'
      });
    }
    setActiveFocusSession(null);
  };

  const skipFocusStage = () => {
    setActiveFocusSession(prev => {
      if (!prev) return null;
      const nextMode = prev.mode === 'work' ? 'rest' : 'work';
      const nextDuration = nextMode === 'work' ? prev.totalWorkTime : prev.totalRestTime;
      const nextCycles = prev.mode === 'work' ? prev.completedCycles + 1 : prev.completedCycles;
      return {
        ...prev,
        mode: nextMode,
        timeLeft: nextDuration * 60,
        completedCycles: nextCycles,
        status: 'running',
        lastUpdated: Date.now()
      };
    });
  };

  const adjustFocusSessionTime = (deltaMinutes: number) => {
    setActiveFocusSession(prev => {
      if (!prev) return null;
      const newTimeLeft = Math.max(10, prev.timeLeft + deltaMinutes * 60);
      return {
        ...prev,
        timeLeft: newTimeLeft,
        lastUpdated: Date.now()
      };
    });
  };

  const completeFocusCycle = (questId: string | null = null) => {
      setActiveFocusSession(prev => {
        if (!prev) return null;
        const nextMode = prev.mode === 'work' ? 'rest' : 'work';
        const nextDuration = nextMode === 'work' ? prev.totalWorkTime : prev.totalRestTime;
        const nextCycles = prev.mode === 'work' ? prev.completedCycles + 1 : prev.completedCycles;
        return {
          ...prev,
          mode: nextMode,
          timeLeft: nextDuration * 60,
          completedCycles: nextCycles,
          status: 'paused'
        };
      });
    };
  
    // ===== ADHKAR FOCUS SESSIONS =====
    // Timer effect for adhkar focus session
    useEffect(() => {
      if (!activeAdhkarFocusSession || activeAdhkarFocusSession.status !== 'running') return;
  
      const timer = setInterval(() => {
        setActiveAdhkarFocusSession(prev => {
          if (!prev || prev.status !== 'running') return prev;
          const now = Date.now();
          const lastUpd = prev.lastUpdated || now;
          const elapsed = Math.max(1, Math.floor((now - lastUpd) / 1000));
  
          if (prev.timeLeft <= elapsed) {
            // Session completed
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch (e) {}
  
            return {
              ...prev,
              mode: 'rest',
              timeLeft: 0,
              completedCycles: prev.completedCycles + 1,
              status: 'paused',
              timeSpent: (prev.timeSpent || 0) + elapsed,
              lastUpdated: now
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - elapsed,
            timeSpent: (prev.timeSpent || 0) + elapsed,
            lastUpdated: now
          };
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }, [activeAdhkarFocusSession?.status]);
  
    const startAdhkarFocusSession = (adhkar: AdhkarItem, workTime = 25, estimatedCycles?: number) => {
      const cycles = estimatedCycles || Math.max(1, Math.round(adhkar.targetCount / 10));
      
      const session: ActiveAdhkarFocusSession = {
        id: `adhkar-focus-${Date.now()}`,
        adhkarId: adhkar.id,
        adhkarTitle: adhkar.title,
        arabicText: adhkar.arabicText,
        translation: adhkar.translation,
        targetCount: adhkar.targetCount,
        currentCount: 0,
        totalWorkTime: workTime,
        mode: 'work',
        status: 'running',
        timeLeft: workTime * 60,
        completedCycles: 0,
        estimatedCycles: cycles,
        timeSpent: 0,
        lastUpdated: Date.now()
      };

      setActiveAdhkarFocusSession(session);

      addSystemMessage({
        sender: 'FOCUS_BOT',
        category: 'note',
        title: 'Adhkar Focus Session Engaged',
        content: `Engaged ${workTime}m focus session for "${adhkar.title}" (${adhkar.targetCount}x target). Concentration lock active.`,
        priority: 'medium'
      });
    };
  
    const pauseAdhkarFocusSession = () => {
      setActiveAdhkarFocusSession(prev => prev ? { ...prev, status: 'paused' } : null);
    };
  
    const resumeAdhkarFocusSession = () => {
      setActiveAdhkarFocusSession(prev => prev ? { ...prev, status: 'running', lastUpdated: Date.now() } : null);
    };
  
    const stopAdhkarFocusSession = () => {
      if (activeAdhkarFocusSession) {
        addSystemMessage({
          sender: 'FOCUS_BOT',
          category: 'note',
          title: 'Adhkar Focus Session Ended',
          content: `Session for "${activeAdhkarFocusSession.adhkarTitle}" stopped. Completed ${activeAdhkarFocusSession.completedCycles} cycles.`,
          priority: 'low'
        });
      }
      setActiveAdhkarFocusSession(null);
    };
  
    const completeAdhkarFocusCycle = () => {
      setActiveAdhkarFocusSession(prev => {
        if (!prev) return null;
        const nextCycles = prev.completedCycles + 1;
        const isComplete = nextCycles >= prev.estimatedCycles;
        
        return {
          ...prev,
          mode: 'rest',
          timeLeft: 0,
          completedCycles: nextCycles,
          status: isComplete ? 'paused' : 'paused',
          lastUpdated: Date.now()
        };
      });
    };
  
    const incrementAdhkarFocusCount = (delta: number = 1) => {
      setActiveAdhkarFocusSession(prev => {
        if (!prev) return null;
        const newCount = Math.min(prev.targetCount, Math.max(0, prev.currentCount + delta));
        return {
          ...prev,
          currentCount: newCount
        };
      });
    };
  
    const isQuestFinishedForToday = (q: Quest): boolean => {
    const targetDateStr = state.systemDate || getLocalDateString();
    
    // If it is a recurring quest, its finished status for today is ONLY determined by completedAt
    if (q.recurrence && q.recurrence !== 'None') {
      if (q.completedAt) {
        try {
          const completedDateStr = getLocalDateString(q.completedAt);
          if (completedDateStr === targetDateStr) {
            return true;
          }
        } catch (e) {
          // ignore
        }
      }
      return false;
    }

    // Non-recurring quests
    if (q.status === 'Completed' || q.status === 'Failed') {
      return true;
    }
    if (q.completedAt) {
      try {
        const completedDateStr = getLocalDateString(q.completedAt);
        if (completedDateStr === targetDateStr) {
          return true;
        }
      } catch (e) {
        // ignore
      }
    }
    if (q.subquests && q.subquests.length > 0 && q.subquests.every(sq => sq.completed)) {
      return true;
    }
    return false;
  };

  const applyMidnightPenalties = (prev: POSState, oldDate: string, newDateStr: string) => {
    return processMultiDayPenalties(prev, oldDate, newDateStr);
  };

  const setSystemDate = (newDateStr: string) => {
    setState(prev => {
      const oldDate = prev.systemDate;
      const { updatedQuests, updatedHistory, updatedMomentum, recoveryModeActivated } = applyMidnightPenalties(prev, oldDate, newDateStr);
      
      const finalQuests = resetRecurringQuestsForNewDate(newDateStr, updatedQuests, prev.lists, prev.folders);
      const finalHistory = resolveRecoveredPenalties(updatedHistory);
      const totalXp = Math.max(0, finalHistory.reduce((sum, h) => sum + h.xp, 0));
      const level = calculatePlayerLevel(totalXp);
      
      const updatedSkills = prev.skills.map(skill => {
        const skillXp = getSkillXpFromHistory(skill.id, finalHistory, prev.skills);
        const skillLevel = calculatePlayerLevel(skillXp);
        const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
        return {
          ...skill,
          level: skillLevel,
          xp: skillXp,
          mastery
        };
      });

      return {
        ...prev,
        systemDate: newDateStr,
        quests: finalQuests,
        xpHistory: finalHistory,
        skills: updatedSkills,
        profile: {
          ...prev.profile,
          momentum: updatedMomentum,
          xp: totalXp,
          level,
          focusMinutesToday: prev.profile.lastFocusDate === newDateStr ? prev.profile.focusMinutesToday : 0,
          recoveryMode: recoveryModeActivated ? true : prev.profile.recoveryMode
        }
      };
    });
  };

  const syncWithRealClock = () => {
    const realToday = getLocalDateString();
    setSystemDate(realToday);
  };

  // Run cycle reset check on mount and periodically at midnight
  useEffect(() => {
    const runCycleReset = () => {
      const realToday = getLocalDateString();
      setState(prev => {
        const currentSimulated = prev.systemDate || realToday;
        
        // If current simulated date is behind real clock, auto-advance to real date
        let nextSimulated = currentSimulated;
        if (currentSimulated !== realToday) {
          const daysDiff = getDaysDifference(currentSimulated, realToday);
          if (daysDiff >= 1) {
            nextSimulated = realToday;
          }
        }

        const oldDate = currentSimulated;
        const { updatedQuests, updatedHistory, updatedMomentum, recoveryModeActivated } = applyMidnightPenalties(prev, oldDate, nextSimulated);

        const finalQuests = resetRecurringQuestsForNewDate(nextSimulated, updatedQuests, prev.lists, prev.folders);
        const finalHistory = resolveRecoveredPenalties(updatedHistory);
        const totalXp = Math.max(0, finalHistory.reduce((sum, h) => sum + h.xp, 0));
        const level = calculatePlayerLevel(totalXp);
        
        const updatedSkills = prev.skills.map(skill => {
          const skillXp = getSkillXpFromHistory(skill.id, finalHistory, prev.skills);
          const skillLevel = calculatePlayerLevel(skillXp);
          const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
          return {
            ...skill,
            level: skillLevel,
            xp: skillXp,
            mastery
          };
        });

        return {
          ...prev,
          systemDate: nextSimulated,
          quests: finalQuests,
          xpHistory: finalHistory,
          skills: updatedSkills,
          profile: {
            ...prev.profile,
            momentum: updatedMomentum,
            xp: totalXp,
            level,
            focusMinutesToday: prev.profile.lastFocusDate === nextSimulated ? prev.profile.focusMinutesToday : 0,
            recoveryMode: recoveryModeActivated ? true : prev.profile.recoveryMode
          }
        };
      });
    };

    runCycleReset();
    
    // Check every 30 seconds for midnight transition
    const interval = setInterval(runCycleReset, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine if a quest is completed or has been completed at least once (for recurring)
  const isQuestDone = (q: Quest) => isQuestFinishedForToday(q);

  // Goal helper calculation
  const getGoalProgress = (goalId: string): number => {
    const goalQuests = state.quests.filter(q => q.goalId === goalId);
    if (goalQuests.length === 0) {
      // Check if there are projects
      const goalProjects = state.projects.filter(p => p.goalId === goalId);
      if (goalProjects.length === 0) return 0;
      
      const projectProgresses = goalProjects.map(p => getProjectProgress(p.id));
      return Math.round(projectProgresses.reduce((a, b) => a + b, 0) / projectProgresses.length);
    }
    const completed = goalQuests.filter(isQuestDone).length;
    return Math.round((completed / goalQuests.length) * 100);
  };

  // Project helper calculation
  const getProjectProgress = (projectId: string): number => {
    const projectQuests = state.quests.filter(q => q.projectId === projectId);
    if (projectQuests.length === 0) return 0;
    const completed = projectQuests.filter(isQuestDone).length;
    return Math.round((completed / projectQuests.length) * 100);
  };

  // Milestone helper calculation
  const getMilestoneProgress = (milestoneId: string): number => {
    const milestoneQuests = state.quests.filter(q => q.milestoneId === milestoneId);
    if (milestoneQuests.length === 0) return 0;
    const completed = milestoneQuests.filter(isQuestDone).length;
    return Math.round((completed / milestoneQuests.length) * 100);
  };

  // Skill progression calculation
  const getSkillXpAndLevel = (skillId: string) => {
    // Accumulate XP from entire history of completions (important for repeating quests!)
    const earnedXp = getSkillXpFromHistory(skillId, state.xpHistory, state.skills);

    const level = calculatePlayerLevel(earnedXp);
    const xpNeededForCurrentLevel = 250 * (level - 1) * (level + 2);
    const xpRequiredForNextLevel = 500 * level + 500; // XP required to level up from current level to next level
    
    const xpIntoLevel = earnedXp - xpNeededForCurrentLevel;
    const progress = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpRequiredForNextLevel) * 100)));
    
    // Mastery represents level competence relative to mastery (e.g. up to Level 50 is 100%)
    const mastery = Math.min(100, Math.round((level / 50) * 100));

    return { xp: earnedXp, level, progress, mastery, xpIntoLevel, xpRequiredForNextLevel };
  };

  // Player Level Information
  const getPlayerLevelInfo = (): PlayerLevelInfo => {
    // Use historical completions to get total earned XP
    const totalXp = state.xpHistory.reduce((sum, h) => sum + h.xp, 0);
    const completedBossCount = getCompletedBossQuestsCount(state.quests, state.xpHistory);
    const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);
    const level = gated.level;
    
    const xpNeededForCurrentLevel = 250 * (level - 1) * (level + 2);
    const xpRequiredForNextLevel = 500 * level + 500; // XP required to level up from current level to next level
    
    const xpIntoLevel = Math.max(0, totalXp - xpNeededForCurrentLevel);
    let xpUntilNextLevel = Math.max(0, xpRequiredForNextLevel - xpIntoLevel);
    let progress = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpRequiredForNextLevel) * 100)));

    // If level is capped by boss requirement, progression is stuck at 100% until the boss quest is slain!
    if (gated.isLevelCappedByBoss) {
      progress = 100;
      xpUntilNextLevel = 0;
    }

    // Rank evaluation (Hunter System progression scale)
    let rank = 'E-Rank';
    if (level >= 500) rank = 'SSS+-Rank';
    else if (level >= 400) rank = 'SSS-Rank';
    else if (level >= 300) rank = 'SS+-Rank';
    else if (level >= 200) rank = 'SS-Rank';
    else if (level >= 150) rank = 'S+-Rank';
    else if (level >= 100) rank = 'S-Rank';
    else if (level >= 60) rank = 'A-Rank';
    else if (level >= 40) rank = 'B-Rank';
    else if (level >= 25) rank = 'C-Rank';
    else if (level >= 10) rank = 'D-Rank';

    return { 
      level, 
      totalXp, 
      xpIntoLevel, 
      xpUntilNextLevel,
      progress,
      rank,
      xpRequiredForNextLevel,
      isLevelCappedByBoss: gated.isLevelCappedByBoss,
      bossQuestsCompletedCount: gated.bossQuestsCompletedCount,
      bossQuestsRequiredCount: gated.bossQuestsRequiredCount,
      effectiveLevel: level,
      unlockedLevel: gated.rawLevel,
      nextGateLevel: gated.nextGateLevel
    };
  };

  // Helper for dynamic attribute progression:
  // Requirements strictly scale with each level up rather than staying flat!
  // Cost to advance from bonusLevel to bonusLevel + 1 increases progressively:
  // cost(L) = baseCost + (L * growth) + quadratic tier scaling
  const calculateAttributeProgression = (
    points: number,
    baseCost: number,
    growth: number
  ): {
    earnedBonus: number;
    pointsIntoLevel: number;
    pointsRequiredForNextLevel: number;
    progress: number;
    totalPoints: number;
  } => {
    const cleanPoints = Math.max(0, Math.round(points * 10) / 10);
    let bonusLevel = 0;
    let remaining = cleanPoints;

    while (true) {
      // Dynamic Level Scaling: Requirements strictly increase with each level!
      const costForNext = Math.round(baseCost + (bonusLevel * growth) + Math.floor((bonusLevel * bonusLevel) / 6));
      
      if (remaining < costForNext) {
        const progress = costForNext > 0 
          ? Math.min(100, Math.max(0, Math.round((remaining / costForNext) * 100))) 
          : 0;
        return {
          earnedBonus: bonusLevel,
          pointsIntoLevel: Math.round(remaining * 10) / 10,
          pointsRequiredForNextLevel: costForNext,
          progress,
          totalPoints: cleanPoints
        };
      }
      
      remaining -= costForNext;
      bonusLevel += 1;
      
      if (bonusLevel >= 150) {
        return {
          earnedBonus: 150,
          pointsIntoLevel: costForNext,
          pointsRequiredForNextLevel: costForNext,
          progress: 100,
          totalPoints: cleanPoints
        };
      }
    }
  };

  // Dynamic Attribute Engine (grounded in completed quests evidence, difficulty weighting & progressive scaling)
  const getAttributes = (): Attribute[] => {
    // Analyze all completion events in the XP history, matching them with their quest details
    const completedEvents = state.xpHistory.map(h => {
      const q = state.quests.find(quest => quest.id === h.questId);
      return {
        ...h,
        type: q?.type || 'Side',
        goalId: q?.goalId || null,
        difficulty: q?.difficulty || 'Normal',
        streak: q?.streakCount || 0
      };
    });
    
    return state.attributes.map(attr => {
      // Check if this attribute or all attributes have been restarted/reset
      const resetCutoff = attr.resetAt || state.attributesResetAt;
      const eligibleEvents = resetCutoff
        ? completedEvents.filter(e => e.timestamp && e.timestamp > resetCutoff)
        : completedEvents;

      let totalPoints = 0;
      let baseCost = 14;
      let growth = 4;

      if (attr.name === 'Strength') {
        baseCost = 14;
        growth = 4;
        eligibleEvents.forEach(e => {
          const isFitness = e.skillIds.some(s => {
            const skill = state.skills.find(sk => sk.id === s);
            return skill?.name === 'Fitness' || skill?.name?.toLowerCase().includes('fitness') || skill?.name?.toLowerCase().includes('workout');
          });
          const isBoss = e.type === 'Boss' || e.difficulty === 'Boss';
          if (isFitness || isBoss) {
            const pts = isBoss ? 8 : (e.difficulty === 'Hard' ? 4 : (e.difficulty === 'Easy' ? 1 : 2));
            totalPoints += pts;
          }
        });
      } else if (attr.name === 'Endurance') {
        // Physical stamina and mental consistency to repeat routines
        // All completed directives feed Endurance, so it has a higher base cost and steep progressive curve
        baseCost = 24;
        growth = 8;
        eligibleEvents.forEach(e => {
          const pts = e.difficulty === 'Boss' ? 6 : (e.difficulty === 'Hard' ? 3 : (e.difficulty === 'Easy' ? 1 : 1.5));
          totalPoints += pts;
        });
        if (state.profile.focusMinutesToday && state.profile.focusMinutesToday > 0) {
          totalPoints += Math.min(10, Math.floor(state.profile.focusMinutesToday / 25));
        }
      } else if (attr.name === 'Agility') {
        // Mental dexterity, quick task turnaround, side quests and optional tasks
        baseCost = 14;
        growth = 4;
        eligibleEvents.forEach(e => {
          if (e.type === 'Side' || e.type === 'Optional') {
            const pts = e.difficulty === 'Hard' ? 4 : (e.difficulty === 'Easy' ? 1 : 2);
            totalPoints += pts;
          }
        });
      } else if (attr.name === 'Focus') {
        // Deep work on Main quests and sustained pomodoro focus sessions
        baseCost = 16;
        growth = 5;
        eligibleEvents.forEach(e => {
          if (e.type === 'Main') {
            const pts = e.difficulty === 'Boss' ? 8 : (e.difficulty === 'Hard' ? 5 : (e.difficulty === 'Easy' ? 1.5 : 3));
            totalPoints += pts;
          }
        });
        if (state.profile.focusStreak && state.profile.focusStreak > 0) {
          totalPoints += Math.min(15, state.profile.focusStreak * 2);
        }
      } else if (attr.name === 'Discipline') {
        // Completing habits and side routines consistently with streak protection
        baseCost = 16;
        growth = 5;
        eligibleEvents.forEach(e => {
          if (e.type === 'Habit' || e.type === 'Side') {
            const streakBonus = Math.min(2, Math.floor((e.streak || 0) / 3));
            const pts = (e.type === 'Habit' ? 2 : 1.5) + streakBonus;
            totalPoints += pts;
          }
        });
      } else if (attr.name === 'Knowledge') {
        baseCost = 14;
        growth = 4;
        eligibleEvents.forEach(e => {
          const isKnowledge = e.skillIds.some(s => {
            const skill = state.skills.find(sk => sk.id === s);
            return ['Programming', 'English', 'Arabic', 'French', 'Chess', 'Coding', 'Study', 'Reading'].some(k => 
              skill?.name?.toLowerCase().includes(k.toLowerCase())
            );
          });
          if (isKnowledge) {
            const pts = e.difficulty === 'Hard' ? 4 : (e.difficulty === 'Easy' ? 1 : 2);
            totalPoints += pts;
          }
        });
      } else if (attr.name === 'Wisdom') {
        baseCost = 16;
        growth = 5;
        eligibleEvents.forEach(e => {
          if (e.goalId !== null) {
            const pts = e.difficulty === 'Hard' ? 5 : (e.difficulty === 'Easy' ? 1.5 : 3);
            totalPoints += pts;
          }
        });
      } else if (attr.name === 'Social') {
        baseCost = 14;
        growth = 4;
        eligibleEvents.forEach(e => {
          const isSocial = e.skillIds.some(s => {
            const skill = state.skills.find(sk => sk.id === s);
            return ['Writing', 'Cooking', 'Business', 'Communication', 'Teaching'].some(k => 
              skill?.name?.toLowerCase().includes(k.toLowerCase())
            );
          });
          if (isSocial) {
            const pts = e.difficulty === 'Hard' ? 4 : (e.difficulty === 'Easy' ? 1 : 2);
            totalPoints += pts;
          }
        });
      } else if (attr.name === 'Faith') {
        baseCost = 14;
        growth = 4;
        eligibleEvents.forEach(e => {
          const isFaith = e.skillIds.some(s => {
            const skill = state.skills.find(sk => sk.id === s);
            return ['Qur\'an', 'Arabic', 'Dhikr', 'Salah', 'Tahajjud'].some(k => 
              skill?.name?.toLowerCase().includes(k.toLowerCase())
            );
          });
          if (isFaith) {
            const pts = e.difficulty === 'Hard' ? 4 : (e.difficulty === 'Easy' ? 1.5 : 2.5);
            totalPoints += pts;
          }
        });
      }

      const calculated = calculateAttributeProgression(totalPoints, baseCost, growth);
      const baseLevel = attr.level || 1;
      const extraLevels = calculated.earnedBonus;
      const totalLevel = baseLevel + extraLevels;

      return {
        ...attr,
        baseLevel,
        earnedBonus: extraLevels,
        total: totalLevel,
        level: totalLevel,
        progress: calculated.progress,
        pointsIntoLevel: calculated.pointsIntoLevel,
        pointsRequiredForNextLevel: calculated.pointsRequiredForNextLevel,
        totalPoints: calculated.totalPoints,
        resetAt: attr.resetAt
      };
    });
  };

  // CRUD FOR GOALS
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>): string => {
    const id = `g-${Date.now()}`;
    const newGoal: Goal = {
      ...goal,
      id,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
    return id;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
      // Clean up relations
      projects: prev.projects.filter(p => p.goalId !== id),
      milestones: prev.milestones.filter(m => m.goalId !== id),
      quests: prev.quests.map(q => q.goalId === id ? { ...q, goalId: null, projectId: null, milestoneId: null } : q)
    }));
  };

  const clearAllGoals = () => {
    setState(prev => ({
      ...prev,
      goals: [],
      projects: [],
      milestones: [],
      quests: prev.quests.map(q => ({ ...q, goalId: null, projectId: null, milestoneId: null })),
      profile: {
        ...prev.profile,
        focusGoalId: null,
        currentFocus: prev.profile.focusGoalId ? '' : prev.profile.currentFocus
      }
    }));
  };

  // SUBGOALS CRUD
  const addSubGoal = (goalId: string, name: string, targetDate?: string) => {
    if (!name.trim()) return;
    const newSubGoal = {
      id: `sg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      completed: false,
      targetDate
    };
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          subGoals: [...(g.subGoals || []), newSubGoal]
        };
      })
    }));
  };

  const toggleSubGoal = (goalId: string, subGoalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          subGoals: (g.subGoals || []).map(sg => sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg)
        };
      })
    }));
  };

  const updateSubGoal = (goalId: string, subGoalId: string, updates: Partial<SubGoal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          subGoals: (g.subGoals || []).map(sg => sg.id === subGoalId ? { ...sg, ...updates } : sg)
        };
      })
    }));
  };

  const deleteSubGoal = (goalId: string, subGoalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          subGoals: (g.subGoals || []).filter(sg => sg.id !== subGoalId)
        };
      })
    }));
  };

  // CRUD FOR FOLDERS & LISTS
  const addFolder = (name: string, description?: string, color?: string): string => {
    const id = `f-${Date.now()}`;
    const newFolder = {
      id,
      name,
      description,
      color: color || '#22d3ee',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      folders: [...(prev.folders || []), newFolder]
    }));
    return id;
  };

  const updateFolder = (id: string, updates: { name?: string; description?: string; color?: string }) => {
    setState(prev => ({
      ...prev,
      folders: (prev.folders || []).map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const deleteFolder = (id: string) => {
    setState(prev => {
      const updatedLists = (prev.lists || []).map(l => l.folderId === id ? { ...l, folderId: null } : l);
      return {
        ...prev,
        folders: (prev.folders || []).filter(f => f.id !== id),
        lists: updatedLists
      };
    });
  };

  const addList = (folderId: string | null, name: string, description?: string): string => {
    const id = `l-${Date.now()}`;
    const newList = {
      id,
      folderId,
      name,
      description,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      lists: [...(prev.lists || []), newList]
    }));
    return id;
  };

  const updateList = (id: string, updates: { folderId?: string | null; name?: string; description?: string }) => {
    setState(prev => ({
      ...prev,
      lists: (prev.lists || []).map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const deleteList = (id: string) => {
    setState(prev => {
      const updatedQuests = (prev.quests || []).map(q => q.listId === id ? { ...q, listId: null } : q);
      return {
        ...prev,
        lists: (prev.lists || []).filter(l => l.id !== id),
        quests: updatedQuests
      };
    });
  };

  const archiveFolder = (id: string, archiveContainedListsAndQuests: boolean = true) => {
    setState(prev => {
      const folder = (prev.folders || []).find(f => f.id === id);
      if (!folder) return prev;
      const updatedFolders = (prev.folders || []).map(f => f.id === id ? { ...f, archived: true, archivedAt: new Date().toISOString() } : f);
      let updatedLists = prev.lists || [];
      let updatedQuests = prev.quests;

      if (archiveContainedListsAndQuests) {
        const folderListIds = updatedLists.filter(l => l.folderId === id).map(l => l.id);
        updatedLists = updatedLists.map(l => l.folderId === id ? { ...l, archived: true, archivedAt: new Date().toISOString() } : l);
        updatedQuests = prev.quests.map(q => (q.listId && folderListIds.includes(q.listId)) ? { ...q, archived: true, archivedAt: new Date().toISOString() } : q);
      }

      return {
        ...prev,
        folders: updatedFolders,
        lists: updatedLists,
        quests: updatedQuests
      };
    });
  };

  const unarchiveFolder = (id: string, unarchiveListsAndQuests: boolean = true) => {
    setState(prev => {
      const updatedFolders = (prev.folders || []).map(f => f.id === id ? { ...f, archived: false, archivedAt: null } : f);
      let updatedLists = prev.lists || [];
      let updatedQuests = prev.quests;

      if (unarchiveListsAndQuests) {
        const folderListIds = updatedLists.filter(l => l.folderId === id).map(l => l.id);
        updatedLists = updatedLists.map(l => l.folderId === id ? { ...l, archived: false, archivedAt: null } : l);
        updatedQuests = prev.quests.map(q => (q.listId && folderListIds.includes(q.listId)) ? { ...q, archived: false, archivedAt: null, status: q.status === 'Failed' ? 'Active' : q.status } : q);
      }

      return {
        ...prev,
        folders: updatedFolders,
        lists: updatedLists,
        quests: updatedQuests
      };
    });
  };

  const archiveList = (id: string, archiveContainedQuests: boolean = true) => {
    setState(prev => {
      const list = (prev.lists || []).find(l => l.id === id);
      if (!list) return prev;
      const updatedLists = (prev.lists || []).map(l => l.id === id ? { ...l, archived: true, archivedAt: new Date().toISOString() } : l);
      let updatedQuests = prev.quests;
      if (archiveContainedQuests) {
        updatedQuests = prev.quests.map(q => q.listId === id ? { ...q, archived: true, archivedAt: new Date().toISOString() } : q);
      }
      return {
        ...prev,
        lists: updatedLists,
        quests: updatedQuests
      };
    });
  };

  const unarchiveList = (id: string, targetFolderId?: string | null, unarchiveQuests: boolean = true) => {
    setState(prev => {
      let resolvedFolderId = targetFolderId;
      const targetList = (prev.lists || []).find(l => l.id === id);
      
      // If folderId is not explicitly specified, check if current parent folder is archived
      if (resolvedFolderId === undefined && targetList?.folderId) {
        const parentFolder = (prev.folders || []).find(f => f.id === targetList.folderId);
        if (parentFolder?.archived) {
          resolvedFolderId = null; // Unarchive to standalone root list
        } else {
          resolvedFolderId = targetList.folderId;
        }
      }

      const updatedLists = (prev.lists || []).map(l => {
        if (l.id === id) {
          return {
            ...l,
            archived: false,
            archivedAt: null,
            folderId: resolvedFolderId !== undefined ? resolvedFolderId : l.folderId
          };
        }
        return l;
      });
      let updatedQuests = prev.quests;
      if (unarchiveQuests) {
        updatedQuests = prev.quests.map(q => q.listId === id ? { ...q, archived: false, archivedAt: null, status: q.status === 'Failed' ? 'Active' : q.status } : q);
      }
      return {
        ...prev,
        lists: updatedLists,
        quests: updatedQuests
      };
    });
  };

  const reorderFolders = (folders: QuestFolder[]) => {
    setState(prev => ({
      ...prev,
      folders
    }));
  };

  const reorderLists = (lists: QuestList[]) => {
    setState(prev => ({
      ...prev,
      lists
    }));
  };

  // CRUD FOR PROJECTS
  const addProject = (project: Omit<Project, 'id' | 'createdAt'>): string => {
    const id = `p-${Date.now()}`;
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
    return id;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProject = (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      milestones: prev.milestones.filter(m => m.projectId !== id),
      quests: prev.quests.map(q => q.projectId === id ? { ...q, projectId: null, milestoneId: null } : q)
    }));
  };

  const clearAllProjects = () => {
    setState(prev => ({
      ...prev,
      projects: [],
      milestones: [],
      quests: prev.quests.map(q => ({ ...q, projectId: null, milestoneId: null }))
    }));
  };

  // SUBPROJECTS CRUD
  const addSubProject = (projectId: string, name: string, description?: string, targetDate?: string) => {
    if (!name.trim()) return;
    const newSubProj = {
      id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      completed: false,
      description,
      targetDate
    };
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          subProjects: [...(p.subProjects || []), newSubProj]
        };
      })
    }));
  };

  const toggleSubProject = (projectId: string, subProjectId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          subProjects: (p.subProjects || []).map(sp => sp.id === subProjectId ? { ...sp, completed: !sp.completed } : sp)
        };
      })
    }));
  };

  const updateSubProject = (projectId: string, subProjectId: string, updates: Partial<SubProject>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          subProjects: (p.subProjects || []).map(sp => sp.id === subProjectId ? { ...sp, ...updates } : sp)
        };
      })
    }));
  };

  const deleteSubProject = (projectId: string, subProjectId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          subProjects: (p.subProjects || []).filter(sp => sp.id !== subProjectId)
        };
      })
    }));
  };

  // CRUD FOR MILESTONES
  const addMilestone = (milestone: Omit<Milestone, 'id' | 'createdAt'>): string => {
    const id = `m-${Date.now()}`;
    const newMilestone: Milestone = {
      ...milestone,
      id,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
    return id;
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setState(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMilestone = (id: string) => {
    setState(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id),
      quests: prev.quests.map(q => q.milestoneId === id ? { ...q, milestoneId: null } : q)
    }));
  };

  // CONVERT MILESTONES & SUBGOALS INTO QUESTS
  const convertMilestoneToQuest = (
    milestoneId: string,
    overrides?: Partial<Omit<Quest, 'id' | 'createdAt' | 'milestoneId' | 'goalId' | 'projectId'>>
  ): string | null => {
    const milestone = state.milestones.find(m => m.id === milestoneId);
    if (!milestone) return null;

    const questId = addQuest({
      name: milestone.name,
      description: `Milestone Quest: ${milestone.name}`,
      milestoneId: milestone.id,
      goalId: milestone.goalId,
      projectId: milestone.projectId,
      type: 'Milestone',
      difficulty: 'Normal',
      estimatedTime: 60,
      xp: 150,
      status: 'Active',
      ...overrides
    });

    return questId;
  };

  const convertSubGoalToQuest = (
    goalId: string,
    subGoalId: string,
    overrides?: Partial<Omit<Quest, 'id' | 'createdAt' | 'goalId' | 'milestoneId'>>
  ): string | null => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return null;
    const subGoal = goal.subGoals?.find(sg => sg.id === subGoalId);
    if (!subGoal) return null;

    const questId = addQuest({
      name: subGoal.name,
      description: `Mini Goal: ${subGoal.name}`,
      goalId: goal.id,
      milestoneId: null,
      type: 'Milestone',
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 75,
      status: 'Active',
      deadline: subGoal.targetDate || null,
      ...overrides
    });

    return questId;
  };

  // CRUD FOR QUESTS & PROGRESSION ACTIONS
  const addQuest = (quest: Partial<Quest> & { name: string; description: string }): string => {
    const id = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newQuest: Quest = {
      goalId: null,
      projectId: null,
      milestoneId: null,
      relatedSkills: [],
      difficulty: 'Normal',
      estimatedTime: 30,
      xp: 100,
      type: 'Main',
      recurrence: 'None',
      deadline: null,
      ...quest,
      id,
      status: 'Active',
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, newQuest]
    }));
    return id;
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const deleteQuest = (id: string) => {
    setState(prev => {
      const remainingQuests = prev.quests.filter(q => q.id !== id);
      const deletedQuest = prev.quests.find(q => q.id === id);
      const isDeactivatingQuest = deletedQuest 
        ? (deletedQuest.type.toUpperCase() === 'PENALTY' || deletedQuest.type.toUpperCase() === 'RECOVERY')
        : false;

      let newRecoveryMode = prev.profile.recoveryMode;
      if (isDeactivatingQuest) {
        const remainingDeactivatingQuestsCount = remainingQuests.filter(q => 
          q.status === 'Active' && 
          (q.type.toUpperCase() === 'PENALTY' || q.type.toUpperCase() === 'RECOVERY')
        ).length;
        if (remainingDeactivatingQuestsCount === 0) {
          newRecoveryMode = false;
        }
      }

      // Preserve full XP history and total earned XP so checked/completed quest XP never diminishes upon deletion
      const currentXpHistory = prev.xpHistory || [];
      const totalXp = currentXpHistory.reduce((sum, h) => sum + h.xp, 0);
      const level = calculatePlayerLevel(Math.max(prev.profile.xp || 0, totalXp));

      return {
        ...prev,
        quests: remainingQuests,
        xpHistory: currentXpHistory, // Keep history intact so earned XP, skills, and stats remain permanent
        profile: {
          ...prev.profile,
          xp: Math.max(prev.profile.xp || 0, totalXp),
          level,
          recoveryMode: newRecoveryMode
        }
      };
    });

    if (activeFocusSession?.questId === id) {
      stopFocusSession();
    }
  };

  const archiveQuest = (id: string) => {
    setState(prev => {
      const qToArchive = prev.quests.find(q => q.id === id);
      if (!qToArchive) return prev;
      return {
        ...prev,
        quests: prev.quests.map(q => q.id === id ? { ...q, archived: true, archivedAt: new Date().toISOString() } : q)
      };
    });
    if (activeFocusSession?.questId === id) {
      stopFocusSession();
    }
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Quest Archived',
      content: `Quest was moved to the Archive vault. Exempt from midnight rules.`,
      priority: 'low'
    });
  };

  const unarchiveQuest = (id: string, targetListId?: string | null) => {
    setState(prev => {
      const q = prev.quests.find(item => item.id === id);
      if (!q) return prev;

      let resolvedListId = targetListId;
      if (resolvedListId === undefined && q.listId) {
        const parentList = (prev.lists || []).find(l => l.id === q.listId);
        if (parentList?.archived) {
          resolvedListId = null; // Unarchive to standalone root
        } else if (parentList?.folderId) {
          const parentFolder = (prev.folders || []).find(f => f.id === parentList.folderId);
          if (parentFolder?.archived) {
            resolvedListId = null; // Unarchive to standalone root
          } else {
            resolvedListId = q.listId;
          }
        } else {
          resolvedListId = q.listId;
        }
      }

      return {
        ...prev,
        quests: prev.quests.map(item => {
          if (item.id === id) {
            return {
              ...item,
              archived: false,
              archivedAt: null,
              status: item.status === 'Failed' ? ('Active' as const) : item.status,
              listId: resolvedListId !== undefined ? resolvedListId : item.listId
            };
          }
          return item;
        })
      };
    });
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Quest Restored',
      content: `Quest was restored from Archive vault to active directives.`,
      priority: 'low'
    });
  };

  const completeQuest = (id: string) => {
    const questToComplete = state.quests.find(q => q.id === id);
    if (!questToComplete) return;
    // If it's a non-recurring quest and is already completed, ignore
    if ((!questToComplete.recurrence || questToComplete.recurrence === 'None') && questToComplete.status === 'Completed') return;

    const completedTimestamp = getSystemTimestamp(state.systemDate);
    
    // Calculate Job Perk XP & Coin Multiplier
    const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
    const questPerkXpMultiplier = getQuestXpMultiplier(activeJob, questToComplete);

    // Calculate Habit Streak XP Bonus (+5% per streak day up to +50%)
    const currentStreak = questToComplete.streakCount || 0;
    const isRecurringOrHabit = (questToComplete.recurrence && questToComplete.recurrence !== 'None') || questToComplete.type === 'Habit';
    let habitXpMultiplier = 1.0;
    if (isRecurringOrHabit && currentStreak > 0) {
      habitXpMultiplier = 1 + Math.min(0.50, currentStreak * 0.05);
    }

    const isPenaltyQuest = questToComplete.type === 'Penalty' || questToComplete.xp < 0;
    const baseQuestXp = isPenaltyQuest 
      ? (questToComplete.xp !== 0 ? Math.abs(questToComplete.xp) : (questToComplete.difficulty === 'Boss' ? 250 : questToComplete.difficulty === 'Hard' ? 100 : questToComplete.difficulty === 'Easy' ? 25 : 50))
      : Math.max(0, questToComplete.xp);

    let earnedXp = Math.round(baseQuestXp * habitXpMultiplier * questPerkXpMultiplier);

    // Create XP History entry
    const xpHistoryId = `h-${Date.now()}`;
    const newHistoryEntry: XPHistoryEntry = {
      id: xpHistoryId,
      questId: questToComplete.id,
      questName: questToComplete.name,
      xp: earnedXp,
      timestamp: completedTimestamp,
      skillIds: questToComplete.relatedSkills
    };

    // Calculate momentum boost (+10% on completion + Perk Multiplier, cap 100)
    const momentumPerkMult = getMomentumMultiplier(activeJob);
    const newMomentum = Math.min(100, state.profile.momentum + Math.round(10 * momentumPerkMult));

    // Calculate Coins Earned (+10% of earned XP + streak bonus + Job Coin Perk)
    const baseCoinsEarned = Math.max(5, Math.round(earnedXp / 10));
    const streakCoinBonus = isRecurringOrHabit ? currentStreak * 2 : 0;
    const perkCoinMult = getCoinMultiplier(activeJob);
    const totalCoinsEarned = Math.round((baseCoinsEarned + streakCoinBonus) * perkCoinMult);

    // Calculate Earned Time Credits (Leisure dividend from quest completion)
    const earnedTimeCredits = isRecurringOrHabit ? 4
      : questToComplete.difficulty === 'Boss' ? 30
      : questToComplete.difficulty === 'Hard' ? 15
      : questToComplete.difficulty === 'Easy' ? 4
      : 8;

    const currentLeisure = state.profile.timeCredits ?? 60;
    const newLeisureBalance = currentLeisure + earnedTimeCredits;
    const questTimeTx: TimeTransaction = {
      id: `time-quest-${Date.now()}`,
      type: 'quest_dividend',
      minutes: earnedTimeCredits,
      reason: `Quest Dividend: "${questToComplete.name}" (${questToComplete.difficulty || 'Normal'})`,
      timestamp: completedTimestamp,
      balanceAfter: newLeisureBalance,
      relatedId: questToComplete.id
    };

    setState(prev => {
      // Complete quest or update recurrence completion time & habit streak
      const updatedQuests = prev.quests.map(q => {
        if (q.id === id) {
          const isRecurring = (q.recurrence && q.recurrence !== 'None') || q.type === 'Habit';
          if (isRecurring) {
            const isAlreadyCompletedToday = q.lastCompletedDate === state.systemDate;
            const newStreak = isAlreadyCompletedToday ? (q.streakCount || 1) : ((q.streakCount || 0) + 1);
            const newBest = Math.max(q.bestStreak || 0, newStreak);
            return {
              ...q,
              status: 'Active' as const, // Remain Active so it can be completed again!
              completedAt: completedTimestamp,
              lastCompletedDate: state.systemDate,
              streakCount: newStreak,
              bestStreak: newBest,
              deadline: null,
              postponedFrom: null,
              postponedTo: null
            };
          } else {
            return {
              ...q,
              status: 'Completed' as const,
              completedAt: completedTimestamp,
              lastCompletedDate: state.systemDate,
              postponedFrom: null,
              postponedTo: null
            };
          }
        }
        return q;
      });

      // Add XP history and dynamically resolve any negative penalties if they earned the XP back!
      const updatedHistory = resolveRecoveredPenalties([newHistoryEntry, ...prev.xpHistory]);

      // Re-calculate user profile level and total XP dynamically based on completed quests history!
      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const level = calculatePlayerLevel(totalXp);

      // Update skills internal xp cache based on entire XP History!
      const updatedSkills = prev.skills.map(skill => {
        const skillXp = getSkillXpFromHistory(skill.id, updatedHistory, prev.skills);
        const skillLevel = calculatePlayerLevel(skillXp);
        const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
        return {
          ...skill,
          level: skillLevel,
          xp: skillXp,
          mastery
        };
      });

      const isDeactivatingQuest = 
        questToComplete.type.toUpperCase() === 'PENALTY' || 
        questToComplete.type.toUpperCase() === 'RECOVERY';

      const remainingDeactivatingQuestsCount = updatedQuests.filter(q => 
        q.status === 'Active' && 
        (q.type.toUpperCase() === 'PENALTY' || q.type.toUpperCase() === 'RECOVERY') && 
        q.id !== id
      ).length;

      const newRecoveryMode = isDeactivatingQuest 
        ? (remainingDeactivatingQuestsCount === 0 ? false : prev.profile.recoveryMode)
        : prev.profile.recoveryMode;

      const isKaffarahQuest = 
        questToComplete.name.includes('[KAFFĀRAH]') || 
        questToComplete.name.includes('[REMEDY]') ||
        (prev.muhasabahEntries || []).some(e => e.correctiveQuestId === id);

      let updatedMuhasabahEntries = prev.muhasabahEntries || [];
      if (isKaffarahQuest) {
        updatedMuhasabahEntries = updatedMuhasabahEntries.map(e => {
          if (e.correctiveQuestId === id || (e.correctiveQuestName && questToComplete.name.includes(e.correctiveQuestName))) {
            return { ...e, kaffarahCompleted: true };
          }
          return e;
        });
      }

      const addedFatigue = questToComplete.difficulty === 'Easy' ? 5 :
                           questToComplete.difficulty === 'Normal' ? 10 :
                           questToComplete.difficulty === 'Hard' ? 18 : 25;
      const currentFatigue = prev.profile.fatigueLevel || 0;
      const newFatigue = Math.min(100, currentFatigue + addedFatigue);
      const previousLevel = prev.profile.level || 1;
      const previousMaxHp = prev.profile.maxHp ?? getMaxHpForLevel(previousLevel);
      const levelUpHpGain = Math.max(0, level - previousLevel) * 5;
      const nextMaxHp = Math.max(previousMaxHp, getMaxHpForLevel(level));
      const nextHp = Math.min(nextMaxHp, (prev.profile.hp ?? previousMaxHp) + levelUpHpGain);

      const completionMessage = `Quest completed: "${questToComplete.name}" earned ${earnedXp} XP.`;

      addSystemMessage({
        sender: 'SYSTEM',
        category: isKaffarahQuest ? 'alert' : 'achievement',
        title: isKaffarahQuest ? '🌿 KAFFĀRAH RESTITUTION FULFILLED' : 'Directive Completed',
        content: isKaffarahQuest ? `Spiritual remedy "${questToComplete.name}" fulfilled. Sincere restitution recorded; spiritual equilibrium restored and shop locks lifted.` : completionMessage,
        priority: 'high'
      });

      return {
        ...prev,
        quests: updatedQuests,
        skills: updatedSkills,
        xpHistory: updatedHistory,
        timeHistory: [questTimeTx, ...(prev.timeHistory || [])],
        muhasabahEntries: updatedMuhasabahEntries,
        profile: {
          ...prev.profile,
          xp: totalXp,
          level,
          coins: (prev.profile.coins ?? 150) + totalCoinsEarned,
          timeCredits: newLeisureBalance,
          totalTimeEarned: (prev.profile.totalTimeEarned || 0) + earnedTimeCredits,
          hp: Math.min(nextMaxHp, nextHp + (isKaffarahQuest ? 35 : 2)),
          maxHp: nextMaxHp,
          momentum: Math.min(100, newMomentum + (isKaffarahQuest ? 15 : 0)),
          recoveryMode: newRecoveryMode,
          fatigueLevel: newFatigue,
          lastFatigueUpdateDate: prev.systemDate
        }
      };
    });
  };

  const reopenQuest = (id: string) => {
    const questToReopen = state.quests.find(q => q.id === id);
    if (!questToReopen) return;

    setState(prev => {
      const updatedQuests = prev.quests.map(q => 
        q.id === id ? { ...q, status: 'Active' as const, completedAt: null } : q
      );
      
      // Remove latest completion entry from history for this quest
      const latestHistoryEntryIndex = prev.xpHistory.findIndex(h => h.questId === id);
      const updatedHistory = latestHistoryEntryIndex !== -1 
        ? prev.xpHistory.filter((_, idx) => idx !== latestHistoryEntryIndex)
        : prev.xpHistory;

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const level = calculatePlayerLevel(totalXp);

      const updatedSkills = prev.skills.map(skill => {
        const skillXp = getSkillXpFromHistory(skill.id, updatedHistory, prev.skills);
        const skillLevel = calculatePlayerLevel(skillXp);
        const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
        return {
          ...skill,
          level: skillLevel,
          xp: skillXp,
          mastery
        };
      });

      return {
        ...prev,
        quests: updatedQuests,
        skills: updatedSkills,
        xpHistory: updatedHistory,
        profile: {
          ...prev.profile,
          xp: totalXp,
          level
        }
      };
    });
  };

  const failQuest = (id: string) => {
    const questToFail = state.quests.find(q => q.id === id);
    if (!questToFail) return;
    if (questToFail.status !== 'Active') return;

    const failedTimestamp = new Date().toISOString();
    const isDailyOrHabit = questToFail.type.toUpperCase() === 'HABIT' || questToFail.recurrence === 'Daily' || (questToFail.recurrence && questToFail.recurrence !== 'None');
    const isSideOrOptional = questToFail.type.toUpperCase() === 'SIDE' || questToFail.type.toUpperCase() === 'OPTIONAL';

    const origEstTime = typeof questToFail.estimatedTime === 'number' && questToFail.estimatedTime > 0 ? questToFail.estimatedTime : 30;
    const recoveryEstTime = Math.max(1, Math.round(origEstTime / 2));

    const origXp = (typeof questToFail.xp === 'number' && questToFail.xp > 0)
      ? questToFail.xp
      : (questToFail.difficulty === 'Boss' ? 250 : questToFail.difficulty === 'Hard' ? 100 : questToFail.difficulty === 'Easy' ? 25 : 50);
    const recoveryXp = Math.max(5, Math.round(origXp / 2));

    let penaltyXp = 50;
    if (questToFail.difficulty === 'Easy') penaltyXp = 25;
    else if (questToFail.difficulty === 'Normal') penaltyXp = 50;
    else if (questToFail.difficulty === 'Hard') penaltyXp = 100;
    else if (questToFail.difficulty === 'Boss') penaltyXp = 250;

    const isImportant = questToFail.type === 'Main' || questToFail.type === 'Boss' || questToFail.difficulty === 'Hard' || questToFail.difficulty === 'Boss';
    const basePenaltyXp = isImportant ? penaltyXp * 1.5 : penaltyXp;

    const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
    const penaltyReduction = getFailPenaltyMultiplier(activeJob);
    const finalPenaltyXp = Math.round(basePenaltyXp * penaltyReduction);

    const xpHistoryId = `h-fail-${Date.now()}`;
    const penaltyEntry: XPHistoryEntry | null = isSideOrOptional ? null : {
      id: xpHistoryId,
      questId: questToFail.id,
      questName: isDailyOrHabit ? `💀 PENALTY: Failed habit "${questToFail.name}"` : `💀 PENALTY: Failed "${questToFail.name}"`,
      xp: -Math.round(finalPenaltyXp),
      timestamp: failedTimestamp,
      skillIds: questToFail.relatedSkills
    };

    const momentumLoss = isSideOrOptional ? 0 : (isDailyOrHabit ? 10 : (isImportant ? 25 : 10));
    const newMomentum = Math.max(0, state.profile.momentum - momentumLoss);

    setState(prev => {
      const updatedQuests = prev.quests.map(q => {
        if (q.id === id) {
          return {
            ...q,
            status: 'Failed' as const,
            completedAt: failedTimestamp
          };
        }
        return q;
      });

      // Generate the recovery quest for failed objectives
      let spawnedQuest: Quest | null = null;
      if (isSideOrOptional) {
        spawnedQuest = null;
      } else {
        spawnedQuest = {
          id: `q-recovery-${questToFail.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: `🛡️ RECOVERY: Resolve "${questToFail.name}"`,
          description: `Recovery directive generated for failed/skipped ${questToFail.type} objective "${questToFail.name}". Complete this condensed routine (${recoveryEstTime} mins, +${recoveryXp} XP) to restore operations.`,
          status: 'Active' as const,
          difficulty: questToFail.difficulty === 'Custom' ? 'Normal' : questToFail.difficulty,
          type: 'Recovery',
          estimatedTime: recoveryEstTime,
          recurrence: 'None',
          energyLevel: 'Medium',
          deadline: questToFail.deadline || state.systemDate || getLocalDateString(),
          createdAt: new Date().toISOString(),
          completedAt: null,
          xp: recoveryXp,
          goalId: questToFail.goalId || null,
          projectId: questToFail.projectId || null,
          milestoneId: questToFail.milestoneId || null,
          subquests: [
            {
              id: `sq-rec-${questToFail.id}-1`,
              name: `Execute condensed ${recoveryEstTime}-min recovery session for "${questToFail.name}"`,
              completed: false
            }
          ],
          relatedSkills: questToFail.relatedSkills || []
        };
      }

      const finalQuestsList = spawnedQuest ? [...updatedQuests, spawnedQuest] : updatedQuests;

      const rawHistory = penaltyEntry ? [penaltyEntry, ...prev.xpHistory] : prev.xpHistory;
      const updatedHistory = resolveRecoveredPenalties(rawHistory);
      const totalXp = Math.max(0, updatedHistory.reduce((sum, h) => sum + h.xp, 0));
      const completedBossCount = getCompletedBossQuestsCount(finalQuestsList, updatedHistory);
      const gatedLevel = calculateGatedPlayerLevel(totalXp, completedBossCount);

      const updatedSkills = prev.skills.map(skill => {
        const skillXp = getSkillXpFromHistory(skill.id, updatedHistory, prev.skills);
        const skillLevel = calculatePlayerLevel(skillXp);
        const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
        return {
          ...skill,
          level: skillLevel,
          xp: skillXp,
          mastery
        };
      });

      const typeUpper = questToFail.type.toUpperCase();
      const activatesRecovery = isSideOrOptional ? false : (typeUpper === 'MAIN' || typeUpper === 'BOSS' || typeUpper === 'HABIT' || isDailyOrHabit);
      const newRecoveryMode = activatesRecovery ? true : prev.profile.recoveryMode;

      return {
        ...prev,
        quests: finalQuestsList,
        skills: updatedSkills,
        xpHistory: updatedHistory,
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gatedLevel.level,
          momentum: newMomentum,
          recoveryMode: newRecoveryMode
        }
      };
    });
  };

  const duplicateQuest = (id: string): string => {
    const source = state.quests.find(q => q.id === id);
    if (!source) return '';

    const newId = `q-${Date.now()}`;
    const duplicated: Quest = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'Active',
      completedAt: null,
      createdAt: new Date().toISOString(),
      subquests: source.subquests ? source.subquests.map(sq => ({
        ...sq,
        id: `sq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        completed: false
      })) : undefined
    };

    setState(prev => ({
      ...prev,
      quests: [...prev.quests, duplicated]
    }));

    return newId;
  };

  const addSubQuest = (questId: string, name: string) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => {
        if (q.id === questId) {
          const subquests = q.subquests || [];
          return {
            ...q,
            subquests: [
              ...subquests,
              { id: `sq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, name, completed: false }
            ]
          };
        }
        return q;
      })
    }));
  };

  const toggleSubQuest = (questId: string, subquestId: string) => {
    setState(prev => {
      let questCompletedNow = false;
      let questReopenedNow = false;
      let targetQuest: Quest | undefined = undefined;

      const updatedQuests = prev.quests.map(q => {
        if (q.id === questId) {
          const subquests = q.subquests || [];
          const updatedSubquests = subquests.map(sq => sq.id === subquestId ? { ...sq, completed: !sq.completed } : sq);
          const allDone = updatedSubquests.length > 0 && updatedSubquests.every(sq => sq.completed);

          targetQuest = q;

          if (allDone && q.status === 'Active') {
            const todayStr = prev.systemDate || getLocalDateString();
            const wasCompletedToday = q.completedAt && getLocalDateString(q.completedAt) === todayStr;
            if (!wasCompletedToday) {
              questCompletedNow = true;
            }
          } else if (!allDone && (q.status === 'Completed' || q.completedAt !== null)) {
            questReopenedNow = true;
          }

          return {
            ...q,
            subquests: updatedSubquests
          };
        }
        return q;
      });

      if (questCompletedNow && targetQuest) {
        const qToComplete = targetQuest as Quest;
        const completedTimestamp = new Date().toISOString();
        const xpHistoryId = `h-${Date.now()}`;
        const newHistoryEntry: XPHistoryEntry = {
          id: xpHistoryId,
          questId: qToComplete.id,
          questName: qToComplete.name,
          xp: qToComplete.xp,
          timestamp: completedTimestamp,
          skillIds: qToComplete.relatedSkills
        };

        const newMomentum = Math.min(100, prev.profile.momentum + 10);

        const finalQuests = updatedQuests.map(q => {
          if (q.id === questId) {
            if (q.recurrence && q.recurrence !== 'None') {
              return {
                ...q,
                status: 'Active' as const,
                completedAt: completedTimestamp
              };
            } else {
              return {
                ...q,
                status: 'Completed' as const,
                completedAt: completedTimestamp
              };
            }
          }
          return q;
        });

        const updatedHistory = resolveRecoveredPenalties([newHistoryEntry, ...prev.xpHistory]);
        const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
        const level = calculatePlayerLevel(totalXp);

        const updatedSkills = prev.skills.map(skill => {
          const skillXp = getSkillXpFromHistory(skill.id, updatedHistory, prev.skills);
          const skillLevel = calculatePlayerLevel(skillXp);
          const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
          return {
            ...skill,
            level: skillLevel,
            xp: skillXp,
            mastery
          };
        });

        return {
          ...prev,
          quests: finalQuests,
          skills: updatedSkills,
          xpHistory: updatedHistory,
          profile: {
            ...prev.profile,
            xp: totalXp,
            level,
            momentum: newMomentum
          }
        };
      }

      if (questReopenedNow && targetQuest) {
        const finalQuests = updatedQuests.map(q =>
          q.id === questId ? { ...q, status: 'Active' as const, completedAt: null } : q
        );

        const latestHistoryEntryIndex = prev.xpHistory.findIndex(h => h.questId === questId);
        const updatedHistory = latestHistoryEntryIndex !== -1
          ? prev.xpHistory.filter((_, idx) => idx !== latestHistoryEntryIndex)
          : prev.xpHistory;

        const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
        const level = calculatePlayerLevel(totalXp);

        const updatedSkills = prev.skills.map(skill => {
          const skillXp = getSkillXpFromHistory(skill.id, updatedHistory, prev.skills);
          const skillLevel = calculatePlayerLevel(skillXp);
          const mastery = Math.min(100, Math.round((skillLevel / 50) * 100));
          return {
            ...skill,
            level: skillLevel,
            xp: skillXp,
            mastery
          };
        });

        return {
          ...prev,
          quests: finalQuests,
          skills: updatedSkills,
          xpHistory: updatedHistory,
          profile: {
            ...prev.profile,
            xp: totalXp,
            level
          }
        };
      }

      return {
        ...prev,
        quests: updatedQuests
      };
    });
  };

  const updateSubQuest = (questId: string, subquestId: string, name: string) => {
    if (!name.trim()) return;
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => {
        if (q.id === questId) {
          const subquests = q.subquests || [];
          return {
            ...q,
            subquests: subquests.map(sq => sq.id === subquestId ? { ...sq, name: name.trim() } : sq)
          };
        }
        return q;
      })
    }));
  };

  const deleteSubQuest = (questId: string, subquestId: string) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => {
        if (q.id === questId) {
          const subquests = q.subquests || [];
          return {
            ...q,
            subquests: subquests.filter(sq => sq.id !== subquestId)
          };
        }
        return q;
      })
    }));
  };

  const mergeQuests = (idA: string, idB: string, mergedName: string, mergedDescription: string): string => {
    const qA = state.quests.find(q => q.id === idA);
    const qB = state.quests.find(q => q.id === idB);
    
    if (!qA || !qB) return '';

    const newId = `q-${Date.now()}`;
    // Sum times and XP
    const mergedTime = qA.estimatedTime + qB.estimatedTime;
    const mergedXp = qA.xp + qB.xp;
    const mergedSkills = Array.from(new Set([...qA.relatedSkills, ...qB.relatedSkills]));

    const mergedQuest: Quest = {
      id: newId,
      name: mergedName,
      description: mergedDescription,
      difficulty: qA.difficulty === 'Boss' || qB.difficulty === 'Boss' ? 'Boss' : qA.difficulty,
      estimatedTime: mergedTime,
      xp: mergedXp,
      goalId: qA.goalId || qB.goalId,
      projectId: qA.projectId || qB.projectId,
      milestoneId: qA.milestoneId || qB.milestoneId,
      relatedSkills: mergedSkills,
      type: qA.type === 'Main' || qB.type === 'Main' ? 'Main' : qA.type,
      status: 'Active',
      deadline: qA.deadline || qB.deadline,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      quests: [...prev.quests.filter(q => q.id !== idA && q.id !== idB), mergedQuest]
    }));

    return newId;
  };

  const splitQuest = (id: string, questAName: string, questBName: string, xpRatio: number) => {
    const source = state.quests.find(q => q.id === id);
    if (!source) return;

    const idA = `q-split-a-${Date.now()}`;
    const idB = `q-split-b-${Date.now()}`;

    const xpA = Math.max(10, Math.round(source.xp * xpRatio));
    const xpB = Math.max(10, source.xp - xpA);
    
    const timeA = Math.max(5, Math.round(source.estimatedTime * xpRatio));
    const timeB = Math.max(5, source.estimatedTime - timeA);

    const qA: Quest = {
      ...source,
      id: idA,
      name: questAName,
      xp: xpA,
      estimatedTime: timeA,
      createdAt: new Date().toISOString()
    };

    const qB: Quest = {
      ...source,
      id: idB,
      name: questBName,
      xp: xpB,
      estimatedTime: timeB,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      quests: [...prev.quests.filter(q => q.id !== id), qA, qB]
    }));
  };

  const processQuestReview = (id: string, action: 'rollover' | 'postpone' | 'forgive') => {
    setState(prev => {
      const todayStr = prev.systemDate || getLocalDateString();
      const tomorrowStr = addDays(todayStr, 1);

      const updatedQuests = prev.quests.map(q => {
        if (q.id === id) {
          if (action === 'rollover' || action === 'postpone') {
            return { 
              ...q, 
              deadline: tomorrowStr,
              postponedFrom: todayStr,
              postponedTo: tomorrowStr
            };
          } else if (action === 'forgive') {
            // Keep active, clear deadline and remove completedAt
            return { 
              ...q, 
              deadline: null, 
              completedAt: null, 
              postponedFrom: todayStr,
              postponedTo: null 
            };
          }
        }
        return q;
      });
      return {
        ...prev,
        quests: updatedQuests
      };
    });
  };

  // CRUD FOR SKILLS
  const addSkill = (name: string, tier?: 'Primary' | 'Secondary', parentId?: string | null): string => {
    const id = `s-${Date.now()}`;
    const newSkill: Skill = {
      id,
      name,
      level: 1,
      xp: 0,
      mastery: 0,
      relatedGoals: [],
      relatedProjects: [],
      tier: tier || 'Primary',
      parentId: parentId || null,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    return id;
  };

  const updateSkillName = (id: string, name: string) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, name } : s)
    }));
  };

  const updateSkillTier = (id: string, tier: 'Primary' | 'Secondary') => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, tier, parentId: tier === 'Primary' ? null : s.parentId } : s)
    }));
  };

  const updateSkillParent = (id: string, parentId: string | null) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, parentId } : s)
    }));
  };

  const toggleArchiveSkill = (id: string) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, archived: !s.archived } : s)
    }));
  };

  const mergeSkills = (sourceSkillId: string, targetSkillId: string) => {
    if (sourceSkillId === targetSkillId) return;
    setState(prev => {
      const sourceSkill = prev.skills.find(s => s.id === sourceSkillId);
      const targetSkill = prev.skills.find(s => s.id === targetSkillId);
      if (!sourceSkill || !targetSkill) return prev;

      // Transfer related skills in goals and quests
      const updatedGoals = prev.goals.map(g => {
        if (g.relatedSkills.includes(sourceSkillId)) {
          const newSkills = Array.from(new Set([...g.relatedSkills.filter(id => id !== sourceSkillId), targetSkillId]));
          return { ...g, relatedSkills: newSkills };
        }
        return g;
      });

      const updatedQuests = prev.quests.map(q => {
        if (q.relatedSkills.includes(sourceSkillId)) {
          const newSkills = Array.from(new Set([...q.relatedSkills.filter(id => id !== sourceSkillId), targetSkillId]));
          return { ...q, relatedSkills: newSkills };
        }
        return q;
      });

      // Update XP history entries that referenced sourceSkillId
      const updatedXpHistory = prev.xpHistory.map(h => {
        if (h.skillIds && h.skillIds.includes(sourceSkillId)) {
          const newSkills = Array.from(new Set([...h.skillIds.filter(id => id !== sourceSkillId), targetSkillId]));
          return { ...h, skillIds: newSkills };
        }
        return h;
      });

      // Remove source skill
      const remainingSkills = prev.skills.filter(s => s.id !== sourceSkillId);

      return {
        ...prev,
        goals: updatedGoals,
        quests: updatedQuests,
        xpHistory: updatedXpHistory,
        skills: remainingSkills
      };
    });
  };

  const deleteSkill = (id: string) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id),
      // Clean up skill references from goals and quests
      goals: prev.goals.map(g => ({ ...g, relatedSkills: g.relatedSkills.filter(sid => sid !== id) })),
      quests: prev.quests.map(q => ({ ...q, relatedSkills: q.relatedSkills.filter(sid => sid !== id) }))
    }));
  };

  const deleteUnusedSkills = (): number => {
    let deletedCount = 0;
    setState(prev => {
      const unusedSkillIds = prev.skills.filter(s => {
        const hasGoal = prev.goals.some(g => g.relatedSkills.includes(s.id));
        const hasQuest = prev.quests.some(q => q.relatedSkills.includes(s.id));
        const hasXpHistory = prev.xpHistory.some(h => h.skillIds && h.skillIds.includes(s.id));
        return !hasGoal && !hasQuest && !hasXpHistory;
      }).map(s => s.id);

      deletedCount = unusedSkillIds.length;
      if (deletedCount === 0) return prev;

      return {
        ...prev,
        skills: prev.skills.filter(s => !unusedSkillIds.includes(s.id))
      };
    });
    return deletedCount;
  };

  const clearAllSkills = () => {
    setState(prev => ({
      ...prev,
      skills: [],
      // Clean up all skill references
      goals: prev.goals.map(g => ({ ...g, relatedSkills: [] })),
      quests: prev.quests.map(q => ({ ...q, relatedSkills: [] }))
    }));
  };

  const equipSkillTitle = (id: string, title: string) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, equippedTitle: title } : s)
    }));
  };

  // Adjust base level of Attribute
  const updateAttributeBase = (id: string, level: number) => {
    const safeLevel = Math.max(1, Math.min(100, Math.round(level) || 1));
    setState(prev => ({
      ...prev,
      attributes: prev.attributes.map(a => a.id === id ? { ...a, level: safeLevel } : a)
    }));
  };

  // Restart an individual attribute back to Level 1
  const restartAttribute = (id: string) => {
    const now = new Date().toISOString();
    const target = state.attributes.find(a => a.id === id);
    setState(prev => ({
      ...prev,
      attributes: prev.attributes.map(a => a.id === id ? {
        ...a,
        level: 1,
        progress: 0,
        resetAt: now,
        pointsIntoLevel: 0,
        pointsRequiredForNextLevel: 14,
        totalPoints: 0
      } : a)
    }));
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'alert',
      title: `${target?.name || 'Attribute'} Recalibrated`,
      content: `${target?.name || 'Attribute'} has been restarted to Level 1 (0% progress). Progression curve recalibrated.`,
      priority: 'medium'
    });
  };

  // Reward Shop & Coins Operations
  const isShopLocked = React.useMemo(() => {
    const todayStr = state.systemDate || getLocalDateString();
    const REQUIRED_SHOP_LOCK_TYPES = ['MAIN', 'BOSS', 'PENALTY', 'HABIT', 'RECOVERY'];

    // Check if there are active unfulfilled Kaffārah / Spiritual Remedy quests from Muhasabah
    const hasPendingKaffarah = (state.quests || []).some(q => 
      q.status === 'Active' && 
      (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]'))
    );
    if (hasPendingKaffarah) return true;

    const baseQuests = (state.quests || []).filter(q => {
      if (state.profile.recoveryMode) {
        if (q.type !== 'Recovery' && q.type !== 'Optional' && q.type !== 'Penalty') return false;
      }
      return true;
    });

    const todayQuests = baseQuests.filter(q => {
      const qType = (q.type || 'Main').toUpperCase();
      if (!REQUIRED_SHOP_LOCK_TYPES.includes(qType)) return false;

      const isFinished = isQuestFinishedForToday(q);
      if (isFinished) {
        return q.status !== 'Failed';
      }
      if (q.status !== 'Active') return false;

      const isScheduled = isQuestScheduledForDate(q, todayStr);
      if (!isScheduled) return false;

      if (q.deadline && q.deadline > todayStr) return false;

      return true;
    });

    return todayQuests.some(q => !isQuestFinishedForToday(q));
  }, [state.quests, state.systemDate, state.profile.recoveryMode, isQuestFinishedForToday, isQuestScheduledForDate]);

  const purchaseShopItem = (itemId: string): { success: boolean; message: string } => {
    const item = (state.shopItems || DEFAULT_SHOP_ITEMS).find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Shop item not found.' };
    }

    const currentCoins = state.profile.coins ?? 150;
    const currentTimeCredits = state.profile.timeCredits ?? 60;

    if (item.costCoins > 0 && currentCoins < item.costCoins) {
      return {
        success: false,
        message: `Insufficient Coins! You have ${currentCoins} 🪙, but "${item.name}" costs ${item.costCoins} 🪙.`
      };
    }

    if (item.costTimeMinutes && item.costTimeMinutes > 0 && currentTimeCredits < item.costTimeMinutes) {
      return {
        success: false,
        message: `Insufficient Time Credits! You have ${currentTimeCredits}m leisure bank, but "${item.name}" costs ${item.costTimeMinutes}m of earned rest.`
      };
    }

    const timestamp = getSystemTimestamp(state.systemDate);
    const isPerkInstant = item.category === 'System Perk';

    const newReward: RedeemedReward = {
      id: `reward-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      costCoins: item.costCoins,
      costTimeMinutes: item.costTimeMinutes,
      category: item.category,
      icon: item.icon,
      redeemedAt: timestamp,
      status: isPerkInstant ? 'Used' : 'Available',
      usedAt: isPerkInstant ? timestamp : null
    };

    let xpSurgeHistoryEntry: XPHistoryEntry | null = null;

    setState(prev => {
      const remainingCoins = (prev.profile.coins ?? 150) - (item.costCoins || 0);
      const timeSpent = item.costTimeMinutes || 0;
      const remainingTimeCredits = Math.max(0, (prev.profile.timeCredits ?? 60) - timeSpent);

      let updatedProfile = { 
        ...prev.profile, 
        coins: remainingCoins,
        timeCredits: remainingTimeCredits,
        totalTimeSpent: (prev.profile.totalTimeSpent || 0) + timeSpent
      };

      let timeTx: TimeTransaction | null = null;
      if (timeSpent > 0) {
        timeTx = {
          id: `time-spend-${Date.now()}`,
          type: 'leisure_redemption',
          minutes: -timeSpent,
          reason: `Leisure Voucher: "${item.name}"`,
          timestamp,
          balanceAfter: remainingTimeCredits,
          relatedId: item.id
        };
      }

      // Apply instant perk effects
      if (item.effectType === 'PERK_FOCUS_SHIELD') {
        updatedProfile.focusShields = (updatedProfile.focusShields || 0) + (item.value || 1);
      } else if (item.effectType === 'PERK_MOMENTUM_BOOST') {
        updatedProfile.momentum = Math.min(100, updatedProfile.momentum + (item.value || 25));
      } else if (item.effectType === 'PERK_XP_SURGE') {
        xpSurgeHistoryEntry = {
          id: `h-xp-surge-${Date.now()}`,
          questId: null,
          questName: `✨ XP SURGE TOKEN PURCHASED (+${item.value || 50} Bonus XP)`,
          xp: item.value || 50,
          timestamp,
          skillIds: []
        };
      }

      let updatedHistory = prev.xpHistory;
      if (xpSurgeHistoryEntry) {
        updatedHistory = [xpSurgeHistoryEntry, ...prev.xpHistory];
        const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
        const level = calculatePlayerLevel(totalXp);
        updatedProfile.xp = totalXp;
        updatedProfile.level = level;
      }

      return {
        ...prev,
        profile: updatedProfile,
        xpHistory: updatedHistory,
        timeHistory: timeTx ? [timeTx, ...(prev.timeHistory || [])] : prev.timeHistory,
        inventory: [newReward, ...(prev.inventory || [])]
      };
    });

    addSystemMessage({
      sender: 'OPERATOR',
      category: 'achievement',
      title: `🛍️ REWARD PURCHASED: ${item.name.toUpperCase()}`,
      content: `Spent ${item.costCoins} Coins. ${isPerkInstant ? 'Perk applied instantly!' : 'Voucher added to your Inventory. Enjoy your treat!'}`
    });

    return {
      success: true,
      message: `Purchased "${item.name}" for ${item.costCoins} 🪙!`
    };
  };

  const useInventoryItem = (inventoryId: string): { success: boolean; message: string } => {
    const reward = (state.inventory || []).find(r => r.id === inventoryId);
    if (!reward) {
      return { success: false, message: 'Reward voucher not found.' };
    }
    if (reward.status === 'Used') {
      return { success: false, message: 'This reward voucher has already been redeemed.' };
    }

    const timestamp = getSystemTimestamp(state.systemDate);

    setState(prev => ({
      ...prev,
      inventory: (prev.inventory || []).map(r =>
        r.id === inventoryId ? { ...r, status: 'Used' as const, usedAt: timestamp } : r
      )
    }));

    addSystemMessage({
      sender: 'OPERATOR',
      category: 'achievement',
      title: `🎉 REWARD CLAIMED: ${reward.itemName.toUpperCase()}`,
      content: `Redeemed voucher for "${reward.itemName}". Great job investing in your productivity & rewards balance!`
    });

    return {
      success: true,
      message: `Successfully redeemed "${reward.itemName}"!`
    };
  };

  const clearVoucherHistory = () => {
    setState(prev => ({
      ...prev,
      inventory: (prev.inventory || []).filter(r => r.status !== 'Used')
    }));
  };

  const clearAllVouchers = () => {
    setState(prev => ({
      ...prev,
      inventory: []
    }));
  };

  const addCustomShopItem = (newItem: Omit<ShopItem, 'id' | 'createdAt'>): string => {
    const id = `shop-custom-${Date.now()}`;
    const timestamp = getSystemTimestamp(state.systemDate);
    const item: ShopItem = {
      ...newItem,
      id,
      isCustom: true,
      createdAt: timestamp
    };

    setState(prev => ({
      ...prev,
      shopItems: [...(prev.shopItems || DEFAULT_SHOP_ITEMS), item]
    }));

    return id;
  };

  const updateShopItem = (updatedItem: ShopItem) => {
    setState(prev => {
      const currentItems = prev.shopItems && prev.shopItems.length > 0 ? prev.shopItems : DEFAULT_SHOP_ITEMS;
      const index = currentItems.findIndex(i => i.id === updatedItem.id);
      let nextItems: ShopItem[];
      if (index >= 0) {
        nextItems = [...currentItems];
        nextItems[index] = updatedItem;
      } else {
        nextItems = [...currentItems, updatedItem];
      }
      return {
        ...prev,
        shopItems: nextItems
      };
    });
  };

  const deleteShopItem = (itemId: string) => {
    setState(prev => {
      const currentItems = prev.shopItems && prev.shopItems.length > 0 ? prev.shopItems : DEFAULT_SHOP_ITEMS;
      return {
        ...prev,
        shopItems: currentItems.filter(i => i.id !== itemId)
      };
    });
  };

  const deleteCustomShopItem = (itemId: string) => {
    deleteShopItem(itemId);
  };

  const resetDefaultShopItems = () => {
    setState(prev => ({
      ...prev,
      shopItems: DEFAULT_SHOP_ITEMS
    }));
  };

  const addCoins = (amount: number, reason?: string) => {
    setState(prev => {
      const current = prev.profile.coins ?? 150;
      const nextCoins = Math.max(0, current + amount);
      return {
        ...prev,
        profile: {
          ...prev.profile,
          coins: nextCoins
        }
      };
    });

    if (reason) {
      addSystemMessage({
        sender: 'SYSTEM',
        category: 'alert',
        title: `🪙 COIN BALANCE UPDATED (${amount >= 0 ? '+' : ''}${amount} Coins)`,
        content: reason
      });
    }
  };

  // Profile Adjustments
  const toggleRecoveryMode = () => {
    // Recovery protocol toggle is restricted / locked by system override
    return;
  };

  const updateProfileFocus = (focusText: string, goalId: string | null) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        currentFocus: focusText,
        focusGoalId: goalId
      }
    }));
  };

  const updateJob = (jobId: string) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        jobId
      }
    }));
  };

  const updateTitle = (titleId: string) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        equippedTitleId: titleId
      }
    }));
  };

  const getJobLevelHelper = (jobId: string): number => {
    return getJobLevel(jobId, stateRef.current);
  };

  const getTitleLevelHelper = (titleId: string): number => {
    return getTitleLevel(titleId, stateRef.current);
  };

  const levelUpJob = (jobId: string, targetLvl?: number, forceLevelUp?: boolean): { success: boolean; message: string } => {
    const currentLvl = getJobLevel(jobId, stateRef.current);
    const nextLvl = targetLvl ? Math.min(7, Math.max(1, targetLvl)) : (currentLvl < 7 ? currentLvl + 1 : 7);
    if (currentLvl >= 7 && nextLvl <= currentLvl && !forceLevelUp) {
      return { success: false, message: 'Job Class is already at MAX Level 7 (Apex Legend)!' };
    }
    const allJobs = getAllJobs(stateRef.current.customJobs || [], stateRef.current.deletedJobIds || []);
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job Class not found' };

    if (!forceLevelUp) {
      const evalRes = evaluateLevelConditions(job, nextLvl, stateRef.current);
      if (!evalRes.isMet) {
        return { 
          success: false, 
          message: `Level ${nextLvl} requirements not met: ${evalRes.unmetConditions.join(', ')}` 
        };
      }
    }

    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        jobLevels: {
          ...(prev.profile.jobLevels || {}),
          [jobId]: nextLvl
        }
      }
    }));

    return { success: true, message: `Elevated ${job.name} to Level ${nextLvl} (${LEVEL_RANK_NAMES[nextLvl] || 'Master'})!` };
  };

  const levelUpTitle = (titleId: string, targetLvl?: number, forceLevelUp?: boolean): { success: boolean; message: string } => {
    const currentLvl = getTitleLevel(titleId, stateRef.current);
    const nextLvl = targetLvl ? Math.min(7, Math.max(1, targetLvl)) : (currentLvl < 7 ? currentLvl + 1 : 7);
    if (currentLvl >= 7 && nextLvl <= currentLvl && !forceLevelUp) {
      return { success: false, message: 'Honorific Title is already at MAX Level 7!' };
    }
    const allTitles = getAllTitles(stateRef.current.customTitles || [], stateRef.current.deletedTitleIds || []);
    const title = allTitles.find(t => t.id === titleId);
    if (!title) return { success: false, message: 'Title not found' };

    if (!forceLevelUp) {
      const evalRes = evaluateLevelConditions(title, nextLvl, stateRef.current);
      if (!evalRes.isMet) {
        return { 
          success: false, 
          message: `Level ${nextLvl} requirements not met: ${evalRes.unmetConditions.join(', ')}` 
        };
      }
    }

    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        titleLevels: {
          ...(prev.profile.titleLevels || {}),
          [titleId]: nextLvl
        }
      }
    }));

    return { success: true, message: `Elevated Honorific Title "${title.name}" to Level ${nextLvl} (${LEVEL_RANK_NAMES[nextLvl] || 'Master'})!` };
  };

  const rechargeFatigue = (amount: number = 25) => {
    setState(prev => {
      const current = prev.profile.fatigueLevel || 0;
      const newFatigue = Math.max(0, current - amount);
      return {
        ...prev,
        profile: {
          ...prev.profile,
          fatigueLevel: newFatigue,
          lastFatigueUpdateDate: prev.systemDate
        }
      };
    });
  };

  const addCustomJob = (job: Omit<JobSpec, 'id' | 'isCustom'>): string => {
    const id = `cjob-${Date.now()}`;
    const newJob: JobSpec = {
      ...job,
      id,
      isCustom: true
    };
    setState(prev => ({
      ...prev,
      customJobs: [...(prev.customJobs || []), newJob]
    }));
    return id;
  };

  const updateJobSpec = (updatedJob: JobSpec) => {
    setState(prev => {
      const customJobs = prev.customJobs || [];
      const index = customJobs.findIndex(j => j.id === updatedJob.id);
      let newCustomJobs: JobSpec[];
      if (index >= 0) {
        newCustomJobs = [...customJobs];
        newCustomJobs[index] = updatedJob;
      } else {
        newCustomJobs = [...customJobs, updatedJob];
      }
      return {
        ...prev,
        customJobs: newCustomJobs
      };
    });
  };

  const deleteJobSpec = (jobId: string) => {
    setState(prev => {
      const newCustomJobs = (prev.customJobs || []).filter(j => j.id !== jobId);
      const newDeletedJobIds = Array.from(new Set([...(prev.deletedJobIds || []), jobId]));
      const allJobsRemaining = getAllJobs(newCustomJobs, newDeletedJobIds);
      const fallbackJobId = allJobsRemaining[0]?.id || 'job-cyber-architect';

      return {
        ...prev,
        customJobs: newCustomJobs,
        deletedJobIds: newDeletedJobIds,
        profile: {
          ...prev.profile,
          jobId: prev.profile.jobId === jobId ? fallbackJobId : prev.profile.jobId
        }
      };
    });
  };

  const deleteCustomJob = (jobId: string) => {
    deleteJobSpec(jobId);
  };

  const addCustomTitle = (title: Omit<TitleSpec, 'id' | 'isCustom'>): string => {
    const id = `ctitle-${Date.now()}`;
    const newTitle: TitleSpec = {
      ...title,
      id,
      isCustom: true
    };
    setState(prev => ({
      ...prev,
      customTitles: [...(prev.customTitles || []), newTitle]
    }));
    return id;
  };

  const updateTitleSpec = (updatedTitle: TitleSpec) => {
    setState(prev => {
      const customTitles = prev.customTitles || [];
      const index = customTitles.findIndex(t => t.id === updatedTitle.id);
      let newCustomTitles: TitleSpec[];
      if (index >= 0) {
        newCustomTitles = [...customTitles];
        newCustomTitles[index] = updatedTitle;
      } else {
        newCustomTitles = [...customTitles, updatedTitle];
      }
      return {
        ...prev,
        customTitles: newCustomTitles
      };
    });
  };

  const deleteTitleSpec = (titleId: string) => {
    setState(prev => {
      const newCustomTitles = (prev.customTitles || []).filter(t => t.id !== titleId);
      const newDeletedTitleIds = Array.from(new Set([...(prev.deletedTitleIds || []), titleId]));
      const allTitlesRemaining = getAllTitles(newCustomTitles, newDeletedTitleIds);
      const fallbackTitleId = allTitlesRemaining[0]?.id || 'title-novice-operator';

      return {
        ...prev,
        customTitles: newCustomTitles,
        deletedTitleIds: newDeletedTitleIds,
        profile: {
          ...prev.profile,
          equippedTitleId: prev.profile.equippedTitleId === titleId ? fallbackTitleId : prev.profile.equippedTitleId
        }
      };
    });
  };

  const deleteCustomTitle = (titleId: string) => {
    deleteTitleSpec(titleId);
  };

  const resetAllData = () => {
    setState(INITIAL_STATE);
  };

  const resetLevelAndXp = () => {
    setState(prev => ({
      ...prev,
      xpHistory: [],
      quests: prev.quests.map(q => ({ ...q, status: 'Active' as const, completedAt: null })),
      profile: {
        ...prev.profile,
        level: 1,
        xp: 0,
        momentum: 50
      }
    }));
  };

  const clearAllQuests = () => {
    setState(prev => ({
      ...prev,
      quests: []
    }));
  };

  const resetBaselineAttributes = () => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      attributesResetAt: now,
      attributes: prev.attributes.map(a => ({
        ...a,
        level: 1,
        progress: 0,
        resetAt: now,
        pointsIntoLevel: 0,
        pointsRequiredForNextLevel: 14,
        totalPoints: 0
      }))
    }));
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'alert',
      title: 'All Attributes Restarted',
      content: 'All core attributes have been restarted to Level 1 (0% progress). Progression curve recalibrated.',
      priority: 'high'
    });
  };

  // Export / Import JSON representation
  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      // Validate schema
      if (Array.isArray(parsed.goals) && Array.isArray(parsed.quests) && Array.isArray(parsed.skills)) {
        setState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON data:', e);
    }
    return false;
  };

  // Deep Analytics calculation
  const getAnalytics = () => {
    const completedQuestsCount = state.quests.filter(isQuestDone).length;
    const totalQuests = state.quests.length;
    const overallCompletionRate = totalQuests > 0 ? Math.round((completedQuestsCount / totalQuests) * 100) : 0;
    
    const goalsCompleted = state.goals.filter(g => getGoalProgress(g.id) === 100).length;
    const projectsCompleted = state.projects.filter(p => getProjectProgress(p.id) === 100).length;
    const milestonesCompleted = state.milestones.filter(m => getMilestoneProgress(m.id) === 100).length;

    // Time calculations
    const today = state.systemDate || getLocalDateString();
    
    // Today's XP
    const todayEvents = state.xpHistory.filter(h => h.timestamp.startsWith(today));
    const todayXp = todayEvents.reduce((sum, h) => sum + h.xp, 0);

    // Weekly XP
    const oneWeekAgoStr = addDays(today, -7);
    const weeklyEvents = state.xpHistory.filter(h => h.timestamp.split('T')[0] >= oneWeekAgoStr);
    const weeklyXp = weeklyEvents.reduce((sum, h) => sum + h.xp, 0);

    // Monthly XP
    const oneMonthAgoStr = addDays(today, -30);
    const monthlyEvents = state.xpHistory.filter(h => h.timestamp.split('T')[0] >= oneMonthAgoStr);
    const monthlyXp = monthlyEvents.reduce((sum, h) => sum + h.xp, 0);

    // Calculate daily XP breakdown for charts (past 7 days)
    const dailyXpTrend: { date: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = addDays(today, -i);
      const dayEvents = state.xpHistory.filter(h => h.timestamp.startsWith(dateStr));
      const dayXp = dayEvents.reduce((sum, h) => sum + h.xp, 0);
      
      const d = parseDateSafe(dateStr);
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyXpTrend.push({ date: formattedDate, xp: dayXp });
    }

    // Most Improved/Active Skill (based on XP)
    let mostImprovedSkill = 'None';
    let maxSkillXp = -1;
    state.skills.forEach(skill => {
      const { xp } = getSkillXpAndLevel(skill.id);
      if (xp > maxSkillXp) {
        maxSkillXp = xp;
        mostImprovedSkill = skill.name;
      }
    });

    // Most and Least Active Goal (based on completed quests)
    let mostActiveGoal = 'None';
    let maxGoalQuests = -1;
    let leastActiveGoal = 'None';
    let minGoalQuests = Infinity;

    state.goals.forEach(goal => {
      const count = state.xpHistory.filter(h => {
        const q = state.quests.find(quest => quest.id === h.questId);
        return q && q.goalId === goal.id;
      }).length;
      if (count > maxGoalQuests) {
        maxGoalQuests = count;
        mostActiveGoal = goal.name;
      }
      if (count < minGoalQuests) {
        minGoalQuests = count;
        leastActiveGoal = goal.name;
      }
    });

    if (state.goals.length === 0) {
      leastActiveGoal = 'None';
    }

    // Strongest & Weakest Attributes
    const attributes = getAttributes();
    let strongestAttr = 'None';
    let maxAttrLvl = -1;
    let weakestAttr = 'None';
    let minAttrLvl = Infinity;

    attributes.forEach(attr => {
      if (attr.level > maxAttrLvl) {
        maxAttrLvl = attr.level;
        strongestAttr = attr.name;
      }
      if (attr.level < minAttrLvl) {
        minAttrLvl = attr.level;
        weakestAttr = attr.name;
      }
    });

    const activeQuests = state.quests.filter(q => q.status === 'Active');
    const totalActiveTime = activeQuests.reduce((sum, q) => sum + q.estimatedTime, 0);
    
    let workloadStatus = 'Optimal';
    if (totalActiveTime > 240) workloadStatus = 'Heavy Workload';
    else if (totalActiveTime > 120) workloadStatus = 'Moderate Workload';
    else if (totalActiveTime === 0) workloadStatus = 'No Workload';
    else workloadStatus = 'Light Workload';

    return {
      overallCompletionRate,
      goalsCompleted,
      projectsCompleted,
      milestonesCompleted,
      todayXp,
      weeklyXp,
      monthlyXp,
      averageXp: Math.round(weeklyXp / 7),
      dailyXpTrend,
      mostImprovedSkill,
      mostActiveGoal,
      leastActiveGoal,
      strongestAttr,
      weakestAttr,
      workloadStatus,
      totalActiveTime
    };
  };

  const addXp = (amount: number, reason?: string, skillIds: string[] = []) => {
    const entry: XPHistoryEntry = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      questId: null,
      questName: reason || 'System XP Gain',
      xp: amount,
      timestamp: new Date().toISOString(),
      skillIds
    };
    setState(prev => ({
      ...prev,
      xpHistory: [entry, ...(prev.xpHistory || [])]
    }));
  };

  // --- TEMPORAL CURRENCY & CAPITAL ALLOCATION ENGINE ---
  const addTimeCredits = (minutes: number, reason: string, type: TimeTransactionType = 'manual_adjustment', relatedId?: string) => {
    setState(prev => {
      const current = prev.profile.timeCredits ?? 60;
      const newBal = current + minutes;
      const tx: TimeTransaction = {
        id: `time-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        minutes,
        reason,
        timestamp: getSystemTimestamp(prev.systemDate),
        balanceAfter: newBal,
        relatedId
      };
      return {
        ...prev,
        timeHistory: [tx, ...(prev.timeHistory || [])],
        profile: {
          ...prev.profile,
          timeCredits: newBal,
          totalTimeEarned: minutes > 0 ? (prev.profile.totalTimeEarned || 0) + minutes : (prev.profile.totalTimeEarned || 0)
        }
      };
    });
  };

  const spendTimeCredits = (minutes: number, reason: string, relatedId?: string): { success: boolean; message: string } => {
    const current = state.profile.timeCredits ?? 60;
    if (current < minutes) {
      return {
        success: false,
        message: `Insufficient Time Credits! You have ${current}m leisure bank, but this requires ${minutes}m.`
      };
    }

    setState(prev => {
      const curr = prev.profile.timeCredits ?? 60;
      const newBal = Math.max(0, curr - minutes);
      const tx: TimeTransaction = {
        id: `time-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'leisure_redemption',
        minutes: -minutes,
        reason,
        timestamp: getSystemTimestamp(prev.systemDate),
        balanceAfter: newBal,
        relatedId
      };
      return {
        ...prev,
        timeHistory: [tx, ...(prev.timeHistory || [])],
        profile: {
          ...prev.profile,
          timeCredits: newBal,
          totalTimeSpent: (prev.profile.totalTimeSpent || 0) + minutes
        }
      };
    });

    return { success: true, message: `Redeemed ${minutes}m of earned leisure.` };
  };

  const setDailyWakingHours = (hours: number) => {
    const clamped = Math.max(8, Math.min(20, hours));
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        dailyWakingHours: clamped
      }
    }));
  };

  const repayTimeDebt = (minutes: number) => {
    setState(prev => {
      const currDebt = prev.profile.timeDebt || 0;
      const repaid = Math.min(currDebt, minutes);
      const newDebt = Math.max(0, currDebt - repaid);
      const tx: TimeTransaction = {
        id: `time-repay-${Date.now()}`,
        type: 'manual_adjustment',
        minutes: repaid,
        reason: `Temporal Debt Repayment via focus/remedy`,
        timestamp: getSystemTimestamp(prev.systemDate),
        balanceAfter: prev.profile.timeCredits ?? 60
      };
      return {
        ...prev,
        timeHistory: [tx, ...(prev.timeHistory || [])],
        profile: {
          ...prev.profile,
          timeDebt: newDebt
        }
      };
    });
  };

  const getTemporalCapitalInfo = (): TemporalCapitalInfo => {
    const wakingHours = state.profile.dailyWakingHours || 16;
    const dailyWakingMinutes = wakingHours * 60;
    const todayStr = state.systemDate;

    // Invested minutes today: focus time + actual time on quests completed today
    const focusMinutesToday = state.profile.focusMinutesToday || 0;
    const completedQuestsToday = (state.quests || []).filter(q => q.lastCompletedDate === todayStr || (q.status === 'Completed' && q.completedAt?.startsWith(todayStr)));
    const questMinutesToday = completedQuestsToday.reduce((sum, q) => sum + (q.estimatedTime || 15), 0);
    const investedMinutesToday = Math.max(focusMinutesToday, questMinutesToday);

    // Committed minutes today: active quests scheduled for today
    const activeQuestsToday = (state.quests || []).filter(q => {
      if (q.status !== 'Active') return false;
      if (q.lastCompletedDate === todayStr) return false;
      return isQuestScheduledForDate(q, todayStr);
    });
    const committedMinutesToday = activeQuestsToday.reduce((sum, q) => sum + (q.estimatedTime || 30), 0);

    const totalAllocated = investedMinutesToday + committedMinutesToday;
    const uncommittedMinutes = Math.max(0, dailyWakingMinutes - totalAllocated);
    const isOverdrawn = totalAllocated > dailyWakingMinutes;
    const overdraftMinutes = Math.max(0, totalAllocated - dailyWakingMinutes);
    const utilizationPercent = Math.min(150, Math.round((totalAllocated / dailyWakingMinutes) * 100));

    return {
      dailyWakingMinutes,
      investedMinutesToday,
      committedMinutesToday,
      uncommittedMinutes,
      leisureMinutesBalance: state.profile.timeCredits ?? 60,
      timeDebt: state.profile.timeDebt || 0,
      isOverdrawn,
      overdraftMinutes,
      utilizationPercent
    };
  };

  const startActiveRestSession = (title: string, minutes: number) => {
    const res = spendTimeCredits(minutes, `Active Rest Block: "${title}"`);
    if (!res.success) {
      addSystemMessage({
        sender: 'SANCTUM_GUARDIAN',
        category: 'alert',
        title: 'Insufficient Leisure Currency',
        content: res.message,
        priority: 'high'
      });
      return;
    }

    const session: ActiveRestSession = {
      id: `rest-${Date.now()}`,
      title,
      totalMinutes: minutes,
      remainingSeconds: minutes * 60,
      startedAt: new Date().toISOString(),
      paused: false
    };

    setState(prev => ({
      ...prev,
      activeRestSession: session
    }));

    addSystemMessage({
      sender: 'SANCTUM_GUARDIAN',
      category: 'achievement',
      title: '🌿 Active Rest Initiated',
      content: `Started ${minutes}m guilt-free rest block: "${title}". Rest with peaceful intentionality.`,
      priority: 'low'
    });
  };

  const stopActiveRestSession = () => {
    setState(prev => ({
      ...prev,
      activeRestSession: null
    }));
  };

  const pauseActiveRestSession = () => {
    setState(prev => {
      if (!prev.activeRestSession) return prev;
      return {
        ...prev,
        activeRestSession: {
          ...prev.activeRestSession,
          paused: true
        }
      };
    });
  };

  const resumeActiveRestSession = () => {
    setState(prev => {
      if (!prev.activeRestSession) return prev;
      return {
        ...prev,
        activeRestSession: {
          ...prev.activeRestSession,
          paused: false
        }
      };
    });
  };

  // Active Rest Session Ticker
  useEffect(() => {
    if (!state.activeRestSession || state.activeRestSession.paused) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.activeRestSession || prev.activeRestSession.paused) return prev;
        if (prev.activeRestSession.remainingSeconds <= 1) {
          addSystemMessage({
            sender: 'SANCTUM_GUARDIAN',
            category: 'achievement',
            title: '🌿 REST CYCLE CONCLUDED',
            content: `Your ${prev.activeRestSession.totalMinutes}m earned rest session has concluded. Return to your sacred post with renewed vigor.`,
            priority: 'high'
          });
          return {
            ...prev,
            activeRestSession: null
          };
        }
        return {
          ...prev,
          activeRestSession: {
            ...prev.activeRestSession,
            remainingSeconds: prev.activeRestSession.remainingSeconds - 1
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeRestSession?.paused, state.activeRestSession?.id]);

  // Sync Visual Codex DOM attributes on mount and on changes
  useEffect(() => {
    const codex = state.visualCodex || getStoredVisualCodexSettings();
    applyVisualCodexToDOM(codex);
  }, [state.visualCodex]);

  const updateVisualCodexSettings = (updates: Partial<VisualCodexSettings>) => {
    setState(prev => {
      const current = prev.visualCodex || getStoredVisualCodexSettings();
      const updated: VisualCodexSettings = {
        ...current,
        ...updates
      };
      saveStoredVisualCodexSettings(updated);
      applyVisualCodexToDOM(updated);
      return {
        ...prev,
        visualCodex: updated
      };
    });
  };

  const setTheme = (themeId: CodexThemeId) => {
    updateVisualCodexSettings({ theme: themeId });
  };

  // ─── Automated Weekly Muḥāsabah Cycle & Reconciliation ────────────────────────
  // Reconciles completed weekly cycles (whether opening on Sunday or catching up
  // after missing Sunday). Safe and idempotent via reconcileMissedWeeks.
  useEffect(() => {
    const currentSysDate = state.systemDate || getLocalDateString();
    if (isGeneratingWeeklySummaryRef.current) return;
    if (state.lastWeeklyMuhasabahResetDate === currentSysDate) return;

    const todayObj = parseDateSafe(currentSysDate);
    const isSunday = todayObj.getDay() === 0;
    const lastReset = state.lastWeeklyMuhasabahResetDate;
    const hasMissedReset = Boolean(lastReset && lastReset < currentSysDate);

    if (isSunday || hasMissedReset || !lastReset) {
      runWeeklyMuhasabahCycle(currentSysDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.systemDate, state.lastWeeklyMuhasabahResetDate]);

  // Battery Saver & Eco Defense Functions
  const updateBatterySettings = (updates: Partial<BatterySettings>) => {
    setState(prev => {
      const current = prev.batterySettings || {
        batterySaverMode: true,
        autoEcoLowBattery: true,
        animationThrottle: 'Off',
        oledMode: false,
        maxFpsCap: 60
      };
      const nextBatterySaverMode = updates.batterySaverMode ?? current.batterySaverMode;
      const updated: BatterySettings = {
        ...current,
        ...updates,
        batterySaverMode: nextBatterySaverMode,
        animationThrottle: (updates.animationThrottle ?? current.animationThrottle ?? 'Off') as 'Full' | 'Reduced' | 'Off'
      };

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('battery-saver-active', updated.batterySaverMode);

        if (updated.oledMode) {
          document.documentElement.classList.add('oled-mode-active');
        } else {
          document.documentElement.classList.remove('oled-mode-active');
        }
      }

      return { ...prev, batterySettings: updated };
    });
  };

  const toggleBatterySaverMode = () => {
    setState(prev => {
      const active = prev.batterySettings?.batterySaverMode ?? true;
      const next = !active;
      const updated = {
        ...(prev.batterySettings || {
          batterySaverMode: true,
          autoEcoLowBattery: true,
          animationThrottle: 'Off',
          oledMode: false,
          maxFpsCap: 60
        }),
        batterySaverMode: next,
        animationThrottle: (next ? 'Off' : 'Reduced') as 'Off' | 'Reduced' | 'Full'
      };

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('battery-saver-active', next);
      }

      return { ...prev, batterySettings: updated };
    });
  };

  // Monitor real PC Battery status via Web Battery API if available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const checkBatteryLevel = () => {
          if (battery.level <= 0.20 && !battery.charging) {
            if (state.batterySettings?.autoEcoLowBattery && !state.batterySettings?.batterySaverMode) {
              updateBatterySettings({ batterySaverMode: true });
              addSystemMessage({
                sender: 'SYSTEM',
                category: 'alert',
                title: '⚡ ECO DEFENSE AUTO-ENGAGED',
                content: `PC Battery at Math.round(${battery.level * 100})%. Animations throttled and GPU load eliminated to protect hardware and battery longevity.`,
                priority: 'high'
              });
            }
          }
        };

        checkBatteryLevel();
        battery.addEventListener('levelchange', checkBatteryLevel);
        battery.addEventListener('chargingchange', checkBatteryLevel);

        return () => {
          battery.removeEventListener('levelchange', checkBatteryLevel);
          battery.removeEventListener('chargingchange', checkBatteryLevel);
        };
      }).catch(() => {});
    }
  }, []);

  const addMuhasabahEntry = (entry: {
    title: string;
    description?: string;
    category: MuhasabahCategory;
    severity: MuhasabahSeverity;
    cause: string;
    reflection?: string;
    isExempt?: boolean;
    exemptionReason?: string;
    createCorrectiveQuest?: boolean;
    correctiveQuestName?: string;
    kaffarahType?: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';
    recoveryPercentage?: number;
    weaknessId?: string | null;
    weaknessName?: string | null;
  }) => {
    const isExempt = Boolean(entry.isExempt);
    const currentSysDate = state.systemDate || getLocalDateString();

    // 1. Analyze recurrence pattern (intra-day, everyday, every two days, etc.)
    const recurrence = isExempt ? null : analyzeSinRecurrence({
      title: entry.title,
      category: entry.category,
      severity: entry.severity,
      weaknessId: entry.weaknessId,
      weaknessName: entry.weaknessName,
      targetDate: currentSysDate,
      allEntries: state.muhasabahEntries || [],
      weaknesses: state.weaknesses || []
    });

    const baseConsequences = SEVERITY_BASE_CONSEQUENCES[entry.severity] || SEVERITY_BASE_CONSEQUENCES.Moderate;
    const baseHp = isExempt ? 0 : baseConsequences.baseHp;
    const baseCoins = isExempt ? 0 : baseConsequences.baseCoins;
    const baseXp = isExempt ? 0 : (SEVERITY_XP_PENALTIES[entry.severity] || 200);

    const actualMultiplier = recurrence?.multiplier || 1.0;
    const hpLoss = isExempt ? 0 : (recurrence ? recurrence.escalatedHpLoss : baseHp);
    const coinFine = isExempt ? 0 : (recurrence ? recurrence.escalatedCoinFine : baseCoins);
    const xpToDeduct = isExempt ? 0 : (recurrence ? recurrence.escalatedXpPenalty : baseXp);
    const momentumLoss = isExempt ? 0 : (SEVERITY_MOMENTUM_PENALTIES[entry.severity] || 35);
    const rawPenalty = isExempt ? 0 : baseXp;

    const defaultTemplate = DEFAULT_KAFFARAH_TEMPLATES[entry.category];
    const kaffarahType = entry.kaffarahType || defaultTemplate.type;
    const kaffarahTitle = entry.correctiveQuestName?.trim() || defaultTemplate.title;

    let createdQuestId: string | null = null;
    let createdQuestName: string | null = null;
    let recoveryPercent = entry.recoveryPercentage ?? 20; // Default 20%
    if (recoveryPercent < 10) recoveryPercent = 10;
    if (recoveryPercent > 30) recoveryPercent = 30;
    const recoveredXP = isExempt ? 0 : Math.max(25, Math.round(xpToDeduct * (recoveryPercent / 100)));

    // By default for non-exempt Muhasabah, create a Kaffārah restitution quest
    const shouldCreateQuest = !isExempt && entry.createCorrectiveQuest !== false;
    if (shouldCreateQuest) {
      createdQuestId = `quest-kaffarah-${Date.now()}`;
      createdQuestName = `[KAFFĀRAH] ${kaffarahTitle}`;
    }

    const newEntryId = `muhasabah-${Date.now()}`;

    setState(prev => {
      // 1. Calculate new XP and history entry (total XP is floored at 0)
      const actualDeducted = xpToDeduct;
      
      let updatedXpHistory = [...prev.xpHistory];
      if (actualDeducted > 0) {
        const historyEntry: XPHistoryEntry = {
          id: `xph-muhasabah-${newEntryId}`,
          questId: null,
          questName: `[MUHĀSABAH AUDIT] ${entry.category}: ${entry.title}${recurrence?.isRecurring ? ` (${recurrence.cadenceLabel})` : ''}`,
          xp: -actualDeducted,
          timestamp: getSystemTimestamp(currentSysDate),
          skillIds: []
        };
        updatedXpHistory = [historyEntry, ...prev.xpHistory];
      }

      const totalXp = Math.max(0, updatedXpHistory.reduce((sum, h) => sum + h.xp, 0));
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedXpHistory);
      const gatedLevel = calculateGatedPlayerLevel(totalXp, completedBossCount);

      // 2. Deduct HP (Soul Vitality) & Coins (Treasury Fine) & Slash Momentum
      const currentHp = prev.profile.hp ?? 100;
      const maxHp = Math.max(prev.profile.maxHp ?? 100, getMaxHpForLevel(prev.profile.level || 1));
      const nextHp = Math.max(0, currentHp - hpLoss);
      const isHpCritical = nextHp <= 20;

      const currentCoins = prev.profile.coins ?? 150;
      const nextCoins = Math.max(0, currentCoins - coinFine);
      const currentMomentum = prev.profile.momentum || 0;
      const nextMomentum = momentumLoss >= 100 ? 0 : Math.max(0, currentMomentum - momentumLoss);

      // 3. Create Kaffārah Restitution Quest
      let updatedQuests = [...prev.quests];
      if (shouldCreateQuest && createdQuestId && createdQuestName) {
        const kaffarahQuest: Quest = {
          id: createdQuestId,
          name: createdQuestName,
          description: `Solemn Kaffārah Restitution for Muhāsabah Slip: "${entry.title}" (${entry.category} • ${entry.severity}).\n• Root Cause: ${entry.cause}\n• Recurrence Cadence: ${recurrence?.cadenceLabel || 'Isolated'}\n• Restitution Action: ${kaffarahTitle}\n• Note: Resolving this quest fulfills your penance, heals Soul Vitality (+35 HP), and restores spiritual equilibrium.`,
          type: 'Recovery',
          difficulty: entry.severity === 'Critical' || entry.severity === 'Severe' ? 'Hard' : entry.severity === 'Major' ? 'Normal' : 'Easy',
          xp: recoveredXP,
          estimatedTime: entry.severity === 'Critical' ? 45 : 25,
          deadline: currentSysDate,
          status: 'Active',
          recurrence: 'None',
          streakCount: 0,
          completedAt: null,
          lastCompletedDate: null,
          postponedFrom: null,
          postponedTo: null,
          goalId: null,
          projectId: null,
          milestoneId: null,
          listId: null,
          relatedSkills: [],
          createdAt: getSystemTimestamp(currentSysDate)
        };
        updatedQuests = [kaffarahQuest, ...updatedQuests];
      }

      // 4. Weakness tracking & auto-trigger (only for non-exempt)
      let updatedWeaknesses = [...(prev.weaknesses || [])];
      let targetWeaknessId: string | null = entry.weaknessId || null;
      let targetWeaknessName: string | null = entry.weaknessName ? entry.weaknessName.trim() : null;

      if (!isExempt) {
        // Step 1: Prioritize weaknessId if present
        let matchedIndex = -1;
        if (targetWeaknessId) {
          matchedIndex = updatedWeaknesses.findIndex(w => w.id === targetWeaknessId);
        }

        // Step 2: Fall back to weaknessName if ID was not provided or not found
        if (matchedIndex < 0 && targetWeaknessName) {
          const normName = targetWeaknessName.toLowerCase();
          matchedIndex = updatedWeaknesses.findIndex(
            w => w.name.trim().toLowerCase() === normName ||
                 (w.triggerCause && entry.cause && w.triggerCause.trim().toLowerCase() === entry.cause.trim().toLowerCase())
          );
        }

        // Step 3: Fall back to matching entry.title if still not found
        if (matchedIndex < 0 && entry.title && entry.title.trim()) {
          const normTitle = entry.title.trim().toLowerCase();
          matchedIndex = updatedWeaknesses.findIndex(
            w => w.name.trim().toLowerCase() === normTitle
          );
        }

        if (matchedIndex >= 0) {
          const w = updatedWeaknesses[matchedIndex];
          const nextCount = w.occurrenceCount + 1;
          const isNowActive = nextCount >= 5 ? 'Active' : w.status;
          targetWeaknessId = w.id;
          targetWeaknessName = w.name;
          const hist = Array.isArray(w.historyDates) ? [...w.historyDates, currentSysDate] : [currentSysDate];
          updatedWeaknesses[matchedIndex] = {
            ...w,
            occurrenceCount: nextCount,
            lastOccurrenceDate: currentSysDate,
            status: isNowActive,
            recurrenceCadence: recurrence?.cadence || w.recurrenceCadence,
            recurrenceCadenceLabel: recurrence?.cadenceLabel,
            averageIntervalDays: recurrence?.averageIntervalDays || w.averageIntervalDays,
            escalationTier: recurrence?.escalationTier || 1,
            currentHpPenalty: hpLoss,
            currentCoinPenalty: coinFine,
            currentXpPenalty: actualDeducted,
            consecutiveDaysCount: (recurrence?.consecutiveDailyStreak || 0) + (recurrence?.cadence === 'daily' ? 1 : 0),
            sameDayCount: (recurrence?.sameDayCount || 0) + 1,
            historyDates: hist
          };
        } else if (targetWeaknessName) {
          targetWeaknessId = `weakness-${Date.now()}`;
          const newWeakness: Weakness = {
            id: targetWeaknessId,
            name: targetWeaknessName,
            category: entry.category,
            triggerCause: entry.cause,
            occurrenceCount: 1,
            lastOccurrenceDate: currentSysDate,
            status: 'Under Control',
            correctiveStrategy: entry.reflection || 'Guard against triggers with vigilant awareness.',
            createdAt: getSystemTimestamp(currentSysDate),
            recurrenceCadence: recurrence?.cadence || 'isolated',
            recurrenceCadenceLabel: recurrence?.cadenceLabel,
            escalationTier: recurrence?.escalationTier || 1,
            currentHpPenalty: hpLoss,
            currentCoinPenalty: coinFine,
            currentXpPenalty: actualDeducted,
            consecutiveDaysCount: 0,
            sameDayCount: 1,
            historyDates: [currentSysDate]
          };
          updatedWeaknesses.push(newWeakness);
        }
      }

      // Check if any weakness just hit threshold 5 to alert operator
      const matchingWeakness = updatedWeaknesses.find(w => w.id === targetWeaknessId);
      if (matchingWeakness && matchingWeakness.occurrenceCount === 5) {
        addSystemMessage({
          sender: 'SYSTEM',
          category: 'warning',
          title: `⛓️ BEHAVIORAL CHAIN ACTIVE: ${matchingWeakness.name}`,
          content: `5 repeated occurrences recorded under ${matchingWeakness.category}. This pattern has been elevated to an Active Chain. Bind into a Power Seal to forge spiritual mastery.`,
          priority: 'high'
        });
      }

      // 5. Record the Muhasabah Entry
      const newEntry: MuhasabahEntry = {
        id: newEntryId,
        date: currentSysDate,
        timestamp: getSystemTimestamp(currentSysDate),
        title: entry.title.trim(),
        description: entry.description?.trim() || '',
        category: entry.category,
        severity: entry.severity,
        isExempt,
        exemptionReason: entry.exemptionReason?.trim() || undefined,
        rawPenalty,
        xpDeducted: actualDeducted,
        hpDeducted: hpLoss,
        baseHpLoss: baseHp,
        coinsDeducted: coinFine,
        baseCoinsDeducted: baseCoins,
        recurrenceMultiplier: actualMultiplier,
        recurrenceCadence: recurrence?.cadence || 'isolated',
        recurrenceCadenceLabel: recurrence?.cadenceLabel,
        recurrenceTier: recurrence?.escalationTier || 1,
        momentumLost: momentumLoss,
        cause: entry.cause.trim(),
        reflection: entry.reflection?.trim() || '',
        correctiveQuestId: createdQuestId,
        correctiveQuestName: createdQuestName,
        kaffarahTitle: isExempt ? undefined : kaffarahTitle,
        kaffarahType: isExempt ? undefined : kaffarahType,
        kaffarahCompleted: isExempt ? true : false,
        recoveryPercentage: recoveryPercent,
        recoveredXP,
        weaknessId: targetWeaknessId,
        weaknessName: targetWeaknessName
      };

      const finalEntries = [newEntry, ...(prev.muhasabahEntries || [])];

      if (isExempt) {
        addSystemMessage({
          sender: 'OPERATOR',
          category: 'alert',
          title: `⚖️ MUHĀSABAH: LAWFUL EXEMPTION NOTED`,
          content: `Noted "${entry.title}". Sickness, lawful travel, unintentional sleep/forgetfulness carry 0 penalty. Intention (Niyyah) & sincerity are accepted by Allah alone.`,
          priority: 'medium'
        });
      } else {
        if (recurrence?.isRecurring) {
          addSystemMessage({
            sender: 'OPERATOR',
            category: 'alert',
            title: `🚨 RECURRING SIN PENALTY AMPLIFIED: ${entry.title}`,
            content: `Recurrence pattern: ${recurrence.cadenceLabel}. Recurrence multiplier ${actualMultiplier.toFixed(2)}x (+${Math.round((actualMultiplier - 1) * 100)}%) automatically applied! Penalties amplified: −${hpLoss} HP (Soul Vitality) & −${coinFine} Coins fine deducted. Urgent Kaffārah restitution activated.`,
            priority: 'high'
          });
        } else {
          addSystemMessage({
            sender: 'OPERATOR',
            category: 'alert',
            title: `⚖️ MUHĀSABAH AUDIT: ${entry.category.toUpperCase()} (${entry.severity})`,
            content: `Reflected on "${entry.title}". In-app consequences: −${hpLoss} HP, −${actualDeducted} XP, −${coinFine} Coins fine, ${momentumLoss >= 100 ? 'Momentum zeroed' : `−${momentumLoss}% Momentum`}. Pinned Kaffārah Restitution: "${kaffarahTitle}".`,
            priority: 'high'
          });
        }

        if (isHpCritical) {
          addSystemMessage({
            sender: 'SYSTEM',
            category: 'warning',
            title: `⚠️ CRITICAL SOUL VITALITY (${nextHp}/${maxHp} HP)`,
            content: `Repeated spiritual slips have critically wounded Soul Vitality (${nextHp} HP remaining). Complete pending Kaffārah immediately to heal!`,
            priority: 'high'
          });
        }
      }

      return {
        ...prev,
        muhasabahEntries: finalEntries,
        weaknesses: updatedWeaknesses,
        quests: updatedQuests,
        xpHistory: updatedXpHistory,
        profile: {
          ...prev.profile,
          hp: nextHp,
          maxHp,
          xp: totalXp,
          level: gatedLevel.level,
          coins: nextCoins,
          momentum: nextMomentum,
          recoveryMode: nextHp === 0 ? true : prev.profile.recoveryMode
        }
      };
    });

    if (isExempt) {
      return {
        success: true,
        entryId: newEntryId,
        xpDeducted: 0,
        hpDeducted: 0,
        coinsDeducted: 0,
        rawPenalty: 0,
        capReached: false,
        message: `Lawful exemption recorded with 0 penalty. Genuine excuses carry no blame. Sincerity (Ikhlāṣ) to Allah comes first.`
      };
    }

    return {
      success: true,
      entryId: newEntryId,
      xpDeducted: xpToDeduct,
      hpDeducted: hpLoss,
      coinsDeducted: coinFine,
      rawPenalty,
      recurrenceMultiplier: actualMultiplier,
      recurrenceCadence: recurrence?.cadence,
      isRecurring: Boolean(recurrence?.isRecurring),
      capReached: false,
      message: recurrence?.isRecurring
        ? `Recurring sin recorded (${recurrence.cadenceLabel}). Amplified penalties deducted: −${hpLoss} HP & −${coinFine} Coins fine (${actualMultiplier.toFixed(2)}x escalation).`
        : `Muhāsabah audit committed: −${hpLoss} HP, −${xpToDeduct} XP & −${coinFine} Coins fine deducted. Kaffārah restitution quest issued.`
    };
  };

  const healSpiritualHp = (amount: number, reason?: string) => {
    setState(prev => {
      const currentHp = prev.profile.hp ?? 100;
      const maxHp = Math.max(prev.profile.maxHp ?? 100, getMaxHpForLevel(prev.profile.level || 1));
      const nextHp = Math.min(maxHp, currentHp + Math.max(1, amount));
      if (nextHp === currentHp) return prev;

      if (reason) {
        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: '🌿 SOUL VITALITY REPLENISHED',
          content: `${reason}: +${amount} HP restored (Soul Vitality: ${nextHp}/${maxHp} HP).`,
          priority: 'medium'
        });
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          hp: nextHp,
          maxHp,
          recoveryMode: nextHp > 0 ? prev.profile.recoveryMode : false
        }
      };
    });
  };

  const updateMuhasabahEntry = (id: string, updates: Partial<MuhasabahEntry>) => {
    setState(prev => ({
      ...prev,
      muhasabahEntries: (prev.muhasabahEntries || []).map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteMuhasabahEntry = (id: string) => {
    setState(prev => ({
      ...prev,
      muhasabahEntries: (prev.muhasabahEntries || []).filter(e => e.id !== id)
    }));
  };

  const clearAllMuhasabahEntries = () => {
    setState(prev => ({
      ...prev,
      muhasabahEntries: []
    }));
  };

  const generateWeeklyMuhasabahSummary = (targetFridayDate?: string): WeeklyMuhasabahSummary => {
    return generateWeeklyMuhasabahSummaryPure(state, targetFridayDate);
  };

  const saveAndArchiveWeeklySummary = (summary: WeeklyMuhasabahSummary): { success: boolean; message: string } => {
    setState(prev => {
      const existingSummaries = prev.savedWeeklySummaries || [];
      const updatedSummaries = [
        summary,
        ...existingSummaries.filter(s => s.weekLabel !== summary.weekLabel && s.generatedDate !== summary.generatedDate)
      ];

      const docInfo = buildWeeklySummaryMarkdown(summary);
      const existingDocs = prev.planningDocuments || [];
      const docIndex = existingDocs.findIndex(d => d.path === docInfo.path);
      let updatedDocs = [...existingDocs];
      if (docIndex >= 0) {
        updatedDocs[docIndex] = {
          ...updatedDocs[docIndex],
          content: docInfo.content,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedDocs.push({
          id: `pdoc-weekly-${Date.now()}`,
          path: docInfo.path,
          name: docInfo.name,
          content: docInfo.content,
          linkedGoals: [],
          linkedProjects: [],
          linkedQuests: [],
          linkedSkills: [],
          updatedAt: new Date().toISOString()
        });
      }

      addSystemMessage({
        sender: 'SYSTEM',
        category: 'achievement',
        title: `📜 WEEKLY SUMMARY SAVED: ${summary.weekLabel}`,
        content: `Weekly Muḥāsabah Review generated with ${summary.spiritualRating} standing. Archived to sacred documents!`,
        priority: 'high'
      });

      return {
        ...prev,
        savedWeeklySummaries: updatedSummaries,
        planningDocuments: updatedDocs
      };
    });

    return {
      success: true,
      message: 'Summary saved and archived to sacred records.'
    };
  };

  const clearAllWeeklyArchives = (): { success: boolean; message: string } => {
    setState(prev => {
      const updatedDocs = (prev.planningDocuments || []).filter(
        d => !d.path.startsWith('04 Operations/Weekly Muhasabah/Weekly Summary -')
      );
      return {
        ...prev,
        savedWeeklySummaries: [],
        planningDocuments: updatedDocs
      };
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'MUHĀSABAH ARCHIVES PURGED',
      content: 'All historical weekly Muḥāsabah summary archives have been cleared from the sacred record.',
      priority: 'low'
    });

    return {
      success: true,
      message: 'All archived weekly summaries have been cleared successfully.'
    };
  };

  const deleteWeeklyArchive = (idOrDate: string): { success: boolean; message: string } => {
    setState(prev => {
      const remaining = (prev.savedWeeklySummaries || []).filter(
        s => s.id !== idOrDate && s.generatedDate !== idOrDate
      );
      const updatedDocs = (prev.planningDocuments || []).filter(
        d => d.path !== `04 Operations/Weekly Muhasabah/Weekly Summary - ${idOrDate}.md`
      );
      return {
        ...prev,
        savedWeeklySummaries: remaining,
        planningDocuments: updatedDocs
      };
    });

    return {
      success: true,
      message: 'Archived weekly summary deleted.'
    };
  };

  /**
   * Automated / Manual Weekly Muḥāsabah Cycle runner
   * - Uses reconcileMissedWeeks to handle missed Sundays and normal week cycles.
   * - Saves all newly generated summaries to savedWeeklySummaries.
   * - Creates planning documents for every generated summary.
   * - Atomically updates state.muhasabahEntries to retain current week slips.
   * - Sets lastWeeklyMuhasabahResetDate to advance the cycle.
   */
  const runWeeklyMuhasabahCycle = (sundayDateStr?: string): { success: boolean; message: string; summaryId?: string } => {
    const currentSysDate = sundayDateStr || state.systemDate || getLocalDateString();
    
    if (isGeneratingWeeklySummaryRef.current) {
      return { success: false, message: 'Weekly cycle is currently processing.' };
    }

    isGeneratingWeeklySummaryRef.current = true;
    try {
      const reconciliation = reconcileMissedWeeks(state, currentSysDate);
      if (!reconciliation.wasReconciled || reconciliation.missedSummaries.length === 0) {
        return { success: false, message: reconciliation.summaryMessage };
      }

      let savedSummaryId: string | undefined;

      setState(prev => {
        const existingSummaries = prev.savedWeeklySummaries || [];
        const newSummaries = reconciliation.missedSummaries;
        savedSummaryId = newSummaries[newSummaries.length - 1]?.id;

        // Merge without duplicates by generatedDate
        const newDates = new Set(newSummaries.map(s => s.generatedDate));
        const updatedSummaries = [
          ...newSummaries,
          ...existingSummaries.filter(s => !newDates.has(s.generatedDate))
        ];

        // Generate planning docs for all new summaries
        const existingDocs = prev.planningDocuments || [];
        let updatedDocs = [...existingDocs];

        newSummaries.forEach(summary => {
          const docInfo = buildWeeklySummaryMarkdown(summary);
          const docIndex = updatedDocs.findIndex(d => d.path === docInfo.path);
          if (docIndex >= 0) {
            updatedDocs[docIndex] = {
              ...updatedDocs[docIndex],
              content: docInfo.content,
              updatedAt: new Date().toISOString()
            };
          } else {
            updatedDocs.push({
              id: `pdoc-weekly-${Date.now()}-${summary.generatedDate}`,
              path: docInfo.path,
              name: docInfo.name,
              content: docInfo.content,
              linkedGoals: [],
              linkedProjects: [],
              linkedQuests: [],
              linkedSkills: [],
              updatedAt: new Date().toISOString()
            });
          }
        });

        // Add operator system message
        const latestSummary = newSummaries[newSummaries.length - 1];
        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: `🌅 WEEKLY MUHĀSABAH CYCLE ARCHIVED: ${latestSummary.weekLabel}`,
          content: `${reconciliation.summaryMessage} Standing: ${latestSummary.spiritualRating} (${latestSummary.scoreOutOf10 !== undefined ? latestSummary.scoreOutOf10.toFixed(1) : '10'}/10).`,
          priority: 'high'
        });

        return {
          ...prev,
          savedWeeklySummaries: updatedSummaries,
          planningDocuments: updatedDocs,
          muhasabahEntries: reconciliation.activeEntries,
          lastWeeklyMuhasabahResetDate: reconciliation.newLastResetDate || currentSysDate
        };
      });

      return {
        success: true,
        message: reconciliation.summaryMessage,
        summaryId: savedSummaryId
      };
    } finally {
      isGeneratingWeeklySummaryRef.current = false;
    }
  };

  const getRecurringSins = (): RecurringSinsRegistry => {
    return getRecurringSinsRegistry(
      state.muhasabahEntries || [],
      state.weaknesses || [],
      state.systemDate || getLocalDateString()
    );
  };

  const addWeakness = (weakness: Omit<Weakness, 'id' | 'createdAt'>): string => {
    const id = `weakness-${Date.now()}`;
    const newWeakness: Weakness = {
      ...weakness,
      id,
      createdAt: getSystemTimestamp(state.systemDate)
    };
    setState(prev => ({
      ...prev,
      weaknesses: [...(prev.weaknesses || []), newWeakness]
    }));
    return id;
  };

  const updateWeakness = (id: string, updates: Partial<Weakness>) => {
    setState(prev => ({
      ...prev,
      weaknesses: (prev.weaknesses || []).map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  };

  const deleteWeakness = (id: string) => {
    setState(prev => ({
      ...prev,
      weaknesses: (prev.weaknesses || []).filter(w => w.id !== id)
    }));
  };

  const getTodayMuhasabahStats = () => {
    const currentSysDate = state.systemDate || getLocalDateString();
    const todayEntries = (state.muhasabahEntries || []).filter(e => e.date === currentSysDate);
    const todayLostXP = todayEntries.reduce((sum, e) => sum + (e.xpDeducted || 0), 0);
    const todayLostCoins = todayEntries.reduce((sum, e) => sum + (e.coinsDeducted || 0), 0);
    const todayLostHp = todayEntries.reduce((sum, e) => sum + (e.hpDeducted || 0), 0);
    const todayRecurringSlipsCount = todayEntries.filter(e => (e.recurrenceMultiplier || 1) > 1.0).length;
    const currentHp = state.profile.hp ?? 100;
    const maxHp = Math.max(state.profile.maxHp ?? 100, getMaxHpForLevel(state.profile.level || 1));
    
    const todayHistory = (state.xpHistory || []).filter(h => h.timestamp.startsWith(currentSysDate));
    const todayEarnedXP = todayHistory.filter(h => h.xp > 0).reduce((sum, h) => sum + h.xp, 0);
    const todayNetXP = todayEarnedXP - todayLostXP;
    const dailyCapRemaining = Math.max(0, 500 - todayLostXP);

    const pendingKaffarah = (state.quests || []).filter(q => 
      q.status === 'Active' && 
      (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]'))
    );

    const weaknesses = state.weaknesses || [];
    const activeWeaknessesCount = weaknesses.filter(w => w.status === 'Active').length;

    // Completed Hasanaat count today (positive completed quests + focus cycles logged today)
    const questsDoneToday = (state.quests || []).filter(q => {
      if (q.type === 'Penalty') return false;
      const isCompletedToday = q.completedAt && q.completedAt.startsWith(currentSysDate);
      return q.status === 'Completed' && isCompletedToday;
    }).length;
    
    // Also include completed positive XP events recorded in today's history
    const hasanatEventsToday = todayHistory.filter(h => h.xp > 0).length;
    const todayHasanatCount = Math.max(questsDoneToday, hasanatEventsToday);

    // Mīzān balance calculations
    const totalWeight = todayEarnedXP + todayLostXP;
    let mizanTilt = 0; // -18deg (heavy Sayyiat) to +18deg (heavy Hasanat)
    if (totalWeight > 0) {
      const netRatio = (todayEarnedXP - todayLostXP) / Math.max(100, totalWeight);
      mizanTilt = Math.round(netRatio * 18); // clamp around -18 to +18 degrees
    }

    let equilibriumStatus: 'Radiant Balance' | 'Blessed Equilibrium' | 'Neutral Ground' | 'Spiritual Deficit' | 'Severe Nafs Warning' = 'Neutral Ground';
    if (todayEarnedXP === 0 && todayLostXP === 0) {
      equilibriumStatus = 'Neutral Ground';
    } else if (todayNetXP >= 250) {
      equilibriumStatus = 'Radiant Balance';
    } else if (todayNetXP > 0) {
      equilibriumStatus = 'Blessed Equilibrium';
    } else if (todayNetXP === 0) {
      equilibriumStatus = 'Neutral Ground';
    } else if (todayNetXP >= -200) {
      equilibriumStatus = 'Spiritual Deficit';
    } else {
      equilibriumStatus = 'Severe Nafs Warning';
    }

    return {
      todayEarnedXP,
      todayLostXP,
      todayNetXP,
      todayLostCoins,
      todayLostHp,
      currentHp,
      maxHp,
      todayRecurringSlipsCount,
      dailyCapRemaining,
      totalEntriesCount: (state.muhasabahEntries || []).length,
      todaySlipsCount: todayEntries.length,
      todayHasanatCount,
      activeWeaknessesCount,
      pendingKaffarahCount: pendingKaffarah.length,
      pendingKaffarahQuests: pendingKaffarah,
      mizanTilt,
      equilibriumStatus,
      isSpiritualLocked: pendingKaffarah.length > 0
    };
  };

  const recalibrateMizan = () => {
    const currentSysDate = state.systemDate || getLocalDateString();
    
    // 1. Audit entries for today
    const todayEntries = (state.muhasabahEntries || []).filter(e => e.date === currentSysDate);
    const todayLostXP = todayEntries.reduce((sum, e) => sum + (e.xpDeducted || 0), 0);
    
    // 2. Audit positive XP events from history
    const todayHistory = (state.xpHistory || []).filter(h => h.timestamp.startsWith(currentSysDate));
    const todayEarnedXP = todayHistory.filter(h => h.xp > 0).reduce((sum, h) => sum + h.xp, 0);
    const todayNetXP = todayEarnedXP - todayLostXP;

    // 3. Audit active Kaffarah obligations
    const activeKaffarah = (state.quests || []).filter(q => 
      q.status === 'Active' && 
      (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]'))
    );

    // 4. Dispatch System Notice
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: '⚖️ DAILY BALANCE RECALIBRATED',
      content: `Equilibrium re-synchronized for ${currentSysDate}: +${todayEarnedXP} XP Earned, −${todayLostXP} XP Lost (Net: ${todayNetXP >= 0 ? '+' : ''}${todayNetXP} XP). Verified ${todayEntries.length} slip audits and ${activeKaffarah.length} pending Kaffārah obligations.`,
      priority: 'medium'
    });

    return {
      success: true,
      message: `The Daily Balance Scale physics and weight coordinates successfully recalibrated for ${currentSysDate}.`,
      timestamp: new Date().toISOString()
    };
  };

  // -------------------------------------------------------------
  // SPIRITUAL DAILY TRACKING & SACRED PROTOCOL
  // -------------------------------------------------------------
  const getSpiritualLog = (dateStr?: string): SpiritualDailyLog => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    if (state.spiritualLogs && state.spiritualLogs[targetDate]) {
      return state.spiritualLogs[targetDate];
    }
    return createDefaultSpiritualLog(targetDate);
  };

  const updateSpiritualLog = (dateStr: string, updates: Partial<SpiritualDailyLog>) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    setState(prev => {
      const existing = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...existing,
        ...updates
      };
      return {
        ...prev,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        }
      };
    });
  };

  const togglePrayer = (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    field: 'fardh' | 'inMasjid' | 'sunnahRawatib' | 'sunnahBefore' | 'sunnahAfter' | 'onTime' | 'delayed',
    dateStr?: string
  ) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const currentPrayerState = existingLog[prayer] || { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null };

    const prayerRewards = {
      fajr: { name: 'Fajr (الفجر)', fardhXp: 150, fardhCoins: 15, onTimeXp: 40, onTimeCoins: 5, delayedPenaltyXp: 50, masjidXp: 50, masjidCoins: 5, sunnahXp: 40, sunnahCoins: 5 },
      dhuhr: { name: 'Dhuhr (الظهر)', fardhXp: 100, fardhCoins: 10, onTimeXp: 40, onTimeCoins: 5, delayedPenaltyXp: 50, masjidXp: 50, masjidCoins: 5, sunnahXp: 40, sunnahCoins: 5, sunnahBeforeXp: 25, sunnahBeforeCoins: 3, sunnahAfterXp: 20, sunnahAfterCoins: 2 },
      asr: { name: 'Asr (العصر)', fardhXp: 120, fardhCoins: 12, onTimeXp: 40, onTimeCoins: 5, delayedPenaltyXp: 50, masjidXp: 50, masjidCoins: 5, sunnahXp: 30, sunnahCoins: 5 },
      maghrib: { name: 'Maghrib (المغرب)', fardhXp: 100, fardhCoins: 10, onTimeXp: 40, onTimeCoins: 5, delayedPenaltyXp: 50, masjidXp: 50, masjidCoins: 5, sunnahXp: 30, sunnahCoins: 5 },
      isha: { name: 'Isha (العشاء)', fardhXp: 100, fardhCoins: 10, onTimeXp: 40, onTimeCoins: 5, delayedPenaltyXp: 50, masjidXp: 50, masjidCoins: 5, sunnahXp: 30, sunnahCoins: 5 }
    };
    const reward = prayerRewards[prayer];

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const curr = log[prayer] || { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null };
      
      let updatedHistory = [...prev.xpHistory];
      let deltaCoins = 0;
      let updatedPrayerState: PrayerCheck = { ...curr };

      const prayerPrefix = `spiritual-prayer-${targetDate}-${prayer}`;

      if (field === 'fardh') {
        const newFardh = !curr.fardh;
        if (newFardh) {
          // Turning Fardh ON
          const autoOnTime = !curr.delayed;
          updatedPrayerState = {
            ...curr,
            fardh: true,
            onTime: autoOnTime,
            completedAt: completedTimestamp
          };

          // Add Fardh XP
          const fardhEntry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-fardh`,
            questId: `${prayerPrefix}-fardh`,
            questName: `🕌 PRAYER: Obligatory Fardh ${reward.name}`,
            xp: reward.fardhXp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [fardhEntry, ...updatedHistory.filter(h => h.questId !== `${prayerPrefix}-fardh`)];
          deltaCoins += reward.fardhCoins;

          if (autoOnTime) {
            const onTimeEntry: XPHistoryEntry = {
              id: `h-pray-${Date.now()}-ontime`,
              questId: `${prayerPrefix}-onTime`,
              questName: `⏱️ ON-TIME BONUS: ${reward.name} (في وقتها)`,
              xp: reward.onTimeXp,
              timestamp: completedTimestamp,
              skillIds: []
            };
            updatedHistory = [onTimeEntry, ...updatedHistory.filter(h => h.questId !== `${prayerPrefix}-onTime`)];
            deltaCoins += reward.onTimeCoins;
          }

          addSystemMessage({
            sender: 'SYSTEM',
            category: 'achievement',
            title: `🕌 SALAAT FULFILLED: ${reward.name}`,
            content: `Obligatory ${reward.name} performed (+${reward.fardhXp + (autoOnTime ? reward.onTimeXp : 0)} XP, +${reward.fardhCoins + (autoOnTime ? reward.onTimeCoins : 0)} Coins). Recorded on the Daily Balance Scale.`,
            priority: 'medium'
          });
        } else {
          // Turning Fardh OFF -> Reset the entire prayer for this date
          updatedPrayerState = {
            fardh: false,
            onTime: false,
            delayed: false,
            inMasjid: false,
            sunnahRawatib: false,
            sunnahBefore: false,
            sunnahAfter: false,
            completedAt: null
          };
          // Remove all history entries for this prayer today
          updatedHistory = updatedHistory.filter(h => !h.questId.startsWith(prayerPrefix));
          deltaCoins -= (curr.fardh ? reward.fardhCoins : 0) + (curr.onTime ? reward.onTimeCoins : 0) + (curr.inMasjid ? reward.masjidCoins : 0);
        }
      } else if (field === 'onTime') {
        const newOnTime = !curr.onTime;
        updatedPrayerState.onTime = newOnTime;
        if (newOnTime) {
          // On-Time turned ON: add on-time bonus
          const onTimeEntry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-ontime`,
            questId: `${prayerPrefix}-onTime`,
            questName: `⏱️ ON-TIME BONUS: ${reward.name} (في وقتها)`,
            xp: reward.onTimeXp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [onTimeEntry, ...updatedHistory.filter(h => h.questId !== `${prayerPrefix}-onTime`)];
          deltaCoins += reward.onTimeCoins;

          // If it was marked delayed, remove delayed penalty
          if (curr.delayed) {
            updatedPrayerState.delayed = false;
            updatedHistory = updatedHistory.filter(h => h.questId !== `${prayerPrefix}-delayed`);
          }

          addSystemMessage({
            sender: 'SYSTEM',
            category: 'achievement',
            title: `⏱️ ON-TIME PRAYER: ${reward.name}`,
            content: `Performed in its proper time (+${reward.onTimeXp} XP, +${reward.onTimeCoins} Coins).`,
            priority: 'low'
          });
        } else {
          // On-Time turned OFF
          updatedHistory = updatedHistory.filter(h => h.questId !== `${prayerPrefix}-onTime`);
          deltaCoins -= reward.onTimeCoins;
        }
      } else if (field === 'delayed') {
        const newDelayed = !curr.delayed;
        updatedPrayerState.delayed = newDelayed;
        if (newDelayed) {
          // Delayed turned ON: apply -50 XP penalty deduction
          const delayedEntry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-delayed`,
            questId: `${prayerPrefix}-delayed`,
            questName: `⚠️ LATE / DELAYED PRAYER PENALTY: ${reward.name} (تأخير الصلاة)`,
            xp: -reward.delayedPenaltyXp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [delayedEntry, ...updatedHistory.filter(h => h.questId !== `${prayerPrefix}-delayed`)];

          // If it was marked on-time, remove on-time bonus
          if (curr.onTime) {
            updatedPrayerState.onTime = false;
            updatedHistory = updatedHistory.filter(h => h.questId !== `${prayerPrefix}-onTime`);
            deltaCoins -= reward.onTimeCoins;
          }

          addSystemMessage({
            sender: 'SYSTEM',
            category: 'warning',
            title: `⚠️ DELAYED PRAYER DEDUCTION: ${reward.name}`,
            content: `Prayer performed after its prescribed window (−${reward.delayedPenaltyXp} XP deducted). Accountability recorded on the Daily Balance Scale.`,
            priority: 'high'
          });
        } else {
          // Delayed turned OFF: reverse penalty
          updatedHistory = updatedHistory.filter(h => h.questId !== `${prayerPrefix}-delayed`);
        }
      } else if (field === 'inMasjid') {
        const newMasjid = !curr.inMasjid;
        updatedPrayerState.inMasjid = newMasjid;
        const qId = `${prayerPrefix}-inMasjid`;
        if (newMasjid) {
          const entry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-masjid`,
            questId: qId,
            questName: `🕌 PRAYER: Masjid / Jamā'ah bonus for ${reward.name}`,
            xp: reward.masjidXp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [entry, ...updatedHistory.filter(h => h.questId !== qId)];
          deltaCoins += reward.masjidCoins;
        } else {
          updatedHistory = updatedHistory.filter(h => h.questId !== qId);
          deltaCoins -= reward.masjidCoins;
        }
      } else if (field === 'sunnahBefore') {
        const newBefore = !curr.sunnahBefore;
        updatedPrayerState.sunnahBefore = newBefore;
        const qId = `${prayerPrefix}-sunnahBefore`;
        const xp = (reward as any).sunnahBeforeXp || 25;
        const coins = (reward as any).sunnahBeforeCoins || 3;
        if (newBefore) {
          const entry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-sunnahBefore`,
            questId: qId,
            questName: `📿 PRAYER: Sunnah Qabliyyah: 4 Rak'ahs Before Dhuhr (قبل الظهر)`,
            xp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [entry, ...updatedHistory.filter(h => h.questId !== qId)];
          deltaCoins += coins;
        } else {
          updatedHistory = updatedHistory.filter(h => h.questId !== qId);
          deltaCoins -= coins;
        }
      } else if (field === 'sunnahAfter') {
        const newAfter = !curr.sunnahAfter;
        updatedPrayerState.sunnahAfter = newAfter;
        const qId = `${prayerPrefix}-sunnahAfter`;
        const xp = (reward as any).sunnahAfterXp || 20;
        const coins = (reward as any).sunnahAfterCoins || 2;
        if (newAfter) {
          const entry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-sunnahAfter`,
            questId: qId,
            questName: `📿 PRAYER: Sunnah Ba'diyyah: 2 Rak'ahs After Dhuhr (بعد الظهر)`,
            xp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [entry, ...updatedHistory.filter(h => h.questId !== qId)];
          deltaCoins += coins;
        } else {
          updatedHistory = updatedHistory.filter(h => h.questId !== qId);
          deltaCoins -= coins;
        }
      } else if (field === 'sunnahRawatib') {
        const newRawatib = !curr.sunnahRawatib;
        updatedPrayerState.sunnahRawatib = newRawatib;
        const qId = `${prayerPrefix}-sunnahRawatib`;
        if (newRawatib) {
          const entry: XPHistoryEntry = {
            id: `h-pray-${Date.now()}-sunnahRawatib`,
            questId: qId,
            questName: `📿 PRAYER: Sunan Rawātib for ${reward.name}`,
            xp: reward.sunnahXp,
            timestamp: completedTimestamp,
            skillIds: []
          };
          updatedHistory = [entry, ...updatedHistory.filter(h => h.questId !== qId)];
          deltaCoins += reward.sunnahCoins;
        } else {
          updatedHistory = updatedHistory.filter(h => h.questId !== qId);
          deltaCoins -= reward.sunnahCoins;
        }
      }

      // Sync Dhuhr sunnahRawatib state
      if (prayer === 'dhuhr') {
        if (field === 'sunnahBefore' || field === 'sunnahAfter') {
          updatedPrayerState.sunnahRawatib = Boolean(updatedPrayerState.sunnahBefore || updatedPrayerState.sunnahAfter);
        }
      }

      const updatedLog: SpiritualDailyLog = {
        ...log,
        [prayer]: updatedPrayerState
      };

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + deltaCoins),
          momentum: Math.min(100, Math.max(0, prev.profile.momentum + (field === 'fardh' && updatedPrayerState.fardh ? 4 : field === 'delayed' ? -5 : 0)))
        }
      };
    });
  };

  const toggleAdhkar = (type: 'sabah' | 'masa' | 'sleepDhohr' | 'sleepNight', dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);

    let field: 'adhkarSabah' | 'adhkarMasa' | 'adhkarSleepDhohr' | 'adhkarSleepNight';
    let xpReward = 75;
    let coinsReward = 10;
    let label = '';
    let messageContent = '';

    if (type === 'sabah') {
      field = 'adhkarSabah';
      xpReward = 75;
      coinsReward = 10;
      label = 'Morning Adhkār (أذكار الصباح)';
      messageContent = 'Morning Fortress complete (+75 XP, +10 Coins). Sheltered in divine grace from dawn till dusk.';
    } else if (type === 'masa') {
      field = 'adhkarMasa';
      xpReward = 75;
      coinsReward = 10;
      label = 'Evening Adhkār (أذكار المساء)';
      messageContent = 'Evening Fortress complete (+75 XP, +10 Coins). Guarded under divine light through the night.';
    } else if (type === 'sleepDhohr') {
      field = 'adhkarSleepDhohr';
      xpReward = 50;
      coinsReward = 8;
      label = 'Dhohr Qaylulah Sleep Adhkār (أذكار قيلولة الظهيرة)';
      messageContent = 'Qaylulah Midday Nap Adhkār complete (+50 XP, +8 Coins). Sunnah recharge sealed with prophetic remembrance.';
    } else {
      field = 'adhkarSleepNight';
      xpReward = 75;
      coinsReward = 10;
      label = 'Night Sleep Adhkār (أذكار النوم بالليل)';
      messageContent = 'Night Sleep Adhkār complete (+75 XP, +10 Coins). Fortified with Ayat al-Kursi, Mu‘awwidhatayn & Tasbīḥ Fāṭimah.';
    }

    const newValue = !existingLog[field];
    const questIdentifier = `spiritual-adhkar-${targetDate}-${type}`;

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        [field]: newValue
      };

      let updatedHistory = [...prev.xpHistory];
      if (newValue) {
        const entry: XPHistoryEntry = {
          id: `h-adhkar-${Date.now()}-${type}`,
          questId: questIdentifier,
          questName: `📿 ADHKĀR: ${label}`,
          xp: xpReward,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
      } else {
        updatedHistory = updatedHistory.filter(h => h.questId !== questIdentifier);
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      if (newValue) {
        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: `📿 ADHKĀR COMPLETED: ${label}`,
          content: messageContent,
          priority: 'medium'
        });
      }

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + (newValue ? coinsReward : -coinsReward)),
          momentum: Math.min(100, prev.profile.momentum + (newValue ? 3 : 0))
        }
      };
    });
  };

  const incrementSalawat = (amount: number, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const existingLog = getSpiritualLog(targetDate);
    const newCount = existingLog.salawatCount + amount;
    setSalawatCount(newCount, targetDate);
  };

  const setSalawatCount = (count: number, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const wasCompleted = existingLog.salawatCount >= 70;
    const isNowCompleted = count >= 70;
    const questIdentifier = `spiritual-salawat-${targetDate}`;

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        salawatCount: Math.max(0, count),
        salawatCompleted: isNowCompleted
      };

      let updatedHistory = [...prev.xpHistory];
      let coinsDelta = 0;

      if (!wasCompleted && isNowCompleted) {
        // Just achieved 70 target
        const entry: XPHistoryEntry = {
          id: `h-salawat-${Date.now()}`,
          questId: questIdentifier,
          questName: `📿 SALAWĀT: 70+ Salawāt upon Prophet Muhammad (ﷺ)`,
          xp: 100,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
        coinsDelta = 15;

        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: `🌹 70+ SALAWĀT UPON RASOULULLAH (ﷺ) COMPLETE`,
          content: `Milestone of 70+ blessings sent upon the Prophet (ﷺ) reached (+100 XP, +15 Coins). Consistency reflected on the Daily Balance Scale.`,
          priority: 'high'
        });
      } else if (wasCompleted && !isNowCompleted) {
        updatedHistory = updatedHistory.filter(h => h.questId !== questIdentifier);
        coinsDelta = -15;
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsDelta)
        }
      };
    });
  };

  const updateQiyam = (rakats: number, witr?: boolean, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const newRakats = Math.max(0, rakats);
    const newWitr = witr !== undefined ? witr : existingLog.qiyamWitr;
    const questIdentifier = `spiritual-qiyam-${targetDate}`;

    // Calculate XP: 2 rakats mandatory base (+100 XP), plus 40 XP per extra pair
    let qiyamXp = 0;
    let coinsEarned = 0;
    if (newRakats >= 2) {
      qiyamXp += 100;
      coinsEarned += 15;
      const extraPairs = Math.floor((newRakats - 2) / 2);
      if (extraPairs > 0) {
        qiyamXp += extraPairs * 40;
        coinsEarned += extraPairs * 5;
      }
    }
    if (newWitr) {
      qiyamXp += 50;
      coinsEarned += 5;
    }

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        qiyamRakats: newRakats,
        qiyamWitr: newWitr,
        qiyamCompleted: newRakats >= 2
      };

      // Remove existing qiyam entry and replace with updated XP
      let updatedHistory = prev.xpHistory.filter(h => h.questId !== questIdentifier);
      if (qiyamXp > 0) {
        const entry: XPHistoryEntry = {
          id: `h-qiyam-${Date.now()}`,
          questId: questIdentifier,
          questName: `🌙 QIYĀM AL-LAYL: ${newRakats} Rak'ahs${newWitr ? ' + Witr (الوتر)' : ''}`,
          xp: qiyamXp,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];

        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: `🌙 QIYĀM AL-LAYL LOGGED: ${newRakats} RAK'AHS`,
          content: `Night devotion recorded (+${qiyamXp} XP, +${coinsEarned} Coins). Recorded on today's Daily Balance Scale.`,
          priority: 'medium'
        });
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsEarned),
          momentum: Math.min(100, prev.profile.momentum + (newRakats >= 2 ? 5 : 0))
        }
      };
    });
  };

  const toggleFasting = (
    field: 'isFasting' | 'suhurTaken' | 'iftarCompleted' | 'duaMadeAtIftar',
    fastingType?: FastingType,
    dateStr?: string
  ) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const currentFasting = existingLog.fasting || {
      isFasting: false,
      fastingType: undefined,
      suhurTaken: false,
      iftarCompleted: false,
      duaMadeAtIftar: false,
      notes: ''
    };

    let updatedFasting: FastingLog;
    let coinsDelta = 0;
    let messageTitle = '';
    let messageContent = '';

    if (field === 'isFasting') {
      const nextIsFasting = !currentFasting.isFasting;
      updatedFasting = {
        ...currentFasting,
        isFasting: nextIsFasting,
        fastingType: nextIsFasting ? (fastingType || currentFasting.fastingType || 'Monday_Thursday') : undefined,
        suhurTaken: nextIsFasting ? currentFasting.suhurTaken : false,
        iftarCompleted: nextIsFasting ? currentFasting.iftarCompleted : false,
        duaMadeAtIftar: nextIsFasting ? currentFasting.duaMadeAtIftar : false
      };
      if (nextIsFasting) {
        coinsDelta += 10;
        messageTitle = `🌙 SACRED FASTING INTENTION (الصيام) LOGGED`;
        messageContent = `Intention to fast for Allah's sake registered (+50 XP, +10 Coins). May Allah accept your devotion and steadfastness.`;
      }
    } else {
      const nextVal = !currentFasting[field];
      updatedFasting = {
        ...currentFasting,
        isFasting: true,
        fastingType: fastingType || currentFasting.fastingType || 'Monday_Thursday',
        [field]: nextVal
      };

      if (field === 'suhurTaken') {
        coinsDelta = nextVal ? 5 : -5;
        if (nextVal) {
          messageTitle = `🥣 SUNNAH OF SUHŪR (السحور) LOGGED`;
          messageContent = `Pre-dawn meal taken with remembrance (+25 XP, +5 Coins). "Eat Suhur, for there is barakah in it."`;
        }
      } else if (field === 'iftarCompleted') {
        coinsDelta = nextVal ? 20 : -20;
        if (nextVal) {
          messageTitle = `✨ IFTĀR & FAST COMPLETED (إتمام الصيام)`;
          messageContent = `Fasting completed for Allah (+125 XP, +20 Coins, +5 Momentum). "Fasting is a shield."`;
        }
      } else if (field === 'duaMadeAtIftar') {
        coinsDelta = nextVal ? 5 : -5;
        if (nextVal) {
          messageTitle = `🤲 DUA AT IFTĀR (دعاء الإفطار) RECORDED`;
          messageContent = `Sunnah supplication at breaking the fast made (+25 XP). "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills."`;
        }
      }
    }

    const questIdentifier = `spiritual-fasting-${targetDate}`;
    
    let totalFastingXp = 0;
    if (updatedFasting.isFasting) totalFastingXp += 50;
    if (updatedFasting.suhurTaken) totalFastingXp += 25;
    if (updatedFasting.iftarCompleted) totalFastingXp += 125;
    if (updatedFasting.duaMadeAtIftar) totalFastingXp += 25;

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        fasting: updatedFasting
      };

      let updatedHistory = prev.xpHistory.filter(h => h.questId !== questIdentifier);
      if (totalFastingXp > 0) {
        const typeLabel = updatedFasting.fastingType ? ` (${updatedFasting.fastingType.replace('_', ' ')})` : '';
        const entry: XPHistoryEntry = {
          id: `h-fasting-${Date.now()}`,
          questId: questIdentifier,
          questName: `🌙 SIAM / FASTING: Sacred Fast${typeLabel}${updatedFasting.iftarCompleted ? ' [Completed]' : ''}`,
          xp: totalFastingXp,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
      }

      if (messageTitle) {
        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: messageTitle,
          content: messageContent,
          priority: 'medium'
        });
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsDelta),
          momentum: Math.min(100, prev.profile.momentum + (updatedFasting.iftarCompleted ? 5 : 0))
        }
      };
    });
  };

  const updateSunnahPrayers = (updates: Partial<SunnahPrayersLog>, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const currentSunnah = existingLog.sunnahPrayers || {
      duhaRakats: 0,
      tahiyyatAlMasjid: false,
      sunnatAlWudu: false,
      istikhara: false,
      tawbah: false,
      hajah: false,
      sujudShukrOrTilawah: false
    };

    const updatedSunnah: SunnahPrayersLog = {
      ...currentSunnah,
      ...updates
    };

    let totalSunnahXp = 0;
    let coinsDelta = 0;
    if (updatedSunnah.duhaRakats > 0) {
      const duhaPairs = Math.floor(updatedSunnah.duhaRakats / 2);
      totalSunnahXp += duhaPairs * 40;
      coinsDelta += duhaPairs * 5;
    }
    if (updatedSunnah.tahiyyatAlMasjid) {
      totalSunnahXp += 35;
      coinsDelta += 5;
    }
    if (updatedSunnah.sunnatAlWudu) {
      totalSunnahXp += 30;
      coinsDelta += 5;
    }
    if (updatedSunnah.istikhara) {
      totalSunnahXp += 50;
      coinsDelta += 10;
    }
    if (updatedSunnah.tawbah) {
      totalSunnahXp += 50;
      coinsDelta += 10;
    }
    if (updatedSunnah.hajah) {
      totalSunnahXp += 40;
      coinsDelta += 5;
    }
    if (updatedSunnah.sujudShukrOrTilawah) {
      totalSunnahXp += 20;
      coinsDelta += 5;
    }

    const questIdentifier = `spiritual-sunnah-prayers-${targetDate}`;

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        sunnahPrayers: updatedSunnah
      };

      let updatedHistory = prev.xpHistory.filter(h => h.questId !== questIdentifier);
      if (totalSunnahXp > 0) {
        const entry: XPHistoryEntry = {
          id: `h-sunnah-prayers-${Date.now()}`,
          questId: questIdentifier,
          questName: `🕌 SUNNAH PRAYERS & NAWĀFIL (Duha, Masjid, Tawbah, Istikhara)`,
          xp: totalSunnahXp,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsDelta),
          momentum: Math.min(100, prev.profile.momentum + (totalSunnahXp > 0 ? 2 : 0))
        }
      };
    });
  };

  const updateQuranLog = (updates: Partial<QuranLog>, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const currentQuran = existingLog.quran || {
      pagesRead: 0,
      juzRead: undefined,
      surahName: '',
      surahNumber: undefined,
      ayahNumber: undefined,
      tadabburNotes: '',
      memorizationReviewed: false
    };

    const updatedQuran: QuranLog = {
      ...currentQuran,
      ...updates
    };

    let quranXp = 0;
    let coinsEarned = 0;
    if (updatedQuran.pagesRead > 0) {
      quranXp += Math.min(100, updatedQuran.pagesRead * 5);
      coinsEarned += Math.min(20, Math.floor(updatedQuran.pagesRead / 2));
    }
    if (updatedQuran.juzRead && updatedQuran.juzRead > 0) {
      quranXp += 100;
      coinsEarned += 15;
    }
    if (updatedQuran.tadabburNotes && updatedQuran.tadabburNotes.trim().length > 0) {
      quranXp += 40;
      coinsEarned += 10;
    }
    if (updatedQuran.memorizationReviewed) {
      quranXp += 50;
      coinsEarned += 10;
    }

    const questIdentifier = `spiritual-quran-${targetDate}`;

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        quran: updatedQuran
      };

      let updatedHistory = prev.xpHistory.filter(h => h.questId !== questIdentifier);
      if (quranXp > 0) {
        const entry: XPHistoryEntry = {
          id: `h-quran-${Date.now()}`,
          questId: questIdentifier,
          questName: `📖 QUR'ĀN TILAWAH & TADABBUR (${updatedQuran.pagesRead} pages${updatedQuran.surahName ? ` - ${updatedQuran.surahName}` : ''})`,
          xp: quranXp,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsEarned)
        }
      };
    });
  };

  const updateDhikrLog = (updates: Partial<DhikrTasbeehLog>, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const currentDhikr = existingLog.dhikr || {
      tasbeehAfterSalah: false,
      postSalahAdhkar: {},
      tasbeehCount: 0,
      hamdCount: 0,
      tahlilCount: 0,
      takbirCount: 0,
      istighfarCount: 0,
      hawqalaCount: 0
    };

    const updatedDhikr: DhikrTasbeehLog = {
      ...currentDhikr,
      ...updates
    };

    let dhikrXp = 0;
    let coinsEarned = 0;

    // Post-Salah /5 Adhkar calculation
    const postMap = updatedDhikr.postSalahAdhkar || {};
    const prayersList: (keyof PostSalahAdhkarMap)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let postSalahCount = 0;

    prayersList.forEach(p => {
      const mode = postMap[p];
      if (mode === 'standard33') {
        dhikrXp += 20;
        coinsEarned += 3;
        postSalahCount++;
      } else if (mode === 'mini10') {
        dhikrXp += 12;
        coinsEarned += 2;
        postSalahCount++;
      }
    });

    if (postSalahCount === 5) {
      dhikrXp += 25; // 5/5 all prayers post-adhkar bonus
      coinsEarned += 5;
    }

    if (updatedDhikr.tasbeehAfterSalah && postSalahCount === 0) {
      dhikrXp += 60;
      coinsEarned += 10;
    }

    if ((updatedDhikr.tasbeehCount || 0) >= 33) {
      const sets = Math.min(3, Math.floor((updatedDhikr.tasbeehCount || 0) / 33));
      dhikrXp += sets * 25;
      coinsEarned += sets * 3;
    }
    if ((updatedDhikr.hamdCount || 0) >= 33) {
      const sets = Math.min(3, Math.floor((updatedDhikr.hamdCount || 0) / 33));
      dhikrXp += sets * 25;
      coinsEarned += sets * 3;
    }
    if (updatedDhikr.tahlilCount >= 33) {
      const sets = Math.min(3, Math.floor(updatedDhikr.tahlilCount / 33));
      dhikrXp += sets * 25;
      coinsEarned += sets * 3;
    }
    if ((updatedDhikr.takbirCount || 0) >= 33) {
      const sets = Math.min(3, Math.floor((updatedDhikr.takbirCount || 0) / 33));
      dhikrXp += sets * 25;
      coinsEarned += sets * 3;
    }
    if ((updatedDhikr.istighfarCount || 0) >= 100) {
      dhikrXp += 50;
      coinsEarned += 5;
    }

    const questIdentifier = `spiritual-dhikr-${targetDate}`;

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      const updatedLog: SpiritualDailyLog = {
        ...log,
        dhikr: updatedDhikr
      };

      let updatedHistory = prev.xpHistory.filter(h => h.questId !== questIdentifier);
      if (dhikrXp > 0) {
        const entry: XPHistoryEntry = {
          id: `h-dhikr-${Date.now()}`,
          questId: questIdentifier,
          questName: `📿 ADHKĀR: Tasbīḥ, Ḥamd, Tahlīl & Takbīr Remembrance`,
          xp: dhikrXp,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsEarned)
        }
      };
    });
  };

  const setKhushuRating = (rating: number, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      return {
        ...prev,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: {
            ...log,
            khushuRating: Math.max(1, Math.min(10, rating))
          }
        }
      };
    });
  };

  const getMasjid40Stats = (dateStr?: string): Masjid40Stats => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const spiritualLogs = state.spiritualLogs || {};
    
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const isDateFullyMasjid = (d: string): boolean => {
      const log = spiritualLogs[d];
      if (!log) return false;
      return prayers.every(p => {
        const pray = log[p];
        return pray && pray.inMasjid && pray.fardh !== false;
      });
    };

    // Calculate today's status
    const todayLog = spiritualLogs[targetDate];
    let todayMasjidCount = 0;
    if (todayLog) {
      prayers.forEach(p => {
        if (todayLog[p]?.inMasjid) {
          todayMasjidCount++;
        }
      });
    }
    const isTodayFullyCompleted = todayMasjidCount === 5;

    // Collect all historical qualified dates
    const allLogDates = Object.keys(spiritualLogs);
    const qualifiedDatesSet = new Set<string>();
    allLogDates.forEach(d => {
      if (isDateFullyMasjid(d)) {
        qualifiedDatesSet.add(d);
      }
    });

    if (state.masjid40Covenant?.completedDates) {
      state.masjid40Covenant.completedDates.forEach(d => qualifiedDatesSet.add(d));
    }

    const completedDates = Array.from(qualifiedDatesSet).sort();
    const totalCompletedDays = completedDates.length;

    // Helper for stepping back one day
    const getPrevDate = (currentStr: string): string => {
      try {
        return addDays(currentStr, -1);
      } catch {
        return '';
      }
    };

    let streak = 0;
    // If today is completed, start from today
    if (qualifiedDatesSet.has(targetDate)) {
      streak = 1;
      let checkDate = getPrevDate(targetDate);
      while (checkDate && qualifiedDatesSet.has(checkDate)) {
        streak++;
        checkDate = getPrevDate(checkDate);
      }
    } else {
      // If not completed yet today, check if yesterday was qualified
      const yesterday = getPrevDate(targetDate);
      if (yesterday && qualifiedDatesSet.has(yesterday)) {
        streak = 1;
        let prevDate = getPrevDate(yesterday);
        while (prevDate && qualifiedDatesSet.has(prevDate)) {
          streak++;
          prevDate = getPrevDate(prevDate);
        }
      }
    }

    // Calculate best streak in history
    let bestStreak = 0;
    if (completedDates.length > 0) {
      let currentChain = 0;
      let lastDate: string | null = null;
      for (const d of completedDates) {
        if (!lastDate) {
          currentChain = 1;
        } else {
          const expectedNext = addDays(lastDate, 1);
          if (d === expectedNext) {
            currentChain++;
          } else {
            currentChain = 1;
          }
        }
        lastDate = d;
        if (currentChain > bestStreak) {
          bestStreak = currentChain;
        }
      }
    }
    if (streak > bestStreak) bestStreak = streak;

    if (state.masjid40Covenant?.bestStreak && state.masjid40Covenant.bestStreak > bestStreak) {
      bestStreak = state.masjid40Covenant.bestStreak;
    }

    const currentStreak = streak;
    const daysRemaining = Math.max(0, 40 - currentStreak);
    const progressPercent = Math.min(100, Math.round((currentStreak / 40) * 100));
    const isBaraatanAchieved = currentStreak >= 40 || totalCompletedDays >= 40 || !!state.masjid40Covenant?.isUnlockedBaraatan;

    // Milestone Stages (4 Quadrants of 10 Days)
    let stageNumber = 1;
    let stageNameAr = 'البداية واليقظة • إدراك تكبيرة الإحرام';
    let stageNameEn = 'Foundations of Steadfastness (Takbīrat al-Iḥrām)';
    let stageDesc = 'Cultivating absolute vigilance to arrive at the Masjid before the opening Takbeer of the Imam.';
    let dayRange = 'Days 1 – 10';

    if (currentStreak >= 31 || isBaraatanAchieved) {
      stageNumber = 4;
      stageNameAr = 'بشارة البراءتين • الحرية من النار والنفاق';
      stageNameEn = 'Sanctuary of the Two Divine Freedoms (Al-Barā\'atān)';
      stageDesc = 'Attaining the sublime promise of the Prophet ﷺ: Freedom from the Fire and Freedom from Hypocrisy.';
      dayRange = 'Days 31 – 40';
    } else if (currentStreak >= 21) {
      stageNumber = 3;
      stageNameAr = 'نور الاستقامة • سكينة الصف الأول';
      stageNameEn = 'Radiance of Steadfastness (First Row Stillness)';
      stageDesc = 'The friction of habit is broken; praying in the Masjid becomes the primary sanctuary of your day.';
      dayRange = 'Days 21 – 30';
    } else if (currentStreak >= 11) {
      stageNumber = 2;
      stageNameAr = 'طهارة القلب • محاربة الرياء';
      stageNameEn = 'Purification of the Heart (Dissolving Ostentation)';
      stageDesc = 'Deepening sincerity (Ikhlāṣ) and purifying the inner intention purely for the pleasure of Allah ﷻ.';
      dayRange = 'Days 11 – 20';
    }

    let milestoneTitle = `Day ${currentStreak} of 40 • ${stageNameEn}`;
    if (isBaraatanAchieved) {
      milestoneTitle = 'حَامِلُ البَرَاءَتَيْنِ • Bearer of the Two Divine Freedoms (40 Days Fulfilled)';
    }

    return {
      targetDays: 40,
      currentStreak,
      bestStreak,
      totalCompletedDays,
      completedDates,
      todayMasjidCount,
      isTodayFullyCompleted,
      daysRemaining,
      progressPercent,
      isBaraatanAchieved,
      milestoneTitle,
      currentStage: {
        stageNumber,
        stageNameAr,
        stageNameEn,
        stageDesc,
        dayRange
      }
    };
  };

  const toggleAllPrayersInMasjid = (dateStr?: string, forceState?: boolean) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const completedTimestamp = getSystemTimestamp(targetDate);
    const existingLog = getSpiritualLog(targetDate);
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

    const currentlyAll = prayers.every(p => existingLog[p]?.inMasjid && existingLog[p]?.fardh);
    const targetState = forceState !== undefined ? forceState : !currentlyAll;

    const prayerRewards = {
      fajr: { name: 'Fajr (الفجر)', fardhXp: 150, fardhCoins: 15, onTimeXp: 40, onTimeCoins: 5, masjidXp: 50, masjidCoins: 5 },
      dhuhr: { name: 'Dhuhr (الظهر)', fardhXp: 100, fardhCoins: 10, onTimeXp: 40, onTimeCoins: 5, masjidXp: 50, masjidCoins: 5 },
      asr: { name: 'Asr (العصر)', fardhXp: 120, fardhCoins: 12, onTimeXp: 40, onTimeCoins: 5, masjidXp: 50, masjidCoins: 5 },
      maghrib: { name: 'Maghrib (المغرب)', fardhXp: 100, fardhCoins: 10, onTimeXp: 40, onTimeCoins: 5, masjidXp: 50, masjidCoins: 5 },
      isha: { name: 'Isha (العشاء)', fardhXp: 100, fardhCoins: 10, onTimeXp: 40, onTimeCoins: 5, masjidXp: 50, masjidCoins: 5 }
    };

    setState(prev => {
      const log = (prev.spiritualLogs && prev.spiritualLogs[targetDate]) || createDefaultSpiritualLog(targetDate);
      let updatedHistory = [...prev.xpHistory];
      let deltaCoins = 0;
      const updatedLog: SpiritualDailyLog = { ...log };

      prayers.forEach(p => {
        const curr = log[p] || { fardh: false, onTime: false, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: null };
        const reward = prayerRewards[p];
        const prayerPrefix = `spiritual-prayer-${targetDate}-${p}`;
        const fardhQId = `${prayerPrefix}-fardh`;
        const onTimeQId = `${prayerPrefix}-onTime`;
        const masjidQId = `${prayerPrefix}-inMasjid`;

        if (targetState) {
          updatedLog[p] = {
            ...curr,
            fardh: true,
            onTime: true,
            inMasjid: true,
            completedAt: curr.completedAt || completedTimestamp
          };

          if (!curr.fardh) {
            const fardhEntry: XPHistoryEntry = {
              id: `h-pray-${Date.now()}-${p}-fardh`,
              questId: fardhQId,
              questName: `🕌 PRAYER: Obligatory Fardh ${reward.name}`,
              xp: reward.fardhXp,
              timestamp: completedTimestamp,
              skillIds: []
            };
            updatedHistory = [fardhEntry, ...updatedHistory.filter(h => h.questId !== fardhQId)];
            deltaCoins += reward.fardhCoins;
          }

          if (!curr.onTime) {
            const onTimeEntry: XPHistoryEntry = {
              id: `h-pray-${Date.now()}-${p}-ontime`,
              questId: onTimeQId,
              questName: `⏱️ ON-TIME BONUS: ${reward.name} (في وقتها)`,
              xp: reward.onTimeXp,
              timestamp: completedTimestamp,
              skillIds: []
            };
            updatedHistory = [onTimeEntry, ...updatedHistory.filter(h => h.questId !== onTimeQId)];
            deltaCoins += reward.onTimeCoins;
          }

          if (!curr.inMasjid) {
            const masjidEntry: XPHistoryEntry = {
              id: `h-pray-${Date.now()}-${p}-masjid`,
              questId: masjidQId,
              questName: `🕌 PRAYER: Masjid / Jamā'ah bonus for ${reward.name}`,
              xp: reward.masjidXp,
              timestamp: completedTimestamp,
              skillIds: []
            };
            updatedHistory = [masjidEntry, ...updatedHistory.filter(h => h.questId !== masjidQId)];
            deltaCoins += reward.masjidCoins;
          }
        } else {
          updatedLog[p] = {
            ...curr,
            inMasjid: false
          };
          if (curr.inMasjid) {
            updatedHistory = updatedHistory.filter(h => h.questId !== masjidQId);
            deltaCoins -= reward.masjidCoins;
          }
        }
      });

      const covenantQId = `spiritual-masjid40-day-${targetDate}`;
      if (targetState) {
        const bonusEntry: XPHistoryEntry = {
          id: `h-masjid40-${Date.now()}`,
          questId: covenantQId,
          questName: `🕌 40-DAY SANCTUARY: All 5 Prayers in Masjid Today (أربعون يوماً في جماعة)`,
          xp: 150,
          timestamp: completedTimestamp,
          skillIds: []
        };
        updatedHistory = [bonusEntry, ...updatedHistory.filter(h => h.questId !== covenantQId)];
        deltaCoins += 15;

        addSystemMessage({
          sender: 'SYSTEM',
          category: 'achievement',
          title: `🕌 40-DAY COVENANT: ALL 5 PRAYERS IN MASJID!`,
          content: `All 5 daily prayers fulfilled in the Masjid in congregation for ${targetDate}! You advanced on the path toward Al-Barā'atān (+400 XP total, +40 Coins). «مَنْ صَلَّى لِلَّهِ أَرْبَعِينَ يَوْمًا فِي جَمَاعَةٍ يُدْرِكُ التَّكْبِيرَةَ الأُولَى كُتِبَتْ لَهُ بَرَاءَتَانِ»`,
          priority: 'high'
        });
      } else {
        updatedHistory = updatedHistory.filter(h => h.questId !== covenantQId);
        deltaCoins -= 15;
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        spiritualLogs: {
          ...(prev.spiritualLogs || {}),
          [targetDate]: updatedLog
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + deltaCoins)
        }
      };
    });
  };

  const resetMasjid40Streak = (dateStr?: string) => {
    setState(prev => ({
      ...prev,
      masjid40Covenant: {
        startDate: dateStr || prev.systemDate || getLocalDateString(),
        targetDays: 40,
        completedDates: [],
        currentStreak: 0,
        bestStreak: prev.masjid40Covenant?.bestStreak || 0,
        totalCompletedDays: prev.masjid40Covenant?.totalCompletedDays || 0,
        isUnlockedBaraatan: false
      }
    }));
  };

  const setMasjid40Override = (streak: number) => {
    setState(prev => ({
      ...prev,
      masjid40Covenant: {
        ...(prev.masjid40Covenant || { targetDays: 40, totalCompletedDays: 0, currentStreak: 0, bestStreak: 0 }),
        currentStreak: Math.max(0, streak),
        bestStreak: Math.max(prev.masjid40Covenant?.bestStreak || 0, streak),
        isUnlockedBaraatan: streak >= 40
      }
    }));
  };

  // Adhkar Management System & Sacred Protocol
  const adhkarList: AdhkarItem[] = (state.customAdhkar && state.customAdhkar.length > 0)
    ? state.customAdhkar
    : DEFAULT_ADHKAR_LIST;

  const addAdhkar = (item: Omit<AdhkarItem, 'id'>): { success: boolean; message: string; adhkar: AdhkarItem } => {
    const newId = `adhkar-custom-${Date.now()}`;
    const newAdhkar: AdhkarItem = {
      ...item,
      id: newId,
      isCustom: true,
      order: (adhkarList.length + 1)
    };
    setState(prev => {
      const currentList = (prev.customAdhkar && prev.customAdhkar.length > 0) ? prev.customAdhkar : DEFAULT_ADHKAR_LIST;
      return {
        ...prev,
        customAdhkar: [...currentList, newAdhkar]
      };
    });
    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: `📿 SACRED ADHKĀR ADDED: ${newAdhkar.title}`,
      content: `New ${newAdhkar.category.toUpperCase()} dhikr enrolled into the Sacred Protocol. Target: ${newAdhkar.targetCount}x recitations.`,
      priority: 'low'
    });
    return { success: true, message: 'Adhkar added successfully to Sacred Protocol', adhkar: newAdhkar };
  };

  const updateAdhkar = (id: string, updates: Partial<AdhkarItem>): { success: boolean; message: string } => {
    setState(prev => {
      const currentList = (prev.customAdhkar && prev.customAdhkar.length > 0) ? prev.customAdhkar : DEFAULT_ADHKAR_LIST;
      const updated = currentList.map(a => a.id === id ? { ...a, ...updates } : a);
      return {
        ...prev,
        customAdhkar: updated
      };
    });
    return { success: true, message: 'Adhkar updated successfully' };
  };

  const deleteAdhkar = (id: string): { success: boolean; message: string } => {
    setState(prev => {
      const currentList = (prev.customAdhkar && prev.customAdhkar.length > 0) ? prev.customAdhkar : DEFAULT_ADHKAR_LIST;
      const filtered = currentList.filter(a => a.id !== id);
      return {
        ...prev,
        customAdhkar: filtered
      };
    });
    return { success: true, message: 'Adhkar removed from Sacred Protocol' };
  };

  const resetDefaultAdhkar = () => {
    setState(prev => ({
      ...prev,
      customAdhkar: DEFAULT_ADHKAR_LIST
    }));
  };

  const getAdhkarRecitationCount = (adhkarId: string, dateStr?: string): number => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    return (state.adhkarRecitations?.[targetDate]?.[adhkarId]) || 0;
  };

  const incrementAdhkarRecitation = (adhkarId: string, delta: number, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    const currentList = (state.customAdhkar && state.customAdhkar.length > 0) ? state.customAdhkar : DEFAULT_ADHKAR_LIST;
    const item = currentList.find(a => a.id === adhkarId);
    if (!item) return;

    const currentCount = (state.adhkarRecitations?.[targetDate]?.[adhkarId]) || 0;
    const newCount = Math.max(0, currentCount + delta);
    const wasCompleted = currentCount >= item.targetCount;
    const isNowCompleted = newCount >= item.targetCount;
    const targetTimestamp = getSystemTimestamp(targetDate);
    const questIdentifier = `spiritual-adhkar-rec-${targetDate}-${adhkarId}`;

    setState(prev => {
      const dateRecords = prev.adhkarRecitations?.[targetDate] || {};
      const updatedDateRecords = {
        ...dateRecords,
        [adhkarId]: newCount
      };

      let updatedHistory = [...prev.xpHistory];
      let xpDelta = 0;
      let coinsDelta = 0;

      if (!wasCompleted && isNowCompleted) {
        const xpReward = Math.min(50, Math.max(10, Math.round(item.targetCount * 2)));
        const entry: XPHistoryEntry = {
          id: `h-adhkar-rec-${Date.now()}-${adhkarId}`,
          questId: questIdentifier,
          questName: `📿 DHIKR: ${item.title} (${item.targetCount}x)`,
          xp: xpReward,
          timestamp: targetTimestamp,
          skillIds: []
        };
        updatedHistory = [entry, ...updatedHistory];
        xpDelta = xpReward;
        coinsDelta = 2;
      } else if (wasCompleted && !isNowCompleted) {
        updatedHistory = updatedHistory.filter(h => h.questId !== questIdentifier);
        const xpReward = Math.min(50, Math.max(10, Math.round(item.targetCount * 2)));
        xpDelta = -xpReward;
        coinsDelta = -2;
      }

      const totalXp = updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      const completedBossCount = getCompletedBossQuestsCount(prev.quests, updatedHistory);
      const gated = calculateGatedPlayerLevel(totalXp, completedBossCount);

      return {
        ...prev,
        xpHistory: updatedHistory,
        adhkarRecitations: {
          ...(prev.adhkarRecitations || {}),
          [targetDate]: updatedDateRecords
        },
        profile: {
          ...prev.profile,
          xp: totalXp,
          level: gated.level,
          coins: Math.max(0, (prev.profile.coins ?? 150) + coinsDelta),
          momentum: Math.min(100, prev.profile.momentum + (isNowCompleted && !wasCompleted ? 2 : 0))
        }
      };
    });
  };

  const resetAdhkarRecitation = (adhkarId: string, dateStr?: string) => {
    const targetDate = dateStr || state.systemDate || getLocalDateString();
    setState(prev => {
      const dateRecords = prev.adhkarRecitations?.[targetDate] || {};
      const updatedDateRecords = { ...dateRecords, [adhkarId]: 0 };
      return {
        ...prev,
        adhkarRecitations: {
          ...(prev.adhkarRecitations || {}),
          [targetDate]: updatedDateRecords
        }
      };
    });
  };

  return (
      <POSContext.Provider value={{
        state,
        addSystemMessage,
        markSystemMessageRead,
        markAllSystemMessagesRead,
        deleteSystemMessage,
        clearAllSystemMessages,
        updateNotificationSettings,
        scanDelayedTasks,
        activeFocusSession,
        startFocusSession,
        pauseFocusSession,
        resumeFocusSession,
        stopFocusSession,
        skipFocusStage,
        adjustFocusSessionTime,
        completeFocusCycle,
        activeAdhkarFocusSession,
        startAdhkarFocusSession,
        pauseAdhkarFocusSession,
        resumeAdhkarFocusSession,
        stopAdhkarFocusSession,
        completeAdhkarFocusCycle,
        incrementAdhkarFocusCount,
        addGoal,
      updateGoal,
      deleteGoal,
      clearAllGoals,
      addSubGoal,
      updateSubGoal,
      toggleSubGoal,
      deleteSubGoal,
      addProject,
      updateProject,
      deleteProject,
      clearAllProjects,
      addSubProject,
      updateSubProject,
      toggleSubProject,
      deleteSubProject,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      convertMilestoneToQuest,
      convertSubGoalToQuest,
      addQuest,
      updateQuest,
      deleteQuest,
      completeQuest,
      reopenQuest,
      failQuest,
      duplicateQuest,
      mergeQuests,
      splitQuest,
      processQuestReview,
      archiveQuest,
      unarchiveQuest,
      addFolder,
      updateFolder,
      deleteFolder,
      archiveFolder,
      unarchiveFolder,
      reorderFolders,
      addList,
      updateList,
      deleteList,
      archiveList,
      unarchiveList,
      reorderLists,
      addSubQuest,
      updateSubQuest,
      toggleSubQuest,
      deleteSubQuest,
      addSkill,
      updateSkillName,
      updateSkillTier,
      updateSkillParent,
      toggleArchiveSkill,
      mergeSkills,
      deleteSkill,
      deleteUnusedSkills,
      clearAllSkills,
      equipSkillTitle,
      updateAttributeBase,
      restartAttribute,
      addXp,
      addTimeCredits,
      spendTimeCredits,
      setDailyWakingHours,
      repayTimeDebt,
      getTemporalCapitalInfo,
      startActiveRestSession,
      stopActiveRestSession,
      pauseActiveRestSession,
      resumeActiveRestSession,
      toggleRecoveryMode,
      updateProfileFocus,
      updateJob,
      updateTitle,
      levelUpJob,
      levelUpTitle,
      getJobLevel: getJobLevelHelper,
      getTitleLevel: getTitleLevelHelper,
      getJobLvl: getJobLevelHelper,
      getTitleLvl: getTitleLevelHelper,
      rechargeFatigue,
      addCustomJob,
      updateJobSpec,
      deleteJobSpec,
      deleteCustomJob,
      addCustomTitle,
      updateTitleSpec,
      deleteTitleSpec,
      deleteCustomTitle,
      resetAllData,
      resetLevelAndXp,
      clearAllQuests,
      resetBaselineAttributes,
      getGoalProgress,
      getProjectProgress,
      getMilestoneProgress,
      getSkillXpAndLevel,
      getAttributes,
      getPlayerLevelInfo,
      getAnalytics,
      exportData,
      importData,
      isQuestFinishedForToday,
      isQuestScheduledForDate,
      getWeekdayStr,
      systemDate: state.systemDate || getLocalDateString(),
      setSystemDate,
      syncWithRealClock,
      selectedFolderId,
      setSelectedFolderId,
      selectedListId,
      setSelectedListId,
      addPlanningDocument,
      updatePlanningDocument,
      deletePlanningDocument,
      linkPlanningDocToComponent,
      purchaseShopItem,
      useInventoryItem,
      addCustomShopItem,
      updateShopItem,
      deleteShopItem,
      deleteCustomShopItem,
      resetDefaultShopItems,
      addCoins,
      clearVoucherHistory,
      clearAllVouchers,
      isShopLocked,
      updateBatterySettings,
      toggleBatterySaverMode,
      healSpiritualHp,
      addMuhasabahEntry,
      updateMuhasabahEntry,
      deleteMuhasabahEntry,
      clearAllMuhasabahEntries,
      generateWeeklyMuhasabahSummary,
      saveAndArchiveWeeklySummary,
      clearAllWeeklyArchives,
      deleteWeeklyArchive,
      runWeeklyMuhasabahCycle,
      getRecurringSins,
      addWeakness,
      updateWeakness,
      deleteWeakness,
      getTodayMuhasabahStats,
      recalibrateMizan,
      getSpiritualLog,
      updateSpiritualLog,
      togglePrayer,
      toggleAdhkar,
      incrementSalawat,
      setSalawatCount,
      updateQiyam,
      setQiyamRakats: updateQiyam,
      toggleFasting,
      updateSunnahPrayers,
      updateQuranLog,
      updateDhikrLog,
      setKhushuRating,
      getMasjid40Stats,
      toggleAllPrayersInMasjid,
      resetMasjid40Streak,
      setMasjid40Override,
      adhkarList,
      addAdhkar,
      updateAdhkar,
      deleteAdhkar,
      resetDefaultAdhkar,
      incrementAdhkarRecitation,
      resetAdhkarRecitation,
      getAdhkarRecitationCount,
      visualCodex: state.visualCodex || getStoredVisualCodexSettings(),
      updateVisualCodexSettings,
      setTheme
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
