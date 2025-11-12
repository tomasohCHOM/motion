# Events service — basic curl testing

todo: automate these tests in CI

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

## 1) Happy path — create + list

Bash:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-123" \
  -H "X-User-Roles: owner" \
  --data-binary @services/events/payload.json \
  http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$h=@{ 'X-User-Id'='user-123'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body (Get-Content .\services\events\payload.json -Raw)
```

## 2) Validation — missing required field `name`

Bash:
```bash
echo '{"description":"no name","start_at":"2025-11-11T10:00:00Z","end_at":"2025-11-11T11:00:00Z","roles_view":["member"]}' > bad.json
curl -i -X POST -H "Content-Type: application/json" -H "X-User-Id: user-1" -H "X-User-Roles: owner" --data-binary @bad.json http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$body = '{"description":"no name","start_at":"2025-11-11T10:00:00Z","end_at":"2025-11-11T11:00:00Z","roles_view":["member"]}'
$h = @{ 'X-User-Id'='user-1'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body $body -Verbose
```

## 3) Validation — `end_at` before `start_at`

Bash:
```bash
curl -i -X POST -H "Content-Type: application/json" -H "X-User-Id: u" -H "X-User-Roles: owner" \
  -d '{"name":"bad","start_at":"2025-11-11T11:00:00Z","end_at":"2025-11-11T10:00:00Z","roles_view":["member"]}' \
  http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$body = '{"name":"bad","start_at":"2025-11-11T11:00:00Z","end_at":"2025-11-11T10:00:00Z","roles_view":["member"]}'
$h = @{ 'X-User-Id'='u'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body $body -Verbose
```

## 4) Forbidden — missing allowed role

Bash:
```bash
curl -i -X POST -H "Content-Type: application/json" -H "X-User-Id: u" -H "X-User-Roles: guest" --data-binary @services/events/payload.json http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$h = @{ 'X-User-Id'='u'; 'X-User-Roles'='guest' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body (Get-Content .\services\events\payload.json -Raw) -Verbose
```

## 5) Malformed JSON — decode error

Bash:
```bash
echo '{"name":"x","start_at":"2025-11-11T10:00:00Z",}' > tmp.json
curl -i -X POST -H "Content-Type: application/json" -H "X-User-Id:u" -H "X-User-Roles:owner" --data-binary @tmp.json http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$bad = '{"name":"x","start_at":"2025-11-11T10:00:00Z",}'
$h = @{ 'X-User-Id'='u'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body $bad -Verbose
```

## 6) List filtering by roles

Bash:
```bash
echo '{"name":"A","description":"admin","start_at":"2025-11-11T10:00:00Z","end_at":"2025-11-11T11:00:00Z","roles_view":["admin"]}' > a.json
echo '{"name":"B","description":"member","start_at":"2025-11-11T10:00:00Z","end_at":"2025-11-11T11:00:00Z","roles_view":["member"]}' > b.json
curl -s -X POST -H "Content-Type: application/json" -H "X-User-Id:u" -H "X-User-Roles:owner" --data-binary @a.json http://localhost:8082/projects/proj1/events
curl -s -X POST -H "Content-Type: application/json" -H "X-User-Id:u" -H "X-User-Roles:owner" --data-binary @b.json http://localhost:8082/projects/proj1/events
curl -H "X-User-Roles: member" http://localhost:8082/projects/proj1/events | jq
```

PowerShell equivalent:
```powershell
$a = '{"name":"A","description":"admin","start_at":"2025-11-11T10:00:00Z","end_at":"2025-11-11T11:00:00Z","roles_view":["admin"]}'
$b = '{"name":"B","description":"member","start_at":"2025-11-11T10:00:00Z","end_at":"2025-11-11T11:00:00Z","roles_view":["member"]}'
$h = @{ 'X-User-Id'='u'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body $a
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body $b
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Headers @{ 'X-User-Roles'='member' } | ConvertTo-Json -Depth 5
```

## 7) Empty body detection

Bash:
```bash
curl -i -X POST -H "Content-Type: application/json" -H "X-User-Id:u" -H "X-User-Roles:owner" --data-binary '' http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$h = @{ 'X-User-Id'='u'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -ContentType 'application/json' -Body '' -Verbose
```

## 8) Content-Type missing

Bash:
```bash
curl -i -X POST -H "X-User-Id:u" -H "X-User-Roles:owner" --data-binary @services/events/payload.json http://localhost:8082/projects/proj1/events
```

PowerShell:
```powershell
$h = @{ 'X-User-Id'='u'; 'X-User-Roles'='owner' }
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Post -Headers $h -Body (Get-Content .\services\events\payload.json -Raw) -Verbose
```

## 9) CORS preflight (OPTIONS)

Bash:
```bash
curl -i -X OPTIONS http://localhost:8082/projects/proj1/events -H "Origin: http://example.com" -H "Access-Control-Request-Method: POST"
```

PowerShell:
```powershell
Invoke-RestMethod -Uri 'http://localhost:8082/projects/proj1/events' -Method Options -Headers @{ 'Origin'='http://example.com'; 'Access-Control-Request-Method'='POST' } -Verbose
```

## 10) Large payload / roles_view array test

Create a payload with a large `roles_view` array and POST it; expect HTTP 201.

