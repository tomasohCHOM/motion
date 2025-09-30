package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

func checkMinIOConnection(cfg *config.Config) error {
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(fmt.Sprintf("http://%s/minio/health/live", cfg.Storage.Endpoint))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unhealthy status: %d", resp.StatusCode)
	}
	return nil
}

func main() {

	log.SetPrefix("[SERVER] ")
	cfg := config.Load()
	storageClient, err := clients.NewStorageClient(cfg)
	if err != nil {
		log.Fatalf("Failed to create %s storage client: %v", cfg.Storage.Provider, err)
	}
	log.Printf("Successfully created %s storage client\n", cfg.Storage.Provider)

	if cfg.Storage.Provider == "minio" {
		if err := checkMinIOConnection(cfg); err != nil {
			log.Printf("MinIO connection failed: %v", err)
		}
	}
	log.Println("Successfully connected to MinIO")

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
