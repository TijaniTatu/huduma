import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This project carries over from Create React App, where JSX lives in `.js`
// files. Vite/esbuild only treat `.jsx` as JSX by default, so we widen the
// loader to parse JSX inside `.js` source files too.
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
})
