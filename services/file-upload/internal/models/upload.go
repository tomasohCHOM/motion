package models

import (
	"errors"
	"time"
)

type PresignedURLRequest struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	UserID      string `json:"user_id"`
	FileSize    int64  `json:"file_size,omitempty"`
}

func (r *PresignedURLRequest) Validate() error {
	if r.Filename == "" {
		return errors.New("filename is required")
	}
	if r.UserID == "" {
		return errors.New("user_id is required")
	}
	if r.FileSize > 100*1024*1024 { // 100MB limit
		return errors.New("file size exceeds maximum allowed size")
	}
	return nil
}

type PresignedURLResponse struct {
	UploadURL string `json:"upload_url"`
	Key       string `json:"key"`
	ExpiresIn int    `json:"expires_in"`
}

type CompleteUploadRequest struct {
	Key    string `json:"key"`
	UserID string `json:"user_id"`
}

func (r *CompleteUploadRequest) Validate() error {
	if r.Key == "" {
		return errors.New("key is required")
	}
	if r.UserID == "" {
		return errors.New("user_id is required")
	}
	return nil
}

type CompleteUploadResponse struct {
	Success    bool      `json:"success"`
	FileURL    string    `json:"file_url"`
	Size       int64     `json:"size"`
	UploadedAt time.Time `json:"uploaded_at"`
}

type UploadStatus struct {
	Key       string    `json:"key"`
	Status    string    `json:"status"` // "pending", "completed", "failed"
	FileURL   string    `json:"file_url,omitempty"`
	Size      int64     `json:"size,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type FileInfo struct {
	URL  string
	Size int64
}
