import { test, expect } from '@playwright/test';

test.describe('Slide Creation Flow', () => {
  test.skip('should complete full creation flow', async ({ page }) => {
    // This test requires authentication and API mocking
    // Skip in CI until we have proper test fixtures

    await page.goto('/create');

    // Step 1: Mode Selection
    const templateMode = page.locator('text=/模板模式/');
    await templateMode.click();

    // Step 2: Input
    const inputArea = page.locator('textarea');
    await inputArea.fill('人工智能发展趋势');

    const nextButton = page.getByRole('button', { name: /下一步|生成/ });
    await nextButton.click();

    // Step 3: Outline
    await expect(page.locator('text=/大纲|Outline/')).toBeVisible();

    // Wait for outline generation
    await page.waitForTimeout(2000);

    // Continue to next step
    const continueButton = page.getByRole('button', { name: /继续|下一步/ });
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }

    // Step 4: Theme Selection
    await expect(page.locator('text=/主题|Theme/')).toBeVisible();

    // Select a theme
    const themeOption = page.locator('[data-theme-id]').first();
    if (await themeOption.isVisible()) {
      await themeOption.click();
    }

    // Generate slides
    const generateButton = page.getByRole('button', { name: /生成|Generate/ });
    if (await generateButton.isVisible()) {
      await generateButton.click();
    }

    // Wait for generation
    await page.waitForTimeout(5000);

    // Should show preview
    await expect(page.locator('text=/预览|Preview|完成/')).toBeVisible();
  });
});

test.describe('Outline Editor', () => {
  test.skip('should allow editing outline', async ({ page }) => {
    // Requires authentication and outline data
    await page.goto('/create?step=outline');

    // Check outline cards are visible
    const outlineCards = page.locator('[data-testid="outline-card"], .outline-card');
    const count = await outlineCards.count();

    if (count > 0) {
      // Check first card
      await expect(outlineCards.first()).toBeVisible();
    }
  });

  test.skip('should support drag and drop reordering', async ({ page }) => {
    // Requires authentication and outline data
    await page.goto('/create?step=outline');

    const cards = page.locator('[draggable="true"]');
    const count = await cards.count();

    if (count >= 2) {
      // Drag first card to second position
      await cards.first().dragTo(cards.nth(1));
    }
  });
});

test.describe('Theme Selection', () => {
  test.skip('should display theme options', async ({ page }) => {
    await page.goto('/create?step=theme');

    // Check theme grid
    const themeGrid = page.locator('.theme-grid, [data-testid="theme-selector"]');
    await expect(themeGrid).toBeVisible();

    // Check theme options exist
    const themes = page.locator('[data-theme-id]');
    const count = await themes.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Preview Mode', () => {
  test.skip('should display slide preview', async ({ page }) => {
    // Requires generated slides
    await page.goto('/create?step=preview');

    // Check preview container
    const preview = page.locator('.preview-container, [data-testid="slide-preview"]');
    await expect(preview).toBeVisible();
  });

  test.skip('should support navigation between slides', async ({ page }) => {
    await page.goto('/create?step=preview');

    // Check navigation buttons
    const prevButton = page.getByRole('button', { name: /上一页|Previous/ });
    const nextButton = page.getByRole('button', { name: /下一页|Next/ });

    // At least one navigation button should exist
    await expect(prevButton.or(nextButton)).toBeVisible();
  });
});