import React from 'react';
import { Trophy, Medal, User, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getLevel } from '../../services/gamification';

export function Leaderboard({ users = [], currentUserId }) {
  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-xs shadow-md shadow-amber-400/30">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-zinc-300 text-zinc-950 flex items-center justify-center font-black text-xs shadow-md">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-md">
            3
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xs">
            {rank}
          </div>
        );
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-zinc-100">Local Citizen Leaderboard</h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-medium">
          Verified Browser Accounts Only
        </span>
      </div>

      {users.length === 0 ? (
        <div className="py-10 text-center text-zinc-500 space-y-2">
          <Trophy className="w-8 h-8 mx-auto opacity-30" />
          <p className="text-sm font-medium">No citizen scores recorded yet.</p>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto">
            Submit your first civic report to earn points and claim your spot on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {users.map((u, index) => {
            const rank = index + 1;
            const isMe = u.id === currentUserId;
            const level = getLevel(u.points || 0);

            return (
              <div
                key={u.id}
                className={`py-3 px-2 flex items-center justify-between gap-3 rounded-xl transition-colors ${
                  isMe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                    alt={u.name}
                    className="w-9 h-9 rounded-full bg-zinc-800 object-cover border border-zinc-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-zinc-100 truncate">{u.name}</span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          YOU
                        </span>
                      )}
                      {u.isDemo && (
                        <Badge variant="demo" size="xs">
                          DEMO
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">
                      Level {level.level} • {level.title}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {u.points || 0}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

