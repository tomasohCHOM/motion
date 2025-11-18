/**
 * Test fixtures and setup/teardown utilities for E2E tests
 */

import { test as base, Page } from '@playwright/test'
import {
  createTestUser,
  createTestWorkspace,
  checkWorkspaceService,
} from './api-helpers'

type TestFixtures = {
  userId: string
  workspace: { id: string; name: string }
  page: Page
}

/**
 * Extended test with fixtures for common test setup
 */
export const test = base.extend<TestFixtures>({
  // Playwright requires the first argument to be destructured
  // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-unused-vars
  userId: async ({}, use, testInfo) => {
    // Use unique user ID per test attempt
    // Uses timestamp to guarantee uniqueness across tests and retries
    const baseUserId = process.env.DEV_USER_ID || 'test-user-123'
    const timestamp = Date.now()
    const userId = `${baseUserId}-${timestamp}`
    await use(userId)
  },

  workspace: async ({ userId }, use) => {
    // Ensure services are ready
    const workspaceReady = await checkWorkspaceService()
    if (!workspaceReady) {
      throw new Error('Workspace service is not ready')
    }

    // Create test user
    await createTestUser(userId)

    // Create test workspace
    const workspace = await createTestWorkspace(
      `Test Workspace ${Date.now()}`,
      'Test workspace for E2E tests',
      userId, // Pass userId as ownerId
    )

    await use(workspace)

    // Cleanup (optional - you may want to keep test data for debugging)
    // await cleanupTestData(userId);
  },
})

export { expect } from '@playwright/test'
