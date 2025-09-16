/**
 * Stuff for configuting and creating S3 clients
 */

package main

import (
	"context"
	"os"
	"math/rand"

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

func GetS3Config() S3Config {
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

func generateRandomString(length uint) string {
	ran_str := make([]byte, length)
	for i := 0; i < int(length); i++ {
		ran_str[i] = byte(65 + rand.Intn(25))
	}

	return string(ran_str)
}

func GetTestS3Config() S3Config {
	return S3Config{
		Endpoint: "http://localhost:9000",
		Region: "us-east-1",
		AccessKey: "minioadmin",
		SecretKey: "minioadmin",
		UseSSL: false,
		BucketName: "test-bucket-" + generateRandomString(8),
	}
}

func CreateS3Client(cfg S3Config) (*s3.Client, error) {
	var awsConfig aws.Config
	var err error

	if cfg.Endpoint != "" {
		awsConfig, err = config.LoadDefaultConfig(context.TODO(),
			config.WithRegion(cfg.Region),
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
