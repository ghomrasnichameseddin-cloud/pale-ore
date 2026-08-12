import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  getAllJobs, getAllTitles, getActiveJob, getActiveTitle, evaluateUnlockConditions,
  JobSpec, TitleSpec, SkillRequirement, isJobUnlocked, isTitleUnlocked
} from '../jobsAndTitles';
import { 
  Terminal, Code, Brain, Cpu, Zap, Crosshair, Sparkles, Award, Check, Lock, Shield, X, Star, Plus, Trash2, Pencil, Save,
  BookOpen, GraduationCap, Library, ScrollText, ShieldCheck, Hammer, Anchor, ShieldAlert, Flame, Sun, Heart,
  Target, Compass, Map, Layers, GitBranch, Workflow, Eye, Key, Moon, Wand2, Dumbbell, Swords, Trophy, Activity,
  Building, LayoutGrid, Boxes, Landmark, DraftingCompass, CheckCircle2, XCircle, HelpCircle
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
    addCustomJob, updateJobSpec, deleteJobSpec, 
    addCustomTitle, updateTitleSpec, deleteTitleSpec 
  } = usePOS();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'titles'>('jobs');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Custom Job Form State
  const [jobName, setJobName] = useState('');
  const [jobCategory, setJobCategory] = useState('Architecture');
  const [jobIconName, setJobIconName] = useState('Building');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPerk, setJobPerk] = useState('');
  const [jobReqLevel, setJobReqLevel] = useState(1);
  const [jobRelatedQuestId, setJobRelatedQuestId] = useState<string>('');
  const [jobRequiredStreak, setJobRequiredStreak] = useState<number>(0);
  const [jobSkillReqs, setJobSkillReqs] = useState<SkillRequirement[]>([]);
  const [jobRelatedGoalId, setJobRelatedGoalId] = useState<string>('');

  // New Custom Title Form State
  const [titleName, setTitleName] = useState('');
  const [titleBadge, setTitleBadge] = useState('');
  const [titleCategory, setTitleCategory] = useState('Knowledge');
  const [titleIconName, setTitleIconName] = useState('BookOpen');
  const [titleDescription, setTitleDescription] = useState('');
  const [titleUnlockCondition, setTitleUnlockCondition] = useState('Derived Quest Directive');
  const [titleReqLevel, setTitleReqLevel] = useState(1);
  const [titleRelatedQuestId, setTitleRelatedQuestId] = useState<string>('');
  const [titleRequiredStreak, setTitleRequiredStreak] = useState<number>(0);
  const [titleSkillReqs, setTitleSkillReqs] = useState<SkillRequirement[]>([]);
  const [titleRelatedGoalId, setTitleRelatedGoalId] = useState<string>('');

  // Edit Job State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editJobName, setEditJobName] = useState('');
  const [editJobCategory, setEditJobCategory] = useState('');
  const [editJobIconName, setEditJobIconName] = useState('Code');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobPerk, setEditJobPerk] = useState('');
  const [editJobReqLevel, setEditJobReqLevel] = useState(1);
  const [editJobRelatedQuestId, setEditJobRelatedQuestId] = useState<string>('');
  const [editJobRequiredStreak, setEditJobRequiredStreak] = useState<number>(0);
  const [editJobSkillReqs, setEditJobSkillReqs] = useState<SkillRequirement[]>([]);
  const [editJobRelatedGoalId, setEditJobRelatedGoalId] = useState<string>('');

  // Edit Title State
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleName, setEditTitleName] = useState('');
  const [editTitleBadge, setEditTitleBadge] = useState('');
  const [editTitleCategory, setEditTitleCategory] = useState('');
  const [editTitleIconName, setEditTitleIconName] = useState('GraduationCap');
  const [editTitleDescription, setEditTitleDescription] = useState('');
  const [editTitleUnlockCondition, setEditTitleUnlockCondition] = useState('');
  const [editTitleReqLevel, setEditTitleReqLevel] = useState(1);
  const [editTitleRelatedQuestId, setEditTitleRelatedQuestId] = useState<string>('');
  const [editTitleRequiredStreak, setEditTitleRequiredStreak] = useState<number>(0);
  const [editTitleSkillReqs, setEditTitleSkillReqs] = useState<SkillRequirement[]>([]);
  const [editTitleRelatedGoalId, setEditTitleRelatedGoalId] = useState<string>('');

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
      case 'Sun': return <Sun className={`${className} text-amber-300`} />;
      case 'Zap': return <Zap className={`${className} text-amber-400`} />;
      case 'Heart': return <Heart className={`${className} text-rose-400`} />;

      // Strategy
      case 'Target': return <Target className={`${className} text-rose-400`} />;
      case 'Crosshair': return <Crosshair className={`${className} text-rose-300`} />;
      case 'Compass': return <Compass className={`${className} text-indigo-400`} />;
      case 'Map': return <Map className={`${className} text-sky-400`} />;
      case 'Layers': return <Layers className={`${className} text-violet-400`} />;

      // Logic
      case 'Code': return <Code className={`${className} text-purple-400`} />;
      case 'Cpu': return <Cpu className={`${className} text-emerald-400`} />;
      case 'GitBranch': return <GitBranch className={`${className} text-cyan-400`} />;
      case 'Workflow': return <Workflow className={`${className} text-purple-300`} />;
      case 'Terminal': return <Terminal className={`${className} text-cyan-400`} />;

      // Mystery
      case 'Eye': return <Eye className={`${className} text-fuchsia-400`} />;
      case 'Key': return <Key className={`${className} text-amber-300`} />;
      case 'Moon': return <Moon className={`${className} text-purple-300`} />;
      case 'Wand2': return <Wand2 className={`${className} text-fuchsia-300`} />;

      // Strength
      case 'Dumbbell': return <Dumbbell className={`${className} text-rose-500`} />;
      case 'Swords': return <Swords className={`${className} text-amber-500`} />;
      case 'Shield': return <Shield className={`${className} text-red-400`} />;
      case 'Trophy': return <Trophy className={`${className} text-yellow-300`} />;
      case 'Activity': return <Activity className={`${className} text-emerald-400`} />;

      // Architecture
      case 'Building': return <Building className={`${className} text-sky-400`} />;
      case 'LayoutGrid': return <LayoutGrid className={`${className} text-cyan-300`} />;
      case 'Boxes': return <Boxes className={`${className} text-indigo-300`} />;
      case 'Landmark': return <Landmark className={`${className} text-amber-200`} />;
      case 'DraftingCompass': return <DraftingCompass className={`${className} text-teal-300`} />;

      default: return <Award className={`${className} text-cyan-400`} />;
    }
  };

  const handleQuestSelectForJob = (questId: string) => {
    setJobRelatedQuestId(questId);
    if (!questId) return;

    const quest = state.quests.find(q => q.id === questId);
    if (quest) {
      // Pre-fill goal if linked
      if (quest.goalId && !jobRelatedGoalId) {
        setJobRelatedGoalId(quest.goalId);
      }
      // Pre-fill skills from quest
      if (quest.relatedSkills && quest.relatedSkills.length > 0) {
        const derivedSkills: SkillRequirement[] = quest.relatedSkills.map(sId => ({
          skillId: sId,
          minLevel: 2
        }));
        setJobSkillReqs(prev => {
          const merged = [...prev];
          derivedSkills.forEach(ds => {
            if (!merged.some(m => m.skillId === ds.skillId)) {
              merged.push(ds);
            }
          });
          return merged;
        });
      }
      // Set default streak requirement if it has streak
      if (quest.streakCount && quest.streakCount > 0 && jobRequiredStreak === 0) {
        setJobRequiredStreak(quest.streakCount);
      }
    }
  };

  const handleQuestSelectForTitle = (questId: string) => {
    setTitleRelatedQuestId(questId);
    if (!questId) return;

    const quest = state.quests.find(q => q.id === questId);
    if (quest) {
      if (quest.goalId && !titleRelatedGoalId) {
        setTitleRelatedGoalId(quest.goalId);
      }
      if (quest.relatedSkills && quest.relatedSkills.length > 0) {
        const derivedSkills: SkillRequirement[] = quest.relatedSkills.map(sId => ({
          skillId: sId,
          minLevel: 2
        }));
        setTitleSkillReqs(prev => {
          const merged = [...prev];
          derivedSkills.forEach(ds => {
            if (!merged.some(m => m.skillId === ds.skillId)) {
              merged.push(ds);
            }
          });
          return merged;
        });
      }
      if (quest.streakCount && quest.streakCount > 0 && titleRequiredStreak === 0) {
        setTitleRequiredStreak(quest.streakCount);
      }
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    addCustomJob({
      name: jobName.trim(),
      category: jobCategory.trim() || 'Architecture',
      iconName: jobIconName,
      description: jobDescription.trim() || 'Custom operational job class unlocked through directives.',
      perk: jobPerk.trim() || '+10% XP bonus on related directives',
      unlockedAtLevel: Number(jobReqLevel) || 1,
      relatedQuestId: jobRelatedQuestId || null,
      requiredQuestStreak: Number(jobRequiredStreak) || 0,
      skillRequirements: jobSkillReqs.length > 0 ? jobSkillReqs : undefined,
      relatedGoalId: jobRelatedGoalId || null
    });

    setJobName('');
    setJobDescription('');
    setJobPerk('');
    setJobReqLevel(1);
    setJobRelatedQuestId('');
    setJobRequiredStreak(0);
    setJobSkillReqs([]);
    setJobRelatedGoalId('');
    setShowAddForm(false);
  };

  const handleCreateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleName.trim()) return;

    addCustomTitle({
      name: titleName.trim(),
      badge: (titleBadge.trim() || titleName.trim().substring(0, 10)).toUpperCase(),
      category: titleCategory.trim() || 'Knowledge',
      iconName: titleIconName,
      description: titleDescription.trim() || 'Custom honorific title unlocked through directives.',
      unlockCondition: titleUnlockCondition.trim() || 'Quest Directive Accomplished',
      unlockedAtLevel: Number(titleReqLevel) || 1,
      relatedQuestId: titleRelatedQuestId || null,
      requiredQuestStreak: Number(titleRequiredStreak) || 0,
      skillRequirements: titleSkillReqs.length > 0 ? titleSkillReqs : undefined,
      relatedGoalId: titleRelatedGoalId || null
    });

    setTitleName('');
    setTitleBadge('');
    setTitleDescription('');
    setTitleReqLevel(1);
    setTitleRelatedQuestId('');
    setTitleRequiredStreak(0);
    setTitleSkillReqs([]);
    setTitleRelatedGoalId('');
    setShowAddForm(false);
  };

  const startEditJob = (job: JobSpec) => {
    setEditingJobId(job.id);
    setEditJobName(job.name);
    setEditJobCategory(job.category);
    setEditJobIconName(job.iconName);
    setEditJobDescription(job.description);
    setEditJobPerk(job.perk);
    setEditJobReqLevel(job.unlockedAtLevel || 1);
    setEditJobRelatedQuestId(job.relatedQuestId || '');
    setEditJobRequiredStreak(job.requiredQuestStreak || 0);
    setEditJobSkillReqs(job.skillRequirements || []);
    setEditJobRelatedGoalId(job.relatedGoalId || '');
  };

  const handleSaveJobEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobId || !editJobName.trim()) return;

    const originalJob = allJobs.find(j => j.id === editingJobId);

    updateJobSpec({
      id: editingJobId,
      name: editJobName.trim(),
      category: editJobCategory.trim() || 'Career Class',
      iconName: editJobIconName,
      description: editJobDescription.trim(),
      perk: editJobPerk.trim(),
      unlockedAtLevel: Number(editJobReqLevel) || 1,
      relatedQuestId: editJobRelatedQuestId || null,
      requiredQuestStreak: Number(editJobRequiredStreak) || 0,
      skillRequirements: editJobSkillReqs.length > 0 ? editJobSkillReqs : undefined,
      relatedGoalId: editJobRelatedGoalId || null,
      isCustom: originalJob?.isCustom
    });

    setEditingJobId(null);
  };

  const startEditTitle = (title: TitleSpec) => {
    setEditingTitleId(title.id);
    setEditTitleName(title.name);
    setEditTitleBadge(title.badge);
    setEditTitleCategory(title.category);
    setEditTitleIconName(title.iconName || 'GraduationCap');
    setEditTitleDescription(title.description);
    setEditTitleUnlockCondition(title.unlockCondition);
    setEditTitleReqLevel(title.unlockedAtLevel || 1);
    setEditTitleRelatedQuestId(title.relatedQuestId || '');
    setEditTitleRequiredStreak(title.requiredQuestStreak || 0);
    setEditTitleSkillReqs(title.skillRequirements || []);
    setEditTitleRelatedGoalId(title.relatedGoalId || '');
  };

  const handleSaveTitleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTitleId || !editTitleName.trim()) return;

    const originalTitle = allTitles.find(t => t.id === editingTitleId);

    updateTitleSpec({
      id: editingTitleId,
      name: editTitleName.trim(),
      badge: (editTitleBadge.trim() || editTitleName.trim().substring(0, 10)).toUpperCase(),
      category: editTitleCategory.trim() || 'Prestige Title',
      iconName: editTitleIconName,
      description: editTitleDescription.trim(),
      unlockCondition: editTitleUnlockCondition.trim(),
      unlockedAtLevel: Number(editTitleReqLevel) || 1,
      relatedQuestId: editTitleRelatedQuestId || null,
      requiredQuestStreak: Number(editTitleRequiredStreak) || 0,
      skillRequirements: editTitleSkillReqs.length > 0 ? editTitleSkillReqs : undefined,
      relatedGoalId: editTitleRelatedGoalId || null,
      checkUnlocked: originalTitle?.checkUnlocked,
      isCustom: originalTitle?.isCustom
    });

    setEditingTitleId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="job-title-modal">
      <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">OPERATOR CAREER & HONORIFIC MATRIX</span>
            <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2 mt-0.5 uppercase">
              <Award className="h-5 w-5 text-cyan-400" /> JOB CLASSES & TITLES UNLOCK SYSTEM
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ACTIVE STATUS HIGHLIGHT BANNER */}
        <div className="px-5 py-3 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">ACTIVE JOB:</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              {renderTopicIcon(activeJob.iconName)}
              {activeJob.name}
              {activeJob.isCustom && <span className="text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 rounded">CUSTOM</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">EQUIPPED TITLE:</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] flex items-center gap-1.5">
              {renderTopicIcon(activeTitle.iconName || 'GraduationCap', 'h-3.5 w-3.5')}
              [{activeTitle.badge}] {activeTitle.name}
              {activeTitle.isCustom && <span className="ml-1 text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 rounded">CUSTOM</span>}
            </span>
          </div>
        </div>

        {/* NAV TABS + CREATE BUTTON */}
        <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/20 px-2">
          <div className="flex flex-1">
            <button
              onClick={() => { setActiveTab('jobs'); setShowAddForm(false); setEditingJobId(null); setEditingTitleId(null); }}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'jobs' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Shield className="h-4 w-4" /> JOB CLASSES ({allJobs.length})
            </button>
            <button
              onClick={() => { setActiveTab('titles'); setShowAddForm(false); setEditingJobId(null); setEditingTitleId(null); }}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all border-b-2 flex items-center gap-2 ${
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
            className="my-1.5 mr-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAddForm ? 'CANCEL' : activeTab === 'jobs' ? '+ CREATE JOB' : '+ CREATE TITLE'}
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CREATE CUSTOM JOB OR TITLE FORM */}
          {showAddForm && (
            <div className="p-4 bg-zinc-900/90 border border-cyan-500/40 rounded-xl space-y-4 animate-fade-in mb-4 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                <Plus className="h-4 w-4" /> {activeTab === 'jobs' ? 'CREATE CUSTOM JOB CLASS WITH DERIVED QUEST CONDITIONS' : 'CREATE CUSTOM HONORIFIC TITLE WITH DERIVED QUEST CONDITIONS'}
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
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
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
                  <label className="text-zinc-400 block mb-1.5 uppercase font-bold">TOPIC ICON (KNOWLEDGE, IRON WILL, PASSION, STRATEGY, LOGIC, MYSTERY, STRENGTH, ARCHITECTURE)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/60 p-2.5 rounded-lg border border-white/10 max-h-40 overflow-y-auto">
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
                                className={`p-2 rounded flex items-center gap-1.5 text-[10px] border transition-all ${
                                  isSelected 
                                    ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold' 
                                    : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800'
                                }`}
                              >
                                {renderTopicIcon(icon.name, 'h-4 w-4')}
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
                <div className="p-3 bg-zinc-950 border border-cyan-500/30 rounded-lg space-y-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-cyan-400" />
                    DERIVED UNLOCK CONDITIONS CONFIGURATOR
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* System Level Req */}
                    <div>
                      <label className="text-zinc-400 block mb-1">1. REQUIRED SYSTEM LEVEL</label>
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        value={activeTab === 'jobs' ? jobReqLevel : titleReqLevel}
                        onChange={e => activeTab === 'jobs' ? setJobReqLevel(Number(e.target.value)) : setTitleReqLevel(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Derived Quest Req */}
                    <div>
                      <label className="text-zinc-400 block mb-1">2. RELATED DERIVED QUEST (MUST BE COMPLETED)</label>
                      <select
                        value={activeTab === 'jobs' ? jobRelatedQuestId : titleRelatedQuestId}
                        onChange={e => activeTab === 'jobs' ? handleQuestSelectForJob(e.target.value) : handleQuestSelectForTitle(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- No Quest Condition --</option>
                        {state.quests.map(q => (
                          <option key={q.id} value={q.id}>
                            {q.name} [{q.status}] ({q.difficulty})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* QUEST STREAK & GOAL REQUIREMENT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">3. REQUIRED QUEST STREAK (DAYS)</label>
                      <input 
                        type="number"
                        min="0"
                        max="365"
                        placeholder="0 for no streak requirement"
                        value={activeTab === 'jobs' ? jobRequiredStreak : titleRequiredStreak}
                        onChange={e => activeTab === 'jobs' ? setJobRequiredStreak(Number(e.target.value)) : setTitleRequiredStreak(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">4. RELATED GOAL (MUST BE ACTIVE/COMPLETED)</label>
                      <select
                        value={activeTab === 'jobs' ? jobRelatedGoalId : titleRelatedGoalId}
                        onChange={e => activeTab === 'jobs' ? setJobRelatedGoalId(e.target.value) : setTitleRelatedGoalId(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- No Goal Condition --</option>
                        {state.goals.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name} [{g.status}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DERIVED SKILLS WITH MINIMUM LEVEL REQUIREMENT */}
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase font-bold">5. REQUIRED SKILL LEVELS DERIVED FROM QUEST</label>
                    <div className="space-y-2 bg-black/50 p-2.5 rounded border border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {state.skills.map(s => {
                          const currentReqs = activeTab === 'jobs' ? jobSkillReqs : titleSkillReqs;
                          const existing = currentReqs.find(sr => sr.skillId === s.id);
                          const isSelected = !!existing;

                          return (
                            <div 
                              key={s.id}
                              className={`p-1.5 rounded border flex items-center gap-2 text-[10px] ${
                                isSelected ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border-white/5 text-zinc-400'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const updater = activeTab === 'jobs' ? setJobSkillReqs : setTitleSkillReqs;
                                  if (isSelected) {
                                    updater(prev => prev.filter(x => x.skillId !== s.id));
                                  } else {
                                    updater(prev => [...prev, { skillId: s.id, minLevel: 2 }]);
                                  }
                                }}
                                className="font-bold flex items-center gap-1"
                              >
                                {isSelected ? <CheckCircle2 className="h-3 w-3 text-cyan-400" /> : <Plus className="h-3 w-3 text-zinc-500" />}
                                {s.name}
                              </button>

                              {isSelected && (
                                <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
                                  <span>Lvl &gt;=</span>
                                  <input 
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={existing.minLevel}
                                    onChange={e => {
                                      const minLvl = Number(e.target.value) || 1;
                                      const updater = activeTab === 'jobs' ? setJobSkillReqs : setTitleSkillReqs;
                                      updater(prev => prev.map(x => x.skillId === s.id ? { ...x, minLevel: minLvl } : x));
                                    }}
                                    className="w-10 bg-black border border-white/20 rounded px-1 text-center text-white font-bold"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* FORM BUTTONS */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all uppercase tracking-wider"
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
                Select, edit, or configure Job Classes. Unlock requirements are derived from System Level, Quest completion, Skill levels, Quest streaks, and Goal status.
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
                          className="text-zinc-400 hover:text-white"
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
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
                                className={`p-1.5 rounded flex items-center gap-1 text-[10px] border ${
                                  editJobIconName === icon.name ? 'bg-purple-500/30 border-purple-400 text-white font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                                }`}
                              >
                                {renderTopicIcon(icon.name, 'h-3.5 w-3.5')}
                                <span>{icon.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

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

                        {/* DERIVED UNLOCK CONDITIONS FOR EDIT */}
                        <div className="p-3 bg-zinc-950 border border-purple-500/30 rounded space-y-3">
                          <span className="text-[10px] font-mono font-bold text-purple-300 uppercase block">DERIVED UNLOCK REQUIREMENTS</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-zinc-400 block mb-1">REQ SYSTEM LEVEL</label>
                              <input 
                                type="number"
                                min="1"
                                value={editJobReqLevel}
                                onChange={e => setEditJobReqLevel(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-400 block mb-1">REQUIRED QUEST</label>
                              <select
                                value={editJobRelatedQuestId}
                                onChange={e => setEditJobRelatedQuestId(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              >
                                <option value="">-- None --</option>
                                {state.quests.map(q => (
                                  <option key={q.id} value={q.id}>{q.name} [{q.status}]</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-zinc-400 block mb-1">REQUIRED QUEST STREAK</label>
                              <input 
                                type="number"
                                min="0"
                                value={editJobRequiredStreak}
                                onChange={e => setEditJobRequiredStreak(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-400 block mb-1">REQUIRED GOAL</label>
                              <select
                                value={editJobRelatedGoalId}
                                onChange={e => setEditJobRelatedGoalId(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              >
                                <option value="">-- None --</option>
                                {state.goals.map(g => (
                                  <option key={g.id} value={g.id}>{g.name} [{g.status}]</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingJobId(null)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded hover:bg-purple-400 transition-all flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" /> SAVE CHANGES
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div 
                    key={job.id}
                    className={`p-4 rounded-lg border transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      isCurrent 
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                        : isUnlocked 
                          ? 'border-white/10 bg-zinc-900/40 hover:border-white/20' 
                          : 'border-white/5 bg-zinc-900/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-lg border shrink-0 ${isCurrent ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-zinc-900 border-white/5'}`}>
                        {renderTopicIcon(job.iconName)}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-extrabold text-sm text-white uppercase">{job.name}</h4>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                            {job.category}
                          </span>
                          {job.isCustom && (
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-sans">{job.description}</p>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold bg-white/[0.02] border border-cyan-500/20 rounded px-2 py-1 inline-block">
                          ⚡ PERK: {job.perk}
                        </div>

                        {/* DERIVED UNLOCK CONDITIONS DISPLAY BADGES */}
                        <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] font-mono">
                          <span className="text-zinc-500 uppercase block font-bold">DERIVED UNLOCK CONDITIONS:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {evalResult.metConditions.map((cond, idx) => (
                              <span key={idx} className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                {cond}
                              </span>
                            ))}
                            {evalResult.unmetConditions.map((cond, idx) => (
                              <span key={idx} className="bg-rose-950/60 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                <XCircle className="h-3 w-3 text-rose-400" />
                                {cond}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex items-center gap-1.5">
                      <button
                        onClick={() => startEditJob(job)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded transition-all"
                        title="Edit Job Class Specs"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete job class "${job.name}"?`)) {
                            deleteJobSpec(job.id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                        title="Delete Job Class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {isCurrent ? (
                        <button 
                          disabled 
                          className="w-full md:w-auto px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs rounded font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="h-3.5 w-3.5" /> ACTIVE CLASS
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => updateJob(job.id)}
                          className="w-full md:w-auto px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 font-mono text-xs rounded font-bold transition-all flex items-center justify-center gap-1"
                        >
                          EQUIP CLASS
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full md:w-auto px-3 py-1.5 bg-zinc-900 border border-white/5 text-zinc-600 font-mono text-xs rounded cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Lock className="h-3.5 w-3.5" /> LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: HONORIFIC TITLES */}
          {activeTab === 'titles' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Configure prestige Honorific Titles. Derive title unlocks from quest completion, skills, streaks, and goals.
              </p>

              {allTitles.map((title: TitleSpec) => {
                const isEquipped = title.id === activeTitle.id;
                const evalResult = evaluateUnlockConditions(title, state);
                const isUnlocked = isTitleUnlocked(title, state);
                const isEditing = editingTitleId === title.id;

                if (isEditing) {
                  return (
                    <div key={title.id} className="p-4 bg-zinc-900 border border-purple-500/50 rounded-lg space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                          <Pencil className="h-3.5 w-3.5" /> EDIT HONORIFIC TITLE ({title.name})
                        </span>
                        <button 
                          onClick={() => setEditingTitleId(null)} 
                          className="text-zinc-400 hover:text-white"
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
                            <label className="text-zinc-400 block mb-1">BADGE TEXT (UPPERCASE)</label>
                            <input 
                              type="text"
                              value={editTitleBadge}
                              onChange={e => setEditTitleBadge(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">TOPIC / CATEGORY</label>
                            <select
                              value={editTitleCategory}
                              onChange={e => setEditTitleCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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

                        {/* ICON SELECTOR FOR TITLE */}
                        <div>
                          <label className="text-zinc-400 block mb-1">TOPIC ICON</label>
                          <div className="flex flex-wrap gap-1.5 bg-black/60 p-2 rounded border border-white/10 max-h-32 overflow-y-auto">
                            {TOPIC_ICON_OPTIONS.flatMap(g => g.icons).map(icon => (
                              <button
                                key={icon.name}
                                type="button"
                                onClick={() => setEditTitleIconName(icon.name)}
                                className={`p-1.5 rounded flex items-center gap-1 text-[10px] border ${
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
                          <label className="text-zinc-400 block mb-1">TITLE DESCRIPTION</label>
                          <input 
                            type="text"
                            value={editTitleDescription}
                            onChange={e => setEditTitleDescription(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {/* DERIVED UNLOCK CONDITIONS FOR TITLE EDIT */}
                        <div className="p-3 bg-zinc-950 border border-purple-500/30 rounded space-y-3">
                          <span className="text-[10px] font-mono font-bold text-purple-300 uppercase block">DERIVED UNLOCK REQUIREMENTS</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-zinc-400 block mb-1">REQ SYSTEM LEVEL</label>
                              <input 
                                type="number"
                                min="1"
                                value={editTitleReqLevel}
                                onChange={e => setEditTitleReqLevel(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-400 block mb-1">REQUIRED QUEST</label>
                              <select
                                value={editTitleRelatedQuestId}
                                onChange={e => setEditTitleRelatedQuestId(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              >
                                <option value="">-- None --</option>
                                {state.quests.map(q => (
                                  <option key={q.id} value={q.id}>{q.name} [{q.status}]</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-zinc-400 block mb-1">REQUIRED QUEST STREAK</label>
                              <input 
                                type="number"
                                min="0"
                                value={editTitleRequiredStreak}
                                onChange={e => setEditTitleRequiredStreak(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-zinc-400 block mb-1">REQUIRED GOAL</label>
                              <select
                                value={editTitleRelatedGoalId}
                                onChange={e => setEditTitleRelatedGoalId(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white"
                              >
                                <option value="">-- None --</option>
                                {state.goals.map(g => (
                                  <option key={g.id} value={g.id}>{g.name} [{g.status}]</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingTitleId(null)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded hover:bg-purple-400 transition-all flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" /> SAVE CHANGES
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div
                    key={title.id}
                    className={`p-4 rounded-lg border transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      isEquipped 
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                        : isUnlocked 
                          ? 'border-white/10 bg-zinc-900/40 hover:border-white/20' 
                          : 'border-white/5 bg-zinc-900/10 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-lg border shrink-0 ${isEquipped ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : isUnlocked ? 'bg-zinc-900 text-amber-400 border-white/5' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                        {renderTopicIcon(title.iconName || 'GraduationCap')}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isUnlocked 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                              : 'bg-zinc-900 text-zinc-500 border-white/5'
                          }`}>
                            [{title.badge}]
                          </span>
                          <h4 className="font-display font-extrabold text-sm text-white uppercase">{title.name}</h4>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                            {title.category}
                          </span>
                          {title.isCustom && (
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-sans">{title.description}</p>
                        
                        {/* DERIVED UNLOCK CONDITIONS DISPLAY BADGES */}
                        <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] font-mono">
                          <span className="text-zinc-500 uppercase block font-bold">DERIVED UNLOCK CONDITIONS:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {evalResult.metConditions.map((cond, idx) => (
                              <span key={idx} className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                {cond}
                              </span>
                            ))}
                            {evalResult.unmetConditions.map((cond, idx) => (
                              <span key={idx} className="bg-rose-950/60 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                <XCircle className="h-3 w-3 text-rose-400" />
                                {cond}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex items-center gap-1.5">
                      <button
                        onClick={() => startEditTitle(title)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded transition-all"
                        title="Edit Title Specs"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete title "${title.name}"?`)) {
                            deleteTitleSpec(title.id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                        title="Delete Title"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {isEquipped ? (
                        <button 
                          disabled 
                          className="w-full md:w-auto px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs rounded font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="h-3.5 w-3.5" /> EQUIPPED
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => updateTitle(title.id)}
                          className="w-full md:w-auto px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 font-mono text-xs rounded font-bold transition-all flex items-center justify-center gap-1"
                        >
                          EQUIP TITLE
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full md:w-auto px-3 py-1.5 bg-zinc-900 border border-white/5 text-zinc-600 font-mono text-xs rounded cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Lock className="h-3.5 w-3.5" /> LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded transition-all"
          >
            CLOSE SPECS
          </button>
        </div>

      </div>
    </div>
  );
};
