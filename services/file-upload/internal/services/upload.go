/**
 * S3 Service Wrapper
 */

package services

import (
	"context"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
	"github.com/tomasohchom/motion/services/file-upload/internal/store"
)

type UploadServicer interface {
	MakeBucket(ctx context.Context) error
	GenerateUploadURL(ctx context.Context, filename string) (string, error)
}

type UploadService struct {
	storage interfaces.StorageClient
	config  *config.Config
	store   *store.Store
}

var _ UploadServicer = (*UploadService)(nil)

func NewUploadService(storage interfaces.StorageClient, cfg *config.Config,
	store *store.Store) *UploadService {
	service := &UploadService{
		storage: storage,
		config:  cfg,
		store:   store,
	}
	service.MakeBucket(context.Background())
	return service
}

func (u *UploadService) MakeBucket(ctx context.Context) error {
	return u.storage.MakeBucket(ctx, u.config.Storage.Bucket, u.config.Storage.Region)
}

func (u *UploadService) GenerateUploadURL(ctx context.Context, filename string) (string, error) {
	return u.storage.GeneratePresignedURL(ctx, u.config.Storage.Bucket, filename, 15*time.Minute)
}
