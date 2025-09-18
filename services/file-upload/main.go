package main

import (
	"log"
)

func main() {

	client, err := CreateS3Client(GetS3Config())
	if err != nil {
		log.Fatalf("unable to create S3 service: %v", err)
	}

	_ = client
}
