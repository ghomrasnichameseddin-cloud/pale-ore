import React from 'react';
import { motion } from 'motion/react';
import { Crown, Swords, ShieldAlert, ArrowRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { usePOS } from '../POSContext';
import { PlayerLevelInfo } from '../types';

interface BossProgressionBannerProps {
  onNavigateToQuests?: () => void;
  onOpenGuide?: (section?: string) => void;
}

export const BossProgressionBanner: React.FC<BossProgressionBannerProps> = ({
  onNavigateToQuests,
  onOpenGuide
}) => {
  const { state, getPlayerLevelInfo } = usePOS();
  const levelInfo: PlayerLevelInfo = getPlayerLevelInfo();

  // If level < 10 and not capped, we don't show the warning banner, or show a subtle info
  const isIntermediateOrHigher = levelInfo.level >= 10 || (levelInfo.unlockedLevel && levelInfo.unlockedLevel >= 10);
  const isCapped = levelInfo.isLevelCappedByBoss;

  if (!isIntermediateOrHigher) {
    return null;
  }

  // Find active Boss Quests if any
  const activeBossQuests = state.quests.filter(
    q => (q.difficulty === 'Boss' || q.type === 'Boss') && q.status !== 'Completed' && !q.archived
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isCapped
          ? 'bg-gradient-to-r from-rose-950/80 via-red-950/60 to-zinc-950 border-rose-500/50 shadow-[0_4px_25px_rgba(244,63,94,0.15)]'
          : 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-500/30'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isCapped 
              ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' 
              : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
          }`}>
            {isCapped ? <ShieldAlert className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                isCapped
                  ? 'bg-rose-950 text-rose-200 border-rose-500/50'
                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
              }`}>
                {isCapped ? '⚔️ INTERMEDIATE GATE: LEVEL PROGRESSION BLOCKED' : '⚔️ INTERMEDIATE SYSTEM RANK ACTIVE'}
              </span>

              <span className="text-[10px] font-mono text-zinc-400">
                Boss Quests Slain: {levelInfo.bossQuestsCompletedCount || 0} / {(levelInfo.level - 10) + (isCapped ? 1 : 0)}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-2">
              {isCapped ? (
                <span className="text-rose-200">
                  XP Threshold Reached! Slain Boss Quest Required to Advance to Level {levelInfo.level + 1}
                </span>
              ) : (
                <span className="text-zinc-200">
                  Rank {levelInfo.rank} (Level {levelInfo.level}) • Boss Trials Mandatory for Higher Ascension
                </span>
              )}
            </h4>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {isCapped
                ? 'From Intermediate Rank (Level 10+) onward, leveling up is locked until a Boss Directive (Boss Difficulty) is conquered. Slay a Boss Quest to shatter the level cap.'
                : 'Each level advancement beyond Level 10 requires at least one completed Boss Quest. Stay battle-ready!'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToQuests && (
            <button
              onClick={onNavigateToQuests}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-sm ${
                isCapped
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-black'
              }`}
            >
              <Swords className="h-4 w-4" />
              <span>{activeBossQuests.length > 0 ? `VIEW BOSS QUESTS (${activeBossQuests.length})` : 'FIND BOSS QUESTS'}</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              onClick={() => onOpenGuide('system-core')}
              className="px-2.5 py-2 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded-xl text-xs font-mono transition"
            >
              RULES
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
