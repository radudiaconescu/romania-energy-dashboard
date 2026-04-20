export class ApiError extends Error {
  status?: number
  retryable: boolean
  constructor(message: string, status?: number, retryable = true) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryable = retryable
  }
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}: ${res.statusText}`, res.status)
  }
  return res.text()
}
