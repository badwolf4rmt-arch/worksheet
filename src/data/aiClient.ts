import { getApiBaseUrl, getApiKey, getApiModel } from './apiKey'

export class AiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiError'
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenced?.[1]) return JSON.parse(fenced[1].trim())
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1))
    throw new AiError('Модель вернула невалидный JSON')
  }
}

export async function chatJson<T>(
  system: string,
  user: string,
  options?: { temperature?: number },
): Promise<T> {
  const key = getApiKey()
  if (!key) throw new AiError('Добавьте API-ключ в .env или в настройках')

  const model = getApiModel()
  const body: Record<string, unknown> = {
    model,
    temperature: options?.temperature ?? 0.5,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  }

  // OpenAI / часть OpenRouter-моделей; Gemini часто игнорирует, но не ломается
  if (!model.includes('gemini')) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(`${getApiBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
      'X-Title': 'Worksheet Constructor',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new AiError(`Ошибка API ${res.status}: ${text.slice(0, 280)}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new AiError('Пустой ответ модели')

  return extractJson(content) as T
}
