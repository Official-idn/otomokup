import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Get repository name for GitHub Pages base path
    const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'otomokup';
    const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

    return {
      // Set base path for GitHub Pages deployment
      base: '/otomokup/',
      publicDir: 'public',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: __dirname is not available in ES modules. Use path.resolve('./') instead.
          '@': path.resolve('./'),
        }
      },
      build: {
        // Generate source maps for better debugging
        sourcemap: false,
        // Ensure assets are handled correctly
        assetsDir: 'assets',
        // Optimize chunks
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
            },
          },
        },
      },
    };
});