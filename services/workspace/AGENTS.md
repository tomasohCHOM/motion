# Gemini Agent: Workspace Service

This document provides context for the Workspace microservice, a core component of the application.

## High-Level Overview

The Workspace service is a Go-based microservice responsible for managing the central "workspace" entities of the application. A workspace is a collaborative environment where users can work together. This service handles the creation and management of workspaces, as well as user membership and invitations.

## Tech Stack

- **Language**: Go
- **Database**: PostgreSQL (inferred from the SQL syntax)
- **Containerization**: Docker and Docker Compose
- **Key Go Libraries**:
    - `sqlc`: For generating type-safe Go code from SQL queries.
    - A web framework (e.g., `gin`, `chi`, or `net/http`).
    - A PostgreSQL driver (e.g., `pgx`).

## Project Structure

The service follows a clean architecture pattern:

```
services/workspace/
├── cmd/server/main.go       # Application entry point
├── internal/
│   ├── config/              # Configuration management
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # HTTP middleware
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   ├── sql/                 # SQL queries for sqlc
│   ├── store/               # Database access layer
│   └── sqlc.yaml            # sqlc configuration
├── migrations/              # Database migrations
├── go.mod                   # Go module dependencies
├── Dockerfile               # Docker build instructions
└── compose.yaml             # Docker Compose for local development
```

## Key Components & Logic

- **Data Model**: The core of the service is its data model, defined in the `migrations` directory. The key tables are:
    - `workspaces`: Stores information about each workspace (name, description, etc.).
    - `workspace_users`: A join table that links users to workspaces and defines their access level ('member' or 'owner').
    - `workspace_invites`: Stores information about invitations sent to users to join a workspace.
- **Business Logic**: The business logic is located in `internal/services`. This is where the rules for creating workspaces, inviting users, and managing membership are implemented.
- **Database Interaction**: The service uses `sqlc` to generate Go code for database queries from the SQL files in `internal/sql`. The `internal/store` directory contains the database access layer that uses the generated code.
- **API**: The HTTP API is defined in `internal/handlers`. It exposes endpoints for CRUD (Create, Read, Update, Delete) operations on workspaces and for managing workspace members and invitations.

## How to Run the Service

1.  **Prerequisites**: Go, Docker, Docker Compose.
2.  **Start the service and database**:
    ```bash
    docker compose up -d
    ```
3.  The service will likely be available on a port defined in the `compose.yaml` file (e.g., 8081).

## How to Test the Service

- **Run unit tests**:
  ```bash
  # (Assuming a 'test' command is defined in the justfile, similar to the file-upload-service)
  just test
  ```
- **Run database migrations**:
  ```bash
  # (Assuming a 'migrate-up' command is available)
  just migrate-up
  ```

## Deployment

The service is designed to be deployed as a containerized application on a platform like AWS ECS Fargate, connected to a PostgreSQL database (e.g., AWS RDS).
