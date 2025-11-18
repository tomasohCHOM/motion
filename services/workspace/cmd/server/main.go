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
	"github.com/tomasohchom/motion/services/workspace/internal/middleware"
	"github.com/tomasohchom/motion/services/workspace/internal/services"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type Route struct {
	Method  string
	Path    string
	Handler http.HandlerFunc
}

func registerRoutes(mux *http.ServeMux, routes []Route) {
	for _, r := range routes {
		mux.HandleFunc(fmt.Sprintf("%s %s", r.Method, r.Path), middleware.AuthMiddleware(r.Handler))
	}
}

func main() {
	cfg := config.Load()
	clerk.SetKey(cfg.ClerkKey)
	mux := http.NewServeMux()
	var (
		pool   *pgxpool.Pool
		poolMu sync.RWMutex
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start db in seperate thread
	go func() {
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

		userService := services.NewUserService(store)
		userHandler := handlers.NewUserHandler(userService)
		registerRoutes(mux, []Route{
			{"POST", "/users", userHandler.CreateUser},
			{"GET", "/users/", userHandler.GetUser},
		})
		log.Println("User handler routes registered")

		workspaceService := services.NewWorkspaceService(store)
		workspaceHandler := handlers.NewWorkspaceHandler(workspaceService)
		registerRoutes(mux, []Route{
			{"POST", "/workspaces", workspaceHandler.CreateWorkspace},
			{"GET", "/workspaces/{id}", workspaceHandler.GetWorkspaceById},
			{"GET", "/users/{user_id}/workspaces", workspaceHandler.ListUserWorkspaces},
		})
		log.Println("Workspace handler routes registered")

		noteService := services.NewNoteService(store)
		noteHandler := handlers.NewNoteHandler(noteService)
		registerRoutes(mux, []Route{
			{"POST", "/workspaces/{workspace_id}/notes", noteHandler.CreateNote},
			{"GET", "/workspaces/{workspace_id}/notes", noteHandler.ListNotes},
			{"GET", "/workspaces/{workspace_id}/notes/{note_id}", noteHandler.GetNote},
			{"PATCH", "/workspaces/{workspace_id}/notes/{note_id}", noteHandler.UpdateNote},
			{"DELETE", "/workspaces/{workspace_id}/notes/{note_id}", noteHandler.DeleteNote},
		})
		log.Println("Note handler routes registered")

		inviteSerive := services.NewInviteService(store)
		inviteHandler := handlers.NewInviteHandler(inviteSerive)
		registerRoutes(mux, []Route{
			{"POST", "/workspaces/{workspaceId}/invites", inviteHandler.CreateUserInvite},
			{"GET", "/users/{user_id}/invites", inviteHandler.ListUserInvites},
			{"POST", "/invites/{invite_id}/accept", inviteHandler.AcceptInvite},
			{"POST", "/invites/{invite_id}/decline", inviteHandler.DeclineInvite},
			{"DELETE", "/invites/{invite_id}", inviteHandler.DeleteInvite},
		})
		log.Println("Invite handler routes registered")

		taskService := services.NewTaskService(store)
		taskHandler := handlers.NewTaskHandler(taskService)
		registerRoutes(mux, []Route{
			{"POST", "/workspaces/{workspaceId}/tasks", taskHandler.CreateNewTask},
			{"GET", "/workspaces/{workspaceId}/tasks", taskHandler.GetWorkspaceTasks},
			{"GET", "/tasks/{task_id}", taskHandler.GetTask},
			{"PATCH", "/tasks/{task_id}", taskHandler.UpdateTask},
			{"DELETE", "/tasks/{task_id}", taskHandler.DeleteTask},
		})
		log.Println("Task handler routes registered")

		eventService := services.NewEventService(store)
		eventHandler := handlers.NewEventHandler(eventService)
		registerRoutes(mux, []Route{
			{"POST", "/workspaces/{workspace_id}/events", eventHandler.CreateEvent},
			{"GET", "/workspaces/{workspace_id}/events", eventHandler.ListWorkspaceEvents},
			{"GET", "/workspaces/{workspace_id}/events/{event_id}", eventHandler.GetEvent},
			{"PUT", "/workspaces/{workspace_id}/events/{event_id}", eventHandler.UpdateEvent},
			{"DELETE", "/workspaces/{workspace_id}/events/{event_id}", eventHandler.DeleteEvent},
			{"GET", "/events/color", eventHandler.GetEventColor},
		})
		log.Println("Event handler routes registered")
	}()

	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		}, // modify for production
		AllowOriginRequestFunc: func(_ *http.Request, origin string) bool {
			return true // allow any origin in dev; tighten for prod
		},
		AllowedMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowedHeaders: []string{
			"*",
			"Content-Type",
			"Authorization",
			"X-Dev-UserID",
		},
		AllowCredentials:   false, // enable in production
		MaxAge:             300,   // preflight cache duration in seconds
		Debug:              true,  // disable in production
		OptionsPassthrough: false,
	})

	handler := c.Handler(mux)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
