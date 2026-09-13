import {
  LeisureTransaction,
  LeisureTransactionType,
  RestPass,
  DailyWakingCapital,
  ActiveRestSession,
  AppUsageLimit,
  AppUsageLogEntry,
  TemporalStatus,
  TemporalAccounting,
  TemporalFeasibilityResult,
  TemporalForecast,
  RestCategory
} from '../types';
import { addDays } from './dateUtils';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * TEMPORAL CONTROL SYSTEM v2 (Ra's al-Māl / Sacred Time Capital & Solvency)
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * CORE RULES & ARCHITECTURAL INVARIANTS:
 * 1. Solvency Over Occupancy: Treat waking time as finite non-renewable capital.
 * 2. Balance Invariant: Leisure bank balance represents earned rest equity
 *    and CANNOT go negative during redemptions.
 * 3. Daily Allowance Separation: Permanent Rest Bank ≠ Daily Rest Allowance.
 *    Rest Bank never expires. Daily Rest Allowance regulates daily consumption.
 * 4. Early-Finish Refund Invariant:
 *    When a pass finishes early, unspent rest returns to the Rest Bank (+25m),
 *    while Daily Rest Consumed is only actual elapsed time (20m).
 * 5. Temporal Accounting:
 *    Waking Capital - Used - Committed - Required = Raw Available.
 *    Raw Available - Protected Buffer = Safely Allocatable.
 * 6. Four Operational States:
 *    - STABLE: Safely Allocatable > 0
 *    - TIGHT: Safely Allocatable <= 0 and Raw Available >= 0
 *    - OVERCOMMITTED: Raw Available < 0 but <= Waking Capital
 *    - OVERDRAFT: Used + Committed + Required > Waking Capital
 * ═════════════════════════════════════════════════════════════════════════════
 */

export const DEFAULT_DAILY_WAKING_BUDGET_MINUTES = 960; // 16 waking hours (16 * 60)
export const DEFAULT_PROTECTED_BUFFER_PERCENT = 10;     // 10% protected safety margin
export const DEFAULT_REQUIRED_MINUTES_BASELINE = 120;   // 2h baseline for fardh, prayer transitions, hygiene
export const DEFAULT_DAILY_REST_ALLOWANCE_MINUTES = 120;// 2h standard daily rest ceiling

export const REST_ALLOWANCE_PRESETS = {
  low: 60,       // Strict focus / sprint day (1 hour)
  normal: 120,   // Balanced operational day (2 hours)
  recovery: 180  // Deep restoration / post-boss rest day (3 hours)
} as const;

export const REST_DECISION_THRESHOLDS = {
  DEFICIT: 0,
  BALANCED: 0,
  FUNDED: 25,
  GENEROUS: 50
} as const;

/**
 * Generates an idempotent mint key for a completed quest.
 */
export function buildQuestMintKey(questId: string, completedAt: string): string {
  return `${questId}:${completedAt}`;
}

/**
 * Checks if a quest completion has already minted leisure credits.
 */
export function isQuestAlreadyMinted(
  history: LeisureTransaction[] | undefined,
  questId: string,
  completedAt: string
): boolean {
  if (!history || !completedAt) return false;
  const key = buildQuestMintKey(questId, completedAt);
  return history.some(tx => tx.linkedId === key || tx.relatedId === key);
}

/**
 * Calculates rest dividend for a completed quest based on difficulty and estimated duration.
 */
export function calculateQuestRestDividend(quest: {
  difficulty?: string;
  estimatedTime?: number;
  xp?: number;
}): number {
  const diff = (quest.difficulty || 'Normal').toLowerCase();
  if (diff === 'boss') return 25;
  if (diff === 'hard') return 15;
  if (diff === 'easy') return 5;
  // Normal / Custom: 10m baseline or 20% of estimated duration
  return Math.max(5, Math.min(30, Math.round((quest.estimatedTime || 25) * 0.2)));
}

export interface QuestLaborMintParams {
  quest: {
    id: string;
    name: string;
    difficulty?: string;
    estimatedTime?: number;
    actualMinutesWorked?: number;
    recurrence?: string;
    type?: string;
  };
  timeHistory?: LeisureTransaction[];
}

export interface QuestLaborMintResult {
  baseDividend: number;
  laborMinutes: number;
  laborRestMint: number;
  alreadyMintedPomodoroRest: number;
  incrementalTimeRest: number;
  totalMinted: number;
  reason: string;
}

/**
 * Calculates rest minted upon quest completion, integrating actual elapsed work time.
 * Reconciles against prior focus_mint transactions linked to this quest to prevent double-counting.
 */
export function calculateQuestMintingWithLabor(params: QuestLaborMintParams): QuestLaborMintResult {
  const { quest, timeHistory = [] } = params;
  const isRecurringOrHabit = (quest.recurrence && quest.recurrence !== 'None') || quest.type === 'Habit';
  const baseDividend = isRecurringOrHabit ? 4 : calculateQuestRestDividend(quest);
  
  const laborMinutes = Math.max(0, Math.round(quest.actualMinutesWorked || 0));
  // 5 minutes of rest per 25 minutes of actual labor (20% conversion)
  const laborRestMint = Math.floor(laborMinutes / 5);

  // Sum any focus_mint transactions already minted for this specific quest
  const alreadyMintedPomodoroRest = timeHistory
    .filter(tx => (tx.relatedId === quest.id || tx.linkedId === quest.id) && tx.type === 'focus_mint')
    .reduce((sum, tx) => sum + (tx.minutesDelta ?? tx.minutes ?? 0), 0);

  // High-water mark reconciliation: only mint unminted incremental minutes
  const incrementalTimeRest = Math.max(0, laborRestMint - alreadyMintedPomodoroRest);
  const totalMinted = baseDividend + incrementalTimeRest;

  let reason = `Quest Dividend: "${quest.name}" (${quest.difficulty || 'Normal'}: +${baseDividend}m)`;
  if (laborMinutes > 0) {
    if (incrementalTimeRest > 0) {
      if (alreadyMintedPomodoroRest > 0) {
        reason += ` + Elapsed Time (+${incrementalTimeRest}m unminted work, superseding ${alreadyMintedPomodoroRest}m prior Pomodoro mints of ${laborMinutes}m total)`;
      } else {
        reason += ` + Elapsed Time (+${incrementalTimeRest}m for ${laborMinutes}m deep work)`;
      }
    } else if (alreadyMintedPomodoroRest > 0) {
      reason += ` (${laborMinutes}m work fully credited via ${alreadyMintedPomodoroRest}m prior Pomodoro mints)`;
    }
  }

  return {
    baseDividend,
    laborMinutes,
    laborRestMint,
    alreadyMintedPomodoroRest,
    incrementalTimeRest,
    totalMinted,
    reason
  };
}

/**
 * Calculates rest minted from a deep work focus session (5m rest per 25m focus).
 */
export function calculateFocusRestMint(focusMinutes: number): number {
  if (focusMinutes <= 0) return 0;
  return Math.max(1, Math.round(focusMinutes / 5));
}

/**
 * Calculates rest minted from sacred spiritual routines.
 */
export function calculateRitualRestMint(ritualType: string): number {
  switch (ritualType) {
    case 'adhkar_morning':
    case 'adhkar_evening':
      return 10;
    case 'qiyam':
      return 20;
    case 'fardh_all':
      return 15;
    default:
      return 5;
  }
}

export interface AtomicRedeemResult {
  success: boolean;
  error?: string;
  newCoins: number;
  newLeisureBalance: number;
  transaction?: LeisureTransaction;
  activeRestSession?: ActiveRestSession;
}

/**
 * Atomically validates and deducts both coins and leisure minutes for a rest pass.
 * Validates against Rest Bank balance, Daily Rest Allowance, and app usage blockers.
 */
export function redeemRestPassAtomic(params: {
  currentCoins: number;
  currentLeisureBalance: number;
  remainingDailyAllowance?: number;
  pass: RestPass;
  timestamp: string;
  blockedByAppUsage?: { isBlocked: boolean; appName?: string; overdraftMinutes?: number };
  isBypassAllowance?: boolean;
}): AtomicRedeemResult {
  const { 
    currentCoins, 
    currentLeisureBalance, 
    remainingDailyAllowance, 
    pass, 
    timestamp, 
    blockedByAppUsage,
    isBypassAllowance = false
  } = params;

  if (blockedByAppUsage?.isBlocked) {
    return {
      success: false,
      error: `Rest Pass Blocked: Daily limit for "${blockedByAppUsage.appName}" is exceeded by ${blockedByAppUsage.overdraftMinutes}m. Consequence rule enforces pass lock until reset or balanced.`,
      newCoins: currentCoins,
      newLeisureBalance: currentLeisureBalance
    };
  }

  if (currentCoins < pass.costCoins) {
    return {
      success: false,
      error: `Insufficient Coins: Requires ${pass.costCoins} coins, but you have ${currentCoins}.`,
      newCoins: currentCoins,
      newLeisureBalance: currentLeisureBalance
    };
  }

  if (currentLeisureBalance < pass.costMinutes) {
    return {
      success: false,
      error: `Insufficient Rest Bank: Requires ${pass.costMinutes}m leisure credits in your permanent bank, but you have ${currentLeisureBalance}m.`,
      newCoins: currentCoins,
      newLeisureBalance: currentLeisureBalance
    };
  }

  // Daily Allowance Gate (unless bypassed or marked as essential recovery)
  if (
    remainingDailyAllowance !== undefined && 
    !isBypassAllowance && 
    !pass.isEssentialRecovery &&
    remainingDailyAllowance < pass.costMinutes
  ) {
    return {
      success: false,
      error: `Daily Rest Ceiling Reached: You have ${remainingDailyAllowance}m remaining in today's rest allowance. Redeeming this ${pass.costMinutes}m pass would exceed your daily rest ceiling. Switch to low-dopamine restorative rest or adjust daily allowance.`,
      newCoins: currentCoins,
      newLeisureBalance: currentLeisureBalance
    };
  }

  const newCoins = currentCoins - pass.costCoins;
  const newLeisureBalance = currentLeisureBalance - pass.costMinutes;

  const txId = `time-tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const tx: LeisureTransaction = {
    id: txId,
    type: 'leisure_redemption',
    minutesDelta: -pass.costMinutes,
    endingBalance: newLeisureBalance,
    reason: `Redeemed Rest Pass: "${pass.name}" (${pass.durationMinutes}m)`,
    linkedId: pass.id,
    timestamp,
    minutes: -pass.costMinutes,
    balanceAfter: newLeisureBalance,
    relatedId: pass.id,
    category: pass.restType || 'intentional_leisure'
  };

  const activeRestSession: ActiveRestSession = {
    id: `rest-sess-${Date.now()}`,
    title: pass.name,
    totalMinutes: pass.durationMinutes,
    remainingSeconds: pass.durationMinutes * 60,
    startedAt: timestamp,
    paused: false,
    costMinutes: pass.costMinutes,
    passId: pass.id,
    restType: pass.restType || 'intentional_leisure'
  };

  return {
    success: true,
    newCoins,
    newLeisureBalance,
    transaction: tx,
    activeRestSession
  };
}

/**
 * Calculates the early-finish refund in rest minutes:
 * Formula: pro-rata by time remaining (remainingSeconds / totalSeconds) * costMinutes.
 */
export function calculateEarlyFinishRefund(
  remainingSeconds: number,
  totalSeconds: number,
  costMinutes: number
): number {
  if (totalSeconds <= 0 || remainingSeconds <= 0 || costMinutes <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, remainingSeconds / totalSeconds));
  return Math.floor(ratio * costMinutes);
}

/**
 * Creates a refund transaction for early rest finish.
 */
export function createRefundTransaction(params: {
  refundMinutes: number;
  currentBalance: number;
  passTitle: string;
  timestamp: string;
  sessionId: string;
}): LeisureTransaction {
  const endingBalance = params.currentBalance + params.refundMinutes;
  const txId = `time-refund-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: txId,
    type: 'rest_refund',
    minutesDelta: params.refundMinutes,
    endingBalance,
    reason: `Early Rest Conclusion: +${params.refundMinutes}m unspent rest refunded from "${params.passTitle}"`,
    linkedId: params.sessionId,
    timestamp: params.timestamp,
    minutes: params.refundMinutes,
    balanceAfter: endingBalance,
    relatedId: params.sessionId,
    category: 'restorative'
  };
}

