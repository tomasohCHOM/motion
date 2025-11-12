#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starting E2E test services..."

cd "$E2E_DIR"

# Start Docker Compose services
docker compose -f docker-compose.yaml up -d --build

# Wait for services to be healthy
echo "Waiting for services to be ready..."
timeout=120
elapsed=0

while [ $elapsed -lt $timeout ]; do
  if curl -f -s http://localhost:8081/health > /dev/null 2>&1 && \
     curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "All services are ready!"
    exit 0
  fi
  sleep 2
  elapsed=$((elapsed + 2))
  echo "Waiting for services... (${elapsed}s/${timeout}s)"
done

echo "Services failed to start within $timeout seconds"
docker compose -f docker-compose.yaml logs
exit 1

