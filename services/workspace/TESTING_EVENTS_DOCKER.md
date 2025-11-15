# Testing Events Feature with Docker

## Quick Start

### 1. Build and Start Services
```bash
cd d:\vscode\motion
docker compose up --build
```

### 2. Wait for Services to Be Ready
Watch the logs until you see:
```
workspace-service    | Server started on http://localhost:8081
```

---

## Testing Events API

### Health Check
```bash
curl http://localhost:8081/health
```

Expected response:
```json
{"status": "OK"}
```

### 1. Create an Event

**Request:**
```bash
curl -X POST http://localhost:8081/workspaces/{workspace_id}/events \
  -H "Content-Type: application/json" \
  -H "X-Dev-UserID: user_123" \
  -d '{
    "name": "Team Standup",
    "color": "#3B82F6",
    "event_date": "2025-11-15",
    "event_time": "09:30:00",
    "duration_minutes": 30,
    "attendees_count": 5
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "workspace_id": "{workspace_id}",
  "name": "Team Standup",
  "color": "#3B82F6",
  "event_date": "2025-11-15",
  "event_time": "09:30:00",
  "duration_minutes": 30,
  "attendees_count": 5,
  "created_at": "2025-11-12T14:30:00Z",
  "updated_at": "2025-11-12T14:30:00Z"
}
```

### 2. List All Workspace Events

**Request:**
```bash
curl http://localhost:8081/workspaces/{workspace_id}/events \
  -H "X-Dev-UserID: user_123"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "workspace_id": "{workspace_id}",
    "name": "Team Standup",
    "color": "#3B82F6",
    "event_date": "2025-11-15",
    "event_time": "09:30:00",
    "duration_minutes": 30,
    "attendees_count": 5,
    "created_at": "2025-11-12T14:30:00Z",
    "updated_at": "2025-11-12T14:30:00Z"
  }
]
```

### 3. Get Single Event

**Request:**
```bash
curl http://localhost:8081/workspaces/{workspace_id}/events/{event_id} \
  -H "X-Dev-UserID: user_123"
```

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "workspace_id": "{workspace_id}",
  "name": "Team Standup",
  "color": "#3B82F6",
  "event_date": "2025-11-15",
  "event_time": "09:30:00",
  "duration_minutes": 30,
  "attendees_count": 5,
  "created_at": "2025-11-12T14:30:00Z",
  "updated_at": "2025-11-12T14:30:00Z"
}
```

### 4. Update Event

**Request:**
```bash
curl -X PUT http://localhost:8081/workspaces/{workspace_id}/events/{event_id} \
  -H "Content-Type: application/json" \
  -H "X-Dev-UserID: user_123" \
  -d '{
    "name": "Updated Team Standup",
    "attendees_count": 6
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "workspace_id": "{workspace_id}",
  "name": "Updated Team Standup",
  "color": "#3B82F6",
  "event_date": "2025-11-15",
  "event_time": "09:30:00",
  "duration_minutes": 30,
  "attendees_count": 6,
  "created_at": "2025-11-12T14:30:00Z",
  "updated_at": "2025-11-12T14:35:00Z"
}
```

### 5. Delete Event

**Request:**
```bash
curl -X DELETE http://localhost:8081/workspaces/{workspace_id}/events/{event_id} \
  -H "X-Dev-UserID: user_123"
```

**Expected Response (204 No Content):**
```
(empty body)
```

### 6. Get Event Color

**Request:**
```bash
curl "http://localhost:8081/events/color?type=blue" \
  -H "X-Dev-UserID: user_123"
```

**Expected Response (200 OK):**
```json
{
  "color": "#3B82F6"
}
```

---


## Testing Color Types

Valid color types for `GET /events/color?type=`:
- `red`
- `blue`
- `green`
- `yellow`
- `purple`
- `pink`

---

## Date/Time Format Reference

- **event_date**: ISO 8601 format `YYYY-MM-DD`
  - Example: `2025-11-15`

- **event_time**: 24-hour format `HH:MM:SS` 
  - Example: `09:30:00` or `14:45:30`

---

## Error Responses

### 400 Bad Request
```json
{"error": "invalid request body"}
{"error": "missing workspace id"}
{"error": "invalid event_date format (use YYYY-MM-DD)"}
```

### 401 Unauthorized
```json
{"error": "unauthorized"}
```

### 404 Not Found
```json
{"error": "event not found"}
```

### 500 Internal Server Error
```json
{"error": "failed to create event"}
```

---

## Performance Notes

- Events are sorted by `event_date` then `event_time` in `ListWorkspaceEvents`
- Indexes created on `workspace_id` and `event_date` for query performance
- Database connection pooling configured via pgx
