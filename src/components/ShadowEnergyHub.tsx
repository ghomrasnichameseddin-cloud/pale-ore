import React from 'react';
import {
  Activity,
  ArrowUpRight,
  Crown,
  Gauge,
  MoonStar,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { SHADOW_VESSELS, calculateHarmony, getShadowEnergyVesselState } from '../utils/shadowEnergy';

export const ShadowEnergyHub: React.FC = () => {
  const { state, getCoreDomains } = usePOS();
  const shadowEnergy = state.shadowEnergy || getShadowEnergyVesselState({
    current: 0,
    currentVessel: 1,
    completedVessels: [],
    cycleComplete: false,
    vesselProgress: 0,
    ledger: []
  });
  const domainScores = getCoreDomains();
  const harmony = calculateHarmony(
    Math.round(domainScores.Mind.score),
    Math.round(domainScores.Body.score),
    Math.round(domainScores.Soul.score)
  );
  const currentVessel = SHADOW_VESSELS.find(vessel => vessel.number === shadowEnergy.currentVessel) ?? SHADOW_VESSELS[0];
  const nextVessel = SHADOW_VESSELS.find(vessel => vessel.number === shadowEnergy.currentVessel + 1);
  const remainingToVessel = Math.max(0, currentVessel.requirement - shadowEnergy.current);
  const cycleProgress = (shadowEnergy.completedVessels.length / SHADOW_VESSELS.length) * 100;

  return (
    <div className="space-y-6 text-white">
      <header className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_40%),linear-gradient(135deg,rgba(24,24,38,0.96),rgba(11,12,19,0.96))] p-5 sm:p-7 shadow-[0_0_45px_rgba(139,92,246,0.12)]">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-violet-200">
              <MoonStar className="h-4 w-4 text-violet-300" />
              Shadow Energy
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
              The Veiled Vessel Cycle
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              A long-term harmony track that rewards sustained effort without replacing XP, skills, or attributes.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-black/20 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-zinc-500">Harmony</div>
              <div className="text-2xl font-black text-violet-200">{harmony}%</div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-[var(--bg-surface)] p-5 sm:p-6 shadow-2xl shadow-violet-950/10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-violet-300">
                Active Vessel
              </div>
              <h3 className="mt-2 font-display text-2xl font-black text-white">
                {currentVessel.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                {currentVessel.description}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-right">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400">Stored</div>
              <div className="mt-1 font-display text-2xl font-black text-violet-200">
                {shadowEnergy.current}<span className="text-base text-zinc-500">/{currentVessel.requirement}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
              <span>Vessel progress</span>
              <span>{shadowEnergy.vesselProgress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-violet-500/20 bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-300 shadow-[0_0_18px_rgba(168,85,247,0.45)] transition-all duration-300"
                style={{ width: `${shadowEnergy.vesselProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
              <span>{remainingToVessel} energy until the next milestone</span>
              <span>{nextVessel ? `Vessel ${nextVessel.number}` : 'Cycle complete'}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SHADOW_VESSELS.map(vessel => {
              const isCompleted = shadowEnergy.completedVessels.includes(vessel.number);
              const isActive = vessel.number === shadowEnergy.currentVessel;
              const stateClass = isCompleted
                ? 'border-emerald-500/30 bg-emerald-950/15 text-emerald-200'
                : isActive
                  ? 'border-violet-500/35 bg-violet-950/20 text-violet-100'
                  : 'border-white/5 bg-black/20 text-zinc-500';

              return (
                <div key={vessel.number} className={`rounded-xl border p-3 transition-colors ${stateClass}`}>
                  <div className="text-[8px] font-mono uppercase tracking-[0.2em]">Vessel {vessel.number}</div>
                  <div className="mt-2 text-sm font-bold">
                    {isCompleted ? 'Complete' : isActive ? 'Active' : 'Dormant'}
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400">{vessel.requirement} energy</div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-violet-300">
            <Crown className="h-4 w-4" /> Cycle Status
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">Completion</div>
              <div className="mt-2 font-display text-3xl font-black text-white">
                {shadowEnergy.completedVessels.length}<span className="text-lg text-zinc-500">/{SHADOW_VESSELS.length}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300" style={{ width: `${cycleProgress}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                <span>Current requirement</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              </div>
              <div className="mt-2 text-xl font-black text-violet-200">{currentVessel.requirement} energy</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">Status</div>
              <div className={`mt-2 text-lg font-bold ${shadowEnergy.cycleComplete ? 'text-emerald-300' : 'text-amber-300'}`}>
                {shadowEnergy.cycleComplete ? 'Cycle complete' : 'Cycle active'}
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[var(--bg-surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-violet-300">
              <TrendingUp className="h-4 w-4" />
              Recent Manifestations
            </div>
            <p className="mt-1 text-sm text-zinc-500">The latest actions contributing to the veiled cycle.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-950/15 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-violet-200">
            <Activity className="h-3.5 w-3.5" />
            {shadowEnergy.ledger.length} recorded
          </div>
        </div>

        {shadowEnergy.ledger.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 p-10 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-violet-400/60" />
            <p className="mt-3 text-sm text-zinc-500">No shadow manifestations have been recorded yet.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {shadowEnergy.ledger.slice(0, 8).map(entry => (
              <div key={entry.id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {entry.domain} • {entry.sourceType}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-500">Gain</span>
                  <span className="flex items-center gap-1.5 font-display text-lg font-black text-violet-200">
                    <ArrowUpRight className="h-4 w-4" /> +{entry.finalEnergyGained}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
