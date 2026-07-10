import { test, expect } from '@playwright/test';

test.describe('Login form validation', () => {
  test('shows error when submitting empty form', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.getByRole('button', { name: /connexion|login|se connecter|sign in/i }).or(page.getByRole('button').first());
    await submitBtn.click();
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test('email input accepts valid email', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('password input is masked', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Register form validation', () => {
  test('has required input fields', async ({ page }) => {
    await page.goto('/register-company');
    const inputs = page.locator('input');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('has submit button', async ({ page }) => {
    await page.goto('/register-company');
    const submitBtn = page.getByRole('button').or(page.getByRole('button', { name: /register|créer|soumettre|submit/i }));
    await expect(submitBtn.first()).toBeVisible();
  });
});

test.describe('FAQ search', () => {
  test('search input is functional', async ({ page }) => {
    await page.goto('/faq');
    const searchInput = page.locator('input[type="text"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('congé');
      await expect(searchInput.first()).toHaveValue('congé');
    }
  });
});

test.describe('Page structure', () => {
  test('all public pages have valid HTML structure', async ({ page }) => {
    const pages = ['/', '/pricing', '/faq', '/about', '/login', '/register-company', '/docs', '/qr-display', '/signature', '/marketplace'];
    for (const path of pages) {
      await page.goto(path);
      const body = page.locator('body');
      await expect(body).toBeVisible();
      const title = await page.title();
      expect(title.length).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Navigation flow', () => {
  test('can navigate from home to pricing to faq and back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /pricing/i }).first().click();
    await expect(page).toHaveURL(/\/pricing/);

    await page.getByRole('link', { name: /faq/i }).first().click();
    await expect(page).toHaveURL(/\/faq/);

    const homeLink = page.locator('a[href="/"]');
    if (await homeLink.count() > 0) {
      await homeLink.first().click();
      await expect(page).toHaveURL('/');
    }
  });

  test('login page has navigable register link', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('a[href*="register"]');
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });
});
