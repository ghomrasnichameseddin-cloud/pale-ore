import { HabitFormation, HabitStabilityStage, Quest, XPHistoryEntry } from '../types';
import { addDays, getDaysDifference, getLocalDateString } from './dateUtils';
import { isQuestScheduledForDate } from './penaltyEngine';

/**
 * Determines behavioral milestone stage from successful repetitions:
 * 0–7 successful repetitions   → initiated
 * 8–30                         → established
 * 31–60                        → conditioned
 * 61–90                        → integrated
 * 90+                          → stable
 */
export function getHabitStabilityStage(repetitions: number): HabitStabilityStage {
  if (repetitions >= 90) return 'stable';
  if (repetitions >= 61) return 'integrated';
  if (repetitions >= 31) return 'conditioned';
  if (repetitions >= 8) return 'established';
  return 'initiated';
}

export interface StageDetails {
  stage: HabitStabilityStage;
  label: string;
  labelAr: string;
  badgeClass: string;
  borderClass: string;
  textColor: string;
  bgLightClass: string;
  repRange: string;
  description: string;
}

export function getHabitStageDetails(stage: HabitStabilityStage): StageDetails {
  switch (stage) {
    case 'stable':
      return {
        stage: 'stable',
        label: 'Stable',
        labelAr: 'راسخ وتلقائي',
        badgeClass: 'bg-amber-500/20 text-[#fef08a] border-[#c5a059]/60',
        borderClass: 'border-[#c5a059]',
        textColor: 'text-[#fef08a]',
        bgLightClass: 'bg-amber-950/40',
        repRange: '90+ Reps',
        description: 'Behavior is deeply ingrained, automatic, and resilient to external disruption.'
      };
    case 'integrated':
      return {
        stage: 'integrated',
        label: 'Integrated',
        labelAr: 'متجذر في السلوك',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
        borderClass: 'border-emerald-500/50',
        textColor: 'text-emerald-400',
        bgLightClass: 'bg-emerald-950/30',
        repRange: '61–90 Reps',
        description: 'Identity-level integration. Routine executes naturally across varying contexts.'
      };
    case 'conditioned':
      return {
        stage: 'conditioned',
        label: 'Conditioned',
        labelAr: 'معتاد ومبرمج',
        badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
        borderClass: 'border-indigo-500/50',
        textColor: 'text-indigo-400',
        bgLightClass: 'bg-indigo-950/30',
        repRange: '31–60 Reps',
        description: 'Cue-routine loop is anchored. Resistance to execution has significantly lowered.'
      };
    case 'established':
      return {
        stage: 'established',
        label: 'Established',
        labelAr: 'ثابت التأسيس',
        badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
        borderClass: 'border-cyan-500/50',
        textColor: 'text-cyan-400',
        bgLightClass: 'bg-cyan-950/30',
        repRange: '8–30 Reps',
        description: 'Initial habit momentum gained. Requires deliberate activation and cue alignment.'
      };
    case 'initiated':
    default:
      return {
        stage: 'initiated',
        label: 'Initiated',
        labelAr: 'قيد التأسيس',
        badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
        borderClass: 'border-amber-500/40',
        textColor: 'text-amber-300',
        bgLightClass: 'bg-amber-950/20',
        repRange: '0–7 Reps',
        description: 'Early behavioral pathway formation. Highest friction; protect cue continuity.'
      };
  }
}

/**
 * Checks if a directive qualifies as a habit or recurring action.
 */
export function isHabitQuest(quest: Quest): boolean {
  if (!quest) return false;
  const isExplicitHabit = (quest.type || '').toLowerCase() === 'habit';
  const isRecurring = Boolean(quest.recurrence && quest.recurrence !== 'None');
  return isExplicitHabit || isRecurring || Boolean(quest.formation);
}

/**
 * Derives habit formation metadata from existing completion history and quest state.
 * 
 * Invariants:
 * - Does NOT award XP or progression ranks (XP remains authoritative).
 * - A missed day does NOT reset the habit or erase successful repetitions.
 * - Stability score represents consistency over time, not purely consecutive days.
 */
