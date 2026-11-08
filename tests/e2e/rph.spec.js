import { expect, test } from '@playwright/test';

const rows = (page) => page.locator('a.row');

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.errors = errors;
  await page.goto('./');
});

test.afterEach(async ({ page }) => {
  expect(page.errors, 'no console errors').toEqual([]);
});

test.describe('list', () => {
  test('shows the sample plans with derived status counts', async ({ page }) => {
    await expect(rows(page)).toHaveCount(4);
    await expect(page.locator('[data-tapis=lewat] .n')).toHaveText('1');
    await expect(page.getByRole('heading', { name: 'Rancangan pengajaran' })).toBeVisible();
  });

  test('"/" focuses search, which filters as you type without losing focus', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#cari')).toBeFocused();
    await page.keyboard.type('pecahan');
    await expect(rows(page)).toHaveCount(1);
    await expect(page.locator('#cari')).toBeFocused();
  });

  test('empty search shows a way back', async ({ page }) => {
    await page.locator('#cari').fill('zzz');
    await expect(page.getByText('Tiada padanan')).toBeVisible();
    await page.getByRole('button', { name: 'Papar semua' }).click();
    await expect(rows(page)).toHaveCount(4);
  });

  test('status filter', async ({ page }) => {
    await page.locator('[data-tapis=lewat]').click();
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toContainText('Litar elektrik bersiri');
  });
});

test.describe('editor', () => {
  test.beforeEach(async ({ page }) => {
    await rows(page).filter({ hasText: 'Membaca dan memahami' }).click();
    await expect(page).toHaveURL(/#lihat-/);
    await page.getByRole('link', { name: 'Sunting' }).click();
    await expect(page).toHaveURL(/#edit-/);
  });

  test('complete plan scores 10/10; a bad time drops it and shows an error', async ({ page }) => {
    await expect(page.locator('#ed-skor')).toContainText('10');
    await page.locator('#f-tamat').fill('07:30');
    await expect(page.locator('#e-tamat')).toBeVisible();
    await expect(page.locator('#f-tamat')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#ed-skor')).toContainText('9');
  });

  test('autosaves and persists across reload', async ({ page }) => {
    await page.locator('#f-tajuk').fill('Membaca petikan kantin');
    await expect(page.locator('#ed-saved')).toContainText(/Disimpan \d\d:\d\d/);
    await expect(page.locator('#ed-tajuk')).toHaveText('Membaca petikan kantin');
    await page.reload();
    await expect(page.locator('#f-tajuk')).toHaveValue('Membaca petikan kantin');
  });

  test('list editing: Enter adds below, reorder, delete', async ({ page }) => {
    await page.locator('#f-langkah-0').click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(page.locator('#f-langkah-1')).toBeFocused();
    await expect(page.locator('#f-langkah-1')).toHaveValue('');
    await page.keyboard.type('Langkah baru');
    await page.locator('[data-move=langkah][data-i="1"][data-d="-1"]').click();
    await expect(page.locator('#f-langkah-0')).toHaveValue('Langkah baru');
    await page.locator('[data-del=langkah][data-i="0"]').click();
    await expect(page.locator('#list-langkah .list-item')).toHaveCount(3);
  });

  test('chips toggle', async ({ page }) => {
    const chip = page.locator('[data-chip=emk][data-v="Patriotisme"]');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('reflection validates and marks the plan done', async ({ page }) => {
    await page.locator('#f-capai').fill('40');
    await page.locator('#f-jumlah').fill('30');
    await expect(page.locator('#e-capai')).toBeVisible();
    await page.locator('#f-capai').fill('28');
    await expect(page.locator('#e-capai')).toBeHidden();
    await expect(page.locator('#ed-badge')).toContainText('Selesai');
  });

  test('duplicate opens a copy with class and reflection cleared', async ({ page }) => {
    await page.getByRole('button', { name: 'Salin untuk kelas lain' }).click();
    await expect(page.locator('#f-kelas')).toHaveValue('');
    await expect(page.locator('#f-tajuk')).toHaveValue('Membaca dan memahami petikan');
  });

  test('delete returns to the list, and undo restores', async ({ page }) => {
    await page.getByRole('button', { name: 'Padam RPH' }).click();
    await expect(rows(page)).toHaveCount(3);
    await page.getByRole('button', { name: 'Buat asal' }).click();
    await expect(rows(page)).toHaveCount(4);
  });
});

test.describe('new plan', () => {
  test('focuses subject; is only saved after the first keystroke', async ({ page }) => {
    await page.locator('#btn-baru').click();
    await expect(page.locator('#f-subjek')).toBeFocused();
    await page.getByRole('link', { name: 'Semua RPH' }).click();
    await expect(rows(page)).toHaveCount(4);

    await page.locator('#btn-baru').click();
    await page.locator('#f-subjek').fill('Sejarah');
    await expect(page).toHaveURL(/#edit-[a-z0-9]+$/);
    await page.locator('[data-fokus=kelas]').click();
    await expect(page.locator('#f-kelas')).toBeFocused();
    await page.getByRole('link', { name: 'Semua RPH' }).click();
    await expect(rows(page)).toHaveCount(5);
  });
});

test.describe('preview and print', () => {
  test('print stylesheet hides the app chrome', async ({ page }) => {
    await rows(page).first().click();
    await expect(page.locator('.paper')).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.topbar')).toBeHidden();
    await expect(page.locator('.paper')).toBeVisible();
  });

  test('unknown plan shows a helpful message', async ({ page }) => {
    await page.goto('./#lihat-tiada');
    await expect(page.getByText('RPH ini tiada')).toBeVisible();
  });
});

test.describe('settings', () => {
  test('profile appears in the header', async ({ page }) => {
    await page.getByRole('button', { name: 'Tetapan' }).click();
    await page.locator('#p-nama').fill('Nur Aina Ahmad');
    await page.locator('#p-sekolah').fill('SK Taman Desa');
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(page.locator('#brand-sub')).toContainText('SK Taman Desa');
  });

  test('export downloads every plan; invalid import is rejected; Escape closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Tetapan' }).click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#p-eksport').click()]);
    const data = JSON.parse(await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
    expect(data.rancangan).toHaveLength(4);

    await page.locator('#p-import').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
    await expect(page.locator('#p-ralat')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.dialog')).toHaveCount(0);
  });

  test('theme toggle persists without a flash on reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Tukar ke tema putih' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cerah');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cerah');
  });
});
