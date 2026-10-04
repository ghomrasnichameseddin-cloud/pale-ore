import React from 'react';
import { ShieldAlert, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { 
  MISSED_JUMUAH_PENALTY_XP, 
  MISSED_JUMUAH_PENALTY_HP, 
  getPropheticJumuahWarning 
} from '../../utils/prayerRules';
import { RubElHizbIcon } from '../IslamicRpgDecorations';

interface JumuahWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMissed: (reason?: string) => void;
  consecutiveMissedCount: number;
}

export const JumuahWarningModal: React.FC<JumuahWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirmMissed,
  consecutiveMissedCount
}) => {
  if (!isOpen) return null;

  const nextCount = consecutiveMissedCount + 1;
  const warning = getPropheticJumuahWarning(nextCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#090b10] border border-rose-500/60 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-b from-rose-950/50 to-transparent border-b border-rose-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950 border border-rose-500/50 text-rose-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-bold uppercase flex items-center gap-1">
                  <RubElHizbIcon className="h-2.5 w-2.5 text-rose-400" />
                  <span>Jumu&apos;ah Protocol</span>
                </span>
                {nextCount >= 2 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/60">
                    {nextCount} Missed Fridays
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-base text-rose-100 pt-0.5">
                Salat al-Jumu&apos;ah Missed
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          {/* Prophetic Hadith Warning */}
          <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/30 space-y-2">
            <p className="text-right font-display text-sm text-amber-200 leading-relaxed font-semibold" dir="rtl">
              {warning.hadithAr}
            </p>
            <p className="text-[11px] text-zinc-300 italic leading-snug border-l-2 border-rose-500/50 pl-2.5">
              &ldquo;{warning.hadithEn}&rdquo;
            </p>
          </div>

          {/* Penalty & Replacement Strip */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Deduction:</span>
            <span className="text-rose-400 font-bold">
              −{MISSED_JUMUAH_PENALTY_XP} XP • −{MISSED_JUMUAH_PENALTY_HP} HP
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0d1117] border border-amber-500/30 text-[11px] text-zinc-300 flex items-center justify-between">
            <span>Mandatory Replacement:</span>
            <span className="text-amber-300 font-bold font-mono flex items-center gap-1">
              Switch to 4 Rak&apos;ahs Dhuhr <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/5 bg-black/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-zinc-800 text-xs font-mono text-zinc-300 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmMissed();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-rose-900/90 hover:bg-rose-800 border border-rose-500/70 text-xs font-mono font-bold text-rose-100 transition flex items-center gap-1.5 shadow-md"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Switch to 4 R. Dhuhr</span>
          </button>
        </div>
      </div>
    </div>
  );
};
