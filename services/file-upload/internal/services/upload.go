/**
 * S3 Service Wrapper
 */

package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/db"
	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
	"github.com/tomasohchom/motion/services/file-upload/internal/models"
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
	ListFiles(ctx context.Context, userID string) ([]models.FileInfo, error)
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
	userIDUUID, err := utils.StringToUUID(userID)
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

func (u *UploadService) ListFiles(ctx context.Context, userID string) ([]models.FileInfo, error) {
	var dbFiles []db.File
	var err error

	if userID == "" {
		dbFiles, err = u.store.Queries.ListFiles(ctx)
		if err != nil {
			return []models.FileInfo{}, fmt.Errorf("could not list files: %w", err)
		}
	} else {
		userIDUUID, err := utils.StringToUUID(userID)
		if err != nil {
			return []models.FileInfo{}, ErrInvalidUUID
		}
		dbFiles, err = u.store.Queries.ListFilesByUser(ctx, db.ListFilesByUserParams{
			UserID: userIDUUID,
		})
		if err != nil {
			return []models.FileInfo{}, fmt.Errorf("Could not list files: %w", err)
		}
	}

	files := make([]models.FileInfo, len(dbFiles))
	for i, dbFile := range dbFiles {
		files[i] = toFileInfo(dbFile)
	}
	return files, nil
}

func toFileInfo(dbFile db.File) models.FileInfo {
	return models.FileInfo{
		Key:       dbFile.ID.String(), // Convert UUID to string
		UserID:    dbFile.UserID.String(),
		Size:      dbFile.SizeBytes,
		CreatedAt: dbFile.CreatedAt.Time, // Handle pgtype.Timestamp
	}
}
