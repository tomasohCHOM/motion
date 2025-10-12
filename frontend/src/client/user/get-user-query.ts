import { queryOptions, useQuery } from '@tanstack/react-query'

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
}

async function fetchUser(userId: string): Promise<User> {
  const res = await fetch(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/users/${userId}`,
  )
  if (res.status === 404) {
    throw new Error('USER_NOT_FOUND')
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`)
  }
  return res.json()
}

export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 10_000,
  })
}

export function useUserQuery(userId: string) {
  return useQuery(userQueryOptions(userId))
}
