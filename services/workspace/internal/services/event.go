package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

// Event errors
var (
	ErrEventNotFound      = errors.New("event not found")
	ErrInvalidEventData   = errors.New("invalid event data")
	ErrMissingEventFields = errors.New("missing required event fields")
	ErrEventAccessDenied  = errors.New("event access denied")
	ErrInvalidWorkspaceID = errors.New("invalid workspace id")
)

// Color constants for events
var (
	EventColorRed    = "#EF4444"
	EventColorBlue   = "#3B82F6"
	EventColorGreen  = "#10B981"
	EventColorYellow = "#FBBF24"
	EventColorPurple = "#A855F7"
	EventColorPink   = "#EC4899"
)

type EventServicer interface {
	AddEvent(ctx context.Context, workspaceID string, params CreateEventParams) (models.Event, error)
	UpdateEvent(ctx context.Context, eventID string, workspaceID string, params UpdateEventParams) (models.Event, error)
	RemoveEvent(ctx context.Context, eventID string, workspaceID string) error
	GetEvent(ctx context.Context, eventID string, workspaceID string) (models.Event, error)
	GetWorkspaceEvents(ctx context.Context, workspaceID string) ([]models.Event, error)
	GetEventTypeColor(color string) (string, error)
}

type EventService struct {
	s *store.Store
}

// Compile time interface implementation check
var _ EventServicer = (*EventService)(nil)

func NewEventService(store *store.Store) *EventService {
	return &EventService{s: store}
}

type CreateEventParams struct {
	Name           string    `json:"name"`
	Color          string    `json:"color"`
	EventDate      time.Time `json:"event_date"`
	EventTime      time.Time `json:"event_time"`
	DurationMinute int32     `json:"duration_minutes"`
	AttendeesCount int32     `json:"attendees_count"`
}

type UpdateEventParams struct {
	Name           *string    `json:"name"`
	Color          *string    `json:"color"`
	EventDate      *time.Time `json:"event_date"`
	EventTime      *time.Time `json:"event_time"`
	DurationMinute *int32     `json:"duration_minutes"`
	AttendeesCount *int32     `json:"attendees_count"`
}

func (s *EventService) AddEvent(ctx context.Context, workspaceID string, params CreateEventParams) (models.Event, error) {
	// Validate input
	if workspaceID == "" {
		return models.Event{}, ErrInvalidWorkspaceID
	}

	if params.Name == "" {
		return models.Event{}, ErrMissingEventFields
	}

	if params.Color == "" {
		return models.Event{}, ErrMissingEventFields
	}

	if params.DurationMinute <= 0 {
		return models.Event{}, ErrInvalidEventData
	}

	if params.AttendeesCount < 0 {
		return models.Event{}, ErrInvalidEventData
	}

	// Convert workspace ID to UUID
	var wsID pgtype.UUID
	if err := wsID.Scan(workspaceID); err != nil {
		return models.Event{}, ErrInvalidWorkspaceID
	}

	// Verify workspace exists and is accessible
	_, err := s.s.Queries.GetWorkspaceById(ctx, wsID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Event{}, ErrEventNotFound
		}
		return models.Event{}, fmt.Errorf("failed to verify workspace: %w", err)
	}

	// Create event
	event := models.Event{
		ID:             pgtype.UUID{},
		WorkspaceID:    wsID,
		Name:           params.Name,
		Color:          params.Color,
		EventDate:      pgtype.Date{InfinityModifier: pgtype.Infinity},
		EventTime:      pgtype.Time{},
		DurationMinute: params.DurationMinute,
		AttendeesCount: params.AttendeesCount,
		CreatedAt:      pgtype.Timestamptz{},
		UpdatedAt:      pgtype.Timestamptz{},
	}

	// Set event date
	if err := event.EventDate.Scan(params.EventDate); err != nil {
		return models.Event{}, ErrInvalidEventData
	}

	// Set event time
	eventTimeStr := params.EventTime.Format("15:04:05")
	if err := event.EventTime.Scan(eventTimeStr); err != nil {
		return models.Event{}, ErrInvalidEventData
	}

	// Insert into database
	row := s.s.Pool.QueryRow(ctx, `
		INSERT INTO events (workspace_id, name, color, event_date, event_time, duration_minutes, attendees_count)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, workspace_id, name, color, event_date, event_time, duration_minutes, attendees_count, created_at, updated_at
	`, wsID, params.Name, params.Color, params.EventDate, eventTimeStr, params.DurationMinute, params.AttendeesCount)

	if err := row.Scan(
		&event.ID,
		&event.WorkspaceID,
		&event.Name,
		&event.Color,
		&event.EventDate,
		&event.EventTime,
		&event.DurationMinute,
		&event.AttendeesCount,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		return models.Event{}, fmt.Errorf("failed to insert event: %w", err)
	}

	return event, nil
}

