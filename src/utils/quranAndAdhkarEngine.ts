import {
  AdhkarFortressStats,
  AdhkarSessionStatus,
  QuranPassage,
  QuranRevisionStatus,
  SpiritualDailyLog
} from '../types';
import { addDays, getDaysDifference, getLocalDateString } from './dateUtils';

/**
 * Calculates the Fortress Integrity score and metrics for a given date.
 * 
 * Core rule:
 * - Morning Adhkar: Complete = 33.3%, In Progress = 15%
 * - Evening Adhkar: Complete = 33.3%, In Progress = 15%
 * - Sleep Adhkar:   Complete = 33.4%, In Progress = 15%
 * 
 * Sum = 0 to 100% daily integrity score.
 */
export function calculateAdhkarFortressStats(
  logs: Record<string, SpiritualDailyLog> | undefined,
  targetDate: string
): AdhkarFortressStats {
  const safeLogs = logs || {};
  const todayLog = safeLogs[targetDate];

  // Resolve session statuses (backward compatible with legacy booleans)
  let morningStatus: AdhkarSessionStatus = todayLog?.adhkarSessions?.morning || 'not_started';
  if (morningStatus === 'not_started' && todayLog?.adhkarSabah) {
    morningStatus = 'complete';
  }

  let eveningStatus: AdhkarSessionStatus = todayLog?.adhkarSessions?.evening || 'not_started';
  if (eveningStatus === 'not_started' && todayLog?.adhkarMasa) {
    eveningStatus = 'complete';
  }

  let sleepStatus: AdhkarSessionStatus = todayLog?.adhkarSessions?.sleep || 'not_started';
  if (sleepStatus === 'not_started' && (todayLog?.adhkarSleepNight || todayLog?.adhkarSleepDhohr)) {
    sleepStatus = 'complete';
  }

  let morningWeight = 0;
  if (morningStatus === 'complete') morningWeight = 33.33;
  else if (morningStatus === 'in_progress') morningWeight = 15;

  let eveningWeight = 0;
  if (eveningStatus === 'complete') eveningWeight = 33.33;
  else if (eveningStatus === 'in_progress') eveningWeight = 15;

  let sleepWeight = 0;
  if (sleepStatus === 'complete') sleepWeight = 33.34;
  else if (sleepStatus === 'in_progress') sleepWeight = 15;

  const rawDailyScore = Math.min(100, Math.round(morningWeight + eveningWeight + sleepWeight));

  const completedCount = 
    (morningStatus === 'complete' ? 1 : 0) +
    (eveningStatus === 'complete' ? 1 : 0) +
    (sleepStatus === 'complete' ? 1 : 0);

  // Status labels
  let statusLabel = 'Unfortified';
  let statusLabelAr = 'غَيْرُ مُحَصَّن';

  if (rawDailyScore === 100) {
    statusLabel = 'Unbreached Fortress (100%)';
    statusLabelAr = 'حِصْنٌ مَنِيعٌ';
  } else if (rawDailyScore >= 66) {
    statusLabel = 'Fortified Bastion';
    statusLabelAr = 'حِصْنٌ حَصِينٌ';
  } else if (rawDailyScore >= 33) {
    statusLabel = 'Partially Guarded';
    statusLabelAr = 'حِمَايَةٌ جُزْئِيَّة';
  } else if (rawDailyScore > 0) {
    statusLabel = 'Vulnerable Perimeter';
    statusLabelAr = 'ثَغْرٌ مَفْتُوح';
  }

  // 7-day rolling integrity average
  let total7DayScore = 0;
  for (let i = 0; i < 7; i++) {
    const dStr = addDays(targetDate, -i);
    const l = safeLogs[dStr];
    if (!l) continue;

    const m: AdhkarSessionStatus = l.adhkarSessions?.morning || (l.adhkarSabah ? 'complete' : 'not_started');
    const e: AdhkarSessionStatus = l.adhkarSessions?.evening || (l.adhkarMasa ? 'complete' : 'not_started');
    const s: AdhkarSessionStatus = l.adhkarSessions?.sleep || (l.adhkarSleepNight || l.adhkarSleepDhohr ? 'complete' : 'not_started');

    let mw = m === 'complete' ? 33.33 : m === 'in_progress' ? 15 : 0;
    let ew = e === 'complete' ? 33.33 : e === 'in_progress' ? 15 : 0;
    let sw = s === 'complete' ? 33.34 : s === 'in_progress' ? 15 : 0;
    total7DayScore += Math.min(100, Math.round(mw + ew + sw));
  }
  const sevenDayAverage = Math.round(total7DayScore / 7);

  // Calculate current streak (days with integrity >= 66% or at least 2 sessions complete)
  let currentStreak = 0;
  let checkDate = targetDate;
  // If today is not yet fortified, check if yesterday had an unbroken streak so we don't break early in the morning
  let startOffset = 0;
  if (completedCount === 0) {
    startOffset = 1;
  }

  for (let i = startOffset; i < 60; i++) {
    const dStr = addDays(targetDate, -i);
    const l = safeLogs[dStr];
    if (!l) {
      if (i === 0) continue;
      break;
    }
    const m: AdhkarSessionStatus = l.adhkarSessions?.morning || (l.adhkarSabah ? 'complete' : 'not_started');
    const e: AdhkarSessionStatus = l.adhkarSessions?.evening || (l.adhkarMasa ? 'complete' : 'not_started');
    const s: AdhkarSessionStatus = l.adhkarSessions?.sleep || (l.adhkarSleepNight || l.adhkarSleepDhohr ? 'complete' : 'not_started');

    const dayCompleted = (m === 'complete' ? 1 : 0) + (e === 'complete' ? 1 : 0) + (s === 'complete' ? 1 : 0);
    if (dayCompleted >= 2) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    integrityScore: rawDailyScore,
    statusLabel,
    statusLabelAr,
    morningStatus,
    eveningStatus,
    sleepStatus,
    completedCount,
    currentStreak,
    sevenDayAverage
  };
}

