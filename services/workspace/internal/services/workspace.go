package services

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type WorkspaceServicer interface {
	GetUserWorkspace(ctx context.Context, id string) (models.Workspace, error)
	CreateWorkspace(ctx context.Context, params models.CreateWorkspaceParams) (models.Workspace, error)
	CreateWorkspaceWithOwner(ctx context.Context, name string, description string, ownerId string) (models.Workspace, error)
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

func (s *WorkspaceService) CreateWorkspaceWithOwner(ctx context.Context,
	name string, description string, ownerId string) (models.Workspace, error) {

	// Business validation
	if ownerId == "" {
		return models.Workspace{}, fmt.Errorf("owner ID is required")
	}
	if name == "" {
		return models.Workspace{}, fmt.Errorf("workspace name is required")
	}

	// Start transaction
	tx, err := s.s.Pool.Begin(ctx)
	if err != nil {
		return models.Workspace{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) // Rollback if not committed

	// Create workspace
	queries := s.s.Queries.WithTx(tx)
	workspace, err := queries.CreateWorkspace(ctx, models.CreateWorkspaceParams{
		Name:        name,
		Description: pgtype.Text{String: description, Valid: true},
	})
	if err != nil {
		return models.Workspace{}, fmt.Errorf("failed to create workspace: %w", err)
	}

	// Add owner to workspace
	err = queries.AddUserToWorkspace(ctx, models.AddUserToWorkspaceParams{
		WorkspaceID: workspace.ID,
		UserID:      ownerId,
		AccessType:  pgtype.Text{String: "owner", Valid: true},
	})
	if err != nil {
		return models.Workspace{}, fmt.Errorf("failed to add owner to workspace: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return models.Workspace{}, fmt.Errorf("failed to commit transaction: %w", err)
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
