import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Ajusta esto dependiendo de cómo se llame el título de tu página en Layout.tsx
  await expect(page).toHaveTitle(/Data Generator|React/i);
});

test('check if main container loads', async ({ page }) => {
  await page.goto('/');
  // Verifica que exista algún elemento principal.
  const main = page.locator('main');
  await expect(main).toBeVisible();
});
