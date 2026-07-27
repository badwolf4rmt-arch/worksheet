import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')

const PORT = Number(process.env.PORT) || 3001
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim()
const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL ||
  'https://openrouter.ai/api/v1'
).replace(/\/$/, '')
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'google/gemini-2.5-flash'

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    hasKey: Boolean(OPENAI_API_KEY),
    model: OPENAI_MODEL,
  })
})

app.post('/api/chat', async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(503).json({ error: 'NO_API_KEY', message: 'OPENAI_API_KEY не задан на сервере' })
    return
  }

  const { messages, temperature, response_format } = req.body ?? {}
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'Нужен messages[]' })
    return
  }

  const body = {
    model: OPENAI_MODEL,
    temperature: typeof temperature === 'number' ? temperature : 0.5,
    messages,
  }

  if (response_format) {
    body.response_format = response_format
  } else if (!OPENAI_MODEL.includes('gemini')) {
    body.response_format = { type: 'json_object' }
  }

  try {
    const upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'https://worksheet.onrender.com',
        'X-Title': 'Worksheet Constructor',
      },
      body: JSON.stringify(body),
    })

    const text = await upstream.text()
    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: 'UPSTREAM_ERROR',
        message: text.slice(0, 500),
      })
      return
    }

    res.type('json').send(text)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка прокси'
    res.status(502).json({ error: 'PROXY_ERROR', message })
  }
})

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    res.sendFile(path.join(dist, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
} else {
  app.get('/', (_req, res) => {
    res
      .status(200)
      .type('text')
      .send('API ok. Соберите фронт: npm run build (папка dist отсутствует).')
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Worksheet server on http://0.0.0.0:${PORT}`)
  console.log(`Model: ${OPENAI_MODEL}; key: ${OPENAI_API_KEY ? 'set' : 'MISSING'}`)
})
