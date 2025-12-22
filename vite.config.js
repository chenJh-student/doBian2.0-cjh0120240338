import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'copy-static-files',
            closeBundle() {
                // 复制根目录的 HTML 文件到构建输出
                copyFileSync('movie-detail.html', 'dist/movie-detail.html')
                copyFileSync('user_info.html', 'dist/user_info.html')
                copyFileSync('index.html', 'dist/index.html')
                
                console.log('Static files copied to dist!')
            }
        }
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    server: {
        port: 3000
    },
    // GitHub Pages 配置 - 根路径部署
    base: '/'
})