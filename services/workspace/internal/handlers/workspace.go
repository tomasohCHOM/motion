package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
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
	if workspaceReq.OwnerId == "" {
		http.Error(w, "Missing workspace owner ID", http.StatusBadRequest)
		return
	}
	if workspaceReq.Name == "" {
		http.Error(w, "Missing workspace name", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	workspace, err := h.s.CreateWorkspace(ctx, models.CreateWorkspaceParams{
		Name:        workspaceReq.Name,
		Description: pgtype.Text{String: workspaceReq.Description, Valid: true},
	})
	if err != nil {
		http.Error(w, "failed to create workspace", http.StatusInternalServerError)
		return
	}

	err = h.s.AddUser(ctx, models.AddUserToWorkspaceParams{
		WorkspaceID: workspace.ID,
		UserID:      workspaceReq.OwnerId,
		AccessType:  pgtype.Text{String: "owner", Valid: true},
	})
	if err != nil {
		http.Error(w, "failed to add user to workspace", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspace)
}

func (h *WorkspaceHandler) GetWorkspaceById(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}
	workspace, err := h.s.GetUserWorkspace(r.Context(), id)
	if err != nil {
		// TODO: Multiple types of errors can be found here, handle them
		http.Error(w, "workspace not found", http.StatusNotFound)
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
	ctx := r.Context()
	workspaces, err := h.s.ListUserWorkspaces(ctx, userId)
	if err != nil {
		http.Error(w, "failed to list user workspaces", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspaces)
}
