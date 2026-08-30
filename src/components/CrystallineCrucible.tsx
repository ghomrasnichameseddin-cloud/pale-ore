import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { PowerSeal, SealRarity } from '../types';
import { 
  ORE_COMPLEXITY_INFO, 
  RARITY_ORE_THEMES, 
  Render3DChainPath, 
  OreFacetMesh 
} from './SealingPowerView';
import { 
  Pickaxe, Zap, Sparkles, Shield, Flame, 
  Layers, Lock, Unlock, ArrowUpRight, CheckCircle2, ChevronRight, X, Compass, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { AncientCarvedRune } from './AncientCarvedRune';

interface CrystallineCrucibleProps {
  onNavigateToCodex?: () => void;
}

export const CrystallineCrucible: React.FC<CrystallineCrucibleProps> = ({ onNavigateToCodex }) => {
  const { 
    state, 
    systemDate,
    getMasjid40Stats,
    getActiveOre, 
    setActiveOreId, 
    getTotalOreXpMultiplier, 
    checkCanBreakSeal, 
    breakSeal,
    getPlayerLevelInfo 
  } = usePOS();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedOreId, setSelectedOreId] = useState<string | null>(null);

  const activeOre = getActiveOre();
  const playerInfo = getPlayerLevelInfo();
  const totalMultiplier = getTotalOreXpMultiplier();
  const allSeals = state.seals || [];

  const masjidStats = getMasjid40Stats(systemDate);
  const covenantResonancePercent = masjidStats.currentStreak >= 40 ? 25 : Math.max(5, masjidStats.currentStage.stageNumber * 5);

  // Calculate Shackle Strain and Corrosion from Muḥāsabah
  const activeWeaknesses = (state.weaknesses || []).filter(w => w.status === 'Active');
  const pendingKaffarahs = (state.quests || []).filter(q => 
    q.status === 'Active' && 
    (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]') || q.type === 'Recovery')
  );
  const shackleStrainScore = Math.min(100, (activeWeaknesses.length * 15) + (pendingKaffarahs.length * 10));
  const corrosionPenaltyPercent = shackleStrainScore === 0 ? 0 : Math.min(25, Math.max(3, Math.floor(shackleStrainScore * 0.25)));

  if (!activeOre) return null;

  const isBroken = activeOre.status === 'Broken';
  const theme = RARITY_ORE_THEMES[activeOre.rarity] || RARITY_ORE_THEMES.Common;
  const complexity = ORE_COMPLEXITY_INFO[activeOre.rarity] || ORE_COMPLEXITY_INFO.Common;
  const checkStatus = checkCanBreakSeal(activeOre);

  // Calculate faceted cleave progress
  const totalFacets = complexity.facetNumber;
  const cleavedFacets = isBroken 
    ? totalFacets 
    : Math.min(totalFacets - 1, Math.max(1, Math.floor((checkStatus.progressPercent / 100) * totalFacets)));

  const handleShatter = () => {
    breakSeal(activeOre.id);
  };

  const handleSelectOre = (id: string) => {
    setActiveOreId(id);
    setIsSelectorOpen(false);
  };

  return (
    <div 
      id="crystalline-crucible-widget"
      className="relative rounded-2xl border border-[#c5a059]/25 bg-gradient-to-b from-[#0e121c] via-[#090b10] to-[#06070a] p-5 shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden group/crucible"
    >
      <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* Subtle Background Radial Ambient Glow */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none transition-all duration-700"
        style={{
          background: isBroken ? theme.veinColor : '#c5a059'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#c5a059_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      {/* 1. HEADER STRIP */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#c5a059]/20 pb-3.5 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-[#141824] border border-[#c5a059]/30 text-[#fef08a] shadow-inner">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059] animate-[spin_60s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#c5a059]">
                SANCTUM METALLURGY
              </span>
              <span className="inline-block h-1 w-1 rounded-full bg-[#c5a059]/60" />
              <span className="text-[10px] font-mono text-zinc-400">
                ACTIVE RESONATOR
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>{activeOre.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                isBroken 
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]' 
                  : 'bg-[#3a2e12]/80 text-[#fef08a] border-[#c5a059]/40'
              }`}>
                {activeOre.rarity}
              </span>
            </h3>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsSelectorOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#141824] border border-[#c5a059]/30 text-[#fef08a] hover:bg-[#1f2538] hover:border-[#c5a059] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Switch Active Resonator"
          >
            <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Switch Resonator</span>
          </button>

          {onNavigateToCodex && (
            <button
              type="button"
              onClick={onNavigateToCodex}
              className="px-3 py-1.5 rounded-lg bg-[#07080c] border border-white/10 text-zinc-300 hover:text-white hover:border-[#c5a059]/50 transition-all flex items-center gap-1 shadow-sm"
              title="Open Ores & Chains Deep Forge"
            >
              <span>Codex</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#c5a059]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DUAL-COLUMN CRUCIBLE CORE: 3D STAGE & STRUCTURAL GEOMETRY */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* LEFT / CENTER: 3D ORE & SACRED GEOMETRY CANVAS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[240px] aspect-square rounded-2xl bg-gradient-to-b from-[#141824]/90 via-[#07080c] to-[#040508] border border-[#c5a059]/30 p-2 flex items-center justify-center shadow-[inset_0_4px_24px_rgba(0,0,0,0.9),_0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Ambient background ring */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke={isBroken ? theme.stroke : '#52525b'} strokeWidth="1" strokeDasharray="6 4" />
              <circle cx="100" cy="100" r="76" stroke={isBroken ? theme.stroke : '#3f3f46'} strokeWidth="1.5" />
              <circle cx="100" cy="100" r="64" stroke={isBroken ? theme.stroke : '#27272a'} strokeWidth="1" strokeDasharray="12 4" />
            </svg>

            {/* Radiant pulse halo if broken */}
            {isBroken && (
              <div 
                className="absolute inset-6 rounded-full animate-pulse opacity-25 pointer-events-none filter blur-xl"
                style={{ background: theme.veinColor }}
              />
            )}

            {/* SVG 3D Carved Mineral Mesh */}
            <div className="relative w-40 h-40 flex items-center justify-center z-10">
              <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.9)]">
                <defs>
                  <linearGradient id={`crucible-ore-top-${activeOre.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3a2e12" />
                    <stop offset="50%" stopColor={theme.oreGrad1} />
                    <stop offset="100%" stopColor={theme.oreGrad2} />
                  </linearGradient>

                  <linearGradient id={`crucible-ore-left-${activeOre.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.oreGrad1} />
                    <stop offset="100%" stopColor="#07080c" />
                  </linearGradient>

                  <linearGradient id={`crucible-ore-right-${activeOre.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.oreGrad2} />
                    <stop offset="100%" stopColor={theme.oreGrad3} />
                  </linearGradient>

                  <linearGradient id={`crucible-ore-core-${activeOre.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor={theme.veinColor} />
                    <stop offset="100%" stopColor={theme.oreGrad2} />
                  </linearGradient>

                  <linearGradient id={`crucible-pedestal-${activeOre.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3a2e12" />
                    <stop offset="50%" stopColor="#181d29" />
                    <stop offset="100%" stopColor="#07080c" />
                  </linearGradient>
                </defs>

                {/* Pedestal base */}
                <ellipse cx="100" cy="165" rx="60" ry="14" fill="#000000" opacity="0.85" filter="blur(3px)" />
                <path d="M 45,160 L 155,160 L 140,172 L 60,172 Z" fill={`url(#crucible-pedestal-${activeOre.id})`} stroke="#c5a059" strokeWidth="0.8" />

                {/* Geometric Facet Mesh */}
                <OreFacetMesh rarity={activeOre.rarity} sealId={activeOre.id} theme={theme} isBroken={isBroken} />
              </svg>

              {/* Central Inscription Glyphs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
                <AncientCarvedRune
                  glyph={activeOre.runeSymbol || '🪨'}
                  size={52}
                  shape="octagram"
                  stoneVariant={activeOre.rarity === 'Divine' ? 'meteorite' : activeOre.rarity === 'Epic' ? 'iron' : 'basalt'}
                  conduitColor={theme.veinColor}
                  secondaryColor="#fef08a"
                  glowIntensity={isBroken ? 'radiant' : 'subtle'}
                  showCracks={true}
                  className={`transition-transform duration-500 ${isBroken ? 'scale-110' : ''}`}
                />
              </div>

              {/* 3D Interlocking Chains overlay when locked */}
              {!isBroken && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none">
                    <Render3DChainPath
                      x1={20} y1={20} x2={180} y2={180}
                      count={10}
                      chainColor={theme.chainColor}
                      chainStroke={theme.chainStroke}
                    />
                    <Render3DChainPath
                      x1={180} y1={20} x2={20} y2={180}
                      count={10}
                      chainColor={theme.chainColor}
                      chainStroke={theme.chainStroke}
                    />
                  </svg>

                  {/* Central Padlock / Shackle Core */}
                  <div className="relative p-2 rounded-full bg-[#0b0d13] border border-[#c5a059]/60 shadow-[0_0_15px_rgba(0,0,0,0.95)]">
                    <Lock className="h-4 w-4 text-[#c5a059] animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Status floating badge on stage */}
            <div className="absolute bottom-2 inset-x-2 text-center z-20">
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                isBroken
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-[#07080c]/90 text-zinc-300 border-zinc-700/60'
              }`}>
                {isBroken ? (
                  <>
                    <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                    <span>RESONANCE HARMONIZED</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-2.5 w-2.5 text-[#c5a059]" />
                    <span>BOUND BY NAFS CHAINS</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: STRUCTURAL STATE & LIVE SYSTEM BUFFS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* A. GEOMETRY & FACET CLEAVING PROGRESS */}
          <div className="p-3.5 rounded-xl bg-[#0b0d13]/80 border border-[#c5a059]/20 space-y-2.5 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#c5a059]" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  {complexity.shapeName}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-[#c5a059] font-bold">{complexity.complexityStars}</span>
                <span className="text-zinc-400">({complexity.facetCount})</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {complexity.description}
            </p>

            {/* Facet Cleaving Visual Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-[#c5a059]" />
                  <span>Facet Polish Calibration:</span>
                </span>
                <span className={`font-bold ${isBroken ? 'text-emerald-400' : 'text-[#fef08a]'}`}>
                  {cleavedFacets} / {totalFacets} Facets Cleaved ({isBroken ? 100 : checkStatus.progressPercent}%)
                </span>
              </div>

              {/* Diamond facet pips */}
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: Math.min(24, totalFacets) }).map((_, idx) => {
                  const isPolished = idx < cleavedFacets;
                  return (
                    <div
                      key={idx}
                      className={`h-2.5 flex-1 min-w-[8px] rounded-sm transition-all duration-500 border ${
                        isPolished
                          ? isBroken 
                            ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                            : 'bg-[#c5a059] border-[#fef08a] shadow-[0_0_6px_rgba(197,160,89,0.5)]'
                          : 'bg-zinc-900 border-zinc-800'
                      }`}
                      title={`Facet #${idx + 1}: ${isPolished ? 'Polished & Cleaved' : 'Uncut Rough Mineral'}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* B. LIVE SYSTEM AMPLIFICATION MATRIX (4 STAT CARDS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {/* 1. XP Gain Channeling */}
            <div className="p-2.5 rounded-xl bg-[#141824]/70 border border-[#c5a059]/25 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Zap className="h-3 w-3 text-[#c5a059]" />
                <span>XP Channel</span>
              </div>
              <div className="mt-1">
                <span className={`text-base font-bold ${isBroken ? 'text-emerald-400' : 'text-[#fef08a]'}`}>
                  +{Math.round(((activeOre.xpBonusMultiplier || 1.0) - 1.0) * 100)}%
                </span>
                <span className="text-[9px] text-zinc-400 block">All Directives</span>
              </div>
            </div>

            {/* 2. Total System Multiplier */}
            <div className="p-2.5 rounded-xl bg-[#141824]/70 border border-[#c5a059]/25 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#c5a059]" />
                <span>Total Stacking</span>
              </div>
              <div className="mt-1">
                <span className="text-base font-bold text-[#fef08a]">
                  +{Math.round((totalMultiplier - 1.0) * 100)}%
                </span>
                <span className="text-[9px] text-zinc-400 block">Active Multiplier</span>
              </div>
            </div>

            {/* 3. Momentum Floor */}
            <div className="p-2.5 rounded-xl bg-[#141824]/70 border border-[#c5a059]/25 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Flame className="h-3 w-3 text-[#c5a059]" />
                <span>Momentum</span>
              </div>
              <div className="mt-1">
                <span className="text-base font-bold text-amber-400">
                  +{activeOre.momentumBoost || 5}
                </span>
                <span className="text-[9px] text-zinc-400 block">Baseline Anchor</span>
              </div>
            </div>

            {/* 4. Attribute Infusion */}
            <div className="p-2.5 rounded-xl bg-[#141824]/70 border border-[#c5a059]/25 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Shield className="h-3 w-3 text-[#c5a059]" />
                <span>Attributes</span>
              </div>
              <div className="mt-1">
                <span className="text-base font-bold text-cyan-400">
                  +{(activeOre.attributeBoosts || []).reduce((sum, b) => sum + b.boostAmount, 0) || 1}
                </span>
                <span className="text-[9px] text-zinc-400 block truncate">Matrix Infusion</span>
              </div>
            </div>
          </div>

          {/* DUAL TELEMETRY: MASJID 40 RESONANCE & SHACKLE STRAIN / CORROSION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {/* 1. Masjid 40 Sanctuary Resonance */}
            <div className="p-2.5 rounded-xl bg-[#090c14] border border-[#c5a059]/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">40-Day Sanctuary Cleaving</span>
                  <span className="text-xs text-white font-bold">
                    Day {masjidStats.currentStreak}/40 (Stage {masjidStats.currentStage.stageNumber})
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#fef08a] font-bold shrink-0 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                +{covenantResonancePercent}% Resonance
              </span>
            </div>

            {/* 2. Shackle Strain & Corrosion Meter */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
              corrosionPenaltyPercent > 0
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${corrosionPenaltyPercent > 0 ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">
                    {corrosionPenaltyPercent > 0 ? 'Shackle Strain & Corrosion' : 'Crystalline Purity'}
                  </span>
                  <span className="text-xs font-bold">
                    {corrosionPenaltyPercent > 0 
                      ? `${shackleStrainScore}% Strain (${activeWeaknesses.length} Chains)` 
                      : '0% Corrosion • Pristine Luster'}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded border ${
                corrosionPenaltyPercent > 0
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}>
                {corrosionPenaltyPercent > 0 ? `-${corrosionPenaltyPercent}% XP Vein` : '100% Purity'}
              </span>
            </div>
          </div>

          {/* C. CRUCIBLE ACTIONS: SHATTER OR PROGRESSION REQUIREMENTS */}
          <div className="pt-1">
            {isBroken ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>{activeOre.buffName}:</strong> {activeOre.buffDescription}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 rounded-lg text-emerald-200 font-mono text-[11px] shrink-0 transition-colors"
                >
                  Tune Frequencies
                </button>
              </div>
            ) : checkStatus.canBreak ? (
              <button
                type="button"
                onClick={handleShatter}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-[#c5a059] to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold font-mono tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all active:scale-[0.99] cursor-pointer"
              >
                <Pickaxe className="h-4 w-4 animate-bounce" />
                <span>SHATTER CHAINS OF NAFS WITH PICKAXE</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#141824]/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    Chamber Requirements: <span className="text-amber-300 font-bold">{checkStatus.reason}</span>
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 shrink-0">
                  Level {playerInfo.level}/{activeOre.requiredLevel} • {playerInfo.totalXp}/{activeOre.costXP} XP
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SELECTOR MODAL: SWITCH ACTIVE RESONATOR */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0b0d13] border border-[#c5a059]/40 p-5 shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
            >
              <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                      SELECT RESONATING CRUCIBLE ORE
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      Choose which mineral geometry mounts to the Sanctum pedestal
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsSelectorOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Ore list */}
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                {allSeals.map((seal) => {
                  const sealBroken = seal.status === 'Broken';
                  const isCurrent = seal.id === activeOre.id;
                  const cInfo = ORE_COMPLEXITY_INFO[seal.rarity] || ORE_COMPLEXITY_INFO.Common;
                  const sTheme = RARITY_ORE_THEMES[seal.rarity] || RARITY_ORE_THEMES.Common;

                  return (
                    <div
                      key={seal.id}
                      onClick={() => handleSelectOre(seal.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-[#181d29] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)]'
                          : 'bg-[#07080c] border-white/10 hover:border-[#c5a059]/40 hover:bg-[#11141c]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Mini Ore Ancient Carved Inscription */}
                        <div className="shrink-0">
                          <AncientCarvedRune
                            glyph={seal.runeSymbol || '🪨'}
                            size={38}
                            shape="octagram"
                            stoneVariant={sealBroken ? 'meteorite' : 'basalt'}
                            conduitColor={sTheme.veinColor || '#c5a059'}
                            secondaryColor="#fef08a"
                            glowIntensity={sealBroken ? 'subtle' : 'none'}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-sm text-white truncate">
                              {seal.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full border border-white/10 text-zinc-300 uppercase">
                              {seal.rarity}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono font-bold bg-[#c5a059] text-black px-1.5 py-0.2 rounded uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>{cInfo.shapeName}</span>
                            <span>•</span>
                            <span className="text-[#c5a059]">{cInfo.facetCount}</span>
                            <span>•</span>
                            <span className={sealBroken ? 'text-emerald-400' : 'text-amber-400'}>
                              {sealBroken ? 'Resonating' : 'Shackled'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <div className="text-xs font-bold text-[#fef08a]">
                          +{Math.round(((seal.xpBonusMultiplier || 1.0) - 1.0) * 100)}% XP
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {seal.buffName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#c5a059]/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold border border-zinc-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * OreXpChannelingBadge:
 * An elegant crystalline badge displayed next to quest XP values in the Operational Decrees
 * and Directives Terminal, illustrating real-time Ore XP Channeling.
 */
interface OreXpChannelingBadgeProps {
  baseXp: number;
  className?: string;
}

export const OreXpChannelingBadge: React.FC<OreXpChannelingBadgeProps> = ({ baseXp, className = '' }) => {
  const { getTotalOreXpMultiplier, getActiveOre } = usePOS();
  const totalMultiplier = getTotalOreXpMultiplier();
  const activeOre = getActiveOre();

  if (totalMultiplier <= 1.001 || !activeOre) {
    return null;
  }

  const bonusXp = Math.round(baseXp * (totalMultiplier - 1.0));
  if (bonusXp <= 0) return null;

  const complexity = ORE_COMPLEXITY_INFO[activeOre.rarity] || ORE_COMPLEXITY_INFO.Common;
  const oreTheme = RARITY_ORE_THEMES[activeOre.rarity] || RARITY_ORE_THEMES.Common;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border cursor-help shadow-sm transition-all hover:scale-105 ${
        activeOre.status === 'Broken'
          ? 'bg-[#141824] text-[#fef08a] border-[#c5a059]/40 shadow-[0_0_6px_rgba(197,160,89,0.2)]'
          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
      } ${className}`}
      title={`Crystalline Resonance Active!\nBase: ${baseXp} XP\n+${bonusXp} XP (${Math.round((totalMultiplier - 1.0) * 100)}% via ${activeOre.name})\nGeometry: ${complexity.shapeName} (${complexity.facetCount})`}
    >
      <span className="text-[10px]">✨</span>
      <span>+{bonusXp}</span>
      <span className="text-[8px] text-[#c5a059] opacity-90 uppercase">
        {complexity.shapeName.split(' ')[0]}
      </span>
    </span>
  );
};
