import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = (env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

  const proxy = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },
  }

  return {
    plugins: [react()],
    server: { proxy },
    // Debe coincidir con FRONTEND_URL del backend (enlaces del correo de recuperación)
    preview: {
      port: 4174,
      strictPort: true,
      proxy,
    },
  }
})
