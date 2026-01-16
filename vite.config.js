import { defineConfig } from 'vite';

export default defineConfig({
    base: '/X-Sheep/',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser'
    }
});
