export type UserResponse = {
  id: string
  email: string
  first_name: string
  last_name: string
  username: string
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  username: string
  createdAt: string
}

export type WorkspaceUserResponse = UserResponse & { access_type: string }

export type WorkspaceUser = User & { accessType: string }
