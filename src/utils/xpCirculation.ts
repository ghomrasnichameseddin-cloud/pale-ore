import { XPHistoryEntry, StandardXPEventType, XPModifiers, XPAnalytics, Skill, Quest } from '../types';
import { parseDateSafe, getDaysDifference } from './dateUtils';

export const SOVEREIGN_ATTRIBUTES = [
  'Strength',
  'Endurance',
  'Agility',
  'Focus',
  'Discipline',
  'Knowledge',
  'Wisdom',
  'Social',
  'Faith'
] as const;

export type SovereignAttributeName = typeof SOVEREIGN_ATTRIBUTES[number];

export const ATTRIBUTE_ID_MAP: Record<SovereignAttributeName, string> = {
  Strength: 'a-1',
  Endurance: 'a-2',
  Agility: 'a-3',
  Focus: 'a-4',
  Discipline: 'a-5',
  Knowledge: 'a-6',
  Wisdom: 'a-7',
  Social: 'a-8',
  Faith: 'a-9'
};

/**
 * Standardize any legacy or incoming XP event type.
 */
export function normalizeXPEventType(
  type?: string, 
  source?: string, 
  questName?: string,
  questId?: string | null
): StandardXPEventType {
  if (type) {
    const t = type.toLowerCase();
    if (t === 'quest' || t === 'main' || t === 'side' || t === 'optional') return 'quest';
    if (t === 'focus') return 'focus';
    if (t === 'habit' || t === 'routine') return 'habit';
    if (t === 'salah' || t === 'prayer') return 'salah';
    if (t === 'adhkar' || t === 'dhikr') return 'adhkar';
    if (t === 'boss') return 'boss';
    if (t === 'penalty' || t === 'failed') return 'penalty';
    if (t === 'reversal' || t === 'refund') return 'reversal';
  }

  if (source) {
    const s = source.toLowerCase();
    if (s.includes('focus')) return 'focus';
    if (s.includes('habit')) return 'habit';
    if (s.includes('boss')) return 'boss';
    if (s.includes('penalty')) return 'penalty';
  }

  const name = (questName || '').toLowerCase();
  const qId = (questId || '').toLowerCase();

  if (qId.startsWith('spiritual-prayer-') || name.includes('fardh') || name.includes('salah') || name.includes('sunnah')) {
    return 'salah';
  }
  if (qId.startsWith('spiritual-adhkar-') || qId.startsWith('spiritual-salawat-') || name.includes('adhkār') || name.includes('salawāt') || name.includes('qiyam')) {
    return 'adhkar';
  }
  if (name.includes('focus session') || name.includes('pomodoro') || qId.startsWith('h-focus-')) {
    return 'focus';
  }
  if (name.includes('boss') || name.includes('👑') || name.includes('⚔️')) {
    return 'boss';
  }
  if (name.includes('penalty') || name.includes('💀') || name.includes('failed')) {
    return 'penalty';
  }
  if (name.includes('habit') || name.includes('protocol') || name.includes('covenant')) {
    return 'habit';
  }

  return 'quest';
}

/**
 * Canonical Attribute Weight Profile
 * Maps activity signatures and skills to the 9 sovereign attributes.
 * The weights always sum to 1.0 so progression does not over-inflate.
 */
