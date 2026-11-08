import { expect, test } from '@playwright/test';

const tiadaSkrolSisi = async (page) => {
  const lebar = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(lebar[0]).toBeLessThanOrEqual(lebar[1]);
};

test('phone: list and editor fit the screen, with no sideways scroll', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('a.row')).toHaveCount(4);
  await tiadaSkrolSisi(page);

  await page.locator('a.row').first().click();
  await tiadaSkrolSisi(page);
  await page.getByRole('link', { name: 'Sunting' }).click();
  await expect(page.locator('#f-subjek')).toBeVisible();
  await tiadaSkrolSisi(page);
});

test('phone: the checklist shows only what is missing', async ({ page }) => {
  await page.goto('./#baru');
  await expect(page.locator('.checks li:visible')).toHaveCount(9);
  await page.locator('#f-subjek').fill('Sains');
  await expect(page.locator('.checks li:visible')).toHaveCount(8);
});
