import { test, expect } from '@playwright/test';

test.describe('Workspace Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.goto('/');
  });

  test('should display sidebar navigation items', async ({ page }) => {
    // Check sidebar exists
    const sidebar = page.locator('aside, [data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should have workspace title', async ({ page }) => {
    // Check workspace title
    const workspaceTitle = page.locator('text=/工作空间|Workspace/');
    await expect(workspaceTitle).toBeVisible();
  });
});

test.describe('Projects Page', () => {
  test('should show projects list or empty state', async ({ page }) => {
    // This test requires authentication
    // For now, just check the redirect behavior
    await page.goto('/projects');

    // If not authenticated, should redirect to login
    // If authenticated, should show projects
    const url = page.url();

    if (url.includes('/login')) {
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Check projects page elements
      await expect(page.locator('text=/项目|Projects/')).toBeVisible();
    }
  });
});

test.describe('Create Flow', () => {
  test('should display wizard steps', async ({ page }) => {
    // Navigate to create page (requires auth)
    await page.goto('/create');

    // If redirected to login, skip wizard tests
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Check wizard container
    const wizard = page.locator('[data-testid="wizard"], .wizard-container');
    await expect(wizard).toBeVisible();
  });

  test('should have mode selection step', async ({ page }) => {
    await page.goto('/create');

    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Check for mode selection
    const templateMode = page.locator('text=/模板模式|Template/');
    const advancedMode = page.locator('text=/高级模式|Advanced/');

    // At least one mode option should be visible
    await expect(templateMode.or(advancedMode)).toBeVisible();
  });

  test('should have input step for content', async ({ page }) => {
    await page.goto('/create');

    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Check for input textarea
    const inputArea = page.locator('textarea, input[type="text"]');
    await expect(inputArea).toBeVisible();
  });
});