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
  Edit2,
  Archive,
  ArchiveRestore,
  Award,
  History,
  CheckCheck,
  Bookmark,
  FileText,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import {
  QuranPassage,
  QuranRevisionStatus,
  QuranReflection,
  QuranKhatmahRecord,
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
    archiveQuranPassage,
    unarchiveQuranPassage,
    advancePassageRevisionStatus,
    markPassageRevised,
    addQuranReflection,
    updateQuranReflection,
    archiveQuranReflection,
    unarchiveQuranReflection,
    deleteQuranReflection,
    sealAndArchiveKhatmah,
    deleteArchivedKhatmah,
    getQuranFreshnessScore,
    updateQuranLog
  } = usePOS();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'revision' | 'tilawah' | 'memorization' | 'reflection'>('revision');

  // Filter for Revision Queue: all | weak | due | stable | archived
  const [revisionFilter, setRevisionFilter] = useState<'all' | 'weak' | 'due' | 'stable' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Passage Modal
  const [showAddPassageModal, setShowAddPassageModal] = useState(false);
  const [showPropheticSunnah, setShowPropheticSunnah] = useState(false);
  const [passageSurahName, setPassageSurahName] = useState('');
  const [passageSurahNumber, setPassageSurahNumber] = useState<number | ''>('');
  const [passageAyahStart, setPassageAyahStart] = useState<number | ''>('');
  const [passageAyahEnd, setPassageAyahEnd] = useState<number | ''>('');
  const [passageStatus, setPassageStatus] = useState<QuranRevisionStatus>('due');
  const [passageNotes, setPassageNotes] = useState('');

  // Archive Passage Modal
  const [passageToArchive, setPassageToArchive] = useState<QuranPassage | null>(null);
  const [archiveReasonPreset, setArchiveReasonPreset] = useState<string>('Firmly Mastered (رسوخ تام)');
  const [customArchiveReason, setCustomArchiveReason] = useState<string>('');

  // Restore Passage Modal
  const [passageToRestore, setPassageToRestore] = useState<QuranPassage | null>(null);
  const [restoreTierChoice, setRestoreTierChoice] = useState<QuranRevisionStatus>('due');

  // Reflection Form & Filter State
  const [showAddReflModal, setShowAddReflModal] = useState(false);
  const [reflectionFilter, setReflectionFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [reflSurahName, setReflSurahName] = useState('');
  const [reflSurahNumber, setReflSurahNumber] = useState<number | ''>('');
  const [reflAyahNumber, setReflAyahNumber] = useState<number | ''>('');
  const [reflAyahText, setReflAyahText] = useState('');
  const [reflText, setReflText] = useState('');
  const [reflActionItem, setReflActionItem] = useState('');

  // Khatmah Archive State
  const [showSealKhatmahModal, setShowSealKhatmahModal] = useState(false);
  const [khatmahNotesInput, setKhatmahNotesInput] = useState('');
  const [showKhatmahHistoryModal, setShowKhatmahHistoryModal] = useState(false);
  const [manualKhatmahNumber, setManualKhatmahNumber] = useState<number | ''>('');
  const [manualKhatmahDate, setManualKhatmahDate] = useState<string>(systemDate);
  const [manualKhatmahNotes, setManualKhatmahNotes] = useState<string>('');
  const [showManualKhatmahForm, setShowManualKhatmahForm] = useState(false);

  // Tilawah quick state
  const quranLog = spiritualLog.quran || { pagesRead: 0, passagesRevisedToday: [] };
  const freshness = getQuranFreshnessScore(systemDate);

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

  const handleConfirmArchivePassage = () => {
    if (!passageToArchive) return;
    const finalReason = archiveReasonPreset === 'Custom' 
      ? (customArchiveReason.trim() || 'Archived to Sacred Vault')
      : archiveReasonPreset;
    archiveQuranPassage(passageToArchive.id, finalReason);
    setPassageToArchive(null);
    setArchiveReasonPreset('Firmly Mastered (رسوخ تام)');
    setCustomArchiveReason('');
  };

  const handleConfirmRestorePassage = () => {
    if (!passageToRestore) return;
    unarchiveQuranPassage(passageToRestore.id, restoreTierChoice);
    setPassageToRestore(null);
    setRestoreTierChoice('due');
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

  const handleConfirmSealKhatmah = (e: React.FormEvent) => {
    e.preventDefault();
    sealAndArchiveKhatmah(khatmahNotesInput.trim() || undefined, systemDate);
    setKhatmahNotesInput('');
    setShowSealKhatmahModal(false);
  };

  const handleAddManualHistoricalKhatmah = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = Number(manualKhatmahNumber) || ((quranTracker.khatmahHistory || []).length + 1);
    const newRecord: QuranKhatmahRecord = {
      id: `khatmah-manual-${Date.now()}`,
      khatmahNumber: nextNum,
      completedDate: manualKhatmahDate || systemDate,
      notes: manualKhatmahNotes.trim() || undefined,
      isArchived: true
    };

    updateQuranTracker({
      khatmahHistory: [newRecord, ...(quranTracker.khatmahHistory || [])],
      khatmahCount: Math.max(quranTracker.khatmahCount || 0, nextNum)
    });

    setManualKhatmahNumber('');
    setManualKhatmahNotes('');
    setShowManualKhatmahForm(false);
  };

  const handleQuickPageChange = (delta: number) => {
    const currentPages = quranLog.pagesRead || 0;
    const newPages = Math.max(0, currentPages + delta);
    updateQuranLog({ pagesRead: newPages }, systemDate);
  };

  // Raw passages
  const allPassages = quranTracker.passages || [];
  const activePassages = allPassages.filter(p => !p.isArchived);
  const archivedPassages = allPassages.filter(p => Boolean(p.isArchived));

  const weakList = activePassages.filter(p => p.status === 'weak');
  const dueList = activePassages.filter(p => p.status === 'due');
  const stableList = activePassages.filter(p => p.status === 'stable');

  // Filtered passages according to tab
  const filteredPassages = allPassages.filter(p => {
    if (revisionFilter === 'archived') {
      if (!p.isArchived) return false;
    } else {
      if (p.isArchived) return false;
      if (revisionFilter !== 'all' && p.status !== revisionFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSurah = p.surahName.toLowerCase().includes(q);
      const matchNotes = p.notes && p.notes.toLowerCase().includes(q);
      const matchReason = p.archiveReason && p.archiveReason.toLowerCase().includes(q);
      return matchSurah || matchNotes || matchReason;
    }
    return true;
  });

  // Reflections filtering
  const allReflections = quranTracker.reflections || [];
  const activeReflections = allReflections.filter(r => !r.isArchived);
  const archivedReflections = allReflections.filter(r => Boolean(r.isArchived));

  const filteredReflections = allReflections.filter(r => {
    if (reflectionFilter === 'active') return !r.isArchived;
    if (reflectionFilter === 'archived') return Boolean(r.isArchived);
    return true;
  });

  // Khatmahs
  const khatmahRecords = quranTracker.khatmahHistory || [];

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
              Tilāwah to revive the soul, Ḥifẓ to anchor divine words, systematic Revision to prevent slip, and an Archiving Vault for mastered portions and sealed Khatmahs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowPropheticSunnah(!showPropheticSunnah)}
              className="px-3 py-2 bg-[#2a2211] hover:bg-[#382d17] border border-[#c5a059]/40 text-[#fef08a] font-mono text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>{showPropheticSunnah ? 'HIDE SUNAN' : 'PROPHETIC QUR’ĀN SUNAN'}</span>
            </button>

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

        {/* EXPANDABLE PROPHETIC QURAN SUNAN DRAWER */}
        <AnimatePresence>
          {showPropheticSunnah && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gradient-to-br from-[#141209] to-[#0a0904] border border-[#c5a059]/40 rounded-2xl text-xs text-zinc-300 space-y-3.5 leading-relaxed font-sans"
            >
              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
                <div className="flex items-center gap-2 font-display font-bold text-[#fef08a] text-sm">
                  <BookOpen className="h-4 w-4 text-[#c5a059]" />
                  <span>The Prophetic Way of Engaging with the Qur’ān (هَدْيُ النَّبِيِّ ﷺ فِي القُرْآن)</span>
                </div>
                <span className="text-[10px] font-mono text-[#c5a059] bg-[#1a150a] px-2 py-0.5 rounded-full border border-[#c5a059]/30">
                  Authentic Sunnah Protocols
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">1. Systematic Review (تَعَاهُدُ القُرْآن)</span>
                    <span className="text-[9px] font-mono text-zinc-500">Bukhari 5033</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    «تَعَاهَدُوا هَذَا القُرْآنَ، فَوَالَّذِي نَفْسُ مُحَمَّدٍ بِيَدِهِ لَهُوَ أَشَدُّ تَفَلُّتًا مِنَ الإِبِلِ فِي عُقُلِهَا»
                  </p>
                  <p className="text-[10px] text-zinc-400 font-sans italic">
                    &ldquo;Keep reviewing this Qur’ān, for by Him in Whose Hand is the soul of Muhammad, it escapes faster than camels from their ties.&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">2. Khatmah Boundaries (مُدَّةُ الخَتْم)</span>
                    <span className="text-[9px] font-mono text-zinc-500">Abu Dawud 1390</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    «لَا يَفْقَهُ مَنْ قَرَأَهُ فِي أَقَلَّ مِنْ ثَلَاثٍ» — Caution against completing in under 3 days without deep contemplation; cycles of 7, 30, or 40 days recommended.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">3. The 7-Day Tahzīb (فَمِي بِشَوْق)</span>
                    <span className="text-[9px] font-mono text-zinc-500">Abu Dawud 1393</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    The Sahabah grouped the Qur’ān for a 7-day completion: 3 Surahs, then 5, 7, 9, 11, 13, and the Mufassal section (Surah Qaf to an-Nas).
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">4. Beautiful Recitation (تَزْيِينُ الصَّوْت)</span>
                    <span className="text-[9px] font-mono text-zinc-500">Abu Dawud 1468</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    «زَيِّنُوا القُرْآنَ بِأَصْوَاتِكُمْ» — &ldquo;Beautify the Qur’ān with your voices.&rdquo; Recite with calm tartīl, distinct letters, and reverent pause at verse endings.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">5. Interactive Contemplation (التَّرْتِيلُ وَالتَّدَبُّر)</span>
                    <span className="text-[9px] font-mono text-zinc-500">Sahih Muslim 772</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    When reciting at night, pause at an ayah of Tasbīḥ to glorify Allah; pause at mercy to supplicate; pause at warning to seek refuge.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* METRICS & FRESHNESS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[var(--border-subtle,rgba(197,160,89,0.2))] text-xs font-mono">
          {/* Qur'an Freshness */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">ACTIVE FRESHNESS</span>
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

          {/* Revision Queue Status & Vault */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">PIPELINE &amp; VAULT</span>
              <Archive className="h-3 w-3 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold flex-wrap">
              <span className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-500/30 text-[10px]">
                {weakList.length} Weak
              </span>
              <span className="text-amber-400 bg-amber-950/40 px-1 py-0.5 rounded border border-amber-500/30 text-[10px]">
                {dueList.length} Due
              </span>
              <span className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                {stableList.length} Stable
              </span>
              <span className="text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded border border-[#c5a059]/40 text-[10px]">
                {archivedPassages.length} Vault
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 block">
              {activePassages.length} active • {archivedPassages.length} archived
            </span>
          </div>

          {/* Reflections & Khatmahs */}
          <div className="p-2.5 bg-[var(--bg-surface,#141824)]/80 border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl">
            <span className="text-[9px] text-zinc-400 uppercase block font-bold">TADABBUR &amp; KHATMAHS</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-violet-300 flex items-center gap-1">
                <Heart className="h-4 w-4 text-rose-400" />
                {activeReflections.length} Active
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                {quranTracker.khatmahCount || 0} Khatmahs
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 block">
              {archivedReflections.length} archived covenants • {khatmahRecords.length} sealed logs
            </span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle,rgba(197,160,89,0.2))] pb-3 flex-wrap">
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
            {activePassages.length}
          </span>
          {archivedPassages.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-0.5" title={`${archivedPassages.length} archived in Sacred Vault`}>
              <Archive className="h-2.5 w-2.5" />
              {archivedPassages.length}
            </span>
          )}
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
          <span>TILĀWAH &amp; KHATMAH (تلاوة وختم)</span>
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
            {activeReflections.length}
          </span>
          {archivedReflections.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
              <Archive className="h-2.5 w-2.5" />
              {archivedReflections.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {/* ── SUB-TAB A: REVISION QUEUE (Active & Sacred Archive) ── */}
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
                  {tab === 'all' ? `Active (${activePassages.length})` :
                   tab === 'weak' ? `Weak (${weakList.length})` :
                   tab === 'due' ? `Due (${dueList.length})` :
                   `Stable (${stableList.length})`}
                </button>
              ))}

              {/* ARCHIVED PASSAGES FILTER BUTTON */}
              <button
                onClick={() => setRevisionFilter('archived')}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  revisionFilter === 'archived'
                    ? 'bg-amber-500/20 text-[#fef08a] border border-[#c5a059] font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-amber-200 bg-zinc-800/60 border border-transparent'
                }`}
                title="Sacred Vault of archived and completed passages"
              >
                <Archive className="h-3 w-3 text-[#c5a059]" />
                <span>Sacred Vault ({archivedPassages.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search surah or notes..."
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

          {/* Description Box */}
          {revisionFilter === 'archived' ? (
            <div className="p-3 bg-gradient-to-r from-amber-950/30 via-[var(--bg-card,#0c0e14)] to-black/40 border border-[#c5a059]/40 rounded-xl text-xs font-mono text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-[#c5a059] shrink-0" />
                <span>
                  <strong>SACRED ARCHIVE VAULT (خَزَانَةُ المَحْفُوظَاتِ المُؤَرْشَفَة):</strong> Preserved passages that have reached mastery, completed Surah goals, or paused without penalizing active freshness score.
                </span>
              </div>
              <span className="text-[10px] text-amber-300/80 bg-black/40 px-2 py-0.5 rounded border border-[#c5a059]/30 shrink-0">
                {archivedPassages.length} Verses Preserved
              </span>
            </div>
          ) : (
            <div className="p-3 bg-[var(--bg-card,#0c0e14)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] rounded-xl text-xs font-mono text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-400 shrink-0" />
                <span>REVISION SEQUENCE: <strong className="text-rose-400">Weak</strong> → <strong className="text-amber-400">Due</strong> → <strong className="text-emerald-400">Stable</strong>. You can archive mastered verses to the Sacred Vault anytime.</span>
              </div>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">Click "Archive" on card to vault</span>
            </div>
          )}

          {/* Passages List */}
          {filteredPassages.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl p-6 bg-[var(--bg-surface,#141824)]/50">
              {revisionFilter === 'archived' ? (
                <>
                  <Archive className="h-10 w-10 text-amber-500/60 mx-auto mb-2" />
                  <p className="text-sm font-display text-zinc-300">No passages in Sacred Vault yet</p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    When you firmly anchor a passage or complete a chapter, click the archive button to preserve it here.
                  </p>
                  <button
                    onClick={() => setRevisionFilter('all')}
                    className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-xl border border-white/10"
                  >
                    View Active Queue
                  </button>
                </>
              ) : (
                <>
                  <BookOpen className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-display text-zinc-300">No passages match this filter</p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Enroll your memorized chapters to maintain systematic revision.</p>
                  <button
                    onClick={() => setShowAddPassageModal(true)}
                    className="mt-3 px-4 py-2 bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono font-bold rounded-xl border border-[var(--border-accent,#c5a059)]"
                  >
                    Enroll New Passage
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPassages.map(passage => {
                const isWeak = passage.status === 'weak';
                const isDue = passage.status === 'due';
                const isStable = passage.status === 'stable';
                const isArchived = Boolean(passage.isArchived);

                // Archived card design
                if (isArchived) {
                  return (
                    <div
                      key={passage.id}
                      className="p-4 rounded-xl border border-[#c5a059]/40 bg-gradient-to-br from-[#121008] via-[#0d0f15] to-[#08090d] transition-all relative overflow-hidden flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5 opacity-60" />
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-[#291f0c] text-amber-300 border border-[#c5a059]/50 flex items-center gap-1">
                                <Archive className="h-2.5 w-2.5" />
                                <span>Vault Preserved</span>
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                Surah #{passage.surahNumber}
                              </span>
                              {passage.archiveReason && (
                                <span className="text-[10px] font-mono text-amber-200/90 bg-black/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-[200px]" title={passage.archiveReason}>
                                  {passage.archiveReason}
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-display font-bold text-white mt-1.5 flex items-center gap-1.5">
                              <span>{passage.surahName}</span>
                              <span className="text-xs text-amber-300/80 font-mono">
                                (Ayah {passage.ayahStart} – {passage.ayahEnd})
                              </span>
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setPassageToRestore(passage);
                                setRestoreTierChoice(passage.status || 'due');
                              }}
                              className="p-1.5 text-amber-300 hover:text-white rounded-lg hover:bg-amber-500/20 transition cursor-pointer"
                              title="Restore to Active Revision Queue"
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteQuranPassage(passage.id)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {passage.notes && (
                          <p className="text-xs text-zinc-400 font-sans italic mt-2 bg-black/30 p-2 rounded-lg border border-white/5">
                            "{passage.notes}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-400 block">
                            Archived: {passage.archivedAt || 'Past Cycle'} • Cycles: {passage.revisionCount}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            Last Revised: {passage.lastRevisedDate || 'Never'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setPassageToRestore(passage);
                            setRestoreTierChoice(passage.status || 'due');
                          }}
                          className="px-3 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-[#c5a059]/40 text-amber-200 rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <ArchiveRestore className="h-3 w-3" />
                          <span>Restore</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Active Passage Card
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
                            onClick={() => {
                              setPassageToArchive(passage);
                              setArchiveReasonPreset(
                                isStable ? 'Firmly Mastered (رسوخ تام)' : 'Target Completed (أُتم حفظ السورة)'
                              );
                            }}
                            className="p-1.5 text-zinc-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10 transition cursor-pointer"
                            title="Archive to Sacred Vault (إيداع في الخزانة)"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteQuranPassage(passage.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition cursor-pointer"
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

      {/* ── SUB-TAB B: TILĀWAH & KHATMAH ARCHIVE ── */}
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
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs rounded-xl font-bold transition cursor-pointer"
                >
                  -5
                </button>
                <button
                  onClick={() => handleQuickPageChange(-1)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs rounded-xl font-bold transition cursor-pointer"
                >
                  -1
                </button>
                <button
                  onClick={() => handleQuickPageChange(1)}
                  className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded-xl font-bold transition cursor-pointer"
                >
                  +1
                </button>
                <button
                  onClick={() => handleQuickPageChange(5)}
                  className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded-xl font-bold transition cursor-pointer"
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

            {/* Khatmah Counter & Archiving Cockpit */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface,#141824)] border border-[var(--border-subtle,rgba(197,160,89,0.2))] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-violet-300 font-bold">KHATMAH CYCLE &amp; ARCHIVE</span>
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <p className="text-xs text-zinc-300 font-sans mt-2 leading-relaxed">
                  Completing the entire Qur'an seals divine light upon the believer's life. Each completed journey is archived permanently in your sacred ledger.
                </p>
              </div>

              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">Total Completed:</span>
                  <span className="text-base font-bold text-amber-300">{quranTracker.khatmahCount || 0} Khatmahs</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowSealKhatmahModal(true)}
                    className="w-full py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] hover:brightness-110 text-[var(--bg-void,#050608)] font-mono text-xs font-bold rounded-lg shadow cursor-pointer text-center"
                  >
                    Seal &amp; Archive
                  </button>
                  <button
                    onClick={() => setShowKhatmahHistoryModal(true)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-mono text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <History className="h-3 w-3 text-amber-400" />
                    <span>Archive ({khatmahRecords.length})</span>
                  </button>
                </div>
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

      {/* ── SUB-TAB D: REFLECTION (Tadabbur Journal & Archived Covenants) ── */}
      {activeSubTab === 'reflection' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--bg-surface,#141824)] p-3 rounded-xl border border-[var(--border-subtle,rgba(197,160,89,0.2))]">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 mr-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <span className="font-bold">TADABBUR REPOSITORY</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReflectionFilter('active')}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition cursor-pointer ${
                    reflectionFilter === 'active'
                      ? 'bg-[var(--accent-surface,#c5a059)] text-[var(--accent-highlight,#fef08a)] font-bold border border-[var(--border-accent,#c5a059)]'
                      : 'text-zinc-400 hover:text-white bg-zinc-800/60'
                  }`}
                >
                  Active Insights ({activeReflections.length})
                </button>
                <button
                  onClick={() => setReflectionFilter('archived')}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    reflectionFilter === 'archived'
                      ? 'bg-rose-500/20 text-rose-200 font-bold border border-rose-500/50 shadow-sm'
                      : 'text-zinc-400 hover:text-white bg-zinc-800/60'
                  }`}
                >
                  <Archive className="h-3 w-3 text-rose-400" />
                  <span>Archived Covenants ({archivedReflections.length})</span>
                </button>
                <button
                  onClick={() => setReflectionFilter('all')}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition cursor-pointer ${
                    reflectionFilter === 'all'
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'text-zinc-400 hover:text-white bg-zinc-800/60'
                  }`}
                >
                  All ({allReflections.length})
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddReflModal(true)}
              className="px-3 py-1.5 bg-[var(--accent-surface,#c5a059)] hover:bg-[var(--accent-surface-hover,#d5b069)] text-[var(--accent-highlight,#fef08a)] text-xs font-mono font-bold rounded-lg border border-[var(--border-accent,#c5a059)] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Reflection</span>
            </button>
          </div>

          {/* Reflections List */}
          {filteredReflections.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl p-6 bg-[var(--bg-surface,#141824)]/50">
              {reflectionFilter === 'archived' ? (
                <>
                  <Archive className="h-10 w-10 text-rose-500/50 mx-auto mb-2" />
                  <p className="text-sm font-display text-zinc-300">No archived covenants</p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    When you fulfill an action covenant or want to archive a completed reflection, click the archive button.
                  </p>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReflections.map(refl => {
                const isArchived = Boolean(refl.isArchived);
                return (
                  <div
                    key={refl.id}
                    className={`p-4 rounded-xl border transition relative space-y-2.5 ${
                      isArchived
                        ? 'bg-gradient-to-br from-[#140f12] via-[#0c0d12] to-[#08080a] border-rose-500/30'
                        : 'bg-[var(--bg-card,#0c0e14)] border-[var(--border-subtle,rgba(197,160,89,0.2))]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          {refl.surahName} : Ayah {refl.ayahNumber}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {refl.date}
                        </span>
                        {isArchived && (
                          <span className="text-[9px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40 flex items-center gap-1">
                            <Archive className="h-2.5 w-2.5" />
                            <span>Archived {refl.archivedAt || ''}</span>
                          </span>
                        )}
                        {refl.covenantFulfilled && (
                          <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                            <CheckCheck className="h-2.5 w-2.5" />
                            <span>Covenant Fulfilled ✓</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isArchived ? (
                          <button
                            onClick={() => unarchiveQuranReflection(refl.id)}
                            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                            title="Restore reflection to active list"
                          >
                            <ArchiveRestore className="h-3.5 w-3.5 text-rose-300" />
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveQuranReflection(refl.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-300 rounded-lg hover:bg-white/5 transition cursor-pointer"
                            title="Archive reflection"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteQuranReflection(refl.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Delete reflection"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Action Covenant: {refl.practicalActionItem}</span>
                        </div>
                        {!isArchived && (
                          <button
                            onClick={() => {
                              const nextFulfilled = !refl.covenantFulfilled;
                              updateQuranReflection(refl.id, { covenantFulfilled: nextFulfilled });
                            }}
                            className={`px-2 py-0.5 text-[10px] font-mono rounded border transition cursor-pointer flex items-center gap-1 ${
                              refl.covenantFulfilled
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Check className="h-2.5 w-2.5" />
                            <span>{refl.covenantFulfilled ? 'Fulfilled ✓' : 'Mark Fulfilled'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
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
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
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

      {/* ── MODAL 3: ARCHIVE PASSAGE TO SACRED VAULT ── */}
      {passageToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface,#141824)] border border-[#c5a059] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
            <div className="flex items-center justify-between pb-3 border-b border-[#c5a059]/30">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-[#fef08a]" />
                <h3 className="text-sm font-display font-bold text-white uppercase">
                  Archive Passage to Sacred Vault
                </h3>
              </div>
              <button
                onClick={() => setPassageToArchive(null)}
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <h4 className="font-display font-bold text-base text-amber-200">
                {passageToArchive.surahName} (Ayah {passageToArchive.ayahStart} – {passageToArchive.ayahEnd})
              </h4>
              <p className="text-xs text-zinc-400 font-mono">
                Current Status: <span className="uppercase text-amber-300 font-bold">{passageToArchive.status}</span> • Revision Cycles Completed: <span className="text-white font-bold">{passageToArchive.revisionCount}</span>
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <label className="text-zinc-300 block">Select Archive Reason / Milestone:</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Firmly Mastered (رسوخ تام)',
                  'Target Completed (أُتم حفظ السورة)',
                  'Seasonal Pause / Parked (توقف مؤقت)',
                  'Custom'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setArchiveReasonPreset(preset)}
                    className={`p-2.5 rounded-xl text-left border font-mono text-xs transition cursor-pointer flex items-center justify-between ${
                      archiveReasonPreset === preset
                        ? 'bg-amber-500/20 text-[#fef08a] border-[#c5a059] font-bold'
                        : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80 hover:text-zinc-200'
                    }`}
                  >
                    <span>{preset}</span>
                    {archiveReasonPreset === preset && <Check className="h-3.5 w-3.5 text-amber-300" />}
                  </button>
                ))}
              </div>

              {archiveReasonPreset === 'Custom' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Enter custom archive reason..."
                    value={customArchiveReason}
                    onChange={e => setCustomArchiveReason(e.target.value)}
                    className="w-full bg-[var(--bg-void,#050608)] text-white px-3 py-2 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)] text-xs font-mono"
                  />
                </div>
              )}

              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
                Archived verses are securely preserved in your Sacred Vault. They no longer require daily review or drag down your active Freshness score, and can be restored back anytime.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPassageToArchive(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchivePassage}
                className="px-5 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Confirm Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RESTORE PASSAGE FROM SACRED VAULT ── */}
      {passageToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface,#141824)] border border-[#c5a059] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5a059]/30">
              <div className="flex items-center gap-2">
                <ArchiveRestore className="h-4 w-4 text-[#fef08a]" />
                <h3 className="text-sm font-display font-bold text-white uppercase">
                  Restore Passage to Active Queue
                </h3>
              </div>
              <button
                onClick={() => setPassageToRestore(null)}
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <h4 className="font-display font-bold text-base text-amber-200">
                {passageToRestore.surahName} (Ayah {passageToRestore.ayahStart} – {passageToRestore.ayahEnd})
              </h4>
              <p className="text-xs text-zinc-400 font-mono">
                Preserved Reason: {passageToRestore.archiveReason || 'Sacred Vault'}
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <label className="text-zinc-300 block">Select destination revision tier:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRestoreTierChoice('stable')}
                  className={`p-2 rounded-xl text-center border font-mono text-xs font-bold cursor-pointer transition ${
                    restoreTierChoice === 'stable'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  Stable (راسخ)
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreTierChoice('due')}
                  className={`p-2 rounded-xl text-center border font-mono text-xs font-bold cursor-pointer transition ${
                    restoreTierChoice === 'due'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  Due (مطلوب)
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreTierChoice('weak')}
                  className={`p-2 rounded-xl text-center border font-mono text-xs font-bold cursor-pointer transition ${
                    restoreTierChoice === 'weak'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  Weak (تثبيت)
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Restoring re-inserts this passage into your live revision rotation and includes it in your daily Freshness calculation.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPassageToRestore(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestorePassage}
                className="px-5 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
                <span>Restore to Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: SEAL & ARCHIVE KHATMAH ── */}
      {showSealKhatmahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface,#141824)] border border-[#c5a059] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
            <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#c5a059]/30">
              <div className="flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright,#fef08a)]" />
                <h3 className="text-sm font-display font-bold text-white uppercase">
                  Seal &amp; Archive Complete Khatmah
                </h3>
              </div>
              <button
                onClick={() => setShowSealKhatmahModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSealKhatmah} className="space-y-3.5 text-xs font-mono">
              <div className="p-3 bg-gradient-to-r from-amber-950/40 to-black/60 rounded-xl border border-[#c5a059]/40 text-center space-y-1">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  INSCRIBING SACRED MILESTONE
                </span>
                <h4 className="text-xl font-display font-extrabold text-[#fef08a]">
                  Khatmah #{(quranTracker.khatmahCount || 0) + 1}
                </h4>
                <p className="text-[11px] text-zinc-300 font-sans italic">
                  «اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً»
                </p>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Completion Date:</label>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded-xl border border-zinc-700 text-zinc-200">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>{systemDate}</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Completion Reflection / Dedication / Du'a Notes (Optional):</label>
                <textarea
                  rows={3}
                  value={khatmahNotesInput}
                  onChange={e => setKhatmahNotesInput(e.target.value)}
                  placeholder="Record your intentions for the next cycle, feelings, or dedication..."
                  className="w-full bg-[var(--bg-void,#050608)] text-white p-2.5 rounded-xl border border-zinc-700 outline-none focus:border-[var(--border-accent,#c5a059)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setShowSealKhatmahModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>Seal into Sacred Archive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 6: SEALED KHATMAHS ARCHIVE HISTORY ── */}
      {showKhatmahHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface,#141824)] border border-[#c5a059] rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#c5a059]/30 shrink-0">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#fef08a]" />
                <h3 className="text-sm font-display font-bold text-white uppercase">
                  Archived Khatmahs Registry (سِجِلُّ الخَتَمَاتِ المُؤَرْشَفَة)
                </h3>
              </div>
              <button
                onClick={() => setShowKhatmahHistoryModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-black/30 p-2.5 rounded-xl border border-white/5 shrink-0">
              <span>Total Lifetime Khatmahs: <strong className="text-amber-300">{quranTracker.khatmahCount || 0}</strong></span>
              <button
                onClick={() => setShowManualKhatmahForm(!showManualKhatmahForm)}
                className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Plus className="h-3 w-3" />
                <span>{showManualKhatmahForm ? 'Hide Form' : 'Log Past Khatmah'}</span>
              </button>
            </div>

            {/* Inline manual past khatmah logger */}
            {showManualKhatmahForm && (
              <form onSubmit={handleAddManualHistoricalKhatmah} className="p-3 bg-zinc-900/90 rounded-xl border border-amber-500/30 space-y-2 text-xs font-mono shrink-0">
                <span className="text-[10px] text-amber-300 uppercase font-bold block">Log Historical Completion</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-0.5">Khatmah #:</label>
                    <input
                      type="number"
                      min={1}
                      value={manualKhatmahNumber}
                      onChange={e => setManualKhatmahNumber(Number(e.target.value) || '')}
                      placeholder="e.g. 1"
                      className="w-full bg-black text-white px-2.5 py-1.5 rounded-lg border border-zinc-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-0.5">Date Completed:</label>
                    <input
                      type="date"
                      value={manualKhatmahDate}
                      onChange={e => setManualKhatmahDate(e.target.value)}
                      className="w-full bg-black text-white px-2.5 py-1.5 rounded-lg border border-zinc-700 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-0.5">Notes (Optional):</label>
                  <input
                    type="text"
                    value={manualKhatmahNotes}
                    onChange={e => setManualKhatmahNotes(e.target.value)}
                    placeholder="e.g. Ramadan Khatmah in youth"
                    className="w-full bg-black text-white px-2.5 py-1.5 rounded-lg border border-zinc-700 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualKhatmahForm(false)}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg cursor-pointer"
                  >
                    Add Record
                  </button>
                </div>
              </form>
            )}

            {/* List of Khatmahs */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {khatmahRecords.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl p-4">
                  <Award className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-300 font-display">No archived Khatmahs yet</p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Click "Seal &amp; Archive" whenever you complete the 604 pages of the Noble Qur’ān.
                  </p>
                </div>
              ) : (
                khatmahRecords.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-black/50 via-zinc-900/60 to-black/50 border border-white/10 flex items-start justify-between gap-3 text-xs font-mono"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1">
                          <RubElHizbIcon className="h-3 w-3 text-amber-300" />
                          <span>Khatmah #{rec.khatmahNumber}</span>
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          Completed on {rec.completedDate}
                        </span>
                      </div>
                      {rec.notes && (
                        <p className="text-zinc-300 text-xs font-sans italic pt-1">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteArchivedKhatmah(rec.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition cursor-pointer shrink-0"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowKhatmahHistoryModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
