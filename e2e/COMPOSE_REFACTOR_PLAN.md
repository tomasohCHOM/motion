# Docker Compose Refactoring Plan for E2E Tests

## Current Situation

- **Root compose.yaml**: Includes `services/workspace/compose.yaml` and `services/file-upload/compose.yaml`
- **E2E compose.yaml**: Duplicates all service definitions with test-specific configurations
- **Problem**: Duplication, maintenance burden, inconsistencies

## Proposed Solution

Use Docker Compose's **multiple compose files** feature to override existing services with E2E-specific configurations.

### Approach: Compose Override Pattern

Docker Compose supports specifying multiple compose files:

```bash
docker compose -f compose.yaml -f override.yaml up
```

Files are merged in order, with later files overriding earlier ones.

## Implementation Strategy

### Option 1: E2E Override File (Recommended)

Create `e2e/docker-compose.override.yaml` that only contains:

- Port overrides (to avoid conflicts with dev)
- Environment variable overrides (test credentials, tmpfs)
- Additional services (minio-setup)
- Volume overrides (tmpfs instead of named volumes)

**Usage:**

```bash
# From project root
docker compose -f compose.yaml -f e2e/docker-compose.override.yaml up
```

**Pros:**

- Minimal code duplication
- Reuses all existing service definitions
- Easy to maintain
- Clear separation of concerns

**Cons:**

- Requires running from project root (or adjusting paths)
- Need to handle service name conflicts (workspace has `database`, file-upload has `database`)

### Option 2: E2E-Specific Compose with Includes

Create `e2e/docker-compose.yaml` that:

- Includes the root compose.yaml
- Overrides specific services
- Adds E2E-specific services

**Usage:**

```bash
# From e2e directory
docker compose -f ../compose.yaml -f docker-compose.override.yaml up
```

**Pros:**

- Can be run from e2e directory
- Still reuses existing definitions
- Clear E2E context

**Cons:**

- Still need to handle service name conflicts

### Option 3: Environment-Based Compose (Most Flexible)

Modify existing compose files to support environment variables:

- Use `${TEST_MODE}` or `${ENV}` to conditionally configure
- E2E compose file sets environment variables
- Existing compose files adapt based on environment

**Pros:**

- Single source of truth
- Works for dev, test, and other environments
- Most maintainable long-term

**Cons:**

- Requires modifying existing compose files
- More complex configuration
- Need to ensure backward compatibility

## Recommended Implementation: Option 1 with Service Name Resolution

### Step 1: Rename Services in Root Compose

Modify service compose files to use unique service names:

- `services/workspace/compose.yaml`: `database` → `workspace-db`
- `services/file-upload/compose.yaml`: `database` → `file-upload-db`

This avoids conflicts when both are included.

### Step 2: Create E2E Override File

Create `e2e/docker-compose.override.yaml`:

```yaml
services:
  # Override workspace database
  workspace-db:
    ports:
      - "5434:5432" # Different port for E2E
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: test_db
    volumes: [] # Remove named volume
    tmpfs:
      - /var/lib/postgresql

  # Override file-upload database
  file-upload-db:
    ports:
      - "5435:5432" # Different port for E2E
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: test_db
    volumes: [] # Remove named volume
    tmpfs:
      - /var/lib/postgresql

  # Override MinIO
  minio:
    ports:
      - "9002:9000" # Different ports for E2E
      - "9003:9001"
    volumes: [] # Remove named volume
    tmpfs:
      - /data

  # Override workspace service
  workspace-service:
    environment:
      PORT: "8081"
      ENV: "development"
      DATABASE_URL: "postgres://test:testpassword@workspace-db:5432/test_db"
      CLERK_SECRET_KEY: ""
    depends_on:
      workspace-db:
        condition: service_healthy

  # Override file-upload service
  file-upload-service:
    environment:
      PORT: "8080"
      ENV: "development"
      DATABASE_URL: "postgres://test:testpassword@file-upload-db:5432/test_db"
      STORAGE_PROVIDER: "minio"
      STORAGE_BUCKET: "test-uploads"
      MINIO_ENDPOINT: "minio:9000"
      MINIO_ROOT_USER: "minioadmin"
      MINIO_ROOT_PASSWORD: "minioadmin"
      MINIO_USE_SSL: "false"
      CORS_ALLOWED_ORIGINS: "http://localhost:3000"
    depends_on:
      file-upload-db:
        condition: service_healthy
      minio:
        condition: service_healthy

  # Add E2E-specific services
  minio-setup:
    image: minio/mc:latest
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: /bin/sh
    command: -c "
      mc alias set local http://minio:9000 minioadmin minioadmin &&
      mc mb local/test-uploads || true &&
      mc anonymous set download local/test-uploads || true &&
      echo 'MinIO bucket initialized'"
    restart: "no"
```

