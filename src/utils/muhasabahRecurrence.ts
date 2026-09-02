import { MuhasabahCategory, MuhasabahSeverity, MuhasabahEntry, Weakness, RecurrenceCadence, RecurrenceAnalysis } from '../types';

export const SEVERITY_BASE_CONSEQUENCES: Record<MuhasabahSeverity, {
  baseHp: number;
  baseCoins: number;
  baseXp: number;
  baseMomentum: number;
  label: string;
}> = {
  Minor: {
    baseHp: 10,
    baseCoins: 10,
    baseXp: 100,
    baseMomentum: 15,
    label: 'Minor'
  },
  Moderate: {
    baseHp: 20,
    baseCoins: 25,
    baseXp: 200,
    baseMomentum: 35,
    label: 'Moderate'
  },
  Major: {
    baseHp: 35,
    baseCoins: 50,
    baseXp: 300,
    baseMomentum: 100, // resets momentum
    label: 'Major'
  },
  Severe: {
    baseHp: 50,
    baseCoins: 100,
    baseXp: 400,
    baseMomentum: 100,
    label: 'Severe'
  },
  Critical: {
    baseHp: 75,
    baseCoins: 200,
    baseXp: 500,
    baseMomentum: 100,
    label: 'Critical'
  }
};

/**
 * Calculates calendar day differences between two YYYY-MM-DD strings.
 */
