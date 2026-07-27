const STORAGE_KEY = 'worksheet.openai_api_key'

export function getApiKey(): string {
  const fromEnv = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined)?.trim()
  if (fromEnv) return fromEnv
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

export function setApiKey(key: string) {
  const value = key.trim()
  if (!value) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, value)
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey())
}

export function getApiBaseUrl(): string {
  return (
    (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
    'https://openrouter.ai/api/v1'
  )
}

export function getApiModel(): string {
  return (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || 'google/gemini-2.5-flash'
}
