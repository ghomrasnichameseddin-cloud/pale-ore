import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { PlanningDocument } from '../types';
import { 
  Folder, FolderOpen, FileText, Plus, Edit2, Trash2, 
  BookOpen, Eye, Save, Link2, Unlink, ExternalLink,
  ChevronRight, ChevronDown, Search, Compass, CheckSquare, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

interface PlanningViewProps {
  onNavigate?: (tab: 'dashboard' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system' | 'quests') => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ onNavigate }) => {
  const { 
    state, addPlanningDocument, updatePlanningDocument, deletePlanningDocument, linkPlanningDocToComponent 
  } = usePOS();

  const [selectedDocId, setSelectedDocId] = useState<string | null>('pdoc-00-1'); // Default to Life Vision
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Folder expansion state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '00 Vision': true,
    '01 Strategies': true,
    '02 Master Plans': false,
    '03 Tactical Playbooks': false,
    '04 Operations': false,
    '05 SOPs': false,
    '06 Frameworks': false,
    '07 Reviews': false,
    'Archive': false,
  });

  // Creation State
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileFolder, setNewFileFolder] = useState<string>('00 Vision');
  const [customFolder, setCustomFolder] = useState<string>('');

  // Folder editing / renaming state
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState<string>('');

  // Editing state for current document content
  const [editContent, setEditContent] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editPath, setEditPath] = useState<string>('');

  // Link components dropdown selectors
  const [showLinkSelector, setShowLinkSelector] = useState<'goal' | 'project' | 'quest' | 'skill' | null>(null);

  const activeDoc = useMemo(() => {
    const doc = state.planningDocuments.find(d => d.id === selectedDocId);
    if (doc) {
      // Sync local editing buffers when doc selection changes
      setEditContent(doc.content);
      setEditName(doc.name);
      setEditPath(doc.path);
    }
    return doc;
  }, [selectedDocId, state.planningDocuments]);

  // Expand or collapse directory
  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Organize documents by virtual folders
  const folderStructure = useMemo(() => {
    const folders: Record<string, PlanningDocument[]> = {};

    state.planningDocuments.forEach(doc => {
      // Extract top folder name
      const parts = doc.path.split('/');
      const topFolder = parts[0] || 'Unsorted';
      if (!folders[topFolder]) {
        folders[topFolder] = [];
      }
      folders[topFolder].push(doc);
    });

    // Sort files within each folder alphabetically
    Object.keys(folders).forEach(k => {
      folders[k].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Return folders sorted alphabetically by folder name
    const sortedFolders: Record<string, PlanningDocument[]> = {};
    Object.keys(folders).sort().forEach(key => {
      sortedFolders[key] = folders[key];
    });

    return sortedFolders;
  }, [state.planningDocuments]);

  // Sync newFileFolder to first available folder if current one is deleted/renamed
  useEffect(() => {
    const folders = Object.keys(folderStructure);
    if (folders.length > 0 && !folders.includes(newFileFolder) && newFileFolder !== '__custom__') {
      setNewFileFolder(folders[0]);
    }
  }, [folderStructure, newFileFolder]);

  // Filtered folder structure based on search
  const filteredFolderStructure = useMemo(() => {
    if (!searchQuery.trim()) return folderStructure;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, PlanningDocument[]> = {};

    Object.keys(folderStructure).forEach(folder => {
      const docs = folderStructure[folder].filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        doc.content.toLowerCase().includes(query)
      );
      if (docs.length > 0 || folder.toLowerCase().includes(query)) {
        filtered[folder] = folderStructure[folder].filter(doc => 
          doc.name.toLowerCase().includes(query) || 
          doc.content.toLowerCase().includes(query)
        );
      }
    });

    return filtered;
  }, [folderStructure, searchQuery]);

  // Icons for main folders
  const getFolderEmoji = (folder: string): string => {
    if (folder.includes('00 Vision')) return '📜';
    if (folder.includes('01 Strategies')) return '🎯';
    if (folder.includes('02 Master Plans')) return '🧭';
    if (folder.includes('03 Tactical Playbooks')) return '⚔️';
    if (folder.includes('04 Operations')) return '📅';
    if (folder.includes('05 SOPs')) return '📖';
    if (folder.includes('06 Frameworks')) return '💠';
    if (folder.includes('07 Reviews')) return '🔮';
    if (folder.includes('Archive')) return '🗃️';
    return '📁';
  };

  // Custom visual markdown renderer that converts basic markdown to premium cybernetic HTML blocks
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return <p className="text-zinc-500 italic">This scroll is blank.</p>;

    const lines = markdown.split('\n');
    let inList = false;
    let listItems: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 space-y-1.5 my-3 text-zinc-300 font-sans leading-relaxed text-sm">
            {...listItems}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Inline code or inline styling parser
      const parseInlineStyles = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        let currentText = text;
        let styleKey = 0;

        // Simple parse for **bold**, *italic*, and `code`
        while (currentText.length > 0) {
          const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
          const italicMatch = currentText.match(/\*(.*?)\*/);
          const codeMatch = currentText.match(/`(.*?)`/);

          // Find first match
          const matches = [
            { type: 'bold', index: boldMatch?.index ?? -1, length: boldMatch ? boldMatch[0].length : 0, content: boldMatch ? boldMatch[1] : '' },
            { type: 'italic', index: italicMatch?.index ?? -1, length: italicMatch ? italicMatch[0].length : 0, content: italicMatch ? italicMatch[1] : '' },
            { type: 'code', index: codeMatch?.index ?? -1, length: codeMatch ? codeMatch[0].length : 0, content: codeMatch ? codeMatch[1] : '' }
          ].filter(m => m.index !== -1).sort((a, b) => a.index - b.index);

          if (matches.length === 0) {
            parts.push(<span key={`text-${styleKey++}`}>{currentText}</span>);
            break;
          }

          const first = matches[0];
          // Add pre-match text
          if (first.index > 0) {
            parts.push(<span key={`text-${styleKey++}`}>{currentText.slice(0, first.index)}</span>);
          }

          // Add styled text
          if (first.type === 'bold') {
            parts.push(<strong key={`bold-${styleKey++}`} className="font-bold text-[#fef08a] font-sans">{first.content}</strong>);
          } else if (first.type === 'italic') {
            parts.push(<em key={`italic-${styleKey++}`} className="italic text-[#c5a059]">{first.content}</em>);
          } else if (first.type === 'code') {
            parts.push(<code key={`code-${styleKey++}`} className="bg-[#0b0d13] border border-[#c5a059]/30 rounded px-1.5 py-0.5 text-xs font-mono text-[#e5c875]">{first.content}</code>);
          }

          currentText = currentText.slice(first.index + first.length);
        }

        return parts;
      };

      // Header H1
      if (trimmed.startsWith('# ')) {
        flushList(index);
        const text = trimmed.slice(2);
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-display font-extrabold tracking-tight text-white border-b border-[#c5a059]/25 pb-2.5 mt-6 mb-4 flex items-center gap-2 uppercase">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            {parseInlineStyles(text)}
          </h1>
        );
      }
      // Header H2
      else if (trimmed.startsWith('## ')) {
        flushList(index);
        const text = trimmed.slice(3);
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg font-display font-bold tracking-tight text-[#e5c875] mt-5 mb-2.5 uppercase border-l-2 border-[#c5a059] pl-2.5">
            {parseInlineStyles(text)}
          </h2>
        );
      }
      // Header H3
      else if (trimmed.startsWith('### ')) {
        flushList(index);
        const text = trimmed.slice(4);
        elements.push(
          <h3 key={`h3-${index}`} className="text-sm font-sans font-bold text-zinc-200 mt-4 mb-2 uppercase tracking-wide">
            {parseInlineStyles(text)}
          </h3>
        );
      }
      // Checkboxes (- [ ] or - [x])
      else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        flushList(index);
        const isChecked = trimmed.startsWith('- [x]');
        const text = trimmed.slice(5).trim();
        elements.push(
          <div key={`check-${index}`} className="flex items-start gap-2 my-2 text-sm text-zinc-300">
            <span className="mt-0.5 shrink-0">
              {isChecked 
                ? <CheckSquare className="h-4 w-4 text-[#c5a059] fill-[#c5a059]/20" /> 
                : <span className="h-4 w-4 rounded border border-zinc-600 block shrink-0" />
              }
            </span>
            <span className={`${isChecked ? 'line-through text-zinc-500' : ''}`}>
              {parseInlineStyles(text)}
            </span>
          </div>
        );
      }
      // Bullet list items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        const text = trimmed.slice(2);
        listItems.push(
          <li key={`li-${index}`} className="marker:text-[#c5a059] leading-relaxed">
            {parseInlineStyles(text)}
          </li>
        );
      }
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        flushList(index);
        const text = trimmed.slice(2);
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-[#c5a059] bg-[#141824]/60 pl-4 py-2.5 pr-3 my-3 rounded-r-lg text-zinc-300 text-sm font-sans italic leading-relaxed">
            {parseInlineStyles(text)}
          </blockquote>
        );
      }
      // Blank line
      else if (trimmed === '') {
        flushList(index);
        elements.push(<div key={`blank-${index}`} className="h-3" />);
      }
      // Standard Paragraph
      else {
        if (inList) {
          flushList(index);
        }
        elements.push(
          <p key={`p-${index}`} className="text-zinc-300 text-sm font-sans leading-relaxed my-2">
            {parseInlineStyles(trimmed)}
          </p>
        );
      }
    });

    // End-of-file flush
    if (inList) {
      flushList(lines.length);
    }

    return elements;
  };

  const handleSaveDoc = () => {
    if (!activeDoc) return;
    updatePlanningDocument(activeDoc.id, {
      content: editContent,
      name: editName,
      path: `${editPath.split('/')[0]}/${editName}`
    });
    setIsEditMode(false);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let finalName = newFileName.trim();
    if (!finalName.endsWith('.md')) {
      finalName += '.md';
    }

    const targetFolder = newFileFolder === '__custom__' ? customFolder.trim() : newFileFolder;
    if (!targetFolder) return;

    const fullPath = `${targetFolder}/${finalName}`;
    const defaultMarkdown = `# ${finalName.replace('.md', '')}\n\nSeed structured strategies and sacred blueprints aligned with your ${targetFolder.replace(/^\d+\s+/, '')}.`;
    
    const newId = addPlanningDocument(fullPath, finalName, defaultMarkdown);
    
    setNewFileName('');
    setCustomFolder('');
    setIsCreatingFile(false);
    setSelectedDocId(newId);
    setIsEditMode(true);
  };

  const handleDeleteFile = (id: string, name: string) => {
    deletePlanningDocument(id);
    if (selectedDocId === id) {
      setSelectedDocId('pdoc-00-1');
      setIsEditMode(false);
    }
  };

  const handleRenameFolder = (oldFolderName: string, newFolderName: string) => {
    const trimmedNewName = newFolderName.trim();
    if (!trimmedNewName || trimmedNewName === oldFolderName) {
      setEditingFolder(null);
      return;
    }

    const docsToUpdate = state.planningDocuments.filter(doc => doc.path.startsWith(oldFolderName + '/'));
    docsToUpdate.forEach(doc => {
      const restOfPath = doc.path.substring(oldFolderName.length + 1);
      updatePlanningDocument(doc.id, {
        path: `${trimmedNewName}/${restOfPath}`
      });
    });

    if (expandedFolders[oldFolderName] !== undefined) {
      setExpandedFolders(prev => {
        const copy = { ...prev };
        const oldState = copy[oldFolderName];
        delete copy[oldFolderName];
        copy[trimmedNewName] = oldState;
        return copy;
      });
    }

    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderName: string) => {
    const filesInFolder = state.planningDocuments.filter(doc => doc.path.startsWith(folderName + '/'));
    filesInFolder.forEach(doc => {
      deletePlanningDocument(doc.id);
      if (selectedDocId === doc.id) {
        setSelectedDocId('pdoc-00-1');
        setIsEditMode(false);
      }
    });
  };

  // Dropdown list options for linking
  const linkableGoals = useMemo(() => {
    if (!activeDoc) return [];
    return state.goals.filter(g => !activeDoc.linkedGoals?.includes(g.id));
  }, [state.goals, activeDoc]);

  const linkableProjects = useMemo(() => {
    if (!activeDoc) return [];
    return state.projects.filter(p => !activeDoc.linkedProjects?.includes(p.id));
  }, [state.projects, activeDoc]);

  const linkableQuests = useMemo(() => {
    if (!activeDoc) return [];
    return state.quests.filter(q => !activeDoc.linkedQuests?.includes(q.id));
  }, [state.quests, activeDoc]);

  const linkableSkills = useMemo(() => {
    if (!activeDoc) return [];
    return state.skills.filter(s => !activeDoc.linkedSkills?.includes(s.id));
  }, [state.skills, activeDoc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full" id="planning-view-root">
      
      {/* LEFT COLUMN: VIRTUAL MARKDOWN DIRECTORY TREE */}
      <div className="lg:col-span-1 bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl p-4 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] shadow-xl relative overflow-hidden">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        
        {/* Sidebar Header */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-sm font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[#c5a059] shrink-0" />
              GRIMOIRE DIRECTORY
            </h3>
            
            {/* New File Trigger */}
            <button 
              onClick={() => setIsCreatingFile(true)}
              className="p-1 rounded-lg bg-[#3a2e12] border border-[#c5a059]/40 hover:border-[#c5a059] text-[#fef08a] transition cursor-pointer"
              title="Create New Scroll"
              id="btn-create-planning-doc"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#c5a059]" />
            <input 
              type="text" 
              placeholder="Search scrolls & strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07080c] border border-[#c5a059]/20 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#c5a059] placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Directory Structure */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1" id="file-tree-container">
          {Object.keys(filteredFolderStructure).map((folderName) => {
            const hasFiles = filteredFolderStructure[folderName].length > 0;
            const isExpanded = expandedFolders[folderName];
            const folderEmoji = getFolderEmoji(folderName);

            return (
              <div key={folderName} className="space-y-0.5">
                {/* Folder Header Row */}
                <div className="group/folder flex items-center justify-between rounded-lg hover:bg-white/[0.03] transition">
                  {editingFolder === folderName ? (
                    <div className="flex items-center gap-1.5 p-1 w-full">
                      <input
                        type="text"
                        value={folderRenameValue}
                        onChange={(e) => setFolderRenameValue(e.target.value)}
                        className="flex-1 bg-[#07080c] border border-[#c5a059] rounded px-1.5 py-0.5 text-xs font-mono text-zinc-200 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameFolder(folderName, folderRenameValue);
                        }}
                        className="px-2 py-0.5 bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] rounded text-[9px] font-mono shrink-0 cursor-pointer font-bold"
                      >
                        SAVE
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(null);
                        }}
                        className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 border border-white/10 rounded text-[9px] font-mono shrink-0 cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleFolder(folderName)}
                        className="flex-1 flex items-center justify-between text-left px-2 py-1.5 text-xs font-mono font-bold tracking-wide text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] text-[#c5a059]">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                          </span>
                          <span>{folderEmoji} {folderName}</span>
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-1 pr-2">
                        {/* Folder controls - visible on hover */}
                        <div className="opacity-0 group-hover/folder:opacity-100 flex items-center gap-1.5 mr-1.5 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFolder(folderName);
                              setFolderRenameValue(folderName);
                            }}
                            className="p-0.5 text-zinc-500 hover:text-[#e5c875] transition cursor-pointer"
                            title="Rename"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folderName);
                            }}
                            className="p-0.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-[9px] bg-[#07080c] px-1.5 py-0.5 rounded border border-[#c5a059]/20 text-[#c5a059]">
                          {filteredFolderStructure[folderName].length}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Folder Children Files */}
                {isExpanded && (
                  <div className="pl-4 border-l border-[#c5a059]/20 ml-3.5 space-y-0.5 my-1">
                    {hasFiles ? (
                      filteredFolderStructure[folderName].map((doc) => {
                        const isSelected = doc.id === selectedDocId;
                        return (
                          <div 
                            key={doc.id}
                            className={`group flex items-center justify-between pl-2 pr-1.5 py-1 rounded text-xs transition-all duration-150 cursor-pointer ${
                              isSelected 
                                ? 'bg-[#141824] text-[#fef08a] font-bold border-l-2 border-[#c5a059]' 
                                : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                            }`}
                          >
                            <button
                              onClick={() => {
                                setSelectedDocId(doc.id);
                                setIsEditMode(false);
                              }}
                              className="flex-1 text-left font-mono truncate flex items-center gap-1.5 py-0.5 cursor-pointer"
                            >
                              <FileText className={`h-3 w-3 shrink-0 ${isSelected ? 'text-[#c5a059]' : 'text-zinc-600'}`} />
                              <span className="truncate">{doc.name}</span>
                            </button>

                            {/* Delete specific document */}
                            <button
                              onClick={() => handleDeleteFile(doc.id, doc.name)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 hover:text-rose-400 transition cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-zinc-600 italic pl-5 block py-1 font-mono">Empty Grimoire</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create File Modal Pop-in */}
        <AnimatePresence>
          {isCreatingFile && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-3 p-3.5 bg-[#07080c] border border-[#c5a059]/40 rounded-xl shadow-xl"
              id="create-file-widget"
            >
              <form onSubmit={handleCreateFile} className="space-y-2.5">
                <div>
                  <label className="text-[9px] font-mono text-[#c5a059] uppercase tracking-wider block mb-1 font-bold">TARGET DIRECTORY</label>
                  <select 
                    value={newFileFolder}
                    onChange={(e) => setNewFileFolder(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                  >
                    {Object.keys(folderStructure).map(f => (
                      <option key={f} value={f}>{getFolderEmoji(f)} {f}</option>
                    ))}
                    <option value="__custom__">📁 [+ CREATE NEW FOLDER...]</option>
                  </select>

                  {newFileFolder === '__custom__' && (
                    <div className="mt-2">
                      <label className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">NEW FOLDER NAME</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 08 Celestial Arcana"
                        value={customFolder}
                        onChange={(e) => setCustomFolder(e.target.value)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-mono text-[#c5a059] uppercase tracking-wider block mb-1 font-bold">SCROLL / FILE NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mastery Roadmap.md"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#c5a059]"
                    autoFocus
                  />
                </div>

                <div className="flex gap-1.5 justify-end text-[10px] font-mono pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingFile(false)}
                    className="px-2 py-1 text-zinc-500 hover:text-zinc-300"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] px-3 py-1 rounded font-bold cursor-pointer"
                  >
                    INSCRIBE
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT WORKSPACE: MARKDOWN VIEWER OR EDITOR */}
      <div className="lg:col-span-3 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        {activeDoc ? (
          <div className="bg-[#0b0d13] border border-[#c5a059]/30 rounded-xl flex flex-col h-full overflow-hidden shadow-xl relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
            
            {/* Workspace Header */}
            <div className="glass-panel border-b border-[#c5a059]/20 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 bg-[#07080c]/80">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[#c5a059] tracking-wider uppercase block font-bold">
                  📂 {activeDoc.path}
                </span>
                <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059] shrink-0 animate-pulse" />
                  {activeDoc.name}
                </h2>
              </div>

              {/* Mode Toggle & Control Actions */}
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer font-bold ${
                    isEditMode
                      ? 'bg-[#141824] border-[#c5a059]/50 text-zinc-300 hover:text-white'
                      : 'bg-[#3a2e12] border-[#c5a059]/40 text-[#fef08a] hover:border-[#c5a059]'
                  }`}
                  id="btn-toggle-view-edit"
                >
                  {isEditMode ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      PREVIEW SCROLL
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3.5 w-3.5" />
                      INSCRIBE / EDIT
                    </>
                  )}
                </button>

                {isEditMode && (
                  <button
                    onClick={handleSaveDoc}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] text-black font-black rounded-lg transition cursor-pointer"
                    title="Save Changes"
                    id="btn-save-planning-doc"
                  >
                    <Save className="h-3.5 w-3.5" />
                    SAVE SCROLL
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0b0d13]">
              {isEditMode ? (
                /* EDIT MODE: TEXTAREA AND FORMATTING GUIDES */
                <div className="h-full flex flex-col space-y-3">
                  {/* Markdown Format Helpers Bar */}
                  <div className="flex flex-wrap gap-1 border-b border-[#c5a059]/20 pb-2">
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n# `)}
                      className="px-2 py-1 bg-[#07080c] border border-[#c5a059]/20 text-[10px] font-mono text-[#c5a059] hover:border-[#c5a059] rounded transition cursor-pointer font-bold"
                      title="Header 1"
                    >
                      # H1
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n## `)}
                      className="px-2 py-1 bg-[#07080c] border border-[#c5a059]/20 text-[10px] font-mono text-[#c5a059] hover:border-[#c5a059] rounded transition cursor-pointer font-bold"
                      title="Header 2"
                    >
                      ## H2
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n- `)}
                      className="px-2 py-1 bg-[#07080c] border border-white/10 text-[10px] font-mono hover:text-[#e5c875] rounded transition cursor-pointer"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n- [ ] `)}
                      className="px-2 py-1 bg-[#07080c] border border-white/10 text-[10px] font-mono hover:text-[#e5c875] rounded transition cursor-pointer"
                      title="Checklist Item"
                    >
                      ☑ Checklist
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}**bold**`)}
                      className="px-2 py-1 bg-[#07080c] border border-white/10 text-[10px] font-mono hover:text-[#e5c875] rounded transition font-bold cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}*italic*`)}
                      className="px-2 py-1 bg-[#07080c] border border-white/10 text-[10px] font-mono hover:text-[#e5c875] rounded transition italic cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\`code\``)}
                      className="px-2 py-1 bg-[#07080c] border border-white/10 text-[10px] font-mono hover:text-[#e5c875] rounded transition cursor-pointer"
                      title="Code Block"
                    >
                      &lt;/&gt;
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditContent(p => `${p}\n> `)}
                      className="px-2 py-1 bg-[#07080c] border border-white/10 text-[10px] font-mono hover:text-[#e5c875] rounded transition cursor-pointer"
                      title="Quote"
                    >
                      &ldquo; Quote
                    </button>
                  </div>

                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full flex-1 bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-4 font-mono text-sm leading-relaxed text-zinc-200 focus:outline-none focus:border-[#c5a059] resize-none h-64 sm:h-auto min-h-[300px]"
                    placeholder="Inscribe your sacred directives here..."
                  />
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1">
                    <span>CHARS: {editContent.length} • WORDS: {editContent.trim() ? editContent.trim().split(/\s+/).length : 0}</span>
                    <span>LAST SAVED: {new Date(activeDoc.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                /* READ MODE: DETAILED CUSTOM RENDERED HTML AND SYSTEM LINKS PANEL */
                <div className="space-y-8" id="planning-document-view-content">
                  
                  {/* HTML Styled Markdown Output */}
                  <div className="prose max-w-none border-b border-[#c5a059]/20 pb-8">
                    {renderMarkdown(activeDoc.content)}
                  </div>

                  {/* CONNECTED SYSTEMS PANEL */}
                  <div className="space-y-4" id="document-connections-panel">
                    <h3 className="font-display text-xs font-bold text-[#e5c875] tracking-widest uppercase flex items-center gap-2 border-b border-[#c5a059]/20 pb-2">
                      <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                      CONNECTED SACRED HOOKS
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Strategic Goals Connection */}
                      <div className="bg-[#07080c] border border-[#c5a059]/20 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[#c5a059] font-bold uppercase flex items-center gap-1.5">
                            🎯 STRATEGIC DESTINIES
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'goal' ? null : 'goal')}
                            className="text-[9px] font-mono text-[#fef08a] hover:underline cursor-pointer"
                          >
                            {showLinkSelector === 'goal' ? '[CLOSE]' : '[LINK DESTINY]'}
                          </button>
                        </div>

                        {/* Dropdown Goal selector */}
                        {showLinkSelector === 'goal' && (
                          <div className="p-2 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg space-y-2">
                            {linkableGoals.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableGoals.map(g => (
                                  <button
                                    key={g.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'goal', g.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-[#fef08a] p-1 rounded hover:bg-white/[0.02] cursor-pointer"
                                  >
                                    + {g.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-500 italic">No unlinked destinies found.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Goals */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedGoals && activeDoc.linkedGoals.length > 0 ? (
                            state.goals.filter(g => activeDoc.linkedGoals.includes(g.id)).map(g => (
                              <div key={g.id} className="flex justify-between items-center bg-[#0b0d13] border border-[#c5a059]/20 p-2 rounded-lg text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('goals')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-[#fef08a] flex items-center gap-1.5 truncate text-left cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0 text-[#c5a059]" />
                                  <span className="truncate">{g.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'goal', g.id, false)}
                                  className="text-[9px] font-mono text-rose-400 hover:underline shrink-0 pl-2 cursor-pointer"
                                  title="Unlink"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-500 italic">No destinies bound to this scroll.</p>
                          )}
                        </div>
                      </div>

                      {/* Operational Projects Connection */}
                      <div className="bg-[#07080c] border border-[#c5a059]/20 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[#c5a059] font-bold uppercase flex items-center gap-1.5">
                            💼 OPERATIONAL PROJECTS
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'project' ? null : 'project')}
                            className="text-[9px] font-mono text-[#fef08a] hover:underline cursor-pointer"
                          >
                            {showLinkSelector === 'project' ? '[CLOSE]' : '[LINK PROJECT]'}
                          </button>
                        </div>

                        {/* Dropdown Project selector */}
                        {showLinkSelector === 'project' && (
                          <div className="p-2 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg space-y-2">
                            {linkableProjects.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableProjects.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'project', p.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-[#fef08a] p-1 rounded hover:bg-white/[0.02] cursor-pointer"
                                  >
                                    + {p.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-500 italic">No unlinked projects found.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Projects */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedProjects && activeDoc.linkedProjects.length > 0 ? (
                            state.projects.filter(p => activeDoc.linkedProjects.includes(p.id)).map(p => (
                              <div key={p.id} className="flex justify-between items-center bg-[#0b0d13] border border-[#c5a059]/20 p-2 rounded-lg text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('projects')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-[#fef08a] flex items-center gap-1.5 truncate text-left cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0 text-[#c5a059]" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'project', p.id, false)}
                                  className="text-[9px] font-mono text-rose-400 hover:underline shrink-0 pl-2 cursor-pointer"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-500 italic">No projects connected to this master plan.</p>
                          )}
                        </div>
                      </div>

                      {/* Active Quests Connection */}
                      <div className="bg-[#07080c] border border-[#c5a059]/20 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[#c5a059] font-bold uppercase flex items-center gap-1.5">
                            ⚔️ DIRECTIVES & TRIALS
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'quest' ? null : 'quest')}
                            className="text-[9px] font-mono text-[#fef08a] hover:underline cursor-pointer"
                          >
                            {showLinkSelector === 'quest' ? '[CLOSE]' : '[LINK DIRECTIVE]'}
                          </button>
                        </div>

                        {/* Dropdown Quest selector */}
                        {showLinkSelector === 'quest' && (
                          <div className="p-2 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg space-y-2">
                            {linkableQuests.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableQuests.map(q => (
                                  <button
                                    key={q.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'quest', q.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-[#fef08a] p-1 rounded hover:bg-white/[0.02] cursor-pointer"
                                  >
                                    + {q.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-500 italic">No unlinked directives.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Quests */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedQuests && activeDoc.linkedQuests.length > 0 ? (
                            state.quests.filter(q => activeDoc.linkedQuests.includes(q.id)).map(q => (
                              <div key={q.id} className="flex justify-between items-center bg-[#0b0d13] border border-[#c5a059]/20 p-2 rounded-lg text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('quests')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-[#fef08a] flex items-center gap-1.5 truncate text-left cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0 text-[#c5a059]" />
                                  <span className="truncate">{q.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'quest', q.id, false)}
                                  className="text-[9px] font-mono text-rose-400 hover:underline shrink-0 pl-2 cursor-pointer"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-500 italic">No directives associated.</p>
                          )}
                        </div>
                      </div>

                      {/* Skills Path Connection */}
                      <div className="bg-[#07080c] border border-[#c5a059]/20 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[#c5a059] font-bold uppercase flex items-center gap-1.5">
                            🎖️ DISCIPLINES & SKILLS
                          </span>
                          <button 
                            onClick={() => setShowLinkSelector(showLinkSelector === 'skill' ? null : 'skill')}
                            className="text-[9px] font-mono text-[#fef08a] hover:underline cursor-pointer"
                          >
                            {showLinkSelector === 'skill' ? '[CLOSE]' : '[LINK SKILL]'}
                          </button>
                        </div>

                        {/* Dropdown Skill selector */}
                        {showLinkSelector === 'skill' && (
                          <div className="p-2 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg space-y-2">
                            {linkableSkills.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {linkableSkills.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => {
                                      linkPlanningDocToComponent(activeDoc.id, 'skill', s.id, true);
                                      setShowLinkSelector(null);
                                    }}
                                    className="w-full text-left font-mono text-[10px] hover:text-[#fef08a] p-1 rounded hover:bg-white/[0.02] cursor-pointer"
                                  >
                                    + {s.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[9px] font-mono text-zinc-500 italic">No unlinked skills.</p>
                            )}
                          </div>
                        )}

                        {/* Active Linked Skills */}
                        <div className="space-y-1.5">
                          {activeDoc.linkedSkills && activeDoc.linkedSkills.length > 0 ? (
                            state.skills.filter(s => activeDoc.linkedSkills.includes(s.id)).map(s => (
                              <div key={s.id} className="flex justify-between items-center bg-[#0b0d13] border border-[#c5a059]/20 p-2 rounded-lg text-xs">
                                <button
                                  onClick={() => onNavigate && onNavigate('skills')}
                                  className="font-mono text-[10px] text-zinc-300 hover:text-[#fef08a] flex items-center gap-1.5 truncate text-left cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0 text-[#c5a059]" />
                                  <span className="truncate">{s.name}</span>
                                </button>
                                <button
                                  onClick={() => linkPlanningDocToComponent(activeDoc.id, 'skill', s.id, false)}
                                  className="text-[9px] font-mono text-rose-400 hover:underline shrink-0 pl-2 cursor-pointer"
                                >
                                  UNLINK
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] font-mono text-zinc-500 italic">No disciplines bound.</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 bg-[#0b0d13] border border-[#c5a059]/20 rounded-xl flex flex-col justify-center items-center p-8 text-center text-zinc-500">
            <BookOpen className="h-10 w-10 text-[#c5a059]/50 mb-3 animate-pulse" />
            <p className="text-sm font-mono uppercase tracking-widest text-zinc-400">Select a scroll from the grimoire directory to view strategy.</p>
          </div>
        )}
      </div>

    </div>
  );
};
