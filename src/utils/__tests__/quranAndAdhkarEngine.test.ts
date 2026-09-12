import { describe, it, expect } from 'vitest';
import {
  calculateAdhkarFortressStats,
  calculateQuranFreshness,
  advanceRevisionQueueStatus,
  regressRevisionQueueStatus
} from '../quranAndAdhkarEngine';
import { QuranPassage, SpiritualDailyLog } from '../../types';
import { createDefaultSpiritualLog } from '../../initialState';

describe('Qur\'an and Adhkār Sacred Protocol Engine', () => {
  describe('Adhkār Fortress Integrity', () => {
    it('calculates 0% when no sessions started', () => {
      const logs: Record<string, SpiritualDailyLog> = {
        '2026-09-12': createDefaultSpiritualLog('2026-09-12')
      };
      const stats = calculateAdhkarFortressStats(logs, '2026-09-12');
      expect(stats.integrityScore).toBe(0);
      expect(stats.statusLabel).toBe('Unfortified');
      expect(stats.completedCount).toBe(0);
    });

    it('calculates partial integrity with in_progress sessions', () => {
      const log = createDefaultSpiritualLog('2026-09-12');
      log.adhkarSessions = {
        morning: 'in_progress',
        evening: 'not_started',
        sleep: 'not_started'
      };
      const stats = calculateAdhkarFortressStats({ '2026-09-12': log }, '2026-09-12');
      expect(stats.integrityScore).toBe(15);
      expect(stats.statusLabel).toBe('Vulnerable Perimeter');
    });

    it('calculates 100% integrity when Morning, Evening, and Sleep are complete', () => {
      const log = createDefaultSpiritualLog('2026-09-12');
      log.adhkarSessions = {
        morning: 'complete',
        evening: 'complete',
        sleep: 'complete'
      };
      const stats = calculateAdhkarFortressStats({ '2026-09-12': log }, '2026-09-12');
      expect(stats.integrityScore).toBe(100);
      expect(stats.statusLabel).toBe('Unbreached Fortress (100%)');
      expect(stats.completedCount).toBe(3);
    });

    it('is backwards compatible with legacy adhkarSabah and adhkarMasa booleans', () => {
      const log = createDefaultSpiritualLog('2026-09-12');
      log.adhkarSabah = true;
      log.adhkarMasa = true;
      log.adhkarSleepNight = false;
      const stats = calculateAdhkarFortressStats({ '2026-09-12': log }, '2026-09-12');
      expect(stats.integrityScore).toBe(67);
      expect(stats.statusLabel).toBe('Fortified Bastion');
      expect(stats.completedCount).toBe(2);
    });
  });

  describe('Qur\'an Revision Queue & Freshness', () => {
    it('advances Weak -> Due -> Stable', () => {
      expect(advanceRevisionQueueStatus('weak')).toBe('due');
      expect(advanceRevisionQueueStatus('due')).toBe('stable');
      expect(advanceRevisionQueueStatus('stable')).toBe('stable');
    });

    it('regresses Stable -> Due -> Weak', () => {
      expect(regressRevisionQueueStatus('stable')).toBe('due');
      expect(regressRevisionQueueStatus('due')).toBe('weak');
      expect(regressRevisionQueueStatus('weak')).toBe('weak');
    });

    it('calculates high freshness when passages are stable', () => {
      const passages: QuranPassage[] = [
        {
          id: 'p1',
          surahName: 'Al-Mulk',
          surahNumber: 67,
          ayahStart: 1,
          ayahEnd: 30,
          status: 'stable',
          lastRevisedDate: '2026-09-12',
          revisionCount: 5
        },
        {
          id: 'p2',
          surahName: 'Al-Baqarah',
          surahNumber: 2,
          ayahStart: 255,
          ayahEnd: 255,
          status: 'stable',
          lastRevisedDate: '2026-09-12',
          revisionCount: 10
        }
      ];
      const freshness = calculateQuranFreshness(passages, '2026-09-12');
      expect(freshness.score).toBe(100);
      expect(freshness.label).toBe('Fresh & Firmly Anchored');
      expect(freshness.weakCount).toBe(0);
      expect(freshness.dueCount).toBe(0);
      expect(freshness.stableCount).toBe(2);
    });

    it('detects weak passages and reduces freshness appropriately', () => {
      const passages: QuranPassage[] = [
        {
          id: 'p1',
          surahName: 'Al-Mulk',
          surahNumber: 67,
          ayahStart: 1,
          ayahEnd: 30,
          status: 'weak',
          lastRevisedDate: '2026-09-01',
          revisionCount: 1
        },
        {
          id: 'p2',
          surahName: 'Al-Baqarah',
          surahNumber: 2,
          ayahStart: 255,
          ayahEnd: 255,
          status: 'weak',
          lastRevisedDate: '2026-09-01',
          revisionCount: 1
        }
      ];
      const freshness = calculateQuranFreshness(passages, '2026-09-12');
      expect(freshness.score).toBe(15);
      expect(freshness.label).toBe('Needs Urgent Restoration');
      expect(freshness.weakCount).toBe(2);
    });
  });
});
