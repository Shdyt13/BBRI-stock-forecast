import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Enable for Docker (listens on 0.0.0.0)
    open: false, // Disable auto-open in Docker
    watch: {
      usePolling: true, // Better file watching in Docker
    },
  },
});
