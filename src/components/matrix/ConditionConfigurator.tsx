import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { QuestRequirement, SkillRequirement } from '../../jobsAndTitles';
import { 
  Lock, Target, FolderGit2, Trash2, Plus, Check, 
  CheckCircle2, Sparkles, Sliders, Shield, Award, Zap,
  Flame, ChevronDown, ChevronRight
} from 'lucide-react';

interface ConditionConfiguratorProps {
  systemLevel: number;
  setSystemLevel: (val: number) => void;
  questReqs: QuestRequirement[];
  setQuestReqs: React.Dispatch<React.SetStateAction<QuestRequirement[]>>;
  skillReqs: SkillRequirement[];
  setSkillReqs: React.Dispatch<React.SetStateAction<SkillRequirement[]>>;
  goalIds: string[];
  setGoalIds: React.Dispatch<React.SetStateAction<string[]>>;
  projectIds: string[];
  setProjectIds: React.Dispatch<React.SetStateAction<string[]>>;
  title?: string;
  subtitle?: string;
  themeColor?: 'cyan' | 'amber' | 'purple';
}

export const ConditionConfigurator: React.FC<ConditionConfiguratorProps> = ({
  systemLevel,
  setSystemLevel,
  questReqs,
  setQuestReqs,
  skillReqs,
  setSkillReqs,
  goalIds,
  setGoalIds,
  projectIds,
  setProjectIds,
  title = "DERIVED UNLOCK CONDITIONS",
  subtitle = "Filling at least 1 condition configures this directive unlock requirement",
  themeColor = 'cyan'
}) => {
  const { state } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'level' | 'quests' | 'skills' | 'goals' | 'projects'>('all');

  // Count active conditions configured
  const totalActiveConditions = 
    (systemLevel > 1 ? 1 : 0) + 
    questReqs.length + 
    skillReqs.length + 
    goalIds.length + 
    projectIds.length;

  const handleClearAll = () => {
    setSystemLevel(1);
    setQuestReqs([]);
    setSkillReqs([]);
    setGoalIds([]);
    setProjectIds([]);
  };

  const accentClasses = {
    cyan: {
      border: 'border-cyan-500/30',
      headerText: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
      activeTab: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    amber: {
      border: 'border-amber-500/30',
      headerText: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      activeTab: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    purple: {
      border: 'border-purple-500/30',
      headerText: 'text-purple-400',
      badgeBg: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
      activeTab: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    }
  }[themeColor];

  return (
    <div className={`p-4 bg-zinc-950/90 border ${accentClasses.border} rounded-xl space-y-4 font-mono text-xs shadow-inner`}>
      
      {/* HEADER WITH SUMMARY & CLEAR ACTION */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Lock className={`h-4 w-4 ${accentClasses.headerText}`} />
            <span className={`font-extrabold uppercase tracking-wider ${accentClasses.headerText}`}>
              {title}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${accentClasses.badgeBg}`}>
              {totalActiveConditions} ACTIVE RULE{totalActiveConditions === 1 ? '' : 'S'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-sans">{subtitle}</p>
        </div>

        {totalActiveConditions > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[10px] px-2 py-1 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded flex items-center gap-1 transition cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Clear All Conditions
          </button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-1 bg-black/50 p-1 rounded-lg border border-white/5">
        {[
          { id: 'all', label: 'View All', count: totalActiveConditions },
          { id: 'level', label: '1. System Level', count: systemLevel > 1 ? 1 : 0 },
          { id: 'quests', label: '2. Quests & Streaks', count: questReqs.length },
          { id: 'skills', label: '3. Skill Levels', count: skillReqs.length },
          { id: 'goals', label: '4. Goals', count: goalIds.length },
          { id: 'projects', label: '5. Projects', count: projectIds.length },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === tab.id 
                ? `${accentClasses.activeTab} border` 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[9px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SECTION 1: REQUIRED SYSTEM LEVEL */}
      {(activeSubTab === 'all' || activeSubTab === 'level') && (
        <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              1. REQUIRED OPERATOR SYSTEM LEVEL
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">
              {systemLevel <= 1 ? 'Available at Level 1 (No level restriction)' : `Requires Operator Level ${systemLevel}+`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="range"
              min="1"
              max="50"
              value={systemLevel}
              onChange={e => setSystemLevel(Number(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[10px]">Level:</span>
              <input 
                type="number"
                min="1"
                max="100"
                value={systemLevel}
                onChange={e => setSystemLevel(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 bg-black border border-white/20 rounded px-2 py-1 text-white font-bold text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: RELATED QUESTS & REQUIRED STREAKS */}
      {(activeSubTab === 'all' || activeSubTab === 'quests') && (
        <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              2. REQUIRED QUESTS & MINIMUM STREAK DAYS
            </label>
            <select
              onChange={e => {
                const qId = e.target.value;
                if (!qId) return;
                if (!questReqs.some(q => q.questId === qId)) {
                  setQuestReqs(prev => [...prev, { questId: qId, minStreak: 0, requireCompleted: true }]);
                }
                e.target.value = '';
              }}
              className="bg-black border border-white/20 rounded px-2.5 py-1 text-white text-[10px] cursor-pointer hover:border-amber-400"
            >
              <option value="">+ Add Quest Condition...</option>
              {state.quests.map(q => (
                <option key={q.id} value={q.id}>
                  {q.name} [{q.status}] ({q.difficulty})
                </option>
              ))}
            </select>
          </div>

          {questReqs.length > 0 ? (
            <div className="space-y-1.5">
              {questReqs.map(qReq => {
                const quest = state.quests.find(x => x.id === qReq.questId);
                return (
                  <div 
                    key={qReq.questId} 
                    className="flex flex-wrap items-center justify-between gap-2 bg-black/70 px-3 py-2 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-[160px] truncate">
                      <span className="text-amber-400 font-bold">🎯</span>
                      <span className="font-bold text-white truncate">
                        {quest ? quest.name : 'Linked Quest'}
                      </span>
                      {quest && (
                        <span className="text-[9px] text-zinc-400 bg-white/5 px-1.5 py-0.2 rounded">
                          {quest.difficulty} • {quest.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <span>Required Streak:</span>
                        <input 
                          type="number"
                          min="0"
                          max="365"
                          value={qReq.minStreak || 0}
                          onChange={e => {
                            const streak = Math.max(0, Number(e.target.value) || 0);
                            setQuestReqs(prev => prev.map(x => x.questId === qReq.questId ? { ...x, minStreak: streak } : x));
                          }}
                          className="w-12 bg-black border border-white/20 rounded px-1 text-center text-white font-bold"
                        />
                        <span>days</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setQuestReqs(prev => prev.filter(x => x.questId !== qReq.questId))}
                        className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition cursor-pointer"
                        title="Remove Quest Condition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-zinc-500 bg-black/30 p-2.5 rounded border border-white/5">
              No specific quest conditions selected. Select a quest from the dropdown above to require its completion or streak.
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: RELATED SKILLS + REQUIRED MIN LEVEL */}
      {(activeSubTab === 'all' || activeSubTab === 'skills') && (
        <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              3. REQUIRED SKILLS & MINIMUM PROFICIENCY LEVEL
            </label>
            <span className="text-[10px] text-zinc-400">
              Click skill to toggle requirement
            </span>
          </div>

          <div className="flex flex-wrap gap-2 bg-black/50 p-2.5 rounded-lg border border-white/10">
            {state.skills.map(s => {
              const existing = skillReqs.find(sr => sr.skillId === s.id);
              const isSelected = !!existing;

              return (
                <div 
                  key={s.id}
                  className={`p-1.5 rounded-md border flex items-center gap-2 text-[10px] transition ${
                    isSelected 
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200' 
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-800'
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
                    className="font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    )}
                    <span>{s.name}</span>
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
                          const minLvl = Math.max(1, Number(e.target.value) || 1);
                          setSkillReqs(prev => prev.map(x => x.skillId === s.id ? { ...x, minLevel: minLvl } : x));
                        }}
                        className="w-10 bg-black border border-white/30 rounded px-1 py-0.5 text-center text-white font-bold"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: RELATED GOALS */}
      {(activeSubTab === 'all' || activeSubTab === 'goals') && (
        <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 space-y-2">
          <label className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            4. RELATED STRATEGIC GOALS (ACTIVE OR COMPLETED)
          </label>
          <div className="flex flex-wrap gap-1.5 bg-black/50 p-2.5 rounded-lg border border-white/10">
            {state.goals.length === 0 && (
              <span className="text-[10px] text-zinc-500">No active goals configured in System.</span>
            )}
            {state.goals.map(g => {
              const isSelected = goalIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGoalIds(prev => isSelected ? prev.filter(id => id !== g.id) : [...prev, g.id]);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] border flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 font-bold' 
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <Target className="h-3 w-3" />
                  <span>{g.name}</span>
                  {isSelected && <Check className="h-3 w-3 ml-0.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: RELATED PROJECTS */}
      {(activeSubTab === 'all' || activeSubTab === 'projects') && (
        <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 space-y-2">
          <label className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5 text-purple-400" />
            5. RELATED PROJECTS (ACTIVE OR COMPLETED)
          </label>
          <div className="flex flex-wrap gap-1.5 bg-black/50 p-2.5 rounded-lg border border-white/10">
            {state.projects.length === 0 && (
              <span className="text-[10px] text-zinc-500">No active projects configured in System.</span>
            )}
            {state.projects.map(p => {
              const isSelected = projectIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProjectIds(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] border flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 font-bold' 
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <FolderGit2 className="h-3 w-3" />
                  <span>{p.name}</span>
                  {isSelected && <Check className="h-3 w-3 ml-0.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
