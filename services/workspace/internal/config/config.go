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
		DbEndpoint:  getEnv("DATABASE_URL", "postgres://root@database:5432"),
		ClerkKey:    getEnv("CLERK_API_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
