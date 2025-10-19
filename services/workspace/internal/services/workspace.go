package services

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type WorkspaceServicer interface {
	GetUserWorkspace(ctx context.Context, id string) (models.Workspace, error)
	CreateWorkspace(ctx context.Context, params models.CreateWorkspaceParams) (models.Workspace, error)
	ListUserWorkspaces(ctx context.Context, id string) ([]models.GetUserWorkspacesRow, error)
	AddUser(ctx context.Context, params models.AddUserToWorkspaceParams) error
}

type WorkspaceService struct {
	s *store.Store
}

// Compile time interface implementation check
var _ WorkspaceServicer = (*WorkspaceService)(nil)

func NewWorkspaceService(store *store.Store) *WorkspaceService {
	return &WorkspaceService{s: store}
}

func (s *WorkspaceService) GetUserWorkspace(ctx context.Context, id string) (models.Workspace, error) {
	var uuid pgtype.UUID
	if err := uuid.Scan(id); err != nil {
		return models.Workspace{}, err
	}

	workspace, err := s.s.Queries.GetWorkspaceById(ctx, uuid)
	if err != nil {
		return models.Workspace{}, err
	}
	return workspace, nil
}

func (s *WorkspaceService) CreateWorkspace(ctx context.Context,
	params models.CreateWorkspaceParams) (models.Workspace, error) {
	workspace, err := s.s.Queries.CreateWorkspace(ctx, params)
	if err != nil {
		return models.Workspace{}, err
	}

	return workspace, nil
}

func (s *WorkspaceService) AddUser(ctx context.Context, params models.AddUserToWorkspaceParams) error {
	return s.s.Queries.AddUserToWorkspace(ctx, params)

}

func (s *WorkspaceService) ListUserWorkspaces(ctx context.Context,
	id string) ([]models.GetUserWorkspacesRow, error) {
	workspaces, err := s.s.Queries.GetUserWorkspaces(ctx, id)
	if err != nil {
		return []models.GetUserWorkspacesRow{}, nil
	}
	if workspaces == nil {
		workspaces = make([]models.GetUserWorkspacesRow, 0)
	}
	return workspaces, nil

}
