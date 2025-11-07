package models

type WorkspaceWithUsers struct {
	Workspace Workspace              `json:"workspace"`
	Users     []GetWorkspaceUsersRow `json:"users"`
}
