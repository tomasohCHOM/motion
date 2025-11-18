package models

import "github.com/jackc/pgx/v5/pgtype"

type Event struct {
	ID             pgtype.UUID        `json:"id"`
	WorkspaceID    pgtype.UUID        `json:"workspace_id"`
	Name           string             `json:"name"`
	Color          string             `json:"color"`
	EventDate      pgtype.Date        `json:"event_date"`
	EventTime      pgtype.Time        `json:"event_time"`
	DurationMinute int32              `json:"duration_minutes"`
	AttendeesCount int32              `json:"attendees_count"`
	CreatedAt      pgtype.Timestamptz `json:"created_at"`
	UpdatedAt      pgtype.Timestamptz `json:"updated_at"`
}
