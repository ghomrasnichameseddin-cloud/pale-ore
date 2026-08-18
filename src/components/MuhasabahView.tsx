import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { MuhasabahCategory, MuhasabahSeverity, Weakness, MuhasabahEntry } from '../types';
import { MuhasabahModal } from './MuhasabahModal';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';
import { 
  Scale, Shield, Flame, Heart, MessageSquare, Clock, AlertTriangle, 
  Sparkles, Plus, Search, Filter, Pickaxe, CheckCircle2, RefreshCw, 
  ArrowUpRight, Swords, ShieldCheck, ChevronRight, Lock, Trash2, Edit3, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_COLORS: Record<MuhasabahCategory, { text: string; bg: string; border: string }> = {
  Obligations: { text: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-500/40' },
  Desires: { text: 'text-rose-400', bg: 'bg-rose-950/30', border: 'border-rose-500/40' },
  Speech: { text: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/40' },
  Heart: { text: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-500/40' },
  Rights: { text: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-500/40' },
  'Wasted Potential': { text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/40' }
};

interface MuhasabahViewProps {
  onNavigate?: (tab: any) => void;
}

export const MuhasabahView: React.FC<MuhasabahViewProps> = ({ onNavigate }) => {
  const { 
    state, getTodayMuhasabahStats, deleteMuhasabahEntry, 
    convertWeaknessToSeal, deleteWeakness, updateWeakness,
    completeQuest
  } = usePOS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'weaknesses' | 'ledger' | 'remedies'>('overview');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<MuhasabahEntry | null>(null);
  const [prefillWeaknessId, setPrefillWeaknessId] = useState<string | undefined>(undefined);
  const [prefillCategory, setPrefillCategory] = useState<MuhasabahCategory | undefined>(undefined);
  const [sealForgeMessage, setSealForgeMessage] = useState<string | null>(null);

  const stats = getTodayMuhasabahStats();
  const entries = state.muhasabahEntries || [];
  const weaknesses = state.weaknesses || [];
  
  // Filtered entries
  const filteredEntries = entries.filter(e => {
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.reflection && e.reflection.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Remedy Quests (Type === 'Recovery' or name starts with [REMEDY])
  const remedyQuests = state.quests.filter(q => 
    q.type === 'Recovery' || q.name.includes('[REMEDY]')
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
      setTimeout(() => setSealForgeMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="muhasabah-main-view">
      {/* HEADER SECTION */}
      <div className="relative glass-panel border border-[#c5a059]/30 rounded-xl p-5 sm:p-6 bg-[#0a0c12]/90 shadow-xl overflow-hidden">
        <ArabesqueCorner position="top-right" color="#c5a059" size={54} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#3a2e12]/70 border border-[#c5a059]/50 text-[#fef08a] shadow-inner">
              <Scale className="h-6 w-6 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-widest text-[#fef08a] flex items-center gap-2">
                  <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                  MUHĀSABAH
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#181308] border border-[#c5a059]/40 text-[#e5c875] px-2 py-0.5 rounded font-bold">
                  Self-Accountability Chamber
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Record slips, reflect on root causes, absorb bounded XP friction, and forge corrective power seals.
              </p>
            </div>
          </div>

          {/* QUICK RECORD BUTTON */}
          <button
            onClick={() => handleOpenAuditModal()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-[#c5a059] to-amber-500 text-black font-display text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
            id="open-muhasabah-audit-btn"
          >
            <Scale className="h-4 w-4" />
            RECORD SLIP AUDIT
          </button>
        </div>

        {/* DAILY XP PENALTY & INTEGRITY METER */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-[#c5a059]/20">
          {/* Daily XP Loss Cap Meter */}
          <div className="p-3 rounded-lg bg-[#0e111a] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Today's XP Loss:</span>
              <span className="text-rose-400 font-bold">−{stats.todayLostXP} / −500 XP</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 my-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.todayLostXP / 500) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {stats.dailyCapRemaining > 0 ? `${stats.dailyCapRemaining} XP headroom remaining today` : 'Daily XP loss limit reached'}
            </span>
          </div>

          {/* Today's Net XP Balance */}
          <div className="p-3 rounded-lg bg-[#0e111a] border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-mono text-zinc-400">Today's Net Trajectory:</span>
            <div className="flex items-baseline gap-2 my-1">
              <span className={`text-xl font-display font-bold ${stats.todayNetXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.todayNetXP >= 0 ? `+${stats.todayNetXP}` : `${stats.todayNetXP}`} XP
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                (+{stats.todayEarnedXP} / −{stats.todayLostXP})
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Earned from directives minus slips
            </span>
          </div>

          {/* Active Weaknesses Count */}
          <div className="p-3 rounded-lg bg-[#0e111a] border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-mono text-zinc-400">Behavioral Weaknesses:</span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-xl font-display font-bold text-amber-400">
                {stats.activeWeaknessesCount}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Active ({stats.sealedWeaknessesCount} Sealed)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Triggers with ≥5 occurrences
            </span>
          </div>

          {/* Remedy Quests Active */}
          <div className="p-3 rounded-lg bg-[#0e111a] border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-mono text-zinc-400">Active Restitutions:</span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-xl font-display font-bold text-cyan-400">
                {remedyQuests.filter(q => q.status === 'Active').length}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Remedies in Queue
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Recover 10–30% of lost XP
            </span>
          </div>
        </div>
      </div>

      {/* SEAL FORGE BANNER FEEDBACK */}
      <AnimatePresence>
        {sealForgeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Pickaxe className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{sealForgeMessage}</span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('seals')}
                className="px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-white text-[11px] font-bold transition flex items-center gap-1"
              >
                View in Ores & Chains
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          Audit Overview & Realms
        </button>

        <button
          onClick={() => setActiveSubTab('weaknesses')}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
            activeSubTab === 'weaknesses'
              ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Weaknesses Registry ({weaknesses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
            activeSubTab === 'ledger'
              ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Historical Ledger ({entries.length})
        </button>

        <button
          onClick={() => setActiveSubTab('remedies')}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
            activeSubTab === 'remedies'
              ? 'bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          Remedy Quests ({remedyQuests.length})
        </button>
      </div>

      {/* SUB-TAB 1: AUDIT OVERVIEW & CATEGORY REALMS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* THE 6 CORE CATEGORIES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
                <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                Self-Examination Realms
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                Click any realm for instant focused audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                { 
                  cat: 'Obligations' as MuhasabahCategory, 
                  icon: Shield, 
                  color: 'text-amber-400',
                  bg: 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400',
                  desc: 'Fajr & prayer punctuality, mandatory duties, fulfilling covenants.',
                  slips: entries.filter(e => e.category === 'Obligations').length
                },
                { 
                  cat: 'Desires' as MuhasabahCategory, 
                  icon: Flame, 
                  color: 'text-rose-400',
                  bg: 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400',
                  desc: 'Appetite, impulse purchases, mindless comfort traps, unrestrained consumption.',
                  slips: entries.filter(e => e.category === 'Desires').length
                },
                { 
                  cat: 'Speech' as MuhasabahCategory, 
                  icon: MessageSquare, 
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400',
                  desc: 'Idle chatter, harshness, arguing, complaints, sarcasm, gossip.',
                  slips: entries.filter(e => e.category === 'Speech').length
                },
                { 
                  cat: 'Heart' as MuhasabahCategory, 
                  icon: Heart, 
                  color: 'text-purple-400',
                  bg: 'bg-purple-950/20 border-purple-500/30 hover:border-purple-400',
                  desc: 'Envy, arrogance, ungratefulness, despair, seeking validation, hidden pride.',
                  slips: entries.filter(e => e.category === 'Heart').length
                },
                { 
                  cat: 'Rights' as MuhasabahCategory, 
                  icon: Scale, 
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400',
                  desc: 'Neglect of parents, spouse, kin, colleagues, withholding rights, breaking trust.',
                  slips: entries.filter(e => e.category === 'Rights').length
                },
                { 
                  cat: 'Wasted Potential' as MuhasabahCategory, 
                  icon: Clock, 
                  color: 'text-indigo-400',
                  bg: 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-400',
                  desc: 'Endless feed scrolling, procrastination, unstructured drift, laziness.',
                  slips: entries.filter(e => e.category === 'Wasted Potential').length
                }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.cat}
                    className={`glass-panel border rounded-xl p-4 flex flex-col justify-between transition group ${item.bg}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <h4 className="font-display text-sm font-bold text-zinc-100 tracking-wide">
                            {item.cat}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-zinc-300">
                          {item.slips} recorded
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-4">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenAuditModal(undefined, item.cat)}
                      className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Record in {item.cat}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT SLIPS AUDIT TRAIL */}
          <div className="glass-panel border border-white/10 rounded-xl p-5 bg-[#0a0c12]/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#c5a059]" />
                Recent Accountability Reflections
              </h3>
              <button
                onClick={() => setActiveSubTab('ledger')}
                className="text-xs font-mono text-[#c5a059] hover:underline flex items-center gap-1"
              >
                View Complete Ledger ({entries.length})
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 font-mono text-xs">
                No slips recorded yet. When a behavioral deviation occurs, record it honestly to trigger XP friction and issue corrective remedies.
              </div>
            ) : (
              <div className="space-y-2.5">
                {entries.slice(0, 5).map(entry => {
                  const catStyle = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Wasted Potential'];
                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-[#0e111a] border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.border} ${catStyle.text} font-bold`}>
                            {entry.category}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                            −{entry.xpDeducted} XP ({entry.severity})
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {entry.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-200">
                          {entry.title}
                        </h4>
                        <p className="text-[11px] font-mono text-zinc-400 line-clamp-1">
                          <strong className="text-zinc-300">Trigger:</strong> {entry.cause}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {entry.correctiveQuestName && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            Remedy Linked
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedEntryDetail(entry)}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-zinc-300 border border-white/10 transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WEAKNESSES REGISTRY */}
      {activeSubTab === 'weaknesses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Behavioral Weakness Registry
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                5 repeated occurrences elevate a trigger into an Active Weakness. Forge a Weakness Seal to bind it into the Imperial Ores chamber.
              </p>
            </div>
            <button
              onClick={() => handleOpenAuditModal()}
              className="px-3.5 py-1.5 rounded-lg bg-[#3a2e12] border border-[#c5a059]/60 text-[#fef08a] text-xs font-mono font-bold hover:bg-[#524017] transition flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Entry
            </button>
          </div>

          {weaknesses.length === 0 ? (
            <div className="glass-panel border border-white/10 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
              No behavioral weaknesses recorded yet. Slips logged in Muhāsabah automatically populate this registry.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weaknesses.map(weakness => {
                const isSealable = weakness.occurrenceCount >= 3 && !weakness.sealId;
                const isThresholdReached = weakness.occurrenceCount >= 5;
                const catStyle = CATEGORY_COLORS[weakness.category] || CATEGORY_COLORS['Wasted Potential'];

                return (
                  <div
                    key={weakness.id}
                    className={`glass-panel border rounded-xl p-5 bg-[#0a0c12]/90 flex flex-col justify-between transition ${
                      weakness.status === 'Sealed'
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : isThresholdReached 
                        ? 'border-amber-500/50 bg-[#120f08]'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.border} ${catStyle.text} font-bold`}>
                              {weakness.category}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                              weakness.status === 'Sealed'
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                : weakness.status === 'Active'
                                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}>
                              {weakness.status}
                            </span>
                          </div>
                          <h4 className="font-display text-base font-bold text-zinc-100 tracking-wide mt-1.5">
                            {weakness.name}
                          </h4>
                        </div>

                        {/* Occurrence Badge */}
                        <div className="text-right">
                          <span className="text-xl font-display font-bold text-amber-400">
                            {weakness.occurrenceCount}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 block">
                            Occurrences
                          </span>
                        </div>
                      </div>

                      {/* Occurrence Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span>Weakness Threshold</span>
                          <span>{weakness.occurrenceCount} / 5</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              weakness.occurrenceCount >= 5 ? 'bg-amber-400' : 'bg-zinc-600'
                            }`}
                            style={{ width: `${Math.min(100, (weakness.occurrenceCount / 5) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="p-2 rounded bg-black/40 border border-white/5">
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Root Trigger Cause:</span>
                          <span className="text-zinc-300">{weakness.triggerCause}</span>
                        </div>
                        {weakness.correctiveStrategy && (
                          <div className="p-2 rounded bg-black/40 border border-white/5">
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Defense Strategy:</span>
                            <span className="text-cyan-300">{weakness.correctiveStrategy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenAuditModal(weakness.id, weakness.category)}
                        className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 border border-white/10 transition flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Log Slip
                      </button>

                      {weakness.sealId ? (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Bound to Power Seal
                        </span>
                      ) : (
                        <button
                          onClick={() => handleForgeSeal(weakness.id)}
                          className="px-3.5 py-1.5 rounded bg-gradient-to-r from-amber-700 to-[#c5a059] text-black text-xs font-mono font-bold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 shadow"
                          title="Bind this persistent weakness into a shatterable Power Seal"
                        >
                          <Pickaxe className="h-3.5 w-3.5" />
                          Forge Weakness Seal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: HISTORICAL ACCOUNTABILITY LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel border border-white/10 rounded-xl p-3.5 bg-[#0a0c12]/80">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search slips, causes, reflections..."
                className="w-full bg-[#0d1017] border border-white/10 focus:border-[#c5a059] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['ALL', 'Obligations', 'Desires', 'Speech', 'Heart', 'Rights', 'Wasted Potential'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition whitespace-nowrap ${
                    categoryFilter === cat 
                      ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/60 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 bg-white/5 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* LEDGER ENTRIES LIST */}
          {filteredEntries.length === 0 ? (
            <div className="glass-panel border border-white/10 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
              No matching accountability entries found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEntries.map(entry => {
                const catStyle = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Wasted Potential'];
                return (
                  <div
                    key={entry.id}
                    className="glass-panel border border-white/10 rounded-xl p-4 bg-[#0a0c12]/90 hover:border-white/20 transition space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.border} ${catStyle.text} font-bold`}>
                          {entry.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                          −{entry.xpDeducted} XP ({entry.severity})
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {entry.date} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteMuhasabahEntry(entry.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">
                        {entry.title}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded bg-black/40 border border-white/5">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Root Trigger Cause:</span>
                        <span className="text-zinc-300">{entry.cause}</span>
                      </div>
                      {entry.reflection && (
                        <div className="p-2.5 rounded bg-black/40 border border-white/5">
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Reflection & Resolution:</span>
                          <span className="text-cyan-300">{entry.reflection}</span>
                        </div>
                      )}
                    </div>

                    {entry.correctiveQuestName && (
                      <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 text-cyan-300">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Restitution Directive: {entry.correctiveQuestName}</span>
                        </div>
                        <span className="text-emerald-400 font-bold text-[11px]">
                          +{entry.recoveredXP} XP ({entry.recoveryPercentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: REMEDY RESTITUTION DIRECTIVES */}
      {activeSubTab === 'remedies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Corrective Restitution Directives
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Executing remedy directives reclaims 10–30% of deducted XP to restore momentum.
              </p>
            </div>
          </div>

          {remedyQuests.length === 0 ? (
            <div className="glass-panel border border-white/10 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
              No active restitution directives. When recording a Muhāsabah audit, keep "Issue Corrective Restitution Quest" enabled.
            </div>
          ) : (
            <div className="space-y-3">
              {remedyQuests.map(quest => (
                <div
                  key={quest.id}
                  className={`glass-panel border rounded-xl p-4 bg-[#0a0c12]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    quest.status === 'Completed'
                      ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                      : 'border-cyan-500/30 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
                        RESTITUTION
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        +{quest.xp} XP Restitution
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {quest.deadline || 'Today'}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${quest.status === 'Completed' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                      {quest.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 whitespace-pre-line">
                      {quest.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {quest.status === 'Completed' ? (
                      <span className="px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Restitution Executed
                      </span>
                    ) : (
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-display text-xs font-bold tracking-wider active:scale-95 transition flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        COMPLETE REMEDY (+{quest.xp} XP)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedEntryDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-[#c5a059]/40 rounded-xl bg-[#0a0c12] max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono text-[#fef08a] font-bold">
                AUDIT DETAIL: {selectedEntryDetail.category}
              </span>
              <button 
                onClick={() => setSelectedEntryDetail(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">Title:</span>
                <span className="text-sm font-bold text-zinc-100">{selectedEntryDetail.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">−{selectedEntryDetail.xpDeducted} XP</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">Severity: {selectedEntryDetail.severity}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{selectedEntryDetail.date}</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-white/5">
                <span className="text-zinc-500 uppercase block text-[10px]">Root Trigger:</span>
                <span className="text-zinc-300">{selectedEntryDetail.cause}</span>
              </div>
              {selectedEntryDetail.reflection && (
                <div className="p-2.5 rounded bg-zinc-900/60 border border-white/5">
                  <span className="text-zinc-500 uppercase block text-[10px]">Resolution & Strategy:</span>
                  <span className="text-cyan-300">{selectedEntryDetail.reflection}</span>
                </div>
              )}
              {selectedEntryDetail.correctiveQuestName && (
                <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/20">
                  <span className="text-cyan-400 uppercase block text-[10px]">Corrective Remedy:</span>
                  <span className="text-zinc-200">{selectedEntryDetail.correctiveQuestName} (+{selectedEntryDetail.recoveredXP} XP)</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEntryDetail(null)}
                className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs font-mono text-zinc-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK AUDIT MODAL */}
      <MuhasabahModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefillWeaknessId={prefillWeaknessId}
        prefillCategory={prefillCategory}
      />
    </div>
  );
};
