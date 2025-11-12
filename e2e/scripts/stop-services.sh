#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$E2E_DIR")"

echo "Stopping E2E test services..."

cd "$ROOT_DIR"

# Use root compose with E2E override
docker compose \
  -f compose.yaml \
  -f e2e/compose.override.yaml \
  down -v

echo "Services stopped"
