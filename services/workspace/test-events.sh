#!/usr/bin/env bash
set -euo pipefail

# Bash port of test-events.ps1
# Usage: ./test-events.sh [workspaceId] [userId] [baseUrl]

workspaceId="${1:-550e8400-e29b-41d4-a716-446655440000}"
userId="${2:-user_123}"
baseUrl="${3:-http://localhost:8081}"

LAST_HTTP_CODE=0
LAST_RESPONSE=""

http_request() {
  local method="$1"
  local endpoint="$2"
  local body="${3:-}"
  local desc="${4:-}" 

  echo -e "\n=== $desc ==="
  echo "Request: $method $endpoint"
  local url="${baseUrl}${endpoint}"

  if [ -n "$body" ]; then
    echo "Body: $body"
    # send body
    local resp
    resp=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" -H "X-Dev-UserID: $userId" -d "$body")
  else
    local resp
    resp=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" -H "X-Dev-UserID: $userId")
  fi

  LAST_HTTP_CODE=$(echo "$resp" | tail -n1)
  LAST_RESPONSE=$(echo "$resp" | sed '$d')

  if command -v jq >/dev/null 2>&1 && [ -n "$LAST_RESPONSE" ]; then
    echo "Response:"
    echo "$LAST_RESPONSE" | jq -C .
  else
    [ -n "$LAST_RESPONSE" ] && echo "Response: $LAST_RESPONSE"
  fi

  return 0
}

# Helper to extract JSON field 'id' from LAST_RESPONSE
extract_id() {
  if command -v jq >/dev/null 2>&1; then
    echo "$LAST_RESPONSE" | jq -r '.id // empty'
  else
    # crude fallback
    echo "$LAST_RESPONSE" | grep -oP '"id"\s*:\s*"\K[^"]+' || true
  fi
}

# Health check
http_request GET "/health" "" "Health Check"

# Ensure workspace exists
http_request GET "/workspaces/${workspaceId}" "" "Check Workspace Exists"
if [ "$LAST_HTTP_CODE" -ne 200 ]; then
  echo "Workspace ${workspaceId} not found. Creating a new workspace..."

  http_request GET "/users/${userId}" "" "Check Test User Exists"
  if [ "$LAST_HTTP_CODE" -ne 200 ]; then
    echo "Test user ${userId} not found. Creating user..."
    create_user_body=$(cat <<EOF
{"id":"${userId}","email":"${userId}@example.com","first_name":"Test","last_name":"User","username":"${userId}"}
EOF
)
    http_request POST "/users" "$create_user_body" "Create Test User"
    if [ "$LAST_HTTP_CODE" -lt 200 ] || [ "$LAST_HTTP_CODE" -ge 300 ]; then
      echo "Failed to create test user; aborting tests." >&2
      exit 1
    fi
  else
    echo "Test user exists: ${userId}"
  fi

  create_ws_body=$(cat <<EOF
{"name":"Test Workspace","description":"Auto-created workspace for event tests","owner_id":"${userId}"}
EOF
)
  http_request POST "/workspaces" "$create_ws_body" "Create Workspace"
  if [ "$LAST_HTTP_CODE" -ge 200 ] && [ "$LAST_HTTP_CODE" -lt 300 ]; then
    new_ws_id=$(extract_id)
    if [ -n "$new_ws_id" ]; then
      workspaceId="$new_ws_id"
      echo "Using workspace id: $workspaceId"
    else
      echo "Workspace created but failed to parse id; aborting." >&2
      exit 1
    fi
  else
    echo "Failed to create workspace; aborting tests." >&2
    exit 1
  fi
else
  echo "Using existing workspace: $workspaceId"
fi

# Create Event
create_event_body=$(cat <<EOF
{"name":"Team Standup","color":"#3B82F6","event_date":"2025-11-15","event_time":"09:30:00","duration_minutes":30,"attendees_count":5}
EOF
)
http_request POST "/workspaces/${workspaceId}/events" "$create_event_body" "Create Event"
if [ "$LAST_HTTP_CODE" -ge 200 ] && [ "$LAST_HTTP_CODE" -lt 300 ]; then
  eventId=$(extract_id)
  echo "Created event ID: $eventId"

  # Get single event
  http_request GET "/workspaces/${workspaceId}/events/${eventId}" "" "Get Single Event"

  # List events
  http_request GET "/workspaces/${workspaceId}/events" "" "List All Events"

  # Update event
  update_event_body=$(cat <<EOF
{"name":"Updated Team Standup","attendees_count":6}
EOF
)
  http_request PUT "/workspaces/${workspaceId}/events/${eventId}" "$update_event_body" "Update Event"

  # Get event color
  http_request GET "/events/color?type=blue" "" "Get Event Color"

  # Delete event
  http_request DELETE "/workspaces/${workspaceId}/events/${eventId}" "" "Delete Event"

  # Verify deletion (expect 404)
  http_request GET "/workspaces/${workspaceId}/events/${eventId}" "" "Verify Event Deleted (should get 404)"
  if [ "$LAST_HTTP_CODE" -eq 404 ]; then
    echo "Verified deletion (404 received)"
  else
    echo "Expected 404 after deletion but got $LAST_HTTP_CODE"
  fi
else
  echo "Failed to create event; aborting tests." >&2
  exit 1
fi

echo -e "\n=== All Tests Complete ==="
