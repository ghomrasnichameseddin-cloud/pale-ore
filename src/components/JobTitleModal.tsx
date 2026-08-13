import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  getAllJobs, getAllTitles, getActiveJob, getActiveTitle, evaluateUnlockConditions,
  JobSpec, TitleSpec, SkillRequirement, QuestRequirement, LevelConditionSpec,
  isJobUnlocked, isTitleUnlocked, getDefaultLevelConditionSpec,
  getJobLevel, getTitleLevel, evaluateLevelConditions, LEVEL_RANK_NAMES, getJobScaledPerk
} from '../jobsAndTitles';
import { 
  Terminal, Code, Brain, Cpu, Zap, Crosshair, Sparkles, Award, Check, Lock, Shield, X, Star, Plus, Trash2, Pencil, Save,
  BookOpen, GraduationCap, Library, ScrollText, ShieldCheck, Hammer, Anchor, ShieldAlert, Flame, Sun, Heart,
  Target, Compass, Map, Layers, GitBranch, Workflow, Eye, Key, Moon, Wand2, Dumbbell, Swords, Trophy, Activity,
  Building, LayoutGrid, Boxes, Landmark, DraftingCompass, CheckCircle2, XCircle, HelpCircle, FolderGit2, RotateCcw, AlertTriangle
} from 'lucide-react';

interface JobTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPIC_ICON_OPTIONS = [
  {
    category: 'Knowledge',
    icons: [
      { name: 'BookOpen', label: 'Book / Knowledge' },
      { name: 'GraduationCap', label: 'Academia' },
      { name: 'Library', label: 'Library' },
      { name: 'Brain', label: 'Cognitive' },
      { name: 'ScrollText', label: 'Ancient Scroll' }
    ]
  },
  {
    category: 'Iron Will',
    icons: [
      { name: 'ShieldCheck', label: 'Iron Shield' },
      { name: 'Hammer', label: 'Forge Hammer' },
      { name: 'Anchor', label: 'Steadfast Anchor' },
      { name: 'ShieldAlert', label: 'Guard Aegis' }
    ]
  },
  {
    category: 'Passion',
    icons: [
      { name: 'Flame', label: 'Ardour Flame' },
      { name: 'Sparkles', label: 'Sparkles' },
      { name: 'Sun', label: 'Radiant Sun' },
      { name: 'Zap', label: 'Overcharge' },
      { name: 'Heart', label: 'Passion Core' }
    ]
  },
  {
    category: 'Strategy',
    icons: [
      { name: 'Target', label: 'Tactical Target' },
      { name: 'Crosshair', label: 'Precision Focus' },
      { name: 'Compass', label: 'Strategic Compass' },
      { name: 'Map', label: 'Cartography' },
      { name: 'Layers', label: 'Multi-layer Plan' }
    ]
  },
  {
    category: 'Logic',
    icons: [
      { name: 'Code', label: 'Code Logic' },
      { name: 'Cpu', label: 'CPU Processing' },
      { name: 'GitBranch', label: 'Logic Branch' },
      { name: 'Workflow', label: 'System Workflow' },
      { name: 'Terminal', label: 'Terminal Shell' }
    ]
  },
  {
    category: 'Mystery',
    icons: [
      { name: 'Eye', label: 'Mystic Eye' },
      { name: 'Key', label: 'Arcane Key' },
      { name: 'Moon', label: 'Lunar Mystery' },
      { name: 'Wand2', label: 'Arcane Wand' }
    ]
  },
  {
    category: 'Strength',
    icons: [
      { name: 'Dumbbell', label: 'Physical Power' },
      { name: 'Swords', label: 'Dual Blades' },
      { name: 'Shield', label: 'Titan Guard' },
      { name: 'Trophy', label: 'Victor Trophy' },
      { name: 'Activity', label: 'Vigor Output' }
    ]
  },
  {
    category: 'Architecture',
    icons: [
      { name: 'Building', label: 'Structure' },
      { name: 'LayoutGrid', label: 'Grid Blueprint' },
      { name: 'Boxes', label: 'Modular Blocks' },
      { name: 'Landmark', label: 'Monument' },
      { name: 'DraftingCompass', label: 'Architect Compass' }
    ]
  }
];

