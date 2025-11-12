# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the Motion application using Playwright.

## Overview

The E2E test setup includes:

- **Backend Services**: Workspace service and File-upload service running in Docker containers
- **Frontend**: React application running on Vite dev server
- **Test Framework**: Playwright with TypeScript
- **Infrastructure**: Docker Compose for orchestrating services

## Architecture

```
┌─────────────────┐
│   Playwright    │
│     Tests       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │
│  (localhost:3000)│
└────────┬────────┘
         │
         ├──► Workspace Service (localhost:8081)
         │    └──► PostgreSQL (port 5434)
         │
         └──► File Upload Service (localhost:8080)
              ├──► PostgreSQL (port 5435)
              └──► MinIO (port 9002)
```

## Prerequisites

1. **Node.js** (>= 22.0.0)
2. **Docker** and **Docker Compose**
3. **npm** (>= 10.5.1)

## Local Development

### Quick Start

1. **Install dependencies**:

   ```bash
   cd e2e
   npm install
   npm run install:browsers
   ```

2. **Start services and run tests**:

   ```bash
   npm run test:local
   ```

   This will:

   - Start all backend services (workspace, file-upload, databases, MinIO)
   - Start the frontend dev server
   - Run Playwright tests
   - Clean up services after tests complete

### Manual Setup

If you want more control over the test process:

1. **Start backend services**:

   ```bash
   npm run services:start
   ```

   This starts:

   - Workspace service on `http://localhost:8081`
   - File upload service on `http://localhost:8080`
   - PostgreSQL databases
   - MinIO object storage

2. **In a separate terminal, start the frontend**:

   ```bash
   cd ../frontend
   npm install
   VITE_WORKSPACE_SERVICE_URL=http://localhost:8081 \
   VITE_FILES_SERVICE_URL=http://localhost:8080 \
   VITE_ENV=development \
   VITE_DEV_USER_ID=test-user-123 \
   npm run dev
   ```

3. **Run tests**:

   ```bash
   cd e2e
   npm test
   ```

4. **Stop services** (when done):
   ```bash
   npm run services:stop
   ```

### Viewing Test Results

- **HTML Report**: After tests complete, run `npm run test:report` to view the HTML report
- **UI Mode**: Run `npm run test:ui` for an interactive test runner
- **Debug Mode**: Run `npm run test:debug` to run tests in debug mode
- **Headed Mode**: Run `npm run test:headed` to see the browser while tests run

### Service Management

```bash
# Start services
npm run services:start

# Stop services
npm run services:stop

# View service logs
npm run services:logs

# Check service status
docker compose -f docker-compose.yaml ps
```

## CI/CD (GitHub Actions)

The E2E tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

### Workflow Steps

1. Checkout code
2. Set up Node.js
3. Install Docker Compose
4. Install frontend and E2E dependencies
5. Install Playwright browsers
6. Start backend services using Docker Compose
7. Wait for services to be healthy
8. Start frontend dev server (handled by Playwright webServer)
9. Run Playwright tests
10. Upload test reports and videos as artifacts
11. Cleanup services

### Viewing CI Results

1. Go to the **Actions** tab in GitHub
2. Select the workflow run
3. View test results in the job logs
4. Download artifacts (test reports, videos) from the workflow run

## Test Structure

```
e2e/
├── tests/              # Test files
│   ├── app.spec.ts    # Main application tests
│   └── example.spec.ts # Example tests
├── helpers/            # Test utilities
│   ├── api-helpers.ts  # API helper functions
│   └── fixtures.ts     # Playwright fixtures
├── scripts/            # Utility scripts
│   ├── start-services.sh
│   └── stop-services.sh
├── docker-compose.yaml # Service orchestration
└── playwright.config.ts # Playwright configuration
```

## Writing Tests

### Using Fixtures

The test fixtures provide automatic setup for common test scenarios:

```typescript
import { test, expect } from "../helpers/fixtures";

test("should create workspace", async ({ page, userId, workspace }) => {
  // userId and workspace are automatically created
  await page.goto(`/workspace/${workspace.id}`);
  await expect(page.getByText(workspace.name)).toBeVisible();
});
```

### API Helpers

Use API helpers to interact with backend services:

```typescript
import {
  createTestUser,
  createTestWorkspace,
  workspaceRequest,
  fileUploadRequest,
} from "../helpers/api-helpers";

test("should upload file", async ({ page }) => {
  const userId = "test-user-123";
  await createTestUser(userId);

  // Test file upload flow
  // ...
});
```

### Environment Variables

The following environment variables can be configured:

- `WORKSPACE_SERVICE_URL`: Workspace service URL (default: `http://localhost:8081`)
- `FILES_SERVICE_URL`: File upload service URL (default: `http://localhost:8080`)
- `DEV_USER_ID`: Test user ID (default: `test-user-123`)
- `PLAYWRIGHT_BASE_URL`: Frontend URL (default: `http://localhost:3000`)

## Configuration

### Playwright Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (Firefox and WebKit can be enabled)
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML reporter, GitHub reporter on CI

### Docker Compose Configuration

The `docker-compose.yaml` file defines:

- **Workspace Service**: Port 8081, connects to workspace-db
- **File Upload Service**: Port 8080, connects to file-upload-db and MinIO
- **Databases**: PostgreSQL instances with tmpfs for fast cleanup
- **MinIO**: Object storage with automatic bucket creation

## Troubleshooting

### Services Won't Start

1. **Check ports**: Ensure ports 3000, 8080, 8081, 5434, 5435, 9002 are available
2. **Check Docker**: Ensure Docker is running
3. **Check logs**: Run `npm run services:logs` to see service logs
4. **Rebuild**: Try `docker compose -f docker-compose.yaml up --build`

### Tests Timeout

1. **Check services**: Ensure all services are healthy
2. **Increase timeout**: Adjust timeouts in `playwright.config.ts`
3. **Check network**: Ensure services are accessible from the test runner

### Frontend Won't Start

1. **Check dependencies**: Run `npm install` in the frontend directory
2. **Check environment variables**: Ensure all required env vars are set
3. **Check port**: Ensure port 3000 is available

### Database Connection Issues

1. **Check database health**: Ensure databases are healthy in Docker
2. **Check connection strings**: Verify DATABASE_URL in docker-compose.yaml
3. **Check migrations**: Ensure database migrations have run

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on other tests
2. **Clean Up**: Use fixtures to automatically clean up test data
3. **Use Wait Strategies**: Always wait for elements to be visible/ready
4. **Avoid Hard Waits**: Use Playwright's built-in waiting mechanisms
5. **Test User Flows**: Focus on testing complete user workflows
6. **Mock External Services**: Mock external APIs when possible
7. **Keep Tests Fast**: Use tmpfs for databases to speed up cleanup

## Debugging

### Local Debugging

1. **Run in headed mode**: `npm run test:headed`
2. **Use UI mode**: `npm run test:ui`
3. **Use debug mode**: `npm run test:debug`
4. **Add breakpoints**: Use `await page.pause()` in tests

### CI Debugging

1. **Check logs**: Review workflow logs for errors
2. **Download artifacts**: Download test reports and videos
3. **Check service logs**: Review service logs in the workflow
4. **Reproduce locally**: Try to reproduce CI failures locally

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
