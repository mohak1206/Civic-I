import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps';
import { Navigation, Search, Check, AlertCircle } from 'lucide-react';
import { PALGHAR_DEFAULT_CENTER, DEFAULT_MAP_ID } from '../../utils/constants';
import { formatCoordinates, getSafeCenter } from '../../utils/mapHelpers';
import { Button } from '../ui/Button';
import { MapFallback } from './MapFallback';

function SearchAndGeocode({ onSelectLocation, geocoderRef }) {
  const geocodingLib = useMapsLibrary('geocoding');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (geocodingLib) {
      geocoderRef.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib, geocoderRef]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || !geocoderRef.current) return;

    setIsSearching(true);
    try {
      geocoderRef.current.geocode(
        { address: `${searchInput}, Palghar, Maharashtra` },
        (results, status) => {
          setIsSearching(false);
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const newPos = { lat: loc.lat(), lng: loc.lng() };
            onSelectLocation(newPos, results[0].formatted_address);
            if (map) {
              map.panTo(newPos);
              map.setZoom(16);
            }
          }
        }
      );
    } catch {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search street or landmark in Palghar..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={isSearching || !searchInput.trim()}>
        {isSearching ? 'Searching...' : 'Find'}
      </Button>
    </form>
  );
}

function InnerLocationMap({ position, onMarkerDragEnd, onMapClick, address }) {
  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
      <Map
        defaultCenter={getSafeCenter(position)}
        center={position}
        defaultZoom={15}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID || DEFAULT_MAP_ID}
        onClick={onMapClick}
        disableDefaultUI={false}
        gestureHandling="greedy"
        className="w-full h-full"
      >
        <AdvancedMarker
          position={position}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          title="Drag to adjust issue location"
        >
          <Pin background="#10b981" borderColor="#065f46" glyphColor="#ffffff" scale={1.2} />
        </AdvancedMarker>
      </Map>

      {/* Floating coordinates indicator */}
      <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl px-3 py-2 text-xs flex items-center justify-between pointer-events-none">
        <span className="text-zinc-300 font-mono">{formatCoordinates(position.lat, position.lng)}</span>
        <span className="text-emerald-400 text-[11px] font-medium hidden sm:inline">
          Draggable Pin Active
        </span>
      </div>
    </div>
  );
}

export function LocationPickerMap({ value, onChange }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [hasAuthFailure, setHasAuthFailure] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const geocoderRef = useRef(null);

  const currentPos = value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : PALGHAR_DEFAULT_CENTER;
  const currentAddress = value?.address || '';

  // Listen to global gm_authFailure dispatch
  useEffect(() => {
    const handleFailure = () => setHasAuthFailure(true);
    window.addEventListener('google-maps-auth-failure', handleFailure);
    return () => window.removeEventListener('google-maps-auth-failure', handleFailure);
  }, []);

  const reverseGeocode = useCallback(
    (lat, lng) => {
      if (!geocoderRef.current) return;
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          onChange({
            lat,
            lng,
            address: results[0].formatted_address,
            hasGPS: !!value?.hasGPS,
          });
        }
      });
    },
    [onChange, value?.hasGPS]
  );

  const handleMarkerDragEnd = (e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onChange({ lat, lng, address: currentAddress, hasGPS: false });
      reverseGeocode(lat, lng);
    }
  };

  const handleMapClick = (e) => {
    if (e.detail?.latLng) {
      const { lat, lng } = e.detail.latLng;
      onChange({ lat, lng, address: currentAddress, hasGPS: false });
      reverseGeocode(lat, lng);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({ lat, lng, address: currentAddress, hasGPS: true });
        reverseGeocode(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        console.warn('GPS Error:', err);
        alert('Could not acquire your GPS location. Please check browser permissions or drag the pin.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // If no API key or auth failure occurred, show fallback
  if (!apiKey || apiKey === 'your-google-maps-api-key' || hasAuthFailure) {
    return (
      <div className="space-y-3">
        <MapFallback
          isAuthFailure={hasAuthFailure}
          address={currentAddress}
          onAddressChange={(addr) => onChange({ ...currentPos, address: addr, hasGPS: false })}
        />
        <Button variant="outline" size="sm" onClick={handleUseGPS} disabled={gpsLoading} icon={Navigation}>
          {gpsLoading ? 'Acquiring GPS...' : 'Try GPS Coordinates'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs text-zinc-400">
          Drag pin or click anywhere on the map to pin issue location:
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleUseGPS}
          disabled={gpsLoading}
          icon={Navigation}
          className="text-xs"
        >
          {gpsLoading ? 'Locating...' : 'Use my GPS'}
        </Button>
      </div>

      <APIProvider apiKey={apiKey}>
        <SearchAndGeocode
          geocoderRef={geocoderRef}
          onSelectLocation={(pos, addr) => onChange({ ...pos, address: addr, hasGPS: false })}
        />
        <InnerLocationMap
          position={currentPos}
          onMarkerDragEnd={handleMarkerDragEnd}
          onMapClick={handleMapClick}
          address={currentAddress}
        />
      </APIProvider>

      {currentAddress && (
        <div className="flex items-start gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300">
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-zinc-500 font-medium block text-[10px] uppercase">Resolved Address:</span>
            <span className="text-zinc-200">{currentAddress}</span>
          </div>
        </div>
      )}
    </div>
  );
}

