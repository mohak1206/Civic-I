import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Primary and outline button variants.
 *
 * @param {'primary'|'outline'} variant
 * @param {boolean} showArrow – show ArrowRight icon (default true for primary)
 */
export default function Button({
  children,
  variant = 'primary',
  showArrow,
  className = '',
  ...props
}) {
  const arrow = showArrow ?? variant === 'primary';

  const base =
    'inline-flex items-center justify-center gap-2 font-heading text-xs sm:text-sm uppercase tracking-label font-semibold px-5 py-2.5 transition-colors duration-200 rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent-orange text-white hover:bg-orange-700 active:bg-orange-800',
    outline:
      'border border-navy text-navy hover:bg-navy hover:text-white active:bg-navy/90',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}

