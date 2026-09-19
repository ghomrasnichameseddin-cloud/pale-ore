import React from 'react';
import { motion } from 'motion/react';
import { Crown, Swords, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';
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
  const { state, getPlayerLevelInfo, forgeLevelUpBossQuest } = usePOS();
  const levelInfo: PlayerLevelInfo = getPlayerLevelInfo();

  // The gate requirement is strictly decoupled from the calendar and scheduled quests.
  // It only manifests when the operator's XP has reached an intermediate gate (Level 10, 20, 30...)
  // and advancement is capped until a dedicated Level-Up Boss Quest is slain.
  const isCapped = Boolean(levelInfo.isLevelCappedByBoss);
  const activeReq = levelInfo.activeRequirement;
  const threshold = levelInfo.levelUpThreshold || activeReq?.thresholdLevel || levelInfo.level;
  
  // Show the banner if capped by boss, or if an active level-up gate requirement is unsealed
  if (!isCapped && (!activeReq || !activeReq.active)) {
    return null;
  }

  const completedCount = activeReq ? activeReq.completedCount : (levelInfo.bossQuestsCompletedCount || 0);
  const requiredCount = activeReq ? activeReq.requiredCount : (levelInfo.bossQuestsRequiredCount || 1);
  const remainingCount = Math.max(0, requiredCount - completedCount);

  // Filter specifically for dedicated Level-Up Boss Quests (distinct from weekly/scheduled bosses)
  const activeLevelUpBosses = state.quests.filter(
    q => q.isLevelUpBoss && q.status === 'Active' && !q.archived
  );

  const handleForgeBoss = () => {
    forgeLevelUpBossQuest(threshold);
    if (onNavigateToQuests) {
      onNavigateToQuests();
    }
  };

  const handleViewBossQuests = () => {
    try {
      const raw = localStorage.getItem('pale_ore_quest_view_settings');
      const parsed = raw ? JSON.parse(raw) : {};
      const updated = {
        ...parsed,
        terminalTab: 'week',
        categoryFilter: 'Boss'
      };
      localStorage.setItem('pale_ore_quest_view_settings', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving quest view settings:', e);
    }

    window.dispatchEvent(new CustomEvent('set-quest-view-settings', {
      detail: { terminalTab: 'week', categoryFilter: 'Boss' }
    }));

    if (onNavigateToQuests) {
      onNavigateToQuests();
    }

    setTimeout(() => {
      const el = document.getElementById('quests-list-container') || document.getElementById('directives-terminal') || document.getElementById('quests-view-root');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      id="boss-progression-banner"
      className="p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-xl"
      style={{
        backgroundColor: 'var(--bg-card, #0c0e14)',
        borderColor: isCapped ? 'var(--accent-bright, #e5c875)' : 'var(--border-accent, rgba(197,160,89,0.3))',
        boxShadow: isCapped 
          ? '0 0 30px var(--glow-color, rgba(197,160,89,0.25)), inset 0 0 15px var(--glow-color, rgba(197,160,89,0.1))'
          : '0 4px 20px var(--glow-color, rgba(197,160,89,0.1))'
      }}
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'var(--accent-primary, #c5a059)' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: 'var(--accent-highlight, #fef08a)' }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div 
            className={`p-3 rounded-xl border shrink-0 transition-all ${
              isCapped ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: 'var(--accent-surface, rgba(197,160,89,0.15))',
              borderColor: 'var(--border-strong, #c5a059)',
              color: 'var(--accent-highlight, #fef08a)'
            }}
          >
            {isCapped ? <ShieldAlert className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span 
                className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase border tracking-wider"
                style={{
                  backgroundColor: 'var(--accent-surface, rgba(197,160,89,0.12))',
                  borderColor: 'var(--border-accent, rgba(197,160,89,0.3))',
                  color: 'var(--accent-highlight, #fef08a)'
                }}
              >
                {isCapped ? `⚔️ LEVEL-UP GATE: LEVEL ${threshold} ASCENSION BOND` : `⚔️ LEVEL ${threshold} GATE UNSEALED`}
              </span>

              <span className="text-[10px] font-mono text-zinc-300">
                Gate Bosses Slain: <strong className="text-[var(--accent-bright,#e5c875)]">{completedCount}</strong> / {requiredCount}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-2">
              {isCapped ? (
                <span style={{ color: 'var(--accent-highlight, #fef08a)' }}>
                  Level {threshold} → Level {threshold + 1} requires {requiredCount} Gate Boss Quest{requiredCount > 1 ? 's' : ''} to ascend
                </span>
              ) : (
                <span className="text-zinc-100">
                  Level {threshold} → Level {threshold + 1} unsealed! All {requiredCount} Gate Boss Quest{requiredCount > 1 ? 's' : ''} conquered.
                </span>
              )}
            </h4>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
              {isCapped
                ? `System advancement is held at Level ${threshold}. Slay ${remainingCount} Level-Up Boss Quest${remainingCount > 1 ? 's' : ''} to shatter the gate and unleash earned XP.`
                : `Gate at Level ${threshold} shattered! Continue ascending — the next gate awaits at Level ${threshold + 10}.`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isCapped && activeLevelUpBosses.length === 0 && (
            <button
              onClick={handleForgeBoss}
              id="btn-forge-level-up-boss"
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 cursor-pointer border"
              style={{
                backgroundColor: 'var(--accent-bright, #e5c875)',
                borderColor: 'var(--border-strong, #e5c875)',
                color: 'var(--bg-void, #050608)'
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span>MANIFEST GATE BOSS</span>
            </button>
          )}

          <button
            onClick={handleViewBossQuests}
            id="btn-view-boss-quests"
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 cursor-pointer border"
            style={{
              backgroundColor: 'var(--accent-primary, #c5a059)',
              borderColor: 'var(--border-strong, #e5c875)',
              color: 'var(--bg-void, #050608)'
            }}
          >
            <Swords className="h-4 w-4" />
            <span>
              {activeLevelUpBosses.length > 0 
                ? `GATE BOSS DIRECTIVES (${activeLevelUpBosses.length})` 
                : 'VIEW BOSS QUESTS'}
            </span>
          </button>

          {onOpenGuide && (
            <button
              onClick={() => onOpenGuide('system-core')}
              className="px-3 py-2 bg-[var(--bg-void)] hover:bg-[var(--accent-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition cursor-pointer"
            >
              RULES
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
