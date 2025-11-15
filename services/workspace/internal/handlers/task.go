package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/tomasohchom/motion/services/workspace/internal/middleware"
	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type TaskHandler struct {
	s services.TaskServicer
}

func NewTaskHandler(service services.TaskServicer) *TaskHandler {
	return &TaskHandler{s: service}
}

func (h *TaskHandler) CreateNewTask(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userId == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	workspaceId := r.PathValue("workspaceId")
	if workspaceId == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		AssigneeID  string    `json:"assignee_id"`
		Status      string    `json:"status"`
		Priority    string    `json:"priority"`
		DueDate     time.Time `json:"due_date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	task, err := h.s.CreateNewTask(r.Context(), workspaceId, req.Title,
		req.Description, req.AssigneeID, req.Status, req.Priority, req.DueDate)
	if err != nil {
		log.Printf("Failed to create task: %v", err)
		http.Error(w, "failed to create task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(task)
}

func (h *TaskHandler) GetWorkspaceTasks(w http.ResponseWriter, r *http.Request) {
	workspaceId := r.PathValue("workspaceId")
	if workspaceId == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	tasks, err := h.s.GetWorkspaceTasks(r.Context(), workspaceId)
	if err != nil {
		log.Printf("Failed to get workspace tasks: %v", err)
		http.Error(w, "failed to get workspace tasks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func (h *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
	taskId := r.PathValue("task_id")
	if taskId == "" {
		http.Error(w, "missing task id", http.StatusBadRequest)
		return
	}

	task, err := h.s.GetTask(r.Context(), taskId)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrTaskNotFound):
			http.Error(w, "task not found", http.StatusNotFound)
			return
		default:
			log.Printf("Failed to get task: %v", err)
			http.Error(w, "failed to get task", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	taskId := r.PathValue("task_id")
	if taskId == "" {
		http.Error(w, "missing task id", http.StatusBadRequest)
		return
	}

	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		AssigneeID  string    `json:"assignee_id"`
		Status      string    `json:"status"`
		Priority    string    `json:"priority"`
		DueDate     time.Time `json:"due_date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	task, err := h.s.UpdateTask(r.Context(), taskId, req.Title,
		req.Description, req.AssigneeID, req.Status, req.Priority, req.DueDate)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrTaskNotFound):
			http.Error(w, "task not found", http.StatusNotFound)
			return
		default:
			log.Printf("Failed to update task: %v", err)
			http.Error(w, "failed to update task", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	taskId := r.PathValue("task_id")
	if taskId == "" {
		http.Error(w, "missing task id", http.StatusBadRequest)
		return
	}

	err := h.s.DeleteTask(r.Context(), taskId)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrTaskNotFound):
			http.Error(w, "task not found", http.StatusNotFound)
			return
		default:
			log.Printf("Failed to delete task: %v", err)
			http.Error(w, "failed to delete task", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusNoContent)
}
