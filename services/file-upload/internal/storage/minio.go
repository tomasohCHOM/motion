package storage

import (
	"context"
	"io"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
)

type MinIOClient struct {
	client *minio.Client
}

func NewMinIOClient(cfg config.StorageConfig) (*MinIOClient, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
		Region: cfg.Region,
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

func (m *MinIOClient) IsOnline() bool {
	return m.client.IsOnline()
}

func (m *MinIOClient) MakeBucket(ctx context.Context, bucketName, region string) error {
	err := m.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: region})
	if err != nil {
		exists, errBucketExists := m.client.BucketExists(ctx, bucketName)
		if errBucketExists == nil && exists {
			return nil
		} else {
			return err
		}
	}
	return err
}

func (m *MinIOClient) ListObjects(ctx context.Context, bucketName, prefix string) ([]string, error) {
	var objects []string
	for object := range m.client.ListObjects(ctx, bucketName, minio.ListObjectsOptions{Prefix: prefix, Recursive: true}) {
		if object.Err != nil {
			return nil, object.Err
		}
		objects = append(objects, object.Key)
	}
	return objects, nil
}

// Compile-time interface compliance check
var _ interfaces.StorageClient = (*MinIOClient)(nil)
