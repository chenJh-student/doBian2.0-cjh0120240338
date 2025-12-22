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
                // 确保 dist 目录存在
                if (!existsSync('dist')) {
                    mkdirSync('dist')
                }
                
                // 复制 movie-detail.html
                copyFileSync('movie-detail.html', 'dist/movie-detail.html')
                
                // 复制 user_info.html
                copyFileSync('user_info.html', 'dist/user_info.html')
                
                console.log('Static files copied to dist!')
            }
        }
    ],
    server: {
        port: 3000
    },
    // GitHub Pages 配置 - 根据实际的Pages设置调整
    base: process.env.NODE_ENV === 'production' ? '/' : '/'
})