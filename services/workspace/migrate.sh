#!/bin/bash

# Migration runner script for workspace service
# This script runs all SQL migrations in order

set -e

DB_USER=${POSTGRES_USER:-dev}
DB_PASSWORD=${POSTGRES_PASSWORD:-password}
DB_HOST=${DB_HOST:-workspace-db}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${POSTGRES_DB:-dev_db}

MIGRATIONS_DIR="./migrations"

echo "Waiting for database to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"
echo "Running migrations from $MIGRATIONS_DIR..."

# Get all migration files and sort them
for migration in $(ls -1 "$MIGRATIONS_DIR"/*.up.sql 2>/dev/null | sort); do
  migration_name=$(basename "$migration" .up.sql)
  echo "Running migration: $migration_name"
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration"
done

echo "All migrations completed successfully!"
