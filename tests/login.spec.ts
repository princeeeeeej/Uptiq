import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
  });

  test('page renders sign-in form correctly', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Welcome back');
    await expect(page.getByLabel('Username').first()).toBeVisible();
    await expect(page.getByLabel('Password').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpassword123');
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/user/signin') && resp.status() === 200),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);

    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test('invalid password shows error', async ({ page }) => {
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/signin/);
  });

  test('non-existent user shows error', async ({ page }) => {
    await page.getByLabel('Username').fill('nonexistent_user_xyz');
    await page.getByLabel('Password').fill('somepassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 15000 });
  });

  test('sign up link navigates to signup page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/signup/);
  });

  test('unauthenticated user redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // should redirect to signin since there's no token in localStorage
    await expect(page).toHaveURL(/signin/);
  });
});