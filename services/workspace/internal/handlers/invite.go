package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type InviteHandler struct {
	s services.InviteServicer
}

func NewInviteHandler(service services.InviteServicer) *InviteHandler {
	return &InviteHandler{s: service}
}

func (h *InviteHandler) CreateUserInvite(w http.ResponseWriter, r *http.Request) {
	workspaceIDStr := r.PathValue("workspaceId")
	if workspaceIDStr == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	var workspaceID pgtype.UUID
	if err := workspaceID.Scan(workspaceIDStr); err != nil {
		http.Error(w, "invalid workspace id", http.StatusBadRequest)
		return
	}

	type requestBody struct {
		WorkspaceName string `json:"workspace_name"`
		InviteeEmail  string `json:"invitee_email"`
		InviteeUserID string `json:"invitee_user_id,omitempty"`
		AccessType    string `json:"access_type,omitempty"`
		InvitedBy     string `json:"invited_by"`
	}

	var req requestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.InvitedBy == "" || req.InviteeEmail == "" {
		http.Error(w, "missing required fields", http.StatusBadRequest)
		return
	}

	params := models.CreateWorkspaceInviteParams{
		WorkspaceID:  workspaceID,
		InvitedBy:    req.InvitedBy,
		InviteeEmail: req.InviteeEmail,
		InviteeID:    req.InviteeUserID,
		Token:        uuid.NewString(),
	}

	invite, err := h.s.CreateWorkspaceInvite(r.Context(), params)
	if err != nil {
		if errors.Is(err, services.ErrInvalidInviteData) {
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to create invite for workspace %s: %v", workspaceIDStr, err)
		http.Error(w, "failed to create invite", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invite)
}

func (h *InviteHandler) ListUserInvites(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("user_id")
	if userId == "" {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	invites, err := h.s.ListUserInvites(r.Context(), userId)
	if err != nil {
		if errors.Is(err, services.ErrInvalidInviteData) {
			http.Error(w, "invalid user id", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to list invites for user %s: %v", userId, err)
		http.Error(w, "failed to list user invites", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invites)
}

// /invites/:inviteId/accept
func (h *InviteHandler) AcceptInvite(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	if token == "" {
		http.Error(w, "missing invite token", http.StatusBadRequest)
		return
	}

	type requestBody struct {
		UserID string `json:"user_id"`
	}
	var req requestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.UserID == "" {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	invite, err := h.s.AcceptWorkspaceInvite(r.Context(), token, req.UserID)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInviteExpired):
			http.Error(w, "invite expired or invalid", http.StatusGone)
			return
		case errors.Is(err, services.ErrInvalidInviteData):
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		default:
			log.Printf("Failed to accept invite token=%s: %v", token, err)
			http.Error(w, "failed to accept invite", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invite)
}

func (h *InviteHandler) DeclineInvite(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	if token == "" {
		http.Error(w, "missing invite token", http.StatusBadRequest)
		return
	}

	type requestBody struct {
		UserID string `json:"user_id"`
	}
	var req requestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.UserID == "" {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	err := h.s.DeclineWorkspaceInvite(r.Context(), token, req.UserID)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidInviteData):
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		default:
			log.Printf("Failed to decline invite token=%s: %v", token, err)
			http.Error(w, "failed to decline invite", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *InviteHandler) DeleteInvite(w http.ResponseWriter, r *http.Request) {
	inviteIDStr := r.PathValue("inviteId")
	if inviteIDStr == "" {
		http.Error(w, "missing invite id", http.StatusBadRequest)
		return
	}

	var inviteID pgtype.UUID
	if err := inviteID.Scan(inviteIDStr); err != nil {
		http.Error(w, "invalid invite id", http.StatusBadRequest)
		return
	}

	err := h.s.DeleteWorkspaceInvite(r.Context(), inviteID)
	if err != nil {
		if errors.Is(err, services.ErrInvalidInviteData) {
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to delete invite %s: %v", inviteIDStr, err)
		http.Error(w, "failed to delete invite", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
