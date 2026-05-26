import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import liuyaoReadingHandler from './api/liuyao-reading.js'

function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname
        if (pathname !== '/api/liuyao-reading') {
          next()
          return
        }

        try {
          await liuyaoReadingHandler(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
