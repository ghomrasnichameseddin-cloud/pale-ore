import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { QuestDifficulty, QuestType, QuestRecurrence } from '../types';
import { 
  Plus, SlidersHorizontal, ChevronDown, ChevronUp, Zap, 
  Clock, Target, Folder, Calendar, AlertTriangle, Skull, 
  Layers, Brain, RefreshCw, Sparkles, Tag, Sparkle
} from 'lucide-react';
import { getCategoryDetails } from './ActiveDirectives';
import { RubElHizbIcon } from './IslamicRpgDecorations';

export const ExecuteQuestForm: React.FC = () => {
  const { state, addQuest, systemDate, selectedListId } = usePOS();

  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestType, setNewQuestType] = useState<QuestType>('Main');
  const [newQuestDiff, setNewQuestDiff] = useState<QuestDifficulty>('Normal');
  const [newQuestGoal, setNewQuestGoal] = useState<string>('');
  const [newQuestListId, setNewQuestListId] = useState<string>('');
  const [newQuestSkills, setNewQuestSkills] = useState<string[]>([]);
  const [newQuestDuration, setNewQuestDuration] = useState<number>(30);
  const [newQuestRecurrence, setNewQuestRecurrence] = useState<QuestRecurrence | 'Custom'>('None');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [newQuestDeadline, setNewQuestDeadline] = useState('');

  // UI State: Advanced Parameters Collapsible Drawer
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (selectedListId) {
      setNewQuestListId(selectedListId);
    } else {
      setNewQuestListId('');
    }
  }, [selectedListId]);

  // Custom recurrence creation states
  const [customRecurrenceType, setCustomRecurrenceType] = useState<'days' | 'weekdays' | 'text'>('days');
  const [customRecurrenceDays, setCustomRecurrenceDays] = useState<number>(3);
  const [customRecurrenceWeekdays, setCustomRecurrenceWeekdays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [customRecurrenceText, setCustomRecurrenceText] = useState<string>('Every month');

  // Toggle skills selection for new quest
  const handleSkillToggle = (skillId: string) => {
    setNewQuestSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestName.trim()) return;

    // Estimate XP based on Difficulty
    let xp = 80;
    if (newQuestDiff === 'Easy') xp = 50;
    else if (newQuestDiff === 'Normal') xp = 100;
    else if (newQuestDiff === 'Hard') xp = 200;
    else if (newQuestDiff === 'Boss') xp = 500;

    // Compile Recurrence
    let finalRecurrence: QuestRecurrence = 'None';
    if (newQuestRecurrence === 'Custom') {
      if (customRecurrenceType === 'days') {
        finalRecurrence = `Custom: Every ${customRecurrenceDays} Days`;
      } else if (customRecurrenceType === 'weekdays') {
        finalRecurrence = `Custom: ${customRecurrenceWeekdays.join(', ')}`;
      } else {
        finalRecurrence = `Custom: ${customRecurrenceText}`;
      }
    } else {
      finalRecurrence = newQuestRecurrence;
    }

    addQuest({
      name: newQuestName,
      description: newQuestDescription.trim() || `Rapidly logged via OS terminal interface.`,
      difficulty: newQuestDiff,
      estimatedTime: newQuestDuration,
      xp,
      goalId: newQuestGoal ? newQuestGoal : null,
      projectId: null,
      milestoneId: null,
      listId: newQuestListId ? newQuestListId : null,
      relatedSkills: newQuestSkills,
      type: newQuestType,
      recurrence: finalRecurrence,
      deadline: newQuestDeadline ? newQuestDeadline : null,
      energyLevel: 'Medium'
    });

    setNewQuestName('');
    setNewQuestDescription('');
    setNewQuestSkills([]);
    setNewQuestRecurrence('None');
    setNewQuestDeadline('');
  };

  // Check if advanced configurations have non-default states
  const hasAdvancedChanges = 
    newQuestRecurrence !== 'None' || 
    newQuestGoal !== '' || 
    newQuestListId !== '' || 
    newQuestSkills.length > 0 || 
    newQuestDeadline !== '';

  return (
    <div className="glass-panel rounded-xl p-5 border border-[#c5a059]/25 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg shadow-black/60" id="quick-add-panel">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full" />

      <div className="flex justify-between items-center mb-4 border-b border-[#c5a059]/20 pb-2.5">
        <h4 className="text-xs font-mono text-[#e5c875] uppercase tracking-widest flex items-center gap-2 font-bold">
          <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
          EXECUTE_NEW_QUEST_PROMPT
        </h4>
        <div className="text-[10px] font-mono text-zinc-400">
          SYS_DATE: <span className="text-[#e5c875] font-bold">{systemDate}</span>
        </div>
      </div>
      
      <form onSubmit={handleQuickAdd} className="space-y-4">
        {/* Main Inputs: Title and Description */}
        <div className="space-y-2">
          <div>
            <label className="block text-[9px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">Quest Directive Name</label>
            <input 
              type="text" 
              placeholder="Enter active directive title... (e.g., Memorize Surah Verse / Code API endpoints)"
              value={newQuestName}
              onChange={(e) => setNewQuestName(e.target.value)}
              className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 font-sans transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Optional Scope / Description</label>
            <input
              type="text"
              placeholder="Enter a brief description or context of this task..."
              value={newQuestDescription}
              onChange={(e) => setNewQuestDescription(e.target.value)}
              className="w-full bg-[#07080c] border border-white/10 rounded-lg px-3.5 py-2 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]/50 font-sans transition-all"
            />
          </div>
        </div>

        {/* Primary Configuration Grid (Always Visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Category Type */}
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider font-bold">
                <Layers className="h-3 w-3 text-[#c5a059]" />
                Category
              </label>
              {(() => {
                const catMeta = getCategoryDetails(newQuestType);
                return (
                  <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold flex items-center gap-1 ${catMeta.badgeClass}`}>
                    <span>{catMeta.icon}</span>
                    <span>{catMeta.shortLabel}</span>
                  </span>
                );
              })()}
            </div>
            <select 
              value={newQuestType}
              onChange={(e) => setNewQuestType(e.target.value as QuestType)}
              className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all cursor-pointer"
            >
              <option value="Main">🏆 Main Quest</option>
              <option value="Side">🎯 Side Quest</option>
              <option value="Boss">🔥 Boss Encounter</option>
              <option value="Recovery">🛡️ Recovery Quest</option>
              <option value="Habit">⚡ Habit Quest</option>
              <option value="Optional">🌟 Optional Quest</option>
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
              <SlidersHorizontal className="h-3 w-3 text-[#c5a059]" />
              Difficulty
            </label>
            <select 
              value={newQuestDiff}
              onChange={(e) => setNewQuestDiff(e.target.value as QuestDifficulty)}
              className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all cursor-pointer"
            >
              <option value="Easy">🟢 Easy (+50 XP)</option>
              <option value="Normal">🟡 Normal (+100 XP)</option>
              <option value="Hard">🟠 Hard (+200 XP)</option>
              <option value="Boss">🔴 Boss (+500 XP)</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
              <Clock className="h-3 w-3 text-[#c5a059]" />
              Est. Duration
            </label>
            <div className="relative">
              <input 
                type="number"
                min="5"
                max="480"
                value={newQuestDuration}
                onChange={(e) => setNewQuestDuration(Number(e.target.value))}
                className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-lg pl-3 pr-10 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-[#c5a059] select-none font-bold">MIN</span>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Parameters Panel */}
        <div className="pt-2 border-t border-[#c5a059]/15">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg border text-xs font-mono transition-all ${
              isAdvancedOpen 
                ? 'bg-[#141824] border-[#c5a059]/40 text-[#fef08a]' 
                : 'bg-[#07080c] border-white/5 text-zinc-400 hover:border-[#c5a059]/30 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className={`h-3 w-3 ${hasAdvancedChanges ? 'text-[#e5c875] animate-pulse' : 'text-[#c5a059]'}`} />
              <span className="text-[10px] tracking-wider uppercase font-bold">ADVANCED PARAMETERS</span>
              {hasAdvancedChanges && (
                <span className="bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a] text-[8px] font-bold px-1.5 py-0.5 rounded leading-none">
                  MODIFIED
                </span>
              )}
            </div>
            
            {/* Quick Summary Badge Row when Advanced is closed */}
            <div className="flex items-center gap-3">
              {!isAdvancedOpen && (
                <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-zinc-400">
                  {newQuestRecurrence !== 'None' && <span className="text-[#e5c875]">🔁 {newQuestRecurrence}</span>}
                  {newQuestGoal && <span className="text-purple-400">🎯 Goal</span>}
                  {newQuestListId && <span className="text-cyan-400">📋 List</span>}
                  {newQuestSkills.length > 0 && <span className="text-emerald-400">⚡ {newQuestSkills.length} Skills</span>}
                </div>
              )}
              {isAdvancedOpen ? <ChevronUp className="h-3.5 w-3.5 text-[#c5a059]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#c5a059]" />}
            </div>
          </button>

          {/* Expandable Advanced Area */}
          {isAdvancedOpen && (
            <div className="mt-3.5 p-4 bg-[#07080c]/90 rounded-lg border border-[#c5a059]/20 space-y-4 animate-fadeIn">
              {/* Row 1: Recurrence, Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recurrence Selection */}
                <div>
                  <label className="flex items-center gap-1 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                    <RefreshCw className="h-2.5 w-2.5" /> Recurrence
                  </label>
                  <select 
                    value={newQuestRecurrence}
                    onChange={(e) => setNewQuestRecurrence(e.target.value as any)}
                    className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all cursor-pointer"
                  >
                    <option value="None">Once Only</option>
                    <option value="Daily">🔁 Daily</option>
                    <option value="Every 2 Days">🔁 Every 2 Days</option>
                    <option value="Weekly">🔁 Weekly</option>
                    <option value="Monthly">🔁 Monthly</option>
                    <option value="Custom">⚙️ Custom...</option>
                  </select>
                </div>

                {/* Target Date / Deadline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-1 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider font-bold">
                      <Calendar className="h-2.5 w-2.5" /> Target Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewQuestDeadline(newQuestDeadline ? '' : systemDate)}
                      className={`text-[9px] font-mono hover:underline ${
                        !newQuestDeadline ? 'text-[#e5c875] font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {!newQuestDeadline ? '♾️ No Date (Click to Set)' : 'Clear Date'}
                    </button>
                  </div>
                  <input 
                    type="date"
                    value={newQuestDeadline}
                    onChange={(e) => setNewQuestDeadline(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all"
                  />
                </div>
              </div>

              {/* Custom Recurrence Parameters Sub-Section */}
              {newQuestRecurrence === 'Custom' && (
                <div className="p-3 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg space-y-3">
                  <div className="text-[9px] font-mono text-[#e5c875] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <RubElHizbIcon className="h-2.5 w-2.5" />
                    Custom Recurrence Frequency Setup
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(['days', 'weekdays', 'text'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCustomRecurrenceType(type)}
                        className={`py-1 text-[9px] font-mono rounded-md border uppercase transition-all ${
                          customRecurrenceType === type 
                            ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold' 
                            : 'bg-[#07080c] border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {customRecurrenceType === 'days' && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-400 text-[11px]">Repeat interval:</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="365"
                        value={customRecurrenceDays}
                        onChange={(e) => setCustomRecurrenceDays(Number(e.target.value))}
                        className="w-16 bg-[#07080c] border border-[#c5a059]/40 rounded-md px-2 py-0.5 text-[#e5c875] text-center font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                      />
                      <span className="text-zinc-500 font-mono text-[11px]">day(s)</span>
                    </div>
                  )}

                  {customRecurrenceType === 'weekdays' && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Select active days:</span>
                      <div className="flex flex-wrap gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const isSelected = customRecurrenceWeekdays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setCustomRecurrenceWeekdays(prev => 
                                  prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                );
                              }}
                              className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all ${
                                isSelected 
                                  ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-bold' 
                                  : 'bg-[#07080c] border-white/5 text-zinc-500 hover:text-zinc-400'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {customRecurrenceType === 'text' && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Enter custom schedule text statement:</span>
                      <input 
                        type="text"
                        value={customRecurrenceText}
                        onChange={(e) => setCustomRecurrenceText(e.target.value)}
                        placeholder="e.g. Every 1st Tuesday, every other Friday"
                        className="w-full bg-[#07080c] border border-white/10 rounded-md px-2 py-1 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#c5a059] font-sans"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Row 2: Goal and List assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Goal assignment */}
                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                    <Target className="h-3 w-3" /> Assign Goal Link
                  </label>
                  <select 
                    value={newQuestGoal}
                    onChange={(e) => setNewQuestGoal(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all cursor-pointer"
                  >
                    <option value="">No Assigned Goal</option>
                    {state.goals.map(g => (
                      <option key={g.id} value={g.id}>🎯 {g.name}</option>
                    ))}
                  </select>
                </div>

                {/* List assignment */}
                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                    <Folder className="h-3 w-3" /> Assign List Link
                  </label>
                  <select 
                    value={newQuestListId}
                    onChange={(e) => setNewQuestListId(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#c5a059] font-mono transition-all cursor-pointer truncate"
                  >
                    <option value="">No Assigned List</option>
                    {(state.folders || []).filter(f => !f.archived).map(folder => {
                      const folderLists = (state.lists || []).filter(l => l.folderId === folder.id && !l.archived);
                      if (folderLists.length === 0) return null;
                      return (
                        <optgroup key={folder.id} label={`📁 ${folder.name}`}>
                          {folderLists.map(l => (
                            <option key={l.id} value={l.id}>📋 {l.name}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                    {(state.lists || []).filter(l => !l.folderId && !l.archived).length > 0 && (
                      <optgroup label="Standalone Lists">
                        {(state.lists || []).filter(l => !l.folderId && !l.archived).map(l => (
                          <option key={l.id} value={l.id}>📋 {l.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 4: Skills matrix */}
              <div className="space-y-2 border-t border-[#c5a059]/15 pt-3">
                <label className="flex items-center gap-1.5 text-[9px] font-mono text-[#c5a059] uppercase tracking-wider font-bold">
                  <Brain className="h-3.5 w-3.5" /> Associate Skill Matrix Alignments
                </label>
                
                {/* Primary Skills */}
                {state.skills.filter(s => (s.tier || 'Primary') === 'Primary').length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-[#e5c875] uppercase tracking-widest block font-bold">
                        Primary Disciplines (Multi-Select Enabled)
                      </span>
                      {newQuestSkills.filter(id => {
                        const sk = state.skills.find(s => s.id === id);
                        return sk && (sk.tier || 'Primary') === 'Primary';
                      }).length > 0 && (
                        <span className="text-[8px] font-mono text-[#fef08a] font-bold bg-[#3a2e12] px-1.5 py-0.5 rounded border border-[#c5a059]/50">
                          {newQuestSkills.filter(id => {
                            const sk = state.skills.find(s => s.id === id);
                            return sk && (sk.tier || 'Primary') === 'Primary';
                          }).length} Selected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {state.skills
                        .filter(s => (s.tier || 'Primary') === 'Primary')
                        .map(skill => {
                          const isSelected = newQuestSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleSkillToggle(skill.id)}
                              className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 ${
                                isSelected 
                                  ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059] font-bold shadow-[0_0_10px_rgba(197,160,89,0.2)]' 
                                  : 'bg-[#07080c] text-zinc-400 border-white/5 hover:border-[#c5a059]/30 hover:text-zinc-200'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{skill.name} (L{skill.level})</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Secondary Skills */}
                {state.skills.filter(s => s.tier === 'Secondary').length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block font-bold">Secondary Attributes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {state.skills
                        .filter(s => s.tier === 'Secondary')
                        .map(skill => {
                          const isSelected = newQuestSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleSkillToggle(skill.id)}
                              className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                                isSelected 
                                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/40 font-bold' 
                                  : 'bg-[#07080c] text-zinc-500 border-white/5 hover:border-purple-500/30 hover:text-zinc-300'
                              }`}
                            >
                              {skill.name} (L{skill.level})
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Wide & Clear */}
        <div className="flex justify-end pt-1">
          <button 
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:from-[#a38033] hover:to-[#a38033] text-[#07080c] px-6 py-2.5 rounded-lg text-xs font-mono font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            EXECUTE QUEST DIRECTIVE
          </button>
        </div>
      </form>
    </div>
  );
};
