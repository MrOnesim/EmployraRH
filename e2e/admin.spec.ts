import { test, expect } from '@playwright/test';

test.describe('Admin dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to login from admin sub-routes', async ({ page }) => {
    await page.goto('/admin/employees');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to login from admin settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});
