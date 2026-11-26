import { expect, test } from '@playwright/test';
import { ilkGirisPencereleriniKapat } from './yardimci';

test('öğrenci giriş yapar, paneli görür ve asistana soru sorar', async ({ page }) => {
  await page.goto('/giris');
  await page.getByLabel('E-posta').fill('deniz.yilmaz@ogr.beykent.edu.tr');
  await page.getByLabel('Şifre', { exact: true }).fill('korteks123');
  await page.getByRole('button', { name: 'Giriş yap' }).click();

  // İlk girişte KVKK onayı
  await expect(page).toHaveURL(/\/onay$/);
  await page.getByRole('checkbox', { name: /Aydınlatma metnini okudum/ }).check();
  await page.getByRole('button', { name: 'Onayla ve devam et' }).click();

  // İlk girişte bildirim izni penceresi (ve varsa tanıtım turu)
  await ilkGirisPencereleriniKapat(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Deniz');
  await expect(page.getByRole('region', { name: 'Devam durumu' })).toBeVisible();

  await page.goto('/derslerim/MAT301');
  await expect(page.getByRole('region', { name: 'Finalden alman gereken' })).toContainText('68');

  await page.getByRole('button', { name: 'Bu dersi asistana sor' }).click();
  await page.getByRole('button', { name: /finalden kaç almam gerekiyor/ }).click();
  await expect(page.getByRole('log', { name: 'Sohbet' })).toContainText('finalden en az 68', { timeout: 10_000 });
});

test('yönetici belge listesini görür, öğrenci sayfalarına giremez', async ({ page }) => {
  await page.goto('/giris');
  await page.getByLabel('E-posta').fill('yonetici@beykent.edu.tr');
  await page.getByLabel('Şifre', { exact: true }).fill('yonetici123');
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(/\/yonetim$/);
  await page.goto('/notlar');
  await expect(page).toHaveURL(/\/yonetim$/);
});
