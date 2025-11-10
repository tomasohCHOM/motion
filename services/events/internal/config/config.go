package config

import (
	"os"
	"strings"
)

type Config struct {
	Port                 string
	DatabaseURL          string
	NotificationEndpoint string
	CreateAllowedRoles   []string
}

func Load() *Config {
	return &Config{
		Port:                 getEnv("PORT", "8082"),
		DatabaseURL:          getEnv("DATABASE_URL", "postgres://dev:password@database:5432/dev_db?sslmode=disable"),
		NotificationEndpoint: getEnv("NOTIFICATION_ENDPOINT", ""),
		CreateAllowedRoles:   getEnvAsSlice("EVENTS_CREATE_ALLOWED_ROLES", []string{"owner", "admin", "manager"}),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvAsSlice(key string, def []string) []string {
	if v := os.Getenv(key); v != "" {
		parts := strings.Split(v, ",")
		for i := range parts {
			parts[i] = strings.TrimSpace(parts[i])
		}
		return parts
	}
	return def
}
