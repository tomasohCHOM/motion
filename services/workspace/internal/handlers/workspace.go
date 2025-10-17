package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type WorkspaceHandler struct {
	Store *store.Store
}

func NewWorkspaceHandler(store *store.Store) *WorkspaceHandler {
	return &WorkspaceHandler{Store: store}
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
	workspace, err := h.Store.Queries.CreateWorkspace(ctx, models.CreateWorkspaceParams{
		Name:        workspaceReq.Name,
		Description: pgtype.Text{String: workspaceReq.Description, Valid: true},
	})
	if err != nil {
		http.Error(w, "failed to create workspace", http.StatusInternalServerError)
		return
	}

	err = h.Store.Queries.AddUserToWorkspace(ctx, models.AddUserToWorkspaceParams{
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
	pathId := r.PathValue("id")
	if pathId == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}
	var id pgtype.UUID
	if err := id.Scan(pathId); err != nil {
		http.Error(w, "invalid id format", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	workspace, err := h.Store.Queries.GetWorkspaceById(ctx, id)
	if err != nil {
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
	workspaces, err := h.Store.Queries.GetUserWorkspaces(ctx, userId)
	if err != nil {
		http.Error(w, "failed to list user workspaces", http.StatusInternalServerError)
		return
	}
	if workspaces == nil {
		workspaces = make([]models.GetUserWorkspacesRow, 0)
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspaces)
}
