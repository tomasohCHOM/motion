package main

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetS3Config_Production(t *testing.T) {
	// Set up production environment
	originalEnv := os.Getenv("ENV")
	originalRegion := os.Getenv("AWS_REGION")
	originalAccessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	originalSecretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	originalBucket := os.Getenv("S3_BUCKET_NAME")

	defer func() {
		// Restore original environment
		os.Setenv("ENV", originalEnv)
		os.Setenv("AWS_REGION", originalRegion)
		os.Setenv("AWS_ACCESS_KEY_ID", originalAccessKey)
		os.Setenv("AWS_SECRET_ACCESS_KEY", originalSecretKey)
		os.Setenv("S3_BUCKET_NAME", originalBucket)
	}()

	// Set production environment variables
	os.Setenv("ENV", "production")
	os.Setenv("AWS_REGION", "us-west-2")
	os.Setenv("AWS_ACCESS_KEY_ID", "test-access-key")
	os.Setenv("AWS_SECRET_ACCESS_KEY", "test-secret-key")
	os.Setenv("S3_BUCKET_NAME", "production-bucket")

	config := GetS3Config()

	assert.Equal(t, "", config.Endpoint)
	assert.Equal(t, "us-west-2", config.Region)
	assert.Equal(t, "test-access-key", config.AccessKey)
	assert.Equal(t, "test-secret-key", config.SecretKey)
	assert.True(t, config.UseSSL)
	assert.Equal(t, "production-bucket", config.BucketName)
}

func TestGetS3Config_Development(t *testing.T) {
	// Set up non-production environment
	originalEnv := os.Getenv("ENV")
	defer func() {
		os.Setenv("ENV", originalEnv)
	}()

	os.Setenv("ENV", "development")

	config := GetS3Config()

	assert.Equal(t, "http://localhost:9000", config.Endpoint)
	assert.Equal(t, "us-east-1", config.Region)
	assert.Equal(t, "minioadmin", config.AccessKey)
	assert.Equal(t, "minioadmin", config.SecretKey)
	assert.False(t, config.UseSSL)
	assert.Equal(t, "test-bucket", config.BucketName)
}

func TestGetTestS3Config(t *testing.T) {
	config := GetTestS3Config()

	assert.Equal(t, "http://localhost:9000", config.Endpoint)
	assert.Equal(t, "us-east-1", config.Region)
	assert.Equal(t, "minioadmin", config.AccessKey)
	assert.Equal(t, "minioadmin", config.SecretKey)
	assert.False(t, config.UseSSL)
	assert.Contains(t, config.BucketName, "test-bucket-")
	assert.Len(t, config.BucketName, len("test-bucket-")+8) // test-bucket- + 8 random chars
}

func TestGenerateRandomString(t *testing.T) {
	// Test different lengths
	lengths := []uint{1, 5, 10, 20}

	for _, length := range lengths {
		result := generateRandomString(length)
		assert.Len(t, result, int(length))

		// Verify all characters are uppercase letters (A-Z)
		for _, char := range result {
			assert.True(t, char >= 'A' && char <= 'Z', "Character %c should be between A and Z", char)
		}
	}

	// Test that multiple calls generate different strings
	str1 := generateRandomString(10)
	str2 := generateRandomString(10)
	// While there's a tiny chance they could be equal, it's extremely unlikely
	assert.NotEqual(t, str1, str2)
}

func TestCreateS3Client_WithEndpoint(t *testing.T) {
	cfg := S3Config{
		Endpoint:   "http://localhost:9000",
		Region:     "us-east-1",
		AccessKey:  "test-key",
		SecretKey:  "test-secret",
		BucketName: "test-bucket",
	}

	client, err := CreateS3Client(cfg)
	assert.NoError(t, err)
	assert.NotNil(t, client)
}

func TestCreateS3Client_WithoutEndpoint(t *testing.T) {
	cfg := S3Config{
		Region:     "us-east-1",
		BucketName: "test-bucket",
	}

	client, err := CreateS3Client(cfg)
	assert.NoError(t, err)
	assert.NotNil(t, client)
}
