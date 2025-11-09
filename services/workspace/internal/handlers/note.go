package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/services"
)

type NoteHandler struct {
	s services.NoteServicer
}

func NewNoteHandler(service services.NoteServicer) *NoteHandler {
	return &NoteHandler{s: service}
}

type createNoteRequest struct {
	AuthorID string   `json:"author_id"`
	Title    string   `json:"title"`
	Content  string   `json:"content"`
	Tags     []string `json:"tags"`
}

type updateNoteRequest struct {
	Title   *string   `json:"title"`
	Content *string   `json:"content"`
	Tags    *[]string `json:"tags"`
}

func (h *NoteHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	if workspaceID == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	var req createNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	note, err := h.s.CreateNote(r.Context(), services.CreateNoteInput{
		WorkspaceID: workspaceID,
		AuthorID:    req.AuthorID,
		Title:       req.Title,
		Content:     req.Content,
		Tags:        req.Tags,
	})
	if err != nil {
		handleNoteError(w, err)
		return
	}

	writeJSON(w, note)
}

func (h *NoteHandler) ListNotes(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	if workspaceID == "" {
		http.Error(w, "missing workspace id", http.StatusBadRequest)
		return
	}

	notes, err := h.s.ListNotes(r.Context(), workspaceID)
	if err != nil {
		handleNoteError(w, err)
		return
	}

	writeJSON(w, notes)
}

func (h *NoteHandler) GetNote(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	noteID := r.PathValue("note_id")
	if workspaceID == "" || noteID == "" {
		http.Error(w, "missing identifiers", http.StatusBadRequest)
		return
	}

	note, err := h.s.GetNote(r.Context(), workspaceID, noteID)
	if err != nil {
		handleNoteError(w, err)
		return
	}

	writeJSON(w, note)
}

func (h *NoteHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	noteID := r.PathValue("note_id")
	if workspaceID == "" || noteID == "" {
		http.Error(w, "missing identifiers", http.StatusBadRequest)
		return
	}

	var req updateNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	note, err := h.s.UpdateNote(r.Context(), workspaceID, noteID, services.UpdateNoteInput{
		Title:   req.Title,
		Content: req.Content,
		Tags:    req.Tags,
	})
	if err != nil {
		handleNoteError(w, err)
		return
	}

	writeJSON(w, note)
}

func (h *NoteHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	noteID := r.PathValue("note_id")
	if workspaceID == "" || noteID == "" {
		http.Error(w, "missing identifiers", http.StatusBadRequest)
		return
	}

	if err := h.s.DeleteNote(r.Context(), workspaceID, noteID); err != nil {
		handleNoteError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func handleNoteError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrMissingNoteFields):
		http.Error(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, services.ErrInvalidNoteData):
		http.Error(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, services.ErrNoteNotFound):
		http.Error(w, err.Error(), http.StatusNotFound)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
