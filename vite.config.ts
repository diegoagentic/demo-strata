import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/demo-strata/' : '/',
  server: {
    port: 8085,
    strictPort: false,
  },
  resolve: {
    alias: {
      // strata-ds doesn't have a library build — resolve to source
      // directly so both dev and prod builds work.
      'strata-design-system': path.resolve(__dirname, 'packages/strata-ds/src/components/index.ts'),
    },
  },
})
