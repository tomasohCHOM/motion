import { queryOptions, useQuery } from '@tanstack/react-query'

type HealthResponse = {
  service: string
  status: string
}

async function fetchFilesServiceHealth(): Promise<HealthResponse> {
  const res = await fetch(`${import.meta.env.VITE_FILES_SERVICE_URL}/health`)
  if (!res.ok) {
    throw new Error('Files service healthcheck failed (bad response code)')
  }
  const data: HealthResponse = await res.json()
  if (data.service !== 'file-upload' || data.status !== 'healthy') {
    throw new Error(
      `Files service healthcheck failed: service=${data.service}, status=${data.status}`,
    )
  }
  return data
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
