# Motion - All-in-One Workspace Platform

Motion is a TypeScript React frontend with Go microservices backend and Terraform infrastructure. It provides workspace management with features including Kanban boards, notes, chat, file sharing, and project planning.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Quick Start (New Clone)
- **ALWAYS run these commands first** on a fresh clone:
  ```bash
  cd frontend
  npm install  # Takes ~6 seconds
  npm run build  # Takes ~10 seconds - NEVER CANCEL
  npm run test  # Takes ~1 second
  ```

### Prerequisites 
- **Node.js v20.19.5 and npm 10.8.2** (for frontend)
- **Go 1.24.6+** (for backend services)
- **Terraform v1.7.0+** (for infrastructure)
- **Just** (task runner for Go services)

### Frontend Development
- **Install dependencies**: `npm install` in `/frontend` -- takes 6 seconds clean, 18 seconds with cache miss
- **Development server**: `npm run dev` -- starts on http://localhost:3000 in ~1 second
- **Build**: `npm run build` -- takes 10 seconds. NEVER CANCEL. Set timeout to 30+ seconds
- **Test**: `npm run test` -- takes 1 second using Vitest
- **Lint**: `npm run lint` -- takes 5 seconds, may show warnings (not errors)
- **Format**: `npm run format` -- takes 1 second using Prettier
- **Check (format + lint)**: `npm run check` -- takes 6 seconds, runs format then lint with fixes

### Go Services Development
- **File Upload Service** (in `/services/file-upload`):
  - `just build` -- takes 30 seconds first time (downloads dependencies), <1 second subsequent builds. NEVER CANCEL
  - `just fmt` -- formats code, takes <1 second
  - `just vet` -- runs go vet, takes <1 second
  - `just serve` -- builds and runs the service (requires AWS configuration)
  - `just clean` -- removes build artifacts
  - `just check` -- runs staticcheck (requires AWS setup to complete)

- **API Gateway Service** (in `/services/api-gateway`):
  - Currently minimal - only contains go.mod
  - Use standard Go commands: `go build`, `go fmt`, `go vet`

### Infrastructure Development
- **Initialize**: `terraform init -backend=false` -- takes 7 seconds without backend, 10 seconds with AWS backend. NEVER CANCEL
- **Format**: `terraform fmt` -- auto-formats .tf files
- **Format check**: `terraform fmt -check` -- returns exit code 3 if files need formatting
- **Validate**: `terraform validate` -- takes 2 seconds, checks syntax and configuration
- **Plan**: `terraform plan` -- requires AWS credentials and S3 backend setup

## Validation Scenarios

### ALWAYS Test These After Making Changes:
1. **Frontend Complete Workflow**:
   ```bash
   cd frontend
   npm install
   npm run check  # format + lint
   npm run test
   npm run build
   npm run dev  # verify starts without errors, then Ctrl+C
   ```

2. **Frontend User Interface Testing**:
   - Start dev server with `npm run dev`
   - Navigate to http://localhost:3000
   - Test landing page loads correctly
   - Click "Start for free" → should navigate to /workspace/1
   - Test Manager (Kanban board) → should show task columns (To Do, In Progress, Review, Done)
   - Test Notes → should show "All Notes" page with search functionality
   - Verify no console errors in browser dev tools

3. **Go Services Workflow**:
   ```bash
   cd services/file-upload
   just fmt
   just build  # First time: 30 seconds, subsequent: <1 second
   # Binary should be created at bin/file-upload
   ls -la bin/  # Verify binary exists (~10MB)
   ```

4. **Infrastructure Workflow**:
   ```bash
   cd infrastructure
   terraform fmt
   terraform init -backend=false
   terraform validate
   ```

### Production Validation
- **Always run** `npm run check` before committing frontend changes
- **Always run** `just fmt` before committing Go changes
- **Always run** `terraform fmt` before committing infrastructure changes
- CI will fail if code is not properly formatted

