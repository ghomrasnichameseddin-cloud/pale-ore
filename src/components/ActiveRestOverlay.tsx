import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Pause, Play, X, RotateCcw, Sparkles, Coffee, 
  Minimize2, Maximize2, ShieldCheck, Heart, Moon
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { RubElHizbIcon } from './IslamicRpgDecorations';

const REST_CONTEMPLATIONS = [
  {
    quote: "Verily, your soul and your body have a sacred right over you.",
    source: "Hadith — Sahih al-Bukhari"
  },
  {
    quote: "Renew the vessels of your spirit, for a fatigued mind cannot wield sharp discernment.",
    source: "Adab al-Murīd"
  },
  {
    quote: "Rest with pure intention, so that your rising is for strategic elevation and worship.",
    source: "Imam al-Ghazali — Iḥyāʾ ʿUlūm al-Dīn"
  },
  {
    quote: "The Qaylulah (midday rest) empowers the servant for the nocturnal vigil.",
    source: "Sunnah Tradition"
  }
];

export const ActiveRestOverlay: React.FC = () => {
  const { 
    state, 
    stopActiveRestSession, 
    pauseActiveRestSession, 
    resumeActiveRestSession, 
    addTimeCredits 
  } = usePOS();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [contemplationIndex, setContemplationIndex] = useState(0);

  const session = state.activeRestSession;
  if (!session) return null;

  const minutes = Math.floor(session.remainingSeconds / 60);
  const seconds = session.remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const totalSeconds = session.totalMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - session.remainingSeconds) / totalSeconds) * 100));

  const handleEarlyFinish = () => {
    // Refund remaining unspent full minutes back to user leisure bank
    const refundMinutes = Math.floor(session.remainingSeconds / 60);
    if (refundMinutes > 0) {
      addTimeCredits(
        refundMinutes, 
        `Early Rest Conclusion: +${refundMinutes}m unspent rest refunded`,
        'manual_adjustment'
      );
    }
    stopActiveRestSession();
  };

  const cycleContemplation = () => {
    setContemplationIndex((prev) => (prev + 1) % REST_CONTEMPLATIONS.length);
  };

  const contemplation = REST_CONTEMPLATIONS[contemplationIndex];

  return (
    <div className="fixed z-50 pointer-events-none inset-0 flex items-end sm:items-center justify-center p-4">
      <AnimatePresence>
        {isMinimized ? (
          // MINIMIZED FLOATING PILL
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="pointer-events-auto bg-[#0b0d13]/95 border border-emerald-500/40 rounded-full px-4 py-2.5 shadow-[0_0_25px_rgba(16,185,129,0.25)] backdrop-blur-xl flex items-center gap-3"
            id="active-rest-minimized-pill"
          >
            <div className="relative flex items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping absolute" />
              <Moon className="h-4 w-4 text-emerald-300 relative" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>ACTIVE REST</span>
                {session.paused && <span className="text-amber-400 text-[9px] font-bold">[PAUSED]</span>}
              </span>
              <span className="text-sm font-mono font-black text-emerald-400">
                {timeFormatted}
              </span>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                onClick={session.paused ? resumeActiveRestSession : pauseActiveRestSession}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition"
                title={session.paused ? "Resume rest" : "Pause rest"}
              >
                {session.paused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-zinc-300" />}
              </button>

              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition"
                title="Expand"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleEarlyFinish}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
                title="Conclude rest & refund unspent time"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          // FULL SERENE DIALOG
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto w-full max-w-md bg-[#090b10] border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-2xl p-6 relative overflow-hidden"
            id="active-rest-full-modal"
          >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c5a059]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                    <RubElHizbIcon className="h-2.5 w-2.5 text-[#c5a059]" />
                    <span>SANCTUM ACTIVE REST CYCLE</span>
                  </span>
                  <h3 className="text-base font-serif font-bold text-zinc-100 tracking-wide">
                    {session.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition"
                  title="Minimize to floating pill"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleEarlyFinish}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition"
                  title="Conclude Rest Early"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Central Circular Progress & Timer */}
            <div className="py-8 flex flex-col items-center justify-center relative z-10">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-zinc-800/80"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-emerald-400 transition-all duration-1000 ease-linear"
                    strokeWidth="5"
                    strokeDasharray={276.46}
                    strokeDashoffset={276.46 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    {timeFormatted}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider text-zinc-400 mt-1 uppercase">
                    {session.paused ? 'PAUSED' : `${session.totalMinutes}m REST BLOCK`}
                  </span>
                </div>
              </div>

              {/* Contemplation Card */}
              <div 
                onClick={cycleContemplation}
                className="mt-6 p-4 rounded-xl bg-[#121622]/90 border border-white/5 hover:border-emerald-500/30 text-center cursor-pointer transition group relative max-w-sm"
                title="Click for next reflection"
              >
                <p className="text-xs text-zinc-300 italic font-serif leading-relaxed">
                  "{contemplation.quote}"
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#c5a059] flex items-center justify-center gap-1.5">
                  <span>— {contemplation.source}</span>
                  <Sparkles className="h-3 w-3 opacity-60 group-hover:opacity-100 transition" />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between relative z-10">
              <div className="text-[11px] font-mono text-zinc-400">
                <span>Guilt-Free Rest Currency Spent: </span>
                <span className="text-emerald-400 font-bold">{session.totalMinutes}m</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={session.paused ? resumeActiveRestSession : pauseActiveRestSession}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition border ${
                    session.paused
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-white/5 text-zinc-200 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {session.paused ? (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-400" />
                      <span>RESUME</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5 text-zinc-400" />
                      <span>PAUSE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleEarlyFinish}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition flex items-center gap-1.5"
                  title="Refund unused minutes"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>CONCLUDE</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
