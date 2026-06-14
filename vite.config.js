import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import liuyaoReadingHandler from './api/liuyao-reading.js'
import deepseekReadingHandler from './api/deepseek-reading.js'

const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET
  || process.env.VITE_APP_BASE_URL
  || 'https://yijing-pi.vercel.app'

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function proxyHeaders(req) {
  const blocked = new Set(['host', 'connection', 'content-length', 'accept-encoding'])
  return Object.entries(req.headers).reduce((headers, [key, value]) => {
    if (!blocked.has(key.toLowerCase()) && value) headers[key] = value
    return headers
  }, {
    'x-yijie-local-proxy': 'vite',
  })
}

async function proxyToProduction(req, res, pathname) {
  const body = ['GET', 'HEAD'].includes(req.method || '')
    ? undefined
    : await readRequestBody(req)
  const response = await fetch(new URL(pathname, API_PROXY_TARGET), {
    method: req.method,
    headers: proxyHeaders(req),
    body,
  })

  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
      res.setHeader(key, value)
    }
  })
  res.end(Buffer.from(await response.arrayBuffer()))
}

function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname
        if (pathname !== '/api/liuyao-reading' && pathname !== '/api/deepseek-reading') {
          next()
          return
        }

        try {
          if (pathname === '/api/liuyao-reading') {
            await liuyaoReadingHandler(req, res)
            return
          }

          if (process.env.DEEPSEEK_API_KEY) {
            await deepseekReadingHandler(req, res)
            return
          }

          await proxyToProduction(req, res, pathname)
        } catch (error) {
          console.error('[local-api]', error)
          sendJson(res, 502, {
            error: {
              code: 'local_api_error',
              message: '本地 API 代理失败，请检查网络或 Vercel 线上接口。',
            },
          })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
