import React from 'react';
import { usePOS } from '../POSContext';
import { Swords, Compass, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';
import { ActiveDirectives } from './ActiveDirectives';
import { ExecuteQuestForm } from './ExecuteQuestForm';
import { QuestDirectory } from './QuestDirectory';

export const QuestsView: React.FC = () => {
  const { state, isQuestFinishedForToday, isQuestScheduledForDate, systemDate } = usePOS();

  const activeQuests = state.quests.filter(q => 
    q.status === 'Active' && 
    !isQuestFinishedForToday(q) && 
    isQuestScheduledForDate(q, systemDate)
  );
  const completedQuests = state.quests.filter(q => 
    isQuestFinishedForToday(q) && 
    q.status !== 'Failed' && 
    isQuestScheduledForDate(q, systemDate)
  );
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

      {/* FULL-WIDTH TERMINAL & SYSTEM OPERATIONAL LOG (ACTIVE DIRECTIVES) */}
      <div id="quests-list-container" className="w-full">
        <ActiveDirectives />
      </div>

      {/* FULL-WIDTH QUEST TREE DIRECTORY EXPLORER */}
      <div className="w-full" id="quests-sidebar-container">
        <QuestDirectory />
      </div>
    </div>
  );
};
