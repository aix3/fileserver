import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
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