/**
 * Computes complete Temporal Accounting v2 with four distinct solvency states:
 * STABLE, TIGHT, OVERCOMMITTED, OVERDRAFT.
 */
export function calculateTemporalAccounting(params: {
  budgetMinutes?: number;
  investedMinutesToday: number;
  committedMinutesToday: number;
  requiredMinutesToday?: number;
  protectedBufferPercent?: number;
  appUsageLogs?: AppUsageLogEntry[];
  appUsageLimits?: AppUsageLimit[];
  todayDate?: string;
}): TemporalAccounting {
  const wakingCapitalMinutes = params.budgetMinutes ?? DEFAULT_DAILY_WAKING_BUDGET_MINUTES;
  const usedMinutes = Math.max(0, params.investedMinutesToday);
  const committedMinutes = Math.max(0, params.committedMinutesToday);
  const requiredMinutes = Math.max(0, params.requiredMinutesToday ?? 0);
  
  const protectedBufferPercent = params.protectedBufferPercent ?? DEFAULT_PROTECTED_BUFFER_PERCENT;
  const protectedBufferMinutes = Math.round(wakingCapitalMinutes * (protectedBufferPercent / 100));

  const totalAllocated = usedMinutes + committedMinutes + requiredMinutes;
  const rawAvailableMinutes = wakingCapitalMinutes - totalAllocated;
  const safelyAllocatableMinutes = rawAvailableMinutes - protectedBufferMinutes;

  const isOverdrawn = totalAllocated > wakingCapitalMinutes;
  const overdraftMinutes = Math.max(0, totalAllocated - wakingCapitalMinutes);
  const utilizationPercent = wakingCapitalMinutes > 0 
    ? Math.min(200, Math.round((totalAllocated / wakingCapitalMinutes) * 100)) 
    : 100;

  // Determine Temporal Status
  let status: TemporalStatus;
  if (isOverdrawn) {
    status = 'OVERDRAFT';
  } else if (rawAvailableMinutes < 0) {
    status = 'OVERCOMMITTED';
  } else if (safelyAllocatableMinutes <= 0) {
    status = 'TIGHT';
  } else {
    status = 'STABLE';
  }

  // Calculate Digital Temporal Leakage
  let temporalLeakageMinutes = 0;
  if (params.appUsageLogs && params.appUsageLimits && params.todayDate) {
    const todayLogs = params.appUsageLogs.filter(l => l.date === params.todayDate);
    for (const limit of params.appUsageLimits) {
      const usageForLimit = todayLogs
        .filter(l => l.limitId === limit.id)
        .reduce((sum, l) => sum + (l.minutesUsed || 0), 0);
      if (usageForLimit > limit.dailyLimitMinutes) {
        temporalLeakageMinutes += (usageForLimit - limit.dailyLimitMinutes);
      }
    }
  }

  const temporalEfficiencyPercent = wakingCapitalMinutes > 0
    ? Math.max(0, Math.min(100, Math.round(((wakingCapitalMinutes - temporalLeakageMinutes) / wakingCapitalMinutes) * 100)))
    : 100;

  return {
    wakingCapitalMinutes,
    usedMinutes,
    committedMinutes,
    requiredMinutes,
    protectedBufferMinutes,
    protectedBufferPercent,
    rawAvailableMinutes,
    safelyAllocatableMinutes,
    status,
    isOverdrawn,
    overdraftMinutes,
    utilizationPercent,
    temporalLeakageMinutes,
    temporalEfficiencyPercent
  };
}

