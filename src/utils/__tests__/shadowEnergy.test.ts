import { describe, expect, it } from 'vitest';
import {
  SHADOW_VESSELS,
  calculateHarmony,
  calculateShadowEnergyGain,
  getShadowEnergyVesselState,
  createDefaultShadowEnergyState,
  applyShadowEnergyGain
} from '../shadowEnergy';

describe('Shadow Energy', () => {
  it('rewards balance over imbalance', () => {
    expect(calculateHarmony(90, 40, 80)).toBeLessThan(calculateHarmony(76, 72, 79));
  });

  it('uses conservative deterministic multipliers', () => {
    const result = calculateShadowEnergyGain({
      baseContribution: 100,
      harmony: 84,
      consistencyMultiplier: 1.1,
      difficultyMultiplier: 1.3,
      domain: 'Mind'
    });

    expect(result).toBe(120);
  });

  it('completes a vessel and carries overflow into the next one', () => {
    const state = createDefaultShadowEnergyState();
    const withGain = applyShadowEnergyGain(state, 300, 'test-overflow');

    expect(withGain.current).toBe(100);
    expect(withGain.currentVessel).toBe(2);
    expect(withGain.completedVessels).toEqual([1]);
    expect(withGain.vesselProgress).toBe(25);
    expect(withGain.ledger[0].finalEnergyGained).toBe(100);
  });

  it('prevents duplicate ledger records for the same source event', () => {
    const state = createDefaultShadowEnergyState();
    const first = applyShadowEnergyGain(state, 50, 'test-duplicate');
    const second = applyShadowEnergyGain(first, 50, 'test-duplicate');

    expect(second.ledger).toHaveLength(1);
    expect(second.current).toBe(50);
  });

  it('marks the final vessel as complete without creating Vessel VIII', () => {
    const finalState = {
      ...createDefaultShadowEnergyState(),
      currentVessel: 7,
      current: SHADOW_VESSELS[6].requirement,
      completedVessels: [1, 2, 3, 4, 5, 6]
    };

    const result = applyShadowEnergyGain(finalState, 50, 'final-vessel');

    expect(result.currentVessel).toBe(7);
    expect(result.completedVessels).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(result.cycleComplete).toBe(true);
    expect(result.current).toBe(50);
  });

  it('uses the first incomplete vessel as the active vessel', () => {
    const state = {
      ...createDefaultShadowEnergyState(),
      completedVessels: [1, 2]
    };

    expect(getShadowEnergyVesselState(state).currentVessel).toBe(3);
  });
});
