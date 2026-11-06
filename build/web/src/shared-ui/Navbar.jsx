import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, LogOut, User } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import { useAuth } from '../citizen/context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Report Issue', to: '/report' },
  { label: 'Track Report', to: '/track' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Safely get auth context if available
  let auth = null;
  try {
    auth = useAuth();
  } catch {
    // If rendered outside AuthProvider (e.g. in some isolated test)
    auth = { isAuthenticated: false, user: null, role: null, logout: () => {} };
  }

  const { isAuthenticated, user, role, logout } = auth;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-navy/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14 sm:h-16">
        {/* ---- Logo ---- */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Civic-I home">
          <span className="w-9 h-9 rounded-card bg-navy flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading font-bold text-base tracking-tight text-navy">
              Civic-I
            </span>
            <span className="label-xs text-navy/50 -mt-0.5">Palghar</span>
          </span>
        </Link>

        {/* ---- Desktop nav ---- */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((l) => {
            const isActive = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`label-xs transition-colors hover:text-accent-orange ${
                  isActive
                    ? 'text-accent-orange border-b-2 border-accent-orange pb-0.5'
                    : 'text-navy/70'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* ---- Desktop right side ---- */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-heading font-semibold text-navy">
                <User className="w-3.5 h-3.5 text-accent-orange" />
                {user?.username}
              </span>
              <Badge color={role === 'official' ? 'navy' : 'blue'}>
                {role === 'official' ? 'OFFICIAL' : 'CITIZEN'}
              </Badge>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1 label-xs text-navy/60 hover:text-accent-orange transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="label-xs text-navy/70 hover:text-navy transition-colors px-2 py-1"
            >
              Sign In
            </Link>
          )}

          <Link to="/report">
            <Button>Report Now</Button>
          </Link>
        </div>

        {/* ---- Mobile hamburger ---- */}
        <button
          className="md:hidden p-2 -mr-2 text-navy"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ---- Mobile drawer ---- */}
      {open && (
        <nav className="md:hidden border-t border-navy/10 bg-white px-4 pb-4 pt-2 space-y-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block label-xs py-1 transition-colors ${
                pathname === l.to
                  ? 'text-accent-orange font-bold'
                  : 'text-navy/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-navy/10" />

          {isAuthenticated ? (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading font-semibold text-navy">
                  {user?.username}
                </span>
                <Badge color={role === 'official' ? 'navy' : 'blue'}>
                  {role?.toUpperCase()}
                </Badge>
              </div>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="label-xs text-accent-orange font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block label-xs text-navy/70 hover:text-navy py-1"
            >
              Sign In
            </Link>
          )}

          <Link to="/report" onClick={() => setOpen(false)}>
            <Button className="w-full">Report Now</Button>
          </Link>
        </nav>
      )}
    </header>
  );
}
