import { 
  CoreDomain, 
  SkillType, 
  SkillRank, 
  Skill, 
  Attribute, 
  Quest, 
  SkillReward, 
  AttributeReward, 
  RewardPayload, 
  CoreDomainProgress 
} from '../types';

export type {
  CoreDomain,
  SkillType,
  SkillRank,
  Skill,
  Attribute,
  Quest,
  SkillReward,
  AttributeReward,
  RewardPayload,
  CoreDomainProgress
};

/**
 * 1. CORE DOMAINS & CANONICAL ATTRIBUTES
 * 
 * The architecture is strictly structured as:
 * CORE DOMAINS (Mind, Body, Soul)
 *     ↓
 * ATTRIBUTES (9 canonical pillars)
 *     ↓
 * SKILLS (Primary & Secondary learned competencies)
 *     ↓
 * ACTIONS / QUESTS (Execute & generate rewards)
 *     ↓
 * REWARDS (Skill XP + Attribute Points)
 */

export const CORE_DOMAINS: readonly CoreDomain[] = ['Mind', 'Body', 'Soul'] as const;

export const DOMAIN_ATTRIBUTES: Record<CoreDomain, readonly string[]> = {
  Mind: ['Focus', 'Knowledge', 'Wisdom', 'Clarity', 'Creativity', 'Memory'],
  Body: ['Strength', 'Endurance', 'Agility', 'Vitality', 'Fortitude', 'Mobility'],
  Soul: ['Faith', 'Discipline', 'Social', 'Ihsan', 'Sabr', 'Shukr']
} as const;

export const ATTRIBUTE_DOMAIN_MAP: Record<string, CoreDomain> = {
  Focus: 'Mind',
  Knowledge: 'Mind',
  Wisdom: 'Mind',
  Clarity: 'Mind',
  Creativity: 'Mind',
  Memory: 'Mind',
  Strength: 'Body',
  Endurance: 'Body',
  Agility: 'Body',
  Vitality: 'Body',
  Fortitude: 'Body',
  Mobility: 'Body',
  Faith: 'Soul',
  Discipline: 'Soul',
  Social: 'Soul',
  Ihsan: 'Soul',
  Sabr: 'Soul',
  Shukr: 'Soul'
};

export const CANONICAL_ATTRIBUTES = [
  'Strength',
  'Endurance',
  'Agility',
  'Focus',
  'Discipline',
  'Knowledge',
  'Wisdom',
  'Social',
  'Faith',
  'Clarity',
  'Creativity',
  'Memory',
  'Vitality',
  'Fortitude',
  'Mobility',
  'Ihsan',
  'Sabr',
  'Shukr'
] as const;

export type CanonicalAttributeName = typeof CANONICAL_ATTRIBUTES[number];

export const CANONICAL_ATTRIBUTE_IDS: Record<string, string> = {
  Strength: 'a-1',
  Endurance: 'a-2',
  Agility: 'a-3',
  Focus: 'a-4',
  Discipline: 'a-5',
  Knowledge: 'a-6',
  Wisdom: 'a-7',
  Social: 'a-8',
  Faith: 'a-9',
  Clarity: 'a-10',
  Creativity: 'a-11',
  Memory: 'a-12',
  Vitality: 'a-13',
  Fortitude: 'a-14',
  Mobility: 'a-15',
  Ihsan: 'a-16',
  Sabr: 'a-17',
  Shukr: 'a-18'
};

export const CANONICAL_ID_TO_ATTRIBUTE: Record<string, CanonicalAttributeName> = {
  'a-1': 'Strength',
  'a-2': 'Endurance',
  'a-3': 'Agility',
  'a-4': 'Focus',
  'a-5': 'Discipline',
  'a-6': 'Knowledge',
  'a-7': 'Wisdom',
  'a-8': 'Social',
  'a-9': 'Faith',
  'a-10': 'Clarity',
  'a-11': 'Creativity',
  'a-12': 'Memory',
  'a-13': 'Vitality',
  'a-14': 'Fortitude',
  'a-15': 'Mobility',
  'a-16': 'Ihsan',
  'a-17': 'Sabr',
  'a-18': 'Shukr'
};

export interface AttributeMeta {
  name: CanonicalAttributeName;
  id: string;
  domain: CoreDomain;
  description: string;
  icon: string;
  color: string;
  focusArea: string;
}

