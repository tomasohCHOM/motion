package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

func main() {

	cfg := config.Load()
	storageClient, err := clients.NewStorageClient(cfg)
	if err != nil {
		log.Fatalf("Failed to create storage client: %v", err)
	}

	uploadService := services.NewUploadService(storageClient, cfg)
	uploadHandler := handlers.NewUploadHandler(uploadService, cfg)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", uploadHandler.HealthCheck)
	mux.HandleFunc("POST /health", uploadHandler.GetPresignedURL)
	mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)

	var addr string
	if port := os.Getenv("PORT"); port == "" {
		addr = ":8080"
	} else {
		addr = fmt.Sprintf(":%s", port)
	}

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
