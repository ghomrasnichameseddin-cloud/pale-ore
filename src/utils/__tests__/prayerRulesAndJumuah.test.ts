import { describe, it, expect } from 'vitest';
import { 
  getCompoundDelayPenalty, 
  calculateCompoundDelayTiers, 
  getPropheticJumuahWarning,
  getAvailableDelayTargets,
  NEXT_PRAYER_DEFAULT_TARGETS,
  MIDNIGHT_MISSED_PRAYER_PENALTY_XP,
  MIDNIGHT_MISSED_PRAYER_PENALTY_HP,
  MISSED_JUMUAH_PENALTY_XP,
  MISSED_JUMUAH_PENALTY_HP
} from '../prayerRules';
import { SpiritualDailyLog, PrayerCheck } from '../../types';

describe('Sacred Protocol: 3 States of Prayer & Compound Penalties', () => {
  it('correctly calculates compound penalties with each delayed prayer', () => {
    // Tier 1: 1st delayed prayer
    expect(getCompoundDelayPenalty(1)).toBe(50);
    // Tier 2: 2nd delayed prayer (compounding penalty)
    expect(getCompoundDelayPenalty(2)).toBe(100);
    // Tier 3: 3rd delayed prayer
    expect(getCompoundDelayPenalty(3)).toBe(175);
    // Tier 4: 4th delayed prayer
    expect(getCompoundDelayPenalty(4)).toBe(275);
    // Tier 5: 5th delayed prayer
    expect(getCompoundDelayPenalty(5)).toBe(400);
  });

  it('calculates compound tiers across a daily spiritual log with multiple delayed prayers', () => {
    const mockLog: Partial<SpiritualDailyLog> = {
      fajr: { fardh: true, delayed: true, onTime: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
      dhuhr: { fardh: true, delayed: false, onTime: true, inMasjid: false, sunnahRawatib: false, completedAt: null },
      asr: { fardh: true, delayed: true, onTime: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
      maghrib: { fardh: true, delayed: true, onTime: false, inMasjid: false, sunnahRawatib: false, completedAt: null },
      isha: { fardh: false, delayed: false, onTime: false, inMasjid: false, sunnahRawatib: false, completedAt: null }
    };

    const tiers = calculateCompoundDelayTiers(mockLog);
    // 1st delayed: Fajr -> Tier 1 (-50 XP)
    expect(tiers.fajr).toBeDefined();
    expect(tiers.fajr.tier).toBe(1);
    expect(tiers.fajr.penaltyXp).toBe(50);

    // Dhuhr was on-time -> no delay tier
    expect(tiers.dhuhr).toBeUndefined();

    // 2nd delayed: Asr -> Tier 2 (-100 XP)
    expect(tiers.asr).toBeDefined();
    expect(tiers.asr.tier).toBe(2);
    expect(tiers.asr.penaltyXp).toBe(100);

    // 3rd delayed: Maghrib -> Tier 3 (-175 XP)
    expect(tiers.maghrib).toBeDefined();
    expect(tiers.maghrib.tier).toBe(3);
    expect(tiers.maghrib.penaltyXp).toBe(175);
  });

  it('provides available next-prayer delay targets for each prayer', () => {
    const fajrTargets = getAvailableDelayTargets('fajr');
    expect(fajrTargets.some(t => t.id === 'dhuhr')).toBe(true);
    expect(fajrTargets.some(t => t.id === 'midnight')).toBe(true);

    const maghribTargets = getAvailableDelayTargets('maghrib');
    expect(maghribTargets.some(t => t.id === 'isha')).toBe(true);
    expect(maghribTargets.some(t => t.id === 'midnight')).toBe(true);
    expect(maghribTargets.some(t => t.id === 'dhuhr')).toBe(false);
  });

  it('enforces severe penalties for prayers not executed before midnight', () => {
    expect(MIDNIGHT_MISSED_PRAYER_PENALTY_XP).toBe(200);
    expect(MIDNIGHT_MISSED_PRAYER_PENALTY_HP).toBe(10);
  });

  it('correctly maps default next-prayer delay targets (Fajr defaults to Dhuhr)', () => {
    expect(NEXT_PRAYER_DEFAULT_TARGETS.fajr).toBe('dhuhr');
    expect(NEXT_PRAYER_DEFAULT_TARGETS.dhuhr).toBe('asr');
    expect(NEXT_PRAYER_DEFAULT_TARGETS.asr).toBe('maghrib');
    expect(NEXT_PRAYER_DEFAULT_TARGETS.maghrib).toBe('isha');
    expect(NEXT_PRAYER_DEFAULT_TARGETS.isha).toBe('midnight');
  });

  it('supports switching Fajr delay target between Asr and Dhuhr seamlessly', () => {
    const mockLog: Partial<SpiritualDailyLog> = {
      fajr: { 
        fardh: true, 
        delayed: true, 
        delayedToPrayer: 'asr', 
        onTime: false, 
        inMasjid: false, 
        sunnahRawatib: false, 
        completedAt: null 
      }
    };

    // User switches delayed target from Asr to Dhuhr
    const updatedFajr: PrayerCheck = {
      ...mockLog.fajr!,
      delayedToPrayer: 'dhuhr'
    };
    mockLog.fajr = updatedFajr;

    const tiers = calculateCompoundDelayTiers(mockLog);
    expect(mockLog.fajr.delayedToPrayer).toBe('dhuhr');
    expect(tiers.fajr.tier).toBe(1);
    expect(tiers.fajr.penaltyXp).toBe(50);
  });
});

describe('Sacred Protocol: Salat al-Jumuah & Prophetic Warnings', () => {
  it('deducts severe penalty when Jumuah is missed without excuse', () => {
    expect(MISSED_JUMUAH_PENALTY_XP).toBe(150);
    expect(MISSED_JUMUAH_PENALTY_HP).toBe(5);
  });

  it('generates severe Prophetic Hadith warning for 1st missed Friday', () => {
    const warning1 = getPropheticJumuahWarning(1);
    expect(warning1.title).toContain('SACRED WARNING');
    expect(warning1.hadithAr).toContain('لَيَنْتَهِيَنَّ أَقْوَامٌ عَنْ وَدْعِهِمُ الْجُمُعَاتِ');
    expect(warning1.hadithEn).toContain('Sahih Muslim');
    expect(warning1.explanation).toContain('4 Rak\'ahs of Dhuhr');
  });

  it('generates severe Prophetic Hadith warning specifically for 2 missed Fridays (whoever skips two jumu3as...)', () => {
    const warning2 = getPropheticJumuahWarning(2);
    expect(warning2.title).toContain('GRAVE PROPHETIC WARNING');
    expect(warning2.hadithAr).toContain('مَنْ تَرَكَ جُمُعَتَيْنِ تَهَاوُنًا بِهِمَا طُبِعَ عَلَى قَلْبِهِ');
    expect(warning2.hadithEn).toContain('Whoever leaves two Friday prayers out of negligence, a seal is placed upon his heart');
    expect(warning2.explanation).toContain('2 Jumu\'ah prayers');
    expect(warning2.explanation).toContain('4 Rak\'ahs of Dhuhr (صلاة الظهر) instead');
  });

  it('generates divine seal warning for 3 consecutive missed Fridays', () => {
    const warning3 = getPropheticJumuahWarning(3);
    expect(warning3.title).toContain('DIVINE SEAL WARNING');
    expect(warning3.hadithSecondaryAr).toContain('مَنْ تَرَكَ ثَلَاثَ جُمَعٍ تَهَاوُنًا بِهَا طَبَعَ اللَّهُ عَلَى قَلْبِهِ');
  });
});
