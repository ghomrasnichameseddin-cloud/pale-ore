import { Quest, XPHistoryEntry, POSState, QuestList, QuestFolder } from '../types';
import { getDaysDifference, addDays, getWeekdayStr, getDaysInMonth } from './dateUtils';
import { getActiveJob } from '../jobsAndTitles';
import { getFailPenaltyMultiplier } from './perkEvaluator';

export const MAX_PENALTY_DAYS_LOOKBACK = 30;

export interface MidnightPenaltiesResult {
  updatedQuests: Quest[];
  updatedHistory: XPHistoryEntry[];
  updatedMomentum: number;
  recoveryModeActivated: boolean;
  daysProcessed: number;
}

/**
 * Checks if a quest is scheduled for a particular calendar date.
 */
export const isQuestScheduledForDate = (q: Quest, dateStr: string): boolean => {
  if (q.postponedTo === dateStr) {
    return true;
  }

  if (q.postponedFrom === dateStr && q.postponedTo && q.postponedTo !== dateStr) {
    return false;
  }

  if (q.deadline === dateStr) {
    return true;
  }

  if (!q.recurrence || q.recurrence === 'None') {
    return true;
  }

  const rec = q.recurrence.toLowerCase();

  // 1. Check for specific day-of-week constraints first
  const currentWeekday = getWeekdayStr(dateStr, 'short').toLowerCase();
  const fullWeekdaysMap: Record<string, string> = {
    'sunday': 'sun', 'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
    'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat'
  };

  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let hasWeekdayConstraint = false;
  let matchesWeekday = false;

  for (const day of weekdays) {
    const shortPattern = day;
    const fullPattern = Object.keys(fullWeekdaysMap).find(k => fullWeekdaysMap[k] === day) || '';
    
    if (rec.includes(shortPattern) || (fullPattern && rec.includes(fullPattern))) {
      hasWeekdayConstraint = true;
      if (currentWeekday === day) {
        matchesWeekday = true;
      }
    }
  }

  if (hasWeekdayConstraint) {
    return matchesWeekday;
  }

  // 2. Check for "Every N Days" interval pattern
  const everyDaysMatch = rec.match(/every\s+(\d+)\s+days?/i);
  if (everyDaysMatch) {
    const n = parseInt(everyDaysMatch[1], 10);
    if (n > 0) {
      const creationDateStr = q.createdAt.split('T')[0];
      const diff = getDaysDifference(creationDateStr, dateStr);
      return diff >= 0 && diff % n === 0;
    }
  }

  // 3. Check for Monthly recurrence
  if (rec === 'monthly') {
    const creationDateStr = q.createdAt.split('T')[0];
    const [, , cDay] = creationDateStr.split('-').map(Number);
    const [tYear, tMonth, tDay] = dateStr.split('-').map(Number);
    const lastDayOfTargetMonth = getDaysInMonth(tYear, tMonth);
    const targetDayToMatch = Math.min(cDay, lastDayOfTargetMonth);
    return tDay === targetDayToMatch;
  }

  // 4. Check for Weekly recurrence
  if (rec === 'weekly') {
    const creationDateStr = q.createdAt.split('T')[0];
    const creationWeekday = getWeekdayStr(creationDateStr, 'short').toLowerCase();
    return currentWeekday === creationWeekday;
  }

  // 5. Default to true for Daily or other non-weekday patterns
  return true;
};

/**
 * Checks if a quest belongs to an archived list or folder, or is directly archived.
 */
export const isQuestArchived = (
  q: Quest,
  lists: QuestList[] = [],
  folders: QuestFolder[] = []
): boolean => {
  if (q.archived) return true;
  if (q.listId) {
    const list = lists.find(l => l.id === q.listId);
    if (list?.archived) return true;
    if (list?.folderId) {
      const folder = folders.find(f => f.id === list.folderId);
      if (folder?.archived) return true;
    }
  }
  return false;
};

/**
 * Iterates through all missed days between oldDate and newDateStr (capped at MAX_PENALTY_DAYS_LOOKBACK),
 * applying quest failures, XP deductions, momentum penalties, and recovery directives.
 */
