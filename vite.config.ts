import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

// Vite config that preserves CRA-style env usage without code changes.
// - Keeps REACT_APP_* variables available via process.env.REACT_APP_*
// - Preserves process.env.PUBLIC_URL semantics (used for public assets)
// - Uses port 3000 to match CRA for minimal friction
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Build define map for each REACT_APP_* key individually to avoid clobbering process.env
  const defineEnv: Record<string, string> = {} as any;
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('REACT_APP_')) {
      defineEnv[`process.env.${key}`] = JSON.stringify(value);
    }
  }
  // PUBLIC_URL fallback (used in CRA templates); default to empty string so `${PUBLIC_URL}/x` -> `/x`
  defineEnv['process.env.PUBLIC_URL'] = JSON.stringify(env.PUBLIC_URL || '');

  return {
    plugins: [
      react(),
      checker({
        typescript: true,
      }),
    ],
    server: {
      port: 3000,
      open: true,
    },
    preview: {
      port: 3000,
      open: true,
    },
    define: defineEnv,
    publicDir: 'public',
  };
});
