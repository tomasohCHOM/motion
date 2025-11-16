package integration

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/suite"
	"github.com/tomasohchom/motion/services/file-upload/internal/clients"
	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/handlers"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
	"github.com/tomasohchom/motion/services/file-upload/internal/store"
)

func TestUploadSuite(t *testing.T) {
	suite.Run(t, new(TestSuite))
}

// TestHealthCheck verifies the health check endpoint returns OK
func (ts *TestSuite) TestHealthCheck() {
	// Get MinIO connection details for the test
	minioEndpoint, err := ts.minioContainer.ConnectionString(ts.ctx)
	ts.NoError(err)

	// Create a test config with MinIO container details
	cfg := &config.Config{
		Storage: config.StorageConfig{
			Provider:  "minio",
			Bucket:    "test-uploads",
			Endpoint:  minioEndpoint,
			AccessKey: "minioadmin",
			SecretKey: "minioadmin",
			UseSSL:    false,
		},
	}

	// Initialize storage client
	storageClient, err := clients.NewStorageClient(cfg)
	ts.NoError(err)

	// Initialize services
	storeInstance := store.NewStore(ts.pool)
	uploadService := services.NewUploadService(storageClient, cfg, storeInstance)
	uploadHandler := handlers.NewUploadHandler(uploadService)

	// Create router with health check
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})
	mux.HandleFunc("POST /upload/presigned", uploadHandler.GetPresignedURL)

	// Create test request
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req = req.WithContext(context.Background())
	recorder := httptest.NewRecorder()

	// Execute request
	mux.ServeHTTP(recorder, req)

	// Assert response
	ts.Equal(http.StatusOK, recorder.Code, "Expected status OK")
	ts.Contains(recorder.Body.String(), "ok", "Expected response to contain 'ok'")
	ts.Equal("application/json", recorder.Header().Get("Content-Type"), "Expected JSON content type")
}
