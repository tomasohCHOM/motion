# Steps to Refactor E2E Compose to Use Existing Services

## Overview

This document outlines the steps to refactor the E2E test setup to reuse the existing `compose.yaml` files from the workspace and file-upload services, eliminating code duplication.

## Prerequisites

- Docker Compose v2 (supports `include` and multiple compose files)
- Understanding of Docker Compose override pattern

## Step-by-Step Migration

### Step 1: Rename Database Services (Avoid Conflicts)

**File: `services/workspace/compose.yaml`**

- Rename `database` → `workspace-db`
- Update `DATABASE_URL` in workspace-service to reference `workspace-db`
- Update `depends_on` to reference `workspace-db`

**File: `services/file-upload/compose.yaml`**

- Rename `database` → `file-upload-db`
- Update `DATABASE_URL` in file-upload-service to reference `file-upload-db`
- Update `depends_on` to reference `file-upload-db`

**Why?** Both services currently have a service named `database`, which causes conflicts when both are included in the root compose.yaml.

### Step 2: Create E2E Override File

**File: `e2e/docker-compose.override.yaml`**

- Copy from `e2e/docker-compose.override.yaml.example`
- Contains only E2E-specific overrides:
  - Port changes (5434, 5435, 9002, 9003)
  - Test credentials (test/testpassword)
  - tmpfs volumes (instead of named volumes)
  - Environment variable overrides
  - MinIO setup service

### Step 3: Update E2E Scripts

**File: `e2e/scripts/start-services.sh`**

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

# Wait for services (rest of script remains the same)
# ...
```

**File: `e2e/scripts/stop-services.sh`**

```bash
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
  -f e2e/docker-compose.override.yaml \
  down -v

echo "Services stopped"
```

### Step 4: Update GitHub Actions Workflow

**File: `.github/workflows/e2e.yml`**

Update the "Start backend services" step:

```yaml
- name: Start backend services
  working-directory: ./
  run: |
    docker compose \
      -f compose.yaml \
      -f e2e/docker-compose.override.yaml \
      up -d --build
    # Wait for services (rest remains the same)
```

Update the "Cleanup services" step:

```yaml
- name: Cleanup services
  if: always()
  working-directory: ./
  run: |
    docker compose \
      -f compose.yaml \
      -f e2e/docker-compose.override.yaml \
      down -v
```

### Step 5: Update Documentation

**File: `e2e/README.md`**

- Update instructions to mention using root compose + override
- Update service management commands
- Explain the override pattern

### Step 6: Test the Refactoring

1. **Test locally:**

   ```bash
   cd e2e
   npm run services:start
   # Verify services start correctly
   npm run services:stop
   ```

2. **Test E2E tests:**

   ```bash
   cd e2e
   npm run test:local
   # Verify tests run successfully
   ```

3. **Test in CI:**
   - Push changes to a branch
   - Verify GitHub Actions workflow runs successfully
   - Check service logs if issues occur

### Step 7: Clean Up

Once everything works:

- Remove `e2e/docker-compose.yaml` (old file)
- Remove `e2e/docker-compose.override.yaml.example` (or keep as reference)
- Update any remaining references to the old compose file

## Verification Checklist

- [x] Database services renamed (workspace-db, file-upload-db)
- [x] Service references updated (DATABASE_URL, depends_on)
- [x] E2E override file created
- [x] E2E scripts updated to use root compose + override
- [x] GitHub Actions workflow updated
- [ ] Documentation updated
- [ ] Local testing successful
- [ ] E2E tests pass locally
- [ ] CI tests pass
- [ ] Old compose file removed

## Rollback Plan

If issues arise:

1. Keep the old `e2e/docker-compose.yaml` as backup
2. Revert script changes
3. Revert GitHub Actions changes
4. Investigate issues and fix
5. Re-apply refactoring

## Benefits After Refactoring

1. **~80% less code** in E2E compose file
2. **Single source of truth** for service definitions
3. **Automatic updates** when services change
4. **Easier maintenance** - changes propagate automatically
5. **Clear separation** - E2E only contains test-specific overrides

## Common Issues and Solutions

### Issue: Service name conflicts

**Solution:** Ensure database services have unique names (workspace-db, file-upload-db)

### Issue: Volume conflicts

**Solution:** Override volumes in E2E override file (use tmpfs, remove named volumes)

### Issue: Port conflicts

**Solution:** Override ports in E2E override file (use different ports for E2E)

### Issue: Environment variable conflicts

**Solution:** Override environment in E2E override file (use test credentials)

### Issue: Path issues when running from different directories

**Solution:** Use absolute paths or change to project root before running compose

## Next Steps After Refactoring

1. Consider adding health checks to existing compose files (if not present)
2. Consider adding minio-setup to file-upload compose (for dev convenience)
3. Consider using environment variables for configuration (more flexible)
4. Consider adding migration running to service startup
5. Consider adding service profiles for different environments
