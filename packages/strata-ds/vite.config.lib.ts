import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import path from 'path';



// Custom plugin to copy assets
const copyAssets = () => {
    return {
        name: 'copy-assets',
        closeBundle: async () => {
            const srcDir = resolve(__dirname, 'src/styles/tokens');
            const destDir = resolve(__dirname, 'dist/styles/tokens');

            if (fs.existsSync(srcDir)) {
                fs.mkdirSync(destDir, { recursive: true });
                const files = fs.readdirSync(srcDir);
                files.forEach(file => {
                    if (file.endsWith('.css')) {
                        fs.copyFileSync(
                            path.join(srcDir, file),
                            path.join(destDir, file)
                        );
                        console.log(`Copied ${file} to dist/styles/tokens`);
                    }
                });
            }
        }
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            include: ['src/components/**/*.tsx', 'src/components/**/*.ts', 'src/tokens/**/*.ts', 'src/utils/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/examples/**/*'],
        }),
        copyAssets(),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/components/index.ts'),
                tokens: resolve(__dirname, 'src/tokens/tokens.ts'),
            },
            name: 'WhiteLabelDesignSystem',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const ext = format === 'es' ? 'js' : 'cjs';
                return `${entryName}.${ext}`;
            },
        },
        rollupOptions: {
            // Externalize deps that shouldn't be bundled
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'lucide-react',
                'class-variance-authority',
                'clsx',
                'tailwind-merge',
            ],
            output: {
                // Provide global variables for UMD build
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                },
                // Preserve module structure for better tree-shaking
                preserveModules: false,
                // Export named exports
                exports: 'named',
            },
        },
        // Generate sourcemaps for debugging
        sourcemap: true,
        // Minify for production
        minify: 'esbuild',
        // Target modern browsers
        target: 'es2015',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
