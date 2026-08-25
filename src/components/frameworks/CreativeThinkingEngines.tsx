import React, { useState, useEffect } from 'react';
import { usePOS } from '../../POSContext';
import { 
  Sparkles, Plus, Trash2, CheckCircle, ThumbsUp, 
  Lightbulb, Shuffle, Compass, HelpCircle, Swords, Briefcase, 
  FolderOpen, GitBranch, ArrowRight, Layers, Tag
} from 'lucide-react';
import { UniversalActionModal, ActionSpawnType } from './UniversalActionModal';

// ==========================================
// 1. BRAINSTORMING SANDBOX (POST-IT STICKY BOARD)
// ==========================================

interface IdeaCard {
  id: string;
  category: 'Feature' | 'Strategy' | 'Friction' | 'Wild';
  text: string;
  votes: number;
  tags: string[];
}

export const BrainstormingSandbox: React.FC = () => {
  const [ideas, setIdeas] = useState<IdeaCard[]>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_brainstorm_ideas');
      return saved ? JSON.parse(saved) : [
        { id: 'b-1', category: 'Feature', text: 'Auto-generate weekly Muḥāsabah score summary from completed quests', votes: 5, tags: ['Analytics', 'Muḥāsabah'] },
        { id: 'b-2', category: 'Strategy', text: 'Batch all administrative email & invoicing into a single Friday 16:00 ritual', votes: 4, tags: ['Batching', 'SOP'] },
        { id: 'b-3', category: 'Wild', text: 'Build an ambient sound generator that plays binaural tones synchronized with Pomodoro states', votes: 3, tags: ['Focus', 'Audio'] }
      ];
    } catch {
      return [];
    }
  });

  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'Feature' | 'Strategy' | 'Friction' | 'Wild'>('Feature');
  const [newTag, setNewTag] = useState('');

  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalType, setModalType] = useState<ActionSpawnType>('quest');

  useEffect(() => {
    localStorage.setItem('pale_ore_brainstorm_ideas', JSON.stringify(ideas));
  }, [ideas]);

  const addIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const tags = newTag.split(',').map(t => t.trim()).filter(Boolean);
    const newCard: IdeaCard = {
      id: `idea-${Date.now()}`,
      category: newCategory,
      text: newText.trim(),
      votes: 1,
      tags
    };

    setIdeas([newCard, ...ideas]);
    setNewText('');
    setNewTag('');
  };

  const voteIdea = (id: string) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));
  };

  const removeIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const handleSpawn = (idea: IdeaCard, type: ActionSpawnType) => {
    setModalType(type);
    setModalTitle(idea.text.slice(0, 50));
    setModalDesc(`Category: ${idea.category}\nTags: ${idea.tags.join(', ')}\n\nFull Concept:\n${idea.text}`);
    setModalOpen(true);
  };

  const filteredIdeas = ideas.filter(i => filterCategory === 'ALL' || i.category === filterCategory);

  return (
    <div className="space-y-6" id="brainstorm-sandbox-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> CREATIVE IDEATION FORGE
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">
              {ideas.length} IDEAS IN FORGE
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            BRAINSTORMING SANDBOX & STICKY VAULT
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Rapidly capture raw hypotheses, unconstrained features, and lateral concepts. Upvote and promote into actionable directives.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={addIdea} className="glass-panel p-4 rounded-xl border border-white/10 bg-[#07080c] space-y-3 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="bg-[#0b0d13] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white"
          >
            <option value="Feature">✨ Feature Idea</option>
            <option value="Strategy">♟️ Strategic Move</option>
            <option value="Friction">⚠️ Friction / Bug</option>
            <option value="Wild">🚀 10x Wild Card</option>
          </select>

          <input
            type="text"
            required
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write concept or breakthrough insight..."
            className="md:col-span-2 bg-[#0b0d13] border border-white/15 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Tags (comma-sep)"
              className="flex-1 bg-[#0b0d13] border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-black font-mono font-bold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4 text-black" />
              ADD
            </button>
          </div>
        </div>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'Feature', 'Strategy', 'Friction', 'Wild'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
              filterCategory === cat
                ? 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]'
                : 'bg-[#07080c] text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            {cat} {cat !== 'ALL' && `(${ideas.filter(i => i.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map(idea => {
          const categoryColors = {
            Feature: 'border-cyan-500/30 bg-gradient-to-b from-[#0b141f] to-[#07080c] text-cyan-300',
            Strategy: 'border-[#c5a059]/30 bg-gradient-to-b from-[#181309] to-[#07080c] text-[#fef08a]',
            Friction: 'border-rose-500/30 bg-gradient-to-b from-[#1b090b] to-[#07080c] text-rose-300',
            Wild: 'border-purple-500/30 bg-gradient-to-b from-[#160a22] to-[#07080c] text-purple-300',
          }[idea.category];

          return (
            <div
              key={idea.id}
              className={`p-4 rounded-2xl border ${categoryColors} space-y-3 flex flex-col justify-between shadow-xl transition hover:scale-[1.01]`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase font-bold">
                    {idea.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => voteIdea(idea.id)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 hover:bg-black text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold"
                    >
                      <ThumbsUp className="h-2.5 w-2.5" /> {idea.votes}
                    </button>
                    <button
                      onClick={() => removeIdea(idea.id)}
                      className="text-zinc-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-100 font-sans leading-relaxed">
                  {idea.text}
                </p>

                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {idea.tags.map(t => (
                      <span key={t} className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Spawners */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="text-zinc-500">PROMOTE:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSpawn(idea, 'quest')}
                    className="px-2 py-0.5 rounded bg-black/50 hover:bg-black text-amber-300 border border-amber-500/30"
                  >
                    + Quest
                  </button>
                  <button
                    onClick={() => handleSpawn(idea, 'campaign')}
                    className="px-2 py-0.5 rounded bg-black/50 hover:bg-black text-cyan-300 border border-cyan-500/30"
                  >
                    + Campaign
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Brainstorming Sandbox"
      />

    </div>
  );
};


// ==========================================
// 2. LATERAL THINKING LAB (SCAMPER & PROVOCATION)
// ==========================================

export const LateralThinkingLab: React.FC = () => {
  const [targetConcept, setTargetConcept] = useState('');
  const [activeTechnique, setActiveTechnique] = useState<'SCAMPER' | 'PROVOCATION' | 'RANDOM_STIMULUS'>('SCAMPER');
  
  // Random word bank for lateral stimulus
  const RANDOM_WORDS = [
    'Submarine', 'Origami', 'Pendulum', 'Glacier', 'Black Hole', 
    'Ant Colony', 'Microscope', 'Hourglass', 'Telescope', 'Cathedral',
    'Circuit Board', 'Seedling', 'Labyrinth', 'Prism', 'Beacon'
  ];
  const [currentRandomWord, setCurrentRandomWord] = useState('Glacier');

  const SCAMPER_PROMPTS = [
    { letter: 'S', title: 'Substitute', prompt: 'What materials, steps, people, or rules can you replace?' },
    { letter: 'C', title: 'Combine', prompt: 'What disparate ideas, tools, or workflows can be merged together?' },
    { letter: 'A', title: 'Adapt', prompt: 'What process from nature, gaming, or aviation can you adapt?' },
    { letter: 'M', title: 'Modify / Magnify', prompt: 'What if you made this 10x bigger, 10x faster, or ultra-minimal?' },
    { letter: 'P', title: 'Put to Other Use', prompt: 'How could a completely different industry use this output?' },
    { letter: 'E', title: 'Eliminate', prompt: 'What if you stripped 80% of the features or requirements away?' },
    { letter: 'R', title: 'Reverse / Rearrange', prompt: 'What if you reversed the sequence or flipped the problem upside down?' }
  ];

  const rollRandomWord = () => {
    const next = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    setCurrentRandomWord(next);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');

  const handleSpawn = (technique: string, detail: string) => {
    setModalTitle(`Lateral Breakthrough: ${targetConcept || 'Strategic Shift'}`);
    setModalDesc(`Technique: ${technique}\n\nConcept:\n${detail}\n\nApplied to: ${targetConcept}`);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6" id="lateral-thinking-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-purple-400" /> UNCONVENTIONAL PROBLEM SOLVING
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30">
              SCAMPER & PROVOCATION (PO)
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            LATERAL THINKING LABORATORY
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Shatter rigid mental ruts using Edward de Bono's lateral catalysts, random word juxtaposition, and assumption destruction.
          </p>
        </div>
      </div>

      {/* Target Concept Input */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 bg-[#07080c] space-y-3 shadow-xl">
        <label className="block text-xs font-mono text-zinc-300 uppercase font-bold">
          INPUT THE STUCK PROBLEM, FEATURE, OR STRATEGY TO DISRUPT:
        </label>
        <input
          type="text"
          value={targetConcept}
          onChange={(e) => setTargetConcept(e.target.value)}
          placeholder="e.g. Daily productivity routine feels monotonous and rigid..."
          className="w-full bg-[#0b0d13] border border-white/15 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
        />

        <div className="flex gap-2 pt-1 font-mono text-xs">
          {[
            { id: 'SCAMPER' as const, label: 'SCAMPER Catalyst' },
            { id: 'PROVOCATION' as const, label: 'Provocation Operator (PO)' },
            { id: 'RANDOM_STIMULUS' as const, label: 'Random Word Stimulus' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTechnique(t.id)}
              className={`px-3 py-1.5 rounded-lg border font-bold transition ${
                activeTechnique === t.id
                  ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-md'
                  : 'bg-[#0b0d13] text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Technique Panels */}
      {activeTechnique === 'SCAMPER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCAMPER_PROMPTS.map(p => (
            <div key={p.letter} className="p-4 bg-[#07080c] border border-white/10 hover:border-purple-500/40 rounded-xl space-y-2 flex flex-col justify-between transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs flex items-center justify-center">
                    {p.letter}
                  </span>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">{p.title}</h4>
                </div>
                <p className="text-xs text-zinc-300 font-sans mt-2">{p.prompt}</p>
              </div>

              <button
                onClick={() => handleSpawn(`SCAMPER: ${p.title}`, p.prompt)}
                className="mt-3 text-[10px] font-mono text-purple-400 hover:text-purple-200 flex items-center gap-1 font-bold pt-2 border-t border-white/5"
              >
                SPAWN HYPOTHESIS <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTechnique === 'RANDOM_STIMULUS' && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#0e0719] to-[#07080c] space-y-5 text-center shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">FORCED JUXTAPOSITION STIMULUS:</span>
            <div className="text-3xl font-display font-bold text-white tracking-widest uppercase my-2">
              ⚡ {currentRandomWord} ⚡
            </div>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto font-sans">
              Force an artificial connection between "{currentRandomWord}" and "{targetConcept || 'your initiative'}". What hidden properties, structures, or metaphors can be transferred?
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={rollRandomWord}
              className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Shuffle className="h-3.5 w-3.5" /> ROLL NEW WORD
            </button>
            <button
              onClick={() => handleSpawn('Random Word Stimulus', `Forced Connection with: ${currentRandomWord}`)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
            >
              <Sparkles className="h-3.5 w-3.5" /> INSCRIBE LATERAL IDEA
            </button>
          </div>
        </div>
      )}

      {activeTechnique === 'PROVOCATION' && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#07080c] space-y-4 shadow-xl">
          <h4 className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
            PROVOCATION OPERATOR (PO) - ABSURD HYPOTHESIS TESTING
          </h4>
          <p className="text-xs text-zinc-300 font-sans">
            Make an deliberately absurd statement about the problem: "PO: What if users paid us in time instead of money?" or "PO: What if code wrote tests for features that don't exist yet?" Then ask: <i>What new principle does this suggest?</i>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#0b0d13] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-purple-400 font-bold">1. ESCAPE PROVOCATION</span>
              <p className="text-xs text-zinc-300 font-sans">Escape what we take for granted. If you assume a database is needed, drop the database entirely.</p>
            </div>
            <div className="p-3 bg-[#0b0d13] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-purple-400 font-bold">2. REVERSAL PROVOCATION</span>
              <p className="text-xs text-zinc-300 font-sans">Take the normal direction and reverse it. Instead of customer searching items, items search customers.</p>
            </div>
          </div>
        </div>
      )}

      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="quest"
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Lateral Thinking Lab"
      />

    </div>
  );
};


// ==========================================
// 3. MIND MAPPING GRAPH (NODE-LINK CANVAS)
// ==========================================

interface MapNode {
  id: string;
  label: string;
  category: 'Root' | 'Goal' | 'Campaign' | 'Tactic';
  x: number;
  y: number;
  parentId?: string;
}

export const MindMappingGraph: React.FC = () => {
  const [nodes, setNodes] = useState<MapNode[]>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_mindmap_nodes');
      return saved ? JSON.parse(saved) : [
        { id: 'root', label: 'Pale Ore Dominion', category: 'Root', x: 250, y: 150 },
        { id: 'n1', label: 'Go/Rust Core Engine', category: 'Goal', x: 80, y: 60, parentId: 'root' },
        { id: 'n2', label: 'Codex Architecture', category: 'Campaign', x: 420, y: 60, parentId: 'root' },
        { id: 'n3', label: 'Spiritual Equilibrium', category: 'Goal', x: 80, y: 240, parentId: 'root' },
        { id: 'n4', label: '10-Vault Knowledge Hub', category: 'Tactic', x: 420, y: 240, parentId: 'root' }
      ];
    } catch {
      return [];
    }
  });

  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('root');
  const [newNodeCategory, setNewNodeCategory] = useState<'Goal' | 'Campaign' | 'Tactic'>('Tactic');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');

  useEffect(() => {
    localStorage.setItem('pale_ore_mindmap_nodes', JSON.stringify(nodes));
  }, [nodes]);

  const addNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const parentNode = nodes.find(n => n.id === selectedParentId) || nodes[0];
    const offsetAngle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 40;

    const newNode: MapNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel.trim(),
      category: newNodeCategory,
      x: Math.max(40, Math.min(500, parentNode.x + Math.cos(offsetAngle) * distance)),
      y: Math.max(40, Math.min(300, parentNode.y + Math.sin(offsetAngle) * distance)),
      parentId: selectedParentId
    };

    setNodes([...nodes, newNode]);
    setNewNodeLabel('');
  };

  const removeNode = (id: string) => {
    if (id === 'root') return; // Cannot delete root
    setNodes(nodes.filter(n => n.id !== id && n.parentId !== id));
  };

  const handlePromote = (node: MapNode) => {
    setModalTitle(node.label);
    setModalDesc(`Origin: Mind Map Node (${node.category})\nParent: ${nodes.find(n => n.id === node.parentId)?.label || 'Root'}`);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6" id="mind-map-root">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#c5a059]/30 bg-[#0b0d13] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-cyan-400" /> VISUAL TOPOLOGY & GRAPH
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {nodes.length} NODES LINKED
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase">
            MIND MAPPING & STRATEGIC CONCEPT GRAPH
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Connect ideas hierarchically and laterally. Visualize cross-domain dependencies and convert graph nodes directly to campaigns or quests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive Visual SVG Canvas */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-2xl border border-white/15 bg-[#050609] relative shadow-2xl min-h-[380px] overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 z-10">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">INTERACTIVE STRATEGIC NODE CANVAS</span>
            <span className="text-[9px] font-mono text-[#c5a059]">SVG RENDERED</span>
          </div>

          {/* SVG Canvas for lines */}
          <div className="relative w-full h-[320px] bg-[#050609]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.filter(n => n.parentId).map(n => {
                const parent = nodes.find(p => p.id === n.parentId);
                if (!parent) return null;
                return (
                  <line
                    key={`${n.id}-${parent.id}`}
                    x1={parent.x + 40}
                    y1={parent.y + 15}
                    x2={n.x + 40}
                    y2={n.y + 15}
                    stroke="#c5a059"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />
                );
              })}
            </svg>

            {/* DOM Nodes */}
            {nodes.map(n => {
              const isRoot = n.id === 'root';
              const catBg = isRoot 
                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]' 
                : n.category === 'Goal'
                ? 'bg-amber-950 border-amber-500/40 text-amber-200'
                : n.category === 'Campaign'
                ? 'bg-cyan-950 border-cyan-500/40 text-cyan-200'
                : 'bg-purple-950 border-purple-500/40 text-purple-200';

              return (
                <div
                  key={n.id}
                  style={{ left: `${n.x}px`, top: `${n.y}px` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl border text-[11px] font-mono font-bold shadow-lg flex items-center gap-1.5 z-20 cursor-pointer ${catBg}`}
                  onClick={() => !isRoot && handlePromote(n)}
                >
                  <span>{n.label}</span>
                  {!isRoot && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNode(n.id); }}
                      className="text-zinc-400 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Add Node Form & Node Directory */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#07080c] space-y-4 shadow-xl flex flex-col justify-between">
          <form onSubmit={addNode} className="space-y-3">
            <h4 className="text-xs font-mono text-[#e5c875] font-bold uppercase tracking-wider">
              ADD CONNECTED NODE
            </h4>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">NODE LABEL:</label>
              <input
                type="text"
                required
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="e.g. Distributed Consensus"
                className="w-full bg-[#0b0d13] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">PARENT NODE:</label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full bg-[#0b0d13] border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white font-mono"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">CATEGORY:</label>
                <select
                  value={newNodeCategory}
                  onChange={(e) => setNewNodeCategory(e.target.value as any)}
                  className="w-full bg-[#0b0d13] border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white font-mono"
                >
                  <option value="Goal">Grand Destiny</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Tactic">Tactical Leaf</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              CONNECT NODE
            </button>
          </form>

          {/* Node Summary */}
          <div className="pt-3 border-t border-white/10 space-y-1 text-[10px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Total Nodes:</span>
              <span className="text-white font-bold">{nodes.length}</span>
            </div>
            <p className="text-[9px] text-zinc-500 pt-1">
              Click any node on the canvas to promote it into a Quest or Campaign.
            </p>
          </div>

        </div>

      </div>

      <UniversalActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="campaign"
        initialTitle={modalTitle}
        initialDescription={modalDesc}
        sourceToolName="Mind Mapping Graph"
      />

    </div>
  );
};
