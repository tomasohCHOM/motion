package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"github.com/tomasohchom/motion/services/workspace/internal/config"
	"github.com/tomasohchom/motion/services/workspace/internal/handlers"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

func main() {
	cfg := config.Load()
	mux := http.NewServeMux()
	clerk.SetKey(cfg.ClerkKey)

	var (
		pool   *pgxpool.Pool
		poolMu sync.RWMutex
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start db in seperate thread
	go func() {
		// db closer
		// defer func() {
		// 	poolMu.Lock()
		// 	if pool != nil {
		// 		pool.Close()
		// 	}
		// 	poolMu.Unlock()
		// }()

		for {
			select {
			case <-ctx.Done():
				return
			default:
			}
			dbpool, err := pgxpool.New(ctx, cfg.DbEndpoint)
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

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		poolMu.RLock()
		dbConnected := pool != nil
		poolMu.RUnlock()

		if dbConnected {
			handlers.HealthCheck(w, r)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "DB not ready"})
		}
	})

	go func() {
		for {
			poolMu.RLock()
			ready := pool != nil
			poolMu.RUnlock()
			if ready {
				break
			}
			time.Sleep(time.Second)
		}

		poolMu.RLock()
		store := store.NewStore(pool)
		poolMu.RUnlock()

		userHandler := handlers.NewUserHandler(store)
		mux.HandleFunc("POST /users/create", userHandler.CreateUserHandler)
		log.Println("User handler routes registered")
	}()

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
