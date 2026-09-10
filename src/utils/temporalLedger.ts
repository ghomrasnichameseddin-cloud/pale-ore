import {
  LeisureTransaction,
  LeisureTransactionType,
  RestPass,
  DailyWakingCapital,
  ActiveRestSession,
  AppUsageLimit,
  AppUsageLogEntry
} from '../types';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * TEMPORAL LEDGER & REST ENGINE (Ra's al-Māl / Sacred Time Capital)
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * CORE RULES & ARCHITECTURAL INVARIANTS:
 * 1. Balance Invariant: Leisure bank balance represents earned rest currency
 *    and CANNOT go negative during redemptions. Redemptions strictly require
 *    sufficient coins AND sufficient minutes.
 * 2. Permanent Ledger: Time credits do NOT expire, decay, or wipe after multi-day
 *    inactivity. Rest earned is rest owed to the operator's soul.
 * 3. Multi-Day Resilience: When the app is opened after multi-day gaps, balance
 *    remains completely intact. Daily Waking Capital resets to the new day
 *    without accumulating phantom deficits.
 * 4. Invested Definition: "Invested so far" strictly measures logged minutes
 *    (focus sessions completed today + estimated time of completed quests today).
 * 5. Double-Minting Guard: Minting keys on `questId + completedAt` to ensure
 *    idempotent credit granting.
 * 6. Early-Finish Refund: Pro-rata by time remaining based on the cost paid.
 * ═════════════════════════════════════════════════════════════════════════════
 */

export const DEFAULT_DAILY_WAKING_BUDGET_MINUTES = 960; // 16 waking hours (16 * 60)

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
 * The rule is explicitly reflected in the reason field: labor-based rest supersedes previously
 * minted focus blocks, awarding only the net incremental unminted rest.
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
 * Guarantees that neither coins nor rest minutes can drop below zero.
 */
export function redeemRestPassAtomic(params: {
  currentCoins: number;
  currentLeisureBalance: number;
  pass: RestPass;
  timestamp: string;
  blockedByAppUsage?: { isBlocked: boolean; appName?: string; overdraftMinutes?: number };
}): AtomicRedeemResult {
  const { currentCoins, currentLeisureBalance, pass, timestamp, blockedByAppUsage } = params;

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
      error: `Insufficient Rest Bank: Requires ${pass.costMinutes}m leisure credits, but you have ${currentLeisureBalance}m.`,
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
    relatedId: pass.id
  };

  const activeRestSession: ActiveRestSession = {
    id: `rest-sess-${Date.now()}`,
    title: pass.name,
    totalMinutes: pass.durationMinutes,
    remainingSeconds: pass.durationMinutes * 60,
    startedAt: timestamp,
    paused: false,
    costMinutes: pass.costMinutes,
    passId: pass.id
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
    relatedId: params.sessionId
  };
}

/**
 * Computes Daily Waking Capital and checks for Overdraft.
 * Overdraft formula: committed > budget - invested-so-far
 * Where invested-so-far = logged minutes today (focus + completed quests).
 */
export function calculateDailyWakingCapital(params: {
  budgetMinutes?: number;
  investedMinutesToday: number;
  committedMinutesToday: number;
}): DailyWakingCapital {
  const budget = params.budgetMinutes ?? DEFAULT_DAILY_WAKING_BUDGET_MINUTES;
  const invested = Math.max(0, params.investedMinutesToday);
  const committed = Math.max(0, params.committedMinutesToday);
  const remainingBudgetAfterInvested = Math.max(0, budget - invested);
  const totalAllocated = invested + committed;

  const isOverdrawn = committed > remainingBudgetAfterInvested;
  const overdraftMinutes = Math.max(0, totalAllocated - budget);
  const slackMinutes = Math.max(0, budget - totalAllocated);
  const utilizationPercent = budget > 0 ? Math.min(200, Math.round((totalAllocated / budget) * 100)) : 100;

  return {
    budgetMinutes: budget,
    investedMinutes: invested,
    committedMinutes: committed,
    slackMinutes,
    isOverdrawn,
    overdraftMinutes,
    utilizationPercent
  };
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
    consequence: 'informational',
    icon: '🎮',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'limit-streaming',
    name: 'YouTube & Video Streaming',
    category: 'video_streaming',
    dailyLimitMinutes: 45,
    consequence: 'deduct_leisure_bank',
    icon: '📺',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'limit-social',
    name: 'Social Media & Infinite Feeds',
    category: 'social_media',
    dailyLimitMinutes: 30,
    consequence: 'block_rest_passes',
    icon: '📱',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

/**
 * Default Rest Passes Catalog.
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
    icon: '😴'
  },
  {
    id: 'rest-reading',
    name: 'Guilt-Free Contemplative Reading',
    durationMinutes: 45,
    costCoins: 35,
    costMinutes: 30,
    description: '45 minutes immersed in uplifting literature, history, or creative writing.',
    category: 'Leisure',
    icon: '📖'
  },
  {
    id: 'rest-walk',
    name: 'Contemplative Nature Walk',
    durationMinutes: 30,
    costCoins: 20,
    costMinutes: 20,
    description: '30 minutes outdoors without digital inputs to recalibrate dopamine baselines.',
    category: 'Restoration',
    icon: '🌿'
  },
  {
    id: 'rest-coffee',
    name: 'Artisanal Coffee & Tea Ritual',
    durationMinutes: 20,
    costCoins: 30,
    costMinutes: 20,
    description: 'A 20-minute mindful coffee or herbal tea pause between deep focus sprints.',
    category: 'Leisure',
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
    icon: '🎮'
  }
];
