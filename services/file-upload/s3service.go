/**
 * S3 Service Wrapper
 */

package main

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3ClientInterface defines the interface for S3 operations
type S3ClientInterface interface {
	PutObject(ctx context.Context, params *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error)
	GetObject(ctx context.Context, params *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error)
	DeleteObject(ctx context.Context, params *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error)
	ListObjectsV2(ctx context.Context, params *s3.ListObjectsV2Input, optFns ...func(*s3.Options)) (*s3.ListObjectsV2Output, error)
	HeadBucket(ctx context.Context, params *s3.HeadBucketInput, optFns ...func(*s3.Options)) (*s3.HeadBucketOutput, error)
	CreateBucket(ctx context.Context, params *s3.CreateBucketInput, optFns ...func(*s3.Options)) (*s3.CreateBucketOutput, error)
}

type S3Service struct {
	client     S3ClientInterface
	bucketName string
}

func NewS3Service(cfg S3Config) (*S3Service, error) {
	client, err := CreateS3Client(cfg)
	if err != nil {
		return nil, err
	}

	service := &S3Service{
		client:     client,
		bucketName: cfg.BucketName,
	}

	// Create bucket if it doesn't exist (for MinIO)
	if cfg.Endpoint != "" {
		err = service.createBucketIfNotExists()
		if err != nil {
			return nil, err
		}
	}

	return service, nil
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

// UploadFile uploads a file to the S3 bucket using the service's configured client and bucket
func (s *S3Service) UploadFile(key string, data []byte) error {
	_, err := s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &s.bucketName,
		Key:    &key,
		Body:   bytes.NewReader(data),
	})
	return err
}

// DownloadFile downloads a file from the S3 bucket using the service's configured client and bucket
func (s *S3Service) DownloadFile(key string) ([]byte, error) {
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

// DeleteObject deletes an object from the S3 bucket using the service's configured client and bucket
func (s *S3Service) DeleteObject(key string) error {
	_, err := s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: &s.bucketName,
		Key:    &key,
	})
	return err
}

// ListObjects lists all objects in the S3 bucket using the service's configured client and bucket
func (s *S3Service) ListObjects() error {
	result, err := s.client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &s.bucketName,
	})
	if err != nil {
		return err
	}

	for _, obj := range result.Contents {
		fmt.Printf("Key %s, Size: %d\n", *obj.Key, obj.Size)
	}
	return nil
}
