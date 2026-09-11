import { test, expect } from '@playwright/test';

test.describe('dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/Hello/, { timeout: 15000 });
  });

  test('displays greeting and stats cards', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Hello/);
    await expect(page.getByText('Active Monitors')).toBeVisible();
    await expect(page.getByText('Global Regions')).toBeVisible();
    await expect(page.getByText('System Status')).toBeVisible();
    await expect(page.getByText('Operational').first()).toBeVisible();
  });

  test('shows either monitors or empty state after loading', async ({ page }) => {
    const emptyState = page.getByText('No monitors configured');
    const monitorCard = page.locator('a[href*="/dashboard/monitor/"]').first();
    const addFirstButton = page.getByRole('button', { name: /add your first monitor/i });
    await expect(emptyState.or(monitorCard).or(addFirstButton)).toBeVisible({ timeout: 20000 });

    if (await emptyState.isVisible()) {
      await expect(addFirstButton).toBeVisible();
    }
  });

  test('bell icon links to incidents page', async ({ page }) => {
    const bellLink = page.locator('main a[href="/dashboard/incidents"]');
    await expect(bellLink).toBeVisible({ timeout: 10000 });
    await bellLink.click();
    await expect(page).toHaveURL(/incidents/, { timeout: 15000 });
  });
});
