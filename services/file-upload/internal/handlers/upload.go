package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/models"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

type UploadHandler struct {
	uploadService services.UploadServicer
}

func NewUploadHandler(uploadService services.UploadServicer) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
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

	err := h.uploadService.CompleteUpload(r.Context(), req.Key, req.UserID)
	if err != nil {
		log.Printf("Failed to complete upload: %v", err)
		http.Error(w, "Failed to complete upload", http.StatusInternalServerError)
		return
	}

	// TODO: use FileInfo type from models here and in service to give a better response
	response := models.CompleteUploadResponse{
		Success: true,
		// FileURL:    fileInfo.URL,
		// Size:       fileInfo.Size,
		UploadedAt: time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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

func (h *UploadHandler) ListFiles(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("id")

	files, err := h.uploadService.ListFiles(r.Context(), userID)
	if err != nil {
		http.Error(w, "Could not list files", http.StatusInternalServerError)
		log.Printf("Could not list files: %v", err)
	}


	response := models.ListFilesResponse{
		Files: files,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Helper function to generate unique file keys
func generateFileKey(filename, userID string) string {
	timestamp := time.Now().Unix()
	return fmt.Sprintf("uploads/%s/%d_%s", userID, timestamp, filename)
}
