import '@testing-library/jest-dom';

// Simple polyfill/mock for localStorage if running in headless environment
if (typeof window !== 'undefined' && !window.localStorage) {
  let store = {};
  window.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