/**
 * Backwards-compatible calculation for Daily Waking Capital.
 */
export function calculateDailyWakingCapital(params: {
  budgetMinutes?: number;
  investedMinutesToday: number;
  committedMinutesToday: number;
  requiredMinutesToday?: number;
  protectedBufferPercent?: number;
}): DailyWakingCapital {
  const budget = params.budgetMinutes ?? DEFAULT_DAILY_WAKING_BUDGET_MINUTES;
  const invested = Math.max(0, params.investedMinutesToday);
  const committed = Math.max(0, params.committedMinutesToday);
  const required = Math.max(0, params.requiredMinutesToday ?? 0);
  const protectedBufferPercent = params.protectedBufferPercent ?? 0;
  const protectedBufferMinutes = Math.round(budget * (protectedBufferPercent / 100));

  const totalAllocated = invested + committed + required;
  const remainingBudgetAfterInvested = Math.max(0, budget - invested);
  const isOverdrawn = committed + required > remainingBudgetAfterInvested;
  const overdraftMinutes = Math.max(0, totalAllocated - budget);
  const slackMinutes = Math.max(0, budget - totalAllocated);
  const safelyAllocatableMinutes = slackMinutes - protectedBufferMinutes;
  const utilizationPercent = budget > 0 ? Math.min(200, Math.round((totalAllocated / budget) * 100)) : 100;

  let status: TemporalStatus = 'STABLE';
  if (isOverdrawn) status = 'OVERDRAFT';
  else if (slackMinutes < 0) status = 'OVERCOMMITTED';
  else if (safelyAllocatableMinutes <= 0) status = 'TIGHT';

  return {
    budgetMinutes: budget,
    investedMinutes: invested,
    committedMinutes: committed,
    requiredMinutes: required,
    protectedBufferMinutes,
    safelyAllocatableMinutes,
    status,
    slackMinutes,
    isOverdrawn,
    overdraftMinutes,
    utilizationPercent
  };
}

