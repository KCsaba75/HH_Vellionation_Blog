import path from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

const criticalCssPlugin = () => {
  return {
    name: 'critical-css-plugin',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const criticalCssPath = path.resolve(__dirname, 'src/styles/critical.css');
        let criticalCss = '';
        try {
          criticalCss = fs.readFileSync(criticalCssPath, 'utf-8');
          criticalCss = criticalCss.replace(/\s+/g, ' ').trim();
        } catch (e) {
          console.warn('Critical CSS file not found, skipping inline.');
        }
        
        if (criticalCss) {
          html = html.replace(
            '</head>',
            `<style id="critical-css">${criticalCss}</style></head>`
          );
        }
        
        html = html.replace(
          /<link rel="stylesheet" href="(\/assets\/[^"]+\.css)">/g,
          (match, href) => {
            return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
          }
        );
        
        return html;
      }
    }
  };
};

const logger = createLogger();
const loggerError = logger.error;

logger.error = (msg, options) => {
  if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
    return;
  }
  loggerError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [
    react(),
    criticalCssPlugin()
  ],
  server: {
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    allowedHosts: true,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-tiptap': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image', '@tiptap/extension-link', '@tiptap/extension-text-align', '@tiptap/extension-underline']
        }
      }
    }
  },
  preview: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  }
});
