## WIP - SUBJECT TO CHANGE

# Motion

A unified workspace for teams—notes, files, planning, and collaboration—delivered as a modern web application with a service‑oriented backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Development](#development)

   * [Frontend](#frontend)
   * [Workspace Service (Go)](#workspace-service-go)
   * [File Upload Service (Go)](#file-upload-service-go)
7. [Configuration Reference](#configuration-reference)
8. [Docker Compose](#docker-compose)
9. [Infrastructure (Terraform)](#infrastructure-terraform)
10. [CI/CD](#cicd)
11. [Coding Standards & Conventions](#coding-standards--conventions)
12. [Troubleshooting](#troubleshooting)
13. [Roadmap](#roadmap)
14. [Contributing](#contributing)
15. [Security](#security)
16. [License](#license)
17. [Acknowledgements](#acknowledgements)

---

## Overview

Motion is an opinionated monorepo that ships a React‑based frontend and two Go services (workspace and file upload). The stack emphasizes strong typing, predictable state management, and cloud portability.

---

## Repository Structure

```text
.
├── frontend/              # React 19 + Vite 6, TanStack (Router/Query/Store), Tailwind v4, shadcn/ui, Clerk
├── services/
│   ├── workspace/         # Go service (Postgres + sqlc): users, teams, workspaces, health
│   └── file-upload/       # Go service (S3/MinIO): presigned uploads, completion, health
├── infrastructure/        # Terraform modules (networking, services, Vercel frontend)
├── .github/workflows/     # CI: frontend, workspace, file-upload, infra, CodeQL
├── compose.yaml           # Top‑level compose, references per‑service compose files
├── dev.sh                 # One‑command local dev (compose + frontend dev server)
├── shell.nix / .envrc     # Optional Nix dev shell
└── README.md              # Project documentation
```

---

## Architecture

* **Frontend**: SPA served by Vite dev server locally; calls backend services via REST.
* **Workspace Service**: Owns users, workspaces, and membership. Postgres for persistence.
* **File Upload Service**: Issues S3/MinIO presigned URLs and records completed uploads.
* **Infrastructure**: Terraform modules target AWS primitives and Vercel for the SPA.

> Default local ports are defined by Docker Compose. The examples below assume:
>
> * Workspace Service at `http://localhost:8081`
> * File Upload Service at `http://localhost:8082`

---

## Prerequisites

* **Docker** and **Docker Compose**
* **Node.js 22.19.0** (see `frontend/.nvmrc`)
* **Go 1.22+** (for direct service runs)
* Optional: **Nix** + **direnv** (dev shell)

---

## Quick Start

### 1) Configure frontend environment

Create `frontend/.env` (or `.env.local`) with at least:

```ini
# Frontend → File Upload service (health, presign, complete)
VITE_FILES_SERVICE_URL="http://localhost:8082"

# Frontend → Workspace service (users, workspaces)
VITE_WORKSPACE_SERVICE_URL="http://localhost:8081"

# Clerk publishable key for browser use
VITE_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
```

### 2) Boot the local stack

```bash
./dev.sh
```

* Starts backend services via Docker Compose
* Launches the frontend dev server at **[http://localhost:3000](http://localhost:3000)**

### 3) Verify health

* Frontend: open `http://localhost:3000`
* Workspace: `GET ${VITE_WORKSPACE_SERVICE_URL}/health`
* File Upload: `GET ${VITE_FILES_SERVICE_URL}/health`

---

## Development

### Frontend

**Stack**: React 19, Vite 6, TanStack Router/Query/Store, Tailwind CSS v4, shadcn/ui (Radix UI), DnD Kit, Clerk

**Common tasks**

```bash
cd frontend
npm ci
npm run dev        # local dev on port 3000
npm run test       # Vitest + Testing Library
npm run lint       # ESLint
npm run format     # Prettier
npm run build      # production build
```

**Routing**: File‑based (TanStack). Generated definitions in `src/routeTree.gen.ts`.

**UI**: Tailwind v4 utility classes with shadcn/ui components. Global styles in `src/styles.css`.

**State**: TanStack Store for predictable state management.

---

### Workspace Service (Go)

**Purpose**: user/workspace CRUD and membership.

**Representative endpoints**

* `GET /health`
* `POST /users` – create user
* `GET /users/{id}` – fetch user
* `POST /workspaces` – create workspace (requires `owner_id`)
* `GET /users/{id}/workspaces` – list a user’s workspaces

**Local run**

```bash
cd services/workspace
go run ./cmd/server
# tests
go test ./...
```

**Data & migrations**: Postgres; migrations in `services/workspace/migrations`.

---

### File Upload Service (Go)

**Purpose**: presigned S3/MinIO uploads + completion callback.

**Endpoints**

* `GET /health`
* `POST /upload/presigned` → `{ upload_url, key }`
* `POST /upload/complete` → finalize/record upload by `key`

**Local run**

```bash
cd services/file-upload
go run ./cmd/server
# tests
go test ./...
```

**Backends**: AWS S3 or MinIO.

---

## Configuration Reference

### Frontend (Vite)

| Variable                     | Description                      | Example                 |
| ---------------------------- | -------------------------------- | ----------------------- |
| `VITE_WORKSPACE_SERVICE_URL` | Base URL for Workspace Service   | `http://localhost:8081` |
| `VITE_FILES_SERVICE_URL`     | Base URL for File Upload Service | `http://localhost:8082` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (browser)  | `pk_test_xxx`           |

### Workspace Service

Environment variables vary by implementation; typical values include:

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | Postgres connection string (or DSN parts) |
| `PORT`         | Service port (matches Compose)            |
| CORS vars      | Allowed origins/headers as needed         |

### File Upload Service

Configure for **S3** or **MinIO**:

**S3**

| Variable                | Description        |
| ----------------------- | ------------------ |
| `AWS_REGION`            | AWS region         |
| `AWS_ACCESS_KEY_ID`     | Access key ID      |
| `AWS_SECRET_ACCESS_KEY` | Secret access key  |
| `S3_BUCKET`             | Target bucket name |

**MinIO**

| Variable           | Description    |
| ------------------ | -------------- |
| `MINIO_ENDPOINT`   | Host:port      |
| `MINIO_ACCESS_KEY` | Access key     |
| `MINIO_SECRET_KEY` | Secret key     |
| `MINIO_BUCKET`     | Bucket name    |
| `MINIO_USE_SSL`    | `true`/`false` |

---

## Docker Compose

The root `compose.yaml` references service‑specific compose files in `services/**/compose.yaml`. Use `./dev.sh` for a streamlined local startup; it orchestrates `docker compose up -d` and the frontend dev server.

---

## Infrastructure (Terraform)

Modular infrastructure under `infrastructure/` targeting AWS and Vercel.

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# optionally: cp production.tfvars.example production.tfvars
terraform init
terraform plan
terraform apply
```

Consult `providers.tf`, `backend.tf`, and each module’s `variables.tf` for required inputs.

---

## CI/CD

GitHub Actions workflows under `.github/workflows/`:

* **Frontend**: lint, format, test, build
* **Workspace**: Go test/build
* **File Upload**: Go test/build
* **Infra**: Terraform fmt/validate/plan
* **Security**: CodeQL analysis

Protect `main` with these required checks for a consistent baseline.

---

## Coding Standards & Conventions

* **Node**: `22.19.0` (`frontend/.nvmrc`)
* **Formatting**: Prettier; ESLint via `@tanstack/eslint-config`
* **Imports**: `@/*` alias to `frontend/src/*`
* **Testing**: Vitest + Testing Library

---

## Troubleshooting

* **Node version mismatch**: run `nvm use` (or enter the Nix shell via `direnv allow`).
* **Auth redirect/loop**: verify `VITE_CLERK_PUBLISHABLE_KEY` and that Clerk routes are reachable.
* **CORS or 404s**: confirm service URLs and that containers are healthy (`/health`).
* **Upload fails after presign**: ensure bucket policy/ACLs and match `Content-Type` on the `PUT` to the presign request.

---

## Roadmap

* API Gateway scaffolding
* Consolidate frontend service calls on `VITE_WORKSPACE_SERVICE_URL`
* Document service ports and compose environment in detail
* Add contribution guide and code of conduct

---

## Contributing

TBD
---

## Security

If you discover a vulnerability, open a private security report rather than a public issue. Do not include secrets in code or configuration.

---

## License

TBD

---

## Acknowledgements

TanStack (Router/Query/Store), shadcn/ui & Radix UI, Clerk, Tailwind CSS.
