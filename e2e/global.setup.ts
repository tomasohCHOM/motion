/**
 * Global setup for Playwright E2E tests
 * Sets up Clerk testing token for all tests
 */

import { clerkSetup } from '@clerk/testing/playwright'

async function globalSetup() {
  await clerkSetup()
}

export default globalSetup
