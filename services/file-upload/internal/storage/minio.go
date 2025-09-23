package storage

import (
	"context"
	"io"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	appconfig "github.com/tomasohchom/motion/services/file-upload/internal/config"
)

type MinIOClient struct {
	client *minio.Client
}

func NewMinIOClient(cfg appconfig.StorageConfig) (*MinIOClient, error) {
	client, err := minio.New(cfg.Endpiont, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, err
	}

	return &MinIOClient{client: client}, nil
}

func (m *MinIOClient) GeneratePresignedURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error) {
	presignedURL, err := m.client.PresignedPutObject(ctx, bucket, key, expiry)
	if err != nil {
		return "", err
	}
	return presignedURL.String(), nil
}

func (m *MinIOClient) PutObject(ctx context.Context, bucket, key string, data io.Reader, size int64) error {
	_, err := m.client.PutObject(ctx, bucket, key, data, size, minio.PutObjectOptions{})
	return err
}

func (m *MinIOClient) DeleteObject(ctx context.Context, bucket, key string) error {
	return m.client.RemoveObject(ctx, bucket, key, minio.RemoveObjectOptions{})
}

func (m *MinIOClient) GetObjectURL(ctx context.Context, bucket, key string) (string, error) {
	// Generate a presigned GET URL (valid for 1 hour)
	presignedURL, err := m.client.PresignedGetObject(ctx, bucket, key, time.Hour, nil)
	if err != nil {
		return "", err
	}
	return presignedURL.String(), nil
}
