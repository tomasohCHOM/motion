package interfaces

import (
	"context"
	"io"
	"time"
)

type StorageClient interface {
	GeneratePresignedURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error)
	PutObject(ctx context.Context, bucket, key string, data io.Reader, size int64) error
	DeleteObject(ctx context.Context, bucket, key string) error
	GetObjectURL(ctx context.Context, bucket, key string) (string, error)
	IsOnline() bool

	// TODO:
	// GetObject(ctx context.Context, bucket, key string) (io.ReadCloser, error)
	// ListObjects(ctx context.Context, bucket, prefix string) ([]string, error)
	// ObjectExists(ctx context.Context, bucket, prefix string) (bool, error)
}
