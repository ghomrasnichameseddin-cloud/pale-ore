import { POSState } from './types';

export interface JobSpec {
  id: string;
  name: string;
  category: string;
  iconName: string; // Icon representation identifier
  description: string;
  perk: string;
  unlockedAtLevel: number;
  isCustom?: boolean;
}

export interface TitleSpec {
  id: string;
  name: string;
  badge: string;
  category: string;
  description: string;
  unlockCondition: string;
  checkUnlocked?: (state: POSState, completedQuestCount: number, currentLevel: number) => boolean;
  isCustom?: boolean;
}

export const JOBS_LIST: JobSpec[] = [
  {
    id: 'job-cyber-architect',
    name: 'Cyber Architect',
    category: 'Engineering & Systems',
    iconName: 'Terminal',
    description: 'Specializes in high-level system architecture, folder structures, and operational planning.',
    perk: '+10% XP bonus on Main Quests & Core Directives',
    unlockedAtLevel: 1
  },
  {
    id: 'job-code-alchemist',
    name: 'Code Alchemist',
    category: 'Software & Technology',
    iconName: 'Code',
    description: 'Transmutes complex logical problems into structured, executable code and skill modules.',
    perk: '+15% XP bonus on Skill-linked Directives',
    unlockedAtLevel: 1
  },
  {
    id: 'job-cognitive-monk',
    name: 'Cognitive Monk',
    category: 'Focus & Endurance',
    iconName: 'Brain',
    description: 'Master of deep work immersion, sustained concentration, and mental endurance.',
    perk: '+20% Focus Minutes XP Multiplier during timer sessions',
    unlockedAtLevel: 1
  },
  {
    id: 'job-data-operative',
    name: 'Data Operative',
    category: 'Analytics & Precision',
    iconName: 'Cpu',
    description: 'Analyzes telemetry, metrics, and completion trends to maintain maximum operational speed.',
    perk: '+10% Boost to Daily Momentum calculation',
    unlockedAtLevel: 1
  },
  {
    id: 'job-bio-hacker',
    name: 'Bio-Hacker',
    category: 'Vitality & Discipline',
    iconName: 'Zap',
    description: 'Optimizes physical energy, habit consistency, and resilience against operational burnout.',
    perk: 'Reduces Fail Penalty XP Loss by 20%',
    unlockedAtLevel: 2
  },
  {
    id: 'job-strategy-commander',
    name: 'Strategy Commander',
    category: 'Goals & Milestones',
    iconName: 'Crosshair',
    description: 'Conquers long-term strategic roadmaps, high-stakes Boss directives, and milestone goals.',
    perk: '+15% XP bonus on Hard & Boss Difficulty Quests',
    unlockedAtLevel: 3
  },
  {
    id: 'job-quantum-polymath',
    name: 'Quantum Polymath',
    category: 'Mastery & Synthesis',
    iconName: 'Sparkles',
    description: 'Cross-functional operative capable of deploying skills across every system domain.',
    perk: '+10% XP across all operational directives',
    unlockedAtLevel: 5
  }
];

