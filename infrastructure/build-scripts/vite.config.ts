import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'index.ts',
      name: 'build-scripts',
      formats: ['es'],
      fileName: () => `index.mjs`,
    },
    rollupOptions: {
      external: ['zx', '@google-cloud/storage'],
    },
  },
})
