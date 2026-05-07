import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page with key elements', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.locator('h1')).toContainText('演示文稿');

    // Check CTA buttons exist
    const startButton = page.getByRole('button', { name: /开始创建|立即体验/ });
    await expect(startButton).toBeVisible();
  });

  test('should navigate to login when clicking start', async ({ page }) => {
    await page.goto('/');

    // Click start button
    const startButton = page.getByRole('button', { name: /开始创建|立即体验/ });
    await startButton.click();

    // Should navigate to login or show auth modal
    await expect(page).toHaveURL(/\/(login|profile|projects)/);
  });
});

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check login form elements
    await expect(page.locator('input[type="tel"]')).toBeVisible();

    // Check submit button
    const submitButton = page.getByRole('button', { name: /获取验证码|登录/ });
    await expect(submitButton).toBeVisible();
  });

  test('should show validation error for invalid phone', async ({ page }) => {
    await page.goto('/login');

    // Enter invalid phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('123');

    // Try to submit
    const submitButton = page.getByRole('button', { name: /获取验证码|登录/ });
    await submitButton.click();

    // Should show error message
    await expect(page.locator('text=/请输入正确的手机号|无效/')).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected route
    await page.goto('/projects');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing profile without auth', async ({ page }) => {
    await page.goto('/profile');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
