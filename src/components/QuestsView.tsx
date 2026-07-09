import React from 'react';
import { usePOS } from '../POSContext';
import { Swords, Compass, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';
import { ActiveDirectives } from './ActiveDirectives';
import { ExecuteQuestForm } from './ExecuteQuestForm';

export const QuestsView: React.FC = () => {
  const { state } = usePOS();

  const activeQuests = state.quests.filter(q => q.status === 'Active');
  const completedQuests = state.quests.filter(q => q.status === 'Completed');
  const totalQuests = state.quests.length;

  return (
    <div className="space-y-6" id="quests-view-root">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Swords className="h-5 w-5 text-cyan-400 animate-pulse" />
            QUESTS LOG & TERMINAL
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            CORE_DIRECTIVES • Track, complete, and customize active operational objectives
          </p>
        </div>

        {/* Quick summary status badges */}
        <div className="flex flex-wrap gap-2.5 font-mono text-[11px]">
          <div className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg flex items-center gap-1.5 text-zinc-400">
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            <span>TOTAL: {totalQuests}</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg flex items-center gap-1.5 text-yellow-500/80">
            <Circle className="h-3 w-3 text-yellow-500 fill-yellow-500/20 animate-pulse" />
            <span>ACTIVE: {activeQuests.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>COMPLETED: {completedQuests.length}</span>
          </div>
        </div>
      </div>

      {/* NEW QUEST FORM / PROMPT (TOP OF WINDOW) */}
      <div id="quests-form-container">
        <ExecuteQuestForm />
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE DIRECTIVES & HISTORY LOGS (Takes 2/3 space) */}
        <div className="lg:col-span-2 space-y-6" id="quests-list-container">
          <ActiveDirectives />
        </div>

        {/* RIGHT COLUMN: METADATA / GUIDE (Takes 1/3 space) */}
        <div className="space-y-6" id="quests-sidebar-container">
          {/* QUESTING SYSTEM GUIDE CARD */}
          <div className="glass-panel rounded-lg p-5 space-y-4" id="quests-guide-panel">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider border-b border-white/5 pb-2">
              QUESTING_OPERATIONS_MANUAL
            </h4>
            <div className="space-y-3 text-xs leading-relaxed text-zinc-400 font-sans">
              <p>
                <strong className="text-white font-mono uppercase block mb-1">⚔️ Difficulty XP Scaling</strong>
                Each quest rewards Experience Points (XP) mapped dynamically to its difficulty. Higher difficulties yield significantly scaled rewards:
              </p>
              <ul className="space-y-1 font-mono text-[11px] list-disc pl-4 text-zinc-500">
                <li><span className="text-emerald-400 font-bold">EASY</span>: +50 XP</li>
                <li><span className="text-cyan-400 font-bold">NORMAL</span>: +100 XP</li>
                <li><span className="text-amber-400 font-bold">HARD</span>: +200 XP</li>
                <li><span className="text-rose-400 font-bold animate-pulse">BOSS</span>: +500 XP</li>
              </ul>
              <p className="pt-2 border-t border-white/5">
                <strong className="text-white font-mono uppercase block mb-1">🔄 Recurrence Protocols</strong>
                Setup recurring side-quests or daily habits. Completed recurring quests reset according to their cycle to help you rebuild momentum systematically.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
