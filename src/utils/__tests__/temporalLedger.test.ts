import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DAILY_WAKING_BUDGET_MINUTES,
  REST_DECISION_THRESHOLDS,
  buildQuestMintKey,
  isQuestAlreadyMinted,
  calculateQuestRestDividend,
  calculateFocusRestMint,
  calculateRitualRestMint,
  redeemRestPassAtomic,
  calculateEarlyFinishRefund,
  createRefundTransaction,
  calculateDailyWakingCapital,
  calculateTemporalAccounting,
  calculateTemporalFeasibility,
  calculateDailyRestState,
  calculateEstimationCalibration,
  calculateTemporalForecast,
  evaluateTodayRestDecision,
  DEFAULT_REST_PASSES
} from '../temporalLedger';
import { LeisureTransaction, RestPass } from '../../types';

describe('Temporal Ledger & Rest Engine (Core Money-Math)', () => {

  describe('1. Minting & Double-Mint Guard (Earn Side)', () => {
    it('generates predictable idempotent mint keys from questId and completedAt', () => {
      const key1 = buildQuestMintKey('quest-123', '2026-09-09T10:00:00.000Z');
      const key2 = buildQuestMintKey('quest-123', '2026-09-09T10:00:00.000Z');
      const key3 = buildQuestMintKey('quest-123', '2026-09-10T10:00:00.000Z');

      expect(key1).toBe('quest-123:2026-09-09T10:00:00.000Z');
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
    });

    it('prevents double-minting the same completed quest instance', () => {
      const history: LeisureTransaction[] = [
        {
          id: 'tx-1',
          type: 'quest_dividend',
          minutesDelta: 15,
          endingBalance: 75,
          reason: 'Quest dividend',
          linkedId: 'quest-boss-1:2026-09-09T08:00:00Z',
          timestamp: '2026-09-09T08:00:00Z',
          minutes: 15,
          balanceAfter: 75
        }
      ];

      // Exact match should be blocked
      expect(isQuestAlreadyMinted(history, 'quest-boss-1', '2026-09-09T08:00:00Z')).toBe(true);

      // Re-opened and completed at a different timestamp should be permitted (e.g. daily recurring)
      expect(isQuestAlreadyMinted(history, 'quest-boss-1', '2026-09-10T08:00:00Z')).toBe(false);

      // Different quest should be permitted
      expect(isQuestAlreadyMinted(history, 'quest-side-2', '2026-09-09T08:00:00Z')).toBe(false);

      // Empty history handles gracefully
      expect(isQuestAlreadyMinted([], 'quest-boss-1', '2026-09-09T08:00:00Z')).toBe(false);
      expect(isQuestAlreadyMinted(undefined, 'quest-boss-1', '2026-09-09T08:00:00Z')).toBe(false);
    });

    it('calculates focus rest mint based on 1:5 ratio (5m rest per 25m focus)', () => {
      expect(calculateFocusRestMint(25)).toBe(5);
      expect(calculateFocusRestMint(50)).toBe(10);
      expect(calculateFocusRestMint(10)).toBe(2);
      expect(calculateFocusRestMint(4)).toBe(1); // Min 1m
      expect(calculateFocusRestMint(0)).toBe(0);
      expect(calculateFocusRestMint(-10)).toBe(0);
    });

    it('calculates quest dividends scaled by difficulty', () => {
      expect(calculateQuestRestDividend({ difficulty: 'Boss' })).toBe(25);
      expect(calculateQuestRestDividend({ difficulty: 'Hard' })).toBe(15);
      expect(calculateQuestRestDividend({ difficulty: 'Easy' })).toBe(5);
      expect(calculateQuestRestDividend({ difficulty: 'Normal', estimatedTime: 60 })).toBe(12);
    });

    it('calculates ritual rest mint rewards', () => {
      expect(calculateRitualRestMint('adhkar_morning')).toBe(10);
      expect(calculateRitualRestMint('qiyam')).toBe(20);
      expect(calculateRitualRestMint('fardh_all')).toBe(15);
      expect(calculateRitualRestMint('other')).toBe(5);
    });
  });

  describe('2. Atomic Redemption (Spend Side)', () => {
    const samplePass: RestPass = {
      id: 'pass-qaylulah',
      name: 'Sunnah Qaylulah (Power Nap)',
      durationMinutes: 25,
      costCoins: 25,
      costMinutes: 25
    };

    it('atomically deducts both coins and rest minutes when funds are sufficient', () => {
      const result = redeemRestPassAtomic({
        currentCoins: 100,
        currentLeisureBalance: 60,
        pass: samplePass,
        timestamp: '2026-09-09T14:00:00Z'
      });

      expect(result.success).toBe(true);
      expect(result.newCoins).toBe(75);
      expect(result.newLeisureBalance).toBe(35);
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.type).toBe('leisure_redemption');
      expect(result.transaction?.minutesDelta).toBe(-25);
      expect(result.transaction?.endingBalance).toBe(35);
      expect(result.activeRestSession).toBeDefined();
      expect(result.activeRestSession?.totalMinutes).toBe(25);
      expect(result.activeRestSession?.remainingSeconds).toBe(25 * 60);
      expect(result.activeRestSession?.costMinutes).toBe(25);
    });

    it('rejects transaction and mutates nothing if coins are insufficient', () => {
      const result = redeemRestPassAtomic({
        currentCoins: 10, // Needs 25
        currentLeisureBalance: 60,
        pass: samplePass,
        timestamp: '2026-09-09T14:00:00Z'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient Coins');
      expect(result.newCoins).toBe(10);
      expect(result.newLeisureBalance).toBe(60);
      expect(result.transaction).toBeUndefined();
      expect(result.activeRestSession).toBeUndefined();
    });

    it('rejects transaction and mutates nothing if leisure minutes balance is insufficient', () => {
      const result = redeemRestPassAtomic({
        currentCoins: 100,
        currentLeisureBalance: 15, // Needs 25m
        pass: samplePass,
        timestamp: '2026-09-09T14:00:00Z'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient Rest Bank');
      expect(result.newCoins).toBe(100);
      expect(result.newLeisureBalance).toBe(15);
      expect(result.transaction).toBeUndefined();
    });

    it('guarantees balance cannot go negative through redemption', () => {
      const highCostPass: RestPass = {
        id: 'pass-huge',
        name: 'Huge Retreat',
        durationMinutes: 180,
        costCoins: 50,
        costMinutes: 120
      };

      const result = redeemRestPassAtomic({
        currentCoins: 100,
        currentLeisureBalance: 60,
        pass: highCostPass,
        timestamp: '2026-09-09T14:00:00Z'
      });

      expect(result.success).toBe(false);
      expect(result.newLeisureBalance).toBe(60);
    });
  });

  describe('3. Early-Finish Pro-Rata Refund', () => {
    it('calculates refund pro-rata by unspent time remaining', () => {
      const totalSeconds = 60 * 60; // 60 minutes
      const costMinutes = 60;

      // 50% remaining (30m)
      expect(calculateEarlyFinishRefund(30 * 60, totalSeconds, costMinutes)).toBe(30);

      // 75% remaining (45m)
      expect(calculateEarlyFinishRefund(45 * 60, totalSeconds, costMinutes)).toBe(45);

      // 10% remaining (6m)
      expect(calculateEarlyFinishRefund(6 * 60, totalSeconds, costMinutes)).toBe(6);

      // 0 seconds remaining -> 0m
      expect(calculateEarlyFinishRefund(0, totalSeconds, costMinutes)).toBe(0);

      // Negative or corrupted input
      expect(calculateEarlyFinishRefund(-100, totalSeconds, costMinutes)).toBe(0);
    });

    it('creates refund transaction with rest_refund type and correct ending balance', () => {
      const tx = createRefundTransaction({
        refundMinutes: 20,
        currentBalance: 35,
        passTitle: 'Sunnah Qaylulah',
        timestamp: '2026-09-09T14:15:00Z',
        sessionId: 'session-123'
      });

      expect(tx.type).toBe('rest_refund');
      expect(tx.minutesDelta).toBe(20);
      expect(tx.endingBalance).toBe(55);
      expect(tx.reason).toContain('+20m unspent rest refunded');
      expect(tx.linkedId).toBe('session-123');
    });
  });

  describe('4. Daily Waking Capital & Overdraft Alarm', () => {
    it('calculates healthy waking capital when within budget', () => {
      const result = calculateDailyWakingCapital({
        budgetMinutes: 960,
        investedMinutesToday: 120, // 2h logged
        committedMinutesToday: 300 // 5h active quests
      });

      expect(result.budgetMinutes).toBe(960);
      expect(result.investedMinutes).toBe(120);
      expect(result.committedMinutes).toBe(300);
      expect(result.slackMinutes).toBe(540); // 960 - 420
      expect(result.isOverdrawn).toBe(false);
      expect(result.overdraftMinutes).toBe(0);
      expect(result.utilizationPercent).toBe(44);
    });

    it('triggers overdraft alarm when committed > budget - invested-so-far', () => {
      const result = calculateDailyWakingCapital({
        budgetMinutes: 960,
        investedMinutesToday: 400,
        committedMinutesToday: 600 // 400 + 600 = 1000m > 960m
      });

      expect(result.isOverdrawn).toBe(true);
      expect(result.overdraftMinutes).toBe(40);
      expect(result.slackMinutes).toBe(0);
      expect(result.utilizationPercent).toBe(104);
    });

    it('handles zero or negative inputs gracefully', () => {
      const result = calculateDailyWakingCapital({
        budgetMinutes: 960,
        investedMinutesToday: 0,
        committedMinutesToday: 0
      });

      expect(result.isOverdrawn).toBe(false);
      expect(result.slackMinutes).toBe(960);
      expect(result.utilizationPercent).toBe(0);
    });
  });

  describe('5. Today Rest Decision Widget Thresholds', () => {
    it('evaluates deficit when spent exceeds minted today', () => {
      const res = evaluateTodayRestDecision(15, 45);
      expect(res.status).toBe('deficit');
      expect(res.headline).toBe('REST DEFICIT WARNING');
      expect(res.net).toBe(-30);
      expect(res.guidanceText).toContain('spending more rest than you earned');
    });

    it('evaluates balanced when no transactions today', () => {
      const res = evaluateTodayRestDecision(0, 0);
      expect(res.status).toBe('balanced');
      expect(res.headline).toBe('NEUTRAL INERTIA');
      expect(res.net).toBe(0);
      expect(res.guidanceText).toContain('No rest transactions recorded today');
    });

    it('evaluates funded when net rest is positive and below generous threshold', () => {
      const res = evaluateTodayRestDecision(35, 10);
      expect(res.status).toBe('funded');
      expect(res.headline).toBe('REST FULLY FUNDED');
      expect(res.net).toBe(25);
      expect(res.guidanceText).toContain('fully funded');
    });

    it('evaluates generous when net rest >= 50m', () => {
      const res = evaluateTodayRestDecision(75, 15);
      expect(res.status).toBe('generous');
      expect(res.headline).toBe('GENEROUS EQUITY');
      expect(res.net).toBe(60);
      expect(res.guidanceText).toContain('Generous recovery equity available');
    });
  });

  describe('6. Catalog Verification', () => {
    it('has standard rest passes configured', () => {
      expect(DEFAULT_REST_PASSES.length).toBeGreaterThanOrEqual(4);
      const qaylulah = DEFAULT_REST_PASSES.find(p => p.id === 'rest-qaylulah');
      expect(qaylulah).toBeDefined();
      expect(qaylulah?.durationMinutes).toBe(25);
      expect(qaylulah?.costMinutes).toBe(25);
      expect(qaylulah?.costCoins).toBe(25);
    });
  });

  describe('7. Temporal Solvency v2 & Operational States', () => {
    it('determines STABLE state when safely allocatable > 0', () => {
      // 960m budget, 180m used, 240m committed, 120m required = 540m allocated
      // Raw available = 420m, 10% buffer = 96m -> Safely allocatable = 324m
      const accounting = calculateTemporalAccounting({
        budgetMinutes: 960,
        investedMinutesToday: 180,
        committedMinutesToday: 240,
        requiredMinutesToday: 120,
        protectedBufferPercent: 10
      });

      expect(accounting.status).toBe('STABLE');
      expect(accounting.rawAvailableMinutes).toBe(420);
      expect(accounting.protectedBufferMinutes).toBe(96);
      expect(accounting.safelyAllocatableMinutes).toBe(324);
      expect(accounting.isOverdrawn).toBe(false);
    });

    it('determines TIGHT state when dipping into protected buffer but raw available >= 0', () => {
      // 960m budget, 400m used, 400m committed, 120m required = 920m allocated
      // Raw available = 40m, Buffer = 96m -> Safely allocatable = -56m (<= 0)
      const accounting = calculateTemporalAccounting({
        budgetMinutes: 960,
        investedMinutesToday: 400,
        committedMinutesToday: 400,
        requiredMinutesToday: 120,
        protectedBufferPercent: 10
      });

      expect(accounting.status).toBe('TIGHT');
      expect(accounting.rawAvailableMinutes).toBe(40);
      expect(accounting.safelyAllocatableMinutes).toBeLessThanOrEqual(0);
      expect(accounting.isOverdrawn).toBe(false);
    });

    it('determines OVERCOMMITTED state when raw available < 0 but total allocated within waking limits', () => {
      // 960m budget, 500m used, 350m committed, 120m required = 970m allocated
      // totalAllocated > 960 -> OVERDRAFT
      const overdraftAcc = calculateTemporalAccounting({
        budgetMinutes: 960,
        investedMinutesToday: 500,
        committedMinutesToday: 350,
        requiredMinutesToday: 120
      });
      expect(overdraftAcc.status).toBe('OVERDRAFT');
      expect(overdraftAcc.isOverdrawn).toBe(true);
      expect(overdraftAcc.overdraftMinutes).toBe(10);
    });
  });

  describe('8. Daily Rest Allowance vs Permanent Rest Bank', () => {
    it('tracks daily rest consumption independently from bank balance', () => {
      const history: LeisureTransaction[] = [
        {
          id: 'tx-1',
          type: 'leisure_redemption',
          minutesDelta: -45,
          reason: 'Redeemed Rest Pass: Reading (45m)',
          timestamp: '2026-09-13T10:00:00Z',
          minutes: -45,
          balanceAfter: 100,
          category: 'neutral_recovery'
        },
        {
          id: 'tx-2',
          type: 'rest_refund',
          minutesDelta: 25,
          reason: 'Early Rest Conclusion: +25m unspent',
          timestamp: '2026-09-13T10:20:00Z',
          minutes: 25,
          balanceAfter: 125,
          category: 'restorative'
        }
      ];

      const restState = calculateDailyRestState({
        dailyAllowanceMinutes: 120,
        history,
        todayDate: '2026-09-13'
      });

      // 45m redeemed, 25m refunded -> net 20m consumed today
      expect(restState.restConsumedToday).toBe(20);
      expect(restState.remainingAllowance).toBe(100);
    });

    it('enforces dual gate during atomic redemption (coins + rest bank + daily allowance)', () => {
      const pass: RestPass = {
        id: 'pass-game',
        name: 'Gaming Pass',
        durationMinutes: 60,
        costCoins: 50,
        costMinutes: 60,
        category: 'Recreation',
        restType: 'intentional_leisure'
      };

      // Fails when daily allowance is lower than pass cost
      const res = redeemRestPassAtomic({
        currentCoins: 100,
        currentLeisureBalance: 120,
        remainingDailyAllowance: 30, // Only 30m remaining today!
        pass,
        timestamp: '2026-09-13T12:00:00Z'
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Daily Rest Ceiling Reached');
      expect(res.newLeisureBalance).toBe(120);

      // Essential recovery passes bypass daily ceiling
      const essentialPass: RestPass = {
        ...pass,
        isEssentialRecovery: true
      };

      const resEssential = redeemRestPassAtomic({
        currentCoins: 100,
        currentLeisureBalance: 120,
        remainingDailyAllowance: 30,
        pass: essentialPass,
        timestamp: '2026-09-13T12:00:00Z'
      });

      expect(resEssential.success).toBe(true);
      expect(resEssential.newLeisureBalance).toBe(60);
    });
  });

  describe('9. Temporal Feasibility & Quest Cost Engine', () => {
    it('evaluates feasibility and produces warnings for over-commitments', () => {
      const feasible = calculateTemporalFeasibility({
        currentSafelyAllocatable: 90,
        currentRawAvailable: 186,
        questMinutes: 45,
        wakingCapitalMinutes: 960,
        totalAllocatedMinutes: 774
      });

      expect(feasible.feasible).toBe(true);
      expect(feasible.projectedStatus).toBe('STABLE');
      expect(feasible.conflictMinutes).toBe(0);

      const conflict = calculateTemporalFeasibility({
        currentSafelyAllocatable: 30,
        currentRawAvailable: 126,
        questMinutes: 90,
        wakingCapitalMinutes: 960,
        totalAllocatedMinutes: 834
      });

      expect(conflict.conflictMinutes).toBe(60);
      expect(conflict.projectedStatus).toBe('TIGHT');
      expect(conflict.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('10. Estimation Calibration & Temporal Forecast', () => {
    it('calculates personal calibration multiplier from completed quests', () => {
      const completed = [
        { estimatedTime: 30, actualMinutesWorked: 36, status: 'Completed' }, // +20%
        { estimatedTime: 50, actualMinutesWorked: 60, status: 'Completed' }, // +20%
        { estimatedTime: 20, actualMinutesWorked: 24, status: 'Completed' }  // +20%
      ];

      const cal = calculateEstimationCalibration(completed);
      expect(cal.completedCount).toBe(3);
      expect(cal.multiplier).toBe(1.2);
      expect(cal.variancePercent).toBe(20);
    });

    it('generates forward-looking temporal forecast', () => {
      const forecast = calculateTemporalForecast({
        remainingWakingMinutes: 600,
        committedMinutes: 180,
        requiredMinutes: 120,
        plannedRestMinutes: 60,
        protectedBufferMinutes: 96
      });

      // 600 - 180 - 120 - 60 - 96 = 144m
      expect(forecast.freeSafeMarginMinutes).toBe(144);
      expect(forecast.recommendationText).toContain('Generous solvency');
    });
  });
});
