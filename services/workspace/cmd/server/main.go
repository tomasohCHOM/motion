package main

import (
	// "fmt"
	"log"
	// "net/http"

)

func main() {
	log.Printf("hi mom")

	// cfg := config.Load()
	//
	// uploadService := services.NewUploadService(storageClient, cfg)
	// uploadHandler := handlers.NewUploadHandler(uploadService, cfg)
	// mux := http.NewServeMux()
	// mux.HandleFunc("GET /health", uploadHandler.HealthCheck)
	// mux.HandleFunc("POST /upload/presigned", uploadHandler.GetPresignedURL)
	// mux.HandleFunc("POST /upload/complete", uploadHandler.CompleteUpload)
	//
	// addr := fmt.Sprintf(":%s", cfg.Server.Port)
	//
	// log.Printf("\033[32mServer started on http://localhost%s\033[0m\n", addr)
	//
	// if err := http.ListenAndServe(addr, mux); err != nil {
	// 	log.Fatalf("Server failed to start: %v", err)
	// }
}
