import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/enisa_calculator/', // <- EXACT repo name with trailing slashes
})