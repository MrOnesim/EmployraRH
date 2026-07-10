import { test, expect } from '@playwright/test';

test.describe('Employee routes (no auth)', () => {
  test('redirects payslips to login', async ({ page }) => {
    await page.goto('/employee-dashboard/payslips');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects messages to login', async ({ page }) => {
    await page.goto('/employee-dashboard/messages');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects settings to login', async ({ page }) => {
    await page.goto('/employee-dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});
