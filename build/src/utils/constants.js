export const PALGHAR_DEFAULT_CENTER = {
  lat: 19.6967,
  lng: 72.7699,
};

export const ISSUE_TYPES = [
  {
    id: 'pothole',
    label: 'Pothole',
    color: '#f97316', // Orange
    bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    dotClass: 'bg-orange-500',
    description: 'Road damage, cavities, asphalt deterioration',
  },
  {
    id: 'broken_street_light',
    label: 'Broken Street Light',
    color: '#eab308', // Yellow
    bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    dotClass: 'bg-yellow-500',
    description: 'Dark roadway, malfunctioning fixture, flickering light',
  },
  {
    id: 'garbage',
    label: 'Garbage Dump',
    color: '#ef4444', // Red
    bgClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    dotClass: 'bg-red-500',
    description: 'Overflowing bins, uncollected waste, illegal dumping',
  },
  {
    id: 'damaged_bridge',
    label: 'Damaged Bridge',
    color: '#a855f7', // Purple
    bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dotClass: 'bg-purple-500',
    description: 'Railing failure, structural cracks, expansion joint wear',
  },
  {
    id: 'other',
    label: 'Other Issue',
    color: '#3b82f6', // Blue
    bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-500',
    description: 'General municipal hazard or civic infrastructure issue',
  },
];

export const ISSUE_STATUSES = [
  { id: 'reported', label: 'Reported', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-700' },
  { id: 'in_review', label: 'In Review', color: 'bg-amber-500/20 text-amber-300 border-amber-600/30' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-600/30' },
  { id: 'resolved', label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-600/30' },
];

export const DEFAULT_MAP_ID = 'DEMO_MAP_ID';

