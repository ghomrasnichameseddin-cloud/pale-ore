import { describe, expect, it } from 'vitest';
import { createPrayerRecoveryQuest, createQiyamRecoveryQuest } from './prayerRecovery';

describe('prayer recovery actions', () => {
  it('creates a sunnah rawatib recovery for a delayed prayer', () => {
    const quest = createPrayerRecoveryQuest({
      prayer: 'fajr',
      targetDate: '2026-10-03',
      completedAt: '2026-10-03T06:30:00.000Z',
      xp: 25,
      tier: 1,
    });

    expect(quest.recoveryAction).toEqual({ kind: 'sunnah-prayer', prayer: 'fajr' });
    expect(quest.name).toContain('Fajr');
    expect(quest.type).toBe('Recovery');
  });

  it('creates a qiyam recovery with exactly two rakahs', () => {
    const quest = createQiyamRecoveryQuest({
      targetDate: '2026-10-03',
      completedAt: '2026-10-03T23:00:00.000Z',
      xp: 25,
    });

    expect(quest.recoveryAction).toEqual({ kind: 'qiyam', rakats: 2 });
    expect(quest.name).toContain('2 Rak’ahs');
  });
});
