/**
 * Global setup for Playwright E2E tests
 * Sets up Clerk testing token for all tests
 */

import { clerkSetup } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'

setup('global setup', async ({}) => {
  await clerkSetup()
})
