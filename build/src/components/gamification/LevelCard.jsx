import React from 'react';
import { Shield, Sparkles, Award } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';

export function LevelCard({ levelInfo, points = 0 }) {
  const { level, title, progressPercent, pointsNeeded, maxPoints } = levelInfo;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border-emerald-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase leading-none">LVL</span>
              <span className="text-xl font-black text-white leading-none mt-0.5">{level}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                Tier {level}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accumulate civic points by reporting verified issues in Palghar City.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {points} <span className="text-sm font-sans font-semibold text-zinc-400">XP</span>
          </div>
          {maxPoints !== Infinity ? (
            <span className="text-xs text-zinc-500 block">
              {pointsNeeded} XP to Level {level + 1}
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-medium block">
              Maximum Tier Attained!
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={progressPercent}
          max={100}
          label="Civic Mastery Progression"
          sublabel={`${progressPercent}%`}
          color="emerald"
        />
      </div>
    </Card>
  );
}

