# E2E Test Setup Summary

## What We've Created

### 1. Docker Compose Configuration (`docker-compose.yaml`)

- **Workspace Service**: Port 8081, with PostgreSQL database (port 5434)
- **File Upload Service**: Port 8080, with PostgreSQL database (port 5435) and MinIO (port 9002)
- **MinIO Setup**: Automatic bucket creation for test uploads
- **Health Checks**: All services have health checks to ensure they're ready
- **Temporary Storage**: Databases use tmpfs for fast cleanup between test runs

### 2. Playwright Configuration (`playwright.config.ts`)

- Configured to run tests against `http://localhost:3000`
- Automatically starts frontend dev server with proper environment variables
- Supports CI and local execution
- Includes retry logic, screenshots, and video recording on failure

### 3. GitHub Actions Workflow (`.github/workflows/e2e.yml`)

- Runs on push to `main`/`develop` and on pull requests
- Sets up Node.js, Docker, and all dependencies
- Starts services, runs tests, and uploads artifacts
- Includes proper cleanup and error handling

### 4. Helper Utilities

- **API Helpers** (`helpers/api-helpers.ts`): Functions to interact with backend services
- **Fixtures** (`helpers/fixtures.ts`): Playwright fixtures for automatic test setup
- **Test Examples** (`tests/app.spec.ts`): Example tests showing how to use the setup

### 5. Scripts

- **start-services.sh**: Starts all backend services
- **stop-services.sh**: Stops and cleans up services
- **run-migrations.sh**: Placeholder for running database migrations
- **wait-for-services.sh**: Waits for services to be ready

### 6. Documentation (`README.md`)

- Comprehensive guide for running tests locally
- CI/CD documentation
- Troubleshooting guide
- Best practices

## Key Features

### Service Isolation

- Each service has its own database
- Services run on different ports to avoid conflicts
- Uses tmpfs for databases (fast cleanup, no persistence)

### Development Mode Authentication

- Uses `X-Dev-UserID` header for authentication in development mode
- No Clerk authentication required for E2E tests
- Default test user ID: `test-user-123`

### Automatic Service Management

- Playwright automatically starts the frontend
- Docker Compose manages backend services
- Health checks ensure services are ready before tests run

### Test Data Management

- Fixtures automatically create test users and workspaces
- Cleanup functions available (commented out by default for debugging)
- Each test gets a unique user ID to avoid conflicts

## How It Works

### Local Execution

1. Run `npm run test:local` in the `e2e` directory
2. Scripts start Docker Compose services
3. Services wait for health checks to pass
4. Playwright starts frontend dev server
5. Tests run against the full stack
6. Services are cleaned up after tests

### CI Execution

1. GitHub Actions checks out code
2. Sets up Node.js and Docker
3. Starts services using Docker Compose
4. Waits for services to be healthy
5. Playwright starts frontend and runs tests
6. Artifacts (reports, videos) are uploaded
7. Services are cleaned up

## Environment Variables

### Frontend (set by Playwright)

- `VITE_WORKSPACE_SERVICE_URL`: `http://localhost:8081`
- `VITE_FILES_SERVICE_URL`: `http://localhost:8080`
- `VITE_ENV`: `development`
- `VITE_DEV_USER_ID`: `test-user-123`

### Backend Services (set in docker-compose.yaml)

- Workspace service: Development mode, no Clerk key required
- File upload service: MinIO storage, development mode
- Databases: Test credentials, tmpfs storage

## Ports Used

- `3000`: Frontend (Vite dev server)
- `8080`: File upload service
- `8081`: Workspace service
- `5434`: Workspace database
- `5435`: File upload database
- `9002`: MinIO API
- `9003`: MinIO Console

## Important Notes

### Database Migrations

- Migrations need to be run manually or via a migration tool
- The `run-migrations.sh` script is a placeholder
- Consider adding migration running to the service startup or docker-compose

### Service Dependencies

- Workspace service depends on workspace-db
- File upload service depends on file-upload-db and MinIO
- MinIO setup depends on MinIO being healthy
- All services have health checks to ensure proper startup order

### Test Data

- Test data is created per test using fixtures
- Cleanup is optional (commented out for debugging)
- Each test gets a unique user ID based on timestamp

## Next Steps

1. **Run Migrations**: Set up automatic migration running (e.g., using golang-migrate or init containers)
2. **Add More Tests**: Expand test coverage based on your application features
3. **Mock External Services**: Add mocks for external APIs (e.g., Clerk in production mode)
4. **Performance Testing**: Add performance tests if needed
5. **Visual Regression**: Consider adding visual regression testing
6. **Accessibility Testing**: Add accessibility tests using Playwright's accessibility features

## Troubleshooting

See the main `README.md` for detailed troubleshooting steps. Common issues:

- Port conflicts: Ensure ports are available
- Service health: Check service logs
- Database connections: Verify database URLs and credentials
- Frontend startup: Check environment variables and dependencies
