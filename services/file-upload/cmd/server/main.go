package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/rs/cors"

	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
)

var (
	uploadHandler *handlers.UploadHandler
	handlerMu     sync.RWMutex
)

func main() {

	log.SetPrefix("[SERVER] ")
	cfg := config.Load()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}

			storageClient, err := clients.NewStorageClient(cfg)
			if err == nil && storageClient.IsOnline() {
				log.Printf("Successfully created and connected to %s storage client\n", cfg.Storage.Provider)
				uploadService := services.NewUploadService(storageClient, cfg)

				handlerMu.Lock()
				uploadHandler = handlers.NewUploadHandler(uploadService, cfg)
				handlerMu.Unlock()
				return // Exit goroutine on successful connection
			}

			errMsg := "an unknown error occurred"
			if err != nil {
				errMsg = err.Error()
			}
			log.Printf("WARNING: Unable to connect to storage provider: %v", errMsg)
			log.Printf("Trying again in 5 seconds...")
			time.Sleep(5 * time.Second)
		}
	}()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		handlerMu.RLock()
		currentHandler := uploadHandler
		handlerMu.RUnlock()

		if currentHandler != nil {
			currentHandler.HealthCheck(w, r)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "storage not ready"})
		}
	})

	mux.HandleFunc("POST /upload/presigned", uploadHandler.GetPresignedURL)
	mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // modify for production
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false, // enable in production
		MaxAge:           300,   // preflight cache duration in seconds
		Debug:            true,  // disable in production
	})

	handler := c.Handler(mux)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)

	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
