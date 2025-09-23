package clients

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
}
