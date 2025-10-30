import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'

type UserRequestData = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
}

export function useCreateUser() {
  const { apiFetch } = useApiClient()

  return useMutation({
    mutationFn: (userReqData: UserRequestData) =>
      apiFetch('http://localhost:8081/users', {
        method: 'POST',
        body: JSON.stringify({
          id: userReqData.id,
          email: userReqData.email,
          first_name: userReqData.firstName,
          last_name: userReqData.lastName,
          username: userReqData.username,
        }),
      }),
  })
}