export const CANONICAL_ATTRIBUTE_METADATA: Record<CanonicalAttributeName, AttributeMeta> = {
  // --- MIND DOMAIN (6 PILLARS) ---
  Focus: {
    name: 'Focus',
    id: 'a-4',
    domain: 'Mind',
    description: 'Capacity to concentrate deeply on high-stakes directives without distraction or cognitive drift.',
    icon: '🎯',
    color: '#38bdf8',
    focusArea: 'Deep-work Pomodoro blocks, main directives & distraction shielding.'
  },
  Knowledge: {
    name: 'Knowledge',
    id: 'a-6',
    domain: 'Mind',
    description: 'Theoretical foundations, syntax, programming, language grammar, and structured academic study.',
    icon: '📖',
    color: '#818cf8',
    focusArea: 'Coding documentation, technical reading, language syntax & research.'
  },
  Wisdom: {
    name: 'Wisdom',
    id: 'a-7',
    domain: 'Mind',
    description: 'Synthesizing knowledge into sound strategic judgment, priority filtering, and high-impact long-term decisions.',
    icon: '👁️',
    color: '#a78bfa',
    focusArea: 'Grand Destiny advancement, strategic trade-offs & postmortem reflection.'
  },
  Clarity: {
    name: 'Clarity',
    id: 'a-10',
    domain: 'Mind',
    description: 'Analytical precision, mental lucidity, structured logic, and rapid deconstruction of ambiguous bottlenecks.',
    icon: '💎',
    color: '#06b6d4',
    focusArea: 'Architecture documents, system debugging, complex problem breakdown & logic modeling.'
  },
  Creativity: {
    name: 'Creativity',
    id: 'a-11',
    domain: 'Mind',
    description: 'Lateral thinking, architectural innovation, novel solutions, and creative synthesis across disparate domains.',
    icon: '🎨',
    color: '#ec4899',
    focusArea: 'Product design, UI/UX architecture, creative writing, inventive engineering & conceptual breakthroughs.'
  },
  Memory: {
    name: 'Memory',
    id: 'a-12',
    domain: 'Mind',
    description: 'Cognitive retention fidelity, rapid information recall, mental crystallization, and knowledge permanence.',
    icon: '🧠',
    color: '#6366f1',
    focusArea: 'Qur\'an memorization (Hifz), technical syntax recall, spaced repetition & algorithmic retention.'
  },

  // --- BODY DOMAIN (6 PILLARS) ---
  Strength: {
    name: 'Strength',
    id: 'a-1',
    domain: 'Body',
    description: 'Physical power, muscular output, and physical resistance capacity built through demanding exertion.',
    icon: '⚡',
    color: '#f87171',
    focusArea: 'High-intensity workouts, resistance drills & physical training.'
  },
  Endurance: {
    name: 'Endurance',
    id: 'a-2',
    domain: 'Body',
    description: 'Physical stamina, long-haul grit, and cognitive resilience to repeat demanding routines without fatigue.',
    icon: '🛡️',
    color: '#fb923c',
    focusArea: 'Sustained focus stints, daily recurring chains & deep work volume.'
  },
  Agility: {
    name: 'Agility',
    id: 'a-3',
    domain: 'Body',
    description: 'Mental dexterity, tactical adaptation, and rapid context-switching across multi-domain challenges.',
    icon: '⚔️',
    color: '#eab308',
    focusArea: 'Quick task turnaround, technical problem-solving & side quest execution.'
  },
  Vitality: {
    name: 'Vitality',
    id: 'a-13',
    domain: 'Body',
    description: 'Bio-energetic stamina, restorative sleep quality, cellular rejuvenation, and baseline somatic wellness.',
    icon: '🌱',
    color: '#10b981',
    focusArea: 'Sleep optimization, hydration, clean nutrition, active rest days & physical replenishment.'
  },
  Fortitude: {
    name: 'Fortitude',
    id: 'a-14',
    domain: 'Body',
    description: 'Physical toughness, pain tolerance, grit under thermal/somatic stress, and physical perseverance.',
    icon: '🏔️',
    color: '#f97316',
    focusArea: 'Fasting endurance, cold exposure, grueling physical challenges & pushing past fatigue barriers.'
  },
  Mobility: {
    name: 'Mobility',
    id: 'a-15',
    domain: 'Body',
    description: 'Kinetic fluidity, musculoskeletal flexibility, postural alignment, joint resilience, and physical balance.',
    icon: '🤸',
    color: '#14b8a6',
    focusArea: 'Daily stretching, mobility flows, postural correction, warmups & physical recovery longevity.'
  },

  // --- SOUL DOMAIN (6 PILLARS) ---
  Faith: {
    name: 'Faith',
    id: 'a-9',
    domain: 'Soul',
    description: 'Spiritual alignment, intentional sincerity (Ikhlāṣ), sacred discipline, and connection to the Divine.',
    icon: '✨',
    color: '#e5c875',
    focusArea: 'Congregational prayers, Qur\'an study, Adhkār, fasting & Muḥāsabah.'
  },
  Discipline: {
    name: 'Discipline',
    id: 'a-5',
    domain: 'Soul',
    description: 'Ironclad consistency in fulfilling daily covenanted duties and non-negotiables regardless of emotional state.',
    icon: '⚖️',
    color: '#c5a059',
    focusArea: 'Habit streaks, daily covenants, routine adherence & zero deferrals.'
  },
  Social: {
    name: 'Social',
    id: 'a-8',
    domain: 'Soul',
    description: 'Interpersonal diplomacy, collaborative leadership, persuasive articulation, and communal uplift.',
    icon: '🤝',
    color: '#34d399',
    focusArea: 'Communication, team coordination, public speaking, writing & teaching.'
  },
  Ihsan: {
    name: 'Ihsan',
    id: 'a-16',
    domain: 'Soul',
    description: 'Spiritual excellence (Iḥsān), inner mindfulness of the Divine (Murāqabah), and perfection of deed quality.',
    icon: '🌟',
    color: '#f59e0b',
    focusArea: 'Khushū\' in prayer, voluntary charity (Ṣadaqah), spiritual contemplation & moral purity.'
  },
  Sabr: {
    name: 'Sabr',
    id: 'a-17',
    domain: 'Soul',
    description: 'Patient perseverance (Ṣabr), emotional poise under distress, impulse restraint, and steadfast endurance.',
    icon: '⚓',
    color: '#8b5cf6',
    focusArea: 'Emotional composure during adversity, enduring delays with poise & resisting temptations.'
  },
  Shukr: {
    name: 'Shukr',
    id: 'a-18',
    domain: 'Soul',
    description: 'Profound gratitude (Shukr), inner contentment (Riḍā), recognizing divine blessings, and radiant optimism.',
    icon: '☀️',
    color: '#eab308',
    focusArea: 'Gratitude journaling, Hamd and Adhkār, acknowledging favors & maintaining a joyful heart.'
  }
};

