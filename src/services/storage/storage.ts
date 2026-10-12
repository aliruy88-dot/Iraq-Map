function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = safeStorage()?.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    const storage = safeStorage()
    if (!storage) return false
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    safeStorage()?.removeItem(key)
  } catch {
    // تجاهل أخطاء الوصول إلى التخزين
  }
}
