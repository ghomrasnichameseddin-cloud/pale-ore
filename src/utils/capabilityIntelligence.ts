import { 
  Skill, 
  Attribute, 
  POSState, 
  XPHistoryEntry, 
  RequiredCapability, 
  MasteryDimensionStage 
} from '../types';
import { getLocalDateString, parseDateSafe, addDays } from './dateUtils';

export interface AttributeMetadata {
  id: string;
  name: string;
  definition: string;
  focusArea: string;
  evidenceSources: string[];
  suggestedActions: string[];
  icon: string;
  category: string;
  color: string;
}

export const SOVEREIGN_ATTRIBUTES_METADATA: Record<string, AttributeMetadata> = {
  Strength: {
    id: 'a-1',
    name: 'Strength',
    definition: 'Physical power, muscular output, and physical resistance capacity built through demanding exertion.',
    focusArea: 'High-intensity workouts, resistance drills & physical training.',
    evidenceSources: ['Fitness Directives', 'Heavy Workouts', 'Boss Directives', 'Physical Milestones'],
    suggestedActions: [
      'Complete a heavy resistance training session (+4 Strength PTS)',
      'Conquer a Boss Directive requiring strenuous physical exertion (+8 Strength PTS)',
      'Complete 3 consecutive fitness directives this week'
    ],
    icon: '⚡',
    category: 'Physical',
    color: '#f87171'
  },
  Endurance: {
    id: 'a-2',
    name: 'Endurance',
    definition: 'Physical stamina, long-haul grit, and cognitive resilience to repeat demanding routines without fatigue.',
    focusArea: 'Sustained focus stints, daily recurring chains & deep work volume.',
    evidenceSources: ['All Completed Directives', 'Pomodoro Focus Minutes', 'Consecutive Day Chains'],
    suggestedActions: [
      'Log 100+ minutes of deep focus today (+4 Endurance PTS)',
      'Complete 5 directives in a single operating cycle (+5 Endurance PTS)',
      'Maintain all daily habits without deferrals for 7 consecutive days'
    ],
    icon: '🛡️',
    category: 'Physical',
    color: '#fb923c'
  },
  Agility: {
    id: 'a-3',
    name: 'Agility',
    definition: 'Mental dexterity, tactical adaptation, and rapid context-switching across multi-domain challenges.',
    focusArea: 'Quick task turnaround, technical problem-solving & side quest execution.',
    evidenceSources: ['Side Directives', 'Optional Directives', 'Fast Execution Loops', 'Bug Fixes'],
    suggestedActions: [
      'Execute 3 quick side directives within 45 minutes (+3 Agility PTS)',
      'Resolve an unexpected campaign impediment within 24 hours',
      'Context-switch cleanly between coding and administrative tasks'
    ],
    icon: '⚔️',
    category: 'Physical / Tactical',
    color: '#eab308'
  },
  Focus: {
    id: 'a-4',
    name: 'Focus',
    definition: 'Capacity to concentrate deeply on high-stakes directives without distraction, interruption, or cognitive drift.',
    focusArea: 'Deep-work Pomodoro blocks, main directives & distraction shielding.',
    evidenceSources: ['Main Directives', 'Pomodoro Sessions', 'Focus Streaks', 'Boss Directives'],
    suggestedActions: [
      'Conduct a 50-minute zero-distraction deep work Pomodoro (+5 Focus PTS)',
      'Advance an active Boss Directive in the Sanctum (+8 Focus PTS)',
      'Build and maintain a 5-day continuous focus streak'
    ],
    icon: '🎯',
    category: 'Mental / Focus',
    color: '#38bdf8'
  },
  Discipline: {
    id: 'a-5',
    name: 'Discipline',
    definition: 'Ironclad consistency in fulfilling daily covenanted duties and non-negotiables regardless of emotional state.',
    focusArea: 'Habit streaks, daily covenants, routine adherence & zero deferrals.',
    evidenceSources: ['Covenanted Habits', 'Recurring Directives', 'Streak Milestones', 'Early Rising'],
    suggestedActions: [
      'Complete all covenanted daily habits before noon (+4 Discipline PTS)',
      'Push a habit streak past 14 days (+5 Discipline PTS)',
      'Fulfill an active penalty / remediation directive without delay'
    ],
    icon: '⚖️',
    category: 'Character / Will',
    color: '#c5a059'
  },
  Knowledge: {
    id: 'a-6',
    name: 'Knowledge',
    definition: 'Theoretical foundations, syntax, languages, technical blueprints, and structured academic study.',
    focusArea: 'Coding documentation, technical reading, language grammar & research.',
    evidenceSources: ['Technical Directives', 'Programming Skills', 'Language Study', 'Codex Playbooks'],
    suggestedActions: [
      'Complete a technical curriculum module or book chapter (+4 Knowledge PTS)',
      'Synthesize a new SOP or doctrine into the Codex Vault',
      'Study 30 minutes of system architecture or language syntax'
    ],
    icon: '📖',
    category: 'Intellectual / Craft',
    color: '#818cf8'
  },
  Wisdom: {
    id: 'a-7',
    name: 'Wisdom',
    definition: 'Synthesizing knowledge into sound strategic judgment, priority filtering, and high-impact long-term decisions.',
    focusArea: 'Grand Destiny advancement, strategic trade-offs & postmortem reflection.',
    evidenceSources: ['Goal / Destiny Directives', 'Strategic Decisions', 'Weekly Muḥāsabah', 'Milestones'],
    suggestedActions: [
      'Advance a Grand Destiny milestone (+5 Wisdom PTS)',
      'Conduct Friday Muḥāsabah audit and record strategic calibrations',
      'Log a Strategic Decision with explicit reasoning and confidence score'
    ],
    icon: '👁️',
    category: 'Strategic / Judgment',
    color: '#a78bfa'
  },
  Social: {
    id: 'a-8',
    name: 'Social',
    definition: 'Interpersonal diplomacy, collaborative leadership, persuasive articulation, and communal uplift.',
    focusArea: 'Communication, team coordination, public speaking, writing & teaching.',
    evidenceSources: ['Writing Directives', 'Teaching & Mentorship', 'Collaborative Projects', 'Meetings'],
    suggestedActions: [
      'Publish a structured technical summary or article (+4 Social PTS)',
      'Mentor or explain a complex technical concept to a peer',
      'Lead or coordinate a strategic alignment discussion'
    ],
    icon: '🤝',
    category: 'Interpersonal',
    color: '#34d399'
  },
  Faith: {
    id: 'a-9',
    name: 'Faith',
    definition: 'Spiritual alignment, intentional sincerity (Ikhlāṣ), sacred discipline, and connection to the Divine.',
    focusArea: 'Congregational prayers, Qur\'an study, Adhkār, fasting & Muḥāsabah.',
    evidenceSources: ['Masjid 40-Day Covenant', 'Daily Adhkar Loops', 'Qur\'an Directives', 'Tahajjud'],
    suggestedActions: [
      'Pray all 5 daily prayers on time in the Masjid (+8 Faith PTS)',
      'Engage in morning or evening Adhkār focus session (+3 Faith PTS)',
      'Recite and study one Hizb of the Holy Qur\'an with contemplation'
    ],
    icon: '✨',
    category: 'Spiritual / Transcendent',
    color: '#e5c875'
  },
  Clarity: {
    id: 'a-10',
    name: 'Clarity',
    definition: 'Analytical precision, mental lucidity, structured logic, and rapid deconstruction of ambiguous bottlenecks.',
    focusArea: 'Architecture documents, system debugging, complex problem breakdown & logic modeling.',
    evidenceSources: ['Debugging Sessions', 'Architecture Blueprints', 'Root Cause Audits', 'Logic Directives'],
    suggestedActions: [
      'Deconstruct a complex system bottleneck into atomic directives (+4 Clarity PTS)',
      'Resolve an insidious software bug with regression testing (+5 Clarity PTS)',
      'Author a structured system specification or architecture document'
    ],
    icon: '💎',
    category: 'Analytical / Logic',
    color: '#06b6d4'
  },
  Creativity: {
    id: 'a-11',
    name: 'Creativity',
    definition: 'Lateral thinking, architectural innovation, novel solutions, and creative synthesis across disparate domains.',
    focusArea: 'Product design, UI/UX architecture, creative writing, inventive engineering & conceptual breakthroughs.',
    evidenceSources: ['Design Directives', 'Frontend UI Prototypes', 'Creative Writing', 'Novel Mechanics'],
    suggestedActions: [
      'Design and prototype a high-fidelity user interface (+4 Creativity PTS)',
      'Invent a novel technical or operational solution to an intractable challenge',
      'Synthesize ideas from two distinct domains into a unified framework'
    ],
    icon: '🎨',
    category: 'Synthesis / Ideation',
    color: '#ec4899'
  },
  Memory: {
    id: 'a-12',
    name: 'Memory',
    definition: 'Cognitive retention fidelity, rapid information recall, mental crystallization, and knowledge permanence.',
    focusArea: 'Qur\'an memorization (Hifz), technical syntax recall, spaced repetition & algorithmic retention.',
    evidenceSources: ['Qur\'an Hifz Reviews', 'Vocabulary Drills', 'Spaced Repetition Cards', 'Mental Recalls'],
    suggestedActions: [
      'Conduct a 20-minute flawless Qur\'an Hifz revision session (+4 Memory PTS)',
      'Review 50 spaced repetition flashcards without error (+3 Memory PTS)',
      'Memorize and reproduce a technical algorithm or data structure from memory'
    ],
    icon: '🧠',
    category: 'Cognitive / Retention',
    color: '#6366f1'
  },
  Vitality: {
    id: 'a-13',
    name: 'Vitality',
    definition: 'Bio-energetic stamina, restorative sleep quality, cellular rejuvenation, and baseline somatic wellness.',
    focusArea: 'Sleep optimization, hydration, clean nutrition, active rest days & physical replenishment.',
    evidenceSources: ['8h Rest Cycles', 'Hydration Logs', 'Clean Nutrition Covenants', 'Active Rest Overlay'],
    suggestedActions: [
      'Log 7.5+ hours of restorative sleep before 06:00 (+5 Vitality PTS)',
      'Maintain pure hydration and clean fueling protocol throughout operating hours (+3 Vitality PTS)',
      'Execute a planned Active Rest session to clear physical fatigue'
    ],
    icon: '🌱',
    category: 'Bio-Somatic / Recovery',
    color: '#10b981'
  },
  Fortitude: {
    id: 'a-14',
    name: 'Fortitude',
    definition: 'Physical toughness, pain tolerance, grit under thermal/somatic stress, and physical perseverance.',
    focusArea: 'Fasting endurance, cold exposure, grueling physical challenges & pushing past fatigue barriers.',
    evidenceSources: ['Voluntary Fasting (Sawm)', 'Thermal Contrast / Cold Drills', 'High-Exertion Grinds'],
    suggestedActions: [
      'Complete a sunnah fast (White Days or Mon/Thu) with steadfast composure (+6 Fortitude PTS)',
      'Conquer a cold exposure or high-friction physical challenge (+4 Fortitude PTS)',
      'Push through intense physical exertion without quitting or cutting reps'
    ],
    icon: '🏔️',
    category: 'Somatic / Grit',
    color: '#f97316'
  },
  Mobility: {
    id: 'a-15',
    name: 'Mobility',
    definition: 'Kinetic fluidity, musculoskeletal flexibility, postural alignment, joint resilience, and physical balance.',
    focusArea: 'Daily stretching, mobility flows, postural correction, warmups & physical recovery longevity.',
    evidenceSources: ['Stretching Routines', 'Mobility Drills', 'Postural Alignment', 'Kinetic Warmups'],
    suggestedActions: [
      'Complete a 15-minute full-body mobility and deep stretching flow (+4 Mobility PTS)',
      'Conduct daily postural alignment and ergonomic desk reset (+3 Mobility PTS)',
      'Complete kinetic warm-up and cool-down protocols around heavy training'
    ],
    icon: '🤸',
    category: 'Kinetic / Flexibility',
    color: '#14b8a6'
  },
  Ihsan: {
    id: 'a-16',
    name: 'Ihsan',
    definition: 'Spiritual excellence (Iḥsān), inner mindfulness of the Divine (Murāqabah), and perfection of deed quality.',
    focusArea: 'Khushū\' in prayer, voluntary charity (Ṣadaqah), spiritual contemplation & moral purity.',
    evidenceSources: ['Khushu in Salaat', 'Secret Sadaqah Deeds', 'Deep Contemplation (Tafakkur)', 'Moral Beauty'],
    suggestedActions: [
      'Pray 2 Rak\'ahs with profound stillness and verified Khushū\' (+5 Ihsan PTS)',
      'Give secret voluntary charity (Ṣadaqah) seeking only Allah\'s pleasure (+6 Ihsan PTS)',
      'Spend 15 minutes in silent contemplation (Tafakkur) of divine creation'
    ],
    icon: '🌟',
    category: 'Spiritual / Excellence',
    color: '#f59e0b'
  },
  Sabr: {
    id: 'a-17',
    name: 'Sabr',
    definition: 'Patient perseverance (Ṣabr), emotional poise under distress, impulse restraint, and steadfast endurance.',
    focusArea: 'Emotional composure during adversity, enduring delays with poise & resisting temptations.',
    evidenceSources: ['Overcoming Emotional Triggers', 'Patience During Delays', 'Fasting Restraint', 'Kaffarah'],
    suggestedActions: [
      'Restrain anger and maintain dignified silence during sudden operational friction (+5 Sabr PTS)',
      'Complete an active Kaffārah penance with humility and resolve (+4 Sabr PTS)',
      'Endure a major setback without complaining or despairing'
    ],
    icon: '⚓',
    category: 'Character / Poise',
    color: '#8b5cf6'
  },
  Shukr: {
    id: 'a-18',
    name: 'Shukr',
    definition: 'Profound gratitude (Shukr), inner contentment (Riḍā), recognizing divine blessings, and radiant optimism.',
    focusArea: 'Gratitude journaling, Hamd and Adhkār, acknowledging favors & maintaining a joyful heart.',
    evidenceSources: ['Gratitude Journaling', 'Alhamdulillah Adhkar', 'Acknowledging Blessings', 'Contentment'],
    suggestedActions: [
      'Write down 5 specific divine blessings with deep reflection and praise (+4 Shukr PTS)',
      'Express sincere verbal gratitude to someone who assisted or supported you (+3 Shukr PTS)',
      'Engage in 100 recitations of Tahmīd (Al-Ḥamdu lillāh) with heart-presence'
    ],
    icon: '☀️',
    category: 'Spiritual / Gratitude',
    color: '#eab308'
  }
};

