import React, { useState, useEffect, useCallback } from 'react';
import { usePOS } from '../../POSContext';
import { AdhkarItem } from '../../types';
import { 
  Timer, Play, Pause, Square, SkipForward, Plus, Minus, 
  Check, X, Flame, Target, Award, RotateCcw, Moon, Sun,
  CheckCircle2, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface AdhkarFocusSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAdhkar?: AdhkarItem | null;
}

export const AdhkarFocusSessionModal: React.FC<AdhkarFocusSessionModalProps> = ({
  isOpen,
  onClose,
  initialAdhkar = null
}) => {
  const {
    state,
    systemDate,
    activeAdhkarFocusSession,
    startAdhkarFocusSession,
    pauseAdhkarFocusSession,
    resumeAdhkarFocusSession,
    stopAdhkarFocusSession,
    completeAdhkarFocusCycle,
    incrementAdhkarFocusCount,
    getAdhkarRecitationCount
  } = usePOS();

  const [selectedAdhkarId, setSelectedAdhkarId] = useState<string>('');
  const [workTime, setWorkTime] = useState(25);
  const [estimatedCycles, setEstimatedCycles] = useState(1);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // When opened with an initial adhkar, pre-select it
  useEffect(() => {
    if (initialAdhkar) {
      setSelectedAdhkarId(initialAdhkar.id);
    }
  }, [initialAdhkar]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowCompletionScreen(false);
    }
  }, [isOpen]);

  // Session state
  const session = activeAdhkarFocusSession;
  const isRunning = session?.status === 'running';
  const isPaused = session?.status === 'paused';
  const isSessionActive = !!session;

  // Build the adhkar list from custom or default
  const adhkarList: AdhkarItem[] = (state.customAdhkar && state.customAdhkar.length > 0)
    ? state.customAdhkar
    : [];

  const selectedAdhkar = adhkarList.find(a => a.id === selectedAdhkarId);

  // Compute countdown display
  const totalDuration = session ? (session.mode === 'work' ? session.totalWorkTime * 60 : session.totalWorkTime * 60) : workTime * 60;
  const timeLeft = session ? session.timeLeft : workTime * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Get today's recitation count for selected adhkar
  const todayCount = selectedAdhkarId ? getAdhkarRecitationCount(selectedAdhkarId, systemDate) : 0;
  const todayTargetReached = todayCount >= (selectedAdhkar?.targetCount || 0);

  const handleStartSession = () => {
    if (!selectedAdhkar) return;
    startAdhkarFocusSession(selectedAdhkar, workTime, estimatedCycles);
  };

  const handleCompleteCycle = () => {
    completeAdhkarFocusCycle();
    // Check if session is complete
    const updated = activeAdhkarFocusSession;
    if (updated && updated.completedCycles >= updated.estimatedCycles) {
      setShowCompletionScreen(true);
    }
  };

  const handleStop = () => {
    if (window.confirm('End the adhkar focus session?')) {
      stopAdhkarFocusSession();
      onClose();
    }
  };

  const handleClose = () => {
    if (session) {
      stopAdhkarFocusSession();
    }
    setShowCompletionScreen(false);
    onClose();
  };

  // Progress toward overall target
  const targetProgress = session 
    ? Math.min(100, Math.round((session.currentCount / session.targetCount) * 100))
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel border border-[#c5a059]/40 bg-[#0b0d13] rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(197,160,89,0.18)] relative overflow-hidden max-h-[92vh] sm:max-h-none overflow-y-auto"
        id="adhkar-focus-modal"
      >
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-5 w-5" color="#c5a059" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-5 w-5" color="#c5a059" />

        {/* COMPLETION SCREEN */}
        <AnimatePresence>
          {showCompletionScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-[#0b0d13]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-t-2xl sm:rounded-2xl space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl"
              >
                <Award className="h-12 w-12 text-emerald-400" />
              </motion.div>

              <div className="text-center space-y-2">
                <h3 className="font-display text-2xl font-black text-white uppercase tracking-wide">
                  SACRED SESSION COMPLETE
                </h3>
                <p className="text-sm font-mono text-zinc-300">
                  You've completed {session?.completedCycles || 0} cycles of dhikr focus.
                </p>
                <div className="flex justify-center gap-6 text-xs font-mono mt-3">
                  <div className="text-center">
                    <span className="text-[#e5c875] text-lg font-bold block">{session?.currentCount || 0}</span>
                    <span className="text-zinc-400">/ {session?.targetCount || 0} Recitations</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[#e5c875] text-lg font-bold block">{session?.completedCycles || 0}</span>
                    <span className="text-zinc-400">Cycles Done</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCompletionScreen(false);
                  stopAdhkarFocusSession();
                  onClose();
                }}
                className="px-8 py-3 bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:brightness-110 text-[#07080c] font-mono font-black text-sm rounded-xl shadow-lg transition-all uppercase tracking-wider"
              >
                CLOSE SESSION
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#c5a059]/20 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#3a2e12] border border-[#c5a059]/40 rounded-xl">
              <RubElHizbIcon className="h-5 w-5 text-[#e5c875]" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                ADHKAR FOCUS RITE
              </h3>
              <p className="text-[10px] font-mono text-[#c5a059] tracking-wider font-bold">
                SACRED_CONCENTRATION_PROTOCOL
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NO SESSION: CONFIGURATION FORM */}
        {!isSessionActive ? (
          <div className="space-y-5">
            {/* Adhkar Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                Select Dhikr Protocol
              </label>
              <select
                value={selectedAdhkarId}
                onChange={(e) => {
                  setSelectedAdhkarId(e.target.value);
                  const adhkar = adhkarList.find(a => a.id === e.target.value);
                  if (adhkar) {
                    setEstimatedCycles(Math.max(1, Math.round(adhkar.targetCount / 10)));
                  }
                }}
                className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
              >
                <option value="">-- Choose a Sacred Litanie --</option>
                {adhkarList.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.targetCount}x target)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Adhkar Preview */}
            {selectedAdhkar && (
              <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 space-y-2">
                {selectedAdhkar.arabicText && (
                  <p dir="rtl" className="font-arabic text-base text-amber-100/90 text-right leading-loose">
                    {selectedAdhkar.arabicText}
                  </p>
                )}
                <p className="text-xs text-zinc-300">{selectedAdhkar.translation}</p>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#e5c875]">Target: {selectedAdhkar.targetCount}x</span>
                  <span className={todayTargetReached ? 'text-emerald-400' : 'text-zinc-400'}>
                    Today: {todayCount} / {selectedAdhkar.targetCount}
                  </span>
                </div>
              </div>
            )}

            {/* Timer Duration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                Focus Interval Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 25, 50].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setWorkTime(mins)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      workTime === mins
                        ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]'
                        : 'bg-[#07080c] border-[#c5a059]/20 text-zinc-400 hover:border-[#c5a059]/40'
                    }`}
                  >
                    <span className="font-mono text-sm font-bold block">{mins} MIN</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Duration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                Or Set Custom Duration
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={workTime}
                onChange={(e) => setWorkTime(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-lg p-2.5 text-sm font-mono text-white text-center focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Estimated Cycles */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">
                Estimated Cycles
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEstimatedCycles(Math.max(1, estimatedCycles - 1))}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-mono text-xl font-bold text-white flex-1 text-center">{estimatedCycles}</span>
                <button
                  onClick={() => setEstimatedCycles(Math.min(20, estimatedCycles + 1))}
                  className="h-9 w-9 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059]/40 border border-[#c5a059]/40 text-[#fef08a] flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-zinc-500 text-center">
                Each cycle = {workTime} min of focused dhikr recitation
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              disabled={!selectedAdhkar}
              className="w-full py-3 bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:brightness-110 text-[#07080c] font-mono font-black text-sm rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Flame className="h-4 w-4" />
              ENGAGE ADHKAR FOCUS RITE
            </button>
          </div>
        ) : (
          /* ACTIVE SESSION UI */
          <div className="space-y-5">
            {/* Session Target Badge */}
            <div className="bg-[#07080c] border border-[#c5a059]/25 p-3.5 rounded-xl text-center">
              <span className="text-[9px] font-mono text-[#c5a059] uppercase tracking-widest font-bold block">
                ACTIVE SACRED PROTOCOL
              </span>
              <h4 className="font-display text-sm font-bold text-white mt-1 truncate">
                {session.adhkarTitle}
              </h4>
              <div className="flex justify-center items-center gap-3 text-[10px] font-mono text-zinc-400 pt-1">
                <span>CYCLES: <strong className="text-[#e5c875]">{session.completedCycles} / {session.estimatedCycles}</strong></span>
                <span>•</span>
                <span>INTERVAL: <strong className="text-zinc-200">{session.totalWorkTime}m</strong></span>
              </div>
            </div>

            {/* Arabic Text Display */}
            {session.arabicText && (
              <div className="bg-[#07080c]/80 border border-[#c5a059]/30 rounded-xl p-4">
                <p dir="rtl" className="font-arabic text-lg text-amber-100/90 text-center leading-loose tracking-wide">
                  {session.arabicText}
                </p>
                {session.translation && (
                  <p className="text-xs text-zinc-400 text-center mt-2 italic">{session.translation}</p>
                )}
              </div>
            )}

            {/* Circular Timer */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-zinc-900" strokeWidth="5" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="transition-all duration-1000 stroke-[#e5c875]"
                  strokeWidth="5"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase border bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/40">
                  {session.mode === 'work' ? '🔥 RECITATION' : '☐ REST'}
                </span>
                <span className="font-display text-4xl font-black tracking-wider text-white">
                  {formattedTime}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                  {isRunning ? 'RUNNING' : isPaused ? 'PAUSED' : 'IDLE'}
                </span>
              </div>
            </div>

            {/* Recitation Counter */}
            <div className="bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-[#c5a059]" />
                  RECITATION COUNT
                </span>
                <span className="font-mono text-sm font-bold text-[#e5c875]">
                  {session.currentCount} / {session.targetCount}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/5 mb-3">
                <div
                  className="bg-gradient-to-r from-[#c5a059] to-[#fef08a] h-full transition-all duration-300"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>

              {/* Manual counter controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => incrementAdhkarFocusCount(-1)}
                  disabled={session.currentCount <= 0}
                  className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-lg transition cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <div className={`text-2xl font-mono font-extrabold ${
                    session.currentCount >= session.targetCount ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {session.currentCount}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">recitations</div>
                </div>
                <button
                  onClick={() => incrementAdhkarFocusCount(1)}
                  className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#fef08a] hover:brightness-110 text-[#07080c] flex items-center justify-center font-bold text-lg transition shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                </button>
              </div>

              <button
                onClick={() => incrementAdhkarFocusCount(session.targetCount - session.currentCount)}
                disabled={session.currentCount >= session.targetCount}
                className="w-full mt-3 py-2 bg-[#c5a059]/20 hover:bg-[#c5a059]/40 border border-[#c5a059]/30 text-[10px] font-mono text-[#fef08a] font-bold rounded-lg transition text-center disabled:opacity-40 cursor-pointer"
              >
                COMPLETE TARGET ({session.targetCount}x)
              </button>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-2">
              <button
                onClick={() => isRunning ? pauseAdhkarFocusSession() : resumeAdhkarFocusSession()}
                className={`px-5 py-2.5 font-mono font-bold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-black'
                    : 'bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] text-[#07080c] hover:brightness-110'
                }`}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'PAUSE' : 'RESUME'}
              </button>

              <button
                onClick={handleCompleteCycle}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <SkipForward className="h-4 w-4" />
                NEXT CYCLE
              </button>

              <button
                onClick={handleStop}
                className="px-5 py-2.5 bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-mono font-bold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Square className="h-4 w-4" />
                END SESSION
              </button>
            </div>

            {/* Tips */}
            {session.mode === 'work' && (
              <p className="text-[10px] font-mono text-zinc-500 text-center italic">
                💡 Track each dhikr recitation above. The timer marks your focused session window.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