/**
 * Calculates immediate temporal impact and feasibility of adding a new quest or commitment.
 */
export function calculateTemporalFeasibility(params: {
  currentSafelyAllocatable: number;
  currentRawAvailable: number;
  questMinutes: number;
  wakingCapitalMinutes: number;
  totalAllocatedMinutes: number;
}): TemporalFeasibilityResult {
  const { currentSafelyAllocatable, currentRawAvailable, questMinutes, wakingCapitalMinutes, totalAllocatedMinutes } = params;
  const newTotalAllocated = totalAllocatedMinutes + questMinutes;
  const projectedSafeCapacity = currentSafelyAllocatable - questMinutes;
  const projectedRawAvailable = currentRawAvailable - questMinutes;

  let projectedStatus: TemporalStatus;
  if (newTotalAllocated > wakingCapitalMinutes) {
    projectedStatus = 'OVERDRAFT';
  } else if (projectedRawAvailable < 0) {
    projectedStatus = 'OVERCOMMITTED';
  } else if (projectedSafeCapacity <= 0) {
    projectedStatus = 'TIGHT';
  } else {
    projectedStatus = 'STABLE';
  }

  const conflictMinutes = Math.max(0, questMinutes - Math.max(0, currentSafelyAllocatable));
  const feasible = projectedStatus === 'STABLE' || projectedStatus === 'TIGHT';

  const recommendations: string[] = [];
  if (conflictMinutes > 0) {
    recommendations.push(`Split this directive into 2 focused sub-directives (e.g. ${Math.round(questMinutes / 2)}m each).`);
    recommendations.push(`Postpone secondary non-essential quests to tomorrow.`);
    recommendations.push(`Reduce planned recreation by ${conflictMinutes}m to protect sleep.`);
  } else if (projectedStatus === 'TIGHT') {
    recommendations.push(`Feasible, but enters TIGHT status (dips into your protected buffer).`);
    recommendations.push(`Guard against task scope creep and log real elapsed time.`);
  } else {
    recommendations.push(`Safely allocatable within today's non-renewable capital.`);
  }

  return {
    feasible,
    currentSafeCapacity: currentSafelyAllocatable,
    newCommitment: questMinutes,
    projectedSafeCapacity,
    projectedStatus,
    conflictMinutes,
    recommendations
  };
}

