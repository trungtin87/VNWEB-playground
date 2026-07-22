import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Site được deploy tại https://trungtin87.github.io/VNWEB-playground/
  // nên MỌI đường dẫn tài nguyên (JS/CSS/wasm...) phải có tiền tố này.
  base: '/VNWEB-playground/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Các file .wasm khá nặng — cho phép service worker cache dù vượt giới hạn mặc định (2MB)
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'VNWEB Playground — Học HTML, CSS, JS bằng tiếng Việt',
        short_name: 'VNWEB',
        description:
          'Sân chơi lập trình web: gõ mã bằng tiếng Việt hoặc tiếng Anh, có IntelliSense, dịch 2 chiều an toàn dựa trên cây cú pháp (tree-sitter), xem trước trực tiếp.',
        lang: 'vi',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#1a1714',
        theme_color: '#1a1714',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
