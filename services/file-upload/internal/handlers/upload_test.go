package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/mocks"
	"github.com/tomasohchom/motion/services/file-upload/internal/services"
	"github.com/tomasohchom/motion/services/file-upload/internal/store"
)

func TestMakeBucket(t *testing.T) {
	cfg := &config.Config{
		Storage: config.StorageConfig{
			Bucket: "test-bucket",
			Region: "us-east-1",
		},
	}

	mockStorage := &mocks.MockStorageClient{}
	uploadService := services.NewUploadService(mockStorage, cfg, &store.Store{})
	_ = NewUploadHandler(uploadService)

	// Assert that the MakeBucket function on the mock storage client was called
	if !mockStorage.MakeBucketCalled {
		t.Error("expected MakeBucket to be called, but it was not")
	}
}

func TestHealthCheck(t *testing.T) {
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	HealthCheck(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	expected := map[string]string{"status": "healthy"}
	var actual map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &actual); err != nil {
		t.Fatalf("could not unmarshal response body: %v", err)
	}

	if !reflect.DeepEqual(expected, actual) {
		t.Errorf("handler returned unexpected body: got %v want %v",
			actual, expected)
	}
}
