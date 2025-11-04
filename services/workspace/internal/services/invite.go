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

// Domain errors
var (
	ErrInviteNotFound    = errors.New("invite not found")
	ErrInviteExpired     = errors.New("invite expired or invalid")
	ErrInviteAlreadyUsed = errors.New("invite already accepted or declined")
	ErrInvalidInviteData = errors.New("invalid invite data")
)

type InviteServicer interface {
	CreateWorkspaceInvite(ctx context.Context, params models.CreateWorkspaceInviteParams) (models.WorkspaceInvite, error)
	ListUserInvites(ctx context.Context, userID string) ([]models.WorkspaceInvite, error)
	AcceptWorkspaceInvite(ctx context.Context, token string, userID string) (models.WorkspaceInvite, error)
	DeclineWorkspaceInvite(ctx context.Context, token string, userId string) error
	DeleteWorkspaceInvite(ctx context.Context, id pgtype.UUID) error
}

type InviteService struct {
	s *store.Store
}

// Compile time interface implementation check
var _ InviteServicer = (*InviteService)(nil)

func NewInviteService(store *store.Store) *InviteService {
	return &InviteService{s: store}
}

func (s *InviteService) CreateWorkspaceInvite(ctx context.Context, params models.CreateWorkspaceInviteParams) (models.WorkspaceInvite, error) {
	if !params.WorkspaceID.Valid || params.WorkspaceName == "" || params.InvitedBy == "" || params.InviteeEmail == "" {
		return models.WorkspaceInvite{}, ErrInvalidInviteData
	}

	invite, err := s.s.Queries.CreateWorkspaceInvite(ctx, params)
	if err != nil {
		return models.WorkspaceInvite{}, fmt.Errorf("failed to create invite: %w", err)
	}
	return invite, nil
}

func (s *InviteService) ListUserInvites(ctx context.Context, userID string) ([]models.WorkspaceInvite, error) {
	if userID == "" {
		return nil, ErrInvalidInviteData
	}

	invites, err := s.s.Queries.ListInvitesForUser(ctx, models.ListInvitesForUserParams{
		InviteeID: userID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list invites: %w", err)
	}

	if invites == nil {
		invites = make([]models.WorkspaceInvite, 0)
	}
	return invites, nil
}

func (s *InviteService) AcceptWorkspaceInvite(ctx context.Context, token string, userID string) (models.WorkspaceInvite, error) {
	if token == "" || userID == "" {
		return models.WorkspaceInvite{}, ErrInvalidInviteData
	}

	tx, err := s.s.Pool.Begin(ctx)
	if err != nil {
		return models.WorkspaceInvite{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := s.s.Queries.WithTx(tx)

	invite, err := qtx.AcceptWorkspaceInvite(ctx, models.AcceptWorkspaceInviteParams{
		Token:     token,
		InviteeID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.WorkspaceInvite{}, ErrInviteExpired
		}
		return models.WorkspaceInvite{}, fmt.Errorf("failed to accept invite: %w", err)
	}

	// Add the user to the workspace
	err = qtx.AddUserToWorkspace(ctx, models.AddUserToWorkspaceParams{
		UserID:      userID,
		WorkspaceID: invite.WorkspaceID,
		AccessType:  invite.AccessType,
	})
	if err != nil {
		return models.WorkspaceInvite{}, fmt.Errorf("failed to add user to workspace: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return models.WorkspaceInvite{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return invite, nil
}

func (s *InviteService) DeclineWorkspaceInvite(ctx context.Context, token string, userID string) error {
	invite, err := s.s.Queries.GetInviteByToken(ctx, token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrInviteNotFound
		}
		return fmt.Errorf("failed to fetch invite: %w", err)
	}

	if invite.InviteeID == "" || invite.InviteeID != userID {
		return ErrInvalidInviteData
	}

	return s.s.Queries.DeleteWorkspaceInvite(ctx, invite.ID)
}

func (s *InviteService) DeleteWorkspaceInvite(ctx context.Context, id pgtype.UUID) error {
	if !id.Valid {
		return ErrInvalidInviteData
	}

	err := s.s.Queries.DeleteWorkspaceInvite(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete invite: %w", err)
	}
	return nil
}
