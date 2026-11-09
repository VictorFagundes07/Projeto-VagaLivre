import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-native-safe-area-context', 'react-native-screens'],
  },
  resolve: {
    alias: [{ find: /^react-native$/, replacement: 'react-native-web' }],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  server: { host: '127.0.0.1', port: 5173 },
});
