import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: 'dist',
      emptyOutDir: mode === 'es',
      lib: {
        entry: mode === 'define'
          ? resolve(import.meta.dirname, 'src/define.js')
          : resolve(import.meta.dirname, 'src/index.js'),
        name: 'AttributionBadge',
        formats: mode === 'define' ? ['es'] : ['es', 'iife'],
        fileName: (format) => {
          if (mode === 'define') {
            return 'define.js';
          }
          if (format === 'es') {
            return 'attribution-badge.js';
          }
          return 'attribution-badge.iife.js';
        },
      },
    },
    test: {
      environment: 'happy-dom',
    },
  };
});