export function getAttributeWeightsForActivity(params: {
  questName?: string;
  type?: StandardXPEventType;
  skillIds?: string[];
  skills?: Skill[];
  isBoss?: boolean;
}): Record<SovereignAttributeName, number> {
  const weights: Record<SovereignAttributeName, number> = {
    Strength: 0,
    Endurance: 0,
    Agility: 0,
    Focus: 0,
    Discipline: 0,
    Knowledge: 0,
    Wisdom: 0,
    Social: 0,
    Faith: 0
  };

  const { questName = '', type = 'quest', skillIds = [], skills = [], isBoss = false } = params;
  const nameLower = questName.toLowerCase();

  // 1. Spiritual activities (Salah & Adhkar)
  if (type === 'salah') {
    weights.Faith = 0.65;
    weights.Discipline = 0.25;
    weights.Focus = 0.10;
    return weights;
  }

  if (type === 'adhkar') {
    weights.Faith = 0.60;
    weights.Knowledge = 0.20;
    weights.Focus = 0.20;
    return weights;
  }

  // 2. Focus Sessions
  if (type === 'focus') {
    weights.Focus = 0.60;
    weights.Discipline = 0.25;
    weights.Endurance = 0.15;
    return weights;
  }

  // 3. Boss Directives
  if (type === 'boss' || isBoss) {
    weights.Focus = 0.30;
    weights.Discipline = 0.30;
    weights.Wisdom = 0.25;
    weights.Strength = 0.15;
    return weights;
  }

  // 4. Habits & Protocols
  if (type === 'habit') {
    weights.Discipline = 0.55;
    weights.Endurance = 0.25;
    weights.Focus = 0.20;
    return weights;
  }

  // 5. Inspect linked skills
  const linkedSkillNames: string[] = [];
  if (skillIds.length > 0 && skills.length > 0) {
    skillIds.forEach(id => {
      const sk = skills.find(s => s.id === id);
      if (sk) linkedSkillNames.push(sk.name.toLowerCase());
    });
  }

  const combinedText = `${nameLower} ${linkedSkillNames.join(' ')}`;

  // Physical & Fitness
  if (['fitness', 'workout', 'gym', 'calisthenics', 'running', 'cardio', 'strength'].some(w => combinedText.includes(w))) {
    weights.Strength = 0.50;
    weights.Endurance = 0.30;
    weights.Agility = 0.20;
    return weights;
  }

  // Coding, Software, Technical, Sciences
  if (['programming', 'coding', 'typescript', 'python', 'react', 'code', 'algorithm', 'engineer', 'math', 'chess'].some(w => combinedText.includes(w))) {
    weights.Knowledge = 0.45;
    weights.Focus = 0.35;
    weights.Discipline = 0.20;
    return weights;
  }

  // Language & Learning
  if (['english', 'arabic', 'french', 'reading', 'study', 'book', 'learning', 'course'].some(w => combinedText.includes(w))) {
    weights.Knowledge = 0.50;
    weights.Focus = 0.30;
    weights.Wisdom = 0.20;
    return weights;
  }

  // Qur'an & Islamic Studies
  if (['qur\'an', 'quran', 'tajweed', 'hifz', 'tafsir', 'hadith', 'fiqh', 'seerah'].some(w => combinedText.includes(w))) {
    weights.Faith = 0.55;
    weights.Knowledge = 0.30;
    weights.Focus = 0.15;
    return weights;
  }

  // Social & Writing
  if (['writing', 'communication', 'social', 'speaking', 'presentation', 'teaching', 'mentorship', 'meeting'].some(w => combinedText.includes(w))) {
    weights.Social = 0.50;
    weights.Wisdom = 0.30;
    weights.Knowledge = 0.20;
    return weights;
  }

  // Strategy & Planning
  if (['strategy', 'planning', 'review', 'audit', 'roadmap', 'decision', 'architecture'].some(w => combinedText.includes(w))) {
    weights.Wisdom = 0.50;
    weights.Focus = 0.30;
    weights.Knowledge = 0.20;
    return weights;
  }

  // Fallback: General balanced progression
  weights.Discipline = 0.40;
  weights.Focus = 0.35;
  weights.Agility = 0.25;
  return weights;
}

/**
 * XP Modifiers & Anti-Farming Diminishing Returns
 * Base XP × Difficulty × Quality × Relevance × Anti-Farming
 */
