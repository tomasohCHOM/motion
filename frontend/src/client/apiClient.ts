import { useAuth } from '@clerk/clerk-react'

export async function apiFetchWithToken<T>(
  input: RequestInfo | URL,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  if (!token) throw new Error('No auth token provided')

  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Request failed: ${res.status} - ${msg}`)
  }

  return res.json() as Promise<T>
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
