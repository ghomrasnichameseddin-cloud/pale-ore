import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateAttributePoints, calculateSkillXp } from './progressionMath';

test('negative history reduces skill XP instead of clamping to zero', () => {
  const xp = calculateSkillXp(
    'skill-1',
    [
      { xp: 120, skillIds: ['skill-1'] },
      { xp: -45, skillIds: ['skill-1'] }
    ],
    [{ id: 'skill-1', tier: 'Primary' }]
  );

  assert.equal(xp, 75);
});

test('negative quest events reduce attribute points instead of resetting to zero', () => {
  const points = calculateAttributePoints(
    'Discipline',
    [
      { type: 'Habit', difficulty: 'Normal', skillIds: [], streak: 2, xp: 80 },
      { type: 'Habit', difficulty: 'Normal', skillIds: [], streak: 2, xp: -40 }
    ],
    []
  );

  assert.equal(points, 0);
});
