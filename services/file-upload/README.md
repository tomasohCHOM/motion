# File Upload Microservice

NOTE: This document was (mostly) AI generated.  

A Go-based microservice for handling file uploads to AWS S3 or MinIO, designed for integration with frontend applications.

## Features

- **Multi-storage Support**: Seamlessly switch between AWS S3 (production) and MinIO (local development)
- **Presigned URL Generation**: Secure direct-to-storage uploads without routing files through the service
- **Upload Verification**: Confirm and track upload completion
- **Status Tracking**: Check upload status and retrieve file information
- **Health Checks**: Built-in health endpoints for load balancer integration
- **CORS Support**: Configured for frontend integration
- **Clean Architecture**: Modular design with interfaces for easy testing and extension

## Architecture

```
Frontend → Load Balancer → Go Service → S3/MinIO
```

The service generates presigned URLs allowing frontend applications to upload directly to storage, reducing server load and improving upload performance.

## Project Structure

```
services/file-upload/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── interfaces/
│   │   └── storage.go          # Storage interface definitions
│   ├── storage/
│   │   ├── s3.go               # AWS S3 implementation
│   │   └── minio.go            # MinIO implementation
│   ├── clients/
│   │   └── clients.go          # Storage client factory
│   ├── services/
│   │   └── upload.go           # Business logic layer
│   ├── handlers/
│   │   └── upload.go           # HTTP request handlers
│   ├── models/
│   │   └── upload.go           # Request/response models
│   └── config/
│       └── config.go           # Configuration management
└── go.mod                      # Go module dependencies
```

## API Endpoints

### `POST /upload/presigned`
Generate a presigned URL for file upload.

**Request Body:**
```json
{
  "filename": "example.jpg",
  "content_type": "image/jpeg",
  "user_id": "user123",
  "file_size": 1048576
}
```

**Response:**
```json
{
  "upload_url": "https://bucket.s3.amazonaws.com/uploads/user123/1234567890_example.jpg?...",
  "key": "uploads/user123/1234567890_example.jpg",
  "expires_in": 900
}
```

### `POST /upload/complete`
Notify the service of upload completion.

**Request Body:**
```json
{
  "key": "uploads/user123/1234567890_example.jpg",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "file_url": "https://bucket.s3.amazonaws.com/uploads/user123/1234567890_example.jpg",
  "size": 1048576,
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

### `GET /upload/status?key=<file_key>`
Check the status of an upload.

**Response:**
```json
{
  "key": "uploads/user123/1234567890_example.jpg",
  "status": "completed",
  "file_url": "https://bucket.s3.amazonaws.com/uploads/user123/1234567890_example.jpg",
  "size": 1048576,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### `GET /health`
Health check endpoint for load balancers.

**Response:**
```json
{
  "status": "healthy",
  "service": "file-upload"
}
```

## Configuration

The service is configured via environment variables:

### Server Configuration
- `PORT`: Server port (default: 8080)
- `ENVIRONMENT`: Runtime environment (development/production)

### Storage Configuration
- `STORAGE_PROVIDER`: Storage backend ("s3" or "minio")
- `STORAGE_BUCKET`: Bucket name for file uploads
- `AWS_REGION`: AWS region (for S3)

### MinIO Configuration (Local Development)
- `MINIO_ENDPOINT`: MinIO server endpoint (default: localhost:9000)
- `MINIO_ROOT_USER`: MinIO access key (default: minioadmin)
- `MINIO_ROOT_PASSWORD`: MinIO secret key (default: minioadmin)
- `MINIO_USE_SSL`: Use SSL for MinIO connections (default: false)

## Local Development

### Prerequisites
- Go 1.24+
- Docker and Docker Compose

### Setup
1. Start MinIO and the service:
   ```bash
   docker compose up -d
   ```

2. The service will be available at `http://localhost:8080`
3. MinIO console will be available at `http://localhost:9001` (admin/admin)

### Running Tests
```bash
just test
```

### Testing with xh

You can use [`xh`](https://github.com/ducaale/xh) to interact with the API endpoints during local development.

**Health Check**
```bash
xh :8080/health
```

**Generate Presigned URL**
```bash
xh POST :8080/upload/presigned filename='example.jpg' content_type='image/jpeg' user_id='user123' fileSize:=1048576
```

**Notify Upload Completion**
```bash
xh POST :8080/upload/complete key='uploads/user123/1678886400_example.jpg' user_id='user123'
```

### Building
```bash
# Build binary
just build

# Build Docker image
docker build -t file-upload:latest .
```

## Production Deployment

### AWS Infrastructure
The service is designed to be deployed on AWS ECS with:
- Application Load Balancer for traffic distribution
- ECS Fargate for serverless container hosting
- Auto Scaling for handling variable loads
- S3 for file storage

### Environment Setup
```bash
export STORAGE_PROVIDER=s3
export STORAGE_BUCKET=your-production-bucket
export AWS_REGION=us-west-2
export ENVIRONMENT=production
export PORT=8080
```

## Frontend Integration

### JavaScript Example
```javascript
// 1. Get presigned URL
const response = await fetch('/upload/presigned', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    content_type: file.type,
    user_id: getCurrentUserId(),
    file_size: file.size
  })
});

const { upload_url, key } = await response.json();

// 2. Upload directly to storage
await fetch(upload_url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. Notify completion
await fetch('/upload/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key,
    user_id: getCurrentUserId()
  })
});
```

### Upload Progress Tracking
The presigned URL approach allows for native browser upload progress tracking:

```javascript
const xhr = new XMLHttpRequest();
xhr.upload.onprogress = (event) => {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    console.log(`Upload ${percentComplete.toFixed(2)}% complete`);
  }
};

xhr.open('PUT', upload_url);
xhr.send(file);
```

## Security Considerations

- **File Size Limits**: Configurable maximum file size validation
- **File Type Validation**: Content-type checking and validation
- **Presigned URL Expiry**: Short-lived URLs (15 minutes default)
- **User Authentication**: Integrate with your authentication system
- **CORS Configuration**: Properly configure allowed origins for production

## Monitoring and Logging

- Health check endpoint for load balancer monitoring
- Structured logging for observability
- Error tracking and alerting integration points
- Metrics collection ready (add your preferred metrics library)

## Contributing

1. Follow Go conventions and best practices
2. Add tests for new functionality
3. Update documentation for API changes
4. Use conventional commit messages

## Dependencies

### Core Dependencies
- `github.com/aws/aws-sdk-go-v2` - AWS SDK for S3 operations
- `github.com/minio/minio-go/v7` - MinIO client for local development
- `github.com/gorilla/mux` - HTTP router and URL matcher

### Development Dependencies
- Docker and Docker Compose for local development
- Go testing framework for unit tests
