import { describe, expect, it } from 'vitest';
import { 
  addQiyamRakats, 
  addDhohaRakats, 
  createPrayerRecoveryQuest, 
  createQiyamRecoveryQuest,
  createDhohaRecoveryQuest 
} from './prayerRecovery';
import { ATTRIBUTE_DOMAIN_MAP } from './progressionEngine';

describe('prayer recovery actions', () => {
  it('adds each Qiyam recovery pair to the existing daily count', () => {
    expect(addQiyamRakats(0, 2)).toBe(2);
    expect(addQiyamRakats(2, 2)).toBe(4);
    expect(addQiyamRakats(4, 2)).toBe(6);
  });

  it('adds each Dhoha recovery pair to the existing daily count and caps at 8', () => {
    expect(addDhohaRakats(0, 2)).toBe(2);
    expect(addDhohaRakats(2, 2)).toBe(4);
    expect(addDhohaRakats(6, 2)).toBe(8);
    expect(addDhohaRakats(8, 2)).toBe(8);
  });

  it('creates a recovery quest for a delayed prayer including Sunnah, Qiyam, and Dhoha options', () => {
    const quest = createPrayerRecoveryQuest({
      prayer: 'fajr',
      targetDate: '2026-10-03',
      completedAt: '2026-10-03T06:30:00.000Z',
      xp: 25,
      tier: 1,
    });

    expect(quest.recoveryAction).toEqual({ kind: 'sunnah-prayer', prayer: 'fajr' });
    expect(quest.recoveryActionOptions).toEqual([
      { kind: 'sunnah-prayer', prayer: 'fajr' },
      { kind: 'qiyam', rakats: 2 },
      { kind: 'dhoha', rakats: 2 },
    ]);
    expect(quest.name).toContain('Fajr');
    expect(quest.type).toBe('Recovery');
    expect(quest.attributeRewards).toEqual([{ attribute: 'Discipline', points: 1 }]);
    expect(ATTRIBUTE_DOMAIN_MAP.Discipline).toBe('Soul');
  });

  it('creates a qiyam recovery with exactly two rakahs', () => {
    const quest = createQiyamRecoveryQuest({
      targetDate: '2026-10-03',
      completedAt: '2026-10-03T23:00:00.000Z',
      xp: 25,
    });

    expect(quest.recoveryAction).toEqual({ kind: 'qiyam', rakats: 2 });
    expect(quest.name).toContain('2 Rak’ahs');
    expect(quest.attributeRewards).toEqual([{ attribute: 'Discipline', points: 1 }]);
  });

  it('creates a dhoha recovery with exactly two rakahs', () => {
    const quest = createDhohaRecoveryQuest({
      targetDate: '2026-10-03',
      completedAt: '2026-10-03T10:00:00.000Z',
      xp: 25,
    });

    expect(quest.recoveryAction).toEqual({ kind: 'dhoha', rakats: 2 });
    expect(quest.name).toContain('Ḍuḥā / Dhoha');
    expect(quest.attributeRewards).toEqual([{ attribute: 'Discipline', points: 1 }]);
  });
});