/**
 * Calculates Qur'an Freshness score and counts for the revision queue.
 * 
 * Revision Queue:
 * Weak -> Due -> Stable
 * 
 * Stable passages: 100 points (decays to 70 if not revised in > 14 days)
 * Due passages:    50 points
 * Weak passages:   15 points
 */
export function calculateQuranFreshness(
  passages: QuranPassage[],
  referenceDateStr: string = getLocalDateString()
): {
  score: number;
  label: string;
  labelAr: string;
  weakCount: number;
  dueCount: number;
  stableCount: number;
} {
  if (!passages || passages.length === 0) {
    return {
      score: 100,
      label: 'Optimal Baseline',
      labelAr: 'جاهز للبدء والمواظبة',
      weakCount: 0,
      dueCount: 0,
      stableCount: 0
    };
  }

  let weakCount = 0;
  let dueCount = 0;
  let stableCount = 0;
  let totalPoints = 0;

  for (const passage of passages) {
    const daysSince = passage.lastRevisedDate
      ? getDaysDifference(passage.lastRevisedDate, referenceDateStr)
      : 99;

    if (passage.status === 'weak') {
      weakCount++;
      totalPoints += 15;
    } else if (passage.status === 'due') {
      dueCount++;
      totalPoints += 50;
    } else {
      stableCount++;
      // If stable but neglected for > 14 days, decay slightly to reflect forgotten nuances
      if (daysSince > 14) {
        totalPoints += 70;
      } else {
        totalPoints += 100;
      }
    }
  }

  const score = Math.max(5, Math.min(100, Math.round(totalPoints / passages.length)));

  let label = 'Fresh & Firmly Anchored';
  let labelAr = 'راسخ في الصدر';

  if (score >= 85) {
    label = 'Fresh & Firmly Anchored';
    labelAr = 'راسخ في الصدر';
  } else if (score >= 65) {
    label = 'Active Retention';
    labelAr = 'متعاهد بانتظام';
  } else if (score >= 40) {
    label = 'Requires Review';
    labelAr = 'بحاجة تعاهد ومراجعة';
  } else {
    label = 'Needs Urgent Restoration';
    labelAr = 'معرّض للتفلت والنسيان';
  }

  return {
    score,
    label,
    labelAr,
    weakCount,
    dueCount,
    stableCount
  };
}

/**
 * Advances a passage through the revision queue:
 * Weak -> Due -> Stable
 */
export function advanceRevisionQueueStatus(current: QuranRevisionStatus): QuranRevisionStatus {
  if (current === 'weak') return 'due';
  if (current === 'due') return 'stable';
  return 'stable';
}

/**
 * Regresses a passage:
 * Stable -> Due -> Weak
 */
export function regressRevisionQueueStatus(current: QuranRevisionStatus): QuranRevisionStatus {
  if (current === 'stable') return 'due';
  if (current === 'due') return 'weak';
  return 'weak';
}
