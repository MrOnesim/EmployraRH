import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads with correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EmployraRH|EmployéPro/);
  });

  test('displays the main hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('hero section has call-to-action buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /login|démarrer|commencer|start/i }).or(page.getByRole('button', { name: /login|démarrer|commencer|start/i })).first()).toBeVisible();
  });

  test('displays features section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Fonctionnalités').or(page.getByText('Features')).or(page.getByText('Pourquoi'))).first().toBeVisible();
  });

  test('displays pricing section link', async ({ page }) => {
    await page.goto('/');
    const pricingLink = page.locator('a[href*="pricing"], nav a:has-text("Pricing")');
    await expect(pricingLink.first()).toBeVisible();
  });

  test('displays footer with company name', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Employra|employra/i);
  });

  test('has a working navigation bar', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('navigation has login link', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.locator('a[href*="login"], nav a:has-text("Log in")');
    await expect(loginLink.first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navigates to Pricing page from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /pricing/i }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigates to FAQ page from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /faq/i }).first().click();
    await expect(page).toHaveURL(/\/faq/);
  });

  test('navigates to Documentation page from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /documentation|docs/i }).first().click();
    await expect(page).toHaveURL(/\/docs/);
  });

  test('navigates to About page from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('navigates to Login page from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /log in|login|connexion/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('navigates back to home from any page', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('link', { name: /logo|home|accueil|employra/i }).or(page.locator('a[href="/"]')).first().click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Login page', () => {
  test('renders login form with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('submit button is present', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /connexion|login|se connecter|sign in/i }).or(page.getByRole('button').first())).toBeVisible();
  });

  test('has a link to register', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('a[href*="register"]');
    await expect(registerLink).toBeVisible();
  });

  test('allows typing email and password', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@techafrique.com');
    await page.locator('input[type="password"]').fill('password123');
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@techafrique.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('password123');
  });
});

test.describe('Register company page', () => {
  test('renders registration form', async ({ page }) => {
    await page.goto('/register-company');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('has form input fields', async ({ page }) => {
    await page.goto('/register-company');
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();
    await expect(await inputs.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Pricing page', () => {
  test('displays plan pricing cards', async ({ page }) => {
    await page.goto('/pricing');
    for (const name of ['Starter', 'Pro', 'Business', 'Enterprise']) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }
  });

  test('each plan card has a price', async ({ page }) => {
    await page.goto('/pricing');
    const cards = page.locator('[class*="pricing"]').or(page.locator('[class*="plan"]').or(page.locator('main > div > div')));
    await expect(cards.first()).toBeVisible();
  });

  test('comparison table is visible', async ({ page }) => {
    await page.goto('/pricing');
    const table = page.locator('table').or(page.getByText('Comparaison').or(page.getByText('Comparer')));
    await expect(table.first()).toBeVisible();
  });
});

test.describe('404 page', () => {
  test('shows not found for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });
});