/**
 * Calculates the operator's daily rest allowance consumption and categorizations.
 */
export function calculateDailyRestState(params: {
  dailyAllowanceMinutes?: number;
  history?: LeisureTransaction[];
  todayDate: string;
}): {
  dailyAllowanceMinutes: number;
  restConsumedToday: number;
  remainingAllowance: number;
  restorativeMinutes: number;
  leisureMinutes: number;
  neutralMinutes: number;
} {
  const dailyAllowanceMinutes = params.dailyAllowanceMinutes ?? DEFAULT_DAILY_REST_ALLOWANCE_MINUTES;
  const history = params.history || [];
  
  const todayTransactions = history.filter(tx => tx.timestamp && tx.timestamp.startsWith(params.todayDate));

  let restorativeMinutes = 0;
  let leisureMinutes = 0;
  let neutralMinutes = 0;
  let netRestElapsed = 0;

  for (const tx of todayTransactions) {
    if (tx.type === 'leisure_redemption' || tx.type === 'rest_allowance_consume') {
      const minutesSpent = Math.abs(tx.minutesDelta ?? tx.minutes ?? 0);
      netRestElapsed += minutesSpent;
      if (tx.category === 'restorative') restorativeMinutes += minutesSpent;
      else if (tx.category === 'neutral_recovery') neutralMinutes += minutesSpent;
      else leisureMinutes += minutesSpent;
    } else if (tx.type === 'rest_refund') {
      // Early finish refund subtracts from net rest consumed today!
      const refunded = Math.abs(tx.minutesDelta ?? tx.minutes ?? 0);
      netRestElapsed = Math.max(0, netRestElapsed - refunded);
      // Proportionally deduct from leisure
      leisureMinutes = Math.max(0, leisureMinutes - refunded);
    }
  }

  const remainingAllowance = Math.max(0, dailyAllowanceMinutes - netRestElapsed);

  return {
    dailyAllowanceMinutes,
    restConsumedToday: netRestElapsed,
    remainingAllowance,
    restorativeMinutes,
    leisureMinutes,
    neutralMinutes
  };
}

/**
 * Evaluates personal estimation calibration from completed quests.
 */
