package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Server  ServerConfig
	Storage StorageConfig
}

type ServerConfig struct {
	Port           string
	Environment    string
	AllowedOrigins []string
}

type StorageConfig struct {
	Provider string // "s3" or "minio"
	Bucket   string
	Region   string
	// MinIO specific
	Endpoint  string
	AccessKey string
	SecretKey string
	UseSSL    bool
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:           getEnv("PORT", "8080"),
			Environment:    getEnv("ENV", "development"),
			AllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"*"}),
		},
		Storage: StorageConfig{
			Provider:  getEnv("STORAGE_PROVIDER", "minio"),
			Bucket:    getEnv("STORAGE_BUCKET", "uploads"),
			Region:    getEnv("AWS_REGION", "us-east-1"),
			Endpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey: getEnv("MINIO_ROOT_USER", "minioadmin"),
			SecretKey: getEnv("MINIO_ROOT_PASSWORD", "minioadmin"),
			UseSSL:    getBoolEnv("MINIO_USE_SSL", false),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}

	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}

	return defaultValue
}
