import type { LatLng } from '../types/place'

export type RemoteErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'aborted'

export class RemoteError extends Error {
  readonly kind: RemoteErrorKind
  readonly status?: number
  readonly url?: string

  constructor(
    kind: RemoteErrorKind,
    message: string,
    options: { status?: number; url?: string; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'RemoteError'
    this.kind = kind
    this.status = options.status
    this.url = options.url
  }
}

export interface FetchJsonOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
  timeoutMs?: number
  signal?: AbortSignal
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, timeoutMs = 12000, signal } = options
  const controller = new AbortController()
  const abortFromCaller = () => controller.abort()

  if (signal) {
    if (signal.aborted) throw new RemoteError('aborted', 'تم إلغاء الطلب', { url })
    signal.addEventListener('abort', abortFromCaller, { once: true })
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      referrerPolicy: 'strict-origin-when-cross-origin',
    })

    if (!response.ok) {
      throw new RemoteError('http', `HTTP ${response.status}`, {
        status: response.status,
        url,
      })
    }

    const text = await response.text()
    try {
      return JSON.parse(text) as T
    } catch (error) {
      throw new RemoteError('parse', 'تعذّر تحليل استجابة الخدمة', { url, cause: error })
    }
  } catch (error) {
    if (error instanceof RemoteError) throw error
    if (signal?.aborted) {
      throw new RemoteError('aborted', 'تم إلغاء الطلب', { url, cause: error })
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RemoteError('timeout', 'انتهت مهلة الاتصال بالخدمة', { url, cause: error })
    }
    throw new RemoteError('network', 'تعذّر الاتصال بالخدمة', { url, cause: error })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

export function toLatLng(lat: number, lng: number): LatLng {
  return { lat, lng }
}
