import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Trophy, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Badge } from '../ui/Badge';

export function Navbar() {
  const { user, logout, levelInfo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-inner'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-zinc-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">Civic-I</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">
                  Palghar
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-none">Smart City Reporter</p>
            </div>
          </NavLink>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </NavLink>
          <NavLink to="/rewards" className={navLinkClass}>
            <Trophy className="w-4 h-4" />
            <span>Rewards</span>
          </NavLink>
        </nav>

        {/* User Stats & Actions */}
        <div className="flex items-center gap-2.5">
          {user && (
            user.role === 'official' ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-amber-300">PMC Official</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-300 truncate max-w-[130px]">{user.department || 'Ward Officer'}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-zinc-200">{user.points || 0} XP</span>
                <span className="text-zinc-500">|</span>
                <span className="text-emerald-400 font-medium">Lvl {levelInfo.level}</span>
              </div>
            )
          )}

          <NotificationCenter />

          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                  {user.name}
                </span>
                {user.role === 'official' ? (
                  <span className="text-[10px] font-bold text-amber-400 leading-none">
                    {user.officialTitle || 'Official'}
                  </span>
                ) : user.isDemo ? (
                  <Badge variant="demo" size="xs">
                    DEMO
                  </Badge>
                ) : null}
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-zinc-700 object-cover bg-zinc-800"
              />
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

