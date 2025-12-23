import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/doBian2.0-cjh0120240338/', // GitHub Pages仓库名
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                movieDetail: 'movie-detail.html',
                userInfo: 'user_info.html'
            }
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})