package mocks

import (
	"context"
	"io"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
)

// MockStorageClient is a mock implementation of the StorageClient interface.
// It allows you to stub out the methods of the StorageClient for testing purposes.
// You can set the return values for each method to simulate different scenarios.
// For example, you can set MakeBucketFunc to return an error to test the error handling of your code.
type MockStorageClient struct {
	GeneratePresignedURLFunc func(ctx context.Context, bucket, key string, expiry time.Duration) (string, error)
	PutObjectFunc            func(ctx context.Context, bucket, key string, data io.Reader, size int64) error
	DeleteObjectFunc         func(ctx context.Context, bucket, key string) error
	GetObjectURLFunc         func(ctx context.Context, bucket, key string) (string, error)
	IsOnlineFunc             func() bool
	MakeBucketFunc           func(ctx context.Context, bucketName, region string) error
	MakeBucketCalled         bool
}

func (m *MockStorageClient) GeneratePresignedURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error) {
	if m.GeneratePresignedURLFunc != nil {
		return m.GeneratePresignedURLFunc(ctx, bucket, key, expiry)
	}
	return "", nil
}

func (m *MockStorageClient) PutObject(ctx context.Context, bucket, key string, data io.Reader, size int64) error {
	if m.PutObjectFunc != nil {
		return m.PutObjectFunc(ctx, bucket, key, data, size)
	}
	return nil
}

func (m *MockStorageClient) DeleteObject(ctx context.Context, bucket, key string) error {
	if m.DeleteObjectFunc != nil {
		return m.DeleteObjectFunc(ctx, bucket, key)
	}
	return nil
}

func (m *MockStorageClient) GetObjectURL(ctx context.Context, bucket, key string) (string, error) {
	if m.GetObjectURLFunc != nil {
		return m.GetObjectURLFunc(ctx, bucket, key)
	}
	return "", nil
}

func (m *MockStorageClient) IsOnline() bool {
	if m.IsOnlineFunc != nil {
		return m.IsOnlineFunc()
	}
	return false
}

func (m *MockStorageClient) MakeBucket(ctx context.Context, bucketName, region string) error {
	m.MakeBucketCalled = true
	if m.MakeBucketFunc != nil {
		return m.MakeBucketFunc(ctx, bucketName, region)
	}
	return nil
}

func (m *MockStorageClient) ListObjects(ctx context.Context, bucketName, prefix string) ([]string, error) {
	return []string{}, nil
}

// Compile-time interface compliance check
var _ interfaces.StorageClient = (*MockStorageClient)(nil)
