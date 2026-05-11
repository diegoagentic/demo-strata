import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Real strata-ds (github.com/diegoagentic/strata-ds) — available in local workspace.
// Falls back to the embedded packages/strata-ds/ when the real one isn't present (Vercel CI).
const realStrataDsDist = path.resolve(__dirname, '../../../Strata Design System/strata-ds/dist/index.js')
const fallbackStrataDsSrc = path.resolve(__dirname, 'packages/strata-ds/src/components/index.ts')
const strataDsAlias = fs.existsSync(realStrataDsDist) ? realStrataDsDist : fallbackStrataDsSrc

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
      'strata-design-system': strataDsAlias,
    },
  },
})
