import React, { useState, useMemo } from 'react';
import { usePOS } from '../../POSContext';
import { PlanningDocument, Doctrine } from '../../types';
import { 
  FolderOpen, FileText, Plus, Search, BookOpen, 
  Trash2, Edit3, Bookmark, ShieldCheck, ArrowRight,
  X, CheckCircle2, ChevronRight, Hash, Layers, Tag
} from 'lucide-react';
import { ArabesqueCorner } from '../IslamicRpgDecorations';
import { getLocalDateString } from '../../utils/dateUtils';

const CODEX_FOLDERS = [
  { path: '00 Vision & High-Level Principles', label: '00 Vision', icon: '🌌', desc: 'Core life mission, spiritual baseline, and overarching identity.' },
  { path: '01 Strategies & Grand Outcomes', label: '01 Strategies', icon: '🎯', desc: 'Long-term destination targets and multi-horizon outcomes.' },
  { path: '02 Master Plans & Architecture', label: '02 Master Plans', icon: '🏛️', desc: 'System architecture, PR/FAQ docs, and structural designs.' },
  { path: '03 Tactical Playbooks', label: '03 Playbooks', icon: '⚔️', desc: 'Tactical execution sequences and deployment battle plans.' },
  { path: '04 Operations & Daily Directives', label: '04 Operations', icon: '⚙️', desc: 'Day-to-day workflow cadence, task queues, and sprint maps.' },
  { path: '05 Standard Operating Procedures (SOPs)', label: '05 SOPs', icon: '📜', desc: 'Standard operating procedures, check-lists, and codifications.' },
  { path: '06 Mental Models & Frameworks', label: '06 Frameworks', icon: '🧠', desc: 'Cognitive models, decision trees, and problem-solving heuristics.' },
  { path: '07 Experiments & Hypotheses', label: '07 Experiments', icon: '🧪', desc: 'Validated trial-and-error logs, bets, and test outcomes.' },
  { path: '08 Lessons Learned & Postmortems', label: '08 Lessons', icon: '💡', desc: 'Blameless postmortems, failure vectors, and reality checks.' },
  { path: '09 Reviews & Archive', label: '09 Reviews', icon: '📦', desc: 'Friday weekly reviews, milestone retrospectives, and archives.' }
];

