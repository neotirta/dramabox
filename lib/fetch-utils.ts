const cache = new Map<string, { data: any; timestamp: number }>()

interface FetchOptions {
  maxRetries?: number
  retryDelay?: number
  cacheTTL?: number
  timeout?: number
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<any> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    cacheTTL = 0,
    timeout = 10000
  } = options

  const cacheKey = url
  if (cacheTTL > 0) {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (cacheTTL > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() })
      }

      return data
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
    }
  }
}

export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}
