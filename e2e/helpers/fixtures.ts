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
  // eslint-disable-next-line no-empty-pattern
  userId: async ({}, use, testInfo) => {
    // Use worker-specific user ID to avoid race conditions in parallel execution
    // Each worker gets a unique ID: test-user-123-w0, test-user-123-w1, etc.
    const baseUserId = process.env.DEV_USER_ID || 'test-user-123'
    const userId = `${baseUserId}-w${testInfo.parallelIndex}`
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

  // Override page fixture to inject userId into localStorage for E2E mode
  page: async ({ page, userId }, use) => {
    // Set userId in localStorage before any navigation
    // This allows the frontend E2E mode to use the correct worker-specific userId
    await page.addInitScript((id) => {
      localStorage.setItem('e2e-user-id', id)
    }, userId)

    await use(page)
  },
})

export { expect } from '@playwright/test'
