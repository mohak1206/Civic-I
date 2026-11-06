import React from 'react';

/**
 * Small uppercase label flanked by orange horizontal lines.
 *
 *   ——— LABEL TEXT ———
 */
export default function SectionLabel({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 max-w-[40px] bg-accent-orange" aria-hidden="true" />
      <span className="label-xs text-accent-orange whitespace-nowrap">{children}</span>
      <span className="h-px flex-1 max-w-[40px] bg-accent-orange" aria-hidden="true" />
    </div>
  );
}

