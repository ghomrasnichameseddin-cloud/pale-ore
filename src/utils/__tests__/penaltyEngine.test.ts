import { describe, it, expect } from 'vitest';
import { processMultiDayPenalties, autoProcessMidnightUnmarkedPrayers, getQuestHpPenalty } from '../penaltyEngine';
import { POSState, Quest, SpiritualDailyLog } from '../../types';
import { INITIAL_STATE, createDefaultSpiritualLog } from '../../initialState';

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

  describe('Quest HP Penalty Calculations', () => {
    it('calculates proper HP penalties based on difficulty and criticality', () => {
      expect(getQuestHpPenalty({ difficulty: 'Easy', type: 'Side' })).toBe(0);
      expect(getQuestHpPenalty({ difficulty: 'Easy', type: 'Normal' })).toBe(3);
      expect(getQuestHpPenalty({ difficulty: 'Normal', type: 'Habit' })).toBe(5);
      expect(getQuestHpPenalty({ difficulty: 'Hard', type: 'Main' })).toBe(15); // 10 * 1.5
      expect(getQuestHpPenalty({ difficulty: 'Boss', type: 'Boss' })).toBe(30); // 20 * 1.5
    });
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
      expect(result.healthDelta).toBe(-5); // Normal habit = -5 HP loss

      const recoveryQuest = result.updatedQuests.find(q => q.type === 'Recovery');
      expect(recoveryQuest).toBeDefined();
      expect(recoveryQuest?.name).toContain('Resolve "Morning Fajr in Congregation"');
    });

    it('inherits the source quest skills and attributes in its recovery directive', () => {
      const skillId = 'skill-logic';
      const state = createTestState([createBaseQuest({
        id: 'oneoff-attribute-1',
        name: 'Solve logic problem',
        type: 'Main',
        recurrence: 'None',
        deadline: '2026-08-20',
        difficulty: 'Normal',
        relatedSkills: [skillId]
      })], 100);
      state.skills = [{
        id: skillId,
        name: 'Logic',
        description: 'Reasoning',
        type: 'primary',
        xp: 100,
        rank: 'F',
        primaryAttribute: 'Logic',
        secondaryAttribute: 'Focus',
        tags: ['logic'],
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z'
      }];

      const result = processMultiDayPenalties(state, '2026-08-20', '2026-08-21');
      const recoveryQuest = result.updatedQuests.find(q => q.type === 'Recovery');

      expect(recoveryQuest?.relatedSkills).toEqual([skillId]);
      expect(recoveryQuest?.skillRewards).toEqual([{ skillId, xp: 25 }]);
      expect(recoveryQuest?.attributeRewards).toEqual([
        { attribute: 'Knowledge', points: 1 },
        { attribute: 'Focus', points: 1 }
      ]);
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
      expect(result.healthDelta).toBe(-15); // Main + Hard = 10 * 1.5 = -15 HP
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

      // Total health lost: 3 days * -5 HP = -15 HP
      expect(result.healthDelta).toBe(-15);

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

  describe('Automatic Midnight Unmarked Prayer Penalties', () => {
    it('automatically applies -200 XP and -10 HP and spawns Qada quests for unperformed prayers after midnight', () => {
      const yesterday = '2026-08-19';
      const today = '2026-08-20';

      // User prayed Fajr and Dhuhr, but Asr, Maghrib, and Isha remained unmarked
      const yesterdayLog: SpiritualDailyLog = {
        ...createDefaultSpiritualLog(yesterday),
        fajr: { fardh: true, onTime: true, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: `${yesterday}T05:00:00.000Z` },
        dhuhr: { fardh: true, onTime: true, delayed: false, inMasjid: false, sunnahRawatib: false, completedAt: `${yesterday}T12:30:00.000Z` }
      };

      const state: POSState = {
        ...INITIAL_STATE,
        systemDate: today,
        quests: [],
        xpHistory: [],
        spiritualLogs: {
          [yesterday]: yesterdayLog
        }
      };

      const result = autoProcessMidnightUnmarkedPrayers(state, today);

      expect(result.daysProcessed).toBe(1);
      // 3 prayers unmarked (Asr, Maghrib, Isha) -> 3 penalty entries
      expect(result.updatedHistory.length).toBe(3);
      expect(result.updatedHistory.every(h => h.xp === -200)).toBe(true);
      expect(result.updatedHistory.every(h => h.source === 'penalty_midnight')).toBe(true);
      expect(result.healthDelta).toBe(-30); // 3 * -10 HP
      expect(result.recoveryModeActivated).toBe(true);

      // Check updated log
      const updatedLog = result.updatedSpiritualLogs?.[yesterday];
      expect(updatedLog?.asr?.missedPastMidnight).toBe(true);
      expect(updatedLog?.asr?.executionState).toBe('missed_midnight');
      expect(updatedLog?.maghrib?.missedPastMidnight).toBe(true);
      expect(updatedLog?.isha?.missedPastMidnight).toBe(true);
      // Performed prayers remain intact
      expect(updatedLog?.fajr?.fardh).toBe(true);
      expect(updatedLog?.fajr?.missedPastMidnight).toBeFalsy();

      // Qada' quests created with attached Sunnah prayer recovery action
      const qadaQuests = result.updatedQuests.filter(q => q.id.startsWith('q-qada-'));
      expect(qadaQuests.length).toBe(3);
      expect(qadaQuests.some(q => q.name.includes('Asr'))).toBe(true);
      expect(qadaQuests.some(q => q.name.includes('Maghrib'))).toBe(true);
      expect(qadaQuests.some(q => q.name.includes('Isha'))).toBe(true);
      expect(qadaQuests[0].recoveryAction).toBeDefined();
      expect(qadaQuests[0].recoveryActionOptions).toHaveLength(3);
    });

    it('multi-day penalty with autoTrackUnmarkedPrayers automatically penalizes unmarked prayers across missed days', () => {
      const state = createTestState([], 100);
      const result = processMultiDayPenalties(state, '2026-08-19', '2026-08-20', { autoTrackUnmarkedPrayers: true });

      expect(result.daysProcessed).toBe(1);
      // All 5 prayers of 2026-08-19 remained unmarked -> 5 penalties
      expect(result.updatedHistory.length).toBe(5);
      expect(result.updatedHistory.reduce((sum, h) => sum + h.xp, 0)).toBe(-1000); // 5 * -200 XP
      expect(result.healthDelta).toBe(-50); // 5 * -10 HP
      expect(result.recoveryModeActivated).toBe(true);

      const qadaQuests = result.updatedQuests.filter(q => q.id.startsWith('q-qada-'));
      expect(qadaQuests.length).toBe(5);
    });
  });
});
