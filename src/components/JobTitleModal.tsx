import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  getAllJobs, getAllTitles, getActiveJob, getActiveTitle, getUnlockedTitles, JobSpec, TitleSpec 
} from '../jobsAndTitles';
import { 
  Terminal, Code, Brain, Cpu, Zap, Crosshair, Sparkles, Award, Check, Lock, Shield, X, Star, Plus, Trash2, Pencil, Save
} from 'lucide-react';

interface JobTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobTitleModal: React.FC<JobTitleModalProps> = ({ isOpen, onClose }) => {
  const { 
    state, updateJob, updateTitle, getPlayerLevelInfo,
    addCustomJob, updateJobSpec, deleteJobSpec, 
    addCustomTitle, updateTitleSpec, deleteTitleSpec 
  } = usePOS();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'titles'>('jobs');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Custom Job Form State
  const [jobName, setJobName] = useState('');
  const [jobCategory, setJobCategory] = useState('Custom Career');
  const [jobIconName, setJobIconName] = useState('Code');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPerk, setJobPerk] = useState('');
  const [jobReqLevel, setJobReqLevel] = useState(1);

  // New Custom Title Form State
  const [titleName, setTitleName] = useState('');
  const [titleBadge, setTitleBadge] = useState('');
  const [titleCategory, setTitleCategory] = useState('Custom Prestige');
  const [titleDescription, setTitleDescription] = useState('');
  const [titleUnlockCondition, setTitleUnlockCondition] = useState('Custom Player Honorific');

  // Edit State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editJobName, setEditJobName] = useState('');
  const [editJobCategory, setEditJobCategory] = useState('');
  const [editJobIconName, setEditJobIconName] = useState('Code');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobPerk, setEditJobPerk] = useState('');
  const [editJobReqLevel, setEditJobReqLevel] = useState(1);

  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleName, setEditTitleName] = useState('');
  const [editTitleBadge, setEditTitleBadge] = useState('');
  const [editTitleCategory, setEditTitleCategory] = useState('');
  const [editTitleDescription, setEditTitleDescription] = useState('');
  const [editTitleUnlockCondition, setEditTitleUnlockCondition] = useState('');

  if (!isOpen) return null;

  const playerInfo = getPlayerLevelInfo();
  const allJobs = getAllJobs(state.customJobs || [], state.deletedJobIds || []);
  const allTitles = getAllTitles(state.customTitles || [], state.deletedTitleIds || []);

  const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
  const activeTitle = getActiveTitle(state.profile.equippedTitleId, state.customTitles || [], state.deletedTitleIds || []);
  const unlockedTitles = getUnlockedTitles(state);
  const unlockedTitleIds = new Set(unlockedTitles.map(t => t.id));

  const getJobIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="h-5 w-5 text-cyan-400" />;
      case 'Code': return <Code className="h-5 w-5 text-purple-400" />;
      case 'Brain': return <Brain className="h-5 w-5 text-emerald-400" />;
      case 'Cpu': return <Cpu className="h-5 w-5 text-amber-400" />;
      case 'Zap': return <Zap className="h-5 w-5 text-orange-400" />;
      case 'Crosshair': return <Crosshair className="h-5 w-5 text-rose-400" />;
      case 'Sparkles': return <Sparkles className="h-5 w-5 text-yellow-400" />;
      default: return <Award className="h-5 w-5 text-cyan-400" />;
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    addCustomJob({
      name: jobName.trim(),
      category: jobCategory.trim() || 'Custom Career',
      iconName: jobIconName,
      description: jobDescription.trim() || 'User created custom operational class.',
      perk: jobPerk.trim() || '+10% XP bonus on custom tasks',
      unlockedAtLevel: Number(jobReqLevel) || 1
    });

    setJobName('');
    setJobDescription('');
    setJobPerk('');
    setJobReqLevel(1);
    setShowAddForm(false);
  };

  const handleCreateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleName.trim()) return;

    addCustomTitle({
      name: titleName.trim(),
      badge: (titleBadge.trim() || titleName.trim().substring(0, 10)).toUpperCase(),
      category: titleCategory.trim() || 'Custom Prestige',
      description: titleDescription.trim() || 'User created custom player title.',
      unlockCondition: titleUnlockCondition.trim() || 'Custom Honorific'
    });

    setTitleName('');
    setTitleBadge('');
    setTitleDescription('');
    setShowAddForm(false);
  };

  const startEditJob = (job: JobSpec) => {
    setEditingJobId(job.id);
    setEditJobName(job.name);
    setEditJobCategory(job.category);
    setEditJobIconName(job.iconName);
    setEditJobDescription(job.description);
    setEditJobPerk(job.perk);
    setEditJobReqLevel(job.unlockedAtLevel);
  };

  const handleSaveJobEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobId || !editJobName.trim()) return;

    const originalJob = allJobs.find(j => j.id === editingJobId);

    updateJobSpec({
      id: editingJobId,
      name: editJobName.trim(),
      category: editJobCategory.trim() || 'Career Class',
      iconName: editJobIconName,
      description: editJobDescription.trim(),
      perk: editJobPerk.trim(),
      unlockedAtLevel: Number(editJobReqLevel) || 1,
      isCustom: originalJob?.isCustom
    });

    setEditingJobId(null);
  };

  const startEditTitle = (title: TitleSpec) => {
    setEditingTitleId(title.id);
    setEditTitleName(title.name);
    setEditTitleBadge(title.badge);
    setEditTitleCategory(title.category);
    setEditTitleDescription(title.description);
    setEditTitleUnlockCondition(title.unlockCondition);
  };

  const handleSaveTitleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTitleId || !editTitleName.trim()) return;

    const originalTitle = allTitles.find(t => t.id === editingTitleId);

    updateTitleSpec({
      id: editingTitleId,
      name: editTitleName.trim(),
      badge: (editTitleBadge.trim() || editTitleName.trim().substring(0, 10)).toUpperCase(),
      category: editTitleCategory.trim() || 'Prestige Title',
      description: editTitleDescription.trim(),
      unlockCondition: editTitleUnlockCondition.trim(),
      checkUnlocked: originalTitle?.checkUnlocked,
      isCustom: originalTitle?.isCustom
    });

    setEditingTitleId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="job-title-modal">
      <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">OPERATOR CAREER SPECS</span>
            <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2 mt-0.5 uppercase">
              <Award className="h-5 w-5 text-cyan-400" /> JOB CLASSES & HONORIFIC TITLES
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ACTIVE STATUS HIGHLIGHT BANNER */}
        <div className="px-5 py-3 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">ACTIVE JOB:</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              {getJobIcon(activeJob.iconName)}
              {activeJob.name}
              {activeJob.isCustom && <span className="text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 rounded">CUSTOM</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">EQUIPPED TITLE:</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px]">
              [{activeTitle.badge}] {activeTitle.name}
              {activeTitle.isCustom && <span className="ml-1 text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 rounded">CUSTOM</span>}
            </span>
          </div>
        </div>

        {/* NAV TABS + CREATE BUTTON */}
        <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/20 px-2">
          <div className="flex flex-1">
            <button
              onClick={() => { setActiveTab('jobs'); setShowAddForm(false); setEditingJobId(null); setEditingTitleId(null); }}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'jobs' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Shield className="h-4 w-4" /> JOB CLASSES ({allJobs.length})
            </button>
            <button
              onClick={() => { setActiveTab('titles'); setShowAddForm(false); setEditingJobId(null); setEditingTitleId(null); }}
              className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'titles' 
                  ? 'border-cyan-400 text-cyan-400 bg-white/[0.02]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Star className="h-4 w-4" /> HONORIFIC TITLES ({unlockedTitles.length}/{allTitles.length} UNLOCKED)
            </button>
          </div>

          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingJobId(null); setEditingTitleId(null); }}
            className="my-1.5 mr-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAddForm ? 'CANCEL' : activeTab === 'jobs' ? '+ CREATE JOB' : '+ CREATE TITLE'}
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CREATE CUSTOM FORM */}
          {showAddForm && (
            <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3 animate-fade-in mb-4">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4" /> {activeTab === 'jobs' ? 'CREATE CUSTOM JOB CLASS' : 'CREATE CUSTOM HONORIFIC TITLE'}
              </h3>

              {activeTab === 'jobs' ? (
                <form onSubmit={handleCreateJob} className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">JOB CLASS NAME *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. AI Systems Architect"
                        value={jobName}
                        onChange={e => setJobName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">CATEGORY</label>
                      <input 
                        type="text"
                        placeholder="e.g. AI & Engineering"
                        value={jobCategory}
                        onChange={e => setJobCategory(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">CLASS ICON</label>
                      <select 
                        value={jobIconName} 
                        onChange={e => setJobIconName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Terminal">Terminal</option>
                        <option value="Code">Code</option>
                        <option value="Brain">Brain</option>
                        <option value="Cpu">Cpu</option>
                        <option value="Zap">Zap</option>
                        <option value="Crosshair">Crosshair</option>
                        <option value="Sparkles">Sparkles</option>
                        <option value="Award">Award</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">REQUIRED SYSTEM LEVEL</label>
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        value={jobReqLevel}
                        onChange={e => setJobReqLevel(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">CLASS DESCRIPTION</label>
                    <input 
                      type="text"
                      placeholder="e.g. Specializes in building agentic systems and neural architectures."
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">SPECIAL PERK</label>
                    <input 
                      type="text"
                      placeholder="e.g. +15% XP bonus on AI & coding tasks"
                      value={jobPerk}
                      onChange={e => setJobPerk(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all"
                    >
                      SAVE JOB CLASS
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateTitle} className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">TITLE NAME *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Neural Architect"
                        value={titleName}
                        onChange={e => setTitleName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">BADGE TEXT (UPPERCASE)</label>
                      <input 
                        type="text"
                        placeholder="e.g. ARCHITECT"
                        value={titleBadge}
                        onChange={e => setTitleBadge(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">CATEGORY</label>
                      <input 
                        type="text"
                        placeholder="e.g. System Mastery"
                        value={titleCategory}
                        onChange={e => setTitleCategory(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">UNLOCK REQUIREMENT</label>
                      <input 
                        type="text"
                        placeholder="e.g. Custom Player Honorific"
                        value={titleUnlockCondition}
                        onChange={e => setTitleUnlockCondition(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">TITLE DESCRIPTION</label>
                    <input 
                      type="text"
                      placeholder="e.g. Master of neural workflows and multi-agent systems."
                      value={titleDescription}
                      onChange={e => setTitleDescription(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all"
                    >
                      SAVE TITLE
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 1: JOBS / CLASSES */}
          {activeTab === 'jobs' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Select, edit, or create your primary operational Job Class to align your productivity archetype and earn specialized passive perks.
              </p>

              {allJobs.map((job: JobSpec) => {
                const isCurrent = job.id === activeJob.id;
                const isUnlocked = playerInfo.level >= job.unlockedAtLevel;
                const isEditing = editingJobId === job.id;

                if (isEditing) {
                  return (
                    <div key={job.id} className="p-4 bg-zinc-900 border border-purple-500/50 rounded-lg space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                          <Pencil className="h-3.5 w-3.5" /> EDIT JOB CLASS ({job.name})
                        </span>
                        <button 
                          onClick={() => setEditingJobId(null)} 
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveJobEdit} className="space-y-3 text-xs font-mono">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">JOB CLASS NAME *</label>
                            <input 
                              type="text"
                              required
                              value={editJobName}
                              onChange={e => setEditJobName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">CATEGORY</label>
                            <input 
                              type="text"
                              value={editJobCategory}
                              onChange={e => setEditJobCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">CLASS ICON</label>
                            <select 
                              value={editJobIconName} 
                              onChange={e => setEditJobIconName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="Terminal">Terminal</option>
                              <option value="Code">Code</option>
                              <option value="Brain">Brain</option>
                              <option value="Cpu">Cpu</option>
                              <option value="Zap">Zap</option>
                              <option value="Crosshair">Crosshair</option>
                              <option value="Sparkles">Sparkles</option>
                              <option value="Award">Award</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">REQUIRED SYSTEM LEVEL</label>
                            <input 
                              type="number"
                              min="1"
                              max="100"
                              value={editJobReqLevel}
                              onChange={e => setEditJobReqLevel(Number(e.target.value))}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-zinc-400 block mb-1">CLASS DESCRIPTION</label>
                          <input 
                            type="text"
                            value={editJobDescription}
                            onChange={e => setEditJobDescription(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-zinc-400 block mb-1">SPECIAL PERK</label>
                          <input 
                            type="text"
                            value={editJobPerk}
                            onChange={e => setEditJobPerk(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingJobId(null)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded hover:bg-purple-400 transition-all flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" /> SAVE CHANGES
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div 
                    key={job.id}
                    className={`p-4 rounded-lg border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent 
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                        : isUnlocked 
                          ? 'border-white/5 bg-zinc-900/40 hover:border-white/10' 
                          : 'border-white/5 bg-zinc-900/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg border shrink-0 ${isCurrent ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-zinc-900 border-white/5'}`}>
                        {getJobIcon(job.iconName)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-extrabold text-sm text-white uppercase">{job.name}</h4>
                          <span className="text-[9px] font-mono text-zinc-500 border border-white/5 px-1.5 py-0.5 rounded">
                            {job.category}
                          </span>
                          {job.isCustom && (
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              CUSTOM
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/30 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Lock className="h-2.5 w-2.5" /> REQ LVL {job.unlockedAtLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-sans">{job.description}</p>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold bg-white/[0.02] border border-cyan-500/20 rounded px-2 py-1 inline-block mt-1">
                          ⚡ PERK: {job.perk}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex items-center gap-1.5">
                      <button
                        onClick={() => startEditJob(job)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded transition-all"
                        title="Edit / Rename Job Class"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete job class "${job.name}"?`)) {
                            deleteJobSpec(job.id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                        title="Delete Job Class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {isCurrent ? (
                        <button 
                          disabled 
                          className="w-full md:w-auto px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs rounded font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="h-3.5 w-3.5" /> ACTIVE CLASS
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => updateJob(job.id)}
                          className="w-full md:w-auto px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 font-mono text-xs rounded font-bold transition-all flex items-center justify-center gap-1"
                        >
                          EQUIP CLASS
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full md:w-auto px-3 py-1.5 bg-zinc-900 border border-white/5 text-zinc-600 font-mono text-xs rounded cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Lock className="h-3.5 w-3.5" /> LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: HONORIFIC TITLES */}
          {activeTab === 'titles' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Unlock, edit, or create prestige honorific titles to display your achievements and personal status.
              </p>

              {allTitles.map((title: TitleSpec) => {
                const isEquipped = title.id === activeTitle.id;
                const isUnlocked = title.isCustom || unlockedTitleIds.has(title.id);
                const isEditing = editingTitleId === title.id;

                if (isEditing) {
                  return (
                    <div key={title.id} className="p-4 bg-zinc-900 border border-purple-500/50 rounded-lg space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                          <Pencil className="h-3.5 w-3.5" /> EDIT HONORIFIC TITLE ({title.name})
                        </span>
                        <button 
                          onClick={() => setEditingTitleId(null)} 
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveTitleEdit} className="space-y-3 text-xs font-mono">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">TITLE NAME *</label>
                            <input 
                              type="text"
                              required
                              value={editTitleName}
                              onChange={e => setEditTitleName(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">BADGE TEXT (UPPERCASE)</label>
                            <input 
                              type="text"
                              value={editTitleBadge}
                              onChange={e => setEditTitleBadge(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-zinc-400 block mb-1">CATEGORY</label>
                            <input 
                              type="text"
                              value={editTitleCategory}
                              onChange={e => setEditTitleCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">UNLOCK REQUIREMENT</label>
                            <input 
                              type="text"
                              value={editTitleUnlockCondition}
                              onChange={e => setEditTitleUnlockCondition(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-zinc-400 block mb-1">TITLE DESCRIPTION</label>
                          <input 
                            type="text"
                            value={editTitleDescription}
                            onChange={e => setEditTitleDescription(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingTitleId(null)} 
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded hover:bg-purple-400 transition-all flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" /> SAVE CHANGES
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div
                    key={title.id}
                    className={`p-4 rounded-lg border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isEquipped 
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                        : isUnlocked 
                          ? 'border-white/5 bg-zinc-900/40 hover:border-white/10' 
                          : 'border-white/5 bg-zinc-900/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 ${isEquipped ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : isUnlocked ? 'bg-zinc-900 text-amber-400 border-white/5' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isUnlocked 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                              : 'bg-zinc-900 text-zinc-500 border-white/5'
                          }`}>
                            [{title.badge}]
                          </span>
                          <h4 className="font-display font-extrabold text-sm text-white uppercase">{title.name}</h4>
                          <span className="text-[9px] font-mono text-zinc-500 border border-white/5 px-1.5 py-0.5 rounded">
                            {title.category}
                          </span>
                          {title.isCustom && (
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-sans">{title.description}</p>
                        <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 mt-1">
                          <span>UNLOCK:</span>
                          <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-amber-400/80 font-mono'}>
                            {title.unlockCondition}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex items-center gap-1.5">
                      <button
                        onClick={() => startEditTitle(title)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded transition-all"
                        title="Edit / Rename Title"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete title "${title.name}"?`)) {
                            deleteTitleSpec(title.id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                        title="Delete Title"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {isEquipped ? (
                        <button 
                          disabled 
                          className="w-full md:w-auto px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs rounded font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="h-3.5 w-3.5" /> EQUIPPED
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => updateTitle(title.id)}
                          className="w-full md:w-auto px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 font-mono text-xs rounded font-bold transition-all flex items-center justify-center gap-1"
                        >
                          EQUIP TITLE
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full md:w-auto px-3 py-1.5 bg-zinc-900 border border-white/5 text-zinc-600 font-mono text-xs rounded cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Lock className="h-3.5 w-3.5" /> LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded transition-all"
          >
            CLOSE SPECS
          </button>
        </div>

      </div>
    </div>
  );
};

