package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/rs/cors"

	"github.com/tomasohchom/motion/services/workspace/internal/config"
	"github.com/tomasohchom/motion/services/workspace/internal/handlers"
)

func main() {
	cfg := config.Load()
	mux := http.NewServeMux()

	var (
		conn   *pgx.Conn
		connMu sync.RWMutex
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start db in seperate thread
	go func() {
		// db closer
		defer func() {
			connMu.Lock()
			if conn != nil {
				conn.Close(context.Background())
			}
			connMu.Unlock()
		}()

		for {
			select {
			case <-ctx.Done():
				return
			default:
			}

			c, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
			if err == nil {
				connMu.Lock()
				conn = c
				connMu.Unlock()
				log.Println("Successfully connected to database")
				return
			}

			log.Printf("WARNING: Unable to connect to database: %v\n", err)
			log.Printf("Trying again in 5 seconds...")
			time.Sleep(time.Second * 5)
		}

	}()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		connMu.RLock()
		dbConnected := conn != nil
		connMu.RUnlock()

		if dbConnected {
			handlers.HealthCheck(w, r)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "DB not ready"})
		}
	})

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // modify for production
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false, // enable in production
		MaxAge:           300,   // preflight cache duration in seconds
		Debug:            true,  // disable in production
	})

	handler := c.Handler(mux)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