export function calculateXPModifiers(params: {
  difficulty?: string;
  quality?: number; // 1.0 default, 1.15 for high quality
  isCampaignRelated?: boolean;
  isCriticalGap?: boolean;
  occurrenceCountToday?: number;
  isExemptFromDiminishing?: boolean;
}): {
  difficultyMultiplier: number;
  qualityMultiplier: number;
  relevanceBonus: number;
  diminishingReturnFactor: number;
  finalMultiplier: number;
} {
  const {
    difficulty = 'Normal',
    quality = 1.0,
    isCampaignRelated = false,
    isCriticalGap = false,
    occurrenceCountToday = 0,
    isExemptFromDiminishing = false
  } = params;

  // 1. Difficulty Multiplier
  let difficultyMultiplier = 1.0;
  const diff = difficulty.toLowerCase();
  if (diff === 'trivial' || diff === 'very easy') difficultyMultiplier = 0.75;
  else if (diff === 'easy') difficultyMultiplier = 0.90;
  else if (diff === 'normal') difficultyMultiplier = 1.0;
  else if (diff === 'hard') difficultyMultiplier = 1.25;
  else if (diff === 'boss') difficultyMultiplier = 1.50;

  // 2. Quality Multiplier (conservative 1.0 to 1.15)
  const qualityMultiplier = Math.min(1.20, Math.max(0.85, quality));

  // 3. Relevance Bonus: +15% if tied to active Campaign or Critical Strategic Capability Gap
  const relevanceBonus = (isCampaignRelated || isCriticalGap) ? 1.15 : 1.0;

  // 4. Anti-Farming Diminishing Returns for trivial/repeated tasks within the same day
  // 1st -> 100%, 2nd -> 90%, 3rd -> 80%, 4th -> 70%, 5th+ -> 50%
  let diminishingReturnFactor = 1.0;
  if (!isExemptFromDiminishing && diff !== 'boss' && diff !== 'hard') {
    if (occurrenceCountToday <= 1) diminishingReturnFactor = 1.0;
    else if (occurrenceCountToday === 2) diminishingReturnFactor = 0.90;
    else if (occurrenceCountToday === 3) diminishingReturnFactor = 0.80;
    else if (occurrenceCountToday === 4) diminishingReturnFactor = 0.70;
    else diminishingReturnFactor = 0.50;
  }

  const finalMultiplier = Number(
    (difficultyMultiplier * qualityMultiplier * relevanceBonus * diminishingReturnFactor).toFixed(3)
  );

  return {
    difficultyMultiplier,
    qualityMultiplier,
    relevanceBonus,
    diminishingReturnFactor,
    finalMultiplier
  };
}

/**
 * Duplicate Protection:
 * Checks if the exact action was already recorded in history today.
 */
export function isDuplicateXPEvent(
  history: XPHistoryEntry[] = [],
  params: {
    sourceId?: string;
    questId?: string | null;
    timestamp?: string;
    date?: string;
    type?: StandardXPEventType;
  }
): boolean {
  const { sourceId, questId, timestamp, date, type } = params;
  if (!sourceId && !questId) return false;

  const targetDate = date || (timestamp ? timestamp.split('T')[0] : '');

  return history.some(h => {
    // Exact source ID match (e.g. idempotent focus session transaction or spiritual prayer key)
    if (sourceId && (h.sourceId === sourceId || h.id === sourceId)) return true;

    // For spiritual logs and one-time daily events, questId matches with the same date
    if (questId && h.questId === questId) {
      const hDate = h.date || (h.timestamp ? h.timestamp.split('T')[0] : '');
      if (type === 'salah' || type === 'adhkar') {
        return hDate === targetDate;
      }
      // Non-recurring standard quest cannot be completed twice unless reopened
      if (type === 'quest' || type === 'boss') {
        return true;
      }
    }

    return false;
  });
}

/**
 * Counts occurrences of an activity key today to determine diminishing returns.
 */
export function getActivityOccurrenceCountToday(
  history: XPHistoryEntry[] = [],
  activityKey: string,
  todayDate: string
): number {
  const normKey = activityKey.trim().toLowerCase();
  return history.filter(h => {
    const hDate = h.date || (h.timestamp ? h.timestamp.split('T')[0] : '');
    if (hDate !== todayDate) return false;
    const hKey = (h.activityId || h.questId || h.questName || '').trim().toLowerCase();
    return hKey === normKey || hKey.includes(normKey);
  }).length;
}

/**
 * Central XP Event Dispatcher Result
 */
export interface DispatchXPResult {
  updatedHistory: XPHistoryEntry[];
  createdEntry: XPHistoryEntry | null;
  wasDuplicate: boolean;
  earnedXp: number;
}

/**
 * Central pure dispatcher:
 * Action -> dispatchXPEventPure() -> XP calculation -> xpHistory
 */
