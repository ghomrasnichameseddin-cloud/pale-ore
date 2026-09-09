import { describe, it, expect } from 'vitest';
import { processMultiDayPenalties } from '../penaltyEngine';
import { POSState, Quest } from '../../types';
import { INITIAL_STATE } from '../../initialState';

describe('Multi-Day Midnight Penalty Engine', () => {
  const createBaseQuest = (overrides: Partial<Quest> = {}): Quest => ({
    id: 'quest-habit-1',
    name: 'Morning Fajr in Congregation',
    description: 'Pray Fajr at the masjid',
    status: 'Active',
    difficulty: 'Normal',
    type: 'Habit',
    estimatedTime: 30,
    recurrence: 'Daily',
    energyLevel: 'High',
    deadline: null,
    createdAt: '2026-08-01T05:00:00.000Z',
    completedAt: null,
    xp: 50,
    goalId: null,
    projectId: null,
    milestoneId: null,
    subquests: [],
    relatedSkills: [],
    ...overrides
  });

  const createTestState = (quests: Quest[], initialMomentum = 100): POSState => ({
    ...INITIAL_STATE,
    quests,
    xpHistory: [],
    profile: {
      ...INITIAL_STATE.profile,
      momentum: initialMomentum
    }
  });

  describe('1-Day Gap Processing', () => {
    it('applies exactly 1 day penalty for a missed daily habit over 1 day', () => {
      const habit = createBaseQuest();
      const state = createTestState([habit], 100);

      const result = processMultiDayPenalties(state, '2026-08-20', '2026-08-21');

      expect(result.daysProcessed).toBe(1);
      expect(result.updatedHistory.length).toBe(1);
      expect(result.updatedHistory[0].xp).toBe(-50);
      expect(result.updatedHistory[0].timestamp).toContain('2026-08-20');
      expect(result.updatedMomentum).toBe(90); // 100 - 10
      expect(result.recoveryModeActivated).toBe(true);

      const recoveryQuest = result.updatedQuests.find(q => q.type === 'Recovery');
      expect(recoveryQuest).toBeDefined();
      expect(recoveryQuest?.name).toContain('Resolve "Morning Fajr in Congregation"');
    });

    it('marks a one-off quest due on oldDate as Failed with 1 penalty', () => {
      const oneOff = createBaseQuest({
        id: 'oneoff-1',
        name: 'Submit report',
        type: 'Main',
        recurrence: 'None',
        deadline: '2026-08-20',
        difficulty: 'Hard'
      });
      const state = createTestState([oneOff], 100);

      const result = processMultiDayPenalties(state, '2026-08-20', '2026-08-21');

      expect(result.daysProcessed).toBe(1);
      const failedQuest = result.updatedQuests.find(q => q.id === 'oneoff-1');
      expect(failedQuest?.status).toBe('Failed');
      expect(failedQuest?.completedAt).toContain('2026-08-20');
      // Main + Hard -> isCritical (100 * 1.5 = 150 penalty, 25 momentum loss)
      expect(result.updatedHistory.length).toBe(1);
      expect(result.updatedHistory[0].xp).toBe(-150);
      expect(result.updatedMomentum).toBe(75);
    });
  });

  describe('3-Day Gap Processing', () => {
    it('applies penalties for each of the 3 missed days and avoids recovery quest spam', () => {
      const habit = createBaseQuest();
      const state = createTestState([habit], 100);

      // App closed from 2026-08-20 to 2026-08-23 (3 missed days: Aug 20, 21, 22)
      const result = processMultiDayPenalties(state, '2026-08-20', '2026-08-23');

      expect(result.daysProcessed).toBe(3);
      // History should have 3 distinct penalty entries
      expect(result.updatedHistory.length).toBe(3);

      const timestamps = result.updatedHistory.map(h => h.timestamp.split('T')[0]);
      expect(timestamps).toContain('2026-08-20');
      expect(timestamps).toContain('2026-08-21');
      expect(timestamps).toContain('2026-08-22');

      // Total XP deducted: 3 days * -50 XP = -150 XP
      const totalPenaltyXp = result.updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      expect(totalPenaltyXp).toBe(-150);

      // Total momentum loss: 100 - (3 * 10) = 70
      expect(result.updatedMomentum).toBe(70);

      // Recovery quests: exactly 1 active recovery directive created, no duplicates
      const recoveryQuests = result.updatedQuests.filter(q => q.type === 'Recovery');
      expect(recoveryQuests.length).toBe(1);
    });

    it('penalizes a one-off quest only once on its lapsed deadline during a 3-day gap', () => {
      const oneOffDay2 = createBaseQuest({
        id: 'oneoff-due-aug21',
        name: 'Urgent Filing',
        type: 'Main',
        recurrence: 'None',
        deadline: '2026-08-21',
        difficulty: 'Normal'
      });
      const state = createTestState([oneOffDay2], 100);

      // Gap: Aug 20 -> Aug 23. Due on Aug 21.
      const result = processMultiDayPenalties(state, '2026-08-20', '2026-08-23');

      expect(result.daysProcessed).toBe(3);
      // It should only fail once, on Aug 21
      expect(result.updatedHistory.length).toBe(1);
      expect(result.updatedHistory[0].timestamp).toContain('2026-08-21');

      const failedQuest = result.updatedQuests.find(q => q.id === 'oneoff-due-aug21');
      expect(failedQuest?.status).toBe('Failed');
      expect(failedQuest?.completedAt).toContain('2026-08-21');
    });
  });

  describe('10-Day Gap Processing', () => {
    it('processes all 10 missed days sequentially with correct cumulative penalties', () => {
      const habit = createBaseQuest();
      const state = createTestState([habit], 100);

      // App closed from 2026-08-10 to 2026-08-20 (10 missed days)
      const result = processMultiDayPenalties(state, '2026-08-10', '2026-08-20');

      expect(result.daysProcessed).toBe(10);
      expect(result.updatedHistory.length).toBe(10);

      // 10 days * -50 XP = -500 XP
      const totalPenaltyXp = result.updatedHistory.reduce((sum, h) => sum + h.xp, 0);
      expect(totalPenaltyXp).toBe(-500);

      // Momentum: 100 - (10 * 10) = 0 (capped at 0)
      expect(result.updatedMomentum).toBe(0);

      // Only 1 recovery quest generated
      const recoveryQuests = result.updatedQuests.filter(q => q.type === 'Recovery');
      expect(recoveryQuests.length).toBe(1);
    });
  });

  describe('Capping & Boundary Safeguards', () => {
    it('strictly caps multi-day gap processing at 30 days to prevent runaway loops', () => {
      const habit = createBaseQuest();
      const state = createTestState([habit], 100);

      // 45 day gap: 2026-07-01 to 2026-08-15
      const result = processMultiDayPenalties(state, '2026-07-01', '2026-08-15');

      expect(result.daysProcessed).toBe(30);
      expect(result.updatedHistory.length).toBe(30);
    });

    it('is idempotent and produces zero changes when called with the same date', () => {
      const habit = createBaseQuest();
      const state = createTestState([habit], 100);

      const result = processMultiDayPenalties(state, '2026-08-20', '2026-08-20');

      expect(result.daysProcessed).toBe(0);
      expect(result.updatedHistory.length).toBe(0);
      expect(result.updatedMomentum).toBe(100);
      expect(result.recoveryModeActivated).toBe(false);
    });
  });
});
