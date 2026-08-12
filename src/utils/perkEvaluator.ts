import { JobSpec } from '../jobsAndTitles';
import { Quest } from '../types';

/**
 * Parses and calculates XP Multiplier for a given Job perk string and completed Quest.
 * Supports both standard and custom manually-written perk text.
 * Examples:
 * - "+10% XP bonus on Main Quests & Core Directives"
 * - "+15% XP bonus on Skill-linked Directives"
 * - "+15% XP bonus on Hard & Boss Difficulty Quests"
 * - "+20% XP bonus on Strength & Physical Directives"
 * - "+10% XP across all operational directives"
 * - "+25% XP"
 */
export function getQuestXpMultiplier(job: JobSpec, quest: Quest): number {
  if (!job || !job.perk) return 1.0;
  const perkText = job.perk.toLowerCase();

  // Extract percentage if present
  const match = perkText.match(/\+?(\d+)%\s*(?:xp|bonus)/i) || perkText.match(/\+?(\d+)%/i);
  if (!match) return 1.0;

  const percent = parseInt(match[1], 10);
  if (isNaN(percent) || percent <= 0) return 1.0;

  const multiplier = 1 + percent / 100;

  // Check condition triggers in perk text
  const mentionsMain = perkText.includes('main');
  const mentionsSkill = perkText.includes('skill');
  const mentionsHard = perkText.includes('hard');
  const mentionsBoss = perkText.includes('boss');
  const mentionsStrength = perkText.includes('strength') || perkText.includes('physical');

  // Condition checks
  let applies = false;

  if (mentionsMain && quest.type === 'Main') applies = true;
  if (mentionsSkill && quest.relatedSkills && quest.relatedSkills.length > 0) applies = true;
  if ((mentionsHard || mentionsBoss) && (quest.difficulty === 'Hard' || quest.difficulty === 'Boss')) applies = true;
  if (mentionsStrength) {
    const qText = `${quest.name} ${quest.description}`.toLowerCase();
    if (qText.includes('strength') || qText.includes('physical') || qText.includes('workout') || qText.includes('gym') || qText.includes('fitness')) {
      applies = true;
    }
  }

  // If no specific restriction keyword is mentioned, but XP bonus is written
  if (!mentionsMain && !mentionsSkill && !mentionsHard && !mentionsBoss && !mentionsStrength) {
    applies = true;
  }

  return applies ? multiplier : 1.0;
}

/**
 * Calculates Focus XP Multiplier from job perk text.
 * Example: "+20% Focus Minutes XP Multiplier during timer sessions"
 */
export function getFocusXpMultiplier(job: JobSpec): number {
  if (!job || !job.perk) return 1.0;
  const perkText = job.perk.toLowerCase();

  if (perkText.includes('focus') || perkText.includes('timer') || perkText.includes('session')) {
    const match = perkText.match(/\+?(\d+)%/i);
    if (match) {
      const percent = parseInt(match[1], 10);
      if (!isNaN(percent) && percent > 0) {
        return 1 + percent / 100;
      }
    }
  }
  return 1.0;
}

/**
 * Calculates Bonus Coin Multiplier from job perk text.
 * Example: "+15% bonus coins earned from quest executions"
 */
export function getCoinMultiplier(job: JobSpec): number {
  if (!job || !job.perk) return 1.0;
  const perkText = job.perk.toLowerCase();

  if (perkText.includes('coin')) {
    const match = perkText.match(/\+?(\d+)%/i);
    if (match) {
      const percent = parseInt(match[1], 10);
      if (!isNaN(percent) && percent > 0) {
        return 1 + percent / 100;
      }
    }
  }
  return 1.0;
}

/**
 * Calculates Fail Penalty Reduction Multiplier from job perk text.
 * Example: "Reduces Fail Penalty XP Loss by 20%"
 */
export function getFailPenaltyMultiplier(job: JobSpec): number {
  if (!job || !job.perk) return 1.0;
  const perkText = job.perk.toLowerCase();

  if (perkText.includes('fail') || perkText.includes('penalty') || perkText.includes('loss')) {
    const match = perkText.match(/(\d+)%/i);
    if (match) {
      const percent = parseInt(match[1], 10);
      if (!isNaN(percent) && percent > 0) {
        return Math.max(0, 1 - percent / 100); // e.g. 20% reduction => 0.80
      }
    }
  }
  return 1.0;
}

/**
 * Calculates Momentum Boost Multiplier from job perk text.
 * Example: "+10% Boost to Daily Momentum calculation"
 */
export function getMomentumMultiplier(job: JobSpec): number {
  if (!job || !job.perk) return 1.0;
  const perkText = job.perk.toLowerCase();

  if (perkText.includes('momentum')) {
    const match = perkText.match(/\+?(\d+)%/i);
    if (match) {
      const percent = parseInt(match[1], 10);
      if (!isNaN(percent) && percent > 0) {
        return 1 + percent / 100;
      }
    }
  }
  return 1.0;
}
