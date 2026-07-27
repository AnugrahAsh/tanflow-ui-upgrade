import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built app works from any sub-path on static hosting
  // (e.g. Hostinger). Assets resolve relative to index.html.
  base: './',
})
