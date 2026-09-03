import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Timer, Play, Pause, Square, SkipForward, Plus, Minus, 
  Check, Maximize2, Minimize2, X, Flame, Award, Swords, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

interface FocusTimerOverlayProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const FocusTimerOverlay: React.FC<FocusTimerOverlayProps> = ({ isOpenModal, onCloseModal }) => {
  const { 
    state, activeFocusSession, startFocusSession, pauseFocusSession, 
    resumeFocusSession, stopFocusSession, skipFocusStage, adjustFocusSessionTime,
    completeQuest, toggleSubQuest
  } = usePOS();

  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customRestTime, setCustomRestTime] = useState(5);
  const [customEstCycles, setCustomEstCycles] = useState(1);

  // Active session status
  const session = activeFocusSession;
  const isRunning = session?.status === 'running';

  // Compute countdown display
  const totalDuration = session ? (session.mode === 'work' ? session.totalWorkTime * 60 : session.totalRestTime * 60) : 1500;
  const timeLeft = session ? session.timeLeft : 1500;
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentQuest = session?.questId ? state.quests.find(q => q.id === session.questId) : null;

  const handleStartNewSession = (work: number, rest: number) => {
    startFocusSession(selectedQuestId || null, work, rest, customEstCycles);
  };

  // If no session is active and no modal requested, don't show the persistent widget
  if (!session && !isOpenModal) {
    return null;
  }

  return (
    <>
      {/* FLOATING COMPACT PILL WIDGET (When active session is running and minimized) */}
      {session && isMinimized && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-20 md:bottom-5 right-3 md:right-5 z-40 glass-panel border border-[#c5a059]/40 p-2.5 sm:p-3 rounded-xl shadow-[0_0_25px_rgba(197,160,89,0.25)] flex items-center gap-2.5 sm:gap-3 bg-[#0b0d13]/98 backdrop-blur-md max-w-[calc(100vw-24px)]"
          id="focus-compact-pill"
        >
          <button 
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className={`h-3 w-3 rounded-full ${session.mode === 'work' ? 'bg-[#e5c875]' : 'bg-emerald-400'} ${isRunning ? 'animate-ping' : ''}`} />
              <Timer className="h-5 w-5 text-[#c5a059] shrink-0" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-extrabold text-white tracking-widest">
                  {formattedTime}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  session.mode === 'work' ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {session.mode}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans truncate max-w-[140px]">
                {session.questName}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 pl-2 border-l border-[#c5a059]/20">
            {isRunning ? (
              <button 
                onClick={pauseFocusSession}
                className="p-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 rounded transition-colors cursor-pointer"
                title="Pause"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button 
                onClick={resumeFocusSession}
                className="p-1.5 bg-[#3a2e12] hover:bg-[#524119] border border-[#c5a059]/50 text-[#fef08a] rounded transition-colors cursor-pointer"
                title="Resume"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            )}

            <button 
              onClick={() => setIsMinimized(false)}
              className="p-1.5 text-zinc-400 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Expand Focus Terminal"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* FULL FOCUS TIMER MODAL OVERLAY */}
      {((session && !isMinimized) || isOpenModal) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel border border-[#c5a059]/40 bg-[#0b0d13] rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-xl w-full shadow-[0_0_50px_rgba(197,160,89,0.18)] relative space-y-4 sm:space-y-6 overflow-hidden max-h-[90vh] sm:max-h-none overflow-y-auto"
            id="focus-timer-modal"
          >
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-5 w-5" color="#c5a059" />
            <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-5 w-5" color="#c5a059" />

            {/* TOP MODAL HEADER */}
            <div className="flex justify-between items-center border-b border-[#c5a059]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#3a2e12] border border-[#c5a059]/40 rounded-xl">
                  <RubElHizbIcon className="h-5 w-5 text-[#e5c875] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    FOCUS RITE ENGINE
                  </h3>
                  <p className="text-[10px] font-mono text-[#c5a059] tracking-wider font-bold">
                    DEEP_CONCENTRATION_PROTOCOL • ISLAMIC RPG v4.0
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {session && (
                  <button 
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 text-zinc-400 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                    title="Minimize to Floating Pill"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">MINIMIZE</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (onCloseModal) onCloseModal();
                    if (session) setIsMinimized(true);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* IF SESSION IS ACTIVE */}
            {session ? (
              <div className="space-y-6 text-center">
                
                {/* ACTIVE DIRECTIVE BADGE */}
                <div className="bg-[#07080c] border border-[#c5a059]/25 p-3.5 rounded-xl space-y-1 inline-block w-full text-center">
                  <span className="text-[9px] font-mono text-[#c5a059] uppercase tracking-widest font-bold block">TARGET DIRECTIVE</span>
                  <h4 className="font-display text-base font-bold text-white truncate px-2">
                    {session.questName}
                  </h4>
                  <div className="flex justify-center items-center gap-3 text-[10px] font-mono text-zinc-400 pt-1">
                    <span>CYCLES: <strong className="text-[#e5c875]">{session.completedCycles} / {session.estimatedCycles}</strong></span>
                    <span>•</span>
                    <span>WORK: <strong className="text-zinc-200">{session.totalWorkTime}m</strong></span>
                    <span>•</span>
                    <span>REST: <strong className="text-zinc-200">{session.totalRestTime}m</strong></span>
                  </div>
                </div>

                {/* CIRCULAR TIMER DISPLAY */}
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-zinc-900"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`transition-all duration-1000 ${session.mode === 'work' ? 'stroke-[#e5c875]' : 'stroke-emerald-400'}`}
                      strokeWidth="5"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                      session.mode === 'work' ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {session.mode === 'work' ? '🔥 WORK INTERVAL' : '☕ REST BREAK'}
                    </span>
                    
                    <span className="font-display text-4xl md:text-5xl font-black tracking-wider text-white">
                      {formattedTime}
                    </span>

                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                      {isRunning ? 'RUNNING' : 'PAUSED'}
                    </span>
                  </div>
                </div>

                {/* TIMER CONTROLS BAR */}
                <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                  <button 
                    onClick={() => adjustFocusSessionTime(-5)}
                    className="p-2.5 bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/20 text-zinc-300 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Subtract 5 minutes"
                  >
                    <Minus className="h-3.5 w-3.5" /> 5M
                  </button>

                  {isRunning ? (
                    <button 
                      onClick={pauseFocusSession}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-sm rounded-lg transition-all flex items-center gap-2 uppercase shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
                    >
                      <Pause className="h-4 w-4" /> PAUSE
                    </button>
                  ) : (
                    <button 
                      onClick={resumeFocusSession}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] font-mono font-bold text-sm rounded-lg transition-all flex items-center gap-2 uppercase shadow-[0_0_20px_rgba(197,160,89,0.3)] cursor-pointer"
                    >
                      <Play className="h-4 w-4" /> RESUME
                    </button>
                  )}

                  <button 
                    onClick={() => adjustFocusSessionTime(5)}
                    className="p-2.5 bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/20 text-zinc-300 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Add 5 minutes"
                  >
                    <Plus className="h-3.5 w-3.5" /> 5M
                  </button>

                  <button 
                    onClick={skipFocusStage}
                    className="p-2.5 bg-[#07080c] hover:bg-[#141824] border border-[#c5a059]/20 text-[#e5c875] rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Skip Stage"
                  >
                    <SkipForward className="h-3.5 w-3.5 text-[#e5c875]" /> SKIP
                  </button>

                  <button 
                    onClick={() => {
                      if (window.confirm("Stop the active focus session?")) {
                        stopFocusSession();
                      }
                    }}
                    className="p-2.5 bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Stop Session"
                  >
                    <Square className="h-3.5 w-3.5" /> STOP
                  </button>
                </div>

                {/* TARGET QUEST SUBQUESTS CHECKLIST (IF AVAILABLE) */}
                {currentQuest && (
                  <div className="pt-4 border-t border-[#c5a059]/20 text-left space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400 uppercase">
                      <span className="font-bold flex items-center gap-1.5 text-[#e5c875]">
                        <Swords className="h-3.5 w-3.5 text-[#c5a059]" /> SUBQUEST EXECUTION CHECKLIST
                      </span>
                      <button 
                        onClick={() => completeQuest(currentQuest.id)}
                        className="text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded hover:bg-emerald-900 transition-colors uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> COMPLETE DIRECTIVE
                      </button>
                    </div>

                    {currentQuest.subquests && currentQuest.subquests.length > 0 ? (
                      <div className="space-y-1.5 bg-[#07080c] p-3 rounded-lg border border-[#c5a059]/15 max-h-[120px] overflow-y-auto">
                        {currentQuest.subquests.map(sq => (
                          <div 
                            key={sq.id} 
                            onClick={() => toggleSubQuest(currentQuest.id, sq.id)}
                            className="flex items-center gap-2 cursor-pointer text-xs font-sans text-zinc-300 hover:text-white"
                          >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              sq.completed ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]' : 'border-white/20'
                            }`}>
                              {sq.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                            <span className={sq.completed ? 'line-through text-zinc-500' : ''}>
                              {sq.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-mono text-zinc-500 italic">No subquests logged for this directive.</p>
                    )}
                  </div>
                )}

              </div>
            ) : (
              /* NO SESSION ACTIVE: LAUNCH NEW SESSION FORM & PRESETS */
              <div className="space-y-5">
                <span className="text-xs font-mono text-[#e5c875] uppercase tracking-wider font-bold block flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                  CONFIGURE NEW FOCUS SESSION
                </span>

                {/* SELECT DIRECTIVE */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                    Link to Quest Directive (Optional)
                  </label>
                  <select
                    value={selectedQuestId}
                    onChange={(e) => setSelectedQuestId(e.target.value)}
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
                  >
                    <option value="">-- General Standalone Deep Work Session --</option>
                    {state.quests.filter(q => q.status === 'Active').map(q => (
                      <option key={q.id} value={q.id}>
                        [{q.difficulty}] {q.name} ({q.estimatedTime || 30}m)
                      </option>
                    ))}
                  </select>
                </div>

                {/* QUICK PRESETS */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                    Select Interval Preset
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStartNewSession(25, 5)}
                      className="p-3 bg-[#07080c] hover:bg-[#3a2e12]/60 border border-[#c5a059]/20 hover:border-[#c5a059] rounded-lg text-center transition-all group cursor-pointer"
                    >
                      <span className="font-mono text-sm font-bold text-white block group-hover:text-[#fef08a]">25 / 5 MIN</span>
                      <span className="text-[9px] font-mono text-zinc-500 block">Classic Rite</span>
                    </button>

                    <button
                      onClick={() => handleStartNewSession(50, 10)}
                      className="p-3 bg-[#07080c] hover:bg-purple-950/60 border border-[#c5a059]/20 hover:border-purple-500/40 rounded-lg text-center transition-all group cursor-pointer"
                    >
                      <span className="font-mono text-sm font-bold text-white block group-hover:text-purple-300">50 / 10 MIN</span>
                      <span className="text-[9px] font-mono text-zinc-500 block">Deep Focus Block</span>
                    </button>

                    <button
                      onClick={() => handleStartNewSession(15, 3)}
                      className="p-3 bg-[#07080c] hover:bg-[#3a2e12]/60 border border-[#c5a059]/20 hover:border-[#c5a059] rounded-lg text-center transition-all group cursor-pointer"
                    >
                      <span className="font-mono text-sm font-bold text-white block group-hover:text-[#e5c875]">15 / 3 MIN</span>
                      <span className="text-[9px] font-mono text-zinc-500 block">Power Sprint</span>
                    </button>
                  </div>
                </div>

                {/* CUSTOM DURATIONS */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Work (Mins)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="180" 
                      value={customWorkTime}
                      onChange={(e) => setCustomWorkTime(Number(e.target.value))}
                      className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded p-2 text-xs font-mono text-white text-center focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Rest (Mins)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="60" 
                      value={customRestTime}
                      onChange={(e) => setCustomRestTime(Number(e.target.value))}
                      className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded p-2 text-xs font-mono text-white text-center focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Est. Cycles</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12" 
                      value={customEstCycles}
                      onChange={(e) => setCustomEstCycles(Number(e.target.value))}
                      className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded p-2 text-xs font-mono text-white text-center focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleStartNewSession(customWorkTime, customRestTime)}
                  className="w-full py-3 bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:from-[#9c7b32] hover:to-[#9c7b32] text-[#07080c] font-mono font-black text-sm rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.3)] cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" /> ENGAGE FOCUS RITE
                </button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </>
  );
};

