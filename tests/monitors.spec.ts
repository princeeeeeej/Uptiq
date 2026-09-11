import { test, expect } from '@playwright/test';

test.describe('monitor management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/Hello/, { timeout: 15000 });
    await page.waitForTimeout(3000);
  });

  test('can open add monitor modal and see form fields', async ({ page }) => {
    const addFirstButton = page.getByRole('button', { name: /add your first monitor/i });
    const addNewButton = page.getByText('Add New Monitor');
    await expect(addFirstButton.or(addNewButton)).toBeVisible({ timeout: 10000 });

    if (await addFirstButton.isVisible()) {
      await addFirstButton.click();
    } else {
      await addNewButton.click();
    }
    await expect(page.locator('h2').filter({ hasText: 'Add Monitor' })).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Production API')).toBeVisible();
    await expect(page.getByPlaceholder('https://api.example.com')).toBeVisible();
    await expect(page.getByPlaceholder('prod-api')).toBeVisible();
    await expect(page.getByRole('button', { name: /add monitor/i })).toBeVisible();
  });

  test('create a new website monitor via modal', async ({ page }) => {
    const addFirstButton = page.getByRole('button', { name: /add your first monitor/i });
    const addNewButton = page.getByText('Add New Monitor');

    await expect(addFirstButton.or(addNewButton)).toBeVisible({ timeout: 10000 });

    if (await addFirstButton.isVisible()) {
      await addFirstButton.click();
    } else {
      await addNewButton.click();
    }

    await expect(page.locator('h2').filter({ hasText: 'Add Monitor' })).toBeVisible();
    const slug = `test-monitor-${Date.now()}`;
    await page.getByPlaceholder('e.g. Production API').fill('Example Monitor');
    await page.getByPlaceholder('https://api.example.com').fill('https://example.com');
    await page.getByPlaceholder('prod-api').fill(slug);
    await page.getByRole('button', { name: /add monitor/i }).click();
    await expect(page.getByText('Example Monitor').first()).toBeVisible({ timeout: 20000 });
  });

  test('clicking a monitor card navigates to detail page', async ({ page }) => {
    const monitorLink = page.locator('a[href*="/dashboard/monitor/"]').first();
    if (await monitorLink.isVisible().catch(() => false)) {
      await monitorLink.click();
      await expect(page).toHaveURL(/\/dashboard\/monitor\//);
    }
  });
});