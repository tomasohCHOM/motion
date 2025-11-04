/**
 * S3 Service Wrapper
 */

package services

import (
	"context"
	"errors"
	"time"
	"fmt"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/db"
	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
	"github.com/tomasohchom/motion/services/file-upload/internal/store"
	"github.com/tomasohchom/motion/services/file-upload/utils"
)

var (
	ErrMissingFields = errors.New("missing required fields")
	ErrInvalidUUID   = errors.New("could not cast string to UUID")
)

type UploadServicer interface {
	MakeBucket(ctx context.Context) error
	GenerateUploadURL(ctx context.Context, filename string) (string, error)
	CompleteUpload(ctx context.Context, key, userID string) error
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

func (u *UploadService) CompleteUpload(ctx context.Context, key, userID string) error {
	if key == "" || userID == "" {
		return ErrMissingFields
	}
	keyUUID, err := utils.StringToUUID(key)
	if err != nil {
		return ErrInvalidUUID
	}
	userIDUUID, err := utils.StringToUUID(key)
	if err != nil {
		return ErrInvalidUUID
	}

	_, err = u.store.Queries.CreateFile(ctx, db.CreateFileParams{
		ID:     keyUUID,
		UserID: userIDUUID,
	})
	if err != nil {
		return fmt.Errorf("failed to create file metadata in DB: %w", err)
	}
	return nil
}
