import React, { useState } from 'react';
import { Sparkles, Check, Edit2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { ISSUE_TYPES, normalizeIssueType } from '../../utils/constants';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function AISuggestionBox({
  analyzing,
  suggestion,
  selectedType,
  onTypeSelect,
  onReanalyze,
  aiError,
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (analyzing) {
    return (
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            Gemma 3 Inspecting Photo...
            <span className="text-[10px] text-zinc-500 font-mono">Vision 4B</span>
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Observing visual hazard indicators and classifying civic infrastructure category...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Required AI Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p className="leading-relaxed">
          <strong className="font-semibold">AI output is a suggestion.</strong> A human reviews it.
          Please confirm or change the suggested issue classification below.
        </p>
      </div>

      {aiError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium text-zinc-200 block">{aiError}</span>
            <span className="text-zinc-500 text-[11px] mt-0.5 block">
              You can manually pick the appropriate category from the options below.
            </span>
          </div>
          {onReanalyze && (
            <Button size="sm" variant="ghost" onClick={onReanalyze} icon={RefreshCw}>
              Retry
            </Button>
          )}
        </div>
      )}

      {suggestion?.success && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Gemma 3 Vision Suggestion
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">
                {Math.round((suggestion.confidence || 0.85) * 100)}% confidence
              </span>
              <Badge variant="primary" size="xs">
                Gemma 3
              </Badge>
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <div>
              <span className="text-lg font-bold text-white capitalize">
                {suggestion.type.replace(/_/g, ' ')}
              </span>
              <p className="text-xs text-zinc-300 mt-1 italic">
                "{suggestion.description}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <Button
              size="sm"
              variant={selectedType === suggestion.type && !isEditing ? 'primary' : 'outline'}
              onClick={() => {
                onTypeSelect(suggestion.type, true);
                setIsEditing(false);
              }}
              icon={Check}
            >
              Confirm Suggestion (+15 XP)
            </Button>

            <Button
              size="sm"
              variant={isEditing ? 'secondary' : 'ghost'}
              onClick={() => setIsEditing(!isEditing)}
              icon={Edit2}
            >
              {isEditing ? 'Close Options' : 'Change Category'}
            </Button>
          </div>
        </div>
      )}

      {/* Manual Category Selection Grid */}
      {(!suggestion?.success || isEditing) && (
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Select Issue Category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ISSUE_TYPES.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onTypeSelect(t.id, false);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-zinc-800 border-emerald-500 shadow-md text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <div>
                      <span className="text-xs font-semibold block">{t.label}</span>
                      <span className="text-[10px] text-zinc-400 line-clamp-1">{t.description}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
