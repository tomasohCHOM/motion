#!/usr/bin/env bash
set -e

case "$1" in
-h | --help | help)
  echo "Usage: $0 [-h|--help|help]"
  echo "Run with no arguments to spin everything up! All process will be cleaned up automatically."
  exit 0
  ;;
esac

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
  docker compose down -v
  exit 0
}

# Runs `cleanup` on exit
trap cleanup SIGINT SIGTERM EXIT

echo "Starting backend services..."
docker compose up -d

echo "Starting frontend..."
cd frontend
npm install && npm run dev &
PIDS+=($!)

# Wait for any process to exit and then trigger cleanup
wait
exit $?
