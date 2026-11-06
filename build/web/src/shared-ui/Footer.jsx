import React from 'react';
import { MapPin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm font-body">
        {/* Column 1 — Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-card bg-accent-orange flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </span>
            <span className="font-heading font-bold text-white text-base">Civic-I</span>
          </div>
          <p className="leading-relaxed">
            AI-assisted civic issue reporting for Palghar City, Maharashtra.
            Built as a student project — not affiliated with any municipal body.
          </p>
        </div>

        {/* Column 2 — Open tools */}
        <div>
          <h4 className="label-xs text-white/50 mb-3">Built With Open Tools</h4>
          <ul className="space-y-1">
            <li>OpenStreetMap &amp; Leaflet</li>
            <li>Local AI via Ollama</li>
            <li>React &amp; Tailwind CSS</li>
            <li>Vite &amp; Vitest</li>
          </ul>
        </div>

        {/* Column 3 — Honesty note */}
        <div>
          <h4 className="label-xs text-white/50 mb-3">Honesty Note</h4>
          <p className="leading-relaxed">
            AI output is a <strong className="text-white">suggestion</strong>. A human reviews it.
            All demo data is clearly labelled. No personal data is sent to any
            external service. See the README for the full tile-usage and
            geocoding policies.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-xs text-white/40 py-4">
        © {year} Civic-I · Student Project · Palghar, MH
      </div>
    </footer>
  );
}

