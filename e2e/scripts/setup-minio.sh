#!/bin/bash
set -e

# Setup MinIO bucket using Docker exec
# This script is run inside the MinIO container or via docker exec

MC_ALIAS="local"
MINIO_ENDPOINT="http://localhost:9002"
MINIO_USER="minioadmin"
MINIO_PASSWORD="minioadmin"
BUCKET_NAME="test-uploads"

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
for i in {1..30}; do
  if curl -f -s "$MINIO_ENDPOINT/minio/health/live" > /dev/null 2>&1; then
    echo "MinIO is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "MinIO failed to start"
    exit 1
  fi
  sleep 2
done

# Setup MinIO client and create bucket
docker compose -f docker-compose.yaml exec -T minio mc alias set $MC_ALIAS http://localhost:9000 $MINIO_USER $MINIO_PASSWORD || true
docker compose -f docker-compose.yaml exec -T minio mc mb $MC_ALIAS/$BUCKET_NAME || true
docker compose -f docker-compose.yaml exec -T minio mc anonymous set download $MC_ALIAS/$BUCKET_NAME || true

echo "MinIO bucket '$BUCKET_NAME' is ready"

