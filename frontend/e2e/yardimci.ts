import type { Page } from '@playwright/test';

/** İlk girişte açılan pencereleri (bildirim izni, tanıtım turu) kapatır; yoksa sessizce geçer. */
export async function ilkGirisPencereleriniKapat(page: Page) {
  for (const ad of ['Şimdi değil', 'Turu atla']) {
    await page
      .getByRole('button', { name: ad })
      .click({ timeout: 3000 })
      .catch(() => undefined);
  }
}
