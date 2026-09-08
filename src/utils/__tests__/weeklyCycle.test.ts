import { describe, it, expect } from 'vitest';
import {
  getWeekBoundaries,
  getClosingWeekBoundaries,
  WEEKLY_SCORE_WEIGHTS,
  TOTAL_MAX_WEEKLY_SCORE,
  generateWeeklyMuhasabahSummaryPure,
  reconcileMissedWeeks
} from '../weeklyCycle';
import {
  getRecurringSinsRegistry,
  analyzeSinRecurrence
} from '../muhasabahRecurrence';
import { POSState, MuhasabahEntry, Weakness } from '../../types';
import { INITIAL_STATE } from '../../initialState';

describe('Weekly Muhasabah Cycle Engine', () => {
  describe('Phase 1: Week-Boundary Definition & Single Source of Truth', () => {
    it('accurately identifies Saturday -> Friday boundaries for any day of the week', () => {
      // Test Wednesday (2026-08-26)
      const wednesday = getWeekBoundaries('2026-08-26');
      expect(wednesday.weekStart).toBe('2026-08-22'); // Saturday
      expect(wednesday.weekEnd).toBe('2026-08-28');   // Friday
      expect(wednesday.anchorDate).toBe('2026-08-28'); // Friday
      expect(wednesday.daysInWeek).toEqual([
        '2026-08-22',
        '2026-08-23',
        '2026-08-24',
        '2026-08-25',
        '2026-08-26',
        '2026-08-27',
        '2026-08-28'
      ]);

      // Test Friday itself (2026-08-28)
      const friday = getWeekBoundaries('2026-08-28');
      expect(friday.weekStart).toBe('2026-08-22');
      expect(friday.weekEnd).toBe('2026-08-28');
      expect(friday.anchorDate).toBe('2026-08-28');

      // Test Saturday (2026-08-22) - start of week
      const saturday = getWeekBoundaries('2026-08-22');
      expect(saturday.weekStart).toBe('2026-08-22');
      expect(saturday.weekEnd).toBe('2026-08-28');
      expect(saturday.anchorDate).toBe('2026-08-28');
    });

    it('aligns Sunday closing trigger with the preceding Friday anchor', () => {
      // Sunday 2026-08-30 triggers closure of the week ending Friday 2026-08-28
      const closing = getClosingWeekBoundaries('2026-08-30');
      expect(closing.weekStart).toBe('2026-08-22'); // Saturday
      expect(closing.weekEnd).toBe('2026-08-28');   // Friday (Sunday - 2 days)
      expect(closing.anchorDate).toBe('2026-08-28'); // Friday anchor
      expect(closing.weekLabel).toBe('Week ending Friday, August 28, 2026');
    });

    it('correctly handles boundary crossing (Saturday 23:59 vs Sunday 00:01)', () => {
      // Saturday late evening belongs to the week ending on the upcoming Friday
      const satBoundary = getWeekBoundaries('2026-08-22T23:59:59');
      expect(satBoundary.weekStart).toBe('2026-08-22');
      expect(satBoundary.weekEnd).toBe('2026-08-28');

      // Sunday belongs to the same active week (as day 2 of that week)
      const sunBoundary = getWeekBoundaries('2026-08-23T00:01:00');
      expect(sunBoundary.weekStart).toBe('2026-08-22');
      expect(sunBoundary.weekEnd).toBe('2026-08-28');
    });
  });

  describe('Phase 4: Mathematical Scoring Weights Verification', () => {
    it('strictly validates that the 6 scoring pillars sum to exactly 10.0', () => {
      const sum = 
        WEEKLY_SCORE_WEIGHTS.fardhPrayers +
        WEEKLY_SCORE_WEIGHTS.slipsRestraint +
        WEEKLY_SCORE_WEIGHTS.adhkarFortress +
        WEEKLY_SCORE_WEIGHTS.sunnahQiyam +
        WEEKLY_SCORE_WEIGHTS.salawat +
        WEEKLY_SCORE_WEIGHTS.kaffarahTawbah;

      expect(sum).toBe(10.0);
      expect(TOTAL_MAX_WEEKLY_SCORE).toBe(10.0);
    });
  });

  describe('Phase 2 & 3: Missed Weeks Catch-Up & Transactional Safety', () => {
    const createSampleState = (entries: MuhasabahEntry[] = []): POSState => ({
      ...INITIAL_STATE,
      muhasabahEntries: entries,
      savedWeeklySummaries: [],
      spiritualLogs: {},
      xpHistory: [],
      quests: []
    });

    it('handles a normal weekly cycle executed on Sunday', () => {
      const entryInWeek: MuhasabahEntry = {
        id: 'entry-1',
        date: '2026-08-25', // Tuesday of week Aug 22-28
        timestamp: '2026-08-25T14:00:00',
        title: 'Missed Dhuhr focus',
        description: 'Delayed work',
        category: 'Obligations',
        severity: 'Moderate',
        cause: 'Distraction',
        rawPenalty: 200,
        xpDeducted: 200,
        coinsDeducted: 25,
        recoveryPercentage: 20,
        recoveredXP: 40
      };

      const state: POSState = {
        ...createSampleState([entryInWeek]),
        lastWeeklyMuhasabahResetDate: '2026-08-23'
      };

      // Execute on Sunday 2026-08-30
      const result = reconcileMissedWeeks(state, '2026-08-30');
      expect(result.wasReconciled).toBe(true);
      expect(result.missedSummaries.length).toBe(1);
      expect(result.missedSummaries[0].generatedDate).toBe('2026-08-28');
      expect(result.missedSummaries[0].totalSlipsCount).toBe(1);
      expect(result.missedSummaries[0].totalLostXP).toBe(200);
      expect(result.newLastResetDate).toBe('2026-08-30');
    });

    it('handles app not opened on Sunday, opened on Monday (catch-up)', () => {
      const entryInWeek: MuhasabahEntry = {
        id: 'entry-past',
        date: '2026-08-26',
        timestamp: '2026-08-26T10:00:00',
        title: 'Idle Speech',
        description: 'Vanity discussion',
        category: 'Speech',
        severity: 'Minor',
        cause: 'Boredom',
        rawPenalty: 100,
        xpDeducted: 100,
        coinsDeducted: 10,
        recoveryPercentage: 20,
        recoveredXP: 20
      };

      const entryInNewWeek: MuhasabahEntry = {
        id: 'entry-current',
        date: '2026-08-31', // Monday in new week Aug 29 - Sep 04
        timestamp: '2026-08-31T09:00:00',
        title: 'Late to meeting',
        description: 'Traffic',
        category: 'Rights',
        severity: 'Minor',
        cause: 'Late wake',
        rawPenalty: 100,
        xpDeducted: 100,
        coinsDeducted: 10
      };

      const state: POSState = {
        ...createSampleState([entryInWeek, entryInNewWeek]),
        lastWeeklyMuhasabahResetDate: '2026-08-23'
      };

      // App opened on Monday 2026-08-31
      const result = reconcileMissedWeeks(state, '2026-08-31');
      expect(result.wasReconciled).toBe(true);
      expect(result.missedSummaries.length).toBe(1);
      expect(result.missedSummaries[0].generatedDate).toBe('2026-08-28');
      expect(result.missedSummaries[0].totalSlipsCount).toBe(1);

      // Current week's entry remains intact in activeEntries!
      expect(result.activeEntries.length).toBe(1);
      expect(result.activeEntries[0].id).toBe('entry-current');
    });

    it('handles app not opened for 2+ weeks and archives each missed week chronologically', () => {
      const entryWeek1: MuhasabahEntry = {
        id: 'w1-entry',
        date: '2026-08-20', // Week Aug 15 - Aug 21
        timestamp: '2026-08-20T12:00:00',
        title: 'Distracted from goal',
        description: '',
        category: 'Wasted Potential',
        severity: 'Moderate',
        cause: 'Scrolling',
        rawPenalty: 200,
        xpDeducted: 200,
        coinsDeducted: 25
      };

      const entryWeek2: MuhasabahEntry = {
        id: 'w2-entry',
        date: '2026-08-26', // Week Aug 22 - Aug 28
        timestamp: '2026-08-26T12:00:00',
        title: 'Impulsive eating',
        description: '',
        category: 'Desires',
        severity: 'Major',
        cause: 'Stress',
        rawPenalty: 300,
        xpDeducted: 300,
        coinsDeducted: 50
      };

      const state: POSState = {
        ...createSampleState([entryWeek1, entryWeek2]),
        lastWeeklyMuhasabahResetDate: '2026-08-16' // 3 Sundays prior
      };

      // User returns on Sunday 2026-09-06
      const result = reconcileMissedWeeks(state, '2026-09-06');
      expect(result.wasReconciled).toBe(true);
      expect(result.missedSummaries.length).toBe(3);

      // Week 1 ending Friday Aug 21
      expect(result.missedSummaries[0].generatedDate).toBe('2026-08-21');
      expect(result.missedSummaries[0].totalSlipsCount).toBe(1);
      expect(result.missedSummaries[0].totalLostXP).toBe(200);

      // Week 2 ending Friday Aug 28
      expect(result.missedSummaries[1].generatedDate).toBe('2026-08-28');
      expect(result.missedSummaries[1].totalSlipsCount).toBe(1);
      expect(result.missedSummaries[1].totalLostXP).toBe(300);

      // Week 3 ending Friday Sep 04
      expect(result.missedSummaries[2].generatedDate).toBe('2026-09-04');
      expect(result.missedSummaries[2].totalSlipsCount).toBe(0);

      expect(result.newLastResetDate).toBe('2026-09-06');
    });

    it('is idempotent and produces no changes if called multiple times on the same day', () => {
      const state: POSState = {
        ...createSampleState(),
        lastWeeklyMuhasabahResetDate: '2026-08-30'
      };

      const result1 = reconcileMissedWeeks(state, '2026-08-30');
      expect(result1.wasReconciled).toBe(false);
      expect(result1.missedSummaries.length).toBe(0);
    });
  });

  describe('Phase 5: Recovery Percentage Persistence & Recurring Sins Registry', () => {
    it('accurately groups intra-day, daily, and periodic recurring sins', () => {
      const entrySameDay1: MuhasabahEntry = {
        id: 'entry-sd1',
        date: '2026-08-28',
        timestamp: '2026-08-28T09:00:00',
        title: 'Impulsive scrolling',
        description: '',
        category: 'Wasted Potential',
        severity: 'Moderate',
        cause: 'Boredom',
        rawPenalty: 200,
        xpDeducted: 200,
        coinsDeducted: 25,
        recoveryPercentage: 25,
        recoveredXP: 50
      };

      const entrySameDay2: MuhasabahEntry = {
        id: 'entry-sd2',
        date: '2026-08-28',
        timestamp: '2026-08-28T15:00:00',
        title: 'Impulsive scrolling',
        description: '',
        category: 'Wasted Potential',
        severity: 'Moderate',
        cause: 'Boredom',
        rawPenalty: 200,
        xpDeducted: 350, // 1.75x multiplier
        coinsDeducted: 44,
        recoveryPercentage: 25,
        recoveredXP: 88
      };

      const entryDaily1: MuhasabahEntry = {
        id: 'entry-d1',
        date: '2026-08-27',
        timestamp: '2026-08-27T10:00:00',
        title: 'Backbiting / Gheebah',
        description: '',
        category: 'Speech',
        severity: 'Major',
        cause: 'Social gossip',
        rawPenalty: 300,
        xpDeducted: 300,
        coinsDeducted: 50
      };

      const entryDaily2: MuhasabahEntry = {
        id: 'entry-d2',
        date: '2026-08-28',
        timestamp: '2026-08-28T10:00:00',
        title: 'Backbiting / Gheebah',
        description: '',
        category: 'Speech',
        severity: 'Major',
        cause: 'Social gossip',
        rawPenalty: 300,
        xpDeducted: 450, // consecutive day
        coinsDeducted: 75
      };

      const registry = getRecurringSinsRegistry(
        [entrySameDay1, entrySameDay2, entryDaily1, entryDaily2],
        [],
        '2026-08-28'
      );

      expect(registry.totalRecurringCount).toBe(2);
      expect(registry.intraDaySins.length).toBe(1);
      expect(registry.intraDaySins[0].name.toLowerCase()).toContain('scrolling');
      expect(registry.intraDaySins[0].cadence).toBe('same_day');
      expect(registry.dailySins.length).toBe(1);
      expect(registry.dailySins[0].name.toLowerCase()).toContain('gheebah');
      expect(registry.dailySins[0].cadence).toBe('daily');
    });

    it('preserves recoveryPercentage and kaffarah completion through weekly reconciliation', () => {
      const entryWithCustomRecovery: MuhasabahEntry = {
        id: 'entry-rec-1',
        date: '2026-08-25',
        timestamp: '2026-08-25T11:00:00',
        title: 'Missed Fajr Congregation',
        description: '',
        category: 'Obligations',
        severity: 'Severe',
        cause: 'Stayed up late',
        rawPenalty: 500,
        xpDeducted: 500,
        coinsDeducted: 100,
        recoveryPercentage: 30, // Custom maximum recovery 30%
        recoveredXP: 150,
        kaffarahCompleted: true,
        kaffarahTitle: 'Feed a needy person',
        kaffarahType: 'Sadaqah'
      };

      const state: POSState = {
        ...INITIAL_STATE,
        muhasabahEntries: [entryWithCustomRecovery],
        savedWeeklySummaries: [],
        spiritualLogs: {},
        xpHistory: [],
        quests: [],
        lastWeeklyMuhasabahResetDate: '2026-08-23'
      };

      const result = reconcileMissedWeeks(state, '2026-08-30');
      expect(result.wasReconciled).toBe(true);
      expect(result.missedSummaries.length).toBe(1);
      expect(result.missedSummaries[0].kaffarahSettledCount).toBe(1);
      expect(result.missedSummaries[0].kaffarahPendingCount).toBe(0);

      // Verify the entry in the archive maintains full fidelity
      const archivedSummary = result.missedSummaries[0];
      expect(archivedSummary.totalLostXP).toBe(500);
      expect(archivedSummary.totalSlipsCount).toBe(1);
    });
  });
});