/**
 * Intelligent default attribute mapping for newly registered or unconfigured skills
 */
export function getDefaultAttributesForSkill(skillName: string): { primaryId: string; secondaryIds: string[] } {
  const lower = skillName.toLowerCase();

  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('art') || lower.includes('creative') || lower.includes('invent')) {
    return { primaryId: 'a-11', secondaryIds: ['a-10', 'a-4', 'a-6'] }; // Creativity -> Clarity, Focus, Knowledge
  }
  if (lower.includes('debug') || lower.includes('architect') || lower.includes('logic') || lower.includes('refactor')) {
    return { primaryId: 'a-10', secondaryIds: ['a-6', 'a-4', 'a-7'] }; // Clarity -> Knowledge, Focus, Wisdom
  }
  if (lower.includes('hifz') || lower.includes('memoriz') || lower.includes('retention') || lower.includes('flashcard')) {
    return { primaryId: 'a-12', secondaryIds: ['a-9', 'a-4', 'a-5'] }; // Memory -> Faith, Focus, Discipline
  }
  if (lower.includes('sleep') || lower.includes('recover') || lower.includes('nutrition') || lower.includes('diet') || lower.includes('health')) {
    return { primaryId: 'a-13', secondaryIds: ['a-2', 'a-5', 'a-1'] }; // Vitality -> Endurance, Discipline, Strength
  }
  if (lower.includes('fast') || lower.includes('cold') || lower.includes('grit') || lower.includes('tough') || lower.includes('martial')) {
    return { primaryId: 'a-14', secondaryIds: ['a-1', 'a-2', 'a-5'] }; // Fortitude -> Strength, Endurance, Discipline
  }
  if (lower.includes('stretch') || lower.includes('mobility') || lower.includes('posture') || lower.includes('yoga') || lower.includes('flexib')) {
    return { primaryId: 'a-15', secondaryIds: ['a-3', 'a-13', 'a-2'] }; // Mobility -> Agility, Vitality, Endurance
  }
  if (lower.includes('charity') || lower.includes('sadaqah') || lower.includes('ihsan') || lower.includes('khushu') || lower.includes('tafakkur')) {
    return { primaryId: 'a-16', secondaryIds: ['a-9', 'a-8', 'a-7'] }; // Ihsan -> Faith, Social, Wisdom
  }
  if (lower.includes('patience') || lower.includes('sabr') || lower.includes('restraint') || lower.includes('stoic')) {
    return { primaryId: 'a-17', secondaryIds: ['a-5', 'a-7', 'a-9'] }; // Sabr -> Discipline, Wisdom, Faith
  }
  if (lower.includes('gratitude') || lower.includes('shukr') || lower.includes('journal') || lower.includes('thanks')) {
    return { primaryId: 'a-18', secondaryIds: ['a-9', 'a-7', 'a-8'] }; // Shukr -> Faith, Wisdom, Social
  }
  if (lower.includes('code') || lower.includes('program') || lower.includes('python') || lower.includes('script') || lower.includes('react') || lower.includes('dev') || lower.includes('software') || lower.includes('web')) {
    return { primaryId: 'a-6', secondaryIds: ['a-10', 'a-4', 'a-5'] }; // Knowledge -> Clarity, Focus, Discipline
  }
  if (lower.includes('fitness') || lower.includes('workout') || lower.includes('gym') || lower.includes('strength') || lower.includes('run') || lower.includes('cardio')) {
    return { primaryId: 'a-1', secondaryIds: ['a-2', 'a-14', 'a-15'] }; // Strength -> Endurance, Fortitude, Mobility
  }
  if (lower.includes('qur') || lower.includes('islam') || lower.includes('hadith') || lower.includes('fiqh') || lower.includes('deen') || lower.includes('salah')) {
    return { primaryId: 'a-9', secondaryIds: ['a-16', 'a-12', 'a-6'] }; // Faith -> Ihsan, Memory, Knowledge
  }
  if (lower.includes('arabic') || lower.includes('english') || lower.includes('french') || lower.includes('language') || lower.includes('german')) {
    return { primaryId: 'a-6', secondaryIds: ['a-12', 'a-5', 'a-8'] }; // Knowledge -> Memory, Discipline, Social
  }
  if (lower.includes('write') || lower.includes('speak') || lower.includes('communicat') || lower.includes('social') || lower.includes('market') || lower.includes('sales')) {
    return { primaryId: 'a-8', secondaryIds: ['a-11', 'a-6', 'a-7'] }; // Social -> Creativity, Knowledge, Wisdom
  }
  if (lower.includes('strategy') || lower.includes('architect') || lower.includes('business') || lower.includes('finance') || lower.includes('invest')) {
    return { primaryId: 'a-7', secondaryIds: ['a-10', 'a-6', 'a-4'] }; // Wisdom -> Clarity, Knowledge, Focus
  }

  // Fallback
  return { primaryId: 'a-6', secondaryIds: ['a-4', 'a-5'] };
}

