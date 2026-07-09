export type GoalStatus = 'Active' | 'Paused' | 'Planned' | 'Completed' | 'Archived';
export type GoalPriority = 'Low' | 'Medium' | 'High';

export interface Goal {
  id: string;
  name: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  relatedSkills: string[]; // skill IDs
  estimatedCompletion: string;
  createdAt: string;
}

export interface Project {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  status: 'Active' | 'Paused' | 'Planned' | 'Completed' | 'Archived';
  estimatedTime: string;
  createdAt: string;
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

export type QuestDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Boss' | 'Custom';
export type QuestType = 'Main' | 'Side' | 'Boss' | 'Optional' | 'Habit' | 'Recovery' | 'Milestone' | string;
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
  relatedSkills: string[]; // skill IDs
  type: QuestType;
  recurrence?: QuestRecurrence;
  status: 'Active' | 'Completed' | 'Failed';
  deadline: string | null; // YYYY-MM-DD
  completedAt: string | null; // ISO Timestamp when completed
  createdAt: string;
  important?: boolean;
  subquests?: SubQuest[];
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
}

export interface Attribute {
  id: string;
  name: string;
  level: number;
  progress: number; // 0 to 100% to next level
  description: string;
}

export interface UserProfile {
  level: number;
  xp: number;
  momentum: number; // 0 to 100 based on recent completions
  recoveryMode: boolean;
  currentFocus: string;
  focusGoalId: string | null;
  currentBossQuestId: string | null;
}

export interface XPHistoryEntry {
  id: string;
  questId: string | null;
  questName: string;
  xp: number;
  timestamp: string; // ISO String
  skillIds: string[];
}

export interface ActiveFocusSession {
  questId: string;
  questName: string;
  totalWorkTime: number; // in minutes
  totalRestTime: number;  // in minutes
  mode: 'work' | 'rest';
  status: 'running' | 'paused' | 'idle';
  timeLeft: number; // in seconds
  completedCycles: number;
  estimatedCycles: number;
}

export interface POSState {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  quests: Quest[];
  skills: Skill[];
  attributes: Attribute[];
  profile: UserProfile;
  xpHistory: XPHistoryEntry[];
}

