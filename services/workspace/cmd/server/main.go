package main

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/tomasohchom/motion/services/workspace/internal/config"
	"github.com/tomasohchom/motion/services/workspace/internal/handlers"
)

func main() {
	cfg := config.Load()
	mux := http.NewServeMux()

	var err error
	var conn *pgx.Conn
	conn, err = pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	for err != nil {
		log.Printf("WARNING: Unable to connect to database: %v\n", err)
		log.Printf("Trying again in 5 seconds...")
		time.Sleep(time.Second * 5)
		conn, err = pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
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
