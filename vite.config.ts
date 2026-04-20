import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const transelectricaProxy = {
  '/api': {
    target: 'https://www.transelectrica.ro',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api/, ''),
    headers: {
      'Referer': 'https://www.transelectrica.ro/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: transelectricaProxy },
  preview: { proxy: transelectricaProxy },
})
