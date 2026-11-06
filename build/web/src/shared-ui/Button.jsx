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
    'inline-flex items-center justify-center gap-2 font-heading text-xs sm:text-sm uppercase tracking-label font-semibold px-5 py-2.5 transition-colors duration-200 rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange disabled:bg-btn-disabled disabled:text-white disabled:border-transparent disabled:opacity-80 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent-orange text-white hover:bg-orange-hover active:bg-[#B73B13]',
    outline:
      'border border-navy text-navy hover:bg-navy hover:text-white active:bg-navy/90',
    'gold-outline':
      'border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-white active:bg-accent-gold/90',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
      {arrow && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}

