import React from 'react';
import { motion } from 'motion/react';
import { Crown, Swords, ShieldAlert } from 'lucide-react';
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

  // The bond only appears at intermediate gate levels (10, 20, 30, 40, ...)
  // The player is AT the gate when their effective (visible) level equals the next gate level
  const nextGate = levelInfo.nextGateLevel ?? 10;
  const isAtGate = levelInfo.level === nextGate;
  const isCapped = levelInfo.isLevelCappedByBoss;

  // Show the bond only when the player is at an intermediate gate level
  // (reached lvl 10, 20, 30... and needs boss quests to advance)
  if (!isAtGate) {
    return null;
  }

  // Find active Boss Quests if any
  const activeBossQuests = state.quests.filter(
    q => (q.difficulty === 'Boss' || q.type === 'Boss') && q.status !== 'Completed' && !q.archived
  );

  const handleViewBossQuests = () => {
    // 1. Persist view settings to week view & Boss category filter
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

    // 2. Dispatch custom event so active instance updates immediately
    window.dispatchEvent(new CustomEvent('set-quest-view-settings', {
      detail: { terminalTab: 'week', categoryFilter: 'Boss' }
    }));

    // 3. Call navigation callback to navigate to quests view / directives & rhythms
    if (onNavigateToQuests) {
      onNavigateToQuests();
    }

    // 4. Smooth scroll to directives terminal
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
      {/* Background ambient lighting from active Visual Codex */}
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
                {isCapped ? '⚔️ INTERMEDIATE GATE: LEVEL ADVANCEMENT BOND' : '⚔️ INTERMEDIATE GATE UNSEALED'}
              </span>

              <span className="text-[10px] font-mono text-zinc-300">
                              Boss Quests Slain: <strong className="text-[var(--accent-bright,#e5c875)]">{levelInfo.bossQuestsCompletedCount || 0}</strong> / {levelInfo.bossQuestsRequiredCount || 0}
                            </span>
            </div>

            <h4 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-2">
              {isCapped ? (
                <span style={{ color: 'var(--accent-highlight, #fef08a)' }}>
                  Level {levelInfo.level} → Level {levelInfo.level + 1} requires {(levelInfo.bossQuestsRequiredCount || 1)} Boss Quest{((levelInfo.bossQuestsRequiredCount || 1) > 1) ? 's' : ''} to be Slain
                </span>
              ) : (
                <span className="text-zinc-100">
                  Level {levelInfo.level} → Level {levelInfo.level + 1} unsealed! All {(levelInfo.bossQuestsRequiredCount || 1)} Boss Quest{((levelInfo.bossQuestsRequiredCount || 1) > 1) ? 's' : ''} conquered.
                </span>
              )}
            </h4>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-3xl">
              {isCapped
                ? `Intermediate gate at Level ${levelInfo.level} sealed. Slay ${(levelInfo.bossQuestsRequiredCount || 1) - (levelInfo.bossQuestsCompletedCount || 0)} more Boss Quest${((levelInfo.bossQuestsRequiredCount || 1) - (levelInfo.bossQuestsCompletedCount || 0) > 1) ? 's' : ''} to shatter the bond and advance to Level ${levelInfo.level + 1}.`
                : `Gate at Level ${levelInfo.level} shattered! Level ${levelInfo.level + 1} unlocked. Continue ascending — the next gate awaits at Level ${(levelInfo.level + 10)}.`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            <span>{activeBossQuests.length > 0 ? `VIEW BOSS QUESTS (${activeBossQuests.length})` : 'VIEW WEEK BOSS QUESTS'}</span>
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
