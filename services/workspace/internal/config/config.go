package config

import (
	"os"
)

type Config struct {
	Port        string
	Environment string
	DbEndpoint  string
	ClerkKey    string
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8081"),
		Environment: getEnv("ENV", "development"),
		DbEndpoint:  getEnv("DATABASE_URL", "postgres://dev:password@workspace-db:5432/dev_db"),
		ClerkKey:    getEnv("CLERK_SECRET_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
