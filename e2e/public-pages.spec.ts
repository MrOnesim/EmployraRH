import { test, expect } from '@playwright/test';

test.describe('FAQ page', () => {
  test('renders the FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('has search input on FAQ page', async ({ page }) => {
    await page.goto('/faq');
    const searchInput = page.locator('input[type="text"], input[type="search"], input');
    await expect(searchInput.first()).toBeVisible();
  });

  test('displays FAQ items', async ({ page }) => {
    await page.goto('/faq');
    const items = page.locator('details, summary, [class*="faq"], [class*="accordion"]');
    await expect(items.first().or(page.locator('h3, h4').first())).toBeVisible();
  });
});

test.describe('Documentation page', () => {
  test('renders the documentation page', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('has content sections', async ({ page }) => {
    await page.goto('/docs');
    const sections = page.locator('h2, h3, section');
    await expect(await sections.count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe('About page', () => {
  test('renders the about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('displays company information', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('Bénin').or(page.getByText('Cotonou')).or(page.getByText('Employra')).or(page.getByText('équipe')).first()).toBeVisible();
  });

  test('has contact information', async ({ page }) => {
    await page.goto('/about');
    const contact = page.getByText(/@|contact|email|téléphone|phone/i);
    await expect(contact).toBeVisible();
  });
});

test.describe('QR Display page', () => {
  test('renders the QR display page', async ({ page }) => {
    await page.goto('/qr-display');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Signature page', () => {
  test('renders the signature page', async ({ page }) => {
    await page.goto('/signature');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('has signature request content', async ({ page }) => {
    await page.goto('/signature');
    const content = page.locator('input, button, select');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Marketplace page', () => {
  test('renders the marketplace page', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('displays marketplace items', async ({ page }) => {
    await page.goto('/marketplace');
    const items = page.locator('[class*="card"], [class*="item"], [class*="product"]');
    await expect(items.first().or(page.locator('h3').first())).toBeVisible();
  });
});
