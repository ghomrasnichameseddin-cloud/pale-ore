import { POSState } from './types';

export interface SkillRequirement {
  skillId: string;
  minLevel: number;
}

export interface QuestRequirement {
  questId: string;
  minStreak?: number;
  requireCompleted?: boolean;
}

export interface LevelConditionSpec {
  level: number;
  unlockedAtLevel?: number;
  requiredQuestsCount?: number;
  requiredQuestStreak?: number;
  requiredFocusMinutes?: number;
  questRequirements?: QuestRequirement[];
  skillRequirements?: SkillRequirement[];
  relatedGoalId?: string | null;
  relatedGoalIds?: string[];
  relatedProjectId?: string | null;
  relatedProjectIds?: string[];
  customConditionText?: string;
  isCustomized?: boolean;
}

export interface JobSpec {
  id: string;
  name: string;
  category: string;
  iconName: string; // Icon representation identifier (Knowledge, Iron Will, Passion, Strategy, Logic, Mystery, Strength, Architecture, etc.)
  description: string;
  perk: string;
  unlockedAtLevel: number;
  
  // Advanced Derived Conditions
  relatedQuestId?: string | null;
  requiredQuestStreak?: number;
  questRequirements?: QuestRequirement[];
  skillRequirements?: SkillRequirement[];
  relatedGoalId?: string | null;
  relatedGoalIds?: string[];
  relatedProjectId?: string | null;
  relatedProjectIds?: string[];

  // Custom Level Progression Conditions (Levels 2-7)
  customLevelConditions?: Record<number, LevelConditionSpec>;

  isCustom?: boolean;
}

export interface TitleSpec {
  id: string;
  name: string;
  badge: string;
  category: string;
  iconName?: string; // Topic icon representation identifier
  description: string;
  unlockCondition: string;
  
  // Advanced Derived Conditions
  unlockedAtLevel?: number;
  relatedQuestId?: string | null;
  requiredQuestStreak?: number;
  questRequirements?: QuestRequirement[];
  skillRequirements?: SkillRequirement[];
  relatedGoalId?: string | null;
  relatedGoalIds?: string[];
  relatedProjectId?: string | null;
  relatedProjectIds?: string[];

  // Custom Level Progression Conditions (Levels 2-7)
  customLevelConditions?: Record<number, LevelConditionSpec>;

  checkUnlocked?: (state: POSState, completedQuestCount: number, currentLevel: number) => boolean;
  isCustom?: boolean;
}

