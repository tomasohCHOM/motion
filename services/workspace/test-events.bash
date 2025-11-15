#!/bin/bash

# Test Events API with Bash
# Usage: ./test-events.sh <workspace_id>
workspaceId="${1:-550e8400-e29b-41d4-a716-446655440000}"
userId="user_123"
baseUrl="http://localhost:8081"

cyan="\033[0;36m"
yellow="\033[1;33m"
green="\033[0;32m"
red="\033[1;31m"
gray="\033[1;30m"
reset="\033[0m"

function test_endpoint {
    local method="$1"
    local endpoint="$2"
    local body="$3"
    local description="$4"

    echo -e "\n${cyan}=== $description ===${reset}"
    echo -e "${yellow}Request: $method $endpoint${reset}"
    headers=(-H "Content-Type: application/json" -H "X-Dev-UserID: $userId")
    url="${baseUrl}${endpoint}"

    if [[ -n "$body" ]]; then
        echo -e "${gray}Body: $body${reset}"
        result=$(curl -s -X "$method" "${headers[@]}" -d "$body" "$url")
    else
        result=$(curl -s -X "$method" "${headers[@]}" "$url")
    fi

    if [[ $? -eq 0 && -n "$result" && $(echo "$result" | jq empty > /dev/null 2>&1; echo $?) -eq 0 ]]; then
        echo -e "${green}Response: $(echo "$result" | jq .)${reset}"
        echo "$result"
    else
        echo -e "${red}Error making $method request to $endpoint${reset}"
        return 1
    fi
}

# Health check
test_endpoint "GET" "/health" "" "Health Check"

# Check workspace exists
workspaceLookup=$(test_endpoint "GET" "/workspaces/$workspaceId" "" "Check Workspace Exists")
if [[ -z "$workspaceLookup" ]]; then
    echo -e "${yellow}Workspace $workspaceId not found. Creating a new workspace...${reset}"

    # Ensure test user exists
    userLookup=$(test_endpoint "GET" "/users/$userId" "" "Check Test User Exists")
    if [[ -z "$userLookup" ]]; then
        echo -e "${yellow}Test user $userId not found. Creating user...${reset}"
        createUserBody=$(jq -n --arg id "$userId" --arg email "$userId@example.com" --arg first_name "Test" --arg last_name "User" --arg username "$userId" \
          '{id: $id, email: $email, first_name: $first_name, last_name: $last_name, username: $username}')
        userResp=$(test_endpoint "POST" "/users" "$createUserBody" "Create Test User")
        if [[ -z "$userResp" ]]; then
            echo -e "${red}Failed to create test user; aborting tests.${reset}"
            exit 1
        fi
    else
        echo -e "${green}Test user exists: $userId${reset}"
    fi

    createWorkspaceBody=$(jq -n --arg name "Test Workspace" --arg description "Auto-created workspace for event tests" --arg owner_id "$userId" \
      '{name: $name, description: $description, owner_id: $owner_id}')
    wsResp=$(test_endpoint "POST" "/workspaces" "$createWorkspaceBody" "Create Workspace")
    workspaceId=$(echo "$wsResp" | jq -r ".id")
    if [[ -n "$workspaceId" && "$workspaceId" != "null" ]]; then
        echo -e "${cyan}Using workspace id: $workspaceId${reset}"
    else
        echo -e "${red}Failed to create workspace; aborting tests.${reset}"
        exit 1
    fi
else
    echo -e "${green}Using existing workspace: $workspaceId${reset}"
fi

# Create event
createEventBody=$(jq -n \
  --arg name "Team Standup" \
  --arg color "#3B82F6" \
  --arg event_date "2025-11-15" \
  --arg event_time "09:30:00" \
  --argjson duration_minutes 30 \
  --argjson attendees_count 5 \
  '{name: $name, color: $color, event_date: $event_date, event_time: $event_time, duration_minutes: $duration_minutes, attendees_count: $attendees_count}')
eventResponse=$(test_endpoint "POST" "/workspaces/$workspaceId/events" "$createEventBody" "Create Event")

eventId=$(echo "$eventResponse" | jq -r ".id")
if [[ -n "$eventId" && "$eventId" != "null" ]]; then
    echo -e "${cyan}Created event ID: $eventId${reset}"

    test_endpoint "GET" "/workspaces/$workspaceId/events/$eventId" "" "Get Single Event"
    test_endpoint "GET" "/workspaces/$workspaceId/events" "" "List All Events"

    updateEventBody=$(jq -n \
      --arg name "Updated Team Standup" \
      --argjson attendees_count 6 \
      '{name: $name, attendees_count: $attendees_count}')
    test_endpoint "PUT" "/workspaces/$workspaceId/events/$eventId" "$updateEventBody" "Update Event"
    test_endpoint "GET" "/events/color?type=blue" "" "Get Event Color"
    test_endpoint "DELETE" "/workspaces/$workspaceId/events/$eventId" "" "Delete Event"
    test_endpoint "GET" "/workspaces/$workspaceId/events/$eventId" "" "Verify Event Deleted (should get 404)"
fi

echo -e "\n${cyan}=== All Tests Complete ===${reset}"

