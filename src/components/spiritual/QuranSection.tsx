import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Flame,
  Search,
  Filter,
  ArrowRight,
  Shield,
  Layers,
  Heart,
  ChevronRight,
  HelpCircle,
  Edit2
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import {
  QuranPassage,
  QuranRevisionStatus,
  QuranReflection,
  SpiritualDailyLog
} from '../../types';
import { RubElHizbIcon, ArabesqueCorner } from '../IslamicRpgDecorations';

interface QuranSectionProps {
  systemDate: string;
  spiritualLog: SpiritualDailyLog;
  onOpenGuide?: (section?: string) => void;
}

export const QuranSection: React.FC<QuranSectionProps> = ({
  systemDate,
  spiritualLog,
  onOpenGuide
}) => {
  const {
    quranTracker,
    updateQuranTracker,
    addQuranPassage,
    updateQuranPassage,
    deleteQuranPassage,
    advancePassageRevisionStatus,
    markPassageRevised,
    addQuranReflection,
    deleteQuranReflection,
    getQuranFreshnessScore,
    updateQuranLog
  } = usePOS();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'tilawah' | 'revision' | 'memorization' | 'reflection'>('revision');

  // Filter for Revision Queue
  const [revisionFilter, setRevisionFilter] = useState<'all' | 'weak' | 'due' | 'stable'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Passage Modal / Inline Form
  const [showAddPassageModal, setShowAddPassageModal] = useState(false);
  const [passageSurahName, setPassageSurahName] = useState('');
  const [passageSurahNumber, setPassageSurahNumber] = useState<number | ''>('');
  const [passageAyahStart, setPassageAyahStart] = useState<number | ''>('');
  const [passageAyahEnd, setPassageAyahEnd] = useState<number | ''>('');
  const [passageStatus, setPassageStatus] = useState<QuranRevisionStatus>('due');
  const [passageNotes, setPassageNotes] = useState('');

  // Reflection Form State
  const [showAddReflModal, setShowAddReflModal] = useState(false);
  const [reflSurahName, setReflSurahName] = useState('');
  const [reflSurahNumber, setReflSurahNumber] = useState<number | ''>('');
  const [reflAyahNumber, setReflAyahNumber] = useState<number | ''>('');
  const [reflAyahText, setReflAyahText] = useState('');
  const [reflText, setReflText] = useState('');
  const [reflActionItem, setReflActionItem] = useState('');

  // Tilawah quick state
  const quranLog = spiritualLog.quran || { pagesRead: 0, passagesRevisedToday: [] };
  const freshness = getQuranFreshnessScore();

  const handleAddPassageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passageSurahName.trim()) return;

    addQuranPassage({
      surahName: passageSurahName.trim(),
      surahNumber: Number(passageSurahNumber) || 1,
      ayahStart: Number(passageAyahStart) || 1,
      ayahEnd: Number(passageAyahEnd) || Number(passageAyahStart) || 1,
      status: passageStatus,
      notes: passageNotes.trim() || undefined
    });

    // Reset
    setPassageSurahName('');
    setPassageSurahNumber('');
    setPassageAyahStart('');
    setPassageAyahEnd('');
    setPassageStatus('due');
    setPassageNotes('');
    setShowAddPassageModal(false);
  };

  const handleAddReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflSurahName.trim() || !reflText.trim()) return;

    addQuranReflection({
      surahName: reflSurahName.trim(),
      surahNumber: Number(reflSurahNumber) || 1,
      ayahNumber: Number(reflAyahNumber) || 1,
      ayahText: reflAyahText.trim() || undefined,
      reflectionText: reflText.trim(),
      practicalActionItem: reflActionItem.trim() || undefined
    }, systemDate);

    // Reset
    setReflSurahName('');
    setReflSurahNumber('');
    setReflAyahNumber('');
    setReflAyahText('');
    setReflText('');
    setReflActionItem('');
    setShowAddReflModal(false);
  };

  const handleQuickPageChange = (delta: number) => {
    const currentPages = quranLog.pagesRead || 0;
    const newPages = Math.max(0, currentPages + delta);
    updateQuranLog({ pagesRead: newPages }, systemDate);
  };

  // Filter passages
  const passages = quranTracker.passages || [];
  const filteredPassages = passages.filter(p => {
    if (revisionFilter !== 'all' && p.status !== revisionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.surahName.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const weakList = passages.filter(p => p.status === 'weak');
  const dueList = passages.filter(p => p.status === 'due');
  const stableList = passages.filter(p => p.status === 'stable');

  return (
    <div className="space-y-6" id="quran-sanctum-root">
      
      {/* 1. HEADER SANCTUM BANNER */}
      <div className="glass-panel rounded-2xl p-5 border border-[var(--border-accent,#c5a059)] bg-gradient-to-r from-[var(--bg-void,#050608)] via-[var(--bg-card,#0c0e14)] to-[var(--bg-void,#050608)] relative overflow-hidden shadow-xl">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright,#fef08a)]" />
              <span className="text-[10px] font-mono text-[var(--accent-highlight,#fef08a)] font-bold tracking-widest uppercase">
                SACRED PROTOCOL • QUR'ĀN SANCTUM
              </span>
            </div>
            <h3 className="text-xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
              <span>QUR’ĀN COMPANIONSHIP</span>
              <span className="text-xs font-mono font-normal text-amber-200/80 px-2 py-0.5 bg-[var(--accent-surface,#c5a059)]/20 border border-[var(--border-accent,#c5a059)]/30 rounded-full">
                إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
              </span>
            </h3>
            <p className="text-xs text-zinc-300 font-sans max-w-2xl">
              Tilāwah to revive the soul, Ḥifẓ to anchor the divine words, systematic Revision to prevent slip, and Tadabbur to transform conduct.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddPassageModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] hover:brightness-110 text-[var(--bg-void,#050608)] font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>ENROLL PASSAGE</span>
            </button>

            <button
              onClick={() => setShowAddReflModal(true)}
              className="px-3 py-2 bg-[var(--bg-surface,#141824)] hover:bg-[var(--accent-surface,#c5a059)]/20 border border-[var(--border-subtle,rgba(197,160,89,0.2))] text-zinc-300 hover:text-white font-mono text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              <span>LOG TADABBUR</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={() => onOpenGuide('spiritual-core')}
                className="p-2 bg-[var(--bg-surface,#141824)] hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl transition cursor-pointer"
                title="Sacred Manual"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* METRICS & FRESHNESS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[var(--border-subtle,rgba(197,160,89,0.2))] text-xs font-mono">
          {/* Qur'an Freshness */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">QUR’ĀN FRESHNESS</span>
              <Shield className="h-3 w-3 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-[var(--accent-highlight,#fef08a)]">
                {freshness.score}%
              </span>
              <span className="text-[10px] text-zinc-400">
                {freshness.labelAr}
              </span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${
                  freshness.score >= 80 ? 'bg-emerald-400' :
                  freshness.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${freshness.score}%` }}
              />
            </div>
          </div>

          {/* Today's Tilawah */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">TODAY'S TILĀWAH</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {quranLog.pagesRead || 0} Pages
              </span>
              <span className="text-[10px] text-zinc-400">
                {quranTracker.targetPagesPerDay || 20} Target
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 block">
              Juz {quranTracker.currentJuz || 1} • {quranTracker.currentSurah || 'Al-Baqarah'}
            </span>
          </div>

          {/* Revision Queue Status */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">REVISION PIPELINE</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold">
              <span className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30">
                {freshness.weakCount} Weak
              </span>
              <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                {freshness.dueCount} Due
              </span>
              <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {freshness.stableCount} Stable
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 block">
              Flow: Weak → Due → Stable
            </span>
          </div>

          {/* Reflections Logged */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">TADABBUR COVENANTS</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-violet-300 flex items-center gap-1">
                <Heart className="h-4 w-4 text-rose-400" />
                {(quranTracker.reflections || []).length} Entries
              </span>
              <span className="text-[10px] text-zinc-400">
                {quranLog.tadabburNotes ? 'Logged Today ✓' : 'Pending'}
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 block">
              Continuous Contemplation
            </span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle,rgba(197,160,89,0.2))] pb-3">
        <button
          onClick={() => setActiveSubTab('revision')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'revision'
              ? 'bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] border border-[var(--border-accent,#c5a059)]'
              : 'text-zinc-400 hover:text-white bg-[var(--bg-surface,#141824)] border border-transparent'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>REVISION QUEUE (مراجعة)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
            {passages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('tilawah')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tilawah'
              ? 'bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] border border-[var(--border-accent,#c5a059)]'
              : 'text-zinc-400 hover:text-white bg-[var(--bg-surface,#141824)] border border-transparent'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>TILĀWAH (تلاوة)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-emerald-300">
            {quranLog.pagesRead || 0}p
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('memorization')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'memorization'
              ? 'bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] border border-[var(--border-accent,#c5a059)]'
              : 'text-zinc-400 hover:text-white bg-[var(--bg-surface,#141824)] border border-transparent'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>MEMORIZATION (حفظ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reflection')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'reflection'
              ? 'bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] border border-[var(--border-accent,#c5a059)]'
              : 'text-zinc-400 hover:text-white bg-[var(--bg-surface,#141824)] border border-transparent'
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          <span>REFLECTION (تدبر)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-violet-300">
            {(quranTracker.reflections || []).length}
          </span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {/* ── SUB-TAB A: REVISION QUEUE (Weak -> Due -> Stable) ── */}
      {activeSubTab === 'revision' && (
        <div className="space-y-4">
          {/* Filter Bar & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--bg-surface,#141824)] p-3 rounded-xl border border-[var(--border-subtle,rgba(197,160,89,0.2))]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Queue:
              </span>
              {(['all', 'weak', 'due', 'stable'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRevisionFilter(tab)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition capitalize cursor-pointer ${
                    revisionFilter === tab
                      ? 'bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] font-bold border border-[var(--border-accent,#c5a059)]'
                      : 'text-zinc-400 hover:text-white bg-zinc-800/60'
                  }`}
                >
                  {tab === 'all' ? `All (${passages.length})` :
                   tab === 'weak' ? `Weak (${weakList.length})` :
                   tab === 'due' ? `Due (${dueList.length})` :
                   `Stable (${stableList.length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search surah..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-void,#050608)] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-zinc-700/60 focus:border-[var(--border-accent,#c5a059)] outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddPassageModal(true)}
                className="px-3 py-1.5 bg-[var(--accent-surface,#c5a059)] hover:bg-[var(--accent-surface-hover,#d5b069)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono font-bold rounded-lg border border-[var(--border-accent,#c5a059)] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Queue Description Box */}
          <div className="p-3 bg-[var(--bg-card,#0c0e14)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl text-xs font-mono text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>REVISION SEQUENCE: <strong className="text-rose-400">Weak</strong> → <strong className="text-amber-400">Due</strong> → <strong className="text-emerald-400">Stable</strong>. Periodic revision prevents escape (التَّفَلُّت).</span>
            </div>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">Clicking "Revise" advances status</span>
          </div>

          {/* Passages List */}
          {filteredPassages.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl p-6 bg-[var(--bg-surface,#141824)]/50">
              <BookOpen className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-display text-zinc-300">No passages match this filter</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">Enroll your memorized chapters to maintain systematic revision.</p>
              <button
                onClick={() => setShowAddPassageModal(true)}
                className="mt-3 px-4 py-2 bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono font-bold rounded-xl border border-[var(--border-accent,#c5a059)]"
              >
                Enroll New Passage
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPassages.map(passage => {
                const isWeak = passage.status === 'weak';
                const isDue = passage.status === 'due';
                const isStable = passage.status === 'stable';

                return (
                  <div
                    key={passage.id}
                    className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
                      isWeak ? 'bg-rose-950/20 border-rose-500/30' :
                      isDue ? 'bg-amber-950/20 border-amber-500/30' :
                      'bg-emerald-950/15 border-emerald-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                              isWeak ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                              isDue ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                              'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {isWeak ? '⚠️ Weak (يحتاج تعاهداً)' :
                               isDue ? '⏳ Due for Review (حان موعده)' :
                               '✓ Stable (راسخ)'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Surah #{passage.surahNumber}
                            </span>
                          </div>
                          <h4 className="text-base font-display font-bold text-white mt-1">
                            {passage.surahName}
                          </h4>
                          <span className="text-xs font-mono text-zinc-300">
                            Ayah {passage.ayahStart} – {passage.ayahEnd}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteQuranPassage(passage.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
                            title="Delete passage"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {passage.notes && (
                        <p className="text-xs text-zinc-400 font-sans italic mt-2 bg-black/20 p-2 rounded-lg border border-white/5">
                          "{passage.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 block">
                          Last Revised: {passage.lastRevisedDate || 'Never'}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          Total Cycles: {passage.revisionCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isStable ? (
                          <>
                            <button
                              onClick={() => advancePassageRevisionStatus(passage.id, 'weak')}
                              className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-lg text-[11px] font-mono transition cursor-pointer"
                              title="Flag passage as weak if slipping"
                            >
                              Flag Weak
                            </button>
                            <button
                              onClick={() => markPassageRevised(passage.id, systemDate)}
                              className="px-3 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Revised ✓</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => markPassageRevised(passage.id, systemDate)}
                            className="px-3 py-1 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] hover:brightness-110 text-[var(--bg-void,#050608)] rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer shadow"
                          >
                            <span>Advance ({isWeak ? '→ Due' : '→ Stable'})</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB B: TILĀWAH (Daily Reading & Khatmah) ── */}
      {activeSubTab === 'tilawah' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Quick Page Logger */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">DAILY READING LOG</span>
                <BookOpen className="h-4 w-4 text-emerald-400" />
              </div>

              <div className="text-center py-2">
                <span className="text-4xl font-display font-extrabold text-white">
                  {quranLog.pagesRead || 0}
                </span>
                <span className="text-xs font-mono text-zinc-400 block mt-1">
                  Pages Read on {systemDate}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleQuickPageChange(-5)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs rounded-xl font-bold transition"
                >
                  -5
                </button>
                <button
                  onClick={() => handleQuickPageChange(-1)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs rounded-xl font-bold transition"
                >
                  -1
                </button>
                <button
                  onClick={() => handleQuickPageChange(1)}
                  className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded-xl font-bold transition"
                >
                  +1
                </button>
                <button
                  onClick={() => handleQuickPageChange(5)}
                  className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded-xl font-bold transition"
                >
                  +5
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Daily Goal:</span>
                  <span className="text-amber-300 font-bold">{quranTracker.targetPagesPerDay || 20} Pages (1 Juz)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round(((quranLog.pagesRead || 0) / (quranTracker.targetPagesPerDay || 20)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bookmark & Location */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">CURRENT BOOKMARK</span>
                <RubElHizbIcon className="h-4 w-4 text-amber-400" />
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-zinc-400 block mb-1">Current Surah:</label>
                  <input
                    type="text"
                    value={quranTracker.currentSurah || ''}
                    onChange={e => updateQuranTracker({ currentSurah: e.target.value })}
                    placeholder="e.g. Al-Kahf"
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-[var(--border-accent,#c5a059)] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Juz (1-30):</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={quranTracker.currentJuz || 1}
                      onChange={e => updateQuranTracker({ currentJuz: Number(e.target.value) || 1 })}
                      className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-[var(--border-accent,#c5a059)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Page (1-604):</label>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={quranTracker.currentPage || 1}
                      onChange={e => updateQuranTracker({ currentPage: Number(e.target.value) || 1 })}
                      className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-[var(--border-accent,#c5a059)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Khatmah Counter */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-violet-300 font-bold">KHATMAH CYCLE</span>
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <p className="text-xs text-zinc-300 font-sans mt-2 leading-relaxed">
                  Completing the entire Qur'an in a regular cycle of 30 or 40 days seals divine light upon the believer's life.
                </p>
              </div>

              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">Total Completed:</span>
                  <span className="text-base font-bold text-amber-300">{quranTracker.khatmahCount || 0} Khatmahs</span>
                </div>
                <button
                  onClick={() => {
                    const next = (quranTracker.khatmahCount || 0) + 1;
                    updateQuranTracker({
                      khatmahCount: next,
                      currentPage: 1,
                      currentJuz: 1,
                      lastKhatmahDate: systemDate
                    });
                  }}
                  className="w-full py-2 bg-[var(--accent-surface,#c5a059)] hover:bg-[var(--accent-surface-hover,#d5b069)] text-[var(--accent-highlight,#fef08a)] font-mono text-xs font-bold rounded-lg border border-[var(--border-accent,#c5a059)] cursor-pointer"
                >
                  Seal &amp; Log Complete Khatmah
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── SUB-TAB C: MEMORIZATION (Hifdh Track) ── */}
      {activeSubTab === 'memorization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Active Memorization Target */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">CURRENT ACTIVE MEMORIZATION</span>
                <Layers className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Commit new verses to heart daily before linking them to the revision queue.
              </p>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Target Surah:</label>
                  <input
                    type="text"
                    value={quranTracker.memorizationTargetSurah || ''}
                    onChange={e => updateQuranTracker({ memorizationTargetSurah: e.target.value })}
                    placeholder="e.g. Surah Al-Kahf"
                    className="w-full bg-[var(--bg-void,#050608)] text-xs text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Ayah Range:</label>
                  <input
                    type="text"
                    value={quranTracker.memorizationTargetAyahRange || ''}
                    onChange={e => updateQuranTracker({ memorizationTargetAyahRange: e.target.value })}
                    placeholder="e.g. 1-10"
                    className="w-full bg-[var(--bg-void,#050608)] text-xs text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Total Memorized Pages:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={quranTracker.memorizedPagesCount || 0}
                    onChange={e => updateQuranTracker({ memorizedPagesCount: Number(e.target.value) || 0 })}
                    className="w-20 bg-[var(--bg-void,#050608)] text-xs text-white text-right px-2 py-1 rounded-lg border border-zinc-700 outline-none"
                  />
                  <span className="text-xs font-mono text-zinc-500">Pages</span>
                </div>
              </div>
            </div>

            {/* Quick Inscribe into Revision Queue */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">INSCRIBE TO QUEUE</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-display font-bold text-white mt-2">
                  Ready to add completed memorization?
                </h4>
                <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                  When a new passage is memorized, immediately enroll it into the <strong>Weak</strong> or <strong>Due</strong> tier so it enters your daily revision schedule.
                </p>
              </div>

              <button
                onClick={() => {
                  if (quranTracker.memorizationTargetSurah) {
                    setPassageSurahName(quranTracker.memorizationTargetSurah);
                  }
                  setShowAddPassageModal(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] hover:brightness-110 text-[var(--bg-void,#050608)] font-mono font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                Inscribe to Revision Queue
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── SUB-TAB D: REFLECTION (Tadabbur Journal) ── */}
      {activeSubTab === 'reflection' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[var(--bg-surface,#141824)] p-3 rounded-xl border border-[var(--border-subtle,rgba(197,160,89,0.2))]">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-mono text-zinc-300">
                <strong>TADABBUR REPOSITORY:</strong> Record profound insights, divine warnings, and covenants of action.
              </span>
            </div>

            <button
              onClick={() => setShowAddReflModal(true)}
              className="px-3 py-1.5 bg-[var(--accent-surface,#c5a059)] hover:bg-[var(--accent-surface-hover,#d5b069)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono font-bold rounded-lg border border-[var(--border-accent,#c5a059)] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Reflection</span>
            </button>
          </div>

          {/* Reflections List */}
          {(!quranTracker.reflections || quranTracker.reflections.length === 0) ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl p-6 bg-[var(--bg-surface,#141824)]/50">
              <Heart className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-display text-zinc-300">No reflections logged yet</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                «أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا»
              </p>
              <button
                onClick={() => setShowAddReflModal(true)}
                className="mt-3 px-4 py-2 bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono font-bold rounded-xl border border-[var(--border-accent,#c5a059)]"
              >
                Log First Ayah Tadabbur
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {quranTracker.reflections.map(refl => (
                <div
                  key={refl.id}
                  className="p-4 rounded-xl bg-[var(--bg-card,#0c0e14)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-2 relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          {refl.surahName} : Ayah {refl.ayahNumber}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {refl.date}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteQuranReflection(refl.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg transition"
                      title="Delete reflection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {refl.ayahText && (
                    <p className="text-xs text-amber-200/90 font-serif leading-relaxed bg-black/30 p-2.5 rounded-lg border border-amber-500/20">
                      «{refl.ayahText}»
                    </p>
                  )}

                  <p className="text-xs text-zinc-200 font-sans leading-relaxed pt-1">
                    {refl.reflectionText}
                  </p>

                  {refl.practicalActionItem && (
                    <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Action Covenant: {refl.practicalActionItem}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: ADD PASSAGE TO REVISION QUEUE ── */}
      {showAddPassageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface,#141824)] border border-[var(--border-accent,#c5a059)] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright,#fef08a)]" />
                <h3 className="text-sm font-display font-bold text-white uppercase">
                  Enroll Revision Passage
                </h3>
              </div>
              <button
                onClick={() => setShowAddPassageModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPassageSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-zinc-300 block mb-1">Surah Name (e.g. Al-Mulk):</label>
                <input
                  type="text"
                  required
                  value={passageSurahName}
                  onChange={e => setPassageSurahName(e.target.value)}
                  placeholder="e.g. Al-Mulk"
                  className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1">Surah #:</label>
                  <input
                    type="number"
                    min={1}
                    max={114}
                    value={passageSurahNumber}
                    onChange={e => setPassageSurahNumber(Number(e.target.value) || '')}
                    placeholder="67"
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Ayah Start:</label>
                  <input
                    type="number"
                    min={1}
                    value={passageAyahStart}
                    onChange={e => setPassageAyahStart(Number(e.target.value) || '')}
                    placeholder="1"
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Ayah End:</label>
                  <input
                    type="number"
                    min={1}
                    value={passageAyahEnd}
                    onChange={e => setPassageAyahEnd(Number(e.target.value) || '')}
                    placeholder="30"
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Initial Status in Revision Queue:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPassageStatus('weak')}
                    className={`py-2 px-1 rounded-xl text-center border font-mono text-[11px] font-bold cursor-pointer ${
                      passageStatus === 'weak'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Weak (يحتاج تثبيتاً)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageStatus('due')}
                    className={`py-2 px-1 rounded-xl text-center border font-mono text-[11px] font-bold cursor-pointer ${
                      passageStatus === 'due'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Due (حان موعده)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageStatus('stable')}
                    className={`py-2 px-1 rounded-xl text-center border font-mono text-[11px] font-bold cursor-pointer ${
                      passageStatus === 'stable'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Stable (راسخ)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Notes / Vulnerable Verses (Optional):</label>
                <textarea
                  rows={2}
                  value={passageNotes}
                  onChange={e => setPassageNotes(e.target.value)}
                  placeholder="e.g. Watch out for mutashabihat in Ayah 14"
                  className="w-full bg-[var(--bg-void,#050608)] text-white p-2.5 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPassageModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Passage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD TADABBUR REFLECTION ── */}
      {showAddReflModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface,#141824)] border border-[var(--border-accent,#c5a059)] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-display font-bold text-white uppercase">
                  Log Ayah Reflection (تدبّر)
                </h3>
              </div>
              <button
                onClick={() => setShowAddReflModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReflectionSubmit} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1">Surah Name:</label>
                  <input
                    type="text"
                    required
                    value={reflSurahName}
                    onChange={e => setReflSurahName(e.target.value)}
                    placeholder="e.g. Al-Furqan"
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Ayah Number:</label>
                  <input
                    type="number"
                    min={1}
                    value={reflAyahNumber}
                    onChange={e => setReflAyahNumber(Number(e.target.value) || '')}
                    placeholder="63"
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Ayah Arabic Text (Optional):</label>
                <input
                  type="text"
                  value={reflAyahText}
                  onChange={e => setReflAyahText(e.target.value)}
                  placeholder="وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا..."
                  className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)] font-serif"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Tadabbur Insight &amp; Heart Impact:</label>
                <textarea
                  rows={3}
                  required
                  value={reflText}
                  onChange={e => setReflText(e.target.value)}
                  placeholder="What truth did this verse impress upon your soul today?"
                  className="w-full bg-[var(--bg-void,#050608)] text-white p-2.5 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Practical Action Covenant (Optional):</label>
                <input
                  type="text"
                  value={reflActionItem}
                  onChange={e => setReflActionItem(e.target.value)}
                  placeholder="e.g. Respond with gentleness when provoked today"
                  className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReflModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
