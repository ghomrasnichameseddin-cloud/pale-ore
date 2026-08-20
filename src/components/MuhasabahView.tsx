import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity, Weakness, MuhasabahEntry } from '../types';
import { MuhasabahModal } from './MuhasabahModal';
import { SacredMizanScale } from './SacredMizanScale';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { 
  Scale, Shield, Flame, Heart, MessageSquare, Clock, AlertTriangle, 
  Sparkles, Plus, Search, Filter, Pickaxe, CheckCircle2, RefreshCw, 
  ChevronRight, Lock, Trash2, Eye, EyeOff, HeartHandshake, Coins, Zap, ShieldAlert,
  ShieldCheck, ArrowUpDown, ArrowDown, ArrowUp, Calendar, Layers, X, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_COLORS: Record<MuhasabahCategory, { text: string; bg: string; border: string; icon: any }> = {
  Obligations: { text: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-500/40', icon: Shield },
  Desires: { text: 'text-rose-400', bg: 'bg-rose-950/30', border: 'border-rose-500/40', icon: EyeOff },
  Speech: { text: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/40', icon: MessageSquare },
  Heart: { text: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-500/40', icon: Heart },
  Rights: { text: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-500/40', icon: HeartHandshake },
  'Wasted Potential': { text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/40', icon: Clock }
};

const SEVERITY_ORDER: Record<MuhasabahSeverity, number> = {
  Critical: 5,
  Severe: 4,
  Major: 3,
  Moderate: 2,
  Minor: 1
};

type SortField = 'time' | 'severity' | 'category' | 'xp';
type SortOrder = 'desc' | 'asc';
type GroupMode = 'none' | 'category' | 'severity' | 'date';

interface MuhasabahViewProps {
  onNavigate?: (tab: any) => void;
  onOpenGuide?: (section?: string) => void;
}

export const MuhasabahView: React.FC<MuhasabahViewProps> = ({ onNavigate, onOpenGuide }) => {
  const { 
    state, getTodayMuhasabahStats, deleteMuhasabahEntry, 
    convertWeaknessToSeal, deleteWeakness, updateWeakness,
    completeQuest, recalibrateMizan
  } = usePOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [entryToDelete, setEntryToDelete] = useState<MuhasabahEntry | null>(null);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [recalibrateNotice, setRecalibrateNotice] = useState<string | null>(null);

  const [selectedEntryDetail, setSelectedEntryDetail] = useState<MuhasabahEntry | null>(null);
  const [prefillWeaknessId, setPrefillWeaknessId] = useState<string | undefined>(undefined);
  const [prefillCategory, setPrefillCategory] = useState<MuhasabahCategory | undefined>(undefined);
  const [sealForgeMessage, setSealForgeMessage] = useState<string | null>(null);

  const stats = getTodayMuhasabahStats();
  const entries = state.muhasabahEntries || [];
  const weaknesses = state.weaknesses || [];
  
  // Filtered and Sorted entries
  const processedEntries = useMemo(() => {
    const filtered = entries.filter(e => {
      const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchesSev = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchesSearch = searchQuery === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.reflection && e.reflection.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.weaknessName && e.weaknessName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSev && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'time') {
        const timeA = new Date(a.timestamp || a.date).getTime();
        const timeB = new Date(b.timestamp || b.date).getTime();
        comparison = timeA - timeB;
      } else if (sortField === 'severity') {
        const sevA = SEVERITY_ORDER[a.severity] || 1;
        const sevB = SEVERITY_ORDER[b.severity] || 1;
        comparison = sevA - sevB;
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'xp') {
        const xpA = a.xpDeducted || a.rawPenalty || 0;
        const xpB = b.xpDeducted || b.rawPenalty || 0;
        comparison = xpA - xpB;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [entries, categoryFilter, severityFilter, searchQuery, sortField, sortOrder]);

  // Grouped entries structure
  const groupedEntries = useMemo(() => {
    if (groupMode === 'none') {
      return [{ key: 'all', label: 'All Records', entries: processedEntries }];
    }

    const groupsMap = new Map<string, { label: string; entries: MuhasabahEntry[] }>();

    processedEntries.forEach(entry => {
      let groupKey = '';
      let groupLabel = '';

      if (groupMode === 'category') {
        groupKey = entry.category;
        groupLabel = `${entry.category} Realm`;
      } else if (groupMode === 'severity') {
        groupKey = entry.severity;
        groupLabel = `${entry.severity} Severity`;
      } else if (groupMode === 'date') {
        groupKey = entry.date;
        groupLabel = entry.date;
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, { label: groupLabel, entries: [] });
      }
      groupsMap.get(groupKey)!.entries.push(entry);
    });

    return Array.from(groupsMap.entries()).map(([key, val]) => ({
      key,
      label: val.label,
      entries: val.entries
    }));
  }, [processedEntries, groupMode]);

  // Active Kaffārah / Remedy Quests
  const activeKaffarahQuests = state.quests.filter(q => 
    q.status === 'Active' && 
    (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]') || q.type === 'Recovery')
  );

  const handleOpenAuditModal = (weaknessId?: string, cat?: MuhasabahCategory) => {
    setPrefillWeaknessId(weaknessId);
    setPrefillCategory(cat);
    setIsModalOpen(true);
  };

  const handleForgeSeal = (weaknessId: string) => {
    const res = convertWeaknessToSeal(weaknessId);
    if (res.success) {
      setSealForgeMessage(res.message);
      setTimeout(() => setSealForgeMessage(null), 4500);
    }
  };

  const confirmDeleteEntry = () => {
    if (entryToDelete) {
      deleteMuhasabahEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleRecalibrate = () => {
    setIsRecalibrating(true);
    const res = recalibrateMizan();
    setRecalibrateNotice(res.message || 'Sacred Mīzān Scale recalibrated and synchronized with the Sacred Ledger.');
    
    setTimeout(() => {
      setIsRecalibrating(false);
    }, 700);

    setTimeout(() => {
      setRecalibrateNotice(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 pb-12" id="muhasabah-main-view">
      {/* RECALIBRATION TOAST / NOTICE BANNER */}
      <AnimatePresence>
        {recalibrateNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-3.5 rounded-xl bg-gradient-to-r from-[#2a220e] via-[#1a1508] to-[#0c0f17] border border-[#c5a059]/60 shadow-lg flex items-center justify-between gap-3 text-xs font-mono text-[#fef08a]"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a]">
                <RefreshCw className="h-4 w-4 text-[#c5a059]" />
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-amber-200">Scale Equilibrium Recalibrated</span>
                <p className="text-[11px] text-zinc-300 font-sans mt-0.5">{recalibrateNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setRecalibrateNotice(null)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. THE SACRED MĪZĀN HERO SCALE */}
      <SacredMizanScale
        todayEarnedXP={stats.todayEarnedXP}
        todayLostXP={stats.todayLostXP}
        todayNetXP={stats.todayNetXP}
        todaySlipsCount={stats.todaySlipsCount}
        todayHasanatCount={stats.todayHasanatCount}
        mizanTilt={stats.mizanTilt}
        equilibriumStatus={stats.equilibriumStatus}
        isSpiritualLocked={stats.isSpiritualLocked}
        pendingKaffarahCount={stats.pendingKaffarahCount}
        onOpenAuditModal={() => handleOpenAuditModal()}
        onViewRemedies={() => {
          const el = document.getElementById('active-kaffarah-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onRecalibrate={handleRecalibrate}
        isRecalibrating={isRecalibrating}
        onOpenGuide={() => onOpenGuide?.('muhasabah')}
      />

      {/* 2. 1-TAP ZEN TRIAGE STRIP (FAST SLIP RECORDING) */}
      <div className="p-4 rounded-xl bg-[#0c0e14] border border-[#c5a059]/20 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#c5a059]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              1-Tap Rapid Slip Triage
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Directly open calibrated audit for specific realms
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'Obligations', cat: 'Obligations' as MuhasabahCategory, icon: Shield, color: 'text-amber-400 hover:border-amber-400/60' },
            { label: 'Desires', cat: 'Desires' as MuhasabahCategory, icon: EyeOff, color: 'text-rose-400 hover:border-rose-400/60' },
            { label: 'Speech', cat: 'Speech' as MuhasabahCategory, icon: MessageSquare, color: 'text-cyan-400 hover:border-cyan-400/60' },
            { label: 'Heart', cat: 'Heart' as MuhasabahCategory, icon: Heart, color: 'text-purple-400 hover:border-purple-400/60' },
            { label: 'Rights', cat: 'Rights' as MuhasabahCategory, icon: HeartHandshake, color: 'text-emerald-400 hover:border-emerald-400/60' },
            { label: 'Wasted Potential', cat: 'Wasted Potential' as MuhasabahCategory, icon: Clock, color: 'text-indigo-400 hover:border-indigo-400/60' }
          ].map(realm => {
            const Icon = realm.icon;
            const slipCount = entries.filter(e => e.category === realm.cat).length;
            return (
              <button
                key={realm.cat}
                onClick={() => handleOpenAuditModal(undefined, realm.cat)}
                className={`p-2.5 rounded-lg bg-[#07080c] border border-white/10 ${realm.color} text-left transition flex flex-col justify-between group hover:bg-white/5 active:scale-98`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-mono text-zinc-400">{slipCount}</span>
                </div>
                <span className="text-xs font-bold text-zinc-200 truncate">{realm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEAL FORGE SUCCESS BANNER */}
      <AnimatePresence>
        {sealForgeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-2.5">
              <Pickaxe className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{sealForgeMessage}</span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('seals')}
                className="px-3 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-white text-[11px] font-bold transition flex items-center gap-1 shrink-0"
              >
                View Ores & Chains
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN DUAL-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE KAFFĀRAH RESTITUTIONS & CHAINS OF THE NAFS */}
        <div className="lg:col-span-5 space-y-6">
          {/* ACTIVE KAFFĀRAH RESTITUTIONS CARD */}
          <div 
            id="active-kaffarah-section"
            className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    ACTIVE KAFFĀRAH RESTITUTIONS
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Tangible penance deeds to unlock spiritual equilibrium
                  </span>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                activeKaffarahQuests.length > 0 
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold' 
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              }`}>
                {activeKaffarahQuests.length} In Queue
              </span>
            </div>

            {activeKaffarahQuests.length > 0 ? (
              <div className="space-y-3">
                {activeKaffarahQuests.map(quest => (
                  <div 
                    key={quest.id}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-[#0a1215] to-[#070a0e] border border-cyan-500/30 flex flex-col justify-between gap-3 shadow-md hover:border-cyan-400/50 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-cyan-200 font-mono flex items-center gap-1.5">
                          <RubElHizbIcon className="h-3 w-3 text-cyan-400" />
                          {quest.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30">
                          +{quest.xp} XP Restitution
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono leading-relaxed line-clamp-2 mt-1">
                        {quest.description}
                      </p>
                    </div>

                    <button
                      onClick={() => completeQuest(quest.id)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:brightness-110 active:scale-98 text-black font-display text-xs font-bold tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      FULFILL KAFFĀRAH & RESTORE EQUILIBRIUM
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 rounded-xl bg-[#07090e] border border-white/5 space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto opacity-80" />
                <h4 className="text-xs font-bold text-zinc-200 font-mono">Spiritual Equilibrium Restored</h4>
                <p className="text-[11px] text-zinc-400 font-mono max-w-xs mx-auto">
                  No active penance debts pending. All shop features & perks are fully disengaged from spiritual locks.
                </p>
              </div>
            )}
          </div>

          {/* CHAINS OF THE NAFS (BEHAVIORAL WEAKNESSES) CARD */}
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    CHAINS OF THE NAFS ({weaknesses.length})
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Behavioral patterns to bind into Imperial Power Seals
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleOpenAuditModal()}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs transition"
                title="Add slip or chain"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {weaknesses.length > 0 ? (
              <div className="space-y-3">
                {weaknesses.map(weakness => {
                  const isSealed = weakness.status === 'Sealed' || !!weakness.sealId;
                  const isReadyToForge = weakness.occurrenceCount >= 5 && !isSealed;
                  const catColor = CATEGORY_COLORS[weakness.category] || CATEGORY_COLORS.Obligations;

                  return (
                    <div 
                      key={weakness.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isSealed
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : isReadyToForge
                            ? 'bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-950/30'
                            : 'bg-[#090b10] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-zinc-100 font-mono truncate">
                          {weakness.name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isSealed 
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                            : isReadyToForge
                              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse font-bold'
                              : 'bg-black/40 border-white/10 text-zinc-400'
                        }`}>
                          {weakness.status}
                        </span>
                      </div>

                      {/* Iron Chain Link Meter */}
                      <div className="my-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                          <span>Chain Links:</span>
                          <span className="text-zinc-200 font-bold">{weakness.occurrenceCount} / 5 Slips</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {[1, 2, 3, 4, 5].map(idx => (
                            <div 
                              key={idx}
                              className={`h-1.5 rounded-full transition ${
                                idx <= weakness.occurrenceCount
                                  ? idx >= 5 ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-zinc-300'
                                  : 'bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] font-mono text-zinc-400 line-clamp-1 mb-2.5">
                        Trigger: {weakness.triggerCause}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isReadyToForge ? (
                          <button
                            onClick={() => handleForgeSeal(weakness.id)}
                            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-[#c5a059] text-black font-display text-[11px] font-bold tracking-wider hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Pickaxe className="h-3.5 w-3.5" />
                            FORGE INTO POWER SEAL
                          </button>
                        ) : isSealed ? (
                          <div className="w-full py-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 text-center">
                            Bound into Imperial Power Seal ⛓️
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAuditModal(weakness.id, weakness.category)}
                            className="w-full py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 transition text-center"
                          >
                            + Record Slip on this Chain
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 px-3 rounded-xl bg-[#07090e] border border-white/5">
                <p className="text-[11px] text-zinc-500 font-mono">
                  No behavioral chains recorded yet. Record recurring slips to forge protective Power Seals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: THE SACRED LEDGER OF SLIPS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel border border-[#c5a059]/30 rounded-xl p-5 bg-[#0a0c12]/95 shadow-xl">
            {/* LEDGER HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#3a2e12]/60 border border-[#c5a059]/40 text-[#fef08a]">
                  <Scale className="h-4 w-4 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 tracking-wider">
                    THE SACRED LEDGER OF SLIPS
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Arranged audit trail ({processedEntries.length} of {entries.length} Records)
                  </span>
                </div>
              </div>

              {/* SEARCH & RECALIBRATE INPUT */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRecalibrate}
                  disabled={isRecalibrating}
                  className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 hover:border-[#c5a059]/40 text-zinc-300 hover:text-[#fef08a] transition flex items-center gap-1.5 text-xs font-mono shrink-0 shadow-sm active:scale-95"
                  title="Recalibrate scale physics & sync ledger"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRecalibrating ? 'animate-spin text-[#c5a059]' : 'text-zinc-400'}`} />
                  <span className="hidden sm:inline text-[11px] font-bold">Recalibrate</span>
                </button>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search slips, triggers..."
                    className="bg-[#080a0f] border border-white/10 focus:border-[#c5a059] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 outline-none w-full sm:w-48 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ARRANGE / SORT & GROUP CONTROLS BAR */}
            <div className="py-2.5 px-3 my-2 rounded-lg bg-[#07090e] border border-white/5 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              {/* SORT CONTROLS */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3 text-zinc-400" /> Sort:
                </span>
                <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-white/5">
                  <button
                    onClick={() => setSortField('time')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'time' ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Time
                  </button>
                  <button
                    onClick={() => setSortField('severity')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'severity' ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-500/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Severity
                  </button>
                  <button
                    onClick={() => setSortField('category')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'category' ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setSortField('xp')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      sortField === 'xp' ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-500/50' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    XP Penalty
                  </button>
                </div>

                <button
                  onClick={toggleSortOrder}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition flex items-center gap-0.5 text-[10px]"
                  title={sortOrder === 'desc' ? 'Descending (Highest/Newest first)' : 'Ascending (Lowest/Oldest first)'}
                >
                  {sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-amber-400" /> : <ArrowUp className="h-3 w-3 text-cyan-400" />}
                  <span>{sortOrder === 'desc' ? 'DESC' : 'ASC'}</span>
                </button>
              </div>

              {/* GROUP BY CONTROLS */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3 text-zinc-400" /> Group:
                </span>
                <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-white/5">
                  <button
                    onClick={() => setGroupMode('none')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'none' ? 'bg-zinc-800 text-zinc-200 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => setGroupMode('category')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'category' ? 'bg-amber-950/80 text-[#fef08a] font-bold border border-[#c5a059]/40' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Realm
                  </button>
                  <button
                    onClick={() => setGroupMode('severity')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'severity' ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-500/40' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Severity
                  </button>
                  <button
                    onClick={() => setGroupMode('date')}
                    className={`px-2 py-0.5 rounded text-[10px] transition ${
                      groupMode === 'date' ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Date
                  </button>
                </div>
              </div>
            </div>

            {/* CATEGORY & SEVERITY FILTER CHIPS */}
            <div className="space-y-2 py-2 border-b border-white/5">
              {/* Category Realm Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">Realm:</span>
                {['ALL', 'Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition ${
                      categoryFilter === cat
                        ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] font-bold'
                        : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">Severity:</span>
                {['ALL', 'Critical', 'Severe', 'Major', 'Moderate', 'Minor'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap transition ${
                      severityFilter === sev
                        ? 'bg-rose-950 border border-rose-500/60 text-rose-200 font-bold'
                        : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* ENTRIES FEED (SUPPORTS GROUPING & SORTING) */}
            <div className="space-y-4 pt-3 max-h-[680px] overflow-y-auto pr-1">
              {groupedEntries.some(g => g.entries.length > 0) ? (
                groupedEntries.map(group => {
                  if (group.entries.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-2.5">
                      {groupMode !== 'none' && (
                        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-xs">
                          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
                            {group.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded">
                            {group.entries.length} {group.entries.length === 1 ? 'audit' : 'audits'}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {group.entries.map(entry => {
                          const catConfig = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Obligations;
                          const CatIcon = catConfig.icon;
                          const isSelected = selectedEntryDetail?.id === entry.id;

                          // Time formatting
                          let formattedTime = entry.date;
                          if (entry.timestamp) {
                            try {
                              const dt = new Date(entry.timestamp);
                              formattedTime = `${entry.date} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                            } catch {
                              formattedTime = entry.date;
                            }
                          }

                          return (
                            <div 
                              key={entry.id}
                              className={`p-4 rounded-xl border transition ${
                                isSelected 
                                  ? 'bg-[#111622] border-[#c5a059]/60 shadow-lg' 
                                  : 'bg-[#080a10] border-white/10 hover:border-white/20'
                              }`}
                            >
                              {/* Entry Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className={`p-2 rounded-lg ${catConfig.bg} border ${catConfig.border} ${catConfig.text} shrink-0 mt-0.5`}>
                                    <CatIcon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-xs sm:text-sm text-zinc-100 tracking-wide break-words">
                                      {entry.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                                      <span className={`${catConfig.text} font-semibold`}>
                                        {entry.category}
                                      </span>
                                      <span>•</span>
                                      <span className="text-zinc-300 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5 text-zinc-500" />
                                        {formattedTime}
                                      </span>
                                      <span>•</span>
                                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                                        entry.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                                        entry.severity === 'Severe' ? 'bg-purple-950 text-purple-300' :
                                        entry.severity === 'Major' ? 'bg-orange-950 text-orange-300' :
                                        entry.severity === 'Moderate' ? 'bg-amber-950 text-amber-300' :
                                        'bg-blue-950 text-blue-300'
                                      }`}>
                                        {entry.severity}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Consequence Pills */}
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                                    −{entry.xpDeducted || entry.rawPenalty} XP
                                  </span>
                                  {entry.coinsDeducted ? (
                                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                                      −{entry.coinsDeducted} Coins
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              {/* Root Trigger & Reflection */}
                              <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 text-xs font-mono">
                                <div className="flex items-start gap-1.5 text-zinc-400">
                                  <span className="text-rose-400/80 font-bold shrink-0">Trigger:</span>
                                  <span className="text-zinc-300">{entry.cause}</span>
                                </div>

                                {entry.reflection && (
                                  <div className="flex items-start gap-1.5 text-zinc-400">
                                    <span className="text-amber-400/80 font-bold shrink-0">Reflection:</span>
                                    <span className="text-zinc-300">{entry.reflection}</span>
                                  </div>
                                )}

                                {entry.kaffarahTitle && (
                                  <div className="flex items-center justify-between gap-1.5 text-[11px] p-2 rounded-lg bg-[#0c141a] border border-cyan-500/20 text-cyan-200">
                                    <span className="flex items-center gap-1 font-bold">
                                      <Sparkles className="h-3 w-3 text-cyan-400" />
                                      Kaffārah: {entry.kaffarahTitle}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                      entry.kaffarahCompleted ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                                    }`}>
                                      {entry.kaffarahCompleted ? 'Fulfilled ✓' : 'Pending'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="mt-3 flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/5 text-zinc-500">
                                <span>{entry.weaknessName ? `Chain: ${entry.weaknessName}` : 'Independent slip'}</span>
                                <button
                                  onClick={() => setEntryToDelete(entry)}
                                  className="text-zinc-500 hover:text-rose-400 transition p-1 flex items-center gap-1 rounded hover:bg-rose-950/40"
                                  title="Delete audit record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 rounded-xl bg-[#07090e] border border-white/5 space-y-2">
                  <Scale className="h-10 w-10 text-zinc-600 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-300 font-mono">No Audit Records Found</h4>
                  <p className="text-[11px] text-zinc-500 font-mono max-w-xs mx-auto">
                    {searchQuery ? 'Try changing your search query or filters.' : 'Use the 3-Tap Zen Triage above to record self-accountability reflections.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE AUDIT CONFIRMATION WARNING MODAL */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-rose-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 font-mono text-zinc-200"
            >
              <div className="flex items-start justify-between pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider">
                      Delete Audit Record Warning
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      Sacred Ledger Removal Action
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                  <span className="text-zinc-400 text-[10px] block">TARGET RECORD:</span>
                  <p className="font-bold text-zinc-100">{entryToDelete.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                    <span className="text-amber-400">{entryToDelete.category}</span>
                    <span>•</span>
                    <span className="text-rose-400">{entryToDelete.severity}</span>
                    <span>•</span>
                    <span>{entryToDelete.date}</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1.5 text-[11px] text-rose-200/90 leading-relaxed font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 font-mono text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    <span>IMPORTANT CONSEQUENCE NOTICE:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-300">
                    <li>This will remove the entry from the <strong>Sacred Ledger</strong> and lighten the <strong>Sacred Mīzān Scale</strong>.</li>
                    <li>Historical profile XP & coin deductions are <strong>not refunded</strong> to prevent balance inflation.</li>
                    <li>If a linked Kaffārah quest was created, it will remain in your Quests queue until completed or removed manually.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10 text-xs">
                <button
                  onClick={() => setEntryToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEntry}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-950/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Confirm Deletion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3-TAP ZEN TRIAGE MODAL */}
      <MuhasabahModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefillWeaknessId={prefillWeaknessId}
        prefillCategory={prefillCategory}
      />
    </div>
  );
};
