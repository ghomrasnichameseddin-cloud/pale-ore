import { POSState } from './types';

export const INITIAL_STATE: POSState = {
  goals: [],
  projects: [],
  milestones: [],
  quests: [],
  skills: [],
  attributes: [
    { id: 'a-1', name: 'Strength', level: 1, progress: 0, description: 'Physical power and output, built through demanding workouts.' },
    { id: 'a-2', name: 'Endurance', level: 1, progress: 0, description: 'Physical stamina and mental consistency to repeat routines.' },
    { id: 'a-3', name: 'Agility', level: 1, progress: 0, description: 'Mental dexterity and quick skill-switching capability.' },
    { id: 'a-4', name: 'Focus', level: 1, progress: 0, description: 'Capacity to concentrate deeply on main quests without distraction.' },
    { id: 'a-5', name: 'Discipline', level: 1, progress: 0, description: 'Completing required habits and side quests consistently.' },
    { id: 'a-6', name: 'Knowledge', level: 1, progress: 0, description: 'Theoretical underpinnings in coding, languages, and core ideas.' },
    { id: 'a-7', name: 'Wisdom', level: 1, progress: 0, description: 'Applying skills to accomplish major long-term goals and milestones.' },
    { id: 'a-8', name: 'Social', level: 1, progress: 0, description: 'Collaboration, speaking, and teaching capacity.' },
    { id: 'a-9', name: 'Faith', level: 1, progress: 0, description: 'Spiritual alignment, reflection, and connection.' }
  ],
  profile: {
    level: 1,
    xp: 0,
    momentum: 50,
    recoveryMode: false,
    currentFocus: '',
    focusGoalId: null,
    currentBossQuestId: null
  },
  xpHistory: []
};
