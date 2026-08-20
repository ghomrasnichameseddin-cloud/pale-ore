import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Goal, Project, Milestone, Quest, Skill, Attribute, UserProfile, XPHistoryEntry, POSState, PowerSeal, QuestFolder, QuestList,
  GoalStatus, GoalPriority, QuestDifficulty, QuestType, ActiveFocusSession, PlanningDocument, SystemMessage,
  ShopItem, RedeemedReward, ShopItemCategory, BatterySettings, SubGoal, SubProject,
  MuhasabahCategory, MuhasabahSeverity, MuhasabahEntry, WeaknessStatus, Weakness, SealRarity
} from './types';
import { INITIAL_STATE, DEFAULT_SEALS, DEFAULT_SHOP_ITEMS, getLocalDateString } from './initialState';

export const getSystemTimestamp = (systemDateStr?: string): string => {
  const dateStr = systemDateStr || getLocalDateString();
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${dateStr}T${hours}:${minutes}:${seconds}`;
};
import { getActiveJob, getAllJobs, getAllTitles, JobSpec, TitleSpec, getJobLevel, getTitleLevel, evaluateLevelConditions, LEVEL_RANK_NAMES } from './jobsAndTitles';
import { 
  getQuestXpMultiplier, getFocusXpMultiplier, getCoinMultiplier, getFailPenaltyMultiplier, getMomentumMultiplier 
} from './utils/perkEvaluator';

interface POSContextType {
  state: POSState;
  
  // System Messages
  addSystemMessage: (msg: Omit<SystemMessage, 'id' | 'timestamp' | 'read'>) => string;
  markSystemMessageRead: (id: string) => void;
  markAllSystemMessagesRead: () => void;
  deleteSystemMessage: (id: string) => void;
  clearAllSystemMessages: () => void;

  // Pomodoro Focus Timer
  activeFocusSession: ActiveFocusSession | null;
  startFocusSession: (questId: string | null, workTime?: number, restTime?: number, estimatedCycles?: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  stopFocusSession: () => void;
  skipFocusStage: () => void;
  adjustFocusSessionTime: (deltaMinutes: number) => void;
  completeFocusCycle: (questId: string | null) => void;
  
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
  
  // XP Actions
  addXp: (amount: number, reason?: string, skillIds?: string[]) => void;

  // Power Seals CRUD & System Actions
  addSeal: (seal: Omit<PowerSeal, 'id' | 'status' | 'brokenAt' | 'createdAt'>) => string;
  updateSeal: (id: string, updates: Partial<PowerSeal>) => void;
  deleteSeal: (id: string) => void;
  breakSeal: (id: string) => { success: boolean; message: string };
  relockSeal: (id: string) => void;
  resetSealsToDefault: () => void;
  
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
  getPlayerLevelInfo: () => { level: number; totalXp: number; xpIntoLevel: number; xpUntilNextLevel: number; progress: number; rank: string; xpRequiredForNextLevel: number };
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
  addMuhasabahEntry: (entry: {
    title: string;
    description?: string;
    category: MuhasabahCategory;
    severity: MuhasabahSeverity;
    cause: string;
    reflection?: string;
    createCorrectiveQuest?: boolean;
    correctiveQuestName?: string;
    recoveryPercentage?: number;
    weaknessId?: string | null;
    weaknessName?: string | null;
  }) => { success: boolean; entryId: string; xpDeducted: number; rawPenalty: number; capReached: boolean; message: string };
  updateMuhasabahEntry: (id: string, updates: Partial<MuhasabahEntry>) => void;
  deleteMuhasabahEntry: (id: string) => void;
  clearAllMuhasabahEntries: () => void;

  // Weaknesses Management
  addWeakness: (weakness: Omit<Weakness, 'id' | 'createdAt'>) => string;
  updateWeakness: (id: string, updates: Partial<Weakness>) => void;
  deleteWeakness: (id: string) => void;
  convertWeaknessToSeal: (weaknessId: string, customRarity?: SealRarity) => { success: boolean; sealId?: string; message: string };
  getTodayMuhasabahStats: () => {
    todayEarnedXP: number;
    todayLostXP: number;
    todayNetXP: number;
    dailyCapRemaining: number;
    totalEntriesCount: number;
    activeWeaknessesCount: number;
    sealedWeaknessesCount: number;
  };
  recalibrateMizan: () => { success: boolean; message: string; timestamp: string };
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

const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
  try {
    const [y1, m1, d1] = dateStr1.split('T')[0].split('-').map(Number);
    const [y2, m2, d2] = dateStr2.split('T')[0].split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date2.getTime() - date1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

export const getWeekdayStr = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[date.getDay()];
  } catch (e) {
    return '';
  }
};

export const isQuestScheduledForDate = (q: Quest, dateStr: string): boolean => {
  // If the quest was explicitly postponed to this specific date, it is scheduled for this date
  if (q.postponedTo === dateStr) {
    return true;
  }

  // If the quest was postponed FROM this date to a DIFFERENT date, it is deferred away from this date
  if (q.postponedFrom === dateStr && q.postponedTo && q.postponedTo !== dateStr) {
    return false;
  }

  // If the quest has an explicit deadline matching this date, it is scheduled for this date
  if (q.deadline === dateStr) {
    return true;
  }

  if (!q.recurrence || q.recurrence === 'None') {
    return true;
  }

  const rec = q.recurrence.toLowerCase();

  // 1. Check for specific day-of-week constraints first
  const currentWeekday = getWeekdayStr(dateStr).toLowerCase();
  const fullWeekdaysMap: Record<string, string> = {
    'sunday': 'sun', 'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
    'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat'
  };

  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let hasWeekdayConstraint = false;
  let matchesWeekday = false;

  for (const day of weekdays) {
    const shortPattern = day;
    const fullPattern = Object.keys(fullWeekdaysMap).find(k => fullWeekdaysMap[k] === day) || '';
    
    if (rec.includes(shortPattern) || (fullPattern && rec.includes(fullPattern))) {
      hasWeekdayConstraint = true;
      if (currentWeekday === day) {
        matchesWeekday = true;
      }
    }
  }

  if (hasWeekdayConstraint) {
    return matchesWeekday;
  }

  // 2. Check for "Every N Days" interval pattern (e.g. "Every 2 Days", "Custom: Every 3 Days")
  const everyDaysMatch = rec.match(/every\s+(\d+)\s+days?/i);
  if (everyDaysMatch) {
    const n = parseInt(everyDaysMatch[1], 10);
    if (n > 0) {
      const creationDateStr = q.createdAt.split('T')[0];
      const diff = getDaysDifference(creationDateStr, dateStr);
      return diff >= 0 && diff % n === 0;
    }
  }

  // 3. Check for Monthly recurrence
  if (rec === 'monthly') {
    const creationDateStr = q.createdAt.split('T')[0];
    const [cYear, cMonth, cDay] = creationDateStr.split('-').map(Number);
    const [tYear, tMonth, tDay] = dateStr.split('-').map(Number);
    const lastDayOfTargetMonth = new Date(tYear, tMonth, 0).getDate();
    const targetDayToMatch = Math.min(cDay, lastDayOfTargetMonth);
    return tDay === targetDayToMatch;
  }

  // 4. Check for Weekly recurrence
  if (rec === 'weekly') {
    const creationDateStr = q.createdAt.split('T')[0];
    const creationWeekday = getWeekdayStr(creationDateStr).toLowerCase();
    return currentWeekday === creationWeekday;
  }

  // 5. Default to true for Daily or other non-weekday custom patterns
  return true;
};

export const isQuestArchived = (
  q: Quest,
  lists: QuestList[] = [],
  folders: QuestFolder[] = []
): boolean => {
  if (q.archived) return true;
  if (q.listId) {
    const list = lists.find(l => l.id === q.listId);
    if (list?.archived) return true;
    if (list?.folderId) {
      const folder = folders.find(f => f.id === list.folderId);
      if (folder?.archived) return true;
    }
  }
  return false;
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

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<POSState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Robustly merge to guarantee all schema properties are defined
          return {
            ...INITIAL_STATE,
            ...parsed,
            profile: {
              ...INITIAL_STATE.profile,
              ...(parsed.profile || {}),
              coins: parsed.profile?.coins ?? 150,
              focusShields: parsed.profile?.focusShields ?? 0
            },
            shopItems: (parsed.shopItems && parsed.shopItems.length > 0) ? parsed.shopItems : DEFAULT_SHOP_ITEMS,
            inventory: parsed.inventory || [],
            goals: parsed.goals || [],
            projects: parsed.projects || [],
            milestones: parsed.milestones || [],
            quests: parsed.quests || [],
            folders: parsed.folders || [],
            lists: parsed.lists || [],
            skills: parsed.skills || [],
            attributes: (parsed.attributes && parsed.attributes.length > 0) ? parsed.attributes : INITIAL_STATE.attributes,
            xpHistory: parsed.xpHistory || [],
            systemDate: parsed.systemDate || INITIAL_STATE.systemDate,
            planningDocuments: parsed.planningDocuments || INITIAL_STATE.planningDocuments,
            messages: parsed.messages || INITIAL_STATE.messages || []
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

  useEffect(() => {
    if (!activeFocusSession) return;
    if (activeFocusSession.completedCycles > 0) {
      const cycleMinutes = activeFocusSession.totalWorkTime;
      const todayStr = new Date().toISOString().split('T')[0];
      
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
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
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

        return {
          ...prev,
          xpHistory: updatedHistory,
          profile: {
            ...prev.profile,
            focusMinutesToday: prevMinutes + cycleMinutes,
            focusStreak: newStreak,
            lastFocusDate: todayStr,
            xp: totalXp,
            level
          }
        };
      });
    }
  }, [activeFocusSession?.completedCycles]);

  // LEVEL-UP NOTIFICATION MONITORING FOR ALL ASPECTS
  const prevPlayerLevelRef = useRef<number | null>(null);
  const prevSkillLevelsRef = useRef<Record<string, number>>({});
  const prevAttributeLevelsRef = useRef<Record<string, number>>({});
  const prevSealsStatusRef = useRef<Record<string, string>>({});

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

    // 4. Power Seal Shatter Check
    const newSealStatuses: Record<string, string> = {};
    (state.seals || []).forEach(seal => {
      const prevStatus = prevSealsStatusRef.current[seal.id];
      if (prevStatus !== undefined && prevStatus !== 'Broken' && seal.status === 'Broken') {
        addSystemMessage({
          sender: 'OPERATOR',
          category: 'achievement',
          title: `🔮 POWER SEAL SHATTERED: ${seal.name}`,
          content: `Arcane seal broken! "${seal.name}" (${seal.rarity}) is unsealed. Activated Buff: ${seal.buffName} (${seal.buffDescription})!`,
          priority: 'high'
        });
      }
      newSealStatuses[seal.id] = seal.status;
    });
    prevSealsStatusRef.current = newSealStatuses;

  }, [state.profile.xp, state.xpHistory, state.seals, state.skills]);

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

  const isQuestFinishedForToday = (q: Quest): boolean => {
    const targetDateStr = state.systemDate || new Date().toISOString().split('T')[0];
    
    // If it is a recurring quest, its finished status for today is ONLY determined by completedAt
    if (q.recurrence && q.recurrence !== 'None') {
      if (q.completedAt) {
        try {
          const completedDateStr = new Date(q.completedAt).toISOString().split('T')[0];
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
        const completedDateStr = new Date(q.completedAt).toISOString().split('T')[0];
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
    const daysDiff = getDaysDifference(oldDate, newDateStr);
    const normalizedQuests = prev.quests.map(q => {
      if (q.status === 'Active' && q.postponedTo && q.postponedTo <= newDateStr) {
        return {
          ...q,
          postponedFrom: null,
          postponedTo: null
        };
      }
      return q;
    });

    let updatedQuests = [...normalizedQuests];
    let updatedHistory = [...prev.xpHistory];
    let updatedMomentum = prev.profile.momentum;
    let recoveryModeActivated = false;

    if (daysDiff >= 1) {
      // Find ALL quests active on oldDate that were left unchecked (incomplete)
      const uncheckedQuests = normalizedQuests.filter(q => {
        if (q.status !== 'Active') return false;
        if (isQuestArchived(q, prev.lists, prev.folders)) return false;
        if (q.type.toUpperCase() === 'PENALTY' || q.type.toUpperCase() === 'RECOVERY') return false;

        // DO NOT PENALIZE if the user explicitly postponed this quest on/from oldDate or set deadline > oldDate.
        // If the postponed target date has arrived, the quest has already been normalized back into its regular active state.
        if (q.postponedFrom === oldDate) return false;
        if (q.postponedTo && q.postponedTo > oldDate) return false;
        if (q.deadline && q.deadline > oldDate) return false;

        // Check if recurring
        if (q.recurrence && q.recurrence !== 'None') {
          const isScheduled = isQuestScheduledForDate(q, oldDate);
          if (!isScheduled) return false;

          if (q.completedAt) {
            const compDate = q.completedAt.split('T')[0];
            if (compDate === oldDate) {
              return false; // completed on oldDate
            }
          }
          return true; // scheduled but not completed on oldDate
        } else {
          // One-off quest
          if (q.deadline && q.deadline <= oldDate) {
            return true;
          }
          return false;
        }
      });

      // Apply penalties for each unchecked quest and automatically create penalty recovery quests
      const activeJobForMidnight = getActiveJob(prev.profile.jobId, prev.customJobs || [], prev.deletedJobIds || []);
      const penaltyReduction = getFailPenaltyMultiplier(activeJobForMidnight);

      uncheckedQuests.forEach(q => {
        let penaltyXp = 50;
        if (q.difficulty === 'Easy') penaltyXp = 25;
        else if (q.difficulty === 'Normal') penaltyXp = 50;
        else if (q.difficulty === 'Hard') penaltyXp = 100;
        else if (q.difficulty === 'Boss') penaltyXp = 250;

        const isCritical = q.type === 'Main' || q.type === 'Boss' || q.difficulty === 'Hard' || q.difficulty === 'Boss';
        const basePenaltyXp = isCritical ? penaltyXp * 1.5 : penaltyXp;
        const finalPenaltyXp = Math.round(basePenaltyXp * penaltyReduction);

        const xpHistoryId = `h-fail-midnight-${q.id}-${Date.now()}`;
        const penaltyEntry: XPHistoryEntry = {
          id: xpHistoryId,
          questId: q.id,
          questName: `💀 MIDNIGHT PENALTY: Unchecked "${q.name}"`,
          xp: -Math.round(finalPenaltyXp),
          timestamp: new Date().toISOString(),
          skillIds: q.relatedSkills || []
        };

        updatedHistory.unshift(penaltyEntry);
        const momentumLoss = isCritical ? 25 : 10;
        updatedMomentum = Math.max(0, updatedMomentum - momentumLoss);

        // If one-off, mark as Failed
        if (!q.recurrence || q.recurrence === 'None') {
          updatedQuests = updatedQuests.map(uq => {
            if (uq.id === q.id) {
              return {
                ...uq,
                status: 'Failed' as const,
                completedAt: new Date().toISOString()
              };
            }
            return uq;
          });
        }

        // Generate the recovery/penalty quest (estimated time divided by 2 compared to original quest)
        const origEstTime = typeof q.estimatedTime === 'number' && q.estimatedTime > 0 ? q.estimatedTime : 30;
        const recoveryEstTime = Math.max(1, Math.round(origEstTime / 2));

        const pQuest: Quest = {
          id: `q-penalty-${q.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: `⚠️ RECOVERY: Resolve failed/unchecked "${q.name}"`,
          description: `System-generated recovery directive due to unchecked/failed objective "${q.name}". Resolve this to restore operations.`,
          status: 'Active' as const,
          difficulty: q.difficulty === 'Custom' ? 'Normal' : q.difficulty,
          type: 'Penalty',
          estimatedTime: recoveryEstTime,
          recurrence: 'None',
          energyLevel: 'Medium',
          deadline: q.deadline || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          completedAt: null,
          xp: 0,
          goalId: q.goalId || null,
          projectId: q.projectId || null,
          milestoneId: q.milestoneId || null,
          subquests: [
            {
              id: `sq-penalty-${q.id}-1`,
              name: `Resolve the underlying issue or complete the remaining actions of "${q.name}"`,
              completed: false
            }
          ],
          relatedSkills: q.relatedSkills || []
        };

        updatedQuests.push(pQuest);
        const typeUpper = q.type.toUpperCase();
        if (typeUpper === 'MAIN' || typeUpper === 'BOSS' || typeUpper === 'HABIT') {
          recoveryModeActivated = true;
        }
      });
    }

    return { updatedQuests, updatedHistory, updatedMomentum, recoveryModeActivated };
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
  const getPlayerLevelInfo = () => {
    // Use historical completions to get total earned XP
    const totalXp = state.xpHistory.reduce((sum, h) => sum + h.xp, 0);
    
    const level = calculatePlayerLevel(totalXp);
    const xpNeededForCurrentLevel = 250 * (level - 1) * (level + 2);
    const xpRequiredForNextLevel = 500 * level + 500; // XP required to level up from current level to next level
    
    const xpIntoLevel = totalXp - xpNeededForCurrentLevel;
    const xpUntilNextLevel = xpRequiredForNextLevel - xpIntoLevel;
    const progress = Math.round((xpIntoLevel / xpRequiredForNextLevel) * 100);

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

    return { level, totalXp, xpIntoLevel, xpUntilNextLevel, progress, rank, xpRequiredForNextLevel };
  };

  // Dynamic Attribute Engine (grounded in completed quests evidence)
  const getAttributes = (): Attribute[] => {
    // Analyze all completion events in the XP history, matching them with their quest details
    const completedEvents = state.xpHistory.map(h => {
      const q = state.quests.find(quest => quest.id === h.questId);
      return {
        ...h,
        type: q?.type || 'Side',
        goalId: q?.goalId || null,
        difficulty: q?.difficulty || 'Normal'
      };
    });
    
    return state.attributes.map(attr => {
      // Find related events based on attributes rules
      let relatedCount = 0;
      let divider = 3; // Quests needed per level

      if (attr.name === 'Strength') {
        // Fitness and Boss quests
        relatedCount = completedEvents.filter(e => e.skillIds.some(s => {
          const skill = state.skills.find(sk => sk.id === s);
          return skill?.name === 'Fitness';
        }) || e.type === 'Boss').length;
        divider = 2; // Fast strength build
      } else if (attr.name === 'Endurance') {
        // Total completed events
        relatedCount = completedEvents.length;
        divider = 4;
      } else if (attr.name === 'Agility') {
        // Side quests and quick tasks
        relatedCount = completedEvents.filter(e => e.type === 'Side' || e.type === 'Optional').length;
        divider = 3;
      } else if (attr.name === 'Focus') {
        // Main quests completed
        relatedCount = completedEvents.filter(e => e.type === 'Main').length;
        divider = 3;
      } else if (attr.name === 'Discipline') {
        // Habit quests and side quests
        relatedCount = completedEvents.filter(e => e.type === 'Habit' || e.type === 'Side').length;
        divider = 3;
      } else if (attr.name === 'Knowledge') {
        // Programming, chess, or language quests
        relatedCount = completedEvents.filter(e => e.skillIds.some(s => {
          const skill = state.skills.find(sk => sk.id === s);
          return ['Programming', 'English', 'Arabic', 'French', 'Chess'].includes(skill?.name || '');
        })).length;
        divider = 2;
      } else if (attr.name === 'Wisdom') {
        // Goals completed (represented by completed quests with Goal assignments)
        relatedCount = completedEvents.filter(e => e.goalId !== null).length;
        divider = 3;
      } else if (attr.name === 'Social') {
        // Communication, writing, or cooking
        relatedCount = completedEvents.filter(e => e.skillIds.some(s => {
          const skill = state.skills.find(sk => sk.id === s);
          return ['Writing', 'Cooking', 'Business'].includes(skill?.name || '');
        })).length;
        divider = 3;
      } else if (attr.name === 'Faith') {
        // Qur'an and Arabic
        relatedCount = completedEvents.filter(e => e.skillIds.some(s => {
          const skill = state.skills.find(sk => sk.id === s);
          return ['Qur\'an', 'Arabic'].includes(skill?.name || '');
        })).length;
        divider = 2;
      }

      // Base level is what is in state, we add the earned levels & broken seal attribute boosts
      const baseLevel = attr.level;
      const extraLevels = Math.floor(relatedCount / divider);
      
      const brokenSealAttributeBoost = (state.seals || [])
        .filter(s => s.status === 'Broken')
        .flatMap(s => s.attributeBoosts || [])
        .filter(b => b.attributeId === attr.id)
        .reduce((sum, b) => sum + b.boostAmount, 0);

      const level = baseLevel + extraLevels + brokenSealAttributeBoost;
      const progress = Math.round(((relatedCount % divider) / divider) * 100);

      return {
        ...attr,
        baseLevel,
        earnedBonus: extraLevels,
        sealBoost: brokenSealAttributeBoost,
        total: level,
        level,
        progress
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

      return {
        ...prev,
        quests: remainingQuests,
        xpHistory: prev.xpHistory.filter(h => h.questId !== id),
        profile: {
          ...prev.profile,
          recoveryMode: newRecoveryMode
        }
      };
    });
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

    let earnedXp = Math.round(questToComplete.xp * habitXpMultiplier * questPerkXpMultiplier);

    // Calculate Power Seal XP Bonus Multiplier
    const brokenSeals = (state.seals || []).filter(s => s.status === 'Broken');
    const sealXpMultiplier = brokenSeals.reduce((acc, s) => acc * (s.xpBonusMultiplier || 1.0), 1.0);
    if (sealXpMultiplier > 1.0) {
      earnedXp = Math.round(earnedXp * sealXpMultiplier);
    }

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
        muhasabahEntries: updatedMuhasabahEntries,
        profile: {
          ...prev.profile,
          xp: totalXp,
          level,
          coins: (prev.profile.coins ?? 150) + totalCoinsEarned,
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
    const penaltyEntry: XPHistoryEntry = {
      id: xpHistoryId,
      questId: questToFail.id,
      questName: `💀 PENALTY: Failed "${questToFail.name}"`,
      xp: -Math.round(finalPenaltyXp),
      timestamp: failedTimestamp,
      skillIds: questToFail.relatedSkills
    };

    const momentumLoss = isImportant ? 25 : 10;
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

      // Generate the recovery/penalty quest (estimated time divided by 2 compared to original quest)
      const origEstTime = typeof questToFail.estimatedTime === 'number' && questToFail.estimatedTime > 0 ? questToFail.estimatedTime : 30;
      const recoveryEstTime = Math.max(1, Math.round(origEstTime / 2));

      const pQuest: Quest = {
        id: `q-penalty-${questToFail.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `⚠️ RECOVERY: Resolve failed/unchecked "${questToFail.name}"`,
        description: `System-generated recovery directive due to unchecked/failed objective "${questToFail.name}". Resolve this to restore operations.`,
        status: 'Active' as const,
        difficulty: questToFail.difficulty === 'Custom' ? 'Normal' : questToFail.difficulty,
        type: 'Penalty',
        estimatedTime: recoveryEstTime,
        recurrence: 'None',
        energyLevel: 'Medium',
        deadline: questToFail.deadline || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        completedAt: null,
        xp: 0,
        goalId: questToFail.goalId || null,
        projectId: questToFail.projectId || null,
        milestoneId: questToFail.milestoneId || null,
        subquests: [
          {
            id: `sq-penalty-${questToFail.id}-1`,
            name: `Resolve the underlying issue or complete the remaining actions of "${questToFail.name}"`,
            completed: false
          }
        ],
        relatedSkills: questToFail.relatedSkills || []
      };

      const finalQuestsList = [...updatedQuests, pQuest];

      const updatedHistory = resolveRecoveredPenalties([penaltyEntry, ...prev.xpHistory]);
      const totalXp = Math.max(0, updatedHistory.reduce((sum, h) => sum + h.xp, 0));
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

      const typeUpper = questToFail.type.toUpperCase();
      const activatesRecovery = typeUpper === 'MAIN' || typeUpper === 'BOSS' || typeUpper === 'HABIT';
      const newRecoveryMode = activatesRecovery ? true : prev.profile.recoveryMode;

      return {
        ...prev,
        quests: finalQuestsList,
        skills: updatedSkills,
        xpHistory: updatedHistory,
        profile: {
          ...prev.profile,
          xp: totalXp,
          level,
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
            const wasCompletedToday = q.completedAt && new Date(q.completedAt).toDateString() === new Date().toDateString();
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
      const tomorrowDate = new Date(todayStr);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

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
    setState(prev => ({
      ...prev,
      attributes: prev.attributes.map(a => a.id === id ? { ...a, level } : a)
    }));
  };

  // POWER SEALS CRUD & ACTIONS
  const addSeal = (seal: Omit<PowerSeal, 'id' | 'status' | 'brokenAt' | 'createdAt'>): string => {
    const id = `seal-${Date.now()}`;
    const newSeal: PowerSeal = {
      ...seal,
      id,
      status: 'Locked',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      seals: [...(prev.seals || []), newSeal]
    }));
    addSystemMessage({
      sender: 'OPERATOR',
      category: 'log',
      title: 'Power Seal Formed',
      content: `Constructed new ${seal.rarity} Power Seal "${seal.name}". Seal is currently locked.`,
      priority: 'low'
    });
    return id;
  };

  const updateSeal = (id: string, updates: Partial<PowerSeal>) => {
    setState(prev => ({
      ...prev,
      seals: (prev.seals || []).map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const deleteSeal = (id: string) => {
    setState(prev => ({
      ...prev,
      seals: (prev.seals || []).filter(s => s.id !== id)
    }));
  };

  const relockSeal = (id: string) => {
    setState(prev => ({
      ...prev,
      seals: (prev.seals || []).map(s => s.id === id ? { ...s, status: 'Locked' as const, brokenAt: null } : s)
    }));
  };

  const resetSealsToDefault = () => {
    setState(prev => ({
      ...prev,
      seals: DEFAULT_SEALS
    }));
  };

  const breakSeal = (id: string): { success: boolean; message: string } => {
    const targetSeal = (state.seals || []).find(s => s.id === id);
    if (!targetSeal) return { success: false, message: 'Seal not found in system manifest.' };
    if (targetSeal.status === 'Broken') return { success: false, message: 'Seal is already shattered!' };

    const playerInfo = getPlayerLevelInfo();
    // 1. Level Requirement Check
    if (playerInfo.level < targetSeal.requiredLevel) {
      return { 
        success: false, 
        message: `Requires Level ${targetSeal.requiredLevel}+ (Current: Level ${playerInfo.level}). Complete more directives to level up.` 
      };
    }

    // 2. Quest Requirement Check
    if (targetSeal.requiredQuestId) {
      const reqQuest = state.quests.find(q => q.id === targetSeal.requiredQuestId);
      if (reqQuest && reqQuest.status !== 'Completed') {
        return { 
          success: false, 
          message: `Requires completion of directive "${reqQuest.name}".` 
        };
      }
    }

    // 3. Skill Requirement Check
    if (targetSeal.requiredSkillId && targetSeal.requiredSkillLevel) {
      const skillInfo = getSkillXpAndLevel(targetSeal.requiredSkillId);
      const reqSkill = state.skills.find(s => s.id === targetSeal.requiredSkillId);
      if (skillInfo.level < targetSeal.requiredSkillLevel) {
        return { 
          success: false, 
          message: `Requires Level ${targetSeal.requiredSkillLevel}+ in skill "${reqSkill?.name || 'Required Skill'}".` 
        };
      }
    }

    // 3.5. Required Habit Streak Check
    if (targetSeal.requiredStreakDays) {
      const maxStreakInSystem = state.quests.reduce((max, q) => Math.max(max, q.streakCount || 0, q.bestStreak || 0), 0);
      if (maxStreakInSystem < targetSeal.requiredStreakDays) {
        return {
          success: false,
          message: `Requires a ${targetSeal.requiredStreakDays}-day habit streak (Highest Active/Best Streak: ${maxStreakInSystem} days).`
        };
      }
    }

    // 4. XP Cost Sacrifice Check
    if (targetSeal.costXP > 0 && playerInfo.totalXp < targetSeal.costXP) {
      return { 
        success: false, 
        message: `Insufficient XP reserves. Required: ${targetSeal.costXP} XP (Current Total: ${playerInfo.totalXp} XP).` 
      };
    }

    const timestamp = getSystemTimestamp(state.systemDate);

    // Deduct XP sacrifice if cost > 0 via a special XP History sacrifice entry
    const xpEntries: XPHistoryEntry[] = [];
    if (targetSeal.costXP > 0) {
      xpEntries.push({
        id: `h-seal-shatter-${Date.now()}`,
        questId: null,
        questName: `🔮 POWER SEAL SHATTERED: "${targetSeal.name}" (XP Sacrificed)`,
        xp: -targetSeal.costXP,
        timestamp,
        skillIds: []
      });
    } else {
      xpEntries.push({
        id: `h-seal-shatter-${Date.now()}`,
        questId: null,
        questName: `🔮 POWER SEAL SHATTERED: "${targetSeal.name}"`,
        xp: 100, // Bonus XP
        timestamp,
        skillIds: []
      });
    }

    setState(prev => {
      const updatedSeals = (prev.seals || []).map(s => 
        s.id === id ? { ...s, status: 'Broken' as const, brokenAt: timestamp } : s
      );

      const updatedHistory = resolveRecoveredPenalties([...xpEntries, ...prev.xpHistory]);
      const totalXp = Math.max(0, updatedHistory.reduce((sum, h) => sum + h.xp, 0));
      const level = calculatePlayerLevel(totalXp);

      return {
        ...prev,
        seals: updatedSeals,
        xpHistory: updatedHistory,
        profile: {
          ...prev.profile,
          momentum: Math.min(100, prev.profile.momentum + (targetSeal.momentumBoost || 10)),
          xp: totalXp,
          level
        }
      };
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'achievement',
      title: `🔮 POWER SEAL SHATTERED: ${targetSeal.name.toUpperCase()}`,
      content: `UNSEALED! Granted Buff: "${targetSeal.buffName}" (${targetSeal.buffDescription}). Passive system multiplier active.`,
      priority: 'high'
    });

    return { 
      success: true, 
      message: `🔮 SEAL BROKEN! Empowered with "${targetSeal.buffName}".` 
    };
  };

  // Reward Shop & Coins Operations
  const isShopLocked = React.useMemo(() => {
    const todayStr = state.systemDate || getLocalDateString();
    const REQUIRED_SHOP_LOCK_TYPES = ['MAIN', 'BOSS', 'PENALTY', 'HABIT'];

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
    if (currentCoins < item.costCoins) {
      return {
        success: false,
        message: `Insufficient Coins! You have ${currentCoins} 🪙, but "${item.name}" costs ${item.costCoins} 🪙.`
      };
    }

    const timestamp = getSystemTimestamp(state.systemDate);
    const isPerkInstant = item.category === 'System Perk';

    const newReward: RedeemedReward = {
      id: `reward-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      costCoins: item.costCoins,
      category: item.category,
      icon: item.icon,
      redeemedAt: timestamp,
      status: isPerkInstant ? 'Used' : 'Available',
      usedAt: isPerkInstant ? timestamp : null
    };

    let xpSurgeHistoryEntry: XPHistoryEntry | null = null;

    setState(prev => {
      const remainingCoins = (prev.profile.coins ?? 150) - item.costCoins;
      let updatedProfile = { ...prev.profile, coins: remainingCoins };

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
    setState(prev => ({
      ...prev,
      attributes: prev.attributes.map(a => ({ ...a, level: 1, progress: 0 }))
    }));
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
    const today = new Date().toISOString().split('T')[0];
    
    // Today's XP
    const todayEvents = state.xpHistory.filter(h => h.timestamp.startsWith(today));
    const todayXp = todayEvents.reduce((sum, h) => sum + h.xp, 0);

    // Weekly XP
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyEvents = state.xpHistory.filter(h => new Date(h.timestamp) >= oneWeekAgo);
    const weeklyXp = weeklyEvents.reduce((sum, h) => sum + h.xp, 0);

    // Monthly XP
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyEvents = state.xpHistory.filter(h => new Date(h.timestamp) >= oneMonthAgo);
    const monthlyXp = monthlyEvents.reduce((sum, h) => sum + h.xp, 0);

    // Calculate daily XP breakdown for charts (past 7 days)
    const dailyXpTrend: { date: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = state.xpHistory.filter(h => h.timestamp.startsWith(dateStr));
      const dayXp = dayEvents.reduce((sum, h) => sum + h.xp, 0);
      
      // Beautiful short string (e.g. "Jul 07" or "07 Jul")
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
        animationThrottle: next ? 'Off' : 'Reduced'
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

  const SEVERITY_XP_PENALTIES: Record<MuhasabahSeverity, number> = {
    Minor: 100,
    Moderate: 200,
    Major: 300,
    Severe: 400,
    Critical: 500
  };

  const SEVERITY_COIN_FINES: Record<MuhasabahSeverity, number> = {
    Minor: 10,
    Moderate: 25,
    Major: 50,
    Severe: 100,
    Critical: 200
  };

  const SEVERITY_MOMENTUM_PENALTIES: Record<MuhasabahSeverity, number> = {
    Minor: 15,
    Moderate: 35,
    Major: 100, // Complete momentum wipe
    Severe: 100,
    Critical: 100
  };

  const DEFAULT_KAFFARAH_TEMPLATES: Record<MuhasabahCategory, { title: string; type: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus'; desc: string; xp: number }> = {
    Obligations: {
      title: '2 Rak\'ahs of Tawbah & Surah Al-Mulk Recitation',
      type: 'Prayer',
      desc: 'Immediate spiritual re-alignment through sincere voluntary prayer and solemn Quranic recitation.',
      xp: 60
    },
    Desires: {
      title: 'Dopamine Fast (45m Screen Detox) & $5 Sadaqah Charity',
      type: 'Detox',
      desc: 'Break appetite and impulse hooks through voluntary screen fasting and tangible monetary charity.',
      xp: 50
    },
    Speech: {
      title: '100x Istighfār & Sincere Secret Du\'a for Others',
      type: 'Quran',
      desc: 'Cleanse speech slips by uttering 100 sincere seeking of forgiveness and making heartfelt secret prayers for others.',
      xp: 45
    },
    Heart: {
      title: 'Perform 1 Hidden Good Deed with Zero Broadcast',
      type: 'Service',
      desc: 'Purge vanity and pride by executing an intentional act of goodness known only to the Creator.',
      xp: 55
    },
    Rights: {
      title: 'Direct Sincere Apology or Act of Service for Kin',
      type: 'Service',
      desc: 'Mend broken ties through prompt humility, verbal apology, or a physical act of helpfulness.',
      xp: 50
    },
    'Wasted Potential': {
      title: 'Execute 1 Locked Deep Focus Sprint (25m)',
      type: 'Focus',
      desc: 'Shatter procrastination drift with a strictly monitored 25-minute single-task deep focus cycle.',
      xp: 60
    }
  };

  const addMuhasabahEntry = (entry: {
    title: string;
    description?: string;
    category: MuhasabahCategory;
    severity: MuhasabahSeverity;
    cause: string;
    reflection?: string;
    createCorrectiveQuest?: boolean;
    correctiveQuestName?: string;
    kaffarahType?: 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';
    recoveryPercentage?: number;
    weaknessId?: string | null;
    weaknessName?: string | null;
  }) => {
    const rawPenalty = SEVERITY_XP_PENALTIES[entry.severity] || 200;
    const coinFine = SEVERITY_COIN_FINES[entry.severity] || 25;
    const momentumLoss = SEVERITY_MOMENTUM_PENALTIES[entry.severity] || 35;
    const currentSysDate = state.systemDate || getLocalDateString();
    
    // Calculate today's existing Muhasabah deductions to enforce daily 500 XP penalty cap
    const todayMuhasabahLoss = (state.muhasabahEntries || [])
      .filter(e => e.date === currentSysDate)
      .reduce((sum, e) => sum + (e.xpDeducted || 0), 0);
    
    const availableCap = Math.max(0, 500 - todayMuhasabahLoss);
    const xpToDeduct = Math.min(rawPenalty, availableCap);
    const capReached = availableCap <= 0 || xpToDeduct < rawPenalty;

    const defaultTemplate = DEFAULT_KAFFARAH_TEMPLATES[entry.category];
    const kaffarahType = entry.kaffarahType || defaultTemplate.type;
    const kaffarahTitle = entry.correctiveQuestName?.trim() || defaultTemplate.title;

    let createdQuestId: string | null = null;
    let createdQuestName: string | null = null;
    let recoveryPercent = entry.recoveryPercentage ?? 20; // Default 20%
    if (recoveryPercent < 10) recoveryPercent = 10;
    if (recoveryPercent > 30) recoveryPercent = 30;
    const recoveredXP = Math.max(25, Math.round(rawPenalty * (recoveryPercent / 100)));

    // By default for Muhasabah, always create a Kaffārah restitution quest to enforce high stakes
    const shouldCreateQuest = entry.createCorrectiveQuest !== false;
    if (shouldCreateQuest) {
      createdQuestId = `quest-kaffarah-${Date.now()}`;
      createdQuestName = `[KAFFĀRAH] ${kaffarahTitle}`;
    }

    const newEntryId = `muhasabah-${Date.now()}`;

    setState(prev => {
      // 1. Calculate new XP ensuring it never drops below 0
      const currentProfileXp = prev.profile.xp || 0;
      const actualDeducted = Math.min(currentProfileXp, xpToDeduct);
      
      let updatedXpHistory = [...prev.xpHistory];
      if (actualDeducted > 0) {
        const historyEntry: XPHistoryEntry = {
          id: `xph-muhasabah-${Date.now()}`,
          questId: null,
          questName: `[MUHĀSABAH AUDIT] ${entry.category}: ${entry.title}`,
          xp: -actualDeducted,
          timestamp: getSystemTimestamp(currentSysDate),
          skillIds: []
        };
        updatedXpHistory = [historyEntry, ...prev.xpHistory];
      }

      const totalXp = Math.max(0, updatedXpHistory.reduce((sum, h) => sum + h.xp, 0));
      const level = calculatePlayerLevel(totalXp);

      // 2. Deduct Coins & Slash Momentum
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
          description: `Solemn Kaffārah Restitution for Muhāsabah Slip: "${entry.title}" (${entry.category} • ${entry.severity}).\n• Root Cause: ${entry.cause}\n• Restitution Action: ${kaffarahTitle}\n• Note: Resolving this quest fulfills your penance, restores spiritual equilibrium, and unlocks Imperial Shop rewards.`,
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

      // 4. Weakness tracking & auto-trigger
      let updatedWeaknesses = [...(prev.weaknesses || [])];
      let targetWeaknessId: string | null = entry.weaknessId || null;
      let targetWeaknessName: string | null = entry.weaknessName || null;

      if (targetWeaknessId) {
        updatedWeaknesses = updatedWeaknesses.map(w => {
          if (w.id === targetWeaknessId) {
            const nextCount = w.occurrenceCount + 1;
            const isNowActive = nextCount >= 5 ? 'Active' : w.status;
            targetWeaknessName = w.name;
            return {
              ...w,
              occurrenceCount: nextCount,
              lastOccurrenceDate: currentSysDate,
              status: isNowActive
            };
          }
          return w;
        });
      } else if (entry.weaknessName && entry.weaknessName.trim()) {
        const trimmedName = entry.weaknessName.trim();
        const existingWeaknessIndex = updatedWeaknesses.findIndex(
          w => w.name.toLowerCase() === trimmedName.toLowerCase() || 
               w.triggerCause.toLowerCase() === entry.cause.toLowerCase()
        );

        if (existingWeaknessIndex >= 0) {
          const w = updatedWeaknesses[existingWeaknessIndex];
          const nextCount = w.occurrenceCount + 1;
          const isNowActive = nextCount >= 5 ? 'Active' : w.status;
          targetWeaknessId = w.id;
          targetWeaknessName = w.name;
          updatedWeaknesses[existingWeaknessIndex] = {
            ...w,
            occurrenceCount: nextCount,
            lastOccurrenceDate: currentSysDate,
            status: isNowActive
          };
        } else {
          targetWeaknessId = `weakness-${Date.now()}`;
          targetWeaknessName = trimmedName;
          const newWeakness: Weakness = {
            id: targetWeaknessId,
            name: trimmedName,
            category: entry.category,
            triggerCause: entry.cause,
            occurrenceCount: 1,
            lastOccurrenceDate: currentSysDate,
            status: 'Under Control',
            correctiveStrategy: entry.reflection || 'Guard against triggers with vigilant awareness.',
            createdAt: getSystemTimestamp(currentSysDate)
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

      // 5. Record the Muhasabah Entry with Kaffarah & Coin details
      const newEntry: MuhasabahEntry = {
        id: newEntryId,
        date: currentSysDate,
        timestamp: getSystemTimestamp(currentSysDate),
        title: entry.title.trim(),
        description: entry.description?.trim() || '',
        category: entry.category,
        severity: entry.severity,
        rawPenalty,
        xpDeducted: actualDeducted,
        coinsDeducted: coinFine,
        momentumLost: momentumLoss,
        cause: entry.cause.trim(),
        reflection: entry.reflection?.trim() || '',
        correctiveQuestId: createdQuestId,
        correctiveQuestName: createdQuestName,
        kaffarahTitle,
        kaffarahType,
        kaffarahCompleted: false,
        recoveryPercentage: recoveryPercent,
        recoveredXP,
        weaknessId: targetWeaknessId,
        weaknessName: targetWeaknessName
      };

      const finalEntries = [newEntry, ...(prev.muhasabahEntries || [])];

      addSystemMessage({
        sender: 'OPERATOR',
        category: 'alert',
        title: `⚖️ MUHĀSABAH AUDIT: ${entry.category.toUpperCase()} (${entry.severity})`,
        content: `Reflected on "${entry.title}". Consequences applied: −${actualDeducted} XP, −${coinFine} Coins fine, ${momentumLoss >= 100 ? 'Momentum zeroed' : `−${momentumLoss}% Momentum`}. Pinned Kaffārah Restitution: "${kaffarahTitle}".`,
        priority: 'high'
      });

      return {
        ...prev,
        muhasabahEntries: finalEntries,
        weaknesses: updatedWeaknesses,
        quests: updatedQuests,
        xpHistory: updatedXpHistory,
        profile: {
          ...prev.profile,
          xp: totalXp,
          level,
          coins: nextCoins,
          momentum: nextMomentum
        }
      };
    });

    return {
      success: true,
      entryId: newEntryId,
      xpDeducted: xpToDeduct,
      coinsDeducted: coinFine,
      rawPenalty,
      capReached,
      message: capReached 
        ? `Daily XP loss capped at −500 XP. −${coinFine} Coins fine applied. Kaffārah restitution quest pinned.` 
        : `Muhāsabah recorded: −${xpToDeduct} XP & −${coinFine} Coins fine. Kaffārah quest issued.`
    };
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

  const convertWeaknessToSeal = (weaknessId: string, customRarity?: SealRarity) => {
    const weakness = (state.weaknesses || []).find(w => w.id === weaknessId);
    if (!weakness) {
      return { success: false, message: 'Weakness not found' };
    }

    const sealId = `seal-weakness-${Date.now()}`;
    const rarity: SealRarity = customRarity || (weakness.occurrenceCount >= 8 ? 'Epic' : weakness.occurrenceCount >= 5 ? 'Rare' : 'Common');
    
    const newSeal: PowerSeal = {
      id: sealId,
      name: `Chain of ${weakness.name}`,
      description: `A heavy chain forged to shatter the behavioral cycle of "${weakness.name}". Root cause: "${weakness.triggerCause}". Execute sustained discipline to break this chain and earn permanent multiplier bonuses.`,
      rarity,
      status: 'Locked',
      requiredLevel: Math.max(1, Math.min(10, Math.floor(weakness.occurrenceCount / 2))),
      costXP: Math.max(100, weakness.occurrenceCount * 40),
      requiredStreakDays: Math.min(7, Math.max(3, weakness.occurrenceCount)),
      buffName: `Liberation: ${weakness.name.replace(/^Weakness:\s*/i, '')}`,
      buffDescription: `+15% XP on Recovery directives, +10 Momentum floor, and resilient mastery against ${weakness.category} slips.`,
      xpBonusMultiplier: 1.15,
      momentumBoost: 10,
      attributeBoosts: [{ attributeId: 'a-5', boostAmount: 2 }],
      runeSymbol: '⛓️',
      colorTheme: rarity === 'Epic' ? 'emerald' : rarity === 'Rare' ? 'purple' : 'cyan',
      createdAt: getSystemTimestamp(state.systemDate)
    };

    setState(prev => ({
      ...prev,
      seals: [...(prev.seals || []), newSeal],
      weaknesses: (prev.weaknesses || []).map(w => w.id === weaknessId ? { ...w, status: 'Sealed', sealId } : w)
    }));

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'achievement',
      title: `⛓️ WEAKNESS SEAL FORGED: Chain of ${weakness.name}`,
      content: `The persistent weakness has been bound into a Power Seal in the Imperial Ores & Chains chamber. Fulfill its discipline requirements to shatter the chain and claim operator rewards.`,
      priority: 'high'
    });

    return { success: true, sealId, message: `Weakness successfully bound to Power Seal: ${newSeal.name}` };
  };

  const getTodayMuhasabahStats = () => {
    const currentSysDate = state.systemDate || getLocalDateString();
    const todayEntries = (state.muhasabahEntries || []).filter(e => e.date === currentSysDate);
    const todayLostXP = todayEntries.reduce((sum, e) => sum + (e.xpDeducted || 0), 0);
    const todayLostCoins = todayEntries.reduce((sum, e) => sum + (e.coinsDeducted || 0), 0);
    
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
    const sealedWeaknessesCount = weaknesses.filter(w => w.status === 'Sealed' || w.sealId).length;

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
      dailyCapRemaining,
      totalEntriesCount: (state.muhasabahEntries || []).length,
      todaySlipsCount: todayEntries.length,
      todayHasanatCount,
      activeWeaknessesCount,
      sealedWeaknessesCount,
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
      title: '⚖️ SACRED MĪZĀN RECALIBRATED',
      content: `Equilibrium re-synchronized for ${currentSysDate}: +${todayEarnedXP} XP Hasanāt, −${todayLostXP} XP Sayyi'āt (Net: ${todayNetXP >= 0 ? '+' : ''}${todayNetXP} XP). Verified ${todayEntries.length} slip audits and ${activeKaffarah.length} pending Kaffārah obligations.`,
      priority: 'medium'
    });

    return {
      success: true,
      message: `The Sacred Mīzān physics and weight coordinates successfully recalibrated for ${currentSysDate}.`,
      timestamp: new Date().toISOString()
    };
  };

  return (
    <POSContext.Provider value={{
      state,
      addSystemMessage,
      markSystemMessageRead,
      markAllSystemMessagesRead,
      deleteSystemMessage,
      clearAllSystemMessages,
      activeFocusSession,
      startFocusSession,
      pauseFocusSession,
      resumeFocusSession,
      stopFocusSession,
      skipFocusStage,
      adjustFocusSessionTime,
      completeFocusCycle,
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
      addXp,
      addSeal,
      updateSeal,
      deleteSeal,
      breakSeal,
      relockSeal,
      resetSealsToDefault,
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
      addMuhasabahEntry,
      updateMuhasabahEntry,
      deleteMuhasabahEntry,
      clearAllMuhasabahEntries,
      addWeakness,
      updateWeakness,
      deleteWeakness,
      convertWeaknessToSeal,
      getTodayMuhasabahStats,
      recalibrateMizan
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