export const CodexVaultManager: React.FC = () => {
  const { 
    state, addPlanningDocument, updatePlanningDocument, deletePlanningDocument,
    addDoctrine, updateDoctrine, deleteDoctrine, addSystemMessage
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'vault' | 'doctrines'>('vault');
  const [selectedFolder, setSelectedFolder] = useState<string>('00 Vision & High-Level Principles');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isNewDoctrineModalOpen, setIsNewDoctrineModalOpen] = useState(false);

  // New Doc Form
  const [docName, setDocName] = useState('');
  const [docFolder, setDocFolder] = useState('00 Vision & High-Level Principles');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState<any>('Strategy');

  // New Doctrine Form
  const [doctrineName, setDoctrineName] = useState('');
  const [doctrineRule, setDoctrineRule] = useState('');
  const [doctrineAppliesTo, setDoctrineAppliesTo] = useState('');
  const [doctrineOrigin, setDoctrineOrigin] = useState('');
  const [doctrineCategory, setDoctrineCategory] = useState<'Operational' | 'Spiritual' | 'Focus' | 'Strategic' | 'Cognitive'>('Operational');

  const selectedDoc = state.planningDocuments.find(d => d.id === selectedDocId);

  const filteredDocs = useMemo(() => {
    return state.planningDocuments.filter(doc => {
      const inFolder = doc.path === selectedFolder;
      const matchesSearch = !searchQuery.trim() || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      return inFolder && matchesSearch;
    });
  }, [state.planningDocuments, selectedFolder, searchQuery]);

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const id = addPlanningDocument(docFolder, docName.trim(), docContent.trim());
    updatePlanningDocument(id, {
      docType,
      status: 'Active',
      version: 'v1.0',
      lastReviewed: getLocalDateString()
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'log',
      title: 'Codex Inscribed',
      content: `Codex document inscribed: "${docName.trim()}".`,
      priority: 'medium'
    });
    setSelectedFolder(docFolder);
    setSelectedDocId(id);
    setIsNewDocModalOpen(false);
    setDocName('');
    setDocContent('');
  };

  const handleCreateDoctrine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctrineName.trim() || !doctrineRule.trim()) return;

    addDoctrine({
      name: doctrineName.trim(),
      rule: doctrineRule.trim(),
      appliesTo: doctrineAppliesTo.trim() || 'General Operations',
      origin: doctrineOrigin.trim() || 'Codified from strategic operational experience',
      category: doctrineCategory,
      status: 'Active'
    });

    addSystemMessage({
      sender: 'SYSTEM',
      category: 'achievement',
      title: 'Doctrine Inscribed',
      content: `Strategic Doctrine inscribed: "${doctrineName.trim()}".`,
      priority: 'medium'
    });
    setIsNewDoctrineModalOpen(false);
    setDoctrineName('');
    setDoctrineRule('');
    setDoctrineAppliesTo('');
    setDoctrineOrigin('');
  };

  return (
    <div className="space-y-5">
      {/* Top Nav Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border-[#c5a059]/30 bg-[#07080c]/90">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#c5a059]" />
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
              CODEX KNOWLEDGE VAULT & DOCTRINE
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold">
              10 FOLDERS • {state.planningDocuments.length} DOCUMENTS • {(state.doctrines || []).length} DOCTRINES
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Immutable institutional memory: Structured playbooks, standard operating procedures, and codified doctrines.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-mono bg-[#0b0d13] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'vault' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              10-Folder Vault
            </button>
            <button
              onClick={() => setActiveTab('doctrines')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'doctrines' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Doctrines Registry ({ (state.doctrines || []).length })
            </button>
          </div>

          {activeTab === 'vault' ? (
            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Inscribe Document
            </button>
          ) : (
            <button
              onClick={() => setIsNewDoctrineModalOpen(true)}
              className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Inscribe Doctrine
            </button>
          )}
        </div>
      </div>

      {activeTab === 'vault' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar: 10 Folders */}
          <div className="lg:col-span-4 space-y-1.5 glass-panel p-3 rounded-2xl border-white/10 bg-[#0b0d13]">
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase px-2 py-1">
              Knowledge Folders
            </div>

            <div className="space-y-1">
              {CODEX_FOLDERS.map(folder => {
                const count = state.planningDocuments.filter(d => d.path === folder.path).length;
                const isSelected = selectedFolder === folder.path;

                return (
                  <div
                    key={folder.path}
                    onClick={() => { setSelectedFolder(folder.path); setSelectedDocId(null); }}
                    className={`p-2 rounded-xl text-xs font-mono flex items-center justify-between cursor-pointer transition ${
                      isSelected 
                        ? 'bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a] font-bold' 
                        : 'bg-[#07080c] hover:bg-white/5 border border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{folder.icon}</span>
                      <span className="truncate">{folder.label}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-zinc-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Documents List in Selected Folder */}
          <div className="lg:col-span-8 space-y-3">
            <div className="glass-panel p-4 rounded-2xl border-white/10 bg-[#0b0d13] space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-[#c5a059]" />
                  <span className="text-xs font-mono font-bold text-white uppercase truncate">
                    {selectedFolder}
                  </span>
                </div>

                <div className="relative">
                  <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Filter docs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-6 pr-2 py-0.5 text-xs font-mono bg-[#07080c] border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 w-36"
                  />
                </div>
              </div>

              {filteredDocs.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-zinc-600">
                  No documents found in this folder. Click "Inscribe Document" to add one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredDocs.map(doc => {
                    const isSelected = selectedDocId === doc.id;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-[#3a2e12]/40 border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                            : 'bg-[#07080c] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#c5a059] border border-white/10 font-bold uppercase">
                              {doc.docType || 'Document'}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">
                              {doc.version || 'v1.0'}
                            </span>
                          </div>
                          <h4 className="text-xs font-display font-bold text-white line-clamp-1">
                            {doc.name}
                          </h4>
                          <p className="text-[10px] font-mono text-zinc-400 line-clamp-2">
                            {doc.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                          <span>Updated: {doc.updatedAt ? doc.updatedAt.split('T')[0] : 'Today'}</span>
                          <span className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5">
                            Open <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Document Reader / Editor Pane */}
            {selectedDoc && (
              <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0d0f17] space-y-3 relative shadow-2xl">
                <ArabesqueCorner position="top-right" className="top-2 right-2 h-3.5 w-3.5" color="#c5a059" />

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">
                      {selectedDoc.path} • {selectedDoc.docType || 'Document'}
                    </span>
                    <h3 className="text-base font-display font-bold text-white">
                      {selectedDoc.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`Delete Codex document "${selectedDoc.name}"?`)) {
                          deletePlanningDocument(selectedDoc.id);
                          setSelectedDocId(null);
                        }
                      }}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedDocId(null)}
                      className="text-zinc-500 hover:text-white p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={selectedDoc.content}
                    onChange={e => updatePlanningDocument(selectedDoc.id, { content: e.target.value })}
                    rows={12}
                    className="w-full p-3 font-mono text-xs bg-[#07080c] border border-white/10 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5">
                  <span>Last modified: {selectedDoc.updatedAt ? selectedDoc.updatedAt.split('T')[0] : 'Just now'}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Auto-Saved to System Storage
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DOCTRINES REGISTRY */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(state.doctrines || []).length === 0 ? (
              <div className="col-span-3 text-center py-12 glass-panel rounded-2xl border-white/5 text-zinc-500 font-mono text-xs">
                No doctrines codified yet. Inscribe your first operational doctrine above.
              </div>
            ) : (
              (state.doctrines || []).map(doc => (
                <div 
                  key={doc.id}
                  className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0b0d13] space-y-3 hover:border-[#c5a059]/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-[#fef08a] border border-[#c5a059]/30 uppercase">
                        {doc.category} DOCTRINE
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">
                        {doc.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-display font-bold text-white">
                      {doc.name}
                    </h4>

                    <div className="p-2.5 bg-[#07080c] rounded-xl border border-white/5">
                      <p className="text-xs font-mono text-[#fef08a] font-bold leading-relaxed">
                        "{doc.rule}"
                      </p>
                    </div>

                    <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                      <div>
                        <span className="text-zinc-500">Applies To: </span>
                        <span>{doc.appliesTo}</span>
                      </div>
                      {doc.origin && (
                        <div>
                          <span className="text-zinc-500">Origin: </span>
                          <span className="text-zinc-400 italic">{doc.origin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Delete doctrine "${doc.name}"?`)) {
                          deleteDoctrine(doc.id);
                        }
                      }}
                      className="text-zinc-600 hover:text-rose-400 p-1"
                      title="Delete Doctrine"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inscribe Document Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-[#c5a059]/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  INSCRIBE CODEX DOCUMENT
                </h3>
              </div>
              <button 
                onClick={() => setIsNewDocModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Target Knowledge Folder:</label>
                <select
                  value={docFolder}
                  onChange={e => setDocFolder(e.target.value)}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  {CODEX_FOLDERS.map(f => (
                    <option key={f.path} value={f.path}>{f.icon} {f.path}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Document Title:</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. SOP: Production Database Migration Runbook"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Document Type:</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="Strategy">Strategy</option>
                  <option value="SOP">Standard Operating Procedure (SOP)</option>
                  <option value="Framework">Framework / Mental Model</option>
                  <option value="Lesson">Lesson Learned / Postmortem</option>
                  <option value="Experiment">Experiment Specification</option>
                  <option value="Decision">Decision Architecture</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Document Content / Markdown:</label>
                <textarea
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  placeholder="# Purpose & Context&#10;&#10;Specify core axioms, operational rules, and step-by-step procedures."
                  rows={6}
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold rounded-lg cursor-pointer"
                >
                  Inscribe Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inscribe Doctrine Modal */}
      {isNewDoctrineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border-[#c5a059]/40 bg-[#0d0f17] max-w-lg w-full p-6 rounded-2xl space-y-4 relative shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-[#c5a059]" />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  INSCRIBE STRATEGIC DOCTRINE
                </h3>
              </div>
              <button 
                onClick={() => setIsNewDoctrineModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctrine} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Doctrine Name:</label>
                <input
                  type="text"
                  required
                  value={doctrineName}
                  onChange={e => setDoctrineName(e.target.value)}
                  placeholder="e.g. The Single-Branch Rule"
                  className="w-full p-2.5 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">The Immutable Axiom / Rule:</label>
                <textarea
                  required
                  value={doctrineRule}
                  onChange={e => setDoctrineRule(e.target.value)}
                  placeholder="Never commence an adjacent initiative until the primary campaign has delivered its milestone."
                  rows={2}
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category:</label>
                  <select
                    value={doctrineCategory}
                    onChange={e => setDoctrineCategory(e.target.value as any)}
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Strategic">Strategic</option>
                    <option value="Focus">Focus</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Cognitive">Cognitive</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Applies To:</label>
                  <input
                    type="text"
                    value={doctrineAppliesTo}
                    onChange={e => setDoctrineAppliesTo(e.target.value)}
                    placeholder="e.g. Daily sprint planning & new campaigns"
                    className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Origin / Empirical Lesson:</label>
                <input
                  type="text"
                  value={doctrineOrigin}
                  onChange={e => setDoctrineOrigin(e.target.value)}
                  placeholder="e.g. Codified after Q2 cognitive burnout"
                  className="w-full p-2 bg-[#07080c] border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewDoctrineModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold rounded-lg cursor-pointer"
                >
                  Inscribe Doctrine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
