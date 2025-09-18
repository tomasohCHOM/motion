package main

import (
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockS3Client is a mock implementation of the S3ClientInterface
type MockS3Client struct {
	mock.Mock
}

func (m *MockS3Client) PutObject(ctx context.Context, input *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.PutObjectOutput), args.Error(1)
}

func (m *MockS3Client) GetObject(ctx context.Context, input *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.GetObjectOutput), args.Error(1)
}

func (m *MockS3Client) DeleteObject(ctx context.Context, input *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.DeleteObjectOutput), args.Error(1)
}

func (m *MockS3Client) ListObjectsV2(ctx context.Context, input *s3.ListObjectsV2Input, optFns ...func(*s3.Options)) (*s3.ListObjectsV2Output, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.ListObjectsV2Output), args.Error(1)
}

func (m *MockS3Client) HeadBucket(ctx context.Context, input *s3.HeadBucketInput, optFns ...func(*s3.Options)) (*s3.HeadBucketOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.HeadBucketOutput), args.Error(1)
}

func (m *MockS3Client) CreateBucket(ctx context.Context, input *s3.CreateBucketInput, optFns ...func(*s3.Options)) (*s3.CreateBucketOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.CreateBucketOutput), args.Error(1)
}

// Test UploadFile function
func TestUploadFile(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"
	key := "test-key"
	data := []byte("test data")

	// Set up mock expectations
	mockClient.On("PutObject", mock.Anything, mock.MatchedBy(func(input *s3.PutObjectInput) bool {
		return *input.Bucket == bucket && *input.Key == key
	})).Return(&s3.PutObjectOutput{}, nil)

	// Test successful upload
	err := UploadFile(mockClient, bucket, key, data)
	assert.NoError(t, err)

	// Verify all expectations were met
	mockClient.AssertExpectations(t)
}

func TestUploadFile_Error(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"
	key := "test-key"
	data := []byte("test data")

	// Set up mock to return an error
	mockClient.On("PutObject", mock.Anything, mock.Anything).Return(&s3.PutObjectOutput{}, assert.AnError)

	// Test error case
	err := UploadFile(mockClient, bucket, key, data)
	assert.Error(t, err)

	mockClient.AssertExpectations(t)
}

// Test DownloadFile function
func TestDownloadFile(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"
	key := "test-key"
	expectedData := []byte("test data")

	// Create a mock response body
	mockBody := io.NopCloser(bytes.NewReader(expectedData))

	// Set up mock expectations
	mockClient.On("GetObject", mock.Anything, mock.MatchedBy(func(input *s3.GetObjectInput) bool {
		return *input.Bucket == bucket && *input.Key == key
	})).Return(&s3.GetObjectOutput{
		Body: mockBody,
	}, nil)

	// Test successful download
	data, err := DownloadFile(mockClient, bucket, key)
	assert.NoError(t, err)
	assert.Equal(t, expectedData, data)

	mockClient.AssertExpectations(t)
}

func TestDownloadFile_Error(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"
	key := "test-key"

	// Set up mock to return an error
	mockClient.On("GetObject", mock.Anything, mock.Anything).Return(&s3.GetObjectOutput{}, assert.AnError)

	// Test error case
	data, err := DownloadFile(mockClient, bucket, key)
	assert.Error(t, err)
	assert.Nil(t, data)

	mockClient.AssertExpectations(t)
}

// Test DeleteObject function
func TestDeleteObject(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"
	key := "test-key"

	// Set up mock expectations
	mockClient.On("DeleteObject", mock.Anything, mock.MatchedBy(func(input *s3.DeleteObjectInput) bool {
		return *input.Bucket == bucket && *input.Key == key
	})).Return(&s3.DeleteObjectOutput{}, nil)

	// Test successful deletion
	err := DeleteObject(mockClient, bucket, key)
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}

func TestDeleteObject_Error(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"
	key := "test-key"

	// Set up mock to return an error
	mockClient.On("DeleteObject", mock.Anything, mock.Anything).Return(&s3.DeleteObjectOutput{}, assert.AnError)

	// Test error case
	err := DeleteObject(mockClient, bucket, key)
	assert.Error(t, err)

	mockClient.AssertExpectations(t)
}

// Test ListObjects function
func TestListObjects(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"

	// Create mock objects
	key1 := "file1.txt"
	key2 := "file2.txt"
	size1 := int64(100)
	size2 := int64(200)

	// Set up mock expectations
	mockClient.On("ListObjectsV2", mock.Anything, mock.MatchedBy(func(input *s3.ListObjectsV2Input) bool {
		return *input.Bucket == bucket
	})).Return(&s3.ListObjectsV2Output{
		Contents: []types.Object{
			{
				Key:  &key1,
				Size: &size1,
			},
			{
				Key:  &key2,
				Size: &size2,
			},
		},
	}, nil)

	// Test successful listing
	err := ListObjects(mockClient, bucket)
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}

func TestListObjects_Error(t *testing.T) {
	mockClient := &MockS3Client{}
	bucket := "test-bucket"

	// Set up mock to return an error
	mockClient.On("ListObjectsV2", mock.Anything, mock.Anything).Return(&s3.ListObjectsV2Output{}, assert.AnError)

	// Test error case
	err := ListObjects(mockClient, bucket)
	assert.Error(t, err)

	mockClient.AssertExpectations(t)
}