export function calculateEstimationCalibration(
  completedQuests: { estimatedTime?: number; actualMinutesWorked?: number; status?: string }[]
): {
  completedCount: number;
  avgEstimated: number;
  avgActual: number;
  variancePercent: number;
  multiplier: number;
} {
  const eligible = completedQuests.filter(
    q => (q.status === 'Completed' || (q.actualMinutesWorked || 0) > 0) &&
         (q.estimatedTime || 0) > 0 &&
         (q.actualMinutesWorked || 0) > 0
  );

  if (eligible.length === 0) {
    return {
      completedCount: 0,
      avgEstimated: 30,
      avgActual: 30,
      variancePercent: 0,
      multiplier: 1.0
    };
  }

  const totalEst = eligible.reduce((sum, q) => sum + (q.estimatedTime || 0), 0);
  const totalAct = eligible.reduce((sum, q) => sum + (q.actualMinutesWorked || 0), 0);

  const avgEstimated = Math.round(totalEst / eligible.length);
  const avgActual = Math.round(totalAct / eligible.length);
  const multiplier = Number((totalAct / totalEst).toFixed(2));
  const variancePercent = Math.round(((totalAct - totalEst) / totalEst) * 100);

  return {
    completedCount: eligible.length,
    avgEstimated,
    avgActual,
    variancePercent,
    multiplier
  };
}

/**
 * Generates forward-looking temporal forecast guidance.
 */
export function calculateTemporalForecast(params: {
  remainingWakingMinutes: number;
  committedMinutes: number;
  requiredMinutes: number;
  plannedRestMinutes: number;
  protectedBufferMinutes: number;
}): TemporalForecast {
  const { remainingWakingMinutes, committedMinutes, requiredMinutes, plannedRestMinutes, protectedBufferMinutes } = params;
  const freeSafeMarginMinutes = remainingWakingMinutes - committedMinutes - requiredMinutes - plannedRestMinutes - protectedBufferMinutes;

  let recommendationText: string;
  if (freeSafeMarginMinutes > 120) {
    recommendationText = `Generous solvency: You can safely accept approximately ${Math.floor(freeSafeMarginMinutes / 60)}h ${freeSafeMarginMinutes % 60}m of additional work or strategic exploration today.`;
  } else if (freeSafeMarginMinutes > 30) {
    recommendationText = `Healthy solvency: You have a comfortable safe margin of ${freeSafeMarginMinutes}m. Protect planned recovery.`;
  } else if (freeSafeMarginMinutes >= 0) {
    recommendationText = `Tight solvency: You have ${freeSafeMarginMinutes}m margin left. Avoid accepting new high-friction commitments today.`;
  } else {
    recommendationText = `Temporal overextension: You are overbooked by ${Math.abs(freeSafeMarginMinutes)}m against your safe capacity. Cut or reschedule secondary quests.`;
  }

  return {
    remainingWakingMinutes,
    committedMinutes,
    requiredMinutes,
    plannedRestMinutes,
    protectedBufferMinutes,
    freeSafeMarginMinutes,
    recommendationText
  };
}

export interface MultiDayForecastDay {
  date: string;
  dayLabel: string;
  wakingCapitalMinutes: number;
  committedMinutes: number;
  safelyAllocatableMinutes: number;
  projectedStatus: TemporalStatus;
  recommendationText: string;
}

/**
 * Multi-day forward forecast (Today, Tomorrow, Day After) projecting solvency and overcommitment.
 */
export function calculateMultiDayForecast(params: {
  quests: { dueDate?: string; estimatedTime?: number; status?: string }[];
  wakingCapitalMinutes: number;
  requiredMinutesBaseline: number;
  protectedBufferPercent: number;
  startDate: string;
}): MultiDayForecastDay[] {
  const { quests, wakingCapitalMinutes, requiredMinutesBaseline, protectedBufferPercent, startDate } = params;
  const days: MultiDayForecastDay[] = [];
  const protectedBufferMinutes = Math.round(wakingCapitalMinutes * (protectedBufferPercent / 100));

  for (let i = 0; i < 3; i++) {
    const targetDate = addDays(startDate, i);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Day After';

    const dayQuests = quests.filter(q => q.dueDate === targetDate && q.status !== 'Completed');
    const committedMinutes = dayQuests.reduce((sum, q) => sum + (q.estimatedTime || 30), 0);
    const totalAllocated = committedMinutes + requiredMinutesBaseline;
    const rawAvailable = wakingCapitalMinutes - totalAllocated;
    const safelyAllocatable = Math.max(0, rawAvailable - protectedBufferMinutes);

    let projectedStatus: TemporalStatus;
    if (totalAllocated > wakingCapitalMinutes) {
      projectedStatus = 'OVERDRAFT';
    } else if (rawAvailable < 0) {
      projectedStatus = 'OVERCOMMITTED';
    } else if (safelyAllocatable <= 0) {
      projectedStatus = 'TIGHT';
    } else {
      projectedStatus = 'STABLE';
    }

    const forecast = calculateTemporalForecast({
      remainingWakingMinutes: wakingCapitalMinutes,
      committedMinutes,
      requiredMinutes: requiredMinutesBaseline,
      plannedRestMinutes: 0,
      protectedBufferMinutes
    });

    days.push({
      date: targetDate,
      dayLabel,
      wakingCapitalMinutes,
      committedMinutes,
      safelyAllocatableMinutes: safelyAllocatable,
      projectedStatus,
      recommendationText: forecast.recommendationText
    });
  }

  return days;
}

