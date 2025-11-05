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

export type WorkspaceInvitesResponse = Array<{
  id: string
  workspace_id: string
  workspace_name: string
  invited_by: string
  invitee_id: string
  invitee_email: string
  access_type: string
  token: string
  status: string
  created_at: string
  expires_at: string
}>

export type WorkspaceInvite = {
  id: string
  workspaceName: string
  invitedBy: string
  invitedAt: string
}
