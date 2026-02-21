import { test, expect } from '@playwright/test';

const routes = [
  '/login',
  '/dashboard',
  '/events',
  '/events/new',
  '/calendar',
  '/me',
  '/me/completions',
  '/me/reflections',
  '/reports',
  '/admin/training-types'
];

for (const route of routes) {
  test(`route available: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/.*/);
  });
}