export const JOBS_LIST: JobSpec[] = [
  {
    id: 'job-cyber-architect',
    name: 'Cyber Architect',
    category: 'Architecture',
    iconName: 'Building',
    description: 'Specializes in high-level system architecture, folder structures, and operational planning.',
    perk: '+10% XP bonus on Main Quests & Core Directives',
    unlockedAtLevel: 1
  },
  {
    id: 'job-code-alchemist',
    name: 'Code Alchemist',
    category: 'Logic',
    iconName: 'Code',
    description: 'Transmutes complex logical problems into structured, executable code and skill modules.',
    perk: '+15% XP bonus on Skill-linked Directives',
    unlockedAtLevel: 1
  },
  {
    id: 'job-cognitive-monk',
    name: 'Cognitive Monk',
    category: 'Iron Will',
    iconName: 'ShieldCheck',
    description: 'Master of deep work immersion, sustained concentration, and mental endurance.',
    perk: '+20% Focus Minutes XP Multiplier during timer sessions',
    unlockedAtLevel: 1
  },
  {
    id: 'job-data-operative',
    name: 'Data Operative',
    category: 'Knowledge',
    iconName: 'BookOpen',
    description: 'Analyzes telemetry, metrics, and completion trends to maintain maximum operational speed.',
    perk: '+10% Boost to Daily Momentum calculation',
    unlockedAtLevel: 1
  },
  {
    id: 'job-bio-hacker',
    name: 'Bio-Hacker',
    category: 'Passion',
    iconName: 'Flame',
    description: 'Optimizes physical energy, habit consistency, and resilience against operational burnout.',
    perk: 'Reduces Fail Penalty XP Loss by 20%',
    unlockedAtLevel: 2
  },
  {
    id: 'job-strategy-commander',
    name: 'Strategy Commander',
    category: 'Strategy',
    iconName: 'Target',
    description: 'Conquers long-term strategic roadmaps, high-stakes Boss directives, and milestone goals.',
    perk: '+15% XP bonus on Hard & Boss Difficulty Quests',
    unlockedAtLevel: 3
  },
  {
    id: 'job-arcane-investigator',
    name: 'Arcane Investigator',
    category: 'Mystery',
    iconName: 'Eye',
    description: 'Uncovers hidden insights, unravels complex operational riddles, and explores uncharted domains.',
    perk: '+15% bonus coins earned from quest executions',
    unlockedAtLevel: 2
  },
  {
    id: 'job-titan-enforcer',
    name: 'Titan Enforcer',
    category: 'Strength',
    iconName: 'Dumbbell',
    description: 'Dominates physical fitness goals and demanding high-intensity directives with raw power.',
    perk: '+20% XP bonus on Strength & Physical Directives',
    unlockedAtLevel: 2
  },
  {
    id: 'job-quantum-polymath',
    name: 'Quantum Polymath',
    category: 'Mastery',
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
    category: 'Knowledge',
    iconName: 'GraduationCap',
    description: 'Successfully initialized into the Personal Operating System.',
    unlockCondition: 'Unlocked at System Level 1',
    unlockedAtLevel: 1,
    checkUnlocked: (_state, _completedCount, level) => level >= 1
  },
  {
    id: 'title-focused-mind',
    name: 'Focused Mind',
    badge: 'FOCUSED',
    category: 'Logic',
    iconName: 'Cpu',
    description: 'Demonstrated dedication to structured focus sessions.',
    unlockCondition: 'Log 30+ Total Focus Minutes',
    checkUnlocked: (state) => (state.profile.focusMinutesToday || 0) >= 30
  },
  {
    id: 'title-iron-will',
    name: 'Iron Will',
    badge: 'IRON WILL',
    category: 'Iron Will',
    iconName: 'Hammer',
    description: 'Sustained focus streak across multiple consecutive days.',
    unlockCondition: 'Achieve a 3+ Day Focus Streak',
    requiredQuestStreak: 3,
    checkUnlocked: (state) => (state.profile.focusStreak || 0) >= 3
  },
  {
    id: 'title-master-executor',
    name: 'Master Executor',
    badge: 'EXECUTOR',
    category: 'Strategy',
    iconName: 'Crosshair',
    description: 'Relentlessly executed a high volume of directives.',
    unlockCondition: 'Complete 10+ Total Quests',
    checkUnlocked: (_state, completedCount) => completedCount >= 10
  },
  {
    id: 'title-grand-architect',
    name: 'Grand Architect',
    badge: 'ARCHITECT',
    category: 'Architecture',
    iconName: 'LayoutGrid',
    description: 'Master of structural planning, goal alignment, and system blueprints.',
    unlockCondition: 'Reach System Level 3 & Develop 2+ Skills',
    unlockedAtLevel: 3,
    checkUnlocked: (state, _c, level) => level >= 3 && state.skills.length >= 2
  },
  {
    id: 'title-passionate-flame',
    name: 'Passionate Flame',
    badge: 'PASSION',
    category: 'Passion',
    iconName: 'Flame',
    description: 'Fueled by intrinsic drive and unyielding passion for growth.',
    unlockCondition: 'Reach 70%+ Momentum & System Level 2',
    unlockedAtLevel: 2,
    checkUnlocked: (state) => state.profile.momentum >= 70
  },
  {
    id: 'title-seeker-of-mysteries',
    name: 'Seeker of Mysteries',
    badge: 'MYSTERY',
    category: 'Mystery',
    iconName: 'Wand2',
    description: 'Pioneered unknown territories and unlocked obscure knowledge.',
    unlockCondition: 'Complete at least 1 Boss Quest & Level 3',
    unlockedAtLevel: 3,
    checkUnlocked: (state) => state.quests.some(q => q.difficulty === 'Boss' && q.status === 'Completed')
  },
  {
    id: 'title-veteran-specialist',
    name: 'Veteran Specialist',
    badge: 'VETERAN',
    category: 'Strength',
    iconName: 'Swords',
    description: 'Proven operator with seasoned system experience.',
    unlockCondition: 'Reach System Level 5',
    unlockedAtLevel: 5,
    checkUnlocked: (_state, _completedCount, level) => level >= 5
  },
  {
    id: 'title-boss-slayer',
    name: 'Boss Slayer',
    badge: 'BOSS SLAYER',
    category: 'Strength',
    iconName: 'Trophy',
    description: 'Conquered high-stake Boss level directives.',
    unlockCondition: 'Complete at least 1 Boss Quest',
    checkUnlocked: (state) => state.quests.some(q => q.difficulty === 'Boss' && q.status === 'Completed')
  },
  {
    id: 'title-polymath-prime',
    name: 'Polymath Prime',
    badge: 'POLYMATH',
    category: 'Knowledge',
    iconName: 'Brain',
    description: 'Cultivated multiple specialized skills across domains.',
    unlockCondition: 'Develop 3+ Specialized Skills',
    checkUnlocked: (state) => state.skills.length >= 3
  },
  {
    id: 'title-apex-systemer',
    name: 'Apex Systemer',
    badge: 'APEX',
    category: 'Strategy',
    iconName: 'Compass',
    description: 'Attained elite system mastery level.',
    unlockCondition: 'Reach System Level 10',
    unlockedAtLevel: 10,
    checkUnlocked: (_state, _completedCount, level) => level >= 10
  },
  {
    id: 'title-deep-work-monk',
    name: 'Deep Work Monk',
    badge: 'DEEP WORK',
    category: 'Iron Will',
    iconName: 'ShieldCheck',
    description: 'Logged extended deep work focus sessions.',
    unlockCondition: 'Log 120+ Total Focus Minutes',
    checkUnlocked: (state) => (state.profile.focusMinutesToday || 0) >= 120
  },
  {
    id: 'title-unstoppable',
    name: 'The Unstoppable',
    badge: 'UNSTOPPABLE',
    category: 'Passion',
    iconName: 'Zap',
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

export function evaluateUnlockConditions(
  spec: {
    unlockedAtLevel?: number;
    relatedQuestId?: string | null;
    requiredQuestStreak?: number;
    questRequirements?: QuestRequirement[];
    skillRequirements?: SkillRequirement[];
    relatedGoalId?: string | null;
    relatedGoalIds?: string[];
    relatedProjectId?: string | null;
    relatedProjectIds?: string[];
  },
  state: POSState
): { isUnlocked: boolean; unmetConditions: string[]; metConditions: string[] } {
  const metConditions: string[] = [];
  const unmetConditions: string[] = [];

  // Calculate system level dynamically
  const totalXp = (state.xpHistory || []).reduce((sum, h) => sum + h.xp, 0);
  const currentLevel = Math.max(1, Math.floor((-1 + Math.sqrt(9 + totalXp / 62.5)) / 2));

  // 1. System Level Requirement
  const reqLevel = spec.unlockedAtLevel || 1;
  if (reqLevel > 1) {
    if (currentLevel >= reqLevel) {
      metConditions.push(`System Level ${reqLevel}+ (Current: Lvl ${currentLevel})`);
    } else {
      unmetConditions.push(`System Level ${reqLevel}+ required (Current: Lvl ${currentLevel})`);
    }
  } else {
    metConditions.push(`System Level 1+ (Current: Lvl ${currentLevel})`);
  }

  // 2. Related Single Quest Requirement (Backwards-compatibility)
  if (spec.relatedQuestId) {
    const quest = state.quests.find(q => q.id === spec.relatedQuestId);
    const questName = quest ? quest.name : 'Linked Quest';
    const isCompleted = quest && (quest.status === 'Completed' || quest.completedAt !== null);
    if (isCompleted) {
      metConditions.push(`Completed Quest: "${questName}"`);
    } else {
      unmetConditions.push(`Must complete Quest: "${questName}"`);
    }
  }

  // 3. Multi-Quest Requirements with Streak
  if (spec.questRequirements && spec.questRequirements.length > 0) {
    spec.questRequirements.forEach(qReq => {
      // Don't duplicate if already checked via relatedQuestId
      if (qReq.questId === spec.relatedQuestId && !qReq.minStreak) return;
      const quest = state.quests.find(q => q.id === qReq.questId);
      const questName = quest ? quest.name : 'Linked Quest';
      const isCompleted = quest && (quest.status === 'Completed' || quest.completedAt !== null);
      const questStreak = Math.max(quest?.streakCount || 0, quest?.bestStreak || 0);

      if (qReq.requireCompleted !== false) {
        if (isCompleted) {
          metConditions.push(`Completed Quest: "${questName}"`);
        } else {
          unmetConditions.push(`Must complete Quest: "${questName}"`);
        }
      }

      if (qReq.minStreak && qReq.minStreak > 0) {
        if (questStreak >= qReq.minStreak) {
          metConditions.push(`Quest "${questName}" Streak: ${qReq.minStreak}+ Days (Current: ${questStreak})`);
        } else {
          unmetConditions.push(`Quest "${questName}" requires ${qReq.minStreak}+ Day Streak (Current: ${questStreak})`);
        }
      }
    });
  }

  // 4. Required Quest Streak Requirement
  if (spec.requiredQuestStreak && spec.requiredQuestStreak > 0) {
    let currentStreak = 0;
    let targetName = 'Quest Streak';
    if (spec.relatedQuestId) {
      const quest = state.quests.find(q => q.id === spec.relatedQuestId);
      currentStreak = Math.max(quest?.streakCount || 0, quest?.bestStreak || 0);
      targetName = quest ? `Streak on "${quest.name}"` : 'Quest Streak';
    } else {
      const maxQuestStreak = state.quests.reduce((max, q) => Math.max(max, q.streakCount || 0, q.bestStreak || 0), 0);
      currentStreak = Math.max(maxQuestStreak, state.profile.focusStreak || 0);
    }

    if (currentStreak >= spec.requiredQuestStreak) {
      metConditions.push(`${targetName}: ${spec.requiredQuestStreak}+ Days (Current: ${currentStreak} Days)`);
    } else {
      unmetConditions.push(`Requires ${spec.requiredQuestStreak}+ Day ${targetName} (Current: ${currentStreak} Days)`);
    }
  }

  // 5. Skill Requirements
  if (spec.skillRequirements && spec.skillRequirements.length > 0) {
    spec.skillRequirements.forEach(sReq => {
      const skill = state.skills.find(s => s.id === sReq.skillId);
      const skillName = skill ? skill.name : 'Linked Skill';
      const skillLevel = skill?.level || 1;
      if (skillLevel >= sReq.minLevel) {
        metConditions.push(`Skill "${skillName}" Lvl ${sReq.minLevel}+ (Current: Lvl ${skillLevel})`);
      } else {
        unmetConditions.push(`Skill "${skillName}" Lvl ${sReq.minLevel}+ required (Current: Lvl ${skillLevel})`);
      }
    });
  }

  // 6. Related Goal Requirement(s)
  const allGoalIds = [
    ...(spec.relatedGoalId ? [spec.relatedGoalId] : []),
    ...(spec.relatedGoalIds || [])
  ];
  const uniqueGoalIds = Array.from(new Set(allGoalIds));
  if (uniqueGoalIds.length > 0) {
    uniqueGoalIds.forEach(gId => {
      const goal = state.goals.find(g => g.id === gId);
      const goalName = goal ? goal.name : 'Linked Goal';
      const isGoalMet = goal && (goal.status === 'Active' || goal.status === 'Completed');
      if (isGoalMet) {
        metConditions.push(`Active/Completed Goal: "${goalName}"`);
      } else {
        unmetConditions.push(`Must activate or complete Goal: "${goalName}"`);
      }
    });
  }

  // 7. Related Project Requirement(s)
  const allProjectIds = [
    ...(spec.relatedProjectId ? [spec.relatedProjectId] : []),
    ...(spec.relatedProjectIds || [])
  ];
  const uniqueProjectIds = Array.from(new Set(allProjectIds));
  if (uniqueProjectIds.length > 0) {
    uniqueProjectIds.forEach(pId => {
      const project = state.projects.find(p => p.id === pId);
      const projectName = project ? project.name : 'Linked Project';
      const isProjectMet = project && (project.status === 'Active' || project.status === 'Completed');
      if (isProjectMet) {
        metConditions.push(`Active/Completed Project: "${projectName}"`);
      } else {
        unmetConditions.push(`Must activate or complete Project: "${projectName}"`);
      }
    });
  }

  return {
    isUnlocked: unmetConditions.length === 0,
    unmetConditions,
    metConditions
  };
}

export function isJobUnlocked(job: JobSpec, state: POSState): boolean {
  if (
    job.isCustom && 
    !job.relatedQuestId && 
    (!job.questRequirements || job.questRequirements.length === 0) &&
    !job.requiredQuestStreak && 
    (!job.skillRequirements || job.skillRequirements.length === 0) && 
    !job.relatedGoalId && 
    (!job.relatedGoalIds || job.relatedGoalIds.length === 0) &&
    !job.relatedProjectId &&
    (!job.relatedProjectIds || job.relatedProjectIds.length === 0) &&
    job.unlockedAtLevel <= 1
  ) {
    return true; // Custom player jobs without conditions are unlocked
  }
  const evalResult = evaluateUnlockConditions(job, state);
  return evalResult.isUnlocked;
}

export function isTitleUnlocked(title: TitleSpec, state: POSState): boolean {
  if (
    title.isCustom && 
    !title.relatedQuestId && 
    (!title.questRequirements || title.questRequirements.length === 0) &&
    !title.requiredQuestStreak && 
    (!title.skillRequirements || title.skillRequirements.length === 0) && 
    !title.relatedGoalId && 
    (!title.relatedGoalIds || title.relatedGoalIds.length === 0) &&
    !title.relatedProjectId &&
    (!title.relatedProjectIds || title.relatedProjectIds.length === 0) &&
    (!title.unlockedAtLevel || title.unlockedAtLevel <= 1)
  ) {
    return true; // Custom player titles without explicit conditions are unlocked
  }

  // Check structured unlock conditions if defined
  const hasStructuredConditions = 
    title.unlockedAtLevel || 
    title.relatedQuestId || 
    (title.questRequirements && title.questRequirements.length > 0) ||
    title.requiredQuestStreak || 
    (title.skillRequirements && title.skillRequirements.length > 0) || 
    title.relatedGoalId ||
    (title.relatedGoalIds && title.relatedGoalIds.length > 0) ||
    title.relatedProjectId ||
    (title.relatedProjectIds && title.relatedProjectIds.length > 0);
  
  let structuredUnlocked = true;
  if (hasStructuredConditions) {
    structuredUnlocked = evaluateUnlockConditions(title, state).isUnlocked;
  }

  // Check legacy checkUnlocked function if present
  let legacyUnlocked = true;
  if (title.checkUnlocked) {
    const completedQuestCount = state.quests.filter(q => q.status === 'Completed').length;
    const totalXp = (state.xpHistory || []).reduce((sum, h) => sum + h.xp, 0);
    const currentLevel = Math.max(1, Math.floor((-1 + Math.sqrt(9 + totalXp / 62.5)) / 2));
    legacyUnlocked = title.checkUnlocked(state, completedQuestCount, currentLevel);
  }

  return structuredUnlocked && legacyUnlocked;
}

export function getUnlockedTitles(state: POSState): TitleSpec[] {
  const allTitles = getAllTitles(state.customTitles || [], state.deletedTitleIds || []);
  return allTitles.filter(title => isTitleUnlocked(title, state));
}

export function getUnlockedJobs(state: POSState): JobSpec[] {
  const allJobs = getAllJobs(state.customJobs || [], state.deletedJobIds || []);
  return allJobs.filter(job => isJobUnlocked(job, state));
}

export const LEVEL_RANK_NAMES: Record<number, string> = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Specialist',
  4: 'Senior Operator',
  5: 'Master',
  6: 'Grandmaster',
  7: 'Apex Legend'
};

export function getDefaultLevelConditionSpec(spec: JobSpec | TitleSpec, targetLevel: number): LevelConditionSpec {
  const baseReqLevel = spec.unlockedAtLevel || 1;
  const targetReqLevel = baseReqLevel + (targetLevel - 1) * 2;
  const reqQuests = (targetLevel - 1) * 10;
  const reqStreak = Math.max(spec.requiredQuestStreak || 0, Math.floor((targetLevel - 1) * 1.5));
  const reqFocus = targetLevel >= 3 ? (targetLevel - 2) * 30 : 0;

  // Scale skill requirements if base spec had skill requirements
  const skillReqs: SkillRequirement[] = (spec.skillRequirements || []).map(sr => ({
    skillId: sr.skillId,
    minLevel: sr.minLevel + (targetLevel - 1)
  }));

  // Link quest requirements from base if present
  const questReqs: QuestRequirement[] = [];
  if (spec.relatedQuestId) {
    questReqs.push({
      questId: spec.relatedQuestId,
      minStreak: reqStreak,
      requireCompleted: true
    });
  }
  if (spec.questRequirements) {
    spec.questRequirements.forEach(qr => {
      if (!questReqs.some(x => x.questId === qr.questId)) {
        questReqs.push({
          ...qr,
          minStreak: Math.max(qr.minStreak || 0, reqStreak)
        });
      }
    });
  }

  return {
    level: targetLevel,
    unlockedAtLevel: targetReqLevel,
    requiredQuestsCount: reqQuests,
    requiredQuestStreak: reqStreak,
    requiredFocusMinutes: reqFocus,
    questRequirements: questReqs.length > 0 ? questReqs : undefined,
    skillRequirements: skillReqs.length > 0 ? skillReqs : undefined,
    relatedGoalId: spec.relatedGoalId || null,
    relatedGoalIds: spec.relatedGoalIds || undefined,
    relatedProjectId: spec.relatedProjectId || null,
    relatedProjectIds: spec.relatedProjectIds || undefined
  };
}

export function evaluateLevelConditions(
  spec: JobSpec | TitleSpec,
  targetLevel: number,
  state: POSState
): { isMet: boolean; unmetConditions: string[]; metConditions: string[] } {
  if (targetLevel < 1 || targetLevel > 7) {
    return { isMet: false, unmetConditions: ['Invalid Level Range'], metConditions: [] };
  }

  const metConditions: string[] = [];
  const unmetConditions: string[] = [];

  // Calculate current system metrics
  const totalXp = (state.xpHistory || []).reduce((sum, h) => sum + h.xp, 0);
  const currentLevel = Math.max(1, Math.floor((-1 + Math.sqrt(9 + totalXp / 62.5)) / 2));
  const completedQuestCount = state.quests.filter(q => q.status === 'Completed').length;
  const focusMinutes = state.profile.focusMinutesToday || 0;
  const maxStreak = Math.max(
    state.profile.focusStreak || 0,
    ...state.quests.map(q => Math.max(q.streakCount || 0, q.bestStreak || 0))
  );

  // Check base unlock requirement for Level 1
  if (targetLevel === 1) {
    const baseEval = evaluateUnlockConditions(spec, state);
    if (!baseEval.isUnlocked) {
      unmetConditions.push(...baseEval.unmetConditions);
    } else {
      metConditions.push(...baseEval.metConditions);
    }
    return {
      isMet: unmetConditions.length === 0,
      unmetConditions,
      metConditions
    };
  }

  // Check if custom level conditions were configured by user for this level
  const custom = spec.customLevelConditions?.[targetLevel];
  if (custom) {
    let hasAnyRule = false;

    // 1. System Level Requirement
    if (custom.unlockedAtLevel !== undefined && custom.unlockedAtLevel > 0) {
      hasAnyRule = true;
      if (currentLevel >= custom.unlockedAtLevel) {
        metConditions.push(`System Level ${custom.unlockedAtLevel}+ (Current: Lvl ${currentLevel})`);
      } else {
        unmetConditions.push(`System Level ${custom.unlockedAtLevel}+ required (Current: Lvl ${currentLevel})`);
      }
    }

    // 2. Completed Quests Requirement
    if (custom.requiredQuestsCount !== undefined && custom.requiredQuestsCount > 0) {
      hasAnyRule = true;
      if (completedQuestCount >= custom.requiredQuestsCount) {
        metConditions.push(`Completed Quests: ${custom.requiredQuestsCount}+ (Current: ${completedQuestCount})`);
      } else {
        unmetConditions.push(`Requires ${custom.requiredQuestsCount}+ Completed Quests (Current: ${completedQuestCount})`);
      }
    }

    // 3. Streak Requirement
    if (custom.requiredQuestStreak !== undefined && custom.requiredQuestStreak > 0) {
      hasAnyRule = true;
      if (maxStreak >= custom.requiredQuestStreak) {
        metConditions.push(`Active Streak: ${custom.requiredQuestStreak}+ Days (Current: ${maxStreak} Days)`);
      } else {
        unmetConditions.push(`Requires ${custom.requiredQuestStreak}+ Day Streak (Current: ${maxStreak} Days)`);
      }
    }

    // 4. Focus Minutes Requirement
    if (custom.requiredFocusMinutes !== undefined && custom.requiredFocusMinutes > 0) {
      hasAnyRule = true;
      if (focusMinutes >= custom.requiredFocusMinutes) {
        metConditions.push(`Focus Minutes: ${custom.requiredFocusMinutes}m+ (Current: ${focusMinutes}m)`);
      } else {
        unmetConditions.push(`Requires ${custom.requiredFocusMinutes}m+ Focus Minutes (Current: ${focusMinutes}m)`);
      }
    }

    // 5. Specific Quests
    if (custom.questRequirements && custom.questRequirements.length > 0) {
      custom.questRequirements.forEach(qReq => {
        hasAnyRule = true;
        const quest = state.quests.find(q => q.id === qReq.questId);
        const qName = quest ? quest.name : 'Linked Quest';
        const isCompleted = quest && (quest.status === 'Completed' || quest.completedAt !== null);
        const streak = Math.max(quest?.streakCount || 0, quest?.bestStreak || 0);

        if (qReq.requireCompleted !== false) {
          if (isCompleted) {
            metConditions.push(`Completed Quest: "${qName}"`);
          } else {
            unmetConditions.push(`Must complete Quest: "${qName}"`);
          }
        }

        if (qReq.minStreak && qReq.minStreak > 0) {
          if (streak >= qReq.minStreak) {
            metConditions.push(`Quest "${qName}" Streak: ${qReq.minStreak}+ Days (Current: ${streak})`);
          } else {
            unmetConditions.push(`Quest "${qName}" requires ${qReq.minStreak}+ Day Streak (Current: ${streak})`);
          }
        }
      });
    }

    // 6. Specific Skills
    if (custom.skillRequirements && custom.skillRequirements.length > 0) {
      custom.skillRequirements.forEach(sReq => {
        hasAnyRule = true;
        const skill = state.skills.find(s => s.id === sReq.skillId);
        const sName = skill ? skill.name : 'Linked Skill';
        const sLvl = skill?.level || 1;
        if (sLvl >= sReq.minLevel) {
          metConditions.push(`Skill "${sName}" Lvl ${sReq.minLevel}+ (Current: Lvl ${sLvl})`);
        } else {
          unmetConditions.push(`Skill "${sName}" Lvl ${sReq.minLevel}+ required (Current: Lvl ${sLvl})`);
        }
      });
    }

    // 7. Goals
    const goalIds = [
      ...(custom.relatedGoalId ? [custom.relatedGoalId] : []),
      ...(custom.relatedGoalIds || [])
    ];
    if (goalIds.length > 0) {
      goalIds.forEach(gId => {
        hasAnyRule = true;
        const goal = state.goals.find(g => g.id === gId);
        const gName = goal ? goal.name : 'Linked Goal';
        const isMet = goal && (goal.status === 'Active' || goal.status === 'Completed');
        if (isMet) {
          metConditions.push(`Active/Completed Goal: "${gName}"`);
        } else {
          unmetConditions.push(`Must activate or complete Goal: "${gName}"`);
        }
      });
    }

    // 8. Projects
    const projectIds = [
      ...(custom.relatedProjectId ? [custom.relatedProjectId] : []),
      ...(custom.relatedProjectIds || [])
    ];
    if (projectIds.length > 0) {
      projectIds.forEach(pId => {
        hasAnyRule = true;
        const project = state.projects.find(p => p.id === pId);
        const pName = project ? project.name : 'Linked Project';
        const isMet = project && (project.status === 'Active' || project.status === 'Completed');
        if (isMet) {
          metConditions.push(`Active/Completed Project: "${pName}"`);
        } else {
          unmetConditions.push(`Must activate or complete Project: "${pName}"`);
        }
      });
    }

    // If all conditions for this level were removed/deleted by the user, mark as unconditionally unlocked
    if (!hasAnyRule && unmetConditions.length === 0) {
      metConditions.push('No leveling conditions required for Level ' + targetLevel + ' (Condition cleared)');
    }

    return {
      isMet: unmetConditions.length === 0,
      unmetConditions,
      metConditions
    };
  }

  // DEFAULT PROGRESSION FORMULA (if no custom override exists for this level)
  // 1. System Level Requirement
  const baseReqLevel = spec.unlockedAtLevel || 1;
  const targetReqLevel = baseReqLevel + (targetLevel - 1) * 2;
  if (currentLevel >= targetReqLevel) {
    metConditions.push(`System Level ${targetReqLevel}+ (Current: Lvl ${currentLevel})`);
  } else {
    unmetConditions.push(`System Level ${targetReqLevel}+ required (Current: Lvl ${currentLevel})`);
  }

  // 2. Completed Quests Requirement
  const reqQuests = (targetLevel - 1) * 10;
  if (reqQuests > 0) {
    if (completedQuestCount >= reqQuests) {
      metConditions.push(`Completed Quests: ${reqQuests}+ (Current: ${completedQuestCount})`);
    } else {
      unmetConditions.push(`Requires ${reqQuests}+ Completed Quests (Current: ${completedQuestCount})`);
    }
  }

  // 3. Focus / Streak Requirement for higher levels
  const reqStreak = Math.max(spec.requiredQuestStreak || 0, Math.floor((targetLevel - 1) * 1.5));
  if (reqStreak > 0) {
    if (maxStreak >= reqStreak) {
      metConditions.push(`Active Streak: ${reqStreak}+ Days (Current: ${maxStreak} Days)`);
    } else {
      unmetConditions.push(`Requires ${reqStreak}+ Day Streak (Current: ${maxStreak} Days)`);
    }
  }

  // 4. Focus Minutes requirement for levels 3+
  if (targetLevel >= 3) {
    const reqFocus = (targetLevel - 2) * 30;
    if (focusMinutes >= reqFocus) {
      metConditions.push(`Focus Minutes logged: ${reqFocus}m+ (Current: ${focusMinutes}m)`);
    } else {
      unmetConditions.push(`Requires ${reqFocus}m+ Focus Minutes logged (Current: ${focusMinutes}m)`);
    }
  }

  return {
    isMet: unmetConditions.length === 0,
    unmetConditions,
    metConditions
  };
}

export function getJobLevel(jobId: string, state: POSState): number {
  const storedLevel = state.profile.jobLevels?.[jobId];
  if (storedLevel && storedLevel >= 1 && storedLevel <= 7) {
    return storedLevel;
  }
  const job = getAllJobs(state.customJobs || [], state.deletedJobIds || []).find(j => j.id === jobId);
  if (!job) return 1;

  if (!isJobUnlocked(job, state)) return 1;

  // Calculate highest level achieved
  let maxLevel = 1;
  for (let lvl = 2; lvl <= 7; lvl++) {
    const evalRes = evaluateLevelConditions(job, lvl, state);
    if (evalRes.isMet) {
      maxLevel = lvl;
    } else {
      break;
    }
  }
  return maxLevel;
}

export function getTitleLevel(titleId: string, state: POSState): number {
  const storedLevel = state.profile.titleLevels?.[titleId];
  if (storedLevel && storedLevel >= 1 && storedLevel <= 7) {
    return storedLevel;
  }
  const title = getAllTitles(state.customTitles || [], state.deletedTitleIds || []).find(t => t.id === titleId);
  if (!title) return 1;

  if (!isTitleUnlocked(title, state)) return 1;

  let maxLevel = 1;
  for (let lvl = 2; lvl <= 7; lvl++) {
    const evalRes = evaluateLevelConditions(title, lvl, state);
    if (evalRes.isMet) {
      maxLevel = lvl;
    } else {
      break;
    }
  }
  return maxLevel;
}

export function getJobScaledPerk(job: JobSpec, level: number): string {
  const bonusMultiplier = Math.round((level - 1) * 5); // +5% per level above 1
  if (level <= 1) return job.perk;
  return `${job.perk} (+${bonusMultiplier}% Level ${level} Master Boost)`;
}

