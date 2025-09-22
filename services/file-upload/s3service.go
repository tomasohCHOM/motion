/**
 * S3 Service Wrapper
 */

package main

import (
	"bytes"
	"context"
	"io"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Service struct {
	client     *s3.Client
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
