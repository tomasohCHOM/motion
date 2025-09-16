package main

import (
	"context"
	"log"

	// "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"

	// "github.com/aws/aws-sdk-go-v2/credentials"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
	minioURL := "http://localhost:9000"
	accessKey := "minioadmin"
	secretKey := "minioadmin"
	region := "us-west-1"

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	/* s3Client = */
	s3.NewFromConfig(cfg)
	log.Printf("%s %s %s\n", minioURL, accessKey, secretKey)
}
