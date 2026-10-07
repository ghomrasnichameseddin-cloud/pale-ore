export type ShadowDomain = 'Mind' | 'Body' | 'Soul';

export interface ShadowVessel {
  number: number;
  requirement: number;
  title: string;
  description: string;
}

export interface ShadowEnergyLedgerEntry {
  id: string;
  sourceId: string;
  sourceType: 'quest' | 'domain' | 'manual';
  domain: ShadowDomain;
  baseContribution: number;
  harmony: number;
  consistencyMultiplier: number;
  difficultyMultiplier: number;
  generated: number;
  finalEnergyGained: number;
  timestamp: string;
}

export interface ShadowEnergyState {
  current: number;
  currentVessel: number;
  completedVessels: number[];
  cycleComplete: boolean;
  vesselProgress: number;
  ledger: ShadowEnergyLedgerEntry[];
}

export interface ShadowEnergyGainInput {
  baseContribution: number;
  harmony: number;
  consistencyMultiplier: number;
  difficultyMultiplier: number;
  domain: ShadowDomain;
  sourceType?: 'quest' | 'domain' | 'manual';
}

export const SHADOW_VESSELS: readonly ShadowVessel[] = [
  { number: 1, requirement: 200, title: 'Vessel I: First Shadow', description: 'The initial vessel awakens.' },
  { number: 2, requirement: 400, title: 'Vessel II: Veiled Form', description: 'The vessel stabilizes.' },
  { number: 3, requirement: 600, title: 'Vessel III: Murmured Will', description: 'Patterns begin to harden.' },
  { number: 4, requirement: 800, title: 'Vessel IV: Silent Strength', description: 'Shadow becomes deliberate.' },
  { number: 5, requirement: 1000, title: 'Vessel V: Lunar Resolve', description: 'The vessel holds sustained force.' },
  { number: 6, requirement: 1250, title: 'Vessel VI: Nocturnal Harmony', description: 'The force bends toward balance.' },
  { number: 7, requirement: 1500, title: 'Vessel VII: Astral Mirror', description: 'The vessel reflects the self.' }
] as const;

export const createDefaultShadowEnergyState = (): ShadowEnergyState => ({
  current: 0,
  currentVessel: 1,
  completedVessels: [],
  cycleComplete: false,
  vesselProgress: 0,
  ledger: []
});

export function calculateHarmony(mind: number, body: number, soul: number): number {
  const values = [mind, body, soul].map(value => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)));
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const spread = Math.abs(mind - body) + Math.abs(body - soul) + Math.abs(soul - mind);
  const balance = Math.max(0, 100 - spread / 3);
  return Math.round((average * 0.7) + (balance * 0.3));
}

export function calculateShadowEnergyGain({
  baseContribution,
  harmony,
  consistencyMultiplier,
  difficultyMultiplier,
  domain
}: ShadowEnergyGainInput): number {
  const safeBase = Math.max(0, Number.isFinite(baseContribution) ? baseContribution : 0);
  const safeHarmony = Math.max(0, Math.min(100, Number.isFinite(harmony) ? harmony : 0));
  const safeConsistency = Math.max(0.5, Number.isFinite(consistencyMultiplier) ? consistencyMultiplier : 1);
  const safeDifficulty = Math.max(0.5, Number.isFinite(difficultyMultiplier) ? difficultyMultiplier : 1);
  const domainWeight = domain === 'Body' ? 1.05 : domain === 'Soul' ? 1.1 : 1;
  return Math.round(safeBase * (safeHarmony / 100) * safeConsistency * safeDifficulty * domainWeight);
}

