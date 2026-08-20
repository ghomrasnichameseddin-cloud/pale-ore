import React from 'react';
import { motion } from 'motion/react';
import { Scale, Sparkles, AlertTriangle, ShieldCheck, Flame, Lock } from 'lucide-react';
import { RubElHizbIcon } from './IslamicRpgDecorations';

interface SacredMizanScaleProps {
  todayEarnedXP: number;
  todayLostXP: number;
  todayNetXP: number;
  todaySlipsCount: number;
  todayHasanatCount: number;
  mizanTilt: number;
  equilibriumStatus: 'Radiant Balance' | 'Blessed Equilibrium' | 'Neutral Ground' | 'Spiritual Deficit' | 'Severe Nafs Warning';
  isSpiritualLocked: boolean;
  pendingKaffarahCount: number;
  onOpenAuditModal: () => void;
  onViewRemedies?: () => void;
}

export const SacredMizanScale: React.FC<SacredMizanScaleProps> = ({
  todayEarnedXP,
  todayLostXP,
  todayNetXP,
  todaySlipsCount,
  todayHasanatCount,
  mizanTilt,
  equilibriumStatus,
  isSpiritualLocked,
  pendingKaffarahCount,
  onOpenAuditModal,
  onViewRemedies
}) => {
  // Status color badges
  const statusConfigs = {
    'Radiant Balance': {
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
      icon: Sparkles,
      desc: 'Hasanāt outweigh slips heavily. Spiritual radiance and momentum peak.'
    },
    'Blessed Equilibrium': {
      color: 'text-amber-300',
      bg: 'bg-[#2a200e] border-[#c5a059]/40 text-[#fef08a]',
      icon: ShieldCheck,
      desc: 'Positive spiritual equilibrium maintained. Vigilance is advised.'
    },
    'Neutral Ground': {
      color: 'text-zinc-300',
      bg: 'bg-zinc-900 border-white/10 text-zinc-300',
      icon: Scale,
      desc: 'Deeds and slips in fragile balance. Step up corrective directives.'
    },
    'Spiritual Deficit': {
      color: 'text-orange-400',
      bg: 'bg-orange-950/40 border-orange-500/40 text-orange-300',
      icon: AlertTriangle,
      desc: 'Sayyi\'āt outweigh good deeds today. Urgent Kaffārah required.'
    },
    'Severe Nafs Warning': {
      color: 'text-rose-400',
      bg: 'bg-rose-950/60 border-rose-500/60 text-rose-200 animate-pulse',
      icon: Flame,
      desc: 'Heavy spiritual deficit. Immediate restitution & sincere repentance required.'
    }
  };

  const currentStatus = statusConfigs[equilibriumStatus] || statusConfigs['Blessed Equilibrium'];
  const StatusIcon = currentStatus.icon;

  // Visual pan heights based on tilt
  // Positive tilt means Hasanat pan goes DOWN (heavier = better in Islamic tradition: weight of good deeds is heavy)
  // Tilt is clamped between -18 and +18 deg
  const clampedTilt = Math.max(-18, Math.min(18, mizanTilt));
  const hasanatPanY = clampedTilt * 1.8; // moves down when positive
  const sayyiatPanY = -clampedTilt * 1.8; // moves up when positive

  return (
    <div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#11131a] to-[#07080c] border border-[#c5a059]/30 p-5 sm:p-7 shadow-2xl"
      id="sacred-mizan-scale-card"
    >
      {/* Background Sacred Geometric Pattern Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#c5a059]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#3a2e12] to-[#1a1408] border border-[#c5a059]/50 shadow-inner">
            <Scale className="h-6 w-6 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-zinc-100 flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                THE SACRED MĪZĀN
              </h2>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentStatus.bg} flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {equilibriumStatus}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Real-time balance of Hasanāt (Completed Directives) vs. Sayyi'āt (Self-Audited Slips)
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAuditModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-[#c5a059] to-amber-500 hover:brightness-110 active:scale-95 text-black font-display text-xs font-bold tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-950/50"
            id="sacred-mizan-triage-btn"
          >
            <Flame className="h-4 w-4" />
            3-TAP AUDIT SLIP
          </button>
        </div>
      </div>

      {/* SPIRITUAL LOCK WARNING BANNER (IF APPLICABLE) */}
      {isSpiritualLocked && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-900/60 border border-rose-500/50 text-rose-300">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-rose-100">Spiritual Audit Lock Engaged</span>
              <p className="text-[11px] text-rose-300/80">
                You have {pendingKaffarahCount} unfulfilled Kaffārah restitution quest{pendingKaffarahCount > 1 ? 's' : ''}. Reward shop perks are locked until fulfilled.
              </p>
            </div>
          </div>
          {onViewRemedies && (
            <button
              onClick={onViewRemedies}
              className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              Fulfill Kaffārah
            </button>
          )}
        </div>
      )}

      {/* THE SCALE VISUAL & STATS DOCK */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Hasanat Tray Card */}
        <div className="lg:col-span-3 rounded-xl bg-[#0a120e] border border-emerald-500/25 p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                Al-Hasanāt
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {todayHasanatCount} Deeds Today
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
              +{todayEarnedXP}
              <span className="text-xs font-mono text-emerald-300/70 font-normal ml-1">XP Earned</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-1">
              Fajr, Quran, locked focus cycles, prayer completions.
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px] font-mono text-emerald-300/80">
            <span>Light of Obedience</span>
            <span>+Weight</span>
          </div>
        </div>

        {/* Center: Dynamic Animated Scale Graphic */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center py-4 px-2">
          {/* Top Fulcrum Stand */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#e5c875] to-[#785b1a] border-2 border-[#fff0a8] shadow-md relative z-20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
          </div>

          {/* Scale Crossbeam with Tilt Animation */}
          <motion.div 
            className="w-full max-w-[340px] h-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-[#c5a059] to-rose-600 relative my-1 shadow-lg shadow-black/60 flex items-center justify-between px-2"
            animate={{ rotate: clampedTilt }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            {/* Left Beam Joint */}
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 border border-black shadow-sm" />
            
            {/* Center Fulcrum Indicator Needle */}
            <div className="w-1 h-7 bg-[#fef08a] rounded-full shadow-sm -mt-3.5 mx-auto" />
            
            {/* Right Beam Joint */}
            <div className="w-2.5 h-2.5 rounded-full bg-rose-300 border border-black shadow-sm" />
          </motion.div>

          {/* Suspended Trays Visual */}
          <div className="w-full max-w-[340px] flex items-start justify-between px-3 mt-1">
            {/* Left Pan (Hasanat - moves with tilt) */}
            <motion.div 
              className="flex flex-col items-center"
              animate={{ y: hasanatPanY }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              <div className="w-0.5 h-8 bg-emerald-500/60" />
              <div className="w-24 h-6 rounded-b-full bg-gradient-to-t from-emerald-950 to-emerald-900/60 border border-emerald-400/50 shadow-lg shadow-emerald-950/80 flex items-center justify-center text-[10px] font-mono text-emerald-200 font-bold">
                +{todayEarnedXP} XP
              </div>
            </motion.div>

            {/* Scale Base Stand */}
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-10 bg-gradient-to-b from-[#8f6e24] to-[#3a2e12] border-x border-[#c5a059]/40" />
              <div className="w-16 h-3 rounded-t-lg bg-gradient-to-r from-[#2a200e] via-[#c5a059]/50 to-[#2a200e] border-t border-[#c5a059]/60" />
            </div>

            {/* Right Pan (Sayyiat - moves opposite) */}
            <motion.div 
              className="flex flex-col items-center"
              animate={{ y: sayyiatPanY }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              <div className="w-0.5 h-8 bg-rose-500/60" />
              <div className="w-24 h-6 rounded-b-full bg-gradient-to-t from-rose-950 to-rose-900/60 border border-rose-400/50 shadow-lg shadow-rose-950/80 flex items-center justify-center text-[10px] font-mono text-rose-200 font-bold">
                −{todayLostXP} XP
              </div>
            </motion.div>
          </div>

          {/* Central Net Standing Meter */}
          <div className="mt-3 text-center">
            <span className="text-xs font-mono text-zinc-400">Net Standing Today:</span>
            <div className={`text-lg sm:text-xl font-display font-bold ${todayNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {todayNetXP >= 0 ? `+${todayNetXP}` : `${todayNetXP}`} XP
            </div>
            <p className="text-[10px] font-mono text-zinc-500">
              {currentStatus.desc}
            </p>
          </div>
        </div>

        {/* Right Side: Sayyiat Tray Card */}
        <div className="lg:col-span-3 rounded-xl bg-[#140a0c] border border-rose-500/25 p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                As-Sayyi'āt
              </span>
            </div>
            <span className="text-[11px] font-mono text-rose-400/80 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
              {todaySlipsCount} Slips Today
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-display font-bold text-rose-400">
              −{todayLostXP}
              <span className="text-xs font-mono text-rose-300/70 font-normal ml-1">XP Lost</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-1">
              Delayed obligations, tongue slips, feed drift, appetites.
            </p>
          </div>

          <div className="pt-2 border-t border-rose-500/15 flex items-center justify-between text-[11px] font-mono text-rose-300/80">
            <span>Darkness of Neglect</span>
            <span>−Weight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
