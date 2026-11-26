import { devamSeviyesi, useAyarlar, type DevamSeviye } from '@/app/ayarlar';

export const SEVIYE_ETIKETI: Record<DevamSeviye, string> = { yolunda: 'Yolunda', sinirda: 'Sınırda', doldu: 'Hak doldu' };
export const SEVIYE_RENGI: Record<DevamSeviye, string> = { yolunda: 'success.main', sinirda: 'warning.main', doldu: 'error.main' };

/** Kalan devam hakkının seviyesi; eşik Ayarlar'daki değerdir (varsayılan 2 hak). */
export function useDevamSeviyesi(kullanilan: number, sinir: number) {
  const esik = useAyarlar((s) => s.esikler.devamHak);
  const kalan = sinir - kullanilan;
  return { kalan, seviye: devamSeviyesi(kalan, esik) };
}
