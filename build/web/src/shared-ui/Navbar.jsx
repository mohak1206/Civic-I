import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X } from 'lucide-react';
import Button from './Button';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Report Issue', to: '/report' },
  { label: 'Track Report', to: '/track' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`label-xs transition-colors hover:text-accent-orange ${
                pathname === l.to ? 'text-accent-orange' : 'text-navy/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ---- Desktop right side ---- */}
        <div className="hidden md:flex items-center gap-3">
          <button className="label-xs text-navy/70 hover:text-navy transition-colors">
            Sign In
          </button>
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
                pathname === l.to ? 'text-accent-orange' : 'text-navy/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-navy/10" />
          <button className="block label-xs text-navy/70 hover:text-navy">
            Sign In
          </button>
          <Link to="/report" onClick={() => setOpen(false)}>
            <Button className="w-full">Report Now</Button>
          </Link>
        </nav>
      )}
    </header>
  );
}

