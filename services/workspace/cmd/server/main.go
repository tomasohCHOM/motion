package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/tomasohchom/motion/services/workspace/internal/config"
	"github.com/tomasohchom/motion/services/workspace/internal/handlers"

)

func main() {
	cfg := config.Load()
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handlers.HealthCheck)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