export function getDaysDifference(dateStrA: string, dateStrB: string): number {
  try {
    const [yA, mA, dA] = dateStrA.split('-').map(Number);
    const [yB, mB, dB] = dateStrB.split('-').map(Number);
    const dtA = new Date(yA, mA - 1, dA);
    const dtB = new Date(yB, mB - 1, dB);
    const diffMs = dtA.getTime() - dtB.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Normalizes text to check semantic match between sins / slips / weaknesses.
 */
function normalizeSinKey(text: string): string {
  return (text || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Analyzes whether a sin/slip is recurring and determines the exact cadence,
 * escalation tier, and amplified HP & Coin penalties.
 */
export function analyzeSinRecurrence(params: {
  title: string;
  category: MuhasabahCategory;
  severity: MuhasabahSeverity;
  weaknessId?: string | null;
  weaknessName?: string | null;
  targetDate: string; // YYYY-MM-DD
  allEntries: MuhasabahEntry[];
  weaknesses: Weakness[];
  currentEntryId?: string;
  forceCadence?: RecurrenceCadence;
}): RecurrenceAnalysis {
  const {
    title,
    category,
    severity,
    weaknessId,
    weaknessName,
    targetDate,
    allEntries = [],
    weaknesses = [],
    currentEntryId,
    forceCadence
  } = params;

  const base = SEVERITY_BASE_CONSEQUENCES[severity] || SEVERITY_BASE_CONSEQUENCES.Moderate;
  const normTitle = normalizeSinKey(title);
  const normWeaknessName = normalizeSinKey(weaknessName || '');

  // 1. Gather all past occurrences of this specific sin
  const matchingPastEntries = allEntries.filter(e => {
    if (e.id === currentEntryId) return false;
    if (e.isExempt) return false; // Lawful exemptions do not count towards sin relapses

    // Direct weakness link
    if (weaknessId && e.weaknessId === weaknessId) return true;

    // Title / weakness name match
    const eTitle = normalizeSinKey(e.title);
    const eWeakness = normalizeSinKey(e.weaknessName || '');
    
    if (normTitle && (eTitle === normTitle || eWeakness === normTitle)) return true;
    if (normWeaknessName && (eTitle === normWeaknessName || eWeakness === normWeaknessName)) return true;

    // Category and very similar title prefix
    if (e.category === category && normTitle.length >= 4 && eTitle.includes(normTitle.substring(0, 8))) {
      return true;
    }

    return false;
  });

  // Sort descending by date and timestamp
  matchingPastEntries.sort((a, b) => {
    const diff = (b.date || '').localeCompare(a.date || '');
    if (diff !== 0) return diff;
    return (b.timestamp || '').localeCompare(a.timestamp || '');
  });

  // Check linked weakness state if available
  const linkedWeakness = weaknesses.find(w => 
    (weaknessId && w.id === weaknessId) ||
    (normWeaknessName && normalizeSinKey(w.name) === normWeaknessName) ||
    (normTitle && normalizeSinKey(w.name) === normTitle)
  );

  const totalPastOccurrences = matchingPastEntries.length;
  const sameDayEntries = matchingPastEntries.filter(e => e.date === targetDate);
  const sameDayCount = sameDayEntries.length;

  // Filter prior dates strictly before targetDate for history interval
  const priorDayEntries = matchingPastEntries.filter(e => e.date < targetDate);
  const lastPriorEntry = priorDayEntries[0] || null;
  const lastOccurrenceDate = sameDayCount > 0 ? targetDate : (lastPriorEntry ? lastPriorEntry.date : null);

  const daysSinceLastOccurrence = lastPriorEntry 
    ? Math.max(0, getDaysDifference(targetDate, lastPriorEntry.date))
    : null;

  // Compute consecutive daily streak
  let consecutiveDailyStreak = 0;
  if (priorDayEntries.length > 0) {
    let checkOffset = 1;
    let keepChecking = true;
    while (keepChecking && checkOffset < 30) {
      // Date checkOffset days ago
      try {
        const [y, m, d] = targetDate.split('-').map(Number);
        const refD = new Date(y, m - 1, d);
        refD.setDate(refD.getDate() - checkOffset);
        const yStr = refD.getFullYear();
        const mStr = String(refD.getMonth() + 1).padStart(2, '0');
        const dStr = String(refD.getDate()).padStart(2, '0');
        const dateStrToCheck = `${yStr}-${mStr}-${dStr}`;

        const foundOnDate = priorDayEntries.some(e => e.date === dateStrToCheck);
        if (foundOnDate) {
          consecutiveDailyStreak++;
          checkOffset++;
        } else {
          keepChecking = false;
        }
      } catch {
        keepChecking = false;
      }
    }
  }

  // Calculate average interval between all occurrences
  let averageIntervalDays: number | null = null;
  if (matchingPastEntries.length >= 2) {
    const dates = Array.from(new Set(matchingPastEntries.map(e => e.date))).sort();
    if (dates.length >= 2) {
      const spanDays = getDaysDifference(dates[dates.length - 1], dates[0]);
      averageIntervalDays = Math.max(0.5, Number((spanDays / (dates.length - 1)).toFixed(1)));
    }
  }

  // Determine Cadence
  let cadence: RecurrenceCadence = 'isolated';
  let cadenceLabel = 'Isolated / First Occurrence';
  let cadenceDescription = 'First recorded occurrence or spaced > 7 days apart. Standard baseline consequences applied.';
  let multiplier = 1.0;
  let escalationTier = 1;

  if (forceCadence) {
    cadence = forceCadence;
  } else if (sameDayCount >= 1) {
    // 1. More than once a day (Intra-day relapse)
    cadence = 'same_day';
  } else if (consecutiveDailyStreak >= 1 || daysSinceLastOccurrence === 1) {
    // 2. Everyday (consecutive days)
    cadence = 'daily';
  } else if (daysSinceLastOccurrence === 2 || (averageIntervalDays !== null && averageIntervalDays >= 1.5 && averageIntervalDays <= 2.5)) {
    // 3. Every two days
    cadence = 'every_2_days';
  } else if (daysSinceLastOccurrence !== null && daysSinceLastOccurrence <= 4) {
    // 4. Semi-weekly (every 3-4 days)
    cadence = 'semi_weekly';
  } else if (daysSinceLastOccurrence !== null && daysSinceLastOccurrence <= 7) {
    // 5. Weekly
    cadence = 'weekly';
  } else {
    cadence = 'isolated';
  }

  // Calculate Multipliers and Descriptions based on Cadence
  switch (cadence) {
    case 'same_day': {
      // More than once in a single day: acute compounding relapse
      // 2nd time today: +75% (1.75x)
      // 3rd time today: +150% (2.50x)
      // 4th+ time today: +225% (3.25x)
      const recurrenceNumber = sameDayCount + 1;
      multiplier = 1.0 + (sameDayCount * 0.75);
      escalationTier = Math.min(5, 2 + Math.max(0, sameDayCount - 1));
      cadenceLabel = `More Than Once a Day (${recurrenceNumber}x Today)`;
      cadenceDescription = `Acute intra-day relapse (${recurrenceNumber} times today). Soul vitality & treasury penalties heavily amplified (+${Math.round((multiplier - 1) * 100)}%).`;
      break;
    }
    case 'daily': {
      // Everyday: consecutive daily relapse
      // Day 2 consecutive: +50% (1.50x)
      // Day 3 consecutive: +100% (2.0x)
      // Day 4+ consecutive: +150% (2.5x)
      const streakTotal = consecutiveDailyStreak + 1;
      multiplier = 1.0 + (Math.max(1, consecutiveDailyStreak) * 0.5);
      escalationTier = Math.min(5, 1 + Math.max(1, consecutiveDailyStreak));
      cadenceLabel = `Everyday (${streakTotal} Consecutive Days)`;
      cadenceDescription = `Habitual daily loop active. Relapsed on consecutive days. Automatic +${Math.round((multiplier - 1) * 100)}% HP & Coin fine increase.`;
      break;
    }
    case 'every_2_days': {
      // Every two days: 48h biphasic cycle
      multiplier = 1.35;
      escalationTier = 2;
      cadenceLabel = 'Every Two Days (48h Biphasic Relapse)';
      cadenceDescription = 'Cyclic 48-hour relapse detected. Penalty escalated by +35% HP & Coin loss to disrupt the pattern.';
      break;
    }
    case 'semi_weekly': {
      // Every 3-4 days
      multiplier = 1.20;
      escalationTier = 2;
      cadenceLabel = `Every ${daysSinceLastOccurrence || 3} Days (Semi-Weekly Cycle)`;
      cadenceDescription = 'Semi-weekly relapse pattern. Escalated by +20% HP & Coin fine to reinforce spiritual guardrails.';
      break;
    }
    case 'weekly': {
      // Weekly recurrence
      multiplier = 1.15;
      escalationTier = 1;
      cadenceLabel = 'Weekly Recurrence (7-Day Cycle)';
      cadenceDescription = 'Recurring weekly slip. Modest +15% penalty escalation applied.';
      break;
    }
    case 'isolated':
    default: {
      multiplier = 1.0;
      escalationTier = 1;
      cadenceLabel = 'First Occurrence / Isolated (>7 Days)';
      cadenceDescription = 'Isolated occurrence. Baseline consequences applied with zero recurrence penalty.';
      break;
    }
  }

  // If the linked weakness is already flagged as an Active Chain (5+ historical slips), guarantee at least Tier 2
  if (linkedWeakness && linkedWeakness.occurrenceCount >= 5 && multiplier <= 1.0) {
    multiplier = 1.25;
    escalationTier = Math.max(2, escalationTier);
    cadenceLabel = `Active Behavioral Chain (5+ Slips Recorded)`;
    cadenceDescription = `Chronic behavioral weakness active (${linkedWeakness.occurrenceCount} total records). +25% automatic penalty floor.`;
  }

  const isRecurring = multiplier > 1.0;

  const escalatedHpLoss = Math.round(base.baseHp * multiplier);
  const escalatedCoinFine = Math.round(base.baseCoins * multiplier);
  const escalatedXpPenalty = Math.round(base.baseXp * multiplier);

  return {
    cadence,
    cadenceLabel,
    cadenceDescription,
    sameDayCount,
    consecutiveDailyStreak,
    lastOccurrenceDate,
    daysSinceLastOccurrence,
    averageIntervalDays,
    totalPastOccurrences,
    escalationTier,
    multiplier,
    baseHpLoss: base.baseHp,
    escalatedHpLoss,
    baseCoinFine: base.baseCoins,
    escalatedCoinFine,
    baseXpPenalty: base.baseXp,
    escalatedXpPenalty,
    isRecurring
  };
}

export interface RecurringSinItem {
  key: string;
  name: string;
  category: MuhasabahCategory;
  occurrenceCount: number;
  sameDayCount: number;
  consecutiveDaysCount: number;
  lastOccurrenceDate: string;
  daysSinceLastOccurrence: number | null;
  averageIntervalDays: number | null;
  cadence: RecurrenceCadence;
  cadenceLabel: string;
  escalationTier: number;
  multiplier: number;
  currentHpLoss: number;
  currentCoinFine: number;
  triggerCause: string;
  correctiveStrategy: string;
  status: 'Active' | 'Under Control' | 'Overcome';
  weaknessId?: string;
  historyEntries: MuhasabahEntry[];
}

/**
 * Scans all Muhasabah entries and weaknesses to compile a comprehensive
 * list of recurring sins grouped by their recurrence rhythm.
 */
export function getRecurringSinsRegistry(
  allEntries: MuhasabahEntry[] = [],
  weaknesses: Weakness[] = [],
  targetDate: string
): {
  allRecurringSins: RecurringSinItem[];
  intraDaySins: RecurringSinItem[];
  dailySins: RecurringSinItem[];
  everyTwoDaysSins: RecurringSinItem[];
  periodicSins: RecurringSinItem[];
  totalRecurringCount: number;
  activeChainsCount: number;
} {
  const sinMap = new Map<string, {
    key: string;
    name: string;
    category: MuhasabahCategory;
    triggerCause: string;
    weaknessId?: string;
    status: 'Active' | 'Under Control' | 'Overcome';
    entries: MuhasabahEntry[];
  }>();

  // 1. Seed from weaknesses
  weaknesses.forEach(w => {
    const key = normalizeSinKey(w.name);
    if (!key) return;
    sinMap.set(key, {
      key,
      name: w.name,
      category: w.category,
      triggerCause: w.triggerCause || '',
      weaknessId: w.id,
      status: w.status,
      entries: []
    });
  });

  // 2. Aggregate from non-exempt entries
  allEntries.forEach(entry => {
    if (entry.isExempt) return;
    const titleKey = normalizeSinKey(entry.title);
    const weaknessKey = normalizeSinKey(entry.weaknessName || '');
    const key = (entry.weaknessId && weaknesses.find(w => w.id === entry.weaknessId))
      ? normalizeSinKey(weaknesses.find(w => w.id === entry.weaknessId)!.name)
      : (weaknessKey || titleKey);

    if (!key) return;

    if (!sinMap.has(key)) {
      sinMap.set(key, {
        key,
        name: entry.weaknessName || entry.title,
        category: entry.category,
        triggerCause: entry.cause || '',
        weaknessId: entry.weaknessId || undefined,
        status: 'Active',
        entries: []
      });
    }

    sinMap.get(key)!.entries.push(entry);
  });

  const registry: RecurringSinItem[] = [];

  sinMap.forEach((item) => {
    // Only consider sins that have at least 1 entry or are an active tracked weakness
    if (item.entries.length === 0 && item.status !== 'Active') return;

    // Use latest severity from entries, or default to Moderate
    const latestSeverity: MuhasabahSeverity = item.entries.length > 0 
      ? item.entries[0].severity 
      : 'Moderate';

    const analysis = analyzeSinRecurrence({
      title: item.name,
      category: item.category,
      severity: latestSeverity,
      weaknessId: item.weaknessId,
      weaknessName: item.name,
      targetDate,
      allEntries,
      weaknesses
    });

    const matchingWeakness = item.weaknessId ? weaknesses.find(w => w.id === item.weaknessId) : null;
    const count = Math.max(item.entries.length, matchingWeakness?.occurrenceCount || 0);

    // Filter to those that have recurred (count >= 2, or intra-day, or flagged as recurring)
    const isActuallyRecurring = 
      count >= 2 || 
      analysis.sameDayCount >= 1 || 
      analysis.consecutiveDailyStreak >= 1 || 
      analysis.cadence !== 'isolated';

    if (isActuallyRecurring) {
      registry.push({
        key: item.key,
        name: item.name,
        category: item.category,
        occurrenceCount: count,
        sameDayCount: analysis.sameDayCount,
        consecutiveDaysCount: analysis.consecutiveDailyStreak,
        lastOccurrenceDate: analysis.lastOccurrenceDate || targetDate,
        daysSinceLastOccurrence: analysis.daysSinceLastOccurrence,
        averageIntervalDays: analysis.averageIntervalDays,
        cadence: analysis.cadence,
        cadenceLabel: analysis.cadenceLabel,
        escalationTier: analysis.escalationTier,
        multiplier: analysis.multiplier,
        currentHpLoss: analysis.escalatedHpLoss,
        currentCoinFine: analysis.escalatedCoinFine,
        triggerCause: item.triggerCause || (item.entries[0]?.cause || 'Unchecked impulsive trigger'),
        correctiveStrategy: matchingWeakness?.correctiveStrategy || (item.entries[0]?.reflection || 'Block the trigger environment and establish strict vigilance.'),
        status: matchingWeakness ? matchingWeakness.status : item.status,
        weaknessId: item.weaknessId,
        historyEntries: item.entries
      });
    }
  });

  // Sort by highest escalation multiplier and occurrence count
  registry.sort((a, b) => {
    if (b.multiplier !== a.multiplier) return b.multiplier - a.multiplier;
    return b.occurrenceCount - a.occurrenceCount;
  });

  const intraDaySins = registry.filter(s => s.cadence === 'same_day' || s.sameDayCount >= 1);
  const dailySins = registry.filter(s => s.cadence === 'daily');
  const everyTwoDaysSins = registry.filter(s => s.cadence === 'every_2_days');
  const periodicSins = registry.filter(s => s.cadence === 'semi_weekly' || s.cadence === 'weekly');

  return {
    allRecurringSins: registry,
    intraDaySins,
    dailySins,
    everyTwoDaysSins,
    periodicSins,
    totalRecurringCount: registry.length,
    activeChainsCount: registry.filter(s => s.status === 'Active' || s.escalationTier >= 3).length
  };
}
