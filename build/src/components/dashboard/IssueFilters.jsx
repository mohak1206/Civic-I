import React from 'react';
import { LayoutGrid, Map as MapIcon, Filter } from 'lucide-react';
import { ISSUE_TYPES, ISSUE_STATUSES } from '../../utils/constants';

export function IssueFilters({
  activeStatus,
  onStatusChange,
  activeType,
  onTypeChange,
  myReportsOnly,
  onMyReportsChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl backdrop-blur-md">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeStatus === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({totalCount})
          </button>
          {ISSUE_STATUSES.map((st) => (
            <button
              key={st.id}
              onClick={() => onStatusChange(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeStatus === st.id
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* View Toggle & My Reports */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-zinc-800/60 transition-colors">
            <input
              type="checkbox"
              checked={myReportsOnly}
              onChange={(e) => onMyReportsChange(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>My Reports</span>
          </label>

          <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-xl">
            <button
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              aria-label="Map view"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'map' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-400">Filter by Type:</span>
        <select
          value={activeType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Categories</option>
          {ISSUE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

