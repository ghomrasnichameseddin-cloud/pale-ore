import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { PowerSeal, SealRarity, SealStatus } from '../types';
import { 
  Sparkles, Lock, Unlock, ShieldAlert, Award, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Zap, Shield, Flame, Gem, Sliders, Search, RefreshCw, X, ChevronRight, Layers, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const RARITY_COLORS: Record<SealRarity, {
  border: string;
  bg: string;
  text: string;
  badge: string;
  glow: string;
}> = {
  Common: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-400',
    badge: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]'
  },
  Rare: {
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/20',
    text: 'text-purple-400',
    badge: 'bg-purple-950 text-purple-300 border-purple-500/40',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]'
  },
  Epic: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
  },
  Legendary: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/25',
    text: 'text-amber-400',
    badge: 'bg-amber-950 text-amber-300 border-amber-500/50 font-bold',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
  },
  Divine: {
    border: 'border-rose-500/60',
    bg: 'bg-rose-950/30',
    text: 'text-rose-400',
    badge: 'bg-rose-950 text-rose-300 border-rose-500/60 font-bold',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]'
  },
  Forbidden: {
    border: 'border-violet-500/60',
    bg: 'bg-violet-950/30',
    text: 'text-violet-400',
    badge: 'bg-violet-950 text-violet-300 border-violet-500/60 font-bold',
    glow: 'shadow-[0_0_25px_rgba(139,92,246,0.25)]'
  }
};

