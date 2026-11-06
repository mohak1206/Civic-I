import React from 'react';

/**
 * Simple card with square corners, 1px border, subtle shadow.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`border border-card-border bg-card rounded-card shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

