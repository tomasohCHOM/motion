package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Config struct {
	Endpoint   string
	Region     string
	AccessKey  string
	SecretKey  string
	UseSSL     bool
	BucketName string
}

func getS3Config() S3Config {
	env := os.Getenv("ENV")

	if env == "production" {
		return S3Config{
			Region:     os.Getenv("AWS_REGION"),
			AccessKey:  os.Getenv("AWS_ACCESS_KEY_ID"),
			SecretKey:  os.Getenv("AWS_SECRET_ACCESS_KEY"),
			UseSSL:     true,
			BucketName: os.Getenv("S3_BUCKET_NAME"),
		}
	}

	// minio server ~/minio-data --console-address ":9000"
	return S3Config{
		Endpoint:   "http://localhost:9000",
		Region:     "us-east-1", // MinIO default
		AccessKey:  "minioadmin",
		SecretKey:  "minioadmin",
		UseSSL:     false,
		BucketName: "test-bucket",
	}
}

func createS3Client(cfg S3Config) (*s3.Client, error) {
	var awsConfig aws.Config
	var err error

	if cfg.Endpoint != "" {
		customResolver := aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...any) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:               cfg.Endpoint,
					SigningRegion:     cfg.Region,
					HostnameImmutable: true,
				}, nil
			})

		awsConfig, err = config.LoadDefaultConfig(context.TODO(),
			config.WithRegion(cfg.Region),
			config.WithEndpointResolverWithOptions(customResolver),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
				cfg.AccessKey,
				cfg.SecretKey,
				"",
			)),
		)
	} else {
		awsConfig, err = config.LoadDefaultConfig(context.TODO(),
			config.WithRegion(cfg.Region),
		)
	}

	if err != nil {
		return nil, err
	}

	return s3.NewFromConfig(awsConfig), nil
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

func main() {

	client, err := createS3Client(getS3Config())
	if err != nil {
		log.Fatalf("unable to create S3 service", err)
	}

}
