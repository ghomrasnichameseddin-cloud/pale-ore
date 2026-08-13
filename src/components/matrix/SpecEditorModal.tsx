import React, { useState, useEffect } from 'react';
import { JobSpec, TitleSpec, QuestRequirement, SkillRequirement } from '../../jobsAndTitles';
import { TopicIconPicker } from './TopicIconPicker';
import { ConditionConfigurator } from './ConditionConfigurator';
import { renderTopicIcon } from './TopicIconHelper';
import { 
  X, Save, Plus, Shield, Award, Sparkles, Sliders, CheckCircle2,
  BookOpen, Flame, Target, Code, Eye, Dumbbell, Building, Star
} from 'lucide-react';

export type SpecEditorMode = 'create-job' | 'create-title' | 'edit-job' | 'edit-title';

interface SpecEditorModalProps {
  isOpen: boolean;
  mode: SpecEditorMode;
  initialJob?: JobSpec | null;
  initialTitle?: TitleSpec | null;
  onClose: () => void;
  onSaveJob: (jobData: Partial<JobSpec>) => void;
  onSaveTitle: (titleData: Partial<TitleSpec>) => void;
}

export const SpecEditorModal: React.FC<SpecEditorModalProps> = ({
  isOpen,
  mode,
  initialJob,
  initialTitle,
  onClose,
  onSaveJob,
  onSaveTitle
}) => {
  const isJob = mode === 'create-job' || mode === 'edit-job';
  const isEditing = mode === 'edit-job' || mode === 'edit-title';

  // Form Tabs
  const [activeStep, setActiveStep] = useState<'basic' | 'conditions'>('basic');

  // Form Fields
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [category, setCategory] = useState('Knowledge');
  const [iconName, setIconName] = useState('BookOpen');
  const [description, setDescription] = useState('');
  const [perkOrCondition, setPerkOrCondition] = useState('');

  // Derived Condition Fields
  const [systemLevel, setSystemLevel] = useState<number>(1);
  const [questReqs, setQuestReqs] = useState<QuestRequirement[]>([]);
  const [skillReqs, setSkillReqs] = useState<SkillRequirement[]>([]);
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);

  // Sync state when opening modal with initial item
  useEffect(() => {
    if (!isOpen) return;

    if (isJob) {
      if (initialJob) {
        setName(initialJob.name);
        setCategory(initialJob.category || 'Architecture');
        setIconName(initialJob.iconName || 'Building');
        setDescription(initialJob.description || '');
        setPerkOrCondition(initialJob.perk || '');
        setSystemLevel(initialJob.unlockedAtLevel || 1);

        const qReqs = initialJob.questRequirements ? [...initialJob.questRequirements] : [];
        if (initialJob.relatedQuestId && !qReqs.some(q => q.questId === initialJob.relatedQuestId)) {
          qReqs.push({ questId: initialJob.relatedQuestId, minStreak: initialJob.requiredQuestStreak || 0, requireCompleted: true });
        }
        setQuestReqs(qReqs);
        setSkillReqs(initialJob.skillRequirements ? [...initialJob.skillRequirements] : []);
        setGoalIds(initialJob.relatedGoalIds ? [...initialJob.relatedGoalIds] : (initialJob.relatedGoalId ? [initialJob.relatedGoalId] : []));
        setProjectIds(initialJob.relatedProjectIds ? [...initialJob.relatedProjectIds] : (initialJob.relatedProjectId ? [initialJob.relatedProjectId] : []));
      } else {
        setName('');
        setCategory('Architecture');
        setIconName('Building');
        setDescription('');
        setPerkOrCondition('+10% XP bonus on system directives');
        setSystemLevel(1);
        setQuestReqs([]);
        setSkillReqs([]);
        setGoalIds([]);
        setProjectIds([]);
      }
    } else {
      if (initialTitle) {
        setName(initialTitle.name);
        setBadge(initialTitle.badge || '');
        setCategory(initialTitle.category || 'Knowledge');
        setIconName(initialTitle.iconName || 'GraduationCap');
        setDescription(initialTitle.description || '');
        setPerkOrCondition(initialTitle.unlockCondition || '');
        setSystemLevel(initialTitle.unlockedAtLevel || 1);

        const qReqs = initialTitle.questRequirements ? [...initialTitle.questRequirements] : [];
        if (initialTitle.relatedQuestId && !qReqs.some(q => q.questId === initialTitle.relatedQuestId)) {
          qReqs.push({ questId: initialTitle.relatedQuestId, minStreak: initialTitle.requiredQuestStreak || 0, requireCompleted: true });
        }
        setQuestReqs(qReqs);
        setSkillReqs(initialTitle.skillRequirements ? [...initialTitle.skillRequirements] : []);
        setGoalIds(initialTitle.relatedGoalIds ? [...initialTitle.relatedGoalIds] : (initialTitle.relatedGoalId ? [initialTitle.relatedGoalId] : []));
        setProjectIds(initialTitle.relatedProjectIds ? [...initialTitle.relatedProjectIds] : (initialTitle.relatedProjectId ? [initialTitle.relatedProjectId] : []));
      } else {
        setName('');
        setBadge('');
        setCategory('Knowledge');
        setIconName('GraduationCap');
        setDescription('');
        setPerkOrCondition('Derived Quest Directive');
        setSystemLevel(1);
        setQuestReqs([]);
        setSkillReqs([]);
        setGoalIds([]);
        setProjectIds([]);
      }
    }

    setActiveStep('basic');
  }, [isOpen, mode, initialJob, initialTitle, isJob]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isJob) {
      onSaveJob({
        ...(initialJob ? { id: initialJob.id } : {}),
        name: name.trim(),
        category,
        iconName,
        description: description.trim() || 'Custom directive job class.',
        perk: perkOrCondition.trim() || '+10% bonus on directives',
        unlockedAtLevel: systemLevel,
        questRequirements: questReqs.length > 0 ? questReqs : undefined,
        skillRequirements: skillReqs.length > 0 ? skillReqs : undefined,
        relatedGoalIds: goalIds.length > 0 ? goalIds : undefined,
        relatedProjectIds: projectIds.length > 0 ? projectIds : undefined
      });
    } else {
      onSaveTitle({
        ...(initialTitle ? { id: initialTitle.id } : {}),
        name: name.trim(),
        badge: (badge.trim() || name.trim().substring(0, 10)).toUpperCase(),
        category,
        iconName,
        description: description.trim() || 'Custom honorific prestige title.',
        unlockCondition: perkOrCondition.trim() || 'Derived condition unlock',
        unlockedAtLevel: systemLevel,
        questRequirements: questReqs.length > 0 ? questReqs : undefined,
        skillRequirements: skillReqs.length > 0 ? skillReqs : undefined,
        relatedGoalIds: goalIds.length > 0 ? goalIds : undefined,
        relatedProjectIds: projectIds.length > 0 ? projectIds : undefined
      });
    }

    onClose();
  };

  const configuredConditionsCount = 
    (systemLevel > 1 ? 1 : 0) + questReqs.length + skillReqs.length + goalIds.length + projectIds.length;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* MODAL HEADER */}
        <div className="p-4 bg-zinc-900/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              {renderTopicIcon(iconName, "h-5 w-5")}
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                {isJob ? 'OPERATOR CAREER MATRIX' : 'HONORIFIC MATRIX'} • {isEditing ? 'EDITOR' : 'CREATOR'}
              </span>
              <h2 className="text-base font-display font-extrabold text-white uppercase">
                {isEditing 
                  ? `EDIT ${isJob ? 'JOB CLASS' : 'HONORIFIC TITLE'}: ${name || 'UNTITLED'}`
                  : `CREATE CUSTOM ${isJob ? 'JOB CLASS' : 'HONORIFIC TITLE'}`
                }
              </h2>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP TABS */}
        <div className="flex border-b border-white/10 bg-black/40 px-2">
          <button
            type="button"
            onClick={() => setActiveStep('basic')}
            className={`py-2.5 px-4 font-bold text-xs uppercase transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeStep === 'basic' 
                ? 'border-cyan-400 text-cyan-400 bg-white/[0.03]' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            1. Basic Information
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('conditions')}
            className={`py-2.5 px-4 font-bold text-xs uppercase transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeStep === 'conditions' 
                ? 'border-cyan-400 text-cyan-400 bg-white/[0.03]' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            2. Unlock Conditions
            {configuredConditionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/30">
                {configuredConditionsCount}
              </span>
            )}
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: BASIC INFORMATION */}
          {activeStep === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              {/* NAME & CATEGORY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold uppercase">
                    {isJob ? 'Job Class Name *' : 'Honorific Title Name *'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder={isJob ? 'e.g. Master Strategic Architect' : 'e.g. Master Code Architect'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-bold uppercase">
                    Topic / Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer text-xs"
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

              {/* BADGE TEXT (TITLES ONLY) */}
              {!isJob && (
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold uppercase">
                    Badge Tag (Upper Case Tag)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. ARCHITECT"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-cyan-400 focus:outline-none focus:border-cyan-500 font-bold uppercase tracking-wider"
                  />
                </div>
              )}

              {/* ICON PICKER */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 block font-bold uppercase">
                  Topic Icon Selection
                </label>
                <TopicIconPicker 
                  selectedIconName={iconName}
                  onSelectIcon={setIconName}
                  defaultCategory={category}
                />
              </div>

              {/* DESCRIPTION & PERK / UNLOCK SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold uppercase">
                    Description
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Advanced directive specialization unlocked through project milestones."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-bold uppercase">
                    {isJob ? 'Special Class Perk' : 'Unlock Requirement Summary'}
                  </label>
                  <textarea 
                    rows={2}
                    placeholder={isJob ? 'e.g. +15% XP bonus on system directives' : 'e.g. Complete System Architecture Quest'}
                    value={perkOrCondition}
                    onChange={e => setPerkOrCondition(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-sans text-xs"
                  />
                </div>
              </div>

              {/* BUTTON TO ADVANCE TO CONDITIONS */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep('conditions')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  Configure Unlock Rules &gt;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DERIVED UNLOCK RULES */}
          {activeStep === 'conditions' && (
            <div className="space-y-4 animate-fade-in">
              <ConditionConfigurator
                systemLevel={systemLevel}
                setSystemLevel={setSystemLevel}
                questReqs={questReqs}
                setQuestReqs={setQuestReqs}
                skillReqs={skillReqs}
                setSkillReqs={setSkillReqs}
                goalIds={goalIds}
                setGoalIds={setGoalIds}
                projectIds={projectIds}
                setProjectIds={setProjectIds}
                title="DERIVED UNLOCK CONDITIONS CONFIGURATOR"
                subtitle="Filling at least 1 condition configures how this directive unlocks."
                themeColor="cyan"
              />
            </div>
          )}

        </form>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-zinc-900/60 border-t border-white/10 flex items-center justify-between">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition cursor-pointer"
          >
            CANCEL
          </button>

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-lg transition flex items-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Save className="h-4 w-4" />
            {isEditing ? 'SAVE SPEC CHANGES' : isJob ? 'CREATE JOB CLASS' : 'CREATE TITLE'}
          </button>
        </div>

      </div>
    </div>
  );
};
