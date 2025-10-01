import { queryOptions, useQuery } from '@tanstack/react-query'

type HealthResponse = {
  service: string
  status: string
}

async function fetchFilesServiceHealth(): Promise<HealthResponse> {
  const res = await fetch('http://localhost:8080/health')
  if (!res.ok) throw new Error('Files page healthcheck failed')
  return res.json()
}

export function filesServiceHealthQueryOptions() {
  return queryOptions({
    queryKey: ['files-service-health'],
    queryFn: fetchFilesServiceHealth,
    staleTime: 10_000,
  })
}

export function useFilesServiceHealth() {
  return useQuery(filesServiceHealthQueryOptions())
}
