import { test, expect } from '@playwright/test';

test.describe('Employee dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/employee-dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to login from employee sub-routes', async ({ page }) => {
    await page.goto('/employee-dashboard/attendance');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to login from employee leaves', async ({ page }) => {
    await page.goto('/employee-dashboard/leaves');
    await expect(page).toHaveURL(/\/login/);
  });
});
