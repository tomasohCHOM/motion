package services

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

var (
	ErrNoteNotFound      = errors.New("note not found")
	ErrInvalidNoteData   = errors.New("invalid note data")
	ErrMissingNoteFields = errors.New("missing required note fields")
)

type NoteServicer interface {
	CreateNote(ctx context.Context, input CreateNoteInput) (models.Note, error)
	GetNote(ctx context.Context, workspaceID, noteID string) (models.Note, error)
	ListNotes(ctx context.Context, workspaceID string) ([]models.Note, error)
	UpdateNote(ctx context.Context, workspaceID, noteID string, input UpdateNoteInput) (models.Note, error)
	DeleteNote(ctx context.Context, workspaceID, noteID string) error
}

type CreateNoteInput struct {
	WorkspaceID string
	AuthorID    string
	Title       string
	Content     string
	Tags        []string
}

type UpdateNoteInput struct {
	Title   *string
	Content *string
	Tags    *[]string
}

type NoteService struct {
	s *store.Store
}

var _ NoteServicer = (*NoteService)(nil)

func NewNoteService(store *store.Store) *NoteService {
	return &NoteService{s: store}
}

func (s *NoteService) CreateNote(ctx context.Context, input CreateNoteInput) (models.Note, error) {
	wsID, err := parseUUID(input.WorkspaceID)
	if err != nil {
		return models.Note{}, ErrInvalidNoteData
	}

	title := strings.TrimSpace(input.Title)
	if title == "" {
		title = "Untitled"
	}

	content := input.Content
	tags := normalizeTags(input.Tags)

	if input.AuthorID == "" {
		return models.Note{}, ErrMissingNoteFields
	}

	note, err := s.s.Queries.CreateNote(ctx, models.CreateNoteParams{
		WorkspaceID: wsID,
		AuthorID: pgtype.Text{
			String: input.AuthorID,
			Valid:  true,
		},
		Title:   title,
		Content: content,
		Tags:    tags,
	})
	if err != nil {
		return models.Note{}, fmt.Errorf("failed to create note: %w", err)
	}

	return note, nil
}

func (s *NoteService) GetNote(ctx context.Context, workspaceID, noteID string) (models.Note, error) {
	wsID, err := parseUUID(workspaceID)
	if err != nil {
		return models.Note{}, ErrInvalidNoteData
	}
	nID, err := parseUUID(noteID)
	if err != nil {
		return models.Note{}, ErrInvalidNoteData
	}

	note, err := s.s.Queries.GetWorkspaceNote(ctx, models.GetWorkspaceNoteParams{
		WorkspaceID: wsID,
		ID:          nID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Note{}, ErrNoteNotFound
		}
		return models.Note{}, fmt.Errorf("failed to get note: %w", err)
	}
	return note, nil
}

func (s *NoteService) ListNotes(ctx context.Context, workspaceID string) ([]models.Note, error) {
	wsID, err := parseUUID(workspaceID)
	if err != nil {
		return nil, ErrInvalidNoteData
	}

	notes, err := s.s.Queries.ListWorkspaceNotes(ctx, wsID)
	if err != nil {
		return nil, fmt.Errorf("failed to list notes: %w", err)
	}
	if notes == nil {
		return make([]models.Note, 0), nil
	}
	return notes, nil
}

func (s *NoteService) UpdateNote(ctx context.Context, workspaceID, noteID string, input UpdateNoteInput) (models.Note, error) {
	current, err := s.GetNote(ctx, workspaceID, noteID)
	if err != nil {
		return models.Note{}, err
	}

	title := current.Title
	if input.Title != nil {
		if trimmed := strings.TrimSpace(*input.Title); trimmed != "" {
			title = trimmed
		}
	}

	content := current.Content
	if input.Content != nil {
		content = *input.Content
	}

	tags := current.Tags
	if input.Tags != nil {
		tags = normalizeTags(*input.Tags)
	}

	updated, err := s.s.Queries.UpdateNote(ctx, models.UpdateNoteParams{
		WorkspaceID: current.WorkspaceID,
		ID:          current.ID,
		Title:       title,
		Content:     content,
		Tags:        tags,
	})
	if err != nil {
		return models.Note{}, fmt.Errorf("failed to update note: %w", err)
	}
	return updated, nil
}

func (s *NoteService) DeleteNote(ctx context.Context, workspaceID, noteID string) error {
	note, err := s.GetNote(ctx, workspaceID, noteID)
	if err != nil {
		return err
	}

	err = s.s.Queries.DeleteNote(ctx, models.DeleteNoteParams{
		WorkspaceID: note.WorkspaceID,
		ID:          note.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}
	return nil
}

func parseUUID(id string) (pgtype.UUID, error) {
	var out pgtype.UUID
	if err := out.Scan(id); err != nil {
		return pgtype.UUID{}, err
	}
	return out, nil
}

func normalizeTags(tags []string) []string {
	if tags == nil {
		return []string{}
	}
	unique := make(map[string]struct{})
	result := make([]string, 0, len(tags))
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}
		lowered := strings.ToLower(tag)
		if _, exists := unique[lowered]; exists {
			continue
		}
		unique[lowered] = struct{}{}
		result = append(result, tag)
	}
	return result
}
