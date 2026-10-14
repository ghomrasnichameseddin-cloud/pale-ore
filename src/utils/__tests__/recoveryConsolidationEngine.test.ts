import { describe, it, expect } from 'vitest';
import { consolidateRecoveryQuests, staggerRecoveryQuests } from '../recoveryConsolidationEngine';
import { Quest } from '../../types';

describe('recoveryConsolidationEngine', () => {
  const createMockRecoveryQuest = (id: string, name: string, xp: number, time: number): Quest => ({
    id,
    name,
    description: `Recovery for ${name}`,
    status: 'Active',
    difficulty: 'Normal',
    type: 'Recovery',
    estimatedTime: time,
    recurrence: 'None',
    deadline: '2026-10-14',
    createdAt: '2026-10-14T00:00:00.000Z',
    completedAt: null,
    xp,
    goalId: null,
    projectId: null,
    milestoneId: null,
    relatedSkills: ['s-discipline'],
    skillRewards: [{ skillId: 's-discipline', xp: 10 }],
    attributeRewards: [{ attribute: 'Discipline', points: 1 }]
  });

  it('consolidates multiple recovery quests into a unified Megapack with +20% bonus XP and compressed time', () => {
    const quests: Quest[] = [
      createMockRecoveryQuest('q1', '🛡️ RECOVERY: Resolve "Morning Deep Work"', 50, 30),
      createMockRecoveryQuest('q2', '🛡️ RECOVERY: Resolve "Exercise Routine"', 100, 45),
      createMockRecoveryQuest('q3', '🛡️ RECOVERY: Resolve "Reading Habit"', 50, 25)
    ];

    const result = consolidateRecoveryQuests(quests, '2026-10-14');
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.mergedCount).toBe(3);
    expect(result.rawXp).toBe(200);
    expect(result.bonusXp).toBe(40); // 20% of 200
    expect(result.totalXp).toBe(240);

    expect(result.rawMinutes).toBe(100);
    expect(result.compressedMinutes).toBe(80); // 80% of 100

    expect(result.megapack.isRecoveryMegapack).toBe(true);
    expect(result.megapack.fatigueRelief).toBe(25);
    expect(result.megapack.subquests?.length).toBe(3);
    expect(result.megapack.subquests?.[0].name).toContain('Morning Deep Work');
  });

  it('staggers crammed recovery quests across days with max 2 per day', () => {
    const quests: Quest[] = [
      createMockRecoveryQuest('q1', 'Task 1', 50, 20),
      createMockRecoveryQuest('q2', 'Task 2', 50, 20),
      createMockRecoveryQuest('q3', 'Task 3', 50, 20),
      createMockRecoveryQuest('q4', 'Task 4', 50, 20),
      createMockRecoveryQuest('q5', 'Task 5', 50, 20)
    ];

    const staggered = staggerRecoveryQuests(quests, '2026-10-14', 2);
    expect(staggered.length).toBe(5);

    // Day 0 (2026-10-14): q1 and q2
    expect(staggered[0].deadline).toBe('2026-10-14');
    expect(staggered[0].pacingBatchIndex).toBe(1);
    expect(staggered[1].deadline).toBe('2026-10-14');
    expect(staggered[1].pacingBatchIndex).toBe(1);

    // Day +1 (2026-10-15): q3 and q4
    expect(staggered[2].deadline).toBe('2026-10-15');
    expect(staggered[2].pacingBatchIndex).toBe(2);
    expect(staggered[3].deadline).toBe('2026-10-15');
    expect(staggered[3].pacingBatchIndex).toBe(2);

    // Day +2 (2026-10-16): q5
    expect(staggered[4].deadline).toBe('2026-10-16');
    expect(staggered[4].pacingBatchIndex).toBe(3);
    expect(staggered[4].pacingTotalBatches).toBe(3);
  });
});