export const JobTitleModal: React.FC<JobTitleModalProps> = ({ isOpen, onClose }) => {
  const { 
    state, updateJob, updateTitle, getPlayerLevelInfo,
    levelUpJob, levelUpTitle, getJobLevel: getJobLvl, getTitleLevel: getTitleLvl,
    addCustomJob, updateJobSpec, deleteJobSpec, 
    addCustomTitle, updateTitleSpec, deleteTitleSpec 
  } = usePOS();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'titles'>('jobs');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // New Custom Job Form State
  const [jobName, setJobName] = useState('');
  const [jobCategory, setJobCategory] = useState('Architecture');
  const [jobIconName, setJobIconName] = useState('Building');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPerk, setJobPerk] = useState('');
  const [jobReqLevel, setJobReqLevel] = useState(1);
  const [jobQuestReqs, setJobQuestReqs] = useState<QuestRequirement[]>([]);
  const [jobSkillReqs, setJobSkillReqs] = useState<SkillRequirement[]>([]);
  const [jobRelatedGoalIds, setJobRelatedGoalIds] = useState<string[]>([]);
  const [jobRelatedProjectIds, setJobRelatedProjectIds] = useState<string[]>([]);

  // New Custom Title Form State
  const [titleName, setTitleName] = useState('');
  const [titleBadge, setTitleBadge] = useState('');
  const [titleCategory, setTitleCategory] = useState('Knowledge');
  const [titleIconName, setTitleIconName] = useState('BookOpen');
  const [titleDescription, setTitleDescription] = useState('');
  const [titleUnlockCondition, setTitleUnlockCondition] = useState('Derived Quest Directive');
  const [titleReqLevel, setTitleReqLevel] = useState(1);
  const [titleQuestReqs, setTitleQuestReqs] = useState<QuestRequirement[]>([]);
  const [titleSkillReqs, setTitleSkillReqs] = useState<SkillRequirement[]>([]);
  const [titleRelatedGoalIds, setTitleRelatedGoalIds] = useState<string[]>([]);
  const [titleRelatedProjectIds, setTitleRelatedProjectIds] = useState<string[]>([]);

  // Edit Job State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editJobName, setEditJobName] = useState('');
  const [editJobCategory, setEditJobCategory] = useState('');
  const [editJobIconName, setEditJobIconName] = useState('Code');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobPerk, setEditJobPerk] = useState('');
  const [editJobReqLevel, setEditJobReqLevel] = useState(1);
  const [editJobQuestReqs, setEditJobQuestReqs] = useState<QuestRequirement[]>([]);
  const [editJobSkillReqs, setEditJobSkillReqs] = useState<SkillRequirement[]>([]);
  const [editJobRelatedGoalIds, setEditJobRelatedGoalIds] = useState<string[]>([]);
  const [editJobRelatedProjectIds, setEditJobRelatedProjectIds] = useState<string[]>([]);

  // Edit Title State
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleName, setEditTitleName] = useState('');
  const [editTitleBadge, setEditTitleBadge] = useState('');
  const [editTitleCategory, setEditTitleCategory] = useState('');
  const [editTitleIconName, setEditTitleIconName] = useState('GraduationCap');
  const [editTitleDescription, setEditTitleDescription] = useState('');
  const [editTitleUnlockCondition, setEditTitleUnlockCondition] = useState('');
  const [editTitleReqLevel, setEditTitleReqLevel] = useState(1);
  const [editTitleQuestReqs, setEditTitleQuestReqs] = useState<QuestRequirement[]>([]);
  const [editTitleSkillReqs, setEditTitleSkillReqs] = useState<SkillRequirement[]>([]);
  const [editTitleRelatedGoalIds, setEditTitleRelatedGoalIds] = useState<string[]>([]);
  const [editTitleRelatedProjectIds, setEditTitleRelatedProjectIds] = useState<string[]>([]);

  // Level Up Configurator Modal State (Levels 2 - 7)
  const [levelUpModalJob, setLevelUpModalJob] = useState<JobSpec | null>(null);
  const [levelUpModalTitle, setLevelUpModalTitle] = useState<TitleSpec | null>(null);
  const [luTargetLevel, setLuTargetLevel] = useState<number>(2);

  // Active target level condition working copy
  const [luLevelCondition, setLuLevelCondition] = useState<LevelConditionSpec>({
    level: 2,
    unlockedAtLevel: 3,
    requiredQuestsCount: 10,
    requiredQuestStreak: 1,
    requiredFocusMinutes: 0,
    questRequirements: [],
    skillRequirements: [],
    relatedGoalIds: [],
    relatedProjectIds: []
  });

  // Base Spec properties editable inside Level Up Configurator
  const [luName, setLuName] = useState('');
  const [luBadge, setLuBadge] = useState('');
  const [luCategory, setLuCategory] = useState('Architecture');
  const [luIconName, setLuIconName] = useState('Building');
  const [luDescription, setLuDescription] = useState('');
  const [luPerkOrCondition, setLuPerkOrCondition] = useState('');

  // Helper to load condition spec for selected target level
  const loadConditionsForLevel = (spec: JobSpec | TitleSpec, targetLevel: number) => {
    if (spec.customLevelConditions && spec.customLevelConditions[targetLevel]) {
      const existing = spec.customLevelConditions[targetLevel];
      setLuLevelCondition({
        level: targetLevel,
        unlockedAtLevel: existing.unlockedAtLevel ?? 0,
        requiredQuestsCount: existing.requiredQuestsCount ?? 0,
        requiredQuestStreak: existing.requiredQuestStreak ?? 0,
        requiredFocusMinutes: existing.requiredFocusMinutes ?? 0,
        questRequirements: existing.questRequirements ? [...existing.questRequirements] : [],
        skillRequirements: existing.skillRequirements ? [...existing.skillRequirements] : [],
        relatedGoalId: existing.relatedGoalId || null,
        relatedGoalIds: existing.relatedGoalIds ? [...existing.relatedGoalIds] : (existing.relatedGoalId ? [existing.relatedGoalId] : []),
        relatedProjectId: existing.relatedProjectId || null,
        relatedProjectIds: existing.relatedProjectIds ? [...existing.relatedProjectIds] : (existing.relatedProjectId ? [existing.relatedProjectId] : []),
        customConditionText: existing.customConditionText || '',
        isCustomized: true
      });
    } else {
      const def = getDefaultLevelConditionSpec(spec, targetLevel);
      setLuLevelCondition({
        ...def,
        questRequirements: def.questRequirements ? [...def.questRequirements] : [],
        skillRequirements: def.skillRequirements ? [...def.skillRequirements] : [],
        relatedGoalIds: def.relatedGoalIds ? [...def.relatedGoalIds] : (def.relatedGoalId ? [def.relatedGoalId] : []),
        relatedProjectIds: def.relatedProjectIds ? [...def.relatedProjectIds] : (def.relatedProjectId ? [def.relatedProjectId] : []),
        isCustomized: false
      });
    }
  };

  const openLevelUpForJob = (job: JobSpec) => {
    const currentLvl = getJobLvl ? getJobLvl(job.id) : 1;
    const nextLvl = currentLvl < 7 ? currentLvl + 1 : 7;
    setLevelUpModalJob(job);
    setLevelUpModalTitle(null);
    setLuTargetLevel(nextLvl);

    setLuName(job.name);
    setLuBadge('');
    setLuCategory(job.category || 'Architecture');
    setLuIconName(job.iconName || 'Building');
    setLuDescription(job.description || '');
    setLuPerkOrCondition(job.perk || '');

    loadConditionsForLevel(job, nextLvl);
  };

  const openLevelUpForTitle = (title: TitleSpec) => {
    const currentLvl = getTitleLvl ? getTitleLvl(title.id) : 1;
    const nextLvl = currentLvl < 7 ? currentLvl + 1 : 7;
    setLevelUpModalTitle(title);
    setLevelUpModalJob(null);
    setLuTargetLevel(nextLvl);

    setLuName(title.name);
    setLuBadge(title.badge || '');
    setLuCategory(title.category || 'Knowledge');
    setLuIconName(title.iconName || 'BookOpen');
    setLuDescription(title.description || '');
    setLuPerkOrCondition(title.unlockCondition || '');

    loadConditionsForLevel(title, nextLvl);
  };

  const handleTargetLevelChange = (newTargetLevel: number) => {
    setLuTargetLevel(newTargetLevel);
    const spec = levelUpModalJob || levelUpModalTitle;
    if (spec) {
      loadConditionsForLevel(spec, newTargetLevel);
    }
  };

  const closeLevelUpModal = () => {
    setLevelUpModalJob(null);
    setLevelUpModalTitle(null);
  };

  // Helpers to manipulate luLevelCondition
  const toggleLuSkill = (skillId: string) => {
    setLuLevelCondition(prev => {
      const reqs = prev.skillRequirements || [];
      const exists = reqs.find(s => s.skillId === skillId);
      if (exists) {
        return { ...prev, skillRequirements: reqs.filter(s => s.skillId !== skillId), isCustomized: true };
      } else {
        return { ...prev, skillRequirements: [...reqs, { skillId, minLevel: luTargetLevel }], isCustomized: true };
      }
    });
  };

  const setLuSkillLevel = (skillId: string, minLevel: number) => {
    setLuLevelCondition(prev => ({
      ...prev,
      skillRequirements: (prev.skillRequirements || []).map(s => s.skillId === skillId ? { ...s, minLevel } : s),
      isCustomized: true
    }));
  };

  const addLuQuestReq = (questId: string) => {
    if (!questId) return;
    setLuLevelCondition(prev => {
      const reqs = prev.questRequirements || [];
      if (reqs.some(q => q.questId === questId)) return prev;
      return {
        ...prev,
        questRequirements: [...reqs, { questId, minStreak: Math.max(1, luTargetLevel - 1), requireCompleted: true }],
        isCustomized: true
      };
    });
  };

  const removeLuQuestReq = (questId: string) => {
    setLuLevelCondition(prev => ({
      ...prev,
      questRequirements: (prev.questRequirements || []).filter(q => q.questId !== questId),
      isCustomized: true
    }));
  };

  const setLuQuestStreak = (questId: string, minStreak: number) => {
    setLuLevelCondition(prev => ({
      ...prev,
      questRequirements: (prev.questRequirements || []).map(q => q.questId === questId ? { ...q, minStreak } : q),
      isCustomized: true
    }));
  };

  const toggleLuGoal = (goalId: string) => {
    setLuLevelCondition(prev => {
      const current = prev.relatedGoalIds || (prev.relatedGoalId ? [prev.relatedGoalId] : []);
      const updated = current.includes(goalId) ? current.filter(id => id !== goalId) : [...current, goalId];
      return {
        ...prev,
        relatedGoalIds: updated,
        relatedGoalId: updated[0] || null,
        isCustomized: true
      };
    });
  };

  const toggleLuProject = (projectId: string) => {
    setLuLevelCondition(prev => {
      const current = prev.relatedProjectIds || (prev.relatedProjectId ? [prev.relatedProjectId] : []);
      const updated = current.includes(projectId) ? current.filter(id => id !== projectId) : [...current, projectId];
      return {
        ...prev,
        relatedProjectIds: updated,
        relatedProjectId: updated[0] || null,
        isCustomized: true
      };
    });
  };

  // Delete all conditions for Level X (making it require 0 conditions to level up)
  const handleClearAllConditionsForLevel = () => {
    const cleared: LevelConditionSpec = {
      level: luTargetLevel,
      unlockedAtLevel: 0,
      requiredQuestsCount: 0,
      requiredQuestStreak: 0,
      requiredFocusMinutes: 0,
      questRequirements: [],
      skillRequirements: [],
      relatedGoalIds: [],
      relatedProjectIds: [],
      isCustomized: true
    };
    setLuLevelCondition(cleared);

    if (levelUpModalJob) {
      const updatedJob: JobSpec = {
        ...levelUpModalJob,
        name: luName,
        category: luCategory,
        iconName: luIconName,
        description: luDescription,
        perk: luPerkOrCondition,
        customLevelConditions: {
          ...(levelUpModalJob.customLevelConditions || {}),
          [luTargetLevel]: cleared
        },
        isCustom: true
      };
      updateJobSpec(updatedJob);
      setLevelUpModalJob(updatedJob);
      showToast(`Cleared all leveling conditions for Level ${luTargetLevel}! It is now immediately achievable.`);
    } else if (levelUpModalTitle) {
      const updatedTitle: TitleSpec = {
        ...levelUpModalTitle,
        name: luName,
        badge: luBadge,
        category: luCategory,
        iconName: luIconName,
        description: luDescription,
        unlockCondition: luPerkOrCondition,
        customLevelConditions: {
          ...(levelUpModalTitle.customLevelConditions || {}),
          [luTargetLevel]: cleared
        },
        isCustom: true
      };
      updateTitleSpec(updatedTitle);
      setLevelUpModalTitle(updatedTitle);
      showToast(`Cleared all leveling conditions for Level ${luTargetLevel}! It is now immediately achievable.`);
    }
  };

  // Revert conditions for Level X back to standard formula
  const handleResetLevelToDefaults = () => {
    const spec = levelUpModalJob || levelUpModalTitle;
    if (!spec) return;
    const def = getDefaultLevelConditionSpec(spec, luTargetLevel);
    setLuLevelCondition({
      ...def,
      questRequirements: def.questRequirements ? [...def.questRequirements] : [],
      skillRequirements: def.skillRequirements ? [...def.skillRequirements] : [],
      relatedGoalIds: def.relatedGoalIds ? [...def.relatedGoalIds] : [],
      relatedProjectIds: def.relatedProjectIds ? [...def.relatedProjectIds] : [],
      isCustomized: false
    });

    if (levelUpModalJob) {
      const nextCustom = { ...(levelUpModalJob.customLevelConditions || {}) };
      delete nextCustom[luTargetLevel];
      const updatedJob: JobSpec = {
        ...levelUpModalJob,
        customLevelConditions: Object.keys(nextCustom).length > 0 ? nextCustom : undefined
      };
      updateJobSpec(updatedJob);
      setLevelUpModalJob(updatedJob);
      showToast(`Reverted Level ${luTargetLevel} conditions to standard progression defaults.`);
    } else if (levelUpModalTitle) {
      const nextCustom = { ...(levelUpModalTitle.customLevelConditions || {}) };
      delete nextCustom[luTargetLevel];
      const updatedTitle: TitleSpec = {
        ...levelUpModalTitle,
        customLevelConditions: Object.keys(nextCustom).length > 0 ? nextCustom : undefined
      };
      updateTitleSpec(updatedTitle);
      setLevelUpModalTitle(updatedTitle);
      showToast(`Reverted Level ${luTargetLevel} conditions to standard progression defaults.`);
    }
  };

  const handleSaveLuLevelConditions = () => {
    const conditionToSave: LevelConditionSpec = {
      ...luLevelCondition,
      level: luTargetLevel,
      isCustomized: true
    };

    if (levelUpModalJob) {
      const updatedJob: JobSpec = {
        ...levelUpModalJob,
        name: luName,
        category: luCategory,
        iconName: luIconName,
        description: luDescription,
        perk: luPerkOrCondition,
        customLevelConditions: {
          ...(levelUpModalJob.customLevelConditions || {}),
          [luTargetLevel]: conditionToSave
        },
        isCustom: true
      };
      updateJobSpec(updatedJob);
      setLevelUpModalJob(updatedJob);
      showToast(`Successfully saved custom Level ${luTargetLevel} conditions for "${luName}"!`);
    } else if (levelUpModalTitle) {
      const updatedTitle: TitleSpec = {
        ...levelUpModalTitle,
        name: luName,
        badge: luBadge,
        category: luCategory,
        iconName: luIconName,
        description: luDescription,
        unlockCondition: luPerkOrCondition,
        customLevelConditions: {
          ...(levelUpModalTitle.customLevelConditions || {}),
          [luTargetLevel]: conditionToSave
        },
        isCustom: true
      };
      updateTitleSpec(updatedTitle);
      setLevelUpModalTitle(updatedTitle);
      showToast(`Successfully saved custom Level ${luTargetLevel} conditions for "${luName}"!`);
    }
  };

  const handleConfirmAndLevelUp = () => {
    handleSaveLuLevelConditions();
    if (levelUpModalJob) {
      const res = levelUpJob(levelUpModalJob.id, luTargetLevel, true);
      showToast(res.message, 'success');
      closeLevelUpModal();
    } else if (levelUpModalTitle) {
      const res = levelUpTitle(levelUpModalTitle.id, luTargetLevel, true);
      showToast(res.message, 'success');
      closeLevelUpModal();
    }
  };

  // Handlers for Creation of Job & Title
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    addCustomJob({
      name: jobName.trim(),
      category: jobCategory || 'Architecture',
      iconName: jobIconName || 'Building',
      description: jobDescription.trim() || 'Custom directive job class.',
      perk: jobPerk.trim() || '+10% bonus on directives',
      unlockedAtLevel: Number(jobReqLevel) || 1,
      questRequirements: jobQuestReqs.length > 0 ? jobQuestReqs : undefined,
      skillRequirements: jobSkillReqs.length > 0 ? jobSkillReqs : undefined,
      relatedGoalIds: jobRelatedGoalIds.length > 0 ? jobRelatedGoalIds : undefined,
      relatedProjectIds: jobRelatedProjectIds.length > 0 ? jobRelatedProjectIds : undefined
    });

    setJobName('');
    setJobDescription('');
    setJobPerk('');
    setJobReqLevel(1);
    setJobQuestReqs([]);
    setJobSkillReqs([]);
    setJobRelatedGoalIds([]);
    setJobRelatedProjectIds([]);
    setShowAddForm(false);
    showToast(`Created Custom Job Class "${jobName.trim()}"!`);
  };

  const handleCreateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleName.trim()) return;

    addCustomTitle({
      name: titleName.trim(),
      badge: (titleBadge.trim() || titleName.trim().substring(0, 10)).toUpperCase(),
      category: titleCategory || 'Knowledge',
      iconName: titleIconName || 'BookOpen',
      description: titleDescription.trim() || 'Custom honorific prestige title.',
      unlockCondition: titleUnlockCondition.trim() || 'Derived condition unlock',
      unlockedAtLevel: Number(titleReqLevel) || 1,
      questRequirements: titleQuestReqs.length > 0 ? titleQuestReqs : undefined,
      skillRequirements: titleSkillReqs.length > 0 ? titleSkillReqs : undefined,
      relatedGoalIds: titleRelatedGoalIds.length > 0 ? titleRelatedGoalIds : undefined,
      relatedProjectIds: titleRelatedProjectIds.length > 0 ? titleRelatedProjectIds : undefined
    });

    setTitleName('');
    setTitleBadge('');
    setTitleDescription('');
    setTitleUnlockCondition('Derived Quest Directive');
    setTitleReqLevel(1);
    setTitleQuestReqs([]);
    setTitleSkillReqs([]);
    setTitleRelatedGoalIds([]);
    setTitleRelatedProjectIds([]);
    setShowAddForm(false);
    showToast(`Created Custom Honorific Title "${titleName.trim()}"!`);
  };

  // Edit Job handlers
  const startEditJob = (job: JobSpec) => {
    setEditingJobId(job.id);
    setEditJobName(job.name);
    setEditJobCategory(job.category);
    setEditJobIconName(job.iconName);
    setEditJobDescription(job.description);
    setEditJobPerk(job.perk);
    setEditJobReqLevel(job.unlockedAtLevel || 1);
    
    // Normalize quest requirements
    const qReqs = job.questRequirements ? [...job.questRequirements] : [];
    if (job.relatedQuestId && !qReqs.some(q => q.questId === job.relatedQuestId)) {
      qReqs.push({ questId: job.relatedQuestId, minStreak: job.requiredQuestStreak || 0, requireCompleted: true });
    }
    setEditJobQuestReqs(qReqs);
    setEditJobSkillReqs(job.skillRequirements ? [...job.skillRequirements] : []);
    
    const gIds = job.relatedGoalIds ? [...job.relatedGoalIds] : (job.relatedGoalId ? [job.relatedGoalId] : []);
    setEditJobRelatedGoalIds(gIds);

    const pIds = job.relatedProjectIds ? [...job.relatedProjectIds] : (job.relatedProjectId ? [job.relatedProjectId] : []);
    setEditJobRelatedProjectIds(pIds);
  };

  const handleSaveJobEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobId || !editJobName.trim()) return;

    const originalJob = allJobs.find(j => j.id === editingJobId);

    updateJobSpec({
      id: editingJobId,
      name: editJobName.trim(),
      category: editJobCategory.trim() || 'Architecture',
      iconName: editJobIconName,
      description: editJobDescription.trim(),
      perk: editJobPerk.trim(),
      unlockedAtLevel: Number(editJobReqLevel) || 1,
      questRequirements: editJobQuestReqs.length > 0 ? editJobQuestReqs : undefined,
      skillRequirements: editJobSkillReqs.length > 0 ? editJobSkillReqs : undefined,
      relatedGoalIds: editJobRelatedGoalIds.length > 0 ? editJobRelatedGoalIds : undefined,
      relatedProjectIds: editJobRelatedProjectIds.length > 0 ? editJobRelatedProjectIds : undefined,
      customLevelConditions: originalJob?.customLevelConditions,
      isCustom: originalJob?.isCustom
    });

    setEditingJobId(null);
    showToast(`Updated Job Class "${editJobName.trim()}"!`);
  };

  // Edit Title handlers
  const startEditTitle = (title: TitleSpec) => {
    setEditingTitleId(title.id);
    setEditTitleName(title.name);
    setEditTitleBadge(title.badge);
    setEditTitleCategory(title.category);
    setEditTitleIconName(title.iconName || 'GraduationCap');
    setEditTitleDescription(title.description);
    setEditTitleUnlockCondition(title.unlockCondition);
    setEditTitleReqLevel(title.unlockedAtLevel || 1);

    const qReqs = title.questRequirements ? [...title.questRequirements] : [];
    if (title.relatedQuestId && !qReqs.some(q => q.questId === title.relatedQuestId)) {
      qReqs.push({ questId: title.relatedQuestId, minStreak: title.requiredQuestStreak || 0, requireCompleted: true });
    }
    setEditTitleQuestReqs(qReqs);
    setEditTitleSkillReqs(title.skillRequirements ? [...title.skillRequirements] : []);

    const gIds = title.relatedGoalIds ? [...title.relatedGoalIds] : (title.relatedGoalId ? [title.relatedGoalId] : []);
    setEditTitleRelatedGoalIds(gIds);

    const pIds = title.relatedProjectIds ? [...title.relatedProjectIds] : (title.relatedProjectId ? [title.relatedProjectId] : []);
    setEditTitleRelatedProjectIds(pIds);
  };

  const handleSaveTitleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTitleId || !editTitleName.trim()) return;

    const originalTitle = allTitles.find(t => t.id === editingTitleId);

    updateTitleSpec({
      id: editingTitleId,
      name: editTitleName.trim(),
      badge: (editTitleBadge.trim() || editTitleName.trim().substring(0, 10)).toUpperCase(),
      category: editTitleCategory.trim() || 'Knowledge',
      iconName: editTitleIconName,
      description: editTitleDescription.trim(),
      unlockCondition: editTitleUnlockCondition.trim(),
      unlockedAtLevel: Number(editTitleReqLevel) || 1,
      questRequirements: editTitleQuestReqs.length > 0 ? editTitleQuestReqs : undefined,
      skillRequirements: editTitleSkillReqs.length > 0 ? editTitleSkillReqs : undefined,
      relatedGoalIds: editTitleRelatedGoalIds.length > 0 ? editTitleRelatedGoalIds : undefined,
      relatedProjectIds: editTitleRelatedProjectIds.length > 0 ? editTitleRelatedProjectIds : undefined,
      customLevelConditions: originalTitle?.customLevelConditions,
      checkUnlocked: originalTitle?.checkUnlocked,
      isCustom: originalTitle?.isCustom
    });

    setEditingTitleId(null);
    showToast(`Updated Title "${editTitleName.trim()}"!`);
  };

  if (!isOpen) return null;

  const playerInfo = getPlayerLevelInfo();
  const allJobs = getAllJobs(state.customJobs || [], state.deletedJobIds || []);
  const allTitles = getAllTitles(state.customTitles || [], state.deletedTitleIds || []);

  const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
  const activeTitle = getActiveTitle(state.profile.equippedTitleId, state.customTitles || [], state.deletedTitleIds || []);

  const renderTopicIcon = (iconName: string, className: string = "h-5 w-5") => {
    switch (iconName) {
      // Knowledge
      case 'BookOpen': return <BookOpen className={`${className} text-cyan-400`} />;
      case 'GraduationCap': return <GraduationCap className={`${className} text-cyan-300`} />;
      case 'Library': return <Library className={`${className} text-teal-400`} />;
      case 'Brain': return <Brain className={`${className} text-emerald-400`} />;
      case 'ScrollText': return <ScrollText className={`${className} text-cyan-200`} />;

      // Iron Will
      case 'ShieldCheck': return <ShieldCheck className={`${className} text-slate-300`} />;
      case 'Hammer': return <Hammer className={`${className} text-amber-400`} />;
      case 'Anchor': return <Anchor className={`${className} text-blue-400`} />;
      case 'ShieldAlert': return <ShieldAlert className={`${className} text-rose-400`} />;

      // Passion
      case 'Flame': return <Flame className={`${className} text-orange-400`} />;
      case 'Sparkles': return <Sparkles className={`${className} text-yellow-400`} />;
      case 'Sun': return <Sun className={`${className} text-amber-400`} />;
      case 'Zap': return <Zap className={`${className} text-yellow-300`} />;
      case 'Heart': return <Heart className={`${className} text-rose-400`} />;

      // Strategy
      case 'Target': return <Target className={`${className} text-rose-400`} />;
      case 'Crosshair': return <Crosshair className={`${className} text-red-400`} />;
      case 'Compass': return <Compass className={`${className} text-indigo-400`} />;
      case 'Map': return <Map className={`${className} text-amber-300`} />;
      case 'Layers': return <Layers className={`${className} text-cyan-300`} />;

      // Logic
      case 'Code': return <Code className={`${className} text-emerald-400`} />;
      case 'Cpu': return <Cpu className={`${className} text-cyan-400`} />;
      case 'GitBranch': return <GitBranch className={`${className} text-purple-400`} />;
      case 'Workflow': return <Workflow className={`${className} text-teal-300`} />;
      case 'Terminal': return <Terminal className={`${className} text-emerald-300`} />;

      // Mystery
      case 'Eye': return <Eye className={`${className} text-purple-400`} />;
      case 'Key': return <Key className={`${className} text-amber-300`} />;
      case 'Moon': return <Moon className={`${className} text-indigo-300`} />;
      case 'Wand2': return <Wand2 className={`${className} text-fuchsia-400`} />;

      // Strength
      case 'Dumbbell': return <Dumbbell className={`${className} text-red-400`} />;
      case 'Swords': return <Swords className={`${className} text-amber-400`} />;
      case 'Shield': return <Shield className={`${className} text-blue-400`} />;
      case 'Trophy': return <Trophy className={`${className} text-yellow-400`} />;
      case 'Activity': return <Activity className={`${className} text-emerald-400`} />;

      // Architecture
      case 'Building': return <Building className={`${className} text-cyan-400`} />;
      case 'LayoutGrid': return <LayoutGrid className={`${className} text-teal-400`} />;
      case 'Boxes': return <Boxes className={`${className} text-amber-300`} />;
      case 'Landmark': return <Landmark className={`${className} text-indigo-300`} />;
      case 'DraftingCompass': return <DraftingCompass className={`${className} text-emerald-400`} />;

      default: return <Award className={`${className} text-cyan-400`} />;
    }
  };

  // Derived Unlock Conditions Configurator Sub-component for Add/Edit Forms
  const renderUnlockConfigurator = (
    systemLevel: number,
    setSystemLevel: (val: number) => void,
    questReqs: QuestRequirement[],
    setQuestReqs: React.Dispatch<React.SetStateAction<QuestRequirement[]>>,
    skillReqs: SkillRequirement[],
    setSkillReqs: React.Dispatch<React.SetStateAction<SkillRequirement[]>>,
    goalIds: string[],
    setGoalIds: React.Dispatch<React.SetStateAction<string[]>>,
    projectIds: string[],
    setProjectIds: React.Dispatch<React.SetStateAction<string[]>>,
    accentColor: string = "cyan"
  ) => {
    return (
      <div className="p-3.5 bg-zinc-950/80 border border-cyan-500/30 rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            DERIVED UNLOCK CONDITIONS CONFIGURATOR
          </span>
          <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            Filling at least 1 condition configures unlock
          </span>
        </div>

        {/* 1. REQUIRED SYSTEM LEVEL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 block mb-1 font-bold">1. REQUIRED SYSTEM LEVEL</label>
            <input 
              type="number"
              min="1"
              max="100"
              value={systemLevel}
              onChange={e => setSystemLevel(Number(e.target.value))}
              className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[9px] text-zinc-500 mt-0.5 block">Player system level required (Lvl 1 = available immediately)</span>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 font-bold">2. ADD RELATED QUEST REQUIREMENT</label>
            <select
              onChange={e => {
                const qId = e.target.value;
                if (!qId) return;
                if (!questReqs.some(q => q.questId === qId)) {
                  setQuestReqs(prev => [...prev, { questId: qId, minStreak: 0, requireCompleted: true }]);
                }
                e.target.value = '';
              }}
              className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">+ Select Quest to Add Condition...</option>
              {state.quests.map(q => (
                <option key={q.id} value={q.id}>
                  {q.name} [{q.status}] ({q.difficulty})
                </option>
              ))}
            </select>
            <span className="text-[9px] text-zinc-500 mt-0.5 block">Link quests that must be completed or maintained with streak</span>
          </div>
        </div>

        {/* LIST OF ACTIVE QUEST REQUIREMENTS */}
        {questReqs.length > 0 && (
          <div className="space-y-1.5 bg-black/40 p-2 rounded border border-white/5">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">ACTIVE QUEST CONDITIONS ({questReqs.length}):</span>
            {questReqs.map(qReq => {
              const q = state.quests.find(x => x.id === qReq.questId);
              return (
                <div key={qReq.questId} className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900 px-2.5 py-1.5 rounded border border-white/10 text-[11px]">
                  <span className="font-bold text-white flex-1 min-w-[140px] truncate">
                    🎯 {q ? q.name : 'Linked Quest'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <span>Req Streak:</span>
                      <input 
                        type="number"
                        min="0"
                        max="365"
                        value={qReq.minStreak || 0}
                        onChange={e => {
                          const streak = Number(e.target.value) || 0;
                          setQuestReqs(prev => prev.map(x => x.questId === qReq.questId ? { ...x, minStreak: streak } : x));
                        }}
                        className="w-12 bg-black border border-white/20 rounded px-1 text-center text-white"
                      />
                      <span>d</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setQuestReqs(prev => prev.filter(x => x.questId !== qReq.questId))}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition"
                      title="Remove Quest Requirement"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. RELATED SKILLS + LEVEL PER SKILL */}
        <div>
          <label className="text-zinc-400 block mb-1 font-bold">3. RELATED SKILLS + REQUIRED LEVEL FOR EACH SKILL</label>
          <div className="flex flex-wrap gap-2 bg-black/40 p-2 rounded border border-white/10">
            {state.skills.map(s => {
              const existing = skillReqs.find(sr => sr.skillId === s.id);
              const isSelected = !!existing;
              return (
                <div 
                  key={s.id}
                  className={`p-1.5 rounded border flex items-center gap-1.5 text-[10px] transition ${
                    isSelected ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300' : 'bg-zinc-900 border-white/5 text-zinc-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSkillReqs(prev => prev.filter(x => x.skillId !== s.id));
                      } else {
                        setSkillReqs(prev => [...prev, { skillId: s.id, minLevel: 2 }]);
                      }
                    }}
                    className="font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isSelected ? <CheckCircle2 className="h-3 w-3 text-cyan-400" /> : <Plus className="h-3 w-3 text-zinc-500" />}
                    {s.name}
                  </button>

                  {isSelected && (
                    <div className="flex items-center gap-1 border-l border-white/10 pl-1">
                      <span>Lvl &gt;=</span>
                      <input 
                        type="number"
                        min="1"
                        max="50"
                        value={existing.minLevel}
                        onChange={e => {
                          const minLvl = Number(e.target.value) || 1;
                          setSkillReqs(prev => prev.map(x => x.skillId === s.id ? { ...x, minLevel: minLvl } : x));
                        }}
                        className="w-9 bg-black border border-white/20 rounded px-1 text-center text-white font-bold"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. RELATED GOALS */}
        <div>
          <label className="text-zinc-400 block mb-1 font-bold">4. RELATED GOALS (ACTIVE OR COMPLETED)</label>
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-2 rounded border border-white/10">
            {state.goals.length === 0 && <span className="text-[10px] text-zinc-500">No active goals configured.</span>}
            {state.goals.map(g => {
              const isSelected = goalIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGoalIds(prev => isSelected ? prev.filter(id => id !== g.id) : [...prev, g.id]);
                  }}
                  className={`px-2 py-1 rounded text-[10px] border flex items-center gap-1 transition cursor-pointer ${
                    isSelected ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <Target className="h-3 w-3" />
                  <span>{g.name}</span>
                  {isSelected && <Check className="h-2.5 w-2.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. RELATED PROJECTS */}
        <div>
          <label className="text-zinc-400 block mb-1 font-bold">5. RELATED PROJECTS (ACTIVE OR COMPLETED)</label>
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-2 rounded border border-white/10">
            {state.projects.length === 0 && <span className="text-[10px] text-zinc-500">No active projects configured.</span>}
            {state.projects.map(p => {
              const isSelected = projectIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProjectIds(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                  }}
                  className={`px-2 py-1 rounded text-[10px] border flex items-center gap-1 transition cursor-pointer ${
                    isSelected ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <FolderGit2 className="h-3 w-3" />
                  <span>{p.name}</span>
                  {isSelected && <Check className="h-2.5 w-2.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="job-title-modal">
      <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg font-mono text-xs font-bold border shadow-xl flex items-center gap-2 animate-fade-in ${
            toastMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-zinc-900 text-zinc-200 border-white/20'
          }`}>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {toastMessage.text}
          </div>
        )}

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">OPERATOR CAREER & HONORIFIC MATRIX</span>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-white flex items-center gap-2 mt-0.5 uppercase">
              <Award className="h-5 w-5 text-cyan-400" /> JOB CLASSES & TITLES UNLOCK SYSTEM
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ACTIVE STATUS HIGHLIGHT BANNER */}
        <div className="px-4 sm:px-5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">ACTIVE JOB:</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              {renderTopicIcon(activeJob.iconName)}
              {activeJob.name}
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                LVL {getJobLvl(activeJob.id)}/7
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">EQUIPPED TITLE:</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] flex items-center gap-1.5">
              {renderTopicIcon(activeTitle.iconName || 'GraduationCap', 'h-3.5 w-3.5')}
              [{activeTitle.badge}] {activeTitle.name}
              <span className="text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                LVL {getTitleLvl(activeTitle.id)}/7
              </span>
            </span>
          </div>
        </div>

        {/* NAV TABS + CREATE BUTTON */}
        <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/20 px-2">
          <div className="flex flex-1">
            <button
              onClick={() => { setActiveTab('jobs'); setShowAddForm(false); setEditingJobId(null); setEditingTitleId(null); }}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'jobs' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Shield className="h-4 w-4" /> JOB CLASSES ({allJobs.length})
            </button>
            <button
              onClick={() => { setActiveTab('titles'); setShowAddForm(false); setEditingJobId(null); setEditingTitleId(null); }}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'titles' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Star className="h-4 w-4" /> HONORIFIC TITLES ({allTitles.filter(t => isTitleUnlocked(t, state)).length}/{allTitles.length} UNLOCKED)
            </button>
          </div>

          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingJobId(null); setEditingTitleId(null); }}
            className="my-1.5 mr-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAddForm ? 'CANCEL' : activeTab === 'jobs' ? '+ CREATE JOB' : '+ CREATE TITLE'}
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CREATE CUSTOM JOB OR TITLE FORM */}
          {showAddForm && (
            <div className="p-4 bg-zinc-900/95 border border-cyan-500/40 rounded-xl space-y-4 animate-fade-in mb-4 shadow-2xl">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                <Plus className="h-4 w-4" /> {activeTab === 'jobs' ? 'CREATE CUSTOM JOB CLASS WITH DERIVED UNLOCK CONDITIONS' : 'CREATE CUSTOM HONORIFIC TITLE WITH DERIVED UNLOCK CONDITIONS'}
              </h3>

              <form onSubmit={activeTab === 'jobs' ? handleCreateJob : handleCreateTitle} className="space-y-4 text-xs font-mono">
                {/* NAME & CATEGORY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase font-bold">{activeTab === 'jobs' ? 'Job Class Name *' : 'Title Name *'}</label>
                    <input 
                      type="text"
                      required
                      placeholder={activeTab === 'jobs' ? 'e.g. Master Strategic Architect' : 'e.g. Master Code Architect'}
                      value={activeTab === 'jobs' ? jobName : titleName}
                      onChange={e => activeTab === 'jobs' ? setJobName(e.target.value) : setTitleName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase font-bold">TOPIC / CATEGORY</label>
                    <select
                      value={activeTab === 'jobs' ? jobCategory : titleCategory}
                      onChange={e => activeTab === 'jobs' ? setJobCategory(e.target.value) : setTitleCategory(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Knowledge">📖 Knowledge</option>
                      <option value="Iron Will">🛡️ Iron Will</option>
                      <option value="Passion">🔥 Passion</option>
                      <option value="Strategy">🎯 Strategy</option>
                      <option value="Logic">💻 Logic</option>
                      <option value="Mystery">👁️ Mystery</option>
                      <option value="Strength">⚔️ Strength</option>
                      <option value="Architecture">🏛️ Architecture</option>
                    </select>
                  </div>
                </div>

                {/* BADGE TEXT FOR TITLES */}
                {activeTab === 'titles' && (
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase font-bold">BADGE TEXT (UPPERCASE DISPLAY TAG)</label>
                    <input 
                      type="text"
                      placeholder="e.g. ARCHITECT"
                      value={titleBadge}
                      onChange={e => setTitleBadge(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-bold tracking-wider"
                    />
                  </div>
                )}

                {/* ICON SELECTOR GROUPED BY TOPIC */}
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase font-bold">TOPIC ICON</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/60 p-2.5 rounded-lg border border-white/10 max-h-36 overflow-y-auto">
                    {TOPIC_ICON_OPTIONS.map(group => (
                      <div key={group.category} className="col-span-2 sm:col-span-4 space-y-1 mt-1 first:mt-0">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{group.category}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.icons.map(icon => {
                            const isSelected = (activeTab === 'jobs' ? jobIconName : titleIconName) === icon.name;
                            return (
                              <button
                                key={icon.name}
                                type="button"
                                onClick={() => activeTab === 'jobs' ? setJobIconName(icon.name) : setTitleIconName(icon.name)}
                                className={`p-1.5 rounded flex items-center gap-1.5 text-[10px] border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold' 
                                    : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800'
                                }`}
                              >
                                {renderTopicIcon(icon.name, 'h-3.5 w-3.5')}
                                <span>{icon.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DESCRIPTION & PERK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase font-bold">DESCRIPTION</label>
                    <input 
                      type="text"
                      placeholder="e.g. Advanced class unlocked through main quest execution."
                      value={activeTab === 'jobs' ? jobDescription : titleDescription}
                      onChange={e => activeTab === 'jobs' ? setJobDescription(e.target.value) : setTitleDescription(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase font-bold">{activeTab === 'jobs' ? 'SPECIAL CLASS PERK' : 'UNLOCK CONDITION SUMMARY'}</label>
                    <input 
                      type="text"
                      placeholder={activeTab === 'jobs' ? 'e.g. +15% XP bonus on system directives' : 'e.g. Complete System Architecture Quest'}
                      value={activeTab === 'jobs' ? jobPerk : titleUnlockCondition}
                      onChange={e => activeTab === 'jobs' ? setJobPerk(e.target.value) : setTitleUnlockCondition(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* ADVANCED DERIVED UNLOCK CONDITIONS SECTION */}
                {activeTab === 'jobs' 
                  ? renderUnlockConfigurator(jobReqLevel, setJobReqLevel, jobQuestReqs, setJobQuestReqs, jobSkillReqs, setJobSkillReqs, jobRelatedGoalIds, setJobRelatedGoalIds, jobRelatedProjectIds, setJobRelatedProjectIds)
                  : renderUnlockConfigurator(titleReqLevel, setTitleReqLevel, titleQuestReqs, setTitleQuestReqs, titleSkillReqs, setTitleSkillReqs, titleRelatedGoalIds, setTitleRelatedGoalIds, titleRelatedProjectIds, setTitleRelatedProjectIds)
                }

                {/* FORM BUTTONS */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    {activeTab === 'jobs' ? 'SAVE JOB CLASS SPECS' : 'SAVE HONORIFIC TITLE SPECS'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: JOBS / CLASSES */}
          {activeTab === 'jobs' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Select, edit, or configure Job Classes. Unlock requirements are derived from System Level, Quests + Streaks, Skill Levels, Goals, and Projects.
              </p>

              {allJobs.map((job: JobSpec) => {
                const isCurrent = job.id === activeJob.id;
                const evalResult = evaluateUnlockConditions(job, state);
                const isUnlocked = isJobUnlocked(job, state);
                const isEditing = editingJobId === job.id;

                if (isEditing) {
                  return (
                    <div key={job.id} className="p-4 bg-zinc-900 border border-purple-500/50 rounded-lg space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                          <Pencil className="h-3.5 w-3.5" /> EDIT JOB CLASS ({job.name})
                        </span>
                        <button 
                          onClick={() => setEditingJobId(null)} 
                          className="text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveJobEdit} className="space-y-3 text-xs font-mono">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">JOB CLASS NAME *</label>
                            <input 
                              type="text"
                              required
                              value={editJobName}
                              onChange={e => setEditJobName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">TOPIC / CATEGORY</label>
                            <select
                              value={editJobCategory}
                              onChange={e => setEditJobCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                              <option value="Knowledge">📖 Knowledge</option>
                              <option value="Iron Will">🛡️ Iron Will</option>
                              <option value="Passion">🔥 Passion</option>
                              <option value="Strategy">🎯 Strategy</option>
                              <option value="Logic">💻 Logic</option>
                              <option value="Mystery">👁️ Mystery</option>
                              <option value="Strength">⚔️ Strength</option>
                              <option value="Architecture">🏛️ Architecture</option>
                            </select>
                          </div>
                        </div>

                        {/* ICON SELECTOR */}
                        <div>
                          <label className="text-zinc-400 block mb-1">TOPIC ICON</label>
                          <div className="flex flex-wrap gap-1.5 bg-black/60 p-2 rounded border border-white/10 max-h-32 overflow-y-auto">
                            {TOPIC_ICON_OPTIONS.flatMap(g => g.icons).map(icon => (
                              <button
                                key={icon.name}
                                type="button"
                                onClick={() => setEditJobIconName(icon.name)}
                                className={`p-1.5 rounded flex items-center gap-1 text-[10px] border cursor-pointer ${
                                  editJobIconName === icon.name ? 'bg-purple-500/30 border-purple-400 text-white font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                                }`}
                              >
                                {renderTopicIcon(icon.name, 'h-3.5 w-3.5')}
                                <span>{icon.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">CLASS DESCRIPTION</label>
                            <input 
                              type="text"
                              value={editJobDescription}
                              onChange={e => setEditJobDescription(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div>
                            <label className="text-zinc-400 block mb-1">SPECIAL PERK</label>
                            <input 
                              type="text"
                              value={editJobPerk}
                              onChange={e => setEditJobPerk(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        {/* DERIVED UNLOCK CONDITIONS FOR EDIT */}
                        {renderUnlockConfigurator(
                          editJobReqLevel, setEditJobReqLevel,
                          editJobQuestReqs, setEditJobQuestReqs,
                          editJobSkillReqs, setEditJobSkillReqs,
                          editJobRelatedGoalIds, setEditJobRelatedGoalIds,
                          editJobRelatedProjectIds, setEditJobRelatedProjectIds,
                          "purple"
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingJobId(null)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded hover:bg-purple-400 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" /> SAVE CHANGES
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                const jobLevel = getJobLvl ? getJobLvl(job.id) : 1;
                const nextLevel = jobLevel < 7 ? jobLevel + 1 : 7;
                const nextLevelEval = evaluateLevelConditions(job, nextLevel, state);
                const canLevelUp = jobLevel < 7 && nextLevelEval.isMet;
                const scaledPerk = getJobScaledPerk(job, jobLevel);

                return (
                  <div 
                    key={job.id}
                    className={`p-4 rounded-lg border transition-all duration-200 flex flex-col gap-3 ${
                      isCurrent 
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                        : isUnlocked 
                          ? 'border-white/10 bg-zinc-900/40 hover:border-white/20' 
                          : 'border-white/5 bg-zinc-900/10 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-lg border shrink-0 ${isCurrent ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-zinc-900 border-white/5'}`}>
                          {renderTopicIcon(job.iconName)}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-display font-extrabold text-sm text-white uppercase">{job.name}</h4>
                            <span className="text-[9px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                              LVL {jobLevel}/7 ({LEVEL_RANK_NAMES[jobLevel]})
                            </span>
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                              {job.category}
                            </span>
                            {job.customLevelConditions && Object.keys(job.customLevelConditions).length > 0 && (
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                CUSTOM LEVEL RULES
                              </span>
                            )}
                            {job.isCustom && (
                              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                                CUSTOM
                              </span>
                            )}
                          </div>

                          {/* 7-LEVEL PROGRESSION PIPELINE INDICATOR */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                              <span>PROGRESSION LEVEL PIPELINE:</span>
                              <span className="text-amber-400 font-bold">{jobLevel === 7 ? '👑 MAX APEX LEVEL 7' : `Next: Lvl ${nextLevel} (${LEVEL_RANK_NAMES[nextLevel]})`}</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                                <div 
                                  key={lvl} 
                                  className={`h-2 rounded transition-all ${
                                    lvl <= jobLevel 
                                      ? 'bg-gradient-to-r from-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                                      : 'bg-zinc-800/80 border border-white/5'
                                  }`}
                                  title={`Level ${lvl}: ${LEVEL_RANK_NAMES[lvl]}`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-zinc-400 font-sans">{job.description}</p>
                          <div className="text-[10px] font-mono text-cyan-400 font-bold bg-white/[0.02] border border-cyan-500/20 rounded px-2 py-1 inline-block">
                            ⚡ PERK: {scaledPerk}
                          </div>

                          {/* LEVEL CONDITIONS BREAKDOWN */}
                          <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] font-mono">
                            <span className="text-zinc-500 uppercase block font-bold">
                              {jobLevel === 7 ? 'MAX LEVEL CONDITIONS SATISFIED:' : `LEVEL ${nextLevel} CONDITIONS STATUS:`}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(jobLevel === 7 ? evalResult.metConditions : nextLevelEval.metConditions).map((cond, idx) => (
                                <span key={idx} className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                  {cond}
                                </span>
                              ))}
                              {jobLevel < 7 && nextLevelEval.unmetConditions.map((cond, idx) => (
                                <span key={idx} className="bg-rose-950/60 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                  <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                                  {cond}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex flex-wrap md:flex-col items-center md:items-end gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditJob(job)}
                            className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded transition-all cursor-pointer"
                            title="Edit Job Class Unlock Specs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => openLevelUpForJob(job)}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Level Up & Condition Configurator"
                          >
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            LEVEL UP / SPECS
                          </button>

                          {job.isCustom && (
                            <button
                              onClick={() => {
                                deleteJobSpec(job.id);
                                showToast(`Deleted custom job "${job.name}"`);
                              }}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-all cursor-pointer"
                              title="Delete Custom Job"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {isCurrent ? (
                          <span className="w-full md:w-auto text-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold rounded flex items-center justify-center gap-1">
                            <Check className="h-3 w-3" /> ACTIVE
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => {
                              updateJob(job.id);
                              showToast(`Switched active job class to "${job.name}"!`);
                            }}
                            className="w-full md:w-auto px-3 py-1 bg-white/10 hover:bg-cyan-500 hover:text-black text-white font-mono text-[10px] font-bold rounded transition-all cursor-pointer"
                          >
                            EQUIP JOB
                          </button>
                        ) : (
                          <div className="w-full md:w-auto text-center px-2 py-1 bg-zinc-900 border border-white/5 text-zinc-500 font-mono text-[10px] rounded flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" /> LOCKED
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TITLES */}
          {activeTab === 'titles' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Equip, edit, or configure Honorific Titles. Unlock requirements are derived from System Level, Quests + Streaks, Skill Levels, Goals, and Projects.
              </p>

              {allTitles.map((title: TitleSpec) => {
                const isCurrent = title.id === activeTitle.id;
                const evalResult = evaluateUnlockConditions(title, state);
                const isUnlocked = isTitleUnlocked(title, state);
                const isEditing = editingTitleId === title.id;

                if (isEditing) {
                  return (
                    <div key={title.id} className="p-4 bg-zinc-900 border border-purple-500/50 rounded-lg space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                          <Pencil className="h-3.5 w-3.5" /> EDIT TITLE ({title.name})
                        </span>
                        <button 
                          onClick={() => setEditingTitleId(null)} 
                          className="text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveTitleEdit} className="space-y-3 text-xs font-mono">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">TITLE NAME *</label>
                            <input 
                              type="text"
                              required
                              value={editTitleName}
                              onChange={e => setEditTitleName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">BADGE TEXT</label>
                            <input 
                              type="text"
                              value={editTitleBadge}
                              onChange={e => setEditTitleBadge(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-bold uppercase"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">TOPIC / CATEGORY</label>
                            <select
                              value={editTitleCategory}
                              onChange={e => setEditTitleCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                              <option value="Knowledge">📖 Knowledge</option>
                              <option value="Iron Will">🛡️ Iron Will</option>
                              <option value="Passion">🔥 Passion</option>
                              <option value="Strategy">🎯 Strategy</option>
                              <option value="Logic">💻 Logic</option>
                              <option value="Mystery">👁️ Mystery</option>
                              <option value="Strength">⚔️ Strength</option>
                              <option value="Architecture">🏛️ Architecture</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-zinc-400 block mb-1">UNLOCK SUMMARY</label>
                            <input 
                              type="text"
                              value={editTitleUnlockCondition}
                              onChange={e => setEditTitleUnlockCondition(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        {/* ICON SELECTOR */}
                        <div>
                          <label className="text-zinc-400 block mb-1">TOPIC ICON</label>
                          <div className="flex flex-wrap gap-1.5 bg-black/60 p-2 rounded border border-white/10 max-h-32 overflow-y-auto">
                            {TOPIC_ICON_OPTIONS.flatMap(g => g.icons).map(icon => (
                              <button
                                key={icon.name}
                                type="button"
                                onClick={() => setEditTitleIconName(icon.name)}
                                className={`p-1.5 rounded flex items-center gap-1 text-[10px] border cursor-pointer ${
                                  editTitleIconName === icon.name ? 'bg-purple-500/30 border-purple-400 text-white font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                                }`}
                              >
                                {renderTopicIcon(icon.name, 'h-3.5 w-3.5')}
                                <span>{icon.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-zinc-400 block mb-1">DESCRIPTION</label>
                          <input 
                            type="text"
                            value={editTitleDescription}
                            onChange={e => setEditTitleDescription(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {/* DERIVED UNLOCK CONDITIONS FOR EDIT TITLE */}
                        {renderUnlockConfigurator(
                          editTitleReqLevel, setEditTitleReqLevel,
                          editTitleQuestReqs, setEditTitleQuestReqs,
                          editTitleSkillReqs, setEditTitleSkillReqs,
                          editTitleRelatedGoalIds, setEditTitleRelatedGoalIds,
                          editTitleRelatedProjectIds, setEditTitleRelatedProjectIds,
                          "purple"
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingTitleId(null)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded hover:bg-purple-400 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" /> SAVE CHANGES
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                const titleLevel = getTitleLvl ? getTitleLvl(title.id) : 1;
                const nextTitleLevel = titleLevel < 7 ? titleLevel + 1 : 7;
                const nextTitleLevelEval = evaluateLevelConditions(title, nextTitleLevel, state);

                return (
                  <div 
                    key={title.id}
                    className={`p-4 rounded-lg border transition-all duration-200 flex flex-col gap-3 ${
                      isCurrent 
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                        : isUnlocked 
                          ? 'border-white/10 bg-zinc-900/40 hover:border-white/20' 
                          : 'border-white/5 bg-zinc-900/10 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-lg border shrink-0 ${isCurrent ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-zinc-900 border-white/5'}`}>
                          {renderTopicIcon(title.iconName || 'GraduationCap')}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-cyan-400 font-black bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px]">
                              [{title.badge}]
                            </span>
                            <h4 className="font-display font-extrabold text-sm text-white uppercase">{title.name}</h4>
                            <span className="text-[9px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                              LVL {titleLevel}/7 ({LEVEL_RANK_NAMES[titleLevel]})
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                              {title.category}
                            </span>
                            {title.customLevelConditions && Object.keys(title.customLevelConditions).length > 0 && (
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                CUSTOM LEVEL RULES
                              </span>
                            )}
                            {title.isCustom && (
                              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                                CUSTOM
                              </span>
                            )}
                          </div>

                          {/* 7-LEVEL PROGRESSION PIPELINE INDICATOR */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                              <span>PRESTIGE PROGRESSION PIPELINE:</span>
                              <span className="text-amber-400 font-bold">{titleLevel === 7 ? '👑 MAX APEX PRESTIGE 7' : `Next: Lvl ${nextTitleLevel} (${LEVEL_RANK_NAMES[nextTitleLevel]})`}</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                                <div 
                                  key={lvl} 
                                  className={`h-2 rounded transition-all ${
                                    lvl <= titleLevel 
                                      ? 'bg-gradient-to-r from-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                                      : 'bg-zinc-800/80 border border-white/5'
                                  }`}
                                  title={`Level ${lvl}: ${LEVEL_RANK_NAMES[lvl]}`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-zinc-400 font-sans">{title.description}</p>
                          <div className="text-[10px] font-mono text-zinc-500">
                            🔒 REQUIREMENT: <span className="text-zinc-300">{title.unlockCondition}</span>
                          </div>

                          {/* LEVEL CONDITIONS BREAKDOWN */}
                          <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] font-mono">
                            <span className="text-zinc-500 uppercase block font-bold">
                              {titleLevel === 7 ? 'MAX PRESTIGE CONDITIONS SATISFIED:' : `LEVEL ${nextTitleLevel} CONDITIONS STATUS:`}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(titleLevel === 7 ? evalResult.metConditions : nextTitleLevelEval.metConditions).map((cond, idx) => (
                                <span key={idx} className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                  {cond}
                                </span>
                              ))}
                              {titleLevel < 7 && nextTitleLevelEval.unmetConditions.map((cond, idx) => (
                                <span key={idx} className="bg-rose-950/60 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                  <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                                  {cond}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex flex-wrap md:flex-col items-center md:items-end gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditTitle(title)}
                            className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded transition-all cursor-pointer"
                            title="Edit Title Unlock Specs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => openLevelUpForTitle(title)}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Level Up & Condition Configurator"
                          >
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            LEVEL UP / SPECS
                          </button>

                          {title.isCustom && (
                            <button
                              onClick={() => {
                                deleteTitleSpec(title.id);
                                showToast(`Deleted custom title "${title.name}"`);
                              }}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-all cursor-pointer"
                              title="Delete Custom Title"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {isCurrent ? (
                          <span className="w-full md:w-auto text-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold rounded flex items-center justify-center gap-1">
                            <Check className="h-3 w-3" /> EQUIPPED
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => {
                              updateTitle(title.id);
                              showToast(`Equipped title "${title.name}"!`);
                            }}
                            className="w-full md:w-auto px-3 py-1 bg-white/10 hover:bg-cyan-500 hover:text-black text-white font-mono text-[10px] font-bold rounded transition-all cursor-pointer"
                          >
                            EQUIP TITLE
                          </button>
                        ) : (
                          <div className="w-full md:w-auto text-center px-2 py-1 bg-zinc-900 border border-white/5 text-zinc-500 font-mono text-[10px] rounded flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" /> LOCKED
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/40 flex justify-between items-center text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Operator Level: <strong className="text-white">Lvl {playerInfo.level}</strong></span>
            <span>•</span>
            <span>Total XP: <strong className="text-cyan-400">{playerInfo.totalXp} XP</strong></span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-bold transition cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* LEVEL UP & PROGRESSION CONDITION CONFIGURATOR MODAL (LEVELS 2 TO 7)       */}
      {/* ========================================================================= */}
      {(levelUpModalJob || levelUpModalTitle) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs text-zinc-300">
            
            {/* MODAL HEADER */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-lg">
                  {renderTopicIcon(luIconName, "h-5 w-5")}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase block">
                    {levelUpModalJob ? 'JOB CLASS PROGRESSION CONFIGURATOR' : 'HONORIFIC TITLE PRESTIGE CONFIGURATOR'}
                  </span>
                  <h3 className="text-base font-extrabold text-white uppercase flex items-center gap-2">
                    {luName}
                    <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-black">
                      CONFIGURING LVL {luTargetLevel} ({LEVEL_RANK_NAMES[luTargetLevel]})
                    </span>
                  </h3>
                </div>
              </div>

              <button 
                onClick={closeLevelUpModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* LEVEL SELECTION TABS (LEVELS 2 TO 7) */}
            <div className="px-4 py-2 bg-black/60 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] text-zinc-500 uppercase font-bold mr-1 shrink-0">SELECT TARGET LEVEL:</span>
              {[2, 3, 4, 5, 6, 7].map(lvl => {
                const spec = levelUpModalJob || levelUpModalTitle!;
                const hasCustom = !!(spec.customLevelConditions && spec.customLevelConditions[lvl]);
                const isSelected = luTargetLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleTargetLevelChange(lvl)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>Lvl {lvl}</span>
                    <span className="text-[9px] opacity-80">({LEVEL_RANK_NAMES[lvl]})</span>
                    {hasCustom && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" title="Has Custom Conditions" />}
                  </button>
                );
              })}
            </div>

            {/* MODAL BODY */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

              {/* LEVEL STATUS BANNER */}
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-bold uppercase">Condition Mode for Level {luTargetLevel}:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    luLevelCondition.isCustomized 
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40' 
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {luLevelCondition.isCustomized ? '✨ Custom Player Rules Configured' : '⚙️ Standard Progression Formula'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllConditionsForLevel}
                    className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 rounded font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                    title="Delete / clear all conditions for this level so it has 0 requirements"
                  >
                    <Trash2 className="h-3 w-3 text-rose-400" />
                    CLEAR / DELETE ALL CONDITIONS
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLevelToDefaults}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 rounded font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                    title="Restore default progression requirements"
                  >
                    <RotateCcw className="h-3 w-3 text-zinc-400" />
                    RESTORE DEFAULTS
                  </button>
                </div>
              </div>

              {/* SECTION: EDITABLE LEVEL CONDITIONS */}
              <div className="p-3.5 bg-zinc-900/40 border border-white/10 rounded-xl space-y-3">
                <span className="text-amber-400 font-bold uppercase tracking-wider block flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  LEVEL {luTargetLevel} REQUIREMENT PARAMETERS (MODIFY OR DELETE ANY CONDITION)
                </span>

                {/* NUMERIC THRESHOLDS (LEVEL, QUESTS, STREAK, FOCUS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* System Level */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">REQ SYSTEM LVL</label>
                      <button 
                        type="button" 
                        onClick={() => setLuLevelCondition(p => ({ ...p, unlockedAtLevel: 0, isCustomized: true }))}
                        className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={luLevelCondition.unlockedAtLevel ?? 0}
                      onChange={e => setLuLevelCondition(p => ({ ...p, unlockedAtLevel: Number(e.target.value), isCustomized: true }))}
                      className="w-full bg-black border border-white/20 rounded px-2 py-1 text-white font-bold text-sm"
                    />
                    <span className="text-[9px] text-zinc-500 block">0 = No level required</span>
                  </div>

                  {/* Completed Quests Count */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">COMPLETED QUESTS</label>
                      <button 
                        type="button" 
                        onClick={() => setLuLevelCondition(p => ({ ...p, requiredQuestsCount: 0, isCustomized: true }))}
                        className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      max="500"
                      value={luLevelCondition.requiredQuestsCount ?? 0}
                      onChange={e => setLuLevelCondition(p => ({ ...p, requiredQuestsCount: Number(e.target.value), isCustomized: true }))}
                      className="w-full bg-black border border-white/20 rounded px-2 py-1 text-white font-bold text-sm"
                    />
                    <span className="text-[9px] text-zinc-500 block">0 = No quest count req</span>
                  </div>

                  {/* Quest Streak Days */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">ACTIVE STREAK (DAYS)</label>
                      <button 
                        type="button" 
                        onClick={() => setLuLevelCondition(p => ({ ...p, requiredQuestStreak: 0, isCustomized: true }))}
                        className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      max="365"
                      value={luLevelCondition.requiredQuestStreak ?? 0}
                      onChange={e => setLuLevelCondition(p => ({ ...p, requiredQuestStreak: Number(e.target.value), isCustomized: true }))}
                      className="w-full bg-black border border-white/20 rounded px-2 py-1 text-white font-bold text-sm"
                    />
                    <span className="text-[9px] text-zinc-500 block">0 = No streak req</span>
                  </div>

                  {/* Focus Minutes */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">FOCUS MINUTES</label>
                      <button 
                        type="button" 
                        onClick={() => setLuLevelCondition(p => ({ ...p, requiredFocusMinutes: 0, isCustomized: true }))}
                        className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      max="1440"
                      value={luLevelCondition.requiredFocusMinutes ?? 0}
                      onChange={e => setLuLevelCondition(p => ({ ...p, requiredFocusMinutes: Number(e.target.value), isCustomized: true }))}
                      className="w-full bg-black border border-white/20 rounded px-2 py-1 text-white font-bold text-sm"
                    />
                    <span className="text-[9px] text-zinc-500 block">0 = No focus minutes req</span>
                  </div>
                </div>

                {/* SPECIFIC QUEST REQUIREMENTS */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 font-bold uppercase">SPECIFIC QUEST CONDITIONS FOR LEVEL {luTargetLevel}</label>
                    <select
                      onChange={e => {
                        addLuQuestReq(e.target.value);
                        e.target.value = '';
                      }}
                      className="bg-black border border-white/20 rounded px-2 py-1 text-white text-[10px] cursor-pointer"
                    >
                      <option value="">+ Add Quest Condition...</option>
                      {state.quests.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.name} [{q.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {(luLevelCondition.questRequirements || []).length > 0 ? (
                    <div className="space-y-1.5">
                      {luLevelCondition.questRequirements!.map(qReq => {
                        const quest = state.quests.find(x => x.id === qReq.questId);
                        return (
                          <div key={qReq.questId} className="flex flex-wrap items-center justify-between gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                            <span className="font-bold text-white flex-1 min-w-[140px] truncate">
                              🎯 {quest ? quest.name : 'Linked Quest'}
                            </span>
                            
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-[10px] text-zinc-400">
                                <span>Streak:</span>
                                <input 
                                  type="number"
                                  min="0"
                                  max="365"
                                  value={qReq.minStreak || 0}
                                  onChange={e => setLuQuestStreak(qReq.questId, Number(e.target.value) || 0)}
                                  className="w-12 bg-black border border-white/20 rounded px-1 text-center text-white"
                                />
                                <span>days</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => removeLuQuestReq(qReq.questId)}
                                className="text-zinc-500 hover:text-rose-400 p-1 transition cursor-pointer"
                                title="Delete this Quest Requirement"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-500 bg-black/30 p-2 rounded">
                      No specific quest requirement for this level.
                    </div>
                  )}
                </div>

                {/* SPECIFIC SKILL REQUIREMENTS */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-zinc-400 font-bold uppercase block">SPECIFIC SKILL LEVEL REQUIREMENTS FOR LEVEL {luTargetLevel}</label>
                  <div className="flex flex-wrap gap-2 bg-black/50 p-2.5 rounded-lg border border-white/10">
                    {state.skills.map(s => {
                      const existing = (luLevelCondition.skillRequirements || []).find(sr => sr.skillId === s.id);
                      const isSelected = !!existing;

                      return (
                        <div key={s.id} className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] ${
                          isSelected ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border-white/5 text-zinc-400'
                        }`}>
                          <button
                            type="button"
                            onClick={() => toggleLuSkill(s.id)}
                            className="font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {isSelected ? <CheckCircle2 className="h-3 w-3 text-cyan-400" /> : <Plus className="h-3 w-3 text-zinc-500" />}
                            {s.name}
                          </button>
                          {isSelected && (
                            <div className="flex items-center gap-1 border-l border-white/10 pl-1">
                              <span>Lvl &gt;=</span>
                              <input 
                                type="number"
                                min="1"
                                max="50"
                                value={existing.minLevel}
                                onChange={e => setLuSkillLevel(s.id, Number(e.target.value) || 1)}
                                className="w-10 bg-black border border-white/20 rounded px-1 text-center text-white"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SPECIFIC GOAL & PROJECT REQUIREMENTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  {/* Goals */}
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 font-bold uppercase block">GOAL REQUIREMENT FOR LVL {luTargetLevel}</label>
                    <div className="flex flex-wrap gap-1 bg-black/40 p-2 rounded border border-white/10 max-h-28 overflow-y-auto">
                      {state.goals.map(g => {
                        const isSelected = (luLevelCondition.relatedGoalIds || []).includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggleLuGoal(g.id)}
                            className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 cursor-pointer ${
                              isSelected ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                            }`}
                          >
                            <Target className="h-3 w-3" />
                            {g.name}
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 font-bold uppercase block">PROJECT REQUIREMENT FOR LVL {luTargetLevel}</label>
                    <div className="flex flex-wrap gap-1 bg-black/40 p-2 rounded border border-white/10 max-h-28 overflow-y-auto">
                      {state.projects.map(p => {
                        const isSelected = (luLevelCondition.relatedProjectIds || []).includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleLuProject(p.id)}
                            className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 cursor-pointer ${
                              isSelected ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                            }`}
                          >
                            <FolderGit2 className="h-3 w-3" />
                            {p.name}
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL-TIME SYSTEM DIAGNOSTIC EVALUATION BOX */}
              {(() => {
                const previewSpec: JobSpec = {
                  id: levelUpModalJob ? levelUpModalJob.id : levelUpModalTitle!.id,
                  name: luName,
                  category: luCategory,
                  iconName: luIconName,
                  description: luDescription,
                  perk: luPerkOrCondition,
                  unlockedAtLevel: luLevelCondition.unlockedAtLevel,
                  customLevelConditions: {
                    ...((levelUpModalJob || levelUpModalTitle)?.customLevelConditions || {}),
                    [luTargetLevel]: luLevelCondition
                  }
                };
                const diagEval = evaluateLevelConditions(previewSpec, luTargetLevel, state);

                return (
                  <div className="p-3.5 bg-zinc-900/80 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-amber-400" />
                        REAL-TIME SYSTEM DIAGNOSTIC EVALUATION FOR LEVEL {luTargetLevel}:
                      </span>
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                        diagEval.isMet 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                          : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      }`}>
                        {diagEval.isMet ? '✓ ALL CONDITIONS SATISFIED (READY TO LEVEL UP)' : `⚠️ ${diagEval.unmetConditions.length} CONDITIONS PENDING`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {diagEval.metConditions.map((cond, idx) => (
                        <span key={idx} className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          {cond}
                        </span>
                      ))}
                      {diagEval.unmetConditions.map((cond, idx) => (
                        <span key={idx} className="bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[10px]">
                          <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="p-3 sm:p-4 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeLevelUpModal}
                className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold rounded transition cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleSaveLuLevelConditions}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5 text-cyan-400" /> SAVE LEVEL {luTargetLevel} CONDITIONS ONLY
              </button>

              <button
                type="button"
                onClick={handleConfirmAndLevelUp}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold rounded shadow-[0_0_15px_rgba(245,158,11,0.4)] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> CONFIRM & ELEVATE TO LVL {luTargetLevel}!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