export interface SkillEvidence {
  completedDirectivesCount: number;
  focusMinutesTotal: number;
  focusSessionsCount: number;
  completedProjectsCount: number;
  bossQuestsCount: number;
  strategicCampaignsCount: number;
  codexDocsCount: number;
  recentDirectives: { id: string; name: string; completedAt: string; xp: number; difficulty: string }[];
}

export function getSkillEvidence(skillId: string, state: POSState): SkillEvidence {
  const linkedQuests = (state.quests || []).filter(q => 
    q.relatedSkills && q.relatedSkills.includes(skillId)
  );

  const completedQuests = linkedQuests.filter(q => q.status === 'Completed');
  const bossQuests = completedQuests.filter(q => q.difficulty === 'Boss' || q.type === 'Boss');

  const linkedProjects = (state.projects || []).filter(p => 
    (p.requiredSkills && p.requiredSkills.includes(skillId)) ||
    ((p as any).relatedSkills && (p as any).relatedSkills.includes(skillId)) ||
    (p.requiredCapabilities && p.requiredCapabilities.some(rc => rc.skillId === skillId))
  );

  const completedProjects = linkedProjects.filter(p => p.status === 'Completed');

  // XP History matching this skill
  const skillEvents = (state.xpHistory || []).filter(h => 
    h.skillIds && h.skillIds.includes(skillId)
  );

  let focusMinutes = 0;
  let focusSessions = 0;
  skillEvents.forEach(e => {
    if (e.source === 'focus') {
      focusSessions += 1;
      focusMinutes += 25; // standard interval
    }
  });

  const skillObj = (state.skills || []).find(s => s.id === skillId);
  const codexDocsCount = (skillObj?.codexDocIds?.length || 0) + 
    (state.planningDocuments || []).filter(d => 
      d.content?.toLowerCase().includes(skillObj?.name?.toLowerCase() || '___')
    ).length;

  const recentDirectives = completedQuests
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 5)
    .map(q => ({
      id: q.id,
      name: q.name,
      completedAt: q.completedAt || '',
      xp: q.xp || 50,
      difficulty: q.difficulty || 'Normal'
    }));

  return {
    completedDirectivesCount: completedQuests.length,
    focusMinutesTotal: focusMinutes,
    focusSessionsCount: focusSessions,
    completedProjectsCount: completedProjects.length,
    bossQuestsCount: bossQuests.length,
    strategicCampaignsCount: linkedProjects.length,
    codexDocsCount,
    recentDirectives
  };
}

