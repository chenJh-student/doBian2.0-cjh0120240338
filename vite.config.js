import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3000
    },
    // 更新为新的仓库名
    base: '/doBian2.0-cjh0120240338/'
})