// Test S3Service struct methods
func TestNewS3Service_WithoutEndpoint(t *testing.T) {
	cfg := S3Config{
		Region:     "us-east-1",
		AccessKey:  "test-key",
		SecretKey:  "test-secret",
		BucketName: "test-bucket",
	}

	service, err := NewS3Service(cfg)
	assert.NoError(t, err)
	assert.NotNil(t, service)
	assert.Equal(t, cfg.BucketName, service.bucketName)
}

func TestNewS3Service_WithEndpoint(t *testing.T) {
	cfg := S3Config{
		Endpoint:   "http://localhost:9000",
		Region:     "us-east-1",
		AccessKey:  "test-key",
		SecretKey:  "test-secret",
		BucketName: "test-bucket",
	}

	// Note: This test will try to create a real S3 client and bucket
	// In a real scenario, we'd want to mock the CreateS3Client function
	service, err := NewS3Service(cfg)
	// We expect this to fail in test environment since MinIO isn't running
	assert.Error(t, err)
	assert.Nil(t, service)
}

func TestS3Service_createBucketIfNotExists_BucketExists(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	// Set up mock to return success (bucket exists)
	mockClient.On("HeadBucket", mock.Anything, mock.MatchedBy(func(input *s3.HeadBucketInput) bool {
		return *input.Bucket == service.bucketName
	})).Return(&s3.HeadBucketOutput{}, nil)

	err := service.createBucketIfNotExists()
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}

func TestS3Service_createBucketIfNotExists_BucketDoesNotExist(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	// Set up mock: HeadBucket returns error (bucket doesn't exist)
	mockClient.On("HeadBucket", mock.Anything, mock.Anything).Return(&s3.HeadBucketOutput{}, assert.AnError)
	// CreateBucket succeeds
	mockClient.On("CreateBucket", mock.Anything, mock.MatchedBy(func(input *s3.CreateBucketInput) bool {
		return *input.Bucket == service.bucketName
	})).Return(&s3.CreateBucketOutput{}, nil)

	err := service.createBucketIfNotExists()
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}

func TestS3Service_createBucketIfNotExists_CreateBucketError(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	// Set up mock: HeadBucket returns error, CreateBucket also returns error
	mockClient.On("HeadBucket", mock.Anything, mock.Anything).Return(&s3.HeadBucketOutput{}, assert.AnError)
	mockClient.On("CreateBucket", mock.Anything, mock.Anything).Return(&s3.CreateBucketOutput{}, assert.AnError)

	err := service.createBucketIfNotExists()
	assert.Error(t, err)

	mockClient.AssertExpectations(t)
}

// Test S3Service wrapper methods
func TestS3Service_UploadFile(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	key := "test-key"
	data := []byte("test data")

	// Set up mock expectations
	mockClient.On("PutObject", mock.Anything, mock.MatchedBy(func(input *s3.PutObjectInput) bool {
		return *input.Bucket == service.bucketName && *input.Key == key
	})).Return(&s3.PutObjectOutput{}, nil)

	// Test service method
	err := service.UploadFile(key, data)
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}

func TestS3Service_DownloadFile(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	key := "test-key"
	expectedData := []byte("test data")
	mockBody := io.NopCloser(bytes.NewReader(expectedData))

	// Set up mock expectations
	mockClient.On("GetObject", mock.Anything, mock.MatchedBy(func(input *s3.GetObjectInput) bool {
		return *input.Bucket == service.bucketName && *input.Key == key
	})).Return(&s3.GetObjectOutput{
		Body: mockBody,
	}, nil)

	// Test service method
	data, err := service.DownloadFile(key)
	assert.NoError(t, err)
	assert.Equal(t, expectedData, data)

	mockClient.AssertExpectations(t)
}

func TestS3Service_DeleteObject(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	key := "test-key"

	// Set up mock expectations
	mockClient.On("DeleteObject", mock.Anything, mock.MatchedBy(func(input *s3.DeleteObjectInput) bool {
		return *input.Bucket == service.bucketName && *input.Key == key
	})).Return(&s3.DeleteObjectOutput{}, nil)

	// Test service method
	err := service.DeleteObject(key)
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}

func TestS3Service_ListObjects(t *testing.T) {
	mockClient := &MockS3Client{}
	service := &S3Service{
		client:     mockClient,
		bucketName: "test-bucket",
	}

	// Create mock objects
	key1 := "file1.txt"
	key2 := "file2.txt"
	size1 := int64(100)
	size2 := int64(200)

	// Set up mock expectations
	mockClient.On("ListObjectsV2", mock.Anything, mock.MatchedBy(func(input *s3.ListObjectsV2Input) bool {
		return *input.Bucket == service.bucketName
	})).Return(&s3.ListObjectsV2Output{
		Contents: []types.Object{
			{
				Key:  &key1,
				Size: &size1,
			},
			{
				Key:  &key2,
				Size: &size2,
			},
		},
	}, nil)

	// Test service method
	err := service.ListObjects()
	assert.NoError(t, err)

	mockClient.AssertExpectations(t)
}
