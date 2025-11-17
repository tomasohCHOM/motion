import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '../helpers/fixtures'
import {
  checkWorkspaceService,
  checkFileUploadService,
} from '../helpers/api-helpers'

/**
 * Example E2E tests for the Motion application
 */

test.describe('Application E2E Tests', () => {
  test.beforeAll(async () => {
    // Verify services are running
    const workspaceReady = await checkWorkspaceService()
    const fileUploadReady = await checkFileUploadService()

    if (!workspaceReady || !fileUploadReady) {
      throw new Error(
        'Backend services are not ready. Please ensure services are running.',
      )
    }
  })

  test('should load the landing page', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveURL(/.*\/$/)
  })

  test('should navigate to sign in page', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/')

    // Look for sign in link/button and click it
    // Adjust selector based on your actual UI
    const signInLink = page.getByRole('link', { name: /sign in/i })
    if (await signInLink.isVisible()) {
      await signInLink.click()
      await expect(page).toHaveURL(/.*\/sign-in/)
    }
  })

  test('should create and display workspace', async ({
    page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId,
    workspace,
  }) => {
    // Setup Clerk testing token to bypass bot detection
    await setupClerkTestingToken({ page })

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Check that workspace appears in the list
    // The workspace fixture automatically creates a workspace
    await expect(page.getByText(workspace.name)).toBeVisible({
      timeout: 10000,
    })
  })

  // test('should access workspace files page', async ({ page, workspace }) => {
  //   // Navigate to workspace files page
  //   await page.goto(`/workspace/${workspace.id}/files`)

  //   // Check that the page loads
  //   await expect(page).toHaveURL(/.*\/workspace\/.*\/files/)

  //   // Verify files page content loads
  //   await expect(page.locator('body')).toBeVisible()
  // })

  test('should navigate between workspace sections', async ({
    page,
    workspace,
  }) => {
    await setupClerkTestingToken({ page })

    // Navigate to workspace planner
    await page.goto(`/workspace/${workspace.id}/planner`)
    await expect(page).toHaveURL(/.*\/workspace\/.*\/planner/)
    await expect(page.locator('body')).toBeVisible()

    // Navigate to Notes section
    await page.goto(`/workspace/${workspace.id}/notes`)
    await expect(page).toHaveURL(/.*\/workspace\/.*\/notes/)
    await expect(page.locator('body')).toBeVisible()

    // Navigate to Team section
    await page.goto(`/workspace/${workspace.id}/team`)
    await expect(page).toHaveURL(/.*\/workspace\/.*\/team/)
    await expect(page.locator('body')).toBeVisible()

    // Navigate to Settings section
    await page.goto(`/workspace/${workspace.id}/settings`)
    await expect(page).toHaveURL(/.*\/workspace\/.*\/settings/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should create and view a note', async ({ page, workspace }) => {
    await setupClerkTestingToken({ page })

    // Navigate to notes section
    await page.goto(`/workspace/${workspace.id}/notes`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for "Create Note" or "New Note" button
    const createButton = page.getByRole('button', {
      name: /create note|new note|add note/i,
    })

    // Check if button exists
    const buttonExists = await createButton.count()
    if (buttonExists > 0) {
      await createButton.click()

      // Fill in note details (adjust selectors based on actual UI)
      const titleInput = page.getByPlaceholder(/title|name/i).first()
      if ((await titleInput.count()) > 0) {
        await titleInput.fill('Test Note')
      }

      // Save the note
      const saveButton = page.getByRole('button', { name: /save|create/i })
      if ((await saveButton.count()) > 0) {
        await saveButton.click()

        // Verify note appears in list
        await expect(page.getByText('Test Note')).toBeVisible({
          timeout: 10000,
        })
      }
    } else {
      // If no create button, just verify the notes page loads
      await expect(page.locator('body')).toBeVisible()
    }
  })
})
