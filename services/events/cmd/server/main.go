package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	cfg "github.com/tomasohchom/motion/services/events/internal/config"
	"github.com/tomasohchom/motion/services/events/internal/handlers"
	notify "github.com/tomasohchom/motion/services/events/internal/notify"
	"github.com/tomasohchom/motion/services/events/internal/store"
)

func main() {
	conf := cfg.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, conf.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer pool.Close()

	// init store
	st := store.New(pool)
	if err := st.Init(context.Background()); err != nil {
		log.Fatalf("failed to init store: %v", err)
	}
	h := handlers.New(st, notify.New(conf.NotificationEndpoint), conf.CreateAllowedRoles)

	r := chi.NewRouter()

	// CORS
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "X-User-Id", "X-User-Roles"},
		ExposedHeaders:   []string{"Location"},
		AllowCredentials: false,
	}).Handler)

	r.Route("/projects/{projectId}", func(r chi.Router) {
		r.Post("/events", h.CreateEvent)
		r.Get("/events", h.ListEvents)
	})

	addr := fmt.Sprintf(":%s", conf.Port)
	log.Printf("events service listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
