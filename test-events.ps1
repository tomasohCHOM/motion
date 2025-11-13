# Test Events API with PowerShell
# Usage: .\test-events.ps1 -workspaceId "your-workspace-id"

param(
    [string]$workspaceId = "550e8400-e29b-41d4-a716-446655440000",
    [string]$userId = "user_123",
    [string]$baseUrl = "http://localhost:8081"
)

# Helper function to make requests
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description = ""
    )
    
    Write-Host "`n=== $Description ===" -ForegroundColor Cyan
    Write-Host "Request: $Method $Endpoint" -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
        "X-Dev-UserID" = $userId
    }
    
    $params = @{
        Uri     = "$baseUrl$Endpoint"
        Method  = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = $Body | ConvertTo-Json
        Write-Host "Body: $($params['Body'])" -ForegroundColor Gray
    }
    
    try {
        $response = Invoke-RestMethod @params
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test Health Check
Test-Endpoint -Method GET -Endpoint "/health" -Description "Health Check"

# Ensure workspace exists; create it if not
$workspaceLookup = Test-Endpoint -Method GET -Endpoint "/workspaces/$workspaceId" -Description "Check Workspace Exists"
if (-not $workspaceLookup) {
    Write-Host "Workspace $workspaceId not found. Creating a new workspace..." -ForegroundColor Yellow

    # Ensure test user exists (required to be owner)
    $userLookup = Test-Endpoint -Method GET -Endpoint "/users/$userId" -Description "Check Test User Exists"
    if (-not $userLookup) {
        Write-Host "Test user $userId not found. Creating user..." -ForegroundColor Yellow
        $createUserBody = @{
            id = $userId
            email = "$userId@example.com"
            first_name = "Test"
            last_name = "User"
            username = "$userId"
        }
        $userResp = Test-Endpoint -Method POST -Endpoint "/users" -Body $createUserBody -Description "Create Test User"
        if (-not $userResp) {
            Write-Host "Failed to create test user; aborting tests." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Test user exists: $userId" -ForegroundColor Green
    }
    $createWorkspaceBody = @{
        name = "Test Workspace"
        description = "Auto-created workspace for event tests"
        owner_id = $userId
    }
    $wsResp = Test-Endpoint -Method POST -Endpoint "/workspaces" -Body $createWorkspaceBody -Description "Create Workspace"
    if ($wsResp -and $wsResp.id) {
        $workspaceId = $wsResp.id
        Write-Host "Using workspace id: $workspaceId" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to create workspace; aborting tests." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Using existing workspace: $workspaceId" -ForegroundColor Green
}

# Test Create Event
$createEventBody = @{
    name             = "Team Standup"
    color            = "#3B82F6"
    event_date       = "2025-11-15"
    event_time       = "09:30:00"
    duration_minutes = 30
    attendees_count  = 5
}

$eventResponse = Test-Endpoint -Method POST -Endpoint "/workspaces/$workspaceId/events" `
    -Body $createEventBody -Description "Create Event"

# Extract event ID for subsequent tests
if ($eventResponse) {
    $eventId = $eventResponse.id
    Write-Host "Created event ID: $eventId" -ForegroundColor Cyan
    
    # Test Get Single Event
    Test-Endpoint -Method GET -Endpoint "/workspaces/$workspaceId/events/$eventId" `
        -Description "Get Single Event"
    
    # Test List Events
    Test-Endpoint -Method GET -Endpoint "/workspaces/$workspaceId/events" `
        -Description "List All Events"
    
    # Test Update Event
    $updateEventBody = @{
        name            = "Updated Team Standup"
        attendees_count = 6
    }
    
    Test-Endpoint -Method PUT -Endpoint "/workspaces/$workspaceId/events/$eventId" `
        -Body $updateEventBody -Description "Update Event"
    
    # Test Get Event Color
    Test-Endpoint -Method GET -Endpoint "/events/color?type=blue" `
        -Description "Get Event Color"
    
    # Test Delete Event
    Test-Endpoint -Method DELETE -Endpoint "/workspaces/$workspaceId/events/$eventId" `
        -Description "Delete Event"
    
    # Verify deletion
    Test-Endpoint -Method GET -Endpoint "/workspaces/$workspaceId/events/$eventId" `
        -Description "Verify Event Deleted (should get 404)"
}

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Cyan
