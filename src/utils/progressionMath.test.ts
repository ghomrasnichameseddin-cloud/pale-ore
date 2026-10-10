import { describe, it, expect } from 'vitest';
import { calculateAttributePoints, calculateSkillXp } from './progressionMath';

describe('Progression Math Engine', () => {
  it('negative history reduces skill XP instead of clamping to zero', () => {
    const xp = calculateSkillXp(
      'skill-1',
      [
        { xp: 120, skillIds: ['skill-1'] },
        { xp: -45, skillIds: ['skill-1'] }
      ] as any,
      [{ id: 'skill-1', tier: 'Primary' }] as any
    );

    expect(xp).toBe(75);
  });

  it('negative quest events reduce attribute points instead of resetting to zero', () => {
    const points = calculateAttributePoints(
      'Discipline',
      [
        { type: 'Habit', difficulty: 'Normal', skillIds: [], streak: 2, xp: 80 },
        { type: 'Habit', difficulty: 'Normal', skillIds: [], streak: 2, xp: -40 }
      ] as any,
      []
    );

    expect(points).toBe(0);
  });
});
