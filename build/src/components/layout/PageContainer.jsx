import React from 'react';
import { motion } from 'framer-motion';

export function PageContainer({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10 min-h-[calc(100vh-4rem)] ${className}`}
    >
      {children}
    </motion.main>
  );
}

