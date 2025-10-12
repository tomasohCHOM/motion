package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type UserHandler struct {
	Store *store.Store
}

func NewUserHandler(store *store.Store) *UserHandler {
	return &UserHandler{Store: store}
}

type UserRequestData struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var u UserRequestData
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if u.ID == "" || u.Email == "" || u.FirstName == "" || u.LastName == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}
	_, err := h.Store.Queries.CreateUser(r.Context(), models.CreateUserParams{
		ID:        u.ID,
		Email:     u.Email,
		FirstName: u.FirstName,
		LastName:  u.LastName,
	})
	fmt.Println(err)
	if err != nil {
		http.Error(w, "Failed to sync user", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "user created"})
}
