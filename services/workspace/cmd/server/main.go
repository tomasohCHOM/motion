package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"context"
	"github.com/jackc/pgx/v5"

	"github.com/tomasohchom/motion/services/workspace/internal/config"
	"github.com/tomasohchom/motion/services/workspace/internal/handlers"

)

func main() {
	cfg := config.Load()
	mux := http.NewServeMux()

	conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())
	log.Println("Successfully connected to database")

	mux.HandleFunc("GET /health", handlers.HealthCheck)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
