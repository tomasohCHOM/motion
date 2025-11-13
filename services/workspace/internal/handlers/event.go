package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/middleware"
	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type EventHandler struct {
	s services.EventServicer
}

func NewEventHandler(service services.EventServicer) *EventHandler {
	return &EventHandler{s: service}
}

type EventRequestData struct {
	Name           string `json:"name"`
	Color          string `json:"color"`
	EventDate      string `json:"event_date"` // ISO 8601 format: YYYY-MM-DD
	EventTime      string `json:"event_time"` // HH:MM:SS format
	DurationMinute int32  `json:"duration_minutes"`
	AttendeesCount int32  `json:"attendees_count"`
}

type UpdateEventRequestData struct {
	Name           *string `json:"name"`
	Color          *string `json:"color"`
	EventDate      *string `json:"event_date"` // ISO 8601 format: YYYY-MM-DD
	EventTime      *string `json:"event_time"` // HH:MM:SS format
	DurationMinute *int32  `json:"duration_minutes"`
	AttendeesCount *int32  `json:"attendees_count"`
}

func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.PathValue("workspace_id")
	if workspaceID == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	var eventReq EventRequestData
	if err := json.NewDecoder(r.Body).Decode(&eventReq); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Parse event date and time
	eventDate, err := parseDate(eventReq.EventDate)
	if err != nil {
		http.Error(w, "invalid event_date format (use YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	eventTime, err := parseTime(eventReq.EventTime)
	if err != nil {
		http.Error(w, "invalid event_time format (use HH:MM:SS)", http.StatusBadRequest)
		return
	}

	params := services.CreateEventParams{
		Name:           eventReq.Name,
		Color:          eventReq.Color,
		EventDate:      eventDate,
		EventTime:      eventTime,
		DurationMinute: eventReq.DurationMinute,
		AttendeesCount: eventReq.AttendeesCount,
	}

	event, err := h.s.AddEvent(r.Context(), workspaceID, params)
	if err != nil {
		if errors.Is(err, services.ErrMissingEventFields) || errors.Is(err, services.ErrInvalidEventData) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, services.ErrInvalidWorkspaceID) {
			http.Error(w, "invalid workspace id", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to create event: %v", err)
		http.Error(w, "failed to create event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.PathValue("workspace_id")
	eventID := r.PathValue("event_id")

	if workspaceID == "" || eventID == "" {
		http.Error(w, "missing workspace id or event id", http.StatusBadRequest)
		return
	}

	var updateReq UpdateEventRequestData
	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	params := services.UpdateEventParams{
		Name:           updateReq.Name,
		Color:          updateReq.Color,
		DurationMinute: updateReq.DurationMinute,
		AttendeesCount: updateReq.AttendeesCount,
	}

	// Parse optional date
	if updateReq.EventDate != nil {
		eventDate, err := parseDate(*updateReq.EventDate)
		if err != nil {
			http.Error(w, "invalid event_date format (use YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
		params.EventDate = &eventDate
	}

	// Parse optional time
	if updateReq.EventTime != nil {
		eventTime, err := parseTime(*updateReq.EventTime)
		if err != nil {
			http.Error(w, "invalid event_time format (use HH:MM:SS)", http.StatusBadRequest)
			return
		}
		params.EventTime = &eventTime
	}

	event, err := h.s.UpdateEvent(r.Context(), eventID, workspaceID, params)
	if err != nil {
		if errors.Is(err, services.ErrMissingEventFields) || errors.Is(err, services.ErrInvalidEventData) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, services.ErrEventNotFound) {
			http.Error(w, "event not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to update event: %v", err)
		http.Error(w, "failed to update event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.PathValue("workspace_id")
	eventID := r.PathValue("event_id")

	if workspaceID == "" || eventID == "" {
		http.Error(w, "missing workspace id or event id", http.StatusBadRequest)
		return
	}

	err := h.s.RemoveEvent(r.Context(), eventID, workspaceID)
	if err != nil {
		if errors.Is(err, services.ErrEventNotFound) {
			http.Error(w, "event not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to delete event: %v", err)
		http.Error(w, "failed to delete event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *EventHandler) GetEvent(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.PathValue("workspace_id")
	eventID := r.PathValue("event_id")

	if workspaceID == "" || eventID == "" {
		http.Error(w, "missing workspace id or event id", http.StatusBadRequest)
		return
	}

	event, err := h.s.GetEvent(r.Context(), eventID, workspaceID)
	if err != nil {
		if errors.Is(err, services.ErrEventNotFound) {
			http.Error(w, "event not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to fetch event: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func (h *EventHandler) ListWorkspaceEvents(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceID := r.PathValue("workspace_id")
	if workspaceID == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	events, err := h.s.GetWorkspaceEvents(r.Context(), workspaceID)
	if err != nil {
		log.Printf("Failed to fetch events: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if events == nil {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode([]struct{}{})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(events)
}

func (h *EventHandler) GetEventColor(w http.ResponseWriter, r *http.Request) {
	colorType := r.URL.Query().Get("type")
	if colorType == "" {
		http.Error(w, "missing color type query parameter", http.StatusBadRequest)
		return
	}

	color, err := h.s.GetEventTypeColor(colorType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"color": color})
}
