import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Shield, Sparkles, X, Moon, Flame, Droplets, CheckCircle2, ChevronRight, Award, Compass } from 'lucide-react';
import { usePOS } from '../POSContext';
import { getMaxHpForLevel } from '../POSContext';

interface SoulVitalityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShop?: () => void;
  onNavigateToMuhasabah?: () => void;
  onNavigateToPrayers?: () => void;
}

export const SoulVitalityGuideModal: React.FC<SoulVitalityGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToShop,
  onNavigateToMuhasabah,
  onNavigateToPrayers
}) => {
  const { state, healSpiritualHp } = usePOS();

  if (!isOpen) return null;

  const currentLevel = state.profile.level || 1;
  const baseMaxHpFromLevel = getMaxHpForLevel(currentLevel);
  const maxHp = Math.max(state.profile.maxHp ?? 100, baseMaxHpFromLevel);
  const hp = Math.min(maxHp, state.profile.hp ?? maxHp);
  const hpPercent = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
  const isDepleted = hp <= 25;
  const isFull = hp >= maxHp;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0b0d13] border border-[#c5a059]/40 rounded-2xl shadow-2xl overflow-hidden my-auto"
          id="soul-vitality-guide-modal"
        >
          {/* Top Decorative Border */}
          <div className="h-1 w-full bg-gradient-to-r from-[#c5a059]/20 via-[#c5a059] to-[#c5a059]/20" />

          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#07080c]/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Heart className="h-5 w-5 fill-rose-500/20" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base tracking-wide flex items-center gap-2">
                  SOUL VITALITY & HP PROGRESSION
                </h3>
                <p className="text-[11px] font-mono text-zinc-400">
                  Methods to regenerate, protect, and permanently increase Soul HP
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[calc(85vh-5rem)] overflow-y-auto text-xs font-sans">
            {/* Vitality Gauge Card */}
            <div className="p-4 rounded-xl bg-[#07080c] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">{hp} / {maxHp} HP</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isFull
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isDepleted
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    {isFull ? 'OPTIMAL VITALITY' : isDepleted ? 'CRITICAL STATE' : 'ACTIVE FORTITUDE'}
                  </span>
                </div>
                <span className="text-zinc-400 font-mono text-[11px]">{hpPercent}% capacity</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/5 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDepleted
                      ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                      : 'bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                <span>Base Level Cap: {baseMaxHpFromLevel} HP (Lvl {currentLevel})</span>
                {maxHp > baseMaxHpFromLevel && (
                  <span className="text-cyan-400">+{maxHp - baseMaxHpFromLevel} Fortitude Tonic Bonus</span>
                )}
              </div>
            </div>

            {/* Section 1: How to Restore Lost HP */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Droplets className="h-4 w-4 text-emerald-400" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  1. Real-Time HP Healing & Restoration Methods
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Kaffarah */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#c5a059]/30 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                      🌿 Kaffārah Quests
                    </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      +35 HP
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Complete prescribed corrective quests in Muhāsabah (Sadaqah, fasting, repentance prayer) to heal damage from logged slips.
                  </p>
                </div>

                {/* 5 Daily Prayers */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#c5a059]/30 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                      🕌 All 5 Daily Prayers
                    </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      +15 HP
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Sealing all 5 obligatory fardh prayers for the day (Fajr through 'Isha) erects a daily spiritual armor bonus.
                  </p>
                </div>

                {/* Tahajjud */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#c5a059]/30 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                      🌙 Tahajjud & Qiyām
                    </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      +15 HP
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Standing for at least 2 rak'ahs in the night vigil regenerates deep spiritual stamina and elevates focus.
                  </p>
                </div>

                {/* Sacred Fasting */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#c5a059]/30 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                      🛡️ Sacred Fasting (Siyām)
                    </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      +20 HP
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Completing a voluntary or fardh fast until Iftār provides the divine shield against nafs degradation.
                  </p>
                </div>

                {/* Daily Adhkar */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#c5a059]/30 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                      📿 Morning & Evening Adhkār
                    </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      +5 HP Each
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Reciting your fortress dhikr preserves energy and continuously patches spiritual micro-leaks.
                  </p>
                </div>

                {/* Shop Vitality Elixir */}
                <div className="p-3 rounded-xl bg-[#3a2e12]/20 border border-[#c5a059]/40 hover:border-[#c5a059] transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#fef08a] text-[11px] flex items-center gap-1.5">
                      💧 Shifā' Vitality Elixir
                    </span>
                    <span className="font-mono text-[#fef08a] font-bold bg-[#c5a059]/20 px-1.5 py-0.2 rounded border border-[#c5a059]/30">
                      +35 HP (45 🪙)
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Redeemable instantly in the Reward Shop using earned coins from completed quests and productive work.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: How to Permanently Expand Max HP */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  2. Permanent Max HP Capacity Expansion
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Level Up */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                      🎖️ Operator Level Progression
                    </span>
                    <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                      +5 Max HP / Lvl
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Accumulating XP through deep work pomodoros, completing high-tier quests, and vanquishing boss milestones permanently expands your container capacity.
                  </p>
                </div>

                {/* Tonic of Divine Fortitude */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
                      🛡️ Tonic of Divine Fortitude
                    </span>
                    <span className="font-mono text-cyan-300 font-bold bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      +10 Max HP (140 🪙)
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    A rare elixir in the Reward Shop that permanently stretches your maximum Soul Vitality ceiling beyond your operator level cap.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 justify-end">
              {onNavigateToMuhasabah && (
                <button
                  onClick={() => { onClose(); onNavigateToMuhasabah(); }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] flex items-center gap-1.5 transition"
                >
                  <span>Muhāsabah Log</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
              {onNavigateToPrayers && (
                <button
                  onClick={() => { onClose(); onNavigateToPrayers(); }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] flex items-center gap-1.5 transition"
                >
                  <span>Prayer Fortresses</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
              {onNavigateToShop && (
                <button
                  onClick={() => { onClose(); onNavigateToShop(); }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] font-mono text-[11px] font-bold flex items-center gap-1.5 hover:bg-[#4d3d18] transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                  <span>Open Reward Shop</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
