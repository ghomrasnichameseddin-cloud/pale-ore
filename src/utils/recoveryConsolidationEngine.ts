import { Quest, SubQuest } from '../types';
import { addDays, getLocalDateString } from './dateUtils';

export interface ConsolidateRecoveryResult {
  megapack: Quest;
  originalIds: string[];
  rawXp: number;
  bonusXp: number;
  totalXp: number;
  rawMinutes: number;
  compressedMinutes: number;
  mergedCount: number;
}

/**
 * Consolidates multiple active recovery directives into a single high-efficiency Megapack.
 * Features:
 * - Granular subtask conversion from constituent recovery quests
 * - +20% Scaled Completionist Bonus XP
 * - 20% Condensed execution time discount
 * - -25 Fatigue Level relief on completion
 * - Combined competency & attribute restitution
 */
export function consolidateRecoveryQuests(
  quests: Quest[],
  systemDate: string = getLocalDateString()
): ConsolidateRecoveryResult | null {
  const eligibleQuests = quests.filter(
    q => q.status === 'Active' && (q.type === 'Recovery' || q.type === 'Penalty') && !q.archived
  );

  if (eligibleQuests.length === 0) {
    return null;
  }

  const mergedCount = eligibleQuests.length;
  const originalIds = eligibleQuests.map(q => q.id);

  // 1. XP calculation with +20% scaled bonus
  const rawXp = eligibleQuests.reduce((sum, q) => {
    const val = typeof q.xp === 'number' && q.xp > 0 ? q.xp : 25;
    return sum + val;
  }, 0);
  const bonusXp = Math.max(10, Math.round(rawXp * 0.2));
  const totalXp = rawXp + bonusXp;

  // 2. Execution time compression (20% batch focus efficiency)
  const rawMinutes = eligibleQuests.reduce((sum, q) => sum + (q.estimatedTime || 15), 0);
  const compressedMinutes = Math.max(15, Math.round(rawMinutes * 0.8));

  // 3. Unique skills aggregation
  const skillIdsSet = new Set<string>();
  eligibleQuests.forEach(q => {
    (q.relatedSkills || []).forEach(s => skillIdsSet.add(s));
  });
  const relatedSkills = Array.from(skillIdsSet);

  // 4. Competency skill rewards aggregation with +20% bonus
  const skillRewardsMap = new Map<string, number>();
  eligibleQuests.forEach(q => {
    (q.skillRewards || []).forEach(sr => {
      skillRewardsMap.set(sr.skillId, (skillRewardsMap.get(sr.skillId) || 0) + sr.xp);
    });
  });
  const skillRewards = Array.from(skillRewardsMap.entries()).map(([skillId, xp]) => ({
    skillId,
    xp: Math.max(5, Math.round(xp * 1.2))
  }));

  // 5. Attribute rewards aggregation
  const attributeRewardsMap = new Map<string, number>();
  eligibleQuests.forEach(q => {
    (q.attributeRewards || []).forEach(ar => {
      attributeRewardsMap.set(ar.attribute, (attributeRewardsMap.get(ar.attribute) || 0) + ar.points);
    });
  });
  // Ensure baseline restitution attributes if none recorded
  if (attributeRewardsMap.size === 0) {
    attributeRewardsMap.set('Discipline', 3);
    attributeRewardsMap.set('Focus', 3);
  }
  const attributeRewards = Array.from(attributeRewardsMap.entries()).map(([attribute, points]) => ({
    attribute,
    points
  }));

  // 6. Subquests generation from constituent objectives
  const subquests: SubQuest[] = eligibleQuests.map((q, idx) => {
    const cleanName = q.name
      .replace(/^🛡️\s*RECOVERY:\s*Resolve\s*"?/i, '')
      .replace(/^💀\s*MIDNIGHT\s*PENALTY:\s*/i, '')
      .replace(/^🛡️\s*RECOVERY:\s*/i, '')
      .replace(/"?$/, '')
      .trim();

    return {
      id: `sq-megapack-${q.id}-${idx}`,
      name: `Resolve: "${cleanName}" (${q.estimatedTime || 15}m)`,
      completed: false
    };
  });

  const megapack: Quest = {
    id: `q-recovery-megapack-${Date.now()}`,
    name: `🛡️⚡ RECOVERY MEGAPACK (${mergedCount} Directives)`,
    description: `Consolidated Master Recovery Directive merging ${mergedCount} backlogged recovery items. Completing this routine restores operational equilibrium with a +20% bonus XP award (+${bonusXp} XP, ${totalXp} XP total), compressed focus duration (${compressedMinutes}m vs ${rawMinutes}m standard), and a soothing -25 Fatigue relief benefit.`,
    status: 'Active',
    difficulty: mergedCount >= 6 ? 'Boss' : mergedCount >= 3 ? 'Hard' : 'Normal',
    type: 'Recovery',
    estimatedTime: compressedMinutes,
    recurrence: 'None',
    energyLevel: 'High',
    deadline: systemDate,
    createdAt: new Date().toISOString(),
    completedAt: null,
    xp: totalXp,
    goalId: eligibleQuests[0]?.goalId || null,
    projectId: eligibleQuests[0]?.projectId || null,
    milestoneId: eligibleQuests[0]?.milestoneId || null,
    subquests,
    relatedSkills,
    skillRewards,
    attributeRewards,
    isRecoveryMegapack: true,
    mergedQuestCount: mergedCount,
    originalQuestIds: originalIds,
    fatigueRelief: 25
  };

  return {
    megapack,
    originalIds,
    rawXp,
    bonusXp,
    totalXp,
    rawMinutes,
    compressedMinutes,
    mergedCount
  };
}

/**
 * Distributes crammed recovery quests across upcoming days at a sustainable rate of maxPerDay (default 2/day).
 * Prevents cognitive burnout and protects current operational routines.
 */
export function staggerRecoveryQuests(
  quests: Quest[],
  startDate: string = getLocalDateString(),
  maxPerDay: number = 2
): Quest[] {
  const eligibleQuests = quests.filter(
    q => q.status === 'Active' && (q.type === 'Recovery' || q.type === 'Penalty') && !q.archived
  );

  if (eligibleQuests.length === 0) {
    return quests;
  }

  const totalBatches = Math.max(1, Math.ceil(eligibleQuests.length / maxPerDay));
  const eligibleIdsMap = new Map<string, number>();
  eligibleQuests.forEach((q, idx) => eligibleIdsMap.set(q.id, idx));

  return quests.map(q => {
    if (!eligibleIdsMap.has(q.id)) {
      return q;
    }

    const index = eligibleIdsMap.get(q.id)!;
    const dayOffset = Math.floor(index / maxPerDay);
    const targetDeadline = addDays(startDate, dayOffset);
    const batchIndex = dayOffset + 1;

    return {
      ...q,
      deadline: targetDeadline,
      postponedTo: targetDeadline,
      pacingBatchIndex: batchIndex,
      pacingTotalBatches: totalBatches
    };
  });
}
