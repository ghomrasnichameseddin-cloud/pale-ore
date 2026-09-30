import { describe, it, expect } from 'vitest';
import {
  getHabitStabilityStage,
  getHabitStageDetails,
  isHabitQuest,
  calculateHabitFormation
} from '../habitFormation';
import { Quest, XPHistoryEntry } from '../../types';

describe('Habit Formation & Stability Layer', () => {
  describe('getHabitStabilityStage', () => {
    it('returns initiated for 0–7 repetitions', () => {
      expect(getHabitStabilityStage(0)).toBe('initiated');
      expect(getHabitStabilityStage(4)).toBe('initiated');
      expect(getHabitStabilityStage(7)).toBe('initiated');
    });

    it('returns established for 8–30 repetitions', () => {
      expect(getHabitStabilityStage(8)).toBe('established');
      expect(getHabitStabilityStage(20)).toBe('established');
      expect(getHabitStabilityStage(30)).toBe('established');
    });

    it('returns conditioned for 31–60 repetitions', () => {
      expect(getHabitStabilityStage(31)).toBe('conditioned');
      expect(getHabitStabilityStage(45)).toBe('conditioned');
      expect(getHabitStabilityStage(60)).toBe('conditioned');
    });

    it('returns integrated for 61–90 repetitions', () => {
      expect(getHabitStabilityStage(61)).toBe('integrated');
      expect(getHabitStabilityStage(75)).toBe('integrated');
      expect(getHabitStabilityStage(90)).toBe('stable');
    });

    it('returns stable for 90+ repetitions', () => {
      expect(getHabitStabilityStage(91)).toBe('stable');
      expect(getHabitStabilityStage(150)).toBe('stable');
    });
  });

  describe('getHabitStageDetails', () => {
    it('provides metadata for all 5 behavioral stages', () => {
      const stages = ['initiated', 'established', 'conditioned', 'integrated', 'stable'] as const;
      for (const st of stages) {
        const details = getHabitStageDetails(st);
        expect(details.stage).toBe(st);
        expect(details.label).toBeDefined();
        expect(details.labelAr).toBeDefined();
        expect(details.badgeClass).toBeDefined();
        expect(details.repRange).toBeDefined();
        expect(details.description).toBeDefined();
      }
    });
  });

  describe('isHabitQuest', () => {
    it('identifies quest with type Habit', () => {
      const q: Partial<Quest> = { id: 'q1', type: 'Habit' };
      expect(isHabitQuest(q as Quest)).toBe(true);
    });

    it('identifies quest with recurring schedule', () => {
      const q1: Partial<Quest> = { id: 'q2', type: 'Main', recurrence: 'Daily' };
      const q2: Partial<Quest> = { id: 'q3', type: 'Side', recurrence: 'Weekly' };
      expect(isHabitQuest(q1 as Quest)).toBe(true);
      expect(isHabitQuest(q2 as Quest)).toBe(true);
    });

    it('identifies quest with formation metadata', () => {
      const q: Partial<Quest> = {
        id: 'q4',
        type: 'Main',
        recurrence: 'None',
        formation: {
          successfulRepetitions: 12,
          stabilityScore: 40,
          stabilityStage: 'established',
          currentStreak: 3,
          lastCompletedAt: '2026-09-29'
        }
      };
      expect(isHabitQuest(q as Quest)).toBe(true);
    });

    it('returns false for non-recurring non-habit quests', () => {
      const q: Partial<Quest> = { id: 'q5', type: 'Main', recurrence: 'None' };
      expect(isHabitQuest(q as Quest)).toBe(false);
    });
  });

  describe('calculateHabitFormation', () => {
    const today = '2026-09-30';

    it('safely initializes a new habit with zero history', () => {
      const newHabit: Quest = {
        id: 'habit-new',
        name: 'Morning Dhikr',
        description: 'Recite morning adhkar with reflection',
        difficulty: 'Easy',
        estimatedTime: 15,
        xp: 50,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        type: 'Habit',
        recurrence: 'Daily',
        status: 'Active',
        deadline: null,
        completedAt: null,
        createdAt: '2026-09-30T06:00:00Z',
        cue: 'After Fajr'
      };

      const formation = calculateHabitFormation(newHabit, [], today);
      expect(formation.successfulRepetitions).toBe(0);
      expect(formation.stabilityStage).toBe('initiated');
      expect(formation.stabilityScore).toBe(0);
      expect(formation.currentStreak).toBe(0);
      expect(formation.lastCompletedAt).toBeNull();
    });

    it('derives formation from existing completion history for backward compatibility', () => {
      const habit: Quest = {
        id: 'habit-python',
        name: 'Python Practice',
        description: 'Code algorithms for 30 minutes',
        difficulty: 'Normal',
        estimatedTime: 30,
        xp: 100,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        type: 'Habit',
        recurrence: 'Daily',
        status: 'Active',
        deadline: null,
        completedAt: '2026-09-30T09:00:00Z',
        lastCompletedDate: '2026-09-30',
        streakCount: 6,
        createdAt: '2026-08-01T00:00:00Z',
        cue: 'After opening VS Code'
      };

      // Generate 24 distinct completion entries over the last 30 days
      const xpHistory: XPHistoryEntry[] = [];
      for (let i = 0; i < 24; i++) {
        const d = new Date(2026, 8, 30 - i); // September 2026
        const dateStr = d.toISOString().split('T')[0];
        xpHistory.push({
          id: `xph-${i}`,
          questId: habit.id,
          questName: habit.name,
          xp: 100,
          timestamp: `${dateStr}T10:00:00Z`,
          date: dateStr,
          skillIds: []
        });
      }

      // Add 23 more older repetitions to simulate total 47 reps
      for (let i = 35; i < 58; i++) {
        const d = new Date(2026, 8, 30 - i);
        const dateStr = d.toISOString().split('T')[0];
        xpHistory.push({
          id: `xph-old-${i}`,
          questId: habit.id,
          questName: habit.name,
          xp: 100,
          timestamp: `${dateStr}T10:00:00Z`,
          date: dateStr,
          skillIds: []
        });
      }

      const formation = calculateHabitFormation(habit, xpHistory, today);

      // 47 total repetitions -> conditioned stage (31–60 reps)
      expect(formation.successfulRepetitions).toBe(47);
      expect(formation.stabilityStage).toBe('conditioned');
      expect(formation.currentStreak).toBe(6);
      expect(formation.completionsInLast30Days).toBe(24);
      expect(formation.stabilityScore).toBeGreaterThanOrEqual(60);
      expect(formation.stabilityScore).toBeLessThanOrEqual(100);
    });

    it('does NOT wipe successful repetitions or reset stage when days are missed', () => {
      const habit: Quest = {
        id: 'habit-reading',
        name: 'Tafsir Reading',
        description: 'Read 2 pages of Tafsir',
        difficulty: 'Easy',
        estimatedTime: 20,
        xp: 50,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        type: 'Habit',
        recurrence: 'Daily',
        status: 'Active',
        deadline: null,
        completedAt: null,
        lastCompletedDate: '2026-09-25', // 5 days ago! Missed several days
        streakCount: 0,
        createdAt: '2026-06-01T00:00:00Z',
        formation: {
          successfulRepetitions: 70,
          stabilityScore: 80,
          stabilityStage: 'integrated',
          currentStreak: 0,
          lastCompletedAt: '2026-09-25'
        }
      };

      const formation = calculateHabitFormation(habit, [], today);

      // Repetitions are preserved: 70
      expect(formation.successfulRepetitions).toBe(70);
      // Stage is preserved as integrated (61-90 reps)
      expect(formation.stabilityStage).toBe('integrated');
      // Streak is 0 due to inactive gap
      expect(formation.currentStreak).toBe(0);
      // Stability score is non-zero, reflects past foundation but reflects recent inactivity
      expect(formation.stabilityScore).toBeGreaterThan(0);
      expect(formation.stabilityScore).toBeLessThanOrEqual(100);
    });

    it('smoothly recovers stability after resumption without harsh reset', () => {
      const habit: Quest = {
        id: 'habit-workout',
        name: 'Physical Conditioning',
        description: 'Calisthenics and stretching',
        difficulty: 'Normal',
        estimatedTime: 40,
        xp: 100,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        type: 'Habit',
        recurrence: 'Daily',
        status: 'Active',
        deadline: null,
        completedAt: '2026-09-30T10:00:00Z',
        lastCompletedDate: '2026-09-30',
        streakCount: 1, // Resumed today!
        createdAt: '2026-07-01T00:00:00Z',
        formation: {
          successfulRepetitions: 35,
          stabilityScore: 45,
          stabilityStage: 'conditioned',
          currentStreak: 1,
          lastCompletedAt: '2026-09-30'
        }
      };

      const xpHistory: XPHistoryEntry[] = [
        {
          id: 'xph-resumed',
          questId: habit.id,
          questName: habit.name,
          xp: 100,
          timestamp: '2026-09-30T10:00:00Z',
          date: '2026-09-30',
          skillIds: []
        }
      ];

      const formation = calculateHabitFormation(habit, xpHistory, today);
      expect(formation.successfulRepetitions).toBeGreaterThanOrEqual(35);
      expect(formation.stabilityStage).toBe('conditioned');
      expect(formation.currentStreak).toBe(1);
    });

    it('works with weekly habits and correctly measures scheduled consistency', () => {
      const weeklyHabit: Quest = {
        id: 'habit-kahf',
        name: 'Surah Al-Kahf on Friday',
        description: 'Recite full Surah Al-Kahf',
        difficulty: 'Normal',
        estimatedTime: 45,
        xp: 120,
        goalId: null,
        projectId: null,
        milestoneId: null,
        relatedSkills: [],
        type: 'Habit',
        recurrence: 'Weekly',
        status: 'Active',
        deadline: null,
        completedAt: null,
        lastCompletedDate: '2026-09-25',
        streakCount: 4,
        createdAt: '2026-08-01T00:00:00Z'
      };

      const xpHistory: XPHistoryEntry[] = [
        { id: 'k1', questId: weeklyHabit.id, questName: weeklyHabit.name, xp: 120, date: '2026-09-25', timestamp: '2026-09-25T12:00:00Z', skillIds: [] },
        { id: 'k2', questId: weeklyHabit.id, questName: weeklyHabit.name, xp: 120, date: '2026-09-18', timestamp: '2026-09-18T12:00:00Z', skillIds: [] },
        { id: 'k3', questId: weeklyHabit.id, questName: weeklyHabit.name, xp: 120, date: '2026-09-11', timestamp: '2026-09-11T12:00:00Z', skillIds: [] },
        { id: 'k4', questId: weeklyHabit.id, questName: weeklyHabit.name, xp: 120, date: '2026-09-04', timestamp: '2026-09-04T12:00:00Z', skillIds: [] }
      ];

      const formation = calculateHabitFormation(weeklyHabit, xpHistory, today);
      expect(formation.successfulRepetitions).toBe(4);
      expect(formation.stabilityStage).toBe('initiated'); // 0-7 reps
      expect(formation.stabilityScore).toBeGreaterThan(0);
    });
  });
});
