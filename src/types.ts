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

export interface QuestFolder {
  id: string;
  name: string;
  description?: string;
  color?: string; // hex or tailwind color class
  createdAt: string;
}

export interface QuestList {
  id: string;
  folderId: string | null; // Belongs to a folder, or null (standalone)
  name: string;
  description?: string;
  createdAt: string;
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
  status: 'Active' | 'Completed' | 'Failed';
  deadline: string | null; // YYYY-MM-DD
  completedAt: string | null; // ISO Timestamp when completed
  createdAt: string;
  important?: boolean;
  subquests?: SubQuest[];
  energyLevel?: 'Low' | 'Medium' | 'High';
  isPenalty?: boolean;
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
  tier?: 'Primary' | 'Secondary';
  parentId?: string | null;
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
  focusMinutesToday?: number;
  focusStreak?: number;
  lastFocusDate?: string;
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

export interface POSState {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  quests: Quest[];
  folders: QuestFolder[];
  lists: QuestList[];
  skills: Skill[];
  attributes: Attribute[];
  profile: UserProfile;
  xpHistory: XPHistoryEntry[];
  systemDate: string; // format YYYY-MM-DD
  planningDocuments: PlanningDocument[];
}
