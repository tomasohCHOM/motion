package store

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomasohchom/motion/services/events/internal/models"
)

type Store struct {
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

func (s *Store) Init(ctx context.Context) error {
	// create table if not exists
	sql := `CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        start_at TIMESTAMP WITH TIME ZONE NOT NULL,
        end_at TIMESTAMP WITH TIME ZONE NOT NULL,
        roles_view JSONB NOT NULL,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`
	_, err := s.db.Exec(ctx, sql)
	return err
}

func (s *Store) CreateEvent(ctx context.Context, e *models.Event) error {
	rolesJSON, _ := json.Marshal(e.RolesView)
	row := s.db.QueryRow(ctx, `INSERT INTO events (project_id, name, description, start_at, end_at, roles_view, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`, e.ProjectID, e.Name, e.Description, e.StartAt, e.EndAt, rolesJSON, e.CreatedBy)
	if err := row.Scan(&e.ID, &e.CreatedAt); err != nil {
		return fmt.Errorf("insert event: %w", err)
	}
	return nil
}

func (s *Store) ListEventsForRoles(ctx context.Context, projectID string, roles []string) ([]models.Event, error) {
	// we select events where roles_view && roles (overlap)
	// Postgres: roles_view is JSONB array; we'll compare by converting roles to JSONB and using && operator on array? Simpler: check any role contained via `roles_view \?` operator in a WHERE clause OR use jsonb_path_exists. For portability, we'll fetch and filter in app.
	rows, err := s.db.Query(ctx, `SELECT id, project_id, name, description, start_at, end_at, roles_view, created_by, created_at FROM events WHERE project_id=$1`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Event
	for rows.Next() {
		var ev models.Event
		var rolesRaw []byte
		if err := rows.Scan(&ev.ID, &ev.ProjectID, &ev.Name, &ev.Description, &ev.StartAt, &ev.EndAt, &rolesRaw, &ev.CreatedBy, &ev.CreatedAt); err != nil {
			return nil, err
		}
		var evRoles []string
		if err := json.Unmarshal(rolesRaw, &evRoles); err == nil {
			ev.RolesView = evRoles
		}
		// allow if any of the requested roles is in the event's roles
		if hasRoleOverlap(evRoles, roles) {
			out = append(out, ev)
		}
	}
	return out, nil
}

func hasRoleOverlap(a, b []string) bool {
	set := make(map[string]struct{}, len(a))
	for _, x := range a {
		set[x] = struct{}{}
	}
	for _, y := range b {
		if _, ok := set[y]; ok {
			return true
		}
	}
	return false
}
