import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EmployraRH|EmployéPro/);
  });

  test('displays the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navigates to Pricing page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Pricing');
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigates to FAQ page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=FAQ');
    await expect(page).toHaveURL(/\/faq/);
  });

  test('navigates to Documentation page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Documentation');
    await expect(page).toHaveURL(/\/docs/);
  });

  test('navigates to About page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=About');
    await expect(page).toHaveURL(/\/about/);
  });

  test('navigates to Login page via nav link', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Log in');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login page', () => {
  test('renders login form with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Connexion');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('allows typing email and password', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });
});

test.describe('Register page', () => {
  test('renders registration form', async ({ page }) => {
    await page.goto('/register-company');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('has company name input', async ({ page }) => {
    await page.goto('/register-company');
    const nameInput = page.locator('input').first();
    await expect(nameInput).toBeVisible();
  });
});

test.describe('Pricing page', () => {
  test('displays all 4 plan cards', async ({ page }) => {
    await page.goto('/pricing');
    const planNames = ['Starter', 'Pro', 'Business', 'Enterprise'];
    for (const name of planNames) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }
  });
});
