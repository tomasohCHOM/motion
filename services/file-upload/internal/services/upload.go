/**
 * S3 Service Wrapper
 */

package services

import (
	"bytes"
	"context"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
)

type UploadService struct {
	storage clients.StorageClient
	config *config.Config
}

func NewUploadService(storage clients.StorageClient, cfg *config.Config) *UploadService {
	return &UploadService{
		storage: storage,
		config: cfg,
	}
}

func (u *UploadService) GenerateUploadURL(ctx context.Context, filename string) (string, error) {
	return u.storage.GeneratePresignedURL(ctx, u.config.Storage.Bucket, filename, 15*time.Minute)
}

func (s *S3Service) createBucketIfNotExists() error {
	_, err := s.client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
		Bucket: &s.bucketName,
	})

	if err != nil {
		_, err = s.client.CreateBucket(context.TODO(), &s3.CreateBucketInput{
			Bucket: &s.bucketName,
		})
		return err
	}

	return nil
}

func (s *S3Service) PutObject(key string, data []byte) error {
	_, err := s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &s.bucketName,
		Key:    &key,
		Body:   bytes.NewReader(data),
	})
	return err
}

func (s *S3Service) GetObject(key string) ([]byte, error) {
	result, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &s.bucketName,
		Key:    &key,
	})
	if err != nil {
		return nil, err
	}
	defer result.Body.Close()
	return io.ReadAll(result.Body)
}

func (s *S3Service) ListObjects() ([]types.Object, error) {
	result, err := s.client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &s.bucketName,
	})
	if err != nil {
		return nil, err
	}

	return result.Contents, nil
}

func (s *S3Service) DeleteObject(key string) error {
	_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: &s.bucketName,
		Key:    &key,
	})
	return err
}
