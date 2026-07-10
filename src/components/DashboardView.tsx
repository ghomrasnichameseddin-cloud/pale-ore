import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Shield, Flame, Clock, Swords, CheckSquare, Square,
  ShieldAlert, Activity, ChevronRight, Check, Award, Compass,
  Sliders, Timer, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  onNavigate?: (tab: 'dashboard' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system' | 'quests') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    state, toggleRecoveryMode, updateProfileFocus, getPlayerLevelInfo, getAnalytics, completeQuest,
    isQuestFinishedForToday, processQuestReview
  } = usePOS();

  const [focusText, setFocusText] = useState(state.profile.currentFocus);
  const [focusGoal, setFocusGoal] = useState(state.profile.focusGoalId || '');
  const [isEditingFocus, setIsEditingFocus] = useState(false);

  const levelInfo = getPlayerLevelInfo();
  const analytics = getAnalytics();
  const activeQuests = state.quests.filter(q => q.status === 'Active' && !isQuestFinishedForToday(q));
  
  const frogOfTheDay = activeQuests.find(q => q.important) || 
                       (activeQuests.length > 0 ? [...activeQuests].sort((a, b) => b.xp - a.xp)[0] : null);
  const overdueQuests = activeQuests;

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

            {/* Strategy 4: Focus HUD stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="bg-white/[0.01] border border-white/5 rounded p-2.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">FOCUS MINUTES TODAY</span>
                <span className="text-md font-sans font-bold text-white mt-1 flex items-center gap-1.5">
                  🧘 {state.profile.focusMinutesToday || 0}m
                </span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded p-2.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">FOCUS STREAK</span>
                <span className="text-md font-sans font-bold text-amber-400 mt-1 flex items-center gap-1.5 animate-pulse">
                  🔥 {state.profile.focusStreak || 0} Days
                </span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded p-2.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">EAT_FROG BOOST</span>
                <span className="text-md font-sans font-bold text-cyan-400 mt-1">
                  ⚡ 1.2x XP
                </span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded p-2.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">OPTIMIZED MODE</span>
                <span className="text-md font-sans font-bold text-emerald-400 mt-1 uppercase">
                  ACTIVE
                </span>
              </div>
            </div>

            {state.profile.momentum < 40 && (
              <div className="mt-4 p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-lg flex items-center gap-2.5 text-[10px] font-mono text-rose-400 animate-pulse">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                <span>WARNING: DEBUFF_ACTIVE [SLUGGISH] - PRODUCTIVITY MOMENTUM CRITICAL. CORE REWARDS NOMINALLY REDUCED.</span>
              </div>
            )}
          </div>

          {/* Strategy 1: Eat the Frog Priority Target */}
          {frogOfTheDay && (
            <div className="glass-panel rounded-lg p-5 border border-amber-500/20 bg-amber-950/5 relative overflow-hidden" id="frog-of-the-day-card">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-amber-500/30 uppercase">CRITICAL_PATH_NODE</div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      🐸 COGNITIVE PRIORITY // EAT THE FROG
                    </span>
                  </div>
                  <h4 className="text-sm font-sans font-extrabold text-white">
                    {frogOfTheDay.name}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {frogOfTheDay.description || 'No operational description logged.'}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono italic">
                    "If it's your job to eat a frog, it's best to do it first thing in the morning." — Mark Twain
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => completeQuest(frogOfTheDay.id)}
                    className="flex-1 md:flex-none px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded transition-colors uppercase flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" /> COMPLETE_FROG (+{frogOfTheDay.xp} XP)
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {/* Strategy 3: End of Day Review Terminal */}
          {overdueQuests.length > 0 && (
            <div className="glass-panel rounded-lg p-5 border border-purple-500/20 bg-zinc-950/45 relative overflow-hidden animate-fadeIn" id="eod-debrief-terminal">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(168,85,247,0.01)_1px,transparent_1px)] pointer-events-none bg-[size:100%_4px]" />
              <div className="flex justify-between items-center border-b border-purple-500/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <h3 className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                    EOD_CLEAN_SLATE_DEBRIEF // WORKLOAD_MITIGATION
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-500">SYS_CONSOLE v1.0</span>
              </div>
              
              <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">
                Review your remaining active load to protect system discipline. Avoid rollover debt!
              </p>
              
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {overdueQuests.map(q => (
                  <div key={q.id} className="p-3 bg-zinc-950 border border-white/5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-sans font-medium text-white block">{q.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">{q.type} • {q.difficulty}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => processQuestReview(q.id, 'rollover')}
                        className="flex-1 sm:flex-none px-2 py-1 bg-purple-950/45 hover:bg-purple-900/40 border border-purple-500/30 text-purple-400 text-[10px] font-mono rounded transition-colors uppercase"
                        title="Move to Tomorrow"
                      >
                        Rollover
                      </button>
                      <button
                        onClick={() => processQuestReview(q.id, 'postpone')}
                        className="flex-1 sm:flex-none px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-mono rounded transition-colors uppercase"
                        title="Remove Deadline (Queue)"
                      >
                        Defer
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Forgive this objective for today? No penalty will be activated.")) {
                            processQuestReview(q.id, 'forgive');
                          }
                        }}
                        className="flex-1 sm:flex-none px-2 py-1 bg-emerald-950/20 hover:bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded transition-colors uppercase"
                        title="Forgive & Clear"
                      >
                        Forgive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Strategy 5: Quick-Tap Daily Habit Lobby */}
          <div className="glass-panel rounded-lg p-5 space-y-4" id="habit-lobby-panel">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">⚡ DAILY_HABITS_LOBBY</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">QUICK TAP TOGGLE</span>
            </div>
            
            {state.quests.filter(q => q.type?.toLowerCase() === 'habit' || q.recurrence === 'Daily').length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono text-center py-2">
                No active daily habits registered.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {state.quests.filter(q => q.type?.toLowerCase() === 'habit' || q.recurrence === 'Daily').map(habit => {
                  const isFinished = isQuestFinishedForToday(habit);
                  return (
                    <div 
                      key={habit.id}
                      onClick={() => {
                        if (!isFinished) {
                          completeQuest(habit.id);
                        }
                      }}
                      className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                        isFinished 
                          ? 'bg-emerald-950/10 border-emerald-500/20 text-zinc-500' 
                          : 'bg-zinc-900 border-white/5 hover:border-cyan-500/30 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1 rounded-full shrink-0 ${isFinished ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-950 text-zinc-600'}`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={`text-xs font-sans font-medium truncate ${isFinished ? 'line-through text-zinc-500' : ''}`}>
                          {habit.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold shrink-0 ${isFinished ? 'text-emerald-500/40' : 'text-cyan-400'}`}>
                        {isFinished ? 'DONE' : `+${habit.xp} XP`}
                      </span>
                    </div>
                  );
                })}
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
