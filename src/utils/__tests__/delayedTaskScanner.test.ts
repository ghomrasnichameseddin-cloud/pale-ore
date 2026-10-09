import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_STATE } from '../../initialState';
import { POSState, Quest, SystemMessage } from '../../types';

vi.mock('../nativeNotifications', () => ({
  sendNativeNotification: vi.fn().mockResolvedValue(undefined)
}));

import { sendNativeNotification } from '../nativeNotifications';
import { generateDelayedNotifications } from '../delayedTaskScanner';

const overdueQuest: Quest = {
  id: 'quest-overdue-test',
  name: 'Overdue test quest',
  description: 'A test quest',
  status: 'Active',
  difficulty: 'Normal',
  type: 'Main',
  estimatedTime: 30,
  recurrence: 'None',
  energyLevel: 'Medium',
  deadline: '2026-10-08',
  createdAt: '2026-10-01T00:00:00.000Z',
  completedAt: null,
  xp: 100,
  goalId: null,
  projectId: null,
  milestoneId: null,
  subquests: [],
  relatedSkills: []
};

const overdueMessage: SystemMessage = {
  id: 'message-overdue-test',
  sender: 'DECREE_WATCH',
  category: 'delayed',
  title: 'Delayed Quest: "Overdue test quest"',
  content: 'This quest is overdue.',
  timestamp: '2026-10-09T08:00:00.000Z',
  read: false,
  entityType: 'quest',
  entityId: overdueQuest.id
};

describe('delayed task notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not duplicate a persistent inbox message during a forced audit', async () => {
    const state: POSState = {
      ...INITIAL_STATE,
      systemDate: '2026-10-09',
      quests: [overdueQuest],
      goals: [],
      projects: [],
      messages: [overdueMessage]
    };
    const addSystemMessage = vi.fn(() => 'unexpected-message-id');

    const result = await generateDelayedNotifications(state, addSystemMessage, { forceNotify: true });

    expect(result.addedCount).toBe(0);
    expect(addSystemMessage).not.toHaveBeenCalled();
    expect(sendNativeNotification).toHaveBeenCalledTimes(1);
  });
});