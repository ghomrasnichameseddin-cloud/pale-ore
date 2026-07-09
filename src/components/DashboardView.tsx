import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Shield, Flame, Clock, Swords, CheckSquare, Square,
  ShieldAlert, Activity, ChevronRight, Check, Award, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  onNavigate?: (tab: 'dashboard' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system' | 'quests') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    state, toggleRecoveryMode, updateProfileFocus, getPlayerLevelInfo, getAnalytics, completeQuest,
    isQuestFinishedForToday
  } = usePOS();

  const [focusText, setFocusText] = useState(state.profile.currentFocus);
  const [focusGoal, setFocusGoal] = useState(state.profile.focusGoalId || '');
  const [isEditingFocus, setIsEditingFocus] = useState(false);

  const levelInfo = getPlayerLevelInfo();
  const analytics = getAnalytics();
  const activeQuests = state.quests.filter(q => q.status === 'Active' && !isQuestFinishedForToday(q));

  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileFocus(focusText, focusGoal ? focusGoal : null);
    setIsEditingFocus(false);
  };

  return (
    <div className="space-y-6" id="dashboard-view-root">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            Progression Terminal
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            SYS_TIME: {new Date().toLocaleTimeString()} • GROUNDED IN EVIDENCE
          </p>
        </div>

        {/* Recovery Protocol Button */}
        <button 
          onClick={toggleRecoveryMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-all duration-300 ${
            state.profile.recoveryMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20'
          }`}
          id="toggle-recovery-mode"
        >
          <Shield className={`h-4 w-4 ${state.profile.recoveryMode ? 'text-amber-400 animate-pulse' : ''}`} />
          {state.profile.recoveryMode ? 'RECOVERY MODE ACTIVE' : 'RECOVERY MODE INACTIVE'}
        </button>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CORE STATS & IMMEDIATE OPERATIONS SUMMARY */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="glass-panel rounded-lg p-6 relative overflow-hidden" id="profile-card">
            {/* Background vector accents */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">PLAYER SIGNATURE</span>
                <h3 className="font-display text-3xl font-extrabold text-white mt-1 uppercase tracking-tight">
                  {state.profile.recoveryMode ? 'RECOVERING_OPERATOR' : 'SOLE_PROGRESSOR'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-zinc-500">POS RANK</span>
                <p className="text-lg font-display font-bold text-cyan-400 tracking-wide uppercase mt-0.5">
                  {levelInfo.rank}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
              {/* Level indicator */}
              <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">SYS_LEVEL</span>
                <span className="text-3xl font-display font-bold text-white mt-2">LVL {levelInfo.level}</span>
              </div>

              {/* XP progress */}
              <div className="bg-white/[0.02] border border-white/5 rounded p-3 md:col-span-2 flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>ACCUMULATED_XP</span>
                  <span className="text-cyan-400 font-bold">{levelInfo.totalXp} XP</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-500" 
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>{levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForNextLevel} XP</span>
                    <span>{levelInfo.xpUntilNextLevel} XP TO LVL {levelInfo.level + 1}</span>
                  </div>
                </div>
              </div>

              {/* Momentum Indicator */}
              <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase">
                  <span>MOMENTUM</span>
                  <Flame className={`h-3 w-3 ${state.profile.momentum > 50 ? 'text-orange-400 animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div className="text-2xl font-display font-bold text-white mt-1">
                  {state.profile.momentum}%
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden mt-2">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      state.profile.momentum > 75 ? 'bg-orange-500' : state.profile.momentum > 40 ? 'bg-cyan-500' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${state.profile.momentum}%` }}
                  />
                </div>
              </div>
            </div>

            {state.profile.momentum < 40 && (
              <div className="mt-4 p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-lg flex items-center gap-2.5 text-[10px] font-mono text-rose-400 animate-pulse">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                <span>WARNING: DEBUFF_ACTIVE [SLUGGISH] - PRODUCTIVITY MOMENTUM CRITICAL. CORE REWARDS NOMINALLY REDUCED.</span>
              </div>
            )}
          </div>

          {/* COMPACT ACTIVE DIRECTIVES SUMMARY */}
          <div className="glass-panel rounded-lg p-5 space-y-4" id="dashboard-active-directives">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Operational Directives Board
                </h3>
              </div>
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('quests')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  FULL TERMINAL <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {activeQuests.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-zinc-400 font-sans">
                  No active operational objectives found.
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  All systems operating nominal. Create or activate a quest.
                </p>
                {onNavigate && (
                  <button 
                    onClick={() => onNavigate('quests')}
                    className="mt-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-4 py-2 rounded transition-all"
                  >
                    DEPLOY_NEW_QUEST
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeQuests.slice(0, 5).map((quest) => (
                  <div 
                    key={quest.id}
                    className="p-3 bg-zinc-950/60 border border-white/5 rounded-lg flex items-center justify-between gap-3 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button 
                        onClick={() => completeQuest(quest.id)}
                        className="text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                        title="Mark Complete"
                      >
                        <Square className="h-5 w-5" />
                      </button>
                      <div className="min-w-0">
                        <span className="text-xs font-sans font-medium text-white block truncate">
                          {quest.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-white/5 px-1 py-0.2 rounded uppercase">
                            {quest.type}
                          </span>
                          <span className={`text-[9px] font-mono px-1 py-0.2 rounded uppercase ${
                            quest.difficulty === 'Easy' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/15' :
                            quest.difficulty === 'Normal' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/15' :
                            quest.difficulty === 'Hard' ? 'bg-amber-950/30 text-amber-400 border border-amber-500/15' :
                            'bg-rose-950/30 text-rose-400 border border-rose-500/15 animate-pulse font-bold'
                          }`}>
                            {quest.difficulty}
                          </span>
                          {quest.estimatedTime && (
                            <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {quest.estimatedTime}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400">+{quest.xp} XP</span>
                    </div>
                  </div>
                ))}

                {activeQuests.length > 5 && (
                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-zinc-500 font-mono">
                      ...AND {activeQuests.length - 5} MORE ACTIVE DIRECTIVES HELD IN QUEUE.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: WORKLOAD ANALYTICS & CURRENT FOCUS */}
        <div className="space-y-6">
          
          {/* CURRENT FOCUS CARD */}
          <div className="glass-panel rounded-lg p-5" id="current-focus-card">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">CURRENT_FOCUS</span>
              {!isEditingFocus && (
                <button 
                  onClick={() => setIsEditingFocus(true)}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white underline transition-colors"
                >
                  MODIFY
                </button>
              )}
            </div>

            {isEditingFocus ? (
              <form onSubmit={handleSaveFocus} className="space-y-3">
                <input 
                  type="text" 
                  value={focusText}
                  onChange={(e) => setFocusText(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  required
                />
                
                <select 
                  value={focusGoal}
                  onChange={(e) => setFocusGoal(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="">No Associated Goal</option>
                  {state.goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>

                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingFocus(false)}
                    className="text-[10px] font-mono text-zinc-500 px-2 py-1"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-3 py-1 rounded hover:bg-cyan-900"
                  >
                    SAVE
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-sans font-medium text-white leading-relaxed">
                  "{state.profile.currentFocus || 'Define your primary focus core directive.'}"
                </p>
                {state.profile.focusGoalId && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-zinc-500">🎯 LINKED TO:</span>
                    <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[200px]">
                      {state.goals.find(g => g.id === state.profile.focusGoalId)?.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TODAY'S WORKLOAD BLOCK */}
          <div className="glass-panel rounded-lg p-5 space-y-4" id="workload-panel">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider border-b border-white/5 pb-2">
              RESOURCE_WORKLOAD_REPORT
            </h4>

            <div className="space-y-4">
              {/* Today's Goal Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">CYCLE PROGRESS RATE</span>
                  <span className="text-white">{analytics.overallCompletionRate}%</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1">
                  <div 
                    className="bg-cyan-500 h-full rounded-full" 
                    style={{ width: `${analytics.overallCompletionRate}%` }}
                  />
                </div>
              </div>

              {/* Today's Skill XP */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">CYCLE EARNED XP</span>
                <span className="text-emerald-400 font-bold">+{analytics.todayXp} XP</span>
              </div>

              {/* Total active count */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">ACTIVE DIRECTIVES</span>
                <span className="text-white">{activeQuests.length}</span>
              </div>

              {/* Est XP Pending */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">ESTIMATED_PENDING_XP</span>
                <span className="text-cyan-400">
                  {activeQuests.reduce((sum, q) => sum + q.xp, 0)} XP
                </span>
              </div>

              {/* Estimated Time */}
              <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                <span className="text-zinc-500">ESTIMATED TIME BUDGET</span>
                <span className="text-white flex items-center gap-1">
                  <Clock className="h-3 w-3 text-zinc-400" />
                  {Math.round(analytics.totalActiveTime / 60 * 10) / 10} Hours
                </span>
              </div>

              {/* Workload Status Gauge */}
              <div className="p-3 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">SYSTEM_WORKLOAD</span>
                  <span className={`text-xs font-display font-bold uppercase mt-1 block ${
                    analytics.workloadStatus === 'Heavy Workload' ? 'text-rose-400' :
                    analytics.workloadStatus === 'Moderate Workload' ? 'text-amber-400' :
                    analytics.workloadStatus === 'No Workload' ? 'text-zinc-500' : 'text-emerald-400'
                  }`}>
                    {analytics.workloadStatus}
                  </span>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${
                  analytics.workloadStatus === 'Heavy Workload' ? 'bg-rose-500 animate-ping' :
                  analytics.workloadStatus === 'Moderate Workload' ? 'bg-amber-500' :
                  analytics.workloadStatus === 'No Workload' ? 'bg-zinc-700' : 'bg-emerald-500'
                }`} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
