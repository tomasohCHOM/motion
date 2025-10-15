export type UserWorkspacesResponse = Array<{
  id: string
  name: string
  description: string
  access_type: string
  member_count: number
  created_at: string
  updated_at: string
}>

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
