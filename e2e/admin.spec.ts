import { test, expect } from '@playwright/test';

test.describe('Admin dashboard (no auth)', () => {
  test('redirects to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects employees sub-route', async ({ page }) => {
    await page.goto('/admin/employees');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects settings sub-route', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Employee dashboard (no auth)', () => {
  test('redirects to login', async ({ page }) => {
    await page.goto('/employee-dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects attendance sub-route', async ({ page }) => {
    await page.goto('/employee-dashboard/attendance');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects leaves sub-route', async ({ page }) => {
    await page.goto('/employee-dashboard/leaves');
    await expect(page).toHaveURL(/\/login/);
  });
});
