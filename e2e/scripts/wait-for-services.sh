#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Waiting for services to be ready...${NC}"

# Function to check if a service is ready
check_service() {
  local name=$1
  local url=$2
  local max_attempts=30
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -f -s "$url" > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC} $name is ready"
      return 0
    fi
    echo -e "${YELLOW}Waiting for $name... (attempt $attempt/$max_attempts)${NC}"
    sleep 2
    attempt=$((attempt + 1))
  done

  echo -e "${RED}✗${NC} $name failed to start after $max_attempts attempts"
  return 1
}

# Wait for services
check_service "Workspace Service" "http://localhost:8081/health"
check_service "File Upload Service" "http://localhost:8080/health"

# Initialize MinIO bucket if it doesn't exist
echo -e "${YELLOW}Initializing MinIO bucket...${NC}"
if command -v mc &> /dev/null; then
  mc alias set local http://localhost:9002 minioadmin minioadmin 2>/dev/null || true
  mc mb local/test-uploads 2>/dev/null || true
  mc anonymous set download local/test-uploads 2>/dev/null || true
  echo -e "${GREEN}✓${NC} MinIO bucket initialized"
else
  echo -e "${YELLOW}⚠${NC} MinIO client (mc) not found, skipping bucket initialization"
  echo -e "${YELLOW}  You may need to create the 'test-uploads' bucket manually${NC}"
fi

echo -e "${GREEN}All services are ready!${NC}"

