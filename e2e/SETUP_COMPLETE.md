# E2E Test Setup - Complete

## ✅ What Has Been Set Up

### 1. Docker Compose Configuration

- **Location**: `e2e/docker-compose.yaml`
- **Services**: Workspace service, File upload service, PostgreSQL databases, MinIO
- **Ports**: Isolated ports (8080, 8081, 5434, 5435, 9002) to avoid conflicts
- **Health Checks**: All services have health checks
- **Storage**: tmpfs for databases (fast cleanup)

### 2. Playwright Configuration

- **Location**: `e2e/playwright.config.ts`
- **Features**: Automatic frontend server startup, proper environment variables, CI/local support
- **Browsers**: Chromium (Firefox/WebKit can be enabled)
- **Reporting**: HTML reports, GitHub reporter for CI

### 3. GitHub Actions Workflow

- **Location**: `.github/workflows/e2e.yml`
- **Triggers**: Push to main/develop, pull requests, manual dispatch
- **Features**: Service startup, test execution, artifact upload, cleanup

### 4. Helper Utilities

- **API Helpers**: `e2e/helpers/api-helpers.ts` - Functions to interact with backend services
- **Fixtures**: `e2e/helpers/fixtures.ts` - Playwright fixtures for test setup
- **Test Examples**: `e2e/tests/app.spec.ts` - Example tests

### 5. Scripts

- **start-services.sh**: Start backend services
- **stop-services.sh**: Stop and cleanup services
- **run-migrations.sh**: Placeholder for migrations
- **wait-for-services.sh**: Wait for services to be ready

### 6. Documentation

- **README.md**: Comprehensive guide for running tests
- **SUMMARY.md**: Overview of the setup
- **SETUP_COMPLETE.md**: This file

## 🚀 Quick Start

### Local Testing

```bash
cd e2e
npm install
npm run install:browsers
npm run test:local
```

### Manual Setup

```bash
# Terminal 1: Start services
cd e2e
npm run services:start

# Terminal 2: Start frontend (optional - Playwright can do this)
cd ../frontend
VITE_WORKSPACE_SERVICE_URL=http://localhost:8081 \
VITE_FILES_SERVICE_URL=http://localhost:8080 \
VITE_ENV=development \
VITE_DEV_USER_ID=test-user-123 \
npm run dev

# Terminal 3: Run tests
cd e2e
npm test
```

## 📋 Important Notes

### Database Migrations

⚠️ **Migrations are not automatically run**. You need to:

1. Run migrations manually before tests, OR
2. Add migration running to the service startup, OR
3. Use an init container in docker-compose to run migrations

Example migration setup:

```bash
# Install golang-migrate or use psql
# Then run migrations for each service
```

### Existing Workflow

⚠️ There's an existing `playwright.yml` workflow that might conflict. You should:

1. **Option A**: Remove the old workflow if you're using the new `e2e.yml`
2. **Option B**: Keep both if they serve different purposes (update triggers)

### Service Ports

Make sure these ports are available:

- `3000`: Frontend
- `8080`: File upload service
- `8081`: Workspace service
- `5434`: Workspace database
- `5435`: File upload database
- `9002`: MinIO API
- `9003`: MinIO Console

### Authentication

- Uses `X-Dev-UserID` header for development mode
- No Clerk authentication required for E2E tests
- Default test user: `test-user-123`

## 🔧 Configuration

### Environment Variables

Frontend (set automatically by Playwright):

- `VITE_WORKSPACE_SERVICE_URL`: `http://localhost:8081`
- `VITE_FILES_SERVICE_URL`: `http://localhost:8080`
- `VITE_ENV`: `development`
- `VITE_DEV_USER_ID`: `test-user-123`

Backend (set in docker-compose.yaml):

- Workspace: Development mode, no Clerk key
- File upload: MinIO storage, development mode
- Databases: Test credentials

### Playwright Configuration

- Test directory: `./tests`
- Base URL: `http://localhost:3000`
- Retries: 2 on CI, 0 locally
- Timeouts: 10s actions, 30s navigation

## 🧪 Writing Tests

### Using Fixtures

```typescript
import { test, expect } from "../helpers/fixtures";

test("should create workspace", async ({ page, userId, workspace }) => {
  // userId and workspace are automatically created
  await page.goto(`/workspace/${workspace.id}`);
  await expect(page.getByText(workspace.name)).toBeVisible();
});
```

### Using API Helpers

```typescript
import { createTestUser, createTestWorkspace } from "../helpers/api-helpers";

test("should upload file", async ({ page }) => {
  const userId = "test-user-123";
  await createTestUser(userId);
  // Test file upload...
});
```

## 🐛 Troubleshooting

### Services Won't Start

1. Check ports are available
2. Check Docker is running
3. View logs: `npm run services:logs`
4. Rebuild: `docker compose -f docker-compose.yaml up --build`

### Tests Timeout

1. Check services are healthy
2. Increase timeouts in playwright.config.ts
3. Check network connectivity

### Frontend Won't Start

1. Check dependencies: `npm install` in frontend
2. Check environment variables
3. Check port 3000 is available

## 📚 Next Steps

1. **Run Migrations**: Set up automatic migration running
2. **Add Tests**: Expand test coverage
3. **Mock Services**: Add mocks for external APIs
4. **Performance**: Add performance tests
5. **Visual Regression**: Add visual regression testing
6. **Accessibility**: Add accessibility tests

## 📖 Documentation

- **README.md**: Full documentation
- **SUMMARY.md**: Setup overview
- **Playwright Docs**: https://playwright.dev/
- **Docker Compose Docs**: https://docs.docker.com/compose/

## 🎯 Recommendations

1. **Remove old workflow**: Consider removing `playwright.yml` if using `e2e.yml`
2. **Add migrations**: Set up automatic migration running
3. **Add more tests**: Expand test coverage based on features
4. **CI optimization**: Consider caching Docker images
5. **Parallel execution**: Enable parallel test execution when possible
6. **Test data management**: Implement proper test data cleanup

## ✅ Checklist

- [x] Docker Compose configuration
- [x] Playwright configuration
- [x] GitHub Actions workflow
- [x] Helper utilities
- [x] Test examples
- [x] Documentation
- [ ] Database migrations (needs setup)
- [ ] Remove/update old workflow
- [ ] Add more tests
- [ ] Set up test data cleanup

## 🎉 You're Ready!

The E2E test setup is complete and ready to use. Start writing tests and run them locally or in CI!

For questions or issues, refer to the README.md or check the troubleshooting section.
