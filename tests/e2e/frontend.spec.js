import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function mockSetupStatus(page, complete) {
  await page.route('**/api/setup/status', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { isSetupComplete: complete } }),
  }));
}

test('1.1 first-run routes to the setup wizard', async ({ page }) => {
  await mockSetupStatus(page, false);
  await page.goto('/');
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByText('Organization First-Run Setup')).toBeVisible();
});

test('1.3 signed-in employee receives 403 for an admin URL without rendering admin data', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hcm_token', 'qa-employee-token'));
  await mockSetupStatus(page, true);
  await page.route('**/api/auth/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { user: { _id: 'qa-employee', name: 'QA Employee', email: 'employee@example.test', role: 'employee', mustChangePassword: false } } }),
  }));
  await page.goto('/company');
  await expect(page).toHaveURL(/\/unauthorized$/);
  await expect(page.getByText('403')).toBeVisible();
  await expect(page.getByText('Company Settings & Geofence')).toHaveCount(0);
});

test('7.4 saved theme is applied before paint and persists', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hcm_theme', 'dark'));
  await mockSetupStatus(page, false);
  await page.goto('/setup');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('hcm_theme'))).toBe('dark');
});

test('7.4 theme toggle changes the dashboard palette and persists the new choice', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hcm_theme', 'dark');
    localStorage.setItem('hcm_token', 'qa-admin-token');
  });
  await page.route('**/api/**', (route) => {
    const url = new URL(route.request().url());
    const data = url.pathname.endsWith('/setup/status')
      ? { isSetupComplete: true }
      : url.pathname.endsWith('/auth/me')
        ? { user: { _id: 'qa-admin', name: 'QA Admin', email: 'admin@example.test', role: 'admin', mustChangePassword: false } }
        : {};
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome back, QA Admin' })).toBeVisible();

  const layout = page.locator('#root .min-h-screen').first();
  const darkBackground = await layout.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: 'Toggle dark mode' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('hcm_theme'))).toBe('light');
  const lightBackground = await layout.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lightBackground).not.toBe(darkBackground);
});

test('7.5 setup page has no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockSetupStatus(page, false);
  await page.goto('/setup');
  await expect(page.getByText('Organization First-Run Setup')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('7.10 @a11y setup page has no critical or serious axe violations', async ({ page }) => {
  await mockSetupStatus(page, false);
  await page.goto('/setup');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
