#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"

echo "Stopping E2E test services..."

cd "$E2E_DIR"

# Stop and remove Docker Compose services
docker compose -f docker-compose.yaml down -v

echo "Services stopped"

