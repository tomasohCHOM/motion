export type WorkspaceResponse = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type UserWorkspacesResponse = Array<
  WorkspaceResponse & {
    access_type: string
    member_count: number
  }
>

export type UserWorkspace = {
  id: string
  name: string
  description: string
  accessType: 'member' | 'owner'
  memberCount: number
  createdAt: string
  lastUpdated: string
}

export type WorkspaceInvite = {
  id: string
  workspaceName: string
  invitedBy: string
  invitedAt: string
}
