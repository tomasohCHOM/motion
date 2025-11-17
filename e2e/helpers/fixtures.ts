/**
 * Test fixtures and setup/teardown utilities for E2E tests
 */

import { test as base, Page } from '@playwright/test'
import {
  createTestUser,
  createTestWorkspace,
  checkWorkspaceService,
  workspaceRequest,
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
    console.log('Creating test user:', userId)
    await createTestUser(userId)

    // VERIFY: Check user was actually created
    console.log('Verifying user creation...')
    const verifyResponse = await workspaceRequest(
      `/users/${userId}`,
      {},
      userId,
    )
    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text()
      throw new Error(
        `User creation failed - verification returned ${verifyResponse.status}: ${errorText}`,
      )
    }
    const userData = await verifyResponse.json()
    console.log('✓ User verified in database:', userData)

    // Create test workspace
    console.log('Creating test workspace for user:', userId)
    const workspace = await createTestWorkspace(
      `Test Workspace ${Date.now()}`,
      'Test workspace for E2E tests',
      userId, // Pass userId as ownerId
    )
    console.log('✓ Workspace created:', workspace)

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
