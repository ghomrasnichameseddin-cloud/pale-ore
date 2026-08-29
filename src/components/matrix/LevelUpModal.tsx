import React, { useState, useEffect } from 'react';
import { usePOS } from '../../POSContext';
import { 
  JobSpec, TitleSpec, LevelConditionSpec, LEVEL_RANK_NAMES,
  getDefaultLevelConditionSpec, evaluateLevelConditions
} from '../../jobsAndTitles';
import { renderTopicIcon } from './TopicIconHelper';
import { 
  X, Sparkles, Trash2, RotateCcw, Save, Shield, Target, 
  CheckCircle2, XCircle, Activity, Zap, FolderGit2, Check,
  Flame, Clock, Lock, Sliders
} from 'lucide-react';

interface LevelUpModalProps {
  job: JobSpec | null;
  title: TitleSpec | null;
  onClose: () => void;
  onSaveJobSpec: (job: JobSpec) => void;
  onSaveTitleSpec: (title: TitleSpec) => void;
  onToast: (message: string, type?: 'success' | 'info') => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  job,
  title,
  onClose,
  onSaveJobSpec,
  onSaveTitleSpec,
  onToast
}) => {
  const { state, getJobLvl, getTitleLvl, levelUpJob, levelUpTitle } = usePOS();

  const activeSpec = job || title;
  const isJob = !!job;

  const currentLevel = isJob ? getJobLvl(job!.id) : getTitleLvl(title!.id);
  const defaultTarget = currentLevel < 7 ? currentLevel + 1 : 7;

  const [targetLevel, setTargetLevel] = useState<number>(defaultTarget);
  const [levelCondition, setLevelCondition] = useState<LevelConditionSpec>({
    level: defaultTarget,
    unlockedAtLevel: 0,
    requiredQuestsCount: 0,
    requiredQuestStreak: 0,
    requiredFocusMinutes: 0,
    questRequirements: [],
    skillRequirements: [],
    relatedGoalIds: [],
    relatedProjectIds: [],
    isCustomized: false
  });

  const [activeTab, setActiveTab] = useState<'thresholds' | 'quests' | 'skills' | 'goals'>('thresholds');

  const loadConditionsForLevel = (spec: JobSpec | TitleSpec, lvl: number) => {
    if (spec.customLevelConditions && spec.customLevelConditions[lvl]) {
      const custom = spec.customLevelConditions[lvl];
      setLevelCondition({
        ...custom,
        questRequirements: custom.questRequirements ? [...custom.questRequirements] : [],
        skillRequirements: custom.skillRequirements ? [...custom.skillRequirements] : [],
        relatedGoalIds: custom.relatedGoalIds ? [...custom.relatedGoalIds] : (custom.relatedGoalId ? [custom.relatedGoalId] : []),
        relatedProjectIds: custom.relatedProjectIds ? [...custom.relatedProjectIds] : (custom.relatedProjectId ? [custom.relatedProjectId] : []),
        isCustomized: true
      });
    } else {
      const def = getDefaultLevelConditionSpec(spec, lvl);
      setLevelCondition({
        ...def,
        questRequirements: def.questRequirements ? [...def.questRequirements] : [],
        skillRequirements: def.skillRequirements ? [...def.skillRequirements] : [],
        relatedGoalIds: def.relatedGoalIds ? [...def.relatedGoalIds] : (def.relatedGoalId ? [def.relatedGoalId] : []),
        relatedProjectIds: def.relatedProjectIds ? [...def.relatedProjectIds] : (def.relatedProjectId ? [def.relatedProjectId] : []),
        isCustomized: false
      });
    }
  };

  useEffect(() => {
    if (activeSpec) {
      loadConditionsForLevel(activeSpec, targetLevel);
    }
  }, [activeSpec, targetLevel]);

  if (!activeSpec) return null;

  const handleTargetLevelChange = (lvl: number) => {
    setTargetLevel(lvl);
    loadConditionsForLevel(activeSpec, lvl);
  };

  // 1. DELETE / CLEAR ALL CONDITIONS (0 requirements to level up)
  const handleClearAllConditions = () => {
    const cleared: LevelConditionSpec = {
      level: targetLevel,
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
    setLevelCondition(cleared);

    if (job) {
      const updatedJob: JobSpec = {
        ...job,
        customLevelConditions: {
          ...(job.customLevelConditions || {}),
          [targetLevel]: cleared
        },
        isCustom: true
      };
      onSaveJobSpec(updatedJob);
      onToast(`Cleared all conditions for Level ${targetLevel}! Level up is now immediately accessible.`, 'success');
    } else if (title) {
      const updatedTitle: TitleSpec = {
        ...title,
        customLevelConditions: {
          ...(title.customLevelConditions || {}),
          [targetLevel]: cleared
        },
        isCustom: true
      };
      onSaveTitleSpec(updatedTitle);
      onToast(`Cleared all conditions for Level ${targetLevel}! Level up is now immediately accessible.`, 'success');
    }
  };

  // 2. RESET TO DEFAULT PROGRESSION FORMULA
  const handleResetToDefaults = () => {
    const def = getDefaultLevelConditionSpec(activeSpec, targetLevel);
    setLevelCondition({
      ...def,
      questRequirements: def.questRequirements ? [...def.questRequirements] : [],
      skillRequirements: def.skillRequirements ? [...def.skillRequirements] : [],
      relatedGoalIds: def.relatedGoalIds ? [...def.relatedGoalIds] : (def.relatedGoalId ? [def.relatedGoalId] : []),
      relatedProjectIds: def.relatedProjectIds ? [...def.relatedProjectIds] : (def.relatedProjectId ? [def.relatedProjectId] : []),
      isCustomized: false
    });

    if (job) {
      const nextCustom = { ...(job.customLevelConditions || {}) };
      delete nextCustom[targetLevel];
      const updatedJob: JobSpec = {
        ...job,
        customLevelConditions: Object.keys(nextCustom).length > 0 ? nextCustom : undefined
      };
      onSaveJobSpec(updatedJob);
      onToast(`Restored default progression requirements for Level ${targetLevel}.`, 'info');
    } else if (title) {
      const nextCustom = { ...(title.customLevelConditions || {}) };
      delete nextCustom[targetLevel];
      const updatedTitle: TitleSpec = {
        ...title,
        customLevelConditions: Object.keys(nextCustom).length > 0 ? nextCustom : undefined
      };
      onSaveTitleSpec(updatedTitle);
      onToast(`Restored default progression requirements for Level ${targetLevel}.`, 'info');
    }
  };

  // 3. SAVE CUSTOM LEVEL RULES
  const handleSaveLevelRules = () => {
    const conditionToSave: LevelConditionSpec = {
      ...levelCondition,
      level: targetLevel,
      isCustomized: true
    };

    if (job) {
      const updatedJob: JobSpec = {
        ...job,
        customLevelConditions: {
          ...(job.customLevelConditions || {}),
          [targetLevel]: conditionToSave
        },
        isCustom: true
      };
      onSaveJobSpec(updatedJob);
      onToast(`Saved custom Level ${targetLevel} conditions for "${job.name}"!`, 'success');
    } else if (title) {
      const updatedTitle: TitleSpec = {
        ...title,
        customLevelConditions: {
          ...(title.customLevelConditions || {}),
          [targetLevel]: conditionToSave
        },
        isCustom: true
      };
      onSaveTitleSpec(updatedTitle);
      onToast(`Saved custom Level ${targetLevel} conditions for "${title.name}"!`, 'success');
    }
  };

  // 4. CONFIRM & LEVEL UP
  const handleConfirmLevelUp = () => {
    handleSaveLevelRules();
    if (job) {
      const res = levelUpJob(job.id, targetLevel, true);
      onToast(res.message, 'success');
      onClose();
    } else if (title) {
      const res = levelUpTitle(title.id, targetLevel, true);
      onToast(res.message, 'success');
      onClose();
    }
  };

  // Diagnostic Preview
  const previewSpec: JobSpec = {
    ...activeSpec,
    id: activeSpec.id,
    name: activeSpec.name,
    category: activeSpec.category,
    iconName: activeSpec.iconName || 'BookOpen',
    description: activeSpec.description,
    perk: (activeSpec as JobSpec).perk || (activeSpec as TitleSpec).unlockCondition || '',
    unlockedAtLevel: levelCondition.unlockedAtLevel,
    customLevelConditions: {
      ...(activeSpec.customLevelConditions || {}),
      [targetLevel]: levelCondition
    }
  };
  const diagEval = evaluateLevelConditions(previewSpec, targetLevel, state);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in font-mono text-xs">
      <div className="bg-zinc-950 border border-[var(--border-accent)] rounded-2xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-zinc-300">
        
        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-[var(--accent-surface)] via-zinc-900 to-[var(--accent-surface)] border-b border-[var(--border-accent)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-surface)] border border-[var(--border-accent)] rounded-lg text-[var(--accent-bright)]">
              {renderTopicIcon(activeSpec.iconName, "h-5 w-5")}
            </div>
            <div>
              <span className="text-[10px] text-[var(--accent-bright)] font-bold uppercase tracking-widest block">
                {isJob ? 'JOB CLASS PROGRESSION PIPELINE' : 'HONORIFIC TITLE PRESTIGE PIPELINE'}
              </span>
              <h3 className="text-base font-extrabold text-white uppercase flex items-center gap-2">
                {activeSpec.name}
                <span className="text-[10px] bg-[var(--accent-primary)] text-black px-2 py-0.5 rounded font-black">
                  LVL {targetLevel} ({LEVEL_RANK_NAMES[targetLevel]})
                </span>
              </h3>
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

        {/* LEVEL NAVIGATION TABS (LEVELS 2 TO 7) */}
        <div className="px-4 py-2 bg-black/70 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1 shrink-0">TARGET LEVEL:</span>
          {[2, 3, 4, 5, 6, 7].map(lvl => {
            const hasCustom = !!(activeSpec.customLevelConditions && activeSpec.customLevelConditions[lvl]);
            const isSelected = targetLevel === lvl;
            const isCompleted = currentLevel >= lvl;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleTargetLevelChange(lvl)}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-black shadow-[0_0_10px_var(--glow-color)]'
                    : isCompleted
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span>Lvl {lvl}</span>
                <span className="text-[9px] opacity-80">({LEVEL_RANK_NAMES[lvl]})</span>
                {hasCustom && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" title="Has Custom Conditions" />}
                {isCompleted && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* QUICK PRESET & STATUS BAR */}
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-bold uppercase">Condition Status:</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                levelCondition.isCustomized 
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50' 
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
              }`}>
                {levelCondition.isCustomized ? '✨ Custom Player Rules Configured' : '⚙️ Standard Progression Formula'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAllConditions}
                className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-200 rounded-md font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                title="Delete all conditions so this level is instantly achievable (0 requirements)"
              >
                <Trash2 className="h-3 w-3 text-rose-400" />
                CLEAR ALL REQUIREMENTS (0 REQ)
              </button>

              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-white/15 text-zinc-300 rounded-md font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                title="Restore default formula"
              >
                <RotateCcw className="h-3 w-3 text-zinc-400" />
                RESTORE DEFAULTS
              </button>
            </div>
          </div>

          {/* SUB TABS FOR EDITING CONDITIONS */}
          <div className="flex gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
            {[
              { id: 'thresholds', label: '1. Numeric Thresholds', icon: Sliders },
              { id: 'quests', label: '2. Quest Requirements', icon: Target },
              { id: 'skills', label: '3. Skill Proficiencies', icon: Zap },
              { id: 'goals', label: '4. Goals & Projects', icon: FolderGit2 },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* SECTION 1: NUMERIC THRESHOLDS */}
          {activeTab === 'thresholds' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* System Level */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">REQ SYSTEM LVL</label>
                  <button 
                    type="button" 
                    onClick={() => setLevelCondition(p => ({ ...p, unlockedAtLevel: 0, isCustomized: true }))}
                    className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={levelCondition.unlockedAtLevel ?? 0}
                  onChange={e => setLevelCondition(p => ({ ...p, unlockedAtLevel: Number(e.target.value), isCustomized: true }))}
                  className="w-full bg-black border border-white/20 rounded px-2.5 py-1.5 text-white font-bold text-sm"
                />
                <span className="text-[9px] text-zinc-500 block">0 = No level required</span>
              </div>

              {/* Completed Quests Count */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">COMPLETED QUESTS</label>
                  <button 
                    type="button" 
                    onClick={() => setLevelCondition(p => ({ ...p, requiredQuestsCount: 0, isCustomized: true }))}
                    className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <input 
                  type="number"
                  min="0"
                  max="500"
                  value={levelCondition.requiredQuestsCount ?? 0}
                  onChange={e => setLevelCondition(p => ({ ...p, requiredQuestsCount: Number(e.target.value), isCustomized: true }))}
                  className="w-full bg-black border border-white/20 rounded px-2.5 py-1.5 text-white font-bold text-sm"
                />
                <span className="text-[9px] text-zinc-500 block">0 = No quest count req</span>
              </div>

              {/* Quest Streak Days */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">ACTIVE STREAK (DAYS)</label>
                  <button 
                    type="button" 
                    onClick={() => setLevelCondition(p => ({ ...p, requiredQuestStreak: 0, isCustomized: true }))}
                    className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <input 
                  type="number"
                  min="0"
                  max="365"
                  value={levelCondition.requiredQuestStreak ?? 0}
                  onChange={e => setLevelCondition(p => ({ ...p, requiredQuestStreak: Number(e.target.value), isCustomized: true }))}
                  className="w-full bg-black border border-white/20 rounded px-2.5 py-1.5 text-white font-bold text-sm"
                />
                <span className="text-[9px] text-zinc-500 block">0 = No streak req</span>
              </div>

              {/* Focus Minutes */}
              <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">FOCUS MINUTES</label>
                  <button 
                    type="button" 
                    onClick={() => setLevelCondition(p => ({ ...p, requiredFocusMinutes: 0, isCustomized: true }))}
                    className="text-[9px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <input 
                  type="number"
                  min="0"
                  max="1440"
                  value={levelCondition.requiredFocusMinutes ?? 0}
                  onChange={e => setLevelCondition(p => ({ ...p, requiredFocusMinutes: Number(e.target.value), isCustomized: true }))}
                  className="w-full bg-black border border-white/20 rounded px-2.5 py-1.5 text-white font-bold text-sm"
                />
                <span className="text-[9px] text-zinc-500 block">0 = No focus req</span>
              </div>
            </div>
          )}

          {/* SECTION 2: SPECIFIC QUESTS */}
          {activeTab === 'quests' && (
            <div className="space-y-3 bg-zinc-900/40 p-3.5 rounded-xl border border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-zinc-300 font-bold uppercase">
                  SPECIFIC QUEST CONDITIONS FOR LEVEL {targetLevel}
                </label>
                <select
                  onChange={e => {
                    const qId = e.target.value;
                    if (!qId) return;
                    setLevelCondition(prev => {
                      const reqs = prev.questRequirements || [];
                      if (reqs.some(q => q.questId === qId)) return prev;
                      return {
                        ...prev,
                        questRequirements: [...reqs, { questId: qId, minStreak: Math.max(1, targetLevel - 1), requireCompleted: true }],
                        isCustomized: true
                      };
                    });
                    e.target.value = '';
                  }}
                  className="bg-black border border-white/20 rounded px-2.5 py-1 text-white text-[10px] cursor-pointer"
                >
                  <option value="">+ Add Quest Condition...</option>
                  {state.quests.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.name} [{q.status}]
                    </option>
                  ))}
                </select>
              </div>

              {(levelCondition.questRequirements || []).length > 0 ? (
                <div className="space-y-2">
                  {levelCondition.questRequirements!.map(qReq => {
                    const quest = state.quests.find(x => x.id === qReq.questId);
                    return (
                      <div key={qReq.questId} className="flex flex-wrap items-center justify-between gap-2 bg-black/70 px-3 py-2 rounded-lg border border-white/10">
                        <span className="font-bold text-white flex-1 min-w-[150px] truncate">
                          🎯 {quest ? quest.name : 'Linked Quest'}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-[10px] text-zinc-400">
                            <span>Req Streak:</span>
                            <input 
                              type="number"
                              min="0"
                              max="365"
                              value={qReq.minStreak || 0}
                              onChange={e => {
                                const streak = Number(e.target.value) || 0;
                                setLevelCondition(prev => ({
                                  ...prev,
                                  questRequirements: (prev.questRequirements || []).map(q => q.questId === qReq.questId ? { ...q, minStreak: streak } : q),
                                  isCustomized: true
                                }));
                              }}
                              className="w-12 bg-black border border-white/20 rounded px-1 text-center text-white font-bold"
                            />
                            <span>days</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setLevelCondition(prev => ({
                              ...prev,
                              questRequirements: (prev.questRequirements || []).filter(q => q.questId !== qReq.questId),
                              isCustomized: true
                            }))}
                            className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition cursor-pointer"
                            title="Delete Quest Condition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 bg-black/40 p-3 rounded-lg border border-white/5">
                  No specific quests required for this level. Select from the dropdown above to add one.
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: SPECIFIC SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-3 bg-zinc-900/40 p-3.5 rounded-xl border border-white/10">
              <label className="text-zinc-300 font-bold uppercase block">
                SKILL PROFICIENCY LEVEL REQUIREMENTS FOR LEVEL {targetLevel}
              </label>
              <div className="flex flex-wrap gap-2 bg-black/60 p-3 rounded-lg border border-white/10">
                {state.skills.map(s => {
                  const existing = (levelCondition.skillRequirements || []).find(sr => sr.skillId === s.id);
                  const isSelected = !!existing;

                  return (
                    <div key={s.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-[10px] ${
                      isSelected ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200' : 'bg-zinc-900 border-white/5 text-zinc-400'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          setLevelCondition(prev => {
                            const reqs = prev.skillRequirements || [];
                            const exists = reqs.find(x => x.skillId === s.id);
                            if (exists) {
                              return { ...prev, skillRequirements: reqs.filter(x => x.skillId !== s.id), isCustomized: true };
                            } else {
                              return { ...prev, skillRequirements: [...reqs, { skillId: s.id, minLevel: targetLevel }], isCustomized: true };
                            }
                          });
                        }}
                        className="font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> : <Zap className="h-3.5 w-3.5 text-zinc-500" />}
                        {s.name}
                      </button>
                      {isSelected && (
                        <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
                          <span className="text-zinc-400">Lvl &gt;=</span>
                          <input 
                            type="number"
                            min="1"
                            max="50"
                            value={existing.minLevel}
                            onChange={e => {
                              const lvl = Number(e.target.value) || 1;
                              setLevelCondition(prev => ({
                                ...prev,
                                skillRequirements: (prev.skillRequirements || []).map(x => x.skillId === s.id ? { ...x, minLevel: lvl } : x),
                                isCustomized: true
                              }));
                            }}
                            className="w-10 bg-black border border-white/30 rounded px-1 text-center text-white font-bold"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: GOALS & PROJECTS */}
          {activeTab === 'goals' && (
            <div className="space-y-3 bg-zinc-900/40 p-3.5 rounded-xl border border-white/10">
              <div className="space-y-2">
                <label className="text-zinc-300 font-bold uppercase block">STRATEGIC GOAL REQUIREMENTS FOR LEVEL {targetLevel}</label>
                <div className="flex flex-wrap gap-1.5 bg-black/60 p-2.5 rounded-lg border border-white/10">
                  {state.goals.map(g => {
                    const isSelected = (levelCondition.relatedGoalIds || []).includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setLevelCondition(prev => {
                            const cur = prev.relatedGoalIds || [];
                            const upd = cur.includes(g.id) ? cur.filter(id => id !== g.id) : [...cur, g.id];
                            return { ...prev, relatedGoalIds: upd, isCustomized: true };
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] border flex items-center gap-1.5 cursor-pointer ${
                          isSelected ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                        }`}
                      >
                        <Target className="h-3 w-3" />
                        {g.name}
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-zinc-300 font-bold uppercase block">PROJECT REQUIREMENTS FOR LEVEL {targetLevel}</label>
                <div className="flex flex-wrap gap-1.5 bg-black/60 p-2.5 rounded-lg border border-white/10">
                  {state.projects.map(p => {
                    const isSelected = (levelCondition.relatedProjectIds || []).includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setLevelCondition(prev => {
                            const cur = prev.relatedProjectIds || [];
                            const upd = cur.includes(p.id) ? cur.filter(id => id !== p.id) : [...cur, p.id];
                            return { ...prev, relatedProjectIds: upd, isCustomized: true };
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] border flex items-center gap-1.5 cursor-pointer ${
                          isSelected ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold' : 'bg-zinc-900 border-white/5 text-zinc-400'
                        }`}
                      >
                        <FolderGit2 className="h-3 w-3" />
                        {p.name}
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REAL-TIME SYSTEM DIAGNOSTIC EVALUATION BOX */}
          <div className="p-3.5 bg-zinc-900/80 border border-[var(--border-accent)] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--accent-bright)] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-[var(--accent-bright)]" />
                SYSTEM DIAGNOSTIC FOR LEVEL {targetLevel}:
              </span>
              <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                diagEval.isMet 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                  : 'bg-rose-950 text-rose-300 border border-rose-500/50'
              }`}>
                {diagEval.isMet ? '✓ ALL CONDITIONS SATISFIED' : `⚠️ ${diagEval.unmetConditions.length} CONDITIONS PENDING`}
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

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 bg-black/70 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition cursor-pointer"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSaveLevelRules}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-cyan-400" /> SAVE LEVEL {targetLevel} CONDITIONS
          </button>

          <button
            type="button"
            onClick={handleConfirmLevelUp}
            className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-bright)] to-[var(--accent-primary)] hover:opacity-95 text-black font-extrabold rounded-lg shadow-[0_0_15px_var(--glow-color)] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> CONFIRM & ELEVATE TO LVL {targetLevel}!
          </button>
        </div>

      </div>
    </div>
  );
};
