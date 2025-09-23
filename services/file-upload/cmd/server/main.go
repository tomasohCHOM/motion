package main

import (
	"log"
	"net/http"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
)

func main() {

	cfg := config.Load()
	mux := http.NewServeMux()
	// uploadHandler := handlers.NewUploadHandler(cfg)
	// mux.HandleFunc("GET /health", handlers.HealthCheck)
	// mux.HandleFunc("POST /health", uploadHandler.GetPresignedURL)
	// mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
