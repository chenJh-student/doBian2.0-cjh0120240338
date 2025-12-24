import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue()
    ],
    build: {
        outDir: 'docs',
        assetsDir: 'assets'
    },
    server: {
        port: 3000
    },
    // GitHub Pages 配置 - 仓库名路径
    base: '/doBian2.0-cjh0120240338/'
})