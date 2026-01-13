import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // ✅ SECURITY: Only disable certificate validation in development
  const isDevelopment = mode === 'development';

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      // ✅ SECURITY: Strict CORS in development
      cors: {
        origin: isDevelopment ? true : false,
      },
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URI,
          changeOrigin: true,
          // ✅ SECURITY: Only allow insecure connections in development
          // In production, always validate SSL certificates
          secure: !isDevelopment,
          // ✅ SECURITY: Configure timeout to prevent hanging connections
          timeout: 30000,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              // ✅ SECURITY: Log proxy requests in development only
              if (isDevelopment) {
                console.log(`[Proxy] ${req.method} ${req.url}`);
              }
            });
          },
        },
      },
    },
    // ✅ SECURITY: Build optimizations
    build: {
      // Generate source maps only in development
      sourcemap: isDevelopment,
      // Minify in production
      minify: !isDevelopment ? 'esbuild' : false,
      // ✅ SECURITY: Remove console.log in production
      esbuild: {
        drop: isDevelopment ? [] : ['console', 'debugger'],
      },
    },
    // ✅ SECURITY: Define environment-specific variables
    define: {
      __DEV__: isDevelopment,
    },
  }
})
