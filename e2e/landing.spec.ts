import { test, expect } from '@playwright/test';

test('landing page loads with title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('EmployéPro');
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Tarifs');
  await expect(page).toHaveURL('/pricing');
  await page.click('text=FAQ');
  await expect(page).toHaveURL('/faq');
});

test('login form renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('register company page renders', async ({ page }) => {
  await page.goto('/register-company');
  await expect(page.locator('h1, h2').first()).toBeVisible();
});
