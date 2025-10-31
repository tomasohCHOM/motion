import { queryOptions } from '@tanstack/react-query'
import { apiFetchWithToken } from '../apiClient'

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
}

export async function fetchUser(
  userId: string,
  token: string | null,
): Promise<User> {
  return apiFetchWithToken(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/users/${userId}`,
    token,
  )
}

export function userQueryOptions(userId: string, token: string | null) {
  return queryOptions({
    queryKey: ['user', userId],
    queryFn: async () => {
      return fetchUser(userId, token)
    },
    staleTime: 10_000,
  })
}
