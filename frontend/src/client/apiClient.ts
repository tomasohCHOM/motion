import { useAuth } from '@clerk/clerk-react'

export async function apiFetchWithToken<T>(
  input: RequestInfo | URL,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init?.headers)
        ? Object.fromEntries(init.headers)
        : (init?.headers ?? {})),
  }

  if (import.meta.env.VITE_ENV === 'production') {
    if (!token) throw new Error('No auth token provided')
    headers['Authorization'] = `Bearer ${token}`
  } else {
    // In E2E mode, use dynamic userId from localStorage if available
    const isE2EMode = import.meta.env.VITE_E2E_MODE === 'true'
    const e2eUserId =
      typeof window !== 'undefined' && isE2EMode
        ? localStorage.getItem('e2e-user-id')
        : null
    const devUserId =
      e2eUserId || import.meta.env.VITE_DEV_USER_ID || 'user_dev_default'
    headers['X-Dev-UserID'] = devUserId
  }

  const res = await fetch(input, {
    ...init,
    headers,
  })
  const bodyText = await res.text()

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} - ${bodyText}`)
  }

  if (!bodyText) {
    return undefined as T
  }

  try {
    return JSON.parse(bodyText) as T
  } catch {
    return bodyText as T
  }
}

export function useApiClient() {
  const { getToken } = useAuth()

  async function apiFetch<T>(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<T> {
    const token = await getToken({ template: 'backend' })
    if (!token) throw new Error('No auth token found')
    return apiFetchWithToken<T>(input, token, init)
  }

  return { apiFetch }
}
