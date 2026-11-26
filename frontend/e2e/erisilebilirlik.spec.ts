import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ilkGirisPencereleriniKapat } from './yardimci';

/**
 * WCAG 2.1 AA otomatik taraması (rapor Tablo 1, Sağlık/Toplumsal satırı). axe-core ciddi ve kritik
 * bulgu bulmamalıdır. Otomatik tarama sorunların bir kısmını yakalar; klavye ve ekran okuyucu
 * denetimleri İP-8 kullanıcı çalışmasında elle yapılır.
 */
async function ogrenciGirisi(page: Page) {
  await page.goto('/giris');
  await page.getByLabel('E-posta').fill('deniz.yilmaz@ogr.beykent.edu.tr');
  await page.getByLabel('Şifre', { exact: true }).fill('korteks123');
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await page.getByRole('checkbox', { name: /Aydınlatma metnini okudum/ }).check();
  await page.getByRole('button', { name: 'Onayla ve devam et' }).click();
  await ilkGirisPencereleriniKapat(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

async function tara(page: Page) {
  const sonuc = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const ciddi = sonuc.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(ciddi.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
}

test('giriş sayfası WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/giris');
  await tara(page);
});

const SAYFALAR = ['/', '/derslerim', '/derslerim/MAT301', '/takvim', '/notlar', '/asistan', '/duyurular', '/ayarlar', '/gizlilik'];

for (const yol of SAYFALAR) {
  test(`öğrenci ${yol} WCAG 2.1 AA`, async ({ page }) => {
    await ogrenciGirisi(page);
    await page.goto(yol);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await tara(page);
  });
}

test('koyu tema panel WCAG 2.1 AA', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await ogrenciGirisi(page);
  await page.waitForLoadState('networkidle');
  await tara(page);
});