/**
 * Evaluates today's rest decision based on net rest minted vs spent and app usage limits.
 */
export function evaluateTodayRestDecision(
  todayMinted: number,
  todaySpent: number,
  totalUsageOverdraftMinutes: number = 0
): {
  net: number;
  status: 'deficit' | 'balanced' | 'funded' | 'generous';
  headline: string;
  guidanceText: string;
  usageOverdraftMinutes: number;
  usageOverdraftWarning?: string;
} {
  const net = todayMinted - todaySpent;
  const hasUsageOverdraft = totalUsageOverdraftMinutes > 0;
  const overdraftWarning = hasUsageOverdraft
    ? `Digital consumption exceeded daily ceilings by +${totalUsageOverdraftMinutes}m today.`
    : undefined;

  if (net < REST_DECISION_THRESHOLDS.DEFICIT) {
    return {
      net,
      status: 'deficit',
      headline: hasUsageOverdraft ? 'CRITICAL REST & DIGITAL DEFICIT' : 'REST DEFICIT WARNING',
      guidanceText: hasUsageOverdraft
        ? `You are spending more rest than earned, and digital consumption exceeded limits by ${totalUsageOverdraftMinutes}m today. Cut digital friction immediately.`
        : 'You are spending more rest than you earned today. Protect your next focus block before redeeming additional leisure.',
      usageOverdraftMinutes: totalUsageOverdraftMinutes,
      usageOverdraftWarning: overdraftWarning
    };
  }

  if (todayMinted === 0 && todaySpent === 0) {
    return {
      net,
      status: 'balanced',
      headline: hasUsageOverdraft ? 'DIGITAL OVERDRAFT DETECTED' : 'NEUTRAL INERTIA',
      guidanceText: hasUsageOverdraft
        ? `No productive rest minted yet today, but digital consumption exceeded limits by ${totalUsageOverdraftMinutes}m. Complete a deep focus block to restore balance.`
        : 'No rest transactions recorded today. Complete a deep focus block or quest to fund your first recovery pass.',
      usageOverdraftMinutes: totalUsageOverdraftMinutes,
      usageOverdraftWarning: overdraftWarning
    };
  }

  if (hasUsageOverdraft) {
    return {
      net,
      status: 'funded',
      headline: 'REST FUNDED (DIGITAL COMPROMISED)',
      guidanceText: `Rest is earned (+${net}m), but ${totalUsageOverdraftMinutes}m of over-limit digital consumption compromises true recovery. Transition to offline rest.`,
      usageOverdraftMinutes: totalUsageOverdraftMinutes,
      usageOverdraftWarning: overdraftWarning
    };
  }

  if (net >= REST_DECISION_THRESHOLDS.GENEROUS) {
    return {
      net,
      status: 'generous',
      headline: 'GENEROUS EQUITY',
      guidanceText: 'Generous recovery equity available! Schedule a full restorative block with zero guilt.',
      usageOverdraftMinutes: 0
    };
  }

  return {
    net,
    status: 'funded',
    headline: 'REST FULLY FUNDED',
    guidanceText: 'Your rest is fully funded. Schedule a deliberate recovery break before taking on new high-friction work.',
    usageOverdraftMinutes: 0
  };
}

export interface AppUsageStatus {
  limitId: string;
  appName: string;
  category: string;
  dailyLimitMinutes: number;
  sessionLimitMinutes?: number;
  usedMinutes: number;
  remainingMinutes: number;
  overdraftMinutes: number;
  isOverLimit: boolean;
  isOverdrawn: boolean;
  percentUsed: number;
  consequence: string;
}

/**
 * Calculates current usage, remaining minutes, and overdraft for a specific app limit.
 */