export const CORE_DOMAIN_METADATA: Record<CoreDomain, { description: string; icon: string; color: string }> = {
  Mind: {
    description: 'Cognitive power, intellectual synthesis, clarity of thought, and strategic discernment.',
    icon: '🧠',
    color: '#38bdf8'
  },
  Body: {
    description: 'Physical vitality, motor stamina, explosive force, and tactical execution agility.',
    icon: '⚡',
    color: '#f87171'
  },
  Soul: {
    description: 'Spiritual alignment, principled character, uncompromising discipline, and communal grace.',
    icon: '✨',
    color: '#e5c875'
  }
};

/**
 * Normalizes any string representation of an attribute (e.g. 'knowledge', 'a-6', 'KNOWLEDGE')
 * to its canonical capitalized name (e.g. 'Knowledge').
 */
export function canonicalizeAttributeName(nameOrId?: string): CanonicalAttributeName {
  if (!nameOrId) return 'Knowledge';
  const trimmed = nameOrId.trim();
  if (CANONICAL_ID_TO_ATTRIBUTE[trimmed]) {
    return CANONICAL_ID_TO_ATTRIBUTE[trimmed];
  }
  const match = CANONICAL_ATTRIBUTES.find(
    a => a.toLowerCase() === trimmed.toLowerCase()
  );
  return match || 'Knowledge';
}

/**
 * 2. CORE DOMAINS AGGREGATION
 * 
 * The domain score is derived from its attributes rather than stored as an independent progression value.
 * Uses arithmetic mean of the three associated attributes.
 */
