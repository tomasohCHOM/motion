#!/usr/bin/env bash
set -e

SKIP_BUILD=false
REMOVE_VOLUMES=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h | --help | help)
      echo "Usage: $0 [-h|--help|help]"
      echo "Run with no arguments to spin everything up."
      echo ""
      echo "Options:"
      echo "  --skip-build      Skip docker compose up build process"
      echo "  --remove-volumes  Remove docker volumes during cleanup"
      exit 0
      ;;
    --remove-volumes)
      REMOVE_VOLUMES=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# This script is extensible - if you want to add some service, just spin it up somewhere in this
# script and append its PID to this PIDS array.
# If it uses docker compose, just reference in in the root `compose.yaml` file.
PIDS=()

# shellcheck disable=SC2317
cleanup() {
  echo "Stopping everything..."

  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  DOWN_CMD="docker compose down"
  if [ "$REMOVE_VOLUMES" = true ]; then
    DOWN_CMD="$DOWN_CMD -v"
  fi
  
  echo "Running down command: $DOWN_CMD"
  $DOWN_CMD

  exit 0
}

# Runs `cleanup` on exit
trap cleanup SIGINT SIGTERM EXIT

echo "Starting backend services..."

UP_CMD="docker compose up -d"
if [ ! "$SKIP_BUILD" = true ]; then
  UP_CMD="$UP_CMD --build"
fi
$UP_CMD

echo "Starting frontend..."
cd frontend
npm install && npm run dev &
PIDS+=($!)

# Wait for any process to exit and then trigger cleanup
wait
exit $?
