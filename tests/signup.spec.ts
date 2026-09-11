import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('page renders sign-up form correctly', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Create an account');
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /start free trial/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('successful signup redirects to signin', async ({ page }) => {
    const uniqueUser = `testuser_${Date.now()}`;
    await page.getByLabel('Username').fill(uniqueUser);
    await page.getByLabel('Password').fill('securepassword123');
    await page.getByRole('button', { name: /start free trial/i }).click();
    await expect(page).toHaveURL(/signin/, { timeout: 15000 });
  });

  test('duplicate username shows error', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: /start free trial/i }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 15000 });
  });

  test('sign in link navigates to signin page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/signin/);
  });
});