### Step 3: Update Scripts

Update `e2e/scripts/start-services.sh`:

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$E2E_DIR")"

echo "Starting E2E test services..."

cd "$ROOT_DIR"

# Use root compose with E2E override
docker compose \
  -f compose.yaml \
  -f e2e/docker-compose.override.yaml \
  up -d --build

# Wait for services (same as before)
# ...
```

### Step 4: Update GitHub Actions

Update `.github/workflows/e2e.yml`:

```yaml
- name: Start backend services
  working-directory: ./
  run: |
    docker compose \
      -f compose.yaml \
      -f e2e/docker-compose.override.yaml \
      up -d --build
```

## Required Changes to Existing Compose Files

### 1. Update `services/workspace/compose.yaml`

```yaml
services:
  workspace-db: # Renamed from 'database'
    image: postgres:latest
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: password
      POSTGRES_DB: dev_db
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d dev_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - db-data:/var/lib/postgresql

  workspace-service:
    build: .
    ports:
      - "8081:8081"
    environment:
      DATABASE_URL: postgres://dev:password@workspace-db:5432/dev_db
    env_file:
      - .env
    depends_on:
      workspace-db: # Updated reference
        condition: service_healthy

volumes:
  db-data:
```

### 2. Update `services/file-upload/compose.yaml`

```yaml
services:
  file-upload-db: # Renamed from 'database'
    image: postgres:latest
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: password
      POSTGRES_DB: dev_db
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d dev_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - db-data:/var/lib/postgresql

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  file-upload-service:
    build: .
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgres://dev:password@file-upload-db:5432/dev_db
    depends_on:
      file-upload-db: # Updated reference
        condition: service_healthy
      minio:
        condition: service_healthy

volumes:
  minio_data:
  db-data:
```

## Benefits

1. **Reduced Duplication**: ~80% less code in E2E compose file
2. **Single Source of Truth**: Service definitions live in service directories
3. **Easier Maintenance**: Changes to services automatically apply to E2E
4. **Clear Separation**: E2E override only contains test-specific changes
5. **Backward Compatible**: Dev setup continues to work as before

## Migration Steps

1. ✅ Rename database services in existing compose files
2. ✅ Update service references (DATABASE_URL, depends_on)
3. ✅ Create E2E override file with only differences
4. ✅ Update E2E scripts to use root compose + override
5. ✅ Update GitHub Actions workflow
6. ✅ Test locally and in CI
7. ✅ Remove old E2E compose file

## Considerations

### Service Name Conflicts

- **Solution**: Rename services to be unique (workspace-db, file-upload-db)
- **Impact**: Need to update DATABASE_URL and depends_on references

### Volume Management

- **Dev**: Uses named volumes (persistent)
- **E2E**: Uses tmpfs (ephemeral, fast cleanup)
- **Solution**: Override volumes in E2E override file

### Port Conflicts

- **Dev**: 5432, 5433, 9000, 9001, 8080, 8081
- **E2E**: 5434, 5435, 9002, 9003, 8080, 8081 (services same, DBs different)
- **Solution**: Override ports in E2E override file

### Environment Variables

- **Dev**: Uses .env files and defaults
- **E2E**: Uses test credentials and explicit values
- **Solution**: Override environment in E2E override file

## Alternative: Use Profiles

Docker Compose supports profiles to conditionally include services:

```yaml
# In root compose
services:
  workspace-db:
    profiles: ["dev", "e2e"]
    # ...

# In E2E override
services:
  workspace-db:
    profiles: ["e2e"]  # Only in E2E profile
    # E2E-specific config
```

**Usage:**

```bash
docker compose --profile e2e -f compose.yaml -f e2e/docker-compose.override.yaml up
```

This allows even more fine-grained control but adds complexity.

## Recommendation

**Use Option 1 (Override File) with service name resolution** because:

- Minimal changes to existing code
- Maximum code reuse
- Clear and maintainable
- Works well with Docker Compose's merge strategy

The main change needed is renaming the database services to avoid conflicts, which is a one-time change that improves clarity anyway.
