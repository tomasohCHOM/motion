package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/middleware"
	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type WorkspaceHandler struct {
	// Store *store.Store
	s services.WorkspaceServicer
}

func NewWorkspaceHandler(service services.WorkspaceServicer) *WorkspaceHandler {
	return &WorkspaceHandler{s: service}
}

type WorkspaceRequestData struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	OwnerId     string `json:"owner_id"`
}

func (h *WorkspaceHandler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	var workspaceReq WorkspaceRequestData
	if err := json.NewDecoder(r.Body).Decode(&workspaceReq); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Single service call with all the business logic
	workspace, err := h.s.CreateWorkspaceWithOwner(
		r.Context(),
		workspaceReq.Name,
		workspaceReq.Description,
		workspaceReq.OwnerId,
	)
	if err != nil {
		// Map domain errors to HTTP status codes
		if errors.Is(err, services.ErrMissingWorkspaceFields) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		log.Printf("Failed to create workspace: %v", err)
		http.Error(w, "failed to create workspace", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspace)
}

func (h *WorkspaceHandler) GetWorkspaceById(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	workspace, err := h.s.GetUserWorkspace(r.Context(), id, userId)
	if err != nil {
		// Map domain errors to HTTP status codes
		if errors.Is(err, services.ErrWorkspaceNotFound) {
			http.Error(w, "workspace not found", http.StatusNotFound)
			return
		}
		if errors.Is(err, services.ErrInvalidWorkspaceData) {
			http.Error(w, "invalid workspace id", http.StatusBadRequest)
			return
		}
		if errors.Is(err, services.ErrInvalidUserData) {
			http.Error(w, "unauthorized to access workspace", http.StatusUnauthorized)
			return
		}
		log.Printf("Failed to fetch workspace %s: %v", id, err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspace)
}

func (h *WorkspaceHandler) ListUserWorkspaces(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("user_id")
	if userId == "" {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	workspaces, err := h.s.ListUserWorkspaces(r.Context(), userId)
	if err != nil {
		// Map domain errors to HTTP status codes
		if errors.Is(err, services.ErrInvalidWorkspaceData) {
			http.Error(w, "invalid user id", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to list workspaces for user %s: %v", userId, err)
		http.Error(w, "failed to list user workspaces", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspaces)
}
