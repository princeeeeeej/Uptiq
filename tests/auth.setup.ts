import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Username').fill(process.env.TEST_USER_EMAIL || 'testuser');
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('h1')).toContainText(/Hello/);
  await page.context().storageState({ path: authFile });
});