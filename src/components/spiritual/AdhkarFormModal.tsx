import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, BookOpen, Clock } from 'lucide-react';
import { AdhkarItem, AdhkarCategory, AdhkarPrayerTarget } from '../../types';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface AdhkarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AdhkarItem, 'id'>) => void;
  initialItem?: AdhkarItem | null;
}

export const AdhkarFormModal: React.FC<AdhkarFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem
}) => {
  const [title, setTitle] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState<AdhkarCategory>('morning');
  const [prayerTarget, setPrayerTarget] = useState<AdhkarPrayerTarget>('all');
  const [targetCount, setTargetCount] = useState<number>(3);
  const [virtue, setVirtue] = useState('');
  const [source, setSource] = useState('');
  const [recommendedTime, setRecommendedTime] = useState('');

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setArabicText(initialItem.arabicText || '');
      setTransliteration(initialItem.transliteration || '');
      setTranslation(initialItem.translation || '');
      setCategory(initialItem.category || 'morning');
      setPrayerTarget(initialItem.prayerTarget || 'all');
      setTargetCount(initialItem.targetCount || 1);
      setVirtue(initialItem.virtue || '');
      setSource(initialItem.source || '');
      setRecommendedTime(initialItem.recommendedTime || '');
    } else {
      setTitle('');
      setArabicText('');
      setTransliteration('');
      setTranslation('');
      setCategory('morning');
      setPrayerTarget('all');
      setTargetCount(3);
      setVirtue('');
      setSource('');
      setRecommendedTime('After Fajr prayer until sunrise');
    }
  }, [initialItem, isOpen]);

  // Handle category change default suggestions
  const handleCategoryChange = (newCat: AdhkarCategory) => {
    setCategory(newCat);
    if (!initialItem) {
      if (newCat === 'morning') {
        setRecommendedTime('After Fajr until sunrise');
      } else if (newCat === 'evening') {
        setRecommendedTime('After ‘Asr until sunset / Maghrib');
      } else if (newCat === 'post_salah') {
        setRecommendedTime('Immediately following obligatory (Fardh) prayer');
        setTargetCount(33);
      } else if (newCat === 'sleep') {
        setRecommendedTime('Before sleep while lying on right side');
        setTargetCount(1);
      } else {
        setRecommendedTime('Throughout the day and night');
        setTargetCount(100);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      arabicText: arabicText.trim(),
      transliteration: transliteration.trim(),
      translation: translation.trim(),
      category,
      prayerTarget: category === 'post_salah' ? prayerTarget : undefined,
      targetCount: Math.max(1, targetCount),
      virtue: virtue.trim() || undefined,
      source: source.trim() || undefined,
      recommendedTime: recommendedTime.trim() || undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[var(--bg-card,#0c0e14)] border border-[var(--border-accent,#c5a059)]/40 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle,rgba(197,160,89,0.2))] flex items-center justify-between bg-[var(--accent-surface,rgba(197,160,89,0.08))]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--bg-void,#050608)] border border-[var(--border-accent,#c5a059)]/30 text-[var(--accent-highlight,#fef08a)]">
                <RubElHizbIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  {initialItem ? 'EDIT SACRED DHIKR' : 'ENROLL NEW SACRED DHIKR'}
                </h3>
                <p className="text-[11px] font-mono text-zinc-300">
                  SACRED PROTOCOL • Classify morning, evening, post-salah, & general remembrance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Title & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                  Dhikr Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sayyid al-Istighfar, Tasbeeh az-Zahra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                  Classification / Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as AdhkarCategory)}
                  className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans cursor-pointer"
                >
                  <option value="morning">🌅 Morning Adhkār (أذكار الصباح)</option>
                  <option value="evening">🌇 Evening Adhkār (أذكار المساء)</option>
                  <option value="post_salah">🕌 Post-Salah Adhkār (أذكار بعد الصلاة)</option>
                  <option value="sleep">🌙 Before Sleep Adhkār (أذكار النوم)</option>
                  <option value="general">📿 General Dhikr & Tasbeeh (تسبيح عام)</option>
                </select>
              </div>
            </div>

            {/* Post-Salah Prayer Target (If Category is post_salah) */}
            {category === 'post_salah' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 bg-[var(--accent-surface,rgba(197,160,89,0.08))] border border-[var(--border-accent,#c5a059)]/30 rounded-xl space-y-2"
              >
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold">
                  🕌 Target Prayer(s) for Post-Salah
                </label>
                <select
                  value={prayerTarget}
                  onChange={(e) => setPrayerTarget(e.target.value as AdhkarPrayerTarget)}
                  className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans cursor-pointer"
                >
                  <option value="all">Every Obligatory Prayer (All 5 Prayers)</option>
                  <option value="fajr">Fajr Only (Dawn)</option>
                  <option value="dhuhr">Dhuhr Only (Midday)</option>
                  <option value="asr">‘Asr Only (Afternoon)</option>
                  <option value="maghrib">Maghrib Only (Sunset)</option>
                  <option value="isha">‘Ishā’ Only (Night)</option>
                  <option value="fajr_maghrib">Fajr & Maghrib (Dawn & Sunset)</option>
                </select>
              </motion.div>
            )}

            {/* Target Count & Recommended Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                  Target Recitations (Count)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-mono"
                  />
                  <div className="flex gap-1">
                    {[1, 3, 7, 33, 100].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setTargetCount(cnt)}
                        className={`px-2 py-1 text-[10px] font-mono rounded-lg border transition ${
                          targetCount === cnt 
                            ? 'bg-[var(--accent-primary,#c5a059)] text-black border-[var(--border-strong,#fef08a)] font-bold'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {cnt}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                  Recommended Time / Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g., After Fajr prayer until sunrise"
                  value={recommendedTime}
                  onChange={(e) => setRecommendedTime(e.target.value)}
                  className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans"
                />
              </div>
            </div>

            {/* Arabic Calligraphy Text */}
            <div>
              <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1 flex items-center justify-between">
                <span>Arabic Text (النص العربي)</span>
                <span className="text-[10px] text-zinc-400 font-normal">Authentic Uthmani / Vocalized Arabic</span>
              </label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ..."
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl p-3 text-base text-right text-amber-100 focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-arabic leading-loose"
              />
            </div>

            {/* Transliteration */}
            <div>
              <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                Phonetic Transliteration
              </label>
              <input
                type="text"
                placeholder="e.g., Asbahna wa asbahal-mulku lillah..."
                value={transliteration}
                onChange={(e) => setTransliteration(e.target.value)}
                className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-mono"
              />
            </div>

            {/* English Translation */}
            <div>
              <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                English Meaning / Translation
              </label>
              <textarea
                rows={2}
                placeholder="e.g., We have reached the morning and the dominion belongs to Allah..."
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans"
              />
            </div>

            {/* Source & Virtue Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                  Hadith / Quranic Source
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sahih Muslim 2723, Sahih al-Bukhari 6306"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--accent-highlight,#fef08a)] uppercase font-bold mb-1">
                  Virtue & Spiritual Reward
                </label>
                <input
                  type="text"
                  placeholder="e.g., Shield against harm, forgiveness of sins, entrance into Paradise"
                  value={virtue}
                  onChange={(e) => setVirtue(e.target.value)}
                  className="w-full bg-[var(--bg-void,#050608)] border border-[var(--border-subtle,rgba(197,160,89,0.25))] rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[var(--accent-primary,#c5a059)] font-sans"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-[var(--border-subtle,rgba(197,160,89,0.2))] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition rounded-xl hover:bg-white/5 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[var(--border-strong,#c5a059)] to-[var(--accent-bright,#fef08a)] text-[var(--bg-void,#050608)] text-xs font-mono font-bold rounded-xl hover:brightness-110 active:scale-95 transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                {initialItem ? 'SAVE CHANGES' : 'ENROLL IN SACRED PROTOCOL'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
