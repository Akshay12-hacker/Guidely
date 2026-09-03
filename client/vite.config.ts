import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL || env.VITE_API_URL || 'http://localhost:5000';

  let apiTarget = 'http://localhost:5000';
  let wsTarget = 'ws://localhost:5000';

  try {
    if (apiBase.startsWith('http')) {
      const url = new URL(apiBase);
      apiTarget = url.origin;
      wsTarget = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}`;
    }
  } catch {
    // fallback to localhost defaults
  }

  if (env.VITE_WS_URL) {
    try {
      const wsUrl = new URL(env.VITE_WS_URL);
      wsTarget = `${wsUrl.protocol}//${wsUrl.host}`;
    } catch {
      // ignore
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },
        '/ws': {
          target: wsTarget,
          ws: true
        }
      }
    }
  };
});

