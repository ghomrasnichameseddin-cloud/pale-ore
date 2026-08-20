import React from 'react';
import { motion } from 'motion/react';
import { Scale, Sparkles, AlertTriangle, ShieldCheck, Flame, Lock, ArrowUpRight, ArrowDownRight, Compass, RefreshCw, CheckCircle2, BookOpen } from 'lucide-react';
import { RubElHizbIcon } from './IslamicRpgDecorations';

interface SacredMizanScaleProps {
  todayEarnedXP: number;
  todayLostXP: number;
  todayNetXP: number;
  todaySlipsCount: number;
  todayHasanatCount: number;
  mizanTilt: number; // Positive = Hasanat heavy (good), Negative = Sayyiat heavy (bad)
  equilibriumStatus: 'Radiant Balance' | 'Blessed Equilibrium' | 'Neutral Ground' | 'Spiritual Deficit' | 'Severe Nafs Warning';
  isSpiritualLocked: boolean;
  pendingKaffarahCount: number;
  onOpenAuditModal: () => void;
  onViewRemedies?: () => void;
  onRecalibrate?: () => void;
  isRecalibrating?: boolean;
  onOpenGuide?: () => void;
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
  onViewRemedies,
  onRecalibrate,
  isRecalibrating,
  onOpenGuide
}) => {
  // Status configurations
  const statusConfigs = {
    'Radiant Balance': {
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-emerald-950/50',
      icon: Sparkles,
      title: 'Radiant Balance (نور الطاعة)',
      desc: 'Hasanāt outweigh slips significantly. High spiritual radiance & maximum momentum multiplier active.'
    },
    'Blessed Equilibrium': {
      color: 'text-amber-300',
      bg: 'bg-[#2a200e] border-[#c5a059]/60 text-[#fef08a] shadow-amber-950/50',
      icon: ShieldCheck,
      title: 'Blessed Equilibrium (ميزان مبارك)',
      desc: 'Positive spiritual equilibrium maintained. Good deeds lead the day; maintain continuous vigilance.'
    },
    'Neutral Ground': {
      color: 'text-zinc-300',
      bg: 'bg-zinc-900/80 border-white/15 text-zinc-300 shadow-black/40',
      icon: Scale,
      title: 'Neutral Ground (مستقر)',
      desc: 'The scale is balanced or waiting for today\'s directives. Strive to tip the balance with righteous action.'
    },
    'Spiritual Deficit': {
      color: 'text-orange-400',
      bg: 'bg-orange-950/60 border-orange-500/50 text-orange-200 shadow-orange-950/50',
      icon: AlertTriangle,
      title: 'Spiritual Deficit (عجز روحي)',
      desc: 'Self-audited slips currently outweigh good deeds. Fulfill Kaffārah directives to restore equilibrium.'
    },
    'Severe Nafs Warning': {
      color: 'text-rose-400',
      bg: 'bg-rose-950/80 border-rose-500/70 text-rose-100 shadow-rose-950/60 animate-pulse',
      icon: Flame,
      title: 'Severe Deficit (تحذير النفس)',
      desc: 'Heavy spiritual deficit detected. Immediate sincere repentance, restitution, and disciplined focus needed.'
    }
  };

  const currentStatus = statusConfigs[equilibriumStatus] || statusConfigs['Neutral Ground'];
  const StatusIcon = currentStatus.icon;

  // PHYSICS EQUILIBRIUM MATH:
  // In our Islamic balance scale:
  // - Left Pan = Al-Hasanāt (Good Deeds / Earned XP)
  // - Right Pan = As-Sayyi'āt (Slips / Lost XP)
  // When Hasanāt > Sayyi'āt (mizanTilt > 0), the Hasanāt pan is heavier -> sinks DOWN on the Left.
  // In 2D CSS / SVG transforms:
  // - Center is at x=180, y=55.
  // - Rotating counter-clockwise (-angle) lowers the left tip and raises the right tip.
  // Therefore, rotation angle = -clampedTilt.
  const clampedTilt = Math.max(-18, Math.min(18, mizanTilt));
  const beamRotation = -clampedTilt;

  // Beam geometry parameters (SVG coordinates):
  const svgWidth = 360;
  const svgHeight = 175;
  const fulcrumX = 180;
  const fulcrumY = 52;
  const beamHalfLength = 125;
  const stringLength = 55;

  // Calculate dynamic beam end positions based on beam rotation
  const rad = (beamRotation * Math.PI) / 180;
  const leftTipX = fulcrumX - beamHalfLength * Math.cos(rad);
  const leftTipY = fulcrumY - beamHalfLength * Math.sin(rad);

  const rightTipX = fulcrumX + beamHalfLength * Math.cos(rad);
  const rightTipY = fulcrumY + beamHalfLength * Math.sin(rad);

  // Pans hang vertically straight down from the beam tips
  const leftPanX = leftTipX;
  const leftPanY = leftTipY + stringLength;

  const rightPanX = rightTipX;
  const rightPanY = rightTipY + stringLength;

  return (
    <div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#10131c] via-[#090b10] to-[#040508] border border-[#c5a059]/30 p-5 sm:p-7 shadow-2xl"
      id="sacred-mizan-scale-card"
    >
      {/* Background Sacred Geometric Pattern Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#c5a059]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#3a2e12] to-[#1a1408] border border-[#c5a059]/50 shadow-inner">
            <Scale className="h-6 w-6 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-zinc-100 flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                THE SACRED MĪZĀN
              </h2>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${currentStatus.bg} flex items-center gap-1.5`}>
                <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{equilibriumStatus}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Live physics balance of Al-Hasanāt (Righteous Deeds) vs. As-Sayyi'āt (Self-Audited Slips)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="px-2.5 py-2 rounded-xl bg-[#0f1219] hover:bg-[#181d28] border border-white/10 hover:border-[#c5a059]/50 text-zinc-300 hover:text-[#fef08a] transition flex items-center gap-1.5 text-xs font-mono font-bold shadow-md active:scale-95"
              title="Open System Manual & Sacred Mīzān Guide"
              id="sacred-mizan-guide-btn"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">GUIDE</span>
            </button>
          )}

          {onRecalibrate && (
            <button
              onClick={onRecalibrate}
              disabled={isRecalibrating}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 shadow-md ${
                isRecalibrating
                  ? 'bg-[#2a2210] border-[#c5a059] text-[#fef08a]'
                  : 'bg-[#0f1219] hover:bg-[#181d28] border-white/10 hover:border-[#c5a059]/50 text-zinc-300 hover:text-zinc-100 active:scale-95'
              }`}
              title="Recalibrate scale physics, sync deeds, and reconcile Sacred Ledger tally"
              id="sacred-mizan-recalibrate-btn"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRecalibrating ? 'animate-spin text-[#c5a059]' : 'text-zinc-400 group-hover:text-[#c5a059]'}`} />
              <span>{isRecalibrating ? 'RECALIBRATING...' : 'RECALIBRATE'}</span>
            </button>
          )}

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

      {/* 2. SPIRITUAL LOCK WARNING BANNER (IF APPLICABLE) */}
      {isSpiritualLocked && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-900/70 border border-rose-500/50 text-rose-200 shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-rose-100 tracking-wide uppercase">Spiritual Audit Lock Engaged</span>
              <p className="text-[11px] text-rose-300/90 font-sans mt-0.5">
                You have <strong>{pendingKaffarahCount}</strong> unfulfilled Kaffārah restitution quest{pendingKaffarahCount > 1 ? 's' : ''}. Reward Shop leisure privileges remain locked until debts are settled.
              </p>
            </div>
          </div>
          {onViewRemedies && (
            <button
              onClick={onViewRemedies}
              className="px-3.5 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 border border-rose-400/40 shadow-md shadow-rose-950/60"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Fulfill Kaffārah
            </button>
          )}
        </div>
      )}

      {/* 3. THE SCALE VISUAL & STATS DOCK */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
        {/* Left Side: Hasanat Tray Card */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-b from-[#08150f] to-[#040a07] border border-emerald-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                Al-Hasanāt
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
              {todayHasanatCount} Deeds Today
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-display font-bold text-emerald-400 flex items-baseline gap-1.5">
              +{todayEarnedXP}
              <span className="text-xs font-mono text-emerald-300/80 font-normal">XP Earned</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-1 leading-relaxed">
              Prayers, Quran recitation, focus sessions, and completed directives.
            </p>
          </div>

          <div className="pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono text-emerald-300/80">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" /> Heavy Weight
            </span>
            <span className="text-emerald-400 font-bold">Light of Obedience</span>
          </div>
        </div>

        {/* Center: High-Fidelity SVG Balance Scale Graphic */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center py-2 px-1">
          {/* Top Dial Indicator / Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <Compass className="h-3 w-3 text-[#c5a059]" />
              Equilibrium Balance Gauge
            </span>
          </div>

          {/* SVG SCALE CONTAINER */}
          <div className="w-full max-w-[370px] relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto drop-shadow-2xl overflow-visible"
            >
              <defs>
                {/* Gradients */}
                <linearGradient id="goldBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="35%" stopColor="#e5c875" />
                  <stop offset="50%" stopColor="#fff0a8" />
                  <stop offset="65%" stopColor="#e5c875" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                <linearGradient id="goldPillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4a3b18" />
                  <stop offset="50%" stopColor="#c5a059" />
                  <stop offset="100%" stopColor="#3a2e12" />
                </linearGradient>

                <linearGradient id="hasanatPanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="sayyiatPanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#881337" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4c0519" stopOpacity="0.95" />
                </linearGradient>

                <filter id="mizanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. SCALE STAND / PILLAR & BASE */}
              {/* Triangular Base Support */}
              <polygon
                points={`${fulcrumX - 45},${svgHeight - 10} ${fulcrumX + 45},${svgHeight - 10} ${fulcrumX},${fulcrumY + 20}`}
                fill="#0d0e14"
                stroke="#c5a059"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
              {/* Base Pedestal Steps */}
              <rect
                x={fulcrumX - 55}
                y={svgHeight - 12}
                width={110}
                height={8}
                rx={3}
                fill="url(#goldPillarGrad)"
                stroke="#c5a059"
                strokeWidth="1"
              />
              <rect
                x={fulcrumX - 65}
                y={svgHeight - 4}
                width={130}
                height={5}
                rx={2}
                fill="#1a1408"
                stroke="#c5a059"
                strokeWidth="1"
                strokeOpacity="0.6"
              />

              {/* Central Pillar Column */}
              <rect
                x={fulcrumX - 4}
                y={fulcrumY - 12}
                width={8}
                height={svgHeight - fulcrumY}
                rx={2}
                fill="url(#goldPillarGrad)"
                stroke="#2a200e"
                strokeWidth="0.8"
              />

              {/* Calibrated Gauge Arc at Center */}
              <path
                d={`M ${fulcrumX - 32} ${fulcrumY + 28} A 32 32 0 0 1 ${fulcrumX + 32} ${fulcrumY + 28}`}
                fill="none"
                stroke="#c5a059"
                strokeWidth="1"
                strokeDasharray="2,3"
                strokeOpacity="0.6"
              />

              {/* 2. DYNAMIC ROTATING CROSSBEAM & NEEDLE */}
              <g>
                {/* The Crossbeam Bar */}
                <line
                  x1={leftTipX}
                  y1={leftTipY}
                  x2={rightTipX}
                  y2={rightTipY}
                  stroke="url(#goldBeamGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#mizanGlow)"
                />

                {/* Left Joint Ring */}
                <circle
                  cx={leftTipX}
                  cy={leftTipY}
                  r="5"
                  fill="#064e3b"
                  stroke="#34d399"
                  strokeWidth="2"
                />

                {/* Right Joint Ring */}
                <circle
                  cx={rightTipX}
                  cy={rightTipY}
                  r="5"
                  fill="#881337"
                  stroke="#fb7185"
                  strokeWidth="2"
                />

                {/* Center Indicator Needle (Points opposite to rotation to show tilt) */}
                <line
                  x1={fulcrumX}
                  y1={fulcrumY}
                  x2={fulcrumX + 24 * Math.sin(rad)}
                  y2={fulcrumY - 24 * Math.cos(rad)}
                  stroke="#fef08a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              {/* 3. CENTER FULCRUM ORNAMENT */}
              <circle
                cx={fulcrumX}
                cy={fulcrumY}
                r="9"
                fill="#2a200e"
                stroke="#e5c875"
                strokeWidth="2.5"
              />
              <circle
                cx={fulcrumX}
                cy={fulcrumY}
                r="4"
                fill="#fef08a"
              />

              {/* 4. SUSPENSION STRINGS & PANS */}
              {/* Left Side: Hasanat Pan */}
              <g>
                {/* Tri-Cables */}
                <line
                  x1={leftTipX}
                  y1={leftTipY}
                  x2={leftPanX - 22}
                  y2={leftPanY}
                  stroke="#34d399"
                  strokeWidth="1"
                  strokeOpacity="0.7"
                />
                <line
                  x1={leftTipX}
                  y1={leftTipY}
                  x2={leftPanX + 22}
                  y2={leftPanY}
                  stroke="#34d399"
                  strokeWidth="1"
                  strokeOpacity="0.7"
                />
                <line
                  x1={leftTipX}
                  y1={leftTipY}
                  x2={leftPanX}
                  y2={leftPanY}
                  stroke="#34d399"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />

                {/* Pan Bowl */}
                <path
                  d={`M ${leftPanX - 26} ${leftPanY} Q ${leftPanX} ${leftPanY + 16} ${leftPanX + 26} ${leftPanY} Z`}
                  fill="url(#hasanatPanGrad)"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />

                {/* Pan Value Tag */}
                <rect
                  x={leftPanX - 24}
                  y={leftPanY + 4}
                  width={48}
                  height={14}
                  rx={3}
                  fill="#022c22"
                  stroke="#059669"
                  strokeWidth="0.8"
                />
                <text
                  x={leftPanX}
                  y={leftPanY + 14}
                  textAnchor="middle"
                  fill="#a7f3d0"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  +{todayEarnedXP} XP
                </text>
              </g>

              {/* Right Side: Sayyiat Pan */}
              <g>
                {/* Tri-Cables */}
                <line
                  x1={rightTipX}
                  y1={rightTipY}
                  x2={rightPanX - 22}
                  y2={rightPanY}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeOpacity="0.7"
                />
                <line
                  x1={rightTipX}
                  y1={rightTipY}
                  x2={rightPanX + 22}
                  y2={rightPanY}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeOpacity="0.7"
                />
                <line
                  x1={rightTipX}
                  y1={rightTipY}
                  x2={rightPanX}
                  y2={rightPanY}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />

                {/* Pan Bowl */}
                <path
                  d={`M ${rightPanX - 26} ${rightPanY} Q ${rightPanX} ${rightPanY + 16} ${rightPanX + 26} ${rightPanY} Z`}
                  fill="url(#sayyiatPanGrad)"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                />

                {/* Pan Value Tag */}
                <rect
                  x={rightPanX - 24}
                  y={rightPanY + 4}
                  width={48}
                  height={14}
                  rx={3}
                  fill="#4c0519"
                  stroke="#e11d48"
                  strokeWidth="0.8"
                />
                <text
                  x={rightPanX}
                  y={rightPanY + 14}
                  textAnchor="middle"
                  fill="#fecdd3"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  −{todayLostXP} XP
                </text>
              </g>
            </svg>
          </div>

          {/* Central Net Standing Meter Badge */}
          <div className="mt-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 shadow-inner">
              <span className="text-[11px] font-mono text-zinc-400">Daily Net Standing:</span>
              <span className={`text-xs sm:text-sm font-mono font-bold ${todayNetXP > 0 ? 'text-emerald-400' : todayNetXP < 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {todayNetXP > 0 ? `+${todayNetXP} XP` : todayNetXP < 0 ? `${todayNetXP} XP` : '0 XP (Balanced)'}
              </span>
            </div>
            <p className="text-[11px] font-sans text-zinc-400 mt-1 max-w-sm mx-auto">
              {currentStatus.desc}
            </p>
          </div>
        </div>

        {/* Right Side: Sayyiat Tray Card */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-b from-[#18090b] to-[#0d0405] border border-rose-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                As-Sayyi'āt
              </span>
            </div>
            <span className="text-[11px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-500/40">
              {todaySlipsCount} Slips Today
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-display font-bold text-rose-400 flex items-baseline gap-1.5">
              −{todayLostXP}
              <span className="text-xs font-mono text-rose-300/80 font-normal">XP Lost</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-1 leading-relaxed">
              Delayed obligations, tongue slips, feed drift, appetites, and neglect.
            </p>
          </div>

          <div className="pt-2.5 border-t border-rose-500/20 flex items-center justify-between text-[11px] font-mono text-rose-300/80">
            <span className="text-rose-400 font-bold">Darkness of Neglect</span>
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" /> Deficit Weight
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
