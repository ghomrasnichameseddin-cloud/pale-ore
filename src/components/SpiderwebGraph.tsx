import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '../POSContext';
import { 
  Network, Target, Award, Zap, Sparkles, Activity, Search, 
  Filter, Layers, Compass, RefreshCw, ZoomIn, ZoomOut, 
  Info, ArrowRight, ShieldCheck, Flame, CheckCircle,
  FileText, Crown, Shield, ShieldAlert, Move, ExternalLink, Moon
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { getAllJobs, getAllTitles, LEVEL_RANK_NAMES, getJobScaledPerk } from '../jobsAndTitles';
import { Quest } from '../types';

export type NodeType = 
  | 'core' 
  | 'attribute' 
  | 'goal' 
  | 'job' 
  | 'project' 
  | 'title' 
  | 'milestone' 
  | 'quest' 
  | 'habit' 
  | 'skill' 
  | 'muhasabah' 
  | 'plan';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  status?: string;
  level?: number;
  rankName?: string;
  progress?: number;
  streakCount?: number;
  xpValue?: number;
  occurrenceCount?: number;
  correctiveStrategy?: string;
  isEquipped?: boolean;
  category?: string;
  x: number;
  y: number;
  radius: number;
  ring: number;
  angle: number;
  color: string;
  secondaryColor?: string;
  isModifiedRecently?: boolean;
  skillTier?: 'Primary' | 'Secondary';
  parentId?: string | null;
  perkDescription?: string;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  sourceType: NodeType;
  targetType: NodeType;
  label?: string;
  weight: number; // 1 to 4 based on XP / completion / equipped status
  energyPulse: boolean; // animated particle energy tracer stream
  color?: string;
  isModifiedRecently?: boolean;
}

interface SpiderwebGraphProps {
  compact?: boolean;
  onSelectEntity?: (type: NodeType, id: string) => void;
  onNavigate?: (tab: string) => void;
}

