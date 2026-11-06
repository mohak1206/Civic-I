import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Trophy } from 'lucide-react';

export function BottomNav() {
  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-2 text-[11px] font-medium transition-colors ${
      isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        <NavLink to="/" end className={navItemClass}>
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95 ${
              isActive ? 'text-emerald-400' : 'text-zinc-200'
            }`
          }
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/30">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold mt-1">Report</span>
        </NavLink>

        <NavLink to="/rewards" className={navItemClass}>
          <Trophy className="w-5 h-5 mb-1" />
          <span>Rewards</span>
        </NavLink>
      </div>
    </nav>
  );
}

