# Events service — basic curl testing

This short guide shows how to quickly test the Events service running locally (port 8082) using curl (Bash) or PowerShell.

Prerequisites
- Start the local stack (from repo root):

```powershell
docker compose up --build
```

The `events` service listens on port 8082 by default and exposes two endpoints:
- GET  /projects/{projectId}/events  — list events visible to the roles in `X-User-Roles`
- POST /projects/{projectId}/events  — create an event (requires `X-User-Id` and `X-User-Roles`)

Sample payload (save as `payload.json` in this folder):

```json
{
  "name": "Team sync",
  "description": "Weekly stand-up",
  "start_at": "2025-11-11T10:00:00Z",
  "end_at": "2025-11-11T11:00:00Z",
  "roles_view": ["member","admin"]
}
```

1) Quick GET (list events)

Bash:
```bash
curl http://localhost:8082/projects/proj1/events -H "X-User-Roles: member"
```

PowerShell (Invoke-RestMethod):
```powershell
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Headers @{ 'X-User-Roles'='member' }
```

2) Create an event (POST)

Bash (native curl):
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-123" \
  -H "X-User-Roles: owner" \
  --data-binary @payload.json \
  http://localhost:8082/projects/proj1/events
```

PowerShell (recommended - Invoke-RestMethod):
```powershell
$headers = @{ 'X-User-Id'='user-123'; 'X-User-Roles'='owner' }
$body = Get-Content .\payload.json -Raw
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $headers -ContentType 'application/json' -Body $body
```

If you have the native `curl.exe` on Windows, you can call it explicitly:

```powershell
curl.exe -X POST -H "Content-Type: application/json" -H "X-User-Id: user-123" -H "X-User-Roles: owner" --data-binary @payload.json http://localhost:8082/projects/proj1/events
```

Pretty-printing responses
- Bash + jq:
```bash
curl ... | jq
```
- PowerShell:
```powershell
Invoke-RestMethod ... | ConvertTo-Json -Depth 10
```

Common troubleshooting
- 400 Bad Request: usually malformed JSON (use `Get-Content -Raw` in PowerShell or validate `payload.json`). The service logs a decode error with details.
- 403 Forbidden on POST: `X-User-Roles` must include one of the allowed create roles (default: `owner`, `admin`, `manager`).
- Empty list vs `null`: the service returns `[]` (empty array) when there are no visible events.
- Connection refused: ensure `database` and the rest of the stack are up (`docker compose ps` / `docker compose logs database`).
