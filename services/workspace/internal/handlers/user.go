package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/services"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type UserHandler struct {
	Store *store.Store
	s     *services.UserService
}

func NewUserHandler(store *store.Store) *UserHandler {
	return &UserHandler{Store: store}
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
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "User not found", http.StatusNotFound)
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
	if u.ID == "" || u.Email == "" || u.FirstName == "" || u.LastName == "" || u.Username == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}
	_, err := h.Store.Queries.CreateUser(r.Context(), models.CreateUserParams{
		ID:        u.ID,
		Email:     u.Email,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Username:  u.Username,
	})
	fmt.Println(err)
	if err != nil {
		http.Error(w, "Failed to sync user", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "user created"})
}
