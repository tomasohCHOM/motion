/**
 * S3 Service Wrapper
 */

package services

import (
	"context"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
)

type UploadService struct {
	storage interfaces.StorageClient
	config  *config.Config
}

func NewUploadService(storage interfaces.StorageClient, cfg *config.Config) *UploadService {
	return &UploadService{
		storage: storage,
		config:  cfg,
	}
}

func (u *UploadService) GenerateUploadURL(ctx context.Context, filename string) (string, error) {
	return u.storage.GeneratePresignedURL(ctx, u.config.Storage.Bucket, filename, 15*time.Minute)
}