export function calculateCoreDomainScores(attributes: Attribute[]): Record<CoreDomain, CoreDomainProgress> {
  const result: Record<CoreDomain, CoreDomainProgress> = {
    Mind: {
      domain: 'Mind',
      level: 1,
      rawScore: 1,
      progress: 0,
      attributes: [],
      description: CORE_DOMAIN_METADATA.Mind.description,
      icon: CORE_DOMAIN_METADATA.Mind.icon,
      color: CORE_DOMAIN_METADATA.Mind.color
    },
    Body: {
      domain: 'Body',
      level: 1,
      rawScore: 1,
      progress: 0,
      attributes: [],
      description: CORE_DOMAIN_METADATA.Body.description,
      icon: CORE_DOMAIN_METADATA.Body.icon,
      color: CORE_DOMAIN_METADATA.Body.color
    },
    Soul: {
      domain: 'Soul',
      level: 1,
      rawScore: 1,
      progress: 0,
      attributes: [],
      description: CORE_DOMAIN_METADATA.Soul.description,
      icon: CORE_DOMAIN_METADATA.Soul.icon,
      color: CORE_DOMAIN_METADATA.Soul.color
    }
  };

  CORE_DOMAINS.forEach(domain => {
    const attrNames = DOMAIN_ATTRIBUTES[domain];
    const domainAttrs = attributes.filter(a => {
      const canonical = canonicalizeAttributeName(a.name);
      return attrNames.includes(canonical);
    });

    result[domain].attributes = domainAttrs;

    if (domainAttrs.length > 0) {
      const totalLevels = domainAttrs.reduce((sum, a) => sum + (a.level || 1), 0);
      const totalProgress = domainAttrs.reduce((sum, a) => sum + (a.progress || 0), 0);
      const rawLevel = totalLevels / domainAttrs.length;
      result[domain].rawScore = Number(rawLevel.toFixed(2));
      result[domain].level = Number(rawLevel.toFixed(1));
      result[domain].progress = Math.min(100, Math.max(0, Math.round(totalProgress / domainAttrs.length)));
    }
  });

  return result;
}

/**
 * 3. SKILL RANK AND XP PROGRESSION
 * 
 * Centralized Pale Ore Rank Philosophy:
 * F → E → D → C → B → A → S → SS → SSS
 * 
 * XP is the authoritative progression value. Rank is derived from XP.
 * Both Primary and Secondary skills use the same XP → Rank progression engine.
 */
export interface SkillRankThreshold {
  rank: SkillRank;
  minXp: number;
  maxXp: number;
  title: string;
  color: string;
  badgeClass: string;
}

