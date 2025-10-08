package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/models"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

type UploadHandler struct {
	uploadService *services.UploadService
	config        *config.Config
}

func NewUploadHandler(uploadService *services.UploadService, cfg *config.Config) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
		config:        cfg,
	}
}

// GetPresignedURL generates a presigned URL for file upload
func (h *UploadHandler) GetPresignedURL(w http.ResponseWriter, r *http.Request) {
	var req models.PresignedURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate unique key for the file
	key := generateFileKey(req.Filename, req.UserID)

	uploadURL, err := h.uploadService.GenerateUploadURL(r.Context(), key)
	if err != nil {
		http.Error(w, "Failed to generate upload URL", http.StatusInternalServerError)
		return
	}

	response := models.PresignedURLResponse{
		UploadURL: uploadURL,
		Key:       key,
		ExpiresIn: int(15 * time.Minute / time.Second), // 15 minutes
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(response)
}

// CompleteUpload handles upload completion notification
func (h *UploadHandler) CompleteUpload(w http.ResponseWriter, r *http.Request) {
	var req models.CompleteUploadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// // Verify the file exists and get metadata
	// fileInfo, err := h.uploadService.VerifyUpload(r.Context(), req.Key)
	// if err != nil {
	// 	http.Error(w, "Failed to verify upload", http.StatusInternalServerError)
	// 	return
	// }

	// Here you might save metadata to a database, send notifications, etc.
	response := models.CompleteUploadResponse{
		Success: true,
		// FileURL:    fileInfo.URL,
		// Size:       fileInfo.Size,
		UploadedAt: time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *UploadHandler) ListFiles(w http.ResponseWriter, r *http.Request) {
	var prefix string
	prefix = r.URL.Query().Get("prefix")
	files, _ := h.uploadService.ListFiles(r.Context(), prefix)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string][]string{"files": files})
}

// GetUploadStatus checks the status of an upload
func (h *UploadHandler) GetUploadStatus(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "Missing key parameter", http.StatusBadRequest)
		return
	}

	// status, err := h.uploadService.GetUploadStatus(r.Context(), key)
	// if err != nil {
	// 	http.Error(w, "Failed to get upload status", http.StatusInternalServerError)
	// 	return
	// }

	w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(status)
}

// Helper function to generate unique file keys
func generateFileKey(filename, userID string) string {
	timestamp := time.Now().Unix()
	return fmt.Sprintf("uploads/%s/%d_%s", userID, timestamp, filename)
}
