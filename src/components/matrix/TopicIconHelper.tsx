import React from 'react';
import { 
  BookOpen, GraduationCap, Library, Brain, ScrollText,
  ShieldCheck, Hammer, Anchor, ShieldAlert,
  Flame, Sparkles, Sun, Zap, Heart,
  Target, Crosshair, Compass, Map, Layers,
  Code, Cpu, GitBranch, Workflow, Terminal,
  Eye, Key, Moon, Wand2,
  Dumbbell, Swords, Shield, Trophy, Activity,
  Building, LayoutGrid, Boxes, Landmark, DraftingCompass,
  Award
} from 'lucide-react';

export interface IconOption {
  name: string;
  label: string;
}

export interface TopicIconGroup {
  category: string;
  icon: string;
  accent: string;
  icons: IconOption[];
}

export const TOPIC_ICON_OPTIONS: TopicIconGroup[] = [
  {
    category: 'Knowledge',
    icon: 'BookOpen',
    accent: 'cyan',
    icons: [
      { name: 'BookOpen', label: 'Tome' },
      { name: 'GraduationCap', label: 'Scholar' },
      { name: 'Library', label: 'Archive' },
      { name: 'Brain', label: 'Cognition' },
      { name: 'ScrollText', label: 'Scroll' },
    ]
  },
  {
    category: 'Iron Will',
    icon: 'ShieldCheck',
    accent: 'slate',
    icons: [
      { name: 'ShieldCheck', label: 'Aegis' },
      { name: 'Hammer', label: 'Forge' },
      { name: 'Anchor', label: 'Anchor' },
      { name: 'ShieldAlert', label: 'Bulwark' },
    ]
  },
  {
    category: 'Passion',
    icon: 'Flame',
    accent: 'orange',
    icons: [
      { name: 'Flame', label: 'Inferno' },
      { name: 'Sparkles', label: 'Radiance' },
      { name: 'Sun', label: 'Solar' },
      { name: 'Zap', label: 'Surge' },
      { name: 'Heart', label: 'Vigor' },
    ]
  },
  {
    category: 'Strategy',
    icon: 'Target',
    accent: 'rose',
    icons: [
      { name: 'Target', label: 'Direct' },
      { name: 'Crosshair', label: 'Focus' },
      { name: 'Compass', label: 'Horizon' },
      { name: 'Map', label: 'Atlas' },
      { name: 'Layers', label: 'Tactics' },
    ]
  },
  {
    category: 'Logic',
    icon: 'Code',
    accent: 'emerald',
    icons: [
      { name: 'Code', label: 'Syntax' },
      { name: 'Cpu', label: 'Processor' },
      { name: 'GitBranch', label: 'Branch' },
      { name: 'Workflow', label: 'Pipeline' },
      { name: 'Terminal', label: 'Console' },
    ]
  },
  {
    category: 'Mystery',
    icon: 'Eye',
    accent: 'purple',
    icons: [
      { name: 'Eye', label: 'Oracle' },
      { name: 'Key', label: 'Cipher' },
      { name: 'Moon', label: 'Eclipse' },
      { name: 'Wand2', label: 'Arcana' },
    ]
  },
  {
    category: 'Strength',
    icon: 'Dumbbell',
    accent: 'red',
    icons: [
      { name: 'Dumbbell', label: 'Titan' },
      { name: 'Swords', label: 'Vanguard' },
      { name: 'Shield', label: 'Guardian' },
      { name: 'Trophy', label: 'Champion' },
      { name: 'Activity', label: 'Kinetic' },
    ]
  },
  {
    category: 'Architecture',
    icon: 'Building',
    accent: 'teal',
    icons: [
      { name: 'Building', label: 'Edifice' },
      { name: 'LayoutGrid', label: 'Matrix' },
      { name: 'Boxes', label: 'Modules' },
      { name: 'Landmark', label: 'Pillar' },
      { name: 'DraftingCompass', label: 'Blueprint' },
    ]
  }
];

export const renderTopicIcon = (iconName?: string, className: string = "h-5 w-5") => {
  switch (iconName) {
    // Knowledge
    case 'BookOpen': return <BookOpen className={`${className} text-cyan-400`} />;
    case 'GraduationCap': return <GraduationCap className={`${className} text-cyan-300`} />;
    case 'Library': return <Library className={`${className} text-teal-400`} />;
    case 'Brain': return <Brain className={`${className} text-emerald-400`} />;
    case 'ScrollText': return <ScrollText className={`${className} text-cyan-200`} />;

    // Iron Will
    case 'ShieldCheck': return <ShieldCheck className={`${className} text-slate-300`} />;
    case 'Hammer': return <Hammer className={`${className} text-amber-400`} />;
    case 'Anchor': return <Anchor className={`${className} text-blue-400`} />;
    case 'ShieldAlert': return <ShieldAlert className={`${className} text-rose-400`} />;

    // Passion
    case 'Flame': return <Flame className={`${className} text-orange-400`} />;
    case 'Sparkles': return <Sparkles className={`${className} text-yellow-400`} />;
    case 'Sun': return <Sun className={`${className} text-amber-400`} />;
    case 'Zap': return <Zap className={`${className} text-yellow-300`} />;
    case 'Heart': return <Heart className={`${className} text-rose-400`} />;

    // Strategy
    case 'Target': return <Target className={`${className} text-rose-400`} />;
    case 'Crosshair': return <Crosshair className={`${className} text-red-400`} />;
    case 'Compass': return <Compass className={`${className} text-indigo-400`} />;
    case 'Map': return <Map className={`${className} text-amber-300`} />;
    case 'Layers': return <Layers className={`${className} text-cyan-300`} />;

    // Logic
    case 'Code': return <Code className={`${className} text-emerald-400`} />;
    case 'Cpu': return <Cpu className={`${className} text-cyan-400`} />;
    case 'GitBranch': return <GitBranch className={`${className} text-purple-400`} />;
    case 'Workflow': return <Workflow className={`${className} text-teal-300`} />;
    case 'Terminal': return <Terminal className={`${className} text-emerald-300`} />;

    // Mystery
    case 'Eye': return <Eye className={`${className} text-purple-400`} />;
    case 'Key': return <Key className={`${className} text-amber-300`} />;
    case 'Moon': return <Moon className={`${className} text-indigo-300`} />;
    case 'Wand2': return <Wand2 className={`${className} text-fuchsia-400`} />;

    // Strength
    case 'Dumbbell': return <Dumbbell className={`${className} text-red-400`} />;
    case 'Swords': return <Swords className={`${className} text-amber-400`} />;
    case 'Shield': return <Shield className={`${className} text-blue-400`} />;
    case 'Trophy': return <Trophy className={`${className} text-yellow-400`} />;
    case 'Activity': return <Activity className={`${className} text-emerald-400`} />;

    // Architecture
    case 'Building': return <Building className={`${className} text-cyan-400`} />;
    case 'LayoutGrid': return <LayoutGrid className={`${className} text-teal-400`} />;
    case 'Boxes': return <Boxes className={`${className} text-amber-300`} />;
    case 'Landmark': return <Landmark className={`${className} text-indigo-300`} />;
    case 'DraftingCompass': return <DraftingCompass className={`${className} text-emerald-400`} />;

    default: return <Award className={`${className} text-cyan-400`} />;
  }
};