## Key Architecture Components

### Frontend (`/frontend`)
- **Framework**: React 19 with TanStack Router for routing
- **Styling**: Tailwind CSS v4 with Shadcn/ui components
- **State Management**: TanStack Store for global state
- **Build Tool**: Vite 6 with TypeScript
- **Testing**: Vitest with @testing-library/react
- **Key Features**: Kanban board task manager, notes system, workspace navigation

### Backend Services (`/services`)
- **file-upload**: Go service for handling file uploads to S3/MinIO storage
- **api-gateway**: Minimal Go service (placeholder)
- **Build Tool**: Just for task automation

### Infrastructure (`/infrastructure`)
- **Terraform modules** for AWS and Vercel deployment
- **S3 backend** for state storage (requires setup)
- **Vercel frontend** deployment configuration
- **AWS services** for backend microservices

## Common File Locations

### Configuration Files
- `frontend/package.json` -- npm scripts and dependencies
- `frontend/vite.config.ts` -- Vite and TanStack Router config
- `frontend/eslint.config.js` -- ESLint with TanStack config
- `frontend/prettier.config.js` -- Prettier formatting rules
- `frontend/vitest.config.ts` -- Test configuration
- `services/file-upload/justfile` -- Go build tasks
- `infrastructure/backend.tf` -- Terraform S3 backend config
- `infrastructure/variables.tf` -- Terraform input variables

### Key Source Files
- `frontend/src/routes/` -- TanStack Router file-based routing
- `frontend/src/components/workspace/manager/` -- Kanban board components
- `frontend/src/components/workspace/` -- Main workspace UI components
- `frontend/src/static/workspace/manager.ts` -- Mock task data
- `services/file-upload/main.go` -- File upload service entry point

## Timing Expectations & Warnings

- **Frontend npm install**: 6 seconds clean, up to 18 seconds cache miss
- **Frontend build**: 10 seconds - **NEVER CANCEL, set 30+ second timeout**
- **Frontend tests**: 1 second - very fast
- **Frontend dev server**: 1 second to start
- **Go build (first time)**: 30 seconds - **NEVER CANCEL, set 60+ second timeout**
- **Go build (subsequent)**: <1 second - very fast once dependencies cached
- **Terraform init**: 7-10 seconds - **NEVER CANCEL, set 30+ second timeout**
- **Terraform validate**: 2 seconds

## AWS & External Dependencies

### Required for Full Infrastructure
- **AWS Account** with S3 bucket `motion-terraform-state-69`
- **Vercel API Token** stored in AWS Secrets Manager
- **Database passwords** stored in AWS Secrets Manager
- **Without AWS**: Use `terraform init -backend=false` for local development

### Not Required for Frontend Development
- Frontend can be developed and tested completely without AWS
- All UI functionality works with mock data
- Use `npm run dev` for local development

## Troubleshooting

### Frontend Issues
- **Build fails**: Check Node.js version (requires v20.19.5+)
- **Dev server won't start**: Check if port 3000 is available
- **Lint warnings**: Use `npm run check` to auto-fix, warnings are acceptable

### Go Issues  
- **Build fails**: Ensure Go 1.24.6+ installed and GOPATH set
- **Dependencies fail**: Run `go mod download` manually
- **Service fails to start**: Requires AWS configuration (expected for local dev)

### Infrastructure Issues
- **Init fails**: Check if using S3 backend, use `-backend=false` for local
- **Format fails**: Run `terraform fmt` to auto-fix

### Common Commands Reference
```bash
# Frontend development cycle
cd frontend && npm install && npm run check && npm run test && npm run build

# Go development cycle  
cd services/file-upload && just fmt && just build

# Infrastructure development cycle
cd infrastructure && terraform fmt && terraform init -backend=false && terraform validate

# Quick validation
cd frontend && npm run dev  # Test in browser, then Ctrl+C
```