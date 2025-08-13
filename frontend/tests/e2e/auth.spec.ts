import { test, expect } from '@playwright/test';
//register olup giriş yapıp protected sayfasına girebilmeye çalışma
test('register → login → protected', async ({ page }) => {
  const email = `user${Date.now()}@test.com`;
  const password = 'Aa1!test';

  await page.goto('/register');
  await page.fill('input[type="email"]', email);
  const pwFields = page.locator('input[type="password"]');
  await pwFields.nth(0).fill(password);
  await pwFields.nth(1).fill(password);

  await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes('/api/auth/register') && res.status() === 200
    ),
    page.click('button:has-text("Sign up")'),
  ]);

  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes('/api/auth/login') && res.status() === 200
    ),
    page.click('button:has-text("Sign in")'),
  ]);

  await expect(page.locator('h1', { hasText: 'Protected Page' })).toBeVisible({ timeout: 15000 });
});
//giriş yapmadan protected sayfaya gitmeye çalışma 
test('token yokken /protected → /login yönlendirir', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/protected');
  await expect(page.locator('h1', { hasText: 'Welcome Back!' })).toBeVisible();
});
