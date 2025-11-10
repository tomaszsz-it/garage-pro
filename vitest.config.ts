/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment setup
    environment: 'jsdom',
    
    // Global setup and teardown
    setupFiles: ['./src/test/setup.ts'],
    
    // Watch mode configuration
    watch: true,
    
    // UI mode for development
    ui: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        'src/test/',
        'e2e/',
        '.astro/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    
    // Globals for vi and expect
    globals: true,
    
    // Reporter configuration
    reporter: ['verbose', 'html'],
    
    // Pool options for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
