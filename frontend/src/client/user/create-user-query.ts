import { useMutation } from '@tanstack/react-query'

type UserRequestData = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
}

async function createUser(userReqData: UserRequestData) {
  const res = await fetch('http://localhost:8081/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: userReqData.id,
      email: userReqData.email,
      first_name: userReqData.firstName,
      last_name: userReqData.lastName,
      username: userReqData.username,
    }),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (userReqData: UserRequestData) => createUser(userReqData),
  })
}
