import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: '/DoBian-movie_cjh0120240338/',
                changeOrigin: true,
                secure: false
            }
        }
    }
})