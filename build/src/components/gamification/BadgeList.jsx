import React from 'react';
import { Flag, Eye, MapPin, Sparkles, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import { BADGES } from '../../services/gamification';
import { Card } from '../ui/Card';

const ICON_MAP = {
  Flag,
  Eye,
  MapPin,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
};

export function BadgeList({ earnedBadgeIds = [] }) {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-100">Civic Badges</h3>
        <span className="text-xs text-zinc-400">
          {earnedSet.size} of {BADGES.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const isUnlocked = earnedSet.has(badge.id);
          const Icon = ICON_MAP[badge.icon] || Flag;

          return (
            <Card
              key={badge.id}
              className={`p-4 flex items-start gap-3.5 transition-all ${
                isUnlocked
                  ? 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUnlocked
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-inner'
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                }`}
              >
                {isUnlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-bold ${isUnlocked ? 'text-zinc-100' : 'text-zinc-400'}`}>
                    {badge.title}
                  </h4>
                  {isUnlocked && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

