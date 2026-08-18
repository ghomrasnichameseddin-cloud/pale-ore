import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  JobSpec, TitleSpec, getAllJobs, getAllTitles, getActiveJob, 
  getActiveTitle, isJobUnlocked, isTitleUnlocked, getJobScaledPerk 
} from '../jobsAndTitles';
import { renderTopicIcon } from './matrix/TopicIconHelper';
import { MatrixCard } from './matrix/MatrixCard';
import { SpecEditorModal, SpecEditorMode } from './matrix/SpecEditorModal';
import { LevelUpModal } from './matrix/LevelUpModal';
import { 
  Award, Shield, Star, Plus, X, Search, Filter,
  CheckCircle2, SlidersHorizontal, Sparkles
} from 'lucide-react';

interface JobTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobTitleModal: React.FC<JobTitleModalProps> = ({ isOpen, onClose }) => {
  const { 
    state, updateJob, updateTitle, addCustomJob, addCustomTitle, 
    updateJobSpec, updateTitleSpec, deleteJobSpec, deleteTitleSpec, 
    getJobLvl, getTitleLvl, getPlayerLevelInfo 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'jobs' | 'titles'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal Sub-dialogs State
  const [specEditorState, setSpecEditorState] = useState<{
    isOpen: boolean;
    mode: SpecEditorMode;
    job?: JobSpec | null;
    title?: TitleSpec | null;
  }>({
    isOpen: false,
    mode: 'create-job'
  });

  const [levelUpState, setLevelUpState] = useState<{
    isOpen: boolean;
    job?: JobSpec | null;
    title?: TitleSpec | null;
  }>({
    isOpen: false
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  const playerInfo = getPlayerLevelInfo();
  const allJobs = getAllJobs(state.customJobs || [], state.deletedJobIds || []);
  const allTitles = getAllTitles(state.customTitles || [], state.deletedTitleIds || []);

  const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
  const activeTitle = getActiveTitle(state.profile.equippedTitleId, state.customTitles || [], state.deletedTitleIds || []);

  // Filter items based on search and category
  const filteredJobs = allJobs.filter(j => {
    const matchesSearch = j.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || j.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredTitles = allTitles.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.badge && t.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'Knowledge', 'Iron Will', 'Passion', 'Strategy', 'Logic', 'Mystery', 'Strength', 'Architecture'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="job-title-modal">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* FLOATING TOAST */}
        {toastMessage && (
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl font-mono text-xs font-bold border shadow-2xl flex items-center gap-2 animate-fade-in ${
            toastMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-zinc-900 text-zinc-200 border-white/20'
          }`}>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {toastMessage.text}
          </div>
        )}

        {/* MODAL TOP HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">
              OPERATOR CAREER & HONORIFIC MATRIX
            </span>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-white flex items-center gap-2 mt-0.5 uppercase">
              <Award className="h-5 w-5 text-cyan-400" /> JOB CLASSES & TITLES PROGRESSION SYSTEM
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ACTIVE STATUS HIGHLIGHT BANNER */}
        <div className="px-4 sm:px-5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">ACTIVE JOB CLASS:</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              {renderTopicIcon(activeJob.iconName, "h-4 w-4")}
              <span>{activeJob.name}</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                LVL {getJobLvl(activeJob.id)}/7
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">EQUIPPED HONORIFIC:</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] flex items-center gap-1.5">
              {renderTopicIcon(activeTitle.iconName || 'GraduationCap', 'h-3.5 w-3.5')}
              <span>[{activeTitle.badge}] {activeTitle.name}</span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                LVL {getTitleLvl(activeTitle.id)}/7
              </span>
            </span>
          </div>
        </div>

        {/* MAIN NAV TABS + CREATE BUTTON */}
        <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/20 px-2">
          <div className="flex flex-1">
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'jobs' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Shield className="h-4 w-4" /> JOB CLASSES ({allJobs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('titles')}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'titles' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Star className="h-4 w-4" /> HONORIFIC TITLES ({allTitles.filter(t => isTitleUnlocked(t, state)).length}/{allTitles.length} UNLOCKED)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSpecEditorState({
              isOpen: true,
              mode: activeTab === 'jobs' ? 'create-job' : 'create-title'
            })}
            className="my-1.5 mr-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{activeTab === 'jobs' ? '+ CREATE JOB CLASS' : '+ CREATE TITLE'}</span>
          </button>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="p-3 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input 
              type="text"
              placeholder={`Search ${activeTab === 'jobs' ? 'Job Classes' : 'Honorific Titles'} by name, perk, category...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] text-zinc-500 uppercase font-bold mr-1 shrink-0">Topic:</span>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-cyan-500 text-black' 
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MATRIX CARDS LIST BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'jobs' ? (
            filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <MatrixCard 
                  key={job.id}
                  item={job}
                  isJob={true}
                  isActive={job.id === activeJob.id}
                  onEdit={() => setSpecEditorState({
                    isOpen: true,
                    mode: 'edit-job',
                    job
                  })}
                  onLevelUp={() => setLevelUpState({
                    isOpen: true,
                    job
                  })}
                  onDelete={() => {
                    deleteJobSpec(job.id);
                    showToast(`Deleted job class "${job.name}"`);
                  }}
                  onEquip={() => {
                    updateJob(job.id);
                    showToast(`Switched active Job Class to "${job.name}"!`);
                  }}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-white/5 space-y-2 font-mono">
                <Shield className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400 font-bold">No Job Classes match your query</p>
                <p className="text-xs text-zinc-500">Try clearing filters or create a new custom job class.</p>
              </div>
            )
          ) : (
            filteredTitles.length > 0 ? (
              filteredTitles.map(title => (
                <MatrixCard 
                  key={title.id}
                  item={title}
                  isJob={false}
                  isActive={title.id === activeTitle.id}
                  onEdit={() => setSpecEditorState({
                    isOpen: true,
                    mode: 'edit-title',
                    title
                  })}
                  onLevelUp={() => setLevelUpState({
                    isOpen: true,
                    title
                  })}
                  onDelete={() => {
                    deleteTitleSpec(title.id);
                    showToast(`Deleted title "${title.name}"`);
                  }}
                  onEquip={() => {
                    updateTitle(title.id);
                    showToast(`Equipped honorific title "${title.name}"!`);
                  }}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-white/5 space-y-2 font-mono">
                <Star className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400 font-bold">No Honorific Titles match your query</p>
                <p className="text-xs text-zinc-500">Try clearing filters or create a new custom title.</p>
              </div>
            )
          )}
        </div>

        {/* MODAL BOTTOM FOOTER */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/40 flex justify-between items-center text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Operator Level: <strong className="text-white">Lvl {playerInfo.level}</strong></span>
            <span>•</span>
            <span>Total XP: <strong className="text-cyan-400">{playerInfo.totalXp} XP</strong></span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>

      {/* SPEC EDITOR MODAL (CREATE / EDIT JOB & TITLE) */}
      <SpecEditorModal 
        isOpen={specEditorState.isOpen}
        mode={specEditorState.mode}
        initialJob={specEditorState.job}
        initialTitle={specEditorState.title}
        onClose={() => setSpecEditorState({ isOpen: false, mode: 'create-job' })}
        onSaveJob={(jobData) => {
          if (specEditorState.mode === 'edit-job' && specEditorState.job) {
            updateJobSpec({
              ...specEditorState.job,
              ...jobData,
              id: specEditorState.job.id
            } as JobSpec);
            showToast(`Updated Job Class "${jobData.name}"!`);
          } else {
            addCustomJob(jobData as any);
            showToast(`Created Custom Job Class "${jobData.name}"!`);
          }
        }}
        onSaveTitle={(titleData) => {
          if (specEditorState.mode === 'edit-title' && specEditorState.title) {
            updateTitleSpec({
              ...specEditorState.title,
              ...titleData,
              id: specEditorState.title.id
            } as TitleSpec);
            showToast(`Updated Title "${titleData.name}"!`);
          } else {
            addCustomTitle(titleData as any);
            showToast(`Created Custom Honorific Title "${titleData.name}"!`);
          }
        }}
      />

      {/* LEVEL UP & CONDITION CONFIGURATOR MODAL */}
      {levelUpState.isOpen && (
        <LevelUpModal 
          job={levelUpState.job || null}
          title={levelUpState.title || null}
          onClose={() => setLevelUpState({ isOpen: false })}
          onSaveJobSpec={(updatedJob) => updateJobSpec(updatedJob)}
          onSaveTitleSpec={(updatedTitle) => updateTitleSpec(updatedTitle)}
          onToast={showToast}
        />
      )}

    </div>
  );
};
