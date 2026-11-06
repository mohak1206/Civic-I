import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, AlertCircle } from 'lucide-react';
import { PALGHAR_DEFAULT_CENTER } from '../citizen/config';

// Fix Leaflet's default marker icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createPinIcon() {
  return L.divIcon({
    className: 'civic-pin-icon',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #E8501F;
        border: 2px solid #1B2536;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

// Rate limiter for Nominatim (max 1 request per second)
let lastNominatimTimestamp = 0;
async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimTimestamp;
  if (timeSinceLast < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLast));
  }
  lastNominatimTimestamp = Date.now();

  return fetch(url, {
    headers: {
      'User-Agent': 'Civic-I-Palghar-Reporter/1.0',
      Accept: 'application/json',
    },
  });
}

function MapController({ center, onMapClick }) {
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

export default function LocationPicker({ value, onChange }) {
  const [mapError, setMapError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const currentLat = value?.lat ?? PALGHAR_DEFAULT_CENTER.lat;
  const currentLng = value?.lng ?? PALGHAR_DEFAULT_CENTER.lng;
  const currentPos = { lat: currentLat, lng: currentLng };
  const currentAddress = value?.address || '';

  const pinIcon = useRef(createPinIcon()).current;

  // Reverse geocoding via Nominatim
  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const res = await rateLimitedFetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data?.display_name) {
            onChange({ lat, lng, address: data.display_name });
          }
        }
      } catch (err) {
        console.warn('Nominatim reverse geocode error:', err);
      }
    },
    [onChange]
  );

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    if (marker) {
      const latlng = marker.getLatLng();
      const lat = Number(latlng.lat.toFixed(5));
      const lng = Number(latlng.lng.toFixed(5));
      onChange({ lat, lng, address: currentAddress });
      reverseGeocode(lat, lng);
    }
  };

  const handleMapClick = (latlng) => {
    const lat = Number(latlng.lat.toFixed(5));
    const lng = Number(latlng.lng.toFixed(5));
    onChange({ lat, lng, address: currentAddress });
    reverseGeocode(lat, lng);
  };

  // Search address using Nominatim (triggered only by button click / Enter)
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchInput.trim() || searching) return;

    setSearching(true);
    setSearchError(null);

    try {
      const query = encodeURIComponent(`${searchInput.trim()}, Palghar, Maharashtra`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
      const res = await rateLimitedFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = Number(parseFloat(result.lat).toFixed(5));
          const lng = Number(parseFloat(result.lon).toFixed(5));
          onChange({ lat, lng, address: result.display_name });
          setSearchInput('');
        } else {
          setSearchError('Location not found in Palghar. Try a landmark or road name.');
        }
      } else {
        setSearchError('Search service temporarily unavailable.');
      }
    } catch {
      setSearchError('Could not reach search service.');
    } finally {
      setSearching(false);
    }
  };

  // GPS geolocation button
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        onChange({ lat, lng, address: currentAddress || `GPS: ${lat}, ${lng}` });
        reverseGeocode(lat, lng);
      },
      (error) => {
        setGpsLoading(false);
        setSearchError('Could not get GPS position: ' + error.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (mapError) {
    return (
      <div className="p-4 border border-navy/20 rounded-card bg-canvas text-navy">
        <p className="text-sm font-body">Map view could not load. You can enter an address or GPS manually below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search and GPS controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search road or landmark in Palghar..."
            className="flex-1 border border-navy/20 px-3 py-2 text-sm rounded-card bg-white focus:outline-none focus:border-accent-orange font-body"
          />
          <button
            type="submit"
            disabled={searching || !searchInput.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy text-white text-xs font-heading font-semibold uppercase tracking-label rounded-card hover:bg-navy/90 disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGPS}
          disabled={gpsLoading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-navy/30 bg-white text-navy text-xs font-heading font-semibold uppercase tracking-label rounded-card hover:bg-navy/5 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'Locating...' : 'Use GPS'}
        </button>
      </div>

      {searchError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-card">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Interactive Leaflet Map */}
      <div className="relative border border-navy/20 rounded-card overflow-hidden h-64 bg-slate-100">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
          whenReady={() => {}}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={currentPos} onMapClick={handleMapClick} />
          <Marker
            position={[currentLat, currentLng]}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
        </MapContainer>
      </div>

      <p className="text-xs text-navy/50 font-body">
        Tap the map or drag the pin to adjust the precise location.
      </p>
    </div>
  );
}

