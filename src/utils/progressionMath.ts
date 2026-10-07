export interface ProgressionEvent {
  type?: string;
  difficulty?: string;
  skillIds?: string[];
  streak?: number;
  xp?: number;
}

export const calculateSkillXp = (
  skillId: string,
  history: Array<{ xp: number; skillIds: string[]; timestamp?: string }>,
  allSkills: Array<{ id: string; tier?: 'Primary' | 'Secondary'; parentId?: string | null; createdAt?: string }>
): number => {
  let totalXp = 0;

  const targetSkill = allSkills.find(skill => skill.id === skillId);
  if (!targetSkill) return 0;

  const targetCreatedAt = targetSkill.createdAt ? Date.parse(targetSkill.createdAt) : NaN;

  for (const entry of history) {
    const entryTime = entry.timestamp ? Date.parse(entry.timestamp) : NaN;
    if (Number.isFinite(targetCreatedAt) && Number.isFinite(entryTime) && entryTime < targetCreatedAt) continue;

    const directSkills = allSkills.filter(skill => entry.skillIds.includes(skill.id));
    if (directSkills.length === 0) continue;

    const primarySkillIds = new Set<string>();
    directSkills.forEach(skill => {
      if ((skill.tier || 'Primary') === 'Primary') {
        primarySkillIds.add(skill.id);
      } else if (skill.tier === 'Secondary' && skill.parentId) {
        primarySkillIds.add(skill.parentId);
      }
    });

    const primaryCount = primarySkillIds.size;
    const isTargetPrimary = (targetSkill.tier || 'Primary') === 'Primary';

    if (primaryCount > 0) {
      const primaryXpAllocated = entry.xp / primaryCount;

      if (isTargetPrimary) {
        if (primarySkillIds.has(skillId)) totalXp += primaryXpAllocated;
      } else if (targetSkill.parentId && primarySkillIds.has(targetSkill.parentId)) {
        const parentSecondaries = allSkills.filter(skill =>
          skill.tier === 'Secondary' && skill.parentId === targetSkill.parentId
        );
        if (parentSecondaries.length > 0) {
          totalXp += primaryXpAllocated / parentSecondaries.length;
        }
      }
    } else {
      const secondarySkills = directSkills.filter(skill => skill.tier === 'Secondary');
      if (!isTargetPrimary && secondarySkills.some(skill => skill.id === skillId) && secondarySkills.length > 0) {
        totalXp += entry.xp / secondarySkills.length;
      }
    }
  }

  return Math.round(totalXp);
};

export const calculateAttributePoints = (
  attributeName: string,
  events: ProgressionEvent[],
  skills: Array<{ id: string; name: string }>
): number => {
  let totalPoints = 0;

  events.forEach(event => {
    const baseWeight = (() => {
      if (attributeName === 'Strength') {
        const isFitness = (event.skillIds || []).some(skillId => {
          const skill = skills.find(candidate => candidate.id === skillId);
          return skill?.name === 'Fitness' || skill?.name?.toLowerCase().includes('fitness') || skill?.name?.toLowerCase().includes('workout');
        });
        const isBoss = event.type === 'Boss' || event.difficulty === 'Boss';
        if (isFitness || isBoss) return isBoss ? 8 : (event.difficulty === 'Hard' ? 4 : (event.difficulty === 'Easy' ? 1 : 2));
        return 0;
      }
      if (attributeName === 'Endurance') {
        return event.difficulty === 'Boss' ? 6 : (event.difficulty === 'Hard' ? 3 : (event.difficulty === 'Easy' ? 1 : 1.5));
      }
      if (attributeName === 'Agility') {
        if (event.type === 'Side' || event.type === 'Optional') return event.difficulty === 'Hard' ? 4 : (event.difficulty === 'Easy' ? 1 : 2);
        return 0;
      }
      if (attributeName === 'Focus') {
        if (event.type === 'Main') return event.difficulty === 'Boss' ? 8 : (event.difficulty === 'Hard' ? 5 : (event.difficulty === 'Easy' ? 1.5 : 3));
        return 0;
      }
      if (attributeName === 'Discipline') {
        if (event.type === 'Habit' || event.type === 'Side') {
          const streakBonus = Math.min(2, Math.floor((event.streak || 0) / 3));
          return (event.type === 'Habit' ? 2 : 1.5) + streakBonus;
        }
        return 0;
      }
      if (attributeName === 'Knowledge') {
        const isKnowledge = (event.skillIds || []).some(skillId => {
          const skill = skills.find(candidate => candidate.id === skillId);
          return ['Programming', 'English', 'Arabic', 'French', 'Chess', 'Coding', 'Study', 'Reading'].some(keyword =>
            skill?.name?.toLowerCase().includes(keyword.toLowerCase())
          );
        });
        if (isKnowledge) return event.difficulty === 'Hard' ? 4 : (event.difficulty === 'Easy' ? 1 : 2);
        return 0;
      }
      if (attributeName === 'Wisdom') {
        if (event.type !== null && event.type !== undefined) return event.difficulty === 'Hard' ? 5 : (event.difficulty === 'Easy' ? 1.5 : 3);
        return 0;
      }
      if (attributeName === 'Social') {
        const isSocial = (event.skillIds || []).some(skillId => {
          const skill = skills.find(candidate => candidate.id === skillId);
          return ['Writing', 'Cooking', 'Business', 'Communication', 'Teaching'].some(keyword =>
            skill?.name?.toLowerCase().includes(keyword.toLowerCase())
          );
        });
        if (isSocial) return event.difficulty === 'Hard' ? 4 : (event.difficulty === 'Easy' ? 1 : 2);
        return 0;
      }
      if (attributeName === 'Faith') {
        const isFaith = (event.skillIds || []).some(skillId => {
          const skill = skills.find(candidate => candidate.id === skillId);
          return ['Qur\'an', 'Arabic', 'Dhikr', 'Salah', 'Tahajjud'].some(keyword =>
            skill?.name?.toLowerCase().includes(keyword.toLowerCase())
          );
        });
        if (isFaith) return event.difficulty === 'Hard' ? 4 : (event.difficulty === 'Easy' ? 1.5 : 2.5);
      }
      return 0;
    })();

    totalPoints += event.xp && event.xp < 0 ? -baseWeight : baseWeight;
  });

  return totalPoints;
};
