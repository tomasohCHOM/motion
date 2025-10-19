package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type UserHandler struct {
	s services.UserServicer
}

func NewUserHandler(service services.UserServicer) *UserHandler {
	return &UserHandler{s: service}
}

type UserRequestData struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/users/")
	userId := strings.TrimSpace(path)
	if userId == "" {
		userId = r.URL.Query().Get("id")
	}
	if userId == "" {
		http.Error(w, "Missing user ID", http.StatusBadRequest)
		return
	}

	user, err := h.s.GetUser(r.Context(), userId)
	if err != nil {
		// Map domain errors to HTTP status codes
		if errors.Is(err, services.ErrUserNotFound) {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		if errors.Is(err, services.ErrInvalidUserData) {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to fetch user %s: %v", userId, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var u UserRequestData
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.s.CreateUser(r.Context(),
		u.ID,
		u.Email,
		u.FirstName,
		u.LastName,
		u.Username,
	)
	if err != nil {
		// Map domain errors to HTTP status codes
		if errors.Is(err, services.ErrMissingUserFields) {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}
		log.Printf("Failed to create user: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "user created"})
}
