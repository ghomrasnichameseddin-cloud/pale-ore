import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Moon, Coffee, ShieldAlert, Sparkles, ChevronRight, 
  Settings, ShoppingBag, Plus, ArrowUpRight, Flame, Hourglass, Check
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { RubElHizbIcon } from './IslamicRpgDecorations';

interface TemporalCapitalHudProps {
  onNavigate?: (tab: string) => void;
}

export const TemporalCapitalHud: React.FC<TemporalCapitalHudProps> = ({ onNavigate }) => {
  const { 
    state, 
    getTemporalCapitalInfo, 
    setDailyWakingHours, 
    startActiveRestSession,
    addTimeCredits
  } = usePOS();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isQuickRedeemOpen, setIsQuickRedeemOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [customTitle, setCustomTitle] = useState<string>('Mindful Breathing & Qaylulah');

  const capital = getTemporalCapitalInfo();
  const currentHours = state.profile.dailyWakingHours || 16;

  // Format minutes into hours + mins
  const formatMins = (m: number) => {
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    if (hrs === 0) return `${mins}m`;
    return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
  };

  const investedPercent = Math.min(100, Math.round((capital.investedMinutesToday / capital.dailyWakingMinutes) * 100));
  const committedPercent = Math.min(100 - investedPercent, Math.round((capital.committedMinutesToday / capital.dailyWakingMinutes) * 100));
  const uncommittedPercent = Math.max(0, 100 - investedPercent - committedPercent);

  const handleLaunchRest = (title: string, mins: number) => {
    startActiveRestSession(title, mins);
    setIsQuickRedeemOpen(false);
  };

  return (
    <div 
      className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 relative overflow-hidden shadow-lg transition"
      id="temporal-capital-hud-container"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Hourglass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2 text-[#c5a059]" />
                <span>TEMPORAL CAPITAL & REST BANK</span>
              </span>
              {capital.isOverdrawn && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30 animate-pulse">
                  OVERDRAFT +{formatMins(capital.overdraftMinutes)}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-zinc-100 font-serif tracking-wide">
              Time as Currency (Ra's al-Māl)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Config waking hours button */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 border border-white/5"
            title="Configure Daily Waking Hours Capital"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">{currentHours}h Budget</span>
          </button>

          {/* Ledger link */}
          <button
            onClick={() => onNavigate?.('time_ledger')}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/15 text-zinc-400 hover:text-emerald-300 text-xs font-mono transition flex items-center gap-1.5 border border-white/5"
            title="Open Temporal Ledger"
          >
            <span className="text-[11px] font-bold">Time Ledger</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* CONFIG WAKING HOURS DRAWER */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 py-3 overflow-hidden text-xs font-mono"
          >
            <div className="bg-[#10141f] rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-zinc-300 font-semibold">
                <span>Daily Waking Capital Allocation:</span>
                <span className="text-emerald-400 font-bold">{currentHours} Hours ({currentHours * 60} Minutes)</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Set your realistic waking hours (excluding 7–8h of nocturnal sleep). Every directive you schedule is staked from this non-renewable capital.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[14, 15, 16, 17, 18].map(h => (
                  <button
                    key={h}
                    onClick={() => { setDailyWakingHours(h); setIsConfigOpen(false); }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition border ${
                      currentHours === h 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-transparent'
                    }`}
                  >
                    {h} Hours
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5">
        
        {/* COLUMN 1 & 2: WAKING CAPITAL TIMELINE */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider font-semibold">
              WAKING CAPITAL ALLOCATION
            </span>
            <span className="text-zinc-300 font-bold">
              {formatMins(capital.investedMinutesToday + capital.committedMinutesToday)} / {formatMins(capital.dailyWakingMinutes)} ({capital.utilizationPercent}%)
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full bg-[#0b0e14] rounded-full h-3 overflow-hidden p-0.5 border border-white/10 flex gap-0.5">
            {/* Invested (Completed) */}
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              style={{ width: `${investedPercent}%` }}
              title={`Invested: ${formatMins(capital.investedMinutesToday)}`}
            />
            {/* Committed (Scheduled Incomplete) */}
            <div 
              className="bg-gradient-to-r from-amber-500 to-[#c5a059] h-full rounded-full transition-all duration-500" 
              style={{ width: `${committedPercent}%` }}
              title={`Committed: ${formatMins(capital.committedMinutesToday)}`}
            />
            {/* Uncommitted (Free Buffer) */}
            <div 
              className="bg-white/5 h-full rounded-full transition-all duration-500" 
              style={{ width: `${uncommittedPercent}%` }}
              title={`Uncommitted: ${formatMins(capital.uncommittedMinutes)}`}
            />
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                INVESTED
              </span>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(capital.investedMinutesToday)}
              </span>
              <span className="text-[9px] text-zinc-500">Focus & Done</span>
            </div>

            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                COMMITTED
              </span>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(capital.committedMinutesToday)}
              </span>
              <span className="text-[9px] text-zinc-500">Active Directives</span>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col">
              <span className="text-zinc-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                UNCOMMITTED
              </span>
              <span className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatMins(capital.uncommittedMinutes)}
              </span>
              <span className="text-[9px] text-zinc-500">Free Buffer</span>
            </div>
          </div>

          {/* Overdraft Warning Banner */}
          {capital.isOverdrawn && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                <strong>Temporal Overdraft:</strong> You have over-allocated by {formatMins(capital.overdraftMinutes)}. Postpone secondary directives to prevent cognitive depletion.
              </span>
            </div>
          )}
        </div>

        {/* COLUMN 3: EARNED LEISURE BANK (REST CURRENCY) */}
        <div className="glass-panel p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-[#0c1018] to-[#121927] flex flex-col justify-between relative shadow-md">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400 font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <Moon className="h-3 w-3" />
                EARNED LEISURE BANK
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                REST_CREDITS
              </span>
            </div>

            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                {capital.leisureMinutesBalance}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400/80">
                MINUTES
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 leading-tight">
              Minted from deep work & quest victories. Spend without guilt.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => setIsQuickRedeemOpen(true)}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition flex items-center justify-center gap-1 shadow-sm"
              title="Start an active rest block now"
            >
              <Coffee className="h-3.5 w-3.5" />
              <span>START REST</span>
            </button>

            <button
              onClick={() => onNavigate?.('shop')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#c5a059]/20 text-zinc-300 hover:text-[#fef08a] border border-white/10 hover:border-[#c5a059]/40 transition"
              title="Browse Leisure Vouchers in Imperial Vault"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* QUICK REDEEM REST BLOCK MODAL */}
      <AnimatePresence>
        {isQuickRedeemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0d1017] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Coffee className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold font-serif text-zinc-100">
                    Redeem Active Rest Block
                  </h4>
                </div>
                <button
                  onClick={() => setIsQuickRedeemOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs font-mono text-zinc-300">
                Available Rest Currency: <span className="text-emerald-400 font-bold">{capital.leisureMinutesBalance}m</span>
              </div>

              {/* Preset Block Choices */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Quick Coffee & Dhikr', mins: 15, icon: '☕' },
                  { title: 'Sunnah Qaylulah (Nap)', mins: 25, icon: '😴' },
                  { title: 'Intentional Leisure Block', mins: 45, icon: '🍿' },
                  { title: 'Deep Recreation Voucher', mins: 60, icon: '🎮' }
                ].map(preset => {
                  const canAfford = capital.leisureMinutesBalance >= preset.mins;
                  return (
                    <button
                      key={preset.mins}
                      disabled={!canAfford}
                      onClick={() => handleLaunchRest(preset.title, preset.mins)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                        canAfford
                          ? 'bg-[#141926] hover:bg-emerald-500/15 border-white/10 hover:border-emerald-500/40 cursor-pointer text-zinc-200'
                          : 'bg-white/5 border-transparent opacity-40 cursor-not-allowed text-zinc-500'
                      }`}
                    >
                      <div className="flex justify-between items-center text-sm">
                        <span>{preset.icon}</span>
                        <span className="font-mono font-bold text-xs text-emerald-400">{preset.mins}m</span>
                      </div>
                      <span className="text-[11px] font-serif mt-2 font-medium leading-tight line-clamp-2">
                        {preset.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Minutes Input */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="text-[11px] font-mono text-zinc-400 block">
                  Or Custom Duration:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="Rest Activity Title"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    min={5}
                    max={capital.leisureMinutesBalance}
                    value={customMinutes}
                    onChange={e => setCustomMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200 text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-mono text-zinc-400">m</span>
                </div>

                <button
                  disabled={capital.leisureMinutesBalance < customMinutes}
                  onClick={() => handleLaunchRest(customTitle || 'Custom Rest Block', customMinutes)}
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
                    capital.leisureMinutesBalance >= customMinutes
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/10 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Launch {customMinutes}m Rest Block</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