export const TITLES_LIST: TitleSpec[] = [
  {
    id: 'title-novice-operator',
    name: 'Novice Operative',
    badge: 'INITIATE',
    category: 'System Level',
    description: 'Successfully initialized into the Personal Operating System.',
    unlockCondition: 'Unlocked at System Level 1',
    checkUnlocked: (_state, _completedCount, level) => level >= 1
  },
  {
    id: 'title-focused-mind',
    name: 'Focused Mind',
    badge: 'FOCUSED',
    category: 'Focus Mastery',
    description: 'Demonstrated dedication to structured focus sessions.',
    unlockCondition: 'Log 30+ Total Focus Minutes',
    checkUnlocked: (state) => (state.profile.focusMinutesToday || 0) >= 30
  },
  {
    id: 'title-iron-will',
    name: 'Iron Will',
    badge: 'IRON WILL',
    category: 'Focus Streak',
    description: 'Sustained focus streak across multiple consecutive days.',
    unlockCondition: 'Achieve a 3+ Day Focus Streak',
    checkUnlocked: (state) => (state.profile.focusStreak || 0) >= 3
  },
  {
    id: 'title-master-executor',
    name: 'Master Executor',
    badge: 'EXECUTOR',
    category: 'Quest Completion',
    description: 'Relentlessly executed a high volume of directives.',
    unlockCondition: 'Complete 10+ Total Quests',
    checkUnlocked: (_state, completedCount) => completedCount >= 10
  },
  {
    id: 'title-veteran-specialist',
    name: 'Veteran Specialist',
    badge: 'VETERAN',
    category: 'System Level',
    description: 'Proven operator with seasoned system experience.',
    unlockCondition: 'Reach System Level 5',
    checkUnlocked: (_state, _completedCount, level) => level >= 5
  },
  {
    id: 'title-boss-slayer',
    name: 'Boss Slayer',
    badge: 'BOSS SLAYER',
    category: 'Boss Directives',
    description: 'Conquered high-stake Boss level directives.',
    unlockCondition: 'Complete at least 1 Boss Quest',
    checkUnlocked: (state) => state.quests.some(q => q.difficulty === 'Boss' && q.status === 'Completed')
  },
  {
    id: 'title-polymath-prime',
    name: 'Polymath Prime',
    badge: 'POLYMATH',
    category: 'Skill Tree',
    description: 'Cultivated multiple specialized skills across domains.',
    unlockCondition: 'Develop 3+ Specialized Skills',
    checkUnlocked: (state) => state.skills.length >= 3
  },
  {
    id: 'title-apex-systemer',
    name: 'Apex Systemer',
    badge: 'APEX',
    category: 'System Level',
    description: 'Attained elite system mastery level.',
    unlockCondition: 'Reach System Level 10',
    checkUnlocked: (_state, _completedCount, level) => level >= 10
  },
  {
    id: 'title-deep-work-monk',
    name: 'Deep Work Monk',
    badge: 'DEEP WORK',
    category: 'Focus Mastery',
    description: 'Logged extended deep work focus sessions.',
    unlockCondition: 'Log 120+ Total Focus Minutes',
    checkUnlocked: (state) => (state.profile.focusMinutesToday || 0) >= 120
  },
  {
    id: 'title-unstoppable',
    name: 'The Unstoppable',
    badge: 'UNSTOPPABLE',
    category: 'Momentum',
    description: 'Operated at peak momentum efficiency.',
    unlockCondition: 'Reach 85%+ Momentum',
    checkUnlocked: (state) => state.profile.momentum >= 85
  }
];

export function getAllJobs(customJobs: JobSpec[] = [], deletedJobIds: string[] = []): JobSpec[] {
  const deletedSet = new Set(deletedJobIds || []);
  const customMap = new Map((customJobs || []).map(j => [j.id, j]));

  const jobs: JobSpec[] = [];
  for (const defaultJob of JOBS_LIST) {
    if (deletedSet.has(defaultJob.id)) continue;
    if (customMap.has(defaultJob.id)) {
      jobs.push(customMap.get(defaultJob.id)!);
      customMap.delete(defaultJob.id);
    } else {
      jobs.push(defaultJob);
    }
  }

  for (const customJob of customMap.values()) {
    if (!deletedSet.has(customJob.id)) {
      jobs.push(customJob);
    }
  }

  return jobs;
}

export function getAllTitles(customTitles: TitleSpec[] = [], deletedTitleIds: string[] = []): TitleSpec[] {
  const deletedSet = new Set(deletedTitleIds || []);
  const customMap = new Map((customTitles || []).map(t => [t.id, t]));

  const titles: TitleSpec[] = [];
  for (const defaultTitle of TITLES_LIST) {
    if (deletedSet.has(defaultTitle.id)) continue;
    if (customMap.has(defaultTitle.id)) {
      titles.push(customMap.get(defaultTitle.id)!);
      customMap.delete(defaultTitle.id);
    } else {
      titles.push(defaultTitle);
    }
  }

  for (const customTitle of customMap.values()) {
    if (!deletedSet.has(customTitle.id)) {
      titles.push(customTitle);
    }
  }

  return titles;
}

export function getActiveJob(jobId?: string, customJobs: JobSpec[] = [], deletedJobIds: string[] = []): JobSpec {
  const allJobs = getAllJobs(customJobs, deletedJobIds);
  return allJobs.find(j => j.id === jobId) || allJobs[0] || JOBS_LIST[0];
}

export function getActiveTitle(titleId?: string, customTitles: TitleSpec[] = [], deletedTitleIds: string[] = []): TitleSpec {
  const allTitles = getAllTitles(customTitles, deletedTitleIds);
  return allTitles.find(t => t.id === titleId) || allTitles[0] || TITLES_LIST[0];
}

export function getUnlockedTitles(state: POSState): TitleSpec[] {
  const completedQuestCount = state.quests.filter(q => q.status === 'Completed').length;
  // Calculate level dynamically from total XP
  const totalXp = state.xpHistory.reduce((sum, h) => sum + h.xp, 0);
  const currentLevel = Math.max(1, Math.floor(Math.sqrt(totalXp / 100)) + 1);

  const allTitles = getAllTitles(state.customTitles || [], state.deletedTitleIds || []);

  return allTitles.filter(title => {
    if (title.isCustom) return true; // Custom player titles are unlocked by default once created!
    return title.checkUnlocked ? title.checkUnlocked(state, completedQuestCount, currentLevel) : true;
  });
}
