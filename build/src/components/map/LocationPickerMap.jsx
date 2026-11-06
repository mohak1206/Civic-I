import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Navigation, Search, Check, AlertCircle } from 'lucide-react';
import { PALGHAR_DEFAULT_CENTER } from '../../utils/constants';
import { formatCoordinates, getSafeCenter } from '../../utils/mapHelpers';
import { createPickerMarkerIcon } from './leafletSetup';
import { Button } from '../ui/Button';
import { MapFallback } from './MapFallback';

// Rate limiter for Nominatim (maximum 1 request per second)
let lastNominatimTimestamp = 0;
async function rateLimitedFetch(url, options = {}) {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimTimestamp;
  if (timeSinceLast < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLast));
  }
  lastNominatimTimestamp = Date.now();

  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Civic-I-Palghar-Reporter/1.0 (civic-i@palghar.local)',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  return response;
}

function MapViewController({ center, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      if (onMapClick && e.latlng) {
        onMapClick(e.latlng);
      }
    },
  });

  return null;
}

export function LocationPickerMap({ value, onChange }) {
  const [mapError, setMapError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const currentPos = value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : PALGHAR_DEFAULT_CENTER;
  const currentAddress = value?.address || '';

  const pickerIcon = useRef(createPickerMarkerIcon()).current;

  // Reverse geocode with Nominatim (rate limited)
  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const res = await rateLimitedFetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            onChange({
              lat,
              lng,
              address: data.display_name,
              hasGPS: !!value?.hasGPS,
            });
          }
        }
      } catch (err) {
        console.warn('Nominatim reverse geocode failed:', err);
      }
    },
    [onChange, value?.hasGPS]
  );

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    if (marker) {
      const latlng = marker.getLatLng();
      const lat = Number(latlng.lat.toFixed(5));
      const lng = Number(latlng.lng.toFixed(5));
      onChange({ lat, lng, address: currentAddress, hasGPS: false });
      reverseGeocode(lat, lng);
    }
  };

  const handleMapClick = (latlng) => {
    const lat = Number(latlng.lat.toFixed(5));
    const lng = Number(latlng.lng.toFixed(5));
    onChange({ lat, lng, address: currentAddress, hasGPS: false });
    reverseGeocode(lat, lng);
  };

  // Nominatim Address Search triggered only on button click (never on keystroke)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const query = `${searchInput.trim()}, Palghar, Maharashtra, India`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await rateLimitedFetch(url);

      if (!res.ok) {
        throw new Error(`Geocoding failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        onChange({
          lat: newPos.lat,
          lng: newPos.lng,
          address: result.display_name || searchInput,
          hasGPS: false,
        });
      } else {
        setSearchError('Address not found. Preserving your typed address text.');
        onChange({
          ...currentPos,
          address: searchInput,
          hasGPS: false,
        });
      }
    } catch (err) {
      console.warn('Nominatim search error:', err);
      setSearchError('Could not reach search service. Preserving your typed address.');
      onChange({
        ...currentPos,
        address: searchInput,
        hasGPS: false,
      });
    } finally {
      setIsSearching(false);
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
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
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

  if (mapError) {
    return (
      <div className="space-y-3">
        <MapFallback
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
      {/* Search and GPS controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs text-zinc-400">
          Drag pin or click map to set issue coordinates:
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleUseGPS}
          disabled={gpsLoading}
          icon={Navigation}
          className="text-xs self-start sm:self-auto"
        >
          {gpsLoading ? 'Locating...' : 'Use my GPS'}
        </Button>
      </div>

      {/* Nominatim Search Form (Button triggered, never on keystroke) */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search address or landmark in Palghar..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={isSearching || !searchInput.trim()}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {searchError && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl z-0">
        <MapContainer
          center={getSafeCenter(currentPos)}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewController center={currentPos} onMapClick={handleMapClick} />
          <Marker
            position={[currentPos.lat, currentPos.lng]}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
            icon={pickerIcon}
          />
        </MapContainer>

        {/* Floating coordinates indicator */}
        <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl px-3 py-2 text-xs flex items-center justify-between pointer-events-none z-[1000]">
          <span className="text-zinc-300 font-mono">{formatCoordinates(currentPos.lat, currentPos.lng)}</span>
          <span className="text-emerald-400 text-[11px] font-medium hidden sm:inline">
            Draggable Pin Active
          </span>
        </div>
      </div>

      {/* Resolved Address Display */}
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
