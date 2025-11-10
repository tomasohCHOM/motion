package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/tomasohchom/motion/services/events/internal/models"
	"github.com/tomasohchom/motion/services/events/internal/notify"
	"github.com/tomasohchom/motion/services/events/internal/store"
)

type Handlers struct {
	store              *store.Store
	notifier           *notify.Notifier
	allowedCreateRoles map[string]struct{}
}

func New(s *store.Store, notifier *notify.Notifier, createRoles []string) *Handlers {
	rolesMap := make(map[string]struct{}, len(createRoles))
	for _, r := range createRoles {
		rolesMap[r] = struct{}{}
	}
	return &Handlers{store: s, notifier: notifier, allowedCreateRoles: rolesMap}
}

// POST /projects/{projectId}/events
func (h *Handlers) CreateEvent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectId := chi.URLParam(r, "projectId")
	userId := r.Header.Get("X-User-Id")
	userRolesHeader := r.Header.Get("X-User-Roles")
	userRoles := parseRolesHeader(userRolesHeader)

	// permission check: user must have any role in allowedCreateRoles
	if !h.canCreate(userRoles) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	var payload struct {
		Name        string    `json:"name"`
		Description string    `json:"description"`
		StartAt     time.Time `json:"start_at"`
		EndAt       time.Time `json:"end_at"`
		RolesView   []string  `json:"roles_view"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if payload.Name == "" {
		http.Error(w, "name required", http.StatusBadRequest)
		return
	}
	if payload.EndAt.Before(payload.StartAt) {
		http.Error(w, "end_at must be after start_at", http.StatusBadRequest)
		return
	}

	ev := &models.Event{
		ProjectID:   projectId,
		Name:        payload.Name,
		Description: payload.Description,
		StartAt:     payload.StartAt,
		EndAt:       payload.EndAt,
		RolesView:   payload.RolesView,
		CreatedBy:   userId,
	}
	if err := h.store.CreateEvent(ctx, ev); err != nil {
		log.Printf("failed to create event: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	// notify
	go func() {
		_ = h.notifier.NotifyEventCreated(context.Background(), projectId, ev.ID, map[string]interface{}{"name": ev.Name, "created_by": ev.CreatedBy})
	}()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ev)
}

func (h *Handlers) ListEvents(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectId := chi.URLParam(r, "projectId")
	userRolesHeader := r.Header.Get("X-User-Roles")
	userRoles := parseRolesHeader(userRolesHeader)

	events, err := h.store.ListEventsForRoles(ctx, projectId, userRoles)
	if err != nil {
		log.Printf("list events: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func parseRolesHeader(h string) []string {
	if h == "" {
		return nil
	}
	parts := strings.Split(h, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		pp := strings.TrimSpace(p)
		if pp != "" {
			out = append(out, pp)
		}
	}
	return out
}

func (h *Handlers) canCreate(roles []string) bool {
	for _, r := range roles {
		if _, ok := h.allowedCreateRoles[r]; ok {
			return true
		}
	}
	return false
}
