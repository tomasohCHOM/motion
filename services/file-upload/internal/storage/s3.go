package storage

import (
	"context"
	"errors"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/tomasohchom/motion/services/file-upload/internal/interfaces"
)

type S3Client struct {
	client *s3.Client
}

func NewS3Client(client *s3.Client) *S3Client {
	return &S3Client{client: client}
}

func (s *S3Client) GeneratePresignedURL(ctx context.Context, bucket, key string, expiry time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s.client)
	req, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: &bucket,
		Key:    &key,
	}, func(opts *s3.PresignOptions) {
		opts.Expires = expiry
	})
	if err != nil {
		return "", err
	}
	return req.URL, nil
}
func (s *S3Client) PutObject(ctx context.Context, bucket, key string, data io.Reader, size int64) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(bucket),
		Key:           aws.String(key),
		Body:          data,
		ContentLength: aws.Int64(size),
	})
	return err
}

func (s *S3Client) DeleteObject(ctx context.Context, bucket, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	return err
}

func (s *S3Client) GetObjectURL(ctx context.Context, bucket, key string) (string, error) {
	presignClient := s3.NewPresignClient(s.client)
	req, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = 1 * time.Hour // 1 hour expiry for GET URLs
	})
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

// Optional: Additional methods for extended functionality
func (s *S3Client) GetObject(ctx context.Context, bucket, key string) (io.ReadCloser, error) {
	result, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	return result.Body, nil
}

func (s *S3Client) HeadObject(ctx context.Context, bucket, key string) (*s3.HeadObjectOutput, error) {
	return s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
}

func (s *S3Client) ListObjects(ctx context.Context, bucket, prefix string) ([]string, error) {
	var keys []string

	paginator := s3.NewListObjectsV2Paginator(s.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
		Prefix: aws.String(prefix),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		for _, obj := range page.Contents {
			if obj.Key != nil {
				keys = append(keys, *obj.Key)
			}
		}
	}

	return keys, nil
}

func (s *S3Client) IsOnline() bool {
	// return s.client.
	panic("Not implemented")
}

func (s *S3Client) MakeBucket(ctx context.Context, bucketName, region string) error {
	_, err := s.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: &bucketName,
	})

	if err != nil {
		// Check if the bucket already exists
		var bne *types.BucketAlreadyOwnedByYou
		if errors.As(err, &bne) {
			return nil
		}
		return err
	}

	return nil
}

// Compile-time interface compliance check
var _ interfaces.StorageClient = (*S3Client)(nil)