export const SpiderwebGraph: React.FC<SpiderwebGraphProps> = ({ 
  compact = false, 
  onSelectEntity,
  onNavigate 
}) => {
  const { state, getGoalProgress, getProjectProgress, getSkillXpAndLevel, getAttributes, getJobLvl, getTitleLvl } = usePOS();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NodeType | 'all' | 'primary_skill' | 'secondary_skill' | 'job_title'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [isolateCircuit, setIsolateCircuit] = useState<boolean>(false);
  const [recentModifications, setRecentModifications] = useState<Array<{ id: string; type: NodeType; title: string; timestamp: string; action: string }>>([]);

  const prevItemsRef = useRef<string>('');
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Dimensions of Celestial Star-Map SVG canvas
  const svgWidth = 1100;
  const svgHeight = 1100;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;

  // Concentric orbital rings radii
  // Orbit 0: Core (0)
  // Orbit 1: Attributes (115)
  // Orbit 2: Goals & Job Classes (215)
  // Orbit 3: Projects, Milestones & Titles (310)
  // Orbit 4: Habits & Quests (395)
  // Orbit 5: Skills & Muhāsabah Restraints (470)
  // Orbit 6: Planning Codex Scrolls (530)
  const ringRadii = [0, 115, 215, 310, 395, 470, 530];

  // Deterministic Cosmic Background Stars (Star Dust)
  const cosmicStarDust = useMemo(() => {
    const stars: Array<{ id: number; x: number; y: number; r: number; opacity: number; pulseSpeed: number }> = [];
    for (let i = 0; i < 75; i++) {
      // Deterministic pseudo-random distribution
      const pseudoX = ((i * 137.5 + 43) % 1060) + 20;
      const pseudoY = ((i * 269.3 + 97) % 1060) + 20;
      const r = (i % 5 === 0) ? 2.2 : (i % 3 === 0) ? 1.5 : 0.9;
      const opacity = 0.2 + ((i * 17) % 60) / 100;
      const pulseSpeed = 2 + (i % 4) * 0.8;
      stars.push({ id: i, x: pseudoX, y: pseudoY, r, opacity, pulseSpeed });
    }
    return stars;
  }, []);

  // 1. DYNAMICALLY COMPUTE ALL NODES & EXHAUSTIVE CONNECTIONS FROM POS STATE
  const { nodes, links, nodeMap, modifiedNodeIds } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const linkList: GraphLink[] = [];
    const nMap = new Map<string, GraphNode>();
    const modSet = new Set<string>();
    const addedEdges = new Set<string>();

    const addLink = (
      source: string,
      target: string,
      sourceType: NodeType,
      targetType: NodeType,
      weight: number = 1.5,
      energyPulse: boolean = false,
      color?: string,
      label?: string,
      isModifiedRecently?: boolean
    ) => {
      if (!source || !target || source === target) return;
      const edgeKey = source < target ? `${source}___${target}` : `${target}___${source}`;
      if (addedEdges.has(edgeKey)) return;
      addedEdges.add(edgeKey);

      linkList.push({
        id: `link-${sourceType}-${targetType}-${source}-${target}`,
        source,
        target,
        sourceType,
        targetType,
        label,
        weight,
        energyPulse,
        color,
        isModifiedRecently: isModifiedRecently || false
      });
    };

    // 1A. CORE PLAYER SUN-STAR (Center Ring 0)
    const coreNode: GraphNode = {
      id: 'core-player',
      name: (state.profile as any).name || 'OPERATOR CORE',
      type: 'core',
      level: state.profile.level,
      status: 'Active',
      x: cx,
      y: cy,
      radius: 24,
      ring: 0,
      angle: 0,
      color: '#c5a059', // Imperial Antique Gold
      secondaryColor: '#fef08a'
    };
    nodeList.push(coreNode);
    nMap.set(coreNode.id, coreNode);

    // 1B. CONSTITUTIONAL ATTRIBUTES (Ring 1)
    const attrs = getAttributes();
    attrs.forEach((attr, idx) => {
      const angle = (idx / Math.max(attrs.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = ringRadii[1];
      const isRecentlyModified = ((attr as any).xp || 0) > 0 && attr.level > 1;
      if (isRecentlyModified) modSet.add(attr.id);

      const node: GraphNode = {
        id: attr.id,
        name: attr.name,
        type: 'attribute',
        level: attr.level,
        progress: attr.progress,
        category: (attr as any).domain || 'Constitutional Pillar',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 14,
        ring: 1,
        angle,
        color: '#10b981', // Emerald
        secondaryColor: '#059669',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1C. GOALS (Ring 2)
    const goals = state.goals || [];
    goals.forEach((goal, idx) => {
      const angle = (idx / Math.max(goals.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const r = ringRadii[2];
      const goalProg = getGoalProgress(goal.id);
      const isRecentlyModified = goal.status === 'Completed' || goalProg > 0;
      if (isRecentlyModified) modSet.add(goal.id);

      const node: GraphNode = {
        id: goal.id,
        name: goal.name,
        type: 'goal',
        status: goal.status,
        progress: goalProg,
        category: goal.horizon || 'Destiny Campaign',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 14,
        ring: 2,
        angle,
        color: '#f59e0b', // Amber Supernova
        secondaryColor: '#d97706',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1D. JOB CLASSES (Ring 2 - Alternating or Anchored Near Related Goals)
    const allJobs = getAllJobs(state.customJobs, state.deletedJobIds);
    allJobs.forEach((job, idx) => {
      const isEquipped = job.id === state.profile.jobId;
      const jobLvl = getJobLvl(job.id);
      const rankTitle = LEVEL_RANK_NAMES[jobLvl] || `Rank ${jobLvl}`;
      
      // Angular positioning: near relatedGoalId if exists, else interleaved
      let angle = ((idx + 0.5) / Math.max(allJobs.length, 1)) * 2 * Math.PI;
      const parentGoal = job.relatedGoalId ? nMap.get(job.relatedGoalId) : null;
      if (parentGoal) {
        angle = parentGoal.angle + 0.18;
      }

      const r = ringRadii[2] + 25;
      const isRecentlyModified = isEquipped || jobLvl > 1;
      if (isRecentlyModified) modSet.add(job.id);

      const perkText = getJobScaledPerk(job, jobLvl);

      const node: GraphNode = {
        id: job.id,
        name: job.name,
        type: 'job',
        status: isEquipped ? 'Equipped Active Job' : 'Archetype Available',
        level: jobLvl,
        rankName: rankTitle,
        isEquipped,
        category: job.category || 'Career Discipline',
        perkDescription: perkText,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: isEquipped ? 16 : 13,
        ring: 2,
        angle,
        color: isEquipped ? '#facc15' : '#eab308', // Radiant Gold Spire
        secondaryColor: '#ca8a04',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1E. PROJECTS (Ring 3)
    const projects = state.projects || [];
    projects.forEach((proj, idx) => {
      let angle = (idx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 3;
      const parentGoal = proj.goalId ? nMap.get(proj.goalId) : null;
      if (parentGoal) {
        angle = parentGoal.angle + ((idx % 3 - 1) * 0.22);
      }

      const r = ringRadii[3];
      const projProg = getProjectProgress(proj.id);
      const isRecentlyModified = proj.status === 'Completed' || projProg > 0;
      if (isRecentlyModified) modSet.add(proj.id);

      const node: GraphNode = {
        id: proj.id,
        name: proj.name,
        type: 'project',
        status: proj.status,
        progress: projProg,
        parentId: proj.goalId || null,
        category: proj.status || 'Tactical Operation',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 12,
        ring: 3,
        angle,
        color: '#a855f7', // Amethyst Royal Violet
        secondaryColor: '#7c3aed',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1F. MILESTONES (Ring 3 Sub-orbit)
    const milestones = state.milestones || [];
    milestones.forEach((ms, idx) => {
      let angle = (idx / Math.max(milestones.length, 1)) * 2 * Math.PI;
      const parentProjNode = ms.projectId ? nMap.get(ms.projectId) : null;
      if (parentProjNode) {
        angle = parentProjNode.angle + ((idx % 3 - 1) * 0.18);
      }

      const r = ringRadii[3] + 28;
      const isCompleted = ms.status === 'Completed' || (ms as any).completed;
      if (isCompleted) modSet.add(ms.id);

      const node: GraphNode = {
        id: ms.id,
        name: ms.name,
        type: 'milestone',
        status: isCompleted ? 'Completed' : 'Pending',
        parentId: ms.projectId || ms.goalId || null,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 9,
        ring: 3,
        angle,
        color: '#ec4899', // Pink Gem
        secondaryColor: '#be185d',
        isModifiedRecently: isCompleted
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1G. HONORIFIC TITLES (Ring 3 Sub-orbit)
    const allTitles = getAllTitles(state.customTitles, state.deletedTitleIds);
    allTitles.forEach((title, idx) => {
      const isEquipped = title.id === state.profile.equippedTitleId;
      const titleLvl = getTitleLvl(title.id);
      const rankTitle = LEVEL_RANK_NAMES[titleLvl] || `Rank ${titleLvl}`;

      let angle = ((idx + 0.3) / Math.max(allTitles.length, 1)) * 2 * Math.PI + 0.5;
      const parentGoal = title.relatedGoalId ? nMap.get(title.relatedGoalId) : null;
      const parentProj = title.relatedProjectId ? nMap.get(title.relatedProjectId) : null;
      if (parentProj) {
        angle = parentProj.angle + 0.16;
      } else if (parentGoal) {
        angle = parentGoal.angle + 0.16;
      }

      const r = ringRadii[3] + 22;
      const isRecentlyModified = isEquipped || titleLvl > 1;
      if (isRecentlyModified) modSet.add(title.id);

      const node: GraphNode = {
        id: title.id,
        name: title.name,
        type: 'title',
        status: isEquipped ? 'Equipped Title' : 'Honorific Attuned',
        level: titleLvl,
        rankName: rankTitle,
        isEquipped,
        category: title.category || 'Honorific Accolade',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: isEquipped ? 15 : 12,
        ring: 3,
        angle,
        color: isEquipped ? '#38bdf8' : '#06b6d4', // Cyan Celestial Badge
        secondaryColor: '#0891b2',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // Helper: is a quest a Habit / Sunnah routine
    const isHabitQuest = (q: Quest) => 
      q.type === 'Habit' || 
      (q.recurrence && q.recurrence !== 'None') || 
      q.formation !== undefined || 
      (q.streakCount !== undefined && q.streakCount > 0);

    const allQuests = state.quests || [];
    const habitQuests = allQuests.filter(isHabitQuest);
    const standardQuests = allQuests.filter(q => !isHabitQuest(q));

    // 1H. HABITS & SUNNAHS (Ring 4)
    habitQuests.forEach((habit, idx) => {
      let angle = (idx / Math.max(habitQuests.length, 1)) * 2 * Math.PI + 0.15;
      const parentGoal = habit.goalId ? nMap.get(habit.goalId) : null;
      const parentProj = habit.projectId ? nMap.get(habit.projectId) : null;
      if (parentProj) {
        angle = parentProj.angle + ((idx % 3 - 1) * 0.14);
      } else if (parentGoal) {
        angle = parentGoal.angle + ((idx % 3 - 1) * 0.14);
      }

      const r = ringRadii[4];
      const streak = habit.streakCount || habit.formation?.currentStreak || 0;
      const isRecentlyModified = streak > 0 || habit.status === 'Completed';
      if (isRecentlyModified) modSet.add(habit.id);

      const node: GraphNode = {
        id: habit.id,
        name: habit.name,
        type: 'habit',
        status: habit.status,
        streakCount: streak,
        xpValue: habit.xp,
        category: habit.recurrence || 'Daily Sunnah / Habit',
        parentId: habit.projectId || habit.goalId || null,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: streak > 5 ? 13 : 11,
        ring: 4,
        angle,
        color: '#14b8a6', // Emerald-Teal Habit Star
        secondaryColor: '#0d9488',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1I. STANDARD QUESTS & DECREES (Ring 4)
    standardQuests.forEach((quest, idx) => {
      let angle = (idx / Math.max(standardQuests.length, 1)) * 2 * Math.PI - 0.25;
      const parentGoal = quest.goalId ? nMap.get(quest.goalId) : null;
      const parentProj = quest.projectId ? nMap.get(quest.projectId) : null;

      if (parentProj) {
        angle = parentProj.angle + ((idx % 4 - 1.5) * 0.16);
      } else if (parentGoal) {
        angle = parentGoal.angle + ((idx % 4 - 1.5) * 0.16);
      }

      const r = ringRadii[4] + 25;
      const isRecentlyModified = quest.status === 'Completed' || ((quest as any).xpEarned && (quest as any).xpEarned > 0);
      if (isRecentlyModified) modSet.add(quest.id);

      const node: GraphNode = {
        id: quest.id,
        name: quest.name,
        type: 'quest',
        status: quest.status,
        xpValue: quest.xp,
        parentId: quest.projectId || quest.goalId || null,
        category: quest.difficulty || 'Decree',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: quest.difficulty === 'Boss' ? 14 : 10,
        ring: 4,
        angle,
        color: quest.status === 'Completed' ? '#38bdf8' : quest.status === 'Active' ? '#f43f5e' : '#64748b',
        secondaryColor: quest.status === 'Completed' ? '#0284c7' : '#be123c',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1J. SKILLS (Ring 5 Primary Skills & Satellite Secondary Skills)
    const skills = state.skills || [];
    const primarySkills = skills.filter(s => (s.tier || 'Primary') === 'Primary');
    const secondarySkills = skills.filter(s => s.tier === 'Secondary');

    primarySkills.forEach((skill, idx) => {
      let angle = (idx / Math.max(primarySkills.length, 1)) * 2 * Math.PI - 0.1;
      const parentAttrNode = (skill as any).attributeId ? nMap.get((skill as any).attributeId) : null;
      if (parentAttrNode) {
        angle = parentAttrNode.angle + ((idx % 4 - 1.5) * 0.18);
      }

      const r = ringRadii[5];
      const isRecentlyModified = skill.level > 1 || skill.xp > 0;
      if (isRecentlyModified) modSet.add(skill.id);

      const skillProg = getSkillXpAndLevel(skill.id).progress;
      const node: GraphNode = {
        id: skill.id,
        name: skill.name,
        type: 'skill',
        level: skill.level,
        progress: skillProg,
        skillTier: 'Primary',
        category: skill.primaryAttribute || 'Primary Discipline',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 12,
        ring: 5,
        angle,
        color: '#2563eb', // Sapphire Blue Star
        secondaryColor: '#1d4ed8',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    secondarySkills.forEach((secSkill, idx) => {
      const parentNode = secSkill.parentId ? nMap.get(secSkill.parentId) : null;
      let angle = (idx / Math.max(secondarySkills.length, 1)) * 2 * Math.PI + 0.2;
      let r = ringRadii[5] + 30;

      if (parentNode) {
        angle = parentNode.angle + ((idx % 3 - 1) * 0.15);
      }

      const isRecentlyModified = secSkill.level > 1 || secSkill.xp > 0;
      if (isRecentlyModified) modSet.add(secSkill.id);

      const secSkillProg = getSkillXpAndLevel(secSkill.id).progress;
      const node: GraphNode = {
        id: secSkill.id,
        name: secSkill.name,
        type: 'skill',
        level: secSkill.level,
        progress: secSkillProg,
        skillTier: 'Secondary',
        parentId: secSkill.parentId || null,
        category: 'Secondary Branch',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 8,
        ring: 5,
        angle,
        color: '#818cf8', // Indigo Star
        secondaryColor: '#6366f1',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1K. MUHĀSABAH RESTRAINTS & WEAKNESS AUDITS (Ring 5 - Restraint Wards)
    const weaknesses = state.weaknesses || [];
    weaknesses.forEach((weakness, idx) => {
      // Anchored in the top-right / spiritual sector
      const angle = (idx / Math.max(weaknesses.length, 1)) * (Math.PI * 0.8) - Math.PI * 0.9;
      const r = ringRadii[5] + 15;
      const slips = weakness.occurrenceCount || 0;
      const isClean = slips === 0;
      const isRecentlyModified = slips > 0 || weakness.status === 'Under Control';
      if (isRecentlyModified) modSet.add(weakness.id);

      const node: GraphNode = {
        id: weakness.id,
        name: weakness.name,
        type: 'muhasabah',
        status: isClean ? 'Steadfast (Clean)' : `${slips}/5 Slips Active`,
        occurrenceCount: slips,
        correctiveStrategy: weakness.correctiveStrategy || weakness.triggerCause,
        category: weakness.category || 'Moral Restraint Audit',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 12,
        ring: 5,
        angle,
        color: slips > 0 ? '#ef4444' : weakness.status === 'Overcome' ? '#10b981' : '#f97316', // Crimson Warning Ward
        secondaryColor: slips > 0 ? '#b91c1c' : '#c2410c',
        isModifiedRecently: isRecentlyModified
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // 1L. PLANNING DOCUMENTS & ANCIENT CODEX SCROLLS (Ring 6 Outer Orbit)
    const planningDocs = state.planningDocuments || [];
    planningDocs.forEach((doc, idx) => {
      let angle = (idx / Math.max(planningDocs.length, 1)) * 2 * Math.PI + 0.35;
      const r = ringRadii[6];

      const node: GraphNode = {
        id: doc.id,
        name: doc.name,
        type: 'plan',
        status: 'Active Codex Scroll',
        category: doc.path || 'Doctrine',
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: 9,
        ring: 6,
        angle,
        color: '#2dd4bf', // Teal Ancient Manuscript
        secondaryColor: '#0f766e',
        isModifiedRecently: false
      };
      nodeList.push(node);
      nMap.set(node.id, node);
    });

    // =========================================================================
    // 2. EXHAUSTIVE CROSS-ENTITY CONNECTION NETWORK WITH DYNAMIC LINK RESONANCE
    // =========================================================================

    // 2A. Core Player Links
    attrs.forEach(a => addLink(a.id, coreNode.id, 'attribute', 'core', 2.2, true, '#10b981'));
    goals.forEach(g => addLink(g.id, coreNode.id, 'goal', 'core', g.status === 'Completed' ? 3.5 : 2, true, '#f59e0b'));

    // Equipped Job -> Thick Radiant Gold Stream to Core
    if (state.profile.jobId && nMap.has(state.profile.jobId)) {
      addLink(state.profile.jobId, coreNode.id, 'job', 'core', 4, true, '#facc15', 'Equipped Job');
    }
    allJobs.forEach(j => {
      if (j.id !== state.profile.jobId) {
        addLink(j.id, coreNode.id, 'job', 'core', 1.5, false, '#ca8a04');
      }
    });

    // Equipped Title -> Cyan Radiant Stream to Core
    if (state.profile.equippedTitleId && nMap.has(state.profile.equippedTitleId)) {
      addLink(state.profile.equippedTitleId, coreNode.id, 'title', 'core', 3.8, true, '#38bdf8', 'Equipped Title');
    }
    allTitles.forEach(t => {
      if (t.id !== state.profile.equippedTitleId) {
        addLink(t.id, coreNode.id, 'title', 'core', 1.5, false, '#0891b2');
      }
    });

    // Habits -> Core (Daily spiritual and physical practice sustains vitality)
    habitQuests.forEach(h => {
      const streak = h.streakCount || h.formation?.currentStreak || 0;
      addLink(h.id, coreNode.id, 'habit', 'core', streak > 3 ? 2.8 : 1.6, streak > 0, '#14b8a6');
    });

    // Muhāsabah -> Core (Protective boundary guards core soul vitality)
    weaknesses.forEach(w => {
      const isClean = (w.occurrenceCount || 0) === 0;
      addLink(w.id, coreNode.id, 'muhasabah', 'core', isClean ? 2.5 : 3.2, isClean, isClean ? '#10b981' : '#ef4444');
    });

    // 2B. Job Relations (Job -> Goals, Projects, Skills)
    allJobs.forEach(job => {
      if (job.relatedGoalId && nMap.has(job.relatedGoalId)) {
        addLink(job.id, job.relatedGoalId, 'job', 'goal', 3, true, '#eab308');
      }
      if (job.relatedGoalIds && Array.isArray(job.relatedGoalIds)) {
        job.relatedGoalIds.forEach(gId => {
          if (nMap.has(gId)) addLink(job.id, gId, 'job', 'goal', 2.5, true, '#eab308');
        });
      }
      if (job.relatedProjectId && nMap.has(job.relatedProjectId)) {
        addLink(job.id, job.relatedProjectId, 'job', 'project', 2.5, true, '#eab308');
      }
      if (job.skillRequirements && Array.isArray(job.skillRequirements)) {
        job.skillRequirements.forEach(sReq => {
          if (nMap.has(sReq.skillId)) {
            addLink(job.id, sReq.skillId, 'job', 'skill', 2.4, true, '#eab308');
          }
        });
      }
    });

    // 2C. Title Relations (Title -> Goals, Projects, Skills)
    allTitles.forEach(title => {
      if (title.relatedGoalId && nMap.has(title.relatedGoalId)) {
        addLink(title.id, title.relatedGoalId, 'title', 'goal', 2.8, true, '#06b6d4');
      }
      if (title.relatedProjectId && nMap.has(title.relatedProjectId)) {
        addLink(title.id, title.relatedProjectId, 'title', 'project', 2.4, true, '#06b6d4');
      }
      if (title.skillRequirements && Array.isArray(title.skillRequirements)) {
        title.skillRequirements.forEach(sReq => {
          if (nMap.has(sReq.skillId)) {
            addLink(title.id, sReq.skillId, 'title', 'skill', 2.2, true, '#06b6d4');
          }
        });
      }
    });

    // 2D. Goal Relations (Goal -> Skills)
    goals.forEach(goal => {
      if (goal.relatedSkills && Array.isArray(goal.relatedSkills)) {
        goal.relatedSkills.forEach(sId => {
          if (nMap.has(sId)) addLink(goal.id, sId, 'goal', 'skill', 2.2, false, '#f59e0b');
        });
      }
    });

    // 2E. Project Relations (Project -> Goal)
    projects.forEach(proj => {
      if (proj.goalId && nMap.has(proj.goalId)) {
        addLink(proj.id, proj.goalId, 'project', 'goal', 2.5, true, '#a855f7');
      } else {
        addLink(proj.id, coreNode.id, 'project', 'core', 1.8, false, '#a855f7');
      }
    });

    // 2F. Milestone Relations (Milestone -> Project, Goal)
    milestones.forEach(ms => {
      if (ms.projectId && nMap.has(ms.projectId)) {
        addLink(ms.id, ms.projectId, 'milestone', 'project', 1.8, false, '#ec4899');
      }
      if (ms.goalId && nMap.has(ms.goalId)) {
        addLink(ms.id, ms.goalId, 'milestone', 'goal', 1.8, false, '#ec4899');
      }
    });

    // 2G. Habit Relations (Habit -> Goal, Project, Skills)
    habitQuests.forEach(habit => {
      const streak = habit.streakCount || habit.formation?.currentStreak || 0;
      const weight = streak > 5 ? 3 : 2;
      const isLive = streak > 0;

      if (habit.goalId && nMap.has(habit.goalId)) {
        addLink(habit.id, habit.goalId, 'habit', 'goal', weight, isLive, '#14b8a6');
      }
      if (habit.projectId && nMap.has(habit.projectId)) {
        addLink(habit.id, habit.projectId, 'habit', 'project', weight, isLive, '#14b8a6');
      }
      const hSkills = habit.relatedSkills || (habit as any).skillIds || [];
      if (Array.isArray(hSkills)) {
        hSkills.forEach(sId => {
          if (nMap.has(sId)) addLink(habit.id, sId, 'habit', 'skill', weight, isLive, '#14b8a6');
        });
      }
    });

    // 2H. Standard Quest Relations (Quest -> Goal, Project, Milestone, Skills)
    standardQuests.forEach(quest => {
      const isCompleted = quest.status === 'Completed';
      const weight = quest.difficulty === 'Boss' ? 3.5 : isCompleted ? 2.5 : 1.8;
      const isLive = isCompleted || quest.status === 'Active';

      if (quest.goalId && nMap.has(quest.goalId)) {
        addLink(quest.id, quest.goalId, 'quest', 'goal', weight, isLive, isCompleted ? '#38bdf8' : '#f43f5e');
      }
      if (quest.projectId && nMap.has(quest.projectId)) {
        addLink(quest.id, quest.projectId, 'quest', 'project', weight, isLive, isCompleted ? '#38bdf8' : '#f43f5e');
      }
      if (quest.milestoneId && nMap.has(quest.milestoneId)) {
        addLink(quest.id, quest.milestoneId, 'quest', 'milestone', weight, isLive, isCompleted ? '#38bdf8' : '#f43f5e');
      }
      const qSkills = quest.relatedSkills || (quest as any).skillIds || [];
      if (Array.isArray(qSkills)) {
        qSkills.forEach(sId => {
          if (nMap.has(sId)) addLink(quest.id, sId, 'quest', 'skill', weight, isLive, '#3b82f6');
        });
      }
    });

    // 2I. Skill Relations (Skill -> Attribute, Parent Skill, Goal, Project)
    skills.forEach(skill => {
      if ((skill as any).attributeId && nMap.has((skill as any).attributeId)) {
        addLink(skill.id, (skill as any).attributeId, 'skill', 'attribute', 2.4, true, '#10b981');
      }
      if (skill.parentId && nMap.has(skill.parentId)) {
        addLink(skill.id, skill.parentId, 'skill', 'skill', 2, true, '#818cf8', 'Parent Skill');
      }
      if (skill.relatedGoals && Array.isArray(skill.relatedGoals)) {
        skill.relatedGoals.forEach(gId => {
          if (nMap.has(gId)) addLink(skill.id, gId, 'skill', 'goal', 2, false, '#f59e0b');
        });
      }
      if (skill.relatedProjects && Array.isArray(skill.relatedProjects)) {
        skill.relatedProjects.forEach(pId => {
          if (nMap.has(pId)) addLink(skill.id, pId, 'skill', 'project', 2, false, '#a855f7');
        });
      }
    });

    // 2J. Muhāsabah Restraints -> Associated Constitutional Attributes
    weaknesses.forEach(w => {
      // Find matching attribute based on category (Soul, Mind, Willpower, Self-Discipline)
      const matchingAttr = attrs.find(a => 
        a.name.toLowerCase().includes(w.category?.toLowerCase() || '') ||
        a.name.toLowerCase().includes('willpower') ||
        a.name.toLowerCase().includes('soul')
      );
      if (matchingAttr && nMap.has(matchingAttr.id)) {
        addLink(w.id, matchingAttr.id, 'muhasabah', 'attribute', 2.2, (w.occurrenceCount || 0) === 0, '#ef4444');
      }
    });

    // 2K. Planning Document Relations
    planningDocs.forEach(doc => {
      if (doc.linkedGoals && Array.isArray(doc.linkedGoals)) {
        doc.linkedGoals.forEach(gId => {
          if (nMap.has(gId)) addLink(doc.id, gId, 'plan', 'goal', 1.8, false, '#2dd4bf');
        });
      }
      if (doc.linkedProjects && Array.isArray(doc.linkedProjects)) {
        doc.linkedProjects.forEach(pId => {
          if (nMap.has(pId)) addLink(doc.id, pId, 'plan', 'project', 1.8, false, '#2dd4bf');
        });
      }
      if (doc.linkedQuests && Array.isArray(doc.linkedQuests)) {
        doc.linkedQuests.forEach(qId => {
          if (nMap.has(qId)) addLink(doc.id, qId, 'plan', 'quest', 1.8, false, '#2dd4bf');
        });
      }
      if (doc.linkedSkills && Array.isArray(doc.linkedSkills)) {
        doc.linkedSkills.forEach(sId => {
          if (nMap.has(sId)) addLink(doc.id, sId, 'plan', 'skill', 1.8, false, '#2dd4bf');
        });
      }
    });

    return { nodes: nodeList, links: linkList, nodeMap: nMap, modifiedNodeIds: modSet };
  }, [state, getAttributes, getGoalProgress, getProjectProgress, getSkillXpAndLevel, getJobLvl, getTitleLvl]);

  // REAL-TIME MODIFICATION AUDIT LOG
  useEffect(() => {
    const currentStateSummary = JSON.stringify({
      quests: state.quests.map(q => ({ id: q.id, status: q.status, streak: q.streakCount })),
      goals: state.goals.map(g => ({ id: g.id, status: g.status, p: getGoalProgress(g.id) })),
      projects: state.projects.map(p => ({ id: p.id, status: p.status, pr: getProjectProgress(p.id) })),
      skills: state.skills.map(s => ({ id: s.id, lvl: s.level, xp: s.xp })),
      jobId: state.profile.jobId,
      titleId: state.profile.equippedTitleId,
      weaknesses: state.weaknesses?.map(w => ({ id: w.id, o: w.occurrenceCount }))
    });

    if (prevItemsRef.current && prevItemsRef.current !== currentStateSummary) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecentModifications(prev => [
        {
          id: `mod-${Date.now()}`,
          type: 'quest',
          title: 'Celestial Resonance Harmonic Updated',
          timestamp: nowStr,
          action: 'State Mutated'
        },
        ...prev.slice(0, 9)
      ]);
    }
    prevItemsRef.current = currentStateSummary;
  }, [state, getGoalProgress, getProjectProgress]);

  // ACTIVE FOCUS NODE
  const activeFocusId = selectedNodeId || hoveredNodeId;
  const activeFocusNode = activeFocusId ? nodeMap.get(activeFocusId) : null;

  // =========================================================================
  // MULTI-HOP CIRCUIT TRAVERSAL & CIRCUIT NETWORK CALCULATION
  // =========================================================================
  const { circuitNodeMap, circuitLinkIds, maxCircuitHop, circuitStats, circuitNodesList } = useMemo(() => {
    if (!activeFocusId || !nodeMap.has(activeFocusId)) {
      return {
        circuitNodeMap: new Map<string, number>(),
        circuitLinkIds: new Set<string>(),
        maxCircuitHop: 0,
        circuitStats: { 
          goal: 0, 
          job: 0, 
          project: 0, 
          title: 0, 
          quest: 0, 
          habit: 0, 
          skill: 0, 
          muhasabah: 0, 
          attribute: 0, 
          milestone: 0, 
          plan: 0, 
          core: 0 
        },
        circuitNodesList: [] as GraphNode[]
      };
    }

    const nodeHops = new Map<string, number>();
    nodeHops.set(activeFocusId, 0);

    const queue: Array<{ id: string; hop: number }> = [{ id: activeFocusId, hop: 0 }];
    let maxHop = 0;

    // Build adjacency list across all links
    const adj = new Map<string, Array<{ targetId: string; linkId: string }>>();
    links.forEach(l => {
      if (!adj.has(l.source)) adj.set(l.source, []);
      if (!adj.has(l.target)) adj.set(l.target, []);
      adj.get(l.source)!.push({ targetId: l.target, linkId: l.id });
      adj.get(l.target)!.push({ targetId: l.source, linkId: l.id });
    });

    // BFS Multi-Hop Traversal to discover the full connected circuit
    while (queue.length > 0) {
      const { id, hop } = queue.shift()!;
      maxHop = Math.max(maxHop, hop);

      const neighbors = adj.get(id) || [];
      for (const edge of neighbors) {
        if (!nodeHops.has(edge.targetId)) {
          nodeHops.set(edge.targetId, hop + 1);
          queue.push({ id: edge.targetId, hop: hop + 1 });
        }
      }
    }

    // Circuit links are links where BOTH source and target are in the circuit
    const linkIds = new Set<string>();
    links.forEach(l => {
      if (nodeHops.has(l.source) && nodeHops.has(l.target)) {
        linkIds.add(l.id);
      }
    });

    const stats = { 
      goal: 0, 
      job: 0, 
      project: 0, 
      title: 0, 
      quest: 0, 
      habit: 0, 
      skill: 0, 
      muhasabah: 0, 
      attribute: 0, 
      milestone: 0, 
      plan: 0, 
      core: 0 
    };
    const list: GraphNode[] = [];

    nodeHops.forEach((hop, id) => {
      const node = nodeMap.get(id);
      if (node) {
        list.push(node);
        if (node.type in stats) {
          stats[node.type as keyof typeof stats]++;
        }
      }
    });

    return {
      circuitNodeMap: nodeHops,
      circuitLinkIds: linkIds,
      maxCircuitHop: maxHop,
      circuitStats: stats,
      circuitNodesList: list
    };
  }, [activeFocusId, links, nodeMap]);

  // VISIBILITY FILTERING
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (isolateCircuit && activeFocusId) {
        if (!circuitNodeMap.has(node.id)) return false;
      }
      if (showModifiedOnly && !node.isModifiedRecently && node.type !== 'core') return false;
      
      if (activeFilter !== 'all' && node.type !== 'core') {
        if (activeFilter === 'job_title') {
          if (node.type !== 'job' && node.type !== 'title') return false;
        } else if (activeFilter === 'primary_skill') {
          if (node.type !== 'skill' || node.skillTier !== 'Primary') return false;
        } else if (activeFilter === 'secondary_skill') {
          if (node.type !== 'skill' || node.skillTier !== 'Secondary') return false;
        } else if (node.type !== activeFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(query) ||
          (node.category && node.category.toLowerCase().includes(query)) ||
          (node.rankName && node.rankName.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [nodes, showModifiedOnly, activeFilter, searchQuery, isolateCircuit, activeFocusId, circuitNodeMap]);

  const filteredNodeIdSet = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  // Interactive Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking background or holding
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect' || (e.target as HTMLElement).tagName === 'circle') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setIsolateCircuit(false);
  };

  const getNodeIcon = (type: NodeType, isEquipped?: boolean) => {
    switch (type) {
      case 'core': return <Zap className="h-3.5 w-3.5 text-[#fef08a]" />;
      case 'attribute': return <Activity className="h-3.5 w-3.5 text-emerald-400" />;
      case 'goal': return <Target className="h-3.5 w-3.5 text-amber-400" />;
      case 'job': return <Crown className={`h-3.5 w-3.5 ${isEquipped ? 'text-amber-300' : 'text-yellow-400'}`} />;
      case 'project': return <Layers className="h-3.5 w-3.5 text-purple-400" />;
      case 'title': return <Award className="h-3.5 w-3.5 text-cyan-400" />;
      case 'milestone': return <CheckCircle className="h-3.5 w-3.5 text-pink-400" />;
      case 'quest': return <Sparkles className="h-3.5 w-3.5 text-rose-400" />;
      case 'habit': return <Flame className="h-3.5 w-3.5 text-teal-400" />;
      case 'skill': return <Compass className="h-3.5 w-3.5 text-blue-400" />;
      case 'muhasabah': return <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />;
      case 'plan': return <FileText className="h-3.5 w-3.5 text-teal-300" />;
      default: return <Info className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getNodeBadgeClass = (type: NodeType) => {
    switch (type) {
      case 'core': return 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]';
      case 'attribute': return 'bg-[#0c2419] border-emerald-500/50 text-emerald-300';
      case 'goal': return 'bg-[#2a220a] border-amber-500/50 text-amber-300';
      case 'job': return 'bg-[#3b2a0c] border-yellow-500/50 text-yellow-300';
      case 'project': return 'bg-[#181329] border-purple-500/50 text-purple-300';
      case 'title': return 'bg-[#0d222e] border-cyan-500/50 text-cyan-300';
      case 'milestone': return 'bg-[#2b1022] border-pink-500/50 text-pink-300';
      case 'quest': return 'bg-[#2a1318] border-rose-500/50 text-rose-300';
      case 'habit': return 'bg-[#0b2422] border-teal-500/50 text-teal-300';
      case 'skill': return 'bg-[#0f1f38] border-blue-500/50 text-blue-300';
      case 'muhasabah': return 'bg-[#2d0e14] border-rose-500/60 text-rose-300';
      case 'plan': return 'bg-[#0b2426] border-teal-500/50 text-teal-300';
      default: return 'bg-[#0b0d13] border-[#c5a059]/30 text-zinc-300';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* HEADER SECTION: ASTROLABE OF DESTINIES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#080b12]/95 p-4 rounded-xl border border-[#c5a059]/30 glass-panel relative overflow-hidden shadow-2xl">
        <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#101422] border border-[#c5a059]/50 rounded-xl text-[#e5c875] shadow-[0_0_20px_rgba(197,160,89,0.3)]">
            <RubElHizbIcon className="h-6 w-6 text-[#c5a059]" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              CONSTELLATION NET // CELESTIAL STAR-MAP
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 font-bold shadow-sm">
                SOUL WEAVE v3.0
              </span>
            </h3>
            <p className="text-[11px] font-mono text-[#c5a059]/80 mt-0.5">
              Radiant neural cosmos linking Destinies, Job Archetypes, Habits, Operations, Disciplines & Muhāsabah Audits
            </p>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[#c5a059]/60 absolute left-2.5 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search star node..."
              className="bg-[#05070d] border border-[#c5a059]/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] font-mono w-36 sm:w-48"
            />
          </div>

          {/* TOGGLE MODIFIED ONLY */}
          <button
            onClick={() => setShowModifiedOnly(!showModifiedOnly)}
            className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 uppercase cursor-pointer ${
              showModifiedOnly 
                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                : 'bg-[#05070d] border-white/10 text-zinc-400 hover:text-white hover:border-[#c5a059]/30'
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#e5c875]" />
            {showModifiedOnly ? 'ATTUNED ONLY' : 'ATTUNED STARS'}
          </button>

          {/* ZOOM & PAN RESET CONTROLS */}
          <div className="flex items-center bg-[#05070d] border border-[#c5a059]/30 rounded-lg p-0.5">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
              className="p-1 text-zinc-400 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#c5a059] px-1.5 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
              className="p-1 text-zinc-400 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={resetView}
              className="p-1 text-zinc-500 hover:text-[#e5c875] rounded hover:bg-white/5 transition-colors border-l border-white/10 cursor-pointer"
              title="Reset Zoom & Pan"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* EXTENDED FILTER TABS (WITH HABITS, JOBS & TITLES, MUHĀSABAH) */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#c5a059]/20 pb-3">
        <span className="text-[10px] font-mono text-[#c5a059] uppercase mr-1 flex items-center gap-1 font-bold">
          <Filter className="h-3 w-3 text-[#c5a059]" /> CELESTIAL SPHERES:
        </span>

        {[
          { id: 'all', label: 'ALL REALM STARS' },
          { id: 'goal', label: 'DESTINIES (Goals)' },
          { id: 'job_title', label: 'JOBS & TITLES' },
          { id: 'habit', label: 'HABITS & SUNNAHS' },
          { id: 'project', label: 'OPERATIONS (Projects)' },
          { id: 'quest', label: 'DECREES (Quests)' },
          { id: 'skill', label: 'DISCIPLINES (Skills)' },
          { id: 'muhasabah', label: 'MUHĀSABAH RESTRAINTS' },
          { id: 'attribute', label: 'ATTRIBUTES' },
          { id: 'plan', label: 'CODEX SCROLLS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all uppercase cursor-pointer ${
              activeFilter === tab.id 
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059] font-bold shadow-sm' 
                : 'bg-[#070912] hover:bg-[#121626] text-zinc-400 hover:text-zinc-200 border border-[#c5a059]/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE CIRCUIT RESONANCE BANNER */}
      <div className="min-h-[58px] flex items-center">
        {activeFocusNode ? (
          <div className="w-full bg-[#080b14] border border-[#c5a059]/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(197,160,89,0.2)] relative overflow-hidden">
            <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] shrink-0">
                <RubElHizbIcon className="h-4 w-4 text-[#e5c875]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#e5c875] font-bold uppercase tracking-wider">
                    ✦ RESONATING CIRCUIT: {activeFocusNode.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#3a2e12] border border-[#c5a059]/40 text-[#fef08a] uppercase font-bold">
                    {activeFocusNode.type}
                  </span>
                  {activeFocusNode.rankName && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                      {activeFocusNode.rankName}
                    </span>
                  )}
                  {activeFocusNode.streakCount !== undefined && activeFocusNode.streakCount > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5 text-teal-400" />
                      {activeFocusNode.streakCount}d STREAK
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-zinc-300 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-zinc-400">{circuitNodesList.length - 1} Connected Celestial Stars:</span>
                  {circuitStats.goal > 0 && <span className="text-[#e5c875] font-bold">{circuitStats.goal} Destinies</span>}
                  {circuitStats.job > 0 && <span className="text-amber-400 font-bold">• {circuitStats.job} Jobs</span>}
                  {circuitStats.title > 0 && <span className="text-cyan-400 font-bold">• {circuitStats.title} Titles</span>}
                  {circuitStats.habit > 0 && <span className="text-teal-400 font-bold">• {circuitStats.habit} Habits</span>}
                  {circuitStats.project > 0 && <span className="text-purple-400 font-bold">• {circuitStats.project} Operations</span>}
                  {circuitStats.quest > 0 && <span className="text-rose-400 font-bold">• {circuitStats.quest} Decrees</span>}
                  {circuitStats.skill > 0 && <span className="text-blue-400 font-bold">• {circuitStats.skill} Disciplines</span>}
                  {circuitStats.muhasabah > 0 && <span className="text-rose-500 font-bold">• {circuitStats.muhasabah} Muhāsabah</span>}
                  {circuitStats.attribute > 0 && <span className="text-emerald-400 font-bold">• {circuitStats.attribute} Attributes</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsolateCircuit(!isolateCircuit)}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isolateCircuit 
                    ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                    : 'bg-[#05070d] border-[#c5a059]/30 text-zinc-300 hover:text-white hover:border-[#c5a059]'
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-[#e5c875]" />
                {isolateCircuit ? 'ISOLATED HARMONY VIEW' : 'ISOLATE CIRCUIT'}
              </button>

              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setHoveredNodeId(null);
                  setIsolateCircuit(false);
                }}
                className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1.5 rounded bg-[#05070d] border border-[#c5a059]/20 hover:border-[#c5a059]/40 transition-colors cursor-pointer"
              >
                CLEAR
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#080b14]/80 border border-[#c5a059]/20 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-2">
              <RubElHizbIcon className="h-4 w-4 text-[#c5a059] shrink-0" />
              HOVER OR CLICK ANY CELESTIAL STAR TO ILLUMINATE ITS FULL RESONATING ENERGY NETWORK
            </span>
            <span className="text-[10px] text-[#c5a059] uppercase font-mono hidden sm:inline font-bold">ASTROLABE ACTIVE</span>
          </div>
        )}
      </div>

      {/* MAIN CELESTIAL STAR-MAP CANVAS & INSPECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* CELESTIAL STAR-MAP SVG DISPLAY (3 COLS) */}
        <div 
          ref={svgContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`lg:col-span-3 bg-[#06080f] border border-[#c5a059]/30 rounded-xl p-2 relative overflow-hidden flex items-center justify-center min-h-[520px] md:min-h-[640px] shadow-2xl select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <ArabesqueCorner position="top-left" className="top-1.5 left-1.5 h-4 w-4 pointer-events-none" color="#c5a059" />
          <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-4 w-4 pointer-events-none" color="#c5a059" />
          <ArabesqueCorner position="bottom-left" className="bottom-1.5 left-1.5 h-4 w-4 pointer-events-none" color="#c5a059" />
          <ArabesqueCorner position="bottom-right" className="bottom-1.5 right-1.5 h-4 w-4 pointer-events-none" color="#c5a059" />
          
          {/* PAN CONTROLS HINT (Top-left) */}
          <div className="absolute top-3 left-3 bg-[#080b14]/90 border border-white/10 rounded-md px-2 py-1 text-[9px] font-mono text-zinc-400 flex items-center gap-1.5 pointer-events-none backdrop-blur-sm z-10">
            <Move className="h-3 w-3 text-[#c5a059]" />
            <span>DRAG TO PAN • SCROLL / BUTTONS TO ZOOM</span>
          </div>

          {/* DYNAMIC SVG CELESTIAL STAR-MAP */}
          <div 
            className="transition-transform duration-100 ease-out origin-center w-full max-w-[850px]"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})` 
            }}
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <style>{`
                  @keyframes energyStreamFlow {
                    from { stroke-dashoffset: 32; }
                    to { stroke-dashoffset: 0; }
                  }
                  .energy-stream {
                    stroke-dasharray: 4 14;
                    animation: energyStreamFlow 1.2s linear infinite;
                  }
                  @keyframes starCoronaPulse {
                    0%, 100% { opacity: 0.35; stroke-width: 1px; }
                    50% { opacity: 0.95; stroke-width: 3.5px; }
                  }
                  .star-corona-pulse {
                    animation: starCoronaPulse 2s ease-in-out infinite;
                  }
                  @keyframes nebulaTwinkle {
                    0%, 100% { opacity: 0.25; }
                    50% { opacity: 0.85; }
                  }
                  .star-twinkle {
                    animation: nebulaTwinkle 3s ease-in-out infinite;
                  }
                `}</style>

                {/* 1. LAYERED INTERSTELLAR NEBULAE GRADIENTS */}
                <radialGradient id="nebula-emerald" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="50%" stopColor="#047857" stopOpacity="0.09" />
                  <stop offset="100%" stopColor="#06080f" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="nebula-cyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                  <stop offset="55%" stopColor="#0284c7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#06080f" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="nebula-amber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#b45309" stopOpacity="0.09" />
                  <stop offset="100%" stopColor="#06080f" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="nebula-violet" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                  <stop offset="55%" stopColor="#6d28d9" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#06080f" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="nebula-crimson" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                  <stop offset="60%" stopColor="#991b1b" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#06080f" stopOpacity="0" />
                </radialGradient>

                {/* Radial gradient for Sun Core */}
                <radialGradient id="sun-core-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="40%" stopColor="#fef08a" />
                  <stop offset="75%" stopColor="#c5a059" />
                  <stop offset="100%" stopColor="#92400e" />
                </radialGradient>

                {/* Glow Filters */}
                <filter id="glow-circuit" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-teal" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-crimson" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. COSMIC NEBULA CLOUDS (Background atmospheric clouds) */}
              <g className="nebulae-layer pointer-events-none">
                <circle cx={cx - 240} cy={cy - 220} r="320" fill="url(#nebula-emerald)" />
                <circle cx={cx + 260} cy={cy + 240} r="340" fill="url(#nebula-cyan)" />
                <circle cx={cx + 250} cy={cy - 200} r="310" fill="url(#nebula-amber)" />
                <circle cx={cx - 220} cy={cy + 250} r="320" fill="url(#nebula-violet)" />
                <circle cx={cx} cy={cy - 320} r="260" fill="url(#nebula-crimson)" />
              </g>

              {/* 2. DETERMINISTIC BACKGROUND STAR DUST (Twinkling cosmic particles) */}
              <g className="stardust-layer pointer-events-none">
                {cosmicStarDust.map(star => (
                  <circle 
                    key={`dust-${star.id}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.r}
                    fill="#ffffff"
                    opacity={star.opacity}
                    className="star-twinkle"
                    style={{ animationDuration: `${star.pulseSpeed}s` }}
                  />
                ))}
              </g>

              {/* 3. CELESTIAL COORDINATE SPOKES & CONCENTRIC ORBITAL RINGS */}
              <g className="celestial-mesh pointer-events-none opacity-40">
                {/* 12 Radiating Astrolabe Coordinate Spokes */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                  const outerR = ringRadii[ringRadii.length - 1] + 15;
                  const x2 = cx + outerR * Math.cos(angle);
                  const y2 = cy + outerR * Math.sin(angle);
                  const degree = i * 30;
                  return (
                    <g key={`spoke-${i}`}>
                      <line 
                        x1={cx}
                        y1={cy}
                        x2={x2}
                        y2={y2}
                        stroke="#c5a059"
                        strokeWidth="0.8"
                        strokeDasharray="4 6"
                        strokeOpacity="0.4"
                      />
                      {/* Outer degree marker text */}
                      <text
                        x={cx + (outerR + 14) * Math.cos(angle)}
                        y={cy + (outerR + 14) * Math.sin(angle) + 3}
                        textAnchor="middle"
                        fill="#c5a059"
                        fontSize="8"
                        fontFamily="monospace"
                        opacity="0.6"
                      >
                        {degree}°
                      </text>
                    </g>
                  );
                })}

                {/* Concentric Celestial Orbit Rings */}
                {ringRadii.slice(1).map((r, ringIdx) => {
                  const ringLabels = [
                    'ORBIT I • CONSTITUTIONAL ATTRIBUTES',
                    'ORBIT II • DESTINIES & ARCHETYPES',
                    'ORBIT III • OPERATIONS & ACCOLADES',
                    'ORBIT IV • RHYTHMS & DECREES',
                    'ORBIT V • DISCIPLINES & RESTRAINTS',
                    'ORBIT VI • ANCIENT CODEX SCROLLS'
                  ];

                  return (
                    <g key={`orbit-${ringIdx}`}>
                      <circle 
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="#e5c875"
                        strokeWidth="1"
                        strokeDasharray="6 8"
                        strokeOpacity={0.24 - ringIdx * 0.02}
                      />
                      {/* Subtle orbital designation along the top vertical axis */}
                      <text
                        x={cx}
                        y={cy - r + 8}
                        textAnchor="middle"
                        fill="#c5a059"
                        fontSize="7"
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity="0.35"
                        letterSpacing="1px"
                      >
                        {ringLabels[ringIdx] || `ORBIT ${ringIdx + 1}`}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* 4. DYNAMIC LINK RESONANCE & ANIMATED ENERGY PULSES */}
              <g className="links-layer">
                {links.map(link => {
                  const sourceNode = nodeMap.get(link.source);
                  const targetNode = nodeMap.get(link.target);

                  if (!sourceNode || !targetNode) return null;

                  // Filter visibility
                  const isSourceVisible = filteredNodeIdSet.has(sourceNode.id);
                  const isTargetVisible = filteredNodeIdSet.has(targetNode.id);
                  if (!isSourceVisible && !isTargetVisible) return null;

                  const isCircuitLink = circuitLinkIds.has(link.id);
                  const isDirectFocusLink = activeFocusId && (link.source === activeFocusId || link.target === activeFocusId);
                  const isDimmed = activeFocusId && !isCircuitLink;
                  const isLinkModified = link.isModifiedRecently || sourceNode.isModifiedRecently || targetNode.isModifiedRecently;

                  // Determine dynamic line stroke color & weight
                  const linkColor = isDirectFocusLink
                    ? '#fef08a' // Blazing pure gold
                    : isCircuitLink
                    ? '#e5c875' // Luminous antique gold
                    : link.color || (isLinkModified ? '#f59e0b' : '#334155');

                  const strokeWidth = isDirectFocusLink
                    ? Math.max(3.2, link.weight + 0.8)
                    : isCircuitLink
                    ? Math.max(2.4, link.weight)
                    : link.weight;

                  const opacity = isDimmed
                    ? 0.05
                    : isDirectFocusLink
                    ? 0.95
                    : isCircuitLink
                    ? 0.85
                    : link.energyPulse
                    ? 0.75
                    : isLinkModified
                    ? 0.65
                    : 0.28;

                  const showEnergyParticle = isCircuitLink || link.energyPulse || isDirectFocusLink;

                  return (
                    <g key={link.id}>
                      {/* Base Connection Ray */}
                      <line 
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={linkColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        className="transition-all duration-300"
                        filter={isCircuitLink ? 'url(#glow-circuit)' : undefined}
                      />

                      {/* Dynamic Animated Energy Stream Particle (Flowing along active circuits) */}
                      {showEnergyParticle && !isDimmed && (
                        <line 
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={isDirectFocusLink ? '#ffffff' : linkColor}
                          strokeWidth={strokeWidth * 0.9}
                          strokeOpacity={0.9}
                          className="energy-stream pointer-events-none"
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 5. LUMINOUS STAR NODES WITH ENTITY-SPECIFIC AESTHETICS */}
              <g className="nodes-layer">
                {filteredNodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isInCircuit = activeFocusId && circuitNodeMap.has(node.id);
                  const hopLevel = activeFocusId ? circuitNodeMap.get(node.id) : undefined;
                  const isDimmed = activeFocusId && !isInCircuit;

                  return (
                    <g 
                      key={node.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        if (onSelectEntity) onSelectEntity(node.type, node.id);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer transition-opacity duration-200"
                      style={{ opacity: isDimmed ? 0.12 : 1 }}
                    >
                      {/* ACTIVE CIRCUIT PULSE HALO */}
                      {isInCircuit && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + (isSelected ? 10 : 6)} 
                          fill="none" 
                          stroke={isSelected ? '#fef08a' : '#c5a059'} 
                          strokeWidth="1.5" 
                          strokeOpacity="0.85" 
                          className="pointer-events-none star-corona-pulse"
                        />
                      )}

                      {/* EQUIPPED JOB CLASS: RADIANT GOLD CORONA HALO */}
                      {node.type === 'job' && node.isEquipped && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 7} 
                          fill="none" 
                          stroke="#facc15" 
                          strokeWidth="2" 
                          strokeDasharray="4 3"
                          filter="url(#glow-gold)"
                          className="pointer-events-none star-corona-pulse"
                        />
                      )}

                      {/* EQUIPPED TITLE: RADIANT CYAN HALO */}
                      {node.type === 'title' && node.isEquipped && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 6} 
                          fill="none" 
                          stroke="#38bdf8" 
                          strokeWidth="1.8" 
                          strokeDasharray="3 3"
                          filter="url(#glow-cyan)"
                          className="pointer-events-none star-corona-pulse"
                        />
                      )}

                      {/* HABIT WITH STREAK: TEAL FLAME GLOW */}
                      {node.type === 'habit' && (node.streakCount || 0) > 0 && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 5} 
                          fill="none" 
                          stroke="#14b8a6" 
                          strokeWidth="1.5" 
                          strokeDasharray="3 3"
                          filter="url(#glow-teal)"
                          className="pointer-events-none"
                        />
                      )}

                      {/* MUHĀSABAH RESTRICTION WARD PULSE */}
                      {node.type === 'muhasabah' && (
                        <circle 
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 5} 
                          fill="none" 
                          stroke={node.color} 
                          strokeWidth="1.5" 
                          strokeDasharray="2 4"
                          filter={node.occurrenceCount && node.occurrenceCount > 0 ? 'url(#glow-crimson)' : undefined}
                          className="pointer-events-none"
                        />
                      )}

                      {/* CORE PLAYER SUN-STAR: DUAL CORONA */}
                      {node.type === 'core' && (
                        <>
                          <circle 
                            cx={node.x}
                            cy={node.y}
                            r={node.radius + 12} 
                            fill="none" 
                            stroke="#c5a059" 
                            strokeWidth="1" 
                            strokeOpacity="0.4"
                            strokeDasharray="6 6"
                            className="pointer-events-none star-corona-pulse"
                          />
                          <circle 
                            cx={node.x}
                            cy={node.y}
                            r={node.radius + 6} 
                            fill="none" 
                            stroke="#fef08a" 
                            strokeWidth="1.5" 
                            strokeOpacity="0.75"
                            className="pointer-events-none"
                          />
                        </>
                      )}

                      {/* MAIN STAR NODE BODY */}
                      <circle 
                        cx={node.x}
                        cy={node.y}
                        r={node.radius} 
                        fill={node.type === 'core' ? 'url(#sun-core-gradient)' : node.color}
                        stroke={isSelected ? '#ffffff' : isHovered ? '#fef08a' : '#070912'}
                        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
                        filter={node.type === 'core' || isSelected ? 'url(#glow-gold)' : undefined}
                      />

                      {/* NODE BADGE: HABIT FLAME / STREAK */}
                      {node.type === 'habit' && (node.streakCount || 0) > 0 && (
                        <g transform={`translate(${node.x + node.radius - 4}, ${node.y - node.radius - 3})`}>
                          <rect 
                            x="0" 
                            y="0" 
                            width="14" 
                            height="11" 
                            rx="3" 
                            fill="#0d9488" 
                            stroke="#14b8a6" 
                            strokeWidth="0.8" 
                          />
                          <text 
                            x="7" 
                            y="8" 
                            textAnchor="middle" 
                            fill="#ffffff" 
                            fontSize="7" 
                            fontWeight="bold" 
                            fontFamily="monospace"
                          >
                            {node.streakCount}
                          </text>
                        </g>
                      )}

                      {/* NODE BADGE: JOB LEVEL (1-9) */}
                      {node.type === 'job' && node.level !== undefined && (
                        <g transform={`translate(${node.x + node.radius - 5}, ${node.y - node.radius - 3})`}>
                          <rect 
                            x="0" 
                            y="0" 
                            width="16" 
                            height="11" 
                            rx="3" 
                            fill="#78350f" 
                            stroke="#f59e0b" 
                            strokeWidth="0.8" 
                          />
                          <text 
                            x="8" 
                            y="8" 
                            textAnchor="middle" 
                            fill="#fef08a" 
                            fontSize="7" 
                            fontWeight="bold" 
                            fontFamily="monospace"
                          >
                            L{node.level}
                          </text>
                        </g>
                      )}

                      {/* NODE BADGE: MUHĀSABAH SLIPS COUNT */}
                      {node.type === 'muhasabah' && node.occurrenceCount !== undefined && (
                        <g transform={`translate(${node.x + node.radius - 5}, ${node.y - node.radius - 3})`}>
                          <rect 
                            x="0" 
                            y="0" 
                            width="16" 
                            height="11" 
                            rx="3" 
                            fill={node.occurrenceCount > 0 ? '#7f1d1d' : '#064e3b'} 
                            stroke={node.occurrenceCount > 0 ? '#ef4444' : '#10b981'} 
                            strokeWidth="0.8" 
                          />
                          <text 
                            x="8" 
                            y="8" 
                            textAnchor="middle" 
                            fill="#ffffff" 
                            fontSize="7" 
                            fontWeight="bold" 
                            fontFamily="monospace"
                          >
                            {node.occurrenceCount}/5
                          </text>
                        </g>
                      )}

                      {/* PRIMARY NODE LABEL */}
                      <text
                        x={node.x}
                        y={node.y + node.radius + 13}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : isHovered ? '#fef08a' : '#cbd5e1'}
                        fontSize="9"
                        fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                        className="pointer-events-none font-mono"
                      >
                        {node.name.length > 15 ? `${node.name.slice(0, 13)}..` : node.name}
                      </text>

                      {/* SUBTITLE / HOP LEVEL BADGE */}
                      {!compact && (
                        <text
                          x={node.x}
                          y={node.y + node.radius + 23}
                          textAnchor="middle"
                          fill={
                            isInCircuit && hopLevel === 0
                              ? '#fef08a'
                              : node.type === 'job' && node.isEquipped
                              ? '#facc15'
                              : node.type === 'title' && node.isEquipped
                              ? '#38bdf8'
                              : node.type === 'habit'
                              ? '#2dd4bf'
                              : node.type === 'muhasabah'
                              ? '#f87171'
                              : '#71717a'
                          }
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                          className="pointer-events-none uppercase"
                        >
                          {isInCircuit && hopLevel !== undefined
                            ? hopLevel === 0 ? '[FOCUS]' : `[HOP-${hopLevel}]`
                            : node.type === 'job'
                            ? node.isEquipped ? '[ACTIVE JOB]' : `[JOB L${node.level || 1}]`
                            : node.type === 'title'
                            ? node.isEquipped ? '[ACTIVE TITLE]' : '[TITLE]'
                            : node.type === 'habit'
                            ? `[HABIT • ${node.streakCount || 0}D]`
                            : node.type === 'muhasabah'
                            ? `[AUDIT • ${node.occurrenceCount || 0}/5]`
                            : node.type === 'skill'
                            ? `[${node.skillTier === 'Primary' ? 'PRI' : 'SEC'}-SKILL]`
                            : `[${node.type}]`}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* CELESTIAL REALM LEGEND OVERLAY (Bottom-left) */}
          <div className="absolute bottom-3 left-3 bg-[#080b14]/95 border border-[#c5a059]/30 rounded-lg p-2.5 text-[9px] font-mono text-zinc-300 space-y-1 backdrop-blur-md shadow-2xl pointer-events-none max-w-[240px]">
            <div className="text-[10px] font-bold text-[#c5a059] border-b border-[#c5a059]/20 pb-0.5 flex items-center gap-1">
              <RubElHizbIcon className="h-2.5 w-2.5 text-[#e5c875]" /> CELESTIAL REALM ORBITS
            </div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#c5a059]" /> CENTER: SOUL CORE</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ORBIT I: ATTRIBUTES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> ORBIT II: DESTINIES &amp; JOBS</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-400" /> ORBIT III: OPERATIONS &amp; TITLES</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-400" /> ORBIT IV: HABITS &amp; SUNNAHS</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" /> ORBIT IV: DECREES (Quests)</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> ORBIT V: DISCIPLINES (Skills)</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> ORBIT V: MUHĀSABAH AUDITS</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-300" /> ORBIT VI: CODEX SCROLLS</div>
          </div>
        </div>

        {/* RIGHT PANEL: STAR NODE INSPECTOR & CIRCUIT HARMONY */}
        <div className="space-y-4">
          
          {/* STAR NODE INSPECTOR DRAWER */}
          <div className="glass-panel rounded-xl p-4 space-y-3.5 border border-[#c5a059]/30 bg-[#080b14]/95 relative overflow-hidden shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
            <div className="flex justify-between items-center border-b border-[#c5a059]/20 pb-2">
              <span className="text-xs font-mono text-[#e5c875] font-bold uppercase flex items-center gap-1.5">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" /> CELESTIAL INSPECTOR
              </span>
              {selectedNode && (
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2 rounded-lg border ${getNodeBadgeClass(selectedNode.type)}`}>
                    {getNodeIcon(selectedNode.type, selectedNode.isEquipped)}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-display text-sm font-bold text-white uppercase leading-tight truncate">
                      {selectedNode.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">
                        {selectedNode.type}
                      </span>
                      {selectedNode.status && (
                        <span className="text-[9px] font-mono text-zinc-400 truncate">
                          • {selectedNode.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* JOB CLASS TELEMETRY */}
                {selectedNode.type === 'job' && (
                  <div className="bg-[#1f1708] border border-yellow-500/40 rounded-lg p-2.5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5" />
                        {selectedNode.isEquipped ? 'EQUIPPED ACTIVE JOB' : 'ARCHETYPE SPEC'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold text-[9px] border border-yellow-500/40">
                        LVL {selectedNode.level || 1}/9
                      </span>
                    </div>
                    {selectedNode.rankName && (
                      <div className="text-[11px] text-zinc-200">
                        Rank Tier: <strong className="text-amber-300">{selectedNode.rankName}</strong>
                      </div>
                    )}
                    {selectedNode.perkDescription && (
                      <div className="p-2 bg-black/40 rounded border border-white/5 text-[10px] text-zinc-300 leading-relaxed">
                        <span className="text-amber-400 font-bold block mb-0.5">SCALED PERK BOOST:</span>
                        {selectedNode.perkDescription}
                      </div>
                    )}
                  </div>
                )}

                {/* HONORIFIC TITLE TELEMETRY */}
                {selectedNode.type === 'title' && (
                  <div className="bg-[#0b1c26] border border-cyan-500/40 rounded-lg p-2.5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {selectedNode.isEquipped ? 'EQUIPPED HONORIFIC TITLE' : 'TITLE BADGE'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold text-[9px] border border-cyan-500/40">
                        LVL {selectedNode.level || 1}/9
                      </span>
                    </div>
                    {selectedNode.rankName && (
                      <div className="text-[11px] text-zinc-200">
                        Honorific Rank: <strong className="text-cyan-300">{selectedNode.rankName}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* HABIT TELEMETRY */}
                {selectedNode.type === 'habit' && (
                  <div className="bg-[#091f1d] border border-teal-500/40 rounded-lg p-2.5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-300 font-bold flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-teal-400" />
                        SUNNAH / HABIT RHYTHM
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-200 font-bold text-[9px] border border-teal-500/40">
                        {selectedNode.streakCount || 0}d STREAK
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-300">
                      Cadence: <strong className="text-teal-300">{selectedNode.category}</strong>
                    </div>
                  </div>
                )}

                {/* MUHĀSABAH RESTRICTION AUDIT TELEMETRY */}
                {selectedNode.type === 'muhasabah' && (
                  <div className="bg-[#260c12] border border-rose-500/40 rounded-lg p-2.5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-300 font-bold flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                        RESTRAINT BOUNDARY
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] border ${
                        (selectedNode.occurrenceCount || 0) > 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {selectedNode.occurrenceCount || 0}/5 SLIPS
                      </span>
                    </div>
                    {selectedNode.correctiveStrategy && (
                      <div className="p-2 bg-black/40 rounded border border-white/5 text-[10px] text-zinc-300 leading-relaxed">
                        <span className="text-rose-400 font-bold block mb-0.5">CORRECTIVE STRATEGY:</span>
                        {selectedNode.correctiveStrategy}
                      </div>
                    )}
                  </div>
                )}

                {/* SKILL TELEMETRY */}
                {selectedNode.type === 'skill' && (
                  <div className={`p-2.5 rounded-lg border text-xs font-mono space-y-2 ${
                    selectedNode.skillTier === 'Primary' 
                      ? 'bg-blue-950/60 border-blue-500/40 text-blue-300' 
                      : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5" />
                        <span>{selectedNode.skillTier === 'Primary' ? 'PRIMARY DISCIPLINE' : 'SECONDARY BRANCH'}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase font-bold">
                        RANK {selectedNode.level || 1}
                      </span>
                    </div>
                  </div>
                )}

                {/* GENERAL STATS PANEL */}
                <div className="bg-[#05070d] p-2.5 rounded-lg border border-[#c5a059]/20 space-y-1.5 text-xs font-mono">
                  {selectedNode.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-400">PROGRESSION:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.progress}%</span>
                      </div>
                      <div className="w-full bg-[#080b14] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" style={{ width: `${selectedNode.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {selectedNode.xpValue !== undefined && selectedNode.xpValue > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400">XP VALUE:</span>
                      <span className="text-[#e5c875] font-bold">+{selectedNode.xpValue} XP</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-400">CIRCUIT HARMONY:</span>
                    <span className="text-[#e5c875] font-bold">{circuitNodesList.length - 1} connected stars</span>
                  </div>
                </div>

                {/* JUMP TO WORKSPACE ACTION BUTTON */}
                {onNavigate && (
                  <button
                    onClick={() => {
                      if (selectedNode.type === 'job' || selectedNode.type === 'title') {
                        onNavigate('frameworks');
                      } else if (selectedNode.type === 'habit' || selectedNode.type === 'quest') {
                        onNavigate('quests');
                      } else if (selectedNode.type === 'muhasabah') {
                        onNavigate('muhasabah');
                      } else if (selectedNode.type === 'skill') {
                        onNavigate('skills');
                      } else if (selectedNode.type === 'goal') {
                        onNavigate('goals');
                      } else if (selectedNode.type === 'project') {
                        onNavigate('projects');
                      } else if (selectedNode.type === 'plan') {
                        onNavigate('planning');
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#3a2e12] hover:bg-[#4d3d17] border border-[#c5a059] text-[#fef08a] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>JUMP TO WORKSPACE</span>
                  </button>
                )}

                {/* RESONANCE PIPELINE STREAM */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#e5c875] uppercase font-bold flex items-center gap-1">
                      <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" /> RESONANCE PIPELINE:
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 font-bold">{circuitNodesList.length - 1} STARS</span>
                  </div>

                  <div className="space-y-1 max-h-[190px] overflow-y-auto pr-1">
                    {circuitNodesList
                      .filter(node => node.id !== selectedNode.id)
                      .sort((a, b) => (circuitNodeMap.get(a.id) || 0) - (circuitNodeMap.get(b.id) || 0))
                      .map(node => {
                        const hop = circuitNodeMap.get(node.id) || 1;
                        return (
                          <div 
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className="p-1.5 bg-[#05070d] hover:bg-[#121626] border border-[#c5a059]/15 hover:border-[#c5a059]/50 rounded text-xs flex items-center justify-between cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 shrink-0 font-bold">
                                H{hop}
                              </span>
                              <span className="text-zinc-300 font-sans truncate group-hover:text-[#e5c875]">
                                {node.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#c5a059] uppercase shrink-0 font-bold">
                              [{node.type}]
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-10 text-center space-y-2 text-zinc-400 font-mono text-xs">
                <RubElHizbIcon className="h-8 w-8 text-[#c5a059]/60 mx-auto" />
                <p className="text-zinc-300 font-semibold">Attune to any celestial star</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed px-4">
                  Select any Goal, Job, Habit, Title, Quest, Skill or Muhāsabah node to inspect its telemetry and upstream/downstream energy circuits.
                </p>
              </div>
            )}
          </div>

          {/* REAL-TIME ATTUNEMENT AUDIT STREAM */}
          <div className="glass-panel rounded-xl p-4 space-y-3 border border-[#c5a059]/30 bg-[#080b14]/95 relative overflow-hidden shadow-2xl">
            <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
            <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
              <span className="text-xs font-mono text-[#e5c875] font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" /> ATTUNEMENT STREAM
              </span>
              <span className="text-[9px] font-mono text-[#c5a059] font-bold">COSMIC SYNC</span>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {modifiedNodeIds.size > 0 ? (
                Array.from(modifiedNodeIds).slice(0, 6).map(id => {
                  const node = nodeMap.get(id);
                  if (!node) return null;
                  return (
                    <div 
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className="p-2 bg-[#2a220a]/40 border border-[#c5a059]/30 rounded text-[11px] flex items-center justify-between cursor-pointer hover:border-[#c5a059] transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e5c875] shrink-0" />
                        <span className="font-sans font-medium text-[#fef08a] truncate">{node.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#c5a059] shrink-0 uppercase font-bold">
                        [{node.type}]
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] font-mono text-zinc-500 italic py-3 text-center">
                  No active celestial modification triggers detected in current session.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
