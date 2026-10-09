import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, 
  ArrowUpRight, RotateCcw, Check, Clock, Scale
} from 'lucide-react';
import { 
  PrayerCheck, 
  SpiritualDailyLog, 
  PrayerExecutionState, 
  DelayedToPrayerOption 
} from '../../types';
import { 
  MIDNIGHT_MISSED_PRAYER_PENALTY_XP, 
  MIDNIGHT_MISSED_PRAYER_PENALTY_HP,
  getCompoundDelayPenalty,
  getAvailableDelayTargets,
  NEXT_PRAYER_DEFAULT_TARGETS
} from '../../utils/prayerRules';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

export interface PrayerCardConfig {
  id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nameEn: string;
  nameAr: string;
  fardhRakats: number;
  timeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  accentColor: string;
  iconBg: string;
  fardhXp: number;
  fardhCoins: number;
  sunnahLabel: string;
  sunnahXp: number;
  sunnahCoins: number;
  masjidXp: number;
  masjidCoins: number;
}

interface PrayerCardProps {
  prayer: PrayerCardConfig;
  prayerState: PrayerCheck;
  systemDate: string;
  isJumuahDay: boolean;
  consecutiveMissedJumuahs?: number;
  allSpiritualLog: Partial<SpiritualDailyLog>;
  onTogglePrayer: (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    field: 'fardh' | 'inMasjid' | 'sunnahRawatib' | 'sunnahBefore' | 'sunnahAfter' | 'onTime' | 'delayed' | 'missedPastMidnight',
    dateStr?: string
  ) => void;
  onSetPrayerExecutionState: (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: PrayerExecutionState,
    options?: { delayedToPrayer?: DelayedToPrayerOption | null },
    dateStr?: string
  ) => void;
  onOpenMissedJumuahModal: () => void;
  onRevertMissedJumuah: () => void;
  onToggleJumuahSunnah: (field: 'badiyahMasjid' | 'badiyahHome' | 'tahiyyah' | 'ghusl' | 'kahf') => void;
  onCompleteQada?: (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
  onOpenPostSalahModal: (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
  onTogglePostIstighfar: (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
  onTogglePostSalahMode: (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', mode: 'mini10' | 'standard33') => void;
  onTogglePostAyatAlKursi?: (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  prayerState,
  systemDate,
  isJumuahDay,
  allSpiritualLog,
  onTogglePrayer,
  onSetPrayerExecutionState,
  onOpenMissedJumuahModal,
  onRevertMissedJumuah,
  onToggleJumuahSunnah,
  onCompleteQada,
  onOpenPostSalahModal,
  onTogglePostIstighfar,
  onTogglePostSalahMode,
  onTogglePostAyatAlKursi
}) => {
  const [showDelayPicker, setShowDelayPicker] = useState(false);

  const isDhuhrSlot = prayer.id === 'dhuhr';
  const isJumuahActive = isJumuahDay && isDhuhrSlot;
  const isJumuahMissed = isJumuahActive && (Boolean(prayerState.jumuahMissed) || Boolean(allSpiritualLog.jumuahMissed));

  // Determine current execution state
  const executionState: PrayerExecutionState = 
    prayerState.executionState || 
    (prayerState.missedPastMidnight ? 'missed_midnight' : prayerState.delayed ? 'delayed' : prayerState.onTime ? 'on_time' : 'unperformed');

  const compoundTier = prayerState.compoundDelayTier || 1;
  const compoundPenaltyXp = prayerState.compoundPenaltyXp || getCompoundDelayPenalty(compoundTier);
  const delayedTo = prayerState.delayedToPrayer || NEXT_PRAYER_DEFAULT_TARGETS[prayer.id] || 'dhuhr';
  const delayTargets = getAvailableDelayTargets(prayer.id);

  // Dynamic names & icons based on Jumu'ah vs Dhuhr
  const displayNameEn = isJumuahActive
    ? isJumuahMissed
      ? 'Dhuhr Replacement'
      : "Salat al-Jumu'ah"
    : prayer.nameEn;

  const displayNameAr = isJumuahActive
    ? isJumuahMissed
      ? 'بديل الجمعة (الظهر)'
      : 'صَلَاةُ الجُمُعَة'
    : prayer.nameAr;

  const displayRakats = isJumuahActive
    ? isJumuahMissed
      ? 4
      : 2
    : prayer.fardhRakats;

  const displayTimeLabel = isJumuahActive
    ? isJumuahMissed
      ? '4 Rak‘ahs replacement'
      : 'Friday Prayer + Khutbah'
    : prayer.timeLabel;

  const Icon = prayer.icon;

  const handleToggleFardh = () => {
    if (isJumuahActive && !isJumuahMissed && prayerState.fardh) {
      onOpenMissedJumuahModal();
      return;
    }
    onTogglePrayer(prayer.id, 'fardh', systemDate);
  };

  // Background styling
  const cardBgStyle = isJumuahActive && !isJumuahMissed
    ? prayerState.fardh
      ? 'bg-gradient-to-br from-emerald-950/80 via-[#0a1814] to-[#070e0c] border-emerald-500/60 shadow-lg shadow-emerald-950/20'
      : 'bg-gradient-to-br from-teal-950/70 via-[#09171a] to-[#080d12] border-emerald-500/40 hover:border-emerald-400/50'
    : isJumuahMissed
    ? 'bg-gradient-to-br from-amber-950/40 via-[#18120c] to-[#0c0d12] border-amber-600/40'
    : prayerState.missedPastMidnight
    ? 'bg-gradient-to-br from-rose-950/60 via-[#190d10] to-[#0d0709] border-rose-600/60 shadow-lg shadow-rose-950/20'
    : prayerState.fardh
    ? 'bg-gradient-to-br from-[#0c131d] to-[#070b10] border-emerald-500/40 shadow-sm'
    : `bg-gradient-to-br ${prayer.gradient} border-white/10 hover:border-white/20`;

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col space-y-3 relative ${cardBgStyle}`}>
      
      {/* 1. TOP HEADER */}
      <div className="flex items-start justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-xl border shrink-0 ${isJumuahActive && !isJumuahMissed ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : prayer.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-display font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-1">
                <span>{displayNameEn}</span>
                <span className="text-xs text-[var(--accent-bright)] font-display">({displayNameAr})</span>
              </h4>
              {isJumuahActive && !isJumuahMissed && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 uppercase">
                  Farḍ &apos;Ayn
                </span>
              )}
              {isJumuahMissed && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 uppercase">
                  Switched to Dhuhr
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono text-zinc-400 block pt-0.5">
              {displayTimeLabel} • {displayRakats} Rak&apos;ahs
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-mono font-bold text-[var(--accent-bright)] bg-[var(--accent-surface)] border border-[var(--border-accent)] px-2 py-0.5 rounded-full">
            +{prayer.fardhXp} XP
          </span>
          {prayerState.completedAt && (
            <span className="text-[9px] font-mono text-emerald-400">
              {prayerState.completedAt.slice(11, 16)}
            </span>
          )}
        </div>
      </div>

      {/* JUMU'AH MISSED ALERT BANNER (IF APPLICABLE) */}
      {isJumuahMissed && (
        <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-rose-300 font-mono font-bold">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>Jumu&apos;ah Missed (−150 XP, −5 HP)</span>
          </div>
          <button
            type="button"
            onClick={onRevertMissedJumuah}
            className="text-[10px] font-mono text-amber-300 hover:text-amber-200 underline flex items-center gap-1 shrink-0"
            title="Mistake? Revert attendance"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Revert</span>
          </button>
        </div>
      )}

      {/* 2 & 3. PRIMARY PRAYER & EXECUTION STATE (SEAMLESS - NO GAP) */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={handleToggleFardh}
          className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
            prayerState.fardh
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-md shadow-emerald-950/40'
              : isJumuahActive && !isJumuahMissed
              ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-200'
              : 'bg-[#07090e] hover:bg-zinc-800 border-white/10 text-zinc-200'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${prayerState.fardh ? 'text-emerald-400' : 'text-zinc-600'}`} />
          <span>
            {prayerState.fardh
              ? isJumuahActive && !isJumuahMissed
                ? "JUMU'AH COMPLETED ✓ (أُدِّيَت الجمعة)"
                : `${displayNameEn.toUpperCase()} COMPLETED ✓ (أُدِّيَت)`
              : isJumuahActive && !isJumuahMissed
              ? "PRAY JUMU'AH (2 R. + KHUTBAH)"
              : `PRAY ${displayNameEn.toUpperCase()} (${displayRakats} R.)`}
          </span>
        </button>

        {/* FRIDAY JUMU'AH SPECIFIC ACTION (SIMPLIFIED & CLEAN) */}
        {isJumuahActive && !isJumuahMissed ? (
          <div className="flex items-center justify-between px-1 text-[10px] font-mono">
            <span className="text-zinc-500">Communal obligation (Farḍ &apos;Ayn)</span>
            <button
              type="button"
              onClick={onOpenMissedJumuahModal}
              className="text-rose-400/90 hover:text-rose-300 underline flex items-center gap-1 font-semibold"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Missed Jumu&apos;ah</span>
            </button>
          </div>
        ) : (
          /* REGULAR PRAYER EXECUTION STATES (FAJR, ASR, ETC.) - DIRECTLY FLUSH WITH ZERO GAP */
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs px-0.5">
              <div className="flex items-center gap-1">
                <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" />
                <span className="text-[10px] font-mono font-bold text-zinc-300">Prayer State:</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400">
                {executionState === 'on_time'
                  ? '⏱️ In Time (+40 XP)'
                  : executionState === 'delayed'
                  ? `⚠️ Delayed Tier ${compoundTier} (−${compoundPenaltyXp} XP)`
                  : executionState === 'missed_midnight'
                  ? '🚨 Past Midnight (−200 XP)'
                  : 'Unchecked'}
              </span>
            </div>

            {/* THE 3 EXPLICIT STATE PILLS */}
            <div className="grid grid-cols-3 gap-1">
              {/* STATE 1: DONE IN TIME */}
              <button
                type="button"
                onClick={() => onSetPrayerExecutionState(
                  prayer.id, 
                  executionState === 'on_time' ? 'unperformed' : 'on_time'
                )}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                  executionState === 'on_time'
                    ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200 shadow-sm'
                    : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-emerald-400" />
                  <span>In Time</span>
                </div>
                <span className="text-[8px] text-emerald-400">+40 XP</span>
              </button>

              {/* STATE 2: DELAYED AT TIME OF ANOTHER PRAYER (COMPOUND PENALTY) */}
              <button
                type="button"
                onClick={() => {
                  if (executionState === 'delayed') {
                    setShowDelayPicker(!showDelayPicker);
                  } else {
                    onSetPrayerExecutionState(prayer.id, 'delayed', {
                      delayedToPrayer: delayedTo
                    });
                    setShowDelayPicker(true);
                  }
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                  executionState === 'delayed'
                    ? 'bg-amber-950/90 border-amber-500/80 text-amber-200 shadow-sm'
                    : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  <span>Delayed</span>
                </div>
                <span className="text-[8px] text-amber-400">−{compoundPenaltyXp} XP</span>
              </button>

              {/* STATE 3: ONE OF 5 PRAYERS NOT EXECUTED BEFORE MIDNIGHT */}
              <button
                type="button"
                onClick={() => onSetPrayerExecutionState(
                  prayer.id,
                  executionState === 'missed_midnight' ? 'unperformed' : 'missed_midnight'
                )}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                  executionState === 'missed_midnight'
                    ? 'bg-rose-950 border-rose-500/90 text-rose-100 shadow-md animate-pulse'
                    : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-rose-400" />
                  <span>Midnight</span>
                </div>
                <span className="text-[8px] text-rose-400">−200 XP</span>
              </button>
            </div>

            {/* DELAY DETAILS & TARGET SELECTOR (WHEN DELAYED) */}
            {executionState === 'delayed' && (
              <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-300">Delayed to:</span>
                  <span className="text-amber-300 font-bold uppercase">{delayedTo} (Tier {compoundTier})</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {delayTargets.map(target => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => {
                        onSetPrayerExecutionState(prayer.id, 'delayed', {
                          delayedToPrayer: target.id
                        });
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-semibold border transition ${
                        delayedTo === target.id
                          ? 'bg-amber-900 border-amber-400 text-amber-100 font-bold'
                          : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[9px] font-mono text-amber-300/90">
                  <span className="flex items-center gap-1">
                    <Scale className="h-3 w-3 text-amber-400" />
                    <span>Auto Muhāsabah Audit Logged (Obligations)</span>
                  </span>
                  <span className="text-zinc-400">Kaffārah Active</span>
                </div>
              </div>
            )}

            {/* SEVERE PENALTY BANNER & QADA' RESTITUTION (WHEN MISSED PAST MIDNIGHT) */}
            {executionState === 'missed_midnight' && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-rose-300 font-mono font-bold">
                  <span>Severe Midnight Penalty</span>
                  <span>−{MIDNIGHT_MISSED_PRAYER_PENALTY_XP} XP • −{MIDNIGHT_MISSED_PRAYER_PENALTY_HP} HP</span>
                </div>

                {onCompleteQada && (
                  <button
                    type="button"
                    onClick={() => onCompleteQada(prayer.id)}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 font-mono text-[10px] font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Perform Qada&apos; Restitution (قضاء الفائتة)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. IN MASJID / JAMA'AH BONUS */}
      <button
        type="button"
        onClick={() => onTogglePrayer(prayer.id, 'inMasjid', systemDate)}
        className={`w-full py-1.5 px-2.5 rounded-xl border text-[11px] font-mono font-bold transition flex items-center justify-between ${
          prayerState.inMasjid
            ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200 shadow-sm'
            : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span>🕌 In Masjid / Jamā&apos;ah</span>
          {prayerState.inMasjid && (
            <span className="text-[9px] text-[var(--accent-highlight)] bg-[var(--accent-surface)] border border-[var(--border-subtle)] px-1 rounded font-bold">
              40D +1
            </span>
          )}
        </span>
        <span className="text-[10px] text-indigo-300">+{prayer.masjidXp} XP</span>
      </button>

      {/* 5. SUNNAH SECTION: SIMPLIFIED FRIDAY JUMU'AH SUNNAHS vs STANDARD RAWATIB */}
      {isJumuahActive && !isJumuahMissed ? (
        <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-300">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Friday Jumu&apos;ah Sunnahs:</span>
            </span>
          </div>

          {/* Clean, compact 2-column pills for Friday Sunnahs */}
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => onToggleJumuahSunnah('ghusl')}
              className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between gap-1 ${
                prayerState.jumuahGhusl
                  ? 'bg-sky-950/90 border-sky-500/80 text-sky-200 font-bold'
                  : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="truncate">🚿 Ghusl &amp; Miswak</span>
              <span className="text-sky-400 font-bold shrink-0">+30</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleJumuahSunnah('kahf')}
              className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between gap-1 ${
                prayerState.jumuahSuratAlKahf
                  ? 'bg-amber-950/90 border-amber-500/80 text-amber-200 font-bold'
                  : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="truncate">📖 Surah Al-Kahf</span>
              <span className="text-amber-400 font-bold shrink-0">+60</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleJumuahSunnah('badiyahMasjid')}
              className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between gap-1 ${
                prayerState.jumuahSunnahBadiyahMasjid
                  ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 font-bold'
                  : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="truncate">🕌 4 R. in Masjid</span>
              <span className="text-emerald-400 font-bold shrink-0">+40</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleJumuahSunnah('badiyahHome')}
              className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between gap-1 ${
                prayerState.jumuahSunnahBadiyahHome
                  ? 'bg-teal-950/90 border-teal-500/80 text-teal-200 font-bold'
                  : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="truncate">🏡 2 R. at Home</span>
              <span className="text-teal-400 font-bold shrink-0">+30</span>
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD SUNAN RAWATIB */
        <button
          type="button"
          onClick={() => onTogglePrayer(prayer.id, 'sunnahRawatib', systemDate)}
          className={`w-full py-1.5 px-2.5 rounded-xl border text-[11px] font-mono font-bold transition flex items-center justify-between ${
            prayerState.sunnahRawatib
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
              : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span className="truncate max-w-[200px]">✨ {prayer.sunnahLabel}</span>
          <span className="text-[10px] text-amber-300 shrink-0 ml-1">+{prayer.sunnahXp} XP</span>
        </button>
      )}

      {/* 6. POST-SALAH ADHKĀR SHORTCUTS (PINNED TO BOTTOM VIA MT-AUTO) */}
      <div className="mt-auto pt-2 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-zinc-300">
              Post-Salah Adhkār
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenPostSalahModal(prayer.id)}
            className="text-[10px] font-mono text-[var(--accent-bright)] hover:underline flex items-center gap-0.5"
          >
            <span>Read</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {/* 1. 3x istighfar */}
          <button
            type="button"
            onClick={() => onTogglePostIstighfar(prayer.id)}
            title="3x istighfar (Astaghfirullah) • +5 XP"
            className={`py-1.5 px-1 rounded-lg text-[9.5px] font-mono font-bold border transition flex items-center justify-center gap-1 ${
              allSpiritualLog.dhikr?.postSalahIstighfar?.[prayer.id]
                ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200 shadow-sm'
                : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
            }`}
          >
            <Check className={`h-3 w-3 shrink-0 ${allSpiritualLog.dhikr?.postSalahIstighfar?.[prayer.id] ? 'text-emerald-400' : 'text-zinc-600'}`} />
            <span className="truncate">3x istighfar</span>
          </button>

          {/* 2. x10 tasbih, hmd, takbir */}
          <button
            type="button"
            onClick={() => onTogglePostSalahMode?.(prayer.id, 'mini10')}
            title="x10 tasbih, hmd, takbir (10 SubhanAllah, 10 Alhamdulillah, 10 Allahu Akbar) • +12 XP"
            className={`py-1.5 px-1 rounded-lg text-[9.5px] font-mono font-bold border transition flex items-center justify-center gap-1 ${
              allSpiritualLog.dhikr?.postSalahAdhkar?.[prayer.id] === 'mini10'
                ? 'bg-cyan-950 border-cyan-500/60 text-cyan-200 shadow-sm'
                : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
            }`}
          >
            <Check className={`h-3 w-3 shrink-0 ${allSpiritualLog.dhikr?.postSalahAdhkar?.[prayer.id] === 'mini10' ? 'text-cyan-400' : 'text-zinc-600'}`} />
            <span className="truncate">x10 tasbih, hmd, takbir</span>
          </button>

          {/* 3. x33 tasbih, hmd, takbir */}
          <button
            type="button"
            onClick={() => onTogglePostSalahMode?.(prayer.id, 'standard33')}
            title="x33 tasbih, hmd, takbir (33 SubhanAllah, 33 Alhamdulillah, 33 Allahu Akbar) • +20 XP"
            className={`py-1.5 px-1 rounded-lg text-[9.5px] font-mono font-bold border transition flex items-center justify-center gap-1 ${
              allSpiritualLog.dhikr?.postSalahAdhkar?.[prayer.id] === 'standard33'
                ? 'bg-teal-950 border-teal-500/60 text-teal-200 shadow-sm'
                : 'bg-[#07090e] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
            }`}
          >
            <Check className={`h-3 w-3 shrink-0 ${allSpiritualLog.dhikr?.postSalahAdhkar?.[prayer.id] === 'standard33' ? 'text-teal-400' : 'text-zinc-600'}`} />
            <span className="truncate">x33 tasbih, hmd, takbir</span>
          </button>
        </div>
      </div>

    </div>
  );
};
