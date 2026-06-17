import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '');
  return {
    plugins: [react()],
    define: {
      __CATALOGO_URL__: JSON.stringify(env.CATALOGO_URL || 'http://localhost:5174'),
    },
    server: {
      proxy: {
        // Cada vez que React haga una petición a algo que empiece con "/api"
        // Vite lo redirigirá automáticamente al puerto 8080 de Spring Boot
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})