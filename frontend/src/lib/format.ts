import dayjs from './dayjs';
import type { KaynakSistem } from '@/api/types';

export const SISTEM_ETIKETI: Record<KaynakSistem, string> = {
  OBS: 'OBS',
  PUSULA: 'Pusula',
  PSG: 'PSG',
};

/** "14:05" */
export const saat = (iso: string) => dayjs(iso).format('HH:mm');

/** "11 Kasım 2026" */
export const uzunTarih = (iso: string) => dayjs(iso).format('D MMMM YYYY');

/** "11 Kasım 2026 Çarşamba" */
export const tamGun = (iso: string | Date = new Date()) => dayjs(iso).format('D MMMM YYYY dddd');

/** "09.00" – raporun saat yazımı (TDK: saat ile dakika arasında nokta). */
export const saatTr = (hhmm: string) => hhmm.replace(':', '.');

/** Türkçe ondalık: 3,12 */
export const sayi = (n: number, basamak = 2) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: basamak, maximumFractionDigits: basamak });

/** Bugüne göre kalan süre: "Bugün", "Yarın", "3 gün", "geçti" */
export function kalanGun(iso: string, simdi: dayjs.Dayjs = dayjs()): string {
  const fark = dayjs(iso).startOf('day').diff(simdi.startOf('day'), 'day');
  if (fark < 0) return 'Geçti';
  if (fark === 0) return 'Bugün';
  if (fark === 1) return 'Yarın';
  return `${fark} gün`;
}

/** Selamlama: sabah/öğleden sonra/akşam */
export function selam(simdi: dayjs.Dayjs = dayjs()): string {
  const h = simdi.hour();
  if (h < 5) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export const basHarfler = (adSoyad: string) =>
  adSoyad
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toLocaleUpperCase('tr-TR'))
    .slice(0, 2)
    .join('');

export const ilkAd = (adSoyad: string) => adSoyad.split(/\s+/)[0] ?? adSoyad;

/** Sayıya 3. tekil iyelik eki: 3 → "3'ü", 2 → "2'si" (yalnızca 0–10 için tam). */
export function iyelik(n: number): string {
  const ekler: Record<number, string> = { 0: 'ı', 1: 'i', 2: 'si', 3: 'ü', 4: 'ü', 5: 'i', 6: 'sı', 7: 'si', 8: 'i', 9: 'u', 10: 'u' };
  return `${n}'${ekler[n] ?? ekler[n % 10] ?? 'i'}`;
}
