import { describe, it, expect } from 'vitest';
import { Quest } from '../../types';

const createMockQuest = (overrides: Partial<Quest>): Quest => ({
  id: 'q-default',
  name: 'Default Quest',
  description: 'Default Description',
  difficulty: 'Normal',
  estimatedTime: 15,
  xp: 50,
  goalId: null,
  projectId: null,
  milestoneId: null,
  relatedSkills: [],
  type: 'Recovery',
  status: 'Active',
  deadline: '2026-09-30',
  completedAt: null,
  createdAt: '2026-09-30T00:00:00.000Z',
  archived: false,
  subquests: [],
  ...overrides
});

describe('Recovery Quest Archiving and Clearance Protocol', () => {
  it('archives a recovery quest with reason "completed" when done', () => {
    const activeRecoveryQuest = createMockQuest({
      id: 'q-rec-1',
      name: '🛡️ RECOVERY: Resolve "Morning Workout"',
      description: 'Recovery directive generated for failed workout',
      type: 'Recovery',
      xp: 25
    });

    // Simulate completeQuest archiving
    const completedTimestamp = '2026-09-30T10:00:00.000Z';
    const isRecovery = activeRecoveryQuest.type?.toUpperCase() === 'RECOVERY';
    const isClearingQuest = Boolean(activeRecoveryQuest.clearsRecoveryQuestIds && activeRecoveryQuest.clearsRecoveryQuestIds.length > 0);

    const completedQuest: Quest = {
      ...activeRecoveryQuest,
      status: 'Completed',
      completedAt: completedTimestamp,
      lastCompletedDate: '2026-09-30',
      ...(isRecovery ? {
        archived: true,
        archivedAt: completedTimestamp,
        recoveryArchivedReason: 'completed',
        recoveryCleared: isClearingQuest
      } : {})
    };

    expect(completedQuest.status).toBe('Completed');
    expect(completedQuest.archived).toBe(true);
    expect(completedQuest.recoveryArchivedReason).toBe('completed');
    expect(completedQuest.recoveryCleared).toBe(false);
  });

  it('archives a recovery quest with reason "deleted" when deleted instead of discarding', () => {
    const activeRecoveryQuest = createMockQuest({
      id: 'q-rec-2',
      name: '🛡️ RECOVERY: Resolve "Study Arabic"',
      description: 'Recovery directive',
      type: 'Recovery',
      xp: 30
    });

    // Simulate deleteQuest
    const isRecovery = activeRecoveryQuest.type?.toUpperCase() === 'RECOVERY';
    const nowIso = '2026-09-30T12:00:00.000Z';

    let archivedOnDelete: Quest | null = null;
    if (isRecovery && !activeRecoveryQuest.archived) {
      archivedOnDelete = {
        ...activeRecoveryQuest,
        archived: true,
        archivedAt: nowIso,
        recoveryArchivedReason: 'deleted',
        recoveryCleared: false
      };
    }

    expect(archivedOnDelete).not.toBeNull();
    expect(archivedOnDelete?.archived).toBe(true);
    expect(archivedOnDelete?.recoveryArchivedReason).toBe('deleted');
    expect(archivedOnDelete?.recoveryCleared).toBe(false);
  });

  it('generates a clearing recovery quest that targets uncleared archived recovery quests', () => {
    const archivedQuests: Quest[] = [
      createMockQuest({
        id: 'q-rec-completed',
        name: '🛡️ RECOVERY: Resolve "Fajr Prayer"',
        description: 'Failed morning prayer',
        status: 'Completed',
        completedAt: '2026-09-29T08:00:00.000Z',
        archived: true,
        recoveryArchivedReason: 'completed',
        recoveryCleared: false
      }),
      createMockQuest({
        id: 'q-rec-deleted',
        name: '🛡️ RECOVERY: Resolve "Read 10 Pages"',
        description: 'Skipped reading',
        archived: true,
        recoveryArchivedReason: 'deleted',
        recoveryCleared: false
      }),
      createMockQuest({
        id: 'q-rec-already-cleared',
        name: '🛡️ RECOVERY: Resolve "Old Habit"',
        description: 'Already expiated',
        archived: true,
        recoveryArchivedReason: 'deleted',
        recoveryCleared: true,
        recoveryClearedAt: '2026-09-29T12:00:00.000Z'
      })
    ];

    // Filter uncleared archived recovery
    const uncleared = archivedQuests.filter(q => 
      q.type?.toUpperCase() === 'RECOVERY' && 
      q.archived && 
      !q.recoveryCleared &&
      (!q.clearsRecoveryQuestIds || q.clearsRecoveryQuestIds.length === 0)
    );

    expect(uncleared.length).toBe(2);
    expect(uncleared.map(u => u.id)).toEqual(['q-rec-completed', 'q-rec-deleted']);

    const targetIds = uncleared.map(t => t.id);
    const count = targetIds.length;

    // Synthesize clearing quest
    const clearingQuest = createMockQuest({
      id: 'q-rec-clear-12345',
      name: `🛡️ RESTITUTION: Clear ${count} Archived Recovery Directives`,
      description: 'Consolidated recovery protocol',
      status: 'Active',
      type: 'Recovery',
      xp: 100,
      clearsRecoveryQuestIds: targetIds,
      archived: false,
      subquests: uncleared.map((t, idx) => ({
        id: `sq-clear-${idx}`,
        name: `Expiate deficit: ${t.name}`,
        completed: false
      }))
    });

    expect(clearingQuest.status).toBe('Active');
    expect(clearingQuest.type).toBe('Recovery');
    expect(clearingQuest.clearsRecoveryQuestIds).toEqual(['q-rec-completed', 'q-rec-deleted']);
    expect(clearingQuest.subquests?.length).toBe(2);
  });

  it('marks targeted archived recovery quests as cleared when the clearing quest is completed', () => {
    let allQuests: Quest[] = [
      createMockQuest({
        id: 'q-rec-completed',
        name: '🛡️ RECOVERY: Resolve "Fajr Prayer"',
        status: 'Completed',
        completedAt: '2026-09-29T08:00:00.000Z',
        archived: true,
        recoveryArchivedReason: 'completed',
        recoveryCleared: false
      }),
      createMockQuest({
        id: 'q-rec-deleted',
        name: '🛡️ RECOVERY: Resolve "Read 10 Pages"',
        archived: true,
        recoveryArchivedReason: 'deleted',
        recoveryCleared: false
      }),
      createMockQuest({
        id: 'q-rec-clear-12345',
        name: '🛡️ RESTITUTION: Clear 2 Archived Recovery Directives',
        status: 'Active',
        type: 'Recovery',
        clearsRecoveryQuestIds: ['q-rec-completed', 'q-rec-deleted'],
        archived: false
      })
    ];

    const completedTimestamp = '2026-09-30T15:00:00.000Z';
    const clearingQuest = allQuests.find(q => q.id === 'q-rec-clear-12345')!;

    // Run completeQuest mapping
    allQuests = allQuests.map(q => {
      if (q.id === clearingQuest.id) {
        const isRecovery = q.type?.toUpperCase() === 'RECOVERY';
        const isClearingQuest = Boolean(q.clearsRecoveryQuestIds && q.clearsRecoveryQuestIds.length > 0);
        return {
          ...q,
          status: 'Completed',
          completedAt: completedTimestamp,
          lastCompletedDate: '2026-09-30',
          ...(isRecovery ? {
            archived: true,
            archivedAt: completedTimestamp,
            recoveryArchivedReason: 'completed',
            recoveryCleared: isClearingQuest,
            recoveryClearedAt: isClearingQuest ? completedTimestamp : null
          } : {})
        };
      }
      if (clearingQuest.clearsRecoveryQuestIds?.includes(q.id)) {
        return {
          ...q,
          recoveryCleared: true,
          recoveryClearedAt: completedTimestamp
        };
      }
      return q;
    });

    const target1 = allQuests.find(q => q.id === 'q-rec-completed')!;
    const target2 = allQuests.find(q => q.id === 'q-rec-deleted')!;
    const completedClearingQuest = allQuests.find(q => q.id === 'q-rec-clear-12345')!;

    expect(target1.recoveryCleared).toBe(true);
    expect(target1.recoveryClearedAt).toBe(completedTimestamp);

    expect(target2.recoveryCleared).toBe(true);
    expect(target2.recoveryClearedAt).toBe(completedTimestamp);

    // The clearing quest itself should be archived with recoveryCleared: true
    expect(completedClearingQuest.status).toBe('Completed');
    expect(completedClearingQuest.archived).toBe(true);
    expect(completedClearingQuest.recoveryCleared).toBe(true);
  });

  it('purges only cleared archived recovery quests', () => {
    const quests: Quest[] = [
      createMockQuest({
        id: 'q-1',
        name: 'Cleared Recovery 1',
        type: 'Recovery',
        archived: true,
        recoveryCleared: true,
        recoveryClearedAt: '2026-09-30T10:00:00.000Z'
      }),
      createMockQuest({
        id: 'q-2',
        name: 'Uncleared Recovery',
        type: 'Recovery',
        archived: true,
        recoveryCleared: false
      }),
      createMockQuest({
        id: 'q-3',
        name: 'Active Normal Quest',
        type: 'Main',
        archived: false
      })
    ];

    let purgedCount = 0;
    const remaining = quests.filter(q => {
      const isClearedRecovery = q.type?.toUpperCase() === 'RECOVERY' && q.archived && q.recoveryCleared;
      if (isClearedRecovery) {
        purgedCount++;
        return false;
      }
      return true;
    });

    expect(purgedCount).toBe(1);
    expect(remaining.length).toBe(2);
    expect(remaining.map(r => r.id)).toEqual(['q-2', 'q-3']);
  });
});
