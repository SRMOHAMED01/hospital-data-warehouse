import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ══════════════════════════════════════════
// Vite écoute sur toutes les interfaces (0.0.0.0)
// pour être accessible depuis l'extérieur du
// conteneur Docker. Port 5173 = port par défaut Vite.
// ══════════════════════════════════════════
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
})
