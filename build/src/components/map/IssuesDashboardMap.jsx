import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { PALGHAR_DEFAULT_CENTER, DEFAULT_MAP_ID, ISSUE_TYPES, ISSUE_STATUSES } from '../../utils/constants';
import { getIssueTypeColor, getSafeCenter } from '../../utils/mapHelpers';
import { Badge } from '../ui/Badge';
import { MapFallback } from './MapFallback';

function DashboardMapInner({ issues, selectedIssue, setSelectedIssue }) {
  const center =
    issues.length > 0 && issues[0].location?.lat && issues[0].location?.lng
      ? { lat: issues[0].location.lat, lng: issues[0].location.lng }
      : PALGHAR_DEFAULT_CENTER;

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
      <Map
        defaultCenter={getSafeCenter(center)}
        defaultZoom={13}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID || DEFAULT_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {issues.map((issue) => {
          if (!issue.location?.lat || !issue.location?.lng) return null;
          const pos = { lat: issue.location.lat, lng: issue.location.lng };
          const pinColor = getIssueTypeColor(issue.type);

          return (
            <AdvancedMarker
              key={issue.id}
              position={pos}
              onClick={() => setSelectedIssue(issue)}
              title={`${issue.title} (${issue.type})`}
            >
              <Pin background={pinColor} borderColor="#18181b" glyphColor="#ffffff" scale={1.1} />
            </AdvancedMarker>
          );
        })}

        {selectedIssue && selectedIssue.location?.lat && (
          <InfoWindow
            position={{ lat: selectedIssue.location.lat, lng: selectedIssue.location.lng }}
            onCloseClick={() => setSelectedIssue(null)}
            pixelOffset={[0, -35]}
          >
            <div className="bg-zinc-900 text-zinc-100 p-2.5 max-w-[260px] rounded-xl text-xs space-y-2">
              {selectedIssue.photo && (
                <img
                  src={selectedIssue.photo}
                  alt={selectedIssue.title}
                  className="w-full h-24 object-cover rounded-lg border border-zinc-800"
                />
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getIssueTypeColor(selectedIssue.type) }}
                />
                <span className="font-semibold text-zinc-100 capitalize">
                  {selectedIssue.type.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {selectedIssue.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="font-medium text-zinc-200 line-clamp-2">{selectedIssue.title}</p>
              {selectedIssue.location?.address && (
                <p className="text-[11px] text-zinc-400 line-clamp-2">{selectedIssue.location.address}</p>
              )}
              <span className="text-[10px] text-zinc-500 block">
                {new Date(selectedIssue.createdAt).toLocaleDateString()}
              </span>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Legend overlay */}
      <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-2.5 text-xs shadow-lg hidden sm:block pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
          Map Legend
        </span>
        <div className="space-y-1">
          {ISSUE_TYPES.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-[11px] text-zinc-300">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IssuesDashboardMap({ issues }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [hasAuthFailure, setHasAuthFailure] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const handleFailure = () => setHasAuthFailure(true);
    window.addEventListener('google-maps-auth-failure', handleFailure);
    return () => window.removeEventListener('google-maps-auth-failure', handleFailure);
  }, []);

  if (!apiKey || apiKey === 'your-google-maps-api-key' || hasAuthFailure) {
    return (
      <MapFallback
        isAuthFailure={hasAuthFailure}
        message="Interactive issue overview map is disabled because Google Maps is not configured. All reports remain accessible in the list view below."
      />
    );
  }

  const mappedIssues = issues.filter((i) => i.location?.lat && i.location?.lng);

  return (
    <div className="space-y-2">
      <APIProvider apiKey={apiKey}>
        <DashboardMapInner
          issues={mappedIssues}
          selectedIssue={selectedIssue}
          setSelectedIssue={setSelectedIssue}
        />
      </APIProvider>
      <div className="text-right text-[11px] text-zinc-500">
        Showing {mappedIssues.length} geolocated issue{mappedIssues.length !== 1 ? 's' : ''} on map
      </div>
    </div>
  );
}