export function dispatchXPEventPure(params: {
  currentHistory: XPHistoryEntry[];
  type: StandardXPEventType;
  questName: string;
  baseXp: number;
  questId?: string | null;
  sourceId?: string;
  activityId?: string;
  timestamp?: string;
  date?: string;
  skillIds?: string[];
  difficulty?: string;
  quality?: number;
  isCampaignRelated?: boolean;
  isCriticalGap?: boolean;
  notes?: string;
}): DispatchXPResult {
  const {
    currentHistory = [],
    type,
    questName,
    baseXp,
    questId = null,
    sourceId,
    activityId,
    timestamp = new Date().toISOString(),
    date = timestamp.split('T')[0],
    skillIds = [],
    difficulty = 'Normal',
    quality = 1.0,
    isCampaignRelated = false,
    isCriticalGap = false,
    notes
  } = params;

  // 1. Duplicate check
  if (isDuplicateXPEvent(currentHistory, { sourceId, questId, timestamp, date, type })) {
    return {
      updatedHistory: currentHistory,
      createdEntry: null,
      wasDuplicate: true,
      earnedXp: 0
    };
  }

  // 2. Anti-farming occurrence check
  const activityKey = activityId || questId || questName;
  const countToday = getActivityOccurrenceCountToday(currentHistory, activityKey, date);

  // Penalties and reversals keep raw XP
  const isPenalty = type === 'penalty' || baseXp < 0;
  const isReversal = type === 'reversal';

  let earnedXp = baseXp;
  let modifiers: XPModifiers | undefined;

  if (!isPenalty && !isReversal) {
    const mod = calculateXPModifiers({
      difficulty,
      quality,
      isCampaignRelated,
      isCriticalGap,
      occurrenceCountToday: countToday + 1,
      isExemptFromDiminishing: type === 'boss' || type === 'salah' || difficulty.toLowerCase() === 'boss'
    });

    earnedXp = Math.max(1, Math.round(baseXp * mod.finalMultiplier));
    modifiers = {
      difficultyMultiplier: mod.difficultyMultiplier,
      qualityMultiplier: mod.qualityMultiplier,
      relevanceBonus: mod.relevanceBonus,
      diminishingReturnFactor: mod.diminishingReturnFactor
    };
  }

  const entryId = sourceId || `h-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newEntry: XPHistoryEntry = {
    id: entryId,
    questId,
    questName,
    xp: earnedXp,
    timestamp,
    date,
    skillIds,
    type,
    source: (type === 'boss' ? 'boss' : type === 'focus' ? 'focus' : type === 'habit' ? 'habit' : type === 'penalty' ? 'penalty_failed' : 'quest'),
    sourceId,
    activityId,
    modifiers,
    notes
  };

  return {
    updatedHistory: [newEntry, ...currentHistory],
    createdEntry: newEntry,
    wasDuplicate: false,
    earnedXp
  };
}

/**
 * Basic XP Analytics derived purely from xpHistory
 */
export function getXPAnalytics(params: {
  xpHistory: XPHistoryEntry[];
  systemDate: string;
  skills?: Skill[];
  quests?: Quest[];
}): XPAnalytics {
  const { xpHistory = [], systemDate, skills = [] } = params;

  // Boundaries: Last 7 days and prior 7 days
  const sevenDaysAgo = new Date(parseDateSafe(systemDate).getTime() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const fourteenDaysAgo = new Date(parseDateSafe(systemDate).getTime() - 13 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  let sevenDayXP = 0;
  let priorSevenDayXP = 0;
  let diminishedActivitiesCount = 0;

  const sourceCounts: Record<StandardXPEventType | 'other', number> = {
    quest: 0,
    focus: 0,
    habit: 0,
    salah: 0,
    adhkar: 0,
    boss: 0,
    penalty: 0,
    reversal: 0,
    other: 0
  };

  const attributePoints: Record<SovereignAttributeName, number> = {
    Strength: 0,
    Endurance: 0,
    Agility: 0,
    Focus: 0,
    Discipline: 0,
    Knowledge: 0,
    Wisdom: 0,
    Social: 0,
    Faith: 0
  };

  xpHistory.forEach(h => {
    const hDate = h.date || (h.timestamp ? h.timestamp.split('T')[0] : '');
    const hType = normalizeXPEventType(h.type, h.source, h.questName, h.questId);

    // Track 7-day windows
    if (hDate >= sevenDaysAgo && hDate <= systemDate) {
      if (h.xp > 0) sevenDayXP += h.xp;
      sourceCounts[hType] = (sourceCounts[hType] || 0) + (h.xp > 0 ? h.xp : 0);

      // Distribute to attributes via attribute weights
      if (h.xp > 0) {
        const weights = getAttributeWeightsForActivity({
          questName: h.questName,
          type: hType,
          skillIds: h.skillIds,
          skills
        });
        SOVEREIGN_ATTRIBUTES.forEach(attr => {
          attributePoints[attr] += Math.round(h.xp * (weights[attr] || 0));
        });
      }

      if (h.modifiers && h.modifiers.diminishingReturnFactor && h.modifiers.diminishingReturnFactor < 1.0) {
        diminishedActivitiesCount++;
      }
    } else if (hDate >= fourteenDaysAgo && hDate < sevenDaysAgo) {
      if (h.xp > 0) priorSevenDayXP += h.xp;
    }
  });

  const dailyVelocity = Math.round(sevenDayXP / 7);
  const velocityDeltaPercent = priorSevenDayXP > 0
    ? Math.round(((sevenDayXP - priorSevenDayXP) / priorSevenDayXP) * 100)
    : 0;

  const totalSourceXp = Object.values(sourceCounts).reduce((sum, v) => sum + v, 0);

  const sourceLabels: Record<StandardXPEventType | 'other', string> = {
    quest: 'Directives & Quests',
    focus: 'Deep Focus Blocks',
    habit: 'Daily Protocols',
    salah: 'Preserved Prayers',
    adhkar: 'Spiritual Fortress',
    boss: 'Sanctum Bosses',
    penalty: 'Penalties & Slips',
    reversal: 'Reversals',
    other: 'Other Sources'
  };

  const sourceDistribution = (Object.keys(sourceCounts) as (StandardXPEventType | 'other')[])
    .filter(k => sourceCounts[k] > 0)
    .map(type => ({
      type,
      label: sourceLabels[type],
      xp: sourceCounts[type],
      percentage: totalSourceXp > 0 ? Math.round((sourceCounts[type] / totalSourceXp) * 100) : 0
    }))
    .sort((a, b) => b.xp - a.xp);

  const totalAttrPoints = Object.values(attributePoints).reduce((sum, v) => sum + v, 0);
  const attributeDistribution: Record<string, { points: number; percentage: number }> = {};
  SOVEREIGN_ATTRIBUTES.forEach(attr => {
    const pts = attributePoints[attr];
    attributeDistribution[attr] = {
      points: pts,
      percentage: totalAttrPoints > 0 ? Math.round((pts / totalAttrPoints) * 100) : 0
    };
  });

  // Calculate Skill Momentum & Freshness (Never decay historical XP)
  const fresh: { skillId: string; name: string; daysInactive: number; xpRecent: number }[] = [];
  const steady: { skillId: string; name: string; daysInactive: number; xpRecent: number }[] = [];
  const cooling: { skillId: string; name: string; daysInactive: number; xpRecent: number }[] = [];
  const dormant: { skillId: string; name: string; daysInactive: number; xpRecent: number }[] = [];

  skills.forEach(sk => {
    const skEntries = xpHistory.filter(h => h.skillIds && h.skillIds.includes(sk.id) && h.xp > 0);
    if (skEntries.length === 0) {
      dormant.push({ skillId: sk.id, name: sk.name, daysInactive: 999, xpRecent: 0 });
      return;
    }

    // Most recent execution date
    const dates = skEntries.map(e => e.date || (e.timestamp ? e.timestamp.split('T')[0] : '')).filter(Boolean);
    dates.sort().reverse();
    const latestDate = dates[0] || systemDate;
    const daysDiff = Math.max(0, getDaysDifference(systemDate, latestDate));

    // Recent 7d XP
    const recentXp = skEntries
      .filter(e => {
        const d = e.date || (e.timestamp ? e.timestamp.split('T')[0] : '');
        return d >= sevenDaysAgo && d <= systemDate;
      })
      .reduce((sum, e) => sum + e.xp, 0);

    const item = { skillId: sk.id, name: sk.name, daysInactive: daysDiff, xpRecent: recentXp };
    if (daysDiff <= 7) fresh.push(item);
    else if (daysDiff <= 14) steady.push(item);
    else if (daysDiff <= 30) cooling.push(item);
    else dormant.push(item);
  });

  return {
    sevenDayXP,
    priorSevenDayXP,
    dailyVelocity,
    velocityDeltaPercent,
    sourceDistribution,
    attributeDistribution,
    skillMomentum: {
      fresh,
      steady,
      cooling,
      dormant
    },
    diminishedActivitiesCount
  };
}
