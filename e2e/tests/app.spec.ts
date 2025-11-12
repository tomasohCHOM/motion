import { test, expect } from "../helpers/fixtures";
import {
  checkWorkspaceService,
  checkFileUploadService,
} from "../helpers/api-helpers";

/**
 * Example E2E tests for the Motion application
 */

test.describe("Application E2E Tests", () => {
  test.beforeAll(async () => {
    // Verify services are running
    const workspaceReady = await checkWorkspaceService();
    const fileUploadReady = await checkFileUploadService();

    if (!workspaceReady || !fileUploadReady) {
      throw new Error(
        "Backend services are not ready. Please ensure services are running."
      );
    }
  });

  test("should load the landing page", async ({ page }) => {
    await page.goto("/");

    // Check that the page loads
    await expect(page).toHaveURL(/.*\/$/);
  });

  test("should navigate to sign in page", async ({ page }) => {
    await page.goto("/");

    // Look for sign in link/button and click it
    // Adjust selector based on your actual UI
    const signInLink = page.getByRole("link", { name: /sign in/i });
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(/.*\/sign-in/);
    }
  });

  // test("should create and display workspace", async ({
  //   page,
  //   userId,
  //   workspace,
  // }) => {
  //   // Navigate to dashboard (you may need to mock auth or use actual auth flow)
  //   await page.goto("/dashboard");

  //   // Check that workspace appears in the list
  //   // Adjust selectors based on your actual UI
  //   await expect(page.getByText(workspace.name)).toBeVisible({
  //     timeout: 10000,
  //   });
  // });

  // test("should access workspace files page", async ({ page, workspace }) => {
  //   // Navigate to workspace files page
  //   await page.goto(`/workspace/${workspace.id}/files`);

  //   // Check that the page loads
  //   await expect(page).toHaveURL(/.*\/workspace\/.*\/files/);

  //   // Verify files page content loads
  //   // Adjust based on your actual UI
  //   await expect(page.locator("body")).toBeVisible();
  // });
});
