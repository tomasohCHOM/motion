package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

// models.errors
var (
	ErrWorkspaceNotFound      = errors.New("workspace not found")
	ErrInvalidWorkspaceData   = errors.New("invalid workspace data")
	ErrMissingWorkspaceFields = errors.New("missing required workspace fields")
	ErrWorkspaceAccessDenied  = errors.New("workspace access denied")
)

type WorkspaceServicer interface {
	GetUserWorkspace(ctx context.Context, workspaceId string, userId string) (models.WorkspaceWithUsers, error)
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

func (s *WorkspaceService) GetUserWorkspace(ctx context.Context, workspaceId,
	userId string) (models.WorkspaceWithUsers, error) {
	// Business validation
	if workspaceId == "" || userId == "" {
		return models.WorkspaceWithUsers{}, ErrInvalidWorkspaceData
	}

	var wid pgtype.UUID
	if err := wid.Scan(workspaceId); err != nil {
		return models.WorkspaceWithUsers{}, ErrInvalidWorkspaceData
	}

	// Check if user should have access to this workspace
	isMember, err := s.s.Queries.IsWorkspaceUser(ctx, models.IsWorkspaceUserParams{
		UserID:      userId,
		WorkspaceID: wid,
	})
	if err != nil {
		return models.WorkspaceWithUsers{}, fmt.Errorf("failed to check membership: %w", err)
	}
	if !isMember {
		return models.WorkspaceWithUsers{}, ErrWorkspaceAccessDenied
	}

	workspace, err := s.s.Queries.GetWorkspaceById(ctx, wid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.WorkspaceWithUsers{}, ErrWorkspaceNotFound
		}
		return models.WorkspaceWithUsers{}, fmt.Errorf("failed to fetch workspace: %w", err)
	}

	users, err := s.s.Queries.GetWorkspaceUsers(ctx, wid)
	if err != nil {
		return models.WorkspaceWithUsers{}, fmt.Errorf("failed to fetch workspace users: %w", err)
	}

	return models.WorkspaceWithUsers{
		Workspace: workspace,
		Users:     users,
	}, nil
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
	if ownerId == "" || name == "" {
		return models.Workspace{}, ErrMissingWorkspaceFields
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
	// Business validation
	if id == "" {
		return nil, ErrInvalidWorkspaceData
	}

	workspaces, err := s.s.Queries.GetUserWorkspaces(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to list user workspaces: %w", err)
	}
	if workspaces == nil {
		workspaces = make([]models.GetUserWorkspacesRow, 0)
	}
	return workspaces, nil
}
