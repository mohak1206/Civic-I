import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  envDir: path.resolve(__dirname, '../..'),
  resolve: {
    alias: {
      '@citizen': path.resolve(__dirname, 'src/citizen'),
      '@map': path.resolve(__dirname, 'src/map'),
      '@shared-ui': path.resolve(__dirname, 'src/shared-ui'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
    },
  },
  server: {
    port: 3001,
    fs: {
      allow: ['../..'],
    },
  },
  test: {
    root: path.resolve(__dirname, '../..'),
    include: ['test/web/**/*.test.{js,jsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['test/web/setup.js'],
  },
});

