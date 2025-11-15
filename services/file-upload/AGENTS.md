# File Upload Service

This document provides context for the File Upload microservice, a component of the broader application.

## High-Level Overview

The File Upload service is a Go-based microservice responsible for managing file uploads. It is designed to be integrated with frontend applications and supports multiple storage backends (AWS S3 for production, MinIO for local development).

Its core functionality is to generate secure, short-lived "presigned URLs". This allows the frontend application to upload files directly to the storage backend, which is more efficient and scalable than proxying the files through the service.

## Tech Stack

- **Language**: Go (version 1.24+)
- **Storage**:
    - AWS S3 (for production)
    - MinIO (for local development)
- **Containerization**: Docker and Docker Compose
- **Key Go Libraries**:
    - `net/http`: Web/routing library
    - `github.com/aws/aws-sdk-go-v2`: For interacting with AWS S3.
    - `github.com/minio/minio-go/v7`: For interacting with MinIO.
    - `github.com/rs/cors`: For Cross-Origin Resource Sharing (CORS) middleware.

## Project Structure

The service follows a clean architecture pattern, separating concerns into different layers:

```
services/file-upload/
├── cmd/server/main.go       # Application entry point
├── internal/
│   ├── config/config.go     # Configuration management
│   ├── handlers/            # HTTP request handlers
│   ├── services/            # Business logic
│   ├── storage/             # Storage backend implementations (S3, MinIO)
│   ├── interfaces/          # Go interfaces for dependency injection
│   ├── models/              # Data models for requests and responses
│   └── clients/             # Storage client factory
├── migrations/              # Database migrations
├── go.mod                   # Go module dependencies
├── Dockerfile               # Docker build instructions
└── compose.yaml             # Docker Compose for local development
```

## Key Components & Logic

- **Presigned URL Generation**: The main business logic is in `internal/services/upload.go`. It generates a presigned URL that allows a client to upload a file directly to the storage provider.
- **Storage Abstraction**: The `internal/storage` directory contains implementations for both S3 and MinIO, which conform to the `storage.Storage` interface defined in `internal/interfaces/storage.go`. This allows for easy swapping of the storage backend.
- **Configuration**: The service is configured via environment variables, as defined in `internal/config/config.go`.
- **API Endpoints**: The public API is defined in `internal/handlers/upload.go`. The key endpoints are:
    - `POST /upload/presigned`: To get a presigned URL.
    - `POST /upload/complete`: To notify the service that an upload is complete.
    - `GET /upload/status`: To check the status of an upload.
    - `GET /health`: For health checks.

## How to Run the Service

1.  **Prerequisites**: Go 1.24+, Docker, Docker Compose.
2.  **Start the service and MinIO**:
    ```bash
    docker compose up -d
    ```
3.  The service will be available at `http://localhost:8080`.
4.  The MinIO console will be available at `http://localhost:9001`.

## How to Test the Service

- **Run unit tests**:
  ```bash
  just test
  ```
- **Manual testing with `xh`**:
  - **Health Check**: `xh :8080/health`
  - **Generate Presigned URL**: `xh POST :8080/upload/presigned filename='test.txt' content_type='text/plain' user_id='123' fileSize:=1024`
  - **Upload File**: Use the `upload_url` from the previous response to `PUT` the file to MinIO.
  - **Complete Upload**: `xh POST :8080/upload/complete key='...' user_id='123'`

## Deployment

The service is designed to be deployed to AWS ECS Fargate, with an Application Load Balancer and S3 for storage. The production environment would be configured with the appropriate environment variables for S3.

## Important Commands

- `just build`: Build the Go binary.
- `docker build -t file-upload:latest .`: Build the Docker image.
- `./tests/e2e/upload_test.sh <file>`: A mock client script to test the upload flow.
