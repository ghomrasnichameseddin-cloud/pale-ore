import { POSState, Quest, Goal, Project, SystemMessage } from '../types';
import { getLocalDateString } from '../initialState';
import { sendNativeNotification } from './nativeNotifications';

export interface DelayedItem {
  id: string;
  entityType: 'quest' | 'goal' | 'project';
  title: string;
  deadline: string;
  daysOverdue: number;
  urgency: 'critical' | 'high' | 'moderate';
  detail: string;
  xp?: number;
}

export interface DelayedScanResult {
  delayedQuests: DelayedItem[];
  delayedGoals: DelayedItem[];
  delayedProjects: DelayedItem[];
  totalDelayedCount: number;
  criticalCount: number;
  items: DelayedItem[];
}

/**
 * Calculates how many days a deadline is overdue relative to systemDate.
 * Returns > 0 if overdue, 0 if due today, < 0 if due in future.
 */
export const calculateDaysOverdue = (deadlineStr: string, currentSysDate: string): number => {
  try {
    const deadlineTime = new Date(deadlineStr).getTime();
    const currentTime = new Date(currentSysDate).getTime();
    if (isNaN(deadlineTime) || isNaN(currentTime)) return 0;
    
    // Convert to days difference
    const diffMs = currentTime - deadlineTime;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

/**
 * Scans the entire POSState for overdue/delayed quests, goals, and projects.
 */
export const scanAllDelayedItems = (state: POSState): DelayedScanResult => {
  const currentSysDate = state.systemDate || getLocalDateString();
  const delayedQuests: DelayedItem[] = [];
  const delayedGoals: DelayedItem[] = [];
  const delayedProjects: DelayedItem[] = [];

  // 1. Scan Active Quests
  const quests = state.quests || [];
  quests.forEach((q: Quest) => {
    if (q.status !== 'Active') return;

    // Check primary deadline or postponed date
    const effectiveDeadline = q.postponedTo || q.deadline;
    if (!effectiveDeadline) return;

    if (effectiveDeadline < currentSysDate) {
      const days = Math.max(1, calculateDaysOverdue(effectiveDeadline, currentSysDate));
      const urgency: DelayedItem['urgency'] = days >= 7 ? 'critical' : days >= 3 ? 'high' : 'moderate';

      delayedQuests.push({
        id: q.id,
        entityType: 'quest',
        title: q.name,
        deadline: effectiveDeadline,
        daysOverdue: days,
        urgency,
        detail: `${q.type} Quest • ${q.difficulty} (${q.xp} XP) • Due ${effectiveDeadline}`,
        xp: q.xp
      });
    }
  });

  // 2. Scan In-Progress Goals
  const goals = state.goals || [];
  goals.forEach((g: Goal) => {
    if (g.status === 'Completed' || g.status === 'Archived') return;

    const targetDate = g.deadline || g.estimatedCompletion;
    // Simple check if it looks like a date string YYYY-MM-DD
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      if (targetDate < currentSysDate) {
        const days = Math.max(1, calculateDaysOverdue(targetDate, currentSysDate));
        const urgency: DelayedItem['urgency'] = days >= 14 ? 'critical' : days >= 5 ? 'high' : 'moderate';

        delayedGoals.push({
          id: g.id,
          entityType: 'goal',
          title: g.name,
          deadline: targetDate,
          daysOverdue: days,
          urgency,
          detail: `Goal (${g.priority} Priority, ${g.horizon || 'Strategic'}) • Due ${targetDate}`
        });
      }
    }
  });

  // 3. Scan Active Projects
  const projects = state.projects || [];
  projects.forEach((p: Project) => {
    if (p.archived || p.status === 'Completed' || p.status === 'Paused') return;

    if (p.deadline && /^\d{4}-\d{2}-\d{2}$/.test(p.deadline.trim())) {
      if (p.deadline < currentSysDate) {
        const days = Math.max(1, calculateDaysOverdue(p.deadline, currentSysDate));
        const urgency: DelayedItem['urgency'] = days >= 10 ? 'critical' : days >= 4 ? 'high' : 'moderate';

        delayedProjects.push({
          id: p.id,
          entityType: 'project',
          title: p.name,
          deadline: p.deadline,
          daysOverdue: days,
          urgency,
          detail: `Active Campaign • Est. ${p.estimatedTime || 'N/A'} • Due ${p.deadline}`
        });
      }
    }
  });

  const allItems = [...delayedQuests, ...delayedGoals, ...delayedProjects].sort((a, b) => b.daysOverdue - a.daysOverdue);
  const criticalCount = allItems.filter(i => i.urgency === 'critical').length;

  return {
    delayedQuests,
    delayedGoals,
    delayedProjects,
    totalDelayedCount: allItems.length,
    criticalCount,
    items: allItems
  };
};

/**
 * Dispatches notifications and system messages for newly discovered delayed items.
 * Prevents spamming duplicates on the same date.
 */
export const generateDelayedNotifications = async (
  state: POSState,
  addSystemMessage: (msg: Omit<SystemMessage, 'id' | 'timestamp' | 'read'>) => string,
  options: { forceNotify?: boolean; onOpenInbox?: () => void } = {}
): Promise<{ addedCount: number; scanResult: DelayedScanResult }> => {
  const scanResult = scanAllDelayedItems(state);
  const existingMessages = state.messages || [];
  const currentSysDate = state.systemDate || getLocalDateString();
  let addedCount = 0;

  if (scanResult.totalDelayedCount === 0) {
    return { addedCount: 0, scanResult };
  }

  // Find items that don't already have an active unread delayed message today
  const itemsToNotify: DelayedItem[] = [];

  scanResult.items.forEach(item => {
    const alreadyNotifiedToday = existingMessages.some(m => 
      m.category === 'delayed' && 
      m.entityId === item.id && 
      m.timestamp.startsWith(currentSysDate)
    );

    if (options.forceNotify || !alreadyNotifiedToday) {
      itemsToNotify.push(item);
    }
  });

  // Limit batching to prevent flooding (maximum 4 discrete messages per scan)
  const prioritizedItems = itemsToNotify.slice(0, 4);

  prioritizedItems.forEach(item => {
    const typeLabel = item.entityType === 'quest' ? 'Quest' : item.entityType === 'goal' ? 'Strategic Goal' : 'Project Campaign';
    const urgencyEmoji = item.urgency === 'critical' ? '🚨' : item.urgency === 'high' ? '⚠️' : '⏳';

    addSystemMessage({
      sender: 'DECREE_WATCH',
      category: 'delayed',
      priority: item.urgency === 'critical' ? 'urgent' : item.urgency === 'high' ? 'high' : 'medium',
      title: `${urgencyEmoji} Delayed ${typeLabel}: "${item.title}"`,
      content: `This ${typeLabel.toLowerCase()} is overdue by ${item.daysOverdue} day${item.daysOverdue > 1 ? 's' : ''} (Deadline was ${item.deadline}). Immediate recalibration or completion required to preserve momentum.`,
      entityType: item.entityType,
      entityId: item.id,
      entityName: item.title,
      daysDelayed: item.daysOverdue,
      dueDate: item.deadline
    });
    addedCount++;
  });

  // If there are multiple items, send an aggregated native PC & Mobile notification
  if (itemsToNotify.length > 0) {
    const topItem = itemsToNotify[0];
    const moreText = itemsToNotify.length > 1 ? ` (+${itemsToNotify.length - 1} other directives delayed)` : '';

    await sendNativeNotification({
      title: `⚔️ Pale Ore: ${scanResult.totalDelayedCount} Directives Overdue`,
      body: `Delayed ${topItem.entityType}: "${topItem.title}" is ${topItem.daysOverdue}d overdue${moreText}. Open sanctum to review.`,
      soundCategory: 'delayed',
      vibrate: [250, 100, 250, 100, 250],
      tag: 'pale-ore-delayed-audit',
      onClick: options.onOpenInbox
    });
  }

  return { addedCount, scanResult };
};

/**
 * Calculates a new date string YYYY-MM-DD by adding N days to the system date or today.
 */
export const calculateSnoozeDate = (daysToAdd: number, systemDateStr?: string): string => {
  const ref = systemDateStr || getLocalDateString();
  const d = new Date(ref);
  d.setDate(d.getDate() + daysToAdd);
  return getLocalDateString(d);
};

/**
 * Snoozes a delayed entity forward by N days from the current system date.
 */
export const snoozeEntity = (
  entityType: 'quest' | 'goal' | 'project',
  entityId: string,
  daysToAdd: number,
  state: POSState,
  handlers: {
    updateQuest: (id: string, u: Partial<Quest>) => void;
    updateGoal: (id: string, u: Partial<Goal>) => void;
    updateProject: (id: string, u: Partial<Project>) => void;
  }
): string => {
  const newDate = calculateSnoozeDate(daysToAdd, state.systemDate);
  if (entityType === 'quest') {
    const q = (state.quests || []).find(item => item.id === entityId);
    handlers.updateQuest(entityId, {
      postponedFrom: q?.postponedFrom || q?.deadline,
      postponedTo: newDate,
      deadline: newDate
    });
  } else if (entityType === 'goal') {
    handlers.updateGoal(entityId, {
      deadline: newDate,
      estimatedCompletion: newDate
    });
  } else if (entityType === 'project') {
    handlers.updateProject(entityId, {
      deadline: newDate
    });
  }
  return newDate;
};
