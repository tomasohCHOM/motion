package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"

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

	// Start db in seperate thread
	go func() {
		var err error
		for {
			connMu.Lock()
			conn, err = pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
			connMu.Unlock()

			if err == nil {
				log.Println("Successfully connected to database")
				defer func() {
					connMu.Lock()
					if conn != nil {
						conn.Close(context.Background())
					}
					connMu.Unlock()
				}()
				break
			}

			log.Printf("WARNING: Unable to connect to database: %v\n", err)
			log.Printf("Trying again in 5 seconds...")
			time.Sleep(time.Second * 5)
		}

	}()

	defer conn.Close(context.Background())

	mux.HandleFunc("GET /health", handlers.HealthCheck)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
