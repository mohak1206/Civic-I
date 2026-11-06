import React, { useState, useEffect } from 'react';
import { Trophy, Award, Gift, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboardUsers } from '../services/storage';
import { CIVIC_PERKS } from '../services/rewards';
import { PageContainer } from '../components/layout/PageContainer';
import { LevelCard } from '../components/gamification/LevelCard';
import { BadgeList } from '../components/gamification/BadgeList';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { Card } from '../components/ui/Card';

export function Rewards() {
  const { user, levelInfo } = useAuth();
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);

  useEffect(() => {
    setLeaderboardUsers(getLeaderboardUsers());
  }, [user]);

  return (
    <PageContainer className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Civic Rewards & Recognition</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Earn points by helping Palghar Municipal Corporation identify and resolve local hazards.
        </p>
      </div>

      {/* Level Progression Banner */}
      <LevelCard levelInfo={levelInfo} points={user?.points || 0} />

      {/* Grid: Badges + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BadgeList earnedBadgeIds={user?.badges || []} />

          {/* Civic Perks Table */}
          <Card className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Gift className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Municipal Citizen Perks</h3>
            </div>
            <div className="space-y-2 text-xs">
              {CIVIC_PERKS.map((p) => {
                const isUnlocked = levelInfo.level >= p.level;
                return (
                  <div
                    key={p.level}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 transition-colors ${
                      isUnlocked
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-500'
                    }`}
                  >
                    <ShieldCheck
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isUnlocked ? 'text-emerald-400' : 'text-zinc-600'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">Level {p.level} Perk</span>
                        {isUnlocked && (
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{p.perk}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Local Leaderboard */}
        <div className="lg:col-span-1">
          <Leaderboard users={leaderboardUsers} currentUserId={user?.id} />
        </div>
      </div>
    </PageContainer>
  );
}

