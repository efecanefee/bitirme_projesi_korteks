import type { Kullanici } from '@/api/types';
import { KVKK_SURUM } from './kvkkMetni';

/** Onay yalnızca öğrenciler için gereklidir; güncel metin sürümüne verilmiş olmalıdır. */
export const rizaGecerli = (k: Kullanici) =>
  k.rol !== 'ogrenci' || k.riza?.metin_surumu === KVKK_SURUM;
