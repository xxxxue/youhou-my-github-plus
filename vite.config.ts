import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import monkey, { cdn } from 'vite-plugin-monkey'
import { transform_sl_import } from './plugins/vite-plugin-transform-sl-import'

export default defineConfig({
  build: {
    minify: 'terser', // 启用 Terser 压缩
    terserOptions: {
      format: {
        comments: false, // 去除所有注释
      },
    },
  },
  plugins: [
    react(),
    transform_sl_import(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://github.com/*'],
      },
      build: {
        externalGlobals: {
          'react': cdn.npmmirror('React', 'umd/react.production.min.js'),
          'react-dom': cdn.npmmirror('ReactDOM', 'umd/react-dom.production.min.js'),
        },
      },
    }),
  ],
})
