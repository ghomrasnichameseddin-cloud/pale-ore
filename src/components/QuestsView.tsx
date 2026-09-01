import React from 'react';
import { usePOS, isQuestArchived } from '../POSContext';
import { Swords, Compass, ShieldAlert, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { ActiveDirectives } from './ActiveDirectives';
import { ExecuteQuestForm } from './ExecuteQuestForm';
import { QuestDirectory } from './QuestDirectory';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { BossProgressionBanner } from './BossProgressionBanner';

export const QuestsView: React.FC = () => {
  const { 
    state, 
    isQuestFinishedForToday, 
    isQuestScheduledForDate, 
    systemDate
  } = usePOS();

  const baseQuests = state.quests.filter(q => {
    if (isQuestArchived(q, state.lists, state.folders)) return false;
    if (state.profile.recoveryMode) {
      if (q.type !== 'Recovery' && q.type !== 'Optional' && q.type !== 'Penalty') return false;
    }
    return true;
  });

  const activeQuests = baseQuests.filter(q => 
    q.status === 'Active' && 
    !isQuestFinishedForToday(q) && 
    isQuestScheduledForDate(q, systemDate) &&
    (!q.deadline || q.deadline <= systemDate)
  );
  const completedQuests = baseQuests.filter(q => 
    isQuestFinishedForToday(q) && 
    q.status !== 'Failed' && 
    isQuestScheduledForDate(q, systemDate)
  );
  const totalQuests = state.quests.filter(q => !isQuestArchived(q, state.lists, state.folders)).length;

  return (
    <div
      className="space-y-6 rounded-2xl border border-[#c5a059]/15 bg-[#0b0d13]/70 p-4 md:p-6 shadow-[0_0_30px_rgba(197,160,89,0.06)] backdrop-blur-sm relative overflow-hidden"
      id="quests-view-root"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.08),transparent_32%)] pointer-events-none" />
      <div className="relative z-10 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c5a059]/20 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            DIRECTIVES & EXPEDITIONS TERMINAL
          </h2>
          <p className="text-xs text-zinc-300 font-mono mt-1">
            SACRED_TRIALS • Execute trials, channel spiritual resonance, and conquer active operations
          </p>
        </div>

        {/* Quick summary status badges */}
        <div className="flex flex-wrap gap-2.5 font-mono text-[11px]">
          <div className="px-3 py-1.5 bg-[#0b0d13] border border-[#c5a059]/20 rounded-lg flex items-center gap-1.5 text-zinc-300 shadow-sm">
            <Compass className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>TOTAL: {totalQuests}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#141824] border border-[#c5a059]/40 rounded-lg flex items-center gap-1.5 text-[#fef08a] font-bold shadow-sm">
            <Circle className="h-3 w-3 text-[#c5a059] fill-[#c5a059]/20 animate-pulse" />
            <span>ACTIVE: {activeQuests.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#0b0d13] border border-emerald-500/30 rounded-lg flex items-center gap-1.5 text-emerald-400 font-bold shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>COMPLETED: {completedQuests.length}</span>
          </div>
        </div>
      </div>

      {/* BOSS PROGRESSION GATE BANNER */}
      <BossProgressionBanner />

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
    </div>
  );
};
