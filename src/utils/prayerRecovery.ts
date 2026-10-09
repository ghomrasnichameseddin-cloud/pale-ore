import { Quest, PrayerRecoveryAction } from '../types';

export const createPrayerRecoveryQuest = ({
  prayer,
  targetDate,
  completedAt,
  xp,
  tier,
}: {
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  targetDate: string;
  completedAt: string;
  xp: number;
  tier: number;
}): Quest => {
  const prayerLabel = prayer.charAt(0).toUpperCase() + prayer.slice(1);
  const recoveryActionOptions: PrayerRecoveryAction[] = [
    { kind: 'sunnah-prayer', prayer },
    { kind: 'qiyam', rakats: 2 },
  ];

  return {
    id: `quest-kaffarah-delay-${prayer}-${targetDate}`,
    name: `[KAFFĀRAH] Sunnah Rawātib Recovery (${prayerLabel} Delay)`,
    description: `Perform the Sunnah Rawātib for ${prayerLabel} (${targetDate}) to complete this restitution. This recovery fulfills the delayed-prayer obligation and records it in the Sacred Protocol.`,
    type: 'Recovery',
    difficulty: tier >= 3 ? 'Hard' : tier === 2 ? 'Normal' : 'Easy',
    xp,
    estimatedTime: 20,
    deadline: targetDate,
    status: 'Active',
    recurrence: 'None',
    streakCount: 0,
    completedAt: null,
    lastCompletedDate: null,
    postponedFrom: null,
    postponedTo: null,
    goalId: null,
    projectId: null,
    milestoneId: null,
    listId: null,
    relatedSkills: [],
    attributeRewards: [{ attribute: 'Discipline', points: 1 }],
    createdAt: completedAt,
    recoveryAction: recoveryActionOptions[0],
    recoveryActionOptions,
  };
};

export const createQiyamRecoveryQuest = ({
  targetDate,
  completedAt,
  xp,
}: {
  targetDate: string;
  completedAt: string;
  xp: number;
}): Quest => ({
  id: `quest-qiyam-recovery-${targetDate}`,
  name: '[KAFFĀRAH] 2 Rak’ahs of Qiyām al-Layl',
  description: 'Perform 2 Rak’ahs of Qiyām al-Layl to complete this restitution. The Sacred Protocol will record the action as completed.',
  type: 'Recovery',
  difficulty: 'Easy',
  xp,
  estimatedTime: 15,
  deadline: targetDate,
  status: 'Active',
  recurrence: 'None',
  streakCount: 0,
  completedAt: null,
  lastCompletedDate: null,
  postponedFrom: null,
  postponedTo: null,
  goalId: null,
  projectId: null,
  milestoneId: null,
  listId: null,
  relatedSkills: [],
  attributeRewards: [{ attribute: 'Discipline', points: 1 }],
  createdAt: completedAt,
  recoveryAction: { kind: 'qiyam', rakats: 2 },
  recoveryActionOptions: [{ kind: 'qiyam', rakats: 2 }],
});