export const SKILL_RANK_THRESHOLDS: readonly SkillRankThreshold[] = [
  { rank: 'F', minXp: 0, maxXp: 250, title: 'Initiate', color: '#94a3b8', badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  { rank: 'E', minXp: 250, maxXp: 750, title: 'Novice', color: '#a1a1aa', badgeClass: 'bg-zinc-800/90 text-zinc-200 border-zinc-600' },
  { rank: 'D', minXp: 750, maxXp: 1750, title: 'Apprentice', color: '#38bdf8', badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50' },
  { rank: 'C', minXp: 1750, maxXp: 3500, title: 'Practitioner', color: '#34d399', badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50' },
  { rank: 'B', minXp: 3500, maxXp: 7000, title: 'Journeyman', color: '#c084fc', badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/50' },
  { rank: 'A', minXp: 7000, maxXp: 12500, title: 'Expert', color: '#fb923c', badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-700/50' },
  { rank: 'S', minXp: 12500, maxXp: 25000, title: 'Master', color: '#facc15', badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-600/50' },
  { rank: 'SS', minXp: 25000, maxXp: 50000, title: 'Grandmaster', color: '#f43f5e', badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-600/50' },
  { rank: 'SSS', minXp: 50000, maxXp: Infinity, title: 'Apex Sovereign', color: '#e5c875', badgeClass: 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]' }
] as const;

export function getSkillRank(xp: number): SkillRank {
  const safeXp = Math.max(0, xp || 0);
  for (let i = SKILL_RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= SKILL_RANK_THRESHOLDS[i].minXp) {
      return SKILL_RANK_THRESHOLDS[i].rank;
    }
  }
  return 'F';
}

export interface SkillRankDetails {
  rank: SkillRank;
  title: string;
  color: string;
  badgeClass: string;
  currentRankMinXp: number;
  nextRankMinXp: number;
  xpIntoRank: number;
  xpNeededForNextRank: number;
  progress: number; // 0 to 100
  isMaxRank: boolean;
}

export function getSkillRankDetails(xp: number): SkillRankDetails {
  const safeXp = Math.max(0, xp || 0);
  const currentRank = getSkillRank(safeXp);
  const index = SKILL_RANK_THRESHOLDS.findIndex(t => t.rank === currentRank);
  const currentThreshold = SKILL_RANK_THRESHOLDS[index];
  const isMaxRank = index === SKILL_RANK_THRESHOLDS.length - 1;

  if (isMaxRank) {
    return {
      rank: 'SSS',
      title: currentThreshold.title,
      color: currentThreshold.color,
      badgeClass: currentThreshold.badgeClass,
      currentRankMinXp: currentThreshold.minXp,
      nextRankMinXp: currentThreshold.minXp,
      xpIntoRank: safeXp - currentThreshold.minXp,
      xpNeededForNextRank: 0,
      progress: 100,
      isMaxRank: true
    };
  }

  const nextThreshold = SKILL_RANK_THRESHOLDS[index + 1];
  const rankSpan = nextThreshold.minXp - currentThreshold.minXp;
  const xpIntoRank = safeXp - currentThreshold.minXp;
  const xpNeededForNextRank = Math.max(0, nextThreshold.minXp - safeXp);
  const progress = Math.min(100, Math.max(0, Math.round((xpIntoRank / rankSpan) * 100)));

  return {
    rank: currentRank,
    title: currentThreshold.title,
    color: currentThreshold.color,
    badgeClass: currentThreshold.badgeClass,
    currentRankMinXp: currentThreshold.minXp,
    nextRankMinXp: nextThreshold.minXp,
    xpIntoRank,
    xpNeededForNextRank,
    progress,
    isMaxRank: false
  };
}

/**
 * Calculates a compatible numeric level and mastery value for skills based on XP.
 */
export function calculateSkillLevel(xp: number): number {
  const safeXp = Math.max(0, xp || 0);
  // Reusable quadratic progression: L = Math.floor((-1 + Math.sqrt(9 + safeXp / 62.5)) / 2)
  return Math.max(1, Math.floor((-1 + Math.sqrt(9 + safeXp / 62.5)) / 2));
}

export function calculateSkillMastery(xp: number): number {
  const safeXp = Math.max(0, xp || 0);
  return Math.min(100, Math.round((safeXp / 50000) * 100));
}

/**
 * 4. DYNAMIC SKILL CREATION & NORMALIZATION
 */
export function normalizeSkill(raw: Partial<Skill>): Skill {
  const name = (raw.name || 'Custom Skill').trim();
  const id = raw.id || `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  // Normalize type: 'primary' | 'secondary'
  let type: SkillType = 'primary';
  if (raw.type === 'secondary' || raw.tier === 'Secondary') {
    type = 'secondary';
  } else if (raw.type === 'primary' || raw.tier === 'Primary') {
    type = 'primary';
  }

  // Canonicalize attribute references
  const primaryAttribute = canonicalizeAttributeName(
    raw.primaryAttribute || (raw.primaryAttributeId ? CANONICAL_ID_TO_ATTRIBUTE[raw.primaryAttributeId] : 'Knowledge')
  );

  let secondaryAttribute: string | null = null;
  if (raw.secondaryAttribute) {
    secondaryAttribute = canonicalizeAttributeName(raw.secondaryAttribute);
  } else if (raw.secondaryAttributeIds && raw.secondaryAttributeIds.length > 0) {
    secondaryAttribute = canonicalizeAttributeName(CANONICAL_ID_TO_ATTRIBUTE[raw.secondaryAttributeIds[0]]);
  }

  // Authoritative XP
  const xp = typeof raw.xp === 'number' && !isNaN(raw.xp) ? Math.max(0, Math.round(raw.xp)) : 0;
  const rank = getSkillRank(xp);
  const level = calculateSkillLevel(xp);
  const mastery = calculateSkillMastery(xp);

  const now = new Date().toISOString();

  return {
    id,
    name,
    description: raw.description || '',
    type,
    xp,
    rank,
    primaryAttribute,
    secondaryAttribute,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,

    // Backward-compatibility mirrors
    tier: type === 'secondary' ? 'Secondary' : 'Primary',
    level,
    mastery,
    primaryAttributeId: CANONICAL_ATTRIBUTE_IDS[primaryAttribute] || 'a-6',
    secondaryAttributeIds: secondaryAttribute ? [CANONICAL_ATTRIBUTE_IDS[secondaryAttribute] || 'a-4'] : [],
    archived: Boolean(raw.archived),
    relatedGoals: raw.relatedGoals || [],
    relatedProjects: raw.relatedProjects || [],
    equippedTitle: raw.equippedTitle || '',
    parentId: raw.parentId || null,
    masteryStage: raw.masteryStage,
    targetLevel: raw.targetLevel,
    subSpecializations: raw.subSpecializations || [],
    recommendedActions: raw.recommendedActions || [],
    codexDocIds: raw.codexDocIds || []
  };
}

export function createCustomSkill(params: {
  name: string;
  type?: SkillType;
  description?: string;
  primaryAttribute: string;
  secondaryAttribute?: string | null;
  tags?: string[];
  initialXp?: number;
}): Skill {
  return normalizeSkill({
    name: params.name,
    type: params.type || 'primary',
    description: params.description || '',
    primaryAttribute: params.primaryAttribute,
    secondaryAttribute: params.secondaryAttribute || null,
    tags: params.tags || [],
    xp: params.initialXp || 0
  });
}

/**
 * Default starter skills illustrating the canonical examples from the specification
 */
export const DEFAULT_STARTER_SKILLS: Skill[] = [
  normalizeSkill({
    id: 'skill-python',
    name: 'Python Programming',
    description: 'Backend architecture, algorithms, automation scripting, and system design.',
    type: 'primary',
    primaryAttribute: 'Knowledge',
    secondaryAttribute: 'Focus',
    tags: ['programming', 'software', 'backend', 'tech'],
    xp: 2200
  }),
  normalizeSkill({
    id: 'skill-quran',
    name: 'Qur\'an Memorization',
    description: 'Sacred Hifdh, precise Tajweed articulation, revision cycles, and Tadabbur.',
    type: 'primary',
    primaryAttribute: 'Faith',
    secondaryAttribute: 'Discipline',
    tags: ['sacred', 'spiritual', 'quran', 'hifdh'],
    xp: 3800
  }),
  normalizeSkill({
    id: 'skill-calisthenics',
    name: 'Calisthenics',
    description: 'Bodyweight mastery, gymnastic strength, explosive pull-ups, dips, and core tension.',
    type: 'primary',
    primaryAttribute: 'Strength',
    secondaryAttribute: 'Endurance',
    tags: ['fitness', 'body', 'workout', 'strength'],
    xp: 1850
  }),
  normalizeSkill({
    id: 'skill-chess',
    name: 'Chess',
    description: 'Tactical foresight, positional analysis, opening repertoire, and endgame calculation.',
    type: 'secondary',
    primaryAttribute: 'Wisdom',
    secondaryAttribute: 'Focus',
    tags: ['mind', 'strategy', 'game', 'tactics'],
    xp: 900
  }),
  normalizeSkill({
    id: 'skill-html-css',
    name: 'HTML/CSS',
    description: 'Responsive semantic layouts, modern CSS variables, typography, and UI polish.',
    type: 'secondary',
    primaryAttribute: 'Knowledge',
    secondaryAttribute: 'Agility',
    tags: ['frontend', 'web', 'ui', 'design'],
    xp: 1200
  }),
  normalizeSkill({
    id: 'skill-english',
    name: 'English',
    description: 'Advanced vocabulary, articulate rhetorical prose, technical authorship, and clarity.',
    type: 'secondary',
    primaryAttribute: 'Knowledge',
    secondaryAttribute: 'Social',
    tags: ['language', 'communication', 'writing'],
    xp: 1400
  }),
  normalizeSkill({
    id: 'skill-linux',
    name: 'Linux',
    description: 'Shell scripting, server administration, process management, and DevOps fundamentals.',
    type: 'secondary',
    primaryAttribute: 'Knowledge',
    secondaryAttribute: 'Focus',
    tags: ['sysadmin', 'devops', 'tech', 'linux'],
    xp: 650
  }),
  normalizeSkill({
    id: 'skill-mobility',
    name: 'Mobility',
    description: 'Joint health, connective tissue resilience, dynamic stretching, and recovery.',
    type: 'secondary',
    primaryAttribute: 'Agility',
    secondaryAttribute: 'Endurance',
    tags: ['recovery', 'health', 'body', 'flexibility'],
    xp: 400
  }),
  normalizeSkill({
    id: 'skill-communication',
    name: 'Communication',
    description: 'Clear persuasion, empathetic listening, leadership alignment, and public speaking.',
    type: 'primary',
    primaryAttribute: 'Social',
    secondaryAttribute: 'Wisdom',
    tags: ['interpersonal', 'leadership', 'speaking', 'social'],
    xp: 1600
  })
];

/**
 * 5. UNIFIED REWARD PROCESSING PIPELINE
 * 
 * Connects Actions / Quests → Rewards → Skill XP + Attribute Points → Core Domains.
 */
export function resolveQuestRewards(
  quest: Quest,
  allSkills: Skill[] = []
): RewardPayload {
  // 1. If explicit rewards already exist on the quest, use them
  if ((quest.skillRewards && quest.skillRewards.length > 0) || (quest.attributeRewards && quest.attributeRewards.length > 0)) {
    return {
      xp: quest.xp || 50,
      skillRewards: quest.skillRewards || [],
      attributeRewards: quest.attributeRewards || []
    };
  }

  // 2. Otherwise derive clean unified rewards dynamically
  const baseXp = Math.max(0, quest.xp || 50);
  const relatedSkillIds = quest.relatedSkills || [];

  const skillRewards: SkillReward[] = [];
  const attributeRewardMap = new Map<string, number>();

  // Allocate skill XP
  if (relatedSkillIds.length > 0) {
    const xpPerSkill = Math.max(1, Math.round(baseXp / relatedSkillIds.length));
    relatedSkillIds.forEach(sid => {
      skillRewards.push({ skillId: sid, xp: xpPerSkill });

      // Identify skill's primary & secondary attributes to feed attribute progression
      const sk = allSkills.find(s => s.id === sid);
      if (sk) {
        const prim = canonicalizeAttributeName(sk.primaryAttribute);
        attributeRewardMap.set(prim, (attributeRewardMap.get(prim) || 0) + 2);

        if (sk.secondaryAttribute) {
          const sec = canonicalizeAttributeName(sk.secondaryAttribute);
          attributeRewardMap.set(sec, (attributeRewardMap.get(sec) || 0) + 1);
        }
      }
    });
  }

  // If no skill-derived attributes, deduce from quest type / difficulty / keywords
  if (attributeRewardMap.size === 0) {
    const qName = quest.name.toLowerCase();
    const diff = (quest.difficulty || 'Normal').toLowerCase();
    const bonus = diff === 'boss' ? 4 : (diff === 'hard' ? 2 : 1);

    if (['debug', 'refactor', 'architect', 'analyze', 'logic', 'solve', 'bug', 'investigat'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Clarity', (attributeRewardMap.get('Clarity') || 0) + bonus + 1);
      attributeRewardMap.set('Focus', (attributeRewardMap.get('Focus') || 0) + 1);
    } else if (['design', 'ui', 'ux', 'creative', 'invent', 'compose', 'art', 'draft'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Creativity', (attributeRewardMap.get('Creativity') || 0) + bonus + 1);
      attributeRewardMap.set('Knowledge', (attributeRewardMap.get('Knowledge') || 0) + 1);
    } else if (['memoriz', 'hifz', 'flashcard', 'recall', 'review', 'retention'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Memory', (attributeRewardMap.get('Memory') || 0) + bonus + 1);
      attributeRewardMap.set('Focus', (attributeRewardMap.get('Focus') || 0) + 1);
    } else if (['sleep', 'rest', 'hydrat', 'nutrition', 'meal', 'recover', 'wellness'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Vitality', (attributeRewardMap.get('Vitality') || 0) + bonus + 1);
      attributeRewardMap.set('Endurance', (attributeRewardMap.get('Endurance') || 0) + 1);
    } else if (['cold', 'fasting', 'sawm', 'grit', 'tough', 'resilien'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Fortitude', (attributeRewardMap.get('Fortitude') || 0) + bonus + 1);
      attributeRewardMap.set('Discipline', (attributeRewardMap.get('Discipline') || 0) + 1);
    } else if (['stretch', 'mobility', 'posture', 'walk', 'flexib', 'joint'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Mobility', (attributeRewardMap.get('Mobility') || 0) + bonus + 1);
      attributeRewardMap.set('Agility', (attributeRewardMap.get('Agility') || 0) + 1);
    } else if (['sadaqah', 'charity', 'khushu', 'ihsan', 'contemplat'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Ihsan', (attributeRewardMap.get('Ihsan') || 0) + bonus + 1);
      attributeRewardMap.set('Faith', (attributeRewardMap.get('Faith') || 0) + 1);
    } else if (['patien', 'sabr', 'calm', 'forgiv', 'restraint', 'kaffarah'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Sabr', (attributeRewardMap.get('Sabr') || 0) + bonus + 1);
      attributeRewardMap.set('Discipline', (attributeRewardMap.get('Discipline') || 0) + 1);
    } else if (['gratitud', 'thank', 'shukr', 'praise', 'alhamdulillah'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Shukr', (attributeRewardMap.get('Shukr') || 0) + bonus + 1);
      attributeRewardMap.set('Faith', (attributeRewardMap.get('Faith') || 0) + 1);
    } else if (quest.type === 'Habit') {
      attributeRewardMap.set('Discipline', (attributeRewardMap.get('Discipline') || 0) + bonus + 1);
      attributeRewardMap.set('Endurance', (attributeRewardMap.get('Endurance') || 0) + 1);
    } else if (diff === 'boss' || quest.type === 'Boss') {
      attributeRewardMap.set('Focus', (attributeRewardMap.get('Focus') || 0) + bonus);
      attributeRewardMap.set('Wisdom', (attributeRewardMap.get('Wisdom') || 0) + bonus);
    } else if (['code', 'program', 'python', 'study', 'read', 'learn'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Knowledge', (attributeRewardMap.get('Knowledge') || 0) + bonus);
      attributeRewardMap.set('Focus', (attributeRewardMap.get('Focus') || 0) + 1);
    } else if (['workout', 'gym', 'run', 'pushup', 'calisthenics', 'fitness'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Strength', (attributeRewardMap.get('Strength') || 0) + bonus);
      attributeRewardMap.set('Endurance', (attributeRewardMap.get('Endurance') || 0) + 1);
    } else if (['salah', 'quran', 'adhkar', 'prayer', 'dua'].some(w => qName.includes(w))) {
      attributeRewardMap.set('Faith', (attributeRewardMap.get('Faith') || 0) + bonus);
      attributeRewardMap.set('Discipline', (attributeRewardMap.get('Discipline') || 0) + 1);
    } else {
      attributeRewardMap.set('Focus', (attributeRewardMap.get('Focus') || 0) + bonus);
      attributeRewardMap.set('Discipline', (attributeRewardMap.get('Discipline') || 0) + 1);
    }
  }

  const attributeRewards: AttributeReward[] = Array.from(attributeRewardMap.entries()).map(
    ([attribute, points]) => ({ attribute, points })
  );

  return {
    xp: baseXp,
    skillRewards,
    attributeRewards
  };
}

/**
 * Ensures the nine canonical attributes exist in the state with correct Core Domain bindings.
 */
export function ensureCanonicalAttributes(existing: Attribute[] = []): Attribute[] {
  const existingMap = new Map<string, Attribute>();
  existing.forEach(a => {
    existingMap.set(canonicalizeAttributeName(a.name), a);
  });

  return CANONICAL_ATTRIBUTES.map(canonicalName => {
    const meta = CANONICAL_ATTRIBUTE_METADATA[canonicalName];
    const prev = existingMap.get(canonicalName);

    return {
      id: meta.id,
      name: meta.name,
      domain: meta.domain,
      level: prev?.level || 1,
      progress: prev?.progress || 0,
      description: meta.description,
      definition: meta.description,
      category: meta.domain,
      icon: meta.icon,
      baseLevel: prev?.baseLevel || 1,
      earnedBonus: prev?.earnedBonus || 0,
      total: prev?.total || prev?.level || 1,
      resetAt: prev?.resetAt,
      pointsIntoLevel: prev?.pointsIntoLevel || 0,
      pointsRequiredForNextLevel: prev?.pointsRequiredForNextLevel || 14,
      totalPoints: prev?.totalPoints || 0
    };
  });
}
