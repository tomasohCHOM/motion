package config

import (
	"os"
	// "strconv"
)

type Config struct {
	Port        string
	Environment string
	DbEndpoint  string
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8081"),
		Environment: getEnv("ENV", "development"),
		DbEndpoint:  getEnv("DATABASE_URL", "postgres://root@database:5432"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

// func getBoolEnv(key string, defaultValue bool) bool {
// 	if value := os.Getenv(key); value != "" {
// 		if parsed, err := strconv.ParseBool(value); err == nil {
// 			return parsed
// 		}
// 	}
//
// 	return defaultValue
// }
