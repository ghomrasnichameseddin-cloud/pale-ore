import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Sparkles, CheckCircle2, Check, X, 
  Bed, Shield, RotateCcw, BookOpen, Clock, Heart, Plus
} from 'lucide-react';
import { usePOS } from '../../POSContext';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from '../IslamicRpgDecorations';

interface SleepAdhkarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'dhohr' | 'night';
  systemDate: string;
}

interface DhikrItem {
  id: string;
  titleEn: string;
  titleAr: string;
  source: string;
  arabic: string;
  transliteration: string;
  translation: string;
  virtue: string;
  targetCount: number;
}

export const DHOHR_SLEEP_ADHKAR: DhikrItem[] = [];

export const NIGHT_SLEEP_ADHKAR: DhikrItem[] = [];

export const SleepAdhkarModal: React.FC<SleepAdhkarModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'night',
  systemDate
}) => {
  const { getSpiritualLog, toggleAdhkar } = usePOS();
  const [activeTab, setActiveTab] = useState<'dhohr' | 'night'>(initialTab);
  const [counters, setCounters] = useState<Record<string, number>>({});

  // Sync tab when opened
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentLog = getSpiritualLog(systemDate);
  const isDhohrCompleted = Boolean(currentLog.adhkarSleepDhohr);
  const isNightCompleted = Boolean(currentLog.adhkarSleepNight);

  const currentList = activeTab === 'dhohr' ? DHOHR_SLEEP_ADHKAR : NIGHT_SLEEP_ADHKAR;

  const handleIncrement = (id: string, target: number) => {
    setCounters(prev => {
      const current = prev[id] || 0;
      const next = current >= target ? 0 : current + 1;
      return { ...prev, [id]: next };
    });
  };

  const handleSetCompleted = (id: string, target: number) => {
    setCounters(prev => ({
      ...prev,
      [id]: target
    }));
  };

  const handleResetCurrentCounters = () => {
    const next = { ...counters };
    currentList.forEach(item => {
      delete next[item.id];
    });
    setCounters(next);
  };

  const completedCount = currentList.filter(item => (counters[item.id] || 0) >= item.targetCount).length;
  const progressPercent = currentList.length > 0 ? Math.round((completedCount / currentList.length) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-3xl w-full bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl p-5 sm:p-6 space-y-5 shadow-[0_0_50px_rgba(197,160,89,0.2)] text-left relative my-auto max-h-[90vh] flex flex-col"
        >
          <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
          <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-[#c5a059]/20 pb-3.5 shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#18150d] border border-[#c5a059]/60 rounded-xl text-[#fef08a] shadow-inner">
                {activeTab === 'dhohr' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-violet-400" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    <span>SLEEP ADHKĀR FORTRESS • حِصْنُ أَدْعِيَةِ النَّوْم</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#fef08a]">
                    AUTHENTIC SUNNAH
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  Prophetic remembrances, Quranic shields, and etiquette for Dhohr Qaylulah nap &amp; bedtime rest.
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-zinc-800 transition"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="grid grid-cols-2 gap-2 bg-[#06070b] p-1.5 rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('dhohr')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'dhohr'
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Dhohr Nap (Qaylūlah)</span>
                {isDhohrCompleted && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('night')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'night'
                    ? 'bg-violet-950/80 text-violet-200 border border-violet-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-violet-400" />
                <span>Night Sleep (النوم بالليل)</span>
                {isNightCompleted && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400 text-[11px]">Recited:</span>
              <span className="font-bold text-[#fef08a]">{completedCount} / {currentList.length}</span>
              <div className="w-20 bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/10">
                <div 
                  className={`h-full transition-all duration-300 ${
                    activeTab === 'dhohr' ? 'bg-amber-400' : 'bg-violet-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                onClick={handleResetCurrentCounters}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
                title="Reset counters"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* SUNNAH ETIQUETTE BANNER */}
          {activeTab === 'dhohr' ? (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-[#18140b] to-[#0d0a06] border border-amber-500/30 rounded-xl space-y-1.5 shrink-0 text-xs font-sans">
              <div className="flex items-center gap-2 text-amber-300 font-display font-bold text-xs">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>The Prophetic Sunnah of Qaylūlah (قِيلُوا فَإِنَّ الشَّيَاطِينَ لَا تَقِيلُ)</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                The Prophet ﷺ said: <em>&ldquo;Take a midday nap, for the devils do not take a midday nap.&rdquo;</em> (Sahih al-Jami‘ 4431). 
                Sunnah etiquette: Rest for 20–30 minutes before or after Dhuhr prayer with the intention of gaining vitality for afternoon worship, productive labor, and Tahajjud (Qiyām al-Layl).
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-gradient-to-r from-violet-950/40 via-[#120e1a] to-[#07050d] border border-violet-500/30 rounded-xl space-y-1.5 shrink-0 text-xs font-sans">
              <div className="flex items-center gap-2 text-violet-300 font-display font-bold text-xs">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                <span>The 3 Essential Prophetic Bedtime Etiquettes (آدَابُ النَّوْمِ النَّبَوِيَّة)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-[11px] text-zinc-300">
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">1</span>
                  <span><strong>Wuḍū’</strong> prior to bed as for prayer</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">2</span>
                  <span><strong>Dust bed 3x</strong> with garment edge</span>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">3</span>
                  <span><strong>Sleep on right side</strong>, hand on cheek</span>
                </div>
              </div>
            </div>
          )}

          {/* SCROLLABLE LIST OF ADHKAR */}
          <div className="overflow-y-auto pr-1.5 space-y-3.5 flex-1 min-h-0">
            {currentList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-white/5 bg-black/30 space-y-2.5">
                <Moon className="h-8 w-8 mx-auto text-zinc-600 mb-1" />
                <p className="text-sm font-bold text-zinc-300 font-display">
                  {activeTab === 'dhohr' ? 'NO NOON SLEEP ADHKĀR REGISTERED' : 'NO NIGHT SLEEP ADHKĀR REGISTERED'}
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto font-sans leading-relaxed">
                  The {activeTab === 'dhohr' ? 'Noon Qaylūlah' : 'Night Bedtime'} Adhkār section is currently empty. The section layout and prophetic etiquettes are preserved.
                </p>
              </div>
            ) : (
              currentList.map((item, idx) => {
              const currentVal = counters[item.id] || 0;
              const isItemDone = currentVal >= item.targetCount;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-2.5 ${
                    isItemDone
                      ? 'bg-[#0b1411] border-emerald-500/50 shadow-sm'
                      : 'bg-[#07080c] border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* TOP TITLE & BADGES */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-white">
                          {item.titleEn}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 bg-black/50 border border-white/10 px-2 py-0.5 rounded-md">
                          {item.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-display text-zinc-400 block">
                        {item.titleAr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isItemDone ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Done ({currentVal}/{item.targetCount})
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/5">
                          {currentVal} / {item.targetCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ARABIC SCRIPT */}
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-right">
                    <p className="text-base sm:text-lg font-serif font-bold text-[#fef08a] leading-loose tracking-wide select-all" dir="rtl">
                      {item.arabic}
                    </p>
                  </div>

                  {/* TRANSLITERATION & TRANSLATION */}
                  <div className="space-y-1 text-xs font-sans">
                    <p className="text-zinc-300 italic font-mono text-[11px] leading-relaxed">
                      {item.transliteration}
                    </p>
                    <p className="text-zinc-400 text-[11.5px] leading-relaxed">
                      &ldquo;{item.translation}&rdquo;
                    </p>
                  </div>

                  {/* VIRTUE & ACTION BUTTONS */}
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-amber-300/80 font-sans">
                      <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                      <span>{item.virtue}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleIncrement(item.id, item.targetCount)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 border ${
                          isItemDone
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-white/10'
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tap Recite (+1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetCompleted(item.id, item.targetCount)}
                        className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 text-xs font-mono transition"
                        title="Mark full set completed"
                      >
                        ✓ Max
                      </button>
                    </div>
                  </div>

                </div>
              );
            }))}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-[#c5a059]/20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">
                Daily Status:
              </span>
              {activeTab === 'dhohr' ? (
                isDhohrCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Dhohr Qaylūlah Logged (+50 XP)
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-400/90 font-bold">
                    Pending (+50 XP available)
                  </span>
                )
              ) : (
                isNightCompleted ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Night Sleep Adhkār Logged (+75 XP)
                  </span>
                ) : (
                  <span className="text-xs font-mono text-violet-400/90 font-bold">
                    Pending (+75 XP available)
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'dhohr' ? (
                <button
                  type="button"
                  onClick={() => toggleAdhkar('sleepDhohr', systemDate)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm ${
                    isDhohrCompleted
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isDhohrCompleted ? 'Dhohr Nap Logged ✓ (Undo)' : 'LOG DHOHR NAP ADHKĀR (+50 XP)'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleAdhkar('sleepNight', systemDate)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm ${
                    isNightCompleted
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white border-violet-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isNightCompleted ? 'Night Sleep Logged ✓ (Undo)' : 'LOG NIGHT SLEEP ADHKĀR (+75 XP)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#07080c] hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition"
              >
                Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
