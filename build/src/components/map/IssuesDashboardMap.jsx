import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { PALGHAR_DEFAULT_CENTER, ISSUE_TYPES, ISSUE_STATUSES, ISSUE_PRIORITIES, normalizeIssueType, normalizePriority } from '../../utils/constants';
import { getIssueTypeColor, getSafeCenter } from '../../utils/mapHelpers';
import { createColoredMarkerIcon } from './leafletSetup';
import { MapFallback } from './MapFallback';

export function IssuesDashboardMap({ issues = [] }) {
  const [mapError, setMapError] = useState(false);

  const mappedIssues = issues.filter(
    (i) => i.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number'
  );

  const center =
    mappedIssues.length > 0
      ? { lat: mappedIssues[0].location.lat, lng: mappedIssues[0].location.lng }
      : PALGHAR_DEFAULT_CENTER;

  if (mapError) {
    return (
      <MapFallback message="Could not load the interactive map tiles. Issues remain fully accessible in the list view below." />
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl z-0">
        <MapContainer
          center={getSafeCenter(center)}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappedIssues.map((issue) => {
            const pos = [issue.location.lat, issue.location.lng];
            const icon = createColoredMarkerIcon(issue.type);
            const normType = normalizeIssueType(issue.type);
            const typeObj = ISSUE_TYPES.find((t) => t.id === normType) || ISSUE_TYPES[ISSUE_TYPES.length - 1];
            const statusObj = ISSUE_STATUSES.find((s) => s.id === issue.status) || ISSUE_STATUSES[0];
            const priorityVal = normalizePriority(issue.priority);
            const priorityObj = ISSUE_PRIORITIES.find((p) => p.id === priorityVal) || ISSUE_PRIORITIES[3];

            return (
              <Marker key={issue.id} position={pos} icon={icon}>
                <Popup>
                  <div className="text-zinc-950 p-1 max-w-[240px] text-xs space-y-2 font-sans">
                    {issue.photo && (
                      <img
                        src={issue.photo}
                        alt={issue.title}
                        className="w-full h-24 object-cover rounded-lg border border-zinc-300"
                      />
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: typeObj.color }}
                      />
                      <span className="font-bold text-zinc-900 capitalize">
                        {typeObj.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 border border-zinc-300">
                        {statusObj.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {priorityObj.label}
                      </span>
                    </div>

                    <p className="font-semibold text-zinc-800 line-clamp-2 leading-tight">
                      {issue.title}
                    </p>

                    {issue.location?.address && (
                      <p className="text-[11px] text-zinc-600 line-clamp-2 leading-tight">
                        {issue.location.address}
                      </p>
                    )}

                    <span className="text-[10px] text-zinc-500 block">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute top-3 right-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-2.5 text-xs shadow-lg hidden sm:block pointer-events-none z-[1000]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            Category Legend
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

      <div className="text-right text-[11px] text-zinc-500">
        Showing {mappedIssues.length} geolocated issue{mappedIssues.length !== 1 ? 's' : ''} on OpenStreetMap
      </div>
    </div>
  );
}
