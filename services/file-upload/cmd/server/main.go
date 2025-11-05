package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
	"github.com/tomasohchom/motion/services/file-upload/internal/store"
)

func main() {
	log.SetPrefix("[SERVER] ")
	if err := run(); err != nil {
		log.Fatalf("Application error: %v", err)
	}
}

func run() error {
	cfg := config.Load()
	ctx := context.Background()

	// Setup storage client ========================================================================
	storageClient, err := clients.NewStorageClient(cfg)
	if err != nil {
		return fmt.Errorf("Failed to create %s storage client: %v", cfg.Storage.Provider, err)
	}
	// TODO: create a defered shutdown func
	log.Printf("Successfully created %s storage client\n", cfg.Storage.Provider)

	// Setup metadata storage ======================================================================
	pool, err := connectWithRetry(ctx, cfg.Server.DbEndpoint, 10, 5*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer pool.Close()
	log.Println("Successfully connected to database")

	// Setup api server ============================================================================
	// Services
	store := store.NewStore(pool)
	uploadService := services.NewUploadService(storageClient, cfg, store)
	uploadHandler := handlers.NewUploadHandler(uploadService)

	// Router
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", healthCheckHandler(storageClient))
	mux.HandleFunc("POST /upload/presigned", uploadHandler.GetPresignedURL)
	mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)
	mux.HandleFunc("GET /files", uploadHandler.ListFiles)
	mux.HandleFunc("GET /users/{user_id}/files", uploadHandler.ListFiles)
	// mux.HandleFunc("GET /workspaces/{workspace_id}/files", uploadHandler.ListFiles)


	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.Server.AllowedOrigins, // from CORS_ALLOWED_ORIGINS
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false, // enable in production
		MaxAge:           300,   // preflight cache duration in seconds
		Debug:            cfg.Server.Environment == "development",
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.Server.Port),
		Handler: c.Handler(mux),
	}

	serverErrors := make(chan error, 1)
	go func() {
		log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", srv.Addr)
		serverErrors <- srv.ListenAndServe()
	}()

	// Wait for interrupt signal
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Block until error or shutdown signal
	select {
	case err := <-serverErrors:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return fmt.Errorf("server error: %w", err)
		}
	case sig := <-shutdown:
		log.Printf("Received signal %v, starting graceful shutdown", sig)

		// Give outstanding requests 30s to complete
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			srv.Close()
			return fmt.Errorf("server shutdown error: %w", err)
		}
		log.Println("Server gracefully stopped")
	}

	return nil
}

// connectWithRetry attempts to connect to the database with exponential backoff
func connectWithRetry(ctx context.Context, connString string, maxRetries int,
	retryInterval time.Duration) (*pgxpool.Pool, error) {
	var pool *pgxpool.Pool
	var err error

	for i := range maxRetries {
		pool, err = pgxpool.New(ctx, connString)
		if err == nil {
			if err = pool.Ping(ctx); err == nil {
				return pool, nil
			}
			pool.Close()
		}

		if i < maxRetries-1 {
			log.Printf("WARNING: Unable to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
			log.Printf("Retrying in %v...", retryInterval)
			time.Sleep(retryInterval)
		}
	}

	return nil, fmt.Errorf("failed to connect after %d attempts: %w", maxRetries, err)
}

// healthCheckHandler returns a handler that checks both storage and responds appropriately
func healthCheckHandler(storageClient interface{ IsOnline() bool }) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if storageClient.IsOnline() {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
		} else {
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "storage offline"})
		}
	}
}
