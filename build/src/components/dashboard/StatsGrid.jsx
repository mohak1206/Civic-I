import React from 'react';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { Card } from '../ui/Card';

export function StatsGrid({ issues = [] }) {
  const total = issues.length;
  const open = issues.filter((i) => i.status === 'reported' || i.status === 'in_review').length;
  const inProgress = issues.filter((i) => i.status === 'in_progress').length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      title: 'Total Reports',
      value: total,
      icon: Layers,
      color: 'text-zinc-300',
      bg: 'bg-zinc-800',
    },
    {
      title: 'Open / Triage',
      value: open,
      icon: AlertCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Card key={idx} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                {s.title}
              </span>
              <span className="text-xl font-bold text-white tracking-tight">{s.value}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