func (s *EventService) UpdateEvent(ctx context.Context, eventID string, workspaceID string, params UpdateEventParams) (models.Event, error) {
	// Validate input
	if eventID == "" || workspaceID == "" {
		return models.Event{}, ErrInvalidEventData
	}

	var eID, wsID pgtype.UUID
	if err := eID.Scan(eventID); err != nil {
		return models.Event{}, ErrInvalidEventData
	}
	if err := wsID.Scan(workspaceID); err != nil {
		return models.Event{}, ErrInvalidWorkspaceID
	}

	// Get existing event
	event, err := s.getEventByID(ctx, eID, wsID)
	if err != nil {
		return models.Event{}, err
	}

	// Update fields
	if params.Name != nil {
		if *params.Name == "" {
			return models.Event{}, ErrMissingEventFields
		}
		event.Name = *params.Name
	}

	if params.Color != nil {
		if *params.Color == "" {
			return models.Event{}, ErrMissingEventFields
		}
		event.Color = *params.Color
	}

	if params.EventDate != nil {
		if err := event.EventDate.Scan(*params.EventDate); err != nil {
			return models.Event{}, ErrInvalidEventData
		}
	}

	if params.EventTime != nil {
		eventTimeStr := params.EventTime.Format("15:04:05")
		if err := event.EventTime.Scan(eventTimeStr); err != nil {
			return models.Event{}, ErrInvalidEventData
		}
	}

	if params.DurationMinute != nil {
		if *params.DurationMinute <= 0 {
			return models.Event{}, ErrInvalidEventData
		}
		event.DurationMinute = *params.DurationMinute
	}

	if params.AttendeesCount != nil {
		if *params.AttendeesCount < 0 {
			return models.Event{}, ErrInvalidEventData
		}
		event.AttendeesCount = *params.AttendeesCount
	}

	// Update in database
	row := s.s.Pool.QueryRow(ctx, `
		UPDATE events
		SET name = $1, color = $2, event_date = $3, event_time = $4, duration_minutes = $5, attendees_count = $6, updated_at = NOW()
		WHERE id = $7 AND workspace_id = $8
		RETURNING id, workspace_id, name, color, event_date, event_time, duration_minutes, attendees_count, created_at, updated_at
	`, event.Name, event.Color, event.EventDate, event.EventTime, event.DurationMinute, event.AttendeesCount, eID, wsID)

	var updatedEvent models.Event
	if err := row.Scan(
		&updatedEvent.ID,
		&updatedEvent.WorkspaceID,
		&updatedEvent.Name,
		&updatedEvent.Color,
		&updatedEvent.EventDate,
		&updatedEvent.EventTime,
		&updatedEvent.DurationMinute,
		&updatedEvent.AttendeesCount,
		&updatedEvent.CreatedAt,
		&updatedEvent.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Event{}, ErrEventNotFound
		}
		return models.Event{}, fmt.Errorf("failed to update event: %w", err)
	}

	return updatedEvent, nil
}

func (s *EventService) RemoveEvent(ctx context.Context, eventID string, workspaceID string) error {
	// Validate input
	if eventID == "" || workspaceID == "" {
		return ErrInvalidEventData
	}

	var eID, wsID pgtype.UUID
	if err := eID.Scan(eventID); err != nil {
		return ErrInvalidEventData
	}
	if err := wsID.Scan(workspaceID); err != nil {
		return ErrInvalidWorkspaceID
	}

	// Verify event exists and belongs to workspace
	_, err := s.getEventByID(ctx, eID, wsID)
	if err != nil {
		return err
	}

	// Delete event
	commandTag, err := s.s.Pool.Exec(ctx, `
		DELETE FROM events WHERE id = $1 AND workspace_id = $2
	`, eID, wsID)

	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return ErrEventNotFound
	}

	return nil
}

func (s *EventService) GetEvent(ctx context.Context, eventID string, workspaceID string) (models.Event, error) {
	var eID, wsID pgtype.UUID
	if err := eID.Scan(eventID); err != nil {
		return models.Event{}, ErrInvalidEventData
	}
	if err := wsID.Scan(workspaceID); err != nil {
		return models.Event{}, ErrInvalidWorkspaceID
	}

	return s.getEventByID(ctx, eID, wsID)
}

func (s *EventService) GetWorkspaceEvents(ctx context.Context, workspaceID string) ([]models.Event, error) {
	var wsID pgtype.UUID
	if err := wsID.Scan(workspaceID); err != nil {
		return nil, ErrInvalidWorkspaceID
	}

	rows, err := s.s.Pool.Query(ctx, `
		SELECT id, workspace_id, name, color, event_date, event_time, duration_minutes, attendees_count, created_at, updated_at
		FROM events
		WHERE workspace_id = $1
		ORDER BY event_date ASC, event_time ASC
	`, wsID)

	if err != nil {
		return nil, fmt.Errorf("failed to fetch events: %w", err)
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var event models.Event
		if err := rows.Scan(
			&event.ID,
			&event.WorkspaceID,
			&event.Name,
			&event.Color,
			&event.EventDate,
			&event.EventTime,
			&event.DurationMinute,
			&event.AttendeesCount,
			&event.CreatedAt,
			&event.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, event)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating events: %w", err)
	}

	return events, nil
}

// GetEventTypeColor returns the hex color code for the given color type
func (s *EventService) GetEventTypeColor(color string) (string, error) {
	switch color {
	case "red":
		return EventColorRed, nil
	case "blue":
		return EventColorBlue, nil
	case "green":
		return EventColorGreen, nil
	case "yellow":
		return EventColorYellow, nil
	case "purple":
		return EventColorPurple, nil
	case "pink":
		return EventColorPink, nil
	default:
		return "", fmt.Errorf("unknown color type: %s", color)
	}
}

func (s *EventService) getEventByID(ctx context.Context, eventID, workspaceID pgtype.UUID) (models.Event, error) {
	row := s.s.Pool.QueryRow(ctx, `
		SELECT id, workspace_id, name, color, event_date, event_time, duration_minutes, attendees_count, created_at, updated_at
		FROM events
		WHERE id = $1 AND workspace_id = $2
	`, eventID, workspaceID)

	var event models.Event
	if err := row.Scan(
		&event.ID,
		&event.WorkspaceID,
		&event.Name,
		&event.Color,
		&event.EventDate,
		&event.EventTime,
		&event.DurationMinute,
		&event.AttendeesCount,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Event{}, ErrEventNotFound
		}
		return models.Event{}, fmt.Errorf("failed to fetch event: %w", err)
	}

	return event, nil
}
