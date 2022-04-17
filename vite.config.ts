import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import visualizer from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            filename: './dist/visualizer.html',
            open: true,
            brotliSize: true
        })
    ],
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    return `_ui/[name].[hash][extname]`;
                },
                chunkFileNames: '_ui/[name].[hash].js',
                entryFileNames: '_ui/[name].[hash].js',
            },
        },
    },
});
