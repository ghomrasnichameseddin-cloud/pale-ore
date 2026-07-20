import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Goal, Project, Milestone, Quest, Skill, Attribute, UserProfile, XPHistoryEntry, POSState,
  GoalStatus, GoalPriority, QuestDifficulty, QuestType, ActiveFocusSession, PlanningDocument
} from './types';
import { INITIAL_STATE } from './initialState';

interface POSContextType {
  state: POSState;
  
  // Pomodoro Focus Timer
  activeFocusSession: ActiveFocusSession | null;
  startFocusSession: (questId: string, workTime: number, restTime: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  stopFocusSession: () => void;
  completeFocusCycle: (questId: string) => void;
  
  // Goals CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  clearAllGoals: () => void;
  
  // Projects CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  clearAllProjects: () => void;
  
  // Milestones CRUD
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt'>) => string;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  
  // Quests CRUD & Advanced Actions
  addQuest: (quest: Omit<Quest, 'id' | 'status' | 'completedAt' | 'createdAt'>) => string;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  reopenQuest: (id: string) => void;
  failQuest: (id: string) => void;
  duplicateQuest: (id: string) => string;
  mergeQuests: (idA: string, idB: string, mergedName: string, mergedDescription: string) => string;
  splitQuest: (id: string, questAName: string, questBName: string, xpRatio: number) => void;
  processQuestReview: (id: string, action: 'rollover' | 'postpone' | 'forgive') => void;
  
  // Folders & Lists CRUD
  addFolder: (name: string, description?: string, color?: string) => string;
  updateFolder: (id: string, updates: { name?: string; description?: string; color?: string }) => void;
  deleteFolder: (id: string) => void;
  addList: (folderId: string | null, name: string, description?: string) => string;
  updateList: (id: string, updates: { folderId?: string | null; name?: string; description?: string }) => void;
  deleteList: (id: string) => void;
  
  // Subquests CRUD
  addSubQuest: (questId: string, name: string) => void;
  toggleSubQuest: (questId: string, subquestId: string) => void;
  deleteSubQuest: (questId: string, subquestId: string) => void;
  
  // Skills CRUD
  addSkill: (name: string, tier?: 'Primary' | 'Secondary', parentId?: string | null) => string;
  updateSkillName: (id: string, name: string) => void;
  updateSkillTier: (id: string, tier: 'Primary' | 'Secondary') => void;
  updateSkillParent: (id: string, parentId: string | null) => void;
  deleteSkill: (id: string) => void;
  clearAllSkills: () => void;
  equipSkillTitle: (id: string, title: string) => void;
  
  // Attributes CRUD (allows adjusting base levels if they wish to manual override, though defaults are dynamic)
  updateAttributeBase: (id: string, level: number) => void;
  
  // Profile Adjustments
  toggleRecoveryMode: () => void;
  updateProfileFocus: (focusText: string, goalId: string | null) => void;
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
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  selectedListId: string | null;
  setSelectedListId: (id: string | null) => void;

  // Planning Documents Operations
  addPlanningDocument: (path: string, name: string, content: string) => string;
  updatePlanningDocument: (id: string, updates: Partial<PlanningDocument>) => void;
  deletePlanningDocument: (id: string) => void;
  linkPlanningDocToComponent: (id: string, type: 'goal' | 'project' | 'quest' | 'skill', componentId: string, link: boolean) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pale_ore_pos_state';

const getSkillXpFromHistory = (skillId: string, history: XPHistoryEntry[], allSkills: Skill[]): number => {
  let totalXp = 0;
  
  const targetSkill = allSkills.find(s => s.id === skillId);
  if (!targetSkill) return 0;
  
  for (const h of history) {
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
    
    // Resolve secondary skill IDs involved directly or indirectly (linked to active primary)
    const secondarySkillIds = new Set<string>();
    directSkills.forEach(s => {
      if (s.tier === 'Secondary') {
        secondarySkillIds.add(s.id);
      }
    });
    allSkills.forEach(s => {
      if (s.tier === 'Secondary' && s.parentId && primarySkillIds.has(s.parentId)) {
        secondarySkillIds.add(s.id);
      }
    });
    
    const primaryCount = primarySkillIds.size;
    const secondaryCount = secondarySkillIds.size;
    
    const isTargetPrimary = (targetSkill.tier || 'Primary') === 'Primary';
    
    if (primaryCount > 0 && secondaryCount > 0) {
      if (isTargetPrimary) {
        if (primarySkillIds.has(skillId)) {
          totalXp += (h.xp * 0.8) / primaryCount;
        }
      } else {
        if (secondarySkillIds.has(skillId)) {
          totalXp += (h.xp * 0.2) / secondaryCount;
        }
      }
    } else if (primaryCount > 0) {
      if (isTargetPrimary && primarySkillIds.has(skillId)) {
        totalXp += h.xp / primaryCount;
      }
    } else if (secondaryCount > 0) {
      if (!isTargetPrimary && secondarySkillIds.has(skillId)) {
        totalXp += h.xp / secondaryCount;
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
    const d1 = new Date(dateStr1.split('T')[0]);
    const d2 = new Date(dateStr2.split('T')[0]);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d2.getTime() - d1.getTime();
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

const resetRecurringQuestsForNewDate = (newDateStr: string, currentQuests: Quest[]): Quest[] => {
  return currentQuests.map(q => {
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
              ...(parsed.profile || {})
            },
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
            planningDocuments: parsed.planningDocuments || INITIAL_STATE.planningDocuments
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

  useEffect(() => {
    if (!activeFocusSession) return;
    if (activeFocusSession.completedCycles > 0) {
      const cycleMinutes = activeFocusSession.totalWorkTime;
      const todayStr = new Date().toISOString().split('T')[0];
      
      const xpHistoryId = `h-focus-${Date.now()}`;
      const focusXpEntry: XPHistoryEntry = {
        id: xpHistoryId,
        questId: null,
        questName: `🧘 Focus Session: Completed ${cycleMinutes} min work block on "${activeFocusSession.questName}"`,
        xp: 15,
        timestamp: new Date().toISOString(),
        skillIds: []
      };

      // Automatically complete the associated quest since the work block duration completed!
      if (activeFocusSession.mode === 'rest') {
        completeQuest(activeFocusSession.questId);
      }

      setState(prev => {
        const prevMinutes = prev.profile.focusMinutesToday || 0;
        const prevStreak = prev.profile.focusStreak || 0;
        const lastDate = prev.profile.lastFocusDate || '';
        
        let newStreak = prevStreak;
        if (lastDate !== todayStr) {
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

  const startFocusSession = (questId: string, workTime: number, restTime: number) => {
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) return;
    const estTime = quest.estimatedTime || 30;
    const estCycles = Math.ceil(estTime / workTime);
    
    setActiveFocusSession({
      questId,
      questName: quest.name,
      totalWorkTime: workTime,
      totalRestTime: restTime,
      mode: 'work',
      status: 'running',
      timeLeft: workTime * 60,
      completedCycles: 0,
      estimatedCycles: estCycles,
      timeSpent: 0,
      lastUpdated: Date.now()
    });
  };

  const pauseFocusSession = () => {
    setActiveFocusSession(prev => prev ? { ...prev, status: 'paused' } : null);
  };

  const resumeFocusSession = () => {
    setActiveFocusSession(prev => prev ? { ...prev, status: 'running', lastUpdated: Date.now() } : null);
  };

  const stopFocusSession = () => {
    setActiveFocusSession(null);
  };

  const completeFocusCycle = (questId: string) => {
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
    let updatedQuests = [...prev.quests];
    let updatedHistory = [...prev.xpHistory];
    let updatedMomentum = prev.profile.momentum;
    let recoveryModeActivated = false;

    if (daysDiff >= 1) {
      // Find ALL quests active on oldDate that were left unchecked (incomplete)
      const uncheckedQuests = prev.quests.filter(q => {
        if (q.status !== 'Active') return false;
        if (q.isPenalty || q.type === 'Penalty') return false;

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
      uncheckedQuests.forEach(q => {
        let penaltyXp = 50;
        if (q.difficulty === 'Easy') penaltyXp = 25;
        else if (q.difficulty === 'Normal') penaltyXp = 50;
        else if (q.difficulty === 'Hard') penaltyXp = 100;
        else if (q.difficulty === 'Boss') penaltyXp = 250;

        const isCritical = q.important || q.type === 'Main' || q.type === 'Boss' || q.difficulty === 'Hard' || q.difficulty === 'Boss';
        const finalPenaltyXp = isCritical ? penaltyXp * 1.5 : penaltyXp;

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

        // Generate the recovery/penalty quest
        const pQuest: Quest = {
          id: `q-penalty-${q.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: `⚠️ RECOVERY: Resolve failed/unchecked "${q.name}"`,
          description: `System-generated recovery directive due to unchecked/failed objective "${q.name}". Resolve this to restore operations.`,
          status: 'Active' as const,
          difficulty: q.difficulty === 'Custom' ? 'Normal' : q.difficulty,
          type: 'Penalty',
          isPenalty: true,
          estimatedTime: 15,
          recurrence: 'None',
          important: true,
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
        recoveryModeActivated = true;
      });
    }

    return { updatedQuests, updatedHistory, updatedMomentum, recoveryModeActivated };
  };

  const setSystemDate = (newDateStr: string) => {
    setState(prev => {
      const oldDate = prev.systemDate;
      const { updatedQuests, updatedHistory, updatedMomentum, recoveryModeActivated } = applyMidnightPenalties(prev, oldDate, newDateStr);
      
      const finalQuests = resetRecurringQuestsForNewDate(newDateStr, updatedQuests);
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
          recoveryMode: recoveryModeActivated ? true : prev.profile.recoveryMode
        }
      };
    });
  };

  // Run cycle reset check on mount and periodically at midnight
  useEffect(() => {
    const runCycleReset = () => {
      const realToday = new Date().toISOString().split('T')[0];
      setState(prev => {
        const currentSimulated = prev.systemDate || realToday;
        
        // If the simulated date matches yesterday's calendar date, and it has crossed to a new real day,
        // we can automatically advance the simulated date to match the new calendar date.
        let nextSimulated = currentSimulated;
        if (currentSimulated !== realToday) {
          const daysDiff = getDaysDifference(currentSimulated, realToday);
          // If it's a natural calendar advancement, auto-advance it
          if (daysDiff === 1) {
            nextSimulated = realToday;
          }
        }

        const oldDate = currentSimulated;
        const { updatedQuests, updatedHistory, updatedMomentum, recoveryModeActivated } = applyMidnightPenalties(prev, oldDate, nextSimulated);

        const finalQuests = resetRecurringQuestsForNewDate(nextSimulated, updatedQuests);
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

    // Rank evaluation (Solo Leveling theme)
    let rank = 'E-Rank';
    if (level >= 30) rank = 'S-Rank';
    else if (level >= 20) rank = 'A-Rank';
    else if (level >= 15) rank = 'B-Rank';
    else if (level >= 10) rank = 'C-Rank';
    else if (level >= 5) rank = 'D-Rank';

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

      // Base level is what is in state, we add the earned levels
      const baseLevel = attr.level;
      const extraLevels = Math.floor(relatedCount / divider);
      const level = baseLevel + extraLevels;
      const progress = Math.round(((relatedCount % divider) / divider) * 100);

      return {
        ...attr,
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
  const addQuest = (quest: Omit<Quest, 'id' | 'status' | 'completedAt' | 'createdAt'>): string => {
    const id = `q-${Date.now()}`;
    const isUnifiedModifierActive = !!(quest.important || quest.isPenalty || quest.type === 'Penalty');
    const newQuest: Quest = {
      ...quest,
      important: isUnifiedModifierActive,
      isPenalty: isUnifiedModifierActive,
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
      quests: prev.quests.map(q => {
        if (q.id === id) {
          const merged = { ...q, ...updates };
          const isUnifiedModifierActive = !!(merged.important || merged.isPenalty || merged.type === 'Penalty');
          return {
            ...merged,
            important: isUnifiedModifierActive,
            isPenalty: isUnifiedModifierActive
          };
        }
        return q;
      })
    }));
  };

  const deleteQuest = (id: string) => {
    setState(prev => {
      const remainingQuests = prev.quests.filter(q => q.id !== id);
      const remainingPenaltyQuestsCount = remainingQuests.filter(q => 
        q.status === 'Active' && (q.isPenalty || q.type === 'Penalty')
      ).length;
      
      const newRecoveryMode = remainingPenaltyQuestsCount === 0 ? false : prev.profile.recoveryMode;

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

  const completeQuest = (id: string) => {
    const questToComplete = state.quests.find(q => q.id === id);
    if (!questToComplete) return;
    // If it's a non-recurring quest and is already completed, ignore
    if ((!questToComplete.recurrence || questToComplete.recurrence === 'None') && questToComplete.status === 'Completed') return;

    const completedTimestamp = new Date().toISOString();
    
    // Create XP History entry
    const xpHistoryId = `h-${Date.now()}`;
    const newHistoryEntry: XPHistoryEntry = {
      id: xpHistoryId,
      questId: questToComplete.id,
      questName: questToComplete.name,
      xp: questToComplete.xp,
      timestamp: completedTimestamp,
      skillIds: questToComplete.relatedSkills
    };

    // Calculate momentum boost (+10% on completion, cap 100)
    const newMomentum = Math.min(100, state.profile.momentum + 10);

    setState(prev => {
      // Complete quest or update recurrence completion time
      const updatedQuests = prev.quests.map(q => {
        if (q.id === id) {
          if (q.recurrence && q.recurrence !== 'None') {
            return {
              ...q,
              status: 'Active' as const, // Remain Active so it can be completed again!
              completedAt: completedTimestamp // Track the latest completion timestamp
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

      const isPenaltyQuest = questToComplete.isPenalty || questToComplete.type === 'Penalty';
      const remainingPenaltyQuestsCount = updatedQuests.filter(q => 
        q.status === 'Active' && (q.isPenalty || q.type === 'Penalty') && q.id !== id
      ).length;

      const newRecoveryMode = isPenaltyQuest 
        ? (remainingPenaltyQuestsCount === 0 ? false : prev.profile.recoveryMode)
        : prev.profile.recoveryMode;

      return {
        ...prev,
        quests: updatedQuests,
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

    const isImportant = questToFail.important || questToFail.type === 'Main' || questToFail.type === 'Boss' || questToFail.difficulty === 'Hard' || questToFail.difficulty === 'Boss';
    const finalPenaltyXp = isImportant ? penaltyXp * 1.5 : penaltyXp;

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

      // Generate the recovery/penalty quest
      const pQuest: Quest = {
        id: `q-penalty-${questToFail.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `⚠️ RECOVERY: Resolve failed/unchecked "${questToFail.name}"`,
        description: `System-generated recovery directive due to unchecked/failed objective "${questToFail.name}". Resolve this to restore operations.`,
        status: 'Active' as const,
        difficulty: questToFail.difficulty === 'Custom' ? 'Normal' : questToFail.difficulty,
        type: 'Penalty',
        isPenalty: true,
        estimatedTime: 15,
        recurrence: 'None',
        important: true,
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
          recoveryMode: true
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
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const updatedQuests = prev.quests.map(q => {
        if (q.id === id) {
          if (action === 'rollover') {
            return { ...q, deadline: tomorrowStr };
          } else if (action === 'postpone') {
            return { ...q, deadline: null };
          } else if (action === 'forgive') {
            // Keep active, clear deadline and remove completedAt
            return { ...q, deadline: null, completedAt: null };
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
      parentId: parentId || null
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

  const deleteSkill = (id: string) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id),
      // Clean up skill references from goals and quests
      goals: prev.goals.map(g => ({ ...g, relatedSkills: g.relatedSkills.filter(sid => sid !== id) })),
      quests: prev.quests.map(q => ({ ...q, relatedSkills: q.relatedSkills.filter(sid => sid !== id) }))
    }));
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

  // Profile Adjustments
  const toggleRecoveryMode = () => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        recoveryMode: !prev.profile.recoveryMode
      }
    }));
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

    // Workload Balance (Active Quests count / total estimated time)
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

  return (
    <POSContext.Provider value={{
      state,
      activeFocusSession,
      startFocusSession,
      pauseFocusSession,
      resumeFocusSession,
      stopFocusSession,
      completeFocusCycle,
      addGoal,
      updateGoal,
      deleteGoal,
      clearAllGoals,
      addProject,
      updateProject,
      deleteProject,
      clearAllProjects,
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
      addFolder,
      updateFolder,
      deleteFolder,
      addList,
      updateList,
      deleteList,
      addSubQuest,
      toggleSubQuest,
      deleteSubQuest,
      addSkill,
      updateSkillName,
      updateSkillTier,
      updateSkillParent,
      deleteSkill,
      clearAllSkills,
      equipSkillTitle,
      updateAttributeBase,
      toggleRecoveryMode,
      updateProfileFocus,
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
      systemDate: state.systemDate || new Date().toISOString().split('T')[0],
      setSystemDate,
      selectedFolderId,
      setSelectedFolderId,
      selectedListId,
      setSelectedListId,
      addPlanningDocument,
      updatePlanningDocument,
      deletePlanningDocument,
      linkPlanningDocToComponent
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
