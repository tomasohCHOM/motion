/**
 * API helper functions for E2E tests
 */

const WORKSPACE_SERVICE_URL =
  process.env.WORKSPACE_SERVICE_URL || "http://localhost:8081";
const FILES_SERVICE_URL =
  process.env.FILES_SERVICE_URL || "http://localhost:8080";
const DEV_USER_ID = process.env.DEV_USER_ID || "test-user-123";

/**
 * Make an API request to the workspace service
 */
export async function workspaceRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${WORKSPACE_SERVICE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Dev-UserID": DEV_USER_ID,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make an API request to the file upload service
 */
export async function fileUploadRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${FILES_SERVICE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Dev-UserID": DEV_USER_ID,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Wait for a service to be healthy
 */
export async function waitForService(
  url: string,
  maxAttempts = 30,
  delay = 2000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5 second timeout per request
      });
      if (response.ok) {
        const data = await response.json();
        // Both services return health status, just check for 200 OK
        return true;
      }
    } catch (error) {
      // Service not ready yet, continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return false;
}

/**
 * Check if workspace service is healthy
 */
export async function checkWorkspaceService(): Promise<boolean> {
  return waitForService(`${WORKSPACE_SERVICE_URL}/health`);
}

/**
 * Check if file upload service is healthy
 */
export async function checkFileUploadService(): Promise<boolean> {
  return waitForService(`${FILES_SERVICE_URL}/health`);
}

/**
 * Create a test user via workspace service
 */
export async function createTestUser(
  userId: string = DEV_USER_ID
): Promise<void> {
  const response = await workspaceRequest("/users", {
    method: "POST",
    body: JSON.stringify({
      id: userId,
    }),
  });

  if (!response.ok && response.status !== 409) {
    // 409 means user already exists, which is fine
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
}

/**
 * Create a test workspace
 */
export async function createTestWorkspace(
  name: string,
  description?: string
): Promise<{ id: string; name: string }> {
  const response = await workspaceRequest("/workspaces", {
    method: "POST",
    body: JSON.stringify({
      name,
      description: description || `Test workspace: ${name}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create workspace: ${response.statusText}`);
  }

  return response.json() as Promise<{ id: string; name: string }>;
}

/**
 * Get user workspaces
 */
export async function getUserWorkspaces(
  userId: string = DEV_USER_ID
): Promise<Array<{ id: string; name: string }>> {
  const response = await workspaceRequest(`/users/${userId}/workspaces`);

  if (!response.ok) {
    throw new Error(`Failed to get user workspaces: ${response.statusText}`);
  }

  return response.json() as Promise<Array<{ id: string; name: string }>>;
}

/**
 * Clean up test data (workspaces, files, etc.)
 */
export async function cleanupTestData(
  userId: string = DEV_USER_ID
): Promise<void> {
  try {
    // Get user workspaces and delete them
    const workspaces = await getUserWorkspaces(userId);
    for (const workspace of workspaces) {
      // Note: You may need to add a DELETE endpoint for workspaces
      // await workspaceRequest(`/workspaces/${workspace.id}`, { method: 'DELETE' });
    }
  } catch (error) {
    // Ignore cleanup errors
    console.error("Cleanup error:", error);
  }
}
