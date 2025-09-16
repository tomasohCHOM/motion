/**
 * S3 Service Wrapper
 */

package main

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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
		err = service.CreateBucketIfNotExists()
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

func uploadFile(client *s3.Client, bucket, key string, data []byte) error {
	_, err := client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &bucket,
		Key:    &key,
		Body:   bytes.NewReader(data),
	})
	return err
}

func downloadFile(client *s3.Client, bucket, key string) ([]byte, error) {
	result, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &bucket,
		Key:    &key,
	})
	if err != nil {
		return nil, err
	}
	defer result.Body.Close()
	return io.ReadAll(result.Body)
}

func listObjects(client *s3.Client, bucket string) error {
	result, err := client.GetObject(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &bucket,
	})
	if err != nil {
		return err
	}

	for _, object := range result.Contents {
		fmt.Printf("Key %s, Size: %d, Modified: %s\n",
			*object.Key, object.Size, object.LastModified)
	}
	return nil
}

func deleteObject(client *s3.Client, bucket, key string) error {
	_, err := client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: &bucket,
		Key:    &key,
	})
	return err
}
