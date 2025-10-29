package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

func main() {
	log.SetPrefix("[SERVER] ")
	cfg := config.Load()

	// Setup storage client ========================================================================
	storageClient, err := clients.NewStorageClient(cfg)
	if err != nil {
		log.Fatalf("Failed to create %s storage client: %v", cfg.Storage.Provider, err)
	}
	log.Printf("Successfully created %s storage client\n", cfg.Storage.Provider)

	// Setup metadata store ========================================================================

	// Setup api server ============================================================================
	uploadService := services.NewUploadService(storageClient, cfg)
	uploadHandler := handlers.NewUploadHandler(uploadService, cfg)
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		storageOnline := storageClient.IsOnline()

		if storageOnline {
			handlers.HealthCheck(w, r)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "storage offline"})
		}
	})
	mux.HandleFunc("POST /upload/presigned", uploadHandler.GetPresignedURL)
	mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)

	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.Server.AllowedOrigins, // from CORS_ALLOWED_ORIGINS
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false, // enable in production
		MaxAge:           300,   // preflight cache duration in seconds
		Debug:            cfg.Server.Environment == "development",
	})

	handler := c.Handler(mux)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
