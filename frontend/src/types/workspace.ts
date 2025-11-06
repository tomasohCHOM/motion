import type { User, WorkspaceUserResponse } from '@/types/user'

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

export type Workspace = {
  id: string
  name: string
  description: string
  createdAt: string
  lastUpdated: string
}

export type UserWorkspace = Workspace & {
  accessType: 'member' | 'owner'
  memberCount: number
}

export type WorkspaceInvite = {
  id: string
  workspaceName: string
  invitedBy: string
  invitedAt: string
}

export type WorkspaceDataResponse = {
  workspace: WorkspaceResponse
  users: Array<WorkspaceUserResponse>
}

export type WorkspaceData = {
  workspace: Workspace
  users: Array<User>
}
