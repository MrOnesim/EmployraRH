import { test, expect } from '@playwright/test';

test.describe('Auth redirect - Admin routes', () => {
  const adminRoutes = [
    '/admin',
    '/admin/employees',
    '/admin/salary',
    '/admin/attendance',
    '/admin/leaves',
    '/admin/payslips',
    '/admin/performance',
    '/admin/documents',
    '/admin/calendar',
    '/admin/messages',
    '/admin/reports',
    '/admin/ai-assistant',
    '/admin/qr-settings',
    '/admin/banking',
    '/admin/training',
    '/admin/recruitment',
    '/admin/missions',
    '/admin/tax',
    '/admin/rewards',
    '/admin/fintech',
    '/admin/vault',
    '/admin/equipment',
    '/admin/wellness',
    '/admin/objectives',
    '/admin/org-chart',
    '/admin/teams',
    '/admin/meetings',
    '/admin/import',
    '/admin/roles',
    '/admin/onboarding',
    '/admin/leave-policy',
    '/admin/notifications',
    '/admin/settings',
    '/admin/security-guards',
  ];

  for (const route of adminRoutes) {
    test(`redirects ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe('Auth redirect - Employee routes', () => {
  const employeeRoutes = [
    '/employee-dashboard',
    '/employee-dashboard/attendance',
    '/employee-dashboard/leaves',
    '/employee-dashboard/payslips',
    '/employee-dashboard/messages',
    '/employee-dashboard/calendar',
    '/employee-dashboard/notifications',
    '/employee-dashboard/settings',
  ];

  for (const route of employeeRoutes) {
    test(`redirects ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe('Auth redirect - Other protected routes', () => {
  const protectedRoutes = [
    '/scan',
    '/feed',
    '/guard-scan',
  ];

  for (const route of protectedRoutes) {
    test(`redirects ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe('Public routes - NOT redirected', () => {
  const publicRoutes = [
    '/',
    '/pricing',
    '/faq',
    '/docs',
    '/about',
    '/login',
    '/register-company',
    '/qr-display',
    '/signature',
    '/marketplace',
  ];

  for (const route of publicRoutes) {
    test(`does NOT redirect ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});