export function calculateAppUsageStatus(
  limit: AppUsageLimit,
  logs: AppUsageLogEntry[] = [],
  todayDate: string
): AppUsageStatus {
  const todayLogs = logs.filter(l => l.limitId === limit.id && l.date === todayDate);
  const usedMinutes = todayLogs.reduce((sum, l) => sum + (l.minutesUsed || 0), 0);
  const remainingMinutes = Math.max(0, limit.dailyLimitMinutes - usedMinutes);
  const overdraftMinutes = Math.max(0, usedMinutes - limit.dailyLimitMinutes);
  const isOverLimit = usedMinutes > limit.dailyLimitMinutes;
  const percentUsed = limit.dailyLimitMinutes > 0
    ? Math.min(200, Math.round((usedMinutes / limit.dailyLimitMinutes) * 100))
    : 100;

  return {
    limitId: limit.id,
    appName: limit.name,
    category: limit.category,
    dailyLimitMinutes: limit.dailyLimitMinutes,
    sessionLimitMinutes: limit.sessionLimitMinutes,
    usedMinutes,
    remainingMinutes,
    overdraftMinutes,
    isOverLimit,
    isOverdrawn: isOverLimit,
    percentUsed,
    consequence: limit.consequence
  };
}

/**
 * Checks if any limit with 'block_rest_passes' consequence is currently violated.
 */
export function getActiveUsageBlocker(
  limits: AppUsageLimit[] = [],
  logs: AppUsageLogEntry[] = [],
  todayDate: string
): { isBlocked: boolean; appName?: string; overdraftMinutes?: number; limit?: AppUsageLimit } {
  for (const limit of limits) {
    if (limit.consequence === 'block_rest_passes') {
      const status = calculateAppUsageStatus(limit, logs, todayDate);
      if (status.isOverLimit) {
        return {
          isBlocked: true,
          appName: limit.name,
          overdraftMinutes: status.overdraftMinutes,
          limit
        };
      }
    }
  }
  return { isBlocked: false };
}

/**
 * Default App/Site Usage Limits Catalog.
 */
export const DEFAULT_APP_USAGE_LIMITS: AppUsageLimit[] = [
  {
    id: 'limit-gaming',
    name: 'Steam & Video Games',
    category: 'gaming',
    dailyLimitMinutes: 45,
    sessionLimitMinutes: 30,
    consequence: 'informational',
    icon: '🎮',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'limit-streaming',
    name: 'YouTube & Video Streaming',
    category: 'video_streaming',
    dailyLimitMinutes: 45,
    sessionLimitMinutes: 30,
    consequence: 'deduct_leisure_bank',
    icon: '📺',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'limit-social',
    name: 'Social Media & Infinite Feeds',
    category: 'social_media',
    dailyLimitMinutes: 30,
    sessionLimitMinutes: 15,
    consequence: 'block_rest_passes',
    icon: '📱',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'limit-browsing',
    name: 'Discretionary Web Browsing',
    category: 'browsing',
    dailyLimitMinutes: 30,
    sessionLimitMinutes: 20,
    consequence: 'deduct_leisure_bank',
    icon: '🌐',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

/**
 * Default Rest Passes Catalog (Sacred Rest v2).
 */
export const DEFAULT_REST_PASSES: RestPass[] = [
  {
    id: 'rest-qaylulah',
    name: 'Sunnah Qaylulah (Power Nap)',
    durationMinutes: 25,
    costCoins: 25,
    costMinutes: 25,
    description: 'A 25-minute midday restorative sleep to revitalize soul, mental clarity, and focus.',
    category: 'Restoration',
    restType: 'restorative',
    isEssentialRecovery: true,
    icon: '😴'
  },
  {
    id: 'rest-walk',
    name: 'Contemplative Nature Walk',
    durationMinutes: 30,
    costCoins: 20,
    costMinutes: 20,
    description: '30 minutes outdoors without digital inputs to recalibrate dopamine baselines.',
    category: 'Restoration',
    restType: 'restorative',
    isEssentialRecovery: true,
    icon: '🌿'
  },
  {
    id: 'rest-reading',
    name: 'Guilt-Free Contemplative Reading',
    durationMinutes: 45,
    costCoins: 35,
    costMinutes: 30,
    description: '45 minutes immersed in uplifting literature, history, or creative writing.',
    category: 'Leisure',
    restType: 'neutral_recovery',
    icon: '📖'
  },
  {
    id: 'rest-coffee',
    name: 'Artisanal Coffee & Tea Ritual',
    durationMinutes: 20,
    costCoins: 30,
    costMinutes: 20,
    description: 'A 20-minute mindful coffee or herbal tea pause between deep focus sprints.',
    category: 'Leisure',
    restType: 'intentional_leisure',
    icon: '☕'
  },
  {
    id: 'rest-gaming',
    name: '1-Hour Leisure Recreation Pass',
    durationMinutes: 60,
    costCoins: 75,
    costMinutes: 60,
    description: '1 hour of guilt-free video games or high-immersion digital leisure.',
    category: 'Recreation',
    restType: 'intentional_leisure',
    icon: '🎮'
  }
];

