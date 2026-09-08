import { MuhasabahSeverity } from '../types';

export interface SeverityConsequences {
  baseHp: number;
  baseCoins: number;
  baseXp: number;
  baseMomentum: number;
  label: string;
}

/**
 * Canonical Base Penalty & Consequence Tables for Muhasabah Slips
 * 
 * Defines baseline consequences before recurrence multiplier escalation.
 * Single source of truth used across recurrence analytics, POSContext state operations, and UI displays.
 */
export const SEVERITY_BASE_CONSEQUENCES: Record<MuhasabahSeverity, SeverityConsequences> = {
  Minor: {
    baseHp: 10,
    baseCoins: 10,
    baseXp: 100,
    baseMomentum: 15,
    label: 'Minor'
  },
  Moderate: {
    baseHp: 20,
    baseCoins: 25,
    baseXp: 200,
    baseMomentum: 35,
    label: 'Moderate'
  },
  Major: {
    baseHp: 35,
    baseCoins: 50,
    baseXp: 300,
    baseMomentum: 100, // Complete momentum wipe
    label: 'Major'
  },
  Severe: {
    baseHp: 50,
    baseCoins: 100,
    baseXp: 400,
    baseMomentum: 100,
    label: 'Severe'
  },
  Critical: {
    baseHp: 75,
    baseCoins: 200,
    baseXp: 500,
    baseMomentum: 100,
    label: 'Critical'
  }
};

/**
 * Direct lookup mappings derived canonically from SEVERITY_BASE_CONSEQUENCES
 */
export const SEVERITY_XP_PENALTIES: Record<MuhasabahSeverity, number> = {
  Minor: SEVERITY_BASE_CONSEQUENCES.Minor.baseXp,
  Moderate: SEVERITY_BASE_CONSEQUENCES.Moderate.baseXp,
  Major: SEVERITY_BASE_CONSEQUENCES.Major.baseXp,
  Severe: SEVERITY_BASE_CONSEQUENCES.Severe.baseXp,
  Critical: SEVERITY_BASE_CONSEQUENCES.Critical.baseXp
};

export const SEVERITY_COIN_FINES: Record<MuhasabahSeverity, number> = {
  Minor: SEVERITY_BASE_CONSEQUENCES.Minor.baseCoins,
  Moderate: SEVERITY_BASE_CONSEQUENCES.Moderate.baseCoins,
  Major: SEVERITY_BASE_CONSEQUENCES.Major.baseCoins,
  Severe: SEVERITY_BASE_CONSEQUENCES.Severe.baseCoins,
  Critical: SEVERITY_BASE_CONSEQUENCES.Critical.baseCoins
};

export const SEVERITY_MOMENTUM_PENALTIES: Record<MuhasabahSeverity, number> = {
  Minor: SEVERITY_BASE_CONSEQUENCES.Minor.baseMomentum,
  Moderate: SEVERITY_BASE_CONSEQUENCES.Moderate.baseMomentum,
  Major: SEVERITY_BASE_CONSEQUENCES.Major.baseMomentum,
  Severe: SEVERITY_BASE_CONSEQUENCES.Severe.baseMomentum,
  Critical: SEVERITY_BASE_CONSEQUENCES.Critical.baseMomentum
};

export const SEVERITY_HP_LOSS: Record<MuhasabahSeverity, number> = {
  Minor: SEVERITY_BASE_CONSEQUENCES.Minor.baseHp,
  Moderate: SEVERITY_BASE_CONSEQUENCES.Moderate.baseHp,
  Major: SEVERITY_BASE_CONSEQUENCES.Major.baseHp,
  Severe: SEVERITY_BASE_CONSEQUENCES.Severe.baseHp,
  Critical: SEVERITY_BASE_CONSEQUENCES.Critical.baseHp
};
