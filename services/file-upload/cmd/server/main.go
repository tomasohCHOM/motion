package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

func main() {

	log.SetPrefix("[SERVER] ")
	cfg := config.Load()
	storageClient, err := clients.NewStorageClient(cfg)
	if err != nil {
		log.Fatalf("Failed to create %s storage client: %v", cfg.Storage.Provider, err)
	}
	log.Printf("Successfully created %s storage client\n", cfg.Storage.Provider)

	if !storageClient.IsOnline() {
		log.Printf("WARNING: %s storage provider is offline", cfg.Storage.Provider)
	}



	uploadService := services.NewUploadService(storageClient, cfg)
	uploadHandler := handlers.NewUploadHandler(uploadService, cfg)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", uploadHandler.HealthCheck)
	mux.HandleFunc("POST /upload/presigned", uploadHandler.GetPresignedURL)
	mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)

	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
