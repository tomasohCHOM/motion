package main

import (
	"fmt"
	"log"
	"time"
)

func main() {

	s3Service, err := NewS3Service(GetS3Config())
	if err != nil {
		log.Fatalf("unable to create S3 service: %v", err)
	}

	// 1. Create (Put) an object with a unique key
	testKey := fmt.Sprintf("my-test-object-%d", time.Now().Unix())
	testData := []byte("hello minio!")
	err = s3Service.PutObject(testKey, testData)
	if err != nil {
		log.Fatalf("failed to put object: %v", err)
	}
	log.Printf("Successfully put object with key: %s", testKey)

	// 2. Read (Get) the object back
	retrievedData, err := s3Service.GetObject(testKey)
	if err != nil {
		log.Fatalf("failed to get object: %v", err)
	}
	log.Printf("Successfully retrieved object. Content: '%s'", string(retrievedData))

	// 3. List objects to verify it's there
	objects, err := s3Service.ListObjects()
	if err != nil {
		log.Fatalf("failed to list objects: %v", err)
	}

	log.Println("--- Objects in bucket ---")
	found := false
	for _, obj := range objects {
		log.Printf("- Key: %s, Size: %d", *obj.Key, obj.Size)
		if *obj.Key == testKey {
			found = true
		}
	}
	log.Println("-------------------------")

	if found {
		log.Printf("Verified: Test object '%s' found in bucket list.", testKey)
	} else {
		log.Printf("Error: Test object '%s' NOT found in bucket list.", testKey)
	}

	// 4. Clean up by deleting the object
	err = s3Service.DeleteObject(testKey)
	if err != nil {
		log.Fatalf("failed to delete object: %v", err)
	}
	log.Printf("Successfully deleted object with key: %s", testKey)
}
