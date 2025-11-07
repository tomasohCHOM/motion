package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type InviteHandler struct {
	s services.InviteServicer
}

func NewInviteHandler(service services.InviteServicer) *InviteHandler {
	return &InviteHandler{s: service}
}

func (h *InviteHandler) CreateUserInvite(w http.ResponseWriter, r *http.Request) {
	workspaceId := r.PathValue("workspaceId")
	if workspaceId == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	type requestBody struct {
		InvitedBy  string `json:"invited_by"`
		AccessType string `json:"access_type,omitempty"`
		Identifier string `json:"identifier"`
	}

	var req requestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.InvitedBy == "" || req.Identifier == "" {
		http.Error(w, "missing required fields", http.StatusBadRequest)
		return
	}

	invite, err := h.s.CreateWorkspaceInviteByIdentifier(r.Context(), workspaceId,
		req.InvitedBy, req.AccessType, req.Identifier,
	)
	if err != nil {
		if errors.Is(err, services.ErrInvalidInviteData) {
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to create invite for workspace %s: %v", workspaceId, err)
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

func (h *InviteHandler) AcceptInvite(w http.ResponseWriter, r *http.Request) {
	inviteId := r.PathValue("invite_id")
	if inviteId == "" {
		http.Error(w, "missing invite id", http.StatusBadRequest)
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

	invite, err := h.s.AcceptWorkspaceInvite(r.Context(), inviteId, req.UserID)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInviteExpired):
			http.Error(w, "invite expired or invalid", http.StatusGone)
			return
		case errors.Is(err, services.ErrInvalidInviteData):
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		default:
			log.Printf("Failed to accept invite id=%s: %v", inviteId, err)
			http.Error(w, "failed to accept invite", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invite)
}

func (h *InviteHandler) DeclineInvite(w http.ResponseWriter, r *http.Request) {
	inviteId := r.PathValue("invite_id")
	if inviteId == "" {
		http.Error(w, "missing invite id", http.StatusBadRequest)
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

	err := h.s.DeclineWorkspaceInvite(r.Context(), inviteId, req.UserID)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidInviteData):
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		default:
			log.Printf("Failed to decline invite id=%s: %v", inviteId, err)
			http.Error(w, "failed to decline invite", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *InviteHandler) DeleteInvite(w http.ResponseWriter, r *http.Request) {
	inviteID := r.PathValue("inviteId")
	if inviteID == "" {
		http.Error(w, "missing invite id", http.StatusBadRequest)
		return
	}

	err := h.s.DeleteWorkspaceInvite(r.Context(), inviteID)
	if err != nil {
		if errors.Is(err, services.ErrInvalidInviteData) {
			http.Error(w, "invalid invite data", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to delete invite %s: %v", inviteID, err)
		http.Error(w, "failed to delete invite", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