export function getShadowEnergyVesselState(state: ShadowEnergyState): ShadowEnergyState {
  let currentVessel = Math.max(1, state.currentVessel || 1);
  const completedVessels = new Set(state.completedVessels || []);
  const vesselIndex = SHADOW_VESSELS.findIndex(vessel => !completedVessels.has(vessel.number));
  if (vesselIndex >= 0) {
    currentVessel = SHADOW_VESSELS[vesselIndex].number;
  } else {
    currentVessel = SHADOW_VESSELS[SHADOW_VESSELS.length - 1].number;
  }

  const vessel = SHADOW_VESSELS.find(entry => entry.number === currentVessel) ?? SHADOW_VESSELS[0];
  const vesselProgress = Math.min(100, Math.round((state.current / vessel.requirement) * 100));
  return {
    ...state,
    currentVessel,
    vesselProgress: Number.isFinite(vesselProgress) ? vesselProgress : 0,
    cycleComplete: completedVessels.size === SHADOW_VESSELS.length
  };
}

export function applyShadowEnergyGain(
  state: ShadowEnergyState,
  gain: number,
  sourceId: string,
  input?: Partial<ShadowEnergyGainInput>
): ShadowEnergyState {
  const normalized = getShadowEnergyVesselState(state);
  const previousCurrent = Math.max(0, normalized.current || 0);
  const sourceKey = sourceId.trim();
  if (!sourceKey) {
    return normalized;
  }
  if (normalized.ledger.some(entry => entry.sourceId === sourceKey)) {
    return normalized;
  }

  const baseContribution = Math.max(0, Number.isFinite(input?.baseContribution) ? input.baseContribution : gain);
  const harmony = Math.max(0, Math.min(100, Number.isFinite(input?.harmony) ? input.harmony : 100));
  const consistencyMultiplier = Math.max(0.5, Number.isFinite(input?.consistencyMultiplier) ? input.consistencyMultiplier : 1);
  const difficultyMultiplier = Math.max(0.5, Number.isFinite(input?.difficultyMultiplier) ? input.difficultyMultiplier : 1);
  const domain = input?.domain ?? 'Mind';
  const generated = calculateShadowEnergyGain({
    baseContribution,
    harmony,
    consistencyMultiplier,
    difficultyMultiplier,
    domain
  });

  const vessel = SHADOW_VESSELS.find(entry => entry.number === normalized.currentVessel) ?? SHADOW_VESSELS[0];
  let current = previousCurrent + generated;
  const completedVessels = new Set(normalized.completedVessels ?? []);
  let vesselProgress = normalized.vesselProgress;
  let cycleComplete = false;

  if (current >= vessel.requirement) {
    completedVessels.add(vessel.number);
    current = Math.max(0, current - vessel.requirement);
    vesselProgress = 100;
    const nextVessel = SHADOW_VESSELS.find(entry => !completedVessels.has(entry.number));
    const lastVessel = SHADOW_VESSELS[SHADOW_VESSELS.length - 1];
    if (nextVessel) {
      cycleComplete = false;
    } else if (current === 0 && completedVessels.has(lastVessel.number)) {
      cycleComplete = true;
    } else {
      cycleComplete = true;
    }
  } else {
    vesselProgress = Math.min(100, Math.round((current / vessel.requirement) * 100));
  }

  const actualStoredEnergy = Math.max(0, current - previousCurrent);
  const finalState: ShadowEnergyState = {
    current,
    currentVessel: SHADOW_VESSELS.find(entry => !completedVessels.has(entry.number))?.number ?? SHADOW_VESSELS[SHADOW_VESSELS.length - 1].number,
    completedVessels: Array.from(completedVessels).sort((a, b) => a - b),
    cycleComplete,
    vesselProgress,
    ledger: [
      {
        id: `shadow-energy-${sourceKey}-${Date.now()}`,
        sourceId: sourceKey,
        sourceType: input?.sourceType ?? 'quest',
        domain,
        baseContribution,
        harmony,
        consistencyMultiplier,
        difficultyMultiplier,
        generated,
        finalEnergyGained: actualStoredEnergy,
        timestamp: new Date().toISOString()
      },
      ...normalized.ledger
    ]
  };

  return getShadowEnergyVesselState(finalState);
}