export const SealingPowerView: React.FC = () => {
  const { 
    state, addSeal, updateSeal, deleteSeal, breakSeal, relockSeal, getPlayerLevelInfo, getSkillXpAndLevel
  } = usePOS();

  const playerInfo = getPlayerLevelInfo();
  const seals = state.seals || [];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Locked' | 'Broken'>('All');
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeal, setEditingSeal] = useState<PowerSeal | null>(null);
  const [selectedSealForBreak, setSelectedSealForBreak] = useState<PowerSeal | null>(null);

  // Unseal Feedback Banner
  const [unsealMessage, setUnsealMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rarity: 'Common' as SealRarity,
    requiredLevel: 1,
    costXP: 100,
    requiredQuestId: '',
    requiredSkillId: '',
    requiredSkillLevel: 1,
    buffName: '',
    buffDescription: '',
    xpBonusPercent: 15,
    momentumBoost: 5,
    runeSymbol: '🔮',
    selectedAttributeId: 'a-4',
    attributeBoostAmount: 2
  });

  // Calculate System-Wide Active Seal Buff Summary
  const brokenSeals = seals.filter(s => s.status === 'Broken');
  const totalXpMultiplier = brokenSeals.reduce((acc, s) => acc * (s.xpBonusMultiplier || 1.0), 1.0);
  const xpBoostDisplayPercent = Math.round((totalXpMultiplier - 1.0) * 100);

  // Collect attribute boosts from broken seals
  const totalAttributeBoosts: Record<string, number> = {};
  brokenSeals.forEach(s => {
    (s.attributeBoosts || []).forEach(b => {
      totalAttributeBoosts[b.attributeId] = (totalAttributeBoosts[b.attributeId] || 0) + b.boostAmount;
    });
  });

  const handleOpenCreateModal = () => {
    setEditingSeal(null);
    setFormData({
      name: '',
      description: '',
      rarity: 'Common',
      requiredLevel: Math.max(1, playerInfo.level),
      costXP: 200,
      requiredQuestId: '',
      requiredSkillId: '',
      requiredSkillLevel: 1,
      buffName: '',
      buffDescription: '',
      xpBonusPercent: 15,
      momentumBoost: 5,
      runeSymbol: '🔮',
      selectedAttributeId: 'a-4',
      attributeBoostAmount: 2
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (seal: PowerSeal) => {
    setEditingSeal(seal);
    setFormData({
      name: seal.name,
      description: seal.description,
      rarity: seal.rarity,
      requiredLevel: seal.requiredLevel,
      costXP: seal.costXP,
      requiredQuestId: seal.requiredQuestId || '',
      requiredSkillId: seal.requiredSkillId || '',
      requiredSkillLevel: seal.requiredSkillLevel || 1,
      buffName: seal.buffName,
      buffDescription: seal.buffDescription,
      xpBonusPercent: Math.round(((seal.xpBonusMultiplier || 1.0) - 1.0) * 100),
      momentumBoost: seal.momentumBoost || 5,
      runeSymbol: seal.runeSymbol || '🔮',
      selectedAttributeId: seal.attributeBoosts?.[0]?.attributeId || 'a-4',
      attributeBoostAmount: seal.attributeBoosts?.[0]?.boostAmount || 2
    });
    setIsFormOpen(true);
  };

  const handleSaveSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.buffName.trim()) return;

    const multiplier = 1 + (formData.xpBonusPercent / 100);
    const attrBoosts = formData.selectedAttributeId ? [{
      attributeId: formData.selectedAttributeId,
      boostAmount: formData.attributeBoostAmount
    }] : [];

    if (editingSeal) {
      updateSeal(editingSeal.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rarity: formData.rarity,
        requiredLevel: Number(formData.requiredLevel),
        costXP: Number(formData.costXP),
        requiredQuestId: formData.requiredQuestId || null,
        requiredSkillId: formData.requiredSkillId || null,
        requiredSkillLevel: Number(formData.requiredSkillLevel),
        buffName: formData.buffName.trim(),
        buffDescription: formData.buffDescription.trim(),
        xpBonusMultiplier: multiplier,
        momentumBoost: Number(formData.momentumBoost),
        attributeBoosts: attrBoosts,
        runeSymbol: formData.runeSymbol || '🔮'
      });
    } else {
      addSeal({
        name: formData.name.trim(),
        description: formData.description.trim(),
        rarity: formData.rarity,
        requiredLevel: Number(formData.requiredLevel),
        costXP: Number(formData.costXP),
        requiredQuestId: formData.requiredQuestId || null,
        requiredSkillId: formData.requiredSkillId || null,
        requiredSkillLevel: Number(formData.requiredSkillLevel),
        buffName: formData.buffName.trim(),
        buffDescription: formData.buffDescription.trim(),
        xpBonusMultiplier: multiplier,
        momentumBoost: Number(formData.momentumBoost),
        attributeBoosts: attrBoosts,
        runeSymbol: formData.runeSymbol || '🔮'
      });
    }

    setIsFormOpen(false);
  };

  const handleTriggerBreakSeal = (seal: PowerSeal) => {
    const res = breakSeal(seal.id);
    setUnsealMessage({ text: res.message, isError: !res.success });
    setSelectedSealForBreak(null);
    setTimeout(() => setUnsealMessage(null), 5000);
  };

  // Filter seals
  const filteredSeals = seals.filter(seal => {
    const matchesSearch = 
      seal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seal.buffName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : seal.status === statusFilter;
    const matchesRarity = rarityFilter === 'All' ? true : seal.rarity === rarityFilter;
    return matchesSearch && matchesStatus && matchesRarity;
  });

  return (
    <div className="space-y-6 pb-12" id="sealing-power-system-container">
      
      {/* SYSTEM HEADER BANNER */}
      <div className="p-5 bg-gradient-to-r from-purple-950/60 via-zinc-950 to-cyan-950/50 border border-purple-500/30 rounded-xl relative overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.1)]">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-48 w-48 text-purple-400 animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-950 border border-purple-500/50 rounded text-purple-300">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </span>
              <h2 className="font-display text-xl font-black text-white tracking-wider">
                POWER SEALING & UNSEALING ALTAR
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold uppercase">
                LATENT POWER SYSTEM v2.6
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl font-mono leading-relaxed">
              Shatter inherent system limiters and cognitive constraints to awaken massive persistent passive multipliers, attribute empowerment, and operator perks across directives.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider transition shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>FORM NEW POWER SEAL</span>
            </button>
          </div>
        </div>

        {/* ACTIVE BUFF MATRIX HUD */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="bg-zinc-950/80 border border-purple-500/30 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">SEALS SHATTERED</span>
              <span className="text-base font-mono font-bold text-purple-300">
                {brokenSeals.length} <span className="text-xs text-zinc-500">/ {seals.length} BROKEN</span>
              </span>
            </div>
            <Unlock className="h-5 w-5 text-purple-400" />
          </div>

          <div className="bg-zinc-950/80 border border-cyan-500/30 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">SYSTEM XP MULTIPLIER</span>
              <span className="text-base font-mono font-bold text-cyan-300">
                +{xpBoostDisplayPercent}% <span className="text-xs text-cyan-500 font-normal">XP BOOST</span>
              </span>
            </div>
            <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
          </div>

          <div className="bg-zinc-950/80 border border-amber-500/30 p-3 rounded-lg flex items-center justify-between col-span-1 sm:col-span-2">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">ACTIVE SEAL ATTRIBUTE BOOSTS</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {Object.keys(totalAttributeBoosts).length === 0 ? (
                  <span className="text-xs font-mono text-zinc-600">No active seal attribute boosts. Shatter a seal to unlock.</span>
                ) : (
                  Object.entries(totalAttributeBoosts).map(([attrId, boost]) => {
                    const attr = state.attributes.find(a => a.id === attrId);
                    return (
                      <span key={attrId} className="px-2 py-0.5 text-[9.5px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded font-bold">
                        +{boost} {attr?.name || 'ATTRIBUTE'}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-400 shrink-0 ml-2" />
          </div>

        </div>
      </div>

      {/* UNSEAL FEEDBACK ALERT */}
      <AnimatePresence>
        {unsealMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-3 ${
              unsealMessage.isError
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {unsealMessage.isError ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 animate-bounce" />
              )}
              <span>{unsealMessage.text}</span>
            </div>
            <button onClick={() => setUnsealMessage(null)} className="text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & CONTROL BAR */}
      <div className="p-3.5 bg-zinc-950/60 border border-white/5 rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search seals, runes, or buff perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-white/5">
            {(['All', 'Locked', 'Broken'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition uppercase font-bold ${
                  statusFilter === st
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {st === 'All' ? 'ALL STATUS' : st === 'Locked' ? '🔒 LOCKED' : '🔮 BROKEN'}
              </button>
            ))}
          </div>

          {/* Rarity filter */}
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg px-2.5 py-1.5 text-[10px] font-mono focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="All">ALL RARITIES</option>
            <option value="Common">COMMON</option>
            <option value="Rare">RARE</option>
            <option value="Epic">EPIC</option>
            <option value="Legendary">LEGENDARY</option>
            <option value="Divine">DIVINE</option>
            <option value="Forbidden">FORBIDDEN</option>
          </select>

        </div>

      </div>

      {/* SEALS GRID */}
      {filteredSeals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-purple-500/20 bg-zinc-950/40 rounded-xl space-y-3">
          <ShieldAlert className="h-10 w-10 text-purple-400 mx-auto animate-pulse" />
          <p className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
            NO POWER SEALS FOUND MATCHING CRITERIA
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Form a new custom seal or reset active search filters.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-xs font-mono font-bold transition inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>FORM CUSTOM POWER SEAL</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeals.map((seal) => {
            const isBroken = seal.status === 'Broken';
            const rarityStyle = RARITY_COLORS[seal.rarity] || RARITY_COLORS.Common;
            const meetsLevel = playerInfo.level >= seal.requiredLevel;
            const meetsXp = seal.costXP === 0 || playerInfo.totalXp >= seal.costXP;

            // Check linked quest & skill
            const reqQuest = seal.requiredQuestId ? state.quests.find(q => q.id === seal.requiredQuestId) : null;
            const meetsQuest = !reqQuest || reqQuest.status === 'Completed';

            const reqSkill = seal.requiredSkillId ? state.skills.find(s => s.id === seal.requiredSkillId) : null;
            const skillInfo = reqSkill ? getSkillXpAndLevel(reqSkill.id) : null;
            const meetsSkill = !reqSkill || (skillInfo && skillInfo.level >= (seal.requiredSkillLevel || 1));

            const maxStreakInSystem = state.quests.reduce((max, q) => Math.max(max, q.streakCount || 0, q.bestStreak || 0), 0);
            const meetsStreak = !seal.requiredStreakDays || maxStreakInSystem >= seal.requiredStreakDays;

            const canBreak = !isBroken && meetsLevel && meetsXp && meetsQuest && meetsSkill && meetsStreak;

            return (
              <motion.div
                key={seal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isBroken
                    ? 'bg-gradient-to-b from-purple-950/40 via-zinc-950 to-zinc-950 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                }`}
              >
                {/* Background watermark icon */}
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 pointer-events-none select-none">
                  {seal.runeSymbol || '🔮'}
                </div>

                <div className="space-y-3 relative z-10">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{seal.runeSymbol || '🔮'}</span>
                      <div>
                        <h3 className="font-display text-sm font-bold text-white tracking-wide">
                          {seal.name}
                        </h3>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${rarityStyle.badge}`}>
                          {seal.rarity} SEAL
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border flex items-center gap-1 ${
                      isBroken 
                        ? 'bg-purple-950 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-zinc-900 text-zinc-400 border-white/10'
                    }`}>
                      {isBroken ? <Unlock className="h-3 w-3 text-purple-400" /> : <Lock className="h-3 w-3 text-zinc-500" />}
                      <span>{isBroken ? 'BROKEN' : 'LOCKED'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-mono line-clamp-2 leading-relaxed">
                    {seal.description}
                  </p>

                  {/* UNLOCKED BUFF PERK DISPLAY */}
                  <div className={`p-2.5 rounded-lg border ${
                    isBroken 
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-200' 
                      : 'bg-zinc-950/60 border-white/5 text-zinc-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-mono uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        GRANTED BUFF PERK
                      </span>
                      {seal.xpBonusMultiplier && seal.xpBonusMultiplier > 1.0 && (
                        <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                          +{Math.round((seal.xpBonusMultiplier - 1.0) * 100)}% XP
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-bold text-white">{seal.buffName}</p>
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{seal.buffDescription}</p>
                  </div>

                  {/* REQUIREMENTS CHECKLIST */}
                  {!isBroken && (
                    <div className="space-y-1 pt-1 border-t border-white/5 text-[10px] font-mono">
                      <div className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                        UNSEALING REQUIREMENTS:
                      </div>
                      
                      {/* Level req */}
                      <div className={`flex items-center justify-between ${meetsLevel ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        <span>Player Level {seal.requiredLevel}+</span>
                        <span>{meetsLevel ? '✓ MET' : `LVL ${playerInfo.level}`}</span>
                      </div>

                      {/* XP cost */}
                      {seal.costXP > 0 && (
                        <div className={`flex items-center justify-between ${meetsXp ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          <span>XP Sacrifice: {seal.costXP} XP</span>
                          <span>{meetsXp ? '✓ READY' : `${playerInfo.totalXp} XP`}</span>
                        </div>
                      )}

                      {/* Required quest */}
                      {reqQuest && (
                        <div className={`flex items-center justify-between ${meetsQuest ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          <span className="truncate max-w-[170px]">Req Directive: "{reqQuest.name}"</span>
                          <span>{meetsQuest ? '✓ DONE' : 'INCOMPLETE'}</span>
                        </div>
                      )}

                      {/* Required skill */}
                      {reqSkill && (
                        <div className={`flex items-center justify-between ${meetsSkill ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          <span>Skill "{reqSkill.name}" LVL {seal.requiredSkillLevel}+</span>
                          <span>{meetsSkill ? '✓ MET' : `LVL ${skillInfo?.level || 0}`}</span>
                        </div>
                      )}

                      {/* Required streak */}
                      {seal.requiredStreakDays && seal.requiredStreakDays > 0 && (
                        <div className={`flex items-center justify-between ${meetsStreak ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          <span>Habit Streak: {seal.requiredStreakDays}+ Days</span>
                          <span>{meetsStreak ? '✓ MET' : `${maxStreakInSystem} DAYS`}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Broken At Timestamp */}
                  {isBroken && seal.brokenAt && (
                    <div className="text-[9px] font-mono text-purple-400/80 flex items-center justify-between pt-1 border-t border-purple-500/20">
                      <span>UNSEALED ON:</span>
                      <span>{new Date(seal.brokenAt).toLocaleDateString()}</span>
                    </div>
                  )}

                </div>

                {/* CARD ACTION BUTTONS */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(seal)}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white rounded transition"
                      title="Edit Power Seal"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSeal(seal.id)}
                      className="p-1.5 bg-zinc-900 hover:bg-rose-950 border border-white/10 text-zinc-400 hover:text-rose-300 rounded transition"
                      title="Delete Power Seal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {isBroken && (
                      <button
                        onClick={() => relockSeal(seal.id)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[9px] font-mono text-zinc-400 hover:text-zinc-200 rounded transition"
                        title="Relock Seal"
                      >
                        RELOCK
                      </button>
                    )}
                  </div>

                  {!isBroken ? (
                    <button
                      onClick={() => setSelectedSealForBreak(seal)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition flex items-center gap-1.5 ${
                        canBreak
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse'
                          : 'bg-zinc-900 text-zinc-600 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>{canBreak ? 'SHATTER SEAL' : 'LOCKED'}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      ACTIVE BUFF
                    </span>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* SHATTER SEAL CONFIRMATION RITUAL MODAL */}
      <AnimatePresence>
        {selectedSealForBreak && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full bg-zinc-950 border border-purple-500/50 rounded-xl p-6 space-y-4 shadow-[0_0_35px_rgba(168,85,247,0.2)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Sparkles className="h-32 w-32 text-purple-400 animate-spin" />
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{selectedSealForBreak.runeSymbol || '🔮'}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-white tracking-wide">
                      UNSEALING RITUAL: {selectedSealForBreak.name}
                    </h3>
                    <span className="text-[9px] font-mono text-purple-400 uppercase font-bold">
                      {selectedSealForBreak.rarity} POWER LIMITER
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSealForBreak(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-purple-950/30 border border-purple-500/20 p-3 rounded-lg">
                "{selectedSealForBreak.description}"
              </p>

              {/* BUFF TO BE UNLOCKED */}
              <div className="p-3 bg-zinc-900 border border-cyan-500/30 rounded-lg space-y-1">
                <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  PERMANENT PASSIVE BUFF TO UNLOCK
                </span>
                <p className="text-xs font-mono font-bold text-white">{selectedSealForBreak.buffName}</p>
                <p className="text-[10px] font-mono text-zinc-400">{selectedSealForBreak.buffDescription}</p>
              </div>

              {/* COST SACRIFICE NOTICE */}
              {selectedSealForBreak.costXP > 0 && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[10px] font-mono text-amber-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Shattering this seal sacrifices {selectedSealForBreak.costXP} XP from system reserves.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedSealForBreak(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-mono transition"
                >
                  ABORT
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerBreakSeal(selectedSealForBreak)}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider transition shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-1.5"
                >
                  <Zap className="h-4 w-4" />
                  <span>SHATTER SEAL NOW</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT SEAL MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full bg-zinc-950 border border-purple-500/40 rounded-xl p-6 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h3 className="font-display text-base font-bold text-white tracking-wide">
                    {editingSeal ? 'MODIFY POWER SEAL' : 'FORM NEW POWER SEAL'}
                  </h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSeal} className="space-y-3 text-xs font-mono">
                
                {/* Name & Rune */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Rune Symbol</label>
                    <input
                      type="text"
                      value={formData.runeSymbol}
                      onChange={(e) => setFormData({ ...formData, runeSymbol: e.target.value })}
                      placeholder="🔮"
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-center text-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Seal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Seal of Spectral Acceleration"
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Lore / Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the mental or system limitation this seal enforces..."
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Rarity & Level & XP Cost */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Rarity Tier</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value as SealRarity })}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded p-2 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Divine">Divine</option>
                      <option value="Forbidden">Forbidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Required Level</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.requiredLevel}
                      onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Cost XP Sacrifice</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={formData.costXP}
                      onChange={(e) => setFormData({ ...formData, costXP: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Linked Requirements */}
                <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded-lg space-y-2">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold">OPTIONAL LINKED REQUIREMENTS</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-0.5">Required Directive</label>
                      <select
                        value={formData.requiredQuestId}
                        onChange={(e) => setFormData({ ...formData, requiredQuestId: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded p-1.5 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">None (No quest requirement)</option>
                        {state.quests.map(q => (
                          <option key={q.id} value={q.id}>{q.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-0.5">Required Skill</label>
                      <select
                        value={formData.requiredSkillId}
                        onChange={(e) => setFormData({ ...formData, requiredSkillId: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded p-1.5 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">None (No skill requirement)</option>
                        {state.skills.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* BUFF SETTINGS */}
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg space-y-2">
                  <span className="text-[9px] font-mono uppercase text-purple-300 font-bold">GRANTED BUFF PERK CONFIGURATION</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Buff Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.buffName}
                        onChange={(e) => setFormData({ ...formData, buffName: e.target.value })}
                        placeholder="e.g. Hyper-Focus Surge"
                        className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">XP Bonus Multiplier (+%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.xpBonusPercent}
                        onChange={(e) => setFormData({ ...formData, xpBonusPercent: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-cyan-300 font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Buff Description</label>
                    <input
                      type="text"
                      value={formData.buffDescription}
                      onChange={(e) => setFormData({ ...formData, buffDescription: e.target.value })}
                      placeholder="e.g. +20% XP boost on all main directives and +2 Focus level."
                      className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Boost Attribute</label>
                      <select
                        value={formData.selectedAttributeId}
                        onChange={(e) => setFormData({ ...formData, selectedAttributeId: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-amber-300 font-bold rounded p-1.5 focus:outline-none focus:border-purple-500"
                      >
                        {state.attributes.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Attribute Level Boost (+)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.attributeBoostAmount}
                        onChange={(e) => setFormData({ ...formData, attributeBoostAmount: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-amber-300 font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-mono transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold tracking-wider transition shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    {editingSeal ? 'SAVE CHANGES' : 'CREATE POWER SEAL'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