export function processMultiDayPenalties(
  prev: POSState,
  oldDate: string,
  newDateStr: string
): MidnightPenaltiesResult {
  const daysDiff = getDaysDifference(oldDate, newDateStr);

  if (daysDiff < 1) {
    return {
      updatedQuests: prev.quests,
      updatedHistory: prev.xpHistory,
      updatedMomentum: prev.profile.momentum,
      recoveryModeActivated: false,
      daysProcessed: 0
    };
  }

  const effectiveDays = Math.min(daysDiff, MAX_PENALTY_DAYS_LOOKBACK);
  const missedDays: string[] = [];
  for (let offset = effectiveDays; offset >= 1; offset--) {
    missedDays.push(addDays(newDateStr, -offset));
  }

  let updatedQuests = [...prev.quests];
  let updatedHistory = [...prev.xpHistory];
  let updatedMomentum = prev.profile.momentum;
  let recoveryModeActivated = false;

  const activeJobForMidnight = getActiveJob(
    prev.profile.jobId,
    prev.customJobs || [],
    prev.deletedJobIds || []
  );
  const penaltyReduction = getFailPenaltyMultiplier(activeJobForMidnight);

  for (const dayStr of missedDays) {
    // 1. Normalize postponed quests due on or before dayStr
    updatedQuests = updatedQuests.map(q => {
      if (q.status === 'Active' && q.postponedTo && q.postponedTo <= dayStr) {
        return {
          ...q,
          postponedFrom: null,
          postponedTo: null
        };
      }
      return q;
    });

    // 2. Identify unchecked quests active on dayStr
    const uncheckedQuests = updatedQuests.filter(q => {
      if (q.status !== 'Active') return false;
      if (isQuestArchived(q, prev.lists, prev.folders)) return false;
      if (q.type.toUpperCase() === 'PENALTY' || q.type.toUpperCase() === 'RECOVERY') return false;

      // Do not penalize if user postponed from dayStr or target deadline is in future relative to dayStr
      if (q.postponedFrom === dayStr) return false;
      if (q.postponedTo && q.postponedTo > dayStr) return false;
      if (q.deadline && q.deadline > dayStr) return false;

      if (q.recurrence && q.recurrence !== 'None') {
        const isScheduled = isQuestScheduledForDate(q, dayStr);
        if (!isScheduled) return false;

        if (q.completedAt) {
          const compDate = q.completedAt.split('T')[0];
          if (compDate === dayStr) return false;
        }

        const wasCompletedInHistory = updatedHistory.some(h =>
          h.questId === q.id &&
          h.xp > 0 &&
          h.timestamp &&
          h.timestamp.startsWith(dayStr)
        );
        if (wasCompletedInHistory) return false;

        return true;
      } else {
        // One-off quest
        return Boolean(q.deadline && q.deadline <= dayStr);
      }
    });

    // 3. Process penalties for unchecked quests on dayStr
    uncheckedQuests.forEach(q => {
      const typeUpper = q.type.toUpperCase();
      const isDailyOrHabit = typeUpper === 'HABIT' || q.recurrence === 'Daily' || (q.recurrence && q.recurrence !== 'None');
      const isSideOrOptional = typeUpper === 'SIDE' || typeUpper === 'OPTIONAL';
      const origEstTime = typeof q.estimatedTime === 'number' && q.estimatedTime > 0 ? q.estimatedTime : 30;
      const recoveryEstTime = Math.max(1, Math.round(origEstTime / 2));

      if (isSideOrOptional) {
        // Side/optional: 0 XP penalty, 0 momentum penalty
        if (!q.recurrence || q.recurrence === 'None') {
          updatedQuests = updatedQuests.map(uq => {
            if (uq.id === q.id) {
              return {
                ...uq,
                status: 'Failed' as const,
                completedAt: `${dayStr}T23:59:59.000Z`
              };
            }
            return uq;
          });
        }
        return;
      }

      // Main, Habit, Boss, or other standard quest
      let penaltyXp = 50;
      if (q.difficulty === 'Easy') penaltyXp = 25;
      else if (q.difficulty === 'Normal') penaltyXp = 50;
      else if (q.difficulty === 'Hard') penaltyXp = 100;
      else if (q.difficulty === 'Boss') penaltyXp = 250;

      const isCritical = typeUpper === 'MAIN' || typeUpper === 'BOSS' || q.difficulty === 'Hard' || q.difficulty === 'Boss';
      const basePenaltyXp = isCritical ? penaltyXp * 1.5 : penaltyXp;
      const finalPenaltyXp = Math.round(basePenaltyXp * penaltyReduction);

      const xpHistoryId = `h-fail-midnight-${q.id}-${dayStr}`;
      if (!updatedHistory.some(h => h.id === xpHistoryId)) {
        const penaltyEntry: XPHistoryEntry = {
          id: xpHistoryId,
          questId: q.id,
          questName: isDailyOrHabit 
            ? `💀 MIDNIGHT PENALTY: Lapsed habit "${q.name}"` 
            : `💀 MIDNIGHT PENALTY: Unchecked "${q.name}"`,
          xp: -Math.round(finalPenaltyXp),
          timestamp: `${dayStr}T23:59:59.000Z`,
          skillIds: q.relatedSkills || []
        };
        updatedHistory.unshift(penaltyEntry);
      }

      const momentumLoss = isCritical ? 25 : 10;
      updatedMomentum = Math.max(0, updatedMomentum - momentumLoss);

      // If one-off, mark as Failed
      if (!q.recurrence || q.recurrence === 'None') {
        updatedQuests = updatedQuests.map(uq => {
          if (uq.id === q.id) {
            return {
              ...uq,
              status: 'Failed' as const,
              completedAt: `${dayStr}T23:59:59.000Z`
            };
          }
          return uq;
        });
      }

      // Generate recovery directive if none active for this quest
      const origXp = (typeof q.xp === 'number' && q.xp > 0)
        ? q.xp
        : (q.difficulty === 'Boss' ? 250 : q.difficulty === 'Hard' ? 100 : q.difficulty === 'Easy' ? 25 : 50);
      const recoveryXp = Math.max(5, Math.round(origXp / 2));

      const hasActiveRecovery = updatedQuests.some(uq =>
        uq.status === 'Active' &&
        uq.type === 'Recovery' &&
        (uq.id === `q-recovery-${q.id}` || uq.id.startsWith(`q-recovery-${q.id}-`))
      );

      if (!hasActiveRecovery) {
        const recoveryQuest: Quest = {
          id: `q-recovery-${q.id}-${dayStr}`,
          name: `🛡️ RECOVERY: Resolve "${q.name}"`,
          description: `Recovery directive generated for failed/unchecked ${q.type} objective "${q.name}". Complete this condensed routine (${recoveryEstTime} mins, +${recoveryXp} XP) to restore operations.`,
          status: 'Active',
          difficulty: q.difficulty === 'Custom' ? 'Normal' : q.difficulty,
          type: 'Recovery',
          estimatedTime: recoveryEstTime,
          recurrence: 'None',
          energyLevel: 'Medium',
          deadline: newDateStr,
          createdAt: `${dayStr}T23:59:59.000Z`,
          completedAt: null,
          xp: recoveryXp,
          goalId: q.goalId || null,
          projectId: q.projectId || null,
          milestoneId: q.milestoneId || null,
          subquests: [
            {
              id: `sq-rec-${q.id}-1`,
              name: `Execute condensed ${recoveryEstTime}-min recovery session for "${q.name}"`,
              completed: false
            }
          ],
          relatedSkills: q.relatedSkills || []
        };
        updatedQuests.push(recoveryQuest);
        recoveryModeActivated = true;
      }
    });
  }

  // Final normalization for target date
  updatedQuests = updatedQuests.map(q => {
    if (q.status === 'Active' && q.postponedTo && q.postponedTo <= newDateStr) {
      return {
        ...q,
        postponedFrom: null,
        postponedTo: null
      };
    }
    return q;
  });

  return {
    updatedQuests,
    updatedHistory,
    updatedMomentum,
    recoveryModeActivated,
    daysProcessed: effectiveDays
  };
}