export interface AttributeEvidence {
  directivesCount: number;
  focusMinutesTotal: number;
  habitStreakBest: number;
  bossVictories: number;
  recentEventsCount: number;
  relatedSkills: Skill[];
  relatedCampaigns: { id: string; name: string }[];
  explanation: string;
}

export function getAttributeEvidence(attributeName: string, state: POSState): AttributeEvidence {
  const meta = SOVEREIGN_ATTRIBUTES_METADATA[attributeName];
  const attrId = meta?.id || '';

  // Related skills bound to this attribute
  const normName = attributeName.toLowerCase();
  const relatedSkills = (state.skills || []).filter(s => {
    if (s.primaryAttribute && s.primaryAttribute.toLowerCase() === normName) return true;
    if (s.secondaryAttribute && s.secondaryAttribute.toLowerCase() === normName) return true;
    if (s.primaryAttributeId === attrId) return true;
    if (s.secondaryAttributeIds && s.secondaryAttributeIds.includes(attrId)) return true;
    if (!s.primaryAttribute && !s.primaryAttributeId && getDefaultAttributesForSkill(s.name).primaryId === attrId) return true;
    return false;
  });

  const relatedSkillIds = new Set(relatedSkills.map(s => s.id));

  // Directives contributing to this attribute
  const completedEvents = (state.xpHistory || []).filter(h => {
    if (h.skillIds && h.skillIds.some(sid => relatedSkillIds.has(sid))) return true;
    if (attributeName === 'Endurance') return true;
    if (attributeName === 'Focus' && h.source === 'focus') return true;
    if (attributeName === 'Discipline' && h.source === 'habit') return true;
    const linkedQuest = (state.quests || []).find(q => q.id === h.questId);
    if (attributeName === 'Focus' && linkedQuest?.type === 'Main') return true;
    if (attributeName === 'Discipline' && linkedQuest?.type === 'Habit') return true;

    const qName = linkedQuest?.name?.toLowerCase() || h.questName?.toLowerCase() || '';
    if (attributeName === 'Clarity' && ['debug', 'refactor', 'architect', 'analyze', 'logic', 'solve', 'bug'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Creativity' && ['design', 'ui', 'ux', 'creative', 'invent', 'art', 'compose'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Memory' && ['memoriz', 'hifz', 'flashcard', 'recall', 'review', 'retention'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Vitality' && ['sleep', 'rest', 'hydrat', 'nutrition', 'meal', 'recover'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Fortitude' && ['cold', 'fasting', 'sawm', 'grit', 'tough', 'resilien'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Mobility' && ['stretch', 'mobility', 'posture', 'walk', 'flexib'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Ihsan' && ['sadaqah', 'charity', 'khushu', 'ihsan', 'contemplat'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Sabr' && ['patien', 'sabr', 'calm', 'forgiv', 'restraint', 'kaffarah'].some(w => qName.includes(w))) return true;
    if (attributeName === 'Shukr' && ['gratitud', 'thank', 'shukr', 'praise', 'alhamdulillah'].some(w => qName.includes(w))) return true;
    return false;
  });

  const relatedCampaigns = (state.projects || []).filter(p => {
    const pSkillIds = (p.requiredSkills || []).concat(
      (p.requiredCapabilities || []).map(c => c.skillId)
    );
    return pSkillIds.some(sid => relatedSkillIds.has(sid));
  }).map(p => ({ id: p.id, name: p.name }));

  const focusMinutes = attributeName === 'Focus' 
    ? (state.profile.focusMinutesToday || 0) + (completedEvents.filter(e => e.source === 'focus').length * 25)
    : 0;

  const bossCount = completedEvents.filter(e => {
    if (e.source === 'boss') return true;
    const q = (state.quests || []).find(quest => quest.id === e.questId);
    return q?.difficulty === 'Boss' || q?.type === 'Boss';
  }).length;

  let explanation = '';
  if (completedEvents.length === 0) {
    explanation = `No recorded directives yet for ${attributeName}. Execute relevant directives or deep work sessions to initiate momentum.`;
  } else {
    explanation = `Grounded across ${completedEvents.length} completed operations, ${relatedSkills.length} linked craft disciplines, and ${relatedCampaigns.length} operational campaigns.`;
  }

  return {
    directivesCount: completedEvents.length,
    focusMinutesTotal: focusMinutes,
    habitStreakBest: state.profile.focusStreak || 0,
    bossVictories: bossCount,
    recentEventsCount: completedEvents.slice(0, 7).length,
    relatedSkills,
    relatedCampaigns,
    explanation
  };
}

export type TrendStatus = 'Improving' | 'Stable' | 'Declining';

export function calculateSkillTrend(skillId: string, xpHistory: XPHistoryEntry[], systemDate: string): { status: TrendStatus; xpRecent: number; deltaPercent: number } {
  const refDate = systemDate || getLocalDateString();
  const d7 = addDays(refDate, -7);
  const d14 = addDays(refDate, -14);

  let xpLast7 = 0;
  let xpPrior7 = 0;

  (xpHistory || []).forEach(h => {
    if (!h.skillIds || !h.skillIds.includes(skillId)) return;
    const eventDate = h.timestamp ? getLocalDateString(h.timestamp) : '';
    if (eventDate >= d7 && eventDate <= refDate) {
      xpLast7 += Math.max(0, h.xp || 0);
    } else if (eventDate >= d14 && eventDate < d7) {
      xpPrior7 += Math.max(0, h.xp || 0);
    }
  });

  if (xpLast7 === 0 && xpPrior7 === 0) {
    return { status: 'Stable', xpRecent: 0, deltaPercent: 0 };
  }
  if (xpLast7 > xpPrior7) {
    const delta = xpPrior7 === 0 ? 100 : Math.round(((xpLast7 - xpPrior7) / xpPrior7) * 100);
    return { status: 'Improving', xpRecent: xpLast7, deltaPercent: delta };
  }
  if (xpLast7 < xpPrior7) {
    const delta = Math.round(((xpPrior7 - xpLast7) / Math.max(xpPrior7, 1)) * 100);
    return { status: 'Declining', xpRecent: xpLast7, deltaPercent: -delta };
  }
  return { status: 'Stable', xpRecent: xpLast7, deltaPercent: 0 };
}

export function calculateAttributeTrend(attributeName: string, xpHistory: XPHistoryEntry[], systemDate?: string, state?: POSState): { status: TrendStatus; label: string } {
  return getAttributeTrend(attributeName, xpHistory, systemDate, state);
}

export function getAttributeTrend(attributeName: string, xpHistory: XPHistoryEntry[], systemDate?: string, state?: POSState): { status: TrendStatus; label: string } {
  const meta = SOVEREIGN_ATTRIBUTES_METADATA[attributeName];
  const attrId = meta?.id;

  const relevantSkills = ((state?.skills) || []).filter(s => 
    s.primaryAttributeId === attrId ||
    (!s.primaryAttributeId && getDefaultAttributesForSkill(s.name).primaryId === attrId)
  );
  const skillIds = new Set(relevantSkills.map(s => s.id));

  const refDate = systemDate || getLocalDateString();
  const d7 = addDays(refDate, -7);
  const d14 = addDays(refDate, -14);

  let countRecent = 0;
  let countPrior = 0;

  (xpHistory || []).forEach(h => {
    const isRelevant = 
      (h.skillIds && h.skillIds.some(sid => skillIds.has(sid))) ||
      (attributeName === 'Endurance') ||
      (attributeName === 'Focus' && h.source === 'focus') ||
      (attributeName === 'Discipline' && h.source === 'habit');

    if (!isRelevant) return;

    const eventDate = h.timestamp ? getLocalDateString(h.timestamp) : '';
    if (eventDate >= d7 && eventDate <= refDate) {
      countRecent += 1;
    } else if (eventDate >= d14 && eventDate < d7) {
      countPrior += 1;
    }
  });

  if (countRecent > countPrior) return { status: 'Improving', label: 'Surging (High Recent Velocity)' };
  if (countRecent < countPrior && countPrior > 0) return { status: 'Declining', label: 'Cooling (Low Activity in Past 7 Days)' };
  return { status: 'Stable', label: 'Equilibrium (Steady Cadence)' };
}

export function generateCapabilityPath(gap: StrategicCapabilityGap): {
  step: number;
  title: string;
  milestone: string;
  directive: string;
  xpTarget: number;
}[] {
  return [
    {
      step: 1,
      title: 'Theoretical Foundations & Syntax',
      milestone: 'Exposure Stage',
      directive: `Review core architectural mental models and documentation for ${gap.skillName}.`,
      xpTarget: 100
    },
    {
      step: 2,
      title: 'Isolated Deliberate Practice Drill',
      milestone: 'Practice Stage',
      directive: `Log 25-50 minutes of deep focus practice drilling problems in ${gap.skillName}.`,
      xpTarget: 250
    },
    {
      step: 3,
      title: 'Tactical Sub-Directive Delivery',
      milestone: 'Practice Stage',
      directive: `Execute a dedicated working directive directly tied to ${gap.sourceEntityName}.`,
      xpTarget: 500
    },
    {
      step: 4,
      title: 'Operational Capstone Delivery',
      milestone: 'Application Stage',
      directive: `Complete the primary operational milestone in ${gap.sourceEntityName} requiring ${gap.skillName}.`,
      xpTarget: 1000
    },
    {
      step: 5,
      title: 'Codex Playbook & SOP Codification',
      milestone: 'Demonstration Stage',
      directive: `Codify repeatable SOP or architectural doctrine into Codex Vault to eliminate future friction.`,
      xpTarget: 1500
    }
  ];
}

/**
 * 4-Stage Mastery Dimension: Exposure -> Practice -> Application -> Demonstration
 */
export function calculateMasteryDimension(skill: Skill, evidence: SkillEvidence): {
  stage: MasteryDimensionStage;
  progressPercent: number;
  stageDescription: string;
  nextMilestoneRequirement: string;
} {
  const { completedDirectivesCount, completedProjectsCount, bossQuestsCount, focusMinutesTotal } = evidence;
  const level = skill.level || 1;

  // Stage 4: Demonstration (Expert proof, real-world deployment, multiple projects & boss quests)
  if (level >= 20 && (completedProjectsCount >= 2 || bossQuestsCount >= 2)) {
    return {
      stage: 'Demonstration',
      progressPercent: Math.min(100, Math.round((level / 50) * 100)),
      stageDescription: 'Validated autonomous capability in high-stakes environments.',
      nextMilestoneRequirement: 'Reach Level 30 Grand Sage and publish a canonical system playbook in Codex.'
    };
  }

  // Stage 3: Application (Building complete projects, solving non-trivial problems)
  if (level >= 10 && (completedProjectsCount >= 1 || bossQuestsCount >= 1 || completedDirectivesCount >= 15)) {
    const progress = Math.min(100, Math.round(((level - 10) / 10) * 100));
    return {
      stage: 'Application',
      progressPercent: progress,
      stageDescription: 'Capable of applying discipline to live projects and complex campaign deliverables.',
      nextMilestoneRequirement: 'Deliver 2 complete projects & reach Level 20 Master for Demonstration status.'
    };
  }

  // Stage 2: Practice (Regular repetitive drills, exercises, and sustained focus)
  if (level >= 5 || completedDirectivesCount >= 5 || focusMinutesTotal >= 120) {
    const progress = Math.min(100, Math.round(((level - 5) / 5) * 100));
    return {
      stage: 'Practice',
      progressPercent: progress,
      stageDescription: 'Actively performing regular deliberate practice and tactical problem solving.',
      nextMilestoneRequirement: 'Complete a major capstone project or Boss Directive to unlock Application stage.'
    };
  }

  // Stage 1: Exposure (Learning syntax, reading documentation, introductory exercises)
  const progress = Math.min(100, Math.round((level / 5) * 100));
  return {
    stage: 'Exposure',
    progressPercent: progress,
    stageDescription: 'Acquiring initial conceptual mental models and introductory fundamentals.',
    nextMilestoneRequirement: 'Complete 5 dedicated directives and reach Level 5 Seeker to enter Practice stage.'
  };
}

export interface StrategicCapabilityGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  readinessPercent: number;
  gapLevel: number;
  importance: 'Essential' | 'Important' | 'Supporting';
  isCritical: boolean;
  priorityScore: number;
  sourceEntityName: string;
  sourceEntityType: 'Destiny' | 'Campaign';
  sourceEntityId: string;
}

export function evaluateStrategicGaps(state: POSState): StrategicCapabilityGap[] {
  const gaps: StrategicCapabilityGap[] = [];
  const skillMap = new Map((state.skills || []).map(s => [s.id, s]));

  // 1. Scan active Campaigns (Projects)
  (state.projects || []).filter(p => p.status === 'Active' || p.status === 'Planned').forEach(project => {
    const reqCaps = project.requiredCapabilities || [];
    
    // Fallback: If no explicit requiredCapabilities, convert requiredSkills / relatedSkills
    const effectiveCaps: RequiredCapability[] = reqCaps.length > 0
      ? reqCaps
      : (project.requiredSkills || []).map(sid => ({
          skillId: sid,
          targetLevel: 10, // Default target
          importance: 'Essential' as const
        }));

    effectiveCaps.forEach(cap => {
      const skill = skillMap.get(cap.skillId);
      if (!skill) return;

      const currentLevel = skill.level || 1;
      const targetLevel = cap.targetLevel || 10;
      const readinessPercent = Math.min(100, Math.round((currentLevel / targetLevel) * 100));
      const gapLevel = Math.max(0, targetLevel - currentLevel);

      const importanceMultiplier = cap.importance === 'Essential' ? 3 : cap.importance === 'Important' ? 2 : 1;
      const priorityScore = gapLevel * importanceMultiplier * (project.priority === 'High' ? 1.5 : 1);
      const isCritical = gapLevel > 0 && readinessPercent < 45 && cap.importance === 'Essential';

      gaps.push({
        skillId: skill.id,
        skillName: skill.name,
        currentLevel,
        targetLevel,
        readinessPercent,
        gapLevel,
        importance: cap.importance,
        isCritical,
        priorityScore,
        sourceEntityName: project.name,
        sourceEntityType: 'Campaign',
        sourceEntityId: project.id
      });
    });
  });

  // 2. Scan active Grand Destinies (Goals)
  (state.goals || []).filter(g => g.status === 'Active').forEach(goal => {
    const reqCaps = goal.requiredCapabilities || [];
    const effectiveCaps: RequiredCapability[] = reqCaps.length > 0
      ? reqCaps
      : (goal.relatedSkills || []).map(sid => ({
          skillId: sid,
          targetLevel: 15, // Strategic long-term target
          importance: 'Essential' as const
        }));

    effectiveCaps.forEach(cap => {
      // If already recorded from a campaign with higher urgency, skip or aggregate
      const existing = gaps.find(g => g.skillId === cap.skillId && g.sourceEntityId === goal.id);
      if (existing) return;

      const skill = skillMap.get(cap.skillId);
      if (!skill) return;

      const currentLevel = skill.level || 1;
      const targetLevel = cap.targetLevel || 15;
      const readinessPercent = Math.min(100, Math.round((currentLevel / targetLevel) * 100));
      const gapLevel = Math.max(0, targetLevel - currentLevel);

      const importanceMultiplier = cap.importance === 'Essential' ? 3 : cap.importance === 'Important' ? 2 : 1;
      const priorityScore = gapLevel * importanceMultiplier * 1.2;
      const isCritical = gapLevel > 0 && readinessPercent < 40 && cap.importance === 'Essential';

      gaps.push({
        skillId: skill.id,
        skillName: skill.name,
        currentLevel,
        targetLevel,
        readinessPercent,
        gapLevel,
        importance: cap.importance,
        isCritical,
        priorityScore,
        sourceEntityName: goal.name,
        sourceEntityType: 'Destiny',
        sourceEntityId: goal.id
      });
    });
  });

  // Sort by priorityScore descending
  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export interface CapabilityRecommendation {
  skillId: string;
  skillName: string;
  strategicContext: string;
  currentReadiness: number;
  steps: {
    order: number;
    title: string;
    description: string;
    actionType: 'DIRECTIVE' | 'POMODORO' | 'CODEX' | 'MILESTONE';
    suggestedTitle: string;
  }[];
}

export function generateCapabilityRecommendations(gap: StrategicCapabilityGap, skill: Skill): CapabilityRecommendation {
  const steps: CapabilityRecommendation['steps'] = [
    {
      order: 1,
      title: '1. Theoretical Blueprint & Mental Model',
      description: `Study core architecture and documentation for ${skill.name}. Establish conceptual foundation.`,
      actionType: 'CODEX',
      suggestedTitle: `Study & synthesize ${skill.name} fundamentals`
    },
    {
      order: 2,
      title: '2. Isolated Deliberate Practice Drill',
      description: `Engage a distraction-free 25m Pomodoro focusing strictly on hands-on exercises in ${skill.name}.`,
      actionType: 'POMODORO',
      suggestedTitle: `25m ${skill.name} deep-work syntax drill`
    },
    {
      order: 3,
      title: '3. Tactical Sub-Directive Delivery',
      description: `Complete a tangible micro-directive that directly supports ${gap.sourceEntityName}.`,
      actionType: 'DIRECTIVE',
      suggestedTitle: `Implement ${skill.name} component for ${gap.sourceEntityName}`
    },
    {
      order: 4,
      title: '4. Applied Capstone Deliverable',
      description: `Resolve a real blocker or complete a milestone in ${gap.sourceEntityName} using this capability.`,
      actionType: 'MILESTONE',
      suggestedTitle: `Deliverable: Complete ${skill.name} integration milestone`
    },
    {
      order: 5,
      title: '5. Codex Playbook Codification',
      description: `Record repeatable SOP or lessons learned in the Codex Vault to lock in long-term retention.`,
      actionType: 'CODEX',
      suggestedTitle: `Codify ${skill.name} Playbook & SOP`
    }
  ];

  return {
    skillId: skill.id,
    skillName: skill.name,
    strategicContext: `Required by ${gap.sourceEntityType} "${gap.sourceEntityName}" (${gap.importance} Priority)`,
    currentReadiness: gap.readinessPercent,
    steps
  };
}

export interface SkillIntelligenceSummary {
  mostDeveloped: { skill: Skill; trend: TrendStatus; evidence: SkillEvidence }[];
  mostNeeded: { gap: StrategicCapabilityGap; skill: Skill }[];
  declining: { skill: Skill; daysInactive: number }[];
  underused: { skill: Skill; reason: string }[];
  strategicGaps: StrategicCapabilityGap[];
}

export function getSkillIntelligenceOverview(state: POSState): SkillIntelligenceSummary {
  const activeSkills = (state.skills || []).filter(s => !s.archived);
  const systemDate = state.systemDate || getLocalDateString();
  const gaps = evaluateStrategicGaps(state);

  // Most Developed: Sorted by level and mastery
  const mostDeveloped = [...activeSkills]
    .sort((a, b) => (b.level * 1000 + b.xp) - (a.level * 1000 + a.xp))
    .slice(0, 4)
    .map(skill => ({
      skill,
      trend: calculateSkillTrend(skill.id, state.xpHistory || [], systemDate).status,
      evidence: getSkillEvidence(skill.id, state)
    }));

  // Most Needed: from strategic gaps
  const mostNeeded = gaps.slice(0, 4).map(gap => {
    const skill = activeSkills.find(s => s.id === gap.skillId)!;
    return { gap, skill };
  }).filter(item => item.skill !== undefined);

  // Declining: Skills with past XP, but no recent events in past 14 days
  const declining: { skill: Skill; daysInactive: number }[] = [];
  const underused: { skill: Skill; reason: string }[] = [];

  activeSkills.forEach(skill => {
    const history = (state.xpHistory || []).filter(h => h.skillIds && h.skillIds.includes(skill.id));
    if (history.length === 0) {
      underused.push({
        skill,
        reason: 'Zero historical directives executed. Unproven track.'
      });
      return;
    }

    const latestEvent = history.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))[0];
    if (latestEvent && latestEvent.timestamp) {
      const eventDate = getLocalDateString(latestEvent.timestamp);
      const daysDiff = Math.round((new Date(systemDate).getTime() - new Date(eventDate).getTime()) / (1000 * 3600 * 24));
      if (daysDiff >= 14) {
        declining.push({
          skill,
          daysInactive: daysDiff
        });
      }
    }
  });

  return {
    mostDeveloped,
    mostNeeded,
    declining: declining.slice(0, 4),
    underused: underused.slice(0, 4),
    strategicGaps: gaps.filter(g => g.gapLevel > 0).slice(0, 5)
  };
}

/**
 * Lightweight Anti-Inflation Check:
 * Warns if creating a skill that is very similar to an existing one.
 */
export function detectDuplicateOrSimilarSkill(name: string, skills: Skill[]): { isDuplicate: boolean; similarSkill?: Skill; reason?: string } {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return { isDuplicate: false };

  // 1. Exact match
  const exact = skills.find(s => s.name.trim().toLowerCase() === trimmed);
  if (exact) {
    return {
      isDuplicate: true,
      similarSkill: exact,
      reason: `An identical discipline named "${exact.name}" already exists.`
    };
  }

  // 2. Substring or high overlap match
  const similar = skills.find(s => {
    const sName = s.name.trim().toLowerCase();
    if (sName.length >= 4 && trimmed.length >= 4) {
      if (sName.includes(trimmed) || trimmed.includes(sName)) return true;
    }
    return false;
  });

  if (similar) {
    return {
      isDuplicate: false,
      similarSkill: similar,
      reason: `Notice: You already have "${similar.name}". Consider adding this as a Secondary Specialization or sub-track rather than splintering disciplines.`
    };
  }

  return { isDuplicate: false };
}
