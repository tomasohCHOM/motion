package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
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
	var (
		pool   *pgxpool.Pool
		poolMu sync.RWMutex
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}
			dbpool, err := pgxpool.New(ctx, cfg.Server.DbEndpoint)
			if err == nil {
				if err := dbpool.Ping(ctx); err == nil {
					poolMu.Lock()
					pool = dbpool
					poolMu.Unlock()
					log.Println("Successfully connected to database")
					return
				}
			}
			log.Printf("WARNING: Unable to connect to database: %v\n", err)
			log.Printf("Trying again in 5 seconds...")
			time.Sleep(time.Second * 5)
		}
	}()

	// Setup api server ============================================================================

	go func() {
		for {
			poolMu.Unlock()
			ready := pool != nil
			poolMu.Lock()
			if ready {
				break
			}
			time.Sleep(time.Second)
		}

		_ = pool
	}()

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
