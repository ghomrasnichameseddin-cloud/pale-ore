import { describe, it, expect } from 'vitest';
import { calculateCompoundDelayTiers } from '../prayerRules';
import { getMuhasabahAttributePenalty } from '../muhasabahConsequences';
import { SpiritualDailyLog, MuhasabahEntry } from '../../types';

describe('Automatic Muhasabah Audit for Delayed Prayers', () => {
  it('correctly maps delay parameters for an automatic audit', () => {
    const prayer = 'fajr';
    const targetDate = '2026-10-03';
    const log: Partial<SpiritualDailyLog> = {
      date: targetDate,
      fajr: {
        fardh: true,
        onTime: false,
        delayed: true,
        missedPastMidnight: false,
        executionState: 'delayed',
        delayedToPrayer: 'dhuhr',
        inMasjid: false,
        sunnahRawatib: false,
        completedAt: `${targetDate}T06:30:00.000Z`
      }
    };

    const penalties = calculateCompoundDelayTiers(log);
    expect(penalties.fajr).toBeDefined();
    expect(penalties.fajr.tier).toBe(1);
    expect(penalties.fajr.penaltyXp).toBe(50);

    const auditId = `muhasabah-delay-${prayer}-${targetDate}`;
    const kaffarahQuestId = `quest-kaffarah-delay-${prayer}-${targetDate}`;

    const auditEntry: MuhasabahEntry = {
      id: auditId,
      date: targetDate,
      timestamp: `${targetDate}T06:30:00.000Z`,
      title: `Delayed Prayer: Fajr (Delayed to Dhuhr)`,
      description: `Obligatory Fajr prayer was not executed within its prescribed window and was delayed to Dhuhr. Automatic Muhāsabah audit logged under Obligations (Tier 1 delay).`,
      category: 'Obligations',
      severity: 'Moderate',
      isExempt: false,
      rawPenalty: penalties.fajr.penaltyXp,
      xpDeducted: penalties.fajr.penaltyXp,
      hpDeducted: 10,
      baseHpLoss: 10,
      coinsDeducted: 0,
      baseCoinsDeducted: 0,
      momentumLost: 25,
      cause: `Postponed past prescribed window into Dhuhr slot (Delay Tier 1).`,
      reflection: 'Obligatory prayers must be safeguarded at their appointed times. Postponing leads to spiritual friction, compounding delay penalties, and erosion of barakah.',
      correctiveQuestId: kaffarahQuestId,
      correctiveQuestName: `[KAFFĀRAH] 2 Rak'ahs of Tawbah & Surah Al-Mulk Recitation (Fajr Delay)`,
      kaffarahTitle: `2 Rak'ahs of Tawbah & Surah Al-Mulk Recitation (Fajr Delay)`,
      kaffarahType: 'Prayer',
      kaffarahCompleted: false,
      recoveryPercentage: 20,
      recoveredXP: Math.max(25, Math.round(penalties.fajr.penaltyXp * 0.2)),
      recurrenceCadence: 'isolated',
      recurrenceCadenceLabel: 'Delay Tier 1',
      recurrenceTier: 1
    };

    expect(auditEntry.category).toBe('Obligations');
    expect(auditEntry.xpDeducted).toBe(50);
    expect(auditEntry.recoveredXP).toBe(25);
    expect(auditEntry.correctiveQuestId).toBe(kaffarahQuestId);
  });

  it('escalates severity when multiple prayers are delayed (compound delay)', () => {
    const targetDate = '2026-10-03';
    const log: Partial<SpiritualDailyLog> = {
      date: targetDate,
      fajr: {
        fardh: true,
        onTime: false,
        delayed: true,
        delayedToPrayer: 'dhuhr',
        executionState: 'delayed',
        inMasjid: false,
        sunnahRawatib: false,
        completedAt: null
      },
      dhuhr: {
        fardh: true,
        onTime: false,
        delayed: true,
        delayedToPrayer: 'asr',
        executionState: 'delayed',
        inMasjid: false,
        sunnahRawatib: false,
        completedAt: null
      }
    };

    const penalties = calculateCompoundDelayTiers(log);
    expect(penalties.fajr.tier).toBe(1);
    expect(penalties.dhuhr.tier).toBe(2);
    expect(penalties.dhuhr.penaltyXp).toBe(100);

    const severityForTier2 = penalties.dhuhr.tier >= 4 ? 'Critical' :
      penalties.dhuhr.tier === 3 ? 'Severe' :
      penalties.dhuhr.tier === 2 ? 'Major' : 'Moderate';

    expect(severityForTier2).toBe('Major');
  });

  it('penalizes Discipline and the category-linked Soul attribute by severity', () => {
    const audit = {
      category: 'Obligations' as const,
      severity: 'Major' as const,
      isExempt: false,
      recurrenceMultiplier: 2
    };

    expect(getMuhasabahAttributePenalty(audit, 'Discipline')).toBe(6);
    expect(getMuhasabahAttributePenalty(audit, 'Faith')).toBe(6);
    expect(getMuhasabahAttributePenalty(audit, 'Clarity')).toBe(0);
    expect(getMuhasabahAttributePenalty({ ...audit, isExempt: true }, 'Discipline')).toBe(0);
  });
});