export function calculateHabitFormation(
  quest: Quest,
  xpHistory: XPHistoryEntry[] = [],
  currentDateStr?: string
): HabitFormation {
  const todayStr = currentDateStr || getLocalDateString();

  // 1. Collect all valid completion dates for this quest from xpHistory
  const completionDatesSet = new Set<string>();
  for (const entry of xpHistory) {
    if (entry.questId === quest.id && entry.xp > 0) {
      if (entry.date) {
        completionDatesSet.add(entry.date);
      } else if (entry.timestamp) {
        completionDatesSet.add(entry.timestamp.split('T')[0]);
      }
    }
  }

  // Also include quest.lastCompletedDate or completedAt if recorded
  if (quest.lastCompletedDate) {
    completionDatesSet.add(quest.lastCompletedDate);
  } else if (quest.completedAt) {
    completionDatesSet.add(quest.completedAt.split('T')[0]);
  }

  // 2. Successful repetitions: derived from distinct completion records and existing baseline
  const historicalReps = completionDatesSet.size;
  const explicitReps = quest.formation?.successfulRepetitions || 0;
  const streakFloor = Math.max(quest.streakCount || 0, quest.bestStreak || 0);
  const successfulRepetitions = Math.max(historicalReps, explicitReps, streakFloor);

  // 3. Current streak: reuse quest.streakCount or evaluate based on recency
  let currentStreak = quest.streakCount || 0;
  const lastCompletedAt = quest.lastCompletedDate || (quest.completedAt ? quest.completedAt.split('T')[0] : null);

  // If last completed date was 2 or more days ago and not completed today, streak is 0
  if (lastCompletedAt) {
    const daysSinceLast = getDaysDifference(lastCompletedAt, todayStr);
    if (daysSinceLast > 1) {
      currentStreak = 0;
    }
  } else if (successfulRepetitions === 0) {
    currentStreak = 0;
  }

  // 4. 30-Day Window Consistency
  // Look back at the past 30 calendar days (including today)
  let completionsInLast30Days = 0;
  let targetDaysInLast30Days = 0;

  for (let offset = 29; offset >= 0; offset--) {
    const checkDay = addDays(todayStr, -offset);
    const isScheduled = isQuestScheduledForDate(quest, checkDay);
    if (isScheduled) {
      targetDaysInLast30Days++;
      if (completionDatesSet.has(checkDay)) {
        completionsInLast30Days++;
      }
    }
  }

  // If the habit is newer than 30 days, determine creation anchor
  let creationDays = 30;
  if (quest.createdAt) {
    const cDate = quest.createdAt.split('T')[0];
    const diff = getDaysDifference(cDate, todayStr);
    if (diff >= 0 && diff < 30) {
      creationDays = Math.max(7, diff + 1); // minimum 7-day evaluation window to avoid harsh early penalization
    }
  }
  const effectiveTargetDays = Math.max(1, Math.min(targetDaysInLast30Days, creationDays));

  // 5. Stability Score Calculation (0 to 100)
  // Weighted:
  // - 50% from recent 30-day consistency
  // - 35% from total successful repetitions (habit volume / behavioral conditioning)
  // - 15% from current unbroken streak momentum
  let stabilityScore = 0;
  if (successfulRepetitions > 0) {
    const consistencyRatio = Math.min(1, completionsInLast30Days / effectiveTargetDays);
    const recentScore = consistencyRatio * 50;
    const repScore = Math.min(35, (successfulRepetitions / 60) * 35);
    const streakScore = Math.min(15, currentStreak * 2.5);

    stabilityScore = Math.min(100, Math.max(5, Math.round(recentScore + repScore + streakScore)));
  }

  // 6. Stability Stage based on behavioral repetitions
  const stabilityStage = getHabitStabilityStage(successfulRepetitions);

  return {
    successfulRepetitions,
    stabilityScore,
    stabilityStage,
    currentStreak,
    lastCompletedAt,
    completionsInLast30Days,
    targetDaysInLast30Days: effectiveTargetDays
  };
}
