import React from 'react';
import { MapPinOff, AlertTriangle, Key } from 'lucide-react';

export function MapFallback({ message, isAuthFailure = false, address, onAddressChange }) {
  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
        {isAuthFailure ? <AlertTriangle className="w-6 h-6" /> : <Key className="w-6 h-6" />}
      </div>

      <h4 className="text-sm font-semibold text-zinc-200">
        {isAuthFailure ? 'Google Maps Authentication Notice' : 'Interactive Map Unavailable'}
      </h4>

      <p className="text-xs text-zinc-400 max-w-md mt-1 mb-4 leading-relaxed">
        {message ||
          (isAuthFailure
            ? 'Google Maps API reported an authentication failure (gm_authFailure). Verify that billing is enabled and your key is unrestricted for this origin.'
            : 'VITE_GOOGLE_MAPS_API_KEY is not configured in .env. You can still enter or confirm your report location using the address field below.')}
      </p>

      {onAddressChange && (
        <div className="w-full max-w-md text-left">
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Manual Location / Landmark Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={address || ''}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="e.g. Near Palghar Railway Station, Station Rd"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

