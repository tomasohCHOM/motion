/**
 * Test fixtures and setup/teardown utilities for E2E tests
 */

import { test as base } from '@playwright/test'
import {
  createTestUser,
  createTestWorkspace,
  checkWorkspaceService,
} from './api-helpers'

type TestFixtures = {
  userId: string
  workspace: { id: string; name: string }
}

/**
 * Extended test with fixtures for common test setup
 */
export const test = base.extend<TestFixtures>({
  // Playwright requires the first argument to be destructured
  // eslint-disable-next-line no-empty-pattern
  userId: async ({}, use) => {
    const userId = `test-user-${Date.now()}`
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
    )

    await use(workspace)

    // Cleanup (optional - you may want to keep test data for debugging)
    // await cleanupTestData(userId);
  },
})

export { expect } from '@playwright/test'